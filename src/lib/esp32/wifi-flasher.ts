/**
 * ============================================================================
 * VEGA ARIES v2 - ESP32-S3 Wi-Fi Firmware Flasher Client Utility (Phase 2A)
 * ============================================================================
 * 
 * Handles browser-to-ESP32-S3 Wi-Fi binary transmission:
 *  1. Base64 binary decoding to Blob / Uint8Array.
 *  2. Health & status check against GET http://<ESP32_IP>/status.
 *  3. Streaming HTTP POST upload to http://<ESP32_IP>/upload with progress tracking.
 *  4. End-to-end verification of received byte size and SHA-256 checksum.
 * ============================================================================
 */

export interface Esp32FirmwareInfo {
  exists: boolean;
  filename: string;
  size: number;
  checksum: string;
}

export interface Esp32StatusResponse {
  status: 'ready' | 'busy' | 'error';
  chip?: string;
  sdk_version?: string;
  ip?: string;
  mode?: string;
  rssi?: number;
  littlefs_total?: number;
  littlefs_used?: number;
  littlefs_free?: number;
  firmware?: Esp32FirmwareInfo;
}

export interface UploadFirmwareOptions {
  esp32Address: string; // e.g. "192.168.1.42" or "http://192.168.1.42"
  binaryBase64: string;
  filename?: string;
  expectedSize?: number;
  expectedChecksum?: string;
  timeoutMs?: number;
  onProgress?: (percent: number, bytesLoaded: number, totalBytes: number) => void;
  onLog?: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export interface UploadFirmwareResult {
  success: boolean;
  message: string;
  size: number;
  checksum: string;
  expectedSize?: number;
  expectedChecksum?: string;
  sizeVerified: boolean;
  checksumVerified: boolean;
  timeTakenMs?: number;
  error?: string;
  details?: Record<string, unknown>;
}

/**
 * Format IP address or hostname to a valid HTTP base URL
 */
export function formatEsp32Url(input: string): string {
  let clean = input.trim();
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = `http://${clean}`;
  }
  // Strip trailing slashes
  return clean.replace(/\/+$/, '');
}

/**
 * Convert Base64 string to a Uint8Array buffer
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Query the ESP32-S3 gateway health and status
 */
export async function checkEsp32Status(
  esp32Address: string,
  timeoutMs = 4000
): Promise<{ success: boolean; data?: Esp32StatusResponse; error?: string }> {
  const baseUrl = formatEsp32Url(esp32Address);
  const statusUrl = `${baseUrl}/status`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(statusUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return {
        success: false,
        error: `ESP32 returned HTTP error ${res.status} (${res.statusText})`,
      };
    }

    const data: Esp32StatusResponse = await res.json();
    return { success: true, data };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const error = err as Error;
    if (error.name === 'AbortError') {
      return {
        success: false,
        error: `Connection timed out after ${timeoutMs}ms reaching ${statusUrl}. Ensure your laptop and ESP32-S3 are on the same Wi-Fi network.`,
      };
    }
    return {
      success: false,
      error: `Failed to connect to ESP32 at ${baseUrl}: ${error.message || 'Network error'}`,
    };
  }
}

/**
 * Upload compiled firmware binary to the ESP32-S3 over Wi-Fi
 */
export async function uploadFirmwareToEsp32(
  options: UploadFirmwareOptions
): Promise<UploadFirmwareResult> {
  const {
    esp32Address,
    binaryBase64,
    filename = 'VEGA_ARIES_v2_TEST.bin',
    expectedSize,
    expectedChecksum,
    timeoutMs = 30000,
    onProgress,
    onLog,
  } = options;

  const log = (msg: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    if (onLog) onLog(msg, type);
  };

  const baseUrl = formatEsp32Url(esp32Address);
  const uploadUrl = `${baseUrl}/upload`;

  if (!binaryBase64 || binaryBase64.trim() === '') {
    return {
      success: false,
      message: 'No binary firmware data provided.',
      size: 0,
      checksum: '',
      sizeVerified: false,
      checksumVerified: false,
      error: 'Empty binary payload',
    };
  }

  // Step 1: Decode Base64 to Uint8Array and Blob
  log('▶ Decoding compiled binary firmware payload...');
  let binaryBytes: Uint8Array;
  try {
    binaryBytes = base64ToUint8Array(binaryBase64);
  } catch (err: unknown) {
    const error = err as Error;
    log(`❌ Failed to decode Base64 binary: ${error.message}`, 'error');
    return {
      success: false,
      message: 'Base64 decoding failed',
      size: 0,
      checksum: '',
      sizeVerified: false,
      checksumVerified: false,
      error: error.message,
    };
  }

  const binaryBlob = new Blob([binaryBytes.buffer as ArrayBuffer], { type: 'application/octet-stream' });
  const actualSizeBytes = binaryBytes.length;
  log(`✓ Binary ready: ${actualSizeBytes} bytes (${(actualSizeBytes / 1024).toFixed(2)} KB)`);

  // Step 2: Probe ESP32 Reachability
  log(`▶ Checking ESP32 Gateway status at ${baseUrl}...`);
  const statusCheck = await checkEsp32Status(baseUrl, 4000);
  if (!statusCheck.success) {
    log(`❌ ESP32 unreachable: ${statusCheck.error}`, 'error');
    return {
      success: false,
      message: statusCheck.error || 'ESP32 Gateway unreachable',
      size: actualSizeBytes,
      checksum: expectedChecksum || '',
      sizeVerified: false,
      checksumVerified: false,
      error: statusCheck.error,
    };
  }

  log(`✓ ESP32 Gateway online (${statusCheck.data?.chip || 'ESP32-S3'}, IP: ${statusCheck.data?.ip || baseUrl})`, 'success');
  if (statusCheck.data?.littlefs_free !== undefined) {
    const freeKb = Math.round(statusCheck.data.littlefs_free / 1024);
    log(`  LittleFS Storage: ${freeKb} KB free`);
  }

  // Step 3: Stream Firmware Binary via multipart/form-data
  log(`▶ Uploading ${filename} to ESP32 LittleFS via Wi-Fi...`);

  const formData = new FormData();
  formData.append('file', binaryBlob, filename);

  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    const startTime = Date.now();

    xhr.open('POST', uploadUrl, true);
    xhr.timeout = timeoutMs;

    // Optional expectation headers
    if (expectedSize !== undefined && expectedSize > 0) {
      xhr.setRequestHeader('X-Expected-Size', expectedSize.toString());
    }
    if (expectedChecksum && expectedChecksum.trim() !== '') {
      xhr.setRequestHeader('X-Expected-Checksum', expectedChecksum.trim().toUpperCase());
    }

    // Upload progress handler
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        if (onProgress) {
          onProgress(percent, event.loaded, event.total);
        }
        if (percent % 25 === 0) {
          log(`  [${percent}%] Sent ${event.loaded} / ${event.total} bytes`);
        }
      }
    };

    xhr.onload = () => {
      const timeTakenMs = Date.now() - startTime;

      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          const returnedSize = response.size || actualSizeBytes;
          const returnedChecksum = (response.checksum || '').toUpperCase();
          const cleanExpectedChecksum = (expectedChecksum || '').toUpperCase();

          const sizeVerified = expectedSize ? returnedSize === expectedSize : returnedSize === actualSizeBytes;
          const checksumVerified = cleanExpectedChecksum ? returnedChecksum === cleanExpectedChecksum : true;

          if (!sizeVerified) {
            log(`❌ Size mismatch: sent ${actualSizeBytes}B, ESP32 saved ${returnedSize}B`, 'error');
          }
          if (!checksumVerified) {
            log(`❌ Checksum mismatch: expected ${cleanExpectedChecksum}, ESP32 computed ${returnedChecksum}`, 'error');
          }

          if (sizeVerified && checksumVerified) {
            log(`✅ Upload & Verification Complete! (${timeTakenMs}ms)`, 'success');
            log(`  Saved to:   /${filename}`);
            log(`  Size:       ${returnedSize} bytes`);
            log(`  SHA-256:    ${returnedChecksum}`);

            resolve({
              success: true,
              message: 'Firmware successfully uploaded and verified on ESP32-S3 LittleFS',
              size: returnedSize,
              checksum: returnedChecksum,
              expectedSize,
              expectedChecksum: cleanExpectedChecksum,
              sizeVerified,
              checksumVerified,
              timeTakenMs,
              details: response,
            });
          } else {
            resolve({
              success: false,
              message: 'Firmware integrity check failed after upload',
              size: returnedSize,
              checksum: returnedChecksum,
              expectedSize,
              expectedChecksum: cleanExpectedChecksum,
              sizeVerified,
              checksumVerified,
              timeTakenMs,
              error: 'Integrity verification mismatch',
              details: response,
            });
          }
        } catch (e: unknown) {
          const parseErr = e as Error;
          log(`❌ Failed to parse ESP32 response: ${xhr.responseText}`, 'error');
          resolve({
            success: false,
            message: 'Invalid JSON response from ESP32',
            size: actualSizeBytes,
            checksum: '',
            sizeVerified: false,
            checksumVerified: false,
            error: parseErr.message,
          });
        }
      } else {
        log(`❌ Upload failed with HTTP status ${xhr.status}: ${xhr.responseText}`, 'error');
        resolve({
          success: false,
          message: `ESP32 upload rejected (HTTP ${xhr.status})`,
          size: actualSizeBytes,
          checksum: '',
          sizeVerified: false,
          checksumVerified: false,
          error: xhr.responseText || `HTTP ${xhr.status}`,
        });
      }
    };

    xhr.onerror = () => {
      log('❌ Network error during firmware upload to ESP32.', 'error');
      resolve({
        success: false,
        message: 'Network connection lost during upload',
        size: actualSizeBytes,
        checksum: '',
        sizeVerified: false,
        checksumVerified: false,
        error: 'XHR Network Error',
      });
    };

    xhr.ontimeout = () => {
      log(`❌ Upload timed out after ${timeoutMs / 1000} seconds.`, 'error');
      resolve({
        success: false,
        message: 'Upload request timed out',
        size: actualSizeBytes,
        checksum: '',
        sizeVerified: false,
        checksumVerified: false,
        error: 'Request Timeout',
      });
    };

    xhr.send(formData);
  });
}

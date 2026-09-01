/**
 * ============================================================================
 * VEGA ARIES v2 - ESP32-S3 Wi-Fi Firmware Receiver (Phase 2A)
 * ============================================================================
 * 
 * Target Board: ESP32-S3 DevKit (or standard ESP32 / ESP32-S2 / ESP32-C3)
 * Framework: Arduino ESP32 (v2.0.x / v3.x.x)
 * 
 * Features:
 *  1. Connects to local Wi-Fi (or starts Fallback AP if connection fails).
 *  2. Mounts LittleFS filesystem.
 *  3. Starts HTTP Server with full CORS support for browser requests.
 *  4. Exposes GET /status - Returns board info, RSSI, LittleFS free space, and stored firmware info.
 *  5. Exposes POST /upload - Streams incoming application/octet-stream into /firmware.bin.
 *  6. Computes 8-character uppercase SHA-256 hash on-the-fly (matching Next.js /api/compile).
 *  7. Validates against X-Expected-Size and X-Expected-Checksum headers if provided.
 * ============================================================================
 */

#include <WiFi.h>
#include <WebServer.h>
#include <LittleFS.h>
#include <mbedtls/sha256.h>

// ============================================================================
// CONFIGURATION: Set your Wi-Fi credentials here
// ============================================================================
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Fallback SoftAP settings (active if Wi-Fi connection fails or not configured)
const char* AP_SSID       = "VEGA-ESP32-GATEWAY";
const char* AP_PASSWORD   = "vega123456";

// HTTP Server on Port 80
WebServer server(80);

// File Path in LittleFS
const char* FIRMWARE_FILE_PATH = "/VEGA_ARIES_v2_TEST.bin";

// State variables for stream upload
File uploadFile;
mbedtls_sha256_context shaCtx;
size_t uploadBytesReceived = 0;
uint32_t uploadStartTime = 0;
String computedShaHex = "";
bool uploadHasError = false;
String uploadErrorMessage = "";

// ============================================================================
// CORS & HTTP HELPER FUNCTIONS
// ============================================================================
void setCorsHeaders() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type, X-Expected-Size, X-Expected-Checksum");
}

void handleOptions() {
  setCorsHeaders();
  server.send(204);
}

// Convert binary SHA-256 output (32 bytes) to 8-character uppercase hex string
String get8CharChecksum(unsigned char* output) {
  char buf[9];
  snprintf(buf, sizeof(buf), "%02X%02X%02X%02X", output[0], output[1], output[2], output[3]);
  return String(buf);
}

// Calculate SHA-256 of an existing file on LittleFS
bool getExistingFileChecksum(const char* path, String &checksumOut, size_t &sizeOut) {
  if (!LittleFS.exists(path)) return false;
  File f = LittleFS.open(path, "r");
  if (!f) return false;

  sizeOut = f.size();
  mbedtls_sha256_context ctx;
  mbedtls_sha256_init(&ctx);
  mbedtls_sha256_starts(&ctx, 0); // 0 for SHA-256

  uint8_t buffer[512];
  while (f.available()) {
    size_t len = f.read(buffer, sizeof(buffer));
    mbedtls_sha256_update(&ctx, buffer, len);
  }
  f.close();

  unsigned char output[32];
  mbedtls_sha256_finish(&ctx, output);
  mbedtls_sha256_free(&ctx);

  checksumOut = get8CharChecksum(output);
  return true;
}

// ============================================================================
// ROUTE: GET /status
// ============================================================================
void handleStatus() {
  setCorsHeaders();

  String currentFwChecksum = "NONE";
  size_t currentFwSize = 0;
  bool fwExists = getExistingFileChecksum(FIRMWARE_FILE_PATH, currentFwChecksum, currentFwSize);

  size_t totalBytes = LittleFS.totalBytes();
  size_t usedBytes  = LittleFS.usedBytes();
  size_t freeBytes  = (totalBytes > usedBytes) ? (totalBytes - usedBytes) : 0;

  String json = "{";
  json += "\"status\":\"ready\",";
  json += "\"chip\":\"" + String(ESP.getChipModel()) + "\",";
  json += "\"sdk_version\":\"" + String(ESP.getSdkVersion()) + "\",";
  json += "\"ip\":\"" + WiFi.localIP().toString() + "\",";
  json += "\"mode\":\"" + String(WiFi.getMode() == WIFI_STA ? "STA" : "AP") + "\",";
  json += "\"rssi\":" + String(WiFi.RSSI()) + ",";
  json += "\"littlefs_total\":" + String(totalBytes) + ",";
  json += "\"littlefs_used\":" + String(usedBytes) + ",";
  json += "\"littlefs_free\":" + String(freeBytes) + ",";
  json += "\"firmware\":{";
  json += "\"exists\":" + String(fwExists ? "true" : "false") + ",";
  json += "\"filename\":\"" + String(FIRMWARE_FILE_PATH) + "\",";
  json += "\"size\":" + String(currentFwSize) + ",";
  json += "\"checksum\":\"" + currentFwChecksum + "\"";
  json += "}}";

  server.send(200, "application/json", json);
}

// ============================================================================
// ROUTE: POST /upload (Upload Completion & Response)
// ============================================================================
void handleUploadResponse() {
  setCorsHeaders();

  if (uploadHasError) {
    String json = "{";
    json += "\"success\":false,";
    json += "\"error\":\"" + uploadErrorMessage + "\",";
    json += "\"received_size\":" + String(uploadBytesReceived);
    json += "}";
    server.send(400, "application/json", json);
    return;
  }

  // Validate expected headers if sent by client
  if (server.hasHeader("X-Expected-Size")) {
    size_t expectedSize = server.header("X-Expected-Size").toInt();
    if (expectedSize > 0 && expectedSize != uploadBytesReceived) {
      String json = "{";
      json += "\"success\":false,";
      json += "\"error\":\"Size mismatch: expected " + String(expectedSize) + " bytes, received " + String(uploadBytesReceived) + " bytes\",";
      json += "\"size\":" + String(uploadBytesReceived);
      json += "}";
      server.send(422, "application/json", json);
      return;
    }
  }

  if (server.hasHeader("X-Expected-Checksum")) {
    String expectedChecksum = server.header("X-Expected-Checksum");
    expectedChecksum.toUpperCase();
    expectedChecksum.trim();
    if (expectedChecksum.length() > 0 && !computedShaHex.equalsIgnoreCase(expectedChecksum)) {
      String json = "{";
      json += "\"success\":false,";
      json += "\"error\":\"Checksum mismatch: expected " + expectedChecksum + " but calculated " + computedShaHex + "\",";
      json += "\"size\":" + String(uploadBytesReceived) + ",";
      json += "\"checksum\":\"" + computedShaHex + "\"";
      json += "}";
      server.send(422, "application/json", json);
      return;
    }
  }

  uint32_t timeTakenMs = millis() - uploadStartTime;

  String json = "{";
  json += "\"success\":true,";
  json += "\"filename\":\"" + String(FIRMWARE_FILE_PATH) + "\",";
  json += "\"size\":" + String(uploadBytesReceived) + ",";
  json += "\"checksum\":\"" + computedShaHex + "\",";
  json += "\"time_taken_ms\":" + String(timeTakenMs) + ",";
  json += "\"message\":\"Firmware successfully written to LittleFS and verified\"";
  json += "}";

  server.send(200, "application/json", json);
}

// ============================================================================
// STREAM HANDLER: Raw binary / multipart chunk receiver
// ============================================================================
void handleUploadStream() {
  HTTPUpload& upload = server.upload();

  if (upload.status == UPLOAD_FILE_START) {
    uploadStartTime = millis();
    uploadBytesReceived = 0;
    uploadHasError = false;
    uploadErrorMessage = "";
    computedShaHex = "";

    Serial.printf("\n[HTTP] Starting firmware upload to %s...\n", FIRMWARE_FILE_PATH);

    // Remove old firmware file if present
    if (LittleFS.exists(FIRMWARE_FILE_PATH)) {
      LittleFS.remove(FIRMWARE_FILE_PATH);
    }

    // Open file for writing
    uploadFile = LittleFS.open(FIRMWARE_FILE_PATH, "w");
    if (!uploadFile) {
      uploadHasError = true;
      uploadErrorMessage = "Failed to open LittleFS file for writing";
      Serial.println("[ERROR] " + uploadErrorMessage);
      return;
    }

    // Initialize SHA-256 computation
    mbedtls_sha256_init(&shaCtx);
    mbedtls_sha256_starts(&shaCtx, 0); // 0 = SHA-256

  } else if (upload.status == UPLOAD_FILE_WRITE) {
    if (!uploadHasError && uploadFile) {
      size_t written = uploadFile.write(upload.buf, upload.currentSize);
      if (written != upload.currentSize) {
        uploadHasError = true;
        uploadErrorMessage = "LittleFS write error (disk full?)";
        Serial.println("[ERROR] " + uploadErrorMessage);
      } else {
        mbedtls_sha256_update(&shaCtx, upload.buf, upload.currentSize);
        uploadBytesReceived += upload.currentSize;
      }
    }

  } else if (upload.status == UPLOAD_FILE_END) {
    if (uploadFile) {
      uploadFile.close();
    }

    if (!uploadHasError) {
      unsigned char shaOutput[32];
      mbedtls_sha256_finish(&shaCtx, shaOutput);
      computedShaHex = get8CharChecksum(shaOutput);

      Serial.printf("[HTTP] Upload Complete! Size: %u bytes, Checksum: %s\n",
                    (unsigned int)uploadBytesReceived, computedShaHex.c_str());
    }
    mbedtls_sha256_free(&shaCtx);

  } else if (upload.status == UPLOAD_FILE_ABORTED) {
    if (uploadFile) {
      uploadFile.close();
    }
    mbedtls_sha256_free(&shaCtx);
    uploadHasError = true;
    uploadErrorMessage = "Upload aborted by client";
    Serial.println("[ERROR] Upload aborted");
  }
}

// ============================================================================
// SETUP & INITIALIZATION
// ============================================================================
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n==================================================");
  Serial.println("  VEGA ARIES v2 - ESP32-S3 Wi-Fi Receiver (Phase 2A)");
  Serial.println("==================================================");

  // Initialize LittleFS
  if (!LittleFS.begin(true)) { // true = format if corrupted
    Serial.println("[FATAL] LittleFS initialization failed!");
  } else {
    Serial.printf("[FS] LittleFS Mounted. Total: %u KB, Used: %u KB\n",
                  (unsigned int)(LittleFS.totalBytes() / 1024),
                  (unsigned int)(LittleFS.usedBytes() / 1024));
  }

  // Connect to Wi-Fi
  Serial.printf("[Wi-Fi] Connecting to '%s'...\n", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  unsigned long startAttemptTime = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startAttemptTime < 10000) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("[Wi-Fi] Connected successfully!");
    Serial.print("[Wi-Fi] IP Address: http://");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("[Wi-Fi] Station connection timed out. Starting Fallback Access Point...");
    WiFi.mode(WIFI_AP);
    WiFi.softAP(AP_SSID, AP_PASSWORD);
    Serial.printf("[Wi-Fi AP] SSID: %s | Pass: %s\n", AP_SSID, AP_PASSWORD);
    Serial.print("[Wi-Fi AP] IP Address: http://");
    Serial.println(WiFi.softAPIP());
  }

  // Collect custom request headers
  const char* headerKeys[] = {"X-Expected-Size", "X-Expected-Checksum"};
  size_t headerKeysCount = sizeof(headerKeys) / sizeof(char*);
  server.collectHeaders(headerKeys, headerKeysCount);

  // Register Web Routes
  server.on("/status", HTTP_GET, handleStatus);
  server.on("/status", HTTP_OPTIONS, handleOptions);
  server.on("/upload", HTTP_OPTIONS, handleOptions);
  server.on("/upload", HTTP_POST, handleUploadResponse, handleUploadStream);

  server.onNotFound([]() {
    setCorsHeaders();
    if (server.method() == HTTP_OPTIONS) {
      server.send(204);
    } else {
      server.send(404, "application/json", "{\"error\":\"Route not found\"}");
    }
  });

  // Start HTTP server
  server.begin();
  Serial.println("[HTTP] Server listening on port 80 ready for uploads.");
}

// ============================================================================
// MAIN LOOP
// ============================================================================
void loop() {
  server.handleClient();
}

/**
 * ============================================================================
 * VEGA ARIES v2 - Automatic ESP32-S3 Gateway Discovery Engine
 * ============================================================================
 * 
 * Automatically detects the ESP32-S3 gateway on the local Wi-Fi / LAN without
 * requiring the user to type or hardcode dynamic DHCP IP addresses.
 * 
 * Strategy:
 *  1. Direct Browser mDNS Probe (http://vega-esp32.local/status)
 *  2. Direct Browser SoftAP Fallback (http://192.168.4.1/status)
 *  3. Server-side Discovery Bridge (/api/esp32/discover)
 *  4. Response Signature Verification (verifies chip, status, and dynamic IP)
 * ============================================================================
 */

import { Esp32StatusResponse, formatEsp32Url } from './wifi-flasher';

export interface DiscoveredEsp32 {
  discovered: boolean;
  ip: string;
  address: string;
  chip?: string;
  mode?: string;
  rssi?: number;
  status?: string;
  littlefs_free?: number;
  littlefs_total?: number;
  source?: 'mdns' | 'api' | 'ap' | 'direct';
}

const MDNS_CANDIDATES = [
  'http://vega-esp32.local',
  'http://vega-gateway.local',
  'http://esp32.local',
  'http://192.168.4.1',
];

/**
 * Validates whether a response comes from an authentic VEGA ESP32 gateway
 */
export function isValidVegaEsp32Response(data: unknown): data is Esp32StatusResponse {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  return (
    obj.status === 'ready' ||
    obj.status === 'busy' ||
    typeof obj.chip === 'string' ||
    typeof obj.littlefs_total === 'number' ||
    typeof obj.firmware === 'object'
  );
}

/**
 * Probe a single endpoint via HTTP GET /status
 */
async function probeEndpoint(baseUrl: string, timeoutMs = 2500): Promise<DiscoveredEsp32 | null> {
  const url = `${formatEsp32Url(baseUrl)}/status`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data: Esp32StatusResponse = await res.json();
      if (isValidVegaEsp32Response(data)) {
        const detectedIp = data.ip || baseUrl.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
        return {
          discovered: true,
          ip: detectedIp,
          address: detectedIp.includes('.') && !detectedIp.endsWith('.local') ? `http://${detectedIp}` : baseUrl,
          chip: data.chip,
          mode: data.mode,
          rssi: data.rssi,
          status: data.status,
          littlefs_free: data.littlefs_free,
          littlefs_total: data.littlefs_total,
          source: baseUrl.includes('.local') ? 'mdns' : baseUrl.includes('192.168.4.1') ? 'ap' : 'direct',
        };
      }
    }
  } catch {
    clearTimeout(timeoutId);
  }
  return null;
}

/**
 * Query the Next.js server-side discovery helper
 */
async function probeServerDiscovery(timeoutMs = 3000): Promise<DiscoveredEsp32 | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch('/api/esp32/discover', {
      method: 'GET',
      signal: controller.signal,
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const result = await res.json();
      if (result.found && result.ip) {
        const data = result.data || {};
        return {
          discovered: true,
          ip: result.ip,
          address: result.address || `http://${result.ip}`,
          chip: data.chip,
          mode: data.mode,
          rssi: data.rssi,
          status: data.status,
          littlefs_free: data.littlefs_free,
          littlefs_total: data.littlefs_total,
          source: 'api',
        };
      }
    }
  } catch {
    clearTimeout(timeoutId);
  }
  return null;
}

/**
 * Main Automatic Discovery Function
 * Scans local mDNS, SoftAP, and Server helper concurrently to discover ESP32-S3
 */
export async function discoverEsp32(): Promise<DiscoveredEsp32> {
  // 1. Launch browser direct mDNS & AP probes in parallel with server-side discovery
  const probePromises: Promise<DiscoveredEsp32 | null>[] = [
    probeServerDiscovery(3000),
    ...MDNS_CANDIDATES.map((candidate) => probeEndpoint(candidate, 2500)),
  ];

  try {
    const results = await Promise.all(probePromises);
    const valid = results.find((r): r is DiscoveredEsp32 => r !== null && r.discovered);
    if (valid) {
      return valid;
    }
  } catch {
    // Ignore aggregated probe errors
  }

  return {
    discovered: false,
    ip: '',
    address: '',
  };
}

/**
 * Fast Health-Check / Ping of an existing discovered address
 */
export async function checkEsp32Health(address: string, timeoutMs = 2500): Promise<boolean> {
  if (!address) return false;
  const res = await probeEndpoint(address, timeoutMs);
  return res !== null && res.discovered;
}

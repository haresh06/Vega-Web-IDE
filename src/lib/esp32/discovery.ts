/**
 * ============================================================================
 * VEGA ARIES v2 - Automatic ESP32-S3 Gateway Discovery Engine
 * ============================================================================
 * 
 * Automatically detects the ESP32-S3 gateway on the local Wi-Fi / LAN without
 * requiring the user to type or hardcode dynamic DHCP IP addresses.
 * 
 * Multi-Stage Discovery Pipeline:
 *  Stage A: Preferred / LocalStorage Cached IP Probe
 *  Stage B: Standard mDNS & Fallback Hostnames Probe (http://vega-esp32.local/status)
 *  Stage C: Next.js Server-side / Local Helper API Bridge (/api/esp32/discover)
 *  Stage D: Direct Browser Subnet Fast Sweep (Essential for Vercel Web IDE)
 *  Stage E: Manual IP Fallback (Settings Gear in UI)
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
  source?: 'cached' | 'mdns' | 'api' | 'ap' | 'subnet-scan' | 'direct';
}

const MDNS_CANDIDATES = [
  'http://vega-esp32.local',
  'http://vega-esp32',
  'http://vega-gateway.local',
  'http://esp32.local',
  'http://192.168.4.1', // SoftAP default gateway
];

// Common 2.4 GHz Wi-Fi Router & Mobile Hotspot Subnets
const COMMON_SUBNET_PREFIXES = [
  '192.168.1',   // Standard Home & Office Routers
  '192.168.0',   // TP-Link, D-Link, Netgear Routers
  '192.168.43',  // Android Mobile Hotspots (Moto Edge, Vivo, Samsung, Xiaomi)
  '172.20.10',   // iOS / iPhone Personal Hotspots
  '192.168.137', // Windows PC Mobile Hotspots
  '10.0.0',      // Xfinity / Mesh / Enterprise Routers
  '192.168.2',   // Belkin / Edimax Routers
  '192.168.31',  // Mi Routers
  '192.168.8',   // Huawei 4G/5G Dongles & Gateways
];

/**
 * Validates whether a response comes from an authentic VEGA ESP32 Programmer
 */
export function isValidVegaEsp32Response(data: unknown): data is Esp32StatusResponse {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  return (
    obj.status === 'ready' ||
    obj.status === 'busy' ||
    obj.status === 'ok' ||
    typeof obj.chip === 'string' ||
    typeof obj.littlefs_total === 'number' ||
    obj.firmware !== undefined ||
    obj.vega_connected !== undefined ||
    obj.mode !== undefined
  );
}

/**
 * Probe a single endpoint via HTTP GET /status
 */
async function probeEndpoint(
  baseUrl: string,
  timeoutMs = 2500,
  sourceOverride?: DiscoveredEsp32['source']
): Promise<DiscoveredEsp32 | null> {
  const formattedUrl = formatEsp32Url(baseUrl);
  const statusUrl = `${formattedUrl}/status`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(statusUrl, {
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
        const source = sourceOverride || (
          baseUrl.includes('.local') ? 'mdns' :
          baseUrl.includes('192.168.4.1') ? 'ap' :
          'direct'
        );

        return {
          discovered: true,
          ip: detectedIp,
          address: detectedIp.includes('.') && !detectedIp.endsWith('.local') ? `http://${detectedIp}` : formattedUrl,
          chip: data.chip,
          mode: data.mode,
          rssi: data.rssi,
          status: data.status,
          littlefs_free: data.littlefs_free,
          littlefs_total: data.littlefs_total,
          source,
        };
      }
    }
  } catch {
    clearTimeout(timeoutId);
  }
  return null;
}

/**
 * Query the Next.js server-side / local helper discovery bridge
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
          chip: data.chip || result.chip,
          mode: data.mode || result.mode,
          rssi: data.rssi || result.rssi,
          status: data.status || result.status,
          littlefs_free: data.littlefs_free || result.littlefs_free,
          littlefs_total: data.littlefs_total || result.littlefs_total,
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
 * Detect client local IPv4 address via WebRTC ICE candidate
 */
async function detectBrowserLocalIp(): Promise<string | null> {
  if (typeof window === 'undefined' || typeof RTCPeerConnection === 'undefined') return null;
  return new Promise((resolve) => {
    try {
      const pc = new RTCPeerConnection({ iceServers: [] });
      pc.createDataChannel('');
      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .catch(() => resolve(null));

      const timer = setTimeout(() => {
        try { pc.close(); } catch {}
        resolve(null);
      }, 700);

      pc.onicecandidate = (event) => {
        if (!event || !event.candidate) return;
        const candidate = event.candidate.candidate;
        const match = candidate.match(/([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/);
        if (match && match[1] && !match[1].startsWith('127.') && !match[1].startsWith('0.')) {
          clearTimeout(timer);
          try { pc.close(); } catch {}
          resolve(match[1]);
        }
      };
    } catch {
      resolve(null);
    }
  });
}

/**
 * Direct Browser Subnet Fast Sweep
 * Concurrently scans active Wi-Fi subnets for /status in batches
 */
async function scanSubnetFromBrowser(onLog?: (msg: string) => void): Promise<DiscoveredEsp32 | null> {
  const localIp = await detectBrowserLocalIp();
  const prefixes = [...COMMON_SUBNET_PREFIXES];

  if (localIp) {
    const parts = localIp.split('.');
    if (parts.length === 4) {
      const dynamicPrefix = `${parts[0]}.${parts[1]}.${parts[2]}`;
      if (!prefixes.includes(dynamicPrefix)) {
        prefixes.unshift(dynamicPrefix); // Prioritize detected laptop subnet!
      }
    }
  }

  onLog?.(`[ESP32 Discovery] Sweeping local Wi-Fi subnets (${prefixes.slice(0, 3).join(', ')})...`);

  for (const prefix of prefixes.slice(0, 4)) {
    // Generate prioritized host IP list: gateway (.1), low DHCP (.2 - .30), common DHCP (.100 - .150, .200 - .254)
    const highPriorityIps: string[] = [
      `${prefix}.1`,
      `${prefix}.2`,
      `${prefix}.3`,
      `${prefix}.4`,
      `${prefix}.5`,
      `${prefix}.10`,
      `${prefix}.15`,
      `${prefix}.20`,
      `${prefix}.42`,
      `${prefix}.100`,
      `${prefix}.101`,
      `${prefix}.102`,
      `${prefix}.103`,
      `${prefix}.104`,
      `${prefix}.105`,
      `${prefix}.150`,
      `${prefix}.200`,
      `${prefix}.254`,
    ];

    // Build rest of subnet
    const fullSubnetIps: string[] = [];
    for (let i = 1; i <= 254; i++) {
      const candidateIp = `${prefix}.${i}`;
      if (!highPriorityIps.includes(candidateIp)) {
        fullSubnetIps.push(candidateIp);
      }
    }

    const candidateList = [...highPriorityIps, ...fullSubnetIps];

    // Probe in parallel batches of 25 with 450ms timeout
    const batchSize = 25;
    for (let i = 0; i < candidateList.length; i += batchSize) {
      const batch = candidateList.slice(i, i + batchSize);
      const batchPromises = batch.map((ip) => probeEndpoint(`http://${ip}`, 450, 'subnet-scan'));

      const results = await Promise.all(batchPromises);
      const found = results.find((r): r is DiscoveredEsp32 => r !== null && r.discovered);
      if (found) {
        onLog?.(`[ESP32 Discovery] ✓ Found VEGA Programmer at ${found.ip} (Subnet: ${prefix}.x)`);
        return found;
      }
    }
  }

  return null;
}

/**
 * Main Automatic Discovery Function
 * Implements Stage A -> B -> C -> D with complete fallback and signature validation
 */
export async function discoverEsp32(
  preferredIpOrUrl?: string,
  onLog?: (msg: string) => void
): Promise<DiscoveredEsp32> {
  onLog?.('[ESP32 Discovery] Starting automatic discovery...');

  // --------------------------------------------------------------------------
  // STAGE A: Cached / Preferred IP Probe
  // --------------------------------------------------------------------------
  let savedCandidate = preferredIpOrUrl?.trim();
  if (!savedCandidate && typeof window !== 'undefined') {
    try {
      savedCandidate = localStorage.getItem('vega_ide_esp32_ip') || undefined;
    } catch {}
  }

  if (savedCandidate) {
    onLog?.(`[ESP32 Discovery] Checking cached IP: ${savedCandidate}...`);
    const directResult = await probeEndpoint(savedCandidate, 2000, 'cached');
    if (directResult && directResult.discovered) {
      onLog?.(`[ESP32 Discovery] ✓ Connected to cached ESP32 at ${directResult.ip}`);
      return directResult;
    }
    onLog?.('[ESP32 Discovery] Cached IP unresponsive. Probing local network...');
  }

  // --------------------------------------------------------------------------
  // STAGE B & C (PARALLEL): mDNS Hostnames + SoftAP + Server/API Bridge
  // --------------------------------------------------------------------------
  onLog?.('[ESP32 Discovery] Probing mDNS (http://vega-esp32.local) & SoftAP...');

  const fastPromises: Promise<DiscoveredEsp32 | null>[] = [
    probeServerDiscovery(2500),
    ...MDNS_CANDIDATES.map((candidate) => probeEndpoint(candidate, 2200)),
  ];

  try {
    const fastResults = await Promise.all(fastPromises);
    const validFast = fastResults.find((r): r is DiscoveredEsp32 => r !== null && r.discovered);
    if (validFast) {
      onLog?.(`[ESP32 Discovery] ✓ Discovered VEGA Programmer at ${validFast.ip} (${validFast.source?.toUpperCase()})`);
      return validFast;
    }
  } catch {}

  // --------------------------------------------------------------------------
  // STAGE D: Direct Browser Subnet Fast Sweep
  // --------------------------------------------------------------------------
  const subnetResult = await scanSubnetFromBrowser(onLog);
  if (subnetResult && subnetResult.discovered) {
    return subnetResult;
  }

  onLog?.('[ESP32 Discovery] No VEGA Programmer found on local network.');
  return {
    discovered: false,
    ip: '',
    address: '',
  };
}

/**
 * Fast Health-Check / Ping of an existing discovered address
 */
export async function probeEsp32Endpoint(
  baseUrl: string,
  timeoutMs = 2500
): Promise<DiscoveredEsp32 | null> {
  return probeEndpoint(baseUrl, timeoutMs);
}

/**
 * Check if existing address is alive and healthy
 */
export async function checkEsp32Health(address: string, timeoutMs = 2500): Promise<boolean> {
  if (!address) return false;
  const res = await probeEndpoint(address, timeoutMs);
  return res !== null && res.discovered;
}

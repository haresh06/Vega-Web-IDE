/**
 * ============================================================================
 * VEGA ARIES v2 - Automatic ESP32-S3 Gateway Discovery Engine
 * ============================================================================
 * 
 * Automatically detects the ESP32-S3 gateway on ANY compatible Wi-Fi / LAN
 * (10.x.x.x, 172.16-31.x.x, 192.168.x.x, with /24, /23, /22, /21, /16 masks)
 * without requiring the user to type or hardcode dynamic DHCP IP addresses.
 * 
 * Multi-Stage Discovery Pipeline:
 *  1. Quick Probe of Previously Cached IP (fast check, discarded if dead)
 *  2. Parallel mDNS & SoftAP Candidates (http://vega-esp32.local/status)
 *  3. Local Helper (http://127.0.0.1:4000/esp32/discover) & Server API Bridge
 *  4. Dynamically Detected Active Subnet Fast Sweep (Derived from host interfaces)
 *  5. Manual IP Fallback (Settings Gear in UI)
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
  source?: 'cached' | 'mdns' | 'api' | 'ap' | 'arp' | 'subnet-scan' | 'direct';
}

export interface ActiveSubnetInfo {
  interfaceName: string;
  ip: string;
  netmask: string;
  network: string;
  broadcast: string;
  prefix: string;
  hostCount: number;
  startHost: number;
  endHost: number;
}

const MDNS_CANDIDATES = [
  'http://vega-esp32.local',
  'http://vega-esp32',
  'http://vega-gateway.local',
  'http://esp32.local',
  'http://192.168.4.1', // SoftAP default gateway
];

const LOCAL_HELPER_DISCOVER_URL = 'http://127.0.0.1:4000/esp32/discover';

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
    obj.mode !== undefined ||
    obj.programming_state !== undefined ||
    obj.flash_done !== undefined
  );
}

/**
 * Probe a single endpoint via HTTP GET /status
 */
async function probeEndpoint(
  baseUrl: string,
  timeoutMs = 1800,
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
          baseUrl.includes('.local') || baseUrl.includes('vega-esp32') ? 'mdns' :
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
 * Query the local VEGA Lab helper at http://127.0.0.1:4000/esp32/discover
 */
async function probeLocalHelper(target?: string, timeoutMs = 2500): Promise<DiscoveredEsp32 | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const endpointUrl = target
    ? `${LOCAL_HELPER_DISCOVER_URL}?target=${encodeURIComponent(target)}`
    : LOCAL_HELPER_DISCOVER_URL;

  try {
    const res = await fetch(endpointUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.ip) {
        const st = data.status || {};
        return {
          discovered: true,
          ip: data.ip,
          address: `http://${data.ip}`,
          chip: st.chip,
          mode: st.mode,
          rssi: st.rssi,
          status: st.status,
          littlefs_free: st.littlefs_free,
          littlefs_total: st.littlefs_total,
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
 * Query the Next.js server-side discovery bridge
 */
async function probeServerDiscovery(
  target?: string,
  timeoutMs = 2500
): Promise<{ result: DiscoveredEsp32 | null; subnets?: ActiveSubnetInfo[]; arpIps?: string[] }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const endpointUrl = target
    ? `/api/esp32/discover?target=${encodeURIComponent(target)}`
    : '/api/esp32/discover';

  try {
    const res = await fetch(endpointUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const result = await res.json();
      const subnets: ActiveSubnetInfo[] = result.subnets || [];
      const arpIps: string[] = result.arpIps || [];

      if (result.found && result.ip) {
        const data = result.data || {};
        return {
          result: {
            discovered: true,
            ip: result.ip,
            address: result.address || `http://${result.ip}`,
            chip: data.chip || result.chip,
            mode: data.mode || result.mode,
            rssi: data.rssi || result.rssi,
            status: data.status || result.status,
            littlefs_free: data.littlefs_free || result.littlefs_free,
            littlefs_total: data.littlefs_total || result.littlefs_total,
            source: result.source || 'api',
          },
          subnets,
          arpIps,
        };
      }
      return { result: null, subnets, arpIps };
    }
  } catch {
    clearTimeout(timeoutId);
  }
  return { result: null };
}

/**
 * Detect client local IPv4 address via WebRTC ICE candidate
 */
async function detectBrowserLocalIps(): Promise<string[]> {
  if (typeof window === 'undefined' || typeof RTCPeerConnection === 'undefined') return [];
  return new Promise((resolve) => {
    const detectedIps: string[] = [];
    try {
      const pc = new RTCPeerConnection({ iceServers: [] });
      pc.createDataChannel('');
      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .catch(() => resolve([]));

      const timer = setTimeout(() => {
        try { pc.close(); } catch {}
        resolve(detectedIps);
      }, 600);

      pc.onicecandidate = (event) => {
        if (!event || !event.candidate) return;
        const candidate = event.candidate.candidate;
        const match = candidate.match(/([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/);
        if (
          match &&
          match[1] &&
          !match[1].startsWith('127.') &&
          !match[1].startsWith('0.') &&
          !match[1].startsWith('169.254.')
        ) {
          if (!detectedIps.includes(match[1])) {
            detectedIps.push(match[1]);
          }
        }
      };
    } catch {
      resolve([]);
    }
  });
}

/**
 * Direct Browser Subnet Fast Sweep
 * Concurrently scans active Wi-Fi subnets for /status in batches
 */
async function scanSubnetFromBrowser(
  dynamicPrefixes: string[],
  arpIps: string[],
  onLog?: (msg: string) => void
): Promise<DiscoveredEsp32 | null> {
  const browserIps = await detectBrowserLocalIps();
  const prefixes = [...dynamicPrefixes];

  for (const bIp of browserIps) {
    const parts = bIp.split('.');
    if (parts.length === 4) {
      const prefix = `${parts[0]}.${parts[1]}.${parts[2]}`;
      if (!prefixes.includes(prefix)) {
        prefixes.unshift(prefix); // Prioritize detected laptop active subnet!
      }
    }
  }

  // Fallback common 2.4GHz hotspot & router subnets only if no active subnets discovered
  if (prefixes.length === 0) {
    prefixes.push('192.168.1', '192.168.0', '192.168.43', '10.0.0', '172.20.10');
  }

  onLog?.(`[ESP32 Discovery] Probing active local network (${prefixes.slice(0, 3).join(', ')})...`);

  // First probe any ARP candidates directly
  if (arpIps.length > 0) {
    const arpPromises = arpIps.map((ip) => probeEndpoint(`http://${ip}`, 600, 'arp'));
    const arpResults = await Promise.all(arpPromises);
    const arpFound = arpResults.find((r): r is DiscoveredEsp32 => r !== null && r.discovered);
    if (arpFound) {
      onLog?.(`[ESP32 Discovery] ✓ Found VEGA Programmer at ${arpFound.ip} (ARP Cache)`);
      return arpFound;
    }
  }

  for (const prefix of prefixes.slice(0, 4)) {
    // Generate prioritized host IP list: gateway (.1), low DHCP (.2 - .35), common DHCP (.100 - .150, .200 - .254)
    const highPriorityIps: string[] = [
      `${prefix}.1`,
      `${prefix}.2`,
      `${prefix}.3`,
      `${prefix}.4`,
      `${prefix}.5`,
      `${prefix}.10`,
      `${prefix}.15`,
      `${prefix}.20`,
      `${prefix}.25`,
      `${prefix}.35`,
      `${prefix}.42`,
      `${prefix}.100`,
      `${prefix}.101`,
      `${prefix}.102`,
      `${prefix}.103`,
      `${prefix}.104`,
      `${prefix}.105`,
      `${prefix}.148`,
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

    // Probe in parallel batches of 35 with 450ms timeout
    const batchSize = 35;
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
 * Implements complete network-independent discovery pipeline
 */
export async function discoverEsp32(
  preferredIpOrUrl?: string,
  onLog?: (msg: string) => void
): Promise<DiscoveredEsp32> {
  onLog?.('[ESP32 Discovery] Starting automatic discovery...');

  // --------------------------------------------------------------------------
  // STAGE 1: Quick Cached / Preferred IP Probe (Fast Check)
  // If the user changed Wi-Fi, the old IP will fail quickly (~1200ms) and be discarded.
  // --------------------------------------------------------------------------
  let savedCandidate = preferredIpOrUrl?.trim();
  if (!savedCandidate && typeof window !== 'undefined') {
    try {
      savedCandidate = localStorage.getItem('vega_ide_esp32_ip') || undefined;
    } catch {}
  }

  if (savedCandidate) {
    onLog?.(`[ESP32 Discovery] Quick check on cached IP: ${savedCandidate}...`);

    const [directResult, helperResult, apiProbe] = await Promise.all([
      probeEndpoint(savedCandidate, 1400, 'cached'),
      probeLocalHelper(savedCandidate, 1400),
      probeServerDiscovery(savedCandidate, 1400),
    ]);

    const cachedSuccess = directResult || helperResult || apiProbe.result;
    if (cachedSuccess && cachedSuccess.discovered && cachedSuccess.ip) {
      onLog?.(`[ESP32 Discovery] ✓ Connected to cached ESP32 at ${cachedSuccess.ip}`);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('vega_ide_esp32_ip', cachedSuccess.ip);
        } catch {}
      }
      return cachedSuccess;
    }
    onLog?.('[ESP32 Discovery] Cached IP unresponsive. Detecting active Wi-Fi network...');
  }

  // --------------------------------------------------------------------------
  // STAGE 2 & 3: mDNS Hostnames + Local Helper + SoftAP + Dynamic Topology Bridge
  // --------------------------------------------------------------------------
  onLog?.('[ESP32 Discovery] Probing local helper (http://127.0.0.1:4000), mDNS & network bridge...');

  const fastPromises: [
    Promise<DiscoveredEsp32 | null>,
    Promise<{ result: DiscoveredEsp32 | null; subnets?: ActiveSubnetInfo[]; arpIps?: string[] }>,
    ...Promise<DiscoveredEsp32 | null>[]
  ] = [
    probeLocalHelper(undefined, 2500),
    probeServerDiscovery(undefined, 2200),
    ...MDNS_CANDIDATES.map((candidate) => probeEndpoint(candidate, 1800)),
  ];

  let detectedSubnetPrefixes: string[] = [];
  let detectedArpIps: string[] = [];

  try {
    const [helperRes, serverBridgeRes, ...mdnsResults] = await Promise.all(fastPromises);

    if (helperRes && helperRes.ip) {
      onLog?.(`[ESP32 Discovery] ✓ Discovered VEGA Programmer at ${helperRes.ip} (Local Helper)`);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('vega_ide_esp32_ip', helperRes.ip);
        } catch {}
      }
      return helperRes;
    }

    if (serverBridgeRes.subnets) {
      detectedSubnetPrefixes = serverBridgeRes.subnets.map((s) => s.prefix);
    }
    if (serverBridgeRes.arpIps) {
      detectedArpIps = serverBridgeRes.arpIps;
    }

    if (serverBridgeRes.result && serverBridgeRes.result.ip) {
      onLog?.(`[ESP32 Discovery] ✓ Discovered VEGA Programmer at ${serverBridgeRes.result.ip} (${serverBridgeRes.result.source?.toUpperCase()})`);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('vega_ide_esp32_ip', serverBridgeRes.result.ip);
        } catch {}
      }
      return serverBridgeRes.result;
    }

    const validMdns = mdnsResults.find((r): r is DiscoveredEsp32 => r !== null && r.discovered);
    if (validMdns && validMdns.ip) {
      onLog?.(`[ESP32 Discovery] ✓ Discovered VEGA Programmer at ${validMdns.ip} (mDNS)`);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('vega_ide_esp32_ip', validMdns.ip);
        } catch {}
      }
      return validMdns;
    }
  } catch {}

  // --------------------------------------------------------------------------
  // STAGE 4: Dynamically Detected Active Subnet Fast Sweep
  // --------------------------------------------------------------------------
  const subnetResult = await scanSubnetFromBrowser(detectedSubnetPrefixes, detectedArpIps, onLog);
  if (subnetResult && subnetResult.discovered && subnetResult.ip) {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('vega_ide_esp32_ip', subnetResult.ip);
      } catch {}
    }
    return subnetResult;
  }

  onLog?.('[ESP32 Discovery] No VEGA Programmer found on active local network.');
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
  timeoutMs = 2000
): Promise<DiscoveredEsp32 | null> {
  const direct = await probeEndpoint(baseUrl, timeoutMs);
  if (direct && direct.discovered) return direct;
  const helper = await probeLocalHelper(baseUrl, timeoutMs);
  if (helper && helper.discovered) return helper;
  const bridge = await probeServerDiscovery(baseUrl, timeoutMs);
  return bridge.result;
}

/**
 * Check if existing address is alive and healthy
 */
export async function checkEsp32Health(address: string, timeoutMs = 2000): Promise<boolean> {
  if (!address) return false;
  const res = await probeEsp32Endpoint(address, timeoutMs);
  return res !== null && res.discovered;
}


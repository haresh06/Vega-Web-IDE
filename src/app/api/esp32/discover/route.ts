import { NextResponse } from 'next/server';
import os from 'os';
import http from 'http';
import dns from 'dns';
import { execSync } from 'child_process';

export const dynamic = 'force-dynamic';

interface DiscoveredResult {
  found: boolean;
  ip?: string;
  address?: string;
  chip?: string;
  mode?: string;
  rssi?: number;
  status?: string;
  littlefs_free?: number;
  littlefs_total?: number;
  source?: string;
  message?: string;
  subnets?: string[];
}

function ipToInt(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

function intToIp(int: number): string {
  return [
    (int >>> 24) & 255,
    (int >>> 16) & 255,
    (int >>> 8) & 255,
    int & 255,
  ].join('.');
}

interface SubnetInfo {
  interfaceName: string;
  ip: string;
  netmask: string;
  network: string;
  broadcast: string;
  hostCount: number;
  startHost: number;
  endHost: number;
}

function getSubnetInfo(ip: string, netmask: string, interfaceName: string): SubnetInfo {
  const ipNum = ipToInt(ip);
  const maskNum = ipToInt(netmask);
  const networkNum = (ipNum & maskNum) >>> 0;
  const broadcastNum = (networkNum | (~maskNum >>> 0)) >>> 0;
  const hostCount = Math.max(0, broadcastNum - networkNum - 1);

  return {
    interfaceName,
    ip,
    netmask,
    network: intToIp(networkNum),
    broadcast: intToIp(broadcastNum),
    hostCount,
    startHost: networkNum + 1,
    endHost: broadcastNum - 1,
  };
}

/**
 * Dynamically extract active host IPv4 interfaces and calculate accurate subnets from IP + netmask
 */
function getActiveNetworkSubnets(): SubnetInfo[] {
  const interfaces = os.networkInterfaces();
  const subnets: SubnetInfo[] = [];

  for (const [name, addrs] of Object.entries(interfaces)) {
    if (!addrs) continue;
    const lowerName = name.toLowerCase();
    // Ignore virtual, loopback, docker, wsl interfaces
    if (
      lowerName.includes('loopback') ||
      lowerName.includes('vethernet') ||
      lowerName.includes('docker') ||
      lowerName.includes('wsl') ||
      lowerName.includes('hyper-v') ||
      lowerName.includes('tap') ||
      lowerName.includes('vmware')
    ) {
      continue;
    }

    for (const addr of addrs) {
      if (addr.family === 'IPv4' && !addr.internal) {
        if (addr.address.startsWith('169.254.') || addr.address.startsWith('127.')) continue;
        const info = getSubnetInfo(addr.address, addr.netmask, name);
        subnets.push(info);
      }
    }
  }
  return subnets;
}

/**
 * Extract active IPv4 entries from local OS ARP cache
 */
function getArpCacheIps(): string[] {
  try {
    const output = execSync('arp -a', { timeout: 1500 }).toString();
    const ips: string[] = [];
    const regex = /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/g;
    let match;
    while ((match = regex.exec(output)) !== null) {
      const ip = match[1];
      if (
        !ip.endsWith('.255') &&
        !ip.startsWith('224.') &&
        !ip.startsWith('239.') &&
        !ip.startsWith('255.') &&
        !ip.startsWith('127.') &&
        !ip.startsWith('169.254.')
      ) {
        ips.push(ip);
      }
    }
    return [...new Set(ips)];
  } catch {
    return [];
  }
}

/**
 * Probe an IP or hostname via HTTP GET /status and verify the ESP32 signature
 */
function probeDevice(target: string, timeoutMs = 2000): Promise<{ valid: boolean; data?: any }> {
  return new Promise((resolve) => {
    let completed = false;
    const cleanTarget = target.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
    const url = `http://${cleanTarget}/status`;

    const req = http.get(url, { timeout: timeoutMs }, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        if (!completed) {
          completed = true;
          if (res.statusCode === 200) {
            try {
              const json = JSON.parse(body);
              if (
                json &&
                (json.status === 'ready' ||
                  json.status === 'busy' ||
                  json.status === 'ok' ||
                  typeof json.chip === 'string' ||
                  typeof json.littlefs_total === 'number' ||
                  json.firmware !== undefined ||
                  json.vega_connected !== undefined ||
                  json.mode !== undefined)
              ) {
                return resolve({ valid: true, data: json });
              }
            } catch {
              // Invalid JSON
            }
          }
          resolve({ valid: false });
        }
      });
    });

    req.on('error', () => {
      if (!completed) {
        completed = true;
        resolve({ valid: false });
      }
    });

    req.on('timeout', () => {
      if (!completed) {
        completed = true;
        req.destroy();
        resolve({ valid: false });
      }
    });
  });
}

function quickDnsLookup(host: string, timeoutMs = 800): Promise<string | null> {
  return new Promise((resolve) => {
    let done = false;
    const timer = setTimeout(() => {
      if (!done) {
        done = true;
        resolve(null);
      }
    }, timeoutMs);

    dns.lookup(host, (err, address) => {
      if (!done) {
        done = true;
        clearTimeout(timer);
        resolve(err ? null : address);
      }
    });
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const targetParam = url.searchParams.get('target')?.trim();

  // --------------------------------------------------------------------------
  // TARGET PROBE (Cached IP or Explicit Target)
  // If target parameter is provided, probe directly first regardless of subnet!
  // --------------------------------------------------------------------------
  if (targetParam) {
    const targetCheck = await probeDevice(targetParam, 2500);
    if (targetCheck.valid && targetCheck.data) {
      const discoveredIp = targetCheck.data.ip || targetParam.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
      return NextResponse.json<DiscoveredResult>({
        found: true,
        ip: discoveredIp,
        address: `http://${discoveredIp}`,
        chip: targetCheck.data.chip,
        mode: targetCheck.data.mode,
        rssi: targetCheck.data.rssi,
        status: targetCheck.data.status,
        littlefs_free: targetCheck.data.littlefs_free,
        littlefs_total: targetCheck.data.littlefs_total,
        source: 'cached',
      });
    }
  }

  // --------------------------------------------------------------------------
  // CLOUD ENVIRONMENT DETECTION (Vercel Serverless / AWS Lambda)
  // --------------------------------------------------------------------------
  const isCloud = process.env.VERCEL === '1' || process.env.NOW_REGION || process.env.AWS_LAMBDA_FUNCTION_NAME;
  if (isCloud) {
    return NextResponse.json<DiscoveredResult>({
      found: false,
      message: 'Running in cloud environment (Vercel). Direct browser-side LAN/mDNS discovery active.',
    });
  }

  // --------------------------------------------------------------------------
  // STAGE 1: mDNS Hostnames + ARP Cache IPs + SoftAP Default Gateway
  // --------------------------------------------------------------------------
  const mdnsCandidates = ['vega-esp32.local', 'vega-esp32', 'vega-gateway.local', 'esp32.local'];
  const arpIps = getArpCacheIps();
  const fastCandidates = [...new Set([...mdnsCandidates, ...arpIps, '192.168.4.1'])];

  const fastResults = await Promise.all(
    fastCandidates.map(async (candidate) => {
      let target = candidate;
      if (candidate.endsWith('.local') || candidate === 'vega-esp32') {
        const resolved = await quickDnsLookup(candidate, 600);
        if (resolved) target = resolved;
      }
      const check = await probeDevice(target, 1200);
      return { target, candidate, ...check };
    })
  );

  const fastFound = fastResults.find((r) => r.valid && r.data);
  if (fastFound && fastFound.data) {
    const discoveredIp = fastFound.data.ip || fastFound.target;
    return NextResponse.json<DiscoveredResult>({
      found: true,
      ip: discoveredIp,
      address: `http://${discoveredIp}`,
      chip: fastFound.data.chip,
      mode: fastFound.data.mode,
      rssi: fastFound.data.rssi,
      status: fastFound.data.status,
      littlefs_free: fastFound.data.littlefs_free,
      littlefs_total: fastFound.data.littlefs_total,
      source: fastFound.candidate.includes('.local') || fastFound.candidate === 'vega-esp32' ? 'mdns' : 'arp',
    });
  }

  // --------------------------------------------------------------------------
  // STAGE 2: Dynamic Local Subnet Sweep (Calculated from IP + netmask)
  // --------------------------------------------------------------------------
  const subnets = getActiveNetworkSubnets();
  const candidateIps: string[] = [];

  for (const sub of subnets) {
    // If subnet size is reasonable (e.g. <= 512 hosts like /24 or /23), scan all hosts
    if (sub.hostCount <= 512) {
      for (let i = sub.startHost; i <= sub.endHost; i++) {
        const ip = intToIp(i);
        if (!fastCandidates.includes(ip)) {
          candidateIps.push(ip);
        }
      }
    } else {
      // For larger enterprise subnets (e.g. /21 or /16), scan the host's /24 block + high priority boundaries
      const baseIpNum = ipToInt(sub.ip);
      const hostSubnetBase = (baseIpNum & 0xffffff00) >>> 0;
      for (let i = 1; i <= 254; i++) {
        const ip = intToIp(hostSubnetBase + i);
        if (!fastCandidates.includes(ip)) {
          candidateIps.push(ip);
        }
      }
    }
  }

  // Concurrently probe candidates in batches of 40 with 600ms timeout
  const batchSize = 40;
  for (let i = 0; i < candidateIps.length; i += batchSize) {
    const batch = candidateIps.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async (ip) => {
        const check = await probeDevice(ip, 600);
        return { ip, ...check };
      })
    );

    const found = results.find((r) => r.valid && r.data);
    if (found && found.data) {
      const discoveredIp = found.data.ip || found.ip;
      return NextResponse.json<DiscoveredResult>({
        found: true,
        ip: discoveredIp,
        address: `http://${discoveredIp}`,
        chip: found.data.chip,
        mode: found.data.mode,
        rssi: found.data.rssi,
        status: found.data.status,
        littlefs_free: found.data.littlefs_free,
        littlefs_total: found.data.littlefs_total,
        source: 'subnet-scan',
      });
    }
  }

  return NextResponse.json<DiscoveredResult>({
    found: false,
    message: 'No VEGA ESP32 gateway found on active local subnets or mDNS.',
    subnets: subnets.map((s) => `${s.interfaceName}: ${s.network} (${s.ip}/${s.netmask})`),
  });
}

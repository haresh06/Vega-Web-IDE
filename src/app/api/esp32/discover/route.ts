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
}

/**
 * Dynamically extract local IPv4 subnets from active host network interfaces
 */
function getLocalSubnetPrefixes(): string[] {
  const interfaces = os.networkInterfaces();
  const prefixes: string[] = [];

  for (const [, addrs] of Object.entries(interfaces)) {
    if (!addrs) continue;
    for (const addr of addrs) {
      if (addr.family === 'IPv4' && !addr.internal) {
        const parts = addr.address.split('.');
        if (parts.length === 4) {
          const prefix = `${parts[0]}.${parts[1]}.${parts[2]}`;
          if (!prefixes.includes(prefix)) {
            prefixes.push(prefix);
          }
        }
      }
    }
  }
  return prefixes;
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
        !ip.startsWith('127.')
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
function probeDevice(target: string, timeoutMs = 350): Promise<{ valid: boolean; data?: any }> {
  return new Promise((resolve) => {
    let completed = false;
    const url = target.startsWith('http://') ? `${target}/status` : `http://${target}/status`;

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
                  json.chip ||
                  typeof json.littlefs_total === 'number' ||
                  json.firmware)
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

function quickDnsLookup(host: string, timeoutMs = 600): Promise<string | null> {
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

export async function GET() {
  // --------------------------------------------------------------------------
  // STAGE 1 & 2 (PARALLEL): mDNS Hostnames + ARP Cache IPs + SoftAP
  // --------------------------------------------------------------------------
  const mdnsCandidates = ['vega-esp32.local', 'vega-gateway.local', 'esp32.local'];
  const arpIps = getArpCacheIps();
  const fastCandidates = [...new Set([...mdnsCandidates, ...arpIps, '192.168.4.1'])];

  const fastResults = await Promise.all(
    fastCandidates.map(async (candidate) => {
      let target = candidate;
      if (candidate.endsWith('.local')) {
        const resolved = await quickDnsLookup(candidate, 500);
        if (resolved) target = resolved;
      }
      const check = await probeDevice(target, 400);
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
      source: fastFound.candidate.includes('.local') ? 'mdns' : 'arp',
    });
  }

  // --------------------------------------------------------------------------
  // STAGE 3: Full Dynamic Subnet Parallel Sweep (Derived from os.networkInterfaces)
  // --------------------------------------------------------------------------
  const subnetPrefixes = getLocalSubnetPrefixes();
  const candidateIps: string[] = [];

  for (const prefix of subnetPrefixes) {
    for (let i = 1; i <= 254; i++) {
      const ip = `${prefix}.${i}`;
      if (!fastCandidates.includes(ip)) {
        candidateIps.push(ip);
      }
    }
  }

  // Concurrently probe subnet in batches of 70 with 300ms timeout (< 1.2s total)
  const batchSize = 70;
  for (let i = 0; i < candidateIps.length; i += batchSize) {
    const batch = candidateIps.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async (ip) => {
        const check = await probeDevice(ip, 300);
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
    message: 'No VEGA ESP32 gateway found on active local subnet or mDNS.',
  });
}

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Plus, X, Edit2, FileCode, FileText, RotateCw, Usb, Wifi, Settings } from 'lucide-react';
import { checkEsp32Status, uploadFirmwareToEsp32 } from '@/lib/esp32/wifi-flasher';
import { discoverEsp32, checkEsp32Health, probeEsp32Endpoint, DiscoveredEsp32 } from '@/lib/esp32/discovery';
import VegaLabSetupCard from '@/components/ide/VegaLabSetupCard';
import { WebSerialConnection, isWebSerialSupported } from '@/lib/serial/web-serial';
import { VegaUsbFlasher } from '@/lib/serial/vega-usb-flasher';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const STORAGE_KEY_FILES = 'vega_ide_project_files_v2';
const STORAGE_KEY_ACTIVE = 'vega_ide_active_file_v2';

const defaultFiles: Record<string, { content: string; language: string }> = {
  'main.cpp': {
    language: 'cpp',
    content: `#include <Arduino.h>

#define LED_PIN 5

void setup()
{
    // Configure LED pin as digital output
    pinMode(LED_PIN, OUTPUT);

    // Initialize hardware UART serial
    Serial.begin(115200);
    Serial.println("VEGA ARIES v2 - THEJAS32 RISC-V Ready!");
}

void loop()
{
    // Turn LED on
    digitalWrite(LED_PIN, HIGH);
    Serial.println("LED State: HIGH");
    delay(500);

    // Turn LED off
    digitalWrite(LED_PIN, LOW);
    Serial.println("LED State: LOW");
    delay(500);
}
`
  },
  'main.c': {
    language: 'c',
    content: `#include <Arduino.h>

#define LED_PIN 5

void setup()
{
    pinMode(LED_PIN, OUTPUT);
    Serial.begin(115200);
    Serial.println("VEGA ARIES v2 - LED Blink");
}

void loop()
{
    digitalWrite(LED_PIN, HIGH);
    delay(500);

    digitalWrite(LED_PIN, LOW);
    delay(500);
}
`
  },
  'gpio.h': {
    language: 'c',
    content: `#ifndef GPIO_H
#define GPIO_H

#include <stdint.h>

#define GPIO_BASE      0x10080000
#define GPIO_INPUT     0
#define GPIO_OUTPUT    1

#define HIGH           1
#define LOW            0

void gpio_pin_configure(uint8_t pin, uint8_t direction);
void gpio_pin_set(uint8_t pin, uint8_t value);
uint8_t gpio_pin_read(uint8_t pin);
void gpio_pin_toggle(uint8_t pin);

#endif
`
  },
  'delay.h': {
    language: 'c',
    content: `#ifndef DELAY_H
#define DELAY_H

#include <stdint.h>

void delay_ms(uint32_t ms);
void delay_us(uint32_t us);

#endif
`
  },
  'README.md': {
    language: 'markdown',
    content: `# VEGA ARIES v2 - Multi-File Project

## Description
Integrated multi-file C/C++ development environment for VEGA ARIES v2 and THEJAS32 RISC-V.

## Build & Flash
1. Click BUILD to compile and link all project sources (.c, .cpp, .h)
2. Click FLASH to wirelessly transfer firmware to ESP32-S3 LittleFS
3. Monitor UART output in Serial Monitor
`
  }
};

interface SerialPort {
  open(options: { baudRate: number }): Promise<void>;
  close(): Promise<void>;
  readable: ReadableStream<Uint8Array> | null;
  writable: WritableStream<Uint8Array> | null;
  getInfo(): { usbVendorId?: number; usbProductId?: number };
}

type BuildStatus = 'idle' | 'building' | 'success' | 'failed';
type FlashStatus = 'idle' | 'connecting' | 'detecting' | 'bootloader' | 'flashing' | 'verifying' | 'success' | 'failed';

interface SerialLog {
  time: string;
  text: string;
  type: 'info' | 'success' | 'error' | 'warning' | 'data';
}

function detectLanguage(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.cpp') || lower.endsWith('.cc') || lower.endsWith('.cxx')) return 'cpp';
  if (lower.endsWith('.c') || lower.endsWith('.h') || lower.endsWith('.hpp') || lower.endsWith('.ino')) return 'c';
  if (lower.endsWith('.md')) return 'markdown';
  if (lower.endsWith('.json')) return 'json';
  if (lower.endsWith('.txt')) return 'plaintext';
  return 'c';
}

function getStarterTemplate(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.h') || lower.endsWith('.hpp')) {
    const cleanName = filename.replace(/[^a-zA-Z0-9_]/g, '_').toUpperCase();
    return `#ifndef ${cleanName}\n#define ${cleanName}\n\n#include <stdint.h>\n\n// Function declarations\n\n#endif\n`;
  }
  if (lower.endsWith('.c')) {
    const headerName = filename.replace(/\.c$/i, '.h');
    return `#include "${headerName}"\n#include <Arduino.h>\n\n// Implementation\n`;
  }
  if (lower.endsWith('.cpp')) {
    return `#include <Arduino.h>\n\n// Implementation\n`;
  }
  return '';
}

export default function IDEPage() {
  const [activeFile, setActiveFile] = useState('main.cpp');
  const [files, setFiles] = useState<Record<string, { content: string; language: string }>>(defaultFiles);
  const [isHydrated, setIsHydrated] = useState(false);

  // ESP32 Automatic Discovery & Dynamic IP States
  const [discoveryStatus, setDiscoveryStatus] = useState<'searching' | 'connected' | 'not_found'>('searching');
  const [discoveredDevice, setDiscoveredDevice] = useState<DiscoveredEsp32 | null>(null);
  const [manualEsp32Ip, setManualEsp32Ip] = useState('');
  const [showManualIpInput, setShowManualIpInput] = useState(false);
  const [isConnectingIp, setIsConnectingIp] = useState(false);
  const isDiscoveringRef = useRef(false);
  const healthFailCountRef = useRef(0);

  // Inline file creation state
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileNameInput, setNewFileNameInput] = useState('');
  const [fileInputError, setFileInputError] = useState<string | null>(null);
  const newFileInputRef = useRef<HTMLInputElement>(null);

  // Inline rename state
  const [renamingFile, setRenamingFile] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Flash Target state: 'ota' (default) or 'usb'
  const [flashTarget, setFlashTarget] = useState<'ota' | 'usb'>('ota');
  const [usbConnected, setUsbConnected] = useState(false);
  const webSerialRef = useRef<WebSerialConnection | null>(null);

  // Build & Flash states
  const [buildStatus, setBuildStatus] = useState<BuildStatus>('idle');
  const [buildLog, setBuildLog] = useState<string[]>([]);
  const [binaryBase64, setBinaryBase64] = useState<string | null>(null);
  const [buildChecksum, setBuildChecksum] = useState<string>('');
  const [flashStatus, setFlashStatus] = useState<FlashStatus>('idle');
  const [flashProgress, setFlashProgress] = useState(0);
  const [firmwareSize, setFirmwareSize] = useState(0);
  const [activePanel, setActivePanel] = useState<'build' | 'serial' | 'flash'>('build');
  const [serialLogs, setSerialLogs] = useState<SerialLog[]>([]);
  const [serialConnected, setSerialConnected] = useState(false);
  const [isSimulation, setIsSimulation] = useState(true);
  const terminalRef = useRef<HTMLDivElement>(null);

  // --------------------------------------------------------------------------
  // AUTOMATIC ESP32-S3 IP DISCOVERY & DIRECT IP CONNECTION
  // --------------------------------------------------------------------------
  const runDiscovery = useCallback(async (isManual = false, overrideIp?: string) => {
    if (isDiscoveringRef.current) return;
    isDiscoveringRef.current = true;
    setDiscoveryStatus('searching');

    try {
      let candidateIp = overrideIp || manualEsp32Ip;
      if (!candidateIp && typeof window !== 'undefined') {
        try {
          candidateIp = localStorage.getItem('vega_ide_esp32_ip') || '';
        } catch {}
      }

      const result = await discoverEsp32(candidateIp);
      if (result.discovered && result.ip) {
        setDiscoveredDevice(result);
        setDiscoveryStatus('connected');
        setManualEsp32Ip(result.ip);
        try {
          localStorage.setItem('vega_ide_esp32_ip', result.ip);
        } catch {}
        healthFailCountRef.current = 0;
      } else {
        setDiscoveredDevice(null);
        setDiscoveryStatus('not_found');
      }
    } catch {
      setDiscoveredDevice(null);
      setDiscoveryStatus('not_found');
    } finally {
      isDiscoveringRef.current = false;
    }
  }, [manualEsp32Ip]);

  const handleConnectEsp32Ip = async (ipToTest?: string) => {
    const target = (ipToTest || manualEsp32Ip).trim();
    if (!target) {
      runDiscovery(true);
      return;
    }
    setIsConnectingIp(true);
    setDiscoveryStatus('searching');
    try {
      localStorage.setItem('vega_ide_esp32_ip', target);
    } catch {}

    try {
      const directResult = await probeEsp32Endpoint(target, 2500);
      if (directResult && directResult.discovered && directResult.ip) {
        setDiscoveredDevice(directResult);
        setDiscoveryStatus('connected');
        setManualEsp32Ip(directResult.ip);
        try {
          localStorage.setItem('vega_ide_esp32_ip', directResult.ip);
        } catch {}
        healthFailCountRef.current = 0;
        addFlashLog(`✓ ESP32-S3 Gateway connected at ${directResult.ip}`);
      } else {
        // Fall back to full discovery pipeline using target as preferred candidate
        const discResult = await discoverEsp32(target);
        if (discResult.discovered && discResult.ip) {
          setDiscoveredDevice(discResult);
          setDiscoveryStatus('connected');
          setManualEsp32Ip(discResult.ip);
          try {
            localStorage.setItem('vega_ide_esp32_ip', discResult.ip);
          } catch {}
          healthFailCountRef.current = 0;
          addFlashLog(`✓ ESP32-S3 Gateway connected at ${discResult.ip}`);
        } else {
          setDiscoveredDevice(null);
          setDiscoveryStatus('not_found');
          addFlashLog(`❌ Could not connect to ESP32 at ${target}/status`);
        }
      }
    } catch (err: unknown) {
      setDiscoveredDevice(null);
      setDiscoveryStatus('not_found');
      const msg = (err as Error).message || 'Connection failed';
      addFlashLog(`❌ ESP32 connection error: ${msg}`);
    } finally {
      setIsConnectingIp(false);
    }
  };

  // Initial automatic discovery on mount
  useEffect(() => {
    runDiscovery();
  }, [runDiscovery]);

  // Periodic health-check and auto-rediscovery interval
  useEffect(() => {
    const interval = setInterval(async () => {
      if (discoveryStatus === 'connected' && discoveredDevice?.address) {
        const isHealthy = await checkEsp32Health(discoveredDevice.address);
        if (!isHealthy) {
          healthFailCountRef.current += 1;
          if (healthFailCountRef.current >= 2) {
            // Lost connection or DHCP changed IP: re-discover
            runDiscovery();
          }
        } else {
          healthFailCountRef.current = 0;
        }
      } else if (discoveryStatus === 'not_found') {
        // Auto-retry discovery in background
        runDiscovery();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [discoveryStatus, discoveredDevice, runDiscovery]);

  // --------------------------------------------------------------------------
  // PERSISTENCE: HYDRATION ON CLIENT MOUNT
  // --------------------------------------------------------------------------
  useEffect(() => {
    try {
      // Restore saved ESP32 IP if previously saved
      const savedEsp32Ip = localStorage.getItem('vega_ide_esp32_ip');
      if (savedEsp32Ip) {
        setManualEsp32Ip(savedEsp32Ip);
      }

      const savedFilesStr = localStorage.getItem(STORAGE_KEY_FILES);
      const savedActiveFile = localStorage.getItem(STORAGE_KEY_ACTIVE);

      if (savedFilesStr) {
        const parsed = JSON.parse(savedFilesStr);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          setFiles(parsed);
          if (savedActiveFile && parsed[savedActiveFile]) {
            setActiveFile(savedActiveFile);
          } else {
            setActiveFile(Object.keys(parsed)[0]);
          }
        }
      }
    } catch (e) {
      console.warn('Could not read saved IDE project from localStorage:', e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // --------------------------------------------------------------------------
  // PERSISTENCE: SAVE ON CODE/FILE CHANGES
  // --------------------------------------------------------------------------
  const saveProjectState = useCallback((updatedFiles: Record<string, { content: string; language: string }>, currentActiveFile?: string) => {
    try {
      localStorage.setItem(STORAGE_KEY_FILES, JSON.stringify(updatedFiles));
      if (currentActiveFile) {
        localStorage.setItem(STORAGE_KEY_ACTIVE, currentActiveFile);
      }
    } catch (e) {
      console.warn('Could not save IDE project state:', e);
    }
  }, []);

  useEffect(() => {
    if (isHydrated) {
      saveProjectState(files, activeFile);
    }
  }, [files, activeFile, isHydrated, saveProjectState]);

  const scrollTerminal = useCallback(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, []);

  useEffect(scrollTerminal, [buildLog, serialLogs, scrollTerminal]);

  const getTime = () => new Date().toLocaleTimeString('en-US', { hour12: false });

  const addFlashLog = (msg: string) => {
    setBuildLog(prev => [...prev, `[${getTime()}] ${msg}`]);
  };

  // --------------------------------------------------------------------------
  // FILE CREATION HANDLERS (USING ONLY THE "+" ICON)
  // --------------------------------------------------------------------------
  const startCreatingFile = () => {
    setIsCreatingFile(true);
    setNewFileNameInput('');
    setFileInputError(null);
    setTimeout(() => {
      newFileInputRef.current?.focus();
    }, 50);
  };

  const commitNewFile = () => {
    const rawName = newFileNameInput.trim();
    if (!rawName) {
      setIsCreatingFile(false);
      setFileInputError(null);
      return;
    }

    // Check duplicate
    if (files[rawName]) {
      setFileInputError(`File "${rawName}" already exists.`);
      return;
    }

    const lang = detectLanguage(rawName);
    const starter = getStarterTemplate(rawName);

    const updated = {
      ...files,
      [rawName]: {
        language: lang,
        content: starter,
      }
    };

    setFiles(updated);
    setActiveFile(rawName);
    setIsCreatingFile(false);
    setNewFileNameInput('');
    setFileInputError(null);
    saveProjectState(updated, rawName);
  };

  const cancelCreatingFile = () => {
    setIsCreatingFile(false);
    setNewFileNameInput('');
    setFileInputError(null);
  };

  // --------------------------------------------------------------------------
  // FILE RENAMING HANDLERS
  // --------------------------------------------------------------------------
  const startRenaming = (filename: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setRenamingFile(filename);
    setRenameInput(filename);
    setTimeout(() => {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }, 50);
  };

  const commitRename = () => {
    if (!renamingFile) return;
    const oldName = renamingFile;
    const newName = renameInput.trim();

    if (!newName || newName === oldName) {
      setRenamingFile(null);
      return;
    }

    if (files[newName] && newName !== oldName) {
      alert(`A file named "${newName}" already exists in this project.`);
      return;
    }

    const fileData = files[oldName];
    const newLang = detectLanguage(newName);

    const updated: Record<string, { content: string; language: string }> = {};
    for (const [name, data] of Object.entries(files)) {
      if (name === oldName) {
        updated[newName] = { content: fileData.content, language: newLang };
      } else {
        updated[name] = data;
      }
    }

    setFiles(updated);
    if (activeFile === oldName) {
      setActiveFile(newName);
    }
    setRenamingFile(null);
    saveProjectState(updated, activeFile === oldName ? newName : activeFile);
  };

  const cancelRename = () => {
    setRenamingFile(null);
  };

  // --------------------------------------------------------------------------
  // FILE DELETION HANDLER (IMMEDIATE REMOVAL & PERSISTENCE)
  // --------------------------------------------------------------------------
  const handleDeleteFile = (fileNameToDelete: string, e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setFiles(prev => {
      const updated: Record<string, { content: string; language: string }> = {};
      for (const [name, data] of Object.entries(prev)) {
        if (name !== fileNameToDelete) {
          updated[name] = data;
        }
      }

      const remainingKeys = Object.keys(updated);
      let newActive = activeFile;

      if (activeFile === fileNameToDelete) {
        newActive = remainingKeys.length > 0 ? remainingKeys[0] : '';
        setActiveFile(newActive);
      }

      // Synchronous write to localStorage so state is immediately persistent
      try {
        localStorage.setItem(STORAGE_KEY_FILES, JSON.stringify(updated));
        localStorage.setItem(STORAGE_KEY_ACTIVE, newActive);
      } catch (err) {
        console.warn('Could not update localStorage after deletion:', err);
      }

      return updated;
    });
  };

  // --------------------------------------------------------------------------
  // MULTI-FILE BUILD COMPILATION & LINKING (LOCAL VEGA HELPER)
  // --------------------------------------------------------------------------
  const handleBuild = async () => {
    const CANDIDATE_HELPER_URLS = ['http://127.0.0.1:4000', 'http://localhost:4000'];

    setBuildStatus('building');
    setActivePanel('build');
    setBuildLog([]);
    setBinaryBase64(null);

    const fileNames = Object.keys(files);
    const sourceFiles = fileNames.filter(n => {
      const l = n.toLowerCase();
      return l.endsWith('.c') || l.endsWith('.cpp') || l.endsWith('.cc') || l.endsWith('.ino');
    });
    const headerFiles = fileNames.filter(n => {
      const l = n.toLowerCase();
      return l.endsWith('.h') || l.endsWith('.hpp');
    });

    addFlashLog(`▶ Starting build for VEGA ARIES v2 (THEJAS32)...`);
    addFlashLog(`  Compiler: riscv32-vega-elf-g++ (VEGA GCC 10.1.0)`);
    addFlashLog(`  Architecture: RV32IM • 100MHz • ilp32`);
    addFlashLog(`  Active File: ${activeFile}`);
    addFlashLog(`  Project Sources (${sourceFiles.length}): ${sourceFiles.join(', ') || 'None'}`);
    if (headerFiles.length > 0) {
      addFlashLog(`  Project Headers (${headerFiles.length}): ${headerFiles.join(', ')}`);
    }

    try {
      // Step 1: Probe local VEGA compiler helper
      let activeHelperUrl = CANDIDATE_HELPER_URLS[0];
      let isHealthy = false;

      for (const candidate of CANDIDATE_HELPER_URLS) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);

          const healthRes = await fetch(`${candidate}/health`, {
            method: 'GET',
            mode: 'cors',
            headers: { 'Accept': 'application/json' },
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          if (healthRes.ok) {
            const healthData = await healthRes.json();
            if (
              healthData &&
              (healthData.status === 'ok' || healthData.status === 'online' || healthData.compiler !== false)
            ) {
              activeHelperUrl = candidate;
              isHealthy = true;
              break;
            }
          }
        } catch {
          // Probe next candidate URL
        }
      }

      // Step 2: Prepare project files payload
      const filesArray = Object.entries(files).map(([name, fileObj]) => ({
        name,
        content: fileObj.content,
      }));

      const activeContent = files[activeFile]?.content || '';

      // Step 3: Send compile request to local helper (attempt active or fallback candidate)
      let response: Response | null = null;
      let lastCompileErr: Error | null = null;

      const urlsToTry = isHealthy
        ? [activeHelperUrl]
        : CANDIDATE_HELPER_URLS;

      for (const targetUrl of urlsToTry) {
        try {
          response = await fetch(`${targetUrl}/compile`, {
            method: 'POST',
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              files: filesArray,
              activeFile: activeFile,
              code: activeContent,
            }),
          });
          if (response) {
            activeHelperUrl = targetUrl;
            break;
          }
        } catch (err: unknown) {
          lastCompileErr = err as Error;
        }
      }

      if (!response) {
        setBuildStatus('failed');
        setBinaryBase64(null);
        addFlashLog('');
        addFlashLog('❌ BUILD FAILED: VEGA Compiler Helper is not running. Please install or start VEGA Lab Compiler.');
        addFlashLog('');
        addFlashLog('   Troubleshooting:');
        addFlashLog('   1. Verify VEGA Lab Compiler is running on your PC (http://127.0.0.1:4000).');
        addFlashLog('   2. Download and install VEGA Lab Setup:');
        addFlashLog('      🔗 Download: /downloads/VEGA-Lab-Setup.exe');
        if (lastCompileErr) {
          addFlashLog(`   3. Details: ${lastCompileErr.message || 'Connection refused or blocked by browser'}`);
        }
        return;
      }

      const data = await response.json();

      if (response.ok && data.success) {
        setBinaryBase64(data.binaryBase64);
        setFirmwareSize(data.binarySize);
        setBuildChecksum(data.checksum || '');
        setBuildStatus('success');

        addFlashLog('');
        addFlashLog('✅ BUILD & LINK SUCCESSFUL');
        addFlashLog('');
        addFlashLog(`  Target:     ${data.target || 'VEGA ARIES v2 (THEJAS32)'}`);
        addFlashLog(`  Toolchain:  ${data.toolchain || 'riscv32-vega-elf-g++ (VEGA GCC 10.1.0)'}`);
        addFlashLog(`  Firmware:   ${data.filename || 'VEGA_ARIES_v2_TEST.bin'}`);
        if (data.compiledFiles && data.compiledFiles.length > 0) {
          addFlashLog(`  Compiled:   ${data.compiledFiles.join(', ')}`);
        }
        addFlashLog(`  Size:       ${data.binarySize} bytes (${(data.binarySize / 1024).toFixed(2)} KB)`);
        addFlashLog(`  Checksum:   ${data.checksum || 'N/A'}`);
        if (data.size && data.size.total > 0) {
          addFlashLog(`  Memory:     .text=${data.size.text}B, .data=${data.size.data}B, .bss=${data.size.bss}B (Total: ${data.size.total}B)`);
        }
        addFlashLog('');
        addFlashLog('  Binary generated and ready for flashing.');
      } else {
        setBuildStatus('failed');
        setBinaryBase64(null);

        addFlashLog('');
        addFlashLog(`❌ BUILD FAILED: ${data.error || 'Compilation or linking failed.'}`);
        if (data.phase) {
          addFlashLog(`   Phase: ${data.phase.toUpperCase()}`);
        }
        if (data.stderr) {
          addFlashLog('');
          addFlashLog('── Compiler / Linker Output ──────────────────');
          const errLines = data.stderr.split('\n');
          for (const line of errLines) {
            if (line.trim()) {
              addFlashLog(`   ${line}`);
            }
          }
          addFlashLog('─────────────────────────────────────────────');
        }
        if (data.stdout && data.stdout.trim()) {
          addFlashLog('');
          addFlashLog(`   Stdout: ${data.stdout}`);
        }
        addFlashLog('');
        addFlashLog('Build aborted. Fix errors above before flashing.');
      }
    } catch (err: unknown) {
      const error = err as Error;
      setBuildStatus('failed');
      setBinaryBase64(null);
      addFlashLog('');
      addFlashLog('❌ BUILD FAILED: VEGA Compiler Helper is not running. Please install or start VEGA Lab Compiler.');
      addFlashLog(`   Details: ${error.message || 'Connection to http://127.0.0.1:4000 failed'}`);
    }
  };

  const flashError = (title: string, details: string[], hints: string[]) => {
    addFlashLog(`❌ ERROR: ${title}`);
    addFlashLog('');
    details.forEach(d => addFlashLog(`   ${d}`));
    if (hints.length > 0) {
      addFlashLog('');
      addFlashLog('   ── Troubleshooting ──────────────────────────');
      hints.forEach((h, i) => addFlashLog(`   ${i + 1}. ${h}`));
      addFlashLog('   ─────────────────────────────────────────────');
    }
    addFlashLog('');
  };

  // --------------------------------------------------------------------------
  // FLASH HANDLER (ESP32-S3 WI-FI OTA)
  // --------------------------------------------------------------------------
  const handleFlash = async () => {
    if (!binaryBase64 || firmwareSize === 0) {
      setActivePanel('build');
      setBuildLog([]);
      addFlashLog('❌ ERROR: No compiled firmware available');
      addFlashLog('   Cannot flash — please compile your code first.');
      addFlashLog('');
      addFlashLog('   To fix:');
      addFlashLog('   1. Click BUILD to compile your code first');
      addFlashLog('   2. Verify that build completes with "BUILD SUCCESSFUL"');
      addFlashLog('   3. Then click FLASH to transfer the firmware to ESP32-S3');
      return;
    }

    let targetAddress = discoveredDevice?.address || (discoveredDevice?.ip ? `http://${discoveredDevice.ip}` : '');
    if (!targetAddress && manualEsp32Ip.trim()) {
      const trimmed = manualEsp32Ip.trim();
      targetAddress = trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : `http://${trimmed}`;
    }

    // If not currently discovered, attempt quick discovery before failing
    if (!targetAddress) {
      addFlashLog('▶ Scanning for VEGA ESP32 on local network...');
      const quickDisc = await discoverEsp32(manualEsp32Ip);
      if (quickDisc.discovered && quickDisc.ip) {
        setDiscoveredDevice(quickDisc);
        setDiscoveryStatus('connected');
        setManualEsp32Ip(quickDisc.ip);
        try {
          localStorage.setItem('vega_ide_esp32_ip', quickDisc.ip);
        } catch {}
        targetAddress = quickDisc.address || `http://${quickDisc.ip}`;
      } else {
        setActivePanel('flash');
        setFlashStatus('failed');
        flashError(
          'ESP32 Gateway Not Found',
          [
            'No active VEGA ESP32 gateway was discovered on your local Wi-Fi / LAN.',
            'Ensure the ESP32 is powered on and connected to the same Wi-Fi network as your laptop.',
          ],
          [
            'Check that WIFI_SSID and WIFI_PASSWORD in ESP32 firmware match your current Wi-Fi network',
            'Verify ESP32 booted and acquired a DHCP IP (check Serial Monitor on USB)',
            'Click the 🔄 refresh icon in the top toolbar to retry discovery',
          ]
        );
        return;
      }
    }

    setFlashStatus('connecting');
    setFlashProgress(0);
    setActivePanel('flash');
    setBuildLog([]);

    addFlashLog('▶ Starting Firmware Flash sequence...');
    addFlashLog(`  Target:       VEGA ARIES v2 (THEJAS32 RISC-V)`);
    addFlashLog(`  ESP32 Gateway: ${targetAddress} (${discoveredDevice?.ip || 'DHCP IP'})`);
    addFlashLog(`  Firmware:     VEGA_ARIES_v2_TEST.bin (${(firmwareSize / 1024).toFixed(2)} KB)`);
    addFlashLog(`  Checksum:     ${buildChecksum}`);
    addFlashLog('');

    addFlashLog('── Step 1/2: Checking ESP32-S3 Status ─────────');
    const statusResult = await checkEsp32Status(targetAddress);

    if (!statusResult.success) {
      flashError(
        'ESP32 Gateway Unreachable',
        [
          `Could not connect to ESP32-S3 at ${targetAddress}/status`,
          statusResult.error ? `Details: ${statusResult.error}` : 'Connection timed out or network error.',
        ],
        [
          `Verify ESP32 is powered on and connected to the same Wi-Fi network`,
          `Check if DHCP assigned a new IP to ESP32 (click 🔄 to rediscover)`,
          `Test in browser: open ${targetAddress}/status directly`,
        ]
      );
      setFlashStatus('failed');
      // Trigger rediscovery in case IP changed
      runDiscovery();
      return;
    }

    addFlashLog(`  ✓ ESP32-S3 is ONLINE (RSSI: ${statusResult.data?.rssi ?? 'N/A'} dBm)`);

    if (typeof statusResult.data?.littlefs_free === 'number') {
      const freeBytes = statusResult.data.littlefs_free;
      const freeKb = (freeBytes / 1024).toFixed(0);
      const totalKb = ((statusResult.data.littlefs_total || 0) / 1024).toFixed(0);
      addFlashLog(`  ✓ LittleFS: ${freeKb} KB free / ${totalKb} KB total`);

      if (freeBytes < firmwareSize) {
        flashError(
          'Insufficient ESP32 Storage',
          [
            `LittleFS free space (${freeKb} KB) is smaller than firmware size (${(firmwareSize / 1024).toFixed(2)} KB).`,
          ],
          [
            'Restart or reflash ESP32-S3 with default partition scheme (1.5MB LittleFS)',
          ]
        );
        return;
      }
    }

    addFlashLog('');
    addFlashLog('── Step 2/2: Uploading VEGA_ARIES_v2_TEST.bin to ESP32-S3 ──');
    setFlashStatus('flashing');

    const uploadResult = await uploadFirmwareToEsp32({
      esp32Address: targetAddress,
      binaryBase64: binaryBase64,
      filename: 'VEGA_ARIES_v2_TEST.bin',
      expectedSize: firmwareSize,
      expectedChecksum: buildChecksum,
      onProgress: (percent, loaded, total) => {
        setFlashProgress(percent);
        if (percent % 25 === 0 && percent > 0 && percent < 100) {
          addFlashLog(`  [${percent}%] Streamed ${loaded} / ${total} bytes...`);
        }
      },
      onLog: (msg, type) => {
        if (type === 'error') {
          addFlashLog(`  ❌ ${msg}`);
        }
      },
    });

    if (uploadResult.success) {
      setFlashProgress(100);
      setFlashStatus('success');

      addFlashLog('');
      addFlashLog('✅ FIRMWARE TRANSFER SUCCESSFUL');
      addFlashLog('');
      addFlashLog(`  Destination:   ESP32-S3 LittleFS (/VEGA_ARIES_v2_TEST.bin)`);
      addFlashLog(`  Transferred:   ${uploadResult.size} bytes`);
      addFlashLog(`  Checksum:      ${uploadResult.checksum}`);
      if (uploadResult.timeTakenMs) {
        addFlashLog(`  Time Taken:    ${uploadResult.timeTakenMs} ms`);
      }
      addFlashLog('');
      addFlashLog('✓ Firmware transferred and verified on ESP32-S3');
    } else {
      flashError(
        'Firmware Transfer Failed',
        [
          uploadResult.message || 'Failed to upload firmware binary to ESP32-S3.',
          uploadResult.error ? `Details: ${uploadResult.error}` : '',
        ].filter(Boolean),
        [
          'Check Wi-Fi stability and signal strength',
          'Ensure ESP32-S3 has not rebooted or changed IP',
          'Try clicking FLASH again',
        ]
      );
    }
  };

  // --------------------------------------------------------------------------
  // DIRECT USB FLASHING (WEB SERIAL + XMODEM-CRC TO VEGA ARIES v2)
  // --------------------------------------------------------------------------
  const handleConnectUsb = async () => {
    if (!isWebSerialSupported()) {
      alert('Direct USB flashing requires Chrome, Edge, or an Opera browser with Web Serial API support.');
      return;
    }
    try {
      if (!webSerialRef.current) {
        webSerialRef.current = new WebSerialConnection();
      }
      await webSerialRef.current.requestAndOpen(115200);
      setUsbConnected(true);
      addFlashLog('✓ VEGA USB Serial port connected at 115200 baud.');
    } catch (err: unknown) {
      const error = err as Error;
      if (error.name !== 'NotFoundError') {
        addFlashLog(`❌ USB Connection Error: ${error.message}`);
      }
    }
  };

  const handleUsbFlash = async () => {
    if (!binaryBase64 || firmwareSize === 0) {
      setActivePanel('build');
      setBuildLog([]);
      addFlashLog('❌ ERROR: No compiled firmware available');
      addFlashLog('   Cannot flash — please compile your code first.');
      addFlashLog('');
      addFlashLog('   To fix:');
      addFlashLog('   1. Click BUILD to compile your code first');
      addFlashLog('   2. Verify that build completes with "BUILD SUCCESSFUL"');
      addFlashLog('   3. Then click FLASH to flash VEGA directly via USB');
      return;
    }

    if (!isWebSerialSupported()) {
      alert('Direct USB flashing requires Chrome, Edge, or an Opera browser with Web Serial API support.');
      return;
    }

    setFlashStatus('connecting');
    setFlashProgress(0);
    setActivePanel('flash');
    setBuildLog([]);

    try {
      if (!webSerialRef.current) {
        webSerialRef.current = new WebSerialConnection();
      }

      if (!webSerialRef.current.connected) {
        addFlashLog('Opening VEGA Serial Port at 115200 baud...');
        await webSerialRef.current.requestAndOpen(115200);
        setUsbConnected(true);
      }

      setFlashStatus('flashing');
      const flasher = new VegaUsbFlasher(webSerialRef.current);

      await flasher.flashBinary(binaryBase64, {
        onLog: (msg) => {
          addFlashLog(msg);
        },
        onStageChange: (stage) => {
          // stage update if needed
        },
        onProgress: (p) => {
          setFlashProgress(p.percent);
        },
      });

      setFlashProgress(100);
      setFlashStatus('success');
    } catch (err: unknown) {
      const error = err as Error;
      setFlashStatus('failed');
      flashError(
        'Direct USB Flash Failed',
        [
          error.message || 'An error occurred during USB XMODEM flashing.',
        ],
        [
          'Ensure the VEGA board is connected to your PC with the Type-B USB cable',
          'Ensure J12 (BOOT-SEL) is SHORTED for permanent SPI Flash programming',
          'Press the physical RESET button on the VEGA board and retry flashing',
          'Check that no other application (e.g. Serial Monitor) is holding the COM port',
        ]
      );
    }
  };

  const handleSerialConnect = () => {
    if (serialConnected) {
      setSerialConnected(false);
      setSerialLogs(prev => [...prev, { time: getTime(), text: 'Disconnected', type: 'warning' }]);
      return;
    }
    setSerialConnected(true);
    setActivePanel('serial');
    setSerialLogs([
      { time: getTime(), text: 'Connected at 115200 baud', type: 'info' },
    ]);

    const messages = [
      'VEGA SYSTEM STARTED',
      'UART initialized',
      'GPIO configured',
      'LED Blink program running',
      'LED ON',
      'LED OFF',
      'LED ON',
      'LED OFF',
    ];
    messages.forEach((msg, i) => {
      setTimeout(() => {
        setSerialLogs(prev => [...prev, { time: getTime(), text: msg, type: i < 4 ? 'info' : 'data' }]);
      }, (i + 1) * 800);
    });
  };

  const handleFileChange = (value: string | undefined) => {
    if (value !== undefined) {
      setFiles(prev => {
        const updated = {
          ...prev,
          [activeFile]: { ...prev[activeFile], content: value }
        };
        saveProjectState(updated, activeFile);
        return updated;
      });
    }
  };

  return (
    <div className="ide-page">
      {/* Toolbar */}
      <div className="ide-toolbar">
        <div className="toolbar-left">
          <span className="toolbar-title">◆ VEGA Studio</span>
          <span className="toolbar-project">LED_Blink</span>
        </div>
        <div className="toolbar-actions">
          {/* Flash Target Toggle: Wi-Fi / OTA (Default) vs USB Direct */}
          <div className="flash-target-toggle" role="group" aria-label="Flash Target">
            <button
              type="button"
              className={`target-btn ${flashTarget === 'ota' ? 'active' : ''}`}
              onClick={() => setFlashTarget('ota')}
              title="Wireless Flashing via ESP32 Gateway"
            >
              <Wifi size={12} />
              <span>Wi-Fi / OTA</span>
            </button>
            <button
              type="button"
              className={`target-btn ${flashTarget === 'usb' ? 'active' : ''}`}
              onClick={() => setFlashTarget('usb')}
              title="Direct USB Flashing via Type-B Cable (Web Serial)"
            >
              <Usb size={12} />
              <span>USB Direct</span>
            </button>
          </div>

          {/* If OTA is selected, show ESP32 Discovery status pill (Automatic UX with optional fallback) */}
          {flashTarget === 'ota' && (
            <div
              className={`esp32-status-pill ${discoveryStatus}`}
              title={
                discoveryStatus === 'connected'
                  ? `ESP32-S3 Online (${discoveredDevice?.ip || manualEsp32Ip}) • Mode: ${discoveredDevice?.source?.toUpperCase() || 'AUTO'}`
                  : discoveryStatus === 'searching'
                  ? 'Searching for ESP32 on network via mDNS and local gateway...'
                  : 'ESP32 not found. Click 🔄 to retry auto-discovery or ⚙️ for manual IP override.'
              }
            >
              <span className="ip-label">📡 ESP32:</span>
              {discoveryStatus === 'searching' && !showManualIpInput && (
                <span className="esp32-state-text searching">Searching...</span>
              )}
              {discoveryStatus === 'connected' && !showManualIpInput && (
                <span className="esp32-state-text connected">
                  <span className="live-dot" />
                  {discoveredDevice?.ip || 'Connected'}
                </span>
              )}
              {discoveryStatus === 'not_found' && !showManualIpInput && (
                <span className="esp32-state-text not-found">Not Found</span>
              )}

              {/* Optional Manual IP Override / Fallback Input (Toggleable via ⚙️) */}
              {showManualIpInput && (
                <>
                  <input
                    type="text"
                    className="esp32-ip-input"
                    value={manualEsp32Ip}
                    onChange={(e) => setManualEsp32Ip(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleConnectEsp32Ip();
                    }}
                    placeholder="e.g. 10.240.46.148"
                    title="Enter ESP32 IP address and press Enter"
                    autoFocus
                  />
                  <button
                    type="button"
                    className="esp32-connect-btn"
                    onClick={() => handleConnectEsp32Ip()}
                    disabled={isConnectingIp}
                    title="Connect to entered IP"
                  >
                    <span className="esp32-state-text connect-action">
                      {isConnectingIp ? 'Connecting...' : 'Connect'}
                    </span>
                  </button>
                </>
              )}

              <button
                type="button"
                className={`esp32-rescan-btn ${discoveryStatus === 'searching' ? 'spinning' : ''}`}
                onClick={() => runDiscovery(true)}
                title="Auto-scan network for ESP32"
              >
                <RotateCw size={11} />
              </button>
              <button
                type="button"
                className={`esp32-gear-btn ${showManualIpInput ? 'active' : ''}`}
                onClick={() => setShowManualIpInput(!showManualIpInput)}
                title={showManualIpInput ? 'Hide manual IP settings' : 'Configure / Manual IP fallback'}
              >
                <Settings size={11} />
              </button>
            </div>
          )}

          {/* If USB Direct is selected, show USB Serial status pill & J12 reminder */}
          {flashTarget === 'usb' && (
            <>
              <div
                className={`usb-status-pill ${usbConnected ? 'connected' : 'disconnected'}`}
                title={usbConnected ? 'VEGA USB Serial Port Connected (115200 baud)' : 'Click to select / connect VEGA USB Serial port'}
                onClick={!usbConnected ? handleConnectUsb : undefined}
              >
                <Usb size={12} />
                <span className="usb-label">USB:</span>
                <span className={`usb-state-text ${usbConnected ? 'connected' : 'disconnected'}`}>
                  {usbConnected ? (
                    <>
                      <span className="live-dot" />
                      Connected
                    </>
                  ) : (
                    'Connect'
                  )}
                </span>
              </div>
              <div className="j12-notice" title="Hardware Requirement: Ensure J12 (BOOT-SEL) jumper is SHORTED for permanent SPI Flash programming.">
                <span className="j12-badge">J12: SHORTED</span>
              </div>
            </>
          )}

          <button className="toolbar-btn" onClick={handleBuild} disabled={buildStatus === 'building'}>
            {buildStatus === 'building' ? '⏳ Building...' : '🔨 Build'}
          </button>
          <button
            className={`toolbar-btn ${flashStatus === 'flashing' ? 'active' : ''}`}
            onClick={flashTarget === 'usb' ? handleUsbFlash : handleFlash}
            disabled={flashStatus === 'flashing'}
          >
            {flashTarget === 'usb' ? '⚡ Flash USB' : '📶 Flash OTA'}
          </button>
          <button className={`toolbar-btn ${serialConnected ? 'active' : ''}`} onClick={handleSerialConnect}>
            {serialConnected ? '🟢 Serial' : '⚪ Serial'}
          </button>
          <div className="simulation-toggle">
            <span className={`status-dot ${isSimulation ? 'disconnected' : 'connected'}`} />
            <span>{isSimulation ? 'SIMULATION' : 'CONNECTED'}</span>
            <button
              className="toggle-btn"
              onClick={() => setIsSimulation(!isSimulation)}
              title="Toggle simulation mode"
            >
              ↔
            </button>
          </div>
        </div>
      </div>

      <div className="ide-main">
        {/* File Explorer */}
        <div className="file-explorer">
          <div className="fe-header-row">
            <span className="fe-header-title">📁 Explorer</span>
            <button
              className="fe-plus-btn"
              onClick={startCreatingFile}
              title="Create new file (+)"
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="fe-project">
            <div className="fe-folder-row">
              <span className="fe-folder">▼ LED_Blink</span>
            </div>

            {/* List of files in project */}
            {Object.keys(files).map(name => (
              <div
                key={name}
                className={`fe-file-item-wrap ${activeFile === name ? 'active' : ''}`}
              >
                {renamingFile === name ? (
                  <div className="fe-inline-input-row">
                    <input
                      ref={renameInputRef}
                      type="text"
                      className="fe-rename-input"
                      value={renameInput}
                      onChange={(e) => setRenameInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitRename();
                        if (e.key === 'Escape') cancelRename();
                      }}
                      onBlur={commitRename}
                    />
                  </div>
                ) : (
                  <div
                    className="fe-file-button"
                    onClick={() => setActiveFile(name)}
                    onDoubleClick={(e) => startRenaming(name, e)}
                  >
                    <span className="fe-icon">
                      {name.endsWith('.c') || name.endsWith('.cpp') ? '📄' : name.endsWith('.h') ? '📋' : '📝'}
                    </span>
                    <span className="fe-filename">{name}</span>
                    <div className="fe-file-actions">
                      <button
                        type="button"
                        className="fe-action-icon"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          startRenaming(name, e);
                        }}
                        title="Rename file"
                      >
                        <Edit2 size={11} />
                      </button>
                      <button
                        type="button"
                        className="fe-action-icon fe-delete"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteFile(name, e);
                        }}
                        title="Delete file"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Inline input when user clicks "+" */}
            {isCreatingFile && (
              <div className="fe-inline-new-row">
                <span className="fe-icon">📄</span>
                <input
                  ref={newFileInputRef}
                  type="text"
                  className="fe-rename-input"
                  placeholder="filename.c or .h"
                  value={newFileNameInput}
                  onChange={(e) => {
                    setNewFileNameInput(e.target.value);
                    if (fileInputError) setFileInputError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitNewFile();
                    if (e.key === 'Escape') cancelCreatingFile();
                  }}
                  onBlur={commitNewFile}
                />
              </div>
            )}

            {fileInputError && (
              <div className="fe-error-tip">{fileInputError}</div>
            )}
          </div>

          <div className="fe-board">
            <div className="fe-header-title" style={{ marginTop: '1.5rem', padding: '0.4rem 1rem' }}>🔧 Board</div>
            <div className="fe-board-info">
              <span>ARIES v2</span>
              <span className="badge badge-info" style={{ fontSize: '0.6rem' }}>THEJAS32</span>
            </div>
          </div>

          <VegaLabSetupCard compact />
        </div>

        {/* Editor Area */}
        <div className="editor-area">
          {/* File tabs with quick '+' button */}
          <div className="editor-tabs">
            {Object.keys(files).map(name => (
              <div
                key={name}
                className={`editor-tab ${activeFile === name ? 'active' : ''}`}
                onClick={() => setActiveFile(name)}
              >
                <span className="tab-name">{name}</span>
                <span
                  className="tab-close"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDeleteFile(name, e);
                  }}
                  title="Close / Delete file"
                >
                  ×
                </span>
              </div>
            ))}
            <button
              className="editor-tab-add-btn"
              onClick={startCreatingFile}
              title="New File (+)"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Monaco Editor */}
          <div className="editor-container">
            <MonacoEditor
              height="100%"
              language={files[activeFile]?.language || detectLanguage(activeFile)}
              value={files[activeFile]?.content || ''}
              onChange={handleFileChange}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                wordWrap: 'on',
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                bracketPairColorization: { enabled: true },
                padding: { top: 10 },
              }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Panel */}
      <div className="bottom-panel">
        <div className="panel-tabs">
          <button className={`panel-tab ${activePanel === 'build' ? 'active' : ''}`} onClick={() => setActivePanel('build')}>
            🔨 Build Output
            {buildStatus === 'success' && <span className="tab-badge success">✓</span>}
            {buildStatus === 'failed' && <span className="tab-badge error">✗</span>}
          </button>
          <button className={`panel-tab ${activePanel === 'serial' ? 'active' : ''}`} onClick={() => setActivePanel('serial')}>
            📡 Serial Monitor
            {serialConnected && <span className="tab-badge success">●</span>}
          </button>
          <button className={`panel-tab ${activePanel === 'flash' ? 'active' : ''}`} onClick={() => setActivePanel('flash')}>
            📶 Flash
            {flashStatus === 'success' && <span className="tab-badge success">✓</span>}
            {flashStatus === 'failed' && <span className="tab-badge error">✗</span>}
          </button>
          {buildStatus === 'success' && (
            <div className="memory-bar">
              <span>Firmware: {(firmwareSize / 1024).toFixed(0)} KB / 250 KB</span>
              <div className="progress-bar" style={{ width: '120px', height: '6px' }}>
                <div className="progress-bar-fill" style={{
                  width: `${(firmwareSize / 256000) * 100}%`,
                  background: firmwareSize > 220000 ? '#ef4444' : firmwareSize > 180000 ? '#fbbf24' : undefined
                }} />
              </div>
              <span>{Math.round((firmwareSize / 256000) * 100)}%</span>
            </div>
          )}
        </div>
        <div className="panel-content terminal" ref={terminalRef}>
          {activePanel === 'build' && buildLog.map((line, i) => (
            <div key={i} className="terminal-line">
              <span className={
                line.includes('✅') || line.includes('✓') ? 'success' :
                line.includes('❌') || line.includes('ERROR') ? 'error' :
                line.includes('Troubleshooting') || line.includes('────') ? 'warning' :
                line.includes('⚙') || line.includes('──') ? 'info' : ''
              }>
                {line}
              </span>
            </div>
          ))}
          {activePanel === 'build' && buildLog.length === 0 && (
            <div className="terminal-line"><span className="info">Ready. Click BUILD to compile.</span></div>
          )}
          {activePanel === 'serial' && serialLogs.map((log, i) => (
            <div key={i} className="terminal-line">
              <span className="timestamp">[{log.time}]</span>
              <span className={log.type}>{log.text}</span>
            </div>
          ))}
          {activePanel === 'flash' && (
            <>
              {buildLog.map((line, i) => (
                <div key={i} className="terminal-line">
                  <span className={
                    line.includes('✅') || line.includes('✓') ? 'success' :
                    line.includes('❌') || line.includes('ERROR') ? 'error' :
                    line.includes('Troubleshooting') || line.includes('────') ? 'warning' :
                    line.includes('⚙') || line.includes('──') ? 'info' : ''
                  }>
                    {line}
                  </span>
                </div>
              ))}
              {flashStatus === 'flashing' && (
                <div className="terminal-line" style={{ marginTop: '0.5rem' }}>
                  <div className="progress-bar" style={{ width: '100%', height: '8px' }}>
                    <div className="progress-bar-fill" style={{ width: `${flashProgress}%` }} />
                  </div>
                  <span className="info">Flashing progress: {flashProgress}%</span>
                </div>
              )}
              {flashStatus === 'idle' && buildLog.length === 0 && (
                <div className="terminal-line"><span className="info">Build firmware first, then click FLASH.</span></div>
              )}
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .ide-page {
          display: flex;
          flex-direction: column;
          height: calc(100vh - 60px);
          overflow: hidden;
          font-family: 'General Sans', sans-serif;
        }

        /* Toolbar */
        .ide-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 1rem;
          height: 44px;
          background: var(--color-bg-secondary);
          border-bottom: 1px solid var(--color-border);
          flex-shrink: 0;
        }
        .toolbar-left { display: flex; align-items: center; gap: 1rem; }
        .toolbar-title {
          font-weight: 800;
          font-size: 0.9rem;
          color: var(--color-accent-cyan);
        }
        .toolbar-project {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          color: var(--color-text-muted);
          padding: 0.2rem 0.6rem;
          background: var(--color-bg-input);
          border-radius: 4px;
        }
        .toolbar-actions { display: flex; align-items: center; gap: 0.5rem; }

        /* Flash Target Toggle */
        .flash-target-toggle {
          display: flex;
          align-items: center;
          background: var(--color-bg-input);
          border: 1px solid var(--color-border);
          border-radius: 6px;
          padding: 2px;
          gap: 2px;
        }
        .target-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 0.2rem 0.55rem;
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--color-text-muted);
          background: transparent;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .target-btn:hover {
          color: var(--color-text-primary);
        }
        .target-btn.active {
          background: rgba(56, 189, 248, 0.15);
          color: var(--color-accent-cyan);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        /* USB Status Pill */
        .usb-status-pill {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: var(--color-bg-input);
          border: 1px solid var(--color-border);
          border-radius: 6px;
          padding: 0.22rem 0.55rem;
          font-size: 0.76rem;
          font-family: var(--font-mono, monospace);
          cursor: pointer;
          transition: all 0.2s;
        }
        .usb-status-pill.connected {
          border-color: rgba(6, 214, 160, 0.4);
          background: rgba(6, 214, 160, 0.06);
          cursor: default;
        }
        .usb-status-pill.disconnected:hover {
          border-color: var(--color-accent-cyan);
          background: rgba(56, 189, 248, 0.08);
        }
        .usb-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--color-accent-cyan);
          white-space: nowrap;
        }
        .usb-state-text {
          font-weight: 600;
          font-size: 0.74rem;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .usb-state-text.connected {
          color: var(--color-success, #06d6a0);
        }
        .usb-state-text.disconnected {
          color: var(--color-accent-cyan, #38bdf8);
          text-decoration: underline;
        }

        /* J12 Hardware Jumper Reminder */
        .j12-notice {
          display: flex;
          align-items: center;
          background: rgba(56, 189, 248, 0.08);
          border: 1px solid rgba(56, 189, 248, 0.25);
          border-radius: 6px;
          padding: 0.2rem 0.5rem;
          font-size: 0.7rem;
          font-family: var(--font-mono, monospace);
        }
        .j12-badge {
          color: var(--color-accent-cyan, #38bdf8);
          font-weight: 700;
          letter-spacing: 0.02em;
        }

        .esp32-status-pill {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: var(--color-bg-input);
          border: 1px solid var(--color-border);
          border-radius: 6px;
          padding: 0.22rem 0.55rem;
          font-size: 0.76rem;
          font-family: var(--font-mono, monospace);
          transition: all 0.2s;
        }
        .esp32-status-pill.connected {
          border-color: rgba(6, 214, 160, 0.4);
          background: rgba(6, 214, 160, 0.06);
        }
        .esp32-status-pill.searching {
          border-color: rgba(56, 189, 248, 0.3);
          background: rgba(56, 189, 248, 0.04);
        }
        .esp32-status-pill.not_found {
          border-color: rgba(239, 68, 68, 0.25);
        }
        .ip-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--color-accent-cyan);
          white-space: nowrap;
        }
        .esp32-ip-input {
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 4px;
          color: var(--color-text-primary);
          font-family: var(--font-mono, monospace);
          font-size: 0.74rem;
          padding: 0.12rem 0.4rem;
          width: 112px;
          outline: none;
          transition: all 0.2s;
        }
        .esp32-ip-input:focus {
          border-color: var(--color-accent-cyan);
          background: rgba(255, 255, 255, 0.05);
        }
        .esp32-connect-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0.12rem 0.35rem;
          border-radius: 4px;
          display: flex;
          align-items: center;
          transition: all 0.2s;
        }
        .esp32-connect-btn:hover {
          background: rgba(255, 255, 255, 0.08);
        }
        .esp32-state-text {
          font-weight: 600;
          font-size: 0.74rem;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .esp32-state-text.connected {
          color: var(--color-success, #06d6a0);
        }
        .esp32-state-text.searching {
          color: var(--color-accent-cyan, #38bdf8);
        }
        .esp32-state-text.not-found {
          color: var(--color-text-muted, #94a3b8);
        }
        .esp32-state-text.connect-action {
          color: var(--color-accent-cyan, #38bdf8);
          text-decoration: underline;
        }
        .live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #06d6a0;
          box-shadow: 0 0 6px rgba(6, 214, 160, 0.8);
          display: inline-block;
        }
        .esp32-rescan-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          padding: 2px;
          border-radius: 3px;
          transition: all 0.2s;
        }
        .esp32-rescan-btn:hover {
          color: var(--color-accent-cyan);
          background: rgba(255, 255, 255, 0.08);
        }
        .esp32-rescan-btn.spinning svg {
          animation: esp32-spin 1s linear infinite;
        }
        .esp32-gear-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          padding: 2px;
          border-radius: 3px;
          transition: all 0.2s;
        }
        .esp32-gear-btn:hover,
        .esp32-gear-btn.active {
          color: var(--color-accent-cyan);
          background: rgba(255, 255, 255, 0.08);
        }
        @keyframes esp32-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .toolbar-btn {
          padding: 0.35rem 0.85rem;
          border-radius: 6px;
          border: 1px solid var(--color-border);
          background: var(--color-bg-card);
          color: var(--color-text-primary);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .toolbar-btn:hover { border-color: var(--color-accent-cyan); color: var(--color-accent-cyan); }
        .toolbar-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .toolbar-btn.active { border-color: var(--color-success); color: var(--color-success); }
        .simulation-toggle {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.7rem;
          font-family: var(--font-mono);
          color: var(--color-text-muted);
          padding: 0.3rem 0.6rem;
          border-radius: 4px;
          background: var(--color-bg-input);
        }
        .toggle-btn {
          background: none;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          font-size: 0.8rem;
        }
        .toggle-btn:hover { color: var(--color-accent-cyan); }

        /* Main Layout */
        .ide-main {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        /* File Explorer */
        .file-explorer {
          width: 220px;
          background: var(--color-bg-secondary);
          border-right: 1px solid var(--color-border);
          padding: 0.5rem 0;
          overflow-y: auto;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
        }
        .fe-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.4rem 0.85rem 0.4rem 1rem;
        }
        .fe-header-title {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-text-muted);
        }
        .fe-plus-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: var(--color-bg-input);
          color: var(--color-accent-cyan);
          cursor: pointer;
          transition: all 0.2s;
        }
        .fe-plus-btn:hover {
          background: rgba(6, 214, 160, 0.15);
          border-color: var(--color-accent-cyan);
          color: #ffffff;
        }
        .fe-folder-row {
          display: flex;
          align-items: center;
          padding: 0.25rem 1rem;
        }
        .fe-folder {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }
        .fe-file-item-wrap {
          display: flex;
          align-items: center;
          width: 100%;
          position: relative;
        }
        .fe-file-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.35rem 0.85rem 0.35rem 1.75rem;
          border: none;
          background: none;
          font-size: 0.8rem;
          color: var(--color-text-secondary);
          cursor: pointer;
          text-align: left;
          transition: all 0.15s;
        }
        .fe-file-button:hover {
          background: rgba(255, 255, 255, 0.04);
          color: var(--color-text-primary);
        }
        .fe-file-item-wrap.active .fe-file-button {
          background: rgba(6, 214, 160, 0.08);
          color: var(--color-accent-cyan);
          font-weight: 600;
        }
        .fe-filename {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .fe-file-actions {
          display: none;
          align-items: center;
          gap: 4px;
        }
        .fe-file-item-wrap:hover .fe-file-actions {
          display: flex;
        }
        .fe-action-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          padding: 2px;
          border-radius: 3px;
        }
        .fe-action-icon:hover {
          color: var(--color-accent-cyan);
          background: rgba(255, 255, 255, 0.08);
        }
        .fe-action-icon.fe-delete:hover {
          color: #ef4444;
        }
        .fe-inline-input-row,
        .fe-inline-new-row {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.25rem 0.75rem 0.25rem 1.75rem;
          width: 100%;
          box-sizing: border-box;
        }
        .fe-rename-input {
          width: 100%;
          padding: 0.2rem 0.4rem;
          background: var(--color-bg-input);
          border: 1px solid var(--color-accent-cyan);
          border-radius: 4px;
          color: #ffffff;
          font-family: var(--font-mono, monospace);
          font-size: 0.78rem;
          outline: none;
        }
        .fe-error-tip {
          color: #ef4444;
          font-size: 0.7rem;
          padding: 0.2rem 1rem 0.2rem 1.75rem;
        }
        .fe-icon { font-size: 0.85rem; }
        .fe-board-info {
          padding: 0.5rem 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: var(--color-text-secondary);
        }

        /* Editor Area */
        .editor-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        .editor-tabs {
          display: flex;
          align-items: center;
          background: var(--color-bg-secondary);
          border-bottom: 1px solid var(--color-border);
          overflow-x: auto;
          flex-shrink: 0;
          height: 38px;
        }
        .editor-tab {
          padding: 0 0.85rem;
          height: 100%;
          border: none;
          background: none;
          color: var(--color-text-muted);
          font-size: 0.8rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border-bottom: 2px solid transparent;
          border-right: 1px solid rgba(255, 255, 255, 0.04);
          transition: all 0.2s;
          white-space: nowrap;
        }
        .editor-tab:hover { color: var(--color-text-primary); background: rgba(255, 255, 255, 0.02); }
        .editor-tab.active {
          color: var(--color-text-primary);
          border-bottom-color: var(--color-accent-cyan);
          background: var(--color-bg-primary);
          font-weight: 600;
        }
        .tab-name {
          font-family: var(--font-mono, monospace);
          font-size: 0.78rem;
        }
        .tab-close {
          font-size: 1rem;
          opacity: 0.3;
          margin-left: 2px;
          line-height: 1;
          transition: opacity 0.2s;
        }
        .tab-close:hover { opacity: 1; color: #ef4444; }
        .editor-tab-add-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 0.6rem;
          height: 100%;
          background: none;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          transition: all 0.2s;
        }
        .editor-tab-add-btn:hover {
          color: var(--color-accent-cyan);
          background: rgba(255, 255, 255, 0.04);
        }
        .editor-container { flex: 1; overflow: hidden; }

        /* Bottom Panel */
        .bottom-panel {
          height: 200px;
          border-top: 1px solid var(--color-border);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
        }
        .panel-tabs {
          display: flex;
          align-items: center;
          background: var(--color-bg-secondary);
          border-bottom: 1px solid var(--color-border);
          padding: 0 0.5rem;
          flex-shrink: 0;
        }
        .panel-tab {
          padding: 0.4rem 0.75rem;
          border: none;
          background: none;
          color: var(--color-text-muted);
          font-size: 0.75rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          border-bottom: 2px solid transparent;
        }
        .panel-tab.active { color: var(--color-text-primary); border-bottom-color: var(--color-accent-cyan); }
        .tab-badge {
          font-size: 0.6rem;
          margin-left: 0.2rem;
        }
        .tab-badge.success { color: var(--color-success); }
        .tab-badge.error { color: var(--color-error); }
        .memory-bar {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-left: auto;
          font-size: 0.7rem;
          font-family: var(--font-mono);
          color: var(--color-text-muted);
        }
        .panel-content {
          flex: 1;
          overflow-y: auto;
          padding: 0.5rem;
        }
      `}</style>
    </div>
  );
}

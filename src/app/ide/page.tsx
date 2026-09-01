'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { checkEsp32Status, uploadFirmwareToEsp32 } from '@/lib/esp32/wifi-flasher';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

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

void delay_ms(uint32_t ms);
void delay_us(uint32_t us);

#endif
`
  },
  'README.md': {
    language: 'markdown',
    content: `# VEGA ARIES v2 - LED Blink Project

## Description
Simple LED blink program for the VEGA ARIES v2 board.

## Hardware
- VEGA ARIES v2 board
- LED on GPIO5
- 220Ω resistor

## Build & Flash
1. Click BUILD to compile
2. Click FLASH to program the board
3. Observe LED blinking at 1Hz
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

export default function IDEPage() {
  const [activeFile, setActiveFile] = useState('main.cpp');
  const [files, setFiles] = useState(defaultFiles);
  const [esp32Ip, setEsp32Ip] = useState('172.17.172.148');
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

  const handleBuild = async () => {
    setBuildStatus('building');
    setActivePanel('build');
    setBuildLog([]);
    setBinaryBase64(null);

    addFlashLog(`▶ Starting build for VEGA ARIES v2 (THEJAS32)...`);
    addFlashLog(`  Compiler: riscv32-vega-elf-g++ (VEGA GCC 10.1.0)`);
    addFlashLog(`  Architecture: RV32IM • 100MHz • ilp32`);
    addFlashLog(`  Active Source: ${activeFile}`);

    try {
      // Collect all project files into payload map
      const filesPayload: Record<string, string> = {};
      for (const [filename, fileObj] of Object.entries(files)) {
        filesPayload[filename] = fileObj.content;
      }

      const activeContent = files[activeFile]?.content || '';

      const response = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: activeContent,
          files: filesPayload,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setBinaryBase64(data.binaryBase64);
        setFirmwareSize(data.binarySize);
        setBuildChecksum(data.checksum || '');
        setBuildStatus('success');

        addFlashLog('');
        addFlashLog('✅ BUILD SUCCESSFUL');
        addFlashLog('');
        addFlashLog(`  Target:     ${data.target || 'VEGA ARIES v2 (THEJAS32)'}`);
        addFlashLog(`  Firmware:   VEGA_ARIES_v2_TEST.bin`);
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
      addFlashLog(`❌ BUILD ERROR: ${error.message || 'Network request failed'}`);
      addFlashLog('   Failed to connect to /api/compile endpoint.');
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
    addFlashLog('Flash aborted.');
    setFlashStatus('failed');
  };

  const checkESP32Connection = async (): Promise<SerialPort | null> => {
    // Check Web Serial API support
    if (!('serial' in navigator)) {
      flashError(
        'Web Serial API Not Supported',
        [
          'Your browser does not support the Web Serial API.',
          `Browser: ${navigator.userAgent.split(' ').pop()}`,
        ],
        [
          'Use Google Chrome (v89+) or Microsoft Edge (v89+)',
          'Ensure you are on HTTPS or localhost',
          'Firefox and Safari do not support Web Serial API',
          'Or switch to SIMULATION mode to test without hardware',
        ]
      );
      return null;
    }

    // Request serial port from user
    addFlashLog('▶ Requesting serial port access...');
    addFlashLog('  (Select your ESP32 device from the browser dialog)');

    let port: SerialPort;
    try {
      port = await (navigator as any).serial.requestPort({
        filters: [
          { usbVendorId: 0x10C4 },  // Silicon Labs CP210x
          { usbVendorId: 0x1A86 },  // CH340/CH341
          { usbVendorId: 0x0403 },  // FTDI
          { usbVendorId: 0x303A },  // Espressif ESP32
        ]
      });
    } catch (err: unknown) {
      const error = err as Error;
      if (error.name === 'NotFoundError' || error.message?.includes('No port selected')) {
        flashError(
          'No Device Selected',
          [
            'No serial device was selected in the browser dialog.',
            'You must select the ESP32 serial port to proceed.',
          ],
          [
            'Click FLASH again and select the correct COM port',
            'Ensure ESP32 is connected via USB cable',
            'Check Device Manager for available COM ports',
            'Try a different USB port or cable',
            'Install CP210x / CH340 USB driver if port not visible',
          ]
        );
      } else if (error.name === 'SecurityError') {
        flashError(
          'Serial Access Denied',
          [
            'Browser denied access to the serial port.',
            `Reason: ${error.message}`,
          ],
          [
            'Allow serial port access when prompted by the browser',
            'Check browser site permissions for serial devices',
            'Ensure no other application is using the COM port',
          ]
        );
      } else {
        flashError(
          'Connection Failed',
          [
            'Failed to access serial port.',
            `Error: ${error.message || 'Unknown error'}`,
          ],
          [
            'Check USB cable connection',
            'Restart the ESP32 and try again',
            'Close any other serial monitor applications',
          ]
        );
      }
      return null;
    }

    // Attempt to open the port
    addFlashLog('✓ Serial port selected');
    addFlashLog('  Attempting to open connection...');

    try {
      await port.open({ baudRate: 115200 });
    } catch (err: unknown) {
      const error = err as Error;
      if (error.message?.includes('already open') || error.name === 'InvalidStateError') {
        // Port already open — that's OK
        addFlashLog('  ℹ Port already open, reusing connection');
      } else {
        flashError(
          'Failed to Open Serial Port',
          [
            'Could not open the selected serial port.',
            `Port: ${(port.getInfo().usbVendorId ?? 'Unknown').toString()}`,
            `Error: ${error.message}`,
          ],
          [
            'Close other applications using this COM port (Arduino IDE, PuTTY, etc.)',
            'Disconnect and reconnect the USB cable',
            'Check that the correct driver is installed',
            'Try restarting your computer if the port is stuck',
            `Port info: VID=${port.getInfo().usbVendorId}, PID=${port.getInfo().usbProductId}`,
          ]
        );
        return null;
      }
    }

    // Probe the ESP32 — send a ping and wait for response
    addFlashLog('  Probing ESP32 gateway...');

    try {
      const writer = port.writable?.getWriter();
      const reader = port.readable?.getReader();

      if (!writer || !reader) {
        throw new Error('Port streams not available');
      }

      // Send identification request
      const encoder = new TextEncoder();
      await writer.write(encoder.encode('AT\r\n'));
      writer.releaseLock();

      // Wait for response with 3-second timeout
      const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000));
      const readResult = reader.read().then(result => result);
      const result = await Promise.race([readResult, timeout]);
      reader.releaseLock();

      if (result === null) {
        // Close port before erroring
        await port.close().catch(() => {});
        flashError(
          'ESP32 Not Responding',
          [
            'The ESP32 gateway did not respond within 3 seconds.',
            'Device is connected but not communicating.',
          ],
          [
            'Ensure ESP32 is running the VEGA OTA gateway firmware',
            'Press the RESET button on the ESP32',
            'Check that the baud rate is 115200',
            'Verify the ESP32 firmware is properly flashed',
            'Check serial wiring between ESP32 and VEGA ARIES v2',
          ]
        );
        return null;
      }

      addFlashLog('✓ ESP32 Gateway responding');
      return port;

    } catch (err: unknown) {
      const error = err as Error;
      try { await port.close(); } catch { /* ignore */ }
      flashError(
        'ESP32 Communication Error',
        [
          'An error occurred while communicating with the ESP32.',
          `Error: ${error.message}`,
        ],
        [
          'Reset the ESP32 and try again',
          'Check USB cable quality and connection',
          'Ensure no other application is reading the port',
          'Try a different baud rate if using custom firmware',
        ]
      );
      return null;
    }
  };

  const handleFlash = async () => {
    if (buildStatus !== 'success' || !binaryBase64) {
      setActivePanel('build');
      addFlashLog('');
      addFlashLog('❌ ERROR: No compiled firmware available');
      addFlashLog('   Cannot flash — please compile your code first.');
      addFlashLog('');
      addFlashLog('   ── Required Steps ────────────────────────────');
      addFlashLog('   1. Click BUILD to compile your code first');
      addFlashLog('   2. Wait for "BUILD SUCCESSFUL" message');
      addFlashLog('   3. Then click FLASH to transfer to ESP32-S3');
      addFlashLog('   ─────────────────────────────────────────────');
      return;
    }

    setActivePanel('flash');
    setFlashProgress(0);
    setFlashStatus('connecting');
    setBuildLog(prev => [...prev, '', `[${getTime()}] ▶ Starting ESP32-S3 Wi-Fi firmware transfer...`]);

    const targetIp = esp32Ip.trim();
    addFlashLog(`  Target Gateway: http://${targetIp}`);
    addFlashLog(`  Firmware Size:  ${firmwareSize} bytes (${(firmwareSize / 1024).toFixed(2)} KB)`);
    addFlashLog(`  Expected SHA:   ${buildChecksum}`);
    addFlashLog('');

    // Step 1: Check ESP32-S3 Status & Reachability
    addFlashLog('── Step 1/2: Checking ESP32-S3 Gateway Status ──');
    addFlashLog(`  Pinging http://${targetIp}/status...`);

    const statusCheck = await checkEsp32Status(targetIp, 4000);
    if (!statusCheck.success || !statusCheck.data) {
      flashError(
        'ESP32-S3 Gateway Unreachable',
        [
          `Could not connect to ESP32-S3 at http://${targetIp}`,
          `Error: ${statusCheck.error || 'Connection timed out'}`,
        ],
        [
          'Ensure ESP32-S3 is powered ON and running esp32_s3_receiver firmware',
          'Check that your computer and ESP32-S3 are on the same Wi-Fi network',
          `Verify IP address: current target is ${targetIp}`,
          'Check the ESP32 Serial Monitor (115200 baud) for the current IP address',
          'If IP changed via DHCP, update the IP field in the IDE toolbar',
        ]
      );
      return;
    }

    const espData = statusCheck.data;
    addFlashLog(`✓ ESP32-S3 Gateway Online (${espData.chip || 'ESP32-S3'}, Mode: ${espData.mode || 'STA'})`);
    if (espData.rssi !== undefined) {
      addFlashLog(`  Wi-Fi Signal: ${espData.rssi} dBm`);
    }
    if (espData.littlefs_free !== undefined) {
      const freeBytes = espData.littlefs_free;
      const freeKb = Math.round(freeBytes / 1024);
      addFlashLog(`  LittleFS Storage: ${freeKb} KB free`);

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

    // Step 2: Upload Firmware via Wi-Fi with Progress Tracking
    addFlashLog('');
    addFlashLog('── Step 2/2: Uploading VEGA_ARIES_v2_TEST.bin to ESP32-S3 ──');
    setFlashStatus('flashing');

    const uploadResult = await uploadFirmwareToEsp32({
      esp32Address: targetIp,
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

    // Simulate serial output
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
      setFiles(prev => ({
        ...prev,
        [activeFile]: { ...prev[activeFile], content: value }
      }));
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
          <div className="esp32-ip-container" title="ESP32-S3 Wi-Fi Gateway IP Address">
            <span className="ip-label">📡 ESP32:</span>
            <input
              type="text"
              className="esp32-ip-input"
              value={esp32Ip}
              onChange={(e) => setEsp32Ip(e.target.value)}
              placeholder="172.17.172.148"
            />
          </div>
          <button className="toolbar-btn" onClick={handleBuild} disabled={buildStatus === 'building'}>
            {buildStatus === 'building' ? '⏳ Building...' : '🔨 Build'}
          </button>
          <button className="toolbar-btn" onClick={handleFlash} disabled={flashStatus === 'flashing'}>
            📶 Flash
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
          <div className="fe-header">📁 Explorer</div>
          <div className="fe-project">
            <span className="fe-folder">▼ LED_Blink</span>
            {Object.keys(files).map(name => (
              <button
                key={name}
                className={`fe-file ${activeFile === name ? 'active' : ''}`}
                onClick={() => setActiveFile(name)}
              >
                <span className="fe-icon">{name.endsWith('.c') ? '📄' : name.endsWith('.h') ? '📋' : '📝'}</span>
                {name}
              </button>
            ))}
          </div>
          <div className="fe-board">
            <div className="fe-header" style={{ marginTop: '1.5rem' }}>🔧 Board</div>
            <div className="fe-board-info">
              <span>ARIES v2</span>
              <span className="badge badge-info" style={{ fontSize: '0.6rem' }}>THEJAS32</span>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="editor-area">
          {/* File tabs */}
          <div className="editor-tabs">
            {Object.keys(files).map(name => (
              <button
                key={name}
                className={`editor-tab ${activeFile === name ? 'active' : ''}`}
                onClick={() => setActiveFile(name)}
              >
                {name}
                <span className="tab-close" onClick={(e) => { e.stopPropagation(); }}>×</span>
              </button>
            ))}
          </div>

          {/* Monaco Editor */}
          <div className="editor-container">
            <MonacoEditor
              height="100%"
              language={files[activeFile]?.language || 'c'}
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
              <span className="timestamp">[{log.time}]</span>{' '}
              <span className={log.type}>{log.text}</span>
            </div>
          ))}
          {activePanel === 'serial' && !serialConnected && serialLogs.length === 0 && (
            <div className="terminal-line"><span className="info">Click Serial to connect.</span></div>
          )}
          {activePanel === 'flash' && (
            <>
              {flashStatus !== 'idle' && (
                <div className="flash-progress-section">
                  <div className="flash-status" style={flashStatus === 'failed' ? { color: '#ef4444' } : undefined}>
                    <span style={flashStatus === 'failed' ? { color: '#ef4444' } : flashStatus === 'success' ? { color: 'var(--color-success)' } : undefined}>
                      Status: {flashStatus.toUpperCase()}
                    </span>
                    {isSimulation && <span className="badge badge-medium">SIMULATION</span>}
                    {!isSimulation && <span className="badge badge-hard" style={{ fontSize: '0.6rem' }}>REAL DEVICE</span>}
                  </div>
                  {(flashStatus === 'flashing' || flashStatus === 'verifying') && (
                    <div className="flash-bar">
                      <div className="progress-bar" style={{ flex: 1 }}>
                        <div className="progress-bar-fill" style={{ width: `${flashProgress}%` }} />
                      </div>
                      <span>{flashProgress}%</span>
                    </div>
                  )}
                  {flashStatus === 'failed' && (
                    <div className="flash-error-box">
                      <span>⚠ Flash failed — check the Build Output tab for detailed error info and troubleshooting steps.</span>
                    </div>
                  )}
                  {flashStatus === 'success' && (
                    <div className="flash-success-box">
                      <span>✓ Firmware flashed and verified successfully.</span>
                    </div>
                  )}
                </div>
              )}
              {flashStatus === 'idle' && (
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
        .esp32-ip-container {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background: var(--color-bg-input);
          border: 1px solid var(--color-border);
          border-radius: 6px;
          padding: 0.15rem 0.45rem;
        }
        .ip-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--color-accent-cyan);
          white-space: nowrap;
        }
        .esp32-ip-input {
          background: transparent;
          border: none;
          outline: none;
          color: var(--color-text-primary);
          font-family: var(--font-mono);
          font-size: 0.76rem;
          width: 110px;
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

        /* Main */
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
          padding: 0.75rem 0;
          overflow-y: auto;
          flex-shrink: 0;
        }
        .fe-header {
          padding: 0.4rem 1rem;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-text-muted);
        }
        .fe-folder {
          padding: 0.4rem 1rem;
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }
        .fe-file {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.35rem 1rem 0.35rem 2rem;
          border: none;
          background: none;
          font-size: 0.8rem;
          color: var(--color-text-secondary);
          cursor: pointer;
          text-align: left;
          transition: all 0.15s;
        }
        .fe-file:hover { background: rgba(255,255,255,0.03); color: var(--color-text-primary); }
        .fe-file.active {
          background: rgba(6, 214, 160, 0.08);
          color: var(--color-accent-cyan);
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

        /* Editor */
        .editor-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        .editor-tabs {
          display: flex;
          background: var(--color-bg-secondary);
          border-bottom: 1px solid var(--color-border);
          overflow-x: auto;
          flex-shrink: 0;
        }
        .editor-tab {
          padding: 0.5rem 1rem;
          border: none;
          background: none;
          color: var(--color-text-muted);
          font-size: 0.8rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .editor-tab:hover { color: var(--color-text-primary); }
        .editor-tab.active {
          color: var(--color-text-primary);
          border-bottom-color: var(--color-accent-cyan);
          background: var(--color-bg-primary);
        }
        .tab-close {
          font-size: 1rem;
          opacity: 0.3;
          transition: opacity 0.2s;
        }
        .tab-close:hover { opacity: 1; }
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

        /* Flash progress */
        .flash-progress-section { padding: 0.5rem; }
        .flash-status {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--color-accent-cyan);
          margin-bottom: 0.5rem;
        }
        .flash-bar {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          font-family: var(--font-mono);
          color: var(--color-text-muted);
        }
        .flash-error-box {
          margin-top: 0.75rem;
          padding: 0.75rem 1rem;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.25);
          border-radius: 6px;
          color: #ef4444;
          font-size: 0.8rem;
          font-weight: 500;
        }
        .flash-success-box {
          margin-top: 0.75rem;
          padding: 0.75rem 1rem;
          background: rgba(6, 214, 160, 0.08);
          border: 1px solid rgba(6, 214, 160, 0.25);
          border-radius: 6px;
          color: var(--color-success);
          font-size: 0.8rem;
          font-weight: 500;
        }

        @media (max-width: 900px) {
          .file-explorer { width: 180px; }
        }
        @media (max-width: 600px) {
          .file-explorer { display: none; }
          .simulation-toggle { display: none; }
        }
      `}</style>
    </div>
  );
}

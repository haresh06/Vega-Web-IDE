/**
 * VEGA ARIES v2.0 Direct USB Flasher
 * Single-Stage Permanent SPI Flash Programming (Matches Official C-DAC vega-flasher / send.py):
 *
 * J12 (BOOT-SEL): SHORTED
 * RESET -> Wait for '<' -> Send '>' -> Wait for 'C' -> Send application.bin directly via XMODEM-CRC -> EOT -> ACK -> Send '\n'
 */

import { WebSerialConnection } from './web-serial';
import { XmodemCrcSender, XmodemProgress } from './xmodem-crc';

export interface VegaFlashOptions {
  baudRate?: number;
  onProgress?: (progress: XmodemProgress) => void;
  onLog?: (message: string) => void;
  onStageChange?: (stage: string) => void;
}

/**
 * Convert Base64 string to Uint8Array buffer
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export class VegaUsbFlasher {
  private serial: WebSerialConnection;

  constructor(serial: WebSerialConnection) {
    this.serial = serial;
  }

  /**
   * Flash the compiled application binary directly over USB using the official single-stage protocol
   */
  public async flashBinary(
    appBinary: Uint8Array | string,
    options?: VegaFlashOptions
  ): Promise<boolean> {
    const { onProgress, onLog, onStageChange } = options || {};

    const appBytes = typeof appBinary === 'string' ? base64ToUint8Array(appBinary) : appBinary;
    if (appBytes.length === 0) {
      throw new Error('Application binary is empty. Please build your project first.');
    }

    // Connect USB serial port if not already open
    onStageChange?.('Connecting USB');
    if (!this.serial.connected) {
      onLog?.('Opening VEGA Serial Port at 115200 baud...');
      await this.serial.requestAndOpen(115200);
    }

    // Initial log banner matching official tool output
    onLog?.('Starting Direct USB Flash sequence...');
    onLog?.('Target: VEGA ARIES v2 (THEJAS32 RISC-V)');
    onLog?.('Transport: Direct USB (Web Serial @ 115200 baud, 8N1)');
    onLog?.('Mode: Permanent SPI Flash Programming (J12: SHORTED)');
    onLog?.(`Application binary size: ${appBytes.length} bytes`);
    onLog?.('');
    onLog?.('Please press the physical RESET button on the VEGA board.');
    onLog?.('Waiting for VEGA bootloader...');

    onStageChange?.('Programming Application');

    const xmodem = new XmodemCrcSender(this.serial);

    await xmodem.send(appBytes, {
      stageName: 'Application',
      timeoutMs: 5000,
      maxRetries: 15,
      onProgress,
      onLog,
      sendExecuteLf: true,
    });

    onLog?.('');
    onLog?.('✅ USB Direct Flash completed successfully!');
    onStageChange?.('Flash Complete');

    return true;
  }
}

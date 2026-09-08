/**
 * VEGA ARIES v2.0 Direct USB Flasher
 * Implements the official VEGA FLASHER (J12 SHORTED) hardware programming sequence.
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
 * Convert Base64 string to Uint8Array
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
   * Execute official VEGA FLASHER permanent SPI Flash programming sequence
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

    onLog?.('Starting Direct USB Flash sequence...');
    onLog?.('J12: SHORTED');

    // STAGE 0: Serial Port Connection
    onStageChange?.('Connecting USB');
    if (!this.serial.connected) {
      onLog?.('Opening VEGA Serial Port at 115200 baud...');
      await this.serial.requestAndOpen(115200);
    }

    // STAGE 1: DTR/RTS Reset Pulse
    onStageChange?.('Resetting VEGA');
    await this.serial.drain(50);
    await this.serial.resetBoard(150);

    // STAGE 2: Official VEGA Flasher Handshake & SPI Flash Transfer
    onStageChange?.('Programming SPI Flash');

    const xmodem = new XmodemCrcSender(this.serial);

    await xmodem.send(appBytes, {
      stageName: 'Programming SPI Flash',
      timeoutMs: 4000,
      maxRetries: 20,
      onProgress,
      onLog,
    });

    onLog?.('USB Direct Flash completed successfully.');
    onStageChange?.('Flash Complete');

    return true;
  }
}

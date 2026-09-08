/**
 * Official VEGA XMODEM-CRC Protocol Implementation & State Machine
 * Reconstructed from official C-DAC send.py / vega-flasher / vega-xmodem tools.
 *
 * State Machine:
 * 1. STATE 1 (WAIT_FOR_FLASHER_START):
 *    Listen for '<' (0x3C).
 *    On first '<', send '>' (0x3E) exactly once and immediately transition to STATE 2.
 * 2. STATE 2 (WAIT_FOR_XMODEM_C):
 *    Wait for 'C' (0x43). Ignore repeated '<', '>', or stray bytes.
 *    On 'C', transition to STATE 3.
 * 3. STATE 3 (XMODEM_TRANSFER):
 *    Stream 128-byte XMODEM-CRC blocks [SOH, blockNum, ~blockNum, 128-byte payload, crcHi, crcLo].
 *    On completion, send EOT -> ACK, then '\n' (0x0A) to launch the application.
 */

import { WebSerialConnection } from './web-serial';

export const XMODEM_CONTROL = {
  SOH: 0x01, // Start of Header (128-byte block)
  EOT: 0x04, // End of Transmission
  ACK: 0x06, // Acknowledge
  NAK: 0x15, // Negative Acknowledge
  CAN: 0x18, // Cancel
  CRC_POLL: 0x43, // 'C' (ASCII 67) Request for CRC mode
  PROMPT_IN: 0x3c, // '<' (ASCII 60) Bootloader prompt
  PROMPT_OUT: 0x3e, // '>' (ASCII 62) Host response
  EXECUTE_LF: 0x0a, // '\n' (ASCII 10) Execute application
  PAD: 0x1a, // Padding byte (Ctrl+Z)
} as const;

/**
 * Compute 16-bit CRC-CCITT (polynomial 0x1021, init 0x0000)
 */
export function crc16Ccitt(data: Uint8Array): number {
  let crc = 0x0000;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i] << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc & 0xffff;
}

export interface XmodemProgress {
  sentBytes: number;
  totalBytes: number;
  percent: number;
  currentBlock: number;
  totalBlocks: number;
  stageName?: string;
}

export interface XmodemOptions {
  timeoutMs?: number;
  maxRetries?: number;
  onProgress?: (progress: XmodemProgress) => void;
  onLog?: (message: string) => void;
  stageName?: string;
}

export class XmodemCrcSender {
  private serial: WebSerialConnection;

  constructor(serial: WebSerialConnection) {
    this.serial = serial;
  }

  /**
   * Official VEGA Handshake State Machine:
   * State 1: WAIT_FOR_FLASHER_START (listen for '<', send '>' once, switch to State 2)
   * State 2: WAIT_FOR_XMODEM_C (listen for 'C', ignore repeated '<', transition to State 3)
   */
  public async waitForHandshake(timeoutMs = 15000, onLog?: (msg: string) => void): Promise<boolean> {
    const startTime = Date.now();
    let state: 'WAIT_FOR_FLASHER_START' | 'WAIT_FOR_XMODEM_C' = 'WAIT_FOR_FLASHER_START';

    onLog?.("Waiting for VEGA FLASHER '<' handshake...");

    while (Date.now() - startTime < timeoutMs) {
      const byte = await this.serial.readByte(800);
      if (byte === null) continue;

      if (state === 'WAIT_FOR_FLASHER_START') {
        if (byte === XMODEM_CONTROL.PROMPT_IN) { // '<' (0x3C)
          onLog?.("Received '<' from VEGA bootloader.");
          onLog?.("Sending '>' acknowledge...");
          await this.serial.write([XMODEM_CONTROL.PROMPT_OUT]); // Send '>' exactly once
          state = 'WAIT_FOR_XMODEM_C';
          onLog?.("Waiting for XMODEM-CRC 'C'...");
          continue;
        }

        if (byte === XMODEM_CONTROL.CRC_POLL) { // 'C' (0x43)
          onLog?.("Received 'C' from VEGA bootloader.");
          return true;
        }

        if (byte === XMODEM_CONTROL.NAK) {
          onLog?.("Received NAK, proceeding with CRC mode...");
          return true;
        }
      } else if (state === 'WAIT_FOR_XMODEM_C') {
        if (byte === XMODEM_CONTROL.CRC_POLL) { // 'C' (0x43)
          onLog?.("Received 'C' from VEGA bootloader.");
          return true;
        }

        if (byte === XMODEM_CONTROL.NAK) {
          onLog?.("Received NAK, proceeding with CRC mode...");
          return true;
        }

        // Silently ignore repeated '<', '>', or other characters while waiting for 'C'
      }
    }

    return false;
  }

  /**
   * Read response byte after transmitting a block, safely filtering any leftover sync pulses
   */
  private async readPacketResponse(timeoutMs: number): Promise<number | null> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      const resp = await this.serial.readByte(Math.max(100, timeoutMs - (Date.now() - startTime)));
      if (resp === null) return null;

      if (
        resp === XMODEM_CONTROL.ACK ||
        resp === XMODEM_CONTROL.NAK ||
        resp === XMODEM_CONTROL.CAN
      ) {
        return resp;
      }

      // If stray 'C' or '<' arrives, continue waiting for ACK/NAK
      if (resp === XMODEM_CONTROL.CRC_POLL || resp === XMODEM_CONTROL.PROMPT_IN || resp === XMODEM_CONTROL.PROMPT_OUT) {
        continue;
      }
    }
    return null;
  }

  /**
   * Transfer binary payload using official VEGA XMODEM-CRC
   */
  public async send(binaryData: Uint8Array, options?: XmodemOptions): Promise<boolean> {
    const {
      timeoutMs = 4000,
      maxRetries = 15,
      onProgress,
      onLog,
      stageName = 'Uploading firmware',
    } = options || {};

    const totalBytes = binaryData.length;
    const BLOCK_SIZE = 128;
    const totalBlocks = Math.ceil(totalBytes / BLOCK_SIZE);

    // 1. Wait for handshake state machine ('<' -> '>' -> 'C')
    const ready = await this.waitForHandshake(15000, onLog);
    if (!ready) {
      throw new Error("Handshake timeout: VEGA board did not respond with '<' or 'C'. Please verify J12 is SHORTED and press physical RESET button on board.");
    }

    onLog?.("Starting XMODEM-CRC transfer...");

    // 2. Transmit each block
    let blockNumber = 1;
    let offset = 0;

    while (offset < totalBytes) {
      // Prepare 128-byte block
      const blockPayload = new Uint8Array(BLOCK_SIZE);
      const slice = binaryData.subarray(offset, Math.min(offset + BLOCK_SIZE, totalBytes));
      blockPayload.set(slice);

      // Pad remaining bytes with 0x1A
      if (slice.length < BLOCK_SIZE) {
        blockPayload.fill(XMODEM_CONTROL.PAD, slice.length);
      }

      // Compute CRC-16 CCITT
      const crc = crc16Ccitt(blockPayload);
      const crcHi = (crc >> 8) & 0xff;
      const crcLo = crc & 0xff;

      // Construct XMODEM Packet: [SOH, blockNum, ~blockNum, 128-byte data, crcHi, crcLo]
      const packet = new Uint8Array(3 + BLOCK_SIZE + 2);
      packet[0] = XMODEM_CONTROL.SOH;
      packet[1] = blockNumber & 0xff;
      packet[2] = (~blockNumber) & 0xff;
      packet.set(blockPayload, 3);
      packet[3 + BLOCK_SIZE] = crcHi;
      packet[3 + BLOCK_SIZE + 1] = crcLo;

      let retries = 0;
      let acked = false;

      while (retries < maxRetries && !acked) {
        await this.serial.write(packet);

        const resp = await this.readPacketResponse(timeoutMs);

        if (resp === XMODEM_CONTROL.ACK) {
          acked = true;
        } else if (resp === XMODEM_CONTROL.CAN) {
          throw new Error(`XMODEM transfer cancelled by device at block ${blockNumber}.`);
        } else if (resp === XMODEM_CONTROL.NAK || resp === null) {
          retries++;
          onLog?.(`Block ${blockNumber}/${totalBlocks} unacknowledged (${resp === null ? 'timeout' : 'NAK'}). Retry ${retries}/${maxRetries}...`);
          await new Promise((r) => setTimeout(r, 50));
        } else {
          retries++;
          await new Promise((r) => setTimeout(r, 50));
        }
      }

      if (!acked) {
        throw new Error(`Failed to transmit block ${blockNumber} after ${maxRetries} retries.`);
      }

      const currentBlockIndex = Math.min(Math.floor(offset / BLOCK_SIZE) + 1, totalBlocks);
      onLog?.(`Block ${currentBlockIndex}/${totalBlocks}...`);

      offset += BLOCK_SIZE;
      blockNumber = (blockNumber + 1) & 0xff;

      const currentProgressBytes = Math.min(offset, totalBytes);
      const percent = Math.min(100, Math.round((currentProgressBytes / totalBytes) * 100));

      onProgress?.({
        sentBytes: currentProgressBytes,
        totalBytes,
        percent,
        currentBlock: currentBlockIndex,
        totalBlocks,
        stageName,
      });
    }

    // 3. Send EOT (End of Transmission)
    onLog?.('EOT...');
    let eotRetries = 0;
    let eotAcked = false;

    while (eotRetries < maxRetries && !eotAcked) {
      await this.serial.write([XMODEM_CONTROL.EOT]);
      const eotResp = await this.readPacketResponse(timeoutMs);

      if (eotResp === XMODEM_CONTROL.ACK) {
        eotAcked = true;
      } else {
        eotRetries++;
        await new Promise((r) => setTimeout(r, 100));
      }
    }

    if (!eotAcked) {
      onLog?.('EOT sent.');
    } else {
      onLog?.('Final ACK received.');
    }

    // 4. Send '\n' (0x0A) as required by official VEGA flasher tools to execute program
    await this.serial.write([XMODEM_CONTROL.EXECUTE_LF]);
    await new Promise((r) => setTimeout(r, 50));

    return true;
  }
}

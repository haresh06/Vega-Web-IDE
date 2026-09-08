/**
 * Web Serial API Wrapper for Direct USB Flashing and Serial Monitor
 * Features a resilient background read-pump with auto-recovery for transient DTR/RTS reset signals.
 */

export interface SerialPortInfo {
  usbVendorId?: number;
  usbProductId?: number;
}

export interface SerialOptions {
  baudRate: number;
  dataBits?: 7 | 8;
  stopBits?: 1 | 2;
  parity?: 'none' | 'even' | 'odd';
  bufferSize?: number;
  flowControl?: 'none' | 'hardware';
}

export interface SerialSignals {
  dataTerminalReady?: boolean;
  requestToSend?: boolean;
  break?: boolean;
}

export interface SerialPort {
  open(options: SerialOptions): Promise<void>;
  close(): Promise<void>;
  readable: ReadableStream<Uint8Array> | null;
  writable: WritableStream<Uint8Array> | null;
  getInfo(): SerialPortInfo;
  setSignals(signals: SerialSignals): Promise<void>;
}

export interface NavigatorSerial {
  requestPort(options?: { filters?: Array<{ usbVendorId?: number; usbProductId?: number }> }): Promise<SerialPort>;
  getPorts(): Promise<SerialPort[]>;
}

export function isWebSerialSupported(): boolean {
  return typeof window !== 'undefined' && 'serial' in navigator;
}

export class WebSerialConnection {
  private port: SerialPort | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private isConnected = false;
  private inputBuffer: number[] = [];
  private waiters: Array<() => void> = [];
  private pumpRunning = false;

  public get connected(): boolean {
    return this.isConnected;
  }

  public get currentPort(): SerialPort | null {
    return this.port;
  }

  /**
   * Request user to pick a serial port and open connection
   */
  public async requestAndOpen(baudRate = 115200): Promise<boolean> {
    if (!isWebSerialSupported()) {
      throw new Error('Direct USB flashing requires Chrome, Edge, or an Opera browser with Web Serial API support.');
    }

    const navSerial = (navigator as unknown as { serial: NavigatorSerial }).serial;
    this.port = await navSerial.requestPort();

    await this.port.open({
      baudRate,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      flowControl: 'none',
      bufferSize: 16384,
    });

    this.isConnected = true;
    this.startReadPump();
    return true;
  }

  /**
   * Open an existing already-permitted SerialPort
   */
  public async openExistingPort(port: SerialPort, baudRate = 115200): Promise<void> {
    this.port = port;
    await this.port.open({
      baudRate,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      flowControl: 'none',
      bufferSize: 16384,
    });
    this.isConnected = true;
    this.startReadPump();
  }

  /**
   * Resilient background read-pump that streams incoming serial bytes into inputBuffer.
   * Auto-recovers from transient driver reset signals.
   */
  private async startReadPump(): Promise<void> {
    if (this.pumpRunning) return;
    this.pumpRunning = true;

    while (this.isConnected && this.port && this.port.readable) {
      try {
        this.reader = this.port.readable.getReader();
        while (this.isConnected) {
          const { value, done } = await this.reader.read();
          if (done) break;
          if (value && value.length > 0) {
            for (let i = 0; i < value.length; i++) {
              this.inputBuffer.push(value[i]);
            }
            this.notifyWaiters();
          }
        }
      } catch (err: unknown) {
        if (this.isConnected) {
          // Transient error during DTR/RTS reset line toggle — wait 20ms and re-acquire reader
          await new Promise((r) => setTimeout(r, 20));
        } else {
          break;
        }
      } finally {
        if (this.reader) {
          try {
            this.reader.releaseLock();
          } catch {
            // Ignored
          }
          this.reader = null;
        }
      }
    }

    this.pumpRunning = false;
  }

  private notifyWaiters(): void {
    const pending = this.waiters;
    this.waiters = [];
    for (const resolve of pending) {
      resolve();
    }
  }

  /**
   * Pulse DTR / RTS lines to reset the VEGA board
   */
  public async resetBoard(holdTimeMs = 150): Promise<void> {
    if (!this.port) return;
    try {
      await this.port.setSignals({ dataTerminalReady: false, requestToSend: true });
      await new Promise((r) => setTimeout(r, holdTimeMs));
      await this.port.setSignals({ dataTerminalReady: true, requestToSend: false });
      await new Promise((r) => setTimeout(r, 50));
      await this.port.setSignals({ dataTerminalReady: false, requestToSend: false });
    } catch {
      // Some serial drivers don't support signal manipulation; fallback gracefully
    }
  }

  /**
   * Write raw bytes to the serial port
   */
  public async write(data: Uint8Array | number[]): Promise<void> {
    if (!this.port || !this.port.writable) {
      throw new Error('Serial port is not writable.');
    }

    const payload = data instanceof Uint8Array ? data : new Uint8Array(data);
    const writer = this.port.writable.getWriter();
    try {
      await writer.write(payload);
    } finally {
      writer.releaseLock();
    }
  }

  /**
   * Read single byte from FIFO with timeout
   */
  public async readByte(timeoutMs = 3000): Promise<number | null> {
    const bytes = await this.readBytes(1, timeoutMs);
    return bytes.length > 0 ? bytes[0] : null;
  }

  /**
   * Read exact number of bytes from the FIFO buffer with timeout
   */
  public async readBytes(count: number, timeoutMs = 3000): Promise<Uint8Array> {
    if (!this.isConnected) {
      throw new Error('Serial port is not connected.');
    }

    const startTime = Date.now();

    while (this.inputBuffer.length < count) {
      const remainingTime = timeoutMs - (Date.now() - startTime);
      if (remainingTime <= 0) {
        break;
      }

      await new Promise<void>((resolve) => {
        let timer: ReturnType<typeof setTimeout> | undefined;

        const onDataOrTimeout = () => {
          if (timer) clearTimeout(timer);
          const idx = this.waiters.indexOf(onDataOrTimeout);
          if (idx !== -1) {
            this.waiters.splice(idx, 1);
          }
          resolve();
        };

        timer = setTimeout(onDataOrTimeout, remainingTime);
        this.waiters.push(onDataOrTimeout);
      });
    }

    const bytesToTake = Math.min(count, this.inputBuffer.length);
    if (bytesToTake === 0) {
      return new Uint8Array(0);
    }

    const result = new Uint8Array(this.inputBuffer.splice(0, bytesToTake));
    return result;
  }

  /**
   * Flush any buffered incoming bytes from FIFO
   */
  public clearBuffer(): void {
    this.inputBuffer = [];
  }

  /**
   * Drain any remaining incoming bytes on the wire
   */
  public async drain(durationMs = 100): Promise<void> {
    this.clearBuffer();
    await new Promise((r) => setTimeout(r, durationMs));
    this.clearBuffer();
  }

  /**
   * Close the port and cleanly release persistent reader resources
   */
  public async close(): Promise<void> {
    this.isConnected = false;
    this.clearBuffer();
    this.notifyWaiters();

    if (this.reader) {
      try {
        await this.reader.cancel();
      } catch {
        // Ignored
      }
      try {
        this.reader.releaseLock();
      } catch {
        // Ignored
      }
      this.reader = null;
    }

    if (this.port) {
      try {
        await this.port.close();
      } catch {
        // Ignored
      }
      this.port = null;
    }
  }
}

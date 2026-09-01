import { BoardProfile } from '@/types';

export const boardProfiles: BoardProfile[] = [
  {
    id: 'aries-v2',
    name: 'VEGA ARIES v2.0',
    processor: 'THEJAS32 (VEGA ET1031)',
    architecture: 'RISC-V (RV32IM)',
    clockSpeed: '100 MHz',
    sram: '256 KB',
    flash: '2 MB (External)',
    peripherals: [
      { name: 'GPIO', type: 'digital', count: 32, description: '32 General Purpose I/O pins (23 accessible), 3.3V logic, 12mA max per pin', moduleId: 'gpio' },
      { name: 'UART', type: 'protocol', count: 3, description: '3 UART ports for serial communication, up to 921600 baud', moduleId: 'uart-beginner' },
      { name: 'SPI', type: 'protocol', count: 3, description: '3 SPI ports for high-speed serial communication', moduleId: 'spi-protocol' },
      { name: 'I2C', type: 'protocol', count: 2, description: '2 I2C ports for two-wire serial communication (100kHz/400kHz)', moduleId: 'i2c-protocol' },
      { name: 'PWM', type: 'peripheral', count: 8, description: '8 PWM output channels for motor/LED control', moduleId: 'pwm' },
      { name: 'ADC', type: 'peripheral', count: 4, description: '4-channel 10-bit Analog to Digital Converter', moduleId: 'adc' },
      { name: 'Timer', type: 'peripheral', count: 2, description: '2 × 32-bit hardware timers with interrupt support', moduleId: 'timers' },
    ],
    pinout: [
      // Left side pins (top to bottom)
      { pin: 1, name: '3.3V', functions: ['Power'], x: 50, y: 60 },
      { pin: 2, name: 'GND', functions: ['Ground'], x: 50, y: 85 },
      { pin: 3, name: 'GPIO0', functions: ['GPIO', 'INT0'], x: 50, y: 110 },
      { pin: 4, name: 'GPIO1', functions: ['GPIO', 'INT1'], x: 50, y: 135 },
      { pin: 5, name: 'GPIO2', functions: ['GPIO', 'INT2', 'SPI0_CS'], x: 50, y: 160 },
      { pin: 6, name: 'GPIO3', functions: ['GPIO', 'INT3', 'SPI0_MOSI'], x: 50, y: 185 },
      { pin: 7, name: 'GPIO4', functions: ['GPIO', 'INT4', 'SPI0_MISO'], x: 50, y: 210 },
      { pin: 8, name: 'GPIO5', functions: ['GPIO', 'INT5', 'SPI0_SCLK'], x: 50, y: 235 },
      { pin: 9, name: 'GPIO6', functions: ['GPIO', 'INT6', 'UART1_TX'], x: 50, y: 260 },
      { pin: 10, name: 'GPIO7', functions: ['GPIO', 'INT7', 'UART1_RX'], x: 50, y: 285 },
      { pin: 11, name: 'GPIO8', functions: ['GPIO', 'INT8', 'I2C0_SDA'], x: 50, y: 310 },
      { pin: 12, name: 'GPIO9', functions: ['GPIO', 'INT9', 'I2C0_SCL'], x: 50, y: 335 },
      { pin: 13, name: 'GPIO10', functions: ['GPIO', 'INT10', 'PWM0'], x: 50, y: 360 },
      { pin: 14, name: 'GPIO11', functions: ['GPIO', 'INT11', 'PWM1'], x: 50, y: 385 },
      // Right side pins (top to bottom)
      { pin: 15, name: '5V', functions: ['Power'], x: 350, y: 60 },
      { pin: 16, name: 'GND', functions: ['Ground'], x: 350, y: 85 },
      { pin: 17, name: 'GPIO12', functions: ['GPIO', 'INT12', 'PWM2'], x: 350, y: 110 },
      { pin: 18, name: 'GPIO13', functions: ['GPIO', 'PWM3'], x: 350, y: 135 },
      { pin: 19, name: 'GPIO14', functions: ['GPIO', 'PWM4'], x: 350, y: 160 },
      { pin: 20, name: 'GPIO15', functions: ['GPIO', 'PWM5'], x: 350, y: 185 },
      { pin: 21, name: 'GPIO16', functions: ['GPIO', 'UART0_TX'], x: 350, y: 210 },
      { pin: 22, name: 'GPIO17', functions: ['GPIO', 'UART0_RX'], x: 350, y: 235 },
      { pin: 23, name: 'A0', functions: ['ADC0', 'GPIO18'], x: 350, y: 260 },
      { pin: 24, name: 'A1', functions: ['ADC1', 'GPIO19'], x: 350, y: 285 },
      { pin: 25, name: 'A2', functions: ['ADC2', 'GPIO20'], x: 350, y: 310 },
      { pin: 26, name: 'A3', functions: ['ADC3', 'GPIO21'], x: 350, y: 335 },
      { pin: 27, name: 'GPIO22', functions: ['GPIO', 'EXT_INT13'], x: 350, y: 360 },
      { pin: 28, name: 'GPIO23', functions: ['GPIO', 'EXT_INT14'], x: 350, y: 385 },
    ]
  }
];

export const troubleshootGuides = [
  {
    id: 'ts-board-not-detected',
    title: 'Board Not Detected',
    category: 'Connection',
    symptoms: ['Board not showing in serial ports', 'No COM port detected', 'USB not recognized'],
    solutions: [
      { order: 1, instruction: 'Check USB cable connection', detail: 'Ensure you are using a data-capable USB cable, not a charge-only cable. Try a different USB cable.' },
      { order: 2, instruction: 'Check USB port', detail: 'Try a different USB port on your computer. Avoid USB hubs.' },
      { order: 3, instruction: 'Install USB drivers', detail: 'Install the CH340/CP210x USB-to-Serial driver for your operating system.' },
      { order: 4, instruction: 'Check power LED', detail: 'Verify the power LED on the ARIES v2 board is lit. If not, the board may not be receiving power.' },
      { order: 5, instruction: 'Reset the board', detail: 'Press the RESET button on the board and check if the COM port appears.' },
    ]
  },
  {
    id: 'ts-uart-failed',
    title: 'UART Connection Failed',
    category: 'Communication',
    symptoms: ['No output on serial monitor', 'Garbage characters', 'Intermittent data loss'],
    solutions: [
      { order: 1, instruction: 'Verify baud rate', detail: 'Ensure serial monitor baud rate matches the firmware configuration (typically 115200).' },
      { order: 2, instruction: 'Check TX/RX wiring', detail: 'TX and RX must be crossed: Device TX → Board RX, Device RX → Board TX.' },
      { order: 3, instruction: 'Check frame format', detail: 'Verify data bits (8), parity (None), stop bits (1) — 8N1 configuration.' },
      { order: 4, instruction: 'Check voltage levels', detail: 'Ensure both devices operate at the same voltage level (3.3V for THEJAS32).' },
    ]
  },
  {
    id: 'ts-flash-failed',
    title: 'Firmware Flashing Failed',
    category: 'Programming',
    symptoms: ['XMODEM transfer failed', 'Timeout during flashing', 'Flash verification error'],
    solutions: [
      { order: 1, instruction: 'Set BOOT SEL switch', detail: 'Ensure the BOOT SEL switch is in programming mode before pressing RESET.' },
      { order: 2, instruction: 'Enter bootloader mode', detail: 'Press RESET while BOOT SEL is in programming position. You should see "CCCCC..." on serial output.' },
      { order: 3, instruction: 'Check firmware size', detail: 'Ensure firmware.bin size does not exceed 250 KB (flash capacity for application).' },
      { order: 4, instruction: 'Retry transfer', detail: 'XMODEM may timeout. Wait for "CCC" prompt and retry the transfer.' },
      { order: 5, instruction: 'Check serial connection', detail: 'Close any other programs using the same COM port.' },
    ]
  },
  {
    id: 'ts-xmodem-timeout',
    title: 'XMODEM Timeout',
    category: 'Programming',
    symptoms: ['Transfer stops midway', 'Timeout error', 'Packet retransmission fails'],
    solutions: [
      { order: 1, instruction: 'Reduce baud rate', detail: 'Try a lower baud rate (e.g., 57600) for more reliable transfer.' },
      { order: 2, instruction: 'Check cable quality', detail: 'Use a short, high-quality USB cable to reduce signal degradation.' },
      { order: 3, instruction: 'Restart bootloader', detail: 'Reset the board and re-enter bootloader mode before retrying.' },
      { order: 4, instruction: 'Smaller firmware', detail: 'If firmware is large, optimize code to reduce binary size.' },
    ]
  },
  {
    id: 'ts-firmware-large',
    title: 'Firmware Too Large',
    category: 'Build',
    symptoms: ['Build warning: firmware exceeds limit', 'Flash fails due to size', 'Out of memory'],
    solutions: [
      { order: 1, instruction: 'Enable compiler optimizations', detail: 'Use -Os (optimize for size) or -O2 compiler flags.' },
      { order: 2, instruction: 'Remove unused code', detail: 'Use -ffunction-sections -fdata-sections and --gc-sections linker flags.' },
      { order: 3, instruction: 'Reduce string usage', detail: 'Minimize printf format strings and string constants.' },
      { order: 4, instruction: 'Check memory map', detail: 'Review the linker output (.map file) to identify large sections.' },
    ]
  },
  {
    id: 'ts-checksum-mismatch',
    title: 'Checksum Mismatch',
    category: 'Programming',
    symptoms: ['Verification failed', 'Checksum error after flash', 'Corrupted firmware'],
    solutions: [
      { order: 1, instruction: 'Rebuild firmware', detail: 'Clean and rebuild the project to generate a fresh firmware.bin.' },
      { order: 2, instruction: 'Verify download', detail: 'Re-download or regenerate the firmware binary file.' },
      { order: 3, instruction: 'Check connection stability', detail: 'Ensure stable power and data connection during transfer.' },
      { order: 4, instruction: 'Retry flashing', detail: 'Re-enter bootloader mode and flash again.' },
    ]
  },
  {
    id: 'ts-esp32-disconnected',
    title: 'ESP32 Gateway Disconnected',
    category: 'OTA',
    symptoms: ['ESP32 not responding', 'WiFi connection lost', 'WebSocket disconnected'],
    solutions: [
      { order: 1, instruction: 'Check ESP32 power', detail: 'Ensure the ESP32 is powered and the LED indicates normal operation.' },
      { order: 2, instruction: 'Verify WiFi network', detail: 'Confirm ESP32 and your computer are on the same WiFi network.' },
      { order: 3, instruction: 'Restart ESP32', detail: 'Press the RESET button on the ESP32 gateway.' },
      { order: 4, instruction: 'Check IP address', detail: 'Verify the ESP32 IP address in the OTA dashboard settings.' },
      { order: 5, instruction: 'Re-flash ESP32 firmware', detail: 'If ESP32 is unresponsive, re-flash the gateway firmware via USB.' },
    ]
  },
];

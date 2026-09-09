import { Example, ExampleCategory } from '@/types/example';

export const EXAMPLE_CATEGORIES: ExampleCategory[] = [
  'All',
  'Basics',
  'GPIO',
  'LEDs',
  'Buttons',
  'UART / Serial',
  'I2C',
  'SPI',
  'Displays',
  'Sensors',
  'Communication'
];

export const EXAMPLES_DATA: Example[] = [
  {
    id: 'led-blink',
    name: 'LED Blink',
    category: 'Basics',
    secondaryCategories: ['GPIO', 'LEDs'],
    description: 'Learn the fundamentals of embedded programming by blinking the onboard LED on GPIO22 at 1Hz.',
    icon: 'Lightbulb',
    difficulty: 'Beginner',
    hardware: ['VEGA ARIES v2 (THEJAS32 RISC-V)', 'Onboard LED (GPIO22)'],
    libraries: [],
    whatYouLearn: [
      'Configuring GPIO pins as OUTPUT in setup()',
      'Toggling pin digital states using digitalWrite(HIGH / LOW)',
      'Generating timing intervals with the delay() function',
      'Standard Arduino runtime structure for VEGA ARIES v2'
    ],
    mainFile: 'main.c',
    files: [
      {
        name: 'main.c',
        language: 'c',
        content: `#include <Arduino.h>

#define LED_PIN 22

void setup()
{
    // Configure onboard LED pin as digital output
    pinMode(LED_PIN, OUTPUT);
    Serial.begin(115200);
    Serial.println("VEGA ARIES v2 - LED Blink Started");
}

void loop()
{
    // Turn LED ON
    digitalWrite(LED_PIN, HIGH);
    Serial.println("LED State: ON");
    delay(500);

    // Turn LED OFF
    digitalWrite(LED_PIN, LOW);
    Serial.println("LED State: OFF");
    delay(500);
}
`
      },
      {
        name: 'README.md',
        language: 'markdown',
        content: `# VEGA ARIES v2 — LED Blink Example

## Overview
This is the foundational "Hello World" project for the **VEGA ARIES v2** development board powered by the **THEJAS32 RISC-V** microcontroller.

## Hardware Connections
- **LED Pin**: GPIO 22 (Onboard User LED)
- **UART Baud**: 115200 (Type-B USB Serial)

## How to Run
1. Click **BUILD** to compile the RISC-V binary using the VEGA compiler.
2. Choose **Wi-Fi / OTA** (wireless) or **USB Direct** (Web Serial).
3. Click **FLASH** to transfer the firmware.
4. Observe the onboard LED blinking at a 1-second interval (500ms ON, 500ms OFF).
`
      }
    ]
  },
  {
    id: 'rgb-led',
    name: 'RGB LED Color Cycling',
    category: 'LEDs',
    secondaryCategories: ['GPIO', 'Basics'],
    description: 'Control the onboard RGB LED channels by cycling through Red, Green, and Blue color states with GPIO control.',
    icon: 'Palette',
    difficulty: 'Beginner',
    hardware: ['VEGA ARIES v2', 'Onboard RGB LED (GPIO22 Green, GPIO23 Blue, GPIO24 Red)'],
    libraries: [],
    whatYouLearn: [
      'Configuring multiple independent GPIO pins',
      'Controlling tri-color LED channels (Red, Green, Blue)',
      'Creating cyclical state-machine animations with delay intervals',
      'Managing pin logic levels for combined color patterns'
    ],
    mainFile: 'main.cpp',
    files: [
      {
        name: 'main.cpp',
        language: 'cpp',
        content: `#include <Arduino.h>

#define LED_GREEN 22
#define LED_BLUE  23
#define LED_RED   24

void setup()
{
    // Initialize RGB pins as digital outputs
    pinMode(LED_GREEN, OUTPUT);
    pinMode(LED_BLUE, OUTPUT);
    pinMode(LED_RED, OUTPUT);

    Serial.begin(115200);
    Serial.println("VEGA ARIES v2 - RGB LED Controller Active");
}

void loop()
{
    // 1. Red Only
    digitalWrite(LED_RED, HIGH);
    digitalWrite(LED_GREEN, LOW);
    digitalWrite(LED_BLUE, LOW);
    Serial.println("Color: RED");
    delay(500);

    // 2. Green Only
    digitalWrite(LED_RED, LOW);
    digitalWrite(LED_GREEN, HIGH);
    digitalWrite(LED_BLUE, LOW);
    Serial.println("Color: GREEN");
    delay(500);

    // 3. Blue Only
    digitalWrite(LED_RED, LOW);
    digitalWrite(LED_GREEN, LOW);
    digitalWrite(LED_BLUE, HIGH);
    Serial.println("Color: BLUE");
    delay(500);

    // 4. White (All ON)
    digitalWrite(LED_RED, HIGH);
    digitalWrite(LED_GREEN, HIGH);
    digitalWrite(LED_BLUE, HIGH);
    Serial.println("Color: WHITE");
    delay(500);
}
`
      },
      {
        name: 'README.md',
        language: 'markdown',
        content: `# VEGA ARIES v2 — RGB LED Control

## Overview
Demonstrates full color cycling using the three onboard RGB LED channels on the VEGA ARIES v2 board.

## Pin Configuration
| Color Channel | GPIO Pin |
| :--- | :--- |
| **Green** | GPIO 22 |
| **Blue** | GPIO 23 |
| **Red** | GPIO 24 |

## Build & Flash
Click **BUILD**, then **FLASH** to test RGB sequencing.
`
      }
    ]
  },
  {
    id: 'button-input',
    name: 'Push Button Input',
    category: 'Buttons',
    secondaryCategories: ['GPIO', 'Basics'],
    description: 'Read digital state from the onboard user push button (BTN0 on GPIO0) to control the LED with real-time Serial output.',
    icon: 'ToggleLeft',
    difficulty: 'Beginner',
    hardware: ['VEGA ARIES v2', 'Onboard Button BTN0 (GPIO0)', 'Onboard LED (GPIO22)'],
    libraries: [],
    whatYouLearn: [
      'Configuring digital input pins with pinMode(INPUT)',
      'Sampling physical digital voltage states with digitalRead()',
      'Implementing software debounce and state conditions',
      'Streaming button events over UART Serial to the terminal'
    ],
    mainFile: 'main.cpp',
    files: [
      {
        name: 'main.cpp',
        language: 'cpp',
        content: `#include <Arduino.h>

#define BTN_PIN 0
#define LED_PIN 22

void setup()
{
    // Configure button as INPUT and LED as OUTPUT
    pinMode(BTN_PIN, INPUT);
    pinMode(LED_PIN, OUTPUT);

    Serial.begin(115200);
    Serial.println("VEGA ARIES v2 - Button Input Example");
    Serial.println("Press onboard button BTN0 to light the LED.");
}

void loop()
{
    int btnState = digitalRead(BTN_PIN);

    // Button active low (pressed = LOW)
    if (btnState == LOW) {
        digitalWrite(LED_PIN, HIGH);
        Serial.println("BTN0 Pressed -> LED ON");
    } else {
        digitalWrite(LED_PIN, LOW);
    }

    delay(50); // Software debounce sampling interval
}
`
      },
      {
        name: 'README.md',
        language: 'markdown',
        content: `# VEGA ARIES v2 — Button Input & LED

## Overview
Demonstrates reading input signals from the onboard user push button **BTN0** and responding immediately by driving the onboard LED.

## Pin Map
- **Button (BTN0)**: GPIO 0
- **LED**: GPIO 22
- **UART Baud**: 115200
`
      }
    ]
  },
  {
    id: 'uart-echo',
    name: 'UART Serial Echo',
    category: 'UART / Serial',
    secondaryCategories: ['Communication', 'Basics'],
    description: 'High-speed UART serial communication sending and receiving characters over the USB-UART bridge at 115200 baud.',
    icon: 'Terminal',
    difficulty: 'Beginner',
    hardware: ['VEGA ARIES v2', 'Micro-USB UART Interface'],
    libraries: [],
    whatYouLearn: [
      'Configuring hardware UART peripheral at 115200 baud',
      'Checking incoming RX FIFO buffer with Serial.available()',
      'Reading serial bytes using Serial.read()',
      'Formatting and transmitting response data with Serial.print() / Serial.println()'
    ],
    mainFile: 'main.cpp',
    files: [
      {
        name: 'main.cpp',
        language: 'cpp',
        content: `#include <Arduino.h>

void setup()
{
    // Initialize UART0 at 115200 baud
    Serial.begin(115200);
    while (!Serial);

    Serial.println("========================================");
    Serial.println(" VEGA ARIES v2 - THEJAS32 RISC-V");
    Serial.println(" UART Serial Echo Server Ready");
    Serial.println(" Type characters in Serial Monitor...");
    Serial.println("========================================");
}

void loop()
{
    // Check if data is available in the UART receiver buffer
    if (Serial.available() > 0) {
        char receivedChar = Serial.read();
        
        Serial.print("Echo [0x");
        Serial.print((int)receivedChar, HEX);
        Serial.print("]: '");
        Serial.print(receivedChar);
        Serial.println("'");
    }

    delay(10);
}
`
      },
      {
        name: 'README.md',
        language: 'markdown',
        content: `# VEGA ARIES v2 — UART Serial Echo

## Overview
A bidirectional serial communication example that listens on UART0 and echoes received data back to the connected host terminal.

## Instructions
1. Build and Flash the firmware.
2. Open the **Serial Monitor** tab in the IDE bottom panel.
3. Send text or keystrokes to receive the formatted echo.
`
      }
    ]
  },
  {
    id: 'i2c-scanner',
    name: 'I2C Bus Scanner',
    category: 'I2C',
    secondaryCategories: ['Sensors', 'Communication'],
    description: 'Probe all 127 7-bit addresses on the hardware I2C bus to discover connected OLEDs, LCDs, and sensors.',
    icon: 'Search',
    difficulty: 'Intermediate',
    hardware: ['VEGA ARIES v2', 'I2C Peripheral / Sensor (SDA: GPIO18, SCL: GPIO19)'],
    libraries: ['Wire'],
    whatYouLearn: [
      'Initializing the hardware I2C bus with Wire.begin()',
      'Sending 7-bit device addressing frames with Wire.beginTransmission()',
      'Evaluating ACK / NACK status return codes with Wire.endTransmission()',
      'Hexadecimal address representation and hardware bus diagnostics'
    ],
    mainFile: 'main.cpp',
    files: [
      {
        name: 'main.cpp',
        language: 'cpp',
        content: `#include <Arduino.h>
#include <Wire.h>

void setup()
{
    // Initialize I2C bus as Master
    Wire.begin();

    Serial.begin(115200);
    while (!Serial);
    Serial.println("\n--- VEGA ARIES v2 I2C Bus Scanner ---");
    Serial.println("Scanning 7-bit I2C address range (0x01 - 0x7E)...");
}

void loop()
{
    byte error, address;
    int nDevices = 0;

    Serial.println("\n[Scan started]");

    for (address = 1; address < 127; address++) {
        Wire.beginTransmission(address);
        error = Wire.endTransmission();

        if (error == 0) {
            Serial.print("  ✓ I2C device detected at address 0x");
            if (address < 16) Serial.print("0");
            Serial.print(address, HEX);
            Serial.println(" !");
            nDevices++;
        } else if (error == 4) {
            Serial.print("  ⚠ Unknown error at address 0x");
            if (address < 16) Serial.print("0");
            Serial.println(address, HEX);
        }
    }

    if (nDevices == 0) {
        Serial.println("  No I2C devices found. Check SDA/SCL pull-up wiring.");
    } else {
        Serial.print("Scan complete. Total devices found: ");
        Serial.println(nDevices);
    }

    delay(5000); // Repeat scan every 5 seconds
}
`
      },
      {
        name: 'README.md',
        language: 'markdown',
        content: `# VEGA ARIES v2 — I2C Bus Scanner

## Overview
Scans the hardware I2C bus and outputs the 7-bit hex address of all responding peripherals to the Serial Monitor.

## Default Pinout
- **SDA**: GPIO 18
- **SCL**: GPIO 19
- **VCC**: 3.3V / 5V
- **GND**: Common Ground

## Common I2C Addresses
- **0x27 / 0x3F**: PCF8574 16x2 LCD Backpack
- **0x3C / 0x3D**: SSD1306 0.96" OLED Display
- **0x68**: MPU6050 / DS3231 RTC
- **0x76 / 0x77**: BMP280 / BME280 Sensor
`
      }
    ]
  },
  {
    id: 'i2c-lcd',
    name: 'I2C 16x2 LCD Display',
    category: 'Displays',
    secondaryCategories: ['I2C'],
    description: 'Display alphanumeric text and real-time status messages on a 16x2 LCD display using the LiquidCrystal_I2C library.',
    icon: 'Monitor',
    difficulty: 'Intermediate',
    hardware: ['VEGA ARIES v2', '16x2 Character LCD with PCF8574 I2C Adapter (0x27)'],
    libraries: ['Wire', 'LiquidCrystal_I2C'],
    whatYouLearn: [
      'Using LiquidCrystal_I2C driver library on THEJAS32 RISC-V',
      'Initializing HD44780 controller and enabling LED backlight',
      'Positioning output cursor with lcd.setCursor(column, row)',
      'Formatting and refreshing live multi-line text'
    ],
    mainFile: 'main.cpp',
    files: [
      {
        name: 'main.cpp',
        language: 'cpp',
        content: `#include <Arduino.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// Set LCD I2C address to 0x27 for 16 chars and 2 line display
LiquidCrystal_I2C lcd(0x27, 16, 2);

int counter = 0;

void setup()
{
    // Initialize LCD and turn on backlight
    lcd.init();
    lcd.backlight();
    lcd.clear();

    // Print static header on Line 1
    lcd.setCursor(0, 0);
    lcd.print("VEGA ARIES v2");

    // Print subheader on Line 2
    lcd.setCursor(0, 1);
    lcd.print("THEJAS32 RISC-V");
    delay(2000);
    lcd.clear();
}

void loop()
{
    lcd.setCursor(0, 0);
    lcd.print("VEGA Studio IDE ");

    lcd.setCursor(0, 1);
    lcd.print("Count: ");
    lcd.print(counter);
    lcd.print("     ");

    counter++;
    delay(1000);
}
`
      },
      {
        name: 'README.md',
        language: 'markdown',
        content: `# VEGA ARIES v2 — I2C 16x2 LCD Display

## Overview
Drives a standard 16x2 HD44780 character LCD equipped with a PCF8574 I2C backpack using the official **LiquidCrystal_I2C** and **Wire** libraries.

## Wiring
- **VCC** -> 5V
- **GND** -> GND
- **SDA** -> GPIO 18
- **SCL** -> GPIO 19

## Required Libraries
- **Wire** (Hardware I2C)
- **LiquidCrystal_I2C** (LCD controller)
`
      }
    ]
  },
  {
    id: 'spi-basic',
    name: 'SPI Master Transfer',
    category: 'SPI',
    secondaryCategories: ['Communication'],
    description: 'Master-mode SPI synchronous serial transmission for interfacing with high-speed sensors, memories, and controllers.',
    icon: 'Cpu',
    difficulty: 'Intermediate',
    hardware: ['VEGA ARIES v2', 'SPI Peripheral (MOSI: GPIO11, MISO: GPIO12, SCK: GPIO13, CS: GPIO10)'],
    libraries: ['SPI'],
    whatYouLearn: [
      'Configuring the hardware SPI engine with SPI.begin()',
      'Transferring data bytes synchronously with SPI.transfer()',
      'Controlling peripheral Chip Select (CS) logic levels',
      'Synchronizing full-duplex SPI clocks and registers'
    ],
    mainFile: 'main.cpp',
    files: [
      {
        name: 'main.cpp',
        language: 'cpp',
        content: `#include <Arduino.h>
#include <SPI.h>

#define CS_PIN 10

void setup()
{
    pinMode(CS_PIN, OUTPUT);
    digitalWrite(CS_PIN, HIGH); // Deassert chip select

    // Initialize SPI bus as Master
    SPI.begin();

    Serial.begin(115200);
    Serial.println("VEGA ARIES v2 - SPI Master Initialized");
}

void loop()
{
    // Assert CS (Active Low)
    digitalWrite(CS_PIN, LOW);

    // Transmit test byte and receive slave response
    byte sent = 0x55;
    byte received = SPI.transfer(sent);

    // Deassert CS
    digitalWrite(CS_PIN, HIGH);

    Serial.print("SPI Sent: 0x");
    Serial.print(sent, HEX);
    Serial.print(" | Received: 0x");
    Serial.println(received, HEX);

    delay(500);
}
`
      },
      {
        name: 'README.md',
        language: 'markdown',
        content: `# VEGA ARIES v2 — SPI Master Transfer

## Overview
Demonstrates full-duplex SPI serial communication using the built-in **SPI** library on THEJAS32 RISC-V.

## SPI Pinout
- **MOSI**: GPIO 11
- **MISO**: GPIO 12
- **SCK**: GPIO 13
- **CS**: GPIO 10
`
      }
    ]
  },
  {
    id: 'max7219-matrix',
    name: 'MAX7219 8x8 LED Matrix',
    category: 'Displays',
    secondaryCategories: ['SPI'],
    description: 'Drive an 8x8 dot matrix LED display module over SPI using the MD_MAX72xx hardware controller library.',
    icon: 'Grid',
    difficulty: 'Advanced',
    hardware: ['VEGA ARIES v2', 'MAX7219 8x8 Dot Matrix Module (CS: GPIO10, DIN: GPIO11, CLK: GPIO13)'],
    libraries: ['SPI', 'MD_MAX72xx'],
    whatYouLearn: [
      'Integrating the MD_MAX72xx display library with SPI hardware',
      'Configuring module intensity, shutdown modes, and cascade counts',
      'Controlling individual pixel LEDs with mx.setPoint(col, row, state)',
      'Displaying graphics and pattern animations on LED matrix'
    ],
    mainFile: 'main.cpp',
    files: [
      {
        name: 'main.cpp',
        language: 'cpp',
        content: `#include <Arduino.h>
#include <SPI.h>
#include <MD_MAX72xx.h>

#define HARDWARE_TYPE MD_MAX72XX::GENERIC_HW
#define MAX_DEVICES 1
#define CS_PIN 10

// Hardware SPI connection using MD_MAX72XX
MD_MAX72XX mx = MD_MAX72XX(HARDWARE_TYPE, CS_PIN, MAX_DEVICES);

void setup()
{
    Serial.begin(115200);
    Serial.println("VEGA ARIES v2 - MAX7219 Dot Matrix Active");

    // Initialize display controller
    mx.begin();
    mx.control(MD_MAX72XX::INTENSITY, 4); // Brightness (0-15)
    mx.clear();
}

void loop()
{
    // Draw corner frame pattern
    mx.clear();
    mx.setPoint(0, 0, true);
    mx.setPoint(0, 7, true);
    mx.setPoint(7, 0, true);
    mx.setPoint(7, 7, true);
    delay(500);

    // Draw center plus sign
    mx.clear();
    for (int i = 2; i <= 5; i++) {
        mx.setPoint(i, 3, true);
        mx.setPoint(i, 4, true);
        mx.setPoint(3, i, true);
        mx.setPoint(4, i, true);
    }
    delay(500);
}
`
      },
      {
        name: 'README.md',
        language: 'markdown',
        content: `# VEGA ARIES v2 — MAX7219 8x8 LED Matrix

## Overview
Drives a MAX7219-based 8x8 LED dot matrix display module via hardware SPI using the **MD_MAX72xx** library.

## Pinout
- **VCC** -> 5V
- **GND** -> GND
- **DIN (MOSI)** -> GPIO 11
- **CS** -> GPIO 10
- **CLK (SCK)** -> GPIO 13

## Required Libraries
- **SPI**
- **MD_MAX72xx**
`
      }
    ]
  }
];

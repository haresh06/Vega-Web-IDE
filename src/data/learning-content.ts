import { LearningPath } from '@/types';

export const learningPaths: LearningPath[] = [
  {
    id: 'beginner',
    name: 'Beginner',
    order: 1,
    description: 'Start your embedded systems journey. Learn the fundamentals of microcontrollers, GPIO, timers, and basic VEGA programming.',
    modules: [
      {
        id: 'embedded-c-basics',
        title: 'Embedded C Basics',
        description: 'Master C programming for bare-metal embedded systems: pointers, bit manipulation, volatile keyword, memory-mapped registers, and structure overlays.',
        category: 'fundamentals',
        difficulty: 'easy',
        order: 1,
        points: 150,
        estimatedTime: 50,
        learningPathId: 'beginner',
        videoUrl: 'https://www.youtube.com/embed/1uR4tL-OuI0',
        videoTitle: 'Embedded C Programming Tutorial for Beginners',
        progress: 100,
        completed: true,
        locked: false,
        lessons: [
          {
            id: 'ec-1',
            title: 'Introduction to Bare-Metal Embedded C',
            videoUrl: 'https://www.youtube.com/embed/1uR4tL-OuI0',
            videoTitle: 'Embedded C vs Standard C & Hardware Access',
            content: `Embedded C is a specialized dialect of C designed specifically for microcontrollers with constrained memory, clock cycles, and direct access to memory-mapped hardware peripherals.

## Key Differences from Desktop C
- **Direct Hardware Register Access**: Interacting with silicon registers at specific physical memory addresses.
- **Bit Manipulation Operations**: Shifting, masking, and setting individual peripheral control bits.
- **The \`volatile\` Type Qualifier**: Preventing compiler optimizations for asynchronous hardware registers.
- **Resource Constraints**: Strict limits on SRAM (e.g., 256 KB on VEGA THEJAS32) and Flash memory.
- **Bare-Metal Startup**: Execution begins directly from reset vector without operating system runtimes.

## Memory Architecture in Embedded Systems
When compiling C code for the VEGA ET1031 RISC-V core:
1. **.text section**: Compiled machine instructions stored in non-volatile Flash (2 MB).
2. **.rodata section**: Read-only constants and string literals.
3. **.data section**: Initialized global and static variables (copied from Flash to SRAM at startup).
4. **.bss section**: Zero-initialized variables allocated in SRAM.
5. **Stack & Heap**: Dynamically growing downward (stack) and upward (heap) in SRAM.

\`\`\`c
#include <stdint.h>

// Example: Direct 32-bit hardware register access
#define GPIO_BASE_ADDR   0x10080000UL
#define GPIO_DIR_REG     (*(volatile uint32_t *)(GPIO_BASE_ADDR + 0x00))
#define GPIO_DATA_REG    (*(volatile uint32_t *)(GPIO_BASE_ADDR + 0x04))
\`\`\``,
            order: 1,
            moduleId: 'embedded-c-basics',
            completed: true
          },
          {
            id: 'ec-2',
            title: 'Data Types, Pointers & The Volatile Qualifier',
            videoUrl: 'https://www.youtube.com/embed/y6kM_5pA2nE',
            videoTitle: 'Pointers & Volatile in Embedded C',
            content: `In embedded firmware, standard types like \`int\` or \`long\` are ambiguous across compiler targets. Always use fixed-width integer types from \`<stdint.h>\`.

## Fixed-Width Integer Types
| Type | Width | Min Value | Max Value |
|---|---|---|---|
| \`uint8_t\` | 8 bits (1 byte) | 0 | 255 |
| \`int8_t\` | 8 bits (1 byte) | -128 | 127 |
| \`uint16_t\` | 16 bits (2 bytes) | 0 | 65,535 |
| \`int16_t\` | 16 bits (2 bytes) | -32,768 | 32,767 |
| \`uint32_t\` | 32 bits (4 bytes) | 0 | 4,294,967,295 |
| \`int32_t\` | 32 bits (4 bytes) | -2,147,483,648 | 2,147,483,647 |

## Why the \`volatile\` Keyword is Essential
The C compiler optimizes loops by caching variables into CPU registers. However, hardware status registers can be modified at any nanosecond by external physical signals or interrupts!

\`\`\`c
// Without volatile: The compiler might optimize this into an infinite loop!
// uint32_t *UART_STATUS = (uint32_t *)0x10010008;
// while (*UART_STATUS == 0); // BUG: compiler caches *UART_STATUS in a CPU register

// CORRECT: With volatile qualifier
volatile uint32_t *const UART_STATUS = (volatile uint32_t *)0x10010008;

void wait_for_data_ready(void) {
    // Forces the CPU to re-read the physical hardware memory address every loop cycle
    while ((*UART_STATUS & (1 << 0)) == 0) {
        // Wait until RX Ready bit is asserted by hardware
    }
}
\`\`\``,
            order: 2,
            moduleId: 'embedded-c-basics',
            completed: true
          },
          {
            id: 'ec-3',
            title: 'Bitwise Manipulation & Bit-Masking Patterns',
            videoUrl: 'https://www.youtube.com/embed/Fw0U1eW6aFc',
            videoTitle: 'Bit Manipulation in C for Embedded Registers',
            content: `Microcontroller peripheral registers pack multiple configuration flags into a single 32-bit word. Mastering bitwise operators is crucial for safe register programming.

## Essential Bitwise Operations
\`\`\`c
// 1. SET Bit n (Turn Pin HIGH or Enable Feature)
REG |= (1UL << n);

// 2. CLEAR Bit n (Turn Pin LOW or Disable Feature)
REG &= ~(1UL << n);

// 3. TOGGLE Bit n (Invert Pin state)
REG ^= (1UL << n);

// 4. TEST / CHECK Bit n
if (REG & (1UL << n)) {
    // Bit is HIGH (1)
}

// 5. WRITE MULTI-BIT FIELD (e.g. 3-bit mode at bits [5:3])
#define MODE_MASK  (0x7UL << 3)
REG = (REG & ~MODE_MASK) | ((new_mode & 0x7UL) << 3);
\`\`\`

## Struct Overlay Pattern (Clean Hardware Driver Architecture)
Instead of loose pointer arithmetic, professional drivers define hardware register maps using C structures:

\`\`\`c
typedef struct {
    volatile uint32_t DIRECTION;  // Offset 0x00: Pin direction (0=Input, 1=Output)
    volatile uint32_t OUTPUT_DATA;// Offset 0x04: Pin output state
    volatile uint32_t INPUT_DATA; // Offset 0x08: Pin input state (Read-Only)
    volatile uint32_t INTR_ENABLE;// Offset 0x0C: Interrupt enable mask
    volatile uint32_t INTR_STATUS;// Offset 0x10: Interrupt pending flag
} GPIO_TypeDef;

#define GPIO ((GPIO_TypeDef *)0x10080000UL)

void led_init(uint8_t pin) {
    GPIO->DIRECTION |= (1UL << pin);    // Configure as Output
    GPIO->OUTPUT_DATA &= ~(1UL << pin); // Initialize to LOW
}
\`\`\``,
            order: 3,
            moduleId: 'embedded-c-basics',
            completed: true
          },
        ]
      },
      {
        id: 'microcontroller-basics',
        title: 'Microcontroller Basics & RISC-V Architecture',
        description: 'Understand CPU internals, pipelining, registers x0-x31, bus protocols, and the C-DAC THEJAS32 SoC.',
        category: 'fundamentals',
        difficulty: 'easy',
        order: 2,
        points: 150,
        estimatedTime: 45,
        learningPathId: 'beginner',
        videoUrl: 'https://www.youtube.com/embed/4W1F9_bH_d8',
        videoTitle: 'RISC-V Architecture & Microcontroller Internals',
        progress: 60,
        completed: false,
        locked: false,
        lessons: [
          {
            id: 'mc-1',
            title: 'THEJAS32 SoC & VEGA ET1031 Core',
            videoUrl: 'https://www.youtube.com/embed/4W1F9_bH_d8',
            videoTitle: 'RISC-V Core & Microcontroller Architecture',
            content: `The VEGA ARIES v2.0 development board is powered by the **THEJAS32** System-on-Chip (SoC), built on C-DAC's indigenously developed **VEGA ET1031** 32-bit RISC-V processor core.

## THEJAS32 Core Specifications
- **ISA**: RISC-V RV32IM (32-bit Base Integer + Hardware Multiply & Divide)
- **Clock Frequency**: 100 MHz operating frequency
- **Pipeline**: High efficiency 3-stage in-order execution pipeline (Fetch → Decode → Execute/Writeback)
- **Internal SRAM**: 256 KB high-speed zero-wait-state memory
- **External Flash**: 2 MB Quad-SPI NOR Flash for firmware storage
- **Privilege Modes**: Machine Mode (M-mode) for direct bare-metal hardware control

## RISC-V General Purpose Registers
RISC-V provides 32 core integer registers (\`x0\` through \`x31\`):
- \`x0\` (\`zero\`): Hardwired to 0. Writing to it has no effect.
- \`x1\` (\`ra\`): Return address for function calls.
- \`x2\` (\`sp\`): Stack pointer.
- \`x8\` / \`x9\` (\`s0\` / \`s1\`): Saved registers / Frame pointer.
- \`x10\` - \`x17\` (\`a0\` - \`a7\`): Function arguments and return values.
- \`x5\` - \`x7\`, \`x28\` - \`x31\` (\`t0\` - \`t6\`): Temporary scratchpad registers.`,
            order: 1,
            moduleId: 'microcontroller-basics',
            completed: true
          },
          {
            id: 'mc-2',
            title: 'THEJAS32 Peripheral Memory Map',
            videoUrl: 'https://www.youtube.com/embed/4W1F9_bH_d8',
            videoTitle: 'Microcontroller Memory Mapping Explained',
            content: `In the RISC-V unified memory architecture, memory and peripherals share a single 32-bit address space (0x00000000 to 0xFFFFFFFF).

## THEJAS32 Memory Mapping Table
\`\`\`
Address Range             | Peripheral / Memory Block
--------------------------|-----------------------------------------
0x00000000 - 0x0003FFFF   | On-Chip SRAM (256 KB)
0x10010000 - 0x100100FF   | UART0 (Primary Debug / Bootloader)
0x10020000 - 0x100200FF   | UART1 (User Serial Port)
0x10030000 - 0x100300FF   | SPI0 (Master Interface)
0x10040000 - 0x100400FF   | I2C0 (Two-Wire Bus Master)
0x10050000 - 0x100500FF   | Timer0 & Timer1 (32-bit Timers)
0x10060000 - 0x100600FF   | PWM Controller (8 Channels)
0x10070000 - 0x100700FF   | ADC Controller (10-bit 4 Channels)
0x10080000 - 0x100800FF   | GPIO Controller (32 Pins)
0x20000000 - 0x201FFFFF   | External SPI Flash Memory (2 MB)
\`\`\``,
            order: 2,
            moduleId: 'microcontroller-basics',
            completed: true
          }
        ]
      },
      {
        id: 'gpio',
        title: 'GPIO — General Purpose I/O',
        description: 'Control digital input and output pins, debounce mechanical switches, configure external pin interrupts on VEGA ARIES v2.',
        category: 'peripheral',
        difficulty: 'easy',
        order: 3,
        points: 150,
        estimatedTime: 50,
        learningPathId: 'beginner',
        videoUrl: 'https://www.youtube.com/embed/zH0b8X2kY8U',
        videoTitle: 'Microcontroller GPIO Interfacing Tutorial',
        progress: 0,
        completed: false,
        locked: false,
        lessons: [
          {
            id: 'gpio-1',
            title: 'GPIO Hardware Architecture & Push-Pull vs Open-Drain',
            videoUrl: 'https://www.youtube.com/embed/zH0b8X2kY8U',
            videoTitle: 'GPIO Basics and Electrical Characteristics',
            content: `GPIO (General Purpose Input/Output) pins are the fundamental interface connecting the CPU core to the physical electronics outside.

## Electrical Characteristics (VEGA ARIES v2)
- **Logic Voltage**: 3.3V LVCMOS
- **Input High Voltage (VIH)**: Min 2.0V, Max 3.6V
- **Input Low Voltage (VIL)**: Min -0.3V, Max 0.8V
- **Max Output Current**: 12 mA per pin (Safe sink/source current)
- **Total Accessible Pins**: 23 general-purpose header pins

## Output Driver Topologies
1. **Push-Pull Output**: Uses complementary P-FET and N-FET transistors to actively drive both 3.3V (HIGH) and 0V (LOW). Ideal for driving LEDs, SPI lines, and relays.
2. **Open-Drain Output**: The pin can only pull LOW or remain floating (high impedance). Requires an external pull-up resistor to pull HIGH. Used for shared multi-drop buses like I2C.`,
            order: 1,
            moduleId: 'gpio'
          },
          {
            id: 'gpio-2',
            title: 'Complete LED Blink & Button Debounce Example',
            videoUrl: 'https://www.youtube.com/embed/zH0b8X2kY8U',
            videoTitle: 'Bare-Metal LED Control & Switch Debouncing in C',
            content: `Here is a complete, production-ready bare-metal example for the VEGA ARIES v2 board:

\`\`\`c
#include <stdint.h>
#include "gpio.h"
#include "delay.h"

#define ONBOARD_LED_PIN   5   // GPIO 5 (Connected to User LED)
#define USER_BUTTON_PIN   3   // GPIO 3 (Connected to Push Button)

int main(void)
{
    // Configure Pin 5 as Output and Pin 3 as Input
    gpio_pin_configure(ONBOARD_LED_PIN, GPIO_OUTPUT);
    gpio_pin_configure(USER_BUTTON_PIN, GPIO_INPUT);

    uint8_t last_button_state = LOW;

    while (1)
    {
        uint8_t current_state = gpio_pin_read(USER_BUTTON_PIN);

        // Detect Falling Edge with 15ms Software Debounce Filter
        if (current_state == HIGH && last_button_state == LOW)
        {
            delay_ms(15); // Debounce delay
            if (gpio_pin_read(USER_BUTTON_PIN) == HIGH)
            {
                gpio_pin_toggle(ONBOARD_LED_PIN);
            }
        }

        last_button_state = current_state;
        delay_ms(10);
    }

    return 0;
}
\`\`\``,
            order: 2,
            moduleId: 'gpio'
          }
        ]
      },
      {
        id: 'timers',
        title: 'Timers & Hardware Timing',
        description: 'Configure hardware countdown timers, prescalers, periodic interrupts, and microsecond precision delays.',
        category: 'peripheral',
        difficulty: 'easy',
        order: 4,
        points: 150,
        estimatedTime: 45,
        learningPathId: 'beginner',
        videoUrl: 'https://www.youtube.com/embed/Fw0U1eW6aFc',
        videoTitle: 'Microcontroller Hardware Timers and Interrupts',
        locked: false,
        lessons: [
          {
            id: 'timer-1',
            title: 'Timer Architecture & Clock Prescaling',
            videoUrl: 'https://www.youtube.com/embed/Fw0U1eW6aFc',
            videoTitle: 'Hardware Timers Explained',
            content: `Software delay loops (like \`for\` loops) waste 100% of CPU cycles and vary based on compiler optimization. Hardware timers run autonomously from the CPU clock.

## THEJAS32 32-bit Timer Block
- **Input Clock**: 100 MHz system clock
- **Counter Type**: 32-bit programmable countdown counter
- **Modes**: One-Shot Mode & Periodic Auto-Reload Mode
- **Interrupts**: Dedicated interrupt line triggered on zero-underflow

## Calculating Timer Counts
$$\\text{Timer Value} = \\text{Desired Period (seconds)} \\times \\text{Clock Frequency (Hz)}$$

For a 1.0 second periodic interrupt at 100 MHz:
$$\\text{Timer Value} = 1.0 \\times 100,000,000 = 100,000,000 \\text{ counts}$$`,
            order: 1,
            moduleId: 'timers'
          }
        ]
      },
      {
        id: 'uart-beginner',
        title: 'UART Serial Communication',
        description: 'Master serial telemetry, 8N1 framing, baud rate dividers, FIFOs, and communication between VEGA and PC.',
        category: 'protocol',
        difficulty: 'easy',
        order: 5,
        points: 200,
        estimatedTime: 60,
        learningPathId: 'beginner',
        videoUrl: 'https://www.youtube.com/embed/IyGwvGzrqp8',
        videoTitle: 'UART Communication Protocol Tutorial',
        locked: false,
        lessons: [
          {
            id: 'uart-b1',
            title: 'UART Concept, Framing & Timing Architecture',
            videoUrl: 'https://www.youtube.com/embed/IyGwvGzrqp8',
            videoTitle: 'UART Framing, Baud Rate and Start/Stop Bits',
            content: `UART (Universal Asynchronous Receiver-Transmitter) is the universal protocol for board-to-PC communication and serial debugging.

## Why is it "Asynchronous"?
Unlike SPI or I2C, UART transmits **no clock wire**. Both sender and receiver agree beforehand on the transmission speed (Baud Rate) and sample incoming bits using precise internal clock dividers!

## 8N1 UART Frame Structure
\`\`\`
IDLE (HIGH) ──┐      ┌───┬───┬───┬───┬───┬───┬───┬───┐      ┌── IDLE (HIGH)
              │START │D0 │D1 │D2 │D3 │D4 │D5 │D6 │D7 │ STOP │
              └──────┴───┴───┴───┴───┴───┴───┴───┴───┴──────┘
               1-bit   LSB                         MSB  1-bit
\`\`\`

- **Start Bit**: 1 bit LOW to synchronize receiver clock.
- **Data Bits**: 8 bits payload (sent LSB first).
- **Parity Bit**: Optional error detection bit (None in 8N1).
- **Stop Bit**: 1 or 2 bits HIGH to mark frame boundary.`,
            order: 1,
            moduleId: 'uart-beginner'
          },
          {
            id: 'uart-b2',
            title: 'THEJAS32 UART Register Configuration & Baud Divisor',
            videoUrl: 'https://www.youtube.com/embed/IyGwvGzrqp8',
            videoTitle: 'UART Register Programming & Baud Rate Calculation',
            content: `## Baud Rate Generator Formula
$$\\text{Baud Divisor} = \\frac{\\text{Clock Frequency}}{16 \\times \\text{Baud Rate}}$$

For 115200 Baud at 100 MHz:
$$\\text{Divisor} = \\frac{100,000,000}{16 \\times 115,200} = 54.25 \\approx 54$$

## Complete Working UART Echo Driver in C
\`\`\`c
#include <stdint.h>
#include "uart.h"

void uart_init(uint32_t baud)
{
    // Set Baud Rate (115200) with 8N1 configuration
    uart_configure(UART0, baud, UART_8N1);
}

void uart_putc(char c)
{
    // Wait until TX FIFO is not full
    while (uart_tx_full(UART0));
    uart_write_byte(UART0, c);
}

void uart_puts(const char *str)
{
    while (*str) {
        if (*str == '\\n') uart_putc('\\r');
        uart_putc(*str++);
    }
}

int main(void)
{
    uart_init(115200);
    uart_puts("VEGA ARIES v2.0 - Serial Terminal Ready!\\r\\n");

    while (1) {
        if (uart_data_available(UART0)) {
            char rx = uart_read_byte(UART0);
            uart_putc(rx); // Echo character back to PC terminal
        }
    }
}
\`\`\``,
            order: 2,
            moduleId: 'uart-beginner'
          }
        ]
      }
    ]
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    order: 2,
    description: 'Dive deeper into communication protocols, sensors, and peripheral interfaces. Build real embedded applications.',
    modules: [
      {
        id: 'i2c-protocol',
        title: 'I2C Protocol',
        description: 'Learn the I2C two-wire protocol: master/slave, 7-bit addressing, ACK/NACK signaling, bus arbitration, and interfacing digital sensors.',
        category: 'protocol',
        difficulty: 'medium',
        order: 1,
        points: 250,
        estimatedTime: 65,
        learningPathId: 'intermediate',
        videoUrl: 'https://www.youtube.com/embed/6IAkYpmA1DQ',
        videoTitle: 'I2C Communication Protocol Deep Dive',
        progress: 0,
        completed: false,
        locked: false,
        lessons: [
          {
            id: 'i2c-1',
            title: 'I2C Bus Architecture, SDA & SCL Lines',
            videoUrl: 'https://www.youtube.com/embed/6IAkYpmA1DQ',
            videoTitle: 'How I2C Communication Works',
            content: `I2C (Inter-Integrated Circuit) is a synchronous, multi-master, multi-slave serial bus requiring only **two bidirectional open-drain wires**.

## The Two Bus Lines
- **SDA (Serial Data)**: Bidirectional line for address and payload bytes.
- **SCL (Serial Clock)**: Generated by the Master to synchronize bit transitions.

## Pull-Up Resistors
Both SDA and SCL are open-drain lines. They **must have external pull-up resistors** (typically 4.7 kΩ to 3.3V) to pull the bus HIGH when idle.

## Standard Bus Speeds
- **Standard Mode (Sm)**: Up to 100 kHz
- **Fast Mode (Fm)**: Up to 400 kHz
- **Fast Mode Plus (Fm+)**: Up to 1.0 MHz`,
            order: 1,
            moduleId: 'i2c-protocol'
          }
        ]
      },
      {
        id: 'spi-protocol',
        title: 'SPI Protocol',
        description: 'Master the high-speed SPI synchronous protocol: MOSI, MISO, SCLK, CS, CPOL/CPHA clock modes, and interfacing OLED displays and Flash memory.',
        category: 'protocol',
        difficulty: 'medium',
        order: 2,
        points: 250,
        estimatedTime: 60,
        learningPathId: 'intermediate',
        videoUrl: 'https://www.youtube.com/embed/0nNYNu_uTkg',
        videoTitle: 'SPI Protocol Tutorial with Timing Diagrams',
        progress: 0,
        completed: false,
        locked: false,
        lessons: [
          {
            id: 'spi-1',
            title: 'SPI 4-Wire Interface & Full Duplex Operation',
            videoUrl: 'https://www.youtube.com/embed/0nNYNu_uTkg',
            videoTitle: 'SPI Bus Architecture Explained',
            content: `SPI (Serial Peripheral Interface) is a synchronous four-wire full-duplex protocol capable of high throughput (50+ MHz).

## Four Active Signals
1. **MOSI (Master Out Slave In)**: Transmits data from Master to Slave.
2. **MISO (Master In Slave Out)**: Transmits data from Slave back to Master.
3. **SCLK (Serial Clock)**: Clock signal generated by Master.
4. **CS / SS (Chip Select / Slave Select)**: Active-LOW line selecting individual slave devices.

## The 4 SPI Modes (CPOL & CPHA)
| Mode | CPOL (Clock Polarity) | CPHA (Clock Phase) | Sampling Edge |
|---|---|---|---|
| **Mode 0** | 0 (Idle LOW) | 0 (Phase 0) | Rising Edge (Leading) |
| **Mode 1** | 0 (Idle LOW) | 1 (Phase 1) | Falling Edge (Trailing) |
| **Mode 2** | 1 (Idle HIGH) | 0 (Phase 0) | Falling Edge (Leading) |
| **Mode 3** | 1 (Idle HIGH) | 1 (Phase 1) | Rising Edge (Trailing) |`,
            order: 1,
            moduleId: 'spi-protocol'
          }
        ]
      },
      {
        id: 'pwm',
        title: 'PWM — Pulse Width Modulation',
        description: 'Control motor speeds, LED dimming, and analog output generation with THEJAS32 8-channel PWM controller.',
        category: 'peripheral',
        difficulty: 'medium',
        order: 3,
        points: 200,
        estimatedTime: 45,
        learningPathId: 'intermediate',
        videoUrl: 'https://www.youtube.com/embed/YmPziPfaByw',
        videoTitle: 'Pulse Width Modulation (PWM) Explained',
        progress: 0,
        completed: false,
        locked: false,
        lessons: [
          {
            id: 'pwm-1',
            title: 'PWM Theory & Duty Cycle Control',
            videoUrl: 'https://www.youtube.com/embed/YmPziPfaByw',
            videoTitle: 'How PWM Works and Duty Cycle Calculation',
            content: `Pulse Width Modulation creates variable average voltage output using digital square waves with varying ON vs OFF times.

$$\\text{Duty Cycle} = \\left( \\frac{T_{ON}}{T_{TOTAL}} \\right) \\times 100\\%$$
$$V_{AVERAGE} = V_{DD} \\times \\text{Duty Cycle}$$`,
            order: 1,
            moduleId: 'pwm'
          }
        ]
      },
      {
        id: 'adc',
        title: 'ADC — Analog to Digital Converter',
        description: 'Read analog voltages from potentiometers, thermistors, and light sensors using THEJAS32 10-bit 4-channel ADC.',
        category: 'peripheral',
        difficulty: 'medium',
        order: 4,
        points: 200,
        estimatedTime: 45,
        learningPathId: 'intermediate',
        videoUrl: 'https://www.youtube.com/embed/6iU8yKqLh_s',
        videoTitle: 'ADC Microcontroller Interfacing & Sampling',
        progress: 0,
        completed: false,
        locked: false,
        lessons: [
          {
            id: 'adc-1',
            title: 'ADC Quantization, Sampling & Voltage Conversion',
            videoUrl: 'https://www.youtube.com/embed/6iU8yKqLh_s',
            videoTitle: 'Analog to Digital Conversion Mathematics',
            content: `The THEJAS32 includes a 10-bit Successive Approximation Register (SAR) ADC with 4 multiplexed analog channels.

## 10-Bit ADC Resolution Formula
$$\\text{Resolution} = 2^{10} = 1024 \\text{ discrete levels (0 to 1023)}$$
$$V_{IN} = \\left( \\frac{\\text{Raw ADC Value}}{1023} \\right) \\times 3.3\\text{V}$$`,
            order: 1,
            moduleId: 'adc'
          }
        ]
      }
    ]
  },
  {
    id: 'advanced',
    name: 'Advanced',
    order: 3,
    description: 'Master advanced topics: FreeRTOS multitasking, bootloaders, over-the-air firmware updates, hardware JTAG debugging, and memory optimization.',
    modules: [
      {
        id: 'rtos',
        title: 'FreeRTOS — Real-Time Operating System',
        description: 'Master preemptive task scheduling, semaphores, mutexes, message queues, and memory heaps on RISC-V.',
        category: 'fundamentals',
        difficulty: 'hard',
        order: 1,
        points: 400,
        estimatedTime: 90,
        learningPathId: 'advanced',
        videoUrl: 'https://www.youtube.com/embed/F321087yYy4',
        videoTitle: 'FreeRTOS Tutorial for Embedded Systems',
        locked: false,
        lessons: [
          {
            id: 'rtos-1',
            title: 'RTOS Scheduling, Task Context Switching & Queues',
            videoUrl: 'https://www.youtube.com/embed/F321087yYy4',
            videoTitle: 'FreeRTOS Architecture & Context Switching',
            content: `When embedded applications grow complex with concurrent network, telemetry, and motor control tasks, a Real-Time Operating System provides deterministic scheduling.

## FreeRTOS Task Creation Example
\`\`\`c
#include "FreeRTOS.h"
#include "task.h"

void vTelemetryTask(void *pvParameters)
{
    while (1) {
        send_sensor_telemetry();
        vTaskDelay(pdMS_TO_TICKS(100)); // Delay for 100ms without blocking CPU
    }
}

int main(void)
{
    xTaskCreate(vTelemetryTask, "Telemetry", 512, NULL, tskIDLE_PRIORITY + 2, NULL);
    vTaskStartScheduler();
    while(1);
}
\`\`\``,
            order: 1,
            moduleId: 'rtos'
          }
        ]
      },
      {
        id: 'bootloaders',
        title: 'Bootloaders & XMODEM Protocol',
        description: 'Understand microcontroller boot sequences, reset vector mapping, and flashing firmware via UART XMODEM.',
        category: 'fundamentals',
        difficulty: 'hard',
        order: 2,
        points: 350,
        estimatedTime: 70,
        learningPathId: 'advanced',
        videoUrl: 'https://www.youtube.com/embed/K8vU_U3Yd4I',
        videoTitle: 'Microcontroller Bootloaders & Firmware Flashing',
        locked: false,
        lessons: [
          {
            id: 'boot-1',
            title: 'THEJAS32 UART Bootloader & XMODEM Flow',
            videoUrl: 'https://www.youtube.com/embed/K8vU_U3Yd4I',
            videoTitle: 'Bootloader Architecture & XMODEM Protocol',
            content: `The THEJAS32 contains a built-in ROM bootloader that executes when the BOOT SELECT pin is pulled HIGH during reset. It sends \`CCCC...\` bytes over UART0 requesting 128-byte XMODEM packet transfers.`,
            order: 1,
            moduleId: 'bootloaders'
          }
        ]
      },
      {
        id: 'ota-updates',
        title: 'OTA Firmware Updates with ESP32 Gateway',
        description: 'Implement wireless over-the-air firmware updates using ESP32 as a WiFi-to-UART gateway for the VEGA board.',
        category: 'fundamentals',
        difficulty: 'hard',
        order: 3,
        points: 400,
        estimatedTime: 80,
        learningPathId: 'advanced',
        videoUrl: 'https://www.youtube.com/embed/K8vU_U3Yd4I',
        videoTitle: 'Wireless OTA Firmware Update System',
        locked: false,
        lessons: [
          {
            id: 'ota-1',
            title: 'ESP32 Wireless Gateway & Fail-Safe Flashing',
            videoUrl: 'https://www.youtube.com/embed/K8vU_U3Yd4I',
            videoTitle: 'OTA Gateway Architecture and CRC Verification',
            content: `By pairing the VEGA ARIES v2 with an onboard ESP32 WiFi co-processor, new binary builds can be transferred wirelessly from the web browser to the THEJAS32 Flash memory.`,
            order: 1,
            moduleId: 'ota-updates'
          }
        ]
      }
    ]
  }
];

export const protocolLabs = {
  uart: {
    id: 'uart-lab',
    name: 'UART Protocol Lab',
    description: 'Universal Asynchronous Receiver-Transmitter: Point-to-point asynchronous full-duplex communication.',
    videoUrl: 'https://www.youtube.com/embed/IyGwvGzrqp8',
    videoTitle: 'Complete UART Protocol Masterclass & Hardware Interfacing',
    steps: [
      {
        id: 1,
        title: 'Concept & Overview',
        description: 'What is UART and fundamental asynchronous principles',
        videoUrl: 'https://www.youtube.com/embed/IyGwvGzrqp8',
        content: `UART (Universal Asynchronous Receiver/Transmitter) is one of the most reliable and ubiquitous serial communication interfaces in embedded hardware.

### Key Principles of UART
1. **Asynchronous Transmission**: Unlike I2C or SPI, UART requires no shared clock wire between devices. Instead, both the transmitter (TX) and receiver (RX) run at an identical agreed-upon speed known as the **Baud Rate**.
2. **Full-Duplex Communication**: Data can be sent and received simultaneously through dedicated TX and RX signal lines.
3. **Point-to-Point Topology**: Standard UART connects two devices directly without requiring bus addresses.`
      },
      {
        id: 2,
        title: 'Why UART is Used',
        description: 'Industry applications, debug consoles, and GPS telemetry',
        content: `### Why Developers Choose UART
- **Minimal Pin Count**: Only 2 wires (TX, RX) plus ground reference.
- **Simplicity**: No complex bus addressing or arbitration logic required in software.
- **Universal PC Compatibility**: Readily converts to USB via FTDI / CH340 / CP2102 ICs for live debugging.
- **Sensor Telemetry**: Widely used by GPS modules (NMEA-0183), Bluetooth HC-05, ESP8266/ESP32 AT commands, and GSM modems.`
      },
      {
        id: 3,
        title: 'How UART Works',
        description: 'Shift registers, parallel-to-serial conversion, and oversampling',
        content: `### Internal Hardware Operation
Inside the microcontroller UART peripheral:
1. **Transmit Path**: The CPU writes an 8-bit byte into the Transmit Data Register. A Shift Register automatically attaches the START bit (LOW), shifts the 8 data bits out sequentially onto the TX pin, adds an optional PARITY bit, and appends the STOP bit (HIGH).
2. **Receive Path**: The RX line is sampled continuously at **16x the baud rate**. When a falling edge is detected (START bit), the receiver counts 8 sample clocks to align to the middle of each subsequent bit, shifting bits into the Receive Data Buffer.`
      },
      {
        id: 4,
        title: 'TX / RX Wiring & Cross-Connection',
        description: 'Correct physical connections and common pitfalls',
        content: `### Wiring Rules
Always cross the communication lines:
- **Board TX** $\\rightarrow$ **Target RX**
- **Board RX** $\\rightarrow$ **Target TX**
- **GND** $\\rightarrow$ **GND** (Essential common ground voltage reference)

> **Warning**: Never connect TX to TX and RX to RX, as this creates a line conflict preventing transmission.`
      },
      {
        id: 5,
        title: 'Baud Rate & Calculation Formula',
        description: 'Clock prescaling and standard baud rates',
        content: `### Baud Rate Calculation Formula
$$\\text{Baud Divisor} = \\frac{F_{\\text{system clock}}}{16 \\times \\text{Baud Rate}}$$

### Common Standard Baud Rates:
- **9600 bps**: Legacy systems, long cable runs
- **115200 bps**: Standard VEGA debug output and bootloader communication
- **921600 bps**: High-speed firmware streaming`
      },
      {
        id: 6,
        title: 'Frame Format (8N1 Standard)',
        description: 'Start bit, 8 data bits, no parity, 1 stop bit',
        content: `### Frame Anatomy
- **Idle State**: Signal line remains HIGH (3.3V).
- **Start Bit**: 1-bit period held LOW (0V).
- **Data Bits**: 8 bits payload transmitted LSB (Least Significant Bit) first.
- **Parity Bit**: None in 8N1 (Optional Even/Odd for noisy environments).
- **Stop Bit**: 1-bit held HIGH (3.3V).`
      },
      {
        id: 7,
        title: 'THEJAS32 UART Register Setup',
        description: 'UART0_DATA, UART0_BAUD, UART0_CTRL register maps',
        content: `### Key Hardware Registers (UART0: 0x10010000)
- **UART_DATA (0x00)**: Read to fetch incoming RX byte; write to queue TX byte.
- **UART_BAUD (0x04)**: 16-bit clock divisor for baud rate generation.
- **UART_STATUS (0x08)**: Bit 0 = TX FIFO Ready; Bit 1 = RX Data Available; Bit 2 = Overrun Error.
- **UART_CTRL (0x0C)**: Bit 0 = Transmitter Enable; Bit 1 = Receiver Enable; Bit 2 = RX Interrupt Enable.`
      },
      {
        id: 8,
        title: 'Production Example Code',
        description: 'Complete C code for initialization and string transmission',
        content: `\`\`\`c
#include <stdint.h>
#include "uart.h"

void uart_init(uint32_t baud_rate)
{
    // Configure UART0 at specified baud rate
    uart_configure(UART0, baud_rate, UART_8N1);
}

void uart_write_string(const char *s)
{
    while (*s) {
        if (*s == '\\n') uart_write_byte(UART0, '\\r');
        uart_write_byte(UART0, *s++);
    }
}
\`\`\``
      }
    ]
  },
  i2c: {
    id: 'i2c-lab',
    name: 'I2C Protocol Lab',
    description: 'Inter-Integrated Circuit: Synchronous, multi-master, two-wire open-drain bus.',
    videoUrl: 'https://www.youtube.com/embed/6IAkYpmA1DQ',
    videoTitle: 'I2C Protocol Masterclass: Theory, Waveforms and C Drivers',
    steps: [
      {
        id: 1,
        title: 'Concept & Two-Wire Architecture',
        description: 'SDA and SCL bidirectional open-drain lines',
        videoUrl: 'https://www.youtube.com/embed/6IAkYpmA1DQ',
        content: `I2C connects multiple digital peripherals (sensors, EEPROMs, RTCs) to a host microcontroller over two shared wires using 7-bit addressing.`
      },
      {
        id: 2,
        title: 'Start, Stop & ACK/NACK Signaling',
        description: 'Bus conditions and 9th bit handshaking',
        content: `Every transaction begins with a **START condition** (SDA falling while SCL is HIGH) and concludes with a **STOP condition** (SDA rising while SCL is HIGH). The receiver acknowledges every 8-bit byte by pulling SDA LOW during the 9th clock pulse (ACK).`
      }
    ]
  },
  spi: {
    id: 'spi-lab',
    name: 'SPI Protocol Lab',
    description: 'Serial Peripheral Interface: Synchronous, high-speed full-duplex master-slave bus.',
    videoUrl: 'https://www.youtube.com/embed/0nNYNu_uTkg',
    videoTitle: 'SPI Communication Tutorial and Register Drivers',
    steps: [
      {
        id: 1,
        title: 'Concept & 4-Wire Interface',
        description: 'MOSI, MISO, SCLK, and Chip Select signals',
        videoUrl: 'https://www.youtube.com/embed/0nNYNu_uTkg',
        content: `SPI uses dedicated Chip Select (CS) lines for each slave device to enable transmission speeds reaching up to 50+ MHz.`
      },
      {
        id: 2,
        title: 'CPOL and CPHA Clock Modes',
        description: 'Clock Polarity (0/1) and Clock Phase (0/1) matrix',
        content: `Mode 0 (CPOL=0, CPHA=0) and Mode 3 (CPOL=1, CPHA=1) are the industry standards for Flash memory and graphical displays.`
      }
    ]
  }
};

export const sensorLabs = [
  {
    id: 'temp-sensor',
    name: 'Temperature Sensor',
    icon: '🌡️',
    interface: 'I2C / Analog',
    description: 'Read ambient temperature using LM35 (analog) and TMP102 / DS18B20 (digital I2C) sensors.',
    sections: ['Introduction', 'Working Principle', 'Hardware Connection', 'Pin Configuration', 'Wiring Diagram', 'Configuration', 'Example Code', 'Expected Output', 'Experiment', 'Quiz', 'Challenge'],
    starterCode: `#include "i2c.h"\n#include "uart.h"\n\n#define TEMP_ADDR 0x48\n\nint main(void)\n{\n    uart_init();\n    i2c_init();\n    while(1) {\n        uint8_t data[2];\n        i2c_read(I2C0, TEMP_ADDR, data, 2);\n        float temp = ((data[0] << 8) | data[1]) * 0.0625;\n        printf("Temperature: %.1f C\\r\\n", temp);\n        delay_ms(1000);\n    }\n}`,
  },
  {
    id: 'ultrasonic-sensor',
    name: 'Ultrasonic Sensor',
    icon: '📡',
    interface: 'GPIO',
    description: 'Measure precise object distance using the HC-SR04 ultrasonic sensor with Trigger and Echo timer capture.',
    sections: ['Introduction', 'Working Principle', 'Hardware Connection', 'Pin Configuration', 'Wiring Diagram', 'Configuration', 'Example Code', 'Expected Output', 'Experiment', 'Quiz', 'Challenge'],
    starterCode: `#include "gpio.h"\n#include "timer.h"\n\n#define TRIG_PIN 4\n#define ECHO_PIN 5\n\nfloat measure_distance(void)\n{\n    gpio_pin_set(TRIG_PIN, HIGH);\n    delay_us(10);\n    gpio_pin_set(TRIG_PIN, LOW);\n    uint32_t duration = pulse_in(ECHO_PIN, HIGH);\n    return duration * 0.034 / 2.0;\n}`,
  },
  {
    id: 'ir-sensor',
    name: 'IR Sensor',
    icon: '🔴',
    interface: 'GPIO / ADC',
    description: 'Detect obstacles and optical line tracking with infrared emitter-receiver photodiode pairs.',
    sections: ['Introduction', 'Working Principle', 'Hardware Connection', 'Pin Configuration', 'Configuration', 'Example Code', 'Expected Output', 'Experiment', 'Quiz', 'Challenge'],
    starterCode: `#include "gpio.h"\n\n#define IR_PIN 6\n#define LED_PIN 5\n\nint main(void)\n{\n    gpio_pin_configure(IR_PIN, GPIO_INPUT);\n    gpio_pin_configure(LED_PIN, GPIO_OUTPUT);\n    while(1) {\n        if (gpio_pin_read(IR_PIN) == LOW) {\n            gpio_pin_set(LED_PIN, HIGH);\n        } else {\n            gpio_pin_set(LED_PIN, LOW);\n        }\n        delay_ms(100);\n    }\n}`,
  },
  {
    id: 'light-sensor',
    name: 'Light Sensor',
    icon: '💡',
    interface: 'ADC',
    description: 'Measure ambient lux intensity using an LDR (Light Dependent Resistor) with the 10-bit ADC.',
    sections: ['Introduction', 'Working Principle', 'Hardware Connection', 'Pin Configuration', 'Configuration', 'Example Code', 'Expected Output', 'Experiment', 'Quiz', 'Challenge'],
    starterCode: `#include "adc.h"\n#include "uart.h"\n\n#define LDR_CHANNEL 0\n\nint main(void)\n{\n    adc_init();\n    uart_init();\n    while(1) {\n        uint16_t value = adc_read(LDR_CHANNEL);\n        float voltage = (value / 1023.0) * 3.3;\n        printf("Light Level: %d (%.2fV)\\r\\n", value, voltage);\n        delay_ms(500);\n    }\n}`,
  },
];

export const experiments = [
  {
    id: 'exp-led-blink',
    title: 'LED Blink & Wave Patterns',
    objective: 'Learn GPIO output configuration and timing delays on VEGA ARIES v2.',
    difficulty: 'easy',
    estimatedMin: 20,
    hardware: ['VEGA ARIES v2', 'USB-C Cable', 'LED', '330Ω Resistor'],
    steps: [
      { order: 1, title: 'Connect Hardware', description: 'Connect LED anode to GPIO 5 through a 330Ω resistor; connect cathode to GND.' },
      { order: 2, title: 'Configure Direction Register', description: 'Set Bit 5 in GPIO_DIR to 1 (Output mode).' },
      { order: 3, title: 'Toggle Output in Infinite Loop', description: 'Write 1 to turn LED ON, delay 500ms, write 0 to turn OFF.' },
      { order: 4, title: 'Build and Flash', description: 'Compile binary and flash to THEJAS32.' },
    ],
    moduleId: 'gpio',
  },
  {
    id: 'exp-uart-echo',
    title: 'UART Serial Terminal Echo',
    objective: 'Communicate with PC serial monitor at 115200 baud.',
    difficulty: 'easy',
    estimatedMin: 30,
    hardware: ['VEGA ARIES v2', 'USB Serial Cable'],
    steps: [
      { order: 1, title: 'Initialize UART0', description: 'Configure UART0 baud rate to 115200 with 8N1 framing.' },
      { order: 2, title: 'Send Greeting Message', description: 'Transmit banner string over TX line.' },
      { order: 3, title: 'Implement Echo Loop', description: 'Read RX FIFO when available and write back to TX.' },
    ],
    moduleId: 'uart-beginner',
  },
  {
    id: 'exp-i2c-scanner',
    title: 'I2C Bus Address Scanner',
    objective: 'Scan the I2C bus from 0x08 to 0x77 and identify connected slave devices.',
    difficulty: 'medium',
    estimatedMin: 35,
    hardware: ['VEGA ARIES v2', 'I2C Temperature Sensor', '4.7kΩ Pull-ups'],
    steps: [
      { order: 1, title: 'Initialize I2C0 Master', description: 'Configure 100 kHz standard mode clock.' },
      { order: 2, title: 'Sweep 7-bit Addresses', description: 'Send START + Address + Write bit.' },
      { order: 3, title: 'Check ACK Response', description: 'Print hex address if ACK received from device.' },
    ],
    moduleId: 'i2c-protocol',
  }
];

export const badges = [
  { id: 'badge-c-master', name: 'Embedded C Master', description: 'Completed Embedded C Basics course', icon: '⚡', earned: true, criteria: 'Complete Embedded C Basics module' },
  { id: 'badge-riscv-pioneer', name: 'RISC-V Pioneer', description: 'Mastered THEJAS32 RISC-V Architecture', icon: '🚀', earned: true, criteria: 'Complete Microcontroller Basics' },
  { id: 'badge-protocol-expert', name: 'Protocol Expert', description: 'Mastered all communication protocols', icon: '🏆', earned: false, criteria: 'Complete UART, I2C, and SPI modules' },
  { id: 'badge-flasher', name: 'OTA Engineer', description: 'Flashed firmware via wireless OTA gateway', icon: '📶', earned: false, criteria: 'Successfully flash firmware over OTA' },
];

export const challenges = [
  {
    id: 'ch-bit-manipulation',
    title: 'Bit Manipulation Wizard',
    description: 'Implement a function to configure a peripheral control register with given bitmasks without disturbing other bits.',
    difficulty: 'easy' as const,
    points: 100,
    requirements: ['Set bits 2 and 5', 'Clear bit 7', 'Leave other bits unchanged'],
    hints: ['Use bitwise OR with (1 << 2) | (1 << 5)', 'Use bitwise AND with ~(1 << 7)'],
    starterCode: `#include <stdint.h>\n\nuint32_t configure_register(uint32_t reg)\n{\n    // TODO: Set bit 2 and 5, Clear bit 7\n    return reg;\n}`,
    testCases: [
      { id: 'tc1', input: '0x00000000', expectedOutput: '0x00000024', description: 'Zero initial value' },
      { id: 'tc2', input: '0x00000080', expectedOutput: '0x00000024', description: 'Bit 7 cleared' },
    ],
    moduleId: 'embedded-c-basics',
  },
  {
    id: 'ch-uart-checksum',
    title: 'UART Packet Checksum Validator',
    description: 'Calculate and verify XOR checksum for incoming telemetry frames.',
    difficulty: 'medium' as const,
    points: 150,
    requirements: ['Calculate XOR of all payload bytes', 'Compare with frame checksum byte', 'Return 1 for valid, 0 for invalid'],
    hints: ['Iterate through array with XOR (^) accumulator'],
    starterCode: `#include <stdint.h>\n\nint validate_checksum(const uint8_t *packet, uint8_t len)\n{\n    // TODO: Verify XOR checksum\n    return 0;\n}`,
    testCases: [
      { id: 'tc1', input: '[0xAA, 0x01, 0x02, 0xA9]', expectedOutput: '1', description: 'Valid frame' },
    ],
    moduleId: 'uart-beginner',
  },
  {
    id: 'ch-i2c-scanner',
    title: 'I2C Bus Scanner',
    description: 'Write a program to scan the I2C bus and find all connected slave devices.',
    difficulty: 'hard' as const,
    points: 200,
    requirements: ['Scan addresses 0x08 to 0x77', 'Handle ACK/NACK responses', 'Return count of active devices'],
    hints: ['Check the return value of i2c_write address test'],
    starterCode: `#include <stdint.h>\n\nint scan_i2c_bus(void)\n{\n    // TODO: Sweep 7-bit addresses\n    return 0;\n}`,
    testCases: [
      { id: 'tc1', input: 'Scan bus', expectedOutput: 'Device detected', description: 'Find devices' },
    ],
    moduleId: 'i2c-protocol',
  }
];

export const quizzes = [
  {
    id: 'quiz-embedded-c',
    title: 'Embedded C Fundamentals Quiz',
    moduleId: 'embedded-c-basics',
    questions: [
      {
        id: 'q1',
        type: 'mcq' as const,
        question: 'Why is the volatile keyword required for memory-mapped hardware registers?',
        options: [
          'To make the code execute faster',
          'To prevent the compiler from caching the register value in a CPU register',
          'To allocate the variable in Flash instead of RAM',
          'To enable 64-bit arithmetic'
        ],
        correctAns: 'To prevent the compiler from caching the register value in a CPU register',
        explanation: 'Volatile informs the compiler that the value at this memory address can change asynchronously due to hardware events.',
        points: 25
      },
      {
        id: 'q2',
        type: 'mcq' as const,
        question: 'Which C expression correctly sets Bit 4 of a register without modifying any other bits?',
        options: [
          'REG = (1 << 4);',
          'REG &= (1 << 4);',
          'REG |= (1 << 4);',
          'REG ^= ~(1 << 4);'
        ],
        correctAns: 'REG |= (1 << 4);',
        explanation: 'Bitwise OR with (1 << 4) sets bit 4 to 1 while leaving all other bits unchanged.',
        points: 25
      }
    ]
  },
  {
    id: 'quiz-uart',
    title: 'UART Protocol Quiz',
    moduleId: 'uart-beginner',
    questions: [
      {
        id: 'uq1',
        type: 'mcq' as const,
        question: 'What is the standard idle state voltage level of a UART transmission line?',
        options: ['0V (LOW)', '3.3V / 5V (HIGH)', 'High Impedance (Floating)', 'Alternating Clock'],
        correctAns: '3.3V / 5V (HIGH)',
        explanation: 'UART lines idle HIGH so that the transition to LOW for the START bit can be immediately detected.',
        points: 25
      }
    ]
  }
];


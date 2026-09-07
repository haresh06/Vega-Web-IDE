export interface QuizQuestion {
  id: string;
  question: string;
  codeSnippet?: string;
  type?: 'mcq' | 'code_output' | 'concept' | 'register';
  options: string[];
  correctAns: string;
  explanation: string;
  points: number;
}

export interface QuizTopic {
  id: string;
  topicNumber: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  longDescription: string;
  estimatedTime: string;
  points: number;
  questions: QuizQuestion[];
}

export const quizTopics: QuizTopic[] = [
  // ==========================================================================
  // BEGINNER TOPICS (10)
  // ==========================================================================
  {
    id: 'embedded-c-basics',
    topicNumber: '01',
    title: 'Embedded C Basics',
    difficulty: 'beginner',
    description: 'Data types, memory keywords, volatile qualifier, and syntax fundamentals.',
    longDescription: 'Test your understanding of embedded C data types, volatile qualifiers, fixed-width integers from <stdint.h>, and essential compilation concepts on VEGA ARIES v2.0.',
    estimatedTime: '10 mins',
    points: 100,
    questions: [
      {
        id: 'ec-1',
        question: 'What does the volatile keyword indicate in embedded C?',
        options: [
          'It prevents the compiler from removing or caching required accesses to a variable.',
          'It permanently stores the variable in Flash memory instead of RAM.',
          'It automatically converts the variable into a read-only constant.',
          'It increases the CPU clock frequency whenever the variable is read.'
        ],
        correctAns: 'It prevents the compiler from removing or caching required accesses to a variable.',
        explanation: 'The volatile keyword informs the compiler that a memory address can be modified asynchronously by external hardware, peripheral registers, or interrupt routines, preventing dangerous optimizer caching.',
        points: 10
      },
      {
        id: 'ec-2',
        question: 'Why should fixed-width types like uint32_t from <stdint.h> be used in embedded software instead of standard unsigned int?',
        options: [
          'Because uint32_t guarantees an exact 32-bit width across all compiler targets and architectures.',
          'Because standard int is automatically compressed to 8 bits by the linker.',
          'Because uint32_t variables bypass RAM and run directly on CPU registers.',
          'Because standard int does not support addition or subtraction operations.'
        ],
        correctAns: 'Because uint32_t guarantees an exact 32-bit width across all compiler targets and architectures.',
        explanation: 'In embedded firmware, standard C types (like int or long) have platform-dependent sizes. Fixed-width types guarantee exact bit widths required for hardware peripheral registers.',
        points: 10
      },
      {
        id: 'ec-3',
        question: 'What is the binary result of the bitwise OR expression: (0x0C | 0x03)?',
        codeSnippet: `uint8_t a = 0x0C; // 0000 1100\nuint8_t b = 0x03; // 0000 0011\nuint8_t c = a | b;`,
        options: [
          '0x0F (0000 1111)',
          '0x00 (0000 0000)',
          '0x0C (0000 1100)',
          '0xFF (1111 1111)'
        ],
        correctAns: '0x0F (0000 1111)',
        explanation: 'Bitwise OR (|) produces a 1 in each bit position where either operand has a 1. Combining 0000 1100 with 0000 0011 yields 0000 1111 (0x0F).',
        points: 10
      },
      {
        id: 'ec-4',
        question: 'Which statement correctly defines an infinite embedded super-loop in main()?',
        options: [
          'while (1) { /* loop body */ }',
          'if (true) { /* loop body */ }',
          'for (int i = 0; i < 100; i--) { /* loop body */ }',
          'return 0;'
        ],
        correctAns: 'while (1) { /* loop body */ }',
        explanation: 'Bare-metal embedded systems do not have an operating system to return to. The firmware runs in an infinite while (1) or for (;;) loop.',
        points: 10
      },
      {
        id: 'ec-5',
        question: 'What is the purpose of header guards (#ifndef ... #define ... #endif) in C header files?',
        options: [
          'To prevent multiple definitions when the header is included multiple times in a build.',
          'To encrypt the source code before sending it to the compiler.',
          'To speed up CPU clock execution speed at runtime.',
          'To automatically allocate static variables in heap memory.'
        ],
        correctAns: 'To prevent multiple definitions when the header is included multiple times in a build.',
        explanation: 'Header guards ensure the preprocessor only includes the file declarations once per translation unit, preventing duplicate declaration errors during compilation.',
        points: 10
      },
      {
        id: 'ec-6',
        question: 'What does the static keyword do when placed before a global variable in a .c source file?',
        options: [
          'It restricts the variable scope exclusively to that translation unit (.c file).',
          'It makes the variable read-only like const.',
          'It moves the variable into the CPU instruction cache.',
          'It causes the variable value to reset to 0 every millisecond.'
        ],
        correctAns: 'It restricts the variable scope exclusively to that translation unit (.c file).',
        explanation: 'In C, internal linkage (static on global variables or functions) hides the symbol from other source files, providing encapsulation and preventing naming collisions.',
        points: 10
      },
      {
        id: 'ec-7',
        question: 'How do you dereference a hardware pointer at address 0x10080000 in C?',
        codeSnippet: `volatile uint32_t *reg = (volatile uint32_t *)0x10080000;\n*reg = 0x01;`,
        options: [
          'Using the asterisk (*) operator to write or read the memory location pointed to by reg.',
          'Using the ampersand (&) operator.',
          'Using the arrow (->) operator on raw integers.',
          'By casting the integer directly without a pointer.'
        ],
        correctAns: 'Using the asterisk (*) operator to write or read the memory location pointed to by reg.',
        explanation: 'Dereferencing (*reg) tells the CPU to perform a store (or load) bus instruction at the specific 32-bit physical memory address.',
        points: 10
      },
      {
        id: 'ec-8',
        question: 'What is the size of uint16_t on a 32-bit RISC-V microcontroller?',
        options: [
          '2 bytes (16 bits)',
          '4 bytes (32 bits)',
          '1 byte (8 bits)',
          '8 bytes (64 bits)'
        ],
        correctAns: '2 bytes (16 bits)',
        explanation: 'uint16_t is guaranteed to be exactly 16 bits (2 bytes) in size on all platforms complying with the C99 standard.',
        points: 10
      },
      {
        id: 'ec-9',
        question: 'What happens when a uint8_t variable with value 255 is incremented by 1?',
        options: [
          'It overflows and wraps around to 0.',
          'It causes a CPU hard-fault exception.',
          'It becomes 256 without wrapping.',
          'It converts into a negative signed integer.'
        ],
        correctAns: 'It overflows and wraps around to 0.',
        explanation: 'Unsigned 8-bit integers can represent values from 0 to 255 (0xFF). Adding 1 to 0xFF results in 0x00 due to modulo arithmetic.',
        points: 10
      },
      {
        id: 'ec-10',
        question: 'Which header file provides standard boolean types (bool, true, false) in C99?',
        options: [
          '<stdbool.h>',
          '<stdio.h>',
          '<math.h>',
          '<stdlib.h>'
        ],
        correctAns: '<stdbool.h>',
        explanation: 'In C99 and later, <stdbool.h> defines bool, true (1), and false (0) for clear boolean logic.',
        points: 10
      }
    ]
  },
  {
    id: 'microcontroller-basics',
    topicNumber: '02',
    title: 'Microcontroller Basics',
    difficulty: 'beginner',
    description: 'CPU cores, memory hierarchy, bus interfaces, clock trees, and peripherals.',
    longDescription: 'Explore microcontroller architecture, internal memory organisation (Flash vs SRAM), peripheral bus interconnects, and clock distribution systems on VEGA ARIES v2.0.',
    estimatedTime: '10 mins',
    points: 100,
    questions: [
      {
        id: 'mb-1',
        question: 'What is the main difference between Flash memory and SRAM in a microcontroller?',
        options: [
          'Flash is non-volatile for program instructions, while SRAM is volatile for runtime data.',
          'Flash is used only for variables, while SRAM stores the bootloader.',
          'SRAM retains data when powered off, while Flash loses all content.',
          'Flash and SRAM have identical speed and volatility characteristics.'
        ],
        correctAns: 'Flash is non-volatile for program instructions, while SRAM is volatile for runtime data.',
        explanation: 'Flash memory retains program firmware code when power is disconnected (non-volatile), whereas SRAM holds stack, heap, and global variables during runtime (volatile).',
        points: 10
      },
      {
        id: 'mb-2',
        question: 'What is the function of the Program Counter (PC) register in a RISC-V processor?',
        options: [
          'It holds the memory address of the current or next instruction to be fetched and executed.',
          'It counts the total number of clock cycles since power-on.',
          'It stores the result of the last arithmetic operation.',
          'It controls the voltage regulator on the development board.'
        ],
        correctAns: 'It holds the memory address of the current or next instruction to be fetched and executed.',
        explanation: 'The Program Counter (PC) points to the active instruction address in memory. It increments automatically as instructions execute.',
        points: 10
      },
      {
        id: 'mb-3',
        question: 'What operating clock frequency does the THEJAS32 RISC-V core on VEGA ARIES v2.0 run at?',
        options: [
          '100 MHz',
          '16 MHz',
          '1 GHz',
          '32 kHz'
        ],
        correctAns: '100 MHz',
        explanation: 'The VEGA ARIES v2.0 development board features the THEJAS32 RISC-V core running at a default operating clock frequency of 100 MHz.',
        points: 10
      },
      {
        id: 'mb-4',
        question: 'What does Memory-Mapped I/O (MMIO) mean in microcontroller architectures?',
        options: [
          'Peripheral hardware registers are mapped directly into the CPU standard memory address space.',
          'All I/O pins must be connected to an external SD card.',
          'Peripherals can only be accessed using specialized assembly I/O instructions.',
          'RAM and Flash are merged into a single physical silicon block.'
        ],
        correctAns: 'Peripheral hardware registers are mapped directly into the CPU standard memory address space.',
        explanation: 'In MMIO, hardware peripheral control and data registers share the same 32-bit address space as RAM, so standard pointer load/store instructions read and write hardware.',
        points: 10
      },
      {
        id: 'mb-5',
        question: 'What is the role of a Watchdog Timer (WDT) in embedded systems?',
        options: [
          'To reset the microcontroller if software hangs or enters an unintended infinite loop.',
          'To measure the ambient temperature of the board.',
          'To encrypt outgoing UART telemetry packets.',
          'To keep track of real-world calendar dates and hours.'
        ],
        correctAns: 'To reset the microcontroller if software hangs or enters an unintended infinite loop.',
        explanation: 'A Watchdog Timer is an autonomous hardware timer that resets the system if the firmware fails to periodically "kick" or service it due to a software crash.',
        points: 10
      },
      {
        id: 'mb-6',
        question: 'Which peripheral is primarily used to convert analog voltage signals into digital numbers?',
        options: [
          'ADC (Analog-to-Digital Converter)',
          'DAC (Digital-to-Analog Converter)',
          'PWM (Pulse Width Modulation)',
          'UART (Universal Asynchronous Receiver-Transmitter)'
        ],
        correctAns: 'ADC (Analog-to-Digital Converter)',
        explanation: 'An ADC samples continuous physical analog voltages (e.g. from a sensor or potentiometer) and converts them into discrete binary integer values.',
        points: 10
      },
      {
        id: 'mb-7',
        question: 'What is the primary purpose of a Phase-Locked Loop (PLL) in a microcontroller?',
        options: [
          'To multiply a lower crystal oscillator frequency into a high-speed system clock (e.g. 100 MHz).',
          'To lock the flash memory against unauthorized reads.',
          'To regulate 5V input down to 3.3V power rails.',
          'To synchronize SPI slave chip-select lines.'
        ],
        correctAns: 'To multiply a lower crystal oscillator frequency into a high-speed system clock (e.g. 100 MHz).',
        explanation: 'A PLL synthesizes high-frequency clock signals from stable low-frequency reference crystals (e.g. 20 MHz crystal multiplied up to 100 MHz CPU core clock).',
        points: 10
      },
      {
        id: 'mb-8',
        question: 'What size is the on-chip SRAM on the VEGA ARIES v2.0 board?',
        options: [
          '256 KB',
          '16 KB',
          '2 MB',
          '4 GB'
        ],
        correctAns: '256 KB',
        explanation: 'The VEGA ARIES v2.0 board equipped with THEJAS32 features 256 KB of internal SRAM and 2 MB of external SPI Flash memory.',
        points: 10
      },
      {
        id: 'mb-9',
        question: 'What happens during a hardware Power-On Reset (POR)?',
        options: [
          'All registers and peripheral hardware reset to their defined initial states and execution begins at the reset vector.',
          'Flash memory is completely erased.',
          'The CPU clock frequency is permanently doubled.',
          'The board disables all GPIO pull-down resistors permanently.'
        ],
        correctAns: 'All registers and peripheral hardware reset to their defined initial states and execution begins at the reset vector.',
        explanation: 'POR initializes the internal logic when power reaches stable operational threshold, resets CPU registers, and branches to the starting boot address.',
        points: 10
      },
      {
        id: 'mb-10',
        question: 'Which bus architecture connects the CPU core to fast internal memories and peripherals in 32-bit SoCs?',
        options: [
          'AHB / APB (Advanced High-performance Bus / Peripheral Bus)',
          'RS-232',
          '1-Wire',
          'I2S'
        ],
        correctAns: 'AHB / APB (Advanced High-performance Bus / Peripheral Bus)',
        explanation: 'SoC buses like AHB and APB interconnect high-speed processors, internal SRAM, and peripheral controllers over structured address and data lines.',
        points: 10
      }
    ]
  },
  {
    id: 'gpio',
    topicNumber: '03',
    title: 'GPIO',
    difficulty: 'beginner',
    description: 'Digital input/output, direction registers, pull-up/pull-down, and pin control.',
    longDescription: 'Test your understanding of GPIO configuration, direction registers (DIR), data input/output registers (DATA_IN / DATA_OUT), and pull configuration on VEGA ARIES v2.0.',
    estimatedTime: '10 mins',
    points: 100,
    questions: [
      {
        id: 'gp-1',
        question: 'How do you configure a GPIO pin as a digital output on a microcontroller?',
        options: [
          'By setting the corresponding bit in the GPIO Direction register to 1 (OUTPUT).',
          'By writing 1 to the analog ADC control register.',
          'By setting the UART baud rate register.',
          'By grounding the reset pin on the development board.'
        ],
        correctAns: 'By setting the corresponding bit in the GPIO Direction register to 1 (OUTPUT).',
        explanation: 'The GPIO Direction register controls whether the pin driver buffer is enabled as an output (1) or high-impedance input (0).',
        points: 10
      },
      {
        id: 'gp-2',
        question: 'What is the purpose of an internal pull-up resistor on a GPIO input pin?',
        options: [
          'To ensure the input pin reads a defined HIGH logic state when no external switch or sensor is driving it.',
          'To deliver maximum current to an external motor.',
          'To convert the digital pin into a high-resolution ADC input.',
          'To invert the CPU instruction clock.'
        ],
        correctAns: 'To ensure the input pin reads a defined HIGH logic state when no external switch or sensor is driving it.',
        explanation: 'Floating input pins pick up ambient electromagnetic noise. A pull-up resistor holds the input at a stable HIGH voltage until an active-low switch pulls it to ground.',
        points: 10
      },
      {
        id: 'gp-3',
        question: 'What bitwise operation toggles (flips) GPIO Pin 5 without altering any other pin?',
        codeSnippet: `// Toggle Pin 5\nGPIO_DATA_REG ^= (1 << 5);`,
        options: [
          'Bitwise XOR (^=) with (1 << 5)',
          'Bitwise AND (&=) with (1 << 5)',
          'Bitwise OR (|=) with (1 << 5)',
          'Bitwise NOT (~=) with 0xFF'
        ],
        correctAns: 'Bitwise XOR (^=) with (1 << 5)',
        explanation: 'Bitwise XOR with a 1 inverts that specific bit (0 becomes 1, 1 becomes 0), while XORing with 0 preserves all other bits.',
        points: 10
      },
      {
        id: 'gp-4',
        question: 'What logic voltage level corresponds to digital HIGH on VEGA ARIES v2.0 GPIO pins?',
        options: [
          '3.3 Volts',
          '12.0 Volts',
          '1.0 Volt',
          '24.0 Volts'
        ],
        correctAns: '3.3 Volts',
        explanation: 'VEGA ARIES v2.0 operates at standard 3.3V CMOS logic levels, where ~3.3V is digital HIGH and 0V (GND) is digital LOW.',
        points: 10
      },
      {
        id: 'gp-5',
        question: 'What is the primary symptom of leaving a GPIO input pin floating (neither pulled up nor pulled down)?',
        options: [
          'The pin reads random, fluctuating 0 and 1 values due to ambient electrical noise.',
          'The microcontroller permanently burns out.',
          'The Flash memory is instantly erased.',
          'The CPU stops executing instructions.'
        ],
        correctAns: 'The pin reads random, fluctuating 0 and 1 values due to ambient electrical noise.',
        explanation: 'A floating CMOS gate has extremely high input impedance and will randomly fluctuate between HIGH and LOW due to capacitive coupling and EMI noise.',
        points: 10
      },
      {
        id: 'gp-6',
        question: 'Which C expression correctly checks if Pin 3 is HIGH in the GPIO_INPUT_REG register?',
        codeSnippet: `if (GPIO_INPUT_REG & (1 << 3)) {\n    // Pin 3 is HIGH\n}`,
        options: [
          'GPIO_INPUT_REG & (1 << 3)',
          'GPIO_INPUT_REG | (1 << 3)',
          'GPIO_INPUT_REG == 3',
          'GPIO_INPUT_REG >> 3 == 0'
        ],
        correctAns: 'GPIO_INPUT_REG & (1 << 3)',
        explanation: 'Bitwise AND with mask (1 << 3) isolates bit 3. If bit 3 is 1, the result is non-zero (true); if 0, the result is 0 (false).',
        points: 10
      },
      {
        id: 'gp-7',
        question: 'Why is a current-limiting resistor required when connecting an LED to a GPIO output pin?',
        options: [
          'To prevent excessive current that could damage the LED and the microcontroller GPIO output driver.',
          'To increase the brightness of the LED.',
          'To slow down the light output frequency.',
          'To convert alternating current into direct current.'
        ],
        correctAns: 'To prevent excessive current that could damage the LED and the microcontroller GPIO output driver.',
        explanation: 'LEDs have very low dynamic resistance once forward voltage threshold is exceeded. A resistor limits the current to safe operational levels (e.g. 5–15 mA).',
        points: 10
      },
      {
        id: 'gp-8',
        question: 'What does "Open-Drain" (or Open-Collector) GPIO output configuration mean?',
        options: [
          'The pin can actively pull the line LOW to GND, but cannot drive HIGH (requires an external pull-up resistor).',
          'The pin is permanently disconnected from the chip.',
          'The pin outputs full 5V logic regardless of power supply.',
          'The pin acts only as a high-speed analog DAC output.'
        ],
        correctAns: 'The pin can actively pull the line LOW to GND, but cannot drive HIGH (requires an external pull-up resistor).',
        explanation: 'Open-drain outputs have only the low-side NMOS transistor active. Multiple devices can share the same line (wired-AND) as in I2C buses.',
        points: 10
      },
      {
        id: 'gp-9',
        question: 'What is switch contact "bouncing" when reading a pushbutton GPIO?',
        options: [
          'Mechanical metal contacts rapidly make and break connection for a few milliseconds, producing multiple false transitions.',
          'The pushbutton generates high-voltage inductive spikes.',
          'The GPIO pin switches between input and output mode automatically.',
          'The CPU clock doubles whenever a button is pressed.'
        ],
        correctAns: 'Mechanical metal contacts rapidly make and break connection for a few milliseconds, producing multiple false transitions.',
        explanation: 'When mechanical switch contacts collide, they bounce mechanically for 5–20 ms, generating multiple digital edge pulses that must be filtered using software or hardware debouncing.',
        points: 10
      },
      {
        id: 'gp-10',
        question: 'On VEGA ARIES v2.0, which on-board GPIO pin is commonly connected to the user testing LED?',
        options: [
          'GPIO 5',
          'GPIO 128',
          'GPIO 0 (Reset)',
          'GPIO 99'
        ],
        correctAns: 'GPIO 5',
        explanation: 'On the VEGA ARIES v2.0 board, GPIO Pin 5 is wired to the user-controllable test LED.',
        points: 10
      }
    ]
  },
  {
    id: 'timers',
    topicNumber: '04',
    title: 'Timers',
    difficulty: 'beginner',
    description: 'Hardware counter registers, prescalers, compare match, and precise time delays.',
    longDescription: 'Master hardware timer peripherals, prescaler calculations, auto-reload registers, periodic interrupt generation, and millisecond/microsecond timing on VEGA ARIES v2.0.',
    estimatedTime: '10 mins',
    points: 100,
    questions: [
      {
        id: 'tm-1',
        question: 'Why are hardware timers preferred over software delay loops (like empty for-loops)?',
        options: [
          'Hardware timers run autonomously without wasting CPU cycles and provide exact deterministic timing independent of compiler optimization.',
          'Software loops consume less electrical power than timers.',
          'Hardware timers only work when connected to the internet.',
          'Software delay loops are faster than hardware clock speeds.'
        ],
        correctAns: 'Hardware timers run autonomously without wasting CPU cycles and provide exact deterministic timing independent of compiler optimization.',
        explanation: 'Software delay loops waste 100% of CPU cycles and vary based on compiler flags and CPU frequency. Hardware timers count independently in silicon.',
        points: 10
      },
      {
        id: 'tm-2',
        question: 'What is the function of a Timer Prescaler?',
        options: [
          'It divides the incoming high-speed peripheral clock frequency to slow down the timer count rate.',
          'It increases the maximum number of timer channels.',
          'It changes the output voltage of timer pins.',
          'It multiplies the CPU clock speed.'
        ],
        correctAns: 'It divides the incoming high-speed peripheral clock frequency to slow down the timer count rate.',
        explanation: 'A prescaler divides the input clock (e.g. 100 MHz clock divided by 100 yields a 1 MHz timer tick rate = 1 microsecond per tick).',
        points: 10
      },
      {
        id: 'tm-3',
        question: 'If a timer is clocked at 100 MHz and configured with a prescaler of 100, what is the frequency of the timer counter?',
        options: [
          '1 MHz (1,000,000 counts per second)',
          '100 MHz',
          '10 kHz',
          '500 Hz'
        ],
        correctAns: '1 MHz (1,000,000 counts per second)',
        explanation: 'Timer Frequency = Input Clock / Prescaler = 100,000,000 Hz / 100 = 1,000,000 Hz (1 MHz = 1 tick every microsecond).',
        points: 10
      },
      {
        id: 'tm-4',
        question: 'What happens when an up-counting timer reaches its Compare Match value in Auto-Reload mode?',
        options: [
          'It triggers an event or interrupt, resets the counter back to 0, and continues counting.',
          'The microcontroller shuts down permanently.',
          'The timer prescaler is multiplied by 2.',
          'The timer is permanently disabled until power cycle.'
        ],
        correctAns: 'It triggers an event or interrupt, resets the counter back to 0, and continues counting.',
        explanation: 'Auto-Reload timers generate exact periodic interrupts indefinitely by resetting to 0 each time the compare limit is reached.',
        points: 10
      },
      {
        id: 'tm-5',
        question: 'What is the maximum count value of a 16-bit timer counter register?',
        options: [
          '65,535 (0xFFFF)',
          '255 (0xFF)',
          '1,000,000',
          '4,294,967,295'
        ],
        correctAns: '65,535 (0xFFFF)',
        explanation: 'A 16-bit counter register can represent values from 0 to (2^16 - 1) = 65,535.',
        points: 10
      },
      {
        id: 'tm-6',
        question: 'What is the difference between a periodic timer and a one-shot timer?',
        options: [
          'A periodic timer repeats continuously, while a one-shot timer triggers an event once and stops.',
          'A one-shot timer only counts down, while periodic timers only count up.',
          'Periodic timers do not require a clock source.',
          'One-shot timers require external 5V power.'
        ],
        correctAns: 'A periodic timer repeats continuously, while a one-shot timer triggers an event once and stops.',
        explanation: 'One-shot timers count to the target once and halt, ideal for single timeouts. Periodic timers reload and repeat continuously.',
        points: 10
      },
      {
        id: 'tm-7',
        question: 'Which register stores the current instantaneous count value of a hardware timer?',
        options: [
          'Counter Register (CNT / TCNT)',
          'Prescaler Configuration Register (PSC)',
          'Baud Rate Generator (BRG)',
          'Interrupt Vector Table (IVT)'
        ],
        correctAns: 'Counter Register (CNT / TCNT)',
        explanation: 'The CNT register holds the current real-time integer count that increments or decrements with every prescaled clock edge.',
        points: 10
      },
      {
        id: 'tm-8',
        question: 'How is a 1 ms (1000 Hz) periodic interrupt configured with a 1 MHz timer tick clock?',
        options: [
          'Set the Auto-Reload Compare register to 1000 counts.',
          'Set the Auto-Reload Compare register to 100,000 counts.',
          'Set the Prescaler to 10,000,000.',
          'Enable the analog comparator.'
        ],
        correctAns: 'Set the Auto-Reload Compare register to 1000 counts.',
        explanation: 'At 1 MHz (1 count = 1 microsecond), counting 1000 ticks takes exactly 1000 microseconds = 1 millisecond.',
        points: 10
      },
      {
        id: 'tm-9',
        question: 'What is Input Capture mode in hardware timer peripherals?',
        options: [
          'Recording the exact timer counter value into a register upon detecting an external digital pin edge (e.g. measuring signal pulse width).',
          'Capturing digital photos using camera sensor.',
          'Converting microphone audio to PWM.',
          'Streaming SPI data directly into Flash.'
        ],
        correctAns: 'Recording the exact timer counter value into a register upon detecting an external digital pin edge (e.g. measuring signal pulse width).',
        explanation: 'Input capture latches the counter timestamp precisely when an external edge occurs, allowing sub-microsecond pulse-width and frequency measurement.',
        points: 10
      },
      {
        id: 'tm-10',
        question: 'What should be done inside a Timer Interrupt Service Routine (ISR) when the timer fires?',
        options: [
          'Clear the timer interrupt pending flag and keep execution as fast as possible.',
          'Execute long delay loops and blocking printf statements.',
          'Re-flash the bootloader.',
          'Disable the CPU clock oscillator.'
        ],
        correctAns: 'Clear the timer interrupt pending flag and keep execution as fast as possible.',
        explanation: 'Failing to clear the interrupt flag causes the CPU to immediately re-enter the ISR in an infinite loop upon exit.',
        points: 10
      }
    ]
  },
  {
    id: 'uart',
    topicNumber: '05',
    title: 'UART',
    difficulty: 'beginner',
    description: 'Asynchronous serial protocol, baud rates, TX/RX framing, parity, and stop bits.',
    longDescription: 'Explore UART serial communication, framing formats (8N1), start and stop bit synchronization, baud rate divisor calculations, and TX/RX buffer management on VEGA ARIES v2.0.',
    estimatedTime: '10 mins',
    points: 100,
    questions: [
      {
        id: 'ua-1',
        question: 'Why is UART called an "asynchronous" communication protocol?',
        options: [
          'Because it does not transmit a shared clock signal; both sender and receiver agree on a predefined baud rate beforehand.',
          'Because communication only flows in one direction.',
          'Because data is transmitted over analog radio waves.',
          'Because each byte takes a random duration to transmit.'
        ],
        correctAns: 'Because it does not transmit a shared clock signal; both sender and receiver agree on a predefined baud rate beforehand.',
        explanation: 'Unlike SPI or I2C, UART transmits only TX and RX lines without a clock line. Synchronization is established per frame using the Start bit and agreed baud rate.',
        points: 10
      },
      {
        id: 'ua-2',
        question: 'What does the standard UART configuration "8N1" stand for?',
        options: [
          '8 Data bits, No parity bit, 1 Stop bit',
          '8 Stop bits, Negative logic, 1 Data bit',
          '8 Baud rate multipliers, Non-blocking, 1 Channel',
          '8-byte FIFO, Noise filter enabled, 1 Start bit'
        ],
        correctAns: '8 Data bits, No parity bit, 1 Stop bit',
        explanation: '8N1 is the universal serial configuration: 8 data bits per character, no parity check bit, and 1 stop bit at the end of the frame.',
        points: 10
      },
      {
        id: 'ua-3',
        question: 'How should the TX and RX pins be connected between two UART devices?',
        options: [
          'Device A TX connects to Device B RX, and Device A RX connects to Device B TX (crossed connection with common GND).',
          'Device A TX connects to Device B TX, and RX connects to RX.',
          'TX and RX must be shorted together to VCC.',
          'Only one pin is required with no ground connection.'
        ],
        correctAns: 'Device A TX connects to Device B RX, and Device A RX connects to Device B TX (crossed connection with common GND).',
        explanation: 'Transmitted data (TX) from one device must feed into the receiving input (RX) of the other device, sharing a common electrical ground reference.',
        points: 10
      },
      {
        id: 'ua-4',
        question: 'What is the idle state voltage on a standard UART transmission line?',
        options: [
          'Logic HIGH (Mark state, 3.3V)',
          'Logic LOW (Space state, 0V)',
          'High impedance (floating)',
          '-12V'
        ],
        correctAns: 'Logic HIGH (Mark state, 3.3V)',
        explanation: 'UART idle lines sit at logic HIGH. The transmission of a byte begins with a transition to logic LOW (the Start bit).',
        points: 10
      },
      {
        id: 'ua-5',
        question: 'What is the standard default baud rate used for serial debugging on VEGA ARIES v2.0?',
        options: [
          '115,200 baud',
          '9,600 baud',
          '1,000,000 baud',
          '300 baud'
        ],
        correctAns: '115,200 baud',
        explanation: '115,200 baud is the high-speed standard used across the VEGA ARIES v2.0 bootloader, serial console, and ESP32 gateway communication.',
        points: 10
      },
      {
        id: 'ua-6',
        question: 'What is a UART "Framing Error"?',
        options: [
          'When the receiver fails to detect a valid logic HIGH Stop bit at the expected time interval.',
          'When the transmit FIFO is empty.',
          'When the power supply voltage fluctuates.',
          'When data is sent in uppercase letters only.'
        ],
        correctAns: 'When the receiver fails to detect a valid logic HIGH Stop bit at the expected time interval.',
        explanation: 'Framing errors occur when baud rate mismatch or noise causes the receiver to sample the stop bit position while the line is still LOW.',
        points: 10
      },
      {
        id: 'ua-7',
        question: 'How many total physical bits are transmitted on the wire for a single 8N1 byte (including start and stop bits)?',
        options: [
          '10 bits (1 Start bit + 8 Data bits + 1 Stop bit)',
          '8 bits',
          '16 bits',
          '12 bits'
        ],
        correctAns: '10 bits (1 Start bit + 8 Data bits + 1 Stop bit)',
        explanation: 'Each frame consists of 1 Start bit + 8 Data bits + 1 Stop bit = 10 bits per transmitted character.',
        points: 10
      },
      {
        id: 'ua-8',
        question: 'What is a UART FIFO buffer in hardware?',
        options: [
          'First-In First-Out hardware memory that holds incoming or outgoing bytes until the CPU reads or transmits them.',
          'A filter that converts serial signals to analog sound.',
          'A voltage booster for long cable runs.',
          'An EEPROM chip that stores serial baud rates.'
        ],
        correctAns: 'First-In First-Out hardware memory that holds incoming or outgoing bytes until the CPU reads or transmits them.',
        explanation: 'Hardware FIFOs buffer multiple bytes in silicon so the CPU does not lose data if an interrupt is slightly delayed.',
        points: 10
      },
      {
        id: 'ua-9',
        question: 'What register in a UART peripheral indicates when the Transmitter is ready for the next byte?',
        options: [
          'UART Line Status Register (LSR) - Transmit Holding Register Empty (THRE) flag',
          'GPIO Input Register',
          'Timer Prescaler Register',
          'Flash Lock Register'
        ],
        correctAns: 'UART Line Status Register (LSR) - Transmit Holding Register Empty (THRE) flag',
        explanation: 'Firmware polls the THRE flag in the Line Status Register before writing a new byte into the Transmit Buffer to prevent overwriting.',
        points: 10
      },
      {
        id: 'ua-10',
        question: 'What is the consequence of a baud rate mismatch between transmitter (e.g. 115200) and receiver (e.g. 9600)?',
        options: [
          'The receiver reads garbled, corrupted characters or framing errors.',
          'The transmitter hardware is physically damaged.',
          'The baud rate automatically synchronizes within 1 millisecond.',
          'The CPU resets immediately.'
        ],
        correctAns: 'The receiver reads garbled, corrupted characters or framing errors.',
        explanation: 'Because UART has no shared clock, mismatched baud rates cause the receiver to sample bits at the wrong time offsets, reading gibberish.',
        points: 10
      }
    ]
  },
  {
    id: 'spi',
    topicNumber: '06',
    title: 'SPI',
    difficulty: 'beginner',
    description: 'Synchronous peripheral interface, Master/Slave, MOSI, MISO, SCK, and CS lines.',
    longDescription: 'Learn Serial Peripheral Interface (SPI) architecture, full-duplex communication, clock polarities (CPOL) and phases (CPHA), Chip Select (CS) management, and flash/display interfacing.',
    estimatedTime: '10 mins',
    points: 100,
    questions: [
      {
        id: 'sp-1',
        question: 'How many signal lines are typically used in a standard SPI bus connection?',
        options: [
          '4 lines (MOSI, MISO, SCK, CS/SS)',
          '2 lines (SDA, SCL)',
          '1 line (TX/RX)',
          '8 parallel lines'
        ],
        correctAns: '4 lines (MOSI, MISO, SCK, CS/SS)',
        explanation: 'Standard SPI uses 4 lines: Master-Out Slave-In (MOSI), Master-In Slave-Out (MISO), Serial Clock (SCK), and Chip Select (CS/SS).',
        points: 10
      },
      {
        id: 'sp-2',
        question: 'What is the role of the Chip Select (CS / SS) line in SPI communication?',
        options: [
          'It is driven LOW by the master to select and activate a specific slave device on the shared bus.',
          'It supplies operating power to the slave.',
          'It sets the baud rate frequency for the clock.',
          'It resets the master CPU.'
        ],
        correctAns: 'It is driven LOW by the master to select and activate a specific slave device on the shared bus.',
        explanation: 'SPI uses active-low Chip Select lines. The master asserts CS LOW to tell a specific slave to listen on MOSI and drive MISO.',
        points: 10
      },
      {
        id: 'sp-3',
        question: 'Is SPI synchronous or asynchronous, and is it half-duplex or full-duplex?',
        options: [
          'Synchronous (shared clock SCK) and Full-Duplex (simultaneous TX and RX).',
          'Asynchronous (no clock) and Half-Duplex.',
          'Synchronous and Simplex only.',
          'Asynchronous and Full-Duplex.'
        ],
        correctAns: 'Synchronous (shared clock SCK) and Full-Duplex (simultaneous TX and RX).',
        explanation: 'SPI is synchronous because the master drives the SCK clock line, and full-duplex because MOSI and MISO transmit data in both directions simultaneously.',
        points: 10
      },
      {
        id: 'sp-4',
        question: 'What do CPOL (Clock Polarity) and CPHA (Clock Phase) define in SPI Modes 0, 1, 2, and 3?',
        options: [
          'CPOL defines the idle state of SCK (LOW or HIGH), and CPHA defines which clock edge data is captured on.',
          'CPOL sets the bus voltage, and CPHA sets the number of slaves.',
          'CPOL configures parity, and CPHA configures stop bits.',
          'They define the CRC error checksum algorithm.'
        ],
        correctAns: 'CPOL defines the idle state of SCK (LOW or HIGH), and CPHA defines which clock edge data is captured on.',
        explanation: 'SPI Mode 0 (CPOL=0, CPHA=0) idles clock LOW and samples on rising edge. The 4 SPI modes define clock polarity and sampling edges.',
        points: 10
      },
      {
        id: 'sp-5',
        question: 'Which device always generates the serial clock signal (SCK) in an SPI bus?',
        options: [
          'The SPI Master (Microcontroller)',
          'The SPI Slave device',
          'An external pull-up resistor',
          'The power supply regulator'
        ],
        correctAns: 'The SPI Master (Microcontroller)',
        explanation: 'The SPI Master is the bus controller and generates the SCK clock pulses for all transactions.',
        points: 10
      },
      {
        id: 'sp-6',
        question: 'What happens to the MISO pin of an SPI slave when its Chip Select (CS) line is HIGH (deselected)?',
        options: [
          'It enters high-impedance (tri-state / floating) mode so other slaves can drive the shared MISO line.',
          'It pulls the MISO line to GND continuously.',
          'It drives MISO to 3.3V.',
          'It transmits random error bytes.'
        ],
        correctAns: 'It enters high-impedance (tri-state / floating) mode so other slaves can drive the shared MISO line.',
        explanation: 'When deselected (CS=HIGH), the slave disconnects its MISO driver into high-impedance (Hi-Z) so other slaves sharing the bus can communicate without conflict.',
        points: 10
      },
      {
        id: 'sp-7',
        question: 'On VEGA ARIES v2.0, which on-board peripheral is connected via high-speed SPI?',
        options: [
          'The 2 MB external SPI Flash memory chip.',
          'The power LED.',
          'The reset button.',
          'The analog potentiometer.'
        ],
        correctAns: 'The 2 MB external SPI Flash memory chip.',
        explanation: 'VEGA ARIES v2.0 connects its 2 MB external Flash memory holding user programs and boot code over high-speed SPI.',
        points: 10
      },
      {
        id: 'sp-8',
        question: 'Why is SPI generally faster than I2C for displays and flash memory?',
        options: [
          'SPI has dedicated push-pull lines for clock and data, allowing speeds of 20–50+ MHz without protocol overhead.',
          'Because SPI only transmits numbers between 0 and 9.',
          'Because SPI does not require ground.',
          'Because I2C is limited to 10 Hz.'
        ],
        correctAns: 'SPI has dedicated push-pull lines for clock and data, allowing speeds of 20–50+ MHz without protocol overhead.',
        explanation: 'Push-pull drivers in SPI eliminate slow RC rise-times of open-drain I2C pull-ups, and lack of per-byte ACK/address overhead enables high throughput.',
        points: 10
      },
      {
        id: 'sp-9',
        question: 'What must the master do to receive a byte from an SPI slave?',
        options: [
          'Transmit a dummy byte (e.g. 0xFF or 0x00) on MOSI to generate clock pulses on SCK while reading MISO.',
          'Turn off the power supply.',
          'Switch SCK to input mode.',
          'Send a UART break condition.'
        ],
        correctAns: 'Transmit a dummy byte (e.g. 0xFF or 0x00) on MOSI to generate clock pulses on SCK while reading MISO.',
        explanation: 'Because SPI is full-duplex and clock-driven by master, master must shift out a byte to clock in a byte from the slave shift register.',
        points: 10
      },
      {
        id: 'sp-10',
        question: 'Which bit is typically transmitted first in standard SPI communication?',
        options: [
          'MSB (Most Significant Bit - Bit 7)',
          'LSB (Least Significant Bit - Bit 0)',
          'Parity Bit',
          'Stop Bit'
        ],
        correctAns: 'MSB (Most Significant Bit - Bit 7)',
        explanation: 'By default, standard SPI shifts out data MSB-first (Most Significant Bit), though LSB-first can be configured in peripheral control registers.',
        points: 10
      }
    ]
  },
  {
    id: 'i2c',
    topicNumber: '07',
    title: 'I2C',
    difficulty: 'beginner',
    description: 'Two-wire interface, open-drain bus, 7-bit addressing, ACK/NACK, and pull-up resistors.',
    longDescription: 'Explore the Inter-Integrated Circuit (I2C) two-wire protocol, SDA/SCL open-drain bus architecture, START/STOP conditions, ACK/NACK handshaking, and multi-device sensor bus interfacing.',
    estimatedTime: '10 mins',
    points: 100,
    questions: [
      {
        id: 'i2c-1',
        question: 'How many signal lines does the I2C bus use to communicate with multiple slave devices?',
        options: [
          '2 lines: SDA (Serial Data) and SCL (Serial Clock)',
          '4 lines: MOSI, MISO, SCK, CS',
          '1 line: TX/RX',
          '8 lines: Data bus D0–D7'
        ],
        correctAns: '2 lines: SDA (Serial Data) and SCL (Serial Clock)',
        explanation: 'I2C is a synchronous, multi-master, multi-slave two-wire serial bus consisting of SDA (Data) and SCL (Clock).',
        points: 10
      },
      {
        id: 'i2c-2',
        question: 'Why are pull-up resistors mandatory on both SDA and SCL lines in an I2C bus?',
        options: [
          'Because I2C drivers are open-drain and can only pull the lines LOW; pull-up resistors pull the lines HIGH when idle.',
          'To boost the current for long distance radio transmission.',
          'To prevent the clock frequency from exceeding 100 MHz.',
          'To invert the digital bits.'
        ],
        correctAns: 'Because I2C drivers are open-drain and can only pull the lines LOW; pull-up resistors pull the lines HIGH when idle.',
        explanation: 'Open-drain drivers can only sink current to ground. Passive pull-up resistors (typically 2.2kΩ to 4.7kΩ) restore the bus lines to VCC (3.3V) when released.',
        points: 10
      },
      {
        id: 'i2c-3',
        question: 'What defines a valid I2C START condition on the bus?',
        options: [
          'SDA transitions from HIGH to LOW while SCL remains HIGH.',
          'SDA transitions from LOW to HIGH while SCL remains LOW.',
          'Both SDA and SCL stay LOW for 10 ms.',
          'A parity error is detected.'
        ],
        correctAns: 'SDA transitions from HIGH to LOW while SCL remains HIGH.',
        explanation: 'During normal data transmission, SDA must not change while SCL is HIGH. A transition on SDA while SCL is HIGH uniquely signals START (HIGH->LOW) or STOP (LOW->HIGH).',
        points: 10
      },
      {
        id: 'i2c-4',
        question: 'How does an I2C slave device acknowledge (ACK) that it received a byte from the master?',
        options: [
          'By pulling the SDA line LOW during the 9th SCL clock pulse.',
          'By driving the SCL line HIGH for 1 second.',
          'By sending an ASCII character "A".',
          'By resetting the power rail.'
        ],
        correctAns: 'By pulling the SDA line LOW during the 9th SCL clock pulse.',
        explanation: 'After 8 data bits, the master releases SDA for the 9th clock pulse. The addressed receiver pulls SDA LOW to acknowledge (ACK) or leaves it HIGH for NACK.',
        points: 10
      },
      {
        id: 'i2c-5',
        question: 'How many unique device addresses are possible using standard 7-bit I2C addressing (excluding reserved addresses)?',
        options: [
          'Up to 112 usable addresses (0x08 to 0x77)',
          '256 addresses',
          '2 addresses only',
          '65,536 addresses'
        ],
        correctAns: 'Up to 112 usable addresses (0x08 to 0x77)',
        explanation: '7-bit addresses range from 0x00 to 0x7F (128 total), with 0x00–0x07 and 0x78–0x7F reserved by the I2C specification, leaving 112 valid device addresses.',
        points: 10
      },
      {
        id: 'i2c-6',
        question: 'What is the standard clock frequency for standard-mode and fast-mode I2C?',
        options: [
          'Standard-mode: 100 kHz, Fast-mode: 400 kHz',
          'Standard-mode: 10 MHz, Fast-mode: 100 MHz',
          'Standard-mode: 1 kHz, Fast-mode: 2 kHz',
          'Standard-mode: 115.2 kHz, Fast-mode: 921.6 kHz'
        ],
        correctAns: 'Standard-mode: 100 kHz, Fast-mode: 400 kHz',
        explanation: 'Standard I2C bus speeds are 100 kHz (Standard-mode) and 400 kHz (Fast-mode). Fast-mode Plus reaches 1 MHz.',
        points: 10
      },
      {
        id: 'i2c-7',
        question: 'What is the function of the Least Significant Bit (Bit 0) in the first I2C address byte sent after a START condition?',
        options: [
          'R/W direction bit: 0 indicates Write (Master -> Slave), 1 indicates Read (Slave -> Master).',
          'Parity checksum bit.',
          'Stop bit indicator.',
          'Baud rate multiplier.'
        ],
        correctAns: 'R/W direction bit: 0 indicates Write (Master -> Slave), 1 indicates Read (Slave -> Master).',
        explanation: 'The first byte consists of [7-bit Slave Address] + [1-bit R/W flag]. A 0 means Master writes to Slave; 1 means Master reads from Slave.',
        points: 10
      },
      {
        id: 'i2c-8',
        question: 'What is "Clock Stretching" in I2C protocol?',
        options: [
          'A slave device holds SCL LOW to pause the master if it needs additional time to process data before responding.',
          'Increasing the crystal oscillator voltage.',
          'Transmitting clock pulses over optical cables.',
          'Doubling the bus frequency.'
        ],
        correctAns: 'A slave device holds SCL LOW to pause the master if it needs additional time to process data before responding.',
        explanation: 'Because SCL is open-drain, a slow slave can hold SCL LOW. The master detects this and pauses until the slave releases the clock line.',
        points: 10
      },
      {
        id: 'i2c-9',
        question: 'What defines a valid I2C STOP condition?',
        options: [
          'SDA transitions from LOW to HIGH while SCL remains HIGH.',
          'SDA transitions from HIGH to LOW while SCL is LOW.',
          'SCL is held LOW for 5 clock cycles.',
          'Power is disconnected.'
        ],
        correctAns: 'SDA transitions from LOW to HIGH while SCL remains HIGH.',
        explanation: 'A rising edge on SDA while SCL is HIGH constitutes a STOP condition, releasing the bus back to idle.',
        points: 10
      },
      {
        id: 'i2c-10',
        question: 'What happens when an I2C master sends an address and no slave on the bus matches that address?',
        options: [
          'SDA remains HIGH during the 9th clock pulse (NACK received), and master generates a STOP condition.',
          'The bus permanently shorts to ground.',
          'The master CPU crashes with a memory fault.',
          'The clock frequency doubles.'
        ],
        correctAns: 'SDA remains HIGH during the 9th clock pulse (NACK received), and master generates a STOP condition.',
        explanation: 'If no slave matches the 7-bit address, no device pulls SDA LOW. The pull-up resistor leaves SDA HIGH (NACK), allowing I2C bus scanner algorithms to detect device absence.',
        points: 10
      }
    ]
  },
  {
    id: 'adc',
    topicNumber: '08',
    title: 'ADC',
    difficulty: 'beginner',
    description: 'Analog-to-digital conversion, resolution, reference voltage, and sensor reading.',
    longDescription: 'Master Analog-to-Digital Converter (ADC) concepts, quantization calculations, reference voltage VREF scaling, sampling rates, and reading analog sensors on VEGA ARIES v2.0.',
    estimatedTime: '10 mins',
    points: 100,
    questions: [
      {
        id: 'adc-1',
        question: 'What is the numerical output range of a 10-bit ADC converter?',
        options: [
          '0 to 1023 (2^10 = 1024 discrete digital levels)',
          '0 to 255',
          '0 to 4095',
          '0 to 65535'
        ],
        correctAns: '0 to 1023 (2^10 = 1024 discrete digital levels)',
        explanation: 'A 10-bit ADC divides the reference voltage range into 2^10 = 1024 quantization steps, producing integer values from 0 to 1023.',
        points: 10
      },
      {
        id: 'adc-2',
        question: 'If a 12-bit ADC has a reference voltage (VREF) of 3.3V, what voltage does each digital count represent (quantization resolution)?',
        options: [
          '~0.806 millivolts (3.3V / 4095)',
          '~3.3 millivolts',
          '~0.1 volts',
          '~10 millivolts'
        ],
        correctAns: '~0.806 millivolts (3.3V / 4095)',
        explanation: 'Resolution = VREF / (2^12 - 1) = 3.3V / 4095 = 0.0008058V = 0.806 mV per ADC step.',
        points: 10
      },
      {
        id: 'adc-3',
        question: 'What happens if the analog voltage applied to an ADC pin exceeds VREF (e.g. 5V on a 3.3V ADC)?',
        options: [
          'The digital reading saturates at maximum (e.g. 1023 / 4095) and may damage internal protection clamping diodes.',
          'The ADC output wraps around to 0.',
          'The ADC converts the extra voltage into CPU clock speed.',
          'The microcontroller inverts the polarity.'
        ],
        correctAns: 'The digital reading saturates at maximum (e.g. 1023 / 4095) and may damage internal protection clamping diodes.',
        explanation: 'Voltages above VREF saturate at max digital count and will forward-bias internal ESD protection diodes, causing permanent damage if current is not limited.',
        points: 10
      },
      {
        id: 'adc-4',
        question: 'What is the purpose of the Sample and Hold (S&H) circuit in an ADC?',
        options: [
          'To freeze the instantaneous analog input voltage on an internal capacitor while conversion takes place.',
          'To amplify the output audio sound.',
          'To generate high-voltage pulses for flash memory.',
          'To filter digital PWM signals.'
        ],
        correctAns: 'To freeze the instantaneous analog input voltage on an internal capacitor while conversion takes place.',
        explanation: 'The sample-and-hold circuit charges an internal capacitor and isolates it during conversion so input voltage fluctuations do not corrupt conversion accuracy.',
        points: 10
      },
      {
        id: 'adc-5',
        question: 'What formula converts a 10-bit raw ADC reading (0–1023) back into input Voltage with VREF=3.3V?',
        options: [
          'Voltage = (rawADC * 3.3) / 1023.0',
          'Voltage = rawADC / 3.3',
          'Voltage = rawADC * 1023',
          'Voltage = (rawADC * 1023) / 3.3'
        ],
        correctAns: 'Voltage = (rawADC * 3.3) / 1023.0',
        explanation: 'Input Voltage is linearly proportional: Vin = (ADC_Reading / (2^N - 1)) * VREF.',
        points: 10
      },
      {
        id: 'adc-6',
        question: 'What is ADC "Quantization Error"?',
        options: [
          'The inherent rounding error (+/- 0.5 LSB) caused by representing a continuous analog voltage with discrete finite digital integers.',
          'A hardware defect in the silicon wafer.',
          'Noise caused by incorrect baud rate.',
          'Memory leakage in software variables.'
        ],
        correctAns: 'The inherent rounding error (+/- 0.5 LSB) caused by representing a continuous analog voltage with discrete finite digital integers.',
        explanation: 'Quantization error is the fundamental uncertainty between the actual continuous analog signal and the nearest discrete discrete integer step.',
        points: 10
      },
      {
        id: 'adc-7',
        question: 'Why should a decoupling capacitor (e.g. 0.1 µF) be placed near the analog VREF pin?',
        options: [
          'To filter high-frequency noise from digital switching and maintain a stable reference voltage for accurate conversions.',
          'To double the ADC conversion speed.',
          'To step up the voltage from 3.3V to 5V.',
          'To store firmware code.'
        ],
        correctAns: 'To filter high-frequency noise from digital switching and maintain a stable reference voltage for accurate conversions.',
        explanation: 'Any noise or ripple on VREF directly translates to digital reading errors. Decoupling capacitors ensure reference stability.',
        points: 10
      },
      {
        id: 'adc-8',
        question: 'What is an ADC Multiplexer (MUX)?',
        options: [
          'An internal analog switch that routes one of several external analog input pins to a single shared ADC conversion core.',
          'A digital multiplier for math operations.',
          'An external SPI flash programmer.',
          'A frequency divider.'
        ],
        correctAns: 'An internal analog switch that routes one of several external analog input pins to a single shared ADC conversion core.',
        explanation: 'Most microcontrollers feature one or two high-speed ADC converters with an internal analog MUX allowing multiple pins (A0, A1, A2...) to be sampled sequentially.',
        points: 10
      },
      {
        id: 'adc-9',
        question: 'What technique can software use to reduce random noise in noisy ADC sensor readings?',
        options: [
          'Oversampling and rolling average filtering (averaging multiple samples).',
          'Increasing CPU clock speed.',
          'Using larger variable data types without math.',
          'Disabling the timer interrupt.'
        ],
        correctAns: 'Oversampling and rolling average filtering (averaging multiple samples).',
        explanation: 'Averaging N samples reduces uncorrelated white noise by a factor of sqrt(N) and increases effective resolution (ENOB).',
        points: 10
      },
      {
        id: 'adc-10',
        question: 'What is the Nyquist Sampling Theorem requirement for converting analog signals with maximum frequency f_max?',
        options: [
          'The ADC sampling rate must be at least twice the highest frequency component (f_sample >= 2 * f_max).',
          'The sampling rate must equal the CPU clock frequency.',
          'The sampling rate must be less than 10 Hz.',
          'The sampling rate is irrelevant.'
        ],
        correctAns: 'The ADC sampling rate must be at least twice the highest frequency component (f_sample >= 2 * f_max).',
        explanation: 'Sampling at less than 2 * f_max causes aliasing, where high-frequency signals appear as false low-frequency artifacts in digitized data.',
        points: 10
      }
    ]
  },
  {
    id: 'pwm',
    topicNumber: '09',
    title: 'PWM',
    difficulty: 'beginner',
    description: 'Pulse Width Modulation, duty cycle, frequency, and motor/LED brightness control.',
    longDescription: 'Understand Pulse Width Modulation (PWM) generation, duty cycle calculations, carrier frequencies, and applications in LED dimming and DC motor speed control on VEGA ARIES v2.0.',
    estimatedTime: '10 mins',
    points: 100,
    questions: [
      {
        id: 'pwm-1',
        question: 'What is the "Duty Cycle" of a Pulse Width Modulation (PWM) signal?',
        options: [
          'The percentage of one period in which the signal is in the active HIGH state.',
          'The total time taken by the microcontroller to boot.',
          'The frequency of the crystal oscillator.',
          'The maximum current drawn by the motor.'
        ],
        correctAns: 'The percentage of one period in which the signal is in the active HIGH state.',
        explanation: 'Duty Cycle (%) = (T_on / T_period) * 100%. A 50% duty cycle signal is HIGH for half the period and LOW for the other half.',
        points: 10
      },
      {
        id: 'pwm-2',
        question: 'If a 3.3V digital PWM signal has a duty cycle of 25%, what is the average equivalent DC voltage output?',
        options: [
          '0.825 Volts (3.3V * 0.25)',
          '3.300 Volts',
          '1.650 Volts',
          '0.000 Volts'
        ],
        correctAns: '0.825 Volts (3.3V * 0.25)',
        explanation: 'Average Voltage = V_max * (Duty Cycle / 100) = 3.3V * 0.25 = 0.825V.',
        points: 10
      },
      {
        id: 'pwm-3',
        question: 'How does PWM control the apparent brightness of an LED without changing the 3.3V supply voltage?',
        options: [
          'By pulsing the LED on and off at a frequency faster than human eye persistence of vision (>100 Hz), varying average perceived light output.',
          'By changing the color wavelength of the photons.',
          'By converting digital voltage into AC mains power.',
          'By heating up the current limiting resistor.'
        ],
        correctAns: 'By pulsing the LED on and off at a frequency faster than human eye persistence of vision (>100 Hz), varying average perceived light output.',
        explanation: 'Due to persistence of vision, the human eye averages the rapid ON/OFF pulses. A higher duty cycle appears brighter.',
        points: 10
      },
      {
        id: 'pwm-4',
        question: 'If a PWM signal has a period (T_period) of 1 millisecond, what is its frequency?',
        options: [
          '1000 Hz (1 kHz)',
          '100 Hz',
          '10 kHz',
          '1 MHz'
        ],
        correctAns: '1000 Hz (1 kHz)',
        explanation: 'Frequency = 1 / Period = 1 / 0.001 s = 1000 Hz (1 kHz).',
        points: 10
      },
      {
        id: 'pwm-5',
        question: 'What hardware components inside a microcontroller are used to generate PWM signals?',
        options: [
          'Hardware Timers with Compare Match channels.',
          'ADC converters.',
          'UART shift registers.',
          'External crystal resonators.'
        ],
        correctAns: 'Hardware Timers with Compare Match channels.',
        explanation: 'Timers count up to a period limit (Auto-Reload), and when the count passes the Compare value, the output pin flips logic state to generate PWM.',
        points: 10
      },
      {
        id: 'pwm-6',
        question: 'What happens when an 8-bit PWM channel is written with a value of 255?',
        options: [
          '100% duty cycle (constant full HIGH output).',
          '0% duty cycle (constant LOW).',
          '50% duty cycle square wave.',
          'The pin floats.'
        ],
        correctAns: '100% duty cycle (constant full HIGH output).',
        explanation: 'In 8-bit PWM (0–255), 0 is 0% (always OFF) and 255 is 100% (always ON).',
        points: 10
      },
      {
        id: 'pwm-7',
        question: 'Why is a freewheeling (flyback) diode required when controlling an inductive DC motor or relay with PWM?',
        options: [
          'To suppress high-voltage reverse inductive back-EMF spikes generated when switching the coil current OFF.',
          'To increase the motor rotation speed.',
          'To reduce the duty cycle to zero.',
          'To convert PWM to analog audio.'
        ],
        correctAns: 'To suppress high-voltage reverse inductive back-EMF spikes generated when switching the coil current OFF.',
        explanation: 'Inductors resist changes in current (V = -L * di/dt). When the transistor switches off, the collapsing magnetic field creates a huge voltage spike that can destroy the transistor without a flyback diode.',
        points: 10
      },
      {
        id: 'pwm-8',
        question: 'What is the difference between Edge-Aligned PWM and Center-Aligned PWM?',
        options: [
          'Edge-aligned timers count in one direction (up or down), while center-aligned timers count up then down (symmetrical pulses).',
          'Center-aligned PWM only works on analog pins.',
          'Edge-aligned PWM cannot change frequency.',
          'Center-aligned PWM requires three ground wires.'
        ],
        correctAns: 'Edge-aligned timers count in one direction (up or down), while center-aligned timers count up then down (symmetrical pulses).',
        explanation: 'Center-aligned PWM uses up-down counting to create symmetrical pulses with a fixed center point, reducing electromagnetic noise in motor drive inverters.',
        points: 10
      },
      {
        id: 'pwm-9',
        question: 'How is a standard hobby servo motor controlled using PWM?',
        options: [
          'By sending a 50 Hz (20 ms period) pulse where the pulse width (1.0 ms to 2.0 ms) specifies the angular shaft position.',
          'By varying the supply voltage between 0V and 12V.',
          'By transmitting ASCII characters over UART.',
          'By changing the clock frequency to 100 MHz.'
        ],
        correctAns: 'By sending a 50 Hz (20 ms period) pulse where the pulse width (1.0 ms to 2.0 ms) specifies the angular shaft position.',
        explanation: 'Servos use pulse position modulation at 50 Hz: 1.0 ms pulse = 0 degrees, 1.5 ms = 90 degrees (center), 2.0 ms = 180 degrees.',
        points: 10
      },
      {
        id: 'pwm-10',
        question: 'What simple passive filter converts a high-frequency PWM signal into a smooth analog DC voltage?',
        options: [
          'An RC Low-Pass Filter (resistor and capacitor to ground).',
          'A high-pass filter.',
          'A 10-bit ADC converter.',
          'A crystal oscillator.'
        ],
        correctAns: 'An RC Low-Pass Filter (resistor and capacitor to ground).',
        explanation: 'An RC low-pass filter averages out the high-frequency PWM switching frequency, leaving the smooth DC voltage proportional to duty cycle.',
        points: 10
      }
    ]
  },
  {
    id: 'interrupts',
    topicNumber: '10',
    title: 'Interrupts',
    difficulty: 'beginner',
    description: 'Hardware interrupt lines, vector table, ISR execution, priority, and latency.',
    longDescription: 'Explore interrupt handling mechanisms, Interrupt Service Routines (ISRs), Interrupt Vector Tables (IVT), priority management, and external GPIO edge-triggered interrupts on VEGA ARIES v2.0.',
    estimatedTime: '10 mins',
    points: 100,
    questions: [
      {
        id: 'int-1',
        question: 'What is an Interrupt in microcontroller systems?',
        options: [
          'An asynchronous hardware or software signal that pauses main CPU execution and branches to an Interrupt Service Routine (ISR).',
          'A fatal bug that crashes the firmware permanently.',
          'A hardware button that cuts power to the board.',
          'A compiler optimization flag.'
        ],
        correctAns: 'An asynchronous hardware or software signal that pauses main CPU execution and branches to an Interrupt Service Routine (ISR).',
        explanation: 'Interrupts allow the CPU to react immediately to high-priority asynchronous events (e.g. pin edge, timer timeout, incoming byte) without wasteful polling.',
        points: 10
      },
      {
        id: 'int-2',
        question: 'Why must Interrupt Service Routines (ISRs) be kept as short and fast as possible?',
        options: [
          'To avoid blocking other pending interrupts and prevent delaying time-critical system tasks.',
          'Because the CPU runs out of memory after 10 lines in an ISR.',
          'Because ISRs cannot execute arithmetic addition.',
          'To prevent the Flash memory from erasing.'
        ],
        correctAns: 'To avoid blocking other pending interrupts and prevent delaying time-critical system tasks.',
        explanation: 'Long ISRs increase interrupt latency for other peripherals and starve the main background loop. ISRs should set a flag and exit promptly.',
        points: 10
      },
      {
        id: 'int-3',
        question: 'Why must variables shared between an ISR and the main loop be declared with the volatile qualifier?',
        options: [
          'To prevent the compiler optimizer from caching the variable value in a CPU register inside the main loop.',
          'To allocate the variable in read-only memory.',
          'To automatically encrypt the variable value.',
          'To double the execution speed of the variable.'
        ],
        correctAns: 'To prevent the compiler optimizer from caching the variable value in a CPU register inside the main loop.',
        explanation: 'Without volatile, the main loop might cache the variable in a CPU register and fail to observe changes made asynchronously inside the ISR.',
        points: 10
      },
      {
        id: 'int-4',
        question: 'What is an Interrupt Vector Table (IVT)?',
        options: [
          'An array of function pointers in memory containing the entry addresses of all peripheral ISR handlers.',
          'A lookup table for mathematical trigonometry functions.',
          'A list of Wi-Fi passwords stored in Flash.',
          'A hardware diagram printed on the circuit board.'
        ],
        correctAns: 'An array of function pointers in memory containing the entry addresses of all peripheral ISR handlers.',
        explanation: 'When an interrupt occurs, the CPU hardware indexes the IVT by interrupt number and jumps directly to the corresponding ISR function pointer.',
        points: 10
      },
      {
        id: 'int-5',
        question: 'What happens if firmware fails to clear the peripheral interrupt pending flag inside an ISR?',
        options: [
          'The CPU immediately re-enters the same ISR upon returning, causing an infinite interrupt loop and system freeze.',
          'The microcontroller reboots automatically.',
          'The interrupt is permanently disabled.',
          'The CPU clock doubles.'
        ],
        correctAns: 'The CPU immediately re-enters the same ISR upon returning, causing an infinite interrupt loop and system freeze.',
        explanation: 'The interrupt controller keeps asserting the interrupt signal to the CPU core until the peripheral pending status bit is explicitly acknowledged/cleared.',
        points: 10
      },
      {
        id: 'int-6',
        question: 'What is "Interrupt Latency"?',
        options: [
          'The elapsed time between the arrival of an interrupt trigger signal and the execution of the first instruction in the ISR.',
          'The total time taken to flash firmware over Wi-Fi.',
          'The baud rate of the UART serial port.',
          'The physical distance of the copper PCB trace.'
        ],
        correctAns: 'The elapsed time between the arrival of an interrupt trigger signal and the execution of the first instruction in the ISR.',
        explanation: 'Interrupt latency includes hardware signal propagation, completing the current atomic instruction, context saving (pushing registers), and vector fetching.',
        points: 10
      },
      {
        id: 'int-7',
        question: 'What is a "Non-Maskable Interrupt" (NMI)?',
        options: [
          'A critical high-priority interrupt (like hardware watchdog or brownout reset) that cannot be disabled by software.',
          'An interrupt that only executes on odd-numbered days.',
          'A software break condition.',
          'An interrupt that requires manual switch press.'
        ],
        correctAns: 'A critical high-priority interrupt (like hardware watchdog or brownout reset) that cannot be disabled by software.',
        explanation: 'NMIs are reserved for catastrophic hardware faults (power failure, clock failure, watchdog) that must be handled immediately without software masking.',
        points: 10
      },
      {
        id: 'int-8',
        question: 'Which trigger modes can be configured on an external GPIO interrupt pin?',
        options: [
          'Rising Edge, Falling Edge, Both Edges, or Low/High Level.',
          'Analog volume only.',
          'UART baud rate match only.',
          'Parity error only.'
        ],
        correctAns: 'Rising Edge, Falling Edge, Both Edges, or Low/High Level.',
        explanation: 'GPIO interrupt controllers support edge-triggered modes (0->1 rising, 1->0 falling, both) and level-triggered modes (active LOW or HIGH).',
        points: 10
      },
      {
        id: 'int-9',
        question: 'What is an "Atomic Operation" in the context of interrupt-driven embedded systems?',
        options: [
          'An uninterrupted sequence of instructions guaranteed to complete without being preempted by an interrupt.',
          'A math operation involving nuclear physics.',
          'An instruction that runs at sub-nanosecond speeds.',
          'A flash erase cycle.'
        ],
        correctAns: 'An uninterrupted sequence of instructions guaranteed to complete without being preempted by an interrupt.',
        explanation: 'Modifying a multi-byte variable requires multiple CPU cycles. Disabling interrupts temporarily creates a critical section ensuring atomic modification without corruption.',
        points: 10
      },
      {
        id: 'int-10',
        question: 'What controller manages external and peripheral interrupt priorities on RISC-V cores like THEJAS32?',
        options: [
          'PLIC (Platform-Level Interrupt Controller) and CLIC / CLINT',
          'USB Host Controller',
          'PWM Counter',
          'Flash Controller'
        ],
        correctAns: 'PLIC (Platform-Level Interrupt Controller) and CLIC / CLINT',
        explanation: 'In the RISC-V architecture, the PLIC (Platform-Level Interrupt Controller) routes, prioritizes, and arbitrates external device interrupts to CPU harts.',
        points: 10
      }
    ]
  },

  // ==========================================================================
  // INTERMEDIATE TOPICS (9)
  // ==========================================================================
  {
    id: 'advanced-embedded-c',
    topicNumber: '11',
    title: 'Advanced Embedded C',
    difficulty: 'intermediate',
    description: 'Struct packing, bitfields, function pointers, and compiler attributes.',
    longDescription: 'Deep dive into advanced C concepts for firmware: struct alignment, __attribute__((packed)), register abstraction macros, and state machine function pointers.',
    estimatedTime: '12 mins',
    points: 100,
    questions: [
      {
        id: 'aec-1',
        question: 'What does the GCC attribute __attribute__((packed)) do when applied to a C struct?',
        codeSnippet: `struct __attribute__((packed)) Packet {\n    uint8_t  cmd;\n    uint32_t payload;\n};`,
        options: [
          'It eliminates internal padding bytes, packing struct members with zero alignment gaps.',
          'It compresses the struct using gzip compression algorithm.',
          'It moves the struct into Flash memory.',
          'It converts all members to 64-bit integers.'
        ],
        correctAns: 'It eliminates internal padding bytes, packing struct members with zero alignment gaps.',
        explanation: 'Compilers insert padding bytes to align 32-bit members. Packing removes padding, ensuring exact binary byte-for-byte alignment needed for communication frames.',
        points: 10
      },
      {
        id: 'aec-2',
        question: 'What is a function pointer in embedded C and how is it used in device drivers?',
        codeSnippet: `typedef void (*isr_handler_t)(void);\nisr_handler_t callback_table[16];`,
        options: [
          'A pointer storing the entry memory address of an executable function, enabling dynamic callbacks and table-driven state machines.',
          'A pointer that can only point to hardware registers.',
          'A pointer that converts C into assembly language.',
          'A special pointer stored in CPU stack register.'
        ],
        correctAns: 'A pointer storing the entry memory address of an executable function, enabling dynamic callbacks and table-driven state machines.',
        explanation: 'Function pointers store executable code addresses, allowing runtime registration of interrupt callbacks and clean hardware abstraction layers (HAL).',
        points: 10
      },
      {
        id: 'aec-3',
        question: 'What is the danger of unaligned 32-bit memory access on certain RISC-V hardware architectures?',
        options: [
          'It can trigger a hardware Load/Store Address Misaligned trap (CPU Exception) or require slow emulation.',
          'It erases the program Flash memory.',
          'It causes the baud rate to decrease.',
          'It changes the endianness of the chip.'
        ],
        correctAns: 'It can trigger a hardware Load/Store Address Misaligned trap (CPU Exception) or require slow emulation.',
        explanation: 'Many 32-bit RISC-V cores require 32-bit words to be aligned on 4-byte boundaries. Accessing an unaligned address triggers a hardware trap.',
        points: 10
      },
      {
        id: 'aec-4',
        question: 'What does the const qualifier on a pointer declaration "const uint8_t *ptr" mean versus "uint8_t * const ptr"?',
        options: [
          '"const uint8_t *ptr" points to read-only data, while "uint8_t * const ptr" is a constant pointer whose target address cannot change.',
          'Both declarations are completely identical.',
          'The first stores data in Flash, the second in EEPROM.',
          'The first is for 16-bit pointers, the second for 32-bit pointers.'
        ],
        correctAns: '"const uint8_t *ptr" points to read-only data, while "uint8_t * const ptr" is a constant pointer whose target address cannot change.',
        explanation: 'Read from right to left: "const uint8_t *ptr" is a pointer to constant data. "uint8_t * const ptr" is a constant pointer to mutable data.',
        points: 10
      },
      {
        id: 'aec-5',
        question: 'What does the preprocessor stringification operator (#) do in C macros?',
        codeSnippet: `#define STRINGIFY(x) #x`,
        options: [
          'It converts the macro argument token into a quoted string literal.',
          'It concatenates two tokens together.',
          'It measures the string length at compile time.',
          'It includes a header file.'
        ],
        correctAns: 'It converts the macro argument token into a quoted string literal.',
        explanation: '#x replaces the argument with its string representation (e.g. STRINGIFY(GPIO5) becomes "GPIO5").',
        points: 10
      },
      {
        id: 'aec-6',
        question: 'What does the token-pasting operator (##) do in preprocessor macros?',
        codeSnippet: `#define REGISTER_NAME(port, num) GPIO_##port##_PIN_##num`,
        options: [
          'It merges two tokens into a single valid identifier at compile time.',
          'It performs floating-point division.',
          'It creates a multi-line comment.',
          'It allocates memory on the heap.'
        ],
        correctAns: 'It merges two tokens into a single valid identifier at compile time.',
        explanation: 'Token pasting (##) combines macro arguments into a single token, widely used for clean peripheral register mapping macros.',
        points: 10
      },
      {
        id: 'aec-7',
        question: 'What is the purpose of the inline keyword in C function definitions for embedded firmware?',
        options: [
          'It suggests the compiler substitute the function body directly at each call site to eliminate function call overhead.',
          'It forces the function to execute in parallel across multiple cores.',
          'It allocates local variables in static Flash.',
          'It disables all interrupts during execution.'
        ],
        correctAns: 'It suggests the compiler substitute the function body directly at each call site to eliminate function call overhead.',
        explanation: 'Inlining replaces function calls with the direct assembly instructions, removing push/pop stack frame overhead for micro-functions like register writes.',
        points: 10
      },
      {
        id: 'aec-8',
        question: 'What is an enum in C, and why is it preferred over arbitrary raw numbers in embedded state machines?',
        options: [
          'It defines named integer constants, improving code readability, type safety, and debugging clarity.',
          'It allocates dynamically resizable arrays in heap.',
          'It automatically runs background threads.',
          'It converts C into machine microcode.'
        ],
        correctAns: 'It defines named integer constants, improving code readability, type safety, and debugging clarity.',
        explanation: 'Enumerations give meaningful names to states (e.g. STATE_IDLE, STATE_TX) rather than magic numbers, eliminating hard-to-find logic bugs.',
        points: 10
      },
      {
        id: 'aec-9',
        question: 'What is a circular ring buffer (FIFO) in embedded drivers and how is it implemented?',
        options: [
          'An array with head and tail indices that wrap around using modulo arithmetic to buffer data between ISRs and main loops.',
          'A round PCB circuit trace.',
          'A hardware oscillator circuit.',
          'An infinite recursive function.'
        ],
        correctAns: 'An array with head and tail indices that wrap around using modulo arithmetic to buffer data between ISRs and main loops.',
        explanation: 'Ring buffers allow lock-free single-producer single-consumer streaming of UART/SPI bytes between hardware ISRs and background application tasks.',
        points: 10
      },
      {
        id: 'aec-10',
        question: 'What does the GCC attribute __attribute__((section(".my_section"))) accomplish?',
        options: [
          'It instructs the linker script to place the variable or function in a specific custom memory region (e.g. fast SRAM or Flash).',
          'It creates a new PDF datasheet.',
          'It deletes the variable on reset.',
          'It disables compiler warnings.'
        ],
        correctAns: 'It instructs the linker script to place the variable or function in a specific custom memory region (e.g. fast SRAM or Flash).',
        explanation: 'Section attributes allow firmware authors to direct specific code routines into tightly-coupled instruction SRAM (ITCM) or custom flash partitions.',
        points: 10
      }
    ]
  },
  {
    id: 'register-programming',
    topicNumber: '12',
    title: 'Register Programming',
    difficulty: 'intermediate',
    description: 'Hardware register definitions, bit masks, read-modify-write, and base offsets.',
    longDescription: 'Master register-level bare-metal programming, peripheral base address mapping, read-modify-write patterns, atomic bit manipulation, and peripheral driver design.',
    estimatedTime: '12 mins',
    points: 100,
    questions: [
      {
        id: 'rp-1',
        question: 'What is the correct Read-Modify-Write pattern to clear bit 7 in a 32-bit hardware register?',
        codeSnippet: `// Clear bit 7\n*REG &= ~(1U << 7);`,
        options: [
          '*REG &= ~(1U << 7);',
          '*REG |= (1U << 7);',
          '*REG ^= (1U << 7);',
          '*REG = 0;'
        ],
        correctAns: '*REG &= ~(1U << 7);',
        explanation: '~(1U << 7) creates a mask with bit 7 as 0 and all other bits as 1. Bitwise AND clears bit 7 while keeping all other bits intact.',
        points: 10
      },
      {
        id: 'rp-2',
        question: 'Why is a direct assignment "*REG = (1 << 4);" often a bug when modifying a peripheral control register?',
        options: [
          'Because it overwrites and zeros out all other configuration bits in the register instead of preserving them.',
          'Because bit 4 cannot be set using assignment.',
          'Because it inverts the clock polarity.',
          'Because the CPU halts on direct writes.'
        ],
        correctAns: 'Because it overwrites and zeros out all other configuration bits in the register instead of preserving them.',
        explanation: 'Direct assignment sets bit 4 to 1 and sets bits 0–3 and 5–31 to 0, destroying previously configured peripheral options.',
        points: 10
      },
      {
        id: 'rp-3',
        question: 'What is a register "Base Address" and an "Offset"?',
        options: [
          'Base Address is the start address of the peripheral block in memory, and Offset is the byte distance to a specific register.',
          'Base Address is the baud rate, and Offset is the pin number.',
          'Base Address is the Flash size, and Offset is the SRAM size.',
          'They refer to compiler stack allocation pointers.'
        ],
        correctAns: 'Base Address is the start address of the peripheral block in memory, and Offset is the byte distance to a specific register.',
        explanation: 'For example, if UART0 base is 0x10000000 and Baud Register offset is 0x04, the register resides at memory address 0x10000004.',
        points: 10
      },
      {
        id: 'rp-4',
        question: 'How are peripheral registers typically represented in C using struct layout casting?',
        codeSnippet: `typedef struct {\n    volatile uint32_t CR;\n    volatile uint32_t SR;\n    volatile uint32_t DR;\n} UART_TypeDef;\n\n#define UART0 ((UART_TypeDef *)0x10000000)`,
        options: [
          'A struct with volatile 32-bit members mapped over the exact hardware register offsets by pointer casting the base address.',
          'A linked list in dynamic heap memory.',
          'A string array in Flash memory.',
          'A global union of floating point numbers.'
        ],
        correctAns: 'A struct with volatile 32-bit members mapped over the exact hardware register offsets by pointer casting the base address.',
        explanation: 'Struct overlays map members sequentially (CR at 0x00, SR at 0x04, DR at 0x08), allowing clean access like UART0->CR = 0x01.',
        points: 10
      },
      {
        id: 'rp-5',
        question: 'What is a "Write-1-to-Clear" (W1C) register bit common in interrupt status registers?',
        options: [
          'A status flag bit that is cleared by writing a 1 to it (writing 0 has no effect).',
          'A bit that is cleared by writing 0.',
          'A bit that clears itself after 1 microsecond.',
          'A bit that can only be written once in the life of the chip.'
        ],
        correctAns: 'A status flag bit that is cleared by writing a 1 to it (writing 0 has no effect).',
        explanation: 'W1C prevents race conditions. Writing 1 clears only that specific flag without affecting other status flags that occurred simultaneously.',
        points: 10
      },
      {
        id: 'rp-6',
        question: 'How do you modify a multi-bit field (e.g. bits 4..6) in a register without disturbing other bits?',
        codeSnippet: `// Set field [6:4] to value 0b101 (5)\n#define FIELD_MASK (0x7U << 4)\n*REG = (*REG & ~FIELD_MASK) | (5U << 4);`,
        options: [
          'First clear the target field using bitwise AND with inverted mask, then OR in the shifted new value.',
          'Directly assign the new value without masking.',
          'Invert the whole register.',
          'Use bitwise XOR twice.'
        ],
        correctAns: 'First clear the target field using bitwise AND with inverted mask, then OR in the shifted new value.',
        explanation: 'Masking out the old field with (*REG & ~MASK) ensures clean bit positions before bitwise OR writes the new multi-bit value.',
        points: 10
      },
      {
        id: 'rp-7',
        question: 'What does a "Read-Only" (RO) hardware register bit do if firmware attempts to write to it?',
        options: [
          'The write has no effect (ignored by hardware) and the bit retains its actual hardware state.',
          'The chip halts execution.',
          'The bit inverts permanently.',
          'The CPU memory bus shorts.'
        ],
        correctAns: 'The write has no effect (ignored by hardware) and the bit retains its actual hardware state.',
        explanation: 'Hardware status bits (like RX FIFO Not Empty or PLL Lock) are driven by silicon state machines and ignore software writes.',
        points: 10
      },
      {
        id: 'rp-8',
        question: 'What is a "Set/Clear" register pair (e.g. BSRR / BSR) in modern GPIO controllers?',
        options: [
          'Dedicated registers where writing 1 to the SET register sets the pin HIGH, and writing 1 to CLEAR sets it LOW atomically without read-modify-write.',
          'A register that reverses endianness.',
          'A register pair for floating point math.',
          'An external EEPROM memory.'
        ],
        correctAns: 'Dedicated registers where writing 1 to the SET register sets the pin HIGH, and writing 1 to CLEAR sets it LOW atomically without read-modify-write.',
        explanation: 'Atomic SET/CLEAR registers allow thread-safe pin manipulation in a single bus write instruction without requiring disabling interrupts.',
        points: 10
      },
      {
        id: 'rp-9',
        question: 'What is the purpose of a Memory Barrier instruction (like __sync_synchronize() or "fence") in register programming?',
        options: [
          'It enforces strict CPU ordering of memory accesses, ensuring register writes complete in hardware before subsequent code executes.',
          'It blocks hackers from reading RAM.',
          'It increases the clock frequency.',
          'It clears all registers to zero.'
        ],
        correctAns: 'It enforces strict CPU ordering of memory accesses, ensuring register writes complete in hardware before subsequent code executes.',
        explanation: 'Out-of-order execution and write buffers in modern cores can reorder memory writes. Memory barriers enforce strictly ordered peripheral access.',
        points: 10
      },
      {
        id: 'rp-10',
        question: 'How do you check if the 32-bit peripheral register at 0x10000008 has bit 2 (TX_READY) set?',
        codeSnippet: `volatile uint32_t *status = (volatile uint32_t *)0x10000008;\nif (*status & (1 << 2)) { /* ready */ }`,
        options: [
          '(*status & (1 << 2)) != 0',
          '*status == 2',
          '*status | 2',
          '*status >> 4'
        ],
        correctAns: '(*status & (1 << 2)) != 0',
        explanation: 'Bitwise AND with (1 << 2) isolates bit 2. If bit 2 is set, the expression evaluates to non-zero.',
        points: 10
      }
    ]
  },
  {
    id: 'bit-manipulation',
    topicNumber: '13',
    title: 'Bit Manipulation',
    difficulty: 'intermediate',
    description: 'Bitwise AND, OR, XOR, shifts, masks, bit extraction, and bitfield patterns.',
    longDescription: 'Master bitwise manipulation patterns in embedded C: bit setting, clearing, toggling, field extraction, bitwise rotation, and bit counting algorithms.',
    estimatedTime: '12 mins',
    points: 100,
    questions: [
      {
        id: 'bm-1',
        question: 'What is the value of result after executing: uint8_t result = (0x55 ^ 0xFF);?',
        codeSnippet: `uint8_t a = 0x55; // 0101 0101\nuint8_t b = 0xFF; // 1111 1111\nuint8_t result = a ^ b;`,
        options: [
          '0xAA (1010 1010)',
          '0x55 (0101 0101)',
          '0xFF (1111 1111)',
          '0x00 (0000 0000)'
        ],
        correctAns: '0xAA (1010 1010)',
        explanation: 'XORing any byte with 0xFF inverts all bits (one\'s complement). 0101 0101 inverted is 1010 1010 (0xAA).',
        points: 10
      },
      {
        id: 'bm-2',
        question: 'Which C macro correctly checks if an integer n is a power of 2 (e.g. 1, 2, 4, 8, 16...)?',
        options: [
          '(n > 0) && ((n & (n - 1)) == 0)',
          '(n % 2) == 0',
          '(n & 0x02) != 0',
          '(n << 1) == n'
        ],
        correctAns: '(n > 0) && ((n & (n - 1)) == 0)',
        explanation: 'Powers of 2 have exactly one binary \'1\' bit (e.g. 8 = 1000). Subtracting 1 gives 7 = 0111. 1000 & 0111 == 0.',
        points: 10
      },
      {
        id: 'bm-3',
        question: 'How do you extract the middle 4 bits [7:4] from a 16-bit register value?',
        codeSnippet: `uint16_t reg = 0x12A4;\nuint8_t field = (reg >> 4) & 0x0F;`,
        options: [
          '(reg >> 4) & 0x0F',
          '(reg & 0x0F) >> 4',
          'reg & 0x00F0',
          'reg << 4'
        ],
        correctAns: '(reg >> 4) & 0x0F',
        explanation: 'Shifting right by 4 aligns bits [7:4] to bit positions [3:0], and masking with 0x0F (0b1111) isolates the 4-bit value.',
        points: 10
      },
      {
        id: 'bm-4',
        question: 'What does the expression "val << 3" calculate mathematically for an unsigned integer?',
        options: [
          'val multiplied by 8 (2^3)',
          'val divided by 8',
          'val plus 3',
          'val squared'
        ],
        correctAns: 'val multiplied by 8 (2^3)',
        explanation: 'Each left shift by 1 multiplies the integer by 2. Left shifting by 3 multiplies by 2^3 = 8.',
        points: 10
      },
      {
        id: 'bm-5',
        question: 'What is the binary representation of ~0x00 in an 8-bit unsigned integer (uint8_t)?',
        options: [
          '0xFF (1111 1111)',
          '0x00 (0000 0000)',
          '0x01 (0000 0001)',
          '0x80 (1000 0000)'
        ],
        correctAns: '0xFF (1111 1111)',
        explanation: 'Bitwise NOT (~) flips every bit from 0 to 1, producing 0xFF.',
        points: 10
      },
      {
        id: 'bm-6',
        question: 'How do you set multiple bits (bits 2, 4, and 6) simultaneously in variable reg?',
        codeSnippet: `reg |= (1 << 2) | (1 << 4) | (1 << 6);`,
        options: [
          'reg |= (1 << 2) | (1 << 4) | (1 << 6);',
          'reg &= (1 << 2) & (1 << 4) & (1 << 6);',
          'reg = 2 | 4 | 6;',
          'reg ^= (2 + 4 + 6);'
        ],
        correctAns: 'reg |= (1 << 2) | (1 << 4) | (1 << 6);',
        explanation: 'Combining masks with bitwise OR: (0x04 | 0x10 | 0x40) = 0x54, then ORing with reg sets all three bits in one operation.',
        points: 10
      },
      {
        id: 'bm-7',
        question: 'What is the effect of arithmetic right shift (>>) vs logical right shift on signed negative numbers in C?',
        options: [
          'Arithmetic right shift preserves the sign bit (shifts in 1s for negative numbers), while logical shift shifts in 0s.',
          'Arithmetic shift adds 1, logical shift subtracts 1.',
          'They produce identical bit patterns.',
          'Logical shift is only supported on 64-bit CPUs.'
        ],
        correctAns: 'Arithmetic right shift preserves the sign bit (shifts in 1s for negative numbers), while logical shift shifts in 0s.',
        explanation: 'Signed right shift in C typically performs arithmetic shift (sign extension), whereas unsigned types always perform logical shift (zero filling).',
        points: 10
      },
      {
        id: 'bm-8',
        question: 'How can you swap two integer variables a and b without using a temporary variable?',
        codeSnippet: `a ^= b;\nb ^= a;\na ^= b;`,
        options: [
          'Using three XOR operations: a ^= b; b ^= a; a ^= b;',
          'Using bitwise NOT: a = ~b;',
          'Using bit shifts: a = b << 1;',
          'Using logic OR: a = a | b;'
        ],
        correctAns: 'Using three XOR operations: a ^= b; b ^= a; a ^= b;',
        explanation: 'The classic XOR swap algorithm exchanges two variables in-place without auxiliary memory.',
        points: 10
      },
      {
        id: 'bm-9',
        question: 'What does the GCC built-in function __builtin_popcount(uint32_t x) return?',
        options: [
          'The number of set bits (1s) in the binary representation of x.',
          'The number of leading zeros in x.',
          'The highest power of 2.',
          'The square root of x.'
        ],
        correctAns: 'The number of set bits (1s) in the binary representation of x.',
        explanation: '__builtin_popcount (population count) returns the total number of 1-bits in an integer, often mapped to single-cycle CPU instructions.',
        points: 10
      },
      {
        id: 'bm-10',
        question: 'What is a "Bitmask" in embedded firmware programming?',
        options: [
          'A binary pattern of 1s and 0s used to select, set, clear, or test specific bit positions in a data byte or register.',
          'A physical cover placed over LED displays.',
          'An encryption key for Wi-Fi.',
          'A compiler optimization level.'
        ],
        correctAns: 'A binary pattern of 1s and 0s used to select, set, clear, or test specific bit positions in a data byte or register.',
        explanation: 'Bitmasks isolate specific fields in hardware registers using bitwise AND, OR, and NOT operations.',
        points: 10
      }
    ]
  },
  {
    id: 'memory-pointers',
    topicNumber: '14',
    title: 'Memory & Pointers',
    difficulty: 'intermediate',
    description: 'Pointer arithmetic, stack vs heap, memory layout, and memory corruption.',
    longDescription: 'Explore pointer mechanics in embedded C: pointer arithmetic, memory map segments (.text, .data, .bss, stack, heap), buffer overflows, and null-pointer safety.',
    estimatedTime: '12 mins',
    points: 100,
    questions: [
      {
        id: 'mp-1',
        question: 'If "uint32_t *p = (uint32_t *)0x1000;" is incremented with "p++;", what is the resulting memory address in p?',
        codeSnippet: `uint32_t *p = (uint32_t *)0x1000;\np++;`,
        options: [
          '0x1004 (incremented by sizeof(uint32_t) = 4 bytes)',
          '0x1001 (incremented by 1 byte)',
          '0x1002',
          '0x2000'
        ],
        correctAns: '0x1004 (incremented by sizeof(uint32_t) = 4 bytes)',
        explanation: 'In C pointer arithmetic, incrementing a pointer advances the address by the size of the underlying type. sizeof(uint32_t) is 4 bytes.',
        points: 10
      },
      {
        id: 'mp-2',
        question: 'In standard embedded C memory layout, what data is stored in the .bss section?',
        options: [
          'Uninitialized (or zero-initialized) global and static variables.',
          'Executable compiled CPU machine code instructions.',
          'Constant strings and read-only lookup tables.',
          'Dynamic heap allocations.'
        ],
        correctAns: 'Uninitialized (or zero-initialized) global and static variables.',
        explanation: 'The .bss section holds uninitialized global/static variables. The C startup code clears the entire .bss section to 0 before main() is entered.',
        points: 10
      },
      {
        id: 'mp-3',
        question: 'What is the .data section in an embedded binary?',
        options: [
          'Global and static variables that have non-zero initial values.',
          'The CPU stack pointer table.',
          'The hardware interrupt vector table only.',
          'Unused flash memory.'
        ],
        correctAns: 'Global and static variables that have non-zero initial values.',
        explanation: '.data holds initialized global variables (e.g. int counter = 42;). Initial values are stored in Flash and copied to SRAM during startup.',
        points: 10
      },
      {
        id: 'mp-4',
        question: 'What happens during a "Stack Overflow" in a microcontroller without an MPU?',
        options: [
          'The stack grows downward and overwrites global variables (.bss / .data) or heap, causing unpredictable memory corruption and crashes.',
          'The CPU automatically increases RAM size.',
          'The compiler emits an error message at runtime.',
          'The timer prescaler stops.'
        ],
        correctAns: 'The stack grows downward and overwrites global variables (.bss / .data) or heap, causing unpredictable memory corruption and crashes.',
        explanation: 'Deep recursion or excessively large local arrays cause the stack to collide with global memory regions, corrupting variables and return addresses.',
        points: 10
      },
      {
        id: 'mp-5',
        question: 'Why is dynamic memory allocation (malloc / free) generally avoided in safety-critical embedded systems?',
        options: [
          'Because heap memory fragmentation over time can cause allocation failures and non-deterministic execution times.',
          'Because malloc is illegal in the C language.',
          'Because heap memory only runs at 1 MHz.',
          'Because malloc disables the CPU clock oscillator.'
        ],
        correctAns: 'Because heap memory fragmentation over time can cause allocation failures and non-deterministic execution times.',
        explanation: 'Unpredictable heap fragmentation can cause sudden out-of-memory crashes after running for weeks. Static memory allocation provides deterministic reliability.',
        points: 10
      },
      {
        id: 'mp-6',
        question: 'What does casting a pointer to "void *" represent in C?',
        options: [
          'A generic pointer that represents a raw memory address with unspecified data type.',
          'A null pointer that points to address 0.',
          'A pointer that cannot be dereferenced or assigned.',
          'A 64-bit pointer.'
        ],
        correctAns: 'A generic pointer that represents a raw memory address with unspecified data type.',
        explanation: 'void * is a generic memory pointer used for byte-level memory copies (memcpy) and generic driver callbacks.',
        points: 10
      },
      {
        id: 'mp-7',
        question: 'What is a "Dangling Pointer"?',
        options: [
          'A pointer that still references a memory location after the allocated memory has been deallocated or its stack frame destroyed.',
          'A pointer with a null value (NULL).',
          'A pointer pointing to Flash memory.',
          'A pointer to a hardware register.'
        ],
        correctAns: 'A pointer that still references a memory location after the allocated memory has been deallocated or its stack frame destroyed.',
        explanation: 'Dangling pointers point to invalid or repurposed memory. Accessing them causes data corruption and hard-to-diagnose bugs.',
        points: 10
      },
      {
        id: 'mp-8',
        question: 'What does the standard C library function memcpy(dest, src, n) do?',
        options: [
          'Copies n continuous bytes of memory from source address to destination address.',
          'Compares two strings alphabetically.',
          'Calculates the length of an array.',
          'Fills a memory buffer with zero.'
        ],
        correctAns: 'Copies n continuous bytes of memory from source address to destination address.',
        explanation: 'memcpy is the standard raw memory block copy utility, copying exact byte streams between buffers.',
        points: 10
      },
      {
        id: 'mp-9',
        question: 'What does "End-of-Stack" painting / watermarking accomplish during embedded software testing?',
        options: [
          'Filling unused stack memory with a known pattern (e.g. 0xDEADBEEF) at startup to measure maximum peak stack usage at runtime.',
          'Coloring the development board PCB with ink.',
          'Encrypting the bootloader.',
          'Validating flash checksum.'
        ],
        correctAns: 'Filling unused stack memory with a known pattern (e.g. 0xDEADBEEF) at startup to measure maximum peak stack usage at runtime.',
        explanation: 'Stack painting fills the stack area with a sentinel pattern. Checking how many bytes were overwritten gives the exact maximum stack depth reached.',
        points: 10
      },
      {
        id: 'mp-10',
        question: 'What is the memory size of a pointer variable itself on a 32-bit RISC-V microcontroller?',
        options: [
          '4 bytes (32 bits)',
          '8 bytes (64 bits)',
          '2 bytes (16 bits)',
          'Depends on the type it points to'
        ],
        correctAns: '4 bytes (32 bits)',
        explanation: 'In a 32-bit architecture (RV32), all pointer variables are 32 bits (4 bytes) wide, regardless of the data type being referenced.',
        points: 10
      }
    ]
  },
  {
    id: 'uart-communication',
    topicNumber: '15',
    title: 'UART Communication',
    difficulty: 'intermediate',
    description: 'DMA serial transfer, circular buffers, packet protocols, and interrupt RX.',
    longDescription: 'Advanced UART concepts: interrupt-driven receive buffers, DMA block transfers, packet framing protocols, checksum validation, and RS-485 multi-drop buses.',
    estimatedTime: '12 mins',
    points: 100,
    questions: [
      {
        id: 'uac-1',
        question: 'Why is DMA (Direct Memory Access) used for high-speed UART data transfers?',
        options: [
          'It transfers bytes between the UART hardware and SRAM automatically without requiring CPU interrupt intervention for every single byte.',
          'It increases the maximum UART baud rate to 10 GHz.',
          'It eliminates the need for TX and RX wires.',
          'It converts UART into an analog signal.'
        ],
        correctAns: 'It transfers bytes between the UART hardware and SRAM automatically without requiring CPU interrupt intervention for every single byte.',
        explanation: 'DMA controllers stream large buffers directly between peripherals and RAM across system buses, freeing the CPU core for computational tasks.',
        points: 10
      },
      {
        id: 'uac-2',
        question: 'What is an "Overrun Error" (OE) in a UART receiver?',
        options: [
          'A new incoming byte arrived before the previous byte was read from the RX Data Register, causing the previous byte to be overwritten and lost.',
          'The baud rate is too slow.',
          'The stop bit is missing.',
          'The transmitter ran out of power.'
        ],
        correctAns: 'A new incoming byte arrived before the previous byte was read from the RX Data Register, causing the previous byte to be overwritten and lost.',
        explanation: 'Overrun errors happen when CPU latency or disabled interrupts prevent reading the RX FIFO before new data arrives.',
        points: 10
      },
      {
        id: 'uac-3',
        question: 'What is the role of an End-of-Frame delimiter byte (e.g. newline \'\\n\' or 0x0D/0x0A) in serial protocols?',
        options: [
          'It marks the completion of a full message packet, allowing the parser to process the buffered command.',
          'It sets the parity bit to zero.',
          'It turns off the serial transmitter.',
          'It resets the baud rate generator.'
        ],
        correctAns: 'It marks the completion of a full message packet, allowing the parser to process the buffered command.',
        explanation: 'Framing delimiters indicate packet boundaries in continuous byte streams, signaling the parser to validate and execute the command.',
        points: 10
      },
      {
        id: 'uac-4',
        question: 'What is Hardware Flow Control (RTS / CTS) in UART communication?',
        options: [
          'Hardware handshaking lines (Ready to Send / Clear to Send) used by receiver to signal when its input buffer is full and pause sender.',
          'Software XON/XOFF characters.',
          'Regulating power supply voltage.',
          'Inverting the TX/RX pin polarity.'
        ],
        correctAns: 'Hardware handshaking lines (Ready to Send / Clear to Send) used by receiver to signal when its input buffer is full and pause sender.',
        explanation: 'RTS/CTS hardware flow control prevents buffer overflow by physically halting transmission when the receiver is busy.',
        points: 10
      },
      {
        id: 'uac-5',
        question: 'How is an 8-bit XOR checksum calculated over a telemetry data buffer?',
        codeSnippet: `uint8_t checksum = 0;\nfor (int i = 0; i < len; i++) {\n    checksum ^= buffer[i];\n}`,
        options: [
          'By initializing checksum to 0 and XORing (^) every payload byte in sequence.',
          'By adding all bytes with modulo 10.',
          'By bitwise ANDing all bytes together.',
          'By counting the number of letters.'
        ],
        correctAns: 'By initializing checksum to 0 and XORing (^) every payload byte in sequence.',
        explanation: 'XOR checksum accumulators detect single-bit corruption across frames with minimal computational overhead.',
        points: 10
      },
      {
        id: 'uac-6',
        question: 'What is RS-485 differential signaling compared to standard 3.3V UART?',
        options: [
          'RS-485 uses a balanced differential voltage pair (A and B lines) allowing noise-immune communication over long distances (up to 1200 m).',
          'RS-485 is a 64-bit wireless protocol.',
          'RS-485 only transmits audio frequencies.',
          'RS-485 does not require cables.'
        ],
        correctAns: 'RS-485 uses a balanced differential voltage pair (A and B lines) allowing noise-immune communication over long distances (up to 1200 m).',
        explanation: 'Differential signaling rejects common-mode electromagnetic noise, enabling industrial multi-drop buses spanning hundreds of meters.',
        points: 10
      },
      {
        id: 'uac-7',
        question: 'What is the purpose of the UART IDLE line interrupt on modern microcontrollers?',
        options: [
          'It generates an interrupt when an incoming stream pauses for at least one full character time, signaling frame completion in DMA mode.',
          'It puts the CPU into deep sleep.',
          'It turns off the Wi-Fi modem.',
          'It resets the baud rate.'
        ],
        correctAns: 'It generates an interrupt when an incoming stream pauses for at least one full character time, signaling frame completion in DMA mode.',
        explanation: 'IDLE line interrupts trigger when a burst of variable-length data ends, allowing instant packet processing without polling.',
        points: 10
      },
      {
        id: 'uac-8',
        question: 'How does software implement a non-blocking UART transmit function?',
        options: [
          'Push outgoing bytes into a circular TX buffer and enable the TX Empty interrupt to send bytes in the background.',
          'Use an empty while-loop until all bytes finish.',
          'Disable interrupts during the entire transmission.',
          'Double the CPU clock speed.'
        ],
        correctAns: 'Push outgoing bytes into a circular TX buffer and enable the TX Empty interrupt to send bytes in the background.',
        explanation: 'Non-blocking transmission queues data in a buffer and returns immediately; the hardware interrupt sends bytes as the FIFO empties.',
        points: 10
      },
      {
        id: 'uac-9',
        question: 'What is the purpose of a Break Condition in UART protocol?',
        options: [
          'Holding the TX line in logic LOW state for longer than a full frame time to signal a hardware reset or bus synchronization.',
          'Pausing software execution in a debugger.',
          'Cutting power to the UART chip.',
          'Inverting the stop bit.'
        ],
        correctAns: 'Holding the TX line in logic LOW state for longer than a full frame time to signal a hardware reset or bus synchronization.',
        explanation: 'A UART break condition pulls the line LOW continuously for >1 frame, widely used to trigger bootloaders (like LIN bus and DMX512).',
        points: 10
      },
      {
        id: 'uac-10',
        question: 'Why is parity checking rarely used in modern high-speed packet protocols?',
        options: [
          'Because simple parity only detects odd numbers of bit errors and is replaced by robust CRC16 / CRC32 checksums.',
          'Because parity bit hardware is obsolete.',
          'Because parity increases voltage levels.',
          'Because parity only works on analog signals.'
        ],
        correctAns: 'Because simple parity only detects odd numbers of bit errors and is replaced by robust CRC16 / CRC32 checksums.',
        explanation: 'Simple parity cannot detect 2-bit flips. Modern protocols use packet-level CRCs (Cyclic Redundancy Checks) for reliable error detection.',
        points: 10
      }
    ]
  },
  {
    id: 'spi-communication',
    topicNumber: '16',
    title: 'SPI Communication',
    difficulty: 'intermediate',
    description: 'Dual/Quad SPI, QSPI flash, DMA streaming, and multi-slave bus topologies.',
    longDescription: 'Master advanced SPI bus implementations: Daisy-chaining vs individual Chip Selects, Quad-SPI (QSPI) execution-in-place (XIP), DMA transactions, and display controllers.',
    estimatedTime: '12 mins',
    points: 100,
    questions: [
      {
        id: 'spic-1',
        question: 'What is Quad-SPI (QSPI) flash memory and how does it differ from standard SPI?',
        options: [
          'It uses 4 multiplexed bidirectional data lines (IO0–IO3) to transfer 4 bits per clock cycle, quadrupling read throughput.',
          'It connects 4 separate microcontrollers together.',
          'It operates at 4 times higher voltage.',
          'It only works with 4-byte files.'
        ],
        correctAns: 'It uses 4 multiplexed bidirectional data lines (IO0–IO3) to transfer 4 bits per clock cycle, quadrupling read throughput.',
        explanation: 'QSPI expands the single MOSI/MISO pair to 4 parallel data pins, delivering high throughput required for executing code directly from Flash.',
        points: 10
      },
      {
        id: 'spic-2',
        question: 'What is "Execute-in-Place" (XIP) over QSPI/SPI Flash in microcontrollers like THEJAS32?',
        options: [
          'The CPU fetches and executes instructions directly from external SPI Flash through an internal cache as if it were internal memory.',
          'All code is copied to an external SD card.',
          'Instructions are executed inside the flash chip silicon.',
          'Code runs without a CPU core.'
        ],
        correctAns: 'The CPU fetches and executes instructions directly from external SPI Flash through an internal cache as if it were internal memory.',
        explanation: 'XIP hardware maps the external serial flash into the CPU 32-bit linear address space, automatically caching and fetching instructions on the fly.',
        points: 10
      },
      {
        id: 'spic-3',
        question: 'What is the "Daisy-Chain" configuration in multi-device SPI buses?',
        options: [
          'The MISO output of each slave is wired to the MOSI input of the next slave in a single shift-register ring with a shared Chip Select.',
          'Connecting all devices to 5V power rails.',
          'Using two master controllers simultaneously.',
          'Wiring clock lines in reverse.'
        ],
        correctAns: 'The MISO output of each slave is wired to the MOSI input of the next slave in a single shift-register ring with a shared Chip Select.',
        explanation: 'Daisy-chaining connects shift registers end-to-end (common in LED driver ICs), shifting data through all chips using only one CS line.',
        points: 10
      },
      {
        id: 'spic-4',
        question: 'Why must the SPI Chip Select (CS) pin be driven as a regular GPIO output rather than an automatic hardware pulse on many multi-byte transactions?',
        options: [
          'To keep CS asserted LOW continuously across multi-byte command, address, and data streams.',
          'Because hardware CS pins cannot output 3.3V.',
          'Because automatic CS only works on inputs.',
          'To double the clock speed.'
        ],
        correctAns: 'To keep CS asserted LOW continuously across multi-byte command, address, and data streams.',
        explanation: 'Many SPI devices (like Flash or LCDs) require CS to stay LOW for the entire packet (e.g. 1 command byte + 3 address bytes + N data bytes).',
        points: 10
      },
      {
        id: 'spic-5',
        question: 'What is the function of the "Data / Command" (D/C or RS) control pin on SPI TFT display controllers (e.g. ST7789, ILI9341)?',
        options: [
          'It signals whether the byte shifted over SPI is a controller command (LOW) or pixel graphic data (HIGH).',
          'It turns on the display backlight.',
          'It switches between 5V and 3.3V power.',
          'It adjusts the screen refresh rate.'
        ],
        correctAns: 'It signals whether the byte shifted over SPI is a controller command (LOW) or pixel graphic data (HIGH).',
        explanation: 'The D/C pin allows the display driver to distinguish between setup commands (like set column/row address) and raw color pixel data.',
        points: 10
      },
      {
        id: 'spic-6',
        question: 'What is the standard SPI Flash command opcode to read the 24-bit JEDEC Manufacturer and Device ID?',
        options: [
          '0x9F (Read Identification)',
          '0x00',
          '0xFF',
          '0x06 (Write Enable)'
        ],
        correctAns: '0x9F (Read Identification)',
        explanation: 'Opcode 0x9F is the universal JEDEC command supported by all standard NOR flash chips (Winbond, Macronix, etc.) to query chip identity.',
        points: 10
      },
      {
        id: 'spic-7',
        question: 'What command must be sent to an SPI Flash chip before executing a Page Program (write) or Sector Erase?',
        options: [
          '0x06 (Write Enable - WREN)',
          '0x04 (Write Disable)',
          '0x05 (Read Status)',
          '0x99 (Reset)'
        ],
        correctAns: '0x06 (Write Enable - WREN)',
        explanation: 'NOR flash chips lock write operations by default. Sending 0x06 sets the WEL (Write Enable Latch) bit in the status register.',
        points: 10
      },
      {
        id: 'spic-8',
        question: 'What is the typical page size for writing to an SPI NOR Flash memory chip?',
        options: [
          '256 Bytes',
          '4 Kilobytes',
          '1 Megabyte',
          '8 Bytes'
        ],
        correctAns: '256 Bytes',
        explanation: 'Standard SPI NOR flash chips program memory in pages of 256 bytes, and erase memory in sectors of 4 KB.',
        points: 10
      },
      {
        id: 'spic-9',
        question: 'What is the purpose of polling the "BUSY" / "WIP" (Write-In-Progress) bit in the SPI Flash status register after an erase command?',
        options: [
          'To wait until the high-voltage internal silicon erase cycle finishes before issuing new commands.',
          'To measure the chip temperature.',
          'To check if the battery is low.',
          'To verify the baud rate.'
        ],
        correctAns: 'To wait until the high-voltage internal silicon erase cycle finishes before issuing new commands.',
        explanation: 'Erasing a sector takes 30–200 ms in silicon. Firmware polls bit 0 (WIP) until it clears back to 0 before sending the next instruction.',
        points: 10
      },
      {
        id: 'spic-10',
        question: 'Why should SPI clock traces on a high-speed PCB (e.g. 50 MHz) have series termination resistors (e.g. 22–33 Ω)?',
        options: [
          'To dampen transmission line reflections and ringing on fast clock edges.',
          'To limit DC current to zero.',
          'To convert digital signals to analog sine waves.',
          'To step down 5V to 3.3V.'
        ],
        correctAns: 'To dampen transmission line reflections and ringing on fast clock edges.',
        explanation: 'Fast edge rates cause high-frequency reflections on PCB traces. A series damping resistor matches driver impedance and cleans signal integrity.',
        points: 10
      }
    ]
  },
  {
    id: 'i2c-communication',
    topicNumber: '17',
    title: 'I2C Communication',
    difficulty: 'intermediate',
    description: 'Repeated start, bus arbitration, SMBus compatibility, and sensor registers.',
    longDescription: 'Advanced I2C concepts: Repeated START condition timing, multi-master bus arbitration, 10-bit addressing, SMBus timeouts, and reading multi-byte sensor registers.',
    estimatedTime: '12 mins',
    points: 100,
    questions: [
      {
        id: 'i2cc-1',
        question: 'What is an I2C "Repeated START" (Sr) condition and why is it used?',
        options: [
          'Generating a new START condition without first issuing a STOP condition, switching from Write to Read mode atomically without releasing bus ownership.',
          'Repeating the same data byte twice for redundancy.',
          'Restarting the microcontroller clock.',
          'Resetting the power supply.'
        ],
        correctAns: 'Generating a new START condition without first issuing a STOP condition, switching from Write to Read mode atomically without releasing bus ownership.',
        explanation: 'Repeated START allows the master to write a sensor register address (Write mode) and immediately read back the data (Read mode) in one atomic transaction.',
        points: 10
      },
      {
        id: 'i2cc-2',
        question: 'How does I2C Multi-Master Bus Arbitration work when two masters transmit simultaneously?',
        options: [
          'Wired-AND open-drain arbitration: if a master attempts to send a 1 (HIGH) but senses a 0 (LOW) on SDA, it loses arbitration and drops off.',
          'The master with the highest power voltage always wins.',
          'Both masters halt and crash.',
          'The slaves arbitrate by voting.'
        ],
        correctAns: 'Wired-AND open-drain arbitration: if a master attempts to send a 1 (HIGH) but senses a 0 (LOW) on SDA, it loses arbitration and drops off.',
        explanation: 'Because open-drain 0 dominates over 1, a master that reads a 0 while outputting 1 realizes another master is transmitting and immediately becomes a listener.',
        points: 10
      },
      {
        id: 'i2cc-3',
        question: 'How do you read a 16-bit temperature register (address 0x05) from an I2C sensor (address 0x48)?',
        options: [
          'START -> Write 0x90 (0x48<<1|0) -> Write 0x05 -> Repeated START -> Write 0x91 (0x48<<1|1) -> Read MSB (ACK) -> Read LSB (NACK) -> STOP',
          'Directly read 2 bytes without sending the register address.',
          'Send STOP condition first then transmit data.',
          'Write 0x05 to SCL line.'
        ],
        correctAns: 'START -> Write 0x90 (0x48<<1|0) -> Write 0x05 -> Repeated START -> Write 0x91 (0x48<<1|1) -> Read MSB (ACK) -> Read LSB (NACK) -> STOP',
        explanation: 'This is the standard register read pattern: select internal register address, issue Repeated START in Read mode, ACK intermediate bytes, and NACK the final byte before STOP.',
        points: 10
      },
      {
        id: 'i2cc-4',
        question: 'Why does the master send a NACK (leaving SDA HIGH) on the very last byte received during an I2C Read transaction?',
        options: [
          'To inform the slave that no more bytes are requested, allowing the slave to release the SDA line so the master can send a STOP condition.',
          'To signal a data corruption error.',
          'To reset the slave address.',
          'To increase the bus frequency.'
        ],
        correctAns: 'To inform the slave that no more bytes are requested, allowing the slave to release the SDA line so the master can send a STOP condition.',
        explanation: 'If the master sends an ACK, the slave prepares to output the next byte and holds SDA. NACK releases the bus so the master can generate STOP.',
        points: 10
      },
      {
        id: 'i2cc-5',
        question: 'What is an "I2C Bus Lockup" (stuck SDA low) and how can firmware recover from it?',
        options: [
          'A slave is interrupted mid-read and holds SDA LOW; firmware recovers by manually toggling SCL up to 9 times until the slave releases SDA.',
          'The pull-up resistor burns out.',
          'The master power rail shorts to ground.',
          'The baud rate multiplier overflows.'
        ],
        correctAns: 'A slave is interrupted mid-read and holds SDA LOW; firmware recovers by manually toggling SCL up to 9 times until the slave releases SDA.',
        explanation: 'If a master resets during a read, the slave waits for remaining clock pulses. Clocking SCL 9 times allows the slave to finish its byte and release SDA.',
        points: 10
      },
      {
        id: 'i2cc-6',
        question: 'What is 10-bit I2C addressing and how is it initiated on the bus?',
        options: [
          'The first byte sends reserved prefix 11110xx + top 2 address bits, followed by a second byte containing the remaining 8 address bits.',
          'Using 10 physical wires.',
          'Transmitting 10 clock pulses per byte.',
          'Using double voltage.'
        ],
        correctAns: 'The first byte sends reserved prefix 11110xx + top 2 address bits, followed by a second byte containing the remaining 8 address bits.',
        explanation: '10-bit addressing expands device capacity to 1024 nodes using a 2-byte header with unique prefix 11110 without conflicting with 7-bit devices.',
        points: 10
      },
      {
        id: 'i2cc-7',
        question: 'What is the difference between I2C and SMBus (System Management Bus)?',
        options: [
          'SMBus enforces strict minimum clock frequencies (35 ms timeout) and standardized protocol packets for battery/power management.',
          'SMBus uses 8 wires instead of 2.',
          'SMBus is an optical wireless protocol.',
          'SMBus does not use pull-up resistors.'
        ],
        correctAns: 'SMBus enforces strict minimum clock frequencies (35 ms timeout) and standardized protocol packets for battery/power management.',
        explanation: 'SMBus builds on I2C with strict electrical levels and a 35 ms timeout preventing hung bus states in computer power management.',
        points: 10
      },
      {
        id: 'i2cc-8',
        question: 'What happens if the pull-up resistor value on an I2C bus is too large (e.g. 100 kΩ instead of 4.7 kΩ)?',
        options: [
          'Bus capacitance causes slow, rounded rising edges, corrupting fast clock signals (violating rise-time specifications).',
          'Current consumption increases to 10 Amperes.',
          'The bus speed automatically multiplies by 10.',
          'The slave chips melt.'
        ],
        correctAns: 'Bus capacitance causes slow, rounded rising edges, corrupting fast clock signals (violating rise-time specifications).',
        explanation: 'RC time constant (R_pullup * C_bus) determines signal rise time. High resistance values cause signals to rise too slowly for 400 kHz operation.',
        points: 10
      },
      {
        id: 'i2cc-9',
        question: 'What is the "General Call" address in the I2C protocol?',
        options: [
          'Address 0x00, used by the master to broadcast messages to all connected slaves simultaneously.',
          'Address 0xFF for factory testing.',
          'The master CPU reset address.',
          'An emergency stop signal.'
        ],
        correctAns: 'Address 0x00, used by the master to broadcast messages to all connected slaves simultaneously.',
        explanation: 'Address 0x00 is the I2C General Call address. Slaves programmed to respond can be reset or synchronized in a single broadcast.',
        points: 10
      },
      {
        id: 'i2cc-10',
        question: 'Why do most I2C digital sensors auto-increment their internal register address pointer during multi-byte reads?',
        options: [
          'To allow continuous bursting of sequential data (e.g. Accel X, Y, Z axes) in a single read transaction.',
          'To prevent memory fragmentation.',
          'To randomize data encryption.',
          'To increase the sensor temperature.'
        ],
        correctAns: 'To allow continuous bursting of sequential data (e.g. Accel X, Y, Z axes) in a single read transaction.',
        explanation: 'Auto-incrementing internal pointers allow reading multi-byte sensor values (e.g. 6 bytes for 3-axis accelerometer) in one continuous burst without re-sending addresses.',
        points: 10
      }
    ]
  },
  {
    id: 'interrupt-handling',
    topicNumber: '18',
    title: 'Interrupt Handling',
    difficulty: 'intermediate',
    description: 'Nested interrupts, priority grouping, critical sections, and tail-chaining.',
    longDescription: 'Deep dive into advanced interrupt controller mechanisms: nested vectored interrupts, context switching latency, atomic critical sections, and race condition prevention.',
    estimatedTime: '12 mins',
    points: 100,
    questions: [
      {
        id: 'ih-1',
        question: 'What is "Nested Interrupt" execution in modern embedded processors?',
        options: [
          'A higher-priority interrupt can preempt (pause) an active lower-priority ISR and execute immediately.',
          'An interrupt that triggers itself recursively in an infinite loop.',
          'Multiple interrupts executing simultaneously on a single CPU core.',
          'Interrupts generated only by software timers.'
        ],
        correctAns: 'A higher-priority interrupt can preempt (pause) an active lower-priority ISR and execute immediately.',
        explanation: 'Preemption nesting ensures urgent hard-realtime events (like motor over-current) are serviced without waiting for long lower-priority ISRs (like UART buffering).',
        points: 10
      },
      {
        id: 'ih-2',
        question: 'What is a "Race Condition" between an interrupt handler and the main application loop?',
        options: [
          'A bug where the main loop is interrupted midway through modifying a multi-byte variable, leaving the data in an inconsistent corrupted state.',
          'Two microcontrollers competing for Wi-Fi bandwidth.',
          'A timer counting faster than the CPU clock.',
          'An overflow in the baud rate generator.'
        ],
        correctAns: 'A bug where the main loop is interrupted midway through modifying a multi-byte variable, leaving the data in an inconsistent corrupted state.',
        explanation: 'If a 32-bit variable is updated 16 bits at a time on an 8/16-bit bus, an interrupt occurring halfway reads half old and half new data (torn read).',
        points: 10
      },
      {
        id: 'ih-3',
        question: 'How do you create a Critical Section in embedded C to protect shared data structures?',
        codeSnippet: `uint32_t flags = save_and_disable_interrupts();\n// Critical Section: modify shared data\nrestore_interrupts(flags);`,
        options: [
          'Save global interrupt enable state, disable interrupts temporarily, perform the update, and restore the previous interrupt state.',
          'Call malloc() to lock memory.',
          'Set the CPU clock to 0 MHz.',
          'Increase the timer prescaler.'
        ],
        correctAns: 'Save global interrupt enable state, disable interrupts temporarily, perform the update, and restore the previous interrupt state.',
        explanation: 'Disabling interrupts prevents preemption during critical updates. Saving and restoring the state ensures nested functions do not accidentally re-enable interrupts prematurely.',
        points: 10
      },
      {
        id: 'ih-4',
        question: 'What is "Tail-Chaining" in advanced hardware interrupt controllers?',
        options: [
          'Skipping redundant register pop and push cycles when transitioning directly from one pending ISR to the next, reducing latency by up to 80%.',
          'Connecting multiple interrupts in series with copper wires.',
          'Chaining multiple timer delays.',
          'Software recursion at the end of a function.'
        ],
        correctAns: 'Skipping redundant register pop and push cycles when transitioning directly from one pending ISR to the next, reducing latency by up to 80%.',
        explanation: 'Tail-chaining avoids restoring and immediately re-saving CPU registers when another interrupt is pending, jumping directly to the next ISR in minimal clock cycles.',
        points: 10
      },
      {
        id: 'ih-5',
        question: 'What is "Interrupt Jitter"?',
        options: [
          'The statistical variation in interrupt response latency caused by varying instruction execution states, memory wait-states, or critical sections.',
          'Physical vibration of the crystal oscillator.',
          'Random voltage drops on the power rail.',
          'Baud rate fluctuations on serial lines.'
        ],
        correctAns: 'The statistical variation in interrupt response latency caused by varying instruction execution states, memory wait-states, or critical sections.',
        explanation: 'Interrupt jitter is the time delta between best-case and worst-case interrupt response, critical to minimize in DSP and motor control loops.',
        points: 10
      },
      {
        id: 'ih-6',
        question: 'What is the purpose of the RISC-V Machine Status register (mstatus) MIE bit?',
        options: [
          'Global Machine-mode Interrupt Enable bit: 1 enables all maskable interrupts; 0 globally disables all interrupts.',
          'Enables floating point coprocessor.',
          'Sets CPU clock speed.',
          'Controls the debug JTAG interface.'
        ],
        correctAns: 'Global Machine-mode Interrupt Enable bit: 1 enables all maskable interrupts; 0 globally disables all interrupts.',
        explanation: 'In the RISC-V privileged architecture, clearing the MIE (Machine Interrupt Enable) bit in mstatus provides global interrupt masking.',
        points: 10
      },
      {
        id: 'ih-7',
        question: 'What instruction does a RISC-V CPU core execute at the conclusion of an interrupt handler to return to the interrupted context?',
        options: [
          'mret (Machine-mode Exception Return)',
          'ret',
          'call',
          'jump 0x00'
        ],
        correctAns: 'mret (Machine-mode Exception Return)',
        explanation: 'The mret instruction atomically restores the Program Counter from mepc and restores previous privilege and interrupt enable bits from mstatus.',
        points: 10
      },
      {
        id: 'ih-8',
        question: 'What is an "Asynchronous" vs "Synchronous" Exception in processor architecture?',
        options: [
          'Asynchronous exceptions (Interrupts) are caused by external hardware events; Synchronous exceptions (Traps) are caused by instruction execution faults (e.g. illegal instruction, divide-by-zero).',
          'Asynchronous exceptions only happen at night.',
          'Synchronous exceptions do not stop CPU execution.',
          'They refer to timer frequencies.'
        ],
        correctAns: 'Asynchronous exceptions (Interrupts) are caused by external hardware events; Synchronous exceptions (Traps) are caused by instruction execution faults (e.g. illegal instruction, divide-by-zero).',
        explanation: 'Synchronous traps are directly tied to an instruction in the CPU pipeline (like bus error or ecall), whereas asynchronous interrupts occur at unpredictable times from external pins/timers.',
        points: 10
      },
      {
        id: 'ih-9',
        question: 'What is the RISC-V "mcause" register used for inside a trap/interrupt handler?',
        options: [
          'It records the reason/source of the trap or interrupt (Interrupt bit + Exception Code).',
          'It stores the stack pointer.',
          'It holds the baud rate multiplier.',
          'It controls the Flash memory power supply.'
        ],
        correctAns: 'It records the reason/source of the trap or interrupt (Interrupt bit + Exception Code).',
        explanation: 'When a trap occurs, hardware writes the cause into mcause (e.g. 0x80000007 for timer interrupt, 0x00000002 for illegal instruction), allowing software dispatch.',
        points: 10
      },
      {
        id: 'ih-10',
        question: 'Why should complex processing (like floating-point math or JSON parsing) be deferred to the main loop using an event queue rather than executed directly inside an ISR?',
        options: [
          'To minimize interrupt disable duration, avoid stack overflow in small ISR stack frames, and maintain real-time responsiveness.',
          'Because math is forbidden in C ISR functions.',
          'Because ISRs cannot execute multiplication.',
          'To save battery life.'
        ],
        correctAns: 'To minimize interrupt disable duration, avoid stack overflow in small ISR stack frames, and maintain real-time responsiveness.',
        explanation: 'Best-practice embedded architecture uses "Top-Half" (fast ISR flags/captures data) and "Bottom-Half" (main loop or RTOS task processes data).',
        points: 10
      }
    ]
  },
  {
    id: 'peripheral-configuration',
    topicNumber: '19',
    title: 'Peripheral Configuration',
    difficulty: 'intermediate',
    description: 'Pin multiplexing, clock gating, power domains, and peripheral initialization.',
    longDescription: 'Master peripheral hardware initialization: clock gating configuration, Pin Multiplexing (PinMux) registers, peripheral reset sequences, and power domain management on THEJAS32 SoC.',
    estimatedTime: '12 mins',
    points: 100,
    questions: [
      {
        id: 'pc-1',
        question: 'What is "Pin Multiplexing" (PinMux / Alternate Function) on modern microcontrollers?',
        options: [
          'Routing different internal peripheral signals (e.g. UART TX, SPI SCK, PWM, or GPIO) to the same physical IC package pin via internal multiplexer registers.',
          'Connecting multiple wires to the same screw terminal.',
          'Multiplying the voltage on an analog pin.',
          'Combining power supply pins together.'
        ],
        correctAns: 'Routing different internal peripheral signals (e.g. UART TX, SPI SCK, PWM, or GPIO) to the same physical IC package pin via internal multiplexer registers.',
        explanation: 'Microcontrollers have more internal peripheral functions than physical package pins. PinMux registers configure which internal peripheral connects to each physical pin.',
        points: 10
      },
      {
        id: 'pc-2',
        question: 'What is "Peripheral Clock Gating" and why is it enabled/disabled in software?',
        options: [
          'Enabling the clock supply to a specific peripheral block only when needed to save power; disabled peripherals consume zero dynamic switching power.',
          'Setting the baud rate of the timer.',
          'A physical door switch on the board.',
          'A crystal oscillator filter.'
        ],
        correctAns: 'Enabling the clock supply to a specific peripheral block only when needed to save power; disabled peripherals consume zero dynamic switching power.',
        explanation: 'In CMOS silicon, unclocked peripheral gates draw negligible leakage current. Firmware must enable the peripheral clock before accessing its registers.',
        points: 10
      },
      {
        id: 'pc-3',
        question: 'What happens if firmware attempts to read or write a peripheral register before enabling its peripheral clock gate?',
        options: [
          'The bus access hangs (bus timeout / fault exception) or reads all zeros because the peripheral logic is unpowered/unclocked.',
          'The peripheral clock automatically turns on.',
          'The chip permanently burns out.',
          'The compiler emits a warning.'
        ],
        correctAns: 'The bus access hangs (bus timeout / fault exception) or reads all zeros because the peripheral logic is unpowered/unclocked.',
        explanation: 'Accessing unclocked peripheral register blocks causes APB/AHB bus errors or silent read/write failures. Clock gating is always step 1 of peripheral initialization.',
        points: 10
      },
      {
        id: 'pc-4',
        question: 'What is the correct sequential order for initializing a hardware peripheral (e.g. UART)?',
        options: [
          '1. Enable Peripheral Clock -> 2. Configure PinMux/GPIO -> 3. Configure Baud/Control Registers -> 4. Enable Peripheral and Interrupts.',
          '1. Enable Interrupts -> 2. Turn off power -> 3. Write data.',
          '1. Transmit byte -> 2. Set baud rate -> 3. Configure pins.',
          '1. Reset CPU -> 2. Set pull-ups.'
        ],
        correctAns: '1. Enable Peripheral Clock -> 2. Configure PinMux/GPIO -> 3. Configure Baud/Control Registers -> 4. Enable Peripheral and Interrupts.',
        explanation: 'Clock gating must come first so registers respond; PinMux connects signals; control registers configure mode; finally enable the peripheral.',
        points: 10
      },
      {
        id: 'pc-5',
        question: 'What is a "Peripheral Software Reset" register bit?',
        options: [
          'A bit in the power/reset controller that resets all internal flip-flops and state machines of that specific peripheral to factory default states.',
          'A bit that resets the whole microcontroller.',
          'A command to reflash the bootloader.',
          'A bit that erases SRAM.'
        ],
        correctAns: 'A bit in the power/reset controller that resets all internal flip-flops and state machines of that specific peripheral to factory default states.',
        explanation: 'Toggling the peripheral reset bit clears any stuck states or corrupt FIFOs without resetting the rest of the running system.',
        points: 10
      },
      {
        id: 'pc-6',
        question: 'What is "Slew Rate Control" on microcontroller output pins?',
        options: [
          'Controlling the speed (voltage rise/fall time) of output pin transitions to balance high-speed signal integrity against radiated electromagnetic interference (EMI).',
          'Adjusting the PWM duty cycle.',
          'Regulating the battery charging current.',
          'Calibrating the ADC gain.'
        ],
        correctAns: 'Controlling the speed (voltage rise/fall time) of output pin transitions to balance high-speed signal integrity against radiated electromagnetic interference (EMI).',
        explanation: 'Fast slew rates are needed for 50 MHz SPI clocks but generate high-frequency EMI noise. Slower slew rates are chosen for lower-frequency lines.',
        points: 10
      },
      {
        id: 'pc-7',
        question: 'What is a "Drive Strength" configuration (e.g. 2 mA, 4 mA, 8 mA, 12 mA) on a GPIO pin?',
        options: [
          'Configuring the internal MOSFET transistor sizing to set the maximum current the output buffer can source or sink while maintaining valid logic levels.',
          'Setting the maximum board power consumption.',
          'Configuring the CPU clock multiplier.',
          'Selecting the pull-up resistor value.'
        ],
        correctAns: 'Configuring the internal MOSFET transistor sizing to set the maximum current the output buffer can source or sink while maintaining valid logic levels.',
        explanation: 'Higher drive strength allows driving capacitive loads and fast clock lines without signal degradation, while lower drive strength reduces power and noise.',
        points: 10
      },
      {
        id: 'pc-8',
        question: 'What is the role of the System Control / Power Management Unit (PMU) on THEJAS32?',
        options: [
          'Controlling system clock generation, PLL multipliers, low-power sleep modes, and voltage domain gating.',
          'Managing the Wi-Fi credentials.',
          'Controlling the IDE code editor.',
          'Compiling C code into assembly.'
        ],
        correctAns: 'Controlling system clock generation, PLL multipliers, low-power sleep modes, and voltage domain gating.',
        explanation: 'The PMU orchestrates clock generators, resets, power-down modes (Sleep, Deep-Sleep), and peripheral power domains.',
        points: 10
      },
      {
        id: 'pc-9',
        question: 'Why should unused microcontroller GPIO pins be configured as inputs with internal pull-up/pull-down enabled or set as low outputs?',
        options: [
          'To prevent floating inputs from toggling randomly and consuming unnecessary dynamic leakage power.',
          'To increase the size of Flash memory.',
          'Because floating pins cause compiler errors.',
          'To prevent the board from getting cold.'
        ],
        correctAns: 'To prevent floating inputs from toggling randomly and consuming unnecessary dynamic leakage power.',
        explanation: 'Floating CMOS inputs hover near intermediate threshold voltages, causing both PMOS and NMOS transistors in the input buffer to conduct, wasting power.',
        points: 10
      },
      {
        id: 'pc-10',
        question: 'What is a "Loopback Mode" found in peripheral controllers like UART and SPI?',
        options: [
          'An internal diagnostic mode where the transmitter output is internally connected directly to the receiver input for self-test verification without external wiring.',
          'An infinite while-loop.',
          'A hardware bug.',
          'A circuit that routes power backwards.'
        ],
        correctAns: 'An internal diagnostic mode where the transmitter output is internally connected directly to the receiver input for self-test verification without external wiring.',
        explanation: 'Loopback mode routes TX to RX inside the silicon, allowing automated firmware self-tests (Built-In Self-Test / BIST) to verify peripheral sanity.',
        points: 10
      }
    ]
  },

  // ==========================================================================
  // ADVANCED TOPICS (9)
  // ==========================================================================
  {
    id: 'bare-metal-programming',
    topicNumber: '20',
    title: 'Bare-Metal Programming',
    difficulty: 'advanced',
    description: 'Startup code, linker scripts, C runtime initialization, and zero-OS architecture.',
    longDescription: 'Explore true bare-metal embedded programming: crt0.s startup assembly, linker memory layouts (link.lds), vector table relocations, and direct hardware register drivers without third-party frameworks.',
    estimatedTime: '15 mins',
    points: 100,
    questions: [
      {
        id: 'bmp-1',
        question: 'What is the primary responsibility of the C Runtime Startup code (crt0.s) before main() is called in a bare-metal system?',
        options: [
          'Initialize the Stack Pointer (SP), copy .data from Flash to SRAM, zero-out the .bss section, and jump to main().',
          'Start a Linux kernel.',
          'Connect to a Wi-Fi router.',
          'Display a graphical boot logo.'
        ],
        correctAns: 'Initialize the Stack Pointer (SP), copy .data from Flash to SRAM, zero-out the .bss section, and jump to main().',
        explanation: 'Before C code can execute, the hardware stack pointer must be set, initialized variables must be copied from Flash to RAM, and uninitialized globals cleared to zero.',
        points: 10
      },
      {
        id: 'bmp-2',
        question: 'What role does a GNU Linker Script (e.g. link1.lds) play in the bare-metal build process?',
        options: [
          'It defines the physical memory regions (FLASH, SRAM) and instructs the linker where to place code (.text), constants (.rodata), and variables (.data, .bss).',
          'It compiles C source code into assembly.',
          'It converts binary files into PDF documentation.',
          'It acts as the serial flasher over Wi-Fi.'
        ],
        correctAns: 'It defines the physical memory regions (FLASH, SRAM) and instructs the linker where to place code (.text), constants (.rodata), and variables (.data, .bss).',
        explanation: 'The linker script maps compiler object sections to the physical memory layout of the chip, assigning exact base addresses and size limits.',
        points: 10
      },
      {
        id: 'bmp-3',
        question: 'What happens if a bare-metal C program reaches the end of main() and executes a "return 0;" statement?',
        options: [
          'In bare-metal systems with no OS, returning from main() results in undefined behavior (often an infinite halt loop or reset in startup code).',
          'The computer shuts down cleanly.',
          'The program re-compiles itself.',
          'The CPU switches to 64-bit mode.'
        ],
        correctAns: 'In bare-metal systems with no OS, returning from main() results in undefined behavior (often an infinite halt loop or reset in startup code).',
        explanation: 'Bare-metal systems have no OS shell to return to. Startup files typically implement a fallback while (1) loop if main() ever returns.',
        points: 10
      },
      {
        id: 'bmp-4',
        question: 'What is the difference between Load Memory Address (LMA) and Virtual/Runtime Memory Address (VMA) in linker scripts?',
        options: [
          'LMA is where section data is stored permanently in Flash, while VMA is where the section resides in RAM during execution.',
          'LMA is the CPU clock speed, VMA is the timer speed.',
          'LMA is for 32-bit code, VMA is for 64-bit code.',
          'They are identical in all architectures.'
        ],
        correctAns: 'LMA is where section data is stored permanently in Flash, while VMA is where the section resides in RAM during execution.',
        explanation: 'The .data section has an LMA in Flash (so initial values survive power-off) and a VMA in SRAM (where variables are read/written at runtime).',
        points: 10
      },
      {
        id: 'bmp-5',
        question: 'What RISC-V register holds the global pointer (gp) used for relaxations and fast addressing of small data objects?',
        options: [
          'x3 (gp)',
          'x1 (ra)',
          'x2 (sp)',
          'x0 (zero)'
        ],
        correctAns: 'x3 (gp)',
        explanation: 'In RISC-V ABI, register x3 (gp) points to the small data section (.sdata/.sbss), allowing single-instruction +/- 2KB offset addressing.',
        points: 10
      },
      {
        id: 'bmp-6',
        question: 'What is the purpose of the RISC-V "wfi" (Wait For Interrupt) assembly instruction in bare-metal idle loops?',
        options: [
          'It halts the CPU pipeline and clocks to save power until an enabled interrupt wakes the core.',
          'It flashes the bootloader.',
          'It clears all SRAM to zero.',
          'It restarts the oscillator.'
        ],
        correctAns: 'It halts the CPU pipeline and clocks to save power until an enabled interrupt wakes the core.',
        explanation: 'The wfi instruction puts the core into low-power clock-gated sleep, instantly resuming execution when an interrupt request arrives.',
        points: 10
      },
      {
        id: 'bmp-7',
        question: 'Why must hardware peripheral registers never be allocated on the stack?',
        options: [
          'Because peripheral registers are fixed physical silicon addresses in memory-mapped I/O, not transient local variables.',
          'Because stack variables cannot store 32-bit integers.',
          'Because the stack is read-only.',
          'Because the compiler deletes stack memory.'
        ],
        correctAns: 'Because peripheral registers are fixed physical silicon addresses in memory-mapped I/O, not transient local variables.',
        explanation: 'Hardware registers exist at fixed hardware addresses (e.g. 0x10000000). Stack allocations create temporary RAM locations that have no connection to hardware pins.',
        points: 10
      },
      {
        id: 'bmp-8',
        question: 'What does the linker symbol "_estack" or "_stack_top" represent in bare-metal firmware?',
        options: [
          'The highest RAM address where the initial Stack Pointer (SP) is pointed at boot time (stack grows downward).',
          'The size of Flash memory.',
          'The entry point of the bootloader.',
          'The UART baud rate register.'
        ],
        correctAns: 'The highest RAM address where the initial Stack Pointer (SP) is pointed at boot time (stack grows downward).',
        explanation: 'Linker scripts calculate the top of SRAM (e.g. 0x20000000 + 256KB) and initialize the stack pointer there; pushing data decrements the SP downward.',
        points: 10
      },
      {
        id: 'bmp-9',
        question: 'What is a "Hard Fault" or "Trap Handler" in bare-metal firmware?',
        options: [
          'A low-level exception handler that catches illegal instructions, unaligned memory accesses, or bus errors to prevent unmonitored silent failure.',
          'A hardware button on the board.',
          'A software break condition.',
          'A tool to measure voltage.'
        ],
        correctAns: 'A low-level exception handler that catches illegal instructions, unaligned memory accesses, or bus errors to prevent unmonitored silent failure.',
        explanation: 'When CPU hardware encounters an invalid operation, it traps into the trap vector, where the handler can log register state for post-mortem debugging.',
        points: 10
      },
      {
        id: 'bmp-10',
        question: 'What is the role of the "__attribute__((naked))" function attribute in bare-metal assembly wrappers?',
        options: [
          'It instructs the compiler not to generate any function prologue or epilogue (no stack push/pop), allowing custom assembly instructions to execute directly.',
          'It converts C into machine microcode.',
          'It strips out all comments.',
          'It enables floating point.'
        ],
        correctAns: 'It instructs the compiler not to generate any function prologue or epilogue (no stack push/pop), allowing custom assembly instructions to execute directly.',
        explanation: 'Naked functions allow developers to write exact low-level assembly context-switchers without compiler-generated stack manipulation interfering.',
        points: 10
      }
    ]
  },
  {
    id: 'memory-mapped-registers',
    topicNumber: '21',
    title: 'Memory-Mapped Registers',
    difficulty: 'advanced',
    description: 'Bus topologies, address decoder design, peripheral address space, and register maps.',
    longDescription: 'Deep architectural understanding of Memory-Mapped I/O (MMIO), address decoding logic on the system bus, bit-banding concepts, and peripheral register mapping.',
    estimatedTime: '15 mins',
    points: 100,
    questions: [
      {
        id: 'mmr-1',
        question: 'How does the CPU differentiate between an access to internal SRAM and an access to a peripheral register in MMIO?',
        options: [
          'By the physical memory address: the system bus address decoder routes reads/writes to SRAM controller or peripheral APB bridge based on the address range.',
          'By using different assembly load instructions.',
          'By reading the pin voltage.',
          'By consulting an external EEPROM.'
        ],
        correctAns: 'By the physical memory address: the system bus address decoder routes reads/writes to SRAM controller or peripheral APB bridge based on the address range.',
        explanation: 'The system bus address decoder matches high address bits (e.g. 0x1000xxxx -> Peripherals, 0x2000xxxx -> SRAM) and asserts the appropriate peripheral chip-select line.',
        points: 10
      },
      {
        id: 'mmr-2',
        question: 'Why does reading certain hardware registers (like UART RX Data Register or Timer Capture) produce side effects in hardware?',
        options: [
          'Because the hardware read cycle automatically advances internal hardware state (e.g. popping a byte from the RX FIFO or clearing interrupt flags).',
          'Because reading draws 5V power.',
          'Because the CPU cache corrupts the value.',
          'Because reading changes the baud rate.'
        ],
        correctAns: 'Because the hardware read cycle automatically advances internal hardware state (e.g. popping a byte from the RX FIFO or clearing interrupt flags).',
        explanation: 'Unlike passive RAM, reading a peripheral register can trigger hardware actions in silicon, which is why debugger memory inspection windows must be used carefully.',
        points: 10
      },
      {
        id: 'mmr-3',
        question: 'What is a "Shadow Register" in peripheral hardware design (e.g. in Timer or PWM controllers)?',
        options: [
          'A pre-load buffer register that holds new settings until an update event occurs, transferring values synchronously to the active register to prevent glitches.',
          'A register that only operates in dark mode.',
          'A backup register stored in Flash.',
          'A mirrored register for reverse endianness.'
        ],
        correctAns: 'A pre-load buffer register that holds new settings until an update event occurs, transferring values synchronously to the active register to prevent glitches.',
        explanation: 'Shadow registers prevent intermediate glitching. Modifying PWM duty cycle updates the shadow register; at the end of the PWM cycle, hardware updates the active comparator atomically.',
        points: 10
      },
      {
        id: 'mmr-4',
        question: 'What is the risk of compiler register caching when accessing hardware status registers without volatile?',
        codeSnippet: `// BUGGY CODE without volatile:\nuint32_t *uart_status = (uint32_t *)0x10000004;\nwhile ((*uart_status & 0x01) == 0); // Compiler converts this to infinite loop!`,
        options: [
          'The compiler reads the register once into a CPU register (e.g. a0) and loops on the CPU register value forever, never re-reading the changing hardware pin.',
          'The hardware shuts down.',
          'The RAM is erased.',
          'The UART baud rate drops to zero.'
        ],
        correctAns: 'The compiler reads the register once into a CPU register (e.g. a0) and loops on the CPU register value forever, never re-reading the changing hardware pin.',
        explanation: 'The compiler assumes normal RAM cannot change on its own and optimizes the loop by reading once. volatile forces a fresh bus read instruction on every single iteration.',
        points: 10
      },
      {
        id: 'mmr-5',
        question: 'What is an "AHB-to-APB Bridge" in 32-bit SoC architectures?',
        options: [
          'A bus bridge that translates high-speed pipelined system bus transactions (AHB) into lower-power, simpler peripheral bus transactions (APB).',
          'A physical cable between two development boards.',
          'A software library for Wi-Fi.',
          'A voltage level shifter.'
        ],
        correctAns: 'A bus bridge that translates high-speed pipelined system bus transactions (AHB) into lower-power, simpler peripheral bus transactions (APB).',
        explanation: 'The bridge buffers and matches timing between the high-speed CPU/Memory bus (AHB) and the slower, power-efficient peripheral bus (APB) where GPIO and UART reside.',
        points: 10
      },
      {
        id: 'mmr-6',
        question: 'What does "Bit-Banding" provide in architectures that support it?',
        options: [
          'Mapping individual bits of a 32-bit word to distinct 32-bit word addresses in an alias region, allowing atomic single-instruction bit modification.',
          'A technique to compress 32-bit words into 8 bits.',
          'A method to increase clock speed.',
          'An encryption scheme for Flash.'
        ],
        correctAns: 'Mapping individual bits of a 32-bit word to distinct 32-bit word addresses in an alias region, allowing atomic single-instruction bit modification.',
        explanation: 'Bit-banding eliminates read-modify-write cycles by giving every single bit its own unique memory address for atomic 1-instruction writes.',
        points: 10
      },
      {
        id: 'mmr-7',
        question: 'What is a "Bus Fault" or "Precise Data Abort" when writing to a memory-mapped address?',
        options: [
          'An exception triggered when the CPU attempts to access a reserved or nonexistent address on the system bus that returns an error response.',
          'A broken physical PCB wire.',
          'A loose jumper wire.',
          'A software break condition.'
        ],
        correctAns: 'An exception triggered when the CPU attempts to access a reserved or nonexistent address on the system bus that returns an error response.',
        explanation: 'If code writes to an unmapped address, the bus decoder detects an illegal target and asserts an error response back to the core, raising a fault exception.',
        points: 10
      },
      {
        id: 'mmr-8',
        question: 'How are multi-byte registers stored in memory on a Little-Endian RISC-V processor like THEJAS32?',
        options: [
          'The least significant byte (LSB) is stored at the lowest memory address, and most significant byte (MSB) at the highest address.',
          'The most significant byte is stored first.',
          'Bytes are stored in random order.',
          'Bytes are encrypted.'
        ],
        correctAns: 'The least significant byte (LSB) is stored at the lowest memory address, and most significant byte (MSB) at the highest address.',
        explanation: 'In Little-Endian architectures, 0x12345678 at address 0x1000 is stored as: [0x1000]=0x78, [0x1001]=0x56, [0x1002]=0x34, [0x1003]=0x12.',
        points: 10
      },
      {
        id: 'mmr-9',
        question: 'What is the purpose of an "Atomic Read-Clear" status register?',
        options: [
          'A register that returns its current status flags when read and automatically resets all active flags to 0 in the same atomic hardware cycle.',
          'A register that never changes.',
          'A register that only reads 0.',
          'A flash memory register.'
        ],
        correctAns: 'A register that returns its current status flags when read and automatically resets all active flags to 0 in the same atomic hardware cycle.',
        explanation: 'Read-to-clear registers simplify status polling by combining retrieval and acknowledgment into a single bus transaction.',
        points: 10
      },
      {
        id: 'mmr-10',
        question: 'What is the role of a peripheral "Control Register" (CR) vs "Status Register" (SR)?',
        options: [
          'Control registers are written by software to configure modes/actions; Status registers are read by software to monitor hardware state.',
          'Control registers are read-only; Status registers are write-only.',
          'They are interchangeable names for the same register.',
          'Control registers store code; Status registers store variables.'
        ],
        correctAns: 'Control registers are written by software to configure modes/actions; Status registers are read by software to monitor hardware state.',
        explanation: 'This is the universal hardware convention: software commands peripheral behavior via CR and inspects peripheral feedback via SR.',
        points: 10
      }
    ]
  },
  {
    id: 'riscv-architecture',
    topicNumber: '22',
    title: 'RISC-V Architecture',
    difficulty: 'advanced',
    description: 'RV32IM instruction set, privilege modes, CSR registers, and ABI registers.',
    longDescription: 'Master the open RISC-V ISA specification: RV32I base instructions, M-extension (Hardware Multiply/Divide), Privilege Modes (M/S/U), Control and Status Registers (CSRs), and calling conventions.',
    estimatedTime: '15 mins',
    points: 100,
    questions: [
      {
        id: 'rv-1',
        question: 'What does the standard RISC-V ISA string "RV32IM" designate?',
        options: [
          '32-bit Base Integer Instruction Set (I) with standard Hardware Integer Multiplication and Division extension (M).',
          '32-bit Real-time Vector Instruction Set with Memory controller.',
          'Reduced Voltage 32-bit Industrial Microcontroller.',
          'Radio Vector 32-bit Instruction Modem.'
        ],
        correctAns: '32-bit Base Integer Instruction Set (I) with standard Hardware Integer Multiplication and Division extension (M).',
        explanation: 'RV32I is the fundamental 32-bit integer ISA (37 base instructions). The M extension adds hardware integer multiply (mul, mulh) and divide (div, rem) instructions.',
        points: 10
      },
      {
        id: 'rv-2',
        question: 'What is special about the RISC-V register x0 (zero)?',
        options: [
          'It is hardwired to constant zero in hardware; writes to x0 are discarded, and reads always return 0.',
          'It is the stack pointer.',
          'It holds the program counter.',
          'It is the memory base address.'
        ],
        correctAns: 'It is hardwired to constant zero in hardware; writes to x0 are discarded, and reads always return 0.',
        explanation: 'Hardwiring x0 to 0 simplifies the ISA: pseudo-instructions like nop (addi x0, x0, 0) and mv (addi rd, rs, 0) require no extra silicon opcodes.',
        points: 10
      },
      {
        id: 'rv-3',
        question: 'How many general-purpose registers (x0–x31) are in standard 32-bit RISC-V (RV32I)?',
        options: [
          '32 registers, each 32 bits wide.',
          '16 registers.',
          '64 registers.',
          '8 registers.'
        ],
        correctAns: '32 registers, each 32 bits wide.',
        explanation: 'RV32I provides 32 general-purpose registers (x0 to x31), each exactly XLEN = 32 bits wide.',
        points: 10
      },
      {
        id: 'rv-4',
        question: 'What are the three standard privilege modes defined in the RISC-V specification?',
        options: [
          'Machine Mode (M-mode), Supervisor Mode (S-mode), and User Mode (U-mode).',
          'Kernel Mode, Debug Mode, and Safe Mode.',
          'Protected Mode, Real Mode, and Virtual Mode.',
          'High Mode, Medium Mode, and Low Mode.'
        ],
        correctAns: 'Machine Mode (M-mode), Supervisor Mode (S-mode), and User Mode (U-mode).',
        explanation: 'Machine Mode is mandatory with full raw hardware access. S-mode supports operating systems with virtual memory (MMU), and U-mode runs user applications.',
        points: 10
      },
      {
        id: 'rv-5',
        question: 'Which RISC-V instructions are used to read and modify Control and Status Registers (CSRs)?',
        options: [
          'csrr, csrw, csrs, csrc (CSR Read/Write/Set/Clear)',
          'mov, ldr, str',
          'push, pop',
          'in, out'
        ],
        correctAns: 'csrr, csrw, csrs, csrc (CSR Read/Write/Set/Clear)',
        explanation: 'Specialized CSR instructions atomically read, write, set bits, or clear bits in the 12-bit CSR address space (e.g. csrs mstatus, t0).',
        points: 10
      },
      {
        id: 'rv-6',
        question: 'In the standard RISC-V calling convention (ABI), which registers are used to pass function arguments and return values?',
        options: [
          'a0 to a7 (x10 to x17)',
          's0 to s11',
          't0 to t6',
          'x0 only'
        ],
        correctAns: 'a0 to a7 (x10 to x17)',
        explanation: 'Registers a0–a7 hold up to 8 function arguments. a0 and a1 also hold the return value(s) from functions.',
        points: 10
      },
      {
        id: 'rv-7',
        question: 'What is the function of the "ra" (x1 - Return Address) register in RISC-V function calls?',
        options: [
          'The jal (Jump and Link) instruction saves the address of the next instruction into ra so the function knows where to return.',
          'It stores the return value of mathematical operations.',
          'It stores the reset vector.',
          'It points to the interrupt vector table.'
        ],
        correctAns: 'The jal (Jump and Link) instruction saves the address of the next instruction into ra so the function knows where to return.',
        explanation: 'Calling a function via jal ra, function_name saves the return address in ra (x1). The function returns by executing ret (jalr x0, 0(ra)).',
        points: 10
      },
      {
        id: 'rv-8',
        question: 'What is the RISC-V "EBREAK" instruction used for?',
        options: [
          'It triggers a breakpoint exception to hand control over to a hardware debugger (like OpenOCD / GDB).',
          'It breaks out of a while-loop.',
          'It stops the CPU clock permanently.',
          'It resets the board power supply.'
        ],
        correctAns: 'It triggers a breakpoint exception to hand control over to a hardware debugger (like OpenOCD / GDB).',
        explanation: 'The ebreak instruction generates a breakpoint trap used by debuggers to pause execution at software breakpoints.',
        points: 10
      },
      {
        id: 'rv-9',
        question: 'What is the RISC-V "ECALL" instruction used for?',
        options: [
          'Environment Call: Used by software to request system services from higher privilege modes (System Calls / OS API).',
          'Calling a C function.',
          'Enabling hardware interrupts.',
          'Erasing flash memory.'
        ],
        correctAns: 'Environment Call: Used by software to request system services from higher privilege modes (System Calls / OS API).',
        explanation: 'ecall triggers a synchronous environment call trap to invoke operating system kernel routines from user space or M-mode firmware.',
        points: 10
      },
      {
        id: 'rv-10',
        question: 'What is the RISC-V "mtvec" (Machine Trap-Vector Base-Address) register used for?',
        options: [
          'It stores the base memory address of the trap/interrupt handler and the vectoring mode (Direct or Vectored).',
          'It sets the timer interval.',
          'It holds the MAC address.',
          'It controls the cache size.'
        ],
        correctAns: 'It stores the base memory address of the trap/interrupt handler and the vectoring mode (Direct or Vectored).',
        explanation: 'When an exception or interrupt occurs in Machine mode, the CPU PC branches to the address configured in mtvec.',
        points: 10
      }
    ]
  },
  {
    id: 'thejas32-architecture',
    topicNumber: '23',
    title: 'THEJAS32 Architecture',
    difficulty: 'advanced',
    description: 'Indigenous Indian RISC-V SoC, pipeline stages, memory map, and peripherals.',
    longDescription: 'Explore the internal architecture of the indigenously designed Indian RISC-V THEJAS32 SoC: 3-stage pipeline, AHB/APB interconnects, on-chip peripherals, and VEGA ARIES v2.0 hardware implementation.',
    estimatedTime: '15 mins',
    points: 100,
    questions: [
      {
        id: 'th-1',
        question: 'What organisation designed the THEJAS32 RISC-V processor family powering VEGA boards?',
        options: [
          'C-DAC (Centre for Development of Advanced Computing, India) under the Microprocessor Development Programme (MDP).',
          'Intel Corporation',
          'ARM Holdings',
          'Espressif Systems'
        ],
        correctAns: 'C-DAC (Centre for Development of Advanced Computing, India) under the Microprocessor Development Programme (MDP).',
        explanation: 'THEJAS32 is an indigenous 32-bit RISC-V processor developed by C-DAC under India\'s Microprocessor Development Programme (MDP), Ministry of Electronics & IT (MeitY).',
        points: 10
      },
      {
        id: 'th-2',
        question: 'How many pipeline stages does the THEJAS32 core feature?',
        options: [
          '3-stage in-order pipeline (Fetch, Decode/Execute, Writeback)',
          '14-stage out-of-order pipeline',
          '1-stage single-cycle design',
          '8-stage superscalar pipeline'
        ],
        correctAns: '3-stage in-order pipeline (Fetch, Decode/Execute, Writeback)',
        explanation: 'THEJAS32 utilizes a 3-stage in-order pipeline optimized for embedded control, energy efficiency, and predictable instruction latency.',
        points: 10
      },
      {
        id: 'th-3',
        question: 'What is the default operating voltage and core clock speed of THEJAS32 on VEGA ARIES v2.0?',
        options: [
          '3.3V I/O with a 100 MHz operating core clock.',
          '5.0V I/O with a 16 MHz core clock.',
          '1.8V I/O with a 1 GHz core clock.',
          '12V I/O with a 100 kHz clock.'
        ],
        correctAns: '3.3V I/O with a 100 MHz operating core clock.',
        explanation: 'THEJAS32 on ARIES v2.0 runs at 100 MHz system frequency with 3.3V LVCMOS I/O compatibility.',
        points: 10
      },
      {
        id: 'th-4',
        question: 'Which hardware extensions are implemented in the THEJAS32 core on ARIES v2.0?',
        options: [
          'RV32IM (Integer + Hardware Multiply/Divide)',
          'RV64GC (64-bit Linux with Vector)',
          'RV32E (Embedded 16-register only)',
          'RV32F (Single-precision floating point only)'
        ],
        correctAns: 'RV32IM (Integer + Hardware Multiply/Divide)',
        explanation: 'THEJAS32 implements the RV32IM instruction set architecture with full 32 general-purpose registers and hardware multiplier/divider.',
        points: 10
      },
      {
        id: 'th-5',
        question: 'What internal bus protocols interconnect the THEJAS32 core, SRAM, and peripheral subsystems?',
        options: [
          'AMBA AHB (Advanced High-performance Bus) and APB (Advanced Peripheral Bus)',
          'PCIe Gen 4',
          'InfiniBand',
          'Ethernet'
        ],
        correctAns: 'AMBA AHB (Advanced High-performance Bus) and APB (Advanced Peripheral Bus)',
        explanation: 'Standard AMBA AHB connects the CPU core to internal SRAM and flash controllers, while APB bridges connect low-speed peripherals (GPIO, UART, SPI, I2C, Timers).',
        points: 10
      },
      {
        id: 'th-6',
        question: 'What debug interface is used on the VEGA ARIES v2.0 board for hardware debugging with OpenOCD?',
        options: [
          'Standard JTAG interface (TCK, TMS, TDI, TDO, TRST)',
          'SWD only',
          'Bluetooth',
          'Infrared'
        ],
        correctAns: 'Standard JTAG interface (TCK, TMS, TDI, TDO, TRST)',
        explanation: 'THEJAS32 provides a standard IEEE 1149.1 JTAG port used for hardware breakpoints, register inspection, and GDB in-circuit debugging.',
        points: 10
      },
      {
        id: 'th-7',
        question: 'What memory structure is mapped at address 0x10000000 on THEJAS32 SoC?',
        options: [
          'Peripheral I/O Register Space (UART, GPIO, SPI, Timers, I2C)',
          'Internal SRAM',
          'External Flash',
          'Bootloader ROM'
        ],
        correctAns: 'Peripheral I/O Register Space (UART, GPIO, SPI, Timers, I2C)',
        explanation: 'The THEJAS32 memory map allocates 0x10000000 upwards for memory-mapped peripheral hardware registers.',
        points: 10
      },
      {
        id: 'th-8',
        question: 'What is the role of the ESP32-S3 co-processor on the VEGA ARIES v2.0 ecosystem?',
        options: [
          'Wireless Wi-Fi / BLE gateway that receives firmware binaries over OTA and bridges serial flashing/telemetry to THEJAS32.',
          'It replaces the THEJAS32 core completely.',
          'It acts as the power supply battery.',
          'It controls the screen brightness.'
        ],
        correctAns: 'Wireless Wi-Fi / BLE gateway that receives firmware binaries over OTA and bridges serial flashing/telemetry to THEJAS32.',
        explanation: 'The ESP32-S3 acts as an autonomous wireless communications bridge, receiving binaries over Wi-Fi LittleFS and flashing THEJAS32 over UART/SPI.',
        points: 10
      },
      {
        id: 'th-9',
        question: 'How does THEJAS32 achieve low-power consumption during inactive periods?',
        options: [
          'Clock gating individual peripheral blocks and executing the wfi instruction to halt pipeline switching.',
          'Turning off the power regulator.',
          'Dropping the supply voltage to 0V.',
          'Disabling all pull-up resistors.'
        ],
        correctAns: 'Clock gating individual peripheral blocks and executing the wfi instruction to halt pipeline switching.',
        explanation: 'Clock gating and pipeline idle state (wfi) eliminate active dynamic CMOS switching currents while keeping RAM context preserved.',
        points: 10
      },
      {
        id: 'th-10',
        question: 'What compiler toolchain compiles C/C++ source code for THEJAS32 on VEGA ARIES v2.0?',
        options: [
          'riscv32-vega-elf-gcc / riscv32-vega-elf-g++ (GNU Toolchain for RV32IM)',
          'arm-none-eabi-gcc',
          'x86_64-w64-mingw32-gcc',
          'avr-gcc'
        ],
        correctAns: 'riscv32-vega-elf-gcc / riscv32-vega-elf-g++ (GNU Toolchain for RV32IM)',
        explanation: 'VEGA provides the dedicated riscv32-vega-elf toolchain with target flags -march=rv32im -mabi=ilp32.',
        points: 10
      }
    ]
  },
  {
    id: 'boot-process',
    topicNumber: '24',
    title: 'Boot Process',
    difficulty: 'advanced',
    description: 'Reset vectors, boot ROM, secondary bootloader, and boot pin configurations.',
    longDescription: 'Explore the complete hardware boot sequence on VEGA ARIES v2.0: power-on reset, boot mode pin strapping, internal Boot ROM execution, XMODEM transfer, and execution handover to SPI flash.',
    estimatedTime: '15 mins',
    points: 100,
    questions: [
      {
        id: 'bp-1',
        question: 'Where does the CPU Program Counter (PC) point immediately following a hardware reset on THEJAS32?',
        options: [
          'To the Reset Vector address in internal Boot ROM (e.g. 0x00000000 or 0x00010000).',
          'To address 0xFFFFFFFF.',
          'To main() in C code.',
          'To the UART baud rate register.'
        ],
        correctAns: 'To the Reset Vector address in internal Boot ROM (e.g. 0x00000000 or 0x00010000).',
        explanation: 'Hardware resets load the hardwired Reset Vector address into the Program Counter, executing the internal mask ROM boot code.',
        points: 10
      },
      {
        id: 'bp-2',
        question: 'What are "Boot Mode Strapping Pins" on a microcontroller development board?',
        options: [
          'Dedicated hardware pins sampled by internal Boot ROM during reset to determine boot source (e.g. Boot from Flash vs Boot from UART Flasher).',
          'Pins used to tie the board down.',
          'Pins that measure battery voltage.',
          'Pins that control the clock frequency.'
        ],
        correctAns: 'Dedicated hardware pins sampled by internal Boot ROM during reset to determine boot source (e.g. Boot from Flash vs Boot from UART Flasher).',
        explanation: 'At power-up, the boot ROM reads strapping pin logic levels to decide whether to boot user code directly from SPI Flash or enter UART bootloader download mode.',
        points: 10
      },
      {
        id: 'bp-3',
        question: 'What is the role of a Secondary Bootloader (e.g. flasher_min.bin) in the VEGA ARIES v2.0 ecosystem?',
        options: [
          'A minimal RAM-based program loaded into SRAM to program external SPI Flash memory via UART/XMODEM.',
          'An operating system kernel.',
          'A compiler toolchain.',
          'A hardware protection fuse.'
        ],
        correctAns: 'A minimal RAM-based program loaded into SRAM to program external SPI Flash memory via UART/XMODEM.',
        explanation: 'The flasher stub (flasher_min.bin) runs directly in SRAM, receiving application binaries over UART/XMODEM and programming them into SPI NOR flash.',
        points: 10
      },
      {
        id: 'bp-4',
        question: 'What is a "Golden Image" fallback in embedded bootloader architectures?',
        options: [
          'A protected, immutable factory firmware partition that the bootloader rolls back to if a newly updated firmware fails integrity checks.',
          'A firmware image with golden icons.',
          'A firmware image stored on a USB drive.',
          'A compiler optimization output.'
        ],
        correctAns: 'A protected, immutable factory firmware partition that the bootloader rolls back to if a newly updated firmware fails integrity checks.',
        explanation: 'Dual-bank bootloaders maintain a verified golden image to prevent bricking if an OTA update is interrupted or corrupted.',
        points: 10
      },
      {
        id: 'bp-5',
        question: 'How does a bootloader verify that a downloaded firmware binary is valid before jumping to it?',
        options: [
          'By validating a cryptographic SHA-256 hash, CRC32 checksum, and verifying image header magic numbers and size.',
          'By executing the code in simulation.',
          'By checking the file name.',
          'By measuring the board temperature.'
        ],
        correctAns: 'By validating a cryptographic SHA-256 hash, CRC32 checksum, and verifying image header magic numbers and size.',
        explanation: 'Header magic numbers, vector table validation, and cryptographic checksums ensure corrupted binaries are rejected before execution.',
        points: 10
      },
      {
        id: 'bp-6',
        question: 'What must a bootloader do before jumping to the user application in Flash/SRAM?',
        options: [
          'Disable used interrupts, clear pending flags, re-initialize the Stack Pointer, and jump to the application entry point address.',
          'Erase all SRAM memory.',
          'Change the CPU clock to 0 MHz.',
          'Power down the board.'
        ],
        correctAns: 'Disable used interrupts, clear pending flags, re-initialize the Stack Pointer, and jump to the application entry point address.',
        explanation: 'The bootloader must leave the hardware in a clean, predictable state before executing the application jump (jalr) to the user reset handler.',
        points: 10
      },
      {
        id: 'bp-7',
        question: 'What is the function of the "Reset Vector" vs "Interrupt Vector" in system boot architecture?',
        options: [
          'The Reset Vector handles initial cold/warm system boot, while Interrupt Vectors handle runtime peripheral events.',
          'They are identical.',
          'The Reset Vector is only used for software crashes.',
          'The Interrupt Vector only runs once at boot.'
        ],
        correctAns: 'The Reset Vector handles initial cold/warm system boot, while Interrupt Vectors handle runtime peripheral events.',
        explanation: 'The Reset Vector is the single entry point executed on power-on or hardware reset before any interrupts or C runtime exist.',
        points: 10
      },
      {
        id: 'bp-8',
        question: 'What is "Brownout Detection" (BOD) during the microcontroller boot phase?',
        options: [
          'A hardware voltage monitor circuit that holds the CPU in reset if the supply voltage drops below the minimum safe operating threshold.',
          'A circuit that checks if the room lighting is dark.',
          'A color detection sensor.',
          'An internet speed monitor.'
        ],
        correctAns: 'A hardware voltage monitor circuit that holds the CPU in reset if the supply voltage drops below the minimum safe operating threshold.',
        explanation: 'Brownouts (undervoltage) cause erratic instruction decoding and flash memory corruption. BOD keeps the chip in clean reset until voltage stabilizes.',
        points: 10
      },
      {
        id: 'bp-9',
        question: 'What is a "Watchdog Boot Loop" and how does it happen?',
        options: [
          'Firmware crashes or hangs during startup before it can service the watchdog timer, causing the watchdog to reset the board indefinitely.',
          'A timer counting up and down.',
          'A fast Wi-Fi connection.',
          'A compilation loop in IDE.'
        ],
        correctAns: 'Firmware crashes or hangs during startup before it can service the watchdog timer, causing the watchdog to reset the board indefinitely.',
        explanation: 'If initialization takes longer than the watchdog timeout period or faults during startup, the WDT resets the chip continuously in an infinite boot loop.',
        points: 10
      },
      {
        id: 'bp-10',
        question: 'How does the VEGA ARIES v2.0 bootloader switch execution from Boot ROM to user application code in external Flash?',
        options: [
          'By initializing the SPI Flash controller in XIP mode, setting the Program Counter to the Flash base address (e.g. 0x30000000), and executing.',
          'By sending a Wi-Fi packet.',
          'By rebooting the laptop.',
          'By toggling an LED.'
        ],
        correctAns: 'By initializing the SPI Flash controller in XIP mode, setting the Program Counter to the Flash base address (e.g. 0x30000000), and executing.',
        explanation: 'The bootloader configures the SPI controller for memory-mapped read mode (XIP) and branches to the starting instruction at the flash base address.',
        points: 10
      }
    ]
  },
  {
    id: 'flash-programming',
    topicNumber: '25',
    title: 'Flash Programming',
    difficulty: 'advanced',
    description: 'NOR flash architecture, sector erase, page programming, endurance, and wear-leveling.',
    longDescription: 'Deep dive into non-volatile memory programming: NOR vs NAND flash characteristics, sector erase granularity (4KB), page programming (256B), flash endurance, and wear-leveling algorithms.',
    estimatedTime: '15 mins',
    points: 100,
    questions: [
      {
        id: 'fp-1',
        question: 'Why must a NOR Flash memory sector be erased before new data can be written to it?',
        options: [
          'Because flash programming can only change 1 bits into 0 bits; an erase operation is required to reset all bits back to 1 (0xFF).',
          'Because Flash memory is read-only.',
          'To clean up dust on the silicon.',
          'To increase the clock frequency.'
        ],
        correctAns: 'Because flash programming can only change 1 bits into 0 bits; an erase operation is required to reset all bits back to 1 (0xFF).',
        explanation: 'Floating-gate and charge-trap flash cells can only be programmed from 1 to 0. Turning 0s back into 1s requires a high-voltage bulk sector erase.',
        points: 10
      },
      {
        id: 'fp-2',
        question: 'What is the erase state value of an unprogrammed byte in standard NOR Flash memory?',
        options: [
          '0xFF (binary 11111111)',
          '0x00 (binary 00000000)',
          '0x55',
          '0xAA'
        ],
        correctAns: '0xFF (binary 11111111)',
        explanation: 'Erased NOR flash bits sit in the uncharged high-voltage state, reading as all 1s (0xFF).',
        points: 10
      },
      {
        id: 'fp-3',
        question: 'What is the difference between Flash "Erase Granularity" and "Program Granularity" on standard SPI NOR flash?',
        options: [
          'Erase granularity is at the Sector level (typically 4 KB or 64 KB), while Program granularity is at the Page level (typically 256 Bytes).',
          'Erase is 1 byte, Program is 1 megabyte.',
          'They are both single-bit operations.',
          'Erase granularity is infinite.'
        ],
        correctAns: 'Erase granularity is at the Sector level (typically 4 KB or 64 KB), while Program granularity is at the Page level (typically 256 Bytes).',
        explanation: 'You can program data in small chunks up to 256 bytes per page, but you cannot erase individual bytes—you must erase an entire 4 KB sector.',
        points: 10
      },
      {
        id: 'fp-4',
        question: 'What is "Flash Endurance" (P/E cycles)?',
        options: [
          'The maximum number of Program/Erase cycles a flash block can withstand before the oxide layer degrades and fails (typically 100,000 cycles for NOR).',
          'The maximum battery life.',
          'The maximum operating temperature.',
          'The maximum clock speed.'
        ],
        correctAns: 'The maximum number of Program/Erase cycles a flash block can withstand before the oxide layer degrades and fails (typically 100,000 cycles for NOR).',
        explanation: 'High-voltage tunneling gradually traps electrons in the gate oxide. NOR flash typically guarantees 100,000 erase cycles per sector before failure.',
        points: 10
      },
      {
        id: 'fp-5',
        question: 'What is "Wear-Leveling" in embedded flash filesystems like LittleFS?',
        options: [
          'Distributing erase and write cycles evenly across all physical flash sectors to prevent premature burnout of frequently modified blocks.',
          'Smoothing the PCB surface.',
          'Limiting the maximum CPU clock.',
          'A cooling algorithm.'
        ],
        correctAns: 'Distributing erase and write cycles evenly across all physical flash sectors to prevent premature burnout of frequently modified blocks.',
        explanation: 'Wear leveling dynamically remaps logical sectors to different physical blocks, ensuring all sectors age at the same rate and extending flash life.',
        points: 10
      },
      {
        id: 'fp-6',
        question: 'Why is LittleFS resilient against power-loss corruption compared to traditional FAT filesystems?',
        options: [
          'LittleFS uses copy-on-write logging; updates are written to new blocks before pointers are atomically swapped, ensuring valid state on sudden power loss.',
          'LittleFS runs on battery backup.',
          'LittleFS stores files in RAM only.',
          'LittleFS disables write operations.'
        ],
        correctAns: 'LittleFS uses copy-on-write logging; updates are written to new blocks before pointers are atomically swapped, ensuring valid state on sudden power loss.',
        explanation: 'LittleFS is designed for embedded microcontrollers: all structural modifications are atomic copy-on-write, preventing corrupted filesystem trees during brownouts.',
        points: 10
      },
      {
        id: 'fp-7',
        question: 'What happens if a Page Program operation crosses the 256-byte page boundary on standard SPI NOR flash?',
        options: [
          'The address wraps around to the beginning of the same page (0x00), corrupting data at the start of the page.',
          'It automatically advances to the next page seamlessly.',
          'The chip halts execution.',
          'The extra bytes are lost.'
        ],
        correctAns: 'The address wraps around to the beginning of the same page (0x00), corrupting data at the start of the page.',
        explanation: 'SPI flash page buffers do not auto-increment past byte 255 of the active page. Firmware drivers must split multi-byte writes across page boundaries.',
        points: 10
      },
      {
        id: 'fp-8',
        question: 'What is the purpose of Flash "Block Protection" (BP0, BP1, BP2) bits in the Status Register?',
        options: [
          'Locking specified address ranges in hardware against accidental write or erase operations.',
          'Encrypting data over Wi-Fi.',
          'Increasing read speed.',
          'Enabling the watchdog timer.'
        ],
        correctAns: 'Locking specified address ranges in hardware against accidental write or erase operations.',
        explanation: 'Block protection bits write-protect critical bootloader and calibration sectors from being accidentally overwritten by application bugs.',
        points: 10
      },
      {
        id: 'fp-9',
        question: 'How does firmware verify that a Flash Page Program was successful?',
        options: [
          'By reading back the programmed memory range and comparing byte-for-byte with the source buffer (read-back verification).',
          'By checking if the LED is blinking.',
          'By measuring power current.',
          'By checking the CPU clock.'
        ],
        correctAns: 'By reading back the programmed memory range and comparing byte-for-byte with the source buffer (read-back verification).',
        explanation: 'Reading back the flashed region confirms that every bit transitioned properly and no charge-leakage or write errors occurred.',
        points: 10
      },
      {
        id: 'fp-10',
        question: 'What total storage capacity does the external SPI Flash on VEGA ARIES v2.0 provide?',
        options: [
          '2 Megabytes (16 Megabits)',
          '256 Kilobytes',
          '32 Gigabytes',
          '64 Kilobytes'
        ],
        correctAns: '2 Megabytes (16 Megabits)',
        explanation: 'The VEGA ARIES v2.0 board features a 2 MB (16 Mbit) high-speed SPI NOR Flash memory chip for application storage and boot code.',
        points: 10
      }
    ]
  },
  {
    id: 'xmodem-firmware-transfer',
    topicNumber: '26',
    title: 'XMODEM / Firmware Transfer',
    difficulty: 'advanced',
    description: 'XMODEM protocol framing, SOH, packet sequencing, CRC-16, and flashing handshakes.',
    longDescription: 'Explore binary firmware upload protocols: XMODEM-CRC protocol framing, SOH packet structure, packet numbering, 16-bit CRC checksum validation, and bootloader handshakes.',
    estimatedTime: '15 mins',
    points: 100,
    questions: [
      {
        id: 'xm-1',
        question: 'What is the XMODEM protocol in embedded bootloader firmware updates?',
        options: [
          'A reliable packet-based serial transmission protocol that transfers binary blocks with checksum verification and packet acknowledgments (ACK/NAK).',
          'A wireless 5G protocol.',
          'A C compiler optimization pass.',
          'A dynamic memory allocator.'
        ],
        correctAns: 'A reliable packet-based serial transmission protocol that transfers binary blocks with checksum verification and packet acknowledgments (ACK/NAK).',
        explanation: 'XMODEM is the time-tested standard for serial bootloader uploads. It splits files into discrete 128-byte (or 1024-byte) blocks verified with CRC.',
        points: 10
      },
      {
        id: 'xm-2',
        question: 'What character does an XMODEM-CRC receiver transmit periodically to initiate a transfer session?',
        options: [
          'ASCII \'C\' (0x43)',
          'ASCII NAK (0x15)',
          'ASCII ACK (0x06)',
          'ASCII SOH (0x01)'
        ],
        correctAns: 'ASCII \'C\' (0x43)',
        explanation: 'The receiver sends \'C\' (0x43) every 3 seconds to tell the sender it is ready and requests 16-bit CRC checksum mode instead of legacy checksum.',
        points: 10
      },
      {
        id: 'xm-3',
        question: 'What is the structure of a standard 128-byte XMODEM data packet?',
        options: [
          'SOH (0x01) + Packet Number (1 byte) + Inverted Packet Number (1 byte) + 128 Data Bytes + 16-bit CRC (2 bytes) = 133 total bytes.',
          '128 data bytes only with no headers.',
          'JSON text packet.',
          '64 data bytes + 64 CRC bytes.'
        ],
        correctAns: 'SOH (0x01) + Packet Number (1 byte) + Inverted Packet Number (1 byte) + 128 Data Bytes + 16-bit CRC (2 bytes) = 133 total bytes.',
        explanation: 'Standard XMODEM packet structure: 1-byte SOH, 1-byte sequence number, 1-byte inverted sequence (~seq for integrity), 128-byte payload, 2-byte CRC-16.',
        points: 10
      },
      {
        id: 'xm-4',
        question: 'What does the receiver send if a received XMODEM packet fails CRC checksum verification?',
        options: [
          'NAK (0x15 - Negative Acknowledgment), requesting the sender to retransmit the exact same packet.',
          'ACK (0x06)',
          'EOT (0x04)',
          'CAN (0x18)'
        ],
        correctAns: 'NAK (0x15 - Negative Acknowledgment), requesting the sender to retransmit the exact same packet.',
        explanation: 'Upon detecting a CRC error or corrupted sequence number, the receiver sends NAK (0x15), causing the sender to retry the packet.',
        points: 10
      },
      {
        id: 'xm-5',
        question: 'What control character does the sender transmit to signal the End of File (EOF) in XMODEM?',
        options: [
          'EOT (0x04 - End of Transmission)',
          'SOH (0x01)',
          'ACK (0x06)',
          'SUB (0x1A)'
        ],
        correctAns: 'EOT (0x04 - End of Transmission)',
        explanation: 'When all data bytes have been sent, the sender sends EOT (0x04). The receiver acknowledges with ACK (0x06) to conclude the session.',
        points: 10
      },
      {
        id: 'xm-6',
        question: 'What character is used to pad the final XMODEM data packet if the file size is not an exact multiple of 128 bytes?',
        options: [
          'SUB (0x1A / Ctrl-Z) or 0x00 / 0xFF',
          'Newline \'\\n\'',
          'Letter \'X\'',
          'Space \' \''
        ],
        correctAns: 'SUB (0x1A / Ctrl-Z) or 0x00 / 0xFF',
        explanation: 'Because XMODEM transfers fixed 128-byte packets, any remaining unfilled space in the final block is padded with 0x1A (SUB) or 0xFF.',
        points: 10
      },
      {
        id: 'xm-7',
        question: 'What does the sender send if it wants to immediately abort the XMODEM transfer session?',
        options: [
          'Two consecutive CAN (0x18 - Cancel) characters.',
          'ACK (0x06)',
          'SOH (0x01)',
          'Null byte (0x00)'
        ],
        correctAns: 'Two consecutive CAN (0x18 - Cancel) characters.',
        explanation: 'Transmitting two consecutive CAN (0x18) bytes immediately cancels the transfer and returns the bootloader to prompt mode.',
        points: 10
      },
      {
        id: 'xm-8',
        question: 'How does XMODEM 1K (1024-byte blocks) differ from standard XMODEM?',
        options: [
          'It begins packets with STX (0x02) and transfers 1024-byte payloads per block, increasing transmission speed over high-baud links.',
          'It uses 1024 wires.',
          'It operates without CRC verification.',
          'It transmits audio signals.'
        ],
        correctAns: 'It begins packets with STX (0x02) and transfers 1024-byte payloads per block, increasing transmission speed over high-baud links.',
        explanation: 'XMODEM-1K uses STX (0x02) headers and 1 KB blocks, significantly reducing ACK turnaround latency over high-speed UART channels.',
        points: 10
      },
      {
        id: 'xm-9',
        question: 'What CRC polynomial is used in standard XMODEM-CRC calculation?',
        options: [
          'CRC-CCITT (0x1021: x^16 + x^12 + x^5 + 1)',
          'CRC-32 (0xEDB88320)',
          'Parity sum',
          'MD5'
        ],
        correctAns: 'CRC-CCITT (0x1021: x^16 + x^12 + x^5 + 1)',
        explanation: 'XMODEM-CRC utilizes the standard 16-bit CRC-CCITT polynomial (0x1021) with an initial value of 0x0000.',
        points: 10
      },
      {
        id: 'xm-10',
        question: 'On VEGA ARIES v2.0, how is XMODEM utilized during the flashing process?',
        options: [
          'The flasher stub running in SRAM uses XMODEM to receive the compiled application binary over UART and write it into SPI Flash.',
          'To download web pages over Ethernet.',
          'To stream MP3 audio.',
          'To calibrate the ADC.'
        ],
        correctAns: 'The flasher stub running in SRAM uses XMODEM to receive the compiled application binary over UART and write it into SPI Flash.',
        explanation: 'The flasher stub establishes an XMODEM receiver over UART, taking incoming chunks from the flasher tool and committing them to SPI Flash.',
        points: 10
      }
    ]
  },
  {
    id: 'hardware-debugging',
    topicNumber: '27',
    title: 'Hardware Debugging',
    difficulty: 'advanced',
    description: 'JTAG boundary scan, OpenOCD, GDB, hardware watchpoints, and logic analyzers.',
    longDescription: 'Master embedded hardware debugging: JTAG TAP controllers, OpenOCD server configuration, GDB breakpoints and watchpoints, logic analyzer protocol decoding, and oscilloscope signal verification.',
    estimatedTime: '15 mins',
    points: 100,
    questions: [
      {
        id: 'hd-1',
        question: 'What are the 4 mandatory signals in a standard IEEE 1149.1 JTAG interface?',
        options: [
          'TCK (Clock), TMS (Mode Select), TDI (Data In), TDO (Data Out)',
          'MOSI, MISO, SCK, CS',
          'TX, RX, RTS, CTS',
          'SDA, SCL, VCC, GND'
        ],
        correctAns: 'TCK (Clock), TMS (Mode Select), TDI (Data In), TDO (Data Out)',
        explanation: 'JTAG uses 4 lines: Test Clock (TCK), Test Mode Select (TMS), Test Data In (TDI), and Test Data Out (TDO) plus optional TRST.',
        points: 10
      },
      {
        id: 'hd-2',
        question: 'What is the function of OpenOCD (Open On-Chip Debugger) in the embedded toolchain?',
        options: [
          'An open-source software server that bridges USB JTAG/SWD hardware dongles to GDB debugger clients over a local TCP/IP socket (port 3333).',
          'A C compiler.',
          'A circuit board CAD layout tool.',
          'A power supply driver.'
        ],
        correctAns: 'An open-source software server that bridges USB JTAG/SWD hardware dongles to GDB debugger clients over a local TCP/IP socket (port 3333).',
        explanation: 'OpenOCD speaks low-level JTAG/SWD protocol to the target CPU core and exposes a standard GDB server interface on localhost:3333.',
        points: 10
      },
      {
        id: 'hd-3',
        question: 'What is the difference between a "Hardware Breakpoint" and a "Software Breakpoint" in GDB?',
        options: [
          'Hardware breakpoints use dedicated CPU comparator registers (working in Flash and ROM); Software breakpoints replace the instruction in RAM with an ebreak opcode.',
          'Hardware breakpoints only work on Sundays.',
          'Software breakpoints require physical jumper wires.',
          'They have identical limitations in Flash memory.'
        ],
        correctAns: 'Hardware breakpoints use dedicated CPU comparator registers (working in Flash and ROM); Software breakpoints replace the instruction in RAM with an ebreak opcode.',
        explanation: 'Software breakpoints modify RAM memory by inserting break opcodes. Because Flash cannot be dynamically modified at runtime, hardware comparator registers are required.',
        points: 10
      },
      {
        id: 'hd-4',
        question: 'What is a "Hardware Watchpoint" in GDB debugging?',
        options: [
          'A hardware comparator that triggers a debugger break whenever a specific memory address is read from, written to, or modified.',
          'A smart watch that displays CPU frequency.',
          'A timer that counts seconds.',
          'A camera that watches the development board.'
        ],
        correctAns: 'A hardware comparator that triggers a debugger break whenever a specific memory address is read from, written to, or modified.',
        explanation: 'Watchpoints halt the CPU the instant a variable or register address is modified (e.g. "watch my_variable"), catching memory corruption bugs immediately.',
        points: 10
      },
      {
        id: 'hd-5',
        question: 'What instrument is best suited to simultaneously record and decode multiple digital bus channels (e.g. SPI, I2C, UART) over time?',
        options: [
          'A Digital Logic Analyzer with protocol decoder software.',
          'An analog multimeter.',
          'A soldering iron.',
          'A thermocouple.'
        ],
        correctAns: 'A Digital Logic Analyzer with protocol decoder software.',
        explanation: 'Logic analyzers capture high-speed multichannel digital traces and decode protocol packets (SPI, I2C, UART) into readable hexadecimal and ASCII commands.',
        points: 10
      },
      {
        id: 'hd-6',
        question: 'What does the GDB command "backtrace" (bt) display when a program hits a breakpoint or exception?',
        options: [
          'The active call stack history showing which functions were called and their line numbers leading to the current execution point.',
          'The entire flash memory contents.',
          'The list of all Wi-Fi networks.',
          'The compiler version.'
        ],
        correctAns: 'The active call stack history showing which functions were called and their line numbers leading to the current execution point.',
        explanation: 'Backtrace unwinds the stack frames to show the exact hierarchy of function calls and arguments that led up to the crash or breakpoint.',
        points: 10
      },
      {
        id: 'hd-7',
        question: 'What is a "JTAG Boundary Scan" used for in manufacturing testing?',
        options: [
          'Testing physical PCB soldering, shorts, and open-circuits between IC pins without placing physical oscilloscope probes on traces.',
          'Measuring the board weight.',
          'Scanning QR codes.',
          'Testing Wi-Fi antenna radiation.'
        ],
        correctAns: 'Testing physical PCB soldering, shorts, and open-circuits between IC pins without placing physical oscilloscope probes on traces.',
        explanation: 'Boundary scan chains shift test patterns directly through the I/O pin boundary cells to verify complete electrical connectivity across fine-pitch BGA pins.',
        points: 10
      },
      {
        id: 'hd-8',
        question: 'Why should oscilloscope probes be set to 10X attenuation mode when measuring high-speed microcontroller signals (e.g. 50 MHz SPI clock)?',
        options: [
          '10X mode reduces probe tip capacitive loading (typically from ~100 pF down to ~10–15 pF), preserving high-frequency signal edges.',
          '10X mode makes the signal 10 times louder.',
          '10X mode doubles the oscilloscope screen brightness.',
          '10X mode converts digital signals to analog.'
        ],
        correctAns: '10X mode reduces probe tip capacitive loading (typically from ~100 pF down to ~10–15 pF), preserving high-frequency signal edges.',
        explanation: 'A 1X probe introduces significant capacitance (100 pF) that distorts fast clock edges and loads down the circuit. 10X mode minimizes circuit loading.',
        points: 10
      },
      {
        id: 'hd-9',
        question: 'What is the purpose of GDB "step" (s) vs "next" (n) commands?',
        options: [
          '"step" enters inside a function call on the current line, while "next" executes the function call as a single step without stepping into it.',
          '"step" compiles code, "next" runs it.',
          '"step" is for 32-bit CPUs, "next" is for 64-bit CPUs.',
          'They perform the exact same action.'
        ],
        correctAns: '"step" enters inside a function call on the current line, while "next" executes the function call as a single step without stepping into it.',
        explanation: 'Use "step" to dive into subroutine details; use "next" (step-over) to execute the whole function call and pause on the following line.',
        points: 10
      },
      {
        id: 'hd-10',
        question: 'What is a "Core Dump" or "Register Dump" in embedded post-mortem debugging?',
        options: [
          'A printout of all CPU general-purpose registers (x0–x31), PC, SP, and CSR status registers captured at the moment of a crash.',
          'Erasing the CPU core.',
          'Recycling old silicon chips.',
          'A power supply voltage spike.'
        ],
        correctAns: 'A printout of all CPU general-purpose registers (x0–x31), PC, SP, and CSR status registers captured at the moment of a crash.',
        explanation: 'Register dumps reveal the exact PC instruction address, stack pointer, and fault cause (mcause/mepc), allowing developers to pinpoint root causes in seconds.',
        points: 10
      }
    ]
  },
  {
    id: 'peripheral-driver-development',
    topicNumber: '28',
    title: 'Peripheral Driver Development',
    difficulty: 'advanced',
    description: 'HAL architecture, device driver patterns, state machines, and API design.',
    longDescription: 'Design modular embedded device drivers: Hardware Abstraction Layer (HAL) separation, non-blocking asynchronous APIs, circular DMA buffers, and clean board support packages (BSP).',
    estimatedTime: '15 mins',
    points: 100,
    questions: [
      {
        id: 'pdd-1',
        question: 'What is the primary goal of a Hardware Abstraction Layer (HAL) in embedded software architecture?',
        options: [
          'To decouple high-level application logic from low-level register hardware details, making software portable across different microcontroller chips.',
          'To replace C code with Python.',
          'To increase the physical size of Flash memory.',
          'To convert digital signals to radio waves.'
        ],
        correctAns: 'To decouple high-level application logic from low-level register hardware details, making software portable across different microcontroller chips.',
        explanation: 'A clean HAL provides uniform API functions (e.g. uart_write, spi_transfer) so application code remains unchanged when porting between chip vendors.',
        points: 10
      },
      {
        id: 'pdd-2',
        question: 'What is the difference between a "Blocking" (Synchronous) driver API and a "Non-Blocking" (Asynchronous) driver API?',
        options: [
          'Blocking APIs halt CPU execution until the entire transfer finishes; Non-blocking APIs initiate the transfer via DMA/Interrupts and return immediately.',
          'Blocking APIs only run in RAM; Non-blocking APIs only run in Flash.',
          'Blocking APIs are for inputs; Non-blocking APIs are for outputs.',
          'They have identical CPU overhead.'
        ],
        correctAns: 'Blocking APIs halt CPU execution until the entire transfer finishes; Non-blocking APIs initiate the transfer via DMA/Interrupts and return immediately.',
        explanation: 'Non-blocking drivers maximize CPU efficiency by running data transfers in the background via interrupts/DMA while the CPU computes other tasks.',
        points: 10
      },
      {
        id: 'pdd-3',
        question: 'What is a "Board Support Package" (BSP) in professional embedded development?',
        options: [
          'A layer of software drivers and configuration files specific to a physical development board (pin mappings, clocks, on-board sensors, and LED definitions).',
          'The cardboard shipping box the board arrived in.',
          'A hardware power supply cable.',
          'A compiler optimization level.'
        ],
        correctAns: 'A layer of software drivers and configuration files specific to a physical development board (pin mappings, clocks, on-board sensors, and LED definitions).',
        explanation: 'The BSP bridges generic MCU HAL drivers to the physical board layout (e.g. initializing ARIES v2.0 LEDs, buttons, and flash pins).',
        points: 10
      },
      {
        id: 'pdd-4',
        question: 'How should a professional device driver handle hardware timeouts (e.g. waiting for a status flag)?',
        options: [
          'Use a bounded timeout counter or timer timestamp check that returns an error code (e.g. ERR_TIMEOUT) if the hardware fails to respond within a time limit.',
          'Use an infinite while-loop with no exit condition.',
          'Shut down the whole microcontroller.',
          'Ignore the flag completely.'
        ],
        correctAns: 'Use a bounded timeout counter or timer timestamp check that returns an error code (e.g. ERR_TIMEOUT) if the hardware fails to respond within a time limit.',
        explanation: 'Infinite while-loops freeze the system permanently if a wire is disconnected. Robust drivers always implement bounded timeouts with error return codes.',
        points: 10
      },
      {
        id: 'pdd-5',
        question: 'What is the "Handle / Context Structure" pattern in C device drivers (e.g. UART_HandleTypeDef)?',
        options: [
          'A struct containing peripheral base address, configuration settings, state flags, and buffer pointers passed to driver functions to support multiple instances cleanly.',
          'A physical handle attached to the circuit board.',
          'A global variable that stores compiler flags.',
          'A function that deletes memory.'
        ],
        correctAns: 'A struct containing peripheral base address, configuration settings, state flags, and buffer pointers passed to driver functions to support multiple instances cleanly.',
        explanation: 'Context handles encapsulate instance data, allowing the same driver code to operate UART0, UART1, and UART2 without duplicating driver functions.',
        points: 10
      },
      {
        id: 'pdd-6',
        question: 'What is "Reentrancy" in embedded driver design?',
        options: [
          'The property of a function that allows it to be safely called concurrently by multiple threads or interrupted and called again from an ISR without data corruption.',
          'A function that restarts the CPU.',
          'A function that only accepts string inputs.',
          'A recursive infinite loop.'
        ],
        correctAns: 'The property of a function that allows it to be safely called concurrently by multiple threads or interrupted and called again from an ISR without data corruption.',
        explanation: 'Reentrant functions rely only on caller-provided stack/context data and avoid unprotected shared static/global variables.',
        points: 10
      },
      {
        id: 'pdd-7',
        question: 'Why should driver APIs return standardized status error codes (e.g. STATUS_OK, STATUS_BUSY, STATUS_TIMEOUT, STATUS_ERROR)?',
        options: [
          'To allow application software to detect and recover gracefully from communication and hardware faults.',
          'Because compilers require return values.',
          'To increase the size of the binary.',
          'To format text on the terminal.'
        ],
        correctAns: 'To allow application software to detect and recover gracefully from communication and hardware faults.',
        explanation: 'Explicit error codes enable robust defensive programming, automated retries, and clean fault diagnostic logging.',
        points: 10
      },
      {
        id: 'pdd-8',
        question: 'What is the role of a Callback Function in asynchronous driver design?',
        options: [
          'A user function registered with the driver that is automatically executed when a background hardware transfer (e.g. DMA complete) finishes.',
          'A function that calls the manufacturer phone support.',
          'A function that reverses string order.',
          'A function that clears all registers.'
        ],
        correctAns: 'A user function registered with the driver that is automatically executed when a background hardware transfer (e.g. DMA complete) finishes.',
        explanation: 'Callbacks notify the application layer the instant a hardware event occurs without requiring polling loops.',
        points: 10
      },
      {
        id: 'pdd-9',
        question: 'What is a "State Machine" pattern in embedded protocol driver implementations?',
        options: [
          'Modeling driver behavior as finite discrete states (e.g. IDLE, HEADER, PAYLOAD, CHECKSUM) transitioning on incoming events or bytes.',
          'A mechanical computer built with gears.',
          'A program that runs only in government labs.',
          'A compiler parser pass.'
        ],
        correctAns: 'Modeling driver behavior as finite discrete states (e.g. IDLE, HEADER, PAYLOAD, CHECKSUM) transitioning on incoming events or bytes.',
        explanation: 'Finite State Machines (FSMs) organize complex asynchronous protocol parsers into clear, robust, testable state transitions.',
        points: 10
      },
      {
        id: 'pdd-10',
        question: 'What is the benefit of defining peripheral register addresses using "const volatile uint32_t * const" in C headers?',
        options: [
          'It enforces maximum type safety: the pointer cannot be reassigned, and the pointed hardware memory cannot be optimized away by the compiler.',
          'It compresses the binary size.',
          'It makes the code execute in parallel.',
          'It disables the JTAG interface.'
        ],
        correctAns: 'It enforces maximum type safety: the pointer cannot be reassigned, and the pointed hardware memory cannot be optimized away by the compiler.',
        explanation: 'const volatile uint32_t * const provides full immutability of the pointer address while ensuring every read/write to the hardware target is preserved.',
        points: 10
      }
    ]
  }
];

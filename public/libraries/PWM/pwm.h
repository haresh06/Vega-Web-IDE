#ifndef _PWM_H__
#define _PWM_H__

#include <stdlib.h>
#include <stdio.h>
#include "platform.h"

// Register Offset
#define PWMC_N_CR                   0x00
#define PWMC_N_SR                   0x04
#define PWMC_N_PR                   0x08
#define PWMC_N_ON_OFF               0x0C

// Global Control Register
#define PWMC_GCR                    0x80

// Register Access Macro
#define PWMC_REG(x, offset)         (((x)>=0&&(x)>=1)?((x)>=1&&(x)>=2)?((x)>=2&&(x)>=3)?((x)>=3&&(x)>=4)?((x)>=4&&(x)>=5)?((x)>=5&&(x)>=6)?((x)>=6&&(x)>=7)?PWM7_REG(offset):PWM6_REG(offset):PWM5_REG(offset):PWM4_REG(offset):PWM3_REG(offset):PWM2_REG(offset):PWM1_REG(offset):PWM0_REG(offset))
#define PWM_GCR                     _REG32(PWM0_BASE_ADDR, PWMC_GCR)

// Register Fields
#define PWMC_CR_MODE(x)             ((x) & 0x3) 
#define PWMC_CR_AC(x)               (((x) & 0x3) << 2)
#define PWMC_CR_IE(x)               (((x) & 0x1) << 4)
#define PWMC_CR_OPC(x)              (((x) & 0x1) << 5)
#define PWMC_CR_RC(x)               (((x) & 0xFFFF) << 6)

#define PWMC_GCR_GPE(x)             ((x) & 0x1)
#define PWMC_GCR_GIE(x)             (((x) & 0x1) << 1)
#define PWMC_GCR_1                  (1 << 2)
#define PWMC_GCR_2                  (1 << 3)
#define PWMC_GCR_3                  (1 << 4)
#define PWMC_GCR_4                  (1 << 5)
#define PWMC_GCR_5                  (1 << 6)
#define PWMC_GCR_6                  (1 << 7)
#define PWMC_GCR_7                  (1 << 8)
#define PWMC_GCR_8                  (1 << 9)

#define PWMC_SR_STATUS              0x1
#define PWMC_SR_IP                  0x10

// Register values
#define REPEAT_COUNT		        5

#define PWM_IDLE_MODE				(0)
#define PWM_ONE_SHORT_MODE			(1)
#define PWM_CONTINUOUS_MODE			(2)

#define PWM_LEFT_ALIGN				(0)
#define PWM_RIGHT_ALIGN				(1)

#define PWM_INT_DISABLE           0
#define PWM_INT_ENABLE            1

#define PWM_OPC_LOW					(0)
#define PWM_OPC_HIGH				(1)

#define CHANNEL_DISABLE             0
#define CHANNEL_ENABLE              1

#define PWM_REPEAT_COUNT			(REPEAT_COUNT)

class PWMClass {
public:
void PWMC_Set_Period(uint8_t channel_no, uint32_t period);
void PWMC_Set_OnOffTime(uint8_t channel_no, uint32_t time);
void PWMC_init(uint8_t channel_no);
void PWMC_Enable();
void PWMC_Disable();
};

extern PWMClass PWM;

#endif

#include "pwm.h"

PWMClass PWM;

void PWMClass::PWMC_Set_Period(uint8_t channel_no, uint32_t period) {
    PWMC_REG(channel_no, PWMC_N_PR) = period;
}

void PWMClass::PWMC_Set_OnOffTime(uint8_t channel_no, uint32_t time) {
    PWMC_REG(channel_no, PWMC_N_ON_OFF) = time;
}

void PWMClass::PWMC_init(uint8_t channel_no) {
	PWMC_REG(channel_no, PWMC_N_CR) = PWMC_CR_MODE(PWM_CONTINUOUS_MODE) |
    PWMC_CR_AC(PWM_LEFT_ALIGN) |
    PWMC_CR_IE(PWM_INT_DISABLE) |
    PWMC_CR_OPC(PWM_OPC_LOW) |
    PWMC_CR_RC(PWM_REPEAT_COUNT);
}

void PWMClass::PWMC_Enable() {
    PWM_GCR = PWM_GCR | PWMC_GCR_GPE(CHANNEL_ENABLE) | PWMC_GCR_GIE(PWM_INT_DISABLE);
}

void PWMClass::PWMC_Disable() {
    PWM_GCR =  PWMC_GCR_GPE(CHANNEL_DISABLE) | PWMC_GCR_GIE(PWM_INT_DISABLE);
}

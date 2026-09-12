/*
  @file RYG_LED_PWM.ino
  @brief LED Breathing
  @detail LED Brightness using PWM

  Useful Links:
    Official Site: https://vegaprocessors.in/
    Development Boards: https://vegaprocessors.in/devboards/
    Blogs : https://vegaprocessors.in/blog/how-to-use-a-ryg-led-with-aries-v2-0-board/
   
  *** RYG LED Strip ***
  Connections:
   LED STRIP     Aries Board
   GND        -   GND
   R          -   PWM0
   Y          -   PWM1
   G          -   PWM2
*/

#include <pwm.h>

#define RED_LED 0  // Red LED to PWM0
#define YELLOW_LED 1  // Yellow LED to PWM1
#define GREEN_LED 2 // Green LED to PWM2

int i;

// the setup function runs once when you press reset or power the board
void setup() {
  // Set PWM period 
  PWM.PWMC_Set_Period(RED_LED, 800000);  
  PWM.PWMC_Set_Period(YELLOW_LED, 800000);
  PWM.PWMC_Set_Period(GREEN_LED, 800000);
}

// the loop function runs over and over again forever
void loop() {
  // changing on-off time rapidly 
   for(i = 0; i < 400; i++){
    analogWrite(RED_LED, i*2000);
    analogWrite(YELLOW_LED, i*2000);
    analogWrite(GREEN_LED, i*2000);
    delay(10);
  }
  for(i = 400; i > 0; i--){
    analogWrite(RED_LED, i*2000);
    analogWrite(YELLOW_LED, i*2000);
    analogWrite(GREEN_LED, i*2000);
    delay(10);
  }
}

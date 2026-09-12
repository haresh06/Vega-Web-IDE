/*
  @file PIEZOBuzzer_PWM.ino
  @brief Interfacing Piezo Buzzer with ARIES Board using PWM
  @detail varing duty cycle to turn volume of buzzer low-to-high and high-to-low repeatedly
  
  Useful Links:
    Official Site: https://vegaprocessors.in/
    Development Boards: https://vegaprocessors.in/devboards/
    Blogs : https://vegaprocessors.in/blog/interfacing-buzzer-with-aries-v3-0-board/
   
  *** Piezo Buzzer ***
  Connections:
   Buzzer     Aries Board
   VCC      -   3.3V
   GND      -   GND
   IN       -   PWM0
*/

#include <pwm.h>

#define BUZZER 0    // connect INPUT pin to PWM0 of Aries Board
int i;

// the setup function runs once when you press reset or power the board
void setup() {
  // set PWM period
  PWM.PWMC_Set_Period(BUZZER, 800000);  
}

// the loop function runs over and over again forever
void loop() {
  // changing on-off time rapidly
  for (i = 0; i < 400; i++)
  {
    analogWrite(BUZZER, i*2000);
    delay(10);
  }
  for (i = 400; i > 0; i--)
  {
    analogWrite(BUZZER, i*2000);
    delay(10);
  }
}

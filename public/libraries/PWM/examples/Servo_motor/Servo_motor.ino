/*
  @file Servo_motor.ino
  @brief Interfacing servo motor with Aries V2
  @detail Rotating servo motor (0-180 angle)

  Useful Links:
    Official Site: https://vegaprocessors.in/
    Development Boards: https://vegaprocessors.in/devboards/
    Blogs : https://vegaprocessors.in/blog/interfacing-servo-motors-with-vega-aries-boards/
   
  *** Servo Motor(SG90) ***
  Connections:
   Servo Motor          Aries Board
   VCC (Red wire)    -    3.3V
   GND (Brown wire)  -    GND
   SIG (Orange wire) -    PWM0
*/

#include <Servo.h>

#define CH 0 // connect signal PIN to PWM-0 of Aries Board
Servo myservo;  // create servo object to control a servo
 
int angle; // shaft angle

// the setup function runs once when you press reset or power the board
void setup() {
  // attaches the servo on PWM Channel - 0
  myservo.attach(CH);  
}

// the loop function runs over and over again forever
void loop() {
  // Rotate motor from 0 to 180 and then back to 0 
  for(angle=0 ; angle<=180; angle++){
    myservo.write(angle);             // sets the servo position according to the scaled value
  }

  for(angle=180 ; angle>=0; angle--){
    myservo.write(angle);             // sets the servo position according to the scaled value
  }
}

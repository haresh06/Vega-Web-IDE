/*
  @file superMarioBuzzerTone.ino
  @brief Super Mario Bros - Overworld theme
  @detail demo to play Super Mario Bros theme on a buzzer using tone() and noTone()

  Useful Links:
    Official Site: https://vegaprocessors.in/
    Development Boards: https://vegaprocessors.in/devboards/
    Blogs : https://vegaprocessors.in/blog/

  *** Piezo Buzzer  ***
  Connections:
    LDR       Aries Board
    VCC      -   3.3V
    GND      -   GND
    IN       -   PWM0
*/

#include "pitches.h"

// change this to whichever PWM-pin you want to use
int buzzer = 0;

// change this to make the song slower or faster
int tempo = 350;

// sizeof gives the number of bytes, each int value is composed of two bytes (16 bits)
// there are two values per note (pitch and duration), so for each note there are four bytes
int notes = sizeof(melody) / sizeof(melody[0]) / 2;

// this calculates the duration of a whole note in ms
int wholenote = (60000 * 4) / tempo;

int divider = 0, noteDuration = 0;

// the setup function runs once when you press reset or power the board
void setup() {
  // iterate over the notes of the melody.
  // Remember, the array is twice the number of notes (notes + durations)
  for (int thisNote = 0; thisNote < notes * 2; thisNote = thisNote + 2) {

    // calculates the duration of each note
    divider = melody[thisNote + 1];
    if (divider > 0) {
      // regular note, just proceed
      noteDuration = (wholenote) / divider;
    } else if (divider < 0) {
      // dotted notes are represented with negative durations!!
      noteDuration = (wholenote) / abs(divider);
      noteDuration *= 1.5; // increases the duration in half for dotted notes
    }

    // we only play the note for 90% of the duration, leaving 10% as a pause
    tone(buzzer, melody[thisNote], noteDuration * 0.9);

    // Wait for the specief duration before playing the next note.
    delay(noteDuration);

    // stop the waveform generation before the next note.
    noTone(buzzer);
  }
}

// the loop function runs over and over again forever
void loop() {
  // no need to repeat the melody.
}

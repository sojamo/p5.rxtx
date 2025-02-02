/*
 * Arduino code for use with the p5.rxtx library: 
 * https://github.com/sojamo/p5.rxtx/
 *
 * This sketch demonstrates how to send data using Arduino and 
 * the ArduinoJson library, only when the button's state changes 
 * (i.e., from pressed to released or vice versa).
 *
 * The ArduinoJson library is required to format and send data.
 * You can install it via the Arduino IDE Library Manager:
 *
 * Installation Steps:
 * 1. Open the Arduino IDE.
 * 2. Go to Sketch → Include Library → Manage Libraries.
 * 3. Search for "ArduinoJson".
 * 4. Install "ArduinoJson" by Benoît Blanchon.
 *
 * For documentation and examples, visit:
 * https://arduinojson.org/
 */


#include <ArduinoJson.h>
DynamicJsonDocument docTx(256);


const int deviceId = 12; // can be any number to identify sender
const int buttonPin = 2; // Pin connected to the button

int buttonState = 0;     // Current state of the button
int lastButtonState = 0; // Previous state of the button

void setup() {
  // Initialize Serial port
  Serial.begin(57600);
  while (!Serial) continue;

  // Initialize the button pin as an input
  pinMode(buttonPin, INPUT);
}

void loop() {
  // Read the state of the button
  buttonState = digitalRead(buttonPin);

  // Check if the button state has changed
  if (buttonState != lastButtonState) {
    // Send the new button state
    writeSerial();

    // Update the previous button state
    lastButtonState = buttonState;
  }

  delay(50);
}

void writeSerial() {
  // transfer data to json object
  docTx["id"] = deviceId;
  docTx["value"][0] = buttonState;

  // Serialize and send the JSON data
  serializeJson(docTx, Serial);

  // Print a newline to separate messages
  Serial.println();  
}


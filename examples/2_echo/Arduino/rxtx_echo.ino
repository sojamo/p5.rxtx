/*
 * Arduino code for use with the p5.rxtx library: 
 * https://github.com/sojamo/p5.rxtx/
 *
 * This sketch demonstrates how to receive and process JSON-formatted 
 * serial data using the ArduinoJson library. Incoming messages are 
 * deserialized, parsed, and then echoed back with modified values.
 *
 * The ArduinoJson library is required for handling JSON data. 
 * You can install it via the Arduino IDE Library Manager.
 * For documentation and examples, visit:
 * https://arduinojson.org/
 *
 * How this sketch works:
 * - The sketch initializes the Serial connection at a baud rate of 57600.
 * - It listens for incoming JSON data over Serial.
 * - When data is received, it is deserialized and processed in `parseJSON()`.
 * - The processed data is then sent back to the sender in JSON format.
 *
 */


#include <ArduinoJson.h>

DynamicJsonDocument docTx(256);
DynamicJsonDocument docRx(256);

const int id = 10;

void setup() {
  // Initialize Serial port
  Serial.begin(57600);
  while (!Serial) continue;
}

void loop() {

  // Check for incoming data
  readSerial();

  delay(50);
}

void readSerial() {
  if (Serial.available()) {
    DeserializationError error = deserializeJson(docRx, Serial);
    if (error == DeserializationError::Ok) {
      parseJSON();
    }
  }
}
/**
 * Parses incoming JSON data, extracts specific values, and sends a response.
 * 
 * This function extracts the `id` and the first element of the `value` array
 * from a received JSON object (`docRx`). It then creates a new JSON object
 * (`docTx`) containing the extracted data and sends it back to the sender.
 * 
 * Assumes `docRx` and `docTx` are global JSON objects defined elsewhere in the code.
 */
void parseJSON() {
  // Extract the sender's ID and the first element of the received value array
  int senderId = docRx["id"].as<int>();
  int v0 = docRx["value"][0].as<int>();

  // Create a JSON object to echo the received data back to the sender
  docTx["id"] = id;              // Set the ID of the sender device
  docTx["value"][0] = senderId;  // Include the extracted sender ID
  docTx["value"][1] = v0;        // Include the extracted value

  // Serialize and send the JSON data via Serial
  serializeJson(docTx, Serial);  // Convert JSON to a string and send it over Serial
  Serial.println();              // Print a newline to separate messages
}



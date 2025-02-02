# p5.rxtx

A lightweight extension for the [p5.js library](https://p5js.org/) for managing serial communication between a browser-based application and connected devices using the Web Serial API and a simple JSON-based message format. This extension is only useful when using its message format.

An example use case for p5.rxtx is a physical computing project that connects an Arduino to a p5.js sketch. This allows data exchange between the two entities using the message format described below. Such a setup is ideal for classroom activities, to practice and learn about creative coding and physical computing. Additionally, it is useful for building smaller prototypes for design experiments, interactive artifact and projects.


## Table of Contents`

- [Installation](#installation)
- [CDN](#cdn)
- [Usage](#usage)
- [Features](#features)
- [Message format](#message-format)
  - [Schema](#schema)
  - [Message format example](#message-format-example)
- [Arduino implementation](#arduino-implementation)
- [Handling connection issues](#handling-connection-issues)
  - [Lost Connection](#handling-connection-issues)
  - [Multiple connections](#multiple-connections)
- [Acknowledgments](#acknowledgments)
- [FAQ](#faq)

## installation

The extension code can be added to a p5.js sketch in 2 ways.

1. manually copy *p5.rxtx.min.js* from the lib folder to your sketch files and import the script into the index.html file by adding

```html
<script src="p5.rxtx.min.js"></script>
```
2. Use the jsdelivr CDN to import the extension, see details in the next section.

## CDN

The extension can be accessed through the jsdelivr CDN at [https://cdn.jsdelivr.net/gh/sojamo/p5.rxtx@latest/lib/p5.rxtx.min.js](https://cdn.jsdelivr.net/gh/sojamo/p5.rxtx@latest/lib/p5.rxtx.min.js) or see available tags at [p5.rxtx/tags](https://github.com/sojamo/p5.rxtx/tags) then import the script into the index.html file by adding

```html
<script src="https://cdn.jsdelivr.net/gh/sojamo/p5.rxtx@latest/lib/p5.rxtx.min.js"></script>
```

## Usage

See the 'examples' folder for code samples. 

Follow these steps to establish a connection between a device and your p5.js sketch:

1. Add the following script tag inside your HTML file
```html
<script src="https://cdn.jsdelivr.net/gh/sojamo/p5.rxtx@latest/lib/p5.rxtx.min.js"></script>
```

2. connect to rxtx by adding this command to setup

```javascript
rxtx.connect(this);
```

By default the baudRate is set to 57600, but you can changed it by passing an options object as second argument to `rxtx.connect`, see example `2_basic-use` for more usage details.

3. add a listener function to your sketch to receive incoming data

```javascript
function rxtxEvent(theEvent) {
  // this hfunction andles rxtx events and receives an object containing
  // an `id` and `value` array, e.g. { id: 1, value: [0, 0, 1] }
  // see examples for usage
}
```

### From the Examples: 1_simple

```javascript
/**
 * The most straightforward way to use p5.rxtx
 * for receiving data from an Arduino.
 */

let bg = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  rxtx.connect(this);
}

function draw() {
  background(bg);
}

function rxtxEvent(theEvent) {
  // change the color value of global variable 'bg'
  bg = theEvent.getValueAt(0) == 1 ? color(200) : color(40);
}

```

## Features

The current version of this library can connect to a device (for example an Arduino) over serial communication. It uses a simple message format to pass messages between a device and a p5.js sketch.

## Message Format

JSON structure is used for this message format is functional and generic. The structure is minimal and easy to parse for both sender and receiver. This makes it efficient for small-scale or well-defined use cases. Keeping *value* generic allows it to adapt to different contexts, as long as both parties (sender and receiver) have a shared understanding of its meaning. By avoiding lengthy keys, the JSON remains lightweight, which can be useful in scenarios where bandwidth or storage is a concern. This approach works well in tightly controlled contexts but can become problematic as the system evolves or if more structured values need to be added.

### JSON schema
The following JSON schema defines the message format for communication.

```JSON
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "id": {
      "type": "integer",
      "description": "A unique identifier to identify the device."
    },
    "value": {
      "type": "array",
      "description": "An array of numerical values.",
      "items": {
        "type": "number"
      }
    }
  },
  "required": ["id", "value"],
  "additionalProperties": false
}
```
### Message format example

Messages must follow this JSON structure:
```json
{
  "id": 1,
  "value": [0, 0, 0]
}
```

Where:

- `id`: Unique identifier for the sending device
- `value`: Array of numeric values to transmit

The message must be a valid JSON object containing these two fields. The `value` array can contain any number of elements.

## Arduino implementation

Communication with Arduino uses Serial communication and JSON-formatted messages. There are two approaches:

1. **Recommended: ArduinoJson Library**
   - Install via Arduino IDE Library Manager
   - Provides robust JSON handling
   - Documentation and examples: [arduinojson.org](https://arduinojson.org)

2. **Alternative: Manual JSON Formatting**
   - Format JSON strings directly
   - Send over Serial without additional libraries

### Examples

For examples see the 'examples' folder 

1. **1_basic** – a simple Arduino sketch that sends the state of a button, the p5.js sketch then changes the background based on value (0 or 1) received
2. **2_echo** – demonstrates how to send and receive on both ends, Arduino and p5.js

## Handling connection issues

### Lost Connection

If the library loses the serial connection to your device (due to disconnection or connection timeout), an "Unavailable" button will appear in the top left corner. To reconnect:
- Check the connection of the devide 
- Either click the "Unavailable" button 
- Or reload the page

### Multiple connections

The library cannot maintain multiple simultaneous connections to the same device. If you open multiple browser tabs or windows:
- A connectivity conflict may occur when attempting to access the device
- To resolve this, close all unused tabs/windows and keep only one connection active

## Acknowledgments

- [Web Serial API](https://developer.mozilla.org/en-US/docs/Web/API/Serial)
- [p5.js](https://p5js.org/)
- [ArduinoJson](https://arduinojson.org/)

## FAQ

**Q: Which browsers support the Web Serial API?**  
A: It is supported in Chromium-based browsers like Google Chrome and Microsoft Edge.

**Q: Why does the sketch say the port is busy or Unavailable?**  
A: This usually happens when another program is using the serial port. Try the following: (1) Close any other browser tabs or windows running the same sketch. (2) Check if the Serial Monitor in the Arduino IDE is open. If so, close it before running the sketch. If the issue persists, try unplugging and reconnecting your device

**Q: Can I use this library with Node.js?**  
A: No, the Web Serial API is browser-only.

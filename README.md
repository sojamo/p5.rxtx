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
  - [Message example](#message-example)
  - [Arduino implementation](#arduino-implementation)
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

*How to use the project, with code examples.*

## Features

*Key features of the project.*

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
### Message example

And here an example of what is expected when sending and receiving a message:

```JSON
{"id":1, "value":[0,0,0]}
```

### Arduino implementation

*Arduino example 1: sending a composed string; Arduino example 2: sending using JSON library; send and receive using JSON library*

## Acknowledgments

- [Web Serial API](https://developer.mozilla.org/en-US/docs/Web/API/Serial)
- [p5.js](https://p5js.org/)

## FAQ

**Q: Which browsers support the Web Serial API?**  
A: It is supported in Chromium-based browsers like Google Chrome and Microsoft Edge.

**Q: Can I use this library with Node.js?**  
A: No, the Web Serial API is browser-only.

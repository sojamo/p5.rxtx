# p5.rxtx

A lightweight extension for the p5.js library for managing serial communication between a web application and connected devices using the Web Serial API and a simple JSON based message format. This extension is only useful when using its message format.


## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [CDN](#cdn)
- [Features](#features)
- [Message format](#message-format)
- [Acknowledgments](#acknowledgments)
- [FAQ](#faq)

## installation

*Steps to install the project.*

## Usage

*How to use the project, with code examples.*

## CDN

The extension can be accessed through the jsdelivr CDN at [https://cdn.jsdelivr.net/gh/sojamo/p5.rxtx@latest/lib/p5.rxtx.min.js](https://cdn.jsdelivr.net/gh/sojamo/p5.rxtx@latest/lib/p5.rxtx.min.js) or see available tags at [p5.rxtx/tags](https://github.com/sojamo/p5.rxtx/tags)

## Features

*Key features of the project.*

## Message Format

The following JSON schema defines the message format for communication.

```JSON
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "id": {
      "type": "integer",
      "description": "A unique identifier for the device."
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

And an example of what is expected when sending and receiving

```JSON
{"id":1, "value":[0,0,0]}
```

## Acknowledgments

- [Web Serial API](https://developer.mozilla.org/en-US/docs/Web/API/Serial)
- [p5.js](https://p5js.org/)

## FAQ

**Q: Which browsers support the Web Serial API?**  
A: It is supported in Chromium-based browsers like Google Chrome and Microsoft Edge.

**Q: Can I use this library with Node.js?**  
A: No, the Web Serial API is browser-only.
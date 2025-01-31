# Notes for current and further development

To develop this library there are 2 modes: dev and build; dev-mode (npm run dev) will start a webserver at http://localhost:5173 to test the examples. Changes to the library itself are only recognised when the project is built (npm run build).

## Versions

### dev-0.1

- This version allows for micro-controllers like the Arduino and any other device that can speak serial communcation over a serial port to connect to a p5.js sketch when the library is available. Communication is established via a Serial-to-USB connection. We are currently able to detect one device to which we can automatically reconnect after reloading the sketch until the USB connection is lost. 


### dev-0.2

- Improve error messages and notifications. Currently these messages are printed to the console but should be visible to the user on canvas. 
/**
 * The most straightforward way to use p5.rxtx
 * for receiving data from an Arduino.
 *
 * This example uses the `rxtxEvent` function to
 * listen for incoming events and update global
 * variables based on the received data.
 */

let bg = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  rxtx.connect(this);  // activate rxtx
}

function draw() {
  background(bg);
}

/**
 * Handles rxtx events, receives an object with id and value
 * entries, for example { id: 1, value: [0, 0, 1] }
 *
 * @param {Object} theEvent - The event object containing rxtx data.
 * @param {number} theEvent.id - The unique identifier, the device id.
 * @param {Array<number>} theEvent.value - An array of numerical values
 * representing the event's data.
 * @param {Function} theEvent.getValueAt - A method to retrieve a value at 
 * a given index. Takes an index as an argument and returns the 
 * corresponding value. No type checking is performed; the returned value 
 * depends on the data received.
 */
function rxtxEvent(theEvent) {
  // change the color value of global variable 'bg'
  bg = theEvent.getValueAt(0) == 1 ? color(200) : color(40);
}

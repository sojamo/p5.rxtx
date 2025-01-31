/**
 * Sets up the p5.js sketch and initializes a serial connection.
 *
 * We establish a serial connection using the `rxtx.connect` method.
 * It configures the serial connection with a baud rate of 57600
 * and debugging options. Ensures the sketch is ready for
 * interaction with serial devices.
 */
function setup() {
  createCanvas(windowWidth, windowHeight);
  let options = {
    baudRate: 57600,
    debug: { print: false, show: false },
  };
  rxtx.connect(this, options);
}

function draw() {
  background(120);

  /*
   * Checks if rxtx values are available and updates the 
   * background color based on the first value.
   *
   * If values are available (`rxtx.isValuesAvailable()` returns true)
   * and the first value (`rxtx.getValueAt(0)`) equals 1, the 
   * background color is set to black (RGB: 0). Otherwise, no 
   * change is made to the background.
   */
  if (rxtx.isValuesAvailable()) {
    if (rxtx.getValueAt(0) === 1) {
      background(0);
    }
  }
}

/**
 * Can handle rxtx events, receives an object with id and value
 * entries, for example { id: 1, value: [0, 0, 1] }
 *
 * @param {Object} theEvent - The event object containing rxtx data.
 * @param {number} theEvent.id - The unique identifier, the device id.
 * @param {Array<number>} theEvent.value - An array of numerical values
 * representing the event's data.
 *
 */
function rxtxEvent(theEvent) {
  console.log(theEvent);
}

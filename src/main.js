import { environmentCheck, initWith } from "./init";
import { rxtxSendTo } from "./serial/data";

const state = {};

/**
 * Initializes the rxtx connection with the specified app and options.
 *
 * This function sets up the rxtx extension for communication using the provided
 * p5.js sketch and configuration options. It should be called from the
 * `setup` function of your sketch. The configuration options allow for
 * customization of the baud rate, debugging behavior, and other settings.
 *
 * @param {object} theApp - The p5.js sketch instance (`this` from the sketch).
 * @param {object} [theArgs={}] - Configuration options for the connection.
 *
 * @example
 * // Call this function in your p5.js setup function:
 * let options = {
 *   baudRate: 57600,
 *   debug: { print: false, show: false },
 * };
 * rxtx.connect(this, options);
 *
 * @public
 */
export const connect = async (theApp, theArgs = {}) => {
  initWith(theApp, theArgs, state);
};

/**
 * Checks if values are available in the rxtx state.
 *
 * This function verifies if the `value` field in the RXTX state is defined.
 * Returns `true` if values are available, otherwise `false`. It is designed
 * to be called frequently, such as within a p5.js `draw` function.
 *
 * Usage Example:
 * function draw() {
 *   background(220);
 *
 *   if (rxtx.isValuesAvailable()) {
 *     if (rxtx.getValueAt(0) === 1) {
 *       background(0);
 *     }
 *   }
 *   ...etc
 * }
 *
 * @returns {boolean} `true` if values are available, `false` otherwise.
 * @public
 */
export const isValuesAvailable = () => {
  return state.debug.data.value == undefined ? false : true;
};

export const isConnectionEstablished = () => {
  return state.connected;
};

export const isReadyToSend = () => {
  return state.io != null;
};

/**
 * Retrieves the value at the specified index from a list of values.
 *
 * If the index is out of bounds (greater than or equal to the length of
 * the values array), it returns -1. Otherwise, it returns the value
 * at the given index.
 *
 * @param {number} theIndex - The index of the value to retrieve.
 * @returns {*} The value at the specified index, or -1 if out of bounds.
 */
export const getValueAt = (theIndex) => {
  const values = getValues();
  return theIndex >= values.length ? -1 : values[theIndex];
};

/**
 * Retrieves the current values from the application state.
 *
 * This function returns the `value` property from the global `state` object.
 * If the `value` property is undefined or null, it defaults to an empty array.
 *
 * @returns {Array} - An array of current values or an empty array if no values
 *                    are set in the state.
 */
export const getValues = () => {
  return state.value || [];
};

export const send = (theJSONformattedData) => {
  const str = JSON.stringify(theJSONformattedData);
  rxtxSendTo(state, str);
};

/**
 * Checks the runtime environment for necessary conditions
 * and updates the application state accordingly.
 *
 * @param {Window} window - The global window object, used
 * for browser-related checks.
 * @param {Object} state - The application state object to
 * be updated based on the environment check results.
 *
 * This function verifies if the runtime environment supports
 * the required APIs or features (e.g., Web Serial API) and updates
 * the provided state object with relevant flags or properties,
 * enabling other parts of the application to adapt to the
 * current environment.
 */
environmentCheck(window, state);

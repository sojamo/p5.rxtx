import { parseStringToJSON, updateState } from "../utils/processing";

/**
 * Sends data to the connected serial device via the Web Serial API.
 *
 * @async
 * @function rxtxWriteTo
 * @param {Object} theState - The current application state, including the
 *                            serial port and writer.
 * @param {*} theData - The data to be sent to the serial device. This data
 *                      will be processed before being written.
 * @returns {Promise<boolean>} Returns true if the data was successfully sent,
 *                             or false if no port is available in the state.
 *
 * @example
 * const state = { port: somePort, writer: someWriter };
 * const success = await rxtxWriteTo(state, "Hello Device");
 * console.log(success); // true if data was sent successfully
 */
export const rxtxWriteTo = async (theState, theData) => {
  if (!theState?.port) return false;
  await theState.writer.write(checkRxtxData(theData));
  return true;
};

const checkRxtxData = (theData) => {
  // see sketch https://editor.p5js.org/sojamo/sketches/yXZauy17X
  // to type check, then operate on theData accordingly
  // and return expected type so that it can be interpreted
  // by the receiving end, the Arduino.
  return utf8EncodeText.encode(theData);
};

/**
 * Processes incoming data from a serial stream, handling partial and complete
 * data chunks. Appends incomplete data to a buffer until a newline character
 * (`\n`) is detected, at which point the buffer is parsed as JSON. Updates the
 * application state and triggers related events upon successful parsing.
 *
 * @param {string} value - Incoming data chunk from the serial stream.
 * @param {object} theState - Application state object that holds the buffer,
 *                            parsed data, and callback functions.
 *
 * @throws {Error} Logs an error if parsing the buffer as JSON fails.
 *
 * @example
 * handleIncomingData("[1,2,3]\n", theState);
 * // Parses "[1,2,3]" as JSON, updates the state, and triggers events.
 */
export const handleIncomingData = (value, theState) => {
  if (!value.includes("\n")) {
    theState.readBuffer += value;
    return;
  }
  const [data, remainder] = value.split("\n");
  theState.readBuffer += data;
  parseStringToJSON(theState.readBuffer)
    .then((parsedData) => {
      if (parsedData.value !== undefined) {
        
        // @TODO fix this messy looking data transfer
        const { id, value } = parsedData;
        theState.debug.data = { value, id };
        updateState(theState, {
          value: value || [],
          id: id || -1,
          // debug: { data: theState }, // @TODO look into this assignment, overrides debug settings
        });

        theState.fn({ id: theState.id, value: theState.value });
        theState.rxtxEvent({ id: theState.id, value: theState.value });
      }
      theState.readBuffer = remainder || "";
    })
    .catch((err) => console.log("Error parsing data:", err));
};

import { handleIncomingData } from "./rxtx.serial.data";
import { updateState } from "./rxtx.processing";

/**
 * Retrieves all available serial ports that the user has
 * previously granted permission to access.
 *
 * This function utilizes the Web Serial API to list serial
 * ports that are currently available and for which the browser
 * has retained user permissions. If the Web Serial API is not
 * supported by the browser, an error is thrown.
 *
 * @async
 * @function getAvailablePorts
 * @throws {Error} If the Web Serial API is not supported by the browser.
 * @returns {Promise<SerialPort[]>} A promise that resolves to an array
 *                                  of `SerialPort` objects representing
 *                                  the available serial ports.
 */
export const getAvailablePorts = async () => {
  if (!("serial" in navigator)) {
    throw new Error("Web Serial API not supported.");
  }
  return await navigator.serial.getPorts();
};

/**
 * Attempts to reconnect to all previously granted serial ports.
 *
 * This function retrieves a list of previously granted serial ports using
 * `getAvailablePorts`, then iterates over each port to establish a connection
 * by calling `connectToPort`. The state (`theState`) is updated during each
 * connection attempt.
 *
 * @async
 * @param {Object} theState - The application state object used to manage
 *                            connections and serial port details.
 */
export const reconnectToPreviouslyGrantedPorts = async (theState) => {
  const ports = await getAvailablePorts();
  console.log("trying to reconnect to previous ports", ports);
  for (const port of ports) {
    await connectToPort(port, theState);
  }
};

/**
 * Checks and establishes a connection to a serial port for the given state.
 *
 * This function initializes the `readBuffer` in the provided state and attempts
 * to retrieve available serial ports. If no ports are available, it prompts
 * the user to select a port. Otherwise, it selects the first available port.
 * Once a port is identified, the function attempts to connect to it.
 *
 * @async
 * @function checkPortConnectionFor
 * @param {Object} theState - The application state object. It should contain
 *                            the required properties for managing the serial
 *                            connection and the read buffer.
 * @returns {Promise<boolean>} - Resolves to `true` if the connection is
 *                               successfully established; otherwise, `false`.
 */
export const checkPortConnectionFor = async (theState) => {
  theState.readBuffer = "";

  // Get available ports
  const ports = await getAvailablePorts();

  let port;
  if (ports.length === 0) {
    // Select a port if none are available
    port = await selectPort();
  } else {
    // Select the first port available from the ports list
    port = ports[0];
  }
  return await connectToPort(port, theState);
};

/**
 * Prompts the user to select a serial port using the Web Serial API.
 *
 * This function uses `navigator.serial.requestPort()` to request a serial
 * port from the user. If the user selects a port, the function resolves with
 * the selected port. If an error occurs or the user cancels the selection, the
 * function logs the error and explicitly returns `undefined`.
 *
 * @returns {Promise<SerialPort | undefined>} A promise that resolves with the
 * selected `SerialPort` object if successful, or `undefined` if an error
 * occurs or no port is selected.
 */
const selectPort = async () => {
  try {
    // Request a port from the user
    const port = await navigator.serial.requestPort();
    return port; // Return the selected port
  } catch (err) {
    console.log("Error selecting port:", err);
    return undefined; // Explicitly return undefined on error
  }
};

/**
 * Asynchronously connects to a given serial port and updates the state object.
 *
 * This function opens the specified serial port with the baud rate provided in
 * the state object. It sets up the necessary streams for reading and writing
 * data, stores the connection details, and initiates data reading from the port.
 * If the connection is successful, the state is updated accordingly.
 *
 * @async
 * @function connectToPort
 * @param {SerialPort} thePort - The serial port to connect to.
 * @param {Object} theState - The state object containing configuration and
 *                            where connection details will be stored.
 * @returns {Promise<boolean>} - Resolves to `true` if connection is successful,
 *                               otherwise `false`.
 *
 * @throws Will throw an error if the connection fails.
 */
const connectToPort = async (thePort, theState) => {
  if (!thePort) {
    console.log("No port provided.");
    return false;
  }

  try {
    // Open the port with the given baud rate
    await thePort.open({ baudRate: theState.baudRate });

    // Set up text decoding for the readable stream
    const decoder = new TextDecoderStream();
    const inputDone = thePort.readable.pipeTo(decoder.writable);

    // Retrieve reader and writer
    const reader = decoder.readable.getReader();
    const writer = thePort.writable.getWriter();

    // Store the connected port and streams
    theState.connectedPorts.push({ thePort, reader, writer });

    // Log successful connection
    console.log("Serial communication established with", thePort.getInfo());

    // Update the state
    updateState(theState, {
      connected: true,
      port: thePort,
      reader,
      writer,
      io: true, // @TODO: Decide if io is redundant
    });

    // Start reading from the port
    await readFromPort(theState);

    return true; // Indicate success
  } catch (err) {
    console.log("Error connecting to port:", err);
    cleanupResources(thePort, theState).then(() =>
      console.log("Resources cleaned up.")
    ).catch(console.error);
  }
  return false;
};

/**
 * Reads data from the connected serial port in an asynchronous loop.
 *
 * Continuously reads incoming data from the port while the connection
 * remains active (`theState.connected`). Passes the data to a handler
 * function for processing. If an error occurs during reading, logs
 * the error and throws it for upstream handling. Ensures resources
 * like the reader and port are cleaned up when the reading stops or
 * an error occurs.
 *
 * @param {Object} theState - The application state object containing:
 *  - `connected` (boolean): Whether the port is connected.
 *  - `reader` (ReadableStreamDefaultReader): The port's reader for incoming data.
 *  - `port` (SerialPort): The connected serial port.
 *
 * @throws {Error} Re-throws any error encountered during reading.
 */
const readFromPort = async (theState) => {
  try {
    while (theState.connected) {
      const { value, done } = await theState.reader.read();
      if (done) break;
      if (value) handleIncomingData(value, theState);
    }
  } catch (err) {
    console.log("Error during read:", err);
    throw err;
  } finally {
    cleanupResources(theState.port, theState).then(() =>
      console.log("Resources cleaned up.")
    ).catch(console.error);
  }
};

/**
 * Cleans up serial port resources by canceling and releasing reader
 * and writer locks. Ensures proper closure of streams to prevent
 * resource leaks.
 *
 * @param {SerialPort} thePort - The serial port to be cleaned up (optional).
 * @param {Object} theState - The application state containing reader and writer.
 * @returns {Promise<void>} Resolves when cleanup is complete.
 */
const cleanupResources = async (thePort, theState) => {
  // @TODO cleanup theState

  try {
    if (theState.reader) {
      await theState.reader.cancel();
      theState.reader.releaseLock();
    }
    if (theState.writer) {
      await theState.writer.close();
      theState.writer.releaseLock();
    }
  } catch (err) {
    console.log("Error during cleanup:", err);
  }
};

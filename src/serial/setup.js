import {
  checkPortConnectionFor,
  getAvailablePorts,
  reconnectToPreviouslyGrantedPorts,
} from "./port";

/**
 * Initializes the rxtx extension by checking available serial ports and managing
 * connection states. If no ports are detected, it adds a "Connect" button
 * to prompt the user for manual port selection. If ports are available, it
 * attempts to reconnect to previously granted ports.
 *
 * @async
 * @function startRxtxWith
 * @param {Object} theState - The application state object that holds serial
 *                            connection information and configurations.
 * @returns {Object} Updated state object after processing available ports.
 */

export const startRxtxWith = async (theState) => {
  const availablePorts = await getAvailablePorts();
  // @TODO update state before returning
  switch (availablePorts.length) {
    case 0:
      console.log("No previously granted ports detected, add connect button.");
      await addConnectButton(theState);
      break;
    default:
      console.log("Previously granted ports detected, wait to reconnect ..");
      try {
        await reconnectToPreviouslyGrantedPorts(theState);
      } catch (err) {
        console.log("couldn't reconnect to previously granted port(s).");
        await addConnectButton(theState, false);
      }
      break;
  }
  return theState;
};

/**
 * Adds a "connect" button to the interface for establishing a serial connection.
 *
 * The button is styled and positioned on the screen. When pressed, it attempts
 * to connect to a serial port using the provided state. If the connection fails,
 * the button is re-added for retrying. The button changes color on hover to
 * provide feedback to the user.
 *
 * @param {Object} theState - An object representing the current application state.
 *                            Includes configuration and callbacks for connection.
 *
 * Usage:
 * Call this function to display a "connect" button on the interface, allowing
 * users to establish a connection.
 */

const addConnectButton = async (theState, available = true) => {
  // @TODO check if button already exists to avoid more
  // than 1 instances at the same time
  const label = available ? "connect" : "unavailable";
  const col = available ? ["#03a1ff", "#06b004"] : ["#ffa103", "#666666"];
  const button = createButton(label);
  button.position(20, 20);
  button.style(`
    background: ${col[0]};
    color: #fff;
    font-size: 16px;
    margin: auto;
    border: 0;
    padding: 8px 32px;
    border-radius: 32px;
    transition: background 0.3s;
  `);

  button.mouseOver(() => button.style(`background: ${col[1]};`));
  button.mouseOut(() => button.style(`background: ${col[0]};`));

  button.mousePressed(async () => {
    
    // remove the button before checkPortConnectionFor
    // in the next step goes into while-loop mode
    button.remove();
    try {
      // we have a connection
      await checkPortConnectionFor(theState);
    } catch (err) {
      // we can't connect
      console.log(`port is busy, ${err.message}`);
      addConnectButton(theState, false); 
    }
  });
};

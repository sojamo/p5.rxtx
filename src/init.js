import { deepMerge, updateState } from "./utils/processing";
import { startRxtxWith } from "./serial/setup";
import { keyPressed } from "./ui/keyboard";
import { showRxtxDebug } from "./utils/debug";

/**
 * Initializes the application state with default, user-defined, and internal
 * settings. Merges these settings into `theState` and starts the rxtx process.
 *
 * @param {Object} theApp - The application instance (sketch or object), expected to
 *                          provide properties such as `rxtxEvent` for handling events.
 * @param {Object} theArgs - User-defined settings that override default values.
 *                           Example properties include:
 *                           - baudRate: Communication speed (default: 57600).
 *                           - id: Identifier for the state (default: -1).
 *                           - value: Array of values (default: []).
 *                           - debug: Debugging options { print: false, show: false }.
 * @param {Object} theState - The state object to be initialized with the merged
 *                            settings, including default, user-defined, and
 *                            internal configurations.
 */
export const initWith = (theApp, theArgs, theState) => {
  const defaults = {
    baudRate: 57600,
    id: -1,
    value: [],
    range: [],
    image: {
      label: "rxtx",
      format: "jpg",
    },
    mappedKeys: ["d", "f", "p", "s", "v"],
    debug: { print: false, show: false },
  };

  const internal = {
    debug: { data: {} },
    connected: false,
    io: null,
    isKeyPressed: false,
    rxtxEvent: theApp.rxtxEvent || ((ev) => {}),
    readBuffer: "",
    connectedPorts: [],
  };

  updateState(theState, deepMerge(deepMerge(defaults, theArgs), internal));
  startRxtxWith(theState);
};

/**
 * Performs an environment check for the p5.js instance and registers
 * custom behaviors for the window resize and specific "post" methods.
 * If p5.js is not found in the global scope, an error is logged.
 *
 * @param {object} theInstance - The global object to check for p5.js.
 * @param {object} theState - The application state object used for
 *                            handling key press and debugging behaviors.
 *
 * - Registers a `windowResized` function to resize the canvas dynamically.
 * - Registers "post" methods for handling key presses and debugging.
 * - Logs an error if p5.js is not available in the environment.
 */
export const environmentCheck = (theInstance, theState) => {
  (function (global) {
    if (global.p5) {
      global.p5.prototype.windowResized = () => {
        resizeCanvas(windowWidth, windowHeight);
      };

      global.p5.prototype.registerMethod("post", () => keyPressed(theState));
      global.p5.prototype.registerMethod("post", () => showRxtxDebug(theState));
    } else {
      console.error(
        "p5.js not found. Please include p5.js before this library.",
      );
    }
  })(theInstance);
};

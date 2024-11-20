import { deepMerge } from "./rxtx.processing";
import { startRxtxWith } from "./rxtx.serial";
import { keyPressed } from "./rxtx.keyboard";
import { showRxtxDebug } from "./rxtx.debug";

/**
 * 
 * @param {*} theApp 
 * @param {*} theArgs 
 * @param {*} theState 
 */
export const initWith = (theApp, theArgs, theState) => {
  const defaults = {
    baudRate: 57600,
    id: -1,
    value: [],
    fn: (ev) => {},
    image: {
      label: "rxtx",
      format: "jpg",
    },
    debug: { print: false, show: false },
  };

  const internal = {
    debug: { data: {} },
    connected: false,
    io: null,
    "isKeyPressed": false,
    "rxtxEvent": theApp.rxtxEvent || ((ev) => {}),
  };

  Object.assign(theState, deepMerge(deepMerge(defaults, theArgs), internal));
  startRxtxWith(theState);
}

/**
 * 
 * @param {*} theInstance 
 * @param {*} theState 
 */
export const environmentCheck = (theInstance, theState) => {
  (function (global) {
    if (global.p5) {
      global.p5.prototype.windowResized = () => {
        resizeCanvas(windowWidth, windowHeight);
      };
  
      global.p5.prototype.registerMethod("post", () => keyPressed(theState));
      global.p5.prototype.registerMethod("post", () =>showRxtxDebug(theState));
    } else {
      console.error("p5.js not found. Please include p5.js before this library.");
    }
  })(theInstance);
}
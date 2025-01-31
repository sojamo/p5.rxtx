import { enterFullscreen } from "./window";
import { getFormattedTimeStamp } from "../utils/processing";

// @NOTE: Application version - injected from package.json during 
// production build, defaults to 'dev-version' during development
// handled by vite plugin vite.plugin.version.js
const VERSION = /* @INJECT_VERSION */ || 'dev-version';

/**
 * Handles keypress events and updates the application state based on the
 * pressed key. Supports toggling debug modes, entering fullscreen,
 * and saving a canvas image. Checks for allowed keys and ensures state
 * consistency during keypress handling.
 * 
 * Mapped keys can be dis/enabled with the mappedKeys option
 * @see initWith - Initializes the state with default, user-defined, settings
 *
 * @param {Object} theState - The current application state. Includes:
 *   - {boolean} isKeyPressed - Tracks whether a key is currently pressed.
 *   - {Object} debug - Manages debug settings:
 *       - {boolean} show - Toggles debug display.
 *       - {boolean} print - Toggles debug print mode.
 *   - {Array<string>} mappedKeys - Allowed keys for handling.
 *   - {Object} image - Contains image properties:
 *       - {string} format - File format for saved images.
 *       - {string} label - Prefix label for saved images.
 * 
 */
export const keyPressed = (theState) => {
  if (isKeyPressed === true) {
    if (theState.isKeyPressed === false) {
      theState.isKeyPressed = true;
      if (!theState.mappedKeys.includes(key)) {
        return;
      }
      // @NOTE: to add a new mapped key, you need 
      // to add that key to the mappedKeys array (init.js)
      switch (key) {
        case "d":
          theState.debug.show = !theState.debug.show;
          break;
        case "f":
          enterFullscreen();
          break;
        case "p":
          theState.debug.print = !theState.debug.print;
          break;
        case "s":
          const l = theState.image.label;
          const t = getFormattedTimeStamp();
          const ext = theState.image.format;
          const label = `${l}_${t}.${ext}`;
          console.log(`saving image ${label}`);
          saveCanvas(label, theState.image.format);
          break;
        case "v":
          console.log(`p5.rxtx ${VERSION} by sojamo`);
          break;
      }
    }
  } else {
    theState.isKeyPressed = false;
  }
};

import { enterFullscreen } from "./window";
import { getFormattedTimeStamp } from "../utils/processing";

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
      }
    }
  } else {
    theState.isKeyPressed = false;
  }
};

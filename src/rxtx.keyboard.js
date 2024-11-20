import { enterFullscreen } from "./rxtx.window";

/**
 * 
 * @param {*} theState 
 */
export const keyPressed = (theState) => {

  if (isKeyPressed === true) {
    if (theState.isKeyPressed === false) {
      theState.isKeyPressed = true;
      switch (key) {
        case "f":
          enterFullscreen();
          break;
        case "p":
          theState.debug.print = !theState.debug.print;
          break;
        case "d":
          theState.debug.show = theState.debug.show ? true : false;
          break;
        case "s":
          let t = "";
          t = year() + nf(month(), 2) + nf(day(), 2);
          t += nf(hour(), 2) + nf(minute(), 2) + nf(second(), 2);
          let label = "";
          label += theState.image.label;
          label += "_" + t;
          label += "." + theState.image.format;
          log(`saving image ${label}`);
          saveCanvas(label, rxtxProps.image.format);
          break;
      }
    }
  } else {
    theState.isKeyPressed = false;
  }
};




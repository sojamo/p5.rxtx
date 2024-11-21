/**
 * Displays debugging information for the RXTX state.
 *
 * This function logs and visualizes the debug data stored in the `theState`
 * object. It first checks whether debugging options are enabled (`print` and
 * `show`) and whether valid data is available. If data is present and the
 * `show` option is enabled, a graphical layer is created or updated to display
 * the data as a list of visualized values on the canvas.
 *
 * The debug output includes:
 * - Text logging of debug data if `print` is enabled.
 * - A graphical representation of values, showing constrained bars and
 *   corresponding numeric labels.
 * - Integration with WebGL mode by offsetting the canvas transformation.
 *
 * @param {Object} theState - The state object containing debug information.
 */
export const showRxtxDebug = (theState) => {
  if (theState.debug === undefined) return;
  if (theState.debug.print) {
    if (theState.debug.data.value == undefined) {
      console.log("debug.print, no data present yet.");
    } else {
      console.log(theState.debug.data.value);
    }
  }
  if (!theState.debug.show || !theState.debug.data.value) return;

  const isWEBGL = drawingContext instanceof WebGLRenderingContext;

  const v = theState.debug.data.value;
  const id = theState.debug.data.id;
  const label = `Device ${id}`;
  const spacing = 20;
  const header = 40;
  const footer = 20;
  const h = header + v.length * spacing + footer;
  const w = 400;
  if (!theState.debug.layer) {
    theState.debug.layer = createGraphics(w, h);
    theState.debug.layer.clear();
  }
  const l = theState.debug.layer;
  l.clear();
  l.noStroke();
  l.fill(0, 40);
  l.rect(0, 0, w, h, 16);
  l.push();
  l.translate(20, 20);
  l.fill(255);
  l.text(label, 0, 0);
  l.translate(0, 20);
  v.forEach((v, i) => {
    let v0 = constrain(v, 0, 1);
    l.push();
    l.translate(0, i * 20);
    l.fill(255, 40);
    l.rect(0, 0, 300, 10, 4);
    l.fill(255, 200);
    l.rect(0, 2, v0 * 300, 8, 4);
    l.fill(255);
    l.text(v0.toFixed(2), 320, 10);
    l.pop();
  });
  l.pop();

  push();
  if (isWEBGL) {
    translate(-width / 2, -height / 2);
  }
  translate(20, 20);
  image(theState.debug.layer, 0, 0);
  pop();
};

export const log = (...args) => {
  let msg = ``;
  args.forEach((el) => {
    if (el instanceof Object) {
      msg += `\n${JSON.stringify(el, null, 2)}`;
    } else {
      msg += el;
    }
  });
  console.log("rxtx debug : ", msg);
};

export const showRxtxDebug = (theState) => {
  if (theState.debug.print) {
    if (theState.debug.data.value == undefined) {
      log("debug.print, no data present yet.");
    } else {
      log(theState.debug.data.value);
    }
  }
  if (!theState.debug.show || !theState.debug.data.value) return;

  const isWEBGL = drawingContext instanceof WebGLRenderingContext;

  if (!theState.debug.layer) {
    theState.debug.layer = createGraphics(400, 200);
    theState.debug.layer.clear();
  } else {
    const l = theState.debug.layer;
    const v = theState.debug.data.value;
    const id = theState.debug.data.id;

    l.clear();
    l.noStroke();
    l.fill(0, 20);
    l.rect(0, 0, 400, 200, 16);
    l.push();
    l.translate(20, 20);
    l.fill(255);
    l.text(`Device ${id}`, 0, 0);
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
  }

  push();
  if (isWEBGL) {
    translate(-width / 2, -height / 2);
  }
  translate(20, 20);
  image(theState.debug.layer, 0, 0);
  pop();
};

export const log = (...args) => {
  console.log("rxtx debug : ", args.join(" "));
};


function setup() {
  createCanvas(windowWidth, windowHeight);
  rxtx.connect(this);
}

function draw() {
  background(40);
}

function mousePressed() {
  const id = 1;
  const value = [100];
  const json = {id, value};
  rxtx.send(json);
}

/**
 * Can handle rxtx events, receives an object with id and value
 * entries, for example { id: 1, value: [0, 0, 1] }
 */
function rxtxEvent(theEvent) {
  const from = theEvent.id;
  const value = theEvent.value;
  console.log(`received an echo message from id:${from} value:${value}`);
}

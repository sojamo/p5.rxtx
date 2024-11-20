function setup() {
  createCanvas(windowWidth, windowHeight);
  let options = {
    baudRate: 57600,
    debug: { print: false, show: false },
  };
  rxtx.connect(this, options);
}

function draw() {
  background(220);
  if(rxtx.isValuesAvailable()) {
    if(rxtx.getValueAt(0) === 1) {
      background(0);
    }
  }
}

function rxtxEvent(theEvent) {
  console.log(theEvent);
}

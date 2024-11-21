function setup() {
  createCanvas(windowWidth, windowHeight);
  let options = {
    baudRate: 57600,
    debug: { print: false, show: false }
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

  push();
  noStroke();
  fill(frameCount%255);
  translate(150,20);
  rect(0,0,200,34,32);
  pop();
  
}

function rxtxEvent(theEvent) {
  console.log(theEvent);
}

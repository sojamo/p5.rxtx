import { parseStringToJSON } from "./rxtx.processing";
import { log } from "./rxtx.debug";

export const startRxtxWith = async (theState) => {
  try {
    await reconnectToPreviouslyGrantedPorts(theState);
    return theState;
  } catch (err) {
    console.log("couldnt reconnect");
  }
  const button = createButton("connect");
  button.position(20, 20);
  button.style("background:#03a1ff");
  button.style("color:#fff");
  button.style("font-size:16px");
  button.style("margin:auto");
  button.style("border:0");
  button.style("padding:8px 32px");
  button.style("border-radius:32px");
  button.style("transition:background 0.3s");
  button.mouseOver(() => {
    button.style("background:#06b004");
  });
  button.mouseOut(() => {
    button.style("background:#03a1ff");
  });

  button.mousePressed(() => {
    theState.fn = (val) => {
      // console.log("debug: " + val);
    };
    checkRxtxFor(theState);
    button.remove();
  });
  return theState;
};

const checkRxtxFor = async (theState) => {
  if ("serial" in navigator) {
    navigator.serial.getPorts().then((ports) => {
      theState.readBuffer = "";
      if (ports.length == 0) {
        selectPort().then((port) => {
          connectToPort(port, theState);
        });
      } else {
        connectToPort(ports[0], theState);
      }
    });
  }
};

const selectPort = async () => {
  const port = await navigator.serial.requestPort();
  return port;
};

const connectedPorts = [];

const connectToPort = async (thePort, theState) => {
  console.log(thePort, theState);
  try {
    // Open the port with the given baud rate
    await thePort.open({ baudRate: theState.baudRate });

    // Set up text decoding for the readable stream
    const decoder = new TextDecoderStream();
    const inputDone = thePort.readable.pipeTo(decoder.writable);

    // Retrieve reader and writer
    const reader = decoder.readable.getReader();
    const writer = thePort.writable.getWriter();

    connectedPorts.push({ thePort, reader, writer });

    // Log successful connection
    log("Serial communication established with ", thePort.getInfo());

    // Update the state
    Object.assign(theState, {
      connected: true,
      port: thePort,
      reader,
      writer,
      io: true, // @TODO: Decide if io is redundant
    });

    readFromPort(theState);

    return { inputDone }; // Return the promise for tracking input stream completion
  } catch (error) {
    log("Error connecting to port:", error);
    throw error; // Rethrow error for upstream handling
  }
};

// Automatically reconnect to previously granted ports
export const reconnectToPreviouslyGrantedPorts = async (theState) => {
  const ports = await navigator.serial.getPorts();
  console.log("trying to reconnect to previous ports", ports);
  for (const port of ports) {
    await connectToPort(port, theState);
  }
};

export const rxtxWriteTo = async (theState, theData) => {
  if (!theState?.port) return false;
  await theState.writer.write(checkRxtxData(theData));
  return true;
};

const checkRxtxData = (theData) => {
  // see sketch https://editor.p5js.org/sojamo/sketches/yXZauy17X
  // to type check, then operate on theData accordingly
  // and return expected type so that it can be interpreted
  // by the receiving end, the Arduino.
  return utf8EncodeText.encode(theData);
};

const readFromPort = async (theState) => {
  while (true) {
    const { value, done } = await theState.reader.read();
    if (value) {
      if (!value.includes("\n")) {
        // we received a chunk of data, add to
        // the string buffer and wait for more data
        // until \n is detected
        theState.readBuffer += value;
      } else {
        // we received a \n, lets parse the String
        // of data to JSON
        const remainder = split(value, "\n");
        theState.readBuffer += remainder[0];
        parseStringToJSON(theState.readBuffer).then((val) => {
          // here we are passing on the received
          // data to the sketch.
          // @TODO
          // check the received values against the previous
          // values, if there are no changes, then
          // retain from updating the sketch.
          if (val.value !== undefined) {
            theState.value = val.value || [];
            theState.id = val.id || -1;
            theState.debug.data = theState;
            const data = { id: theState.id, value: theState.value };
            theState.fn(data);
            theState.rxtxEvent(data);
          }
          theState.readBuffer = remainder.length != 1 ? remainder[1] : "";
        });
      }
    }
    if (done) {
      log("[readLoop] DONE", done);
      this.reader.releaseLock();
      break;
    }
  }
};

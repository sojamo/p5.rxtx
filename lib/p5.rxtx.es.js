const parseStringToJSON = async (theString) => {
  try {
    let json = JSON.parse(theString);
    return json;
  } catch (error) {
    return { id: -1 };
  }
};
const deepMerge = (target, source) => {
  for (const key2 in source) {
    if (source[key2] && typeof source[key2] === "object" && !Array.isArray(source[key2])) {
      target[key2] = deepMerge(target[key2] || {}, source[key2]);
    } else {
      target[key2] = source[key2];
    }
  }
  return target;
};
const updateState = (theState, updates) => {
  Object.assign(theState, updates);
};
const getFormattedTimeStamp = () => {
  let t = year() + nf(month(), 2) + nf(day(), 2);
  t += nf(hour(), 2) + nf(minute(), 2) + nf(second(), 2);
  return t;
};
const handleIncomingData = (value, theState) => {
  if (!value.includes("\n")) {
    theState.readBuffer += value;
    return;
  }
  const [data, remainder] = value.split("\n");
  theState.readBuffer += data;
  parseStringToJSON(theState.readBuffer).then((parsedData) => {
    if (parsedData.value !== void 0) {
      const { id, value: value2 } = parsedData;
      theState.debug.data = { value: value2, id };
      updateState(theState, {
        value: value2 || [],
        id: id || -1
        // debug: { data: theState }, // @TODO look into this assignment, overrides debug settings
      });
      theState.fn({ id: theState.id, value: theState.value });
      theState.rxtxEvent({ id: theState.id, value: theState.value });
    }
    theState.readBuffer = remainder || "";
  }).catch((err) => console.log("Error parsing data:", err));
};
const getAvailablePorts = async () => {
  if (!("serial" in navigator)) {
    throw new Error("Web Serial API not supported.");
  }
  return await navigator.serial.getPorts();
};
const reconnectToPreviouslyGrantedPorts = async (theState) => {
  const ports = await getAvailablePorts();
  console.log("trying to reconnect to previous ports", ports);
  for (const port of ports) {
    await connectToPort(port, theState);
  }
};
const checkPortConnectionFor = async (theState) => {
  theState.readBuffer = "";
  const ports = await getAvailablePorts();
  let port;
  if (ports.length === 0) {
    port = await selectPort();
  } else {
    port = ports[0];
  }
  return await connectToPort(port, theState);
};
const selectPort = async () => {
  try {
    const port = await navigator.serial.requestPort();
    return port;
  } catch (err) {
    console.log("Error selecting port:", err);
    return void 0;
  }
};
const connectToPort = async (thePort, theState) => {
  if (!thePort) {
    console.log("No port provided.");
    return false;
  }
  try {
    await thePort.open({ baudRate: theState.baudRate });
    const decoder = new TextDecoderStream();
    const inputDone = thePort.readable.pipeTo(decoder.writable);
    const reader = decoder.readable.getReader();
    const writer = thePort.writable.getWriter();
    theState.connectedPorts.push({ thePort, reader, writer });
    console.log("Serial communication established with", thePort.getInfo());
    updateState(theState, {
      connected: true,
      port: thePort,
      reader,
      writer,
      io: true
      // @TODO: Decide if io is redundant
    });
    await readFromPort(theState);
    return true;
  } catch (err) {
    console.log("Error connecting to port:", err);
    cleanupResources(thePort, theState).then(
      () => console.log("Resources cleaned up.")
    ).catch(console.error);
  }
  return false;
};
const readFromPort = async (theState) => {
  try {
    while (theState.connected) {
      const { value, done } = await theState.reader.read();
      if (done) break;
      if (value) handleIncomingData(value, theState);
    }
  } catch (err) {
    console.log("Error during read:", err);
    throw err;
  } finally {
    cleanupResources(theState.port, theState).then(
      () => console.log("Resources cleaned up.")
    ).catch(console.error);
  }
};
const cleanupResources = async (thePort, theState) => {
  try {
    if (theState.reader) {
      await theState.reader.cancel();
      theState.reader.releaseLock();
    }
    if (theState.writer) {
      await theState.writer.close();
      theState.writer.releaseLock();
    }
  } catch (err) {
    console.log("Error during cleanup:", err);
  }
};
const startRxtxWith = async (theState) => {
  const availablePorts = await getAvailablePorts();
  switch (availablePorts.length) {
    case 0:
      console.log("No previously granted ports detected, add connect button.");
      await addConnectButton(theState);
      break;
    default:
      console.log("Previously granted ports detected, wait to reconnect ..");
      try {
        await reconnectToPreviouslyGrantedPorts(theState);
      } catch (err) {
        console.log("couldn't reconnect to previously granted port(s).");
        await addConnectButton(theState);
      }
      break;
  }
  return theState;
};
const addConnectButton = async (theState) => {
  const button = createButton("connect");
  button.position(20, 20);
  button.style(`
    background: #03a1ff;
    color: #fff;
    font-size: 16px;
    margin: auto;
    border: 0;
    padding: 8px 32px;
    border-radius: 32px;
    transition: background 0.3s;
  `);
  button.mouseOver(() => button.style("background: #06b004;"));
  button.mouseOut(() => button.style("background: #03a1ff;"));
  button.mousePressed(async () => {
    theState.fn = (val) => {
    };
    button.remove();
    try {
      const isConnected = await checkPortConnectionFor(theState);
      if (!isConnected) addConnectButton(theState);
    } catch (err) {
      console.log(err);
    }
  });
};
const enterFullscreen = () => {
  var fs = fullscreen();
  if (!fs) {
    fullscreen(true);
  }
};
document.ontouchmove = (event) => {
  event.preventDefault();
};
const keyPressed = (theState) => {
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
const showRxtxDebug = (theState) => {
  if (theState.debug === void 0) return;
  if (theState.debug.print) {
    if (theState.debug.data.value == void 0) {
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
  v.forEach((v2, i) => {
    let v0 = constrain(v2, 0, 1);
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
const initWith = (theApp, theArgs, theState) => {
  const defaults = {
    baudRate: 57600,
    id: -1,
    value: [],
    fn: (ev) => {
    },
    image: {
      label: "rxtx",
      format: "jpg"
    },
    mappedKeys: ["d", "f", "p", "s"],
    debug: { print: false, show: false }
  };
  const internal = {
    debug: { data: {} },
    connected: false,
    io: null,
    isKeyPressed: false,
    rxtxEvent: theApp.rxtxEvent || ((ev) => {
    }),
    readBuffer: "",
    connectedPorts: []
  };
  updateState(theState, deepMerge(deepMerge(defaults, theArgs), internal));
  startRxtxWith(theState);
};
const environmentCheck = (theInstance, theState) => {
  (function(global) {
    if (global.p5) {
      global.p5.prototype.windowResized = () => {
        resizeCanvas(windowWidth, windowHeight);
      };
      global.p5.prototype.registerMethod("post", () => keyPressed(theState));
      global.p5.prototype.registerMethod("post", () => showRxtxDebug(theState));
    } else {
      console.error(
        "p5.js not found. Please include p5.js before this library."
      );
    }
  })(theInstance);
};
const state = {};
const connect = async (theApp, theArgs = {}) => {
  initWith(theApp, theArgs, state);
};
const isValuesAvailable = () => {
  return state.debug.data.value == void 0 ? false : true;
};
const isConnectionEstablished = () => {
  return state.connected;
};
const isReadyToWrite = () => {
  return state.io != null;
};
const getValueAt = (theIndex) => {
  const values = getValues();
  return theIndex >= values.length ? -1 : values[theIndex];
};
const getValues = () => {
  return state.value || [];
};
environmentCheck(window, state);
export {
  connect,
  getValueAt,
  getValues,
  isConnectionEstablished,
  isReadyToWrite,
  isValuesAvailable
};
//# sourceMappingURL=p5.rxtx.es.js.map

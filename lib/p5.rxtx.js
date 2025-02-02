var rxtx = function(exports) {
  "use strict";
  const parseStringToJSON = async (theString) => {
    try {
      let json = JSON.parse(theString);
      return json;
    } catch (error) {
      return { id: -1, value: [], type: "error" };
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
  const utf8EncodeText = new TextEncoder();
  const rxtxSendTo = async (theState, theString) => {
    if (!(theState == null ? void 0 : theState.port)) return false;
    await theState.writer.write(checkRxtxData(theString));
    return true;
  };
  const checkRxtxData = (theData) => {
    return utf8EncodeText.encode(theData);
  };
  const handleIncomingData = (value2, theState) => {
    if (!value2.includes("\n")) {
      theState.readBuffer += value2;
      return;
    }
    const [data, remainder] = value2.split("\n");
    theState.readBuffer += data;
    parseStringToJSON(theState.readBuffer).then((parsedData) => {
      if (parsedData.value !== void 0) {
        const { id, value: value3 } = parsedData;
        theState.debug.data = { value: value3, id };
        updateState(theState, {
          value: value3 || [],
          id: id || -1
          // debug: { data: theState }, // @TODO look into this assignment, overrides debug settings
        });
        theState.rxtxEvent({
          id: theState.id,
          value: theState.value,
          getValueAt: (theIndex) => theState.value[theIndex]
        });
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
    console.log("trying to reconnect to previous port(s)", ports);
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
      port = ports.length > 0 ? ports[0] : null;
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
    } catch (err) {
      console.log("Error connecting to port:", err);
      cleanupResources(thePort, theState).then(
        () => console.log("Resources cleaned up.")
      ).catch(console.error);
      updateState(theState, {
        connected: false,
        port: thePort,
        reader: null,
        writer: null,
        io: false
        // @TODO: Decide if io is redundant
      });
      throw new Error("Failed to connect");
    }
    await readFromPort(theState);
    return false;
  };
  const readFromPort = async (theState) => {
    try {
      while (theState.connected) {
        const { value: value2, done } = await theState.reader.read();
        if (done) break;
        if (value2) handleIncomingData(value2, theState);
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
          await addConnectButton(theState, false);
        }
        break;
    }
    return theState;
  };
  const addConnectButton = async (theState, available = true) => {
    const label = available ? "connect" : "unavailable";
    const col = available ? ["#03a1ff", "#06b004"] : ["#ffa103", "#666666"];
    const button = createButton(label);
    button.position(20, 20);
    button.style(`
    background: ${col[0]};
    color: #fff;
    font-size: 16px;
    margin: auto;
    border: 0;
    padding: 8px 32px;
    border-radius: 32px;
    transition: background 0.3s;
  `);
    button.mouseOver(() => button.style(`background: ${col[1]};`));
    button.mouseOut(() => button.style(`background: ${col[0]};`));
    button.mousePressed(async () => {
      button.remove();
      try {
        await checkPortConnectionFor(theState);
      } catch (err) {
        console.log(`port is busy, ${err.message}`);
        addConnectButton(theState, false);
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
  const VERSION = "0.1.1";
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
          case "v":
            console.log(`p5.rxtx ${VERSION} by sojamo`);
            break;
        }
      }
    } else {
      theState.isKeyPressed = false;
    }
  };
  const showRxtxDebug = (theState) => {
    if (theState.debug === void 0) return;
    handleDebugPrinting(theState);
    if (!theState.debug.show || !theState.debug.data.value) return;
    const dimensions = calculateDebugDimensions(theState.debug.data.value.length);
    updateRanges(theState);
    const layer = createOrUpdateDebugLayer(theState, dimensions);
    drawDebug(theState, layer, dimensions);
  };
  const handleDebugPrinting = (theState) => {
    if (!theState.debug.print) return;
    if (theState.debug.data.value == void 0) {
      console.log("debug.print, no data present yet.");
    } else {
      console.log(theState.debug.data.value);
    }
  };
  const calculateDebugDimensions = (theValueCount) => {
    const spacing = 20;
    const header = 40;
    const footer = 20;
    return {
      width: 400,
      height: header + theValueCount * spacing + footer,
      spacing,
      header,
      footer,
      barLength: 300
    };
  };
  const updateRanges = (theState) => {
    const values = theState.debug.data.value;
    const r0 = theState.range || [];
    theState.range = updateRangeFor(values, r0);
    values.forEach((v0, i) => {
      theState.range[i].min = v0 < theState.range[i].min ? v0 : theState.range[i].min;
      theState.range[i].max = v0 > theState.range[i].max ? v0 : theState.range[i].max;
    });
  };
  const createOrUpdateDebugLayer = (theState, theDimensions) => {
    if (!theState.debug.layer) {
      theState.debug.layer = createGraphics(
        theDimensions.width,
        theDimensions.height
      );
      theState.debug.layer.clear();
    }
    return theState.debug.layer;
  };
  const drawDebug = (theState, theLayer, theDimensions) => {
    drawBackground(theLayer, theDimensions);
    drawHeader(theLayer, theState.debug.data.id);
    drawValueBars(
      theLayer,
      theState.debug.data.value,
      theState.range,
      theDimensions
    );
    renderFinalOutput(theLayer, isWebGLContext());
  };
  const drawBackground = (theLayer, theDimensions) => {
    theLayer.clear();
    theLayer.noStroke();
    theLayer.fill(0, 40);
    theLayer.rect(0, 0, theDimensions.width, theDimensions.height, 16);
  };
  const drawHeader = (theLayer, theDeviceId) => {
    theLayer.push();
    theLayer.translate(20, 20);
    theLayer.fill(255);
    theLayer.text(`Device ${theDeviceId}`, 0, 0);
    theLayer.pop();
  };
  const drawValueBars = (theLayer, theValue, theRanges, theDimensions) => {
    theLayer.push();
    theLayer.translate(20, 40);
    theValue.forEach((value2, i) => {
      const mappedValue = map(value2, theRanges[i].min, theRanges[i].max, 0, 1);
      theLayer.push();
      theLayer.translate(0, i * theDimensions.spacing);
      theLayer.fill(255, 40);
      theLayer.rect(0, 0, theDimensions.barLength, 10, 4);
      theLayer.fill(255, 200);
      theLayer.rect(0, 2, mappedValue * theDimensions.barLength, 8, 4);
      theLayer.fill(255);
      theLayer.text(value2.toFixed(2), theDimensions.barLength + 20, 10);
      theLayer.pop();
    });
    theLayer.pop();
  };
  const renderFinalOutput = (theLayer, isWebGL) => {
    push();
    if (isWebGL) {
      translate(-width / 2, -height / 2);
    }
    translate(20, 20);
    image(theLayer, 0, 0);
    pop();
  };
  const isWebGLContext = () => {
    return drawingContext instanceof WebGLRenderingContext || drawingContext instanceof WebGL2RenderingContext;
  };
  const updateRangeFor = (theValue, theRange) => {
    const valueDiff = theValue.length - theRange.length;
    if (valueDiff > 0) {
      const newElements = Array(valueDiff).fill().map(() => ({ min: 0, max: 1 }));
      theRange = [...theRange, ...newElements];
    } else if (valueDiff < 0) {
      theRange = theRange.slice(0, value.length);
    }
    return theRange;
  };
  const initWith = (theApp, theArgs, theState) => {
    const defaults = {
      baudRate: 57600,
      id: -1,
      value: [],
      range: [],
      image: {
        label: "rxtx",
        format: "jpg"
      },
      mappedKeys: ["d", "f", "p", "s", "v"],
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
  const isReadyToSend = () => {
    return state.io != null;
  };
  const getValueAt = (theIndex) => {
    const values = getValues();
    return theIndex >= values.length ? -1 : values[theIndex];
  };
  const getValues = () => {
    return state.value || [];
  };
  const send = (theJSONformattedData) => {
    const str = JSON.stringify(theJSONformattedData);
    rxtxSendTo(state, str);
  };
  environmentCheck(window, state);
  exports.connect = connect;
  exports.getValueAt = getValueAt;
  exports.getValues = getValues;
  exports.isConnectionEstablished = isConnectionEstablished;
  exports.isReadyToSend = isReadyToSend;
  exports.isValuesAvailable = isValuesAvailable;
  exports.send = send;
  Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
  return exports;
}({});
//# sourceMappingURL=p5.rxtx.js.map

var rxtx = function(exports) {
  "use strict";
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
  const showRxtxDebug = (theState) => {
    if (theState.debug.print) {
      if (theState.debug.data.value == void 0) {
        log$1("debug.print, no data present yet.");
      } else {
        log$1(theState.debug.data.value);
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
    }
    push();
    if (isWEBGL) {
      translate(-width / 2, -height / 2);
    }
    translate(20, 20);
    image(theState.debug.layer, 0, 0);
    pop();
  };
  const log$1 = (...args) => {
    console.log("rxtx debug : ", args.join(" "));
  };
  const startRxtxWith = async (theState) => {
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
      await thePort.open({ baudRate: theState.baudRate });
      const decoder = new TextDecoderStream();
      const inputDone = thePort.readable.pipeTo(decoder.writable);
      const reader = decoder.readable.getReader();
      const writer = thePort.writable.getWriter();
      connectedPorts.push({ thePort, reader, writer });
      log$1("Serial communication established with ", thePort.getInfo());
      Object.assign(theState, {
        connected: true,
        port: thePort,
        reader,
        writer,
        io: true
        // @TODO: Decide if io is redundant
      });
      readFromPort(theState);
      return { inputDone };
    } catch (error) {
      log$1("Error connecting to port:", error);
      throw error;
    }
  };
  const reconnectToPreviouslyGrantedPorts = async (theState) => {
    const ports = await navigator.serial.getPorts();
    console.log("trying to reconnect to previous ports", ports);
    for (const port of ports) {
      await connectToPort(port, theState);
    }
  };
  const readFromPort = async (theState) => {
    while (true) {
      const { value, done } = await theState.reader.read();
      if (value) {
        if (!value.includes("\n")) {
          theState.readBuffer += value;
        } else {
          const remainder = split(value, "\n");
          theState.readBuffer += remainder[0];
          parseStringToJSON(theState.readBuffer).then((val) => {
            if (val.value !== void 0) {
              theState.value = val.value || [];
              theState.id = val.id || -1;
              theState.debug.data = theState;
              const data = { "id": theState.id, "value": theState.value };
              theState.fn(data);
              theState.rxtxEvent(data);
            }
            theState.readBuffer = remainder.length != 1 ? remainder[1] : "";
          });
        }
      }
      if (done) {
        log$1("[readLoop] DONE", done);
        (void 0).reader.releaseLock();
        break;
      }
    }
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
      debug: { print: false, show: false }
    };
    const internal = {
      debug: { data: {} },
      connected: false,
      io: null,
      isKeyPressed: false,
      rxtxEvent: theApp.rxtxEvent || ((ev) => {
      }),
      readBuffer: ""
    };
    Object.assign(theState, deepMerge(deepMerge(defaults, theArgs), internal));
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
        console.error("p5.js not found. Please include p5.js before this library.");
      }
    })(theInstance);
  };
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
  const state = {};
  environmentCheck(window, state);
  exports.connect = connect;
  exports.getValueAt = getValueAt;
  exports.getValues = getValues;
  exports.isConnectionEstablished = isConnectionEstablished;
  exports.isReadyToSend = isReadyToSend;
  exports.isValuesAvailable = isValuesAvailable;
  Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
  return exports;
}({});
//# sourceMappingURL=p5.rxtx.js.map

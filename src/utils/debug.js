/**
 * Main debug information display handler for rxtx state
 * @param {Object} theState - The state object containing debug information
 */
export const showRxtxDebug = (theState) => {
  if (theState.debug === undefined) return;

  handleDebugPrinting(theState);
  if (!theState.debug.show || !theState.debug.data.value) return;

  const dimensions = calculateDebugDimensions(theState.debug.data.value.length);
  updateRanges(theState);

  const layer = createOrUpdateDebugLayer(theState, dimensions);
  drawDebug(theState, layer, dimensions);
};

/**
 * Handles console logging of debug data
 * @param {Object} theState - The state object
 */
const handleDebugPrinting = (theState) => {
  if (!theState.debug.print) return;

  if (theState.debug.data.value == undefined) {
    console.log("debug.print, no data present yet.");
  } else {
    console.log(theState.debug.data.value);
  }
};

/**
 * Calculates dimensions for debug visualization
 * @param {number} theValueCount - Number of values to display
 * @returns {Object} Width, height, and layout parameters
 */
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
    barLength: 300,
  };
};

/**
 * Updates value ranges in the state
 * @param {Object} theState - The state object
 */
const updateRanges = (theState) => {
  const values = theState.debug.data.value;
  const r0 = theState.range || [];
  theState.range = updateRangeFor(values, r0);

  values.forEach((v0, i) => {
    theState.range[i].min = v0 < theState.range[i].min
      ? v0
      : theState.range[i].min;
    theState.range[i].max = v0 > theState.range[i].max
      ? v0
      : theState.range[i].max;
  });
};

/**
 * Creates or updates the graphics layer for debug visualization
 * @param {Object} theState - The state object
 * @param {Object} theDimensions - Layout dimensions
 * @returns {Object} Graphics layer
 */
const createOrUpdateDebugLayer = (theState, theDimensions) => {
  if (!theState.debug.layer) {
    theState.debug.layer = createGraphics(
      theDimensions.width,
      theDimensions.height,
    );
    theState.debug.layer.clear();
  }
  return theState.debug.layer;
};

/**
 * Draws the debug visualization
 * @param {Object} theState - The state object
 * @param {Object} theLayer - Graphics layer to draw on
 * @param {Object} theDimensions - Layout dimensions
 */
const drawDebug = (theState, theLayer, theDimensions) => {
  drawBackground(theLayer, theDimensions);
  drawHeader(theLayer, theState.debug.data.id);
  drawValueBars(
    theLayer,
    theState.debug.data.value,
    theState.range,
    theDimensions,
  );
  renderFinalOutput(theLayer, isWebGLContext());
};

/**
 * Draws the background for debug visualization
 * @param {Object} theLayer - Graphics layer to draw on
 * @param {Object} theDimensions - Layout dimensions
 */
const drawBackground = (theLayer, theDimensions) => {
  theLayer.clear();
  theLayer.noStroke();
  theLayer.fill(0, 40);
  theLayer.rect(0, 0, theDimensions.width, theDimensions.height, 16);
};

/**
 * Draws the header with device ID
 * @param {Object} theLayer - Graphics layer to draw on
 * @param {string} theDeviceId - Device identifier
 */
const drawHeader = (theLayer, theDeviceId) => {
  theLayer.push();
  theLayer.translate(20, 20);
  theLayer.fill(255);
  theLayer.text(`Device ${theDeviceId}`, 0, 0);
  theLayer.pop();
};

/**
 * Draws the value bars with their corresponding numbers
 * @param {Object} theLayer - Graphics layer to draw on
 * @param {Array} theValue - Array of values to visualize
 * @param {Array} theRanges - Array of min/max ranges for each value
 * @param {Object} theDimensions - Layout dimensions
 */
const drawValueBars = (theLayer, theValue, theRanges, theDimensions) => {
  theLayer.push();
  theLayer.translate(20, 40); // Offset after header

  theValue.forEach((value, i) => {
    const mappedValue = map(value, theRanges[i].min, theRanges[i].max, 0, 1);

    theLayer.push();
    theLayer.translate(0, i * theDimensions.spacing);

    // Background bar
    theLayer.fill(255, 40);
    theLayer.rect(0, 0, theDimensions.barLength, 10, 4);

    // Value bar
    theLayer.fill(255, 200);
    theLayer.rect(0, 2, mappedValue * theDimensions.barLength, 8, 4);

    // Value text
    theLayer.fill(255);
    theLayer.text(value.toFixed(2), theDimensions.barLength + 20, 10);

    theLayer.pop();
  });

  theLayer.pop();
};

/**
 * Renders the final output to the screen
 * @param {Object} theLayer - Graphics layer to render
 * @param {boolean} isWebGL - Whether we're in WebGL mode
 */
const renderFinalOutput = (theLayer, isWebGL) => {
  push();

  if (isWebGL) {
    translate(-width / 2, -height / 2);
  }

  translate(20, 20);
  image(theLayer, 0, 0);

  pop();
};

/**
 * Checks if current context is WebGL
 * @returns {boolean} True if WebGL context
 */
const isWebGLContext = () => {
  return drawingContext instanceof WebGLRenderingContext ||
    drawingContext instanceof WebGL2RenderingContext;
};

/**
 * Synchronizes the range array size with the value array size.
 * Adds or removes elements from the range array to match the value array length.
 * New range elements are initialized with {min: 0, max: 1}.
 *
 * @param {Array} theValue - Source array to match length against
 * @param {Array} theRange - Target array to be resized
 * @returns {Array} Updated range array with matching length
 *
 * Example:
 * If theValue.length = 3 and theRange.length = 1
 * Result: theRange will be expanded to length 3 with new {min:0, max:1} elements
 */
const updateRangeFor = (theValue, theRange) => {
  const valueDiff = theValue.length - theRange.length;

  if (valueDiff > 0) {
    // Add new elements to range
    const newElements = Array(valueDiff).fill().map(() => ({ min: 0, max: 1 }));
    theRange = [...theRange, ...newElements];
  } else if (valueDiff < 0) {
    // Remove excess elements from range
    theRange = theRange.slice(0, value.length);
  }
  return theRange;
};

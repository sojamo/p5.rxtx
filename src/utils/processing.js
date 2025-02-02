/**
 * Parses a JSON string and returns the resulting object.
 * If parsing fails, it returns a default object with an `id` of -1.
 *
 * @param {string} theString - The JSON string to be parsed.
 * @returns {Object} - The parsed JSON object, or a default object 
 * if parsing fails.
 */
export const parseStringToJSON = async (theString) => {
  try {
    let json = JSON.parse(theString);
    return json;
  } catch (error) {
    return { id: -1, value: [], type: "error" };
  }
};

/**
 * Parses a string into an array of numbers or a single floating-point 
 * number. If the string starts with '[', it is treated as a comma-separated 
 * list of numbers. Otherwise, the string is parsed as a single float.
 *
 * @param {string} theData - The input string to be parsed.
 * @returns {number[]|number} - An array of numbers if the input represents a 
 * list, or a single floating-point number if it does not.
 *
 * @example
 * parseStringToArray("[1, 2, 3]"); // Returns [1, 2, 3]
 * parseStringToArray("42.5");     // Returns 42.5
 */
export const parseStringToArray = (theData) => {
  if (theData.charAt(0) == "[") {
    let str0 = theData;
    let str1 = str0.trim().replace(/[`\[\]\\\/]/gi, "");
    let arr0 = str1.split(",");
    let arr1 = arr0.map(Number);
    return arr1;
  } else {
    // @TODO do we want that here or should this default
    // to an array with a single element.
    return float(theData);
  }
};

/**
 * Converts a string to an ArrayBuffer.
 *
 * This function takes a string and encodes it into an ArrayBuffer where each 
 * character is represented by 2 bytes (UTF-16). The resulting ArrayBuffer can 
 * be used for binary data manipulation.
 *
 * @param {string} theString - The input string to be converted.
 * @returns {ArrayBuffer} The resulting ArrayBuffer containing the encoded string.
 *
 * Example:
 * const buffer = str2ab("hello");
 * console.log(buffer); // ArrayBuffer { byteLength: 10 }
 */
export const str2ab = (theString) => {
  var buf = new ArrayBuffer(theString.length * 2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i = 0, strLen = theString.length; i < strLen; i++) {
    bufView[i] = theString.charCodeAt(i);
  }
  return buf;
};

/**
 * Recursively merges the properties of a source object into a target object.
 * If a property in the source is an object, it performs a deep merge. Arrays
 * are not deeply merged but overwritten. The target object is modified and
 * returned.
 *
 * @param {Object} target - The object to receive properties from the source.
 * @param {Object} source - The object whose properties are merged into the
 * target.
 * @returns {Object} - The modified target object after merging.
 *
 * @example
 * const target = { a: 1, b: { c: 2 } };
 * const source = { b: { d: 3 }, e: 4 };
 * const result = deepMerge(target, source);
 * console.log(result); // { a: 1, b: { c: 2, d: 3 }, e: 4 }
 */
export const deepMerge = (target, source) => {
  for (const key in source) {
    if (
      source[key] && typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      target[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
};

/**
 * Updates the given state object with new properties.
 * 
 * This function merges the `updates` object into `theState` using
 * shallow copying. Existing properties in `theState` are overwritten 
 * if they exist in `updates`, while new properties are added.
 * 
 * @param {Object} theState - The state object to update.
 * @param {Object} updates - The object containing properties to merge
 *                           into the state.
 * 
 * @example
 * const state = { a: 1, b: 2 };
 * updateState(state, { b: 3, c: 4 });
 * console.log(state); // { a: 1, b: 3, c: 4 }
 */
export const updateState = (theState, updates) => {
  Object.assign(theState, updates);
};

/**
 * Generates a formatted timestamp string.
 *
 * This function constructs a timestamp in the format `YYYYMMDDHHmmSS` using
 * the current date and time. Each component (month, day, hour, minute, and
 * second) is zero-padded to ensure a consistent two-digit format.
 *
 * @returns {string} A timestamp string in the format `YYYYMMDDHHmmSS`.
 *
 * Example:
 *   If the current date and time is December 1, 2023, 15:05:09, the output
 *   will be: "20231201150509".
 */
export const getFormattedTimeStamp = () => {
  let t = year() + nf(month(), 2) + nf(day(), 2);
  t += nf(hour(), 2) + nf(minute(), 2) + nf(second(), 2);
  return t;
};

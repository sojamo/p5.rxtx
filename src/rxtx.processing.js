export const parseStringToJSON = async (theString) => {
  try {
    let json = JSON.parse(theString);
    return json;
  } catch (error) {
    return { id: -1 };
  }
}

export const parseStringToArray = (theData) => {
  if (theData.charAt(0) == "[") {
    let str0 = theData;
    let str1 = str0.trim().replace(/[`\[\]\\\/]/gi, "");
    let arr0 = str1.split(",");
    let arr1 = arr0.map(Number);
    return arr1;
  } else {
    return float(theData);
  }
}

export const str2ab = (theString) => {
  var buf = new ArrayBuffer(theString.length * 2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i = 0, strLen = theString.length; i < strLen; i++) {
    bufView[i] = theString.charCodeAt(i);
  }
  return buf;
}

export const deepMerge = (target, source) => {
  for (const key in source) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key])
    ) {
      target[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

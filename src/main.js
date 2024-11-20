import { environmentCheck, initWith } from "./rxtx.init";


/**
 * 
 * @param {*} theApp 
 * @param {*} theArgs 
 */
export const connect = (theApp, theArgs = {}) => {
  initWith(theApp, theArgs, state);
};


/**
 * 
 * @returns 
 */
export const isValuesAvailable = () => {
  return state.debug.data.value == undefined ? false : true;
};

/**
 * 
 * @returns 
 */
export const isConnectionEstablished = () => {
  return state.connected;
};

/**
 * 
 * @returns 
 */
export const isReadyToSend = () => {
  return state.io != null;
};

/**
 * 
 * @param {*} theIndex 
 * @returns 
 */
export const getValueAt = (theIndex) => {
  const values = getValues();
  return theIndex >= values.length ? -1 : values[theIndex];
};

/**
 * 
 * @returns 
 */
export const getValues = () => {
  return state.value || [];
};

const state = {};

environmentCheck(window, state)

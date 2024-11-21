/**
 * Toggles the application to enter fullscreen mode.
 *
 * This function checks if the application is not currently in fullscreen
 * mode using the `fullscreen()` function. If not in fullscreen, it switches
 * the application to fullscreen mode by setting `fullscreen(true)`.
 *
 * Note:
 * - This function assumes the presence of the `fullscreen()` utility, 
 *   provided by p5.js.
 */
export const enterFullscreen = () => {
  var fs = fullscreen();
  if (!fs) {
    fullscreen(true);
  }
};

/**
 * Prevents touch move events on the document.
 *
 * This function disables the default behavior of touch move events,
 * such as scrolling or panning, when a user drags their finger across
 * the screen. Useful for applications where touch gestures should be
 * intercepted or restricted.
 *
 * @param {TouchEvent} event - The touch event triggered by a user's interaction.
 */
document.ontouchmove = (event) => {
  event.preventDefault();
};
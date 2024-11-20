
export const enterFullscreen = () => {
  var fs = fullscreen();
  if (!fs) {
    fullscreen(true);
  }
}

document.ontouchmove = (event) => {
  event.preventDefault();
};


const nextFrame = window.requestAnimationFrame || ((callback) => window.setTimeout(callback, 0));
export default nextFrame;

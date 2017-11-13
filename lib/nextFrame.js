Object.defineProperty(exports, "__esModule", { value: true });
const nextFrame = window.requestAnimationFrame || ((callback) => window.setTimeout(callback, 0));
exports.default = nextFrame;

import { initCanvas, drawFrame } from './rendering/canvas.js';

const WIDTH = 800;
const HEIGHT = 600;

const canvasEl = document.getElementById('sim-canvas');
const ctx = initCanvas(canvasEl, WIDTH, HEIGHT);

function loop() {
  drawFrame(ctx, WIDTH, HEIGHT);
  requestAnimationFrame(loop);
}

loop();

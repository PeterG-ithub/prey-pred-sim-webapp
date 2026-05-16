import { initCanvas, drawFrame } from './rendering/canvas.js';
import { initUI } from './rendering/ui.js';

const BAR_H    = 68;
const PADDING  = 32; // 16px each side
const GRID_CELL = 40;

const canvasEl = document.getElementById('sim-canvas');

function snap(n) {
  return Math.floor(n / GRID_CELL) * GRID_CELL;
}

function computeSize() {
  const availW = window.innerWidth  - PADDING;
  const availH = window.innerHeight - BAR_H - PADDING;
  // keep a 4:3 aspect ratio, then snap both axes to grid
  const aspect = 4 / 3;
  let w = availW;
  let h = Math.round(w / aspect);
  if (h > availH) {
    h = availH;
    w = Math.round(h * aspect);
  }
  return { w: snap(w), h: snap(h) };
}

let { w, h } = computeSize();
const ctx = initCanvas(canvasEl, w, h);

initUI();

function loop() {
  drawFrame(ctx, w, h);
  requestAnimationFrame(loop);
}

loop();

window.addEventListener('resize', () => {
  ({ w, h } = computeSize());
  canvasEl.width  = w;
  canvasEl.height = h;
});

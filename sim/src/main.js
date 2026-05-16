import { initCanvas, drawFrame } from './rendering/canvas.js';
import { initUI, updateUI, getSpeed } from './rendering/ui.js';
import { Simulation } from './simulation.js';

const BAR_H     = 68;
const PADDING   = 32;
const GRID_CELL = 40;

const canvasEl = document.getElementById('sim-canvas');

function snap(n) {
  return Math.floor(n / GRID_CELL) * GRID_CELL;
}

function computeSize() {
  const panelOpen = document.getElementById('settings-panel').classList.contains('open');
  const panelW    = panelOpen ? 290 : 0;
  const availW    = window.innerWidth  - PADDING - panelW;
  const availH    = window.innerHeight - BAR_H   - PADDING;
  const aspect    = 4 / 3;
  let w = availW;
  let h = Math.round(w / aspect);
  if (h > availH) { h = availH; w = Math.round(h * aspect); }
  return { w: snap(w), h: snap(h) };
}

let { w, h } = computeSize();
const ctx = initCanvas(canvasEl, w, h);

let sim    = new Simulation(w, h);
let paused = true;

initUI({
  onPlay:    () => { paused = !paused; },
  onRestart: () => { sim = new Simulation(w, h); },
});

function loop() {
  if (!paused) sim.update(getSpeed() / 5);
  drawFrame(ctx, w, h, sim);
  updateUI(sim.stats());
  requestAnimationFrame(loop);
}

loop();

window.addEventListener('resize', () => {
  ({ w, h } = computeSize());
  canvasEl.width  = w;
  canvasEl.height = h;
  sim.width  = w;
  sim.height = h;
});

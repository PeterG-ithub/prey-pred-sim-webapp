import { initCanvas, drawFrame } from './rendering/canvas.js';
import { initUI, updateUI, getSpeed } from './rendering/ui.js';
import { Simulation } from './simulation.js';
import { drawGraph } from './rendering/graph.js';

const BAR_H     = 68;
const PADDING   = 32;
const PANEL_W   = 290;
const GRID_CELL = 40;

const canvasEl  = document.getElementById('sim-canvas');
const graphCanvas = document.getElementById('graph-canvas');

function snap(n) {
  return Math.floor(n / GRID_CELL) * GRID_CELL;
}

function computeSize() {
  const settingsOpen = document.getElementById('settings-panel').classList.contains('open');
  const graphOpen    = document.getElementById('graph-panel').classList.contains('open');
  const rightW = settingsOpen ? PANEL_W : 0;
  const leftW  = graphOpen   ? PANEL_W : 0;
  const availW = window.innerWidth  - PADDING - rightW - leftW;
  const availH = window.innerHeight - BAR_H   - PADDING;
  const aspect = 4 / 3;
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
  drawGraph(graphCanvas, sim.graphHistory);
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

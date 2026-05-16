const SAMPLE_INTERVAL = 10;
const MAX_SAMPLES     = 300;

const BG_COLOR   = '#0d0d14';
const GRID_COLOR = 'rgba(255, 255, 255, 0.05)';
const PREY_COLOR = '#60a5fa';
const PRED_COLOR = '#f87171';

export class GraphHistory {
  constructor() {
    this.samples = [];
    this._next   = 0;
  }

  record(tick, prey, predators) {
    if (tick < this._next) return;
    this._next = tick + SAMPLE_INTERVAL;
    this.samples.push({ prey, predators });
    if (this.samples.length > MAX_SAMPLES) this.samples.shift();
  }

  reset() { this.samples = []; this._next = 0; }
}

export function drawGraph(canvas, history) {
  if (!canvas) return;
  const ctx     = canvas.getContext('2d');
  const W       = canvas.width;
  const H       = canvas.height;
  const samples = history.samples;

  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, W, H);

  if (samples.length < 2) {
    ctx.fillStyle  = 'rgba(255,255,255,0.15)';
    ctx.font       = '10px monospace';
    ctx.textAlign  = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Waiting for data…', W / 2, H / 2);
    return;
  }

  const maxPop = Math.max(10, ...samples.map(s => Math.max(s.prey, s.predators)));
  const PAD_T  = 10;
  const PAD_B  = 6;
  const plotH  = H - PAD_T - PAD_B;

  const xOf = (i) => (i / (MAX_SAMPLES - 1)) * W;
  const yOf = (v) => PAD_T + plotH * (1 - v / maxPop);

  // Horizontal grid lines at 25 / 50 / 75 / 100 %
  ctx.strokeStyle = GRID_COLOR;
  ctx.lineWidth   = 1;
  for (let i = 1; i <= 4; i++) {
    const y = Math.round(yOf(maxPop * i / 4)) + 0.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // Max label
  ctx.fillStyle    = 'rgba(255,255,255,0.18)';
  ctx.font         = '9px monospace';
  ctx.textAlign    = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(maxPop, 3, PAD_T);

  // Draw a population line
  function drawLine(key, color) {
    const offset = MAX_SAMPLES - samples.length;
    ctx.strokeStyle = color;
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';
    ctx.beginPath();
    for (let i = 0; i < samples.length; i++) {
      const x = xOf(i + offset);
      const y = yOf(samples[i][key]);
      if (i === 0) ctx.moveTo(x, y);
      else         ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  drawLine('predators', PRED_COLOR);
  drawLine('prey',      PREY_COLOR);
}

const GRID_CELL  = 40;
const GRID_COLOR = 'rgba(255, 255, 255, 0.04)';
const BG_COLOR   = '#0d0d14';

export function initCanvas(canvasEl, width, height) {
  canvasEl.width  = width;
  canvasEl.height = height;
  return canvasEl.getContext('2d');
}

export function drawFrame(ctx, width, height, sim) {
  // Background
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, width, height);

  // Grass
  if (sim) drawGrass(ctx, sim.grass);

  // Grid overlay (on top so it stays readable)
  ctx.strokeStyle = GRID_COLOR;
  ctx.lineWidth   = 1;
  ctx.beginPath();
  for (let x = 0; x <= width; x += GRID_CELL) {
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, height);
  }
  for (let y = 0; y <= height; y += GRID_CELL) {
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(width, y + 0.5);
  }
  ctx.stroke();
}

function drawGrass(ctx, patches) {
  for (const g of patches) {
    const t    = g.amount;                  // 0 → 1
    const r    = 5 + t * 20;               // radius 5 → 25
    const glow = 8 + t * 20;               // glow 8 → 28

    const grad = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, r);
    grad.addColorStop(0,   `rgba(167, 243, 186, ${0.55 + t * 0.45})`);
    grad.addColorStop(0.45, `rgba(74,  222, 128, ${0.4  + t * 0.4})`);
    grad.addColorStop(1,   'rgba(22, 101, 52, 0)');

    ctx.save();
    ctx.shadowBlur  = glow;
    ctx.shadowColor = `rgba(74, 222, 128, ${0.25 + t * 0.35})`;
    ctx.fillStyle   = grad;
    ctx.beginPath();
    ctx.arc(g.x, g.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

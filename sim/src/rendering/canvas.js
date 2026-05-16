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

  if (sim) {
    drawGrass(ctx, sim.grass);
    drawPrey(ctx, sim.prey);
  }

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

function drawPrey(ctx, prey) {
  const BODY_R    = 5;
  const LINE_LEN  = 9;
  const BODY_COLOR = '#60a5fa';
  const LINE_COLOR = '#93c5fd';

  for (const p of prey) {
    const tipX = p.x + Math.cos(p.angle) * LINE_LEN;
    const tipY = p.y + Math.sin(p.angle) * LINE_LEN;

    // Direction line
    ctx.strokeStyle = LINE_COLOR;
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(tipX, tipY);
    ctx.stroke();

    // Body
    ctx.fillStyle = BODY_COLOR;
    ctx.beginPath();
    ctx.arc(p.x, p.y, BODY_R, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawGrass(ctx, patches) {
  for (const g of patches) {
    const t = g.amount;
    const r = 3 + t * 7;                          // radius 3 → 10
    const lightness = Math.round(22 + t * 28);    // 22% (dark) → 50% (bright)
    const alpha     = 0.4 + t * 0.6;              // 0.4 → 1.0

    ctx.fillStyle = `hsla(135, 60%, ${lightness}%, ${alpha})`;
    ctx.beginPath();
    ctx.arc(g.x, g.y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

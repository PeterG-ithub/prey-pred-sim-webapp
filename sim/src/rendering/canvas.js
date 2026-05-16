const GRID_CELL = 40;
const GRID_COLOR = 'rgba(255, 255, 255, 0.04)';
const BG_COLOR = '#0d0d14';

export function initCanvas(canvasEl, width, height) {
  canvasEl.width = width;
  canvasEl.height = height;
  return canvasEl.getContext('2d');
}

export function drawFrame(ctx, width, height) {
  // Background
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, width, height);

  // Subtle grid overlay
  ctx.strokeStyle = GRID_COLOR;
  ctx.lineWidth = 1;
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

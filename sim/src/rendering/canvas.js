import { TICKS_PER_YEAR } from '../entities/prey.js';
import { PRED_TICKS_PER_YEAR } from '../entities/predator.js';

const GRID_CELL  = 40;
const GRID_COLOR = 'rgba(255, 255, 255, 0.04)';
const BG_COLOR   = '#0d0d14';

const STATE_LABEL = { wander: 'WANDER', seek_food: 'SEEK FOOD', eat: 'EAT', seek_mate: 'SEEK MATE' };
const STATE_COLOR = { wander: '#5a5a7a', seek_food: '#fb923c', eat: '#4ade80', seek_mate: '#f472b6' };

export function initCanvas(canvasEl, width, height) {
  canvasEl.width  = width;
  canvasEl.height = height;
  return canvasEl.getContext('2d');
}

export function drawFrame(ctx, width, height, sim, inspected = null) {
  // Background
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, width, height);

  if (sim) {
    drawGrass(ctx, sim.grass);
    drawPrey(ctx, sim.prey);
    drawPredators(ctx, sim.predators);
    if (inspected) drawInspect(ctx, inspected, width, height);
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

const LINE_STATE_COLOR = {
  wander:    null,          // default to sex colour
  seek_food: '#fb923c',     // orange
  eat:       '#4ade80',     // green
  seek_mate: '#e879f9',     // purple
};

const PRED_LINE_COLOR = {
  wander:    '#a16207',     // dark yellow
  seek_prey: '#ef4444',     // red
  eat:       '#f97316',     // orange (feeding)
  seek_mate: '#e879f9',     // purple
};

function drawPrey(ctx, prey) {
  const BODY_R   = 5;
  const LINE_LEN = 9;

  for (const p of prey) {
    const isMale    = p.sex === 'M';
    const bodyColor = isMale ? '#60a5fa' : '#f472b6';
    const lineColor = LINE_STATE_COLOR[p.state] ?? (isMale ? '#93c5fd' : '#f9a8d4');

    const tipX = p.x + Math.cos(p.angle) * LINE_LEN;
    const tipY = p.y + Math.sin(p.angle) * LINE_LEN;

    ctx.strokeStyle = lineColor;
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(tipX, tipY);
    ctx.stroke();

    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(p.x, p.y, BODY_R, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawGrass(ctx, patches) {
  for (const g of patches) {
    if (g.amount <= 0.08) continue;
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

function drawPredators(ctx, predators) {
  const BODY_R   = 7;
  const LINE_LEN = 11;

  for (const d of predators) {
    const bodyColor = d.sex === 'M' ? '#fde047' : '#fb923c';
    const lineColor = PRED_LINE_COLOR[d.state] ?? '#a16207';

    const tipX = d.x + Math.cos(d.angle) * LINE_LEN;
    const tipY = d.y + Math.sin(d.angle) * LINE_LEN;

    ctx.strokeStyle = lineColor;
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.moveTo(d.x, d.y);
    ctx.lineTo(tipX, tipY);
    ctx.stroke();

    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(d.x, d.y, BODY_R, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawInspect(ctx, { type, entity }, W, H) {
  if (type === 'prey' && entity.dead) return;
  if (type === 'grass' && entity.amount <= 0) return;

  const ex = entity.x, ey = entity.y;

  // Target line
  const target = type === 'prey' ? (entity.targetGrass || entity.targetMate) : null;
  if (target) {
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(target.x, target.y);
    ctx.stroke();
    ctx.setLineDash([]);
    // Target ring
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(target.x, target.y, 14, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Highlight ring around selected entity
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.arc(ex, ey, type === 'prey' ? 11 : 14, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

}

export function inspectLines({ type, entity }) {
  return type === 'prey'     ? _preyLines(entity)
       : type === 'predator' ? _predLines(entity)
       : _grassLines(entity);
}

function _preyLines(p) {
  const state  = p.state;
  const sexSym = p.sex === 'M' ? '♂' : '♀';
  const energy = Math.round(p.energy);
  const bar    = _bar(p.energy / 100, 8);
  const yrs    = (p.age / TICKS_PER_YEAR).toFixed(1);
  return [
    { text: `${sexSym} PREY`,                         color: p.sex === 'M' ? '#60a5fa' : '#f472b6' },
    { text: `state   ${STATE_LABEL[state] ?? state}`, color: STATE_COLOR[state] ?? '#c0c0d8' },
    { text: `energy  ${bar} ${energy}%`,              color: '#c0c0d8' },
    { text: `age     ${yrs} yrs`,                     color: '#7a7a9a' },
  ];
}

const PRED_STATE_LABEL = { wander: 'WANDER', seek_prey: 'SEEK PREY', eat: 'EAT', seek_mate: 'SEEK MATE' };
const PRED_STATE_COLOR = { wander: '#a16207', seek_prey: '#ef4444', eat: '#f97316', seek_mate: '#e879f9' };

function _predLines(d) {
  const sexSym = d.sex === 'M' ? '♂' : '♀';
  const bar    = _bar(d.energy / 100, 8);
  const yrs    = (d.age / PRED_TICKS_PER_YEAR).toFixed(1);
  return [
    { text: `${sexSym} PREDATOR`,                              color: d.sex === 'M' ? '#fde047' : '#fb923c' },
    { text: `state   ${PRED_STATE_LABEL[d.state] ?? d.state}`, color: PRED_STATE_COLOR[d.state] ?? '#c0c0d8' },
    { text: `energy  ${bar} ${Math.round(d.energy)}%`,         color: '#c0c0d8' },
    { text: `age     ${yrs} yrs`,                              color: '#7a7a9a' },
  ];
}

function _grassLines(g) {
  const pct = Math.round(g.amount * 100);
  const bar = _bar(g.amount, 8);
  return [
    { text: 'GRASS',                    color: '#4ade80' },
    { text: `amount  ${bar} ${pct}%`,   color: '#86efac' },
  ];
}

function _bar(frac, cells) {
  const filled = Math.round(Math.min(1, Math.max(0, frac)) * cells);
  return '█'.repeat(filled) + '░'.repeat(cells - filled);
}


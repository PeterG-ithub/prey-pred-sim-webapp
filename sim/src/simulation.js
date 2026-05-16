import { Grass } from './entities/grass.js';

const GROWTH_RATE       = 0.0025;
const SPREAD_THRESHOLD  = 0.85;
const SPREAD_CHANCE     = 0.0018;
const SPREAD_RADIUS     = 80;
const RANDOM_SPAWN_CHANCE = 0.004;
const MIN_PATCH_DIST    = 28;
const MAX_PATCHES       = 200;
const INITIAL_PATCHES   = 65;

export class Simulation {
  constructor(width, height) {
    this.width  = width;
    this.height = height;
    this.grass  = [];
    this.tick   = 0;
    this._initGrass();
  }

  _initGrass() {
    for (let i = 0; i < INITIAL_PATCHES; i++) {
      const x      = Math.random() * this.width;
      const y      = Math.random() * this.height;
      const amount = Math.random() * 0.75 + 0.05;
      this.grass.push(new Grass(x, y, amount));
    }
  }

  update(speedMult = 1) {
    this.tick++;
    const rate     = GROWTH_RATE * speedMult;
    const newBatch = [];

    for (const g of this.grass) {
      g.amount = Math.min(1, g.amount + rate);

      if (
        g.amount >= SPREAD_THRESHOLD &&
        this.grass.length + newBatch.length < MAX_PATCHES &&
        Math.random() < SPREAD_CHANCE * speedMult
      ) {
        const angle = Math.random() * Math.PI * 2;
        const dist  = 20 + Math.random() * SPREAD_RADIUS;
        const nx    = g.x + Math.cos(angle) * dist;
        const ny    = g.y + Math.sin(angle) * dist;

        if (nx > 0 && nx < this.width && ny > 0 && ny < this.height) {
          if (this._clearZone(nx, ny, newBatch)) {
            newBatch.push(new Grass(nx, ny, 0.05));
          }
        }
      }
    }

    if (
      this.grass.length + newBatch.length < MAX_PATCHES &&
      Math.random() < RANDOM_SPAWN_CHANCE * speedMult
    ) {
      const x = Math.random() * this.width;
      const y = Math.random() * this.height;
      if (this._clearZone(x, y, newBatch)) {
        newBatch.push(new Grass(x, y, 0.05));
      }
    }

    for (const g of newBatch) this.grass.push(g);
  }

  _clearZone(x, y, extras = []) {
    const minD2 = MIN_PATCH_DIST * MIN_PATCH_DIST;
    for (const g of this.grass) {
      if ((g.x - x) ** 2 + (g.y - y) ** 2 < minD2) return false;
    }
    for (const g of extras) {
      if ((g.x - x) ** 2 + (g.y - y) ** 2 < minD2) return false;
    }
    return true;
  }

  stats() {
    return { grass: this.grass.length, prey: 0, predators: 0, tick: this.tick };
  }
}

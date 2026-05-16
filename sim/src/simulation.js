import { Grass } from './entities/grass.js';
import { config, toGrowthRate, toSpreadChance } from './config.js';

const SPREAD_THRESHOLD    = 0.85;
const SPREAD_RADIUS       = 80;
const RANDOM_SPAWN_CHANCE = 0.004;
const MIN_PATCH_DIST      = 28;

export class Simulation {
  constructor(width, height) {
    this.width  = width;
    this.height = height;
    this.grass  = [];
    this.tick   = 0;
    this._initGrass();
  }

  _initGrass() {
    for (let i = 0; i < config.initialGrass; i++) {
      const x      = Math.random() * this.width;
      const y      = Math.random() * this.height;
      const amount = Math.random() * 0.75 + 0.05;
      this.grass.push(new Grass(x, y, amount));
    }
  }

  update(speedMult = 1) {
    this.tick++;
    const rate        = toGrowthRate(config.growthSpeed) * speedMult;
    const spreadChance = toSpreadChance(config.spreadSpeed) * speedMult;
    const max         = config.maxPatches;
    const newBatch    = [];

    for (const g of this.grass) {
      g.amount = Math.min(1, g.amount + rate);

      if (
        g.amount >= SPREAD_THRESHOLD &&
        this.grass.length + newBatch.length < max &&
        Math.random() < spreadChance
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
      this.grass.length + newBatch.length < max &&
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

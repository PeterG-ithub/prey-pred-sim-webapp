import { Grass } from './entities/grass.js';
import { Prey, LIFESPAN, ADULT_AGE, METABOLISM, MAX_ENERGY, EAT_RADIUS,
         SENSE_RADIUS, EAT_RATE, ENERGY_PER_BITE, REPRO_ENERGY,
         REPRO_COST, REPRO_COOLDOWN, WANDER_TURN, SEEK_TURN, PREY_SPEED } from './entities/prey.js';
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
    this.prey   = [];
    this.tick   = 0;
    this._initGrass();
    this._initPrey();
  }

  // ── Init ──────────────────────────────────────────────────────────────
  _initGrass() {
    for (let i = 0; i < config.initialGrass; i++) {
      this.grass.push(new Grass(
        Math.random() * this.width,
        Math.random() * this.height,
        Math.random() * 0.75 + 0.05,
      ));
    }
  }

  _initPrey() {
    for (let i = 0; i < config.initialPrey; i++) {
      this.prey.push(new Prey(
        Math.random() * this.width,
        Math.random() * this.height,
      ));
    }
  }

  // ── Main update ───────────────────────────────────────────────────────
  update(speedMult = 1) {
    this.tick++;
    this._updateGrass(speedMult);
    this._updatePrey(speedMult);
  }

  // ── Grass ─────────────────────────────────────────────────────────────
  _updateGrass(speedMult) {
    const rate         = toGrowthRate(config.growthSpeed) * speedMult;
    const spreadChance = toSpreadChance(config.spreadSpeed) * speedMult;
    const max          = config.maxPatches;
    const newBatch     = [];

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
    this.grass = this.grass.filter(g => g.amount > 0);
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

  // ── Prey ──────────────────────────────────────────────────────────────
  _updatePrey(speedMult) {
    const newborns = [];

    for (const p of this.prey) {
      p.age         += speedMult;
      p.energy      -= METABOLISM * speedMult;
      p.repCooldown -= speedMult;

      if (p.energy <= 0 || p.age > LIFESPAN) { p.dead = true; continue; }

      // Find nearest grass within sense radius
      const target = this._nearestGrass(p.x, p.y, SENSE_RADIUS);

      if (target) {
        // Steer toward grass
        const desired = Math.atan2(target.y - p.y, target.x - p.x);
        p.angle       = _lerpAngle(p.angle, desired, SEEK_TURN * speedMult);

        // Eat if close enough
        const dist2 = (target.x - p.x) ** 2 + (target.y - p.y) ** 2;
        if (dist2 < EAT_RADIUS * EAT_RADIUS) {
          const bite   = Math.min(target.amount, EAT_RATE * speedMult);
          target.amount -= bite;
          p.energy = Math.min(MAX_ENERGY, p.energy + bite * ENERGY_PER_BITE);
        }
      } else {
        // Wander
        p.angle += (Math.random() - 0.5) * 2 * WANDER_TURN * speedMult;
      }

      // Move
      p.x += Math.cos(p.angle) * PREY_SPEED * speedMult;
      p.y += Math.sin(p.angle) * PREY_SPEED * speedMult;

      // Bounce off walls
      if (p.x < 0)           { p.x = 0;           p.angle = Math.PI - p.angle; }
      if (p.x > this.width)  { p.x = this.width;  p.angle = Math.PI - p.angle; }
      if (p.y < 0)           { p.y = 0;            p.angle = -p.angle; }
      if (p.y > this.height) { p.y = this.height;  p.angle = -p.angle; }

      // Reproduce
      if (p.age > ADULT_AGE && p.energy > REPRO_ENERGY && p.repCooldown <= 0) {
        p.energy      -= REPRO_COST;
        p.repCooldown  = REPRO_COOLDOWN;
        newborns.push(new Prey(
          p.x + (Math.random() - 0.5) * 20,
          p.y + (Math.random() - 0.5) * 20,
        ));
      }
    }

    this.prey = this.prey.filter(p => !p.dead);
    for (const nb of newborns) this.prey.push(nb);
  }

  _nearestGrass(x, y, radius) {
    const r2 = radius * radius;
    let best = null;
    let bestD2 = Infinity;
    for (const g of this.grass) {
      const d2 = (g.x - x) ** 2 + (g.y - y) ** 2;
      if (d2 < r2 && d2 < bestD2) { best = g; bestD2 = d2; }
    }
    return best;
  }

  // ── Stats ─────────────────────────────────────────────────────────────
  stats() {
    return {
      grass:     this.grass.length,
      prey:      this.prey.length,
      predators: 0,
      tick:      this.tick,
    };
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────
function _lerpAngle(a, b, t) {
  let diff = b - a;
  while (diff >  Math.PI) diff -= 2 * Math.PI;
  while (diff < -Math.PI) diff += 2 * Math.PI;
  return a + diff * Math.min(1, t);
}

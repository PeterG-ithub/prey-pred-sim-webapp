import { Grass } from './entities/grass.js';
import { Prey, STATE, LIFESPAN, ADULT_AGE, METABOLISM, MAX_ENERGY,
         EAT_RADIUS, SENSE_RADIUS, EAT_RATE, ENERGY_PER_BITE,
         REPRO_ENERGY, REPRO_COST, REPRO_COOLDOWN,
         WANDER_TURN, SEEK_TURN, PREY_SPEED,
         SCAN_INTERVAL, MATE_RADIUS, ABANDON_AMOUNT } from './entities/prey.js';
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
          if (this._clearZone(nx, ny, newBatch)) newBatch.push(new Grass(nx, ny, 0.05));
        }
      }
    }

    if (
      this.grass.length + newBatch.length < max &&
      Math.random() < RANDOM_SPAWN_CHANCE * speedMult
    ) {
      const x = Math.random() * this.width;
      const y = Math.random() * this.height;
      if (this._clearZone(x, y, newBatch)) newBatch.push(new Grass(x, y, 0.05));
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

  // ── Prey state machine ────────────────────────────────────────────────
  _updatePrey(speedMult) {
    const newborns = [];

    for (const p of this.prey) {
      p.age         += speedMult;
      p.energy      -= METABOLISM * speedMult;
      p.repCooldown -= speedMult;

      if (p.energy <= 0 || p.age > LIFESPAN) { p.dead = true; continue; }

      switch (p.state) {
        case STATE.WANDER: this._stateWander(p, speedMult); break;
        case STATE.SEEK:   this._stateSeek(p, speedMult);   break;
        case STATE.EAT:    this._stateEat(p, speedMult);    break;
      }

      // Reproduction — checked regardless of state
      if (p.age > ADULT_AGE && p.energy > REPRO_ENERGY && p.repCooldown <= 0) {
        const partner = this._findMate(p);
        if (partner) this._reproduce(p, partner, newborns);
      }
    }

    this.prey = this.prey.filter(p => !p.dead);
    for (const nb of newborns) this.prey.push(nb);
  }

  _stateWander(p, speedMult) {
    p.scanCooldown -= speedMult;
    if (p.scanCooldown <= 0) {
      p.scanCooldown = SCAN_INTERVAL;
      const target = this._nearestGrass(p.x, p.y, SENSE_RADIUS);
      if (target) { p.targetGrass = target; p.state = STATE.SEEK; return; }
    }
    p.angle += (Math.random() - 0.5) * 2 * WANDER_TURN * speedMult;
    this._moveAndBounce(p, speedMult);
  }

  _stateSeek(p, speedMult) {
    if (!p.targetGrass || p.targetGrass.amount <= ABANDON_AMOUNT) {
      p.targetGrass = null;
      p.state = STATE.WANDER;
      return;
    }
    const dx    = p.targetGrass.x - p.x;
    const dy    = p.targetGrass.y - p.y;
    const dist2 = dx * dx + dy * dy;

    if (dist2 < EAT_RADIUS * EAT_RADIUS) { p.state = STATE.EAT; return; }

    p.angle = _lerpAngle(p.angle, Math.atan2(dy, dx), SEEK_TURN * speedMult);
    this._moveAndBounce(p, speedMult);
  }

  _stateEat(p, speedMult) {
    if (!p.targetGrass || p.targetGrass.amount <= 0) {
      p.targetGrass = null;
      p.state = STATE.WANDER;
      return;
    }
    // Drift out of eat radius → re-seek
    const dist2 = (p.targetGrass.x - p.x) ** 2 + (p.targetGrass.y - p.y) ** 2;
    if (dist2 > (EAT_RADIUS * 2.5) ** 2) { p.state = STATE.SEEK; return; }

    // Eat — prey stays still
    const bite     = Math.min(p.targetGrass.amount, EAT_RATE * speedMult);
    p.targetGrass.amount -= bite;
    p.energy = Math.min(MAX_ENERGY, p.energy + bite * ENERGY_PER_BITE);
  }

  _moveAndBounce(p, speedMult) {
    p.x += Math.cos(p.angle) * PREY_SPEED * speedMult;
    p.y += Math.sin(p.angle) * PREY_SPEED * speedMult;
    if (p.x < 0)           { p.x = 0;           p.angle = Math.PI - p.angle; }
    if (p.x > this.width)  { p.x = this.width;  p.angle = Math.PI - p.angle; }
    if (p.y < 0)           { p.y = 0;            p.angle = -p.angle; }
    if (p.y > this.height) { p.y = this.height;  p.angle = -p.angle; }
  }

  // ── Mating ────────────────────────────────────────────────────────────
  _findMate(p) {
    const r2 = MATE_RADIUS * MATE_RADIUS;
    for (const other of this.prey) {
      if (other === p || other.dead || other.sex === p.sex) continue;
      if (other.age <= ADULT_AGE || other.energy <= REPRO_ENERGY * 0.7) continue;
      if ((other.x - p.x) ** 2 + (other.y - p.y) ** 2 < r2) return other;
    }
    return null;
  }

  _reproduce(p, partner, newborns) {
    const female = p.sex === 'F' ? p : partner;
    const male   = p.sex === 'M' ? p : partner;

    female.energy      -= REPRO_COST;
    female.repCooldown  = REPRO_COOLDOWN;
    male.repCooldown    = REPRO_COOLDOWN * 0.5;

    const count = 1 + (Math.random() < 0.3 ? 1 : 0); // 1 offspring, 30% chance of twins
    for (let i = 0; i < count; i++) {
      newborns.push(new Prey(
        female.x + (Math.random() - 0.5) * 20,
        female.y + (Math.random() - 0.5) * 20,
      ));
    }
  }

  // ── Lookup helpers ────────────────────────────────────────────────────
  _nearestGrass(x, y, radius) {
    const r2 = radius * radius;
    let best = null, bestD2 = Infinity;
    for (const g of this.grass) {
      if (g.amount <= ABANDON_AMOUNT) continue;
      const d2 = (g.x - x) ** 2 + (g.y - y) ** 2;
      if (d2 < r2 && d2 < bestD2) { best = g; bestD2 = d2; }
    }
    return best;
  }

  // ── Stats ─────────────────────────────────────────────────────────────
  stats() {
    return { grass: this.grass.length, prey: this.prey.length, predators: 0, tick: this.tick };
  }
}

function _lerpAngle(a, b, t) {
  let d = b - a;
  while (d >  Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  return a + d * Math.min(1, t);
}

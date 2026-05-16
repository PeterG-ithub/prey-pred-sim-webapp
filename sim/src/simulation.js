import { Grass } from './entities/grass.js';
import { Prey, STATE, TICKS_PER_YEAR, ADULT_AGE, MAX_ENERGY,
         ENERGY_PER_BITE, REPRO_COST, ABANDON_AMOUNT,
         SCAN_INTERVAL, WANDER_TURN, SEEK_TURN } from './entities/prey.js';
import { config, toGrowthRate, toSpreadChance, toRandomSpawn,
         toPreySpeed, toMetabolism, toEatRate } from './config.js';
import { SpatialGrid } from './utils/spatialGrid.js';
import { GraphHistory } from './rendering/graph.js';

const SPREAD_THRESHOLD    = 0.85;
const SPREAD_RADIUS       = 80;
const MIN_PATCH_DIST      = 28;
const EAT_RADIUS          = 12;   // must be this close to targeted grass to enter EAT
const OPPORTUNISTIC_RADIUS = 22;  // snack on any grass within this range while passing

export class Simulation {
  constructor(width, height) {
    this.width     = width;
    this.height    = height;
    this.grass     = [];
    this.prey      = [];
    this.tick      = 0;
    this._grassGrid  = new SpatialGrid(100);
    this._preyGrid   = new SpatialGrid(100);
    this.graphHistory = new GraphHistory();
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
    this._rebuildGrids();
    this._updatePrey(speedMult);
    this.graphHistory.record(this.tick, this.prey.length, 0);
  }

  _rebuildGrids() {
    this._grassGrid.clear();
    for (const g of this.grass) this._grassGrid.insert(g);
    this._preyGrid.clear();
    for (const p of this.prey) this._preyGrid.insert(p);
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
      Math.random() < toRandomSpawn(config.grassRandomSpawn) * speedMult
    ) {
      const x = Math.random() * this.width;
      const y = Math.random() * this.height;
      newBatch.push(new Grass(x, y, 0.05));
    }

    for (const g of newBatch) this.grass.push(g);
    this.grass = this.grass.filter(g => g.amount > ABANDON_AMOUNT);
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
    const satiationE = config.preySatiation * MAX_ENERGY / 100;
    const hungerE    = config.preyHunger    * MAX_ENERGY / 100;
    const lifespan   = config.preyLifespan  * TICKS_PER_YEAR;
    const repoCooldownTicks = config.preyRepoCooldown * TICKS_PER_YEAR;
    const metabolism = toMetabolism(config.preyMetabolism);
    const eatRate    = toEatRate(config.preyEatRate);
    const speed      = toPreySpeed(config.preySpeed);
    const perception = config.preyPerception;
    const mateRadius = config.preyMateRadius;

    const newborns = [];

    for (const p of this.prey) {
      p.age         += speedMult;
      p.energy      -= metabolism * speedMult;
      p.repCooldown -= speedMult;

      if (p.energy <= 0 || p.age > lifespan) { p.dead = true; continue; }

      switch (p.state) {
        case STATE.WANDER:
          this._stateWander(p, speedMult, speed, satiationE, hungerE, perception, repoCooldownTicks);
          break;
        case STATE.SEEK_FOOD:
          this._stateSeekFood(p, speedMult, speed, eatRate, satiationE, perception);
          break;
        case STATE.EAT:
          this._stateEat(p, speedMult, eatRate, satiationE);
          break;
        case STATE.SEEK_MATE:
          this._stateSeekMate(p, speedMult, speed, hungerE, mateRadius, newborns, repoCooldownTicks);
          break;
      }
    }

    this.prey = this.prey.filter(p => !p.dead);
    for (const nb of newborns) this.prey.push(nb);
  }

  _stateWander(p, speedMult, speed, satiationE, hungerE, perception, repoCooldownTicks) {
    p.scanCooldown -= speedMult;
    if (p.scanCooldown > 0) {
      p.angle += (Math.random() - 0.5) * 2 * WANDER_TURN * speedMult;
      this._moveAndBounce(p, speed, speedMult);
      this._tryOpportunisticEat(p);
      return;
    }
    p.scanCooldown = SCAN_INTERVAL;

    if (p.energy < hungerE || p.energy < satiationE) {
      // Hungry — seek food
      const g = this._grassGrid.nearest(p.x, p.y, perception, g => g.amount > ABANDON_AMOUNT);
      if (g) { p.targetGrass = g; p.state = STATE.SEEK_FOOD; return; }
    }

    if (p.energy >= satiationE && p.age > ADULT_AGE && p.repCooldown <= 0) {
      // Full and ready — seek mate
      const mate = this._preyGrid.nearest(p.x, p.y, perception, m =>
        m !== p && !m.dead && m.sex !== p.sex &&
        m.age > ADULT_AGE && m.energy > hungerE,
      );
      if (mate) { p.targetMate = mate; p.state = STATE.SEEK_MATE; return; }
    }

    p.angle += (Math.random() - 0.5) * 2 * WANDER_TURN * speedMult;
    this._moveAndBounce(p, speed, speedMult);
    // Opportunistic: eat whatever is underfoot if hungry
    if (p.energy < satiationE) this._tryOpportunisticEat(p);
  }

  _stateSeekFood(p, speedMult, speed, eatRate, satiationE, perception) {
    if (!p.targetGrass || p.targetGrass.amount <= ABANDON_AMOUNT) {
      p.targetGrass = null; p.state = STATE.WANDER; return;
    }

    // Opportunistic: eat whatever is underfoot immediately
    if (this._tryOpportunisticEat(p)) return;

    // Periodically re-evaluate — switch to a closer patch if one exists
    p.scanCooldown -= speedMult;
    if (p.scanCooldown <= 0) {
      p.scanCooldown = SCAN_INTERVAL;
      const closer = this._grassGrid.nearest(p.x, p.y, perception, g => g.amount > ABANDON_AMOUNT);
      if (closer) p.targetGrass = closer;
    }

    const dx = p.targetGrass.x - p.x;
    const dy = p.targetGrass.y - p.y;
    if (dx * dx + dy * dy < EAT_RADIUS * EAT_RADIUS) {
      p.state = STATE.EAT; return;
    }
    p.angle = _lerpAngle(p.angle, Math.atan2(dy, dx), SEEK_TURN * speedMult);
    this._moveAndBounce(p, speed, speedMult);
  }

  _stateEat(p, speedMult, eatRate, satiationE) {
    if (!p.targetGrass || p.targetGrass.amount <= ABANDON_AMOUNT) {
      p.targetGrass = null; p.state = STATE.WANDER; return;
    }
    if (p.energy >= satiationE) {
      p.state = STATE.WANDER; return;
    }
    // Drifted too far — re-approach
    const d2 = (p.targetGrass.x - p.x) ** 2 + (p.targetGrass.y - p.y) ** 2;
    if (d2 > (EAT_RADIUS * 2.5) ** 2) { p.state = STATE.SEEK_FOOD; return; }

    const bite = Math.min(p.targetGrass.amount, eatRate * speedMult);
    p.targetGrass.amount -= bite;
    p.energy = Math.min(MAX_ENERGY, p.energy + bite * ENERGY_PER_BITE);
  }

  _stateSeekMate(p, speedMult, speed, hungerE, mateRadius, newborns, repoCooldownTicks) {
    if (p.energy < hungerE) {
      p.targetMate = null; p.state = STATE.WANDER; return;
    }
    if (!p.targetMate || p.targetMate.dead) {
      p.targetMate = null; p.state = STATE.WANDER; return;
    }

    const dx = p.targetMate.x - p.x;
    const dy = p.targetMate.y - p.y;
    const d2 = dx * dx + dy * dy;

    if (d2 < mateRadius * mateRadius) {
      this._reproduce(p, p.targetMate, newborns, hungerE, repoCooldownTicks);
      p.targetMate = null; p.state = STATE.WANDER; return;
    }

    p.angle = _lerpAngle(p.angle, Math.atan2(dy, dx), SEEK_TURN * speedMult);
    this._moveAndBounce(p, speed, speedMult);
    this._tryOpportunisticEat(p);
  }

  _tryOpportunisticEat(p) {
    const g = this._grassGrid.nearest(p.x, p.y, OPPORTUNISTIC_RADIUS, g => g.amount > ABANDON_AMOUNT);
    if (!g) return false;
    p.targetGrass = g;
    p.state = STATE.EAT;
    return true;
  }

  _moveAndBounce(p, speed, speedMult) {
    p.x += Math.cos(p.angle) * speed * speedMult;
    p.y += Math.sin(p.angle) * speed * speedMult;
    if (p.x < 0)           { p.x = 0;           p.angle = Math.PI - p.angle; }
    if (p.x > this.width)  { p.x = this.width;  p.angle = Math.PI - p.angle; }
    if (p.y < 0)           { p.y = 0;            p.angle = -p.angle; }
    if (p.y > this.height) { p.y = this.height;  p.angle = -p.angle; }
  }

  _reproduce(p, partner, newborns, hungerE, repoCooldownTicks) {
    const female = p.sex === 'F' ? p : partner;
    const male   = p.sex === 'M' ? p : partner;

    // Validate partner still eligible
    if (partner.energy < hungerE || partner.dead) return;

    female.energy      -= REPRO_COST;
    female.repCooldown  = repoCooldownTicks;
    male.repCooldown    = repoCooldownTicks * 0.5;

    const twins = Math.random() < 0.3;
    const count = twins ? 2 : 1;
    for (let i = 0; i < count; i++) {
      newborns.push(new Prey(
        female.x + (Math.random() - 0.5) * 20,
        female.y + (Math.random() - 0.5) * 20,
      ));
    }
  }

  // ── Stats ─────────────────────────────────────────────────────────────
  stats() {
    const biomass = Math.round(this.grass.reduce((s, g) => s + g.amount, 0));
    return { grass: biomass, prey: this.prey.length, predators: 0, tick: this.tick };
  }
}

function _lerpAngle(a, b, t) {
  let d = b - a;
  while (d >  Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  return a + d * Math.min(1, t);
}

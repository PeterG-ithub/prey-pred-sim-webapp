export const TICKS_PER_YEAR = 200;
export const ADULT_AGE     = 3  * TICKS_PER_YEAR;   // 600 ticks
export const LIFESPAN      = 30 * TICKS_PER_YEAR;   // 6000 ticks

export const METABOLISM      = 0.02;   // energy lost per tick
export const MAX_ENERGY      = 100;
export const EAT_RADIUS      = 12;     // px — must be this close to eat
export const SENSE_RADIUS    = 100;    // px — grass detection range
export const EAT_RATE        = 0.025;  // grass.amount depleted per tick while eating
export const ENERGY_PER_BITE = 30;     // energy gained per 1.0 of grass consumed
export const REPRO_ENERGY    = 75;     // min energy to reproduce
export const REPRO_COST      = 25;     // energy lost on reproduction
export const REPRO_COOLDOWN  = 800;    // ticks between reproductions
export const WANDER_TURN     = 0.07;   // max random turn (radians/tick)
export const SEEK_TURN       = 0.12;   // max steer turn toward target
export const PREY_SPEED      = 1.4;   // px/tick

export class Prey {
  constructor(x, y, angle = Math.random() * Math.PI * 2) {
    this.x      = x;
    this.y      = y;
    this.angle  = angle;
    this.energy = 50;
    this.age    = 0;
    this.repCooldown = Math.random() * REPRO_COOLDOWN; // stagger initial repro
    this.dead   = false;
  }
}

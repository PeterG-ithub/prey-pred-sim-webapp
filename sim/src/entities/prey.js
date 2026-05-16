export const TICKS_PER_YEAR = 200;
export const ADULT_AGE     = 3  * TICKS_PER_YEAR;  // 600 ticks
export const LIFESPAN      = 30 * TICKS_PER_YEAR;  // 6000 ticks

export const METABOLISM      = 0.02;
export const MAX_ENERGY      = 100;
export const EAT_RADIUS      = 12;
export const SENSE_RADIUS    = 100;
export const EAT_RATE        = 0.025;
export const ENERGY_PER_BITE = 30;
export const REPRO_ENERGY    = 75;
export const REPRO_COST      = 25;
export const REPRO_COOLDOWN  = 800;
export const WANDER_TURN     = 0.07;
export const SEEK_TURN       = 0.12;
export const PREY_SPEED      = 1.4;
export const SCAN_INTERVAL   = 20;   // ticks between grass scans while wandering
export const MATE_RADIUS     = 25;
export const ABANDON_AMOUNT  = 0.08; // abandon target grass below this amount

export const STATE = { WANDER: 'wander', SEEK: 'seek', EAT: 'eat' };

export class Prey {
  constructor(x, y, angle = Math.random() * Math.PI * 2) {
    this.x      = x;
    this.y      = y;
    this.angle  = angle;
    this.energy = 50;
    this.age    = 0;
    this.sex    = Math.random() < 0.5 ? 'M' : 'F';
    this.state  = STATE.WANDER;
    this.targetGrass  = null;
    this.scanCooldown = Math.floor(Math.random() * SCAN_INTERVAL);
    this.repCooldown  = Math.random() * REPRO_COOLDOWN;
    this.dead   = false;
  }
}

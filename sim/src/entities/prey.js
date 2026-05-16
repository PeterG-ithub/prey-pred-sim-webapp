// Internal constants — not exposed to settings
export const TICKS_PER_YEAR = 200;
export const ADULT_AGE      = 3 * TICKS_PER_YEAR;  // 600 ticks
export const MAX_ENERGY     = 100;
export const ENERGY_PER_BITE = 30;  // energy gained per 1.0 grass consumed
export const REPRO_COST     = 25;   // energy cost to give birth
export const ABANDON_AMOUNT = 0.08; // ignore grass patches below this amount
export const SCAN_INTERVAL  = 20;   // ticks between perception scans
export const WANDER_TURN    = 0.07; // max random turn (rad/tick)
export const SEEK_TURN      = 0.12; // max steering turn (rad/tick)

export const STATE = { WANDER: 'wander', SEEK_FOOD: 'seek_food', EAT: 'eat', SEEK_MATE: 'seek_mate' };

export class Prey {
  constructor(x, y, angle = Math.random() * Math.PI * 2) {
    this.x      = x;
    this.y      = y;
    this.angle  = angle;
    this.energy = 50;
    this.age    = 0;
    this.sex    = Math.random() < 0.5 ? 'M' : 'F';
    this.state  = STATE.WANDER;
    this.targetGrass = null;
    this.targetMate  = null;
    this.scanCooldown = Math.floor(Math.random() * SCAN_INTERVAL);
    this.repCooldown  = Math.random() * 400;
    this.dead   = false;
  }
}

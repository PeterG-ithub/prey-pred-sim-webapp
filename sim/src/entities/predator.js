export const PRED_TICKS_PER_YEAR  = 200;
export const PRED_ADULT_AGE       = 4 * PRED_TICKS_PER_YEAR;
export const PRED_MAX_ENERGY      = 100;
export const PRED_REPRO_COST      = 35;
export const PRED_SCAN_INTERVAL   = 25;
export const PRED_WANDER_TURN     = 0.05;
export const PRED_SEEK_TURN       = 0.15;
export const PRED_KILL_RADIUS     = 12;
export const HUNT_ENERGY_GAIN     = 0.45; // fraction of prey energy gained on kill

export const PRED_EAT_TICKS = 80;  // ticks spent feeding after a kill

export const PRED_STATE = {
  WANDER:    'wander',
  SEEK_PREY: 'seek_prey',
  EAT:       'eat',
  SEEK_MATE: 'seek_mate',
};

export class Predator {
  constructor(x, y, angle = Math.random() * Math.PI * 2) {
    this.x            = x;
    this.y            = y;
    this.angle        = angle;
    this.energy       = 80;
    this.age          = 0;
    this.sex          = Math.random() < 0.5 ? 'M' : 'F';
    this.state        = PRED_STATE.WANDER;
    this.targetPrey   = null;
    this.targetMate   = null;
    this.scanCooldown = Math.floor(Math.random() * PRED_SCAN_INTERVAL);
    this.repCooldown  = Math.random() * 600;
    this.eatTimer     = 0;
    this.dead         = false;
  }
}

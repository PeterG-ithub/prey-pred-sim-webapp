export const config = {
  // ── Grass ──────────────────────────────────────────────────────────────
  initialGrass:      65,
  growthSpeed:       5,    // 1–10 scale
  spreadSpeed:       5,    // 1–10 scale
  maxPatches:        200,
  grassRandomSpawn:  2,    // 1–10 scale

  // ── Predators ──────────────────────────────────────────────────────────
  predatorInitial:      10,
  predatorSatiation:    80,   // % — stop hunting, seek mate
  predatorHunger:       35,   // % — abandon mate-seeking, hunt
  predatorPerception:   150,  // px
  predatorSpeed:        4,    // 1–10 scale
  predatorMetabolism:   5,    // 1–10 scale
  predatorLifespan:     20,   // years
  predatorRepoCooldown: 8,    // years
  predatorMateRadius:   30,   // px

  // ── Prey ───────────────────────────────────────────────────────────────
  initialPrey:      100,
  preySatiation:    90,   // % of max energy — stop eating, seek mate
  preyHunger:       60,   // % of max energy — abandon mate-seeking, find food
  preyPerception:   100,  // px — detection radius for grass and mates
  preySpeed:        5,    // 1–10 scale
  preyMetabolism:   5,    // 1–10 scale
  preyLifespan:     30,   // years
  preyRepoCooldown: 4,    // years between reproductions
  preyEatRate:      5,    // 1–10 scale
  preyMateRadius:   25,   // px — must be this close to actually mate
};

// ── Grass helpers ──────────────────────────────────────────────────────────
export const toGrowthRate      = (s) => s * 0.0005;
export const toSpreadChance    = (s) => s * 0.00036;
export const toRandomSpawn     = (s) => s * 0.002;   // 1→0.002  2→0.004(orig)  10→0.02

// ── Predator helpers ───────────────────────────────────────────────────────
export const toPredSpeed      = (s) => 0.4 + s * 0.26;  // 6→1.96 (faster than prey)
export const toPredMetabolism = (s) => s * 0.010;        // 5→0.050  8→0.080

// ── Prey helpers ───────────────────────────────────────────────────────────
export const toPreySpeed    = (s) => 0.3 + s * 0.22;  // 1→0.52  5→1.4  10→2.5
export const toMetabolism   = (s) => s * 0.004;        // 5→0.02
export const toEatRate      = (s) => s * 0.005;        // 5→0.025

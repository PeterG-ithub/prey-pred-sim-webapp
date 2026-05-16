export const config = {
  initialGrass: 65,   // patches spawned on start/restart
  growthSpeed:  5,    // 1–10 scale
  spreadSpeed:  5,    // 1–10 scale
  maxPatches:   200,  // hard cap on simultaneous patches
};

export const toGrowthRate   = (s) => s * 0.0005;   // 5 → 0.0025
export const toSpreadChance = (s) => s * 0.00036;  // 5 → 0.0018

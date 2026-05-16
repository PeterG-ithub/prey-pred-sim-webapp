export const config = {
  // Grass
  initialGrass: 65,
  growthSpeed:  5,
  spreadSpeed:  5,
  maxPatches:   200,
  // Prey
  initialPrey:  20,
};

export const toGrowthRate   = (s) => s * 0.0005;   // 5 → 0.0025
export const toSpreadChance = (s) => s * 0.00036;  // 5 → 0.0018

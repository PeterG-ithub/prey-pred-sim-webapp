export class Grass {
  constructor(x, y, amount = 0.05) {
    this.x = x;
    this.y = y;
    this.amount = amount; // 0 (seedling) → 1 (fully grown)
  }
}

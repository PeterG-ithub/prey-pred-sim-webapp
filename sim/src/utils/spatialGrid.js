export class SpatialGrid {
  constructor(cellSize) {
    this.cellSize = cellSize;
    this.cells    = new Map();
  }

  clear() { this.cells.clear(); }

  insert(entity) {
    const key = this._key(
      Math.floor(entity.x / this.cellSize),
      Math.floor(entity.y / this.cellSize),
    );
    if (!this.cells.has(key)) this.cells.set(key, []);
    this.cells.get(key).push(entity);
  }

  // Returns the nearest entity within radius passing the optional filter fn.
  nearest(x, y, radius, filter) {
    const minCX = Math.floor((x - radius) / this.cellSize);
    const maxCX = Math.floor((x + radius) / this.cellSize);
    const minCY = Math.floor((y - radius) / this.cellSize);
    const maxCY = Math.floor((y + radius) / this.cellSize);
    const r2    = radius * radius;
    let best = null, bestD2 = Infinity;

    for (let cx = minCX; cx <= maxCX; cx++) {
      for (let cy = minCY; cy <= maxCY; cy++) {
        const cell = this.cells.get(this._key(cx, cy));
        if (!cell) continue;
        for (const e of cell) {
          if (filter && !filter(e)) continue;
          const d2 = (e.x - x) ** 2 + (e.y - y) ** 2;
          if (d2 <= r2 && d2 < bestD2) { best = e; bestD2 = d2; }
        }
      }
    }
    return best;
  }

  _key(cx, cy) { return `${cx},${cy}`; }
}

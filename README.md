# Predator–Prey Simulation

A browser-based predator-prey ecosystem simulation built with vanilla JavaScript and Vite.

## Getting Started

```bash
cd sim
npm install
npm run dev
```

Then open http://localhost:5173 in your browser.

## Stack

- Vanilla JavaScript (ES modules)
- Vite dev server
- HTML5 Canvas

## Project Structure

```
sim/
  src/
    main.js             # Entry point, rAF loop
    simulation.js       # Simulation state
    entities/
      prey.js
      predator.js
      grass.js
    rendering/
      canvas.js         # Canvas drawing
      ui.js             # HUD overlay
    utils/
      spatialGrid.js    # Spatial hash grid
```

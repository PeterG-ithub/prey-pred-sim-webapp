const slider   = () => document.getElementById('speed-slider');
const speedVal = () => document.getElementById('speed-val');

export let simSpeed = 5;

export function initUI() {
  slider().addEventListener('input', (e) => {
    simSpeed = Number(e.target.value);
    speedVal().textContent = simSpeed;
  });
}

export function updateUI({ prey = '—', predators = '—', grass = '—', tick = 0 } = {}) {
  document.getElementById('count-prey').textContent  = prey;
  document.getElementById('count-pred').textContent  = predators;
  document.getElementById('count-grass').textContent = grass;
  document.getElementById('tick-val').textContent    = tick;
}

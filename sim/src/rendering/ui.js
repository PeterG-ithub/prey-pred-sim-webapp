let _speed = 5;
export const getSpeed = () => _speed;

export function initUI() {
  const slider   = document.getElementById('speed-slider');
  const speedVal = document.getElementById('speed-val');

  slider.addEventListener('input', (e) => {
    _speed = Number(e.target.value);
    speedVal.textContent = _speed;
  });
}

export function updateUI({ prey = 0, predators = 0, grass = 0, tick = 0 } = {}) {
  document.getElementById('count-prey').textContent  = prey;
  document.getElementById('count-pred').textContent  = predators;
  document.getElementById('count-grass').textContent = grass;
  document.getElementById('tick-val').textContent    = tick;
}

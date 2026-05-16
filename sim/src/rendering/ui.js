import { config } from '../config.js';

let _speed = 5;
export const getSpeed = () => _speed;

export function initUI({ onPlay, onRestart }) {
  // Speed slider
  const speedSlider = document.getElementById('speed-slider');
  const speedVal    = document.getElementById('speed-val');
  speedSlider.addEventListener('input', (e) => {
    _speed = Number(e.target.value);
    speedVal.textContent = _speed;
  });

  // Play / pause
  const btnPlay = document.getElementById('btn-play');
  btnPlay.addEventListener('click', () => {
    onPlay();
    const paused = btnPlay.textContent.startsWith('▶');
    btnPlay.textContent = paused ? '⏸ Pause' : '▶ Play';
    btnPlay.classList.toggle('active', paused);
  });

  // Restart
  document.getElementById('btn-restart').addEventListener('click', () => {
    onRestart();
    // reset tick display immediately
    document.getElementById('tick-val').textContent = 0;
  });

  // Settings panel open / close
  const panel    = document.getElementById('settings-panel');
  const wrapper  = document.getElementById('sim-wrapper');
  const btnOpen  = document.getElementById('btn-settings');
  const btnClose = document.getElementById('btn-close-settings');

  function togglePanel(open) {
    panel.classList.toggle('open', open);
    wrapper.classList.toggle('panel-open', open);
  }

  btnOpen.addEventListener('click',  () => togglePanel(!panel.classList.contains('open')));
  btnClose.addEventListener('click', () => togglePanel(false));

  // Settings sliders
  _bindSetting('set-initial-grass', 'val-initial-grass', (v) => { config.initialGrass = v; });
  _bindSetting('set-growth-speed',  'val-growth-speed',  (v) => { config.growthSpeed  = v; });
  _bindSetting('set-spread-speed',  'val-spread-speed',  (v) => { config.spreadSpeed  = v; });
  _bindSetting('set-max-patches',   'val-max-patches',   (v) => { config.maxPatches   = v; });
  _bindSetting('set-initial-prey',  'val-initial-prey',  (v) => { config.initialPrey  = v; });
}

function _bindSetting(sliderId, valId, onChange) {
  const slider = document.getElementById(sliderId);
  const label  = document.getElementById(valId);
  slider.addEventListener('input', (e) => {
    const v = Number(e.target.value);
    label.textContent = v;
    onChange(v);
  });
}

export function updateUI({ prey = 0, predators = 0, grass = 0, tick = 0 } = {}) {
  document.getElementById('count-prey').textContent  = prey;
  document.getElementById('count-pred').textContent  = predators;
  document.getElementById('count-grass').textContent = grass;
  document.getElementById('tick-val').textContent    = tick;
}

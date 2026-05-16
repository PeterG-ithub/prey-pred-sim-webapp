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

  // Grass settings
  _bindSetting('set-initial-grass', 'val-initial-grass', (v) => { config.initialGrass = v; });
  _bindSetting('set-growth-speed',  'val-growth-speed',  (v) => { config.growthSpeed  = v; });
  _bindSetting('set-spread-speed',  'val-spread-speed',  (v) => { config.spreadSpeed  = v; });
  _bindSetting('set-max-patches',   'val-max-patches',   (v) => { config.maxPatches   = v; });

  // Prey settings
  _bindSetting('set-initial-prey',       'val-initial-prey',       (v) => { config.initialPrey      = v; });
  _bindSetting('set-prey-satiation',     'val-prey-satiation',     (v) => { config.preySatiation    = v; }, v => `${v}%`);
  _bindSetting('set-prey-hunger',        'val-prey-hunger',        (v) => { config.preyHunger       = v; }, v => `${v}%`);
  _bindSetting('set-prey-perception',    'val-prey-perception',    (v) => { config.preyPerception   = v; }, v => `${v}px`);
  _bindSetting('set-prey-speed',         'val-prey-speed',         (v) => { config.preySpeed        = v; });
  _bindSetting('set-prey-metabolism',    'val-prey-metabolism',    (v) => { config.preyMetabolism   = v; });
  _bindSetting('set-prey-lifespan',      'val-prey-lifespan',      (v) => { config.preyLifespan     = v; }, v => `${v} yrs`);
  _bindSetting('set-prey-repo-cooldown', 'val-prey-repo-cooldown', (v) => { config.preyRepoCooldown = v; }, v => `${v} yrs`);
  _bindSetting('set-prey-eat-rate',      'val-prey-eat-rate',      (v) => { config.preyEatRate      = v; });
  _bindSetting('set-prey-mate-radius',   'val-prey-mate-radius',   (v) => { config.preyMateRadius   = v; }, v => `${v}px`);
}

function _bindSetting(sliderId, valId, onChange, format = v => v) {
  const slider = document.getElementById(sliderId);
  const label  = document.getElementById(valId);
  slider.addEventListener('input', (e) => {
    const v = Number(e.target.value);
    label.textContent = format(v);
    onChange(v);
  });
}

export function updateUI({ prey = 0, predators = 0, grass = 0, tick = 0 } = {}) {
  document.getElementById('count-prey').textContent  = prey;
  document.getElementById('count-pred').textContent  = predators;
  document.getElementById('count-grass').textContent = grass;
  document.getElementById('tick-val').textContent    = tick;
}

import { config } from '../config.js';
import { inspectLines } from './canvas.js';

let _speed;
export const getSpeed = () => _speed;

export function initUI({ onPlay, onRestart }) {
  // Speed slider
  const speedSlider = document.getElementById('speed-slider');
  const speedVal    = document.getElementById('speed-val');
  _speed = Number(speedSlider.value);
  speedVal.textContent = _speed;
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

  // Settings panel (right)
  const settingsPanel = document.getElementById('settings-panel');
  const wrapper       = document.getElementById('sim-wrapper');
  const btnSettings   = document.getElementById('btn-settings');
  const btnCloseSettings = document.getElementById('btn-close-settings');

  function toggleSettings(open) {
    settingsPanel.classList.toggle('open', open);
    wrapper.classList.toggle('panel-open', open);
  }
  btnSettings.addEventListener('click',      () => toggleSettings(!settingsPanel.classList.contains('open')));
  btnCloseSettings.addEventListener('click', () => toggleSettings(false));

  // Graph panel (left)
  const graphPanel    = document.getElementById('graph-panel');
  const btnPanel      = document.getElementById('btn-panel');
  const btnCloseGraph = document.getElementById('btn-close-graph');

  function toggleGraph(open) {
    graphPanel.classList.toggle('open', open);
    wrapper.classList.toggle('graph-open', open);
    _inspectCard.classList.toggle('graph-open', open);
  }
  btnPanel.addEventListener('click',      () => toggleGraph(!graphPanel.classList.contains('open')));
  btnCloseGraph.addEventListener('click', () => toggleGraph(false));

  // Predator settings
  _bindSetting('set-predator-initial',      'val-predator-initial',      (v) => { config.predatorInitial      = v; });
  _bindSetting('set-predator-satiation',    'val-predator-satiation',    (v) => { config.predatorSatiation    = v; }, v => `${v}%`);
  _bindSetting('set-predator-hunger',       'val-predator-hunger',       (v) => { config.predatorHunger       = v; }, v => `${v}%`);
  _bindSetting('set-predator-perception',   'val-predator-perception',   (v) => { config.predatorPerception   = v; }, v => `${v}px`);
  _bindSetting('set-predator-speed',        'val-predator-speed',        (v) => { config.predatorSpeed        = v; });
  _bindSetting('set-predator-metabolism',   'val-predator-metabolism',   (v) => { config.predatorMetabolism   = v; });
  _bindSetting('set-predator-lifespan',     'val-predator-lifespan',     (v) => { config.predatorLifespan     = v; }, v => `${v} yrs`);
  _bindSetting('set-predator-repo-cooldown','val-predator-repo-cooldown',(v) => { config.predatorRepoCooldown = v; }, v => `${v} yrs`);
  _bindSetting('set-predator-mate-radius',  'val-predator-mate-radius',  (v) => { config.predatorMateRadius   = v; }, v => `${v}px`);

  // Grass settings
  _bindSetting('set-initial-grass',       'val-initial-grass',       (v) => { config.initialGrass      = v; });
  _bindSetting('set-growth-speed',        'val-growth-speed',        (v) => { config.growthSpeed        = v; });
  _bindSetting('set-spread-speed',        'val-spread-speed',        (v) => { config.spreadSpeed        = v; });
  _bindSetting('set-max-patches',         'val-max-patches',         (v) => { config.maxPatches         = v; });
  _bindSetting('set-grass-random-spawn',  'val-grass-random-spawn',  (v) => { config.grassRandomSpawn   = v; });

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
  label.textContent = format(Number(slider.value));
  onChange(Number(slider.value));
  slider.addEventListener('input', (e) => {
    const v = Number(e.target.value);
    label.textContent = format(v);
    onChange(v);
  });
}

const _inspectCard = document.getElementById('inspect-card');

export function updateInspectCard(inspected) {
  if (!inspected) {
    _inspectCard.classList.remove('visible');
    return;
  }
  const lines = inspectLines(inspected);
  _inspectCard.innerHTML = lines.map((l, i) =>
    `<div class="${i === 0 ? 'ic-title' : i === lines.length - 1 ? 'ic-dim' : 'ic-row'}" style="color:${l.color}">${l.text}</div>`
  ).join('');
  _inspectCard.classList.add('visible');
}

export function updateUI({ prey = 0, predators = 0, grass = 0, tick = 0 } = {}) {
  document.getElementById('count-prey').textContent       = prey;
  document.getElementById('count-pred').textContent       = predators;
  document.getElementById('count-grass').textContent      = grass;
  document.getElementById('tick-val').textContent         = tick;
  document.getElementById('graph-prey-count').textContent = prey;
  document.getElementById('graph-pred-count').textContent = predators;
}

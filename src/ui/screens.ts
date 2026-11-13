import { WORLDS, type ScreenDef, type WorldDef } from '../game/data/worlds';
import {
  USER_KEY,
  currentUser,
  isScreenUnlocked,
  loadProgress,
  medalFor,
  recordResult,
  MEDAL_COLOR,
  MEDAL_LABEL,
  type Medal,
} from '../game/progress';
import { getConfig, screenDuration, screenMedals } from '../game/config';
import { startGame, stopGame, setPaused } from '../game/session';
import { Fx } from '../game/Fx';
import { isTouchDevice } from '../game/touch';
import { initFullscreenButtons, isFullscreenSupported } from './fullscreen';
import { showHud, hideHud } from './hud';

const $ = (id: string): HTMLElement => document.getElementById(id) as HTMLElement;

let selectedWorld: WorldDef = WORLDS[0];
let modalScreen: ScreenDef | null = null;
let lastMatch: { worldId: string; screenId: string } | null = null;
let paused = false;

function show(id: string): void {
  document.querySelectorAll('.screen').forEach((s) => s.classList.add('hidden'));
  $(id).classList.remove('hidden');
}

function medalBadge(medal: Medal | null): string {
  if (!medal) return '<span style="color:#777">🐟 sin atún</span>';
  const color = `#${MEDAL_COLOR[medal].toString(16).padStart(6, '0')}`;
  return `<span>🐟</span> <b style="color:${color}">atún de ${MEDAL_LABEL[medal]}</b>`;
}

export function initUI(): void {
  $('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const user = ($('login-user') as HTMLInputElement).value.trim();
    const pass = ($('login-pass') as HTMLInputElement).value;
    if (!user || !pass) {
      $('login-error').textContent = 'Escribe usuario y contraseña (demo local: cualquier valor sirve)';
      return;
    }
    localStorage.setItem(USER_KEY, user);
    $('login-error').textContent = '';
    Fx.initAudio();
    Fx.startMusic();
    openMenu();
  });

  $('btn-play').addEventListener('click', () => {
    renderPartidas();
    show('screen-partidas');
  });
  $('btn-logout').addEventListener('click', () => {
    localStorage.removeItem(USER_KEY);
    show('screen-login');
  });
  $('btn-back-menu').addEventListener('click', () => openMenu());
  $('btn-sound').addEventListener('click', () => openSoundPanel());

  $('hud-pause').addEventListener('click', () => togglePause());
  $('btn-resume').addEventListener('click', () => togglePause());
  $('btn-pause-sound').addEventListener('click', () => openSoundPanel());
  $('btn-quit').addEventListener('click', () => quitToPartidas());
  $('btn-sound-close').addEventListener('click', () => $('sound-overlay').classList.add('hidden'));

  const vols = Fx.volumes();
  const musicSlider = $('vol-music') as HTMLInputElement;
  const sfxSlider = $('vol-sfx') as HTMLInputElement;
  musicSlider.value = String(Math.round(vols.music * 100));
  sfxSlider.value = String(Math.round(vols.sfx * 100));
  syncSoundLabels();
  musicSlider.addEventListener('input', () => {
    Fx.setMusicVolume(Number(musicSlider.value) / 100);
    syncSoundLabels();
  });
  sfxSlider.addEventListener('input', () => {
    Fx.setSfxVolume(Number(sfxSlider.value) / 100);
    Fx.sfx('pickup');
    syncSoundLabels();
  });

  window.addEventListener('ak:togglepause', () => togglePause());

  $('modal-close').addEventListener('click', closeModal);
  $('modal-start').addEventListener('click', () => {
    if (!modalScreen) return;
    const worldId = selectedWorld.id;
    const screenId = modalScreen.id;
    closeModal();
    lastMatch = { worldId, screenId };
    startMatch(worldId, screenId);
  });

  $('btn-again').addEventListener('click', () => {
    if (!lastMatch) return;
    startMatch(lastMatch.worldId, lastMatch.screenId);
  });
  $('btn-to-partidas').addEventListener('click', () => {
    renderPartidas();
    show('screen-partidas');
  });

  window.addEventListener('ak:gameover', (e) => {
    const d = (e as CustomEvent).detail as { worldId: string; screenId: string; score: number; cans: number };
    onGameOver(d);
  });

  window.addEventListener('pointerdown', () => {
    Fx.initAudio();
  }, { once: true });

  window.addEventListener('resize', updateRotateOverlay);
  window.addEventListener('orientationchange', updateRotateOverlay);

  initFullscreenButtons(() => {
    const hint = $('fs-hint');
    hint.classList.remove('hidden');
    window.setTimeout(() => hint.classList.add('hidden'), 5000);
  });
  if (!isFullscreenSupported()) $('fs-hint').classList.remove('hidden');

  const existing = localStorage.getItem(USER_KEY);
  if (existing) openMenu();
  else show('screen-login');
}

function openMenu(): void {
  $('menu-user').textContent = `Sesión iniciada como: ${currentUser()}`;
  show('screen-menu');
}

function syncSoundLabels(): void {
  const vols = Fx.volumes();
  $('music-val').textContent = `${Math.round(vols.music * 100)}%`;
  $('sfx-val').textContent = `${Math.round(vols.sfx * 100)}%`;
}

function openSoundPanel(): void {
  const vols = Fx.volumes();
  ($('vol-music') as HTMLInputElement).value = String(Math.round(vols.music * 100));
  ($('vol-sfx') as HTMLInputElement).value = String(Math.round(vols.sfx * 100));
  syncSoundLabels();
  $('sound-overlay').classList.remove('hidden');
}

function togglePause(): void {
  paused = !paused;
  setPaused(paused);
  if (paused) {
    Fx.stopMusic();
    $('pause-overlay').classList.remove('hidden');
  } else {
    Fx.startMusic();
    $('pause-overlay').classList.add('hidden');
  }
}

function quitToPartidas(): void {
  paused = false;
  setPaused(false);
  stopGame();
  hideHud();
  $('game').classList.add('hidden');
  $('pause-overlay').classList.add('hidden');
  renderPartidas();
  show('screen-partidas');
}

function startMatch(worldId: string, screenId: string): void {
  document.querySelectorAll('.screen').forEach((s) => s.classList.add('hidden'));
  $('game').classList.remove('hidden');
  showHud();
  updateRotateOverlay();
  startGame(worldId, screenId);
}

function updateRotateOverlay(): void {
  const el = $('rotate-overlay');
  const inMatch = !$('game').classList.contains('hidden');
  const portrait = window.innerHeight > window.innerWidth;
  if (inMatch && isTouchDevice() && portrait) el.classList.remove('hidden');
  else el.classList.add('hidden');
}

function onGameOver(d: { worldId: string; screenId: string; score: number; cans: number }): void {
  stopGame();
  hideHud();
  $('game').classList.add('hidden');
  lastMatch = { worldId: d.worldId, screenId: d.screenId };
  const world = WORLDS.find((w) => w.id === d.worldId);
  const screen = world?.screens.find((s) => s.id === d.screenId);
  const medal = screen ? medalFor(d.cans, screenMedals(screen.id)) : null;
  if (screen) recordResult(currentUser(), screen.id, d.cans, medal);
  renderResults(d, screen, medal);
  show('screen-results');
}

function renderPartidas(): void {
  const user = currentUser();
  const prog = loadProgress(user);
  const worldsRow = $('worlds-row');
  worldsRow.innerHTML = '';
  for (const world of WORLDS) {
    const card = document.createElement('div');
    card.className = 'world-card' + (world.id === selectedWorld.id ? ' selected' : '');
    card.innerHTML = `<div style="font-size:44px">${world.emoji}</div><div>${world.name}</div>`;
    card.addEventListener('click', () => {
      selectedWorld = world;
      renderPartidas();
    });
    worldsRow.appendChild(card);
  }

  $('screens-title').textContent = `${selectedWorld.emoji} ${selectedWorld.name} — elige pantalla`;
  const row = $('screens-row');
  row.innerHTML = '';
  selectedWorld.screens.forEach((screen, i) => {
    const unlocked = isScreenUnlocked(user, selectedWorld, i);
    const p = prog[screen.id];
    const card = document.createElement('div');
    card.className = 'screen-card' + (unlocked ? '' : ' locked');
    card.innerHTML = `
      <div style="font-size:15px">Pantalla ${i + 1}</div>
      <div class="big">${unlocked ? '🐾' : '🔒'}</div>
      <div>${medalBadge(p?.medal ?? null)}</div>
      <div style="font-size:11px;color:#cfc4e8">${p ? `🐟 mejor: ${p.bestCans}` : 'sin jugar'}</div>`;
    if (unlocked) {
      card.addEventListener('click', () => openModal(screen));
    }
    row.appendChild(card);
  });
}

function openModal(screen: ScreenDef): void {
  modalScreen = screen;
  const cfg = getConfig();
  const mins = Math.round(screenDuration(screen.id) / 60);
  const m = screenMedals(screen.id);
  $('modal-title').textContent = screen.name;
  $('modal-info').textContent = `Duración: ${mins} min · Atún: bronce ${m.bronze} 🐟 · plata ${m.silver} 🐟 · oro ${m.gold} 🐟 · velocidad ${cfg.player.speed} · propina ×${cfg.match.tipMultiplier}`;
  $('modal-overlay').classList.remove('hidden');
}

function closeModal(): void {
  modalScreen = null;
  $('modal-overlay').classList.add('hidden');
}

function renderResults(
  d: { worldId: string; screenId: string; score: number; cans: number },
  screen: ScreenDef | undefined,
  medal: Medal | null,
): void {
  $('results-screen').textContent = screen ? screen.name : '';
  $('results-score').textContent = `Puntos: ${d.score}   🐟 Latas de atún ganadas: ${d.cans}`;
  const medalEl = $('results-medal');
  if (medal) {
    const color = `#${MEDAL_COLOR[medal].toString(16).padStart(6, '0')}`;
    medalEl.innerHTML = `<span>🐟</span> <b style="color:${color}">Atún de ${MEDAL_LABEL[medal]} conseguido</b>`;
  } else {
    medalEl.textContent = 'Sin atún esta vez';
    medalEl.style.color = '#ff6b6b';
  }

  const t = screenMedals(d.screenId);
  const thresholds = [t.bronze, t.silver, t.gold];
  const colors = ['#cd7f32', '#c0c0c0', '#ffd700'];
  const labels = ['Atún bronce', 'Atún plata', 'Atún oro'];
  const fills = [
    Math.max(0, Math.min(1, d.cans / thresholds[0])),
    Math.max(0, Math.min(1, (d.cans - thresholds[0]) / (thresholds[1] - thresholds[0]))),
    Math.max(0, Math.min(1, (d.cans - thresholds[1]) / (thresholds[2] - thresholds[1]))),
  ];
  const row = $('results-cans');
  row.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const shown = i < 2 ? Math.min(d.cans, thresholds[i]) : d.cans;
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div class="can" style="background:${colors[i]}"><div class="fill" style="height:${fills[i] * 100}%"></div></div>
      <div class="can-label">${labels[i]}</div>
      <div class="can-count">${shown}/${thresholds[i]} 🐟</div>`;
    row.appendChild(wrap);
  }
}

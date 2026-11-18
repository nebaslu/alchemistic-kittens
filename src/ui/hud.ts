/** HUD en HTML: barra superior, tarjetas de pedidos, barra de progreso e hint; se actualiza desde GameScene vía `updateHud`. */
export interface HudOrder {
  emoji: string;
  name: string;
  timeLeft: number;
  timeLimit: number;
  remaining: string;
}

export interface HudState {
  levelName: string;
  score: number;
  cans: number;
  timeLeft: number;
  timeTotal: number;
  orders: HudOrder[];
  held: string;
  hint: string;
  showProgress: boolean;
  progress: number;
  progressLabel: string;
}

import { initTouchControls, isTouchDevice } from '../game/touch';

const $ = (id: string): HTMLElement => document.getElementById(id) as HTMLElement;

interface OrderCardEls {
  root: HTMLElement;
  ring: HTMLElement;
  main: HTMLElement;
  remaining: HTMLElement;
  fill: HTMLElement;
}

let orderCards: OrderCardEls[] = [];

export function showHud(): void {
  $('hud').classList.remove('hidden');
  if (isTouchDevice()) {
    $('touch-controls').classList.remove('hidden');
    initTouchControls();
  }
  const container = $('hud-orders');
  container.innerHTML = '';
  orderCards = [];
  for (let i = 0; i < 3; i++) {
    const root = document.createElement('div');
    root.className = 'order-card hidden';
    const ring = document.createElement('span');
    ring.className = 'ring';
    const main = document.createElement('div');
    const remaining = document.createElement('div');
    const bar = document.createElement('div');
    bar.className = 'bar';
    const fill = document.createElement('div');
    bar.appendChild(fill);
    root.append(ring, main, remaining, bar);
    container.appendChild(root);
    orderCards.push({ root, ring, main, remaining, fill });
  }
}

export function hideHud(): void {
  $('hud').classList.add('hidden');
  $('touch-controls').classList.add('hidden');
}

export function updateHud(h: HudState): void {
  $('hud-level').textContent = h.levelName;
  $('hud-score').textContent = `Puntos: ${h.score}`;
  $('hud-cans').textContent = `🐟 ${h.cans} latas`;
  const s = Math.max(0, Math.ceil(h.timeLeft));
  const mm = Math.floor(s / 60);
  const ss = String(s % 60).padStart(2, '0');
  const timeEl = $('hud-time');
  timeEl.textContent = `⏱ ${mm}:${ss}`;
  timeEl.classList.toggle('low', s <= 30);
  const total = Math.max(1, h.timeTotal);
  const timeBar = $('hud-timebar-fill');
  if (timeBar) {
    const r = Math.max(0, Math.min(1, h.timeLeft / total));
    timeBar.style.width = `${r * 100}%`;
    timeBar.style.background = r > 0.5 ? '#e8e2f5' : r > 30 / total ? '#f5a623' : '#ff5252';
  }
  $('hud-held').textContent = h.held ? `🐾 ${h.held}` : '';
  $('hud-hint').textContent = h.hint;

  for (let i = 0; i < orderCards.length; i++) {
    const card = orderCards[i];
    const o = h.orders[i];
    if (!o) {
      card.root.classList.add('hidden');
      continue;
    }
    card.root.classList.remove('hidden');
    card.main.textContent = `${o.emoji} ${o.name}`;
    card.remaining.textContent = o.remaining ? `Falta: ${o.remaining}` : '¡Lista para entregar!';
    const ratio = Math.max(0, Math.min(1, o.timeLeft / o.timeLimit));
    card.fill.style.width = `${ratio * 100}%`;
    card.fill.style.background = ratio > 0.5 ? '#7ee081' : ratio > 0.25 ? '#ffd75e' : '#ff6b6b';
    const ringColor = ratio > 0.5 ? '#e8e2f5' : ratio > 0.25 ? '#f5a623' : '#ff5252';
    card.ring.style.background = `conic-gradient(${ringColor} ${ratio * 360}deg, #1c1626 0deg)`;
  }

  const label = $('hud-progress-label');
  const bar = $('hud-progress');
  if (h.showProgress) {
    label.classList.remove('hidden');
    bar.classList.remove('hidden');
    label.textContent = h.progressLabel;
    (bar.firstElementChild as HTMLElement).style.width = `${Math.max(0, Math.min(1, h.progress)) * 100}%`;
  } else {
    label.classList.add('hidden');
    bar.classList.add('hidden');
  }
}

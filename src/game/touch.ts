export interface TouchState {
  x: number;
  y: number;
  eDown: boolean;
  eJust: boolean;
  qJust: boolean;
}

const state: TouchState = { x: 0, y: 0, eDown: false, eJust: false, qJust: false };

let joyPointer: number | null = null;
let joyCenter = { x: 0, y: 0 };
const JOY_RADIUS = 48;

export function getTouchState(): TouchState {
  return state;
}

export function clearTouchJust(): void {
  state.eJust = false;
  state.qJust = false;
}

export function isTouchDevice(): boolean {
  return (
    typeof window !== 'undefined' &&
    (window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window)
  );
}

export function initTouchControls(): void {
  const base = document.getElementById('joy-base');
  const stick = document.getElementById('joy-stick');
  const btnE = document.getElementById('touch-e');
  const btnQ = document.getElementById('touch-q');
  if (!base || !stick || !btnE || !btnQ) return;

  const setStick = (dx: number, dy: number): void => {
    stick.style.transform = `translate(${dx}px, ${dy}px)`;
  };

  base.addEventListener('pointerdown', (e) => {
    joyPointer = e.pointerId;
    base.setPointerCapture(e.pointerId);
    const r = base.getBoundingClientRect();
    joyCenter = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    e.preventDefault();
  });
  base.addEventListener('pointermove', (e) => {
    if (e.pointerId !== joyPointer) return;
    let dx = e.clientX - joyCenter.x;
    let dy = e.clientY - joyCenter.y;
    const len = Math.hypot(dx, dy);
    if (len > JOY_RADIUS) {
      dx = (dx / len) * JOY_RADIUS;
      dy = (dy / len) * JOY_RADIUS;
    }
    state.x = dx / JOY_RADIUS;
    state.y = dy / JOY_RADIUS;
    setStick(dx, dy);
    e.preventDefault();
  });
  const endJoy = (e: PointerEvent): void => {
    if (e.pointerId !== joyPointer) return;
    joyPointer = null;
    state.x = 0;
    state.y = 0;
    setStick(0, 0);
  };
  base.addEventListener('pointerup', endJoy);
  base.addEventListener('pointercancel', endJoy);

  btnE.addEventListener('pointerdown', (e) => {
    state.eDown = true;
    state.eJust = true;
    e.preventDefault();
  });
  const endE = (): void => {
    state.eDown = false;
  };
  btnE.addEventListener('pointerup', endE);
  btnE.addEventListener('pointercancel', endE);

  btnQ.addEventListener('pointerdown', (e) => {
    state.qJust = true;
    e.preventDefault();
  });
}

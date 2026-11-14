/** Sesión (localStorage `ak-user`) y progreso por usuario (`ak-progress-<user>`): mejor marca y atún (bronce/plata/oro) por pantalla; desbloqueo por atún de plata. */
import type { MedalThresholds } from './types';
import type { WorldDef } from './data/worlds';

export type Medal = 'bronze' | 'silver' | 'gold';

export interface ScreenProgress {
  bestCans: number;
  medal: Medal | null;
}

export const USER_KEY = 'ak-user';

export function currentUser(): string {
  return localStorage.getItem(USER_KEY) ?? '';
}

const key = (user: string): string => `ak-progress-${user}`;

export function loadProgress(user: string): Record<string, ScreenProgress> {
  try {
    return JSON.parse(localStorage.getItem(key(user)) ?? '{}') as Record<
      string,
      ScreenProgress
    >;
  } catch {
    return {};
  }
}

export function medalFor(cans: number, medals: MedalThresholds): Medal | null {
  if (cans >= medals.gold) return 'gold';
  if (cans >= medals.silver) return 'silver';
  if (cans >= medals.bronze) return 'bronze';
  return null;
}

export function recordResult(
  user: string,
  screenId: string,
  cans: number,
  medal: Medal | null,
): ScreenProgress {
  const prog = loadProgress(user);
  const prev = prog[screenId];
  const rank = { none: 0, bronze: 1, silver: 2, gold: 3 } as const;
  const next: ScreenProgress = {
    bestCans: Math.max(prev?.bestCans ?? 0, cans),
    medal:
      medal && (!prev?.medal || rank[medal] > rank[prev.medal]) ? medal : (prev?.medal ?? null),
  };
  prog[screenId] = next;
  localStorage.setItem(key(user), JSON.stringify(prog));
  return next;
}

export function isScreenUnlocked(
  user: string,
  world: WorldDef,
  index: number,
): boolean {
  if (index <= 0) return true;
  const prev = world.screens[index - 1];
  const p = loadProgress(user)[prev.id];
  return p?.medal === 'silver' || p?.medal === 'gold';
}

export const MEDAL_COLOR: Record<Medal, number> = {
  bronze: 0xcd7f32,
  silver: 0xc0c0c0,
  gold: 0xffd700,
};

export const MEDAL_LABEL: Record<Medal, string> = {
  bronze: 'bronce',
  silver: 'plata',
  gold: 'oro',
};

import type { MedalThresholds } from './types';

export interface GameConfig {
  match: {
    durationSeconds: number;
    tipMultiplier: number;
  };
  player: {
    speed: number;
  };
  interaction: {
    distance: number;
    processSeconds: number;
    cleanSeconds: number;
  };
  screens: Record<string, { durationSeconds?: number }>;
  medals: Record<string, MedalThresholds>;
}

export const DEFAULT_CONFIG: GameConfig = {
  match: { durationSeconds: 180, tipMultiplier: 1.5 },
  player: { speed: 235 },
  interaction: { distance: 92, processSeconds: 1.0, cleanSeconds: 1.5 },
  screens: {},
  medals: {
    'torre-s1': { bronze: 150, silver: 300, gold: 500 },
    'torre-s2': { bronze: 200, silver: 400, gold: 650 },
    'torre-s3': { bronze: 120, silver: 250, gold: 400 },
  },
};

let cfg: GameConfig = DEFAULT_CONFIG;

export async function loadConfig(): Promise<GameConfig> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}config/game.config.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw = (await res.json()) as Partial<GameConfig>;
    cfg = {
      ...DEFAULT_CONFIG,
      ...raw,
      match: { ...DEFAULT_CONFIG.match, ...raw.match },
      player: { ...DEFAULT_CONFIG.player, ...raw.player },
      interaction: { ...DEFAULT_CONFIG.interaction, ...raw.interaction },
      screens: { ...raw.screens },
      medals: { ...DEFAULT_CONFIG.medals, ...raw.medals },
    };
  } catch {
    cfg = DEFAULT_CONFIG;
  }
  return cfg;
}

export function getConfig(): GameConfig {
  return cfg;
}

export function screenDuration(screenId: string): number {
  return cfg.screens[screenId]?.durationSeconds ?? cfg.match.durationSeconds;
}

export function screenMedals(screenId: string): MedalThresholds {
  return cfg.medals[screenId] ?? { bronze: 0, silver: 0, gold: 0 };
}

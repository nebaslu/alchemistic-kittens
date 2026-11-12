import { RECIPES, type Recipe } from './data/recipes';
import type { LevelDef } from './data/levels';

export interface Order {
  recipe: Recipe;
  timeLeft: number;
  timeLimit: number;
}

export interface DeliverResult {
  ok: boolean;
  points: number;
  cans: number;
  timeLeft: number;
  recipe: Recipe | null;
}

export class OrderSystem {
  active: Order[] = [];
  delivered = 0;
  expired = 0;
  private readonly queue: { recipeId: string; timeLimit: number }[];
  private readonly maxActive: number;
  private readonly total: number;

  constructor(level: LevelDef) {
    this.queue = [...level.orders];
    this.total = level.orders.length;
    this.maxActive = level.maxActiveOrders;
  }

  get allDone(): boolean {
    return this.delivered + this.expired === this.total;
  }

  update(dt: number, onExpire: (o: Order) => void): void {
    while (this.active.length < this.maxActive && this.queue.length > 0) {
      const def = this.queue.shift();
      if (!def) break;
      this.active.push({
        recipe: RECIPES[def.recipeId],
        timeLeft: def.timeLimit,
        timeLimit: def.timeLimit,
      });
    }
    for (let i = this.active.length - 1; i >= 0; i--) {
      const o = this.active[i];
      o.timeLeft -= dt;
      if (o.timeLeft <= 0) {
        this.active.splice(i, 1);
        this.expired++;
        onExpire(o);
      }
    }
  }

  tryDeliver(potionId: string): DeliverResult {
    const idx = this.active.findIndex((o) => o.recipe.id === potionId);
    if (idx === -1) {
      return { ok: false, points: 0, cans: 0, timeLeft: 0, recipe: null };
    }
    const o = this.active[idx];
    this.active.splice(idx, 1);
    this.delivered++;
    const points = o.recipe.basePoints;
    const timeLeft = Math.max(0, o.timeLeft);
    const cans = Math.round(timeLeft * 1.5);
    return { ok: true, points, cans, timeLeft, recipe: o.recipe };
  }
}

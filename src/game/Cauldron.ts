/** Caldero: máquina de estados empty → cooking → ready → exploded. La poción lista explota tras `cauldron.readyExplodeSeconds` (config). */
import Phaser from 'phaser';
import type { CauldronState, IngredientId } from './types';
import { INGREDIENTS } from './data/ingredients';
import type { Recipe } from './data/recipes';
import { Station } from './Station';
import { getConfig } from './config';

export type AddResult = 'ok' | 'wrong' | 'needsPrep' | 'busy';

export class Cauldron {
  readonly station: Station;
  state: CauldronState = 'empty';
  readonly contents: IngredientId[] = [];
  recipe: Recipe | null = null;
  cookLeft = 0;
  burnLeft = 0;
  cleanProgress = 0;
  bubbleClock = 0;
  private lastStatus = '\u0000';
  private readonly statusText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.station = new Station(scene, 'cauldron', x, y);
    this.statusText = scene.add
      .text(x, y - 48, '', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#ffe08a',
        stroke: '#000000',
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(11);
  }

  get cx(): number {
    return this.station.cx;
  }

  get cy(): number {
    return this.station.cy;
  }

  get hit(): Phaser.Geom.Rectangle {
    return this.station.hit;
  }

  addIngredient(
    id: IngredientId,
    processed: boolean,
    activeRecipes: Recipe[],
  ): AddResult {
    if (this.state === 'exploded' || this.state === 'ready') return 'busy';
    const def = INGREDIENTS[id];
    if (def.prep !== 'none' && !processed) return 'needsPrep';
    if (this.contents.includes(id)) return 'wrong';
    const candidates = activeRecipes.filter(
      (r) =>
        r.steps.includes(id) &&
        this.contents.every((c) => r.steps.includes(c)),
    );
    if (candidates.length === 0) return 'wrong';
    this.contents.push(id);
    this.recipe = candidates.reduce((a, b) =>
      b.steps.length < a.steps.length ? b : a,
    );
    if (this.state === 'empty') {
      this.state = 'cooking';
      this.burnLeft = this.recipe.burnTime;
    }
    if (this.contents.length === this.recipe.steps.length) {
      this.cookLeft = this.recipe.cookTime;
    }
    this.refreshVisual();
    return 'ok';
  }

  update(dt: number, onExplode: () => void, onReady: () => void, onBubble: () => void): void {
    if (this.state === 'cooking') {
      this.burnLeft -= dt;
      this.bubbleClock -= dt;
      if (this.bubbleClock <= 0) {
        this.bubbleClock = 0.45;
        onBubble();
      }
      if (this.cookLeft > 0) {
        this.cookLeft -= dt;
        if (this.cookLeft <= 0) {
          this.cookLeft = 0;
          this.state = 'ready';
          this.burnLeft = getConfig().cauldron.readyExplodeSeconds;
          onReady();
        }
      }
      if (this.burnLeft <= 0) this.explodeNow(onExplode);
    } else if (this.state === 'ready') {
      this.burnLeft -= dt;
      if (this.burnLeft <= 0) this.explodeNow(onExplode);
    }
    this.refreshVisual();
  }

  explodeNow(onExplode?: () => void): void {
    this.state = 'exploded';
    this.contents.length = 0;
    this.recipe = null;
    this.cookLeft = 0;
    this.cleanProgress = 0;
    this.station.setIcon('cauldron-boom');
    if (onExplode) onExplode();
    this.refreshVisual();
  }

  clear(): void {
    if (this.state === 'empty' || this.state === 'exploded') return;
    this.state = 'empty';
    this.contents.length = 0;
    this.recipe = null;
    this.cookLeft = 0;
    this.burnLeft = 0;
    this.station.setIcon('cauldron');
    this.refreshVisual();
  }

  takePotion(): string | null {
    if (this.state !== 'ready' || !this.recipe) return null;
    const id = this.recipe.id;
    this.state = 'empty';
    this.contents.length = 0;
    this.recipe = null;
    this.burnLeft = 0;
    this.refreshVisual();
    return id;
  }

  cleanTick(dt: number, seconds: number): boolean {
    if (this.state !== 'exploded') return false;
    this.cleanProgress += dt / seconds;
    if (this.cleanProgress >= 1) {
      this.state = 'empty';
      this.cleanProgress = 0;
      this.station.setIcon('cauldron');
      this.refreshVisual();
      return true;
    }
    this.refreshVisual();
    return false;
  }

  private refreshVisual(): void {
    if (this.state === 'exploded') this.station.setIcon('cauldron-boom');
    else if (this.state === 'ready') this.station.setIcon('cauldron-ready');
    else this.station.setIcon('cauldron');
    let status = '';
    if (this.state === 'cooking') {
      const icons = this.contents.map((c) => INGREDIENTS[c].emoji).join(' ');
      const timer =
        this.cookLeft > 0
          ? `${Math.ceil(this.cookLeft)}s`
          : `quema en ${Math.max(0, Math.ceil(this.burnLeft))}s`;
      status = `${icons} ${timer}`;
    } else if (this.state === 'ready') {
      status = `¡Lista! ${Math.max(0, Math.ceil(this.burnLeft))}s`;
    } else if (this.state === 'exploded') {
      status =
        this.cleanProgress > 0
          ? `Limpiando ${Math.round(this.cleanProgress * 100)}%`
          : '¡Explotó! Usa la varita 🪄';
    }
    // Solo se redibuja el texto cuando cambia (evita trabajo de canvas innecesario por frame).
    if (status !== this.lastStatus) {
      this.lastStatus = status;
      this.statusText.setText(status);
    }
  }
}

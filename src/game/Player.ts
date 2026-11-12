import Phaser from 'phaser';
import type { Item } from './types';
import type { Station } from './Station';
import { INGREDIENTS } from './data/ingredients';

export interface MoveInput {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

export class Player {
  readonly sprite: Phaser.GameObjects.Image;
  readonly heldText: Phaser.GameObjects.Text;
  item: Item | null = null;
  x: number;
  y: number;
  private readonly speed: number;

  constructor(scene: Phaser.Scene, x: number, y: number, speed = 235) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.sprite = scene.add.image(x, y, 'cat').setDepth(20);
    this.sprite.setScale(2);
    this.heldText = scene.add
      .text(x, y - 40, '', { fontSize: '22px' })
      .setOrigin(0.5)
      .setDepth(21);
  }

  update(dt: number, input: MoveInput, stations: Station[]): void {
    let vx = 0;
    let vy = 0;
    if (input.left) vx -= 1;
    if (input.right) vx += 1;
    if (input.up) vy -= 1;
    if (input.down) vy += 1;
    if (vx !== 0 && vy !== 0) {
      vx *= Math.SQRT1_2;
      vy *= Math.SQRT1_2;
    }
    const nx = this.x + vx * this.speed * dt;
    const ny = this.y + vy * this.speed * dt;
    if (!this.collides(nx, this.y, stations)) this.x = nx;
    if (!this.collides(this.x, ny, stations)) this.y = ny;
    this.x = Phaser.Math.Clamp(this.x, 40, 920);
    this.y = Phaser.Math.Clamp(this.y, 120, 600);
    this.sprite.setPosition(this.x, this.y);
    this.heldText.setPosition(this.x, this.y - 40);
    this.refreshHeld();
  }

  private collides(x: number, y: number, stations: Station[]): boolean {
    const r = 14;
    for (const s of stations) {
      if (
        x + r > s.hit.x &&
        x - r < s.hit.x + s.hit.width &&
        y + r > s.hit.y &&
        y - r < s.hit.y + s.hit.height
      ) {
        return true;
      }
    }
    return false;
  }

  nearest(stations: Station[], maxDist = 92): Station | null {
    let best: Station | null = null;
    let bestD = maxDist;
    for (const s of stations) {
      const d = Phaser.Math.Distance.Between(this.x, this.y, s.cx, s.cy);
      if (d < bestD) {
        bestD = d;
        best = s;
      }
    }
    return best;
  }

  private refreshHeld(): void {
    this.heldText.setText(this.item ? Player.itemEmoji(this.item) : '');
  }

  static itemEmoji(item: Item): string {
    switch (item.kind) {
      case 'ingredient':
        return item.ingredient
          ? INGREDIENTS[item.ingredient].emoji + (item.processed ? '✅' : '')
          : '';
      case 'potion':
        return '🧪';
      case 'wand':
        return '🪄';
    }
  }
}

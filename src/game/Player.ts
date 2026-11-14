import Phaser from 'phaser';
import type { Item } from './types';
import type { Station } from './Station';
import { INGREDIENTS } from './data/ingredients';

export interface MoveInput {
  x: number;
  y: number;
}

export class Player {
  readonly sprite: Phaser.GameObjects.Sprite;
  readonly heldText: Phaser.GameObjects.Text;
  item: Item | null = null;
  x: number;
  y: number;
  private readonly speed: number;

  constructor(scene: Phaser.Scene, x: number, y: number, speed = 235) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.sprite = scene.add
      .sprite(x, y, 'char-idle')
      .setDepth(20)
      .setOrigin(0.5, 0.92);
    this.heldText = scene.add
      .text(x, y - 118, '', { fontSize: '22px' })
      .setOrigin(0.5)
      .setDepth(21);
  }

  update(dt: number, input: MoveInput, stations: Station[]): void {
    let vx = input.x;
    let vy = input.y;
    const mag = Math.hypot(vx, vy);
    if (mag > 1) {
      vx /= mag;
      vy /= mag;
    }
    if (mag > 0.05 && !this.sprite.anims.isPlaying) {
      this.sprite.play('char-run');
    } else if (mag <= 0.05 && this.sprite.anims.isPlaying) {
      this.sprite.stop();
      this.sprite.setTexture('char-idle');
    }
    const nx = this.x + vx * this.speed * dt;
    const ny = this.y + vy * this.speed * dt;
    if (!this.collides(nx, this.y, stations)) this.x = nx;
    if (!this.collides(this.x, ny, stations)) this.y = ny;
    this.x = Phaser.Math.Clamp(this.x, 40, 920);
    this.y = Phaser.Math.Clamp(this.y, 120, 600);
    this.sprite.setPosition(this.x, this.y);
    this.heldText.setPosition(this.x, this.y - 118);
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

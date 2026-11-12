import Phaser from 'phaser';
import type { IngredientId, StationKind } from './types';
import { INGREDIENTS } from './data/ingredients';

export class Station {
  readonly kind: StationKind;
  readonly cx: number;
  readonly cy: number;
  readonly hit: Phaser.Geom.Rectangle;
  readonly ingredient?: IngredientId;
  private readonly emojiText: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    kind: StationKind,
    x: number,
    y: number,
    ingredient?: IngredientId,
    label?: string,
  ) {
    this.kind = kind;
    this.cx = x;
    this.cy = y;
    this.ingredient = ingredient;
    scene.add.image(x, y + 8, 'base').setDepth(5);
    const emoji =
      kind === 'ingredient' && ingredient
        ? INGREDIENTS[ingredient].emoji
        : Station.emojiFor(kind);
    this.emojiText = scene.add
      .text(x, y - 14, emoji, { fontSize: '34px' })
      .setOrigin(0.5)
      .setDepth(10);
    scene.add
      .text(x, y + 28, label ?? Station.defaultLabel(kind, ingredient), {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#cfc4e8',
        stroke: '#000000',
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(10);
    this.hit = new Phaser.Geom.Rectangle(x - 40, y - 24, 80, 56);
  }

  setEmoji(emoji: string): void {
    this.emojiText.setText(emoji);
  }

  static emojiFor(kind: StationKind): string {
    switch (kind) {
      case 'mortar':
        return '🥣';
      case 'cuttingBoard':
        return '🔪';
      case 'cauldron':
        return '🍲';
      case 'counter':
        return '🛒';
      case 'wandRack':
        return '🪄';
      default:
        return '📦';
    }
  }

  static defaultLabel(kind: StationKind, ingredient?: IngredientId): string {
    if (kind === 'ingredient' && ingredient) return INGREDIENTS[ingredient].name;
    switch (kind) {
      case 'mortar':
        return 'Almirez (muele)';
      case 'cuttingBoard':
        return 'Tabla (corta)';
      case 'cauldron':
        return 'Caldero';
      case 'counter':
        return 'Expendedor';
      case 'wandRack':
        return 'Varita miaugica';
      default:
        return '';
    }
  }
}

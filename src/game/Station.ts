import Phaser from 'phaser';
import type { IngredientId, StationKind } from './types';
import { INGREDIENTS } from './data/ingredients';

export class Station {
  readonly kind: StationKind;
  readonly cx: number;
  readonly cy: number;
  readonly hit: Phaser.Geom.Rectangle;
  readonly ingredient?: IngredientId;
  private readonly icon: Phaser.GameObjects.Image;

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
    const iconKey =
      kind === 'ingredient' ? 'station-ingredient' : `station-${kind}`;
    this.icon = scene.add.image(x, y - 10, iconKey).setDepth(10);
    if (kind === 'ingredient' && ingredient) {
      scene.add
        .image(x, y - 26, `ing-${ingredient}`)
        .setDepth(11)
        .setScale(0.75);
    }
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

  setIcon(textureKey: string): void {
    this.icon.setTexture(textureKey);
  }

  static defaultLabel(kind: StationKind, ingredient?: IngredientId): string {
    if (kind === 'ingredient' && ingredient) return INGREDIENTS[ingredient].name;
    switch (kind) {
      case 'mortar':
        return 'Mortero (muele)';
      case 'cauldron':
        return 'Caldero';
      case 'counter':
        return 'Expendedor';
      case 'wandRack':
        return 'Varita Miaugica';
      default:
        return '';
    }
  }
}

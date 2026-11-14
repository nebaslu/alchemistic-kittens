/** Carga las texturas PNG de `public/assets/` y arranca GameScene con la pantalla pendiente. */
import Phaser from 'phaser';
import { getPendingStart } from '../game/session';

const ASSETS = [
  'floor',
  'floor-b',
  'base',
  'cat',
  'bottle',
  'cauldron',
  'cauldron-ready',
  'cauldron-boom',
  'station-mortar',
  'station-counter',
  'station-wand',
  'station-ingredient',
  'char-idle',
  'char-run0',
  'char-run1',
  'char-run2',
  'char-run3',
  'char-run4',
  'char-run5',
  'char-run6',
  'char-run7',
  'char-run8',
  'char-run9',
  'ing-catnip',
  'ing-hairball',
  'ing-meow3am',
  'ing-fairyDust',
  'ing-sirenTear',
  'ing-scratcherRope',
];

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload(): void {
    for (const a of ASSETS) {
      this.load.image(a, `assets/${a}.png`);
    }
  }

  create(): void {
    this.anims.create({
      key: 'char-run',
      frames: Array.from({ length: 10 }, (_, i) => ({ key: `char-run${i}` })),
      frameRate: 12,
      repeat: -1,
    });
    this.scene.start('GameScene', getPendingStart() ?? undefined);
  }
}

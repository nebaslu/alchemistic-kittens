import Phaser from 'phaser';
import { getPendingStart } from '../game/session';

const ASSETS = [
  'floor',
  'base',
  'cat',
  'bottle',
  'cauldron',
  'cauldron-ready',
  'cauldron-boom',
  'station-mortar',
  'station-counter',
  'station-wand',
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
    this.scene.start('GameScene', getPendingStart() ?? undefined);
  }
}

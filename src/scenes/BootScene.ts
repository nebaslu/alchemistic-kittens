import Phaser from 'phaser';
import { getPendingStart } from '../game/session';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create(): void {
    const g = this.make.graphics({ x: 0, y: 0 }, false);

    g.fillStyle(0x565064);
    g.fillTriangle(0, 24, 48, 0, 96, 24);
    g.fillTriangle(0, 24, 48, 48, 96, 24);
    g.lineStyle(2, 0x2e2840);
    g.strokeTriangle(0, 24, 48, 0, 96, 24);
    g.strokeTriangle(0, 24, 48, 48, 96, 24);
    g.generateTexture('base', 96, 48);
    g.clear();

    g.fillStyle(0xc98a4b);
    g.fillCircle(16, 19, 9);
    g.fillTriangle(8, 12, 5, 3, 13, 7);
    g.fillTriangle(24, 12, 19, 3, 27, 7);
    g.fillStyle(0x1a1a1a);
    g.fillRect(11, 17, 3, 3);
    g.fillRect(18, 17, 3, 3);
    g.fillStyle(0xff9db0);
    g.fillRect(15, 23, 2, 2);
    g.generateTexture('cat', 32, 32);
    g.clear();

    this.scene.start('GameScene', getPendingStart() ?? undefined);
  }
}

import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create(): void {
    const g = this.make.graphics({ x: 0, y: 0 }, false);

    g.fillStyle(0x8a5a2b);
    g.fillTriangle(0, 16, 32, 0, 64, 16);
    g.fillTriangle(0, 16, 32, 32, 64, 16);
    g.lineStyle(1, 0x241a33);
    g.strokeTriangle(0, 16, 32, 0, 64, 16);
    g.strokeTriangle(0, 16, 32, 32, 64, 16);
    g.generateTexture('floor', 64, 32);
    g.clear();

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

    g.fillStyle(0x000000, 0.35);
    g.fillEllipse(24, 12, 48, 24);
    g.generateTexture('shadow', 48, 24);
    g.clear();

    g.fillStyle(0x1c1626);
    g.fillRect(0, 0, 8, 8);
    g.generateTexture('barBg', 8, 8);
    g.clear();

    g.fillStyle(0x7ee081);
    g.fillRect(0, 0, 8, 8);
    g.generateTexture('barFg', 8, 8);
    g.clear();

    this.scene.start('MenuScene');
  }
}

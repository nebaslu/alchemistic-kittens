import Phaser from 'phaser';
import { USER_KEY, currentUser } from '../game/progress';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#14101f');
    this.buildFloor();
    this.add.text(480, 120, '🗼🐱', { fontSize: '72px' }).setOrigin(0.5);
    this.add
      .text(480, 195, 'Alchemistic Kittens', {
        fontFamily: 'monospace',
        fontSize: '42px',
        color: '#ffd75e',
        stroke: '#000000',
        strokeThickness: 6,
      })
      .setOrigin(0.5);
    this.add
      .text(480, 245, `Sesión iniciada como: ${currentUser()}`, {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#cfc4e8',
      })
      .setOrigin(0.5);

    this.makeButton(480, 340, '▶ Jugar', () => this.scene.start('PartidasScene'));
    this.makeButton(480, 415, '⏻ Salir', () => {
      localStorage.removeItem(USER_KEY);
      this.scene.start('LoginScene');
    });
  }

  private buildFloor(): void {
    const g = this.add.graphics().setDepth(0);
    for (let row = 0; row < 24; row++) {
      for (let col = 0; col < 17; col++) {
        const x = col * 64 + (row % 2) * 32 - 32;
        const y = row * 26 - 10;
        g.fillStyle(row % 2 ? 0x372a4a : 0x3b2d4f);
        g.fillTriangle(x, y + 13, x + 32, y, x + 64, y + 13);
        g.fillTriangle(x, y + 13, x + 32, y + 26, x + 64, y + 13);
      }
    }
  }

  private makeButton(x: number, y: number, label: string, onClick: () => void): void {
    const w = 320;
    const h = 52;
    const bg = this.add
      .graphics()
      .fillStyle(0x6d4fc2)
      .fillRoundedRect(x - w / 2, y - h / 2, w, h, 10)
      .lineStyle(2, 0x9d7bff)
      .strokeRoundedRect(x - w / 2, y - h / 2, w, h, 10);
    this.add
      .text(x, y, label, { fontFamily: 'monospace', fontSize: '21px', color: '#ffffff' })
      .setOrigin(0.5);
    bg.setInteractive(
      new Phaser.Geom.Rectangle(x - w / 2, y - h / 2, w, h),
      Phaser.Geom.Rectangle.Contains,
    );
    bg.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x8a6ce0)
        .fillRoundedRect(x - w / 2, y - h / 2, w, h, 10)
        .lineStyle(2, 0x9d7bff)
        .strokeRoundedRect(x - w / 2, y - h / 2, w, h, 10);
    });
    bg.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x6d4fc2)
        .fillRoundedRect(x - w / 2, y - h / 2, w, h, 10)
        .lineStyle(2, 0x9d7bff)
        .strokeRoundedRect(x - w / 2, y - h / 2, w, h, 10);
    });
    bg.on('pointerdown', onClick);
  }
}

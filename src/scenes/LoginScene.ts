import Phaser from 'phaser';
import { USER_KEY } from '../game/progress';

export class LoginScene extends Phaser.Scene {
  constructor() {
    super('LoginScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#14101f');
    this.buildFloor();
    this.add.text(480, 110, '🐱⚗️', { fontSize: '64px' }).setOrigin(0.5);
    this.add
      .text(480, 180, 'Alchemistic Kittens', {
        fontFamily: 'monospace',
        fontSize: '40px',
        color: '#ffd75e',
        stroke: '#000000',
        strokeThickness: 6,
      })
      .setOrigin(0.5);
    this.add
      .text(480, 225, 'Inicia sesión para entrar a la torre', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#cfc4e8',
      })
      .setOrigin(0.5);

    const existing = (localStorage.getItem(USER_KEY) ?? '').replace(/"/g, '&quot;');
    const el = this.add.dom(480, 300).createFromHTML(`
      <div style="display:flex;flex-direction:column;gap:12px;align-items:center;font-family:monospace;">
        <input id="ak-user" type="text" placeholder="Usuario" value="${existing}"
          style="width:280px;padding:10px;font-size:16px;background:#241a33;color:#ffffff;border:2px solid #6d4fc2;border-radius:8px;outline:none;" />
        <input id="ak-pass" type="password" placeholder="Contraseña"
          style="width:280px;padding:10px;font-size:16px;background:#241a33;color:#ffffff;border:2px solid #6d4fc2;border-radius:8px;outline:none;" />
      </div>`);

    const err = this.add
      .text(480, 385, '', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#ff6b6b',
      })
      .setOrigin(0.5);

    this.makeButton(480, 440, '▶ Entrar', () => {
      const node = el.node as HTMLElement;
      const user = (node.querySelector('#ak-user') as HTMLInputElement).value.trim();
      const pass = (node.querySelector('#ak-pass') as HTMLInputElement).value;
      if (!user || !pass) {
        err.setText('Escribe usuario y contraseña (demo local: cualquier valor sirve)');
        return;
      }
      localStorage.setItem(USER_KEY, user);
      this.scene.start('MainMenuScene');
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
    const w = 300;
    const h = 48;
    const bg = this.add
      .graphics()
      .fillStyle(0x6d4fc2)
      .fillRoundedRect(x - w / 2, y - h / 2, w, h, 10)
      .lineStyle(2, 0x9d7bff)
      .strokeRoundedRect(x - w / 2, y - h / 2, w, h, 10);
    this.add
      .text(x, y, label, { fontFamily: 'monospace', fontSize: '20px', color: '#ffffff' })
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

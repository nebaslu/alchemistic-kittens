import Phaser from 'phaser';
import { Fx } from '../game/Fx';
import { LEVELS } from '../game/data/levels';

const BEST_KEY = 'ak-best-level';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#14101f');
    this.buildFloor();

    this.add
      .text(480, 130, '🐱⚗️', { fontSize: '72px' })
      .setOrigin(0.5)
      .setDepth(2);
    this.add
      .text(480, 205, 'Alchemistic Kittens', {
        fontFamily: 'monospace',
        fontSize: '44px',
        color: '#ffd75e',
        stroke: '#000000',
        strokeThickness: 6,
      })
      .setOrigin(0.5);
    this.add
      .text(480, 255, 'Gatitos alquimistas preparando pociones en la torre del mago', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#cfc4e8',
      })
      .setOrigin(0.5);

    const best = Number(localStorage.getItem(BEST_KEY) ?? 0);
    this.makeButton(480, 340, '▶ Jugar (Nivel 1)', () => {
      Fx.initAudio();
      this.scene.start('GameScene', { level: 0 });
    });
    if (best > 0) {
      this.makeButton(480, 410, `▶ Continuar (${LEVELS[best].name})`, () => {
        Fx.initAudio();
        this.scene.start('GameScene', { level: best });
      });
    }

    this.add
      .text(
        480,
        520,
        [
          'Controles: WASD / flechas para moverte · E para interactuar (mantén E para moler/cortar/limpiar)',
          'Coge ingredientes, prepáralos (almirez 🥣 / tabla 🔪), échalos al caldero 🍲,',
          'saca la poción 🧪 y entrégala en el expendedor 🛒 antes de que se acabe el tiempo.',
          'Si el caldero se quema o mezclas mal: explota 💥. Límpialo con la varita miaugica 🪄.',
          `Propina: segundos restantes × 1.5 latas de atún 🐟 (30s × 1.5 = 45 🐟). Demo con ${LEVELS.length} niveles.`,
        ].join('\n'),
        {
          fontFamily: 'monospace',
          fontSize: '14px',
          color: '#e8e2f5',
          align: 'center',
          stroke: '#000000',
          strokeThickness: 3,
        },
      )
      .setOrigin(0.5, 0);
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

  private makeButton(
    x: number,
    y: number,
    label: string,
    onClick: () => void,
  ): void {
    const w = 340;
    const h = 48;
    const bg = this.add
      .graphics()
      .fillStyle(0x6d4fc2)
      .fillRoundedRect(x - w / 2, y - h / 2, w, h, 10)
      .lineStyle(2, 0x9d7bff)
      .strokeRoundedRect(x - w / 2, y - h / 2, w, h, 10)
      .setDepth(3);
    const txt = this.add
      .text(x, y, label, {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setDepth(4);
    bg.setInteractive(
      new Phaser.Geom.Rectangle(x - w / 2, y - h / 2, w, h),
      Phaser.Geom.Rectangle.Contains,
    );
    bg.on('pointerover', () => bg.fillStyle(0x8a6ce0).fillRoundedRect(x - w / 2, y - h / 2, w, h, 10));
    bg.on('pointerout', () => bg.clear().fillStyle(0x6d4fc2).fillRoundedRect(x - w / 2, y - h / 2, w, h, 10).lineStyle(2, 0x9d7bff).strokeRoundedRect(x - w / 2, y - h / 2, w, h, 10));
    bg.on('pointerdown', onClick);
    void txt;
  }
}

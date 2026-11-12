import Phaser from 'phaser';
import { LEVELS } from '../game/data/levels';
import { Fx } from '../game/Fx';

export interface EndData {
  win: boolean;
  level: number;
  score: number;
  cans: number;
}

export class EndScene extends Phaser.Scene {
  private endData!: EndData;

  constructor() {
    super('EndScene');
  }

  init(data: EndData): void {
    this.endData = data;
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#14101f');
    const d = this.endData;
    this.add
      .text(480, 160, d.win ? '🏆' : '💀', { fontSize: '80px' })
      .setOrigin(0.5);
    this.add
      .text(
        480,
        250,
        d.win ? '¡Torre conquistada, maestro alquimista!' : 'Game Over... los clientes se fueron 😿',
        {
          fontFamily: 'monospace',
          fontSize: '26px',
          color: d.win ? '#ffd75e' : '#ff6b6b',
          stroke: '#000000',
          strokeThickness: 5,
        },
      )
      .setOrigin(0.5);
    this.add
      .text(
        480,
        330,
        [
          `Nivel alcanzado: ${LEVELS[d.level]?.name ?? d.level}`,
          `Puntos: ${d.score}`,
          `🐟 Latas de atún ganadas: ${d.cans}`,
        ].join('\n'),
        {
          fontFamily: 'monospace',
          fontSize: '18px',
          color: '#e8e2f5',
          align: 'center',
        },
      )
      .setOrigin(0.5);

    this.makeButton(480, 440, '↻ Reintentar nivel', () => {
      Fx.initAudio();
      this.scene.start('GameScene', { level: d.level });
    });
    this.makeButton(480, 510, '🏠 Menú', () => {
      this.scene.start('MenuScene');
    });
  }

  private makeButton(x: number, y: number, label: string, onClick: () => void): void {
    const w = 300;
    const h = 46;
    const bg = this.add
      .graphics()
      .fillStyle(0x6d4fc2)
      .fillRoundedRect(x - w / 2, y - h / 2, w, h, 10)
      .lineStyle(2, 0x9d7bff)
      .strokeRoundedRect(x - w / 2, y - h / 2, w, h, 10);
    this.add
      .text(x, y, label, { fontFamily: 'monospace', fontSize: '19px', color: '#ffffff' })
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

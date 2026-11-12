import Phaser from 'phaser';
import { WORLDS } from '../game/data/worlds';
import {
  MEDAL_EMOJI,
  currentUser,
  medalFor,
  recordResult,
} from '../game/progress';

export interface ResultsData {
  worldId: string;
  screenId: string;
  score: number;
  cans: number;
}

const CAN_COLORS = [0xcd7f32, 0xc0c0c0, 0xffd700];
const CAN_LABELS = ['🥉 Bronce', '🥈 Plata', '🥇 Oro'];

export class ResultsScene extends Phaser.Scene {
  private d!: ResultsData;

  constructor() {
    super('ResultsScene');
  }

  init(data: ResultsData): void {
    this.d = data;
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#14101f');
    this.buildFloor();
    const d = this.d;
    const world = WORLDS.find((w) => w.id === d.worldId);
    const screen = world?.screens.find((s) => s.id === d.screenId);
    const user = currentUser();
    const medal = screen ? medalFor(d.cans, screen.medals) : null;
    if (screen) recordResult(user, screen.id, d.cans, medal);

    this.add
      .text(480, 60, '⏱️ ¡Tiempo! Resultados', {
        fontFamily: 'monospace',
        fontSize: '32px',
        color: '#ffd75e',
        stroke: '#000000',
        strokeThickness: 5,
      })
      .setOrigin(0.5);
    this.add
      .text(480, 105, screen ? screen.name : '', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#cfc4e8',
      })
      .setOrigin(0.5);
    this.add
      .text(480, 145, `Puntos: ${d.score}   🐟 Latas de atún ganadas: ${d.cans}`, {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: '#ffffff',
      })
      .setOrigin(0.5);
    this.add
      .text(
        480,
        185,
        medal ? `Medalla conseguida: ${MEDAL_EMOJI[medal]} ${medal.toUpperCase()}` : 'Sin medalla esta vez',
        { fontFamily: 'monospace', fontSize: '20px', color: medal ? '#ffd75e' : '#ff6b6b' },
      )
      .setOrigin(0.5);

    if (screen) this.drawCans(480, 300, d.cans, screen.medals);

    this.makeButton(360, 560, '↻ Volver a jugar', () =>
      this.scene.start('GameScene', { worldId: d.worldId, screenId: d.screenId }),
    );
    this.makeButton(620, 560, '↩ Salir', () => this.scene.start('PartidasScene'));
  }

  private drawCans(
    cx: number,
    cy: number,
    cans: number,
    medals: { bronze: number; silver: number; gold: number },
  ): void {
    const t = [medals.bronze, medals.silver, medals.gold];
    const fills = [
      Phaser.Math.Clamp(cans / t[0], 0, 1),
      Phaser.Math.Clamp((cans - t[0]) / (t[1] - t[0]), 0, 1),
      Phaser.Math.Clamp((cans - t[1]) / (t[2] - t[1]), 0, 1),
    ];
    for (let i = 0; i < 3; i++) {
      const x = cx - 150 + i * 150;
      const g = this.add.graphics().setDepth(2);
      g.fillStyle(0x888888).fillRoundedRect(x - 22, cy - 34, 44, 8, 3);
      g.fillStyle(CAN_COLORS[i]).fillRoundedRect(x - 24, cy - 28, 48, 62, 5);
      g.lineStyle(2, 0x000000).strokeRoundedRect(x - 24, cy - 28, 48, 62, 5);
      const fillH = Math.round(56 * fills[i]);
      if (fillH > 0) {
        g.fillStyle(0xffffff, 0.85).fillRect(x - 20, cy + 30 - fillH, 40, fillH);
      }
      this.add.text(x, cy - 52, CAN_LABELS[i], { fontFamily: 'monospace', fontSize: '14px', color: '#e8e2f5' }).setOrigin(0.5);
      const shown = i < 2 ? Math.min(cans, t[i]) : cans;
      this.add
        .text(x, cy + 48, `${shown}/${t[i]} 🐟`, {
          fontFamily: 'monospace',
          fontSize: '16px',
          color: '#ffffff',
          stroke: '#000000',
          strokeThickness: 3,
        })
        .setOrigin(0.5);
    }
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
    const w = 220;
    const h = 48;
    const bg = this.add
      .graphics()
      .fillStyle(0x6d4fc2)
      .fillRoundedRect(x - w / 2, y - h / 2, w, h, 10)
      .lineStyle(2, 0x9d7bff)
      .strokeRoundedRect(x - w / 2, y - h / 2, w, h, 10);
    this.add
      .text(x, y, label, { fontFamily: 'monospace', fontSize: '18px', color: '#ffffff' })
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

import Phaser from 'phaser';
import { WORLDS, type ScreenDef, type WorldDef } from '../game/data/worlds';
import {
  MEDAL_EMOJI,
  currentUser,
  isScreenUnlocked,
  loadProgress,
} from '../game/progress';

interface ModalHandle {
  container: Phaser.GameObjects.Container;
}

export class PartidasScene extends Phaser.Scene {
  private selectedWorld: WorldDef = WORLDS[0];
  private worldCards: { bg: Phaser.GameObjects.Graphics; world: WorldDef }[] = [];
  private screenCards: Phaser.GameObjects.Container[] = [];
  private modal: ModalHandle | null = null;

  constructor() {
    super('PartidasScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#14101f');
    this.buildFloor();
    const user = currentUser();

    this.makeSmallButton(90, 30, '← Volver', () => this.scene.start('MainMenuScene'));
    this.add
      .text(480, 34, 'Elige tu rascador', {
        fontFamily: 'monospace',
        fontSize: '28px',
        color: '#ffd75e',
        stroke: '#000000',
        strokeThickness: 5,
      })
      .setOrigin(0.5);
    this.add
      .text(480, 66, `Jugador: ${user}`, {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#cfc4e8',
      })
      .setOrigin(0.5);

    this.add
      .text(160, 130, 'Rascadores', { fontFamily: 'monospace', fontSize: '18px', color: '#e8e2f5' })
      .setOrigin(0.5);
    let wx = 160;
    for (const world of WORLDS) {
      const bg = this.add
        .graphics()
        .fillStyle(0x241a33)
        .fillRoundedRect(wx - 90, 150, 180, 120, 12)
        .lineStyle(2, 0x6d4fc2)
        .strokeRoundedRect(wx - 90, 150, 180, 120, 12);
      this.add.text(wx, 195, world.emoji, { fontSize: '44px' }).setOrigin(0.5);
      this.add
        .text(wx, 245, world.name, {
          fontFamily: 'monospace',
          fontSize: '11px',
          color: '#e8e2f5',
          align: 'center',
          wordWrap: { width: 170 },
        })
        .setOrigin(0.5, 0);
      bg.setInteractive(
        new Phaser.Geom.Rectangle(wx - 90, 150, 180, 120),
        Phaser.Geom.Rectangle.Contains,
      );
      bg.on('pointerdown', () => this.selectWorld(world));
      this.worldCards.push({ bg, world });
      wx += 200;
    }
    this.selectWorld(this.selectedWorld);
  }

  private selectWorld(world: WorldDef): void {
    this.selectedWorld = world;
    for (const c of this.worldCards) {
      c.bg.clear();
      const selected = c.world.id === world.id;
      c.bg
        .fillStyle(selected ? 0x3d2d66 : 0x241a33)
        .fillRoundedRect(
          this.worldCards.indexOf(c) * 200 + 160 - 90,
          150,
          180,
          120,
          12,
        )
        .lineStyle(2, selected ? 0xffd75e : 0x6d4fc2)
        .strokeRoundedRect(
          this.worldCards.indexOf(c) * 200 + 160 - 90,
          150,
          180,
          120,
          12,
        );
    }
    this.renderScreens();
  }

  private renderScreens(): void {
    for (const c of this.screenCards) c.destroy(true);
    this.screenCards = [];
    const user = currentUser();
    const prog = loadProgress(user);
    const world = this.selectedWorld;

    this.add
      .text(480, 300, `${world.emoji} ${world.name} — elige pantalla`, {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#e8e2f5',
      })
      .setOrigin(0.5);

    world.screens.forEach((screen, i) => {
      const unlocked = isScreenUnlocked(user, world, i);
      const p = prog[screen.id];
      const x = 200 + i * 200;
      const y = 380;
      const container = this.add.container(x, y);
      const bg = this.add
        .graphics()
        .fillStyle(unlocked ? 0x2c2140 : 0x1a1426)
        .fillRoundedRect(-90, -60, 180, 130, 12)
        .lineStyle(2, unlocked ? 0x9d7bff : 0x444444)
        .strokeRoundedRect(-90, -60, 180, 130, 12);
      const title = this.add
        .text(0, -42, `Pantalla ${i + 1}`, {
          fontFamily: 'monospace',
          fontSize: '16px',
          color: unlocked ? '#ffffff' : '#777777',
        })
        .setOrigin(0.5);
      const icon = this.add
        .text(0, -8, unlocked ? '🐾' : '🔒', { fontSize: '36px' })
        .setOrigin(0.5);
      const medal = this.add
        .text(0, 30, p?.medal ? MEDAL_EMOJI[p.medal] : '—', { fontSize: '22px' })
        .setOrigin(0.5);
      const best = this.add
        .text(0, 52, p ? `🐟 mejor: ${p.bestCans}` : 'sin jugar', {
          fontFamily: 'monospace',
          fontSize: '11px',
          color: '#cfc4e8',
        })
        .setOrigin(0.5);
      container.add([bg, title, icon, medal, best]);
      if (unlocked) {
        bg.setInteractive(
          new Phaser.Geom.Rectangle(-90, -60, 180, 130),
          Phaser.Geom.Rectangle.Contains,
        );
        bg.on('pointerover', () => {
          bg.clear();
          bg.fillStyle(0x3d2d66)
            .fillRoundedRect(-90, -60, 180, 130, 12)
            .lineStyle(2, 0xffd75e)
            .strokeRoundedRect(-90, -60, 180, 130, 12);
        });
        bg.on('pointerout', () => {
          bg.clear();
          bg.fillStyle(0x2c2140)
            .fillRoundedRect(-90, -60, 180, 130, 12)
            .lineStyle(2, 0x9d7bff)
            .strokeRoundedRect(-90, -60, 180, 130, 12);
        });
        bg.on('pointerdown', () => this.openModal(screen));
      }
      this.screenCards.push(container);
    });
  }

  private openModal(screen: ScreenDef): void {
    if (this.modal) return;
    const overlay = this.add
      .rectangle(480, 320, 960, 640, 0x000000, 0.6)
      .setDepth(90)
      .setInteractive();
    const panel = this.add
      .graphics()
      .setDepth(91)
      .fillStyle(0x241a33)
      .fillRoundedRect(280, 200, 400, 240, 14)
      .lineStyle(3, 0x9d7bff)
      .strokeRoundedRect(280, 200, 400, 240, 14);
    const title = this.add
      .text(480, 245, screen.name, {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: '#ffd75e',
        align: 'center',
        wordWrap: { width: 360 },
      })
      .setOrigin(0.5)
      .setDepth(92);
    const info = this.add
      .text(480, 300, `Duración: ${Math.round(screen.duration / 60)} min · Medallas: 🥉${screen.medals.bronze} 🥈${screen.medals.silver} 🥇${screen.medals.gold} 🐟`, {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#cfc4e8',
      })
      .setOrigin(0.5)
      .setDepth(92);

    const startBtn = this.makeModalButton(480, 360, '▶ Empezar partida', 0x2f9e44, () => {
      this.closeModal();
      this.scene.start('GameScene', { worldId: this.selectedWorld.id, screenId: screen.id });
    });
    const closeBtn = this.makeModalButton(480, 405, '✖ Cerrar', 0x6d4fc2, () => this.closeModal());

    const container = this.add.container(0, 0, [
      overlay,
      panel,
      title,
      info,
      startBtn.bg,
      startBtn.txt,
      closeBtn.bg,
      closeBtn.txt,
    ]);
    container.setDepth(90);
    this.modal = { container };
  }

  private closeModal(): void {
    this.modal?.container.destroy(true);
    this.modal = null;
  }

  private makeModalButton(
    x: number,
    y: number,
    label: string,
    color: number,
    onClick: () => void,
  ): { bg: Phaser.GameObjects.Graphics; txt: Phaser.GameObjects.Text } {
    const w = 280;
    const h = 40;
    const bg = this.add
      .graphics()
      .fillStyle(color)
      .fillRoundedRect(x - w / 2, y - h / 2, w, h, 8);
    const txt = this.add
      .text(x, y, label, { fontFamily: 'monospace', fontSize: '16px', color: '#ffffff' })
      .setOrigin(0.5);
    bg.setInteractive(
      new Phaser.Geom.Rectangle(x - w / 2, y - h / 2, w, h),
      Phaser.Geom.Rectangle.Contains,
    );
    bg.on('pointerdown', onClick);
    return { bg, txt };
  }

  private makeSmallButton(x: number, y: number, label: string, onClick: () => void): void {
    const w = 120;
    const h = 36;
    const bg = this.add
      .graphics()
      .fillStyle(0x6d4fc2)
      .fillRoundedRect(x - w / 2, y - h / 2, w, h, 8)
      .lineStyle(2, 0x9d7bff)
      .strokeRoundedRect(x - w / 2, y - h / 2, w, h, 8);
    this.add
      .text(x, y, label, { fontFamily: 'monospace', fontSize: '15px', color: '#ffffff' })
      .setOrigin(0.5);
    bg.setInteractive(
      new Phaser.Geom.Rectangle(x - w / 2, y - h / 2, w, h),
      Phaser.Geom.Rectangle.Contains,
    );
    bg.on('pointerdown', onClick);
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
}

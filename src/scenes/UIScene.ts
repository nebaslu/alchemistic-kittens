import Phaser from 'phaser';
import type { HudState } from './GameScene';

const MAX_ORDER_CARDS = 3;

interface OrderCard {
  bg: Phaser.GameObjects.Graphics;
  emoji: Phaser.GameObjects.Text;
  name: Phaser.GameObjects.Text;
  remaining: Phaser.GameObjects.Text;
  barBg: Phaser.GameObjects.Image;
  barFg: Phaser.GameObjects.Image;
}

export class UIScene extends Phaser.Scene {
  private levelText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private cansText!: Phaser.GameObjects.Text;
  private heartsText!: Phaser.GameObjects.Text;
  private heldText!: Phaser.GameObjects.Text;
  private hintText!: Phaser.GameObjects.Text;
  private progressBg!: Phaser.GameObjects.Graphics;
  private progressFg!: Phaser.GameObjects.Image;
  private progressLabel!: Phaser.GameObjects.Text;
  private cards: OrderCard[] = [];

  constructor() {
    super('UIScene');
  }

  create(): void {
    const top = this.add.graphics().setDepth(80);
    top.fillStyle(0x000000, 0.5).fillRect(0, 0, 960, 52);

    this.levelText = this.text(10, 8, '', 14, '#ffd75e');
    this.scoreText = this.text(10, 28, '', 14, '#ffffff');
    this.cansText = this.text(220, 28, '', 14, '#ffd75e');
    this.heartsText = this.text(430, 28, '', 14, '#ff8fa3');
    this.heldText = this.text(650, 8, '', 22, '#ffffff');

    for (let i = 0; i < MAX_ORDER_CARDS; i++) {
      const x = 8 + i * 236;
      const y = 60;
      const bg = this.add.graphics().setDepth(80);
      const emoji = this.add.text(x + 8, y + 4, '', { fontSize: '26px' }).setDepth(81);
      const name = this.text(x + 42, y + 6, '', 12, '#ffffff').setDepth(81);
      const remaining = this.add.text(x + 42, y + 24, '', { fontSize: '14px' }).setDepth(81);
      const barBg = this.add.image(x + 8, y + 44, 'barBg').setOrigin(0, 0).setDepth(81);
      barBg.setDisplaySize(216, 7);
      const barFg = this.add.image(x + 8, y + 44, 'barFg').setOrigin(0, 0).setDepth(82);
      barFg.setDisplaySize(216, 7);
      bg.setVisible(false);
      emoji.setVisible(false);
      name.setVisible(false);
      remaining.setVisible(false);
      barBg.setVisible(false);
      barFg.setVisible(false);
      this.cards.push({ bg, emoji, name, remaining, barBg, barFg });
    }

    this.progressBg = this.add.graphics().setDepth(80);
    this.progressFg = this.add.image(380, 596, 'barFg').setOrigin(0, 0).setDepth(82);
    this.progressFg.setDisplaySize(200, 10);
    this.progressLabel = this.text(480, 574, '', 13, '#ffe08a').setOrigin(0.5, 1).setDepth(81);
    this.progressBg.setVisible(false);
    this.progressFg.setVisible(false);
    this.progressLabel.setVisible(false);

    this.hintText = this.text(480, 622, '', 14, '#e8e2f5').setOrigin(0.5, 1).setDepth(81);
  }

  update(): void {
    const hud = this.registry.get('hud') as HudState | undefined;
    if (!hud) return;
    this.levelText.setText(hud.levelName);
    this.scoreText.setText(`Puntos: ${hud.score}`);
    this.cansText.setText(`🐟 ${hud.cans} latas de atún`);
    this.heartsText.setText(`🧡 ${'♥'.repeat(Math.max(0, hud.hearts))}${'♡'.repeat(Math.max(0, 3 - hud.hearts))}`);
    this.heldText.setText(hud.held ? `En mano: ${hud.held}` : '');
    this.hintText.setText(hud.hint);

    for (let i = 0; i < this.cards.length; i++) {
      const card = this.cards[i];
      const o = hud.orders[i];
      if (!o) {
        card.bg.setVisible(false);
        card.emoji.setVisible(false);
        card.name.setVisible(false);
        card.remaining.setVisible(false);
        card.barBg.setVisible(false);
        card.barFg.setVisible(false);
        continue;
      }
      const x = 8 + i * 236;
      const y = 60;
      card.bg.setVisible(true);
      card.bg.clear();
      card.bg.fillStyle(0x000000, 0.45).fillRoundedRect(x, y, 228, 54, 8);
      card.bg.lineStyle(1, 0x9d7bff).strokeRoundedRect(x, y, 228, 54, 8);
      card.emoji.setVisible(true).setText(o.emoji).setPosition(x + 8, y + 2);
      card.name.setVisible(true).setText(o.name).setPosition(x + 42, y + 4);
      card.remaining
        .setVisible(true)
        .setText(o.remaining ? `Falta: ${o.remaining}` : '¡Lista para entregar!')
        .setPosition(x + 42, y + 24);
      card.barBg.setVisible(true).setPosition(x + 8, y + 44);
      card.barFg.setVisible(true).setPosition(x + 8, y + 44);
      const ratio = Phaser.Math.Clamp(o.timeLeft / o.timeLimit, 0, 1);
      card.barFg.setDisplaySize(216 * ratio, 7);
      card.barFg.setTint(ratio > 0.5 ? 0x7ee081 : ratio > 0.25 ? 0xffd75e : 0xff6b6b);
    }

    if (hud.showProgress) {
      this.progressBg.setVisible(true);
      this.progressBg.clear();
      this.progressBg.fillStyle(0x000000, 0.6).fillRoundedRect(378, 594, 204, 14, 6);
      this.progressFg.setVisible(true);
      this.progressFg.setDisplaySize(200 * Phaser.Math.Clamp(hud.progress, 0, 1), 10);
      this.progressFg.clearTint();
      this.progressLabel.setVisible(true).setText(hud.progressLabel);
    } else {
      this.progressBg.setVisible(false);
      this.progressFg.setVisible(false);
      this.progressLabel.setVisible(false);
    }
  }

  private text(
    x: number,
    y: number,
    value: string,
    size: number,
    color: string,
  ): Phaser.GameObjects.Text {
    return this.add
      .text(x, y, value, {
        fontFamily: 'monospace',
        fontSize: `${size}px`,
        color,
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setDepth(81);
  }
}

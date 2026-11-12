import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { GameScene } from '../scenes/GameScene';

let game: Phaser.Game | null = null;
let pending: { worldId: string; screenId: string } | null = null;

export function setPendingStart(p: { worldId: string; screenId: string }): void {
  pending = p;
}

export function getPendingStart(): { worldId: string; screenId: string } | null {
  return pending;
}

export function startGame(worldId: string, screenId: string): void {
  stopGame();
  pending = { worldId, screenId };
  game = new Phaser.Game({
    type: Phaser.AUTO,
    width: 960,
    height: 640,
    parent: 'game',
    backgroundColor: '#14101f',
    pixelArt: true,
    roundPixels: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [BootScene, GameScene],
  });
}

export function stopGame(): void {
  if (game) {
    game.destroy(true);
    game = null;
  }
}

import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { LoginScene } from './scenes/LoginScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { PartidasScene } from './scenes/PartidasScene';
import { GameScene } from './scenes/GameScene';
import { UIScene } from './scenes/UIScene';
import { ResultsScene } from './scenes/ResultsScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 960,
  height: 640,
  parent: 'game',
  backgroundColor: '#14101f',
  pixelArt: true,
  roundPixels: true,
  dom: {
    createContainer: true,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, LoginScene, MainMenuScene, PartidasScene, GameScene, UIScene, ResultsScene],
};

new Phaser.Game(config);

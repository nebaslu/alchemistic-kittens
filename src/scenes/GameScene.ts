import Phaser from 'phaser';
import { WORLDS, type ScreenDef, type WorldDef } from '../game/data/worlds';
import { INGREDIENTS } from '../game/data/ingredients';
import { RECIPES } from '../game/data/recipes';
import { Player } from '../game/Player';
import { Station } from '../game/Station';
import { Cauldron } from '../game/Cauldron';
import { OrderSystem, type Order } from '../game/OrderSystem';
import { Fx } from '../game/Fx';
import { getConfig, screenDuration } from '../game/config';
import { showHud, hideHud, updateHud, type HudState } from '../ui/hud';
import { getPendingStart } from '../game/session';
import { getTouchState, clearTouchJust } from '../game/touch';

export class GameScene extends Phaser.Scene {
  private world!: WorldDef;
  private screen!: ScreenDef;
  private player!: Player;
  private stations: Station[] = [];
  private cauldron!: Cauldron;
  private orders!: OrderSystem;
  private score = 0;
  private cans = 0;
  private timeLeft = 0;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private keyE!: Phaser.Input.Keyboard.Key;
  private keyQ!: Phaser.Input.Keyboard.Key;
  private keyEsc!: Phaser.Input.Keyboard.Key;
  private keyP!: Phaser.Input.Keyboard.Key;
  private holdStation: Station | null = null;
  private holdProgress = 0;
  private holdNeeded = 1.0;
  private mortarSlot: { ingredient: import('../game/types').IngredientId; progress: number } | null =
    null;
  private interactDistance = 92;
  private cleanSeconds = 1.5;
  private over = false;
  private hint = '';
  private readonly hud: HudState = {
    levelName: '',
    score: 0,
    cans: 0,
    timeLeft: 0,
    orders: [],
    held: '',
    hint: '',
    showProgress: false,
    progress: 0,
    progressLabel: '',
  };

  constructor() {
    super('GameScene');
  }

  init(data?: { worldId?: string; screenId?: string }): void {
    const p = data ?? getPendingStart() ?? { worldId: 'torre', screenId: 'torre-s1' };
    this.world = WORLDS.find((w) => w.id === p.worldId) ?? WORLDS[0];
    this.screen =
      this.world.screens.find((s) => s.id === p.screenId) ?? this.world.screens[0];
  }

  create(): void {
    const cfg = getConfig();
    this.score = 0;
    this.cans = 0;
    this.over = false;
    this.holdStation = null;
    this.holdProgress = 0;
    this.mortarSlot = null;
    this.holdNeeded = cfg.interaction.processSeconds;
    this.interactDistance = cfg.interaction.distance;
    this.cleanSeconds = cfg.interaction.cleanSeconds;
    this.timeLeft = screenDuration(this.screen.id);
    this.hint = 'Coge un ingrediente del puesto superior (E junto a él)';
    this.buildFloor();
    const usedIngredients = new Set(
      this.screen.pool.flatMap((d) => RECIPES[d.recipeId].steps),
    );
    this.stations = this.screen.layout
      .filter(
        (l) =>
          l.kind !== 'cauldron' &&
          !(l.kind === 'ingredient' && l.ingredient && !usedIngredients.has(l.ingredient)),
      )
      .map((l) => new Station(this, l.kind, l.x, l.y, l.ingredient, l.label));
    const c = this.screen.layout.find((l) => l.kind === 'cauldron');
    this.cauldron = new Cauldron(this, c ? c.x : 480, c ? c.y : 340);
    this.stations.push(this.cauldron.station);
    this.player = new Player(this, 480, 560, cfg.player.speed);
    this.orders = new OrderSystem({
      pool: this.screen.pool,
      maxActiveOrders: this.screen.maxActiveOrders,
    });
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as Record<
      string,
      Phaser.Input.Keyboard.Key
    >;
    this.keyE = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.keyQ = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this.keyEsc = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.keyP = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    this.hud.levelName = this.screen.name;
    showHud();
    const banner = this.add
      .text(480, 300, `${this.world.emoji} ${this.screen.name}`, {
        fontFamily: 'monospace',
        fontSize: '30px',
        color: '#ffd75e',
        stroke: '#000000',
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setDepth(70)
      .setAlpha(0);
    this.tweens.add({
      targets: banner,
      alpha: 1,
      duration: 400,
      yoyo: true,
      hold: 1200,
      onComplete: () => banner.destroy(),
    });
  }

  update(_time: number, delta: number): void {
    const dt = delta / 1000;
    if (!this.over) {
      this.timeLeft -= dt;
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        this.endMatch();
      }
      const touch = getTouchState();
      const ix =
        (this.cursors.right.isDown || this.wasd.D.isDown ? 1 : 0) -
        (this.cursors.left.isDown || this.wasd.A.isDown ? 1 : 0) +
        touch.x;
      const iy =
        (this.cursors.down.isDown || this.wasd.S.isDown ? 1 : 0) -
        (this.cursors.up.isDown || this.wasd.W.isDown ? 1 : 0) +
        touch.y;
      this.player.update(dt, { x: ix, y: iy }, this.stations);
      this.cauldron.update(
        dt,
        () => this.onCauldronExplode(),
        () => {
          Fx.sfx('ready');
          Fx.floatingText(this, this.cauldron.cx, this.cauldron.cy - 50, '¡Poción lista! 🧪', '#7ee081');
        },
        () => Fx.sfx('bubble'),
      );
      this.orders.update(dt, (o) => this.onOrderExpire(o));
      if (this.mortarSlot && this.mortarSlot.progress < this.holdNeeded) {
        this.mortarSlot.progress += dt;
        if (this.mortarSlot.progress >= this.holdNeeded) {
          this.mortarSlot.progress = this.holdNeeded;
          Fx.sfx('process');
          const def = INGREDIENTS[this.mortarSlot.ingredient];
          this.setHint(`${def.name} ${def.emoji} molido ✅ — E en el mortero para recogerlo`);
        }
      }
      this.handleInteract(dt);
      if (Phaser.Input.Keyboard.JustDown(this.keyQ) || touch.qJust) this.dropItem();
      if (
        Phaser.Input.Keyboard.JustDown(this.keyEsc) ||
        Phaser.Input.Keyboard.JustDown(this.keyP)
      ) {
        window.dispatchEvent(new CustomEvent('ak:togglepause'));
      }
      clearTouchJust();
    }
    updateHud(this.hud);
    this.refreshHud();
  }

  private handleInteract(dt: number): void {
    const near = this.player.nearest(this.stations, this.interactDistance);
    const touch = getTouchState();
    if (Phaser.Input.Keyboard.JustDown(this.keyE) || touch.eJust) {
      this.interact(near);
    }
    const eDown = this.keyE.isDown || touch.eDown;
    if (near && eDown) {
      if (
        near.kind === 'cauldron' &&
        this.cauldron.state === 'exploded' &&
        this.player.item?.kind === 'wand'
      ) {
        if (this.cauldron.cleanTick(dt, this.cleanSeconds)) {
          this.player.item = null;
          Fx.sfx('clean');
          Fx.burst(this, this.cauldron.cx, this.cauldron.cy, 0x9d7bff, 16);
          this.setHint('Caldero limpio ✨. La varita vuelve a su sitio.');
        }
      }
    } else {
      this.holdStation = null;
      this.holdProgress = 0;
    }
  }

  private interact(st: Station | null): void {
    if (!st) return;
    const item = this.player.item;
    switch (st.kind) {
      case 'ingredient': {
        if (!item && st.ingredient) {
          this.player.item = { kind: 'ingredient', ingredient: st.ingredient, processed: false };
          Fx.sfx('pickup');
          const def = INGREDIENTS[st.ingredient];
          this.setHint(`Cogiste ${def.name} ${def.emoji}`);
        } else if (item) {
          this.setHint('Ya llevas algo en las manos');
        }
        break;
      }
      case 'wandRack': {
        if (!item) {
          this.player.item = { kind: 'wand' };
          Fx.sfx('pickup');
          this.setHint('Varita miaugica 🪄 en mano');
        } else {
          this.setHint('Ya llevas algo en las manos');
        }
        break;
      }
      case 'counter': {
        if (item?.kind === 'potion' && item.potionId) {
          const res = this.orders.tryDeliver(item.potionId);
          if (res.ok && res.recipe) {
            this.score += res.points;
            this.cans += res.cans;
            this.player.item = null;
            Fx.sfx('deliver');
            Fx.floatingText(
              this,
              st.cx,
              st.cy - 46,
              `+${res.points} pts · +${res.cans} 🐟 (${Math.ceil(res.timeLeft)}s × ${getConfig().match.tipMultiplier})`,
              '#ffd75e',
            );
            this.setHint(`¡Entregado! ${res.recipe.name} 🧪`);
          } else {
            Fx.sfx('fail');
            this.setHint('Ningún pedido espera esa poción ahora (Q para tirarla)');
          }
        } else {
          this.setHint('Lleva la poción 🧪 al expendedor 🛒');
        }
        break;
      }
      case 'cauldron': {
        if (item?.kind === 'ingredient' && item.ingredient) {
          const res = this.cauldron.addIngredient(
            item.ingredient,
            item.processed ?? false,
            this.orders.active.map((o) => o.recipe),
          );
          if (res === 'ok') {
            this.player.item = null;
            Fx.sfx('drop');
            this.setHint('Al caldero 🍲');
          } else if (res === 'needsPrep') {
            const def = INGREDIENTS[item.ingredient];
            this.setHint(
              def.prep === 'none'
                ? 'Eso va directo al caldero'
                : 'Primero muélelo en el mortero 🥣',
            );
          } else {
            this.player.item = null;
            this.cauldron.explodeNow(() => this.onCauldronExplode());
          }
        } else if (this.cauldron.state === 'ready' && !item) {
          const potionId = this.cauldron.takePotion();
          if (potionId) {
            this.player.item = { kind: 'potion', potionId };
            const r = RECIPES[potionId];
            Fx.sfx('ready');
            this.setHint(`🧪 ${r.name} en frasco de cristal (no hay que lavarlo)`);
          }
        } else if (this.cauldron.state === 'exploded') {
          this.setHint(
            item?.kind === 'wand'
              ? 'Mantén E para limpiar con la varita 🪄'
              : '¡Explotó! Coge la varita 🪄 del soporte y vuelve',
          );
        } else if (this.cauldron.state === 'cooking' && !item) {
          this.cauldron.clear();
          Fx.sfx('drop');
          this.setHint('Mezcla tirada. El caldero vuelve a estar vacío 🍲');
        } else {
          this.setHint('El caldero está vacío: echa un ingrediente de un pedido activo');
        }
        break;
      }
      case 'mortar': {
        const slot = this.mortarSlot;
        if (item?.kind === 'ingredient' && item.ingredient && !item.processed) {
          const def = INGREDIENTS[item.ingredient];
          if (def.prep !== 'mortar') {
            this.setHint('Eso va directo al caldero, no se muele');
          } else if (slot) {
            this.setHint('El mortero está ocupado');
          } else {
            this.mortarSlot = { ingredient: item.ingredient, progress: 0 };
            this.player.item = null;
            Fx.sfx('drop');
            this.setHint(`${def.name} ${def.emoji} en el mortero 🥣 — se muele solo, puedes ir al caldero`);
          }
        } else if (!item && slot) {
          if (slot.progress >= this.holdNeeded) {
            this.player.item = { kind: 'ingredient', ingredient: slot.ingredient, processed: true };
            this.mortarSlot = null;
            Fx.sfx('pickup');
            const def = INGREDIENTS[slot.ingredient];
            this.setHint(`${def.name} ${def.emoji} molido ✅. Al caldero 🍲`);
          } else {
            this.setHint('Se está moliendo en el mortero 🥣...');
          }
        } else {
          this.setHint('Deja un ingrediente aquí (E) o recógelo molido (E)');
        }
        break;
      }
    }
  }

  private dropItem(): void {
    const item = this.player.item;
    if (!item) return;
    this.player.item = null;
    Fx.sfx('drop');
    const label =
      item.kind === 'potion'
        ? 'la poción 🧪'
        : item.kind === 'wand'
          ? 'la varita 🪄'
          : `${INGREDIENTS[item.ingredient!].name} ${INGREDIENTS[item.ingredient!].emoji}`;
    this.setHint(`Tiraste ${label} (Q)`);
  }

  private onCauldronExplode(): void {
    Fx.sfx('explode');
    Fx.shake(this);
    Fx.burst(this, this.cauldron.cx, this.cauldron.cy, 0xff5533, 40);
    Fx.floatingText(this, this.cauldron.cx, this.cauldron.cy - 50, '💥 ¡EXPLOTÓ!', '#ff5533');
    this.setHint('¡El caldero explotó! Coge la varita 🪄 y límpialo (mantén E)');
  }

  private onOrderExpire(o: Order): void {
    Fx.sfx('fail');
    Fx.floatingText(this, 480, 130, `Pedido expirado: ${o.recipe.name} ${o.recipe.emoji}`, '#ff6b6b');
    this.setHint(`Se acabó el tiempo de ${o.recipe.name}. ¡A por el siguiente!`);
  }

  private endMatch(): void {
    if (this.over) return;
    this.over = true;
    hideHud();
    window.dispatchEvent(
      new CustomEvent('ak:gameover', {
        detail: {
          worldId: this.world.id,
          screenId: this.screen.id,
          score: this.score,
          cans: this.cans,
        },
      }),
    );
  }

  private setHint(text: string): void {
    this.hint = text;
  }

  private refreshHud(): void {
    const h = this.hud;
    h.score = this.score;
    h.cans = this.cans;
    h.timeLeft = Math.max(0, this.timeLeft);
    h.held = this.player.item ? Player.itemEmoji(this.player.item) : '';
    h.hint = this.hint;
    h.orders = this.orders.active.map((o) => {
      const cauldronHas = this.cauldron.contents;
      const remaining = o.recipe.steps
        .filter((s) => !cauldronHas.includes(s))
        .map((s) => INGREDIENTS[s].emoji)
        .join('');
      return {
        emoji: o.recipe.emoji,
        name: o.recipe.name,
        timeLeft: Math.max(0, o.timeLeft),
        timeLimit: o.timeLimit,
        remaining,
      };
    });
    const cleaning =
      this.cauldron.state === 'exploded' &&
      this.player.item?.kind === 'wand' &&
      this.player.nearest(this.stations, this.interactDistance)?.kind === 'cauldron';
    const grinding = this.mortarSlot !== null && this.mortarSlot.progress < this.holdNeeded;
    h.showProgress = cleaning || grinding;
    h.progress = cleaning
      ? this.cauldron.cleanProgress
      : grinding
        ? this.mortarSlot!.progress / this.holdNeeded
        : 0;
    h.progressLabel = cleaning ? 'Limpiando con varita 🪄' : 'Moliendo en el mortero 🥣...';
  }

  private buildFloor(): void {
    const rt = this.add
      .renderTexture(0, 0, 960, 640)
      .setOrigin(0, 0)
      .setDepth(0);
    for (let row = 0; row < 40; row++) {
      for (let col = 0; col < 18; col++) {
        const x = col * 64 + (row % 2) * 32 - 32;
        const y = 48 + row * 16;
        rt.draw((row + col) % 2 === 0 ? 'floor' : 'floor-b', x, y);
      }
    }
  }
}

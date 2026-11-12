# alchemistic-kittens

Demo jugable de **Alchemistic Kittens**: gatitos alquimistas en una torre de mago preparan y venden pociones. Vista isométrica, estilo Overcooked, Phaser.js + TypeScript + Vite. 3 niveles.

## Instalación y ejecución

```bash
npm install
npm run dev      # servidor de desarrollo
npm run build    # tsc --noEmit + vite build -> dist/
npm run preview  # sirve el build
```

## Con Docker (sin instalar Node ni dependencias)

Solo necesitas Docker. El `Dockerfile` es multi-stage: compila con `node:22-alpine` (`npm ci` + `npm run build`) y sirve el `dist/` con `nginx:1.27-alpine` en el puerto 8080 del contenedor.

```bash
./run.sh            # compila la imagen y sirve el juego en http://localhost:8080
PORT=3000 ./run.sh  # en otro puerto local
./run.sh build      # solo compila la imagen (sin arrancar)
```

El contenedor se publica solo en loopback (`127.0.0.1`), no se expone a la red. Ctrl+C detiene y elimina el contenedor (`--rm`).

## Cómo se juega

- **WASD / flechas**: moverse. **E**: interactuar (mantén E para moler, cortar o limpiar).
- Coge ingredientes del puesto superior, prepáralos en el **almirez 🥣** (muele) o la **tabla 🔪** (corta), échalos al **caldero 🍲**, espera a que la poción esté lista, sácala (entra en **frasco de cristal 🧪**, no se lava) y entrégala en el **expendedor 🛒** antes de que se acabe el tiempo.
- **Propina**: segundos restantes × 1.5 latas de atún 🐟 (30 s × 1.5 = 45 🐟).
- Si mezclas mal o se quema el caldero: **explota 💥** y hay que limpiarlo con la **varita miaugica 🪄**.
- 3 pedidos expirados = game over. Completa los 3 niveles para ganar.

## Estructura

- `src/main.ts` — config Phaser (960×640, FIT, pixelArt).
- `src/scenes/` — BootScene (texturas procedurales), MenuScene, GameScene (lógica), UIScene (HUD), EndScene.
- `src/game/` — `Player`, `Station`, `Cauldron`, `OrderSystem`, `Fx` (SFX WebAudio + partículas).
- `src/game/data/` — `ingredients.ts`, `recipes.ts`, `levels.ts` (datos puros, editables).
- `docs/GDD.md` — diseño del juego.

Los assets visuales son procedurales (Graphics de Phaser + emoji) para que la demo no dependa de archivos externos.

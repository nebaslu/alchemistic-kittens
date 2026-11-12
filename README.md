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

## Flujo de menús

1. **Login**: usuario y contraseña (demo local: cualquier valor; la sesión se guarda en `localStorage`).
2. **Menú principal**: Jugar (→ partidas) o Salir (cierra sesión → login).
3. **Partidas**: rascadores (demo: 1, el 🗼 Rascador de la Torre del Mago) con 3 pantallas cada uno. La primera pantalla está desbloqueada; las siguientes se desbloquean al conseguir el **atún de plata** (🐟 teñido de plata) en la pantalla anterior. Al pulsar una pantalla desbloqueada aparece un **modal** con *Empezar partida* o *Cerrar*. Botón *← Volver* regresa al menú principal.
4. **Partida**: duración fija de **3 min** (sin vidas). Al acabarse el tiempo → pantalla de resultados.
5. **Resultados**: rascador con 3 latas de atún coloreadas (**atún de bronce** / **atún de plata** / **atún de oro**) y contadores **N/M** (N = latas ganadas, M = mínimo para ese atún). Al llegar N = M y seguir creciendo, se llena la siguiente lata; solo la de oro puede superar su M. Abajo: **Volver a jugar** o **Salir** (→ partidas).

## Cómo se juega la partida

- **WASD / flechas**: moverse. **E**: interactuar (mantén E para moler, cortar o limpiar). **Q**: tira lo que llevas en mano.
- Coge ingredientes del puesto superior, prepáralos en el **almirez 🥣** (muele) o la **tabla 🔪** (corta), échalos al **caldero 🍲**, espera a que la poción esté lista, sácala (entra en **frasco de cristal 🧪**, no se lava) y entrégala en el **expendedor 🛒** antes de que se acabe el tiempo del pedido.
- **Propina**: segundos restantes × 1.5 latas de atún 🐟 (30 s × 1.5 = 45 🐟).
- Si mezclas mal o se quema el caldero: **explota 💥** y hay que limpiarlo con la **varita miaugica 🪄**.

## Estructura

- `src/main.ts` — config Phaser (960×640, FIT, pixelArt, DOM para el login).
- `src/scenes/` — Boot, Login, MainMenu, Partidas (con modal), Game, UIScene (HUD), Results.
- `src/game/` — `Player`, `Station`, `Cauldron`, `OrderSystem`, `Fx` (SFX WebAudio + partículas), `progress.ts` (sesión y atunes bronce/plata/oro por usuario).
- `src/game/data/` — `ingredients.ts`, `recipes.ts`, `worlds.ts` (rascadores → pantallas → pedidos, layout y umbrales de atún; datos puros, editables).
- `docs/GDD.md` — diseño del juego.

Los assets visuales son procedurales (Graphics de Phaser + emoji) para que la demo no dependa de archivos externos.

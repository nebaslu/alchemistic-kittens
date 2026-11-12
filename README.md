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

## Arquitectura

Los **menús y el HUD son HTML/CSS plano** (`index.html` + `src/ui/screens.ts` + `src/ui/hud.ts`); **Phaser solo monta la partida** (`src/scenes/BootScene.ts` + `GameScene.ts`), creado al empezar y destruido al acabar (`src/game/session.ts`).

## Flujo de menús

1. **Login**: usuario y contraseña (demo local: cualquier valor; la sesión se guarda en `localStorage`).
2. **Menú principal**: Jugar (→ partidas) o Salir (cierra sesión → login).
3. **Partidas**: rascadores (demo: 1, el 🗼 Rascador de la Torre del Mago) con 3 pantallas cada uno. La primera pantalla está desbloqueada; las siguientes se desbloquean al conseguir el **atún de plata** (🐟 de plata) en la pantalla anterior. Al pulsar una pantalla desbloqueada aparece un **modal** con *Empezar partida* o *Cerrar*. Botón *← Volver* regresa al menú principal.
4. **Partida**: duración fija (configurable, por defecto **3 min**, sin vidas). Al acabarse el tiempo → pantalla de resultados.
5. **Resultados**: rascador con 3 latas de atún coloreadas (**atún de bronce** / **atún de plata** / **atún de oro**) y contadores **N/M** (N = latas ganadas, M = mínimo para ese atún). Al llegar N = M y seguir creciendo, se llena la siguiente lata; solo la de oro puede superar su M. Abajo: **Volver a jugar** o **Salir** (→ partidas).

## Configuración básica sin tocar código

`public/config/game.config.json` se copia tal cual al build (`dist/config/game.config.json`) y se carga en runtime con `fetch`, así que puedes editarlo **después del build** y recargar la página:

```json
{
  "match": { "durationSeconds": 180, "tipMultiplier": 1.5 },
  "player": { "speed": 235 },
  "interaction": { "distance": 92, "processSeconds": 1.0, "cleanSeconds": 1.5 },
  "screens": { "torre-s1": { "durationSeconds": 180 } },
  "medals": { "torre-s1": { "bronze": 150, "silver": 300, "gold": 500 } }
}
```

- `match.durationSeconds`: duración de cada partida. `match.tipMultiplier`: multiplicador de la propina (segundos restantes × multiplicador = latas de atún).
- `player.speed`: velocidad del gatito. `interaction`: distancia de interacción, segundos para moler/cortar y para limpiar el caldero.
- `screens`: override de duración por pantalla. `medals`: umbrales de atún bronce/plata/oro por pantalla.
- Si el JSON falla o falta, se usan los valores por defecto de `src/game/config.ts`.

## Cómo se juega la partida

- **WASD / flechas**: moverse. **E**: interactuar (mantén E para moler, cortar o limpiar). **Q**: tira lo que llevas en mano.
- Coge ingredientes del puesto superior, prepáralos en el **almirez 🥣** (muele) o la **tabla 🔪** (corta), échalos al **caldero 🍲**, espera a que la poción esté lista, sácala (entra en **frasco de cristal 🧪**, no se lava) y entrégala en el **expendedor 🛒** antes de que se acabe el tiempo del pedido.
- **Propina**: segundos restantes × 1.5 latas de atún 🐟 (30 s × 1.5 = 45 🐟).
- Si mezclas mal o se quema el caldero: **explota 💥** y hay que limpiarlo con la **varita miaugica 🪄**.

## Estructura

- `index.html` — todas las pantallas de menú/HUD en HTML+CSS.
- `src/main.ts` — carga el config JSON e inicia la UI.
- `src/ui/` — `screens.ts` (login, principal, partidas+modal, resultados), `hud.ts` (HUD en vivo).
- `src/scenes/` — solo la partida en Phaser: `BootScene` (texturas), `GameScene` (lógica).
- `src/game/` — `session.ts` (crea/destruye Phaser por partida), `config.ts` (carga del JSON), `Player`, `Station`, `Cauldron`, `OrderSystem`, `Fx`, `progress.ts` (sesión y atunes por usuario).
- `src/game/data/` — `ingredients.ts`, `recipes.ts`, `worlds.ts` (contenido: rascadores → pantallas → pool de pedidos y layout).
- `public/config/game.config.json` — parámetros ajustables sin recompilar.
- `docs/GDD.md` — diseño del juego.

Los assets visuales son procedurales (Graphics de Phaser + emoji) para que la demo no dependa de archivos externos.

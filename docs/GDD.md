# GDD ligero — Alchemistic Kittens (demo)

## Concepto en una frase
Gatitos alquimistas en una torre de mago preparan y venden pociones (estilo Overcooked, vista isométrica, pixel art).

## Público y plataforma
Jugador casual web (sesiones de 2–10 min), escritorio y móvil; Phaser.js + TypeScript + Vite, `Phaser.Scale.FIT`.

## Core loop
1. Aparece un pedido de poción con temporizador.
2. Coges ingredientes en el puesto superior.
3. Los preparas en la estación correcta (almirez 🥣 muele · tabla 🔪 corta · los de `prep: none` van directos).
4. Los echas al caldero 🍲 en el orden de la receta; la poción cocina `cookTime` segundos.
5. Sacas la poción (entra sola en frasco de cristal 🧪, no se lava) y la entregas en el expendedor 🛒.
6. Recompensa: puntos base + **propina = segundos restantes × 1.5 latas de atún** (30 s × 1.5 = 45 🐟).

## Fracaso y recuperación
- Mezclar un ingrediente que no va en ningún pedido activo → **explosión 💥**.
- Dejar la mezcla demasiado tiempo en el fuego (`burnTime`) → **explosión 💥**.
- Caldero explotado = inutilizable hasta limpiarlo con la **varita miaugica 🪄** (cogerla del soporte, volver, mantener E 1.5 s).
- Pedido expirado = −1 🧡. A 0 corazones → game over.

## Progresión (demo: 3 pantallas en el rascador 🗼)
Los pedidos llegan en flujo continuo durante los 3 min de partida (pool aleatorio por pantalla, hasta `maxActiveOrders` activos a la vez):

| Pantalla | Pool de recetas | Activos | Complejidad | Atún 🐟 bronce/plata/oro (umbral en latas) |
|---|---|---|---|---|
| 1 · Sótano | Ronroneo ★ (70 s) | 1 | 1 ingrediente, sin quema | 150 / 300 / 500 |
| 2 · Sala del caldero | Ronroneo ★ 80 s, Anti-Pelos ★★ 95 s, Sirena ★★ 95 s | 2 | 2 ingredientes, quema 28–30 s | 200 / 400 / 650 |
| 3 · Ático | Anti-Pelos ★★ 85 s, Sirena ★★ 85 s, Gato Montés ★★★ 100 s, Ronroneo ★ 70 s | 3 | 3 ingredientes, quema 24 s | 120 / 250 / 400 |

Balance: propina = segundos restantes del pedido × 1.5 🐟 (regla fija). Una entrega rápida de 70 s da ~100 🐟; en 180 s caben unas 6–8 entregas en pantalla 1 (~500–700 🐟 si se juega bien), por eso los umbrales de atún están en cientos, no en decenas.

## Arquitectura técnica
Menús y HUD en HTML/CSS plano (`index.html`, `src/ui/`); Phaser solo para la partida (`src/scenes/`), creado al empezar y destruido al terminar (`src/game/session.ts`). Configuración básica ajustable sin recompilar en `public/config/game.config.json` (duración de partida, velocidad, multiplicador de propina, tiempos de proceso/limpieza, umbrales de atún por pantalla), cargado en runtime con `fetch`.

## Esquema de navegación

```
Boot ──► Login ──► Menú principal ──[Jugar]──► Partidas (rascadores 🗼)
           ▲          │                            │  ▲
           │          │[Salir]                     │  │[← Volver]
           └──────────┘                            ▼  │
                                             Modal: [▶ Empezar] / [✖ Cerrar]
                                                       │ Empezar
                                                       ▼
                                              Partida (3 min, sin vidas)
                                                       │ tiempo agotado
                                                       ▼
                                              Resultados (latas N/M de atún bronce/plata/oro)
                                                       │ ↻ Volver a jugar → Partida (misma pantalla)
                                                       │ ↩ Salir → Partidas
```

## Flujo de menús y progresión entre pantallas
- **Login** (usuario/contraseña, demo local en `localStorage`) → **menú principal** (Jugar / Salir) → **partidas** (rascadores; demo: 1 rascador 🗼 con 3 pantallas) → modal *Empezar/Cerrar* → **partida** → **resultados**.
- Cada partida dura **3 min** fijos; no hay vidas. Al terminar va a resultados.
- **Resultados**: 3 latas de atún coloreadas (**atún de bronce** / **atún de plata** / **atún de oro**) con contador **N/M** (N = latas ganadas, M = umbral de ese atún). Umbrales acumulativos por pantalla; al superar M de una lata, la siguiente empieza a llenarse; solo la de oro puede tener N > M. El atún conseguido se muestra como pez teñido 🐟. Botones abajo: *Volver a jugar* y *Salir*.
- **Desbloqueo**: la pantalla 1 siempre disponible; la pantalla k+1 se desbloquea con **atún de plata** (o de oro) en la pantalla k, mostrado como 🐟 teñido en su tarjeta. Progreso por usuario en `localStorage` (`ak-progress-<user>`).
- Navegación: Volver en partidas → menú principal; Salir en principal → login.

## Controles
WASD / flechas = moverse · **E** = interactuar (mantener E = moler / cortar / limpiar).

## Economía interna
Moneda: latas de atún 🐟 (propina por rapidez). Puntos base por receta (10/20/25/40). Sin costes; la tensión viene del tiempo y de no desperdiciar calderos.

## Recetas
- 🍵 Poción de Ronroneo ★ — hierba gatera (tabla) → caldero
- 🧴 Antídoto Anti-Pelos ★★ — bola de pelos (almirez) + maullido 3AM (almirez) → caldero
- 🧪 Dulce Lágrima de Sirena ★★ — lágrima de sirena (directa) + polvo de hadas (almirez) → caldero
- ⚗️ Poción del Gato Montés ★★★ — hierba gatera (tabla) + cuerda de rascador (tabla) + lágrima de sirena (directa) → caldero

## Ingredientes
🌿 hierba gatera (tabla) · 🟤 bola de pelos (almirez) · 😾 maullido 3AM (almirez) · ✨ polvo de hadas (almirez) · 💧 lágrima de sirena (directa) · 🧶 cuerda de rascador (tabla)

## Game juice
Shake + partículas al explotar, burbujas y SFX al cocinar, textos flotantes de recompensa, banner de nivel, SFX procedural (WebAudio), `prefers-reduced-motion` respetado.

## Riesgos
- Emoji dependent de la fuente del sistema (fallback: texto monocroma).
- Colisión manual AABB (sin física arcade) para demo isométrica.
- Un pedido por poción: si cocinas una poción sin pedido activo, no se puede entregar (aviso en HUD).

## Cambios accionables priorizados
- P0: build `tsc --noEmit && vite build` limpio; 3 niveles completables end-to-end.
- P1: tutorial contextual en nivel 1 (hints ya implementados como línea de ayuda inferior).
- P2: controles táctiles (joystick virtual) para móvil; sprites pixel art propios en vez de emoji.

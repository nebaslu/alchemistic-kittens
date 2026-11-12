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

## Progresión (demo: 3 niveles)
| Nivel | Pedidos | Pedidos activos | Complejidad |
|---|---|---|---|
| 1 · Aprendiz | 2 × Poción de Ronroneo (★) | 1 | 1 ingrediente, sin quema (burnTime alto) |
| 2 · Oficial | Ronroneo ★, Antídoto Anti-Pelos ★★, Dulce Lágrima de Sirena ★★ | 2 | 2 ingredientes, quema a los 28–30 s |
| 3 · Maestro | Anti-Pelos ★★, Sirena ★★, Poción del Gato Montés ★★★, Ronroneo ★ | 3 | 3 ingredientes, quema a los 24 s |

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

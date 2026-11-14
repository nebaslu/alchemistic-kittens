# Propuesta de estilos artísticos — Alchemistic Kittens

Tema común: **gatos alquimistas** (gatitos con sombrero de mago), rascadores, pociones de varios estilos, mazmorra/torre, alambiques, mecheros, chimeneas, calderos, libros de hechizos. Mocks en `docs/art-styles/*.png`.

| # | Estilo | Mock | Paleta | Dónde buscar assets (CC0/CC-BY) | Esfuerzo | Pros | Contras |
|---|---|---|---|---|---|---|---|
| 1 | **Pixel art isométrico 2:1** (el actual, estilo Kenney) | `1-pixel-iso.png` | morados piedra, madera, verde poción | Kenney `isometric-miniature-dungeon` (ya tenemos) + OGA "Alchemy Tools" (caldero, mortero, alambique) + game-icons.net (pociones) | bajo (ya integrado) | ya funciona en el juego, móvil OK | menos "mago" de momento |
| 2 | **Cartoon vector plano** (contornos gruesos, colores vivos) | `2-cartoon.png` | crema, naranja, marrón cálido | Kenney packs estilo "cartoon"; unDraw/itch vector cats; game-icons para UI | medio | muy legible en móvil, simpático | hay que rehacer tiles/props a vector |
| 3 | **Chibi/kawaii top-down 32×32** | `3-chibi.png` | rosa pastel, blanco, lila | itch.io tag `cats`+`kawaii` (Cat Pack Mochi/Pochi); OGA "LPC" style; OpenGameArt chibi items | medio | gatitos adorables, sprites pequeños (rápido) | menos "mazmorra", más casual |
| 4 | **Gothic dark mazmorra** (velas, púrpura+naranja) | `4-gothic.png` | negro/púrpura, naranja fuego, verde tóxico | OGA "dark dungeon tileset", "isometric dungeon" oscuros; Kenney "roguelike" pack | medio-alto | atmósfera de torre de mago fuerte, chimeneas/alambiques encajan | menos amigable, más trabajo de paleta |

## Elementos temáticos a conseguir (en cualquiera de los estilos)
- Gatito con **sombrero de mago** (sprite del jugador) — buscar "witch cat pixel art" / "cat with wizard hat".
- **Rascador** (torre/isla en el menú de partidas) — props tipo poste+plataformas.
- **Pociones de varios estilos** (redonda, alta, con corcho, burbujeante) — OGA "CC0 potion icons" / game-icons "potion".
- **Alambique, mortero, mechero ( hornillo ), chimenea, libros de hechizos, caldero** — OGA "Alchemy Tools" (CC0) cubre la mayoría.

## Recomendación del director
Quedarnos con **#1 pixel art isométrico** (ya integrado y funcionando en móvil) y potenciarlo con assets de alquimia/gatos (OGA + game-icons + un pack de gatitos), y usar **#4 gothic** como *skin alternativa* de paleta (mismos sprites, recolor) para la torre en nivel alto. #2/#3 como dirección si queremos pivotar a algo más casual.

## Siguientes pasos accionables
1. Descargar en `assets-src/`: OGA "Alchemy Tools", OGA "CC0 potion icons", un pack de gatito con sombrero (itch cats), game-icons (pociones/UI).
2. Integrarlos con `scripts/apply-kenney.py` (ampliado) → `public/assets/`.
3. Re-mock de pantallas con el nuevo estilo elegido.

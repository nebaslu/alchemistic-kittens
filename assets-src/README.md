# Assets descargados a mano

Deja aquí los packs que descargues, en una carpeta por pack:

```
assets-src/
  kenney-isometric-dungeon/     <- zip descomprimido
  game-icons/                   <- PNG/SVG sueltos que elijas
  ...
```

Y apunta autores + licencia en `assets-src/CREDITS.md` (CC0 no obliga, CC-BY sí exige atribución).

## Cómo los integro yo
- Copio los PNG que elijamos a `public/assets/<nombre>.png` (mismo nombre = reemplaza el procedural).
- Registro las nuevas texturas en `src/scenes/BootScene.ts` (`ASSETS`) y las mapeo en `Station` / `Cauldron` / `Player`.
- Regenero los procedurales con `python3 scripts/gen-assets.py` solo si faltara alguno.

## Formatos
- PNG con fondo transparente, pixel-art (32×32 / 64×32 tiles isométricas / sprites 32–64 px).
- Si un pack trae atlas (spritesheet + JSON de TexturePacker), dime cuál y lo cargo como `this.load.atlas`.

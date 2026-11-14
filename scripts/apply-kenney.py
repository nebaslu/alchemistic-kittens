#!/usr/bin/env python3
"""Recorta y escala los PNG de Kenney Isometric Miniature Dungeon a public/assets/."""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
PACK = ROOT / "public" / "assets" / "kenney_isometric-miniature-dungeon"
OUT = ROOT / "public" / "assets"


def cell(png: str, row: int = 3, cw: int = 256, ch: int = 128) -> Image.Image:
    im = Image.open(PACK / png).convert("RGBA")
    return im.crop((0, row * ch, cw, (row + 1) * ch))


def full(png: str) -> Image.Image:
    return Image.open(PACK / png).convert("RGBA")


def save(img: Image.Image, name: str, size: tuple[int, int] | None = None) -> None:
    if size:
        img = img.resize(size, Image.NEAREST)
    img.save(OUT / f"{name}.png")
    print(name, img.size)


# Suelo: hoja floor.png nueva (celda 4 = losa limpia con vetas) como tile base,
# y stoneUneven como variante alterna (checkerboard) — ambos 64x32 como el grid
save(cell("Isometric/floor_S.png", 3) if False else Image.open(ROOT / "public" / "assets" / "floor.png"), "floor-new-hoja")
hoja = Image.open(ROOT / "public" / "assets" / "floor-new-hoja.png").convert("RGBA")
save(hoja.crop((0, 3 * 128, 256, 4 * 128)), "floor", (64, 32))
save(cell("Isometric/stoneUneven_S.png", 3), "floor-b", (64, 32))

# Estaciones (fila 4), escaladas a la mitad
save(cell("Angle/tableShort_S.png", 3), "station-mortar", (128, 64))
save(cell("Angle/tableRound_S.png", 3), "station-counter", (128, 64))
save(cell("Angle/chestOpen_S.png", 3), "station-wand", (128, 64))
save(cell("Angle/barrel_S.png", 3), "station-ingredient", (96, 48))

# Personaje: sprites completos escalados a 64x128
save(full("Characters/Male/Male_0_Idle0.png"), "char-idle", (64, 128))
for i in range(10):
    save(full(f"Characters/Male/Male_0_Run{i}.png"), f"char-run{i}", (64, 128))

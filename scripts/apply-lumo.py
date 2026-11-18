#!/usr/bin/env python3
"""Extrae sprites de las propuestas Lumo/Gemini (assets-src/) y los aplica al juego.

- Hojas con sprites sobre fondo liso (20.04(2), 20.05, 20.05(1), 20.05(2)):
  detecta el color de fondo, segmenta componentes conectados y recorta cada sprite
  con fondo transparente -> public/assets/<nombre>.png
- Escenas/UI completas (1280x720 y el JPEG Gemini): se copian a public/assets/art/
  para usarlas como fondos de pantallas HTML.

Uso: python3 scripts/apply-lumo.py detect   (hoja de contacto en .vibe/previews/)
     python3 scripts/apply-lumo.py apply    (escribe los sprites nombrados)
"""
import os
import sys
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'assets-src', 'Propuesta UXUI Lumo')
SRC_GEMINI = os.path.join(ROOT, 'assets-src', 'Propuesta UXUI Gemini')
OUT = os.path.join(ROOT, 'public', 'assets')
ART = os.path.join(OUT, 'art')
PREV = os.path.join(ROOT, '.vibe', 'previews')

# Hojas de sprites sobre fondo liso -> componentes esperados (izq->der, arr->abajo)
SHEETS = {
    'Lumo generated 2026-11-14 20.04 (2).png': 'stations',   # mortero, tabla, 3 calderos, varita, estanteria
    'Lumo generated 2026-11-14 20.05.png': 'potions1',        # cáliz naranja + 3 frascos
    'Lumo generated 2026-11-14 20.05 (1).png': 'potions2',    # cáliz naranja + poción azul/rosa/marrón
    'Lumo generated 2026-11-14 20.05 (2).png': 'icons',       # peces en marcos, corazones, varita, estrellas, frasco
}

# Escenas completas -> fondos HTML
SCENES = {
    'Lumo generated 2026-11-14 19.42.png': 'lumo-kitchen.png',
    'Lumo generated 2026-11-14 19.42 (2).png': 'lumo-kitchen-ui.png',
    'Lumo generated 2026-11-14 19.42 (3).png': 'lumo-menu.png',
    'Lumo generated 2026-11-14 19.42 (4).png': 'lumo-cauldrons.png',
    'Lumo generated 2026-11-14 20.04.png': 'lumo-hero.png',
    'Lumo generated 2026-11-14 20.05 (3).png': 'lumo-room.png',
}

# Nombre de cada componente recortado, en orden de aparición (izq->der, arr->abajo)
SPRITE_NAMES = {
    'stations': ['lumo-mortar', 'lumo-table', 'lumo-cauldron', 'lumo-cauldron2', 'lumo-cauldron3', 'lumo-wand', 'lumo-shelf', 'lumo-cauldron4'],
    'potions1': ['lumo-chalice', 'lumo-flask-blue', 'lumo-flask-pink', 'lumo-flask-brown', 'lumo-extra1'],
    'potions2': ['lumo-potion-orange', 'lumo-potion-blue', 'lumo-potion-pink', 'lumo-potion-brown', 'lumo-extra2'],
    'icons': ['lumo-fish-bronze', 'lumo-fish-silver', 'lumo-fish-gold', 'lumo-heart', 'lumo-heart2', 'lumo-wand', 'lumo-star', 'lumo-star2', 'lumo-flask'],
}

# Sprites Lumo que sustituyen directamente a PNG que ya carga el juego (misma ruta/nombre)
OVERRIDES = {
    'lumo-potion-pink': 'potion-ronroneo.png',
    'lumo-potion-blue': 'potion-sirena.png',
    'lumo-potion-orange': 'potion-montes.png',
    'lumo-potion-brown': 'potion-antiPelos.png',
    'lumo-star': 'star.png',
    'lumo-mortar': 'station-mortar.png',
    'lumo-wand': 'station-wand.png',
    'lumo-shelf': 'station-ingredient.png',
    'lumo-cauldron': 'cauldron.png',
    'lumo-cauldron2': 'cauldron-ready.png',
}

# Tamaño objetivo (alto en px) por sprite según su uso en el juego
SPRITE_HEIGHT = {
    'lumo-mortar': 64, 'lumo-table': 64, 'lumo-cauldron': 64, 'lumo-cauldron2': 64,
    'lumo-cauldron3': 64, 'lumo-cauldron4': 64, 'lumo-wand': 64, 'lumo-shelf': 64,
    'lumo-chalice': 48, 'lumo-flask-blue': 48, 'lumo-flask-pink': 48, 'lumo-flask-brown': 48,
    'lumo-potion-orange': 48, 'lumo-potion-blue': 48, 'lumo-potion-pink': 48, 'lumo-potion-brown': 48,
    'lumo-fish-bronze': 32, 'lumo-fish-silver': 32, 'lumo-fish-gold': 32,
    'lumo-heart': 24, 'lumo-heart2': 24, 'lumo-wand': 32, 'lumo-star': 24, 'lumo-star2': 24,
    'lumo-flask': 48,
}


def segment(path):
    """Devuelve lista de (bbox, imagen RGBA recortada) de los componentes sobre fondo liso."""
    im = Image.open(path).convert('RGB')
    a = np.asarray(im).astype(np.int16)
    bg = a[0, 0]
    dist = np.abs(a - bg).sum(axis=2)
    mask = dist > 60
    # limpiar ruido: erosión+dilatación
    mask = ndimage.binary_opening(mask, structure=np.ones((3, 3)))
    lab, n = ndimage.label(mask)
    comps = []
    for i in range(1, n + 1):
        ys, xs = np.where(lab == i)
        if len(xs) < 400:
            continue
        x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
        comps.append(((x0, y0, x1, y1), len(xs)))
    comps.sort(key=lambda c: (c[0][1] // 100, c[0][0]))  # arr->abajo, izq->der
    out = []
    for (x0, y0, x1, y1), _area in comps:
        crop = im.crop((x0, y0, x1 + 1, y1 + 1)).convert('RGBA')
        px = np.array(crop)
        bgc = np.append(bg, 255)
        d = np.abs(px[:, :, :3].astype(np.int16) - bg[:3]).sum(axis=2)
        px[:, :, 3] = np.where(d > 60, 255, 0)
        out.append(((x0, y0, x1, y1), Image.fromarray(px, 'RGBA')))
    return im, out


def detect():
    os.makedirs(PREV, exist_ok=True)
    for fname, key in SHEETS.items():
        im, comps = segment(os.path.join(SRC, fname))
        print(f'{fname}: {len(comps)} componentes')
        sheet = im.copy()
        d = ImageDraw.Draw(sheet)
        for i, ((x0, y0, x1, y1), _c) in enumerate(comps):
            d.rectangle([x0, y0, x1, y1], outline=(255, 0, 0), width=3)
            d.text((x0 + 4, y0 + 4), f'{i}:{SPRITE_NAMES.get(key, [])[i] if i < len(SPRITE_NAMES.get(key, [])) else "?"}', fill=(255, 255, 0))
        sheet.save(os.path.join(PREV, f'components-{key}.png'))
        print('  ->', os.path.join(PREV, f'components-{key}.png'))


def apply():
    os.makedirs(OUT, exist_ok=True)
    os.makedirs(ART, exist_ok=True)
    for fname, key in SHEETS.items():
        _im, comps = segment(os.path.join(SRC, fname))
        names = SPRITE_NAMES.get(key, [])
        for i, (_bbox, crop) in enumerate(comps):
            name = names[i] if i < len(names) else f'{key}-{i}'
            h = SPRITE_HEIGHT.get(name, 64)
            w = max(1, round(crop.width * h / crop.height))
            sprite = crop.resize((w, h), Image.LANCZOS)
            sprite.save(os.path.join(OUT, f'{name}.png'))
            print(f'  {name}.png {sprite.size}')
            if name in OVERRIDES:
                sprite.save(os.path.join(OUT, OVERRIDES[name]))
                print(f'    -> sobreescribe {OVERRIDES[name]}')
    for fname, out in SCENES.items():
        Image.open(os.path.join(SRC, fname)).convert('RGB').save(os.path.join(ART, out))
        print(f'  art/{out}')
    g = os.path.join(SRC_GEMINI, 'Gemini_Generated_Image_ldfxp8ldfxp8ldfx.jpeg')
    Image.open(g).convert('RGB').save(os.path.join(ART, 'gemini-pause.jpg'), quality=88)
    print('  art/gemini-pause.jpg')


if __name__ == '__main__':
    mode = sys.argv[1] if len(sys.argv) > 1 else 'detect'
    if mode == 'detect':
        detect()
    else:
        apply()

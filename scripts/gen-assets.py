#!/usr/bin/env python3
import math
from pathlib import Path

from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parent.parent / "public" / "assets"
OUT.mkdir(parents=True, exist_ok=True)

WOOD = (107, 74, 47)
WOOD_DARK = (84, 55, 31)
WOOD_EDGE = (58, 39, 22)
STONE = (106, 111, 125)
STONE_EDGE = (69, 74, 87)
IRON = (43, 43, 51)
IRON_DARK = (23, 23, 29)
GREEN = (126, 224, 129)
ORANGE = (255, 120, 60)


def save(img: Image.Image, name: str) -> None:
    img.save(OUT / f"{name}.png")
    print(name, img.size)


def diamond(d: ImageDraw.ImageDraw, cx: int, cy: int, w: int, h: int, fill, outline=None, width=1):
    pts = [(cx, cy - h // 2), (cx + w // 2, cy), (cx, cy + h // 2), (cx - w // 2, cy)]
    d.polygon(pts, fill=fill, outline=outline, width=width)


def gen_floor() -> None:
    img = Image.new("RGBA", (64, 32), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    diamond(d, 32, 16, 64, 32, WOOD, WOOD_EDGE, 2)
    for i, y in enumerate((10, 16, 22)):
        d.line([(6 + i * 3, y), (58 - i * 3, y)], fill=WOOD_DARK, width=1)
    d.ellipse([28, 12, 36, 20], fill=WOOD_DARK)
    save(img, "floor")


def gen_base() -> None:
    img = Image.new("RGBA", (96, 48), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    diamond(d, 48, 24, 96, 48, STONE, STONE_EDGE, 2)
    d.line([(10, 20), (86, 20)], fill=STONE_EDGE, width=1)
    d.line([(14, 28), (82, 28)], fill=STONE_EDGE, width=1)
    save(img, "base")


def gen_cauldron(ready: bool = False, boom: bool = False) -> None:
    name = "cauldron-boom" if boom else ("cauldron-ready" if ready else "cauldron")
    img = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.ellipse([18, 6, 46, 18], outline=IRON_DARK, width=3)
    d.ellipse([8, 16, 56, 54], fill=IRON, outline=IRON_DARK, width=3)
    d.ellipse([12, 14, 52, 30], fill=IRON_DARK)
    if boom:
        d.ellipse([14, 16, 50, 28], fill=(30, 20, 20))
        d.line([(20, 20), (28, 26), (24, 32), (34, 38)], fill=ORANGE, width=2)
        d.line([(40, 18), (36, 26), (44, 30)], fill=ORANGE, width=2)
        d.ellipse([26, 2, 38, 10], fill=(90, 90, 90, 180))
    else:
        d.ellipse([14, 16, 50, 28], fill=GREEN if ready else (24, 40, 30))
        if ready:
            for bx, by, br in ((22, 20, 2), (32, 22, 2), (40, 19, 2), (28, 24, 1)):
                d.ellipse([bx - br, by - br, bx + br, by + br], fill=(220, 255, 220))
    d.line([(8, 20), (2, 30), (8, 34)], fill=IRON_DARK, width=3)
    d.line([(56, 20), (62, 30), (56, 34)], fill=IRON_DARK, width=3)
    d.line([(22, 54), (20, 60), (26, 60), (28, 54)], fill=IRON_DARK, width=2)
    d.line([(42, 54), (40, 60), (46, 60), (48, 54)], fill=IRON_DARK, width=2)
    save(img, name)


def gen_mortar() -> None:
    img = Image.new("RGBA", (48, 48), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.pieslice([6, 10, 42, 40], 0, 180, fill=(138, 90, 51), outline=(90, 56, 30), width=2)
    d.ellipse([10, 8, 38, 26], fill=(90, 56, 30))
    d.ellipse([13, 11, 35, 23], fill=(60, 36, 18))
    d.rounded_rectangle([20, 2, 28, 18], 3, fill=(217, 200, 169), outline=(160, 140, 110), width=2)
    save(img, "station-mortar")


def gen_counter() -> None:
    img = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rectangle([4, 26, 60, 56], fill=(122, 82, 48), outline=(80, 52, 28), width=2)
    d.rectangle([4, 26, 60, 34], fill=(150, 105, 62))
    d.arc([22, 6, 42, 30], 180, 360, fill=(255, 215, 94), width=4)
    d.ellipse([29, 2, 35, 8], fill=(255, 215, 94))
    d.line([(32, 30), (32, 36)], fill=(255, 215, 94), width=3)
    save(img, "station-counter")


def gen_wand() -> None:
    img = Image.new("RGBA", (32, 48), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.line([(16, 44), (16, 14)], fill=(138, 90, 51), width=5)
    star = [(16, 2), (19, 9), (26, 9), (20, 13), (22, 20), (16, 16), (10, 20), (12, 13), (6, 9), (13, 9)]
    d.polygon(star, fill=(255, 215, 94), outline=(200, 160, 40))
    save(img, "station-wand")


def gen_bottle() -> None:
    img = Image.new("RGBA", (32, 48), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rectangle([13, 2, 19, 10], fill=(200, 200, 210))
    d.rounded_rectangle([8, 10, 24, 44], 6, fill=(180, 200, 220, 120), outline=(220, 230, 240), width=2)
    d.rounded_rectangle([10, 24, 22, 42], 4, fill=(200, 107, 255))
    d.ellipse([13, 27, 16, 30], fill=(240, 200, 255))
    save(img, "bottle")


def gen_cat() -> None:
    img = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.polygon([(8, 12), (5, 3), (13, 7)], fill=(232, 163, 92), outline=(180, 110, 50))
    d.polygon([(24, 12), (27, 3), (19, 7)], fill=(232, 163, 92), outline=(180, 110, 50))
    d.ellipse([7, 10, 25, 28], fill=(232, 163, 92), outline=(180, 110, 50), width=2)
    d.ellipse([11, 19, 21, 27], fill=(245, 215, 161))
    d.rectangle([11, 16, 13, 18], fill=(30, 30, 30))
    d.rectangle([19, 16, 21, 18], fill=(30, 30, 30))
    d.polygon([(15, 21), (17, 21), (16, 23)], fill=(255, 157, 176))
    d.line([(26, 22), (31, 18), (30, 24)], fill=(180, 110, 50), width=2)
    save(img, "cat")


def gen_ingredient(name: str, draw_fn) -> None:
    img = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    draw_fn(d)
    save(img, f"ing-{name}")


def main() -> None:
    gen_floor()
    gen_base()
    gen_cauldron()
    gen_cauldron(ready=True)
    gen_cauldron(boom=True)
    gen_mortar()
    gen_counter()
    gen_wand()
    gen_bottle()
    gen_cat()
    gen_ingredient("catnip", lambda d: (
        d.polygon([(16, 4), (26, 14), (16, 24), (6, 14)], fill=(76, 175, 80), outline=(40, 120, 45)),
        d.line([(16, 8), (16, 22)], fill=(40, 120, 45), width=1),
    ))
    gen_ingredient("hairball", lambda d: (
        d.ellipse([7, 7, 25, 25], fill=(141, 110, 99), outline=(100, 75, 60), width=2),
        d.line([(9, 12), (23, 12)], fill=(100, 75, 60), width=1),
        d.line([(10, 20), (22, 19)], fill=(100, 75, 60), width=1),
    ))
    gen_ingredient("meow3am", lambda d: (
        d.ellipse([6, 6, 26, 26], fill=(255, 179, 0), outline=(200, 130, 0), width=2),
        d.polygon([(9, 8), (7, 3), (13, 6)], fill=(255, 179, 0)),
        d.polygon([(23, 8), (25, 3), (19, 6)], fill=(255, 179, 0)),
        d.rectangle([10, 13, 13, 16], fill=(40, 30, 20)),
        d.rectangle([19, 13, 22, 16], fill=(40, 30, 20)),
        d.ellipse([13, 20, 19, 24], fill=(120, 50, 30)),
    ))
    gen_ingredient("fairyDust", lambda d: (
        d.polygon([(16, 3), (18, 13), (28, 16), (18, 19), (16, 29), (14, 19), (4, 16), (14, 13)], fill=(255, 238, 88), outline=(230, 200, 40)),
        d.ellipse([6, 24, 9, 27], fill=(255, 238, 88)),
        d.ellipse([24, 6, 27, 9], fill=(255, 238, 88)),
    ))
    gen_ingredient("sirenTear", lambda d: (
        d.polygon([(16, 3), (25, 17), (16, 29), (7, 17)], fill=(79, 195, 247), outline=(30, 140, 200), width=2),
        d.ellipse([12, 14, 16, 18], fill=(200, 240, 255)),
    ))
    gen_ingredient("scratcherRope", lambda d: (
        d.ellipse([6, 8, 26, 26], outline=(161, 136, 127), width=4),
        d.ellipse([11, 12, 21, 22], outline=(161, 136, 127), width=3),
        d.line([(24, 24), (30, 30)], fill=(161, 136, 127), width=3),
    ))


if __name__ == "__main__":
    main()


# --- Moodboard assets (docs/moodboard): pociones por receta, sombrero, props ---
POTION_COLORS = {
    "ronroneo": (255, 140, 180),
    "antiPelos": (126, 224, 129),
    "sirena": (79, 195, 247),
    "montes": (255, 183, 77),
}

def gen_potion(recipe_id: str) -> None:
    col = POTION_COLORS[recipe_id]
    img = Image.new("RGBA", (32, 48), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rectangle([13, 2, 19, 9], fill=(200, 200, 210))
    d.rounded_rectangle([8, 9, 24, 44], 6, fill=(180, 200, 220, 120), outline=(220, 230, 240), width=2)
    d.rounded_rectangle([10, 22, 22, 42], 4, fill=col)
    d.ellipse([13, 25, 16, 28], fill=(255, 255, 255, 180))
    save(img, f"potion-{recipe_id}")

def gen_book() -> None:
    img = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rectangle([6, 4, 26, 28], fill=(120, 40, 40), outline=(60, 20, 20), width=2)
    d.rectangle([9, 7, 23, 25], fill=(245, 235, 210))
    d.line([16, 7, 16, 25], fill=(120, 40, 40), width=2)
    d.polygon([(16, 12), (18, 15), (16, 18), (14, 15)], fill=(255, 215, 94))
    save(img, "book")

def gen_alembic() -> None:
    img = Image.new("RGBA", (48, 48), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.ellipse([8, 20, 40, 44], fill=(180, 190, 200, 200), outline=(90, 100, 110), width=2)
    d.polygon([(24, 20), (20, 6), (28, 6)], fill=(180, 190, 200, 200), outline=(90, 100, 110))
    d.ellipse([22, 24, 26, 28], fill=(126, 224, 129))
    save(img, "alembic")

def gen_hat() -> None:
    img = Image.new("RGBA", (40, 32), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.polygon([(6, 26), (34, 26), (20, 2)], fill=(70, 45, 110), outline=(30, 18, 55), width=2)
    d.ellipse([2, 24, 38, 30], fill=(70, 45, 110), outline=(30, 18, 55), width=2)
    d.rectangle([18, 14, 22, 18], fill=(255, 215, 94))
    save(img, "hat")

def gen_star_key_heart() -> None:
    img = Image.new("RGBA", (24, 24), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.polygon([(12, 2), (14.5, 9), (22, 9), (16, 13.5), (18, 21), (12, 17), (6, 21), (8, 13.5), (2, 9), (9.5, 9)], fill=(255, 215, 94), outline=(200, 160, 40))
    save(img, "star")
    img = Image.new("RGBA", (24, 24), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.ellipse([4, 4, 14, 14], outline=(255, 215, 94), width=3)
    d.line([(10, 12), (20, 22)], fill=(255, 215, 94), width=3)
    d.line([(17, 19), (20, 16)], fill=(255, 215, 94), width=2)
    save(img, "key")
    img = Image.new("RGBA", (24, 24), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.pieslice([2, 4, 12, 14], 180, 360, fill=(255, 82, 82))
    d.pieslice([12, 4, 22, 14], 180, 360, fill=(255, 82, 82))
    d.polygon([(3, 10), (21, 10), (12, 22)], fill=(255, 82, 82))
    save(img, "heart")

def gen_char_hat() -> None:
    base = Image.open(OUT / "char-idle.png").convert("RGBA")
    hat = Image.open(OUT / "hat.png").convert("RGBA")
    base.alpha_composite(hat, (12, 0))
    save(base, "char-hat")

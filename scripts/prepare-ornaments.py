"""
Menyiapkan ornamen menjadi PNG/WebP ringan untuk halaman cover.

Sumber asli ada di assets-src/ornaments/ (tidak ikut deploy).
Hasil siap pakai ditulis ke public/images/ dengan nama yang sama.

Aset sudah berupa PNG transparan. Skrip ini:
- mempertahankan transparansi asli,
- memangkas ruang kosong di tepi,
- memperkecil resolusi agar ringan di jaringan seluler,
- membuat versi WebP untuk peramban modern.

Jalankan: python scripts/prepare-ornaments.py
"""
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets-src" / "ornaments"
OUT = ROOT / "public" / "images"
BACKDROP = (16, 41, 31, 255)  # forest-900: warna halaman di balik ornamen


def load_alpha(image):
    """Ambil alpha asli. Jika gambar benar-benar opaque, buang latar putihnya."""
    if "A" in image.getbands():
        alpha = image.getchannel("A")
        if alpha.getextrema()[0] < 255:
            return alpha

    pixels = np.array(image.convert("RGB")).astype(np.int16)
    minimum = pixels.min(axis=2)
    return Image.fromarray(np.clip((248 - minimum) * 3.4, 0, 255).astype(np.uint8), mode="L")


def crop_box(alpha, padding=6):
    mask = alpha.point(lambda value: 255 if value > 10 else 0)
    bbox = mask.getbbox()
    if not bbox:
        return None

    left, top, right, bottom = bbox
    return (
        max(0, left - padding),
        max(0, top - padding),
        min(alpha.width, right + padding),
        min(alpha.height, bottom + padding),
    )


def export(name, max_width):
    source = SRC / f"{name}.png"
    image = Image.open(source).convert("RGBA")
    alpha = load_alpha(image)

    # Warna di area transparan disamakan dengan latar halaman agar tidak ada
    # garis gelap (fringe) saat gambar diperkecil.
    canvas = Image.new("RGBA", image.size, BACKDROP)
    canvas.alpha_composite(image)
    rgb = canvas.convert("RGB")

    box = crop_box(alpha)
    if box:
        rgb = rgb.crop(box)
        alpha = alpha.crop(box)

    if rgb.width > max_width:
        height = round(rgb.height * max_width / rgb.width)
        rgb = rgb.resize((max_width, height), Image.LANCZOS)
        alpha = alpha.resize((max_width, height), Image.LANCZOS)

    result = rgb.convert("RGBA")
    result.putalpha(alpha)

    OUT.mkdir(parents=True, exist_ok=True)
    png_path = OUT / f"{name}.png"
    webp_path = OUT / f"{name}.webp"
    result.save(png_path, optimize=True)
    result.save(webp_path, quality=86, method=6)

    print(
        f"{name}: {result.width}x{result.height} | PNG {png_path.stat().st_size // 1024} KB"
        f" | WebP {webp_path.stat().st_size // 1024} KB"
    )


if __name__ == "__main__":
    export("garland-top", 760)
    export("garland-bottom", 1600)
    export("star", 300)
    export("frame", 900)

"""Kompres public/og-image.png agar ringan untuk pratinjau WhatsApp.

Jalankan sekali setelah menangkap scripts/og-image.html:

    python scripts/optimize-og.py

Gambar tetap 1200x630 dan tetap PNG. Blur 1,4 px + palet 128 warna nyaris
tidak terlihat pada ukuran pratinjau, tetapi memangkas ukuran dari ~1,2 MB
menjadi ~270 KB. Skrip ini tidak dijalankan otomatis saat build.
"""
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
TARGET = ROOT / "public" / "og-image.png"
MAX_BYTES = 400_000


def main():
    if not TARGET.exists():
        raise SystemExit(f"Tidak ditemukan: {TARGET}")

    if TARGET.stat().st_size <= MAX_BYTES:
        print(f"Sudah ringan ({TARGET.stat().st_size // 1024} KB), dilewati.")
        return

    image = Image.open(TARGET).convert("RGB")
    if image.size != (1200, 630):
        print(f"Peringatan: ukuran {image.size}, seharusnya (1200, 630).")

    smoothed = image.filter(ImageFilter.GaussianBlur(1.4))
    optimized = smoothed.quantize(
        colors=128,
        method=Image.MEDIANCUT,
        dither=Image.FLOYDSTEINBERG,
    )
    optimized.save(TARGET, optimize=True, compress_level=9)
    print(f"og-image.png: {TARGET.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()

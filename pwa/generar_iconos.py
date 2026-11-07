"""Genera los íconos de la app a partir de un logo.

Uso:  python3 pwa/generar_iconos.py ruta/al/logo.png  [color_fondo]
      (color_fondo por defecto #0D2137; usa "transparente" si el logo ya es cuadrado y con fondo propio)

Crea en pwa/icons/: icon-192.png, icon-512.png, icon-maskable-512.png, apple-touch-icon.png
Después correr  python3 build.py  (la versión cambia sola y los teléfonos se actualizan).
"""
import sys
from pathlib import Path
from PIL import Image

OUT = Path(__file__).resolve().parent / "icons"

def cuadrar(logo, lado, margen, fondo):
    lienzo = Image.new("RGBA", (lado, lado), fondo)
    util = int(lado * (1 - 2 * margen))
    l = logo.copy()
    l.thumbnail((util, util), Image.LANCZOS)
    lienzo.alpha_composite(l, ((lado - l.width) // 2, (lado - l.height) // 2))
    return lienzo

def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    logo = Image.open(sys.argv[1]).convert("RGBA")
    color = sys.argv[2] if len(sys.argv) > 2 else "#0D2137"
    fondo = (0, 0, 0, 0) if color == "transparente" else color
    OUT.mkdir(exist_ok=True)
    base = cuadrar(logo, 1024, 0.08, fondo)
    for nombre, lado in (("icon-512.png", 512), ("icon-192.png", 192)):
        base.resize((lado, lado), Image.LANCZOS).save(OUT / nombre)
    # Android recorta en círculo/forma: el logo va dentro del 80 % central
    cuadrar(logo, 512, 0.16, fondo if fondo != (0, 0, 0, 0) else "#0D2137").save(OUT / "icon-maskable-512.png")
    # iPhone no acepta transparencia: se rellena el fondo
    apple = Image.new("RGBA", (180, 180), "#0D2137" if fondo == (0, 0, 0, 0) else fondo)
    apple.alpha_composite(base.resize((180, 180), Image.LANCZOS))
    apple.convert("RGB").save(OUT / "apple-touch-icon.png")
    print("Íconos generados en", OUT)

if __name__ == "__main__":
    main()

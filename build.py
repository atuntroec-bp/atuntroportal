"""Compila index-dev.html -> index.html y dist/index.html inlineando js/*.js.

También genera los archivos de la PWA (app instalable):
  pwa/sw.template.js  -> sw.js (con VERSION = hash de index.html)
  pwa/manifest.webmanifest, pwa/offline.html, pwa/icons/*  -> copiados junto a cada index.html
La versión solo cambia si cambia el portal, así los teléfonos se actualizan solo cuando hay algo nuevo.
"""
import hashlib, re, shutil, sys
from pathlib import Path
R = Path(__file__).resolve().parent
PWA = R / "pwa"

def compilar():
    src = (R / "index-dev.html").read_text(encoding="utf-8")
    def rep(m):
        return "<script>\n" + (R / m.group(1)).read_text(encoding="utf-8") + "</script>"
    return re.sub(r'<script src="(js/[^"]+\.js)"></script>', rep, src)

def version(html):
    h = hashlib.sha256(html.encode("utf-8"))
    for f in sorted(PWA.rglob("*")):
        if f.is_file():
            h.update(f.relative_to(PWA).as_posix().encode()); h.update(f.read_bytes())
    return h.hexdigest()[:12]

def escribir_pwa(carpeta, ver):
    carpeta = Path(carpeta)
    sw = (PWA / "sw.template.js").read_text(encoding="utf-8").replace("__VERSION__", ver)
    (carpeta / "sw.js").write_text(sw, encoding="utf-8")
    shutil.copy2(PWA / "manifest.webmanifest", carpeta / "manifest.webmanifest")
    shutil.copy2(PWA / "offline.html", carpeta / "offline.html")
    shutil.copytree(PWA / "icons", carpeta / "icons", dirs_exist_ok=True)

if __name__ == "__main__":
    out = compilar()
    destinos = sys.argv[1:] or [R / "index.html", R / "dist" / "index.html"]
    ver = version(out) if PWA.is_dir() else None
    for d in destinos:
        Path(d).parent.mkdir(parents=True, exist_ok=True)
        Path(d).write_text(out, encoding="utf-8")
        if ver:
            escribir_pwa(Path(d).parent, ver)
    print("OK", len(out.encode()), "bytes", "· PWA v" + ver if ver else "")

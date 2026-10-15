"""Compila index-dev.html -> index.html y dist/index.html inlineando js/*.js."""
import re, sys
from pathlib import Path
R = Path(__file__).resolve().parent
def compilar():
    src = (R / "index-dev.html").read_text(encoding="utf-8")
    def rep(m):
        return "<script>\n" + (R / m.group(1)).read_text(encoding="utf-8") + "</script>"
    return re.sub(r'<script src="(js/[^"]+\.js)"></script>', rep, src)
if __name__ == "__main__":
    out = compilar()
    destinos = sys.argv[1:] or [R / "index.html", R / "dist" / "index.html"]
    for d in destinos:
        Path(d).parent.mkdir(parents=True, exist_ok=True)
        Path(d).write_text(out, encoding="utf-8")
    print("OK", len(out.encode()), "bytes")

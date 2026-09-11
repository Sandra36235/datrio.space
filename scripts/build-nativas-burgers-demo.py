from pathlib import Path
import shutil
import sys

source = Path(sys.argv[1]).resolve()
output_root = Path(sys.argv[2]).resolve()
target = output_root / "nativas-burgers"

if not source.is_dir():
    raise SystemExit(f"No se encontró el frontend de Nativas Burgers: {source}")

if target.exists():
    shutil.rmtree(target)
target.mkdir(parents=True)

for name in ("index.html", "styles.css"):
    path = source / name
    if path.is_symlink() or not path.is_file():
        raise SystemExit(f"Archivo faltante o no permitido: {path}")
    shutil.copy2(path, target / name)

script = Path(__file__).with_name("nativas-burgers-demo.js")
shutil.copy2(script, target / "app.js")

index_path = target / "index.html"
html = index_path.read_text(encoding="utf-8")
banner = """
<div class="demo-banner" role="status">
  <strong>Nativas Burgers · Nataly Ovando · Demostración</strong>
  <span>Los productos, ventas y tickets son ficticios y solo existen mientras esta pestaña permanezca abierta.</span>
</div>
"""
html = html.replace("<body>", "<body>" + banner, 1)
html = html.replace("<script src=\"app.js\"></script>", "<p class=\"demo-note\">Demostración lista. No requiere cuenta ni conexión a la base de datos.</p><script src=\"app.js\"></script>")
index_path.write_text(html, encoding="utf-8")

styles_path = target / "styles.css"
styles = styles_path.read_text(encoding="utf-8")
styles += """
.demo-banner{display:flex;justify-content:center;gap:.65rem;flex-wrap:wrap;padding:.65rem 1rem;color:#fff;background:#8f3517;font-size:.78rem;text-align:center}
.demo-banner span{color:#ffe7dc}.demo-note{position:fixed;right:1rem;bottom:1rem;z-index:20;max-width:310px;margin:0;padding:.65rem .8rem;border:1px solid #eadcd3;border-radius:9px;color:#846f65;background:#fff;font-size:.72rem;box-shadow:0 8px 30px #4a1b1520}
.product small{color:#846f65;font-size:.72rem}.add:disabled{opacity:.4}.ticket .price{float:right}
@media(max-width:600px){.demo-note{position:static;max-width:none;border-radius:0;text-align:center}.demo-banner{display:grid;gap:.2rem}}
"""
styles_path.write_text(styles, encoding="utf-8")


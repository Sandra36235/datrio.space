from pathlib import Path
import shutil
import sys

source = Path(sys.argv[1]).resolve()
output_root = Path(sys.argv[2]).resolve()
target = output_root / "EufratesYTigris"

if not source.is_dir():
    raise SystemExit(f"No se encontró el frontend de Eufrates & Tigris: {source}")

if target.exists():
    shutil.rmtree(target)
target.mkdir(parents=True)

for name in ("index.html", "styles.css"):
    path = source / name
    if path.is_symlink() or not path.is_file():
        raise SystemExit(f"Archivo faltante o no permitido: {path}")
    shutil.copy2(path, target / name)

assets = source / "assets"
if assets.is_dir():
    for path in assets.rglob("*"):
        if path.is_symlink():
            raise SystemExit(f"Enlace simbólico no permitido: {path}")
    shutil.copytree(assets, target / "assets")

script = Path(__file__).with_name("eufrates-tigris-demo.js")
shutil.copy2(script, target / "app.js")

index_path = target / "index.html"
html = index_path.read_text(encoding="utf-8")
banner = """
<div class="demo-banner" role="status">
  <strong>Eufrates &amp; Tigris · Ernesto Ballon · Demostración</strong>
  <span>Clientes, tablillas y entregas ficticias. La demo no guarda información ni usa una base de datos.</span>
</div>
"""
html = html.replace("<body>", "<body>" + banner, 1)
html = html.replace("<script src=\"app.js\"></script>", "<p class=\"demo-note\">Demostración lista. No requiere cuenta ni conexión a MySQL.</p><script src=\"app.js\"></script>")
index_path.write_text(html, encoding="utf-8")

styles_path = target / "styles.css"
styles = styles_path.read_text(encoding="utf-8")
styles += """
.demo-banner{display:flex;justify-content:center;gap:.65rem;flex-wrap:wrap;padding:.65rem 1rem;color:#fff6df;background:#6d4510;font-family:Georgia,"Times New Roman",serif;font-size:.78rem;text-align:center}
.demo-banner span{color:#f3dfb0}.demo-note{position:fixed;right:1rem;bottom:1rem;z-index:20;max-width:310px;margin:0;padding:.65rem .8rem;border:1px solid #d4a94e77;border-radius:.3rem;color:#f3dfb0;background:#101b2bee;font-size:.72rem;box-shadow:0 8px 30px #0007}
@media(max-width:700px){.demo-note{position:static;max-width:none;border-radius:0;text-align:center}.demo-banner{display:grid;gap:.2rem}}
"""
styles_path.write_text(styles, encoding="utf-8")


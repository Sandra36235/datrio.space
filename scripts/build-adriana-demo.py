from pathlib import Path
import shutil
import sys

source = Path(sys.argv[1]).resolve()
site = Path(sys.argv[2]).resolve()
target = site / "saltenas-intinia"

if not source.is_dir():
    raise SystemExit(f"No se encontró el frontend de Salteñería Intiña: {source}")

if target.exists():
    shutil.rmtree(target)
target.mkdir(parents=True)

# Conserva todos los archivos finales de Adriana. La API del navegador sustituye
# únicamente al servidor y a MySQL mientras la publicación sea una demostración.
for path in source.iterdir():
    if path.is_symlink():
        raise RuntimeError(f"Symlink no permitido: {path}")
    if path.is_file() and path.suffix.lower() in {".html", ".css", ".js"}:
        shutil.copy2(path, target / path.name)

shutil.copytree(source / "assets", target / "assets", dirs_exist_ok=True)

# La entrega final tiene estos dos archivos más recientes que la copia de GitHub
# de la estudiante. Se guardan aquí para que la publicación sea exactamente la
# versión recibida por la profesora.
snapshot = Path(__file__).resolve().parent.parent / "student-snapshots" / "adriana-final"
for name in ("pedidos.html", "pedido.js"):
    shutil.copy2(snapshot / name, target / name)

shutil.copy2(Path(__file__).with_name("adriana-demo-api.js"), target / "demo-api.js")
(target / "config.js").write_text(
    "window.APP_CONFIG = { API_BASE_URL: '/__saltenas_demo__' };\n",
    encoding="utf-8",
)

for html_path in target.glob("*.html"):
    html = html_path.read_text(encoding="utf-8")
    html = html.replace(
        '<script src="config.js"></script>',
        '<script src="demo-api.js"></script><script src="config.js"></script>',
        1,
    )
    html_path.write_text(html, encoding="utf-8")

for path in target.rglob("*"):
    if path.is_symlink():
        raise RuntimeError("Symlinks are not allowed")

print("Salteñería Intiña final frontend ready with a browser API")

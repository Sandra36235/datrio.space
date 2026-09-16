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

# Conserva intactos el inicio de sesión, el punto de venta y el programa final
# de Nataly. La API de demostración sustituye únicamente al servidor remoto.
for name in ("index.html", "login.css", "login.js", "pos.html", "styles.css", "pos-theme.css", "app.js"):
    path = source / name
    if path.is_symlink() or not path.is_file():
        raise SystemExit(f"Archivo faltante o no permitido: {path}")
    shutil.copy2(path, target / name)

shutil.copy2(Path(__file__).with_name("nativas-burgers-demo-api.js"), target / "demo-api.js")
shutil.copytree(source / "assets", target / "assets", dirs_exist_ok=True)

index_path = target / "index.html"
index_html = index_path.read_text(encoding="utf-8").replace(
    '<script src="login.js"></script>',
    '<script src="demo-api.js"></script><script src="login.js"></script>',
    1,
)
index_path.write_text(index_html, encoding="utf-8")

pos_path = target / "pos.html"
pos_html = pos_path.read_text(encoding="utf-8")
pos_html = pos_html.replace('/imagenes/', 'assets/menu/')
pos_html = pos_html.replace(
    '<script src="app.js"></script>',
    '<script src="demo-api.js"></script><script src="app.js"></script>',
    1,
)
pos_path.write_text(pos_html, encoding="utf-8")

theme_path = target / "pos-theme.css"
theme_path.write_text(
    theme_path.read_text(encoding="utf-8").replace('/imagenes/', 'assets/menu/'),
    encoding="utf-8",
)

for path in target.rglob("*"):
    if path.is_symlink():
        raise RuntimeError("Symlinks are not allowed")

print("Nativas Burgers final frontend ready with a browser API")

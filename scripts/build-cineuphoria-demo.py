from pathlib import Path
import shutil
import sys

source = Path(sys.argv[1]).resolve()
site = Path(sys.argv[2]).resolve()
target = site / "cineuphoria"

if not source.is_dir():
    raise SystemExit(f"No se encontró el frontend de Cineuphoria: {source}")

if target.exists():
    shutil.rmtree(target)
shutil.copytree(source, target)

app_path = target / "js" / "app.js"
app = app_path.read_text(encoding="utf-8")
app = app.replace(
    "const API = ['3000', '3307'].includes(location.port) ? '' : `http://${location.hostname}:3000`;",
    "const API = '/__cineuphoria_demo__';",
    1,
)
app_path.write_text(app, encoding="utf-8")

shutil.copy2(Path(__file__).with_name("cineuphoria-demo-api.js"), target / "demo-api.js")
index_path = target / "index.html"
index = index_path.read_text(encoding="utf-8")
index = index.replace(
    '<script src="js/app.js?v=2"></script>',
    '<script src="demo-api.js"></script><script src="js/app.js?v=2"></script>',
    1,
)
index_path.write_text(index, encoding="utf-8")

for path in target.rglob("*"):
    if path.is_symlink():
        raise RuntimeError("Symlinks are not allowed")

print("Cineuphoria final frontend ready with a browser API")

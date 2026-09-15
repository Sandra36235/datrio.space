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

for name in ("index.html", "login.css", "pos.html", "styles.css", "pos-theme.css"):
    path = source / name
    if path.is_symlink() or not path.is_file():
        raise SystemExit(f"Archivo faltante o no permitido: {path}")
    shutil.copy2(path, target / name)

script = Path(__file__).with_name("nativas-burgers-demo.js")
shutil.copy2(script, target / "app.js")
login_script = Path(__file__).with_name("nativas-burgers-login.js")
shutil.copy2(login_script, target / "login.js")
shutil.copytree(source / "assets", target / "assets", dirs_exist_ok=True)

pos_path = target / "pos.html"
pos_path.write_text(
    pos_path.read_text(encoding="utf-8").replace('/imagenes/', 'assets/menu/'),
    encoding="utf-8",
)

styles_path = target / "styles.css"
styles = styles_path.read_text(encoding="utf-8")
styles += "\n.product small{color:#846f65;font-size:.72rem}.add:disabled{opacity:.4}.ticket .price{float:right}\n"
styles_path.write_text(styles, encoding="utf-8")

from pathlib import Path
import shutil, sys

source, site = map(Path, sys.argv[1:3])
target = site / "animal-hospital-anomaly"
target.mkdir(parents=True, exist_ok=True)

# Conserva la portada y los estilos actuales de Keyla. El comportamiento del
# juego se ejecuta localmente para que GitHub Pages no dependa de un servidor.
for filename in ("index.html", "styles.css"):
    shutil.copyfile(source / filename, target / filename)
shutil.copytree(source / "assets", target / "assets", dirs_exist_ok=True)
shutil.copyfile(Path(__file__).with_name("animal-hospital-demo.js"), target / "app.js")
(target / "config.js").write_text("window.APP_CONFIG = {};\n", encoding="utf-8")

for path in target.rglob("*"):
    if path.is_symlink():
        raise RuntimeError("Symlinks are not allowed")
print("Animal Hospital browser edition ready")

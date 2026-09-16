from pathlib import Path
import shutil, sys

source, site = map(Path, sys.argv[1:3])
target = site / "animal-hospital-anomaly"
target.mkdir(parents=True, exist_ok=True)

# Conserva intactos la portada, los estilos y el programa final de Keyla.
# Solo sustituye la API remota por una API local compatible con el navegador.
for filename in ("index.html", "styles.css", "app.js"):
    shutil.copyfile(source / filename, target / filename)
shutil.copytree(source / "assets", target / "assets", dirs_exist_ok=True)
shutil.copyfile(Path(__file__).with_name("animal-hospital-demo-api.js"), target / "demo-api.js")
(target / "config.js").write_text(
    "window.APP_CONFIG = { API_URL: '/__animal_hospital_demo__' };\n",
    encoding="utf-8",
)
index_path = target / "index.html"
html = index_path.read_text(encoding="utf-8")
html = html.replace(
    '<script src="config.js',
    '<script src="demo-api.js"></script><script src="config.js',
    1,
)
index_path.write_text(html, encoding="utf-8")

for path in target.rglob("*"):
    if path.is_symlink():
        raise RuntimeError("Symlinks are not allowed")
print("Animal Hospital final frontend ready with a browser API")

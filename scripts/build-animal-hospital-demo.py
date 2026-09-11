from pathlib import Path
import shutil, sys

source, site = map(Path, sys.argv[1:3])
target = site / "animal-hospital-anomaly"
target.mkdir(parents=True, exist_ok=True)

html = (source / "index.html").read_text(encoding="utf-8")
assert '<script src="config.js?v=20260910-4"></script>' in html
banner = '<aside style="padding:16px;background:#fff3cd;color:#332900;text-align:center;font:16px/1.5 sans-serif"><strong>Animal Hospital Anomaly · Keyla Lopez · Demostración</strong><br>Datos ficticios. El juego funciona en esta pestaña y no guarda usuarios, partidas ni resultados en una base de datos.</aside>'
html = html.replace("<body>", "<body>" + banner)
html = html.replace('<script src="config.js?v=20260910-4"></script><script src="app.js?v=20260910-4"></script>', '<script src="app.js"></script>')
html = html.replace("Terminar partida", "Terminar demo").replace("Salir", "Volver a Datrio")
(target / "index.html").write_text(html, encoding="utf-8")
shutil.copyfile(source / "styles.css", target / "styles.css")
shutil.copytree(source / "assets", target / "assets", dirs_exist_ok=True)
shutil.copyfile(Path(__file__).with_name("animal-hospital-demo.js"), target / "app.js")

for path in target.rglob("*"):
    if path.is_symlink():
        raise RuntimeError("Symlinks are not allowed")
print("Animal Hospital demo ready without backend or credentials")


from pathlib import Path
import shutil
import sys

source, output_root = map(Path, sys.argv[1:3])
target = output_root / "EufratesYTigris"

if not source.is_dir():
    raise SystemExit(f"No se encontro el frontend final de Eufrates & Tigris: {source}")
if target.exists():
    shutil.rmtree(target)
shutil.copytree(source, target)

# Ernesto's pages keep their original presentation, animation and audio.  This
# adapter supplies the API in the browser so the showcase does not need MySQL.
shutil.copyfile(Path(__file__).with_name("eufrates-tigris-demo.js"), target / "demo-api.js")
for html_path in target.glob("*.html"):
    html = html_path.read_text(encoding="utf-8")
    scripts = {
        '<script src="auth.js"></script>': '<script src="demo-api.js?v=20260924"></script><script src="auth.js?v=20260924"></script>',
        '<script src="dashboard.js"></script>': '<script src="demo-api.js?v=20260924"></script><script src="dashboard.js?v=20260924"></script>',
    }
    for marker, replacement in scripts.items():
        if marker in html:
            html = html.replace(marker, replacement, 1)
    html_path.write_text(html, encoding="utf-8")

print("Eufrates & Tigris final delivery ready as a browser demonstration")

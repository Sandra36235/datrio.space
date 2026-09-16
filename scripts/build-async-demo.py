from pathlib import Path
import shutil
import sys

source, site = map(Path, sys.argv[1:3])
target = site / "ASYNC"

if target.exists():
    shutil.rmtree(target)
shutil.copytree(source, target)

# Keep Antonio's final frontend intact and load a browser-only API adapter
# before the student's shared api.js file.
shutil.copyfile(Path(__file__).with_name("async-demo-api.js"), target / "demo-api.js")
for html_path in target.glob("*.html"):
    html = html_path.read_text(encoding="utf-8")
    marker = '<script src="api.js"></script>'
    if marker in html:
        html = html.replace(marker, '<script src="demo-api.js"></script>\n    ' + marker, 1)
    html_path.write_text(html, encoding="utf-8")

print("ASYNC final delivery ready as a self-contained browser demonstration")

from pathlib import Path
import shutil, re, sys
source, site = map(Path, sys.argv[1:3])
target = site / "saltenas-intinia"
target.mkdir(parents=True, exist_ok=True)
html = (source / "pedidos.html").read_text(encoding="utf-8")
demo_script = Path(__file__).with_name("adriana-demo.js")
js = demo_script.read_text(encoding="utf-8")
assert "fetch(" not in js and "localStorage" not in js and "API_BASE_URL" not in js
html = html.replace('<script src="config.js"></script>', "")
html = html.replace("Cerrar sesión", "Volver a Datrio").replace("Registrar venta", "Simular pedido")
html = html.replace('<body>', '<body><aside style="padding:16px;text-align:center;background:#fff3cd;color:#493b00;font:16px/1.5 sans-serif"><strong>Demostración de Salteñería Intiña · Adriana Claros</strong><br>Podés explorar y armar pedidos. No se guardan ventas, no se realizan cobros ni se conecta a la base de datos.</aside>')
html = re.sub(r'<details class="invoice-details">.*?</details>', "", html, flags=re.S)
(target / "index.html").write_text(html, encoding="utf-8")
(target / "pedidos.html").write_text(html, encoding="utf-8")
(target / "pedido.js").write_text(js, encoding="utf-8")
shutil.copyfile(source / "styles.css", target / "styles.css")
shutil.copytree(source / "assets", target / "assets", dirs_exist_ok=True)
for p in target.rglob("*"):
    if p.is_symlink(): raise RuntimeError("Symlinks are not allowed in the demo")
print("Demo built without backend, credentials or database access.")

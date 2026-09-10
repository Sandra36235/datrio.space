from pathlib import Path
import shutil, sys
source, site = map(Path,sys.argv[1:3])
target=site/"ASYNC"
target.mkdir(parents=True,exist_ok=True)
banner='<aside style="padding:16px;background:#fff3cd;color:#332900;text-align:center;font:16px/1.5 sans-serif"><strong>Corporacion Async · Antonio Nuñez · Demostración</strong><br>Datos ficticios. Las expediciones y reservas solo se simulan en esta pestaña; no se guardan en una base de datos.</aside>'
for name in ["nueva","equipo","riesgo","ticket"]:
    html=(source/(name+".html")).read_text(encoding="utf-8")
    assert '<script src="api.js"></script>' in html
    html=html.replace("<body>","<body>"+banner).replace("Cerrar sesion","Volver a Datrio")
    (target/(name+".html")).write_text(html,encoding="utf-8")
    js=(source/(name+".js")).read_text(encoding="utf-8")
    assert "fetch(" not in js and "XMLHttpRequest" not in js
    js=js.replace("corporacion_async_active_expedition","datrio_async_demo_active").replace("corporacion_async_active_code","datrio_async_demo_code")
    js=js.replace("Expedicion confirmada y ticket generado.","Expedición simulada y ticket de demostración generado. No se guardaron datos reales.")
    (target/(name+".js")).write_text(js,encoding="utf-8")
shutil.copyfile(target/"nueva.html",target/"index.html")
shutil.copyfile(source/"styles.css",target/"styles.css")
shutil.copytree(source/"assets",target/"assets",dirs_exist_ok=True)
shutil.copyfile(Path(__file__).with_name("async-demo-api.js"),target/"api.js")
print("ASYNC demo ready without backend or credentials")

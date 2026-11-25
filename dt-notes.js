// A slim strip under the Datrio bar: how Sandra uses each tool in class,
// and whether the tool keeps your work in this browser.
(()=>{
const NOTES=new Map([
 ['estudio-powerbi.html',['En clase armamos primero el boceto aquí y recién después abrimos Power BI: el fondo se exporta en SVG o PNG y los visuales van encima.',true]],
 ['paletas.html',['Antes de diseñar un dashboard elegimos la paleta, revisamos cómo la ve una persona con daltonismo y descargamos el tema JSON para Power BI.',true]],
 ['guia-dax.html',['Busco la función, miro el ejemplo en vivo con la tabla de ventas y luego resolvemos los retos sin mirar la respuesta.',false]],
]);
const page=location.pathname.split('/').pop();const n=NOTES.get(page);const bar=document.querySelector('.dt-bar');if(!n||!bar)return;
const d=document.createElement('div');d.className='dt-note';
d.innerHTML=`<p><b>Cómo la uso en clase.</b> ${n[0]}</p>${n[1]?'<span class="dt-save">✓ Tu trabajo se guarda solo en este navegador</span>':''}`;
bar.after(d);
})();

// Extras for the DAX guide: live examples on a tiny sales table, more recipes,
// what's new in 2025–2026 and self-checking challenges. Added on top of the
// existing page without changing its catalogue.
(()=>{
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const bs=n=>'Bs '+Math.round(n).toLocaleString('es-BO');
const pct=n=>(n*100).toFixed(1).replace('.',',')+' %';

// ---------- the sample table every live example uses ----------
const V=[
 ['2025-03-10','Espresso','Café','La Paz',40,1600],['2025-03-18','Matcha latte','Matcha','Santa Cruz',25,1250],
 ['2025-06-05','V60','Café','Santa Cruz',30,1500],['2025-06-21','Cuñapé','Panadería','La Paz',60,600],
 ['2026-03-12','Espresso','Café','Santa Cruz',55,2200],['2026-03-20','Matcha latte','Matcha','La Paz',35,1750],
 ['2026-06-08','V60','Café','La Paz',20,1000],['2026-06-25','Cuñapé','Panadería','Santa Cruz',90,900]
].map(([f,p,c,ci,q,i])=>({Fecha:f,Producto:p,Categoría:c,Ciudad:ci,Cantidad:q,Importe:i,Año:+f.slice(0,4)}));
const cats=['Café','Matcha','Panadería'];
const sum=(rows,k='Importe')=>rows.reduce((a,r)=>a+r[k],0);
const byCat=fn=>cats.map(c=>[c,fn(V.filter(r=>r.Categoría===c),c)]);
const total=sum(V);

const LIVE={
 SUM:{f:'Ventas = SUM(Ventas[Importe])',rows:()=>[...byCat(r=>bs(sum(r))),['Total',bs(total)]]},
 AVERAGE:{f:'Ticket promedio = AVERAGE(Ventas[Importe])',rows:()=>[...byCat(r=>bs(sum(r)/r.length)),['Total',bs(total/V.length)]]},
 COUNTROWS:{f:'N.º ventas = COUNTROWS(Ventas)',rows:()=>[...byCat(r=>r.length),['Total',V.length]]},
 DISTINCTCOUNT:{f:'Productos = DISTINCTCOUNT(Ventas[Producto])',rows:()=>[...byCat(r=>new Set(r.map(x=>x.Producto)).size),['Total',new Set(V.map(x=>x.Producto)).size]]},
 DIVIDE:{f:'Precio medio = DIVIDE([Ventas], SUM(Ventas[Cantidad]))',rows:()=>[...byCat(r=>bs(sum(r)/sum(r,'Cantidad'))),['Total',bs(total/sum(V,'Cantidad'))]],note:'DIVIDE devuelve vacío en vez de error si el divisor es 0.'},
 CALCULATE:{f:'Ventas La Paz = CALCULATE([Ventas], Ventas[Ciudad] = "La Paz")',rows:()=>[...byCat(r=>bs(sum(r.filter(x=>x.Ciudad==='La Paz')))),['Total',bs(sum(V.filter(x=>x.Ciudad==='La Paz')))]],note:'CALCULATE cambia el filtro: cada fila sigue filtrada por su categoría, y además por La Paz.'},
 FILTER:{f:'Ventas grandes = CALCULATE([Ventas], FILTER(Ventas, Ventas[Importe] >= 1500))',rows:()=>[...byCat(r=>bs(sum(r.filter(x=>x.Importe>=1500)))),['Total',bs(sum(V.filter(x=>x.Importe>=1500)))]]},
 ALL:{f:'% del total = DIVIDE([Ventas], CALCULATE([Ventas], ALL(Ventas[Categoría])))',rows:()=>[...byCat(r=>pct(sum(r)/total)),['Total',pct(1)]],note:'ALL quita el filtro de categoría solo en el denominador.'},
 REMOVEFILTERS:{f:'Ventas sin filtro = CALCULATE([Ventas], REMOVEFILTERS(Ventas[Categoría]))',rows:()=>[...byCat(()=>bs(total)),['Total',bs(total)]],note:'Cada fila muestra el total: el filtro de categoría se quitó.'},
 SUMX:{f:'Ventas recalculadas = SUMX(Ventas, Ventas[Cantidad] * 40)',rows:()=>[...byCat(r=>bs(r.reduce((a,x)=>a+x.Cantidad*40,0))),['Total',bs(V.reduce((a,x)=>a+x.Cantidad*40,0))]],note:'SUMX recorre fila por fila y suma el resultado de la expresión.'},
 AVERAGEX:{f:'Cantidad media = AVERAGEX(Ventas, Ventas[Cantidad])',rows:()=>[...byCat(r=>(sum(r,'Cantidad')/r.length).toFixed(1)),['Total',(sum(V,'Cantidad')/V.length).toFixed(1)]]},
 MAXX:{f:'Venta mayor = MAXX(Ventas, Ventas[Importe])',rows:()=>[...byCat(r=>bs(Math.max(...r.map(x=>x.Importe)))),['Total',bs(Math.max(...V.map(x=>x.Importe)))]]},
 RANKX:{f:'Ranking = RANKX(ALL(Ventas[Categoría]), [Ventas])',rows:()=>{const t=cats.map(c=>[c,sum(V.filter(r=>r.Categoría===c))]).sort((a,b)=>b[1]-a[1]);return cats.map(c=>[c,'#'+(t.findIndex(x=>x[0]===c)+1)])}},
 IF:{f:'Estado = IF([Ventas] >= 3000, "Meta cumplida", "Por debajo")',rows:()=>byCat(r=>sum(r)>=3000?'Meta cumplida':'Por debajo')},
 SWITCH:{f:'Tamaño = SWITCH(TRUE(), [Ventas] >= 5000, "Grande", [Ventas] >= 2500, "Mediana", "Chica")',rows:()=>byCat(r=>{const s=sum(r);return s>=5000?'Grande':s>=2500?'Mediana':'Chica'})},
 TOTALYTD:{f:'Ventas acumuladas año = TOTALYTD([Ventas], Calendario[Fecha])',cols:['Mes','Resultado'],rows:()=>[['Mar 2026',bs(sum(V.filter(r=>r.Año===2026&&r.Fecha<'2026-04')))],['Jun 2026',bs(sum(V.filter(r=>r.Año===2026)))]],note:'Acumula desde el 1 de enero hasta el mes de la fila.'},
 SAMEPERIODLASTYEAR:{f:'Ventas año anterior = CALCULATE([Ventas], SAMEPERIODLASTYEAR(Calendario[Fecha]))',cols:['Año','Resultado'],rows:()=>[['2025','(vacío)'],['2026',bs(sum(V.filter(r=>r.Año===2025)))]],note:'En 2026 trae lo que se vendió en 2025.'},
 TOPN:{f:'Top 2 = TOPN(2, VALUES(Ventas[Producto]), [Ventas])',cols:['Producto','Ventas'],rows:()=>{const p={};V.forEach(r=>p[r.Producto]=(p[r.Producto]||0)+r.Importe);return Object.entries(p).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([k,v])=>[k,bs(v)])}},
 VALUES:{f:'Ciudades = CONCATENATEX(VALUES(Ventas[Ciudad]), Ventas[Ciudad], ", ")',rows:()=>byCat(r=>[...new Set(r.map(x=>x.Ciudad))].join(', '))},
 CONCATENATEX:{f:'Productos = CONCATENATEX(VALUES(Ventas[Producto]), Ventas[Producto], ", ")',rows:()=>byCat(r=>[...new Set(r.map(x=>x.Producto))].join(', '))}
};

function sample(){return `<details class="sample"><summary>Ver la tabla Ventas de ejemplo (8 filas)</summary><div class="tbl-scroll"><table class="mini"><thead><tr><th>Fecha</th><th>Producto</th><th>Categoría</th><th>Ciudad</th><th>Cantidad</th><th>Importe</th></tr></thead><tbody>${V.map(r=>`<tr><td>${r.Fecha}</td><td>${r.Producto}</td><td>${r.Categoría}</td><td>${r.Ciudad}</td><td>${r.Cantidad}</td><td>${bs(r.Importe)}</td></tr>`).join('')}</tbody></table></div></details>`}
function liveBlock(name){
 const x=LIVE[name];if(!x)return null;
 const cols=x.cols||['Categoría','Resultado'],rows=x.rows();
 const el=document.createElement('div');el.className='live';
 el.innerHTML=`<h4>Ejemplo vivo</h4><p class="live-f"><code>${esc(x.f)}</code></p><div class="tbl-scroll"><table class="mini res"><thead><tr><th>${cols[0]}</th><th>${cols[1]}</th></tr></thead><tbody>${rows.map(([a,b])=>`<tr class="${a==='Total'?'tot':''}"><td>${esc(a)}</td><td>${esc(b)}</td></tr>`).join('')}</tbody></table></div>${x.note?`<p class="live-note">${esc(x.note)}</p>`:''}${sample()}`;
 return el;
}
// Inject the live example whenever the detail panel changes.
const detail=document.getElementById('detail');
if(detail){
 const inject=()=>{if(detail.querySelector('.live'))return;const name=detail.querySelector('h3')?.textContent.trim();const b=name&&liveBlock(name);if(b){const src=detail.querySelector('.source');src?src.before(b):detail.append(b)}};
 new MutationObserver(inject).observe(detail,{childList:true});inject();
}
// Mark catalogue entries that have a live example.
document.addEventListener('DOMContentLoaded',()=>{});

// ---------- more recipes ----------
const RECIPES=[
 ['Acumulado del año (YTD)','Suma desde el 1 de enero hasta la fecha del contexto.','Ventas YTD =\nTOTALYTD([Ventas], Calendario[Fecha])'],
 ['Promedio móvil de 3 meses','Suaviza la serie para ver la tendencia.','Promedio 3M =\nAVERAGEX(\n    DATESINPERIOD(Calendario[Fecha], MAX(Calendario[Fecha]), -3, MONTH),\n    [Ventas]\n)'],
 ['% del total general','Cada fila como parte del total, respetando los segmentadores.','% total =\nDIVIDE([Ventas], CALCULATE([Ventas], ALLSELECTED()))'],
 ['Top N dinámico con «Otros»','Muestra los N mejores y agrupa el resto (N desde un parámetro).','Ventas Top N =\nVAR N = [Valor de Top N]\nVAR Rank = RANKX(ALLSELECTED(Productos[Nombre]), [Ventas])\nRETURN IF(Rank <= N, [Ventas])'],
 ['Variación vs. mes anterior','Cuánto cambió frente al mes previo.','Var. mes anterior =\nVAR Anterior = CALCULATE([Ventas], DATEADD(Calendario[Fecha], -1, MONTH))\nRETURN [Ventas] - Anterior'],
 ['Clientes nuevos','Clientes cuya primera compra cae en el periodo visible.','Clientes nuevos =\nCOUNTROWS(\n    FILTER(\n        VALUES(Ventas[ClienteID]),\n        CALCULATE(MIN(Ventas[Fecha]), ALL(Calendario)) >= MIN(Calendario[Fecha])\n    )\n)'],
 ['Ticket promedio','Venta media por transacción.','Ticket promedio =\nDIVIDE([Ventas], DISTINCTCOUNT(Ventas[FacturaID]))'],
 ['Avance contra la meta','Qué % de la meta se lleva cumplido.','% de meta =\nDIVIDE([Ventas], SUM(Metas[Meta]))'],
 ['Semáforo para formato condicional','Devuelve un color según el avance.','Color avance =\nSWITCH(TRUE(),\n    [% de meta] >= 1, "#2F7A3E",\n    [% de meta] >= 0.8, "#D9A43D",\n    "#8E1825"\n)'],
 ['Última fecha con ventas','Útil para títulos dinámicos: «Datos al …».','Última venta =\nCALCULATE(MAX(Ventas[Fecha]), ALL(Ventas))'],
 ['Título dinámico','Un título que cambia con los filtros.','Título =\n"Ventas de " & SELECTEDVALUE(Productos[Categoría], "todas las categorías")']
];
const grid=document.querySelector('.recipe-grid');
if(grid){
 RECIPES.forEach(([h,p,code])=>{const a=document.createElement('article');a.className='recipe';a.innerHTML=`<h3>${esc(h)}</h3><p>${esc(p)}</p><pre><code>${esc(code)}</code></pre>`;grid.append(a)});
 grid.querySelectorAll('.recipe pre').forEach(pre=>{const b=document.createElement('button');b.type='button';b.className='copy-recipe';b.textContent='Copiar';b.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(pre.textContent);b.textContent='Copiado ✓'}catch{b.textContent='Selecciona el código'}setTimeout(()=>b.textContent='Copiar',1600)});pre.style.position='relative';pre.append(b)});
}

// ---------- what's new + challenges ----------
const NEWS=[
 ['Funciones definidas por el usuario (UDF)','Vista previa · sep. 2025','Puedes crear tus propias funciones DAX reutilizables con DEFINE FUNCTION y llamarlas desde cualquier medida. Ideal para no repetir la misma lógica.','DEFINE FUNCTION Margen = (ventas, costo) => DIVIDE(ventas - costo, ventas)'],
 ['Inteligencia de tiempo por calendario','Vista previa · sep. 2025','Defines calendarios propios (fiscal, 4-4-5, semanas) en el modelo y las funciones de tiempo los respetan. Microsoft la recomienda como el camino preferido.','Ventas YTD = TOTALYTD([Ventas], \'Calendario fiscal\')'],
 ['Cálculos visuales','Disponibles en Power BI Desktop','Cálculos que viven en el visual y entienden su estructura: RUNNINGSUM, MOVINGAVERAGE, PREVIOUS, NEXT, FIRST, LAST.','Acumulado = RUNNINGSUM([Ventas])'],
 ['Funciones INFO','Disponibles','Consultan los metadatos del modelo (tablas, columnas, medidas) desde DAX: útiles para documentar.','EVALUATE INFO.VIEW.MEASURES()']
];
const QUIZ=[
 ['Quieres el % de cada categoría sobre el total. ¿Qué va en el denominador?',['CALCULATE([Ventas], ALL(Productos[Categoría]))','SUM(Ventas[Importe])','[Ventas] / 100'],0,'ALL quita el filtro de categoría solo en el denominador; el numerador sigue filtrado.'],
 ['¿Por qué usar DIVIDE en vez de «/»?',['Es más rápido siempre','Devuelve vacío (o un valor alternativo) si el divisor es 0','Redondea automáticamente'],1,'Evita el error de división por cero sin escribir un IF.'],
 ['¿Qué hace SUMX(Ventas, Ventas[Cantidad] * Ventas[Precio])?',['Suma cantidades y precios por separado','Multiplica fila por fila y suma los resultados','Multiplica los totales de cantidad y precio'],1,'Las funciones X recorren la tabla fila por fila.'],
 ['Para comparar con el año anterior necesitas…',['Una tabla Calendario continua y relacionada','Solo una columna de año','Una medida con IF'],0,'Las funciones de inteligencia de tiempo trabajan sobre una tabla de fechas completa.'],
 ['¿Qué diferencia a ALLSELECTED de ALL?',['Ninguna','ALLSELECTED respeta los filtros externos (segmentadores)','ALL es más nuevo'],1,'ALLSELECTED quita los filtros del visual pero mantiene los de afuera.'],
 ['Una medida devuelve el mismo número en todas las filas. ¿Qué pasó probablemente?',['Hay un REMOVEFILTERS o ALL de más','Faltan datos','El visual está roto'],0,'Algo está quitando el filtro de las filas; revisa CALCULATE.'],
 ['¿Qué devuelve SELECTEDVALUE(Productos[Categoría], "Todas") si hay dos categorías elegidas?',['La primera','"Todas"','Un error'],1,'Si no hay un único valor, devuelve el valor alternativo.'],
 ['¿Dónde conviene usar RUNNINGSUM?',['En una columna calculada','En un cálculo visual','En Power Query'],1,'RUNNINGSUM es una función de cálculos visuales.']
];
const fuentes=document.getElementById('fuentes');
if(fuentes){
 const news=document.createElement('section');news.className='dx-news';news.id='novedades';
 news.innerHTML=`<h2 class="section-title">Novedades de DAX 2025–2026</h2><p>Lo que cambió desde la última versión de esta guía. Las vistas previas pueden cambiar: pruébalas antes de usarlas en un reporte importante.</p><div class="dx-grid">${NEWS.map(([h,s,p,c])=>`<article class="recipe"><span class="dx-status">${esc(s)}</span><h3>${esc(h)}</h3><p>${esc(p)}</p><pre><code>${esc(c)}</code></pre></article>`).join('')}</div>`;
 const quiz=document.createElement('section');quiz.className='dx-quiz';quiz.id='retos';
 quiz.innerHTML=`<h2 class="section-title">Retos para practicar</h2><p>Ocho preguntas que uso en clase. Elige una respuesta y te digo por qué.</p><p class="dx-score" id="dx-score">0 de ${QUIZ.length} correctas</p><div class="dx-qs">${QUIZ.map(([q,opts],i)=>`<article class="dx-q" data-i="${i}"><p class="dx-qt"><b>${i+1}.</b> ${esc(q)}</p><div class="dx-opts">${opts.map((o,j)=>`<button type="button" data-j="${j}"><code>${esc(o)}</code></button>`).join('')}</div><p class="dx-why" hidden></p></article>`).join('')}</div>`;
 fuentes.before(news,quiz);
 let ok=0;
 quiz.addEventListener('click',e=>{const b=e.target.closest('.dx-opts button');if(!b)return;const card=b.closest('.dx-q');if(card.dataset.done)return;const [,,right,why]=QUIZ[+card.dataset.i];const j=+b.dataset.j;card.dataset.done='1';
  card.querySelectorAll('button').forEach(x=>{x.disabled=true;if(+x.dataset.j===right)x.classList.add('right')});if(j!==right)b.classList.add('wrong');else ok++;
  const w=card.querySelector('.dx-why');w.hidden=false;w.textContent=(j===right?'¡Bien! ':'Casi. ')+why;document.getElementById('dx-score').textContent=`${ok} de ${QUIZ.length} correctas`});
 const nav=document.querySelector('nav.jump .wrap');
 if(nav){const f=nav.querySelector('a[href="#fuentes"]');const a1=document.createElement('a');a1.href='#novedades';a1.textContent='Novedades';const a2=document.createElement('a');a2.href='#retos';a2.textContent='Retos';f?f.before(a1,a2):nav.append(a1,a2)}
}
})();

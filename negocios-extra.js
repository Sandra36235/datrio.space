// Extras for «De datos a decisiones»: a guided case with a tiny dataset and one
// self-checking exercise per step, plus where to do it with today's tools.
(()=>{
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const main=document.getElementById('main');const glos=document.getElementById('glosario');if(!main||!glos)return;

// Class note at the top of the guide.
const intro=document.querySelector('#ruta .intro');
if(intro){const n=document.createElement('div');n.className='nx-note';n.innerHTML='<b>Cómo la uso en clase.</b> Primero resolvemos juntos el caso del Café de Puyol (más abajo). Después cada estudiante repite los seis pasos con los datos de su propio trabajo y trae su prompt armado.';intro.append(n)}

const DATA=[
 ['C01',8,42,3,'Sí','No'],['C02',1,18,64,'No','Sí'],['C03',5,35,9,'Sí','No'],['C04',2,22,41,'No','Sí'],['C05',6,30,5,'No','No'],
 ['C06',1,55,80,'No','Sí'],['C07',4,28,15,'Sí','No'],['C08',3,20,33,'No','No'],['C09',7,38,2,'Sí','No'],['C10',2,25,52,'No','Sí']
];
const STEPS=[
 ['01 · La pregunta','El Café de Puyol quiere saber «¿qué clientes van a dejar de venir el próximo mes?» para enviarles un cupón a tiempo.','¿Qué tipo de problema es?',['Regresión (predecir un número)','Clasificación (predecir sí o no)','Agrupamiento (formar grupos)'],1,'Queremos saber si un cliente se va o no: la respuesta es una categoría, así que es clasificación.'],
 ['02 · Los datos','Mira la tabla de 10 clientes. Cada columna describe su comportamiento del último trimestre.','¿Cuál es la columna que queremos predecir (el objetivo)?',['Visitas al mes','Días desde la última visita','Se fue'],2,'«Se fue» es lo que queremos anticipar; las otras columnas son las pistas.'],
 ['03 · Una pista','Antes de modelar, mira la tabla. Los que se fueron tienen algo en común.','¿Qué columna parece separar mejor a quienes se fueron?',['Ticket promedio','Días desde la última visita','Código de cliente'],1,'Todos los que se fueron llevaban más de 40 días sin venir. Esa columna será clave para el modelo.'],
 ['04 · Los errores','El modelo puede equivocarse de dos formas: avisar que alguien se va y no se va (falsa alarma), o no avisar a alguien que sí se va.','Si el cupón cuesta poco y perder un cliente cuesta mucho, ¿qué error duele más?',['La falsa alarma (cupón de más)','No avisar a alguien que se va','Los dos igual'],1,'Perder al cliente es lo caro. Conviene un modelo que atrape a la mayoría de quienes se van, aunque regale algunos cupones de más.'],
 ['05 · Leer el resultado','Dos modelos: A atrapa 9 de cada 10 clientes que se van (y da 3 falsas alarmas); B atrapa 6 de 10 (con 1 falsa alarma).','¿Cuál conviene para este café?',['El modelo A','El modelo B','Ninguno'],0,'A tiene más «sensibilidad» (recall): atrapa a casi todos los que se van. Para este costo, es el mejor.'],
 ['06 · Decidir','El modelo da una probabilidad de irse para cada cliente.','¿Qué acción concreta tiene sentido?',['Enviar cupón a quien tenga más de 60 % de riesgo y medir en un mes','Enviar cupón a todos los clientes','Esperar a tener más datos'],0,'Una regla clara, con un umbral, y medir si funcionó: así se cierra el ciclo dato → decisión → evidencia.']
];
const TOOLS=[
 ['Copilot en Power BI','Haz preguntas sobre tu reporte en lenguaje natural y pídele resúmenes. Reemplaza al visual de preguntas y respuestas (Q&A), que se retira en diciembre de 2026. Necesita capacidad de Fabric.'],
 ['Agentes de datos en Fabric','Un asistente que responde preguntas sobre tus tablas y modelos dentro de Microsoft Fabric.'],
 ['Python en Excel','Escribe Python dentro de una celda de Excel (Microsoft 365) para limpiar datos o probar un modelo sencillo.'],
 ['Asistentes de IA (Claude, ChatGPT, Gemini, Copilot)','Úsalos con los prompts de esta guía para diagnosticar datos, pedir código y entender resultados. No subas datos personales: anonimiza antes.']
];
const sec=document.createElement('section');sec.id='caso';sec.className='nx-case';
sec.innerHTML=`<span class="eyebrow">Práctica / Caso guiado</span><h2>Café de Puyol: ¿quién dejará de venir?</h2>
<p>Un caso pequeño para practicar los seis pasos antes de hacerlo con tus datos. Responde cada pregunta: te digo por qué.</p>
<div class="nx-table-wrap"><table class="nx-table"><thead><tr><th>Cliente</th><th>Visitas al mes</th><th>Ticket (Bs)</th><th>Días desde la última visita</th><th>Usa la app</th><th>Se fue</th></tr></thead><tbody>
${DATA.map(r=>`<tr>${r.map((v,i)=>`<td class="${i===5?(v==='Sí'?'yes':'no'):''}">${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
<p class="nx-score" id="nx-score">0 de ${STEPS.length} pasos resueltos</p>
<div class="nx-steps">${STEPS.map(([h,ctx,q,opts],i)=>`<article class="nx-step" data-i="${i}"><h3>${esc(h)}</h3><p>${esc(ctx)}</p><p class="nx-q">${esc(q)}</p><div class="nx-opts">${opts.map((o,j)=>`<button type="button" data-j="${j}">${esc(o)}</button>`).join('')}</div><p class="nx-why" hidden></p></article>`).join('')}</div>`;
const tools=document.createElement('section');tools.id='herramientas-hoy';tools.className='nx-tools';
tools.innerHTML=`<span class="eyebrow">Actualizado · noviembre 2026</span><h2>Dónde hacerlo hoy</h2><p>No necesitas programar para empezar. Estas son las herramientas que recomiendo en clase.</p><div class="nx-tool-grid">${TOOLS.map(([h,p])=>`<article class="card"><h3>${esc(h)}</h3><p>${esc(p)}</p></article>`).join('')}</div>`;
glos.before(sec,tools);
let ok=0;
sec.addEventListener('click',e=>{const b=e.target.closest('.nx-opts button');if(!b)return;const card=b.closest('.nx-step');if(card.dataset.done)return;const [,,,,right,why]=STEPS[+card.dataset.i];const j=+b.dataset.j;card.dataset.done='1';
 card.querySelectorAll('button').forEach(x=>{x.disabled=true;if(+x.dataset.j===right)x.classList.add('right')});if(j!==right)b.classList.add('wrong');else ok++;
 const w=card.querySelector('.nx-why');w.hidden=false;w.textContent=(j===right?'¡Bien! ':'Casi. ')+why;document.getElementById('nx-score').textContent=`${ok} de ${STEPS.length} pasos resueltos`});
const nav=document.querySelector('aside nav');
if(nav){const g=nav.querySelector('a[href="#glosario"]');const a1=document.createElement('a');a1.href='#caso';a1.textContent='★ · Practica con un caso';const a2=document.createElement('a');a2.href='#herramientas-hoy';a2.textContent='Dónde hacerlo hoy';g?g.before(a1,a2):nav.append(a1,a2)}
})();

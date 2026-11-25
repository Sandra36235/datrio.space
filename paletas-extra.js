// Extras for the palette lab: colour-vision check, the palette in real charts,
// and sequential / diverging scales built from it. Reads the colours the main
// tool renders, so it follows every change automatically.
(()=>{
const pal=document.getElementById('palette');if(!pal)return;
const NS='http://www.w3.org/2000/svg';
const colors=()=>[...pal.querySelectorAll('.swatch')].map(s=>(s.getAttribute('aria-label')||'').match(/#[0-9a-f]{6}/i)?.[0]).filter(Boolean);
const hex2=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const toHex=a=>'#'+a.map(v=>Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,'0')).join('').toUpperCase();
const mix=(a,b,t)=>toHex(hex2(a).map((v,i)=>v+(hex2(b)[i]-v)*t));
const lum=h=>{const [r,g,b]=hex2(h).map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*r+.7152*g+.0722*b};

// Colour-blindness matrices (Machado et al. 2009, severity 1) and greyscale.
const M={
 normal:null,
 deuteranopia:'0.367 0.861 -0.228 0 0  0.280 0.673 0.047 0 0  -0.012 0.043 0.969 0 0  0 0 0 1 0',
 protanopia:'0.152 1.053 -0.205 0 0  0.115 0.786 0.099 0 0  -0.004 -0.048 1.052 0 0  0 0 0 1 0',
 tritanopia:'1.256 -0.077 -0.179 0 0  -0.078 0.931 0.148 0 0  0.005 0.691 0.304 0 0  0 0 0 1 0',
 grises:'0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0'
};
const svgDefs=document.createElementNS(NS,'svg');svgDefs.setAttribute('width','0');svgDefs.setAttribute('height','0');svgDefs.style.position='absolute';
svgDefs.innerHTML=Object.entries(M).filter(([,v])=>v).map(([k,v])=>`<filter id="cb-${k}"><feColorMatrix type="matrix" values="${v}"/></filter>`).join('');
document.body.append(svgDefs);

const box=document.createElement('section');box.className='px-extra';
box.innerHTML=`
<div class="px-head"><div><span class="px-kick">Revisa antes de usarla</span><h2>¿Cómo la ve <em>todo el mundo?</em></h2>
<p>Una de cada doce personas ve los colores distinto. Cambia la visión y revisa si tus gráficos se siguen entendiendo.</p></div>
<div class="px-vision" role="group" aria-label="Simular visión">${[['normal','Normal'],['deuteranopia','Deuteranopía'],['protanopia','Protanopía'],['tritanopia','Tritanopía'],['grises','Escala de grises']].map(([k,l],i)=>`<button type="button" data-v="${k}" aria-pressed="${!i}">${l}</button>`).join('')}</div></div>
<p class="px-warn" id="px-warn" aria-live="polite"></p>
<div class="px-charts" id="px-charts"></div>
<div class="px-head"><div><span class="px-kick">Para mapas de calor y semáforos</span><h2>Tu paleta en <em>escalas</em></h2>
<p>Los dashboards usan tres tipos de escala: categórica (grupos), secuencial (de poco a mucho) y divergente (debajo y encima de un punto medio).</p></div></div>
<div class="px-scales" id="px-scales"></div>`;
const anchor=document.querySelector('main')||pal.parentElement;anchor.after(box);

const svg=(w,h,inner)=>`<svg viewBox="0 0 ${w} ${h}" width="100%" role="img">${inner}</svg>`;
function charts(c){
 const bars=svg(220,130,[60,92,74,110,84,100].map((v,i)=>`<rect x="${14+i*34}" y="${120-v}" width="24" height="${v}" rx="3" fill="${c[i%c.length]}"/>`).join(''));
 const lines=svg(220,130,c.slice(0,4).map((col,k)=>{const pts=[0,1,2,3,4,5].map(i=>`${14+i*38},${100-k*18-Math.sin(i+k)*14-i*4}`).join(' ');return `<polyline points="${pts}" fill="none" stroke="${col}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`}).join(''));
 let a0=-Math.PI/2;const vals=[28,22,18,14,10,8],sumv=100;
 const donut=svg(220,130,vals.map((v,i)=>{const a1=a0+v/sumv*2*Math.PI,R=52,r=30,cx=110,cy=65,p=(a,rr)=>[cx+rr*Math.cos(a),cy+rr*Math.sin(a)],[x0,y0]=p(a0,R),[x1,y1]=p(a1,R),[x2,y2]=p(a1,r),[x3,y3]=p(a0,r),l=a1-a0>Math.PI?1:0;const d=`M${x0},${y0}A${R},${R} 0 ${l} 1 ${x1},${y1}L${x2},${y2}A${r},${r} 0 ${l} 0 ${x3},${y3}Z`;a0=a1;return `<path d="${d}" fill="${c[i%c.length]}" stroke="#fff" stroke-width="1.5"/>`}).join(''));
 const seq=scale(c[0],7,'seq');
 const heat=svg(220,130,Array.from({length:5},(_,r)=>Array.from({length:8},(_,k)=>`<rect x="${10+k*25.5}" y="${8+r*23.5}" width="23" height="21" rx="3" fill="${seq[(r*3+k*2)%7]}"/>`).join('')).join(''));
 return [['Barras',bars],['Líneas',lines],['Anillo',donut],['Mapa de calor',heat]].map(([t,s])=>`<figure><figcaption>${t}</figcaption>${s}</figure>`).join('');
}
function scale(base,n,kind,end){
 if(kind==='seq')return Array.from({length:n},(_,i)=>i<n/2?mix('#FFFFFF',base,(i+1)/Math.ceil(n/2)):mix(base,'#1E1414',(i-Math.floor(n/2))/(n-Math.floor(n/2))*0.6));
 const mid='#F4EFE8';return Array.from({length:n},(_,i)=>{const t=i/(n-1);return t<.5?mix(base,mid,t*2):mix(mid,end,(t-.5)*2)});
}
function scales(c){
 const darkest=[...c].sort((a,b)=>lum(a)-lum(b))[0],other=[...c].sort((a,b)=>Math.abs(lum(b)-lum(darkest))-Math.abs(lum(a)-lum(darkest)))[0];
 const strip=(arr,label,why)=>`<div class="px-scale"><div class="px-strip">${arr.map(h=>`<span style="background:${h}" title="${h}"></span>`).join('')}</div><p><b>${label}</b> · ${why}</p><button type="button" class="px-copy" data-copy="${arr.join(', ')}">Copiar HEX</button></div>`;
 return strip(c,'Categórica','para grupos sin orden: canal, región, producto')+strip(scale(c[0],7,'seq'),'Secuencial','de poco a mucho, con tu primer color')+strip(scale(darkest,7,'div',other===darkest?c[1]:c.find(x=>x!==darkest&&Math.abs(lum(x)-lum(darkest))>.15)||c[1]),'Divergente','debajo y encima de la meta o del promedio');
}
function warn(c){
 // Flag pairs that look alike for deuteranopia (the most common): tiny lightness gap.
 const close=[];for(let i=0;i<c.length;i++)for(let j=i+1;j<c.length;j++)if(Math.abs(lum(c[i])-lum(c[j]))<.03)close.push(`${c[i]} y ${c[j]}`);
 return close.length?`Ojo: ${close.slice(0,2).join(' · ')} tienen casi el mismo brillo; con algunas formas de daltonismo se confunden. Agrega etiquetas o cambia uno.`:'Bien: todos los colores tienen brillos distintos, así se distinguen mejor.';
}
function paint(){const c=colors();if(!c.length)return;document.getElementById('px-charts').innerHTML=charts(c);document.getElementById('px-scales').innerHTML=scales(c);document.getElementById('px-warn').textContent=warn(c)}
new MutationObserver(paint).observe(pal,{childList:true,subtree:true,attributes:true,attributeFilter:['aria-label','style']});paint();

box.querySelector('.px-vision').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 box.querySelectorAll('.px-vision button').forEach(x=>x.setAttribute('aria-pressed',x===b));
 const f=b.dataset.v==='normal'?'':`url(#cb-${b.dataset.v})`;
 for(const el of [pal,document.getElementById('px-charts'),document.getElementById('mini-chart')])if(el)el.style.filter=f});
box.addEventListener('click',async e=>{const b=e.target.closest('.px-copy');if(!b)return;try{await navigator.clipboard.writeText(b.dataset.copy);b.textContent='Copiado ✓'}catch{b.textContent='No se pudo copiar'}setTimeout(()=>b.textContent='Copiar HEX',1500)});
})();

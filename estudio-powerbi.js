(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const KEY = 'datrio-studio-v1';
  const fonts = ['Segoe UI', 'Arial', 'Verdana', 'Georgia', 'Trebuchet MS'];
  const presets = {
    Bosque: ['#416848', '#8AA47B', '#C7D6B7', '#D4A867', '#688E99', '#B67567'],
    Océano: ['#245D85', '#4796AB', '#85C3C4', '#E1B66B', '#667CAB', '#B97B83'],
    Tierra: ['#A65F42', '#D49A6A', '#DCC7A5', '#6F8567', '#897099', '#677F94'],
    Nocturno: ['#9EC5AD', '#8AAED0', '#D5B67C', '#BA9FC8', '#82C8C2', '#D9978E']
  };
  const base = {version: 1, name: 'Mi dashboard', width: 1280, height: 720, font: 'Segoe UI', labelSize: 16, bg: '#F3F5F0', surface: '#FFFFFF', text: '#26382B', colors: [...presets.Bosque], preset: 'Bosque', template: 'executive', elements: []};
  const make = (type, title, x, y, w, h, value = '') => ({id: crypto.randomUUID(), type, title, x, y, w, h, value});
  function layout(kind, width, height) {
    const list = kind === 'blank' ? [] : kind === 'sales' ? [
      make('text', 'Desempeño comercial', 40, 24, 900, 72),
      make('filter', 'Región · Todas', 40, 116, 210, 110),
      make('filter', 'Período · Este año', 40, 246, 210, 110),
      make('kpi', 'Ventas totales', 274, 116, 294, 130, '$ 248.500'),
      make('kpi', 'Ticket promedio', 588, 116, 294, 130, '$ 186'),
      make('kpi', 'Conversión', 902, 116, 338, 130, '24,8 %'),
      make('bar', 'Ventas por categoría', 274, 270, 550, 394),
      make('donut', 'Distribución por canal', 848, 270, 392, 394)
    ] : [
      make('text', 'Panorama del negocio', 40, 24, 910, 72),
      make('filter', 'Período · Este año', 976, 28, 264, 64),
      make('kpi', 'Ingresos totales', 40, 120, 384, 130, '$ 248.500'),
      make('kpi', 'Clientes activos', 448, 120, 384, 130, '1.284'),
      make('kpi', 'Crecimiento', 856, 120, 384, 130, '18,6 %'),
      make('bar', 'Ingresos por categoría', 40, 274, 710, 390),
      make('donut', 'Participación por canal', 774, 274, 466, 390)
    ];
    return list.map(e => ({...e, x: Math.round(e.x * width / 1280), y: Math.round(e.y * height / 720), w: Math.max(120, Math.round(e.w * width / 1280)), h: Math.max(60, Math.round(e.h * height / 720))}));
  }
  let state = structuredClone(base);
  state.elements = layout('executive', state.width, state.height);
  let selected = null, past = [], future = [], drag = null, pendingTemplate = null;
  function validProject(p) {
    const color = c => typeof c === 'string' && /^#[\da-f]{6}$/i.test(c);
    if (!p || p.version !== 1 || typeof p.name !== 'string' || p.name.length > 70 || !fonts.includes(p.font) || !Number.isInteger(p.labelSize) || p.labelSize < 10 || p.labelSize > 24 || !['executive', 'sales', 'blank'].includes(p.template)) return false;
    if (!Number.isInteger(p.width) || !Number.isInteger(p.height) || p.width < 400 || p.width > 2400 || p.height < 400 || p.height > 2400) return false;
    if (![p.bg,p.surface,p.text].every(color) || !Array.isArray(p.colors) || p.colors.length !== 6 || !p.colors.every(color)) return false;
    if (!Array.isArray(p.elements) || p.elements.length > 80) return false;
    const ids = new Set();
    return p.elements.every(e => {
      if (!e || typeof e.id !== 'string' || !/^[\w-]{1,80}$/.test(e.id) || ids.has(e.id)) return false;
      ids.add(e.id);
      return ['text','kpi','bar','line','donut','filter'].includes(e.type) && typeof e.title === 'string' && e.title.length <= 90 && typeof e.value === 'string' && e.value.length <= 25 && [e.x,e.y,e.w,e.h].every(Number.isFinite) && e.x >= 0 && e.y >= 0 && e.w >= 120 && e.h >= 60 && e.x + e.w <= p.width + 1 && e.y + e.h <= p.height + 1;
    });
  }
  try { const saved = JSON.parse(localStorage.getItem(KEY)); if (validProject(saved)) state = saved; } catch { /* An unavailable browser store does not prevent editing. */ }
  // The palette travels in the URL so the standalone files also work without shared storage.
  const paletteHash=new URLSearchParams(location.hash.slice(1)).get('palette');
  if(paletteHash){const colors=paletteHash.split('-').map(c=>'#'+c.toUpperCase());if(colors.length===6&&colors.every(c=>/^#[0-9a-f]{6}$/i.test(c))){state.colors=colors;state.preset='Color Lab';}try{history.replaceState(null,'',location.pathname+location.search);}catch{}}
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  function toast(message) { $('toast').textContent = message; $('toast').classList.add('visible'); clearTimeout(toast.timer); toast.timer = setTimeout(() => $('toast').classList.remove('visible'), 4000); }
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(state)); $('save-status').textContent = 'Guardado en este navegador'; } catch { $('save-status').textContent = 'Descargá el proyecto para conservarlo'; } }
  function remember() { past.push(JSON.stringify(state)); if (past.length > 50) past.shift(); future = []; }
  function change(fn) { remember(); fn(); render(); persist(); }
  function undo() { if (!past.length) return; future.push(JSON.stringify(state)); state = JSON.parse(past.pop()); selected = null; render(); persist(); }
  function redo() { if (!future.length) return; past.push(JSON.stringify(state)); state = JSON.parse(future.pop()); selected = null; render(); persist(); }
  function luminance(hex) { const [r,g,b] = hex.slice(1).match(/../g).map(x => { const v = parseInt(x,16)/255; return v <= .04045 ? v/12.92 : ((v+.055)/1.055)**2.4; }); return .2126*r+.7152*g+.0722*b; }
  function contrast(a,b) { const x = luminance(a), y = luminance(b); return (Math.max(x,y)+.05)/(Math.min(x,y)+.05); }
  const txt = (x, y, content, size = state.labelSize, color = state.text, weight = 400, extra = '') => `<text x="${x}" y="${y}" fill="${color}" font-size="${size}" font-weight="${weight}" ${extra}>${esc(content)}</text>`;
  function wrapText(content, maxWidth, size, maxLines = 2) {
    const limit = Math.max(6, Math.floor(maxWidth / (size * .61)));
    const words = content.split(/\s+/), lines = []; let line = '';
    for (const word of words) {
      if ((line + ' ' + word).trim().length > limit && line) { lines.push(line); line = word; } else line = (line + ' ' + word).trim();
    }
    if (line) lines.push(line);
    if (lines.length > maxLines) { lines.length = maxLines; lines[maxLines-1] = lines[maxLines-1].slice(0, limit-1) + '…'; }
    return lines.map(t => t.length > limit ? t.slice(0,limit-1)+'…' : t);
  }
  function elementMarkup(e, mode) {
    const {x,y,w,h} = e, color = state.colors[0], small = Math.max(11, state.labelSize - 2);
    const clip = `clip-${e.id}`;
    let body = '';
    if (e.type !== 'text') body += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${state.surface}"/>`;
    if (mode === 'background') return e.type === 'text' ? '' : body;
    if (e.type === 'text') {
      const lines = wrapText(e.title, w - 16, 30, 2);
      body += lines.map((line, i) => txt(x+4,y+32+i*34,line,30,state.text,600)).join('');
      if (h > 82) body += txt(x+4,y+112,'Diseñado en Datrio Studio · Datos de ejemplo',small,state.text,400,'opacity=".6"');
    } else if (e.type === 'filter') {
      body += wrapText(e.title,w-65,state.labelSize,2).map((line,i)=>txt(x+18,y+Math.min(32,h/2+5)+i*(state.labelSize+4),line)).join('');
      body += `<path d="M${x+w-29} ${y+h/2-3} l5 5 5-5" fill="none" stroke="${state.text}" stroke-width="1.5"/>`;
    } else {
      body += wrapText(e.title,w-40,state.labelSize,1).map(line => txt(x+20,y+31,line,state.labelSize,state.text,500)).join('');
      if (e.type === 'kpi') {
        const size = Math.min(38,Math.max(20,(w-40)/(Math.max(5,e.value.length)*.65)),h*.3);
        body += txt(x+20,y+h*.63,e.value,size,state.text,600);
        if(h>=110) body += txt(x+20,y+h-17,'vs. período anterior · ejemplo',Math.min(small, (w-40)/19),state.text,400,'opacity=".6"');
      } else if (h >= 150) {
        const left = x+32, top = y+65, cw = w-64, ch = h-112;
        if (e.type === 'bar') {
          const values = [.64,.87,.52,.95,.71], labels = ['Tecnología','Servicios','Hogar','Consumo','Otros'];
          for(let i=0;i<4;i++) { const gy=top+ch*i/3; body+=`<line x1="${left}" y1="${gy}" x2="${left+cw}" y2="${gy}" stroke="${state.text}" opacity=".08"/>`; }
          const slot=cw/5;
          values.forEach((v,i)=>{ const bh=ch*v; body+=`<rect x="${left+slot*i+slot*.18}" y="${top+ch-bh}" width="${slot*.6}" height="${bh}" rx="4" fill="${state.colors[i]}"/>`;
            body+=txt(left+slot*(i+.48),top+ch+23,cw<370?labels[i].slice(0,3):labels[i],Math.min(small,slot/6),state.text,400,'text-anchor="middle"'); });
        } else if (e.type === 'line') {
          const pts=[.75,.59,.67,.32,.4,.12], slot=cw/5;
          for(let i=0;i<4;i++) body+=`<line x1="${left}" y1="${top+ch*i/3}" x2="${left+cw}" y2="${top+ch*i/3}" stroke="${state.text}" opacity=".08"/>`;
          body+=`<polyline points="${pts.map((v,i)=>`${left+i*slot},${top+v*ch}`).join(' ')}" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
          pts.forEach((v,i)=>{body+=`<circle cx="${left+i*slot}" cy="${top+v*ch}" r="5" fill="${color}"/>`; body+=txt(left+i*slot,top+ch+23,['Ene','Feb','Mar','Abr','May','Jun'][i],small,state.text,400,'text-anchor="middle"');});
        } else if (e.type === 'donut') {
          const radius=Math.max(12,Math.min(cw*.3,ch*.34)), cx=x+w/2, cy=top+ch*.44, ring=radius*.32, circumference=2*Math.PI*radius;
          let offset=0; [.45,.32,.23].forEach((v,i)=>{body+=`<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${state.colors[i]}" stroke-width="${ring}" stroke-dasharray="${v*circumference-3} ${circumference}" stroke-dashoffset="${-offset*circumference}" transform="rotate(-90 ${cx} ${cy})"/>`;offset+=v;});
          body+=txt(cx,cy+5,'100 %',Math.max(13,radius*.3),state.text,600,'text-anchor="middle"');
          ['Online 45 %','Tienda 32 %','Otros 23 %'].forEach((label,i)=>{ const lx=x+Math.max(14,w/2-63),ly=top+ch*.86+i*(small+7); body+=`<circle cx="${lx}" cy="${ly-4}" r="4" fill="${state.colors[i]}"/>`+txt(lx+13,ly,label,small); });
        }
      } else body+=txt(x+20,y+h-20,'Vista de gráfico',small,state.text,400,'opacity=".6"');
    }
    return `<defs><clipPath id="${clip}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${e.type==='text'?0:12}"/></clipPath></defs><g clip-path="url(#${clip})">${body}</g>`;
  }
  function svgMarkup(mode = 'edit') {
    let body=`<rect width="${state.width}" height="${state.height}" fill="${state.bg}"/>`;
    for (const e of state.elements) {
      const content = elementMarkup(e,mode);
      body += mode === 'edit' ? `<g data-id="${e.id}" tabindex="0" role="button" aria-label="${esc(e.title || 'Texto')}"><rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" fill="transparent"/>${content}</g>` : content;
    }
    const e = state.elements.find(e=>e.id===selected);
    if(e && mode==='edit') body+=`<g pointer-events="none"><rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" rx="${e.type==='text'?0:12}" fill="none" stroke="#416848" stroke-width="2" stroke-dasharray="6 4"/></g><rect data-resize="${e.id}" x="${e.x+e.w-14}" y="${e.y+e.h-14}" width="18" height="18" rx="3" fill="#416848" stroke="white" stroke-width="2"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${state.width}" height="${state.height}" viewBox="0 0 ${state.width} ${state.height}" font-family="${esc(state.font)}, sans-serif">${body}</svg>`;
  }
  function renderCanvas() { const canvas=$('canvas'); canvas.setAttribute('viewBox',`0 0 ${state.width} ${state.height}`); canvas.setAttribute('font-family',`${state.font}, sans-serif`); const xml = new DOMParser().parseFromString(svgMarkup(), 'image/svg+xml'); canvas.replaceChildren(...Array.from(xml.documentElement.childNodes).map(n=>document.importNode(n,true))); }
  function renderInspector() {
    const e=state.elements.find(e=>e.id===selected);
    $('no-selection').hidden=!!e; $('inspector').hidden=!e;
    if(!e) return;
    $('element-title').value=e.title; $('element-value').value=e.value; $('value-field').hidden=e.type!=='kpi';
    ['x','y','w','h'].forEach(key=>$(`element-${key}`).value=Math.round(e[key]));
  }
  function advice() {
    const notes=[]; const cr=contrast(state.text,state.surface), bg=contrast(state.text,state.bg);
    notes.push(cr>=4.5&&bg>=4.5?`Texto legible: contraste mínimo de ${Math.min(cr,bg).toFixed(1)}:1 sobre tarjetas y fondo.`:`Subí el contraste del texto: el mínimo es ${Math.min(cr,bg).toFixed(1)}:1. Apuntá a 4,5:1 para texto pequeño.`);
    if(contrast(state.colors[0],state.surface)<3) notes.push('El color principal se pierde sobre las tarjetas. Elegí uno con mayor contraste.');
    if(state.labelSize<14) notes.push('Tus etiquetas son pequeñas. Probá con 14–18 px para facilitar la lectura.');
    const cards=state.elements.filter(e=>e.type!=='text'); let overlap=false;
    for(let i=0;i<cards.length;i++) for(let j=i+1;j<cards.length;j++) { const a=cards[i],b=cards[j];if(a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y) overlap=true; }
    if(overlap) notes.push('Hay contenedores superpuestos. Separalos para que el contenido respire.');
    if(state.elements.length>10) notes.push('Hay muchos elementos en una página. Considerá repartirlos en varias vistas.');
    if(!state.elements.length) notes.push('Empezá con un título, tres indicadores y un gráfico que responda tu pregunta principal.');
    else notes.push('Reservá el color de acento para la información más importante y mantené consistentes sus significados.');
    $('advice').replaceChildren(...notes.map(note=>{const li=document.createElement('li');li.textContent=note;return li;}));
  }
  function render() {
    $('project-name').value=state.name; $('font').value=state.font; $('label-size').value=state.labelSize;
    $('bg-color').value=state.bg; $('surface-color').value=state.surface; $('text-color').value=state.text;
    $('font-caption').textContent=`${state.font} · títulos y etiquetas`; document.querySelector('.type-specimen').style.fontFamily=state.font;
    $('canvas-size').textContent=`${state.width} × ${state.height} px`;
    $('format').value=`${state.width},${state.height}`;
    document.querySelectorAll('[data-template]').forEach(b=>b.classList.toggle('active',b.dataset.template===state.template));
    $('palette-presets').replaceChildren(...Object.keys(presets).map(name=>{const b=document.createElement('button');b.textContent=name;b.className=state.preset===name?'active':'';b.addEventListener('click',()=>change(()=>{state.colors=[...presets[name]];state.preset=name;if(name==='Nocturno'){state.bg='#18241F';state.surface='#24352C';state.text='#F1F5EC';}else{state.bg=base.bg;state.surface=base.surface;state.text=base.text;}}));return b;}));
    $('palette').replaceChildren(...state.colors.map((c,i)=>{const label=document.createElement('label'),input=document.createElement('input'),small=document.createElement('small');input.type='color';input.value=c;input.setAttribute('aria-label',`Color de gráfico ${i+1}`);small.textContent=c.toUpperCase();input.addEventListener('change',()=>change(()=>{state.colors[i]=input.value;state.preset='Personalizada';}));label.append(input,small);return label;}));
    $('undo').disabled=!past.length; $('redo').disabled=!future.length;
    renderCanvas();renderInspector();advice();
  }
  $('undo').onclick=undo; $('redo').onclick=redo;
  // Commit text and number edits on input as well as blur, including browser autofill.
  function bindLive(id, update) {
    const field=$(id); let editing=false;
    field.addEventListener('focus',()=>{editing=false;});
    field.addEventListener('input',()=>{if(!editing){remember();editing=true;}update(field.value);renderCanvas();advice();persist();$('undo').disabled=!past.length;$('redo').disabled=!future.length;});
    field.addEventListener('blur',()=>{if(editing){editing=false;render();}});
  }
  bindLive('project-name',value=>state.name=value.trim()||'Mi dashboard');
  $('font').onchange=()=>change(()=>state.font=$('font').value);
  bindLive('label-size',value=>state.labelSize=clamp(Math.round(Number(value)||16),10,24));
  [['bg-color','bg'],['surface-color','surface'],['text-color','text']].forEach(([id,key])=>$(id).onchange=()=>change(()=>state[key]=$(id).value));
  document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-tab]').forEach(t=>{t.classList.toggle('active',t===b);t.setAttribute('aria-selected',String(t===b));});$('design-panel').hidden=b.dataset.tab!=='design';$('elements-panel').hidden=b.dataset.tab!=='elements';});
  function applyTemplate(){change(()=>{state.template=pendingTemplate;state.elements=layout(pendingTemplate,state.width,state.height);selected=null;});$('template-dialog').close();}
  document.querySelectorAll('[data-template]').forEach(b=>b.onclick=()=>{pendingTemplate=b.dataset.template;if(state.elements.length)$('template-dialog').showModal();else applyTemplate();});
  $('template-confirm').onclick=applyTemplate; $('template-cancel').onclick=()=>$('template-dialog').close();
  $('format').onchange=()=>change(()=>{const [w,h]=$('format').value.split(',').map(Number);state.elements.forEach(e=>{e.x=Math.round(e.x*w/state.width);e.y=Math.round(e.y*h/state.height);e.w=clamp(Math.round(e.w*w/state.width),120,w-e.x);e.h=clamp(Math.round(e.h*h/state.height),60,h-e.y);e.x=Math.min(e.x,w-e.w);e.y=Math.min(e.y,h-e.h);});state.width=w;state.height=h;});
  const names={kpi:'Nuevo indicador',bar:'Comparación por categoría',line:'Evolución en el tiempo',donut:'Participación por grupo',filter:'Filtro · Todos',text:'Título de tu reporte'};
  document.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{
    if(state.elements.length>=80){toast('El máximo es de 80 elementos por proyecto.');return;}
    change(()=>{const type=b.dataset.add,offset=(state.elements.length%6)*24;const e=make(type,names[type],40+offset,40+offset,Math.min(type==='text'?500:360,state.width-80-offset),type==='kpi'?130:type==='filter'?70:type==='text'?90:280,type==='kpi'?'$ 12.480':'');e.h=Math.min(e.h,state.height-e.y-20);state.elements.push(e);selected=e.id;});
    toast('Elemento agregado. Podés arrastrarlo en el lienzo.');
  });
  ['title','value','x','y','w','h'].forEach(key=>bindLive(`element-${key}`,value=>{
    const e=state.elements.find(e=>e.id===selected);if(!e)return;
    if(key==='title'||key==='value')e[key]=value;else {const n=Math.round(Number(value));if(!Number.isFinite(n))return;e[key]=key==='x'?clamp(n,0,state.width-e.w):key==='y'?clamp(n,0,state.height-e.h):key==='w'?clamp(n,120,state.width-e.x):clamp(n,60,state.height-e.y);}
  }));
  function removeSelected(){if(!selected)return;change(()=>{state.elements=state.elements.filter(e=>e.id!==selected);selected=null;});}
  $('delete').onclick=removeSelected;
  $('duplicate').onclick=()=>{const e=state.elements.find(e=>e.id===selected);if(!e)return;if(state.elements.length>=80){toast('El máximo es de 80 elementos.');return;}change(()=>{const copy={...e,id:crypto.randomUUID(),x:Math.min(e.x+24,state.width-e.w),y:Math.min(e.y+24,state.height-e.h)};state.elements.push(copy);selected=copy.id;});};
  function point(event){return new DOMPoint(event.clientX,event.clientY).matrixTransform($('canvas').getScreenCTM().inverse());}
  $('canvas').addEventListener('pointerdown',event=>{
    if(event.button!==0)return;const target=event.target.closest('[data-id],[data-resize]');
    if(!target){selected=null;renderCanvas();renderInspector();return;}
    selected=target.dataset.id||target.dataset.resize;const e=state.elements.find(e=>e.id===selected),p=point(event);
    drag={id:e.id,resize:!!target.dataset.resize,start:p,original:{...e},snapshot:JSON.stringify(state),moved:false};
    $('canvas').setPointerCapture(event.pointerId);renderCanvas();renderInspector();event.preventDefault();
  });
  $('canvas').addEventListener('pointermove',event=>{if(!drag)return;const e=state.elements.find(e=>e.id===drag.id),p=point(event),dx=p.x-drag.start.x,dy=p.y-drag.start.y;if(Math.abs(dx)+Math.abs(dy)<2&&!drag.moved)return;drag.moved=true;const snap=n=>Math.round(n/4)*4;
    if(drag.resize){e.w=clamp(snap(drag.original.w+dx),120,state.width-e.x);e.h=clamp(snap(drag.original.h+dy),60,state.height-e.y);}else{e.x=clamp(snap(drag.original.x+dx),0,state.width-e.w);e.y=clamp(snap(drag.original.y+dy),0,state.height-e.h);}renderCanvas();renderInspector();
  });
  function endDrag(){if(!drag)return;if(drag.moved){past.push(drag.snapshot);if(past.length>50)past.shift();future=[];persist();}drag=null;render();}
  $('canvas').addEventListener('pointerup',endDrag);$('canvas').addEventListener('pointercancel',endDrag);
  $('canvas').addEventListener('focusin',event=>{const g=event.target.closest('[data-id]');if(g&&selected!==g.dataset.id){selected=g.dataset.id;renderInspector();}});
  document.addEventListener('keydown',event=>{if(event.target.closest('input,select,textarea')||document.querySelector('dialog[open]'))return;
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='z'){event.preventDefault();event.shiftKey?redo():undo();return;}
    if(event.key==='Escape'){selected=null;renderCanvas();renderInspector();return;}
    if(!selected)return;if(event.key==='Delete'||event.key==='Backspace'){event.preventDefault();removeSelected();}
    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();const e=state.elements.find(e=>e.id===selected);if(!e)return;change(()=>{const n=event.shiftKey?16:4;e.x=clamp(e.x+(event.key==='ArrowRight'?n:event.key==='ArrowLeft'?-n:0),0,state.width-e.w);e.y=clamp(e.y+(event.key==='ArrowDown'?n:event.key==='ArrowUp'?-n:0),0,state.height-e.h);});}
  });
  let imageTask=0;
  $('image-upload').onchange=async()=>{
    const file=$('image-upload').files[0];$('image-upload').value='';if(!file)return;
    if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>15*1024*1024){toast('Elegí una imagen PNG, JPG o WebP de hasta 15 MB.');return;}
    const task=++imageTask;$('image-result').textContent='Buscando los colores de tu imagen…';
    try{
      const bitmap=await createImageBitmap(file);if(task!==imageTask){bitmap.close();return;}const c=document.createElement('canvas');c.width=160;c.height=Math.max(1,Math.round(160*bitmap.height/bitmap.width));if(c.height>320)c.height=320;
      const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(bitmap,0,0,c.width,c.height);bitmap.close();const pixels=ctx.getImageData(0,0,c.width,c.height).data,bins=new Map();
      for(let i=0;i<pixels.length;i+=4){if(pixels[i+3]<128)continue;const r=pixels[i],g=pixels[i+1],b=pixels[i+2];const key=[r>>4,g>>4,b>>4].join(',');const cell=bins.get(key)||{r:0,g:0,b:0,n:0};cell.r+=r;cell.g+=g;cell.b+=b;cell.n++;bins.set(key,cell);}
      const candidates=[...bins.values()].sort((a,b)=>b.n-a.n).map(c=>[Math.round(c.r/c.n),Math.round(c.g/c.n),Math.round(c.b/c.n)]);
      const picked=[];for(const rgb of candidates){if(picked.every(p=>Math.hypot(...p.map((v,i)=>v-rgb[i]))>52))picked.push(rgb);if(picked.length===6)break;}
      if(!picked.length)throw Error('empty');const count=picked.length;
      // Sparse images receive related lighter/darker shades so all six chart slots remain usable.
      while(picked.length<6){const rgb=picked[(picked.length-count)%count],factor=picked.length%2?.7:1.25;picked.push(rgb.map(v=>Math.round(clamp(v*factor+(factor>1?15:0),0,255))));}
      const colors=picked.map(rgb=>'#'+rgb.map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase());
      change(()=>{state.colors=colors;state.preset='Imagen';});$('image-result').textContent=`${count} colores extraídos${count<6?' + tonos derivados':''}. Podés ajustar cada muestra. La imagen no sale de tu navegador.`;
    }catch{$('image-result').textContent='No pudimos leer esa imagen. Probá con otra que tenga colores visibles.';}
  };
  $('load-project').onclick=()=>$('project-upload').click();
  $('project-upload').onchange=async()=>{const file=$('project-upload').files[0];$('project-upload').value='';if(!file)return;if(file.size>1024*1024){toast('El proyecto debe pesar menos de 1 MB.');return;}try{const p=JSON.parse(await file.text());if(!validProject(p))throw Error('invalid');change(()=>{state=p;selected=null;});toast('Proyecto abierto. Podés deshacer para recuperar el anterior.');}catch{toast('Ese archivo no es un proyecto válido de Datrio Studio.');}};
  function theme(){const style=size=>({fontFace:state.font,fontSize:size,color:state.text});return {name:state.name,dataColors:[...state.colors],background:state.bg,foreground:state.text,tableAccent:state.colors[0],textClasses:{title:style(18),header:style(14),label:style(state.labelSize),callout:style(32)}};}
  function download(blob,extension,suffix){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=(state.name.replace(/[^\p{L}\p{N} _-]/gu,'').trim()||'Datrio')+'-'+suffix+'.'+extension;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
  async function exportPng(mode){const svg=svgMarkup(mode),blob=new Blob([svg],{type:'image/svg+xml;charset=utf-8'}),url=URL.createObjectURL(blob);try{const image=new Image();image.src=url;await image.decode();const canvas=document.createElement('canvas');canvas.width=state.width;canvas.height=state.height;canvas.getContext('2d').drawImage(image,0,0);const png=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!png)throw Error('export');download(png,'png',mode==='background'?'fondo':'mockup');}finally{URL.revokeObjectURL(url);}}
  $('export-open').onclick=()=>$('export-dialog').showModal();$('export-close').onclick=()=>$('export-dialog').close();
  document.querySelectorAll('[data-export]').forEach(button=>button.onclick=async()=>{button.disabled=true;try{const kind=button.dataset.export;if(kind==='theme')download(new Blob([JSON.stringify(theme(),null,2)],{type:'application/json'}),'json','tema-powerbi');else if(kind==='project')download(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),'json','proyecto-datrio');else await exportPng(kind);toast('Archivo preparado para descargar.');}catch{toast('No se pudo exportar. Intentá de nuevo.');}finally{button.disabled=false;}});
  render();persist();
})();

(() => {
  'use strict';
  const $=id=>document.getElementById(id), KEY='datrio-color-lab-v1', SAVED='datrio-color-collections-v1';
  const isHex=c=>typeof c==='string'&&/^#[0-9a-f]{6}$/i.test(c);
  const modes=['curated','analogous','complementary','triadic','mono'];
  const valid=p=>p&&Array.isArray(p.colors)&&p.colors.length===6&&p.colors.every(isHex)&&Array.isArray(p.locked)&&p.locked.length===6&&p.locked.every(x=>typeof x==='boolean')&&modes.includes(p.mode);
  let state={colors:['#243A32','#688B58','#B9CE9D','#F2E5BC','#DBA37A','#A45D51'],locked:Array(6).fill(false),mode:'curated'},saved=[],past=[],future=[],editing=0,pendingColor='';
  try{const p=JSON.parse(localStorage.getItem(KEY));if(valid(p))state=p;const list=JSON.parse(localStorage.getItem(SAVED));if(Array.isArray(list))saved=list.filter(p=>p&&typeof p.id==='string'&&typeof p.name==='string'&&p.name.length<=50&&Array.isArray(p.colors)&&p.colors.length===6&&p.colors.every(isHex)).slice(0,50);}catch{}
  const initialHash=new URLSearchParams(location.hash.slice(1)).get('colors');
  if(initialHash){const colors=initialHash.split('-').map(c=>'#'+c.toUpperCase());if(colors.length===6&&colors.every(isHex))state.colors=colors;}
  function toast(message){$('toast').textContent=message;$('toast').classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').classList.remove('visible'),3800);}
  const clone=()=>JSON.stringify(state);
  function persist(){try{localStorage.setItem(KEY,clone());}catch{}}
  function commit(fn){past.push(clone());if(past.length>60)past.shift();future=[];fn();render();persist();}
  function undo(){if(!past.length)return;future.push(clone());state=JSON.parse(past.pop());render();persist();}
  function redo(){if(!future.length)return;past.push(clone());state=JSON.parse(future.pop());render();persist();}
  function rgb(hex){return hex.slice(1).match(/../g).map(c=>parseInt(c,16));}
  function luminance(hex){const [r,g,b]=rgb(hex).map(c=>{c/=255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;});return .2126*r+.7152*g+.0722*b;}
  function contrast(a,b){const x=luminance(a),y=luminance(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
  const foreground=c=>contrast(c,'#FFFFFF')>contrast(c,'#17251E')?'#FFFFFF':'#17251E';
  function toHsl(hex){const [r,g,b]=rgb(hex).map(v=>v/255),max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min,l=(max+min)/2;let h=0,s=0;if(d){s=d/(1-Math.abs(2*l-1));h=max===r?((g-b)/d)%6:max===g?(b-r)/d+2:(r-g)/d+4;h*=60;}return[(h+360)%360,s*100,l*100];}
  function fromHsl(h,s,l){h=((h%360)+360)%360;s=Math.max(0,Math.min(100,s))/100;l=Math.max(0,Math.min(100,l))/100;const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2;const channels=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];return'#'+channels.map(v=>Math.round((v+m)*255).toString(16).padStart(2,'0')).join('').toUpperCase();}
  const random=(a,b)=>a+(b-a)*crypto.getRandomValues(new Uint32Array(1))[0]/4294967296;
  function colorName(hex){const[h,s,l]=toHsl(hex);if(l<12)return'Noche';if(l>94)return'Nube';if(s<12)return l<45?'Pizarra':'Piedra';const families=h<15?'Terracota':h<42?'Arcilla':h<68?'Miel':h<100?'Oliva':h<160?'Bosque':h<195?'Laguna':h<245?'Océano':h<285?'Lavanda':h<325?'Orquídea':'Rosa';return families+(l>75?' suave':l<33?' profundo':'');}
  const icons={lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',unlock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 7.5-2"/>',copy:'<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h4"/>',edit:'<path d="M4 7h16M4 17h16M9 4v6m7 4v6"/>',left:'<path d="m14 6-6 6 6 6"/>',right:'<path d="m10 6 6 6-6 6"/>'};
  const icon=name=>`<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name]}</svg>`;
  function render(){
    const active=document.activeElement,focusIndex=active?.dataset?.index,focusAction=active?.dataset?.action;
    $('palette').replaceChildren(...state.colors.map((c,i)=>{const section=document.createElement('div');section.className='swatch';section.style.backgroundColor=c;section.style.color=foreground(c);section.setAttribute('aria-label',`Color ${i+1}: ${c}`);
      section.innerHTML=`<span class="swatch-position">0${i+1}</span><button class="lock" data-action="lock" data-index="${i}" aria-label="${state.locked[i]?'Desbloquear':'Bloquear'} color ${i+1}" aria-pressed="${state.locked[i]}" title="${state.locked[i]?'Desbloquear':'Bloquear'} color">${icon(state.locked[i]?'lock':'unlock')}</button><div class="swatch-tools"><button data-action="copy" data-index="${i}" aria-label="Copiar ${c}" title="Copiar HEX">${icon('copy')}</button><button data-action="edit" data-index="${i}" aria-label="Editar color ${i+1}" title="Editar color">${icon('edit')}</button><button data-action="left" data-index="${i}" aria-label="Mover color ${i+1} a la izquierda" title="Mover a la izquierda" ${i===0?'disabled':''}>${icon('left')}</button><button data-action="right" data-index="${i}" aria-label="Mover color ${i+1} a la derecha" title="Mover a la derecha" ${i===5?'disabled':''}>${icon('right')}</button></div><span class="swatch-type" aria-hidden="true">Aa</span><button class="swatch-hex" data-action="edit" data-index="${i}" aria-label="Editar código ${c}">${c.slice(1)}</button><span class="swatch-name">${colorName(c)}</span><span class="swatch-rgb">${rgb(c).join(' · ')}</span>`;return section;}));
    $('mini-chart').replaceChildren(...state.colors.map((c,i)=>{const bar=document.createElement('div');bar.style.backgroundColor=c;bar.style.height=[48,72,58,95,67,83][i]+'%';bar.title=c;return bar;}));
    $('contrast-dots').replaceChildren(...state.colors.map((c,i)=>{const b=document.createElement('button');b.style.backgroundColor=c;b.title=`${c}: ${contrast(c,'#FFFFFF').toFixed(1)}:1 sobre blanco`;b.setAttribute('aria-label',`Revisar contraste de ${c}`);b.onclick=()=>openColor(i);return b;}));
    $('readability').textContent=state.colors.filter(c=>contrast(c,'#FFFFFF')>=4.5).length;
    $('saved-count').textContent=saved.length;$('undo').disabled=!past.length;$('redo').disabled=!future.length;$('harmony').value=state.mode;
    const locked=state.locked.filter(Boolean).length;$('palette-caption').textContent=`6 colores · ${locked?`${locked} ${locked===1?'tono bloqueado':'tonos bloqueados'}`:'una nueva posibilidad con cada espacio'}`;
    $('apply').href='estudio-powerbi.html#palette='+state.colors.map(c=>c.slice(1)).join('-');
    if(focusIndex!==undefined&&focusAction)document.querySelector(`[data-index="${focusIndex}"][data-action="${focusAction}"]`)?.focus({preventScroll:true});
  }
  function generate(){
    if(state.locked.every(Boolean)){toast('Todos los tonos están bloqueados. Liberá uno para explorar.');return;}
    commit(()=>{const anchorIndex=state.locked.indexOf(true),anchor=anchorIndex>=0?toHsl(state.colors[anchorIndex]):[random(0,360),random(32,72),random(35,65)];const[h,s,l]=anchor;
      const schemes=[[0,16,38,160,180,200],[0,15,180,195,35,215],[0,30,60,180,210,240],[0,8,16,110,130,145]],scheme=schemes[Math.floor(random(0,schemes.length))];
      const lights=[24,43,68,89,66,42];
      state.colors=state.colors.map((color,i)=>{if(state.locked[i])return color;const step=anchorIndex>=0?i-anchorIndex:i;let hue,sat,light;
        if(state.mode==='mono'){hue=h;sat=s+random(-6,6);light=18+i*13+random(-3,3);}
        else if(state.mode==='analogous'){hue=h+step*17;sat=s+random(-10,10);light=lights[i]+random(-8,8);}
        else if(state.mode==='complementary'){hue=h+(Math.abs(step)%2?180:0)+random(-12,12);sat=s+random(-12,12);light=lights[i]+random(-6,6);}
        else if(state.mode==='triadic'){hue=h+((step%3+3)%3)*120+random(-7,7);sat=s+random(-10,10);light=lights[i]+random(-7,7);}
        else{hue=h+scheme[(i+(anchorIndex>=0?6-anchorIndex:0))%6]+random(-7,7);sat=random(25,60);light=lights[i]+random(-6,6);}
        return fromHsl(hue,sat,light);
      });});
  }
  $('generate').onclick=generate;$('undo').onclick=undo;$('redo').onclick=redo;
  $('harmony').onchange=()=>commit(()=>state.mode=$('harmony').value);
  document.addEventListener('keydown',event=>{if(document.querySelector('dialog[open]')||event.target.closest('input,select,textarea,[contenteditable=true]'))return;
    if(event.code==='Space'&&(event.target.closest('#palette button')||!event.target.closest('button,a'))){event.preventDefault();if(!event.repeat)generate();}
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='z'){event.preventDefault();event.shiftKey?redo():undo();}
  });
  $('palette').addEventListener('click',event=>{const b=event.target.closest('[data-action]');if(!b)return;const i=Number(b.dataset.index),action=b.dataset.action;
    if(action==='lock')commit(()=>state.locked[i]=!state.locked[i]);
    if(action==='copy')copy(state.colors[i]);
    if(action==='edit')openColor(i);
    if(action==='left'||action==='right'){const j=i+(action==='left'?-1:1);if(j<0||j>5)return;commit(()=>{[state.colors[i],state.colors[j]]=[state.colors[j],state.colors[i]];[state.locked[i],state.locked[j]]=[state.locked[j],state.locked[i]];});}
  });
  function updateColorPreview(color,shades=false){if(!isHex(color))return;pendingColor=color.toUpperCase();$('hex').value=pendingColor;$('picker').value=pendingColor;$('hex-error').textContent='';$('color-preview').style.backgroundColor=pendingColor;$('color-preview').style.color=foreground(pendingColor);$('white-ratio').textContent=contrast(color,'#FFFFFF').toFixed(1)+':1';$('black-ratio').textContent=contrast(color,'#000000').toFixed(1)+':1';
    if(shades){const[h,s]=toHsl(color);$('shades').replaceChildren(...[15,25,37,50,63,76,89].map(l=>{const c=fromHsl(h,s,l),b=document.createElement('button');b.style.backgroundColor=c;b.setAttribute('aria-label',`Usar matiz ${c}`);b.title=c;b.onclick=()=>updateColorPreview(c);return b;}));}
  }
  function openColor(i){editing=i;$('color-title').textContent=`Color ${i+1}, a tu manera.`;updateColorPreview(state.colors[i],true);$('color-dialog').showModal();}
  $('picker').oninput=()=>updateColorPreview($('picker').value);
  $('hex').oninput=()=>{const value=$('hex').value,hex=value.startsWith('#')?value:'#'+value;if(isHex(hex))updateColorPreview(hex);};
  function applyColor(){let color=$('hex').value.trim();if(!color.startsWith('#'))color='#'+color;if(!isHex(color)){$('hex-error').textContent='Ingresá seis caracteres HEX, por ejemplo #416848.';return;}commit(()=>{state.colors[editing]=color.toUpperCase();state.locked[editing]=true;});$('color-dialog').close();toast('Color ajustado y bloqueado para conservarlo.');}
  $('color-apply').onclick=applyColor;$('hex').onkeydown=event=>{if(event.key==='Enter'){event.preventDefault();applyColor();}};
  document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());
  async function copy(text){try{await navigator.clipboard.writeText(text);toast('Copiado. Tu paleta va con vos.');}catch{if($('export-dialog').open)$('export-dialog').close();$('copy-text').value=text;$('copy-dialog').showModal();$('copy-text').select();}}
  $('export-open').onclick=()=>{$('export-strip').replaceChildren(...state.colors.map(c=>{const span=document.createElement('span');span.style.backgroundColor=c;return span;}));$('export-dialog').showModal();};
  document.querySelectorAll('[data-copy]').forEach(b=>b.onclick=()=>copy(b.dataset.copy==='hex'?state.colors.join(', '):':root {\n'+state.colors.map((c,i)=>`  --color-${i+1}: ${c};`).join('\n')+'\n}'));
  function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
  function theme(){return{name:'Paleta Datrio',dataColors:[...state.colors],background:'#FFFFFF',foreground:'#22392D',tableAccent:state.colors[0]};}
  async function exportPng(){const canvas=document.createElement('canvas');canvas.width=1800;canvas.height=1050;const ctx=canvas.getContext('2d');ctx.fillStyle='#FAFBF8';ctx.fillRect(0,0,1800,1050);ctx.fillStyle='#22392D';ctx.font='500 32px Segoe UI, Arial';ctx.fillText('datrio.space / COLOR LAB',60,65);
    state.colors.forEach((c,i)=>{ctx.fillStyle=c;ctx.fillRect(60+i*280,115,280,760);ctx.fillStyle=foreground(c);ctx.font='500 30px Segoe UI, Arial';ctx.fillText(c,82+i*280,800);ctx.font='18px Segoe UI, Arial';ctx.fillText(colorName(c),82+i*280,834);});ctx.fillStyle='#7C827A';ctx.font='22px Segoe UI, Arial';ctx.fillText('Una combinación para tu próxima idea.',60,955);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('export');download(blob,'paleta-datrio.png');}
  document.querySelectorAll('[data-export]').forEach(b=>b.onclick=async()=>{b.disabled=true;try{if(b.dataset.export==='theme')download(new Blob([JSON.stringify(theme(),null,2)],{type:'application/json'}),'paleta-powerbi.json');else await exportPng();toast('Paleta preparada para descargar.');}catch{toast('No se pudo exportar. Intentá de nuevo.');}finally{b.disabled=false;}});
  $('save').onclick=()=>{if(saved.length>=50){toast('Tenés 50 paletas. Podés exportarlas o eliminar una para guardar otra.');return;}$('palette-name').value='';$('save-dialog').showModal();};
  $('save-form').onsubmit=event=>{event.preventDefault();const name=$('palette-name').value.trim();if(!name){$('palette-name').setCustomValidity('Escribí un nombre para tu paleta.');$('palette-name').reportValidity();return;}const entry={id:crypto.randomUUID(),name,colors:[...state.colors]};try{localStorage.setItem(SAVED,JSON.stringify([entry,...saved]));saved.unshift(entry);$('save-dialog').close();render();toast('Paleta guardada en este navegador.');}catch{toast('El navegador no permite guardar. Exportá tu paleta para conservarla.');}};
  $('palette-name').oninput=()=>$('palette-name').setCustomValidity('');
  function renderCollection(){const list=$('saved-list');list.replaceChildren();if(!saved.length){const p=document.createElement('p');p.className='empty';p.textContent='Todavía no guardaste ninguna paleta. Encontrá una combinación que te guste y tocá Guardar.';list.append(p);return;}
    saved.forEach(entry=>{const row=document.createElement('div'),load=document.createElement('button'),title=document.createElement('strong'),strip=document.createElement('span'),remove=document.createElement('button');row.className='saved-palette';load.className='saved-load';title.textContent=entry.name;strip.className='saved-strip';entry.colors.forEach(c=>{const span=document.createElement('span');span.style.backgroundColor=c;strip.append(span);});load.append(title,strip);load.onclick=()=>{commit(()=>{state.colors=[...entry.colors];state.locked=Array(6).fill(false);});$('collection-dialog').close();toast('Paleta recuperada.');};remove.textContent='Eliminar';remove.className='saved-delete';remove.setAttribute('aria-label',`Eliminar paleta ${entry.name}`);remove.onclick=()=>{const next=saved.filter(p=>p.id!==entry.id);try{localStorage.setItem(SAVED,JSON.stringify(next));saved=next;renderCollection();render();toast('Paleta eliminada de este navegador.');}catch{toast('No se pudo actualizar la colección.');}};row.append(load,remove);list.append(row);});
  }
  $('collection').onclick=()=>{renderCollection();$('collection-dialog').showModal();};
  $('image-upload').onchange=async()=>{const file=$('image-upload').files[0];$('image-upload').value='';if(!file)return;if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>15*1024*1024){toast('Usá una imagen PNG, JPG o WebP de hasta 15 MB.');return;}if(state.locked.every(Boolean)){toast('Desbloqueá al menos un color para usar los de la imagen.');return;}toast('Buscando los tonos de tu imagen…');try{const image=await createImageBitmap(file),c=document.createElement('canvas');c.width=160;c.height=Math.max(1,Math.min(240,Math.round(160*image.height/image.width)));const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0,c.width,c.height);image.close();const pixels=ctx.getImageData(0,0,c.width,c.height).data,bins=new Map();for(let i=0;i<pixels.length;i+=4){if(pixels[i+3]<128)continue;const[r,g,b]=[pixels[i],pixels[i+1],pixels[i+2]],key=[r>>4,g>>4,b>>4].join(','),cell=bins.get(key)||{r:0,g:0,b:0,n:0};cell.r+=r;cell.g+=g;cell.b+=b;cell.n++;bins.set(key,cell);}const candidates=[...bins.values()].sort((a,b)=>b.n-a.n).map(c=>[Math.round(c.r/c.n),Math.round(c.g/c.n),Math.round(c.b/c.n)]),picked=[];for(const rgb of candidates){if(picked.every(p=>Math.hypot(...p.map((v,i)=>v-rgb[i]))>50))picked.push(rgb);if(picked.length===6)break;}if(!picked.length)throw Error('empty');const count=picked.length;while(picked.length<6){const hex='#'+picked[(picked.length-count)%count].map(v=>v.toString(16).padStart(2,'0')).join(''),[h,s,l]=toHsl(hex);picked.push(rgb(fromHsl(h,s,Math.max(10,Math.min(94,l+(picked.length%2?-18:20))))));}const extracted=picked.map(p=>'#'+p.map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase());commit(()=>{let next=0;state.colors=state.colors.map((c,i)=>state.locked[i]?c:extracted[next++]);});toast(`${count} colores extraídos${count<6?' y tonos derivados':''}. Se conservaron los tonos bloqueados.`);}catch{toast('No pudimos leer los colores. Probá con otra imagen.');}};
  render();persist();
})();

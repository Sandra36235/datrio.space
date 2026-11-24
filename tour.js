// Intro videos for the home page. The salon intro plays on arrival; the study
// has its own short intro the first time the visitor enters it. Both end on a
// button that hands the room back for free play with Puyol.
import {mountLogo,LOGO_MS} from './brand/logo-anim.js?v=3';
import {CHAPTERS,STUDIO_CHAPTERS,INTRO_MS,STUDIO_MS,chapterAt,shotAt,chapterForHash,introProgress} from './tour-math.js?v=pastel-21';

const C={cherry:'#8E1825',columbia:'#C8D9EC',butter:'#FFEDAD',chocolate:'#3D2722'};
const svg={
 cup:(body,band)=>`<svg width="64" height="78" viewBox="0 0 64 78"><path d="M6 8h52l-7 66H13z" fill="${body}" stroke="${C.chocolate}" stroke-width="2.5"/><rect x="2" y="2" width="60" height="9" rx="3" fill="#fff" stroke="${C.chocolate}" stroke-width="2.5"/><path d="M20 32q12-10 24 0" stroke="${band}" stroke-width="4" fill="none"/></svg>`,
 record:`<svg width="72" height="72" viewBox="0 0 72 72"><circle cx="36" cy="36" r="34" fill="${C.chocolate}"/><circle cx="36" cy="36" r="23" fill="none" stroke="#5c4038" stroke-width="2"/><circle cx="36" cy="36" r="11" fill="${C.butter}"/><circle cx="36" cy="36" r="2.5" fill="${C.chocolate}"/></svg>`,
 ball:`<svg width="46" height="46" viewBox="0 0 46 46"><circle cx="23" cy="23" r="21" fill="#fff" stroke="${C.chocolate}" stroke-width="2.5"/><path d="M23 13l9 6-3 10H17l-3-10z" fill="${C.chocolate}"/></svg>`,
 book:`<svg width="58" height="74" viewBox="0 0 58 74"><rect x="2" y="2" width="54" height="70" rx="4" fill="${C.columbia}" stroke="${C.chocolate}" stroke-width="2.5"/><rect x="2" y="2" width="10" height="70" fill="${C.cherry}"/><rect x="20" y="18" width="28" height="5" fill="${C.cherry}"/><rect x="20" y="28" width="20" height="4" fill="${C.chocolate}"/></svg>`,
 star:(fill)=>`<svg viewBox="0 0 60 60" width="100%" height="100%"><path d="M30 2l6 18 18-6-12 15 12 15-18-6-6 18-6-18-18 6 12-15L6 14l18 6z" fill="${fill}" stroke="${C.chocolate}" stroke-width="2.5" stroke-linejoin="round"/><circle cx="30" cy="30" r="8" fill="${C.butter}" stroke="${C.chocolate}" stroke-width="2"/></svg>`
};
const seen=key=>{try{return sessionStorage.getItem(key)==='1'}catch{return false}};
const remember=key=>{try{sessionStorage.setItem(key,'1')}catch{}};

export function startTour(api){
 const film=document.getElementById('film');if(!film)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const awning=film.querySelector('.awning'),fallers=film.querySelector('.fallers'),go=film.querySelector('.intro-go');
 const SEQ={
  salon:{room:'salon',chapters:CHAPTERS,ms:INTRO_MS,key:'datrio-intro-seen',label:'Recorrer el espacio →',title:true,night:true},
  estudio:{room:'estudio',chapters:STUDIO_CHAPTERS,ms:STUDIO_MS,key:'datrio-studio-seen',label:'Recorrer el estudio →',title:false,night:false}
 };
 for(const s of Object.values(SEQ))s.cards=[...film.querySelectorAll(`.captions[data-room="${s.room}"] .story-card`)];
 let raf=0,timers=[],start=0,room='salon',state='',seq=SEQ.salon;
 // Big liquid logo that opens the salon intro, on plain cherry, before the awning lifts.
 const logoLayer=document.createElement('div');logoLayer.className='intro-logo';logoLayer.setAttribute('aria-hidden','true');
 film.querySelector('.film-stage')?.appendChild(logoLayer);
 const bigLogo=reduced?null:mountLogo(logoLayer,{color:'#FFEDAD',className:'intro-logo-svg',width:541,height:150});

 // Title letters rise once; captions get a sticker.
 let k=0;for(const part of film.querySelectorAll('.hero-film .a, .hero-film .b em')){const text=part.textContent;part.textContent='';
  for(const line of text.split('\n')){if(part.childNodes.length)part.append(document.createElement('br'));const w=document.createElement('span');for(const ch of line){const s=document.createElement('span');s.textContent=ch===' '?' ':ch;s.style.animationDelay=(.9+k++*.035)+'s';w.append(s)}part.append(w)}}
 film.querySelectorAll('.captions .story-card:not(.serene)').forEach((c,i)=>{const s=document.createElement('span');s.className='sticker';s.setAttribute('aria-hidden','true');s.innerHTML=svg.star(i%2?C.cherry:C.columbia);c.append(s)});

 function spawnFallers(){if(!fallers||reduced)return;fallers.replaceChildren();
  const items=[svg.cup(C.columbia,C.cherry),svg.record,svg.cup(C.butter,C.cherry),svg.ball,svg.book],count=innerWidth<720?3:items.length;
  for(let i=0;i<count;i++){const d=document.createElement('div');d.className='faller';d.innerHTML=items[i];d.style.left=(6+i*(88/count))+'%';d.style.setProperty('--d',(3.6+(i%3)*.7)+'s');d.style.setProperty('--r',((i%2?1:-1)*(200+i*45))+'deg');d.style.animationDelay=(1.4+i*.35)+'s';fallers.append(d)}}
 function setState(s){state=s;for(const name of ['intro','end','free'])film.classList.toggle('is-'+name,s===name)}
 const showCard=i=>{for(const s of Object.values(SEQ))s.cards.forEach((c,j)=>c.classList.toggle('is-on',s===seq&&j===i))};
 const clearTimers=()=>{timers.forEach(clearTimeout);timers=[];cancelAnimationFrame(raf)};
 const later=(ms,fn)=>timers.push(setTimeout(fn,ms));
 function switchRoom(name){if(room!==name){room=name;api.chooseRoom(name)}}

 function frame(now){
  if(state!=='intro')return;
  const p=introProgress(now-start,seq.ms),shot=shotAt(p,seq.chapters);
  api.setShot(shot);api.setNight(seq.night?shot.night:0);
  const {index}=chapterAt(p,seq.chapters.length);
  film.classList.toggle('show-title',seq.title&&index===0);showCard(index-1);
  if(p>=1){end();return}
  raf=requestAnimationFrame(frame);
 }
 function play(next){
  clearTimers();seq=next;film.dataset.seq=seq.room;
  api.setTourMode(true);setState('intro');showCard(-1);film.classList.toggle('show-title',seq.title);
  if(go)go.textContent=seq.label;
  const begin=()=>{switchRoom(seq.room);api.setShot(seq.chapters[0].shot);api.setNight(seq.night?1:0);if(seq.title)spawnFallers();awning?.classList.add('open');start=performance.now()+800;raf=requestAnimationFrame(frame)};
  // The awning drops like a portal, the room changes behind it, then it lifts.
  if(awning&&!reduced){
   awning.classList.remove('open');
   if(seq.title&&bigLogo){logoLayer.classList.add('on');let next=false;const after=()=>{if(next||state!=='intro')return;next=true;logoLayer.classList.remove('on');later(400,begin)};bigLogo.play(()=>later(250,after));later(LOGO_MS*2+500,after)}
   else later(seq.room===room&&seq.title?500:1450,begin);
  }else begin();
 }
 function end(){
  clearTimers();setState('end');showCard(-1);film.classList.toggle('show-title',seq.title);
  api.setShot(seq.chapters[0].shot);api.setNight(0);
  go?.focus({preventScroll:true});
 }
 function goFree(){
  clearTimers();setState('free');showCard(-1);film.classList.remove('show-title');
  awning?.classList.add('open');fallers?.replaceChildren();logoLayer.classList.remove('on');
  api.setTourMode(false);api.setNight(0);remember(seq.key);
 }

 film.querySelector('.intro-skip')?.addEventListener('click',goFree);
 go?.addEventListener('click',goFree);
 film.querySelector('.replay')?.addEventListener('click',()=>play(SEQ[room]));
 // Room buttons (nav, world cards, logo) are handled here, before universe.js,
 // so the study can open through the portal the first time.
 document.addEventListener('click',e=>{
  const b=e.target.closest('[data-room], .topbar .logo');if(!b)return;
  e.preventDefault();e.stopPropagation();
  const name=b.dataset.room==='estudio'?'estudio':'salon';
  film.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'});
  if(name==='estudio'&&!seen(SEQ.estudio.key)&&!reduced){play(SEQ.estudio);return}
  seq=SEQ[name];switchRoom(name);if(state!=='free')goFree();else api.setTourMode(false);
 },true);
 // Puyol's buttons always work: if an intro is running, they end it first.
 document.addEventListener('click',e=>{if(state!=='free'&&e.target.closest('.walk-hud button'))goFree()},true);

 const h=chapterForHash(location.hash);
 room=h.room;
 if(h.mode==='free'||seen(SEQ.salon.key)||reduced){seq=SEQ[h.room];goFree()}else play(SEQ.salon);
}

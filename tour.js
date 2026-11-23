// The home page's intro video: the awning lifts, the title appears and the
// camera tours the salon on its own (café → música → biblioteca → Puyol).
// It ends on "Recorrer el espacio", which hands the room back to the visitor.
import {CHAPTERS,chapterAt,shotAt,chapterForHash,introProgress} from './tour-math.js?v=pastel-13';

const C={cherry:'#8E1825',columbia:'#C8D9EC',butter:'#FFEDAD',chocolate:'#3D2722'};
const svg={
 cup:(body,band)=>`<svg width="64" height="78" viewBox="0 0 64 78"><path d="M6 8h52l-7 66H13z" fill="${body}" stroke="${C.chocolate}" stroke-width="2.5"/><rect x="2" y="2" width="60" height="9" rx="3" fill="#fff" stroke="${C.chocolate}" stroke-width="2.5"/><path d="M20 32q12-10 24 0" stroke="${band}" stroke-width="4" fill="none"/></svg>`,
 record:`<svg width="72" height="72" viewBox="0 0 72 72"><circle cx="36" cy="36" r="34" fill="${C.chocolate}"/><circle cx="36" cy="36" r="23" fill="none" stroke="#5c4038" stroke-width="2"/><circle cx="36" cy="36" r="11" fill="${C.butter}"/><circle cx="36" cy="36" r="2.5" fill="${C.chocolate}"/></svg>`,
 ball:`<svg width="46" height="46" viewBox="0 0 46 46"><circle cx="23" cy="23" r="21" fill="#fff" stroke="${C.chocolate}" stroke-width="2.5"/><path d="M23 13l9 6-3 10H17l-3-10z" fill="${C.chocolate}"/></svg>`,
 book:`<svg width="58" height="74" viewBox="0 0 58 74"><rect x="2" y="2" width="54" height="70" rx="4" fill="${C.columbia}" stroke="${C.chocolate}" stroke-width="2.5"/><rect x="2" y="2" width="10" height="70" fill="${C.cherry}"/><rect x="20" y="18" width="28" height="5" fill="${C.cherry}"/><rect x="20" y="28" width="20" height="4" fill="${C.chocolate}"/></svg>`,
 star:(fill)=>`<svg viewBox="0 0 60 60" width="100%" height="100%"><path d="M30 2l6 18 18-6-12 15 12 15-18-6-6 18-6-18-18 6 12-15L6 14l18 6z" fill="${fill}" stroke="${C.chocolate}" stroke-width="2.5" stroke-linejoin="round"/><circle cx="30" cy="30" r="8" fill="${C.butter}" stroke="${C.chocolate}" stroke-width="2"/></svg>`
};
const SEEN='datrio-intro-seen';

export function startTour(api){
 const film=document.getElementById('film');if(!film)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const cards=[...film.querySelectorAll('.captions .story-card')];
 const awning=film.querySelector('.awning'),fallers=film.querySelector('.fallers');
 let raf=0,start=0,room='salon',state='';

 // Title letters rise once; captions get a sticker.
 let k=0;for(const part of film.querySelectorAll('.hero-film .a, .hero-film .b em')){const text=part.textContent;part.textContent='';
  for(const line of text.split('\n')){if(part.childNodes.length)part.append(document.createElement('br'));const w=document.createElement('span');for(const ch of line){const s=document.createElement('span');s.textContent=ch===' '?' ':ch;s.style.animationDelay=(.9+k++*.035)+'s';w.append(s)}part.append(w)}}
 cards.forEach((c,i)=>{if(c.classList.contains('serene'))return;const s=document.createElement('span');s.className='sticker';s.setAttribute('aria-hidden','true');s.innerHTML=svg.star(i%2?C.cherry:C.columbia);c.append(s)});

 function spawnFallers(){if(!fallers||reduced)return;fallers.replaceChildren();
  const items=[svg.cup(C.columbia,C.cherry),svg.record,svg.cup(C.butter,C.cherry),svg.ball,svg.book],count=innerWidth<720?3:items.length;
  for(let i=0;i<count;i++){const d=document.createElement('div');d.className='faller';d.innerHTML=items[i];d.style.left=(6+i*(88/count))+'%';d.style.setProperty('--d',(3.6+(i%3)*.7)+'s');d.style.setProperty('--r',((i%2?1:-1)*(200+i*45))+'deg');d.style.animationDelay=(1.4+i*.35)+'s';fallers.append(d)}}
 function setState(s){state=s;for(const name of ['intro','end','free'])film.classList.toggle('is-'+name,s===name)}
 const showCard=i=>cards.forEach((c,j)=>c.classList.toggle('is-on',j===i));

 function frame(now){
  if(state!=='intro')return;
  const p=introProgress(now-start),shot=shotAt(p);
  api.setShot(shot);api.setNight(shot.night);
  const {index}=chapterAt(p,CHAPTERS.length);
  film.classList.toggle('show-title',index===0);showCard(index-1);
  if(p>=1){end();return}
  raf=requestAnimationFrame(frame);
 }
 function play(){
  cancelAnimationFrame(raf);
  if(room!=='salon'){room='salon';api.chooseRoom('salon',false)}
  api.setTourMode(true);setState('intro');showCard(-1);film.classList.add('show-title');spawnFallers();
  api.setShot(CHAPTERS[0].shot);api.setNight(1);
  if(awning){awning.classList.remove('open');void awning.offsetWidth;setTimeout(()=>awning.classList.add('open'),500)}
  start=performance.now()+1000;raf=requestAnimationFrame(frame);
 }
 function end(){
  cancelAnimationFrame(raf);setState('end');showCard(-1);film.classList.add('show-title');
  api.setShot(CHAPTERS[0].shot);api.setNight(0);
  film.querySelector('.intro-go')?.focus({preventScroll:true});
 }
 function goFree(){
  cancelAnimationFrame(raf);setState('free');showCard(-1);film.classList.remove('show-title');
  awning?.classList.add('open');fallers?.replaceChildren();
  api.setTourMode(false);api.setNight(0);
  try{sessionStorage.setItem(SEEN,'1')}catch{}
 }

 film.querySelector('.intro-skip')?.addEventListener('click',goFree);
 film.querySelector('.intro-go')?.addEventListener('click',goFree);
 film.querySelector('.replay')?.addEventListener('click',play);
 // Room buttons (nav, cards): leave the intro and go play in that room.
 document.querySelectorAll('[data-room]').forEach(b=>b.addEventListener('click',()=>{room=b.dataset.room==='estudio'?'estudio':'salon';if(state!=='free')goFree()}));
 // Puyol's buttons always work: if the intro is running, they end it first.
 document.addEventListener('click',e=>{if(state!=='free'&&e.target.closest('.walk-hud button'))goFree()},true);

 let seen=false;try{seen=sessionStorage.getItem(SEEN)==='1'}catch{}
 const h=chapterForHash(location.hash);
 if(h.mode==='free'||seen||reduced){room=h.room;goFree()}else play();
}

// The home page's scroll film: the 3D salon stays pinned while the visitor
// scrolls through chapters; each chapter moves the camera and shows a card.
import {CHAPTERS,chapterAt,shotAt,chapterForHash} from './tour-math.js?v=pastel-11';

const C={cherry:'#8E1825',columbia:'#C8D9EC',butter:'#FFEDAD',chocolate:'#3D2722'};
const svg={
 cup:(body,band)=>`<svg width="64" height="78" viewBox="0 0 64 78"><path d="M6 8h52l-7 66H13z" fill="${body}" stroke="${C.chocolate}" stroke-width="2.5"/><rect x="2" y="2" width="60" height="9" rx="3" fill="#fff" stroke="${C.chocolate}" stroke-width="2.5"/><path d="M20 32q12-10 24 0" stroke="${band}" stroke-width="4" fill="none"/></svg>`,
 record:`<svg width="72" height="72" viewBox="0 0 72 72"><circle cx="36" cy="36" r="34" fill="${C.chocolate}"/><circle cx="36" cy="36" r="23" fill="none" stroke="#5c4038" stroke-width="2"/><circle cx="36" cy="36" r="11" fill="${C.butter}"/><circle cx="36" cy="36" r="2.5" fill="${C.chocolate}"/></svg>`,
 ball:`<svg width="46" height="46" viewBox="0 0 46 46"><circle cx="23" cy="23" r="21" fill="#fff" stroke="${C.chocolate}" stroke-width="2.5"/><path d="M23 13l9 6-3 10H17l-3-10z" fill="${C.chocolate}"/></svg>`,
 book:`<svg width="58" height="74" viewBox="0 0 58 74"><rect x="2" y="2" width="54" height="70" rx="4" fill="${C.columbia}" stroke="${C.chocolate}" stroke-width="2.5"/><rect x="2" y="2" width="10" height="70" fill="${C.cherry}"/><rect x="20" y="18" width="28" height="5" fill="${C.cherry}"/><rect x="20" y="28" width="20" height="4" fill="${C.chocolate}"/></svg>`,
 star:(fill)=>`<svg viewBox="0 0 60 60" width="100%" height="100%"><path d="M30 2l6 18 18-6-12 15 12 15-18-6-6 18-6-18-18 6 12-15L6 14l18 6z" fill="${fill}" stroke="${C.chocolate}" stroke-width="2.5" stroke-linejoin="round"/><circle cx="30" cy="30" r="8" fill="${C.butter}" stroke="${C.chocolate}" stroke-width="2"/></svg>`
};

export function startTour(api){
 const film=document.getElementById('film');if(!film)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const chapters=[...film.querySelectorAll('.chapter')],n=chapters.length;
 const cards=chapters.map(c=>c.querySelector('.story-card'));
 const toggle=film.querySelector('.free-toggle');
 let free=false,room='salon',queued=false;

 // Title letters bob one after another; cards get a spinning sticker.
 let k=0;for(const part of film.querySelectorAll('.hero-film .a, .hero-film .b em')){const text=part.textContent;part.textContent='';
  for(const line of text.split('\n')){if(part.childNodes.length)part.append(document.createElement('br'));const w=document.createElement('span');for(const ch of line){const s=document.createElement('span');s.textContent=ch===' '?' ':ch;s.style.animationDelay=(k++*.06)+'s';w.append(s)}part.append(w)}}
 cards.forEach((c,i)=>{if(!c||c.classList.contains('serene'))return;const s=document.createElement('span');s.className='sticker';s.setAttribute('aria-hidden','true');s.innerHTML=svg.star(i%2?C.cherry:C.columbia);c.append(s)});

 // Falling objects for the intro.
 const fallers=film.querySelector('.fallers');
 if(fallers&&!reduced){const items=[svg.cup(C.columbia,C.cherry),svg.record,svg.cup(C.butter,C.cherry),svg.ball,svg.book,svg.cup('#fff',C.cherry),svg.record,svg.book];
  const count=innerWidth<720?4:items.length;
  for(let i=0;i<count;i++){const d=document.createElement('div');d.className='faller';d.innerHTML=items[i];d.style.left=(4+i*(92/count))+'%';d.style.setProperty('--d',(3.6+(i%3)*.7)+'s');d.style.setProperty('--r',((i%2?1:-1)*(200+i*45))+'deg');d.style.animationDelay=(1.6+i*.45)+'s';fallers.append(d)}}

 const vh=()=>innerHeight;
 const scrolled=()=>-film.getBoundingClientRect().top;
 function update(){
  queued=false;
  const sc=scrolled(),h=vh();
  const idx=Math.min(n-1,Math.max(0,Math.round(sc/h)));
  cards.forEach((c,i)=>c&&c.classList.toggle('is-on',i===idx&&sc<n*h));
  film.classList.toggle('show-fallers',idx===0&&!reduced);
  if(free)return;
  const shot=shotAt((sc+.5*h)/(n*h));
  api.setShot(shot);api.setNight(shot.night);
 }
 const queue=()=>{if(!queued){queued=true;requestAnimationFrame(update)}};

 function setFree(on){
  free=on;api.setTourMode(!on);
  toggle.textContent=on?'Volver al recorrido':'Explorar a mi aire';
  if(!on){if(room!=='salon'){room='salon';api.chooseRoom('salon',false)}api.setNight(0);queue()}
  else api.setNight(0);
 }
 const goToChapter=i=>{const top=film.getBoundingClientRect().top+scrollY+i*vh();scrollTo({top,behavior:reduced?'auto':'smooth'})};

 toggle.addEventListener('click',()=>setFree(!free));
 addEventListener('scroll',queue,{passive:true});
 addEventListener('resize',queue);

 // Room buttons (nav, cards, logo): the studio is explored freely; the salon is the film.
 document.querySelectorAll('[data-room]').forEach(b=>b.addEventListener('click',()=>{
  if(b.dataset.room==='estudio'){room='estudio';setFree(true);goToChapter(0)}
  else{room='salon';setFree(false);goToChapter(1)}}));
 document.querySelector('.logo')?.addEventListener('click',()=>{room='salon';setFree(false);goToChapter(0)});

 function fromHash(){const h=chapterForHash(location.hash);
  if(h.mode==='free'){room=h.room;api.chooseRoom(h.room,false);setFree(true)}
  else{setFree(false);if(h.index)requestAnimationFrame(()=>scrollTo({top:film.getBoundingClientRect().top+scrollY+h.index*vh(),behavior:'auto'}))}}
 addEventListener('hashchange',fromHash);
 fromHash();

 // The awning lifts once the room is ready.
 const awning=film.querySelector('.awning');
 if(awning){if(reduced)awning.classList.add('open');else setTimeout(()=>awning.classList.add('open'),600)}
 update();
}
export {CHAPTERS,chapterAt};

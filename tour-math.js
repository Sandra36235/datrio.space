// Pure math for the home page's scroll film: which chapter is on screen and
// where the 3D camera should be. No DOM here, so Node can test it.

// Camera shots over the salon. angle/elevation orbit the focus point; zoom is
// the orthographic zoom (1 = whole room). night 1 = lamps-only intro lighting.
export const CHAPTERS=[
 {id:'intro',night:1,shot:{angle:.72,elevation:.64,zoom:1,focus:[0,1.6,0]}},
 {id:'cafe',night:0,shot:{angle:1.15,elevation:.5,zoom:2.1,focus:[-6.3,1.4,-2.5]}},
 {id:'musica',night:0,shot:{angle:.35,elevation:.45,zoom:2.1,focus:[3.5,1.2,-4.8]}},
 {id:'biblioteca',night:0,shot:{angle:.55,elevation:.5,zoom:1.8,focus:[-3.9,2,-4.7]}},
 {id:'puyol',night:0,shot:{angle:.85,elevation:.55,zoom:2.3,focus:[5.8,.5,2.5]}}
];

const clamp01=v=>Math.min(1,Math.max(0,v));
const smooth=t=>t*t*(3-2*t);
const lerp=(a,b,t)=>a+(b-a)*t;

// progress 0..1 over the whole film -> chapter index and progress inside it.
export function chapterAt(progress,count){
 const x=clamp01(progress)*count,index=Math.min(Math.floor(x),count-1);
 return {index,t:clamp01(x-index)};
}

// Each chapter holds its shot, then eases into the next during its last 35%.
const BLEND_FROM=.65;
export function shotAt(progress,chapters=CHAPTERS){
 const {index,t}=chapterAt(progress,chapters.length),a=chapters[index];
 const next=chapters[index+1];
 const s=next&&t>BLEND_FROM?smooth((t-BLEND_FROM)/(1-BLEND_FROM)):0;
 const b=next||a;
 return {
  angle:lerp(a.shot.angle,b.shot.angle,s),
  elevation:lerp(a.shot.elevation,b.shot.elevation,s),
  zoom:lerp(a.shot.zoom,b.shot.zoom,s),
  focus:a.shot.focus.map((v,i)=>lerp(v,b.shot.focus[i],s)),
  night:lerp(a.night,b.night,s)
 };
}

// Links from the interior pages: #salon opens the tour at the first salon
// corner; #estudio drops the visitor into the studio in free mode.
export function chapterForHash(hash){
 if(hash==='#salon')return {mode:'tour',room:'salon',index:1};
 if(hash==='#estudio')return {mode:'free',room:'estudio',index:0};
 return {mode:'tour',room:'salon',index:0};
}

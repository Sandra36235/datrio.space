// Liquid logo animation (approved by Sandra): one drop is born at the foot of
// the "i", stretches up into the two joined nodes of the stem, and lets the
// free dot go once. Then the letters fade in and the crisp brand-kit art stays.
// Usage: any <img class="brand-logo" data-color="#FFEDAD"> is replaced by an
// inline SVG that plays on load and again on hover.
const NS='http://www.w3.org/2000/svg';
const LETTERS=[
 'M100 6 Q107 6 107 13 V130 Q107 137 100 137 H87 Q80 137 80 130 V126 C72 135 63 140 50 140 C22 140 1 118 1 88 C1 59 22 37 50 37 C63 37 73 42 80 50 V13 Q80 6 87 6 Z M53 63 C39 63 28 74 28 88 C28 102 39 114 53 114 C67 114 80 102 80 88 C80 74 67 63 53 63 Z',
 'M215 39 Q222 39 222 46 V130 Q222 137 215 137 H202 Q195 137 195 130 V126 C187 135 178 140 165 140 C137 140 116 118 116 88 C116 59 137 37 165 37 C178 37 188 42 195 50 V46 Q195 39 202 39 Z M168 63 C154 63 143 74 143 88 C143 102 154 114 168 114 C182 114 195 102 195 88 C195 74 182 63 168 63 Z',
 'M247 18 H260 Q267 18 267 25 V39 H286 Q293 39 293 46 V57 Q293 64 286 64 H267 V99 C267 111 271 114 280 114 Q285 114 290 112 Q296 111 296 117 V128 Q296 133 292 135 C286 138 278 140 271 140 C250 140 240 127 240 103 V64 H235 Q229 64 229 58 V45 Q229 39 235 39 H240 V25 Q240 18 247 18 Z',
 'M314 39 H327 Q334 39 334 46 V52 C339 43 350 37 361 37 H364 Q371 37 371 43 V55 Q371 62 364 62 H361 C344 62 334 75 334 92 V130 Q334 137 327 137 H314 Q307 137 307 130 V46 Q307 39 314 39 Z',
 'M488 37 C517 37 540 59 540 88 C540 118 517 140 488 140 C459 140 436 118 436 88 C436 59 459 37 488 37 Z M488 63 C474 63 463 74 463 88 C463 102 474 114 488 114 C502 114 513 102 513 88 C513 74 502 63 488 63 Z'
];
const STEM='M19 36 C8 36 0 44 0 55 C0 69 9 77 9 86 C9 96 0 105 0 119 C0 130 8 138 19 138 C30 138 38 130 38 119 C38 105 29 96 29 86 C29 77 38 69 38 55 C38 44 30 36 19 36Z';
const SPEED=1.6,END=3.4;
// The free dot is the same size as the stem's nodes (Sandra's choice).
const DOT_R=19,DOT_Y=9;
const cl=v=>Math.min(1,Math.max(0,v)),sm=t=>t*t*(3-2*t),eo=t=>1-Math.pow(1-t,3),eio=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const el=(tag,attrs,parent)=>{const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);parent?.appendChild(e);return e};
let uid=0;

function build({color='#8E1825',className='brand-logo',label='datrio',width=144,height=40}){
 const id='datrio-liquid-'+(++uid);
 const svg=el('svg',{viewBox:'0 -10 541 150',class:className,role:'img','aria-label':label,width,height,overflow:'visible'});
 const f=el('filter',{id,x:'-60%',y:'-60%',width:'220%',height:'220%'},el('defs',{},svg));
 el('feGaussianBlur',{in:'SourceGraphic',stdDeviation:'7.5',result:'b'},f);
 el('feColorMatrix',{in:'b',mode:'matrix',values:'1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 30 -13'},f);
 const root=el('g',{fill:color},svg);
 const letters=LETTERS.map(d=>el('path',{d,'fill-rule':'evenodd'},root));
 const i=el('g',{transform:'translate(386 0)'},root);
 const goo=el('g',{filter:`url(#${id})`},i);
 const crisp=el('g',{},i);el('path',{d:STEM},crisp);el('circle',{cx:19,cy:DOT_Y,r:DOT_R},crisp);
 const drop=()=>el('ellipse',{cx:19,cy:119,rx:0,ry:0},goo);
 const parts={base:drop(),mid:drop(),hi:drop(),neckA:[drop(),drop(),drop(),drop()],neckB:[drop(),drop(),drop()]};
 return {svg,letters,goo,crisp,parts};
}

function blob(e,cy,r,vel=0){const sq=Math.max(-.2,Math.min(.2,vel/500));e.setAttribute('cy',cy);e.setAttribute('rx',Math.max(0,r*(1-sq*.6)));e.setAttribute('ry',Math.max(0,r*(1+sq)))}

function player(L){
 let raf=0,last=0,t=0,mid,playing=false,doneCb=null;
 const show=done=>{L.crisp.style.opacity=done?1:0;L.goo.style.opacity=done?0:1;L.letters.forEach(p=>{p.style.opacity=done?1:0;p.style.transform=''})};
 function frame(now){
  const dt=Math.min(.033,last?(now-last)/1000:.016)*SPEED;last=now;t+=dt;
  const {base,mid:dm,hi,neckA,neckB}=L.parts;
  blob(base,119,19*sm(cl(t/.8))*(1+.05*Math.sin(t*9)*Math.exp(-t*1.6)));
  if(t>.65)mid.target=55;
  const a=-58*(mid.x-mid.target)-8.5*mid.v;mid.v+=a*dt;mid.x+=mid.v*dt;
  blob(dm,mid.x,19*sm(cl((t-.6)/.6)),mid.v);
  const span=119-mid.x;
  neckA.forEach((e,k)=>{const f=(k+1)/5;blob(e,119-span*f,Math.max(10,16-span*.09)*sm(cl((t-.65)/.35)),mid.v*f)});
  const rise=eio(cl((t-1.45)/.9)),hy=mid.x-(mid.x-DOT_Y)*rise;
  blob(hi,hy,DOT_R*sm(cl((t-1.4)/.45)));
  const gap=mid.x-hy,snap=sm(cl((rise-.25)/.35));
  neckB.forEach((e,k)=>{const f=(k+1)/4;blob(e,mid.x-gap*f,(11-6*f)*(1-snap)*sm(cl((t-1.45)/.25)))});
  const settle=sm(cl((t-2.55)/.35));L.crisp.style.opacity=settle;L.goo.style.opacity=1-settle;
  L.letters.forEach((p,k)=>{const q=eo(cl((t-2.1-k*.08)/.6));p.style.opacity=q;p.style.transform=`translateY(${(1-q)*14}px)`});
  if(t<END)raf=requestAnimationFrame(frame);else{playing=false;show(true);const cb=doneCb;doneCb=null;cb?.()}
 }
return function play(onDone){
  if(playing)return;doneCb=onDone;playing=true;cancelAnimationFrame(raf);last=0;t=0;mid={x:119,v:0,target:119};
  show(false);Object.values(L.parts).flat().forEach(e=>{e.setAttribute('rx',0);e.setAttribute('ry',0)});
  raf=requestAnimationFrame(frame);
 };
}

// How long one run takes in real time (ms).
export const LOGO_MS=Math.round(END/SPEED*1000);
// Mount a liquid logo inside any element; returns {svg, play(onDone)}.
export function mountLogo(parent,opts={}){const L=build(opts);parent.appendChild(L.svg);return {svg:L.svg,play:player(L)}}

const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
for(const img of document.querySelectorAll('img.brand-logo')){
 if(reduced)continue;
 const L=build({color:img.dataset.color,className:img.className,label:img.alt,width:img.getAttribute('width'),height:img.getAttribute('height')});
 img.replaceWith(L.svg);const play=player(L);
 play();
 L.svg.closest('a')?.addEventListener('mouseenter',()=>play());
}

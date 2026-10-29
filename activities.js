import * as T from './vendor/three.module.js';

export const activities={
 coffee:{label:'Preparar café',destination:{x:-5.2,z:-2.2},focus:{x:-4.55,z:-2.2}},
 chess:{label:'Jugar ajedrez',destination:{x:-1.4,z:2},focus:{x:.1,z:1.8}},
 music:{label:'Tocar ukulele',destination:{x:4.5,z:-2.8},focus:{x:4.2,z:.5}},
 read:{label:'Leer Kindle',destination:{x:2.15,z:.55},focus:{x:2.3,z:1.7}}
};
const smooth=t=>t*t*(3-2*t);
const mat=(color,metalness=0)=>new T.MeshStandardMaterial({color,roughness:metalness?.28:.66,metalness});
function part(parent,geo,material,x=0,y=0,z=0){const m=new T.Mesh(geo,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function line(parent,points,r,material){return part(parent,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),18,r,6,false),material);}
function stool(room){
 const g=new T.Group();g.name='puyol-coffee-stool';g.position.set(-5.2,0,-2.2);g.visible=false;room.add(g);
 const oak=mat('#b68558'),brass=mat('#bb965b',.55),cloth=new T.MeshPhysicalMaterial({color:'#69a3a0',roughness:.86,sheen:.55,sheenColor:'#d6f5ed'});
 for(const x of [-.24,.24])for(const z of [-.24,.24]){
  const leg=part(g,new T.CylinderGeometry(.04,.055,.37,12),oak,x,.2,z);leg.rotation.z=x*.12;
  part(g,new T.CylinderGeometry(.055,.055,.018,12),brass,x,.018,z);
 }
 for(const z of [-.24,.24])part(g,new T.BoxGeometry(.5,.035,.035),oak,0,.14,z);
 const seat=part(g,new T.CylinderGeometry(.38,.35,.08,32),oak,0,.42,0);
 part(g,new T.CylinderGeometry(.34,.34,.07,32),cloth,0,.48,0);
 const pip=part(g,new T.TorusGeometry(.34,.012,8,48),mat('#498985'),0,.515,0);pip.rotation.x=Math.PI/2;
 return g;
}
function aeroPress(room){
 const g=new T.Group();g.name='puyol-aeropress';g.visible=false;g.position.set(-4.82,1.245,-2.13);room.add(g);
 const black=mat('#242b30'),rubber=mat('#111a1c'),metal=mat('#b9bec0',.45),coffee=mat('#8b5938');
 const glass=new T.MeshPhysicalMaterial({color:'#b8d4d4',transparent:true,opacity:.55,roughness:.12,metalness:.04,depthWrite:false});
 part(g,new T.CylinderGeometry(.21,.21,.018,32),mat('#e7d7bb'),0,.006,0);
 part(g,new T.CylinderGeometry(.135,.12,.18,24),mat('#f7f2e7'),0,.105,0);
 part(g,new T.TorusGeometry(.125,.015,8,32),black,0,.195,0).rotation.x=Math.PI/2;
 part(g,new T.CylinderGeometry(.113,.113,.025,32),rubber,0,.225,0);
 part(g,new T.CylinderGeometry(.09,.09,.06,32),coffee,0,.29,0);
 part(g,new T.CylinderGeometry(.115,.115,.36,32,1,true),glass,0,.43,0);
 part(g,new T.TorusGeometry(.13,.024,8,32),black,0,.61,0).rotation.x=Math.PI/2;
 for(const x of [-.145,.145])part(g,new T.BoxGeometry(.09,.025,.2),black,x,.25,0);
 const plunger=new T.Group();plunger.name='aeropress-plunger';g.add(plunger);
 part(plunger,new T.CylinderGeometry(.09,.09,.095,32),rubber,0,.58,0);
 part(plunger,new T.CylinderGeometry(.055,.055,.3,24),metal,0,.77,0);
 part(plunger,new T.CylinderGeometry(.16,.16,.035,32),black,0,.93,0);
 const drip=part(g,new T.CylinderGeometry(.008,.008,.065,8),coffee,0,.22,0);drip.visible=false;
 return {g,plunger,drip};
}
function pageTexture(page){
 const canvas=document.createElement('canvas');canvas.width=256;canvas.height=320;
 const c=canvas.getContext('2d');c.fillStyle='#ede7d9';c.fillRect(0,0,256,320);
 c.fillStyle='#7d827d';c.font='bold 19px Georgia';c.fillText(page%2?'UNA IDEA':'EL ARTE DE',24,48);
 c.fillText(page%2?'PARA PENSAR':'PREGUNTAR',24,73);
 c.fillStyle='#a3a59e';for(let i=0;i<13;i++)c.fillRect(24,104+i*14,185-(i%5)*14,3);
 c.fillStyle='#587c85';c.font='15px Georgia';c.fillText(String(page).padStart(2,'0'),202,292);
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;return texture;
}
function snapshot(group){return {position:group.position.clone(),rotation:group.rotation.clone(),scale:group.scale.clone()};}
function restore(group,state){if(!group||!state)return;group.position.copy(state.position);group.rotation.copy(state.rotation);group.scale.copy(state.scale);}

export function createActivities(room,player,dog){
 const bench=stool(room),press=aeroPress(room),pawn=room.getObjectByName('interactive-chess-pawn');
 const uke=room.getObjectByName('ukulele'),kindle=room.getObjectByName('kindle');
 const ukeHome=uke&&snapshot(uke),kindleHome=kindle&&snapshot(kindle),pawnHome=pawn&&snapshot(pawn);
 const pages=[pageTexture(1),pageTexture(2)];
 const screen=kindle&&part(kindle,new T.PlaneGeometry(.19,.25),new T.MeshBasicMaterial({map:pages[0],side:T.DoubleSide}),0,.021,-.015);
 if(screen){screen.rotation.x=-Math.PI/2;screen.visible=false;}
 const place=new T.Vector3();let current=null,ready=false,time=0,audio=null,lastNote=-1,readApproach=null;
 function reset(){
  bench.visible=false;bench.scale.set(1,0,1);press.g.visible=false;press.plunger.position.y=0;press.drip.visible=false;
  restore(uke,ukeHome);restore(kindle,kindleHome);restore(pawn,pawnHome);
  if(screen)screen.visible=false;dog.position.y=0;dog.rotation.x=0;
  if(readApproach){player.position.copy(readApproach);readApproach=null;}
  room.userData.activity=null;
 }
 function end(){current=null;ready=false;time=0;reset();}
 function begin(name){end();if(!activities[name])return false;current=name;room.userData.activity=name;
  if(name==='music'&&typeof AudioContext!=='undefined'){
   try{audio??=new AudioContext();audio.resume().catch(()=>{});}catch{audio=null;}
  }
  return true;
 }
 function arrive(){ready=true;time=0;lastNote=-1;if(current==='read')readApproach=player.position.clone();}
 function pluck(){if(!audio||audio.state!=='running')return;
  for(const [i,f]of [261.63,329.63,392,523.25].entries()){
   const o=audio.createOscillator(),gain=audio.createGain(),at=audio.currentTime+i*.035;
   o.type='triangle';o.frequency.setValueAtTime(f,at);gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(.016/(i+1),at+.012);gain.gain.exponentialRampToValueAtTime(.0001,at+.55);
   o.connect(gain).connect(audio.destination);o.start(at);o.stop(at+.57);
  }
 }
 function bring(prop,from,local,scale,rotation,dt){
  if(!prop)return;player.localToWorld(place.set(...local));prop.parent.worldToLocal(place);
  const blend=1-Math.exp(-dt*5);prop.position.lerp(place,blend);prop.scale.lerp(place.setScalar(scale),blend);
  prop.rotation.x+=(rotation[0]-prop.rotation.x)*blend;prop.rotation.y+=(rotation[1]-prop.rotation.y)*blend;prop.rotation.z+=(rotation[2]-prop.rotation.z)*blend;
 }
 function update(dt,reduced=false){
  if(!current||!ready)return false;time+=dt;
  if(current==='coffee'){
   bench.visible=true;const rise=reduced?1:smooth(Math.min(1,time/1.1));bench.scale.set(1,rise,1);
   dog.position.y=.47*rise;
   press.g.visible=true;
   const cycle=reduced?.68:(time*.68)%1;
   press.plunger.position.y=-.22*smooth(cycle);
   press.drip.visible=time>1.2&&(reduced||cycle>.45);
  }
  if(current==='chess'&&pawn&&pawnHome){
   const turn=reduced?1:(1+Math.sin(time*1.3-Math.PI/2))*.5;
   pawn.position.z=pawnHome.position.z-.32*smooth(turn);
   pawn.position.y=pawnHome.position.y+(reduced?0:Math.sin(turn*Math.PI)*.08);
  }
  if(current==='music'){
   bring(uke,ukeHome,[0,.62,.43],.52,[-.18,.1,.18],dt);
   const note=Math.floor(time/.78);if(!reduced&&note!==lastNote){lastNote=note;pluck();}
  }
  if(current==='read'){
   const settle=reduced?1:smooth(Math.min(1,time/1.15));
   player.position.x=readApproach.x+(2.15-readApproach.x)*settle;
   player.position.z=readApproach.z+(-.6-readApproach.z)*settle;
   dog.position.y=.91*settle;
   dog.rotation.x=-.52*settle;
   bring(kindle,kindleHome,[0,1.22,.5],1.8,[.7,0,0],dt);
   if(screen){screen.visible=true;screen.material.map=pages[Math.floor(time/4)%2];}
  }
  return true;
 }
 return {begin,arrive,end,update,get current(){return current;},get ready(){return ready;}};
}

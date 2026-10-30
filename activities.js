import * as T from './vendor/three.module.js';

export const activities={
 // Puyol faces the kitchen counter, where the AeroPress sits.
 coffee:{label:'Preparar café',destination:{x:-5.4,z:-.7},focus:{x:-7.5,z:-.7}},
 chess:{label:'Jugar ajedrez',destination:{x:-1.4,z:2},focus:{x:.1,z:1.8}},
 music:{label:'Tocar ukulele',destination:{x:4.5,z:-2.8},focus:{x:4.2,z:.5}},
 read:{label:'Leer Kindle',destination:{x:2.15,z:.55},focus:{x:5,z:-.6}}
};
const smooth=t=>t*t*(3-2*t);
const ease=t=>smooth(Math.min(1,Math.max(0,t)));
// A hop: crouch, spring up in an arc, then absorb the landing.
function hop(t,length=.95){
 const k=Math.min(1,Math.max(0,t/length));
 const crouch=k<.26?ease(k/.26):k<.34?1-ease((k-.26)/.08):k>.74?Math.sin((k-.74)/.26*Math.PI)*.75:0;
 const air=k>.26&&k<.74?Math.sin((k-.26)/.48*Math.PI):0;
 return {k,crouch,air,travel:ease((k-.26)/.48),done:k>=1};
}
const mat=(color,metalness=0)=>new T.MeshStandardMaterial({color,roughness:metalness?.28:.66,metalness});
function part(parent,geo,material,x=0,y=0,z=0){const m=new T.Mesh(geo,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function line(parent,points,r,material){return part(parent,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),18,r,6,false),material);}
function stool(room){
 const g=new T.Group();g.name='puyol-coffee-stool';g.position.set(activities.coffee.destination.x,0,activities.coffee.destination.z);g.rotation.y=Math.PI/2;g.visible=false;room.add(g);
 const oak=mat('#b68558'),brass=mat('#bb965b',.55),cloth=new T.MeshPhysicalMaterial({color:'#8fa6da',roughness:.86,sheen:.55,sheenColor:'#e3e9fa'});
 for(const x of [-.3,.3])for(const z of [-.48,.48]){
  const leg=part(g,new T.CylinderGeometry(.04,.055,.37,12),oak,x,.2,z);leg.rotation.z=x*.12;
  part(g,new T.CylinderGeometry(.055,.055,.018,12),brass,x,.018,z);
 }
 for(const z of [-.48,.48])part(g,new T.BoxGeometry(.65,.035,.035),oak,0,.14,z);
 for(const x of [-.29,.29])part(g,new T.BoxGeometry(.045,.28,1.08),oak,x,.21,0);
 part(g,new T.BoxGeometry(.76,.08,1.18),oak,0,.42,0);
 part(g,new T.BoxGeometry(.7,.06,1.12),cloth,0,.49,0);
 const contact=part(g,new T.CircleGeometry(.34,32),new T.MeshBasicMaterial({color:'#4e615c',transparent:true,opacity:.18,depthWrite:false}),0,.532,0);
 contact.rotation.x=-Math.PI/2;contact.scale.y=1.4;
 return g;
}
function musicPad(room){
 const g=new T.Group();g.name='puyol-music-pad';g.position.set(4.5,0,-2.05);g.visible=false;room.add(g);
 const wood=mat('#ba8855'),felt=mat('#d7c8ad');
 for(const x of [-.34,.34])for(const z of [-.43,.43])part(g,new T.CylinderGeometry(.035,.045,.19,10),wood,x,.1,z);
 part(g,new T.BoxGeometry(.86,.065,1.08),wood,0,.22,0);
 part(g,new T.BoxGeometry(.78,.025,1),felt,0,.267,0);
 return g;
}
function aeroPress(room){
 const g=new T.Group();g.name='puyol-aeropress';g.visible=false;g.position.set(-6.02,1.226,-.7);g.scale.setScalar(.6);room.add(g);
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
 const bench=stool(room),pad=musicPad(room),press=aeroPress(room),pawn=room.getObjectByName('interactive-chess-pawn');
 const uke=room.getObjectByName('ukulele'),kindle=room.getObjectByName('kindle');
 const ukeHome=uke&&snapshot(uke),kindleHome=kindle&&snapshot(kindle),pawnHome=pawn&&snapshot(pawn);
 const pages=[pageTexture(1),pageTexture(2)];
 const screen=kindle&&part(kindle,new T.PlaneGeometry(.19,.25),new T.MeshBasicMaterial({map:pages[0],side:T.DoubleSide}),0,.021,-.015);
 if(screen){screen.rotation.x=-Math.PI/2;screen.visible=false;}
 const place=new T.Vector3(),point=new T.Vector3(),turn=new T.Quaternion(),parentTurn=new T.Quaternion(),angles=new T.Euler(),rig=dog.userData.rig;
 let current=null,ready=false,time=0,audio=null,lastNote=-1,readApproach=null,descent=null,focus=null;
 // Seat heights above the floor: the stool cushion and the sofa seat.
 const STOOL=.49,SOFA=.95;
 const goals=[{p:new T.Vector3(),w:0},{p:new T.Vector3(),w:0}];
 // A paw target, given in world space, stored in Puyol's own space.
 function goal(i,world,weight){const g=goals[i];g.p.copy(world);dog.worldToLocal(g.p);g.w=weight;rig.goals[i]=g;}
 function reset(){
  bench.visible=false;bench.scale.set(1,0,1);pad.visible=false;press.g.visible=false;press.plunger.position.y=0;press.drip.visible=false;
  restore(uke,ukeHome);restore(kindle,kindleHome);restore(pawn,pawnHome);
  if(screen)screen.visible=false;
  Object.assign(rig,{crouch:0,air:0,hopping:false,press:0,beat:0,page:0,goals:[null,null]});focus=null;
  room.userData.activity=null;
 }
 // Leaving the stool or sofa: the walking position returns to the floor at once,
 // while the visible dog hops down from where it was sitting.
 function climbDown(){
  const raised=dog.position.y>.02||readApproach;
  const world=raised&&dog.getWorldPosition(new T.Vector3()),tilt=dog.rotation.x;
  if(readApproach){player.position.copy(readApproach);readApproach=null;}
  if(!raised){dog.position.set(0,0,0);dog.rotation.x=0;return;}
  player.updateMatrixWorld(true);const local=player.worldToLocal(world);
  dog.position.copy(local);descent={from:local.clone(),tilt,time:0,stool:current==='coffee'};
 }
 function landed(){if(!descent)return;dog.position.set(0,0,0);dog.rotation.x=0;if(descent.stool)bench.visible=false;descent=null;Object.assign(rig,{crouch:0,air:0,hopping:false});}
 function end(){if(current&&ready)climbDown();current=null;ready=false;time=0;reset();if(descent?.stool){bench.visible=true;bench.scale.set(1,1,1);}}
 function begin(name){end();if(!activities[name])return false;current=name;room.userData.activity=name;
  if(name==='music'&&typeof AudioContext!=='undefined'){
   try{audio??=new AudioContext();audio.resume().catch(()=>{});}catch{audio=null;}
  }
  return true;
 }
 function arrive(){landed();ready=true;time=0;lastNote=-1;if(current==='read')readApproach=player.position.clone();}
 function pluck(){if(!audio||audio.state!=='running')return;
  for(const [i,f]of [261.63,329.63,392,523.25].entries()){
   const o=audio.createOscillator(),gain=audio.createGain(),at=audio.currentTime+i*.035;
   o.type='triangle';o.frequency.setValueAtTime(f,at);gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(.016/(i+1),at+.012);gain.gain.exponentialRampToValueAtTime(.0001,at+.55);
   o.connect(gain).connect(audio.destination);o.start(at);o.stop(at+.57);
  }
 }
 // Holds a prop relative to Puyol: `anchor` (a point on the prop) goes to `local` (a point in Puyol's space).
 function hold(prop,anchor,local,rotation,scale,dt,reduced){
  if(!prop)return;
  player.updateMatrixWorld(true);
  turn.setFromEuler(angles.set(...rotation)).premultiply(player.getWorldQuaternion(parentTurn));
  point.set(...anchor).multiplyScalar(scale).applyQuaternion(turn);
  dog.localToWorld(place.set(...local)).sub(point);prop.parent.worldToLocal(place);
  turn.premultiply(prop.parent.getWorldQuaternion(parentTurn).invert());
  const k=reduced?1:1-Math.exp(-dt*6);
  prop.position.lerp(place,k);prop.quaternion.slerp(turn,k);prop.scale.lerp(point.setScalar(scale),k);
 }
 function update(dt,reduced=false){
  if(descent){
   descent.time+=dt;const h=reduced?hop(1):hop(descent.time,.8),from=descent.from;
   dog.position.set(from.x*(1-h.travel),from.y*(1-h.travel)+Math.sin(h.travel*Math.PI)*.1,from.z*(1-h.travel));
   dog.rotation.x=descent.tilt*(1-ease(descent.time/.3));
   Object.assign(rig,{crouch:h.crouch,air:h.air,hopping:true});
   if(h.done)landed();
  }
  if(!current||!ready)return !!descent;time+=dt;
  if(current==='coffee'){
   // The stool rises first, then Puyol jumps onto it and starts pressing.
   bench.visible=true;const rise=reduced?1:ease(time/.5);bench.scale.set(1,rise,1);
   const h=reduced?hop(1):hop(time-.45);
   dog.position.y=STOOL*h.travel+Math.sin(h.travel*Math.PI)*.18;
   Object.assign(rig,{crouch:h.crouch,air:h.air,hopping:!h.done});
   press.g.visible=true;
   // He rears up: one paw steadies on the counter, the other pushes the plunger
   // down slowly, then lets it rise again.
   const pressing=Math.max(0,time-1.8),cycle=reduced?.6:(pressing*.5)%1;
   const depth=pressing<=0?0:cycle<.7?ease(cycle/.7):1-ease((cycle-.7)/.3);
   press.plunger.position.y=-.22*depth;rig.press=depth;
   press.drip.visible=pressing>.3&&depth>.25;
   room.updateMatrixWorld(true);
   const reach=h.done?1:0;
   goal(0,press.plunger.localToWorld(point.set(0,1.02,0)),reach);
   goal(1,point.set(-5.93,1.26,-.53),reach);
  }
  if(current==='chess'&&pawn&&pawnHome){
   const turn=reduced?1:(1+Math.sin(time*1.3-Math.PI/2))*.5;
   pawn.position.z=pawnHome.position.z-.32*smooth(turn);
   pawn.position.y=pawnHome.position.y+(reduced?0:Math.sin(turn*Math.PI)*.08);
  }
  if(current==='music'){
   // Held against his chest like a guitar: left paw on the neck, right paw strums.
   const beat=reduced?.5:(time%.78)/.78,stroke=beat<.14?ease(beat/.14):1-ease((beat-.14)/.86);
   rig.beat=beat;
   if(uke){
    hold(uke,[0,.6,0],[.02,.44,.6],[-.18,0,-1.02],.55,dt,reduced);
    room.updateMatrixWorld(true);
    goal(1,uke.localToWorld(point.set(0,1.3,.16)),1);
    goal(0,uke.localToWorld(point.set(.02,.92-.3*stroke,.24)),1);
   }
   const note=Math.floor(time/.78);if(!reduced&&note!==lastNote){lastNote=note;pluck();}
  }
  if(current==='read'){
   // Hop up onto the sofa, turn along the seat and lie down with the Kindle
   // between the front paws; a paw taps the corner to turn each page.
   const h=reduced?hop(1):hop(time,1);
   player.position.x=readApproach.x+(1.55-readApproach.x)*h.travel;
   player.position.z=readApproach.z+(-.6-readApproach.z)*h.travel;
   dog.position.y=SOFA*h.travel+Math.sin(h.travel*Math.PI)*.16;
   Object.assign(rig,{crouch:h.crouch,air:h.air,hopping:!h.done});
   focus=h.done?null:{x:1.55,z:-3};
   const page=reduced?0:(time%4)/4;rig.page=page;
   if(h.done){
    hold(kindle,[0,0,0],[0,.03,.98],[0,Math.PI,0],1.35,dt,reduced);
    if(screen){screen.visible=true;screen.material.map=pages[Math.floor(time/4)%2];}
    room.updateMatrixWorld(true);
    goal(0,kindle.localToWorld(point.set(.1,.06,.09)),page>.86?Math.sin((page-.86)/.14*Math.PI):0);
   }
  }
  return true;
 }
 return {begin,arrive,end,update,get current(){return current;},get ready(){return ready;},get hopping(){return !!descent||rig.hopping;},get focus(){return focus;}};
}

import * as T from './vendor/three.module.js';

// Puyol is a sculpted, articulated toy poodle. All visible parts have volume;
// the four legs, ears, head and tail keep their own joints for animation.
export function createPoodle3D(){
 const root=new T.Group();root.name='poodle-3d';
 const furTexture=(()=>{
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#f7f4ed';ctx.fillRect(0,0,256,256);
  for(let i=0;i<900;i++){
   const x=(i*97)%256,y=(i*151)%256;
   ctx.strokeStyle=i%3?'#e5ddcf':'#ffffff';ctx.lineWidth=.6;
   ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+2,y+2,x+1,y+5);ctx.stroke();
  }
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
  return texture;
 })();
 const coat=new T.MeshStandardMaterial({color:'#e9d1b2',map:furTexture,bumpMap:furTexture,bumpScale:.018,roughness:.96});
 const earCoat=new T.MeshStandardMaterial({color:'#ddb992',map:furTexture,bumpMap:furTexture,bumpScale:.022,roughness:.97});
 const cream=new T.MeshStandardMaterial({color:'#f0ddc5',map:furTexture,roughness:.96});
 const muzzleMat=new T.MeshStandardMaterial({color:'#eed6b7',map:furTexture,bumpMap:furTexture,bumpScale:.007,roughness:.96});
 const noseMat=new T.MeshStandardMaterial({color:'#28201c',roughness:.28});
 const eyeMat=new T.MeshPhysicalMaterial({color:'#281d19',roughness:.13,clearcoat:.8});
 const shine=new T.MeshBasicMaterial({color:'#fffaf1'});
 const teal=new T.MeshStandardMaterial({color:'#387f83',roughness:.42});
 const brass=new T.MeshStandardMaterial({color:'#d9aa59',metalness:.65,roughness:.3});
 const sphereGeo=new T.SphereGeometry(1,32,24);
 const fluffGeo=new T.SphereGeometry(1,48,36);
 const curls=fluffGeo.attributes.position;
 for(let i=0;i<curls.count;i++){
  const x=curls.getX(i),y=curls.getY(i),z=curls.getZ(i);
  const ripple=1+.045*Math.sin(17*x+6*z)*Math.sin(16*y-4*x)*Math.sin(15*z+3*y);
  curls.setXYZ(i,x*ripple,y*ripple,z*ripple);
 }
 fluffGeo.computeVertexNormals();
 const add=(parent,name,geometry,material,x=0,y=0,z=0)=>{
  const mesh=new T.Mesh(geometry,material);mesh.name=name;mesh.position.set(x,y,z);
  mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
 };
 const oval=(parent,name,material,x,y,z,sx,sy,sz)=>{
  const mesh=add(parent,name,sphereGeo,material,x,y,z);mesh.scale.set(sx,sy,sz);return mesh;
 };
 const fluffyOval=(parent,name,material,x,y,z,sx,sy,sz)=>{
  const mesh=add(parent,name,fluffGeo,material,x,y,z);mesh.scale.set(sx,sy,sz);return mesh;
 };
 const curve=(parent,name,points,r,material)=>add(parent,name,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),24,r,8,false),material);

 const torso=new T.Group();torso.name='poodle-torso';root.add(torso);
 // One continuous torso instead of overlapping chest, rump and barrel spheres.
 const bodyGeo=new T.SphereGeometry(1,48,32);const v=bodyGeo.attributes.position;
 for(let i=0;i<v.count;i++){
  const z=v.getZ(i),x=v.getX(i),y=v.getY(i);
  const chest=1+.11*Math.max(0,z),waist=1-.065*Math.max(0,-z);
  v.setXYZ(i,x*chest*waist,y*(1+.06*Math.max(0,z)),z);
 }
 bodyGeo.computeVertexNormals();
 const body=add(torso,'body',bodyGeo,coat,0,.81,-.04);body.scale.set(.255,.255,.55);
 // Poodle's neck grows out of the chest; the small ruff hides its join.
 const neckFur=oval(torso,'chest-ruff',cream,0,.87,.36,.215,.255,.19);neckFur.rotation.x=-.12;
 const neck=oval(torso,'neck',coat,0,1.09,.43,.17,.24,.17);neck.rotation.x=-.14;

 const head=new T.Group();head.name='head-joint';head.position.set(0,1.12,.46);head.scale.set(1.08,1.08,1.05);torso.add(head);
 // The crown grows from the same mesh as the cheeks, so there is no cap seam.
 const headGeo=fluffGeo.clone(),hv=headGeo.attributes.position;
 for(let i=0;i<hv.count;i++){
  const x=hv.getX(i),y=hv.getY(i),z=hv.getZ(i),crown=Math.max(0,y);
  hv.setXYZ(i,x*(1+.1*crown),y*(1+.08*crown),z*(1+.06*crown));
 }
 headGeo.computeVertexNormals();
 const skull=add(head,'skull',headGeo,coat,0,.18,0);skull.scale.set(.27,.285,.25);
 // A short, soft bridge leaves the eyes visible and joins the nose naturally.
 const muzzleGeo=new T.SphereGeometry(1,40,28),mv=muzzleGeo.attributes.position;
 for(let i=0;i<mv.count;i++){
  const z=mv.getZ(i),t=1-.24*Math.max(0,z);
  mv.setXYZ(i,mv.getX(i)*t,mv.getY(i)*t,z);
 }
 muzzleGeo.computeVertexNormals();
 const muzzle=add(head,'muzzle',muzzleGeo,muzzleMat,0,.018,.315);muzzle.scale.set(.145,.115,.24);
 oval(head,'lower-jaw',muzzleMat,0,-.045,.385,.105,.052,.145);
 const nose=oval(head,'nose',noseMat,0,.07,.55,.067,.043,.045);nose.rotation.x=.1;
 oval(head,'nose-shine',shine,-.018,.089,.59,.011,.007,.005);
 curve(head,'smile',[[-.062,-.048,.505],[0,-.06,.53],[.062,-.048,.505]],.005,noseMat);
 for(const side of [-1,1]){
  oval(head,'eye-socket',muzzleMat,side*.13,.23,.228,.047,.05,.018);
  oval(head,'eye',eyeMat,side*.13,.23,.248,.039,.047,.023);
  oval(head,'eye-glint',shine,side*.117,.247,.269,.01,.012,.005);
 }
 const ears=[];
 for(const side of [-1,1]){
  const ear=new T.Group();ear.name='ear-joint';ear.position.set(side*.255,.18,.015);head.add(ear);ears.push(ear);
  const flap=fluffyOval(ear,'ear',earCoat,side*.025,-.18,.02,.142,.28,.125);flap.rotation.z=side*.1;
 }
 const collar=add(torso,'collar',new T.TorusGeometry(.177,.025,8,32),teal,0,1.06,.42);collar.rotation.x=Math.PI/2;
 const tag=add(torso,'collar-tag',new T.SphereGeometry(.047,20,12),brass,0,.93,.595);tag.scale.set(1,1.15,.35);

 const legs=[],knees=[];
 for(const z of [.34,-.4])for(const side of [-1,1]){
  const leg=new T.Group();leg.name=z>0?'front-leg':'hind-leg';leg.position.set(side*.185,.67,z);root.add(leg);legs.push(leg);
  oval(leg,'upper-leg',coat,0,-.11,0,z>0?.082:.105,.19,z>0?.08:.115);
  const knee=new T.Group();knee.position.y=-.27;leg.add(knee);knees.push(knee);
  oval(knee,'lower-leg',coat,0,-.13,0,.064,.18,.065);
  oval(knee,'paw',cream,0,-.315,.035,.09,.072,.12);
 }
 // A short cotton-ball tail sits directly on the rump; no long stem is visible.
 const tail=new T.Group();tail.name='tail-joint';tail.position.set(0,.94,-.55);root.add(tail);
 fluffyOval(tail,'tail-pom',cream,0,.04,-.12,.165,.165,.165);
 const smallCurlGeo=new T.SphereGeometry(1,12,10);
 for(let i=0;i<12;i++){
  const angle=i*2.39996,level=1-2*(i+.5)/12,ring=Math.sqrt(1-level*level);
  const curl=add(tail,'tail-curl',smallCurlGeo,cream,ring*Math.cos(angle)*.13,.04+level*.13,-.12+ring*Math.sin(angle)*.13);curl.scale.setScalar(.057);
 }
 // A hip pivot lets the body sit back while the front paws remain grounded.
 const hips=new T.Group();hips.position.set(0,.78,-.38);root.add(hips);
 hips.add(torso);torso.position.set(0,-.78,.38);
 const tongue=oval(head,'tongue',new T.MeshStandardMaterial({color:'#d8908e',roughness:.7}),0,-.079,.54,.028,.016,.058);
 tongue.visible=false;
 const eyes=[];head.traverse(o=>{if(o.name==='eye'||o.name==='eye-glint')eyes.push({mesh:o,height:o.scale.y})});
 // Yaw is applied after the swing so a paw can reach sideways toward the mouth or chin.
 legs.forEach(leg=>leg.rotation.order='YXZ');
 const paws=knees.map(knee=>knee.getObjectByName('paw'));
 root.userData.rig={torso,hips,head,ears,legs,knees,paws,tail,tongue,eyes,body,ruff:neckFur,sit:0,lick:0,
  // Set by activities.js: crouch/air drive jumps, press/beat/page sync paws with props.
  crouch:0,air:0,hopping:false,press:0,beat:0,page:0,pawTarget:new T.Vector3()};
 return root;
}

const clamp=(v,lo=-1,hi=1)=>Math.min(hi,Math.max(lo,v));
const clamp01=v=>clamp(v,0,1);
const ease=v=>{v=clamp01(v);return v*v*(3-2*v);};
const lerp=(a,b,t)=>a+(b-a)*t;
// Layered sines with unrelated frequencies read as organic, non-repeating motion.
const wave=(t,seed=0)=>Math.sin(t+seed)*.5+Math.sin(t*2.31+seed*1.7+1.3)*.3+Math.sin(t*4.17+seed*.6+.7)*.2;
// Damped spring, sub-stepped so large frames stay stable.
function spring(s,target,omega,zeta,dt){
 const steps=Math.max(1,Math.ceil(dt*120)),h=dt/steps;
 for(let i=0;i<steps;i++){s.v+=(omega*omega*(target-s.x)-2*zeta*omega*s.v)*h;s.x+=s.v*h;}
 return s.x;
}
const UPPER=.27,LOWER=Math.hypot(.315,.035),LOWER_OFFSET=-Math.atan2(.035,.315);
const REST={y:-.585,z:.035};
// Two-bone solve in the leg's swing plane. bend=+1 folds the joint backward
// (front legs), -1 pushes it forward (the hind stifle).
function solveLeg(ty,tz,bend){
 const length=clamp(Math.hypot(ty,tz),.06,UPPER+LOWER-.002);
 const aim=Math.atan2(-tz,-ty);
 const atHip=Math.acos(clamp((UPPER*UPPER+length*length-LOWER*LOWER)/(2*UPPER*length)));
 const knee=Math.PI-Math.acos(clamp((UPPER*UPPER+LOWER*LOWER-length*length)/(2*UPPER*LOWER)));
 return {hip:aim+bend*atHip,knee:-bend*knee-LOWER_OFFSET,yaw:0};
}
function reach(target,bend){const s=solveLeg(target.y,Math.hypot(target.x,target.z),bend);s.yaw=Math.atan2(target.x,target.z);return s;}
function mix(pose,goal,w){if(w<=0)return;pose.hip=lerp(pose.hip,goal.hip,w);pose.knee=lerp(pose.knee,goal.knee,w);pose.yaw=lerp(pose.yaw,goal.yaw??0,w);}
const ACTIVITIES=['lick','brew','chess','music','read'];
const SEATED=['sit','lick','chess','music','read'];

function createState(){
 const s=()=>({x:0,v:0});
 return {pace:0,phase:0,sit:s(),weights:Object.fromEntries(ACTIVITIES.map(a=>[a,s()])),
  look:{yaw:s(),pitch:s(),tilt:s(),target:{yaw:0,pitch:0,tilt:0},next:1.5},
  ears:[s(),s()],earsX:[s(),s()],twitch:3,tail:{amp:s(),phase:0,until:0,next:4},
  blink:{next:1.2,t:9},yaw:null,yawRate:0,lastHipsY:.78,lastPace:0};
}

export function posePoodle3D(root,time,moving,reduced=false,action='stand',dt=1/60){
 const rig=root.userData.rig,{torso,hips,head,ears,legs,knees,paws,tail,tongue,eyes,body,ruff}=rig;
 dt=clamp(dt||0,0,.1);
 const st=rig.state??=createState();
 const still=reduced||dt===0;
 const settle=(s,target,omega,zeta)=>still?(s.x=target,s.v=0,target):spring(s,target,omega,zeta,dt);

 // Pace ramps up and down so the trot grows from a standstill instead of snapping on.
 const speed=reduced?0:clamp01(Number(moving)||0);
 st.pace=still?speed:lerp(st.pace,speed,1-Math.exp(-dt*(speed>st.pace?7:10)));
 const pace=st.pace,stride=ease(pace*1.4);
 const paceAccel=dt?(pace-st.lastPace)/dt:0;st.lastPace=pace;
 if(pace>.01)st.phase+=Math.PI*2*(1.1+.75*pace)*dt;
 const phase=st.phase;

 // Turning: lean into the curve and lead with the head.
 const yaw=root.parent?root.parent.rotation.y:0;
 if(st.yaw===null)st.yaw=yaw;
 const turn=dt?Math.atan2(Math.sin(yaw-st.yaw),Math.cos(yaw-st.yaw))/dt:0;st.yaw=yaw;
 st.yawRate=lerp(st.yawRate,clamp(turn,-6,6),still?1:1-Math.exp(-dt*8));
 const turning=st.yawRate*Math.max(pace,.25);

 // Sitting is a spring with a little settle; the rump drops before the chest lifts.
 const sitGoal=SEATED.includes(action)&&!rig.hopping?1:0;
 const sit=clamp01(settle(st.sit,sitGoal,7.5,.72));
 const drop=ease(sit*1.25),pitch=ease((sit-.12)/.88);
 rig.sit=sit;
 const w={};for(const a of ACTIVITIES)w[a]=clamp01(settle(st.weights[a],action===a?1:0,6.5,1));
 rig.lick=w.lick;
 const busy=Math.min(1,w.brew+w.chess+w.music+w.read+w.lick);
 const crouch=clamp01(rig.crouch||0),air=clamp01(rig.air||0);

 // Breathing moves the chest, not the whole dog.
 const breath=still?0:Math.sin(time*1.7+.4*wave(time*.3));
 body.scale.set(.255*(1+.016*breath),.255*(1+.011*breath),.55);
 ruff.scale.set(.215*(1+.012*breath),.255,.19);

 // Hips: sit drop, trot bob (lowest at mid-stance), crouch before jumps.
 const bob=-stride*.022*Math.cos(phase*2);
 hips.position.y=.78-.43*drop+bob-.11*crouch+.004*breath;
 hips.rotation.x=-.7*pitch+stride*.022*Math.sin(phase*2+.5)-clamp(paceAccel,-4,4)*.012+.06*w.brew+.12*crouch-.1*air;
 torso.rotation.z=stride*.028*Math.sin(phase)-clamp(turning,-3,3)*.035;
 const hipsVy=dt?(hips.position.y-st.lastHipsY)/dt:0;st.lastHipsY=hips.position.y;

 // Legs: build each pose in layers, then write it once.
 const poses=legs.map((leg,i)=>{
  const front=i<2,diagonal=i===0||i===3;
  const f=phase+(diagonal?0:Math.PI)+(front?0:.18);
  const swing=Math.max(0,-Math.cos(f));
  const pose={hip:stride*(front?.42:.36)*Math.sin(f),knee:stride*swing*(front?.95:.75),yaw:0,lift:stride*swing*.022,ground:(1-air)*(1-swing*stride)};
  // Planted paws: lower the joint with the body and let IK fold the leg.
  const origin={y:.67-(front?0:.36*drop)-.1*crouch,z:front?.34-.1*pitch:-.4+.05*pitch};
  const plantZ=(front?.34-.07*pitch:-.4+.09*pitch)+REST.z;
  const planted=solveLeg(.085-origin.y,plantZ-origin.z,front?1:-1);
  mix(pose,planted,clamp01(Math.max(sit*4,crouch*4))*(1-stride));
  // Mid-air tuck: front paws forward, hind legs trailing.
  mix(pose,front?{hip:-.65,knee:1.05}:{hip:.55,knee:.5},air);
  pose.origin=origin;return pose;
 });

 // Head: idle glances at random moments; level during sitting; looks into turns.
 const look=st.look;
 if(!still&&time>look.next){
  const r=Math.random;look.next=time+1.6+r()*3.8;
  look.target={yaw:(r()-.5)*.95,pitch:(r()-.45)*.28,tilt:r()<.3?(r()<.5?-1:1)*(.12+r()*.1):0};
 }
 const idle=(1-busy)*(1-stride);
 const lookYaw=settle(look.yaw,look.target.yaw*idle+clamp(turning*.14,-.4,.4),4.5,.85);
 const lookPitch=settle(look.pitch,look.target.pitch*idle,4.5,.9);
 const lookTilt=settle(look.tilt,look.target.tilt*idle,3.5,.8);
 const drift=still?0:wave(time*.7,2)*.025;

 // Grooming comes in bursts of licks with pauses, not a metronome.
 const burst=still?1:ease((wave(time*.55,3)+.15)*3);
 const lickBeat=still?.5:Math.pow(Math.max(0,Math.sin(time*8.5)),1.5)*burst;
 // Activities layer their own head gestures.
 const beat=rig.beat||0,strum=beat<.14?ease(beat/.14):1-ease((beat-.14)/.86);
 const read=rig.page||0,scan=(read*4.4)%1,line=scan<.85?scan/.85:1-(scan-.85)/.15;
 head.rotation.set(
  .7*pitch+lookPitch+drift+stride*.035*Math.sin(phase*2-.6)+w.lick*(.63+.06*lickBeat)+w.chess*(.15+.04*wave(time*.5,5))
   +w.read*.36+w.music*(.05+.05*(1-strum))+w.brew*.14+.18*crouch-.12*air,
  lookYaw*(1-w.lick)+w.chess*(.1+.08*wave(time*.35,7))+w.read*(line-.5)*.16,
  lookTilt-.17*w.lick+w.chess*.12*wave(time*.4,9)+w.music*(still?0:Math.sin(time*1.6)*.09));
 head.position.set(-.065*w.lick,1.12-.18*w.lick,.46+.06*w.lick);
 tongue.visible=w.lick>.6&&!reduced&&lickBeat>.08;
 tongue.scale.z=.058*(.5+lickBeat*.8);tongue.position.z=.55+lickBeat*.025;

 // Activity poses, eased in by their own weights.
 if(w.brew>.001){
  const press=rig.press||0;
  mix(poses[0],{hip:-.78+.32*press,knee:-.35+.2*press},w.brew);poses[0].ground*=1-w.brew;
 }
 if(w.music>.001){
  mix(poses[0],{hip:-.9+.03*(still?0:Math.sin(time*1.6)),knee:-.42},w.music);
  mix(poses[1],{hip:-.72+.24*strum,knee:-.28-.16*strum},w.music);poses[0].ground*=1-w.music;poses[1].ground*=1-w.music;
 }
 if(w.read>.001){
  const flick=read>.9?Math.sin((read-.9)/.1*Math.PI):0;
  mix(poses[0],{hip:-.65,knee:-.25},w.read);
  mix(poses[1],{hip:-.65-.25*flick,knee:-.25-.2*flick},w.read);poses[0].ground*=1-w.read;poses[1].ground*=1-w.read;
 }
 if(w.lick>.001||w.chess>.001){
  root.updateWorldMatrix(true,true);
  if(w.lick>.001){
   tongue.getWorldPosition(rig.pawTarget);root.worldToLocal(rig.pawTarget);
   rig.pawTarget.y-=.06+.035*(1-lickBeat);rig.pawTarget.sub(legs[0].position);
   mix(poses[0],reach(rig.pawTarget,1),w.lick);poses[0].ground*=1-w.lick;
  }
  if(w.chess>.001){
   head.getObjectByName('lower-jaw').getWorldPosition(rig.pawTarget);root.worldToLocal(rig.pawTarget);
   rig.pawTarget.y-=.045;rig.pawTarget.x+=.025;rig.pawTarget.sub(legs[1].position);
   mix(poses[1],reach(rig.pawTarget,1),w.chess);poses[1].ground*=1-w.chess;
  }
 }
 poses.forEach((pose,i)=>{
  const back=i>1,leg=legs[i];
  leg.position.set(leg.position.x,pose.origin.y+pose.lift,pose.origin.z);
  leg.rotation.set(pose.hip,pose.yaw,back?(i===2?-.09:.09)*sit:0);
  knees[i].rotation.x=pose.knee;
  // Weight-bearing paws stay flat on the floor instead of tilting with the leg.
  paws[i].rotation.x=-(pose.hip+pose.knee)*pose.ground;
 });

 // Ears are loose flaps on springs: they lag behind bounces and turns, and twitch now and then.
 if(!still&&time>st.twitch){st.twitch=time+2.5+Math.random()*5;st.ears[Math.random()<.5?0:1].v+=3+Math.random()*2;}
 ears.forEach((ear,i)=>{
  const side=i?1:-1;
  const flare=settle(st.ears[i],clamp(-hipsVy*1.4,-.25,.3)+side*clamp(st.yawRate*.03,-.12,.12)+w.music*.06*(1-strum),15,.28);
  const swingX=settle(st.earsX[i],clamp(-paceAccel*.06,-.2,.2)+stride*.05,12,.35);
  ear.rotation.set(swingX,0,side*(.02+flare));
 });

 // Tail: a calm sway most of the time, happy bursts now and then, upright while trotting.
 const tailState=st.tail;
 if(!still&&time>tailState.next){tailState.until=time+1.2+Math.random()*2;tailState.next=tailState.until+3+Math.random()*7;}
 const happy=time<tailState.until||w.music>.5?1:0;
 const amp=settle(tailState.amp,still?0:.07+.22*stride+.28*happy,5,1);
 tailState.phase+=dt*(2.6+5*Math.max(stride,happy));
 tail.position.y=.94-.6*drop-.11*crouch;tail.position.z=-.55+.07*pitch;
 tail.rotation.set(.2*pitch+.18*stride+.25*air,amp*Math.sin(tailState.phase),0);

 // Blinks at irregular intervals, sometimes twice.
 const blink=st.blink;
 if(!still&&time>blink.next){blink.t=0;blink.next=time+(Math.random()<.2?.28:2+Math.random()*4.5);}
 blink.t+=dt;
 const closed=still||blink.t>.15?0:Math.sin(blink.t/.15*Math.PI);
 eyes.forEach(({mesh,height})=>mesh.scale.y=height*(1-.94*closed));
 root.userData.action=action;
}


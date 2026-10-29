import * as T from './vendor/three.module.js';

// Puyol is a white toy poodle: a clean, slender face with a defined stop,
// a tall curly topknot, long curly ears and a coat built from real curls.
// The joints (hips, torso, head, ears, legs, tail) are the animation rig.

// Deterministic random numbers, so Puyol's curls look the same on every load.
function random(seed){return()=>{seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
let curlUnit=null;
// Scatters small curls over an ellipsoid and merges them into one geometry,
// so each fluffy part costs a single draw call. Curls sit half-buried in the
// coat, so the surface reads as dense curly fur rather than separate balls.
function curlGeometry({rx,ry,rz,count,size,seed=1,keep=()=>true}){
 curlUnit??=new T.IcosahedronGeometry(1,0);
 const r=random(seed),base=curlUnit.attributes.position,position=[],normal=[],uv=[];
 const golden=Math.PI*(3-Math.sqrt(5)),n=new T.Vector3();
 for(let i=0;i<count;i++){
  const y=1-2*(i+.5)/count,ring=Math.sqrt(Math.max(0,1-y*y)),a=i*golden+r()*.6;
  const px=Math.cos(a)*ring*rx,py=y*ry,pz=Math.sin(a)*ring*rz;
  if(!keep(px,py,pz))continue;
  n.set(px/(rx*rx),py/(ry*ry),pz/(rz*rz)).normalize();
  const s=size*(.7+r()*.6),sink=size*(.35+r()*.3),spin=r()*6.28,squash=.7+r()*.25;
  const cx=px-n.x*sink,cy=py-n.y*sink,cz=pz-n.z*sink,c=Math.cos(spin),sn=Math.sin(spin);
  for(let v=0;v<base.count;v++){
   const bx=base.getX(v),by=base.getY(v),bz=base.getZ(v),rx2=bx*c-bz*sn,rz2=bx*sn+bz*c;
   position.push(cx+rx2*s,cy+by*s*squash,cz+rz2*s);
   // Spherical normals make each low-poly curl shade smoothly.
   const length=Math.hypot(rx2,by/squash,rz2);normal.push(rx2/length,by/squash/length,rz2/length);
   uv.push(.5+rx2*.18+i%7*.11,.5+by*.18+i%5*.13);
  }
 }
 const geometry=new T.BufferGeometry();
 geometry.setAttribute('position',new T.Float32BufferAttribute(position,3));
 geometry.setAttribute('normal',new T.Float32BufferAttribute(normal,3));
 geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
 return geometry;
}

export function createPoodle3D(){
 const root=new T.Group();root.name='poodle-3d';
 const canvasTexture=(size,draw)=>{
  const canvas=document.createElement('canvas');canvas.width=canvas.height=size;
  draw(canvas.getContext('2d'),size);
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.wrapS=texture.wrapT=T.RepeatWrapping;
  return texture;
 };
 // Tight spirals give each curl a little texture under the light.
 const curlTexture=canvasTexture(256,(ctx,n)=>{
  ctx.fillStyle='#f6f3ee';ctx.fillRect(0,0,n,n);
  for(let i=0;i<260;i++){
   const x=(i*97)%n,y=(i*151+i*i)%n,radius=3+(i%4);
   ctx.strokeStyle=i%3?'#e3ddd3':'#ffffff';ctx.lineWidth=1;
   ctx.beginPath();ctx.arc(x,y,radius,i,i+4.6);ctx.stroke();
  }
 });
 const shortFur=canvasTexture(128,(ctx,n)=>{
  ctx.fillStyle='#f7f3ee';ctx.fillRect(0,0,n,n);
  for(let i=0;i<700;i++){ctx.fillStyle=i%2?'#ede7df':'#ffffff';ctx.fillRect((i*37)%n,(i*71)%n,1,2);}
 });
 const coat=new T.MeshStandardMaterial({color:'#ffffff',map:curlTexture,bumpMap:curlTexture,bumpScale:.006,roughness:.95});
 // The core under the curls is a little darker, so the gaps read as depth.
 const undercoat=new T.MeshStandardMaterial({color:'#f1ede7',roughness:1});
 const face=new T.MeshStandardMaterial({color:'#f8f3ee',map:shortFur,bumpMap:shortFur,bumpScale:.004,roughness:.86});
 const lips=new T.MeshStandardMaterial({color:'#e7cfcb',roughness:.7});
 const noseMat=new T.MeshPhysicalMaterial({color:'#1d1716',roughness:.35,clearcoat:.5});
 const eyeMat=new T.MeshPhysicalMaterial({color:'#2a1710',roughness:.1,clearcoat:1});
 const rimMat=new T.MeshStandardMaterial({color:'#3a2a26',roughness:.6});
 const shine=new T.MeshBasicMaterial({color:'#fffaf3'});
 const bowMat=new T.MeshStandardMaterial({color:'#6b1f2c',roughness:.62,map:canvasTexture(128,(ctx,n)=>{
  ctx.fillStyle='#6b1f2c';ctx.fillRect(0,0,n,n);
  for(let i=0;i<40;i++){const x=(i*53)%n,y=(i*29+i*7)%n;ctx.fillStyle=i%3?'#e9b9c2':'#f4ead8';ctx.beginPath();ctx.arc(x,y,3,0,7);ctx.fill();}
 })});
 const sphereGeo=new T.SphereGeometry(1,28,20),coreGeo=new T.SphereGeometry(1,16,12);
 const add=(parent,name,geometry,material,x=0,y=0,z=0)=>{
  const mesh=new T.Mesh(geometry,material);mesh.name=name;mesh.position.set(x,y,z);
  mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
 };
 const oval=(parent,name,material,x,y,z,sx,sy,sz)=>{const mesh=add(parent,name,sphereGeo,material,x,y,z);mesh.scale.set(sx,sy,sz);return mesh;};
 // A fluffy part: a soft core plus a shell of curls, grouped under one name.
 const fluffy=(parent,name,x,y,z,rx,ry,rz,options={})=>{
  const group=new T.Group();group.name=name;group.position.set(x,y,z);parent.add(group);
  const size=options.size??.03;
  const core=add(group,name+'-core',coreGeo,undercoat);core.scale.set(rx-size*.45,ry-size*.45,rz-size*.45);
  const area=4*Math.PI*(rx*ry+ry*rz+rx*rz)/3;
  const curls=add(group,name+'-curls',curlGeometry({rx,ry,rz,count:Math.round(area/(size*size)*.62),size,seed:options.seed??name.length*31,keep:options.keep}),coat);
  // Curls cast soft shadows but do not darken each other into grey.
  curls.receiveShadow=false;
  return group;
 };

 const torso=new T.Group();torso.name='poodle-torso';root.add(torso);
 // Slim, square body: deep chest, tucked waist, curls all over.
 const body=new T.Group();body.name='body';body.position.set(0,.83,-.04);torso.add(body);
 fluffy(body,'coat-rump',0,0,-.3,.19,.2,.22,{size:.034,seed:3});
 fluffy(body,'coat-waist',0,.01,0,.17,.18,.25,{size:.032,seed:5,keep:(x,y)=>y>-.12});
 const ruff=fluffy(torso,'chest-ruff',0,.88,.27,.2,.24,.18,{size:.034,seed:7});
 // A long, upright neck carries the head high.
 const neck=fluffy(torso,'neck',0,1.08,.42,.12,.2,.12,{size:.028,seed:9});neck.rotation.x=-.38;

 const head=new T.Group();head.name='head-joint';head.position.set(0,1.24,.5);torso.add(head);
 // Skull and long, clean muzzle with a clear stop between the eyes.
 oval(head,'skull',face,0,.11,.0,.15,.15,.17);
 oval(head,'cheeks',face,0,.04,.08,.13,.1,.13);
 for(const side of [-1,1])oval(head,'brow',face,side*.066,.168,.115,.045,.028,.045);
 const muzzleGeo=new T.SphereGeometry(1,36,24),mv=muzzleGeo.attributes.position;
 for(let i=0;i<mv.count;i++){
  const z=mv.getZ(i),taper=1-.17*Math.max(0,z);
  mv.setXYZ(i,mv.getX(i)*taper,mv.getY(i)*taper*(1-.12*Math.max(0,-mv.getY(i))),z);
 }
 muzzleGeo.computeVertexNormals();
 const muzzle=add(head,'muzzle',muzzleGeo,face,0,.03,.27);muzzle.scale.set(.088,.08,.19);muzzle.rotation.x=.1;
 oval(head,'lower-jaw',lips,0,-.025,.3,.058,.032,.14);
 const nose=oval(head,'nose',noseMat,0,.04,.46,.042,.032,.03);nose.rotation.x=.15;
 for(const side of [-1,1])oval(head,'nostril',rimMat,side*.016,.033,.488,.009,.006,.004);
 oval(head,'nose-shine',shine,-.012,.056,.483,.009,.005,.004);
 const smileCurve=side=>new T.TubeGeometry(new T.CatmullRomCurve3([[0,-.005,.44],[side*.03,-.012,.41],[side*.06,.0,.33]].map(p=>new T.Vector3(...p))),12,.004,6,false);
 for(const side of [-1,1])add(head,'smile',smileCurve(side),rimMat);
 // Almond eyes, set forward and close, with a dark rim.
 for(const side of [-1,1]){
  const rim=oval(head,'eye-rim',rimMat,side*.07,.123,.148,.036,.031,.018);rim.rotation.z=side*-.18;
  const eye=oval(head,'eye',eyeMat,side*.07,.123,.156,.031,.027,.019);eye.rotation.z=side*-.18;
  oval(head,'eye-glint',shine,side*.062,.134,.173,.008,.009,.004);
 }
 // Tall, round topknot that starts above the eyes and sweeps back.
 fluffy(head,'topknot',0,.29,-.02,.2,.17,.2,{size:.032,seed:11,keep:(x,y,z)=>y>-.05||z<-.02});
 const ears=[];
 for(const side of [-1,1]){
  const ear=new T.Group();ear.name='ear-joint';ear.position.set(side*.15,.17,-.03);head.add(ear);ears.push(ear);
  // Long curly ears hang below the jaw, wider at the bottom.
  const flap=fluffy(ear,'ear',side*.035,-.17,.01,.075,.25,.075,{size:.03,seed:side>0?13:17});
  flap.rotation.z=side*.06;
  fluffy(ear,'ear-tip',side*.045,-.36,.01,.085,.08,.075,{size:.03,seed:side>0?19:23});
 }
 // Burgundy bow tie with a small floral print.
 const bow=new T.Group();bow.name='bow-tie';bow.position.set(0,1.0,.55);bow.rotation.x=-.35;torso.add(bow);
 for(const side of [-1,1]){
  const lobe=add(bow,'bow-lobe',new T.ConeGeometry(.07,.13,16),bowMat,side*.068,0,0);
  lobe.rotation.z=side*Math.PI/2;lobe.scale.set(1,1,.45);
 }
 oval(bow,'bow-knot',bowMat,0,0,.008,.025,.03,.02);

 const legs=[],knees=[];
 for(const z of [.34,-.4])for(const side of [-1,1]){
  const front=z>0;
  const leg=new T.Group();leg.name=front?'front-leg':'hind-leg';leg.position.set(side*.185,.67,z);leg.userData.x=side*.185;root.add(leg);legs.push(leg);
  // Fluffy "trousers": fuller thighs behind, slimmer forelegs.
  fluffy(leg,'upper-leg',0,-.11,0,front?.068:.09,.17,front?.068:.1,{size:.027,seed:29+legs.length});
  const knee=new T.Group();knee.position.y=-.27;leg.add(knee);knees.push(knee);
  fluffy(knee,'lower-leg',0,-.13,0,.058,.17,.06,{size:.025,seed:37+legs.length});
  fluffy(knee,'paw',0,-.338,.03,.062,.045,.08,{size:.02,seed:43+legs.length});
 }
 // Cotton-ball tail on the rump.
 const tail=new T.Group();tail.name='tail-joint';tail.position.set(0,.94,-.55);root.add(tail);
 fluffy(tail,'tail-pom',0,.05,-.12,.12,.13,.12,{size:.03,seed:47});
 // A hip pivot lets the body sit back while the front paws remain grounded.
 const hips=new T.Group();hips.position.set(0,.78,-.38);root.add(hips);
 hips.add(torso);torso.position.set(0,-.78,.38);
 const tongue=oval(head,'tongue',new T.MeshStandardMaterial({color:'#d98f92',roughness:.6}),0,-.04,.42,.026,.012,.05);
 tongue.visible=false;
 const eyes=[];head.traverse(o=>{if(o.name==='eye'||o.name==='eye-glint'||o.name==='eye-rim')eyes.push({mesh:o,height:o.scale.y})});
 // Yaw is applied after the swing so a paw can reach sideways toward the mouth or chin.
 legs.forEach(leg=>leg.rotation.order='YXZ');
 const paws=knees.map(knee=>knee.getObjectByName('paw'));
 root.userData.rig={torso,hips,head,ears,legs,knees,paws,tail,tongue,eyes,body,ruff,sit:0,lick:0,
  headRest:head.position.clone(),tongueRest:tongue.position.clone(),
  // Set by activities.js: crouch/air drive jumps, press/beat/page sync paws with props.
  crouch:0,air:0,hopping:false,press:0,beat:0,page:0,goals:[null,null],pawTarget:new T.Vector3()};
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
const REST={y:-.585,z:.035},SIT_DROP=.45,SIT_PITCH=.64,REAR=.62,LIE=.47;
const reachVector=new T.Vector3();
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
// Reading is done lying down, so it is not a seated pose.
const SEATED=['sit','lick','chess','music'];

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
 // Activity poses wait until Puyol has landed on the furniture.
 const w={};for(const a of ACTIVITIES)w[a]=clamp01(settle(st.weights[a],action===a&&!rig.hopping?1:0,6.5,1));
 rig.lick=w.lick;
 const lie=w.read,rear=w.brew;
 const busy=Math.min(1,w.brew+w.chess+w.music+w.read+w.lick);
 const crouch=clamp01(rig.crouch||0),air=clamp01(rig.air||0);

 // Breathing moves the chest, not the whole dog.
 const breath=still?0:Math.sin(time*1.7+.4*wave(time*.3));
 body.scale.set(1+.016*breath,1+.011*breath,1);
 ruff.scale.set(1+.012*breath,1,1);

 // Hips: sit drop, rearing up, lying down, trot bob (lowest at mid-stance), crouch before jumps.
 const bob=-stride*.022*Math.cos(phase*2);
 hips.position.y=.78-SIT_DROP*drop-LIE*lie+bob-.11*crouch+.004*breath;
 hips.rotation.x=-SIT_PITCH*pitch-REAR*rear+stride*.022*Math.sin(phase*2+.5)-clamp(paceAccel,-4,4)*.012+.12*crouch-.1*air;
 torso.rotation.z=stride*.028*Math.sin(phase)-clamp(turning,-3,3)*.035;
 const hipsVy=dt?(hips.position.y-st.lastHipsY)/dt:0;st.lastHipsY=hips.position.y;
 const bodyPitch=SIT_PITCH*pitch+REAR*rear;
 // Shoulders, hips and tail ride on the body, so they follow it when it tilts.
 const attach=(x,y,z,out)=>out.set(x,y,z).applyEuler(torso.rotation).add(torso.position).applyEuler(hips.rotation).add(hips.position);

 // Legs: build each pose in layers, then write it once.
 const poses=legs.map((leg,i)=>{
  const front=i<2,diagonal=i===0||i===3;
  const f=phase+(diagonal?0:Math.PI)+(front?0:.18);
  const swing=Math.max(0,-Math.cos(f));
  const pose={hip:stride*(front?.42:.36)*Math.sin(f),knee:stride*swing*(front?.95:.75),yaw:0,lift:stride*swing*.022,ground:(1-air)*(1-swing*stride)};
  // The trot bob compresses the legs instead of lifting the paws off the floor.
  const joint=attach(leg.userData.x,.67,front?.34:-.4,new T.Vector3());joint.y=lerp(joint.y-bob-.004*breath,.67,stride);
  // Where each paw rests while sitting, crouching, rearing or lying; IK folds the leg to it.
  const plantZ=front?.375-.07*pitch+.5*lie:-.365+.15*pitch+.3*lie;
  mix(pose,solveLeg(.085-joint.y,plantZ-joint.z,front?1:-1),clamp01(Math.max(sit,crouch,rear,lie)*4)*(1-stride));
  // Mid-air tuck: front paws forward, hind legs trailing.
  mix(pose,front?{hip:-.65,knee:1.05}:{hip:.55,knee:.5},air);
  pose.joint=joint;return pose;
 });

 // Head: idle glances at random moments; level while the body tilts; looks into turns.
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
  bodyPitch+lookPitch+drift+stride*.035*Math.sin(phase*2-.6)+w.lick*(.63+.06*lickBeat)+w.chess*(.15+.04*wave(time*.5,5))
   +lie*(.48+.03*Math.sin(line*Math.PI))+w.music*(.22+.06*(1-strum))+rear*.3+.18*crouch-.12*air,
  lookYaw*(1-w.lick)+w.chess*(.1+.08*wave(time*.35,7))+lie*(line-.5)*.2+w.music*.12,
  lookTilt-.17*w.lick+w.chess*.12*wave(time*.4,9)+w.music*(still?0:Math.sin(time*1.6)*.09));
 // Lying down, the neck lowers so Puyol looks down at the Kindle between his paws.
 const rest=rig.headRest;head.position.set(-.065*w.lick,rest.y-.24*w.lick-.2*lie,rest.z+.06*w.lick+.05*lie);
 tongue.visible=w.lick>.6&&!reduced&&lickBeat>.08;
 tongue.scale.z=.058*(.5+lickBeat*.8);tongue.position.z=rig.tongueRest.z+lickBeat*.025;

 // Paws reach for things: props placed by activities.js, the mouth, or the chin.
 const props=Math.max(w.brew,w.music,w.read);
 if(props>.001||w.lick>.001||w.chess>.001)root.updateWorldMatrix(true,true);
 if(props>.001)(rig.goals||[]).forEach((goal,i)=>{
  const k=goal?clamp01(goal.w)*props:0;if(k<=.001)return;
  mix(poses[i],reach(reachVector.copy(goal.p).sub(poses[i].joint),1),k);poses[i].ground*=1-k;
 });
 if(w.lick>.001){
  tongue.getWorldPosition(rig.pawTarget);root.worldToLocal(rig.pawTarget);
  rig.pawTarget.y-=.06+.035*(1-lickBeat);rig.pawTarget.sub(poses[0].joint);
  mix(poses[0],reach(rig.pawTarget,1),w.lick);poses[0].ground*=1-w.lick;
 }
 if(w.chess>.001){
  head.getObjectByName('lower-jaw').getWorldPosition(rig.pawTarget);root.worldToLocal(rig.pawTarget);
  rig.pawTarget.y-=.045;rig.pawTarget.x+=.025;rig.pawTarget.sub(poses[1].joint);
  mix(poses[1],reach(rig.pawTarget,1),w.chess);poses[1].ground*=1-w.chess;
 }
 poses.forEach((pose,i)=>{
  const back=i>1,leg=legs[i];
  leg.position.set(pose.joint.x,pose.joint.y+pose.lift,pose.joint.z);
  leg.rotation.set(pose.hip,pose.yaw,back?(i===2?-1:1)*(.09*sit+.1*lie):0);
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
 attach(0,.94,-.55,tail.position);
 tail.rotation.set(.2*pitch+.18*stride+.25*air,amp*Math.sin(tailState.phase),0);

 // Blinks at irregular intervals, sometimes twice.
 const blink=st.blink;
 if(!still&&time>blink.next){blink.t=0;blink.next=time+(Math.random()<.2?.28:2+Math.random()*4.5);}
 blink.t+=dt;
 const closed=still||blink.t>.15?0:Math.sin(blink.t/.15*Math.PI);
 eyes.forEach(({mesh,height})=>mesh.scale.y=height*(1-.94*closed));
 root.userData.action=action;
}


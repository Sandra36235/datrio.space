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
 root.userData.rig={torso,hips,head,ears,legs,knees,tail,tongue,eyes,sit:0,lick:0,pawTarget:new T.Vector3()};
 return root;
}

export function posePoodle3D(root,time,moving,reduced=false,action='stand',dt=1/60){
 const rig=root.userData.rig,{torso,hips,head,ears,legs,knees,tail,tongue,eyes}=rig;
 const blend=reduced?1:1-Math.exp(-dt*6);
 rig.sit+=((['sit','lick','chess','music','read'].includes(action)?1:0)-rig.sit)*blend;
 rig.lick+=((action==='lick'?1:0)-rig.lick)*blend;
 const sit=rig.sit,lick=rig.lick,gait=moving?Math.sin(time*11.5):0;
 const breath=reduced?0:Math.sin(time*1.8)*.008;
 hips.position.y=.78-.43*sit+(moving?Math.abs(gait)*.026:breath);
 hips.rotation.x=-.7*sit;
 torso.rotation.z=moving?Math.sin(time*5.75)*.025:0;
 legs.forEach((leg,i)=>{
  const phase=i===0||i===3?1:-1,back=i>1;
  leg.rotation.set((moving?.46*Math.sin(time*11.5+phase*Math.PI/2):0)+(back?-1.4*sit:0),0,back?(i===2?-.09:.09)*sit:0);
  knees[i].rotation.x=back?1.55*sit:0;
  leg.position.y=.67-(back?.25:0)*sit+(moving?Math.max(0,phase*gait)*.035:0);
  leg.position.z=back?-.4+.06*sit:.34;
 });
 // The left paw rises toward the muzzle during grooming, then returns smoothly.
 head.rotation.set(.7*sit+.63*lick+(reduced?0:Math.sin(time*2)*.025),reduced?0:Math.sin(time*.55)*.075*(1-lick),-.17*lick);
 head.position.set(-.065*lick,1.12-.18*lick,.46+.06*lick);
 const licking=reduced?0:Math.max(0,Math.sin(time*9));
 tongue.visible=lick>.6&&!reduced;tongue.scale.z=.058*(.5+licking*.8);tongue.position.z=.55+licking*.025;
 // Two-bone reach brings the paw to the mouth without stretching the limb.
 if(lick>.001){
  root.updateWorldMatrix(true,true);tongue.getWorldPosition(rig.pawTarget);root.worldToLocal(rig.pawTarget);
  rig.pawTarget.y-=.06;rig.pawTarget.sub(legs[0].position);
  const {x,y,z}=rig.pawTarget,horizontal=Math.hypot(x,z),a=.27,b=Math.hypot(.315,.035);
  const distance=Math.min(a+b-.015,Math.hypot(y,horizontal));
  const bend=-Math.acos(T.MathUtils.clamp((distance*distance-a*a-b*b)/(2*a*b),-1,1));
  const shoulder=Math.atan2(-horizontal,-y)-Math.atan2(b*Math.sin(bend),a+b*Math.cos(bend));
  legs[0].rotation.order='YXZ';legs[0].rotation.x=shoulder*lick;legs[0].rotation.y=Math.atan2(x,z)*lick;
  knees[0].rotation.x=(bend+Math.atan2(.035,.315))*lick;
 }
 // Each activity has its own readable gesture, layered over the normal gait.
 if(action==='brew'){
  legs[0].rotation.x=-.5+(reduced?0:Math.sin(time*3)*.08);
  knees[0].rotation.x=-.2;
  head.rotation.x=.05;
 }
 if(action==='chess'){
  head.rotation.x+=.15;head.rotation.y+=.1;
  // Reach to the underside of the muzzle: the paw stays on the chin while he thinks.
  root.updateWorldMatrix(true,true);
  head.getObjectByName('lower-jaw').getWorldPosition(rig.pawTarget);
  root.worldToLocal(rig.pawTarget);
  rig.pawTarget.y-=.045;
  rig.pawTarget.x+=.025;
  rig.pawTarget.sub(legs[1].position);
  const {x,y,z}=rig.pawTarget,horizontal=Math.hypot(x,z),a=.27,b=Math.hypot(.315,.035);
  const distance=Math.min(a+b-.015,Math.hypot(y,horizontal));
  const bend=-Math.acos(T.MathUtils.clamp((distance*distance-a*a-b*b)/(2*a*b),-1,1));
  const shoulder=Math.atan2(-horizontal,-y)-Math.atan2(b*Math.sin(bend),a+b*Math.cos(bend));
  legs[1].rotation.order='YXZ';legs[1].rotation.x=shoulder;legs[1].rotation.y=Math.atan2(x,z);
  knees[1].rotation.x=bend+Math.atan2(.035,.315);
 }
 if(action==='music'){
  const strum=reduced?.5:Math.sin(time*8);
  legs[0].rotation.x=-.82+strum*.25;knees[0].rotation.x=-.45;
  legs[1].rotation.x=-.7-strum*.18;knees[1].rotation.x=-.3;
  head.rotation.z+=(reduced?0:Math.sin(time*2)*.1);
 }
 if(action==='read'){
  legs[0].rotation.x=-.65;legs[1].rotation.x=-.65;
  knees[0].rotation.x=-.25;knees[1].rotation.x=-.25;
  head.rotation.x+=.36;
 }
 ears.forEach((ear,i)=>ear.rotation.z=(i?1:-1)*((moving?Math.sin(time*11.5+i)*.07:Math.sin(time*2+i)*.018)+(action==='music'&&!reduced?Math.sin(time*4)*.11:0)));
 tail.position.y=.94-.6*sit;tail.position.z=-.55+.07*sit;
 tail.rotation.y=reduced?0:Math.sin(time*(moving?8:3.8))*.25;
 tail.rotation.x=.2*sit;
 const blink=reduced?1:1-.96*Math.pow(Math.max(0,Math.cos((time%4.7)*Math.PI*2/4.7)),64);
 eyes.forEach(({mesh,height})=>mesh.scale.y=height*blink);
 root.userData.action=action;
}

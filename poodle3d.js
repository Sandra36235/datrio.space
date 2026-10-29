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

 const legs=[];
 const legProfile=[[-.66,0],[-.625,.075],[-.57,.083],[-.48,.062],[-.31,.067],[-.12,.093],[.035,.105],[.07,0]];
 const legGeo=new T.LatheGeometry(legProfile.map(([y,r])=>new T.Vector2(r,y)),24);
 for(const z of [.34,-.4])for(const side of [-1,1]){
  const leg=new T.Group();leg.name=z>0?'front-leg':'hind-leg';leg.position.set(side*.185,.67,z);root.add(leg);legs.push(leg);
  add(leg,'sculpted-leg',legGeo,coat);
  oval(leg,'paw',cream,0,-.585,.08,.095,.072,.145);
 }
 // A short cotton-ball tail sits directly on the rump; no long stem is visible.
 const tail=new T.Group();tail.name='tail-joint';tail.position.set(0,.94,-.55);root.add(tail);
 fluffyOval(tail,'tail-pom',cream,0,.04,-.12,.165,.165,.165);
 for(let i=0;i<12;i++){
  const angle=i*2.39996,level=1-2*(i+.5)/12,ring=Math.sqrt(1-level*level);
  fluffyOval(tail,'tail-curl',cream,ring*Math.cos(angle)*.13,.04+level*.13,-.12+ring*Math.sin(angle)*.13,.057,.057,.057);
 }
 root.userData.rig={torso,head,ears,legs,tail};
 return root;
}

export function posePoodle3D(root,time,moving,reduced=false){
 const {torso,head,ears,legs,tail}=root.userData.rig;
 const gait=moving&&!reduced?Math.sin(time*1.28):0;
 const swing=moving&&!reduced?.48:0;
 legs.forEach((leg,i)=>{const phase=i===0||i===3?1:-1;leg.rotation.x=swing*Math.sin(time*1.28+phase*Math.PI/2);leg.position.y=.67+(moving&&!reduced?Math.max(0,phase*gait)*.035:0)});
 torso.position.y=moving&&!reduced?Math.abs(gait)*.026:Math.sin(time*.2)*.008;
 torso.rotation.z=moving&&!reduced?Math.sin(time*.64)*.028:0;
 head.rotation.x=moving&&!reduced?Math.sin(time*1.28+.6)*.045:Math.sin(time*.19)*.025;
 ears.forEach((ear,i)=>{ear.rotation.z=(i?1:-1)*(moving&&!reduced?Math.sin(time*1.28+i)*.075:.025*Math.sin(time*.3+i))});
 tail.rotation.y=reduced?0:Math.sin(time*(moving?.9:.43))*.32;
 tail.rotation.x=reduced?0:Math.sin(time*.37)*.06;
}

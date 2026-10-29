import * as T from './vendor/three.module.js';
import {posePoodle3D} from './poodle3d.js?v=poodle-1';

// Shared geometry and textures keep the added detail affordable on mobile.
const foliage = [];
const textureCache = new Map();
const materialCache = new Map();
const sphere = new T.SphereGeometry(1, 20, 14);
function tex(key, draw, size = 512) {
  if (textureCache.has(key)) return textureCache.get(key);
  const c = document.createElement('canvas'); c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace;
  t.wrapS = t.wrapT = T.RepeatWrapping; t.anisotropy = 4;
  textureCache.set(key, t); return t;
}
function mesh(parent, geo, material, x = 0, y = 0, z = 0) {
  const m = new T.Mesh(geo, material); m.position.set(x, y, z);
  m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
}
function solid(color, roughness = .7, metalness = 0) {
  const key = `${color}/${roughness}/${metalness}`;
  if (!materialCache.has(key)) materialCache.set(key, new T.MeshStandardMaterial({color, roughness, metalness}));
  return materialCache.get(key);
}
function tube(parent, points, radius, material) {
  return mesh(parent, new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p => new T.Vector3(...p))), 16, radius, 5, false), material);
}
const weave = () => tex('weave', (c, n) => {
  c.fillStyle = '#b8b4ac'; c.fillRect(0,0,n,n);
  for (let y = 0; y < n; y += 4) for (let x = 0; x < n; x += 4) {
    c.fillStyle = (x+y)%8 ? '#d1cec7' : '#aaa69f';
    c.fillRect(x,y,3,1); c.fillRect(x+1,y+1,1,3);
  }
});
export function fabric(color) {
  const key = `fabric/${color}`;
  if (!materialCache.has(key)) materialCache.set(key, new T.MeshPhysicalMaterial({color, roughness:.92, bumpMap:weave(), bumpScale:.012, sheen:1, sheenColor:new T.Color(color).lerp(new T.Color('#ffffff'),.25), sheenRoughness:.85}));
  return materialCache.get(key);
}
export function pillow(parent, x, y, z, color, tilt = 0) {
  const g = new T.Group(); g.position.set(x,y,z); g.rotation.set(-.18,0,tilt); parent.add(g);
  const geo = new T.SphereGeometry(1,32,24), p = geo.attributes.position;
  for(let i=0;i<p.count;i++) {
    const a=p.getX(i),b=p.getY(i),d=p.getZ(i),power=v=>Math.sign(v)*Math.pow(Math.abs(v),.58);
    p.setXYZ(i,power(a)*.34,power(b)*.33,power(d)*.145*(1-.1*Math.abs(a*b)));
  }
  geo.computeVertexNormals(); mesh(g,geo,fabric(color));
  const edge=[];
  for(let i=0;i<=64;i++) {const a=i*Math.PI/32;edge.push([Math.sign(Math.cos(a))*Math.pow(Math.abs(Math.cos(a)),.5)*.337,Math.sign(Math.sin(a))*Math.pow(Math.abs(Math.sin(a)),.5)*.327,0]);}
  tube(g,edge,.006,solid(color)); return g;
}

// A curved leaf surface with a central ridge and shallow lobes, rather than ellipsoids.
const leafGeo = (() => {
  const geo=new T.PlaneGeometry(1,1,12,24), p=geo.attributes.position;
  for(let i=0;i<p.count;i++) {
    const u=p.getX(i)*2, t=p.getY(i)+.5;
    const edge=Math.pow(Math.sin(Math.PI*t),.72)*(1-.14*Math.pow(Math.sin(t*Math.PI*6),8));
    p.setXYZ(i,u*.32*edge,t,.1*Math.sin(t*Math.PI)-.07*u*u*edge);
  }
  geo.computeVertexNormals();return geo;
})();
const leafMap = tex('leaf', (c,n) => {
  const gradient=c.createLinearGradient(0,0,n,0);gradient.addColorStop(0,'#638f50');gradient.addColorStop(.5,'#b9c989');gradient.addColorStop(1,'#4b7842');c.fillStyle=gradient;c.fillRect(0,0,n,n);
  c.strokeStyle='#c6d6a5';c.lineWidth=2;c.beginPath();c.moveTo(n/2,0);c.lineTo(n/2,n);c.stroke();
  c.strokeStyle='#a6bd7d66';c.lineWidth=1.2;
  for(let y=25;y<n;y+=38)for(const side of [-1,1]){c.beginPath();c.moveTo(n/2,y);c.quadraticCurveTo(n/2+side*90,y-8,n/2+side*235,y-90);c.stroke();}
});
const leafMats=['#5e8b52','#39744a','#6d964e'].map(color=>new T.MeshPhysicalMaterial({color,map:leafMap,roughness:.48,side:T.DoubleSide,sheen:.3,sheenColor:new T.Color('#b4cb83')}));
export function botanical(parent, x, y, z, scale=1, kind='upright') {
  const root=new T.Group();root.name='botanical-'+kind;root.position.set(x,y,z);root.scale.setScalar(scale);parent.add(root);
  const clay=solid(kind==='trailing'?'#bc795b':'#e7ddd0',.76);
  const profile=[];
  for(let i=0;i<=32;i++){const h=i/32*.44;profile.push(new T.Vector2(.19+h*.105+.005*Math.sin(i*Math.PI),h));}
  mesh(root,new T.LatheGeometry(profile,32),clay);
  mesh(root,new T.CylinderGeometry(.224,.224,.025,32),clay,0,.44,0);
  mesh(root,new T.CylinderGeometry(.202,.202,.018,24),solid('#49372c'),0,.455,0);
  const crown=new T.Group();crown.position.y=.46;root.add(crown);
  const stemMat=solid('#54734a');
  const count=kind==='trailing'?5:11;
  for(let i=0;i<count;i++){
    const a=i*2.39996,h=kind==='trailing'?.2:.5+(i%4)*.18,reach=kind==='trailing'?.28:.2+(i%3)*.08;
    const end=[Math.cos(a)*reach,h,Math.sin(a)*reach];
    tube(crown,[[0,0,0],[end[0]*.3,h*.55,end[2]*.3],end],.009,stemMat);
    const leaf=mesh(crown,leafGeo,leafMats[i%3],...end);leaf.rotation.set(.25+(i%3)*.22,a,-.45);leaf.scale.setScalar(.55+(i%3)*.13);
    if(kind==='trailing'){
      const bottom=-.65-(i%3)*.26;
      tube(crown,[[0,0,0],[end[0]*1.5,.1,end[2]*1.5],[end[0]*1.8,bottom,end[2]*1.8]],.008,stemMat);
      for(let j=0;j<5;j++){const l=mesh(crown,leafGeo,leafMats[(i+j)%3],end[0]*(1.4+j*.08),-.1+j*bottom/5,end[2]*(1.4+j*.08));l.scale.setScalar(.23);l.rotation.set(.5,a+j,-1.2);}
    }
  }
  foliage.push({root,crown,phase:x*1.7+z,rotation:crown.rotation.clone()});
  return root;
}

export function refineMaterials(room) {
  const wood=tex('oak-grain',(c,n)=>{
    c.fillStyle='#ddba8e';c.fillRect(0,0,n,n);
    for(let i=0;i<190;i++){const x=i*n/190;c.strokeStyle=i%3?'#9f71431c':'#fff0d633';c.lineWidth=i%4===0?1.5:.6;c.beginPath();c.moveTo(x,0);for(let y=0;y<=n;y+=12)c.lineTo(x+Math.sin(y*.018+i)*2+Math.sin(y*.047+i*.7),y);c.stroke();}
  });
  const plaster=tex('plaster',(c,n)=>{c.fillStyle='#e8e4dc';c.fillRect(0,0,n,n);for(let i=0;i<18000;i++){c.fillStyle=i%2?'#ffffff22':'#9d978c15';c.fillRect((i*97)%n,(i*193+Math.floor(i/n)*17)%n,1,1);}});
  room.traverse(o=>{
    if(!o.isMesh || !o.material?.color || o.userData.refined)return;
    const color='#'+o.material.color.getHexString();let m;
    if(['#c49663','#ddb58b','#b48754','#ac7e4d'].includes(color))m=new T.MeshStandardMaterial({color:'#ffffff',map:wood,bumpMap:wood,bumpScale:.006,roughness:.48});
    if(['#1c5ccc','#216ad5','#f6bf25','#ede5d4','#eee9de'].includes(color))m=fabric(color);
    if(color==='#fffaf1' && !o.material.map){
      const s=o.geometry.parameters;const wall=(s?.width>8||s?.depth>8)&&s?.height>3;
      m=wall?new T.MeshStandardMaterial({color:'#fffaf1',bumpMap:plaster,bumpScale:.018,roughness:.92}):new T.MeshPhysicalMaterial({color:'#fffaf1',roughness:.3,clearcoat:.25});
    }
    if(m){o.material=m;o.userData.refined=true;}
  });
}

function steam(room,x,y,z) {
  const map=tex('steam',(c,n)=>{const g=c.createRadialGradient(n/2,n/2,0,n/2,n/2,n/2);g.addColorStop(0,'#ffffff70');g.addColorStop(.45,'#ffffff28');g.addColorStop(1,'#ffffff00');c.fillStyle=g;c.fillRect(0,0,n,n);},64);
  for(let i=0;i<5;i++){
    const material=new T.SpriteMaterial({map,transparent:true,opacity:0,depthWrite:false});
    const sprite=new T.Sprite(material);sprite.position.set(x,y,z);room.add(sprite);
    room.userData.life.steam.push({sprite,x,y,z,phase:i/5});
  }
}
function disc(room,x,y,z){
  const map=tex('vinyl',(c,n)=>{c.fillStyle='#1f242a';c.fillRect(0,0,n,n);c.strokeStyle='#67707c55';c.lineWidth=.7;for(let r=55;r<252;r+=3){c.beginPath();c.arc(n/2,n/2,r,0,Math.PI*2);c.stroke();}c.fillStyle='#c98b61';c.beginPath();c.arc(n/2,n/2,64,0,7);c.fill();c.fillStyle='#fff3db';c.font='bold 19px serif';c.textAlign='center';c.fillText('SIDE A',n/2,n/2-15);c.font='12px sans-serif';c.fillText('GOOD COMPANY',n/2,n/2+16);c.fillStyle='#b0b4b5';c.beginPath();c.arc(n/2,n/2,7,0,7);c.fill();});
  const record=mesh(room,new T.CircleGeometry(.205,48),new T.MeshStandardMaterial({map,roughness:.3}),x,y,z);record.rotation.x=-Math.PI/2;room.userData.life.record=record;
  const arm=solid('#bdb4a7',.3,.8);
  tube(room,[[x+.34,y-.015,z-.16],[x+.25,y+.06,z-.13],[x+.12,y+.04,z+.1]],.011,arm);
  mesh(room,new T.BoxGeometry(.035,.025,.06),solid('#d5b282'),x+.12,y+.025,z+.1);
}
export function addRoomLife(room,studio=false){
  room.userData.life={time:0,steam:[],record:null,curtains:[],fans:[],dog:room.getObjectByName('poodle-3d')};
  room.traverse(o=>{
    if(!o.isMesh)return;
    const p=o.geometry.parameters;
    if(p?.height===3&&o.material.color?.getHexString()==='eee9de')room.userData.life.curtains.push({mesh:o,x:o.position.x});
  });
  if(studio){botanical(room,2.65,1.37,-.45,.32);steam(room,2.35,1.58,.65);refineMaterials(room);return;}
  botanical(room,-4.43,3.78,-5.18,.65,'trailing');
  botanical(room,6.05,0,-2.05,.9);
  botanical(room,-3.6,1.2,-4.72,.35);
  botanical(room,-6.86,2.54,-4.52,.36,'trailing');
  // Rotating fan blades remain behind the tower's illuminated rings.
  for(let i=0;i<3;i++){
    const fan=new T.Group();fan.position.set(-1.65,1.38+i*.19,-4.475);room.add(fan);
    for(let blade=0;blade<5;blade++){
      const a=blade*Math.PI*2/5,m=mesh(fan,sphere,solid('#dba2cc',.38),Math.cos(a)*.034,Math.sin(a)*.034,0);
      m.scale.set(.031,.012,.004);m.rotation.z=a+.45;
    }
    room.userData.life.fans.push(fan);
  }
  steam(room,-6.33,1.405,-2.2);
  disc(room,3.5,1.18,-4.95);
  const brass=solid('#b9945f',.27,.72);
  // Recessed mats and slim metal edges give the original pet paintings depth.
  for(let i=0;i<4;i++){
    const x=.6+i*1.25;
    for(const dx of [-.565,.565])mesh(room,new T.BoxGeometry(.022,1.36,.04),brass,x+dx,2.95,-5.46);
    for(const dy of [-.665,.665])mesh(room,new T.BoxGeometry(1.15,.022,.04),brass,x,2.95+dy,-5.46);
  }
  // Fine stitching across each upholstered back cushion.
  for(let i=0;i<3;i++){
    const x=.35+i*1.3;
    tube(room,[[x-.57,.85,-1.105],[x-.57,1.49,-1.105],[x+.57,1.49,-1.105],[x+.57,.85,-1.105]],.005,solid('#74a0df'));
  }
  const readingChair=room.getObjectByName('reading-chair');
  if(readingChair){
    const cushion=mesh(readingChair,new T.SphereGeometry(1,24,16),fabric('#f5c742'),0,.72,-.01);
    cushion.scale.set(.51,.115,.42);
    tube(readingChair,[[-.53,.74,-.35],[-.53,1.26,-.35],[0,1.38,-.35],[.53,1.26,-.35],[.53,.74,-.35]],.012,solid('#df9e32'));
    for(const side of [-1,1])mesh(readingChair,new T.SphereGeometry(.026,12,8),solid('#f7dc7a'),side*.44,.75,.24);
  }
  // Warm under-shelf illumination and a physical metallic switch on the cabinet.
  const strip=mesh(room,new T.BoxGeometry(.035,.018,3.7),new T.MeshBasicMaterial({color:'#ffe2ac'}),-6.59,2.46,-2.6);strip.castShadow=false;
  const glow=new T.PointLight('#ffd8a2',.65,2.2,2);glow.position.set(-6.35,2.25,-2.6);room.add(glow);
  // Name plaque mounted on the front of Puyol's bed.
  const label=tex('puyol-label',(c,n)=>{c.fillStyle='#b88761';c.fillRect(0,0,n,n);c.fillStyle='#fff4df';c.textAlign='center';c.font='600 115px Georgia';c.fillText('Puyol',n/2,n*.61);},256);
  mesh(room,new T.PlaneGeometry(.28,.13),new T.MeshStandardMaterial({map:label,roughness:.8}),5.8,.22,3.212);
  refineMaterials(room);
}

export function animateRoom(room,dt,reduced=false){
  const life=room?.userData.life;if(!life)return false;
  if(reduced){for(const p of life.steam)p.sprite.visible=false;return false;}
  life.time+=dt;const t=life.time;
  for(const p of foliage){
    if(!room.getObjectById(p.root.id))continue;
    p.crown.rotation.z=Math.sin(t*.65+p.phase)*.023;
    p.crown.rotation.x=Math.sin(t*.47+p.phase)*.015;
  }
  for(const p of life.steam){const brewing=room.userData.activity==='coffee',f=(t*(brewing?.38:.25)+p.phase)%1;p.sprite.visible=true;p.sprite.position.set(p.x+Math.sin(f*5+t*.4)*.035,p.y+f*(brewing?.7:.48),p.z+Math.cos(f*4)*.02);p.sprite.scale.set(.07+f*(brewing?.26:.18),.16+f*(brewing?.3:.22),1);p.sprite.material.opacity=Math.sin(f*Math.PI)*(brewing?.38:.2);}
  if(life.record)life.record.rotation.z=-t*.65;
  life.fans.forEach(fan=>fan.rotation.z=-t*2.4);
  life.curtains.forEach((p,i)=>{p.mesh.rotation.z=Math.sin(t*.6+i*.25)*.009;p.mesh.position.x=p.x+Math.sin(t*.6+i*.25)*.012;});
  if(life.dog){const phase=t%24;posePoodle3D(life.dog,t,false,false,phase>9&&phase<14?'lick':phase>4&&phase<18?'sit':'stand',dt);}
  return true;
}

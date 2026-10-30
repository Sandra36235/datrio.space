import * as T from './vendor/three.module.js';
import {createPoodle3D} from './poodle3d.js?v=pastel-9';
import {botanical,pillow,addRoomLife} from './room-life.js?v=pastel-9';
import {coffeeBar,teachingCorner,musicCorner} from './salon-corners.js?v=pastel-9';
import {mergeStatic,contactShadows,coffeeExtras,libraryCollectibles,gamerSetup,fluffySofa,fluffyChair,pumpkinPouf,puyolBed,fiddleLeaf,birdOfParadise,succulentBowl,libraryScallops,bubblePedestal,mushroomTable,wavyMirror} from './salon-extras.js?v=pastel-9';
const materialCache=new Map();
export function mat(color){if(!materialCache.has(color))materialCache.set(color,new T.MeshStandardMaterial({color,roughness:.78}));return materialCache.get(color)}
const C={white:'#fffaf1',blue:'#7891cc',sky:'#a5b9e4',yellow:'#f0d37a',orange:'#8e3b4a',oak:'#c49663',oakLight:'#ddb58b',dark:'#2f2a33',cream:'#ece4d8',leaf:'#4b7643',gold:'#bd8c40'};
function place(geo,m,g,x=0,y=0,z=0){const a=new T.Mesh(geo,typeof m==='string'?mat(m):m);a.position.set(x,y,z);a.castShadow=true;a.receiveShadow=true;g.add(a);return a}
export function box(g,w,h,d,m,x=0,y=0,z=0,r=0){if(!r)return place(new T.BoxGeometry(w,h,d),m,g,x,y,z);r=Math.min(r,w/3,h/3,d/3);const s=new T.Shape(),a=-w/2+r,b=-h/2+r,W=w-2*r,H=h-2*r;s.moveTo(a,b-r);s.lineTo(a+W,b-r);s.quadraticCurveTo(a+W+r,b-r,a+W+r,b);s.lineTo(a+W+r,b+H);s.quadraticCurveTo(a+W+r,b+H+r,a+W,b+H+r);s.lineTo(a,b+H+r);s.quadraticCurveTo(a-r,b+H+r,a-r,b+H);s.lineTo(a-r,b);s.quadraticCurveTo(a-r,b-r,a,b-r);const geo=new T.ExtrudeGeometry(s,{depth:d-2*r,bevelEnabled:true,bevelSize:r,bevelThickness:r,bevelSegments:2,steps:1,curveSegments:3});geo.translate(0,0,-(d-2*r)/2);return place(geo,m,g,x,y,z)}
export const sphere=(g,r,m,x,y,z,sx=1,sy=1,sz=1)=>{const a=place(new T.SphereGeometry(r,24,16),m,g,x,y,z);a.scale.set(sx,sy,sz);return a};
function cyl(g,rt,rb,h,m,x,y,z,n=20){return place(new T.CylinderGeometry(rt,rb,h,n),m,g,x,y,z)}
function group(g,x=0,y=0,z=0,rotation=0){const a=new T.Group();a.position.set(x,y,z);a.rotation.y=rotation;g.add(a);return a}
function texture(draw,w=512,h=512){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t}
function imagePlane(g,w,h,t,x,y,z,rot=0){const a=place(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:t,side:T.DoubleSide}),g,x,y,z);a.rotation.y=rot;return a}
// Natural oak herringbone: each plank has its own honey tone and soft grain.
function parquet(){return texture((ctx,w,h)=>{ctx.fillStyle='#b08a5e';ctx.fillRect(0,0,w,h);const W=32,L=128,P=256,tones=['#c6a072','#c29c6e','#caa577','#bf996b','#c49e70','#cba679'];let n=0;
 const plank=(x,y,pw,ph)=>{for(const ox of [-P,0,P,2*P])for(const oy of [-P,0,P,2*P]){const X=x+ox,Y=y+oy;if(X>w||Y>h||X+pw<0||Y+ph<0)continue;ctx.fillStyle=tones[n%tones.length];ctx.fillRect(X,Y,pw,ph);ctx.strokeStyle='#6b4a2c12';ctx.lineWidth=1;const along=pw>ph;for(let q=0;q<5;q++){const o=4+q*5.5+((n*7+q*3)%4);ctx.beginPath();if(along){ctx.moveTo(X+2,Y+o*ph/32);ctx.bezierCurveTo(X+pw*.35,Y+o*ph/32+2,X+pw*.65,Y+o*ph/32-2,X+pw-2,Y+o*ph/32+1)}else{ctx.moveTo(X+o*pw/32,Y+2);ctx.bezierCurveTo(X+o*pw/32+2,Y+ph*.35,X+o*pw/32-2,Y+ph*.65,X+o*pw/32+1,Y+ph-2)}ctx.stroke()}ctx.strokeStyle='#a17d55';ctx.lineWidth=1;ctx.strokeRect(X+.5,Y+.5,pw-1,ph-1)}n++};
 for(let k=0;k<P/W;k++){plank(k*W,k*W,L,W);plank(k*W,(k+1)*W,W,L)}})}
const woodTex=parquet();woodTex.wrapS=woodTex.wrapT=T.RepeatWrapping;woodTex.repeat.set(6,4.75);
function shell(w=10.5,d=8.5){const g=new T.Group();box(g,w,.26,d,C.cream,0,-.2,0,.08);box(g,w-.2,.04,d-.2,new T.MeshStandardMaterial({map:woodTex,roughness:.85}),0,.005,0);box(g,w,4.1,.18,C.white,0,2.02,-d/2+.1);box(g,.18,4.1,d,C.white,-w/2+.1,2.02,0);box(g,w+.1,.17,.24,'#eadfca',0,4.06,-d/2+.12);box(g,.24,.17,d,'#eadfca',-w/2+.12,4.06,0);box(g,w-.3,.09,.06,'#e7decd',0,.08,-d/2+.23);box(g,.06,.09,d-.4,'#e7decd',-w/2+.23,.08,0);return g}
function windowPanel(g,x,z,width=2.5){const win=group(g,x,0,z,Math.PI/2);const sky=texture((ctx,w,h)=>{const gr=ctx.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#d1eaf4');gr.addColorStop(.65,'#f4f1d5');gr.addColorStop(1,'#9bbc8a');ctx.fillStyle=gr;ctx.fillRect(0,0,w,h);for(let i=0;i<30;i++){ctx.fillStyle=i%2?'#98b78055':'#d7dfac66';ctx.beginPath();ctx.arc((i*93)%w,h*.62+(i*41)%150,30,0,7);ctx.fill()}});box(win,width+.14,2.85,.08,C.oakLight,0,2.1,0);imagePlane(win,width,2.7,sky,0,2.1,.06);box(win,.055,2.8,.06,C.white,0,2.1,.11);box(win,width,.055,.06,C.white,0,2.1,.11);for(let side of [-1,1])for(let i=0;i<5;i++)box(win,.1,2.95,.08,'#f7f3ed',side*(width/2+.12)+i*.055,2.1,.12,.02)}
function plant(g,x,y,z,s=1){return botanical(g,x,y,z,s)}
function mug(g,x,y,z,color=C.white,matcha=false){cyl(g,.1,.085,.19,color,x,y+.095,z);cyl(g,.082,.082,.007,matcha?'#76a23c':'#473222',x,y+.194,z);const handle=place(new T.TorusGeometry(.055,.016,6,12),color,g,x+.115,y+.11,z);return handle}
function coffeeMethods(g){
 const glass=new T.MeshPhysicalMaterial({color:'#c9e0dc',transparent:true,opacity:.42,roughness:.12,depthWrite:false});
 const steel=new T.MeshStandardMaterial({color:'#b7a689',metalness:.7,roughness:.25});
 const curve=(points,r,m)=>place(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),24,r,8,false),m,g);
 // Two pour-over brewers: a glass V60 on a carafe and a fluted ceramic Origami.
 for(const [z,color,flutes] of [[-2.52,'#e9e4db',false],[-1.96,'#e8b9b5',true]]){
  const x=-6.47;cyl(g,.115,.14,.18,glass,x,1.29,z,24);cyl(g,.13,.13,.025,steel,x,1.4,z,24);
  cyl(g,.065,.155,.23,color,x,1.53,z,flutes?16:32);cyl(g,.135,.135,.018,'#f9e8cf',x,1.655,z,flutes?16:32);
  if(flutes)for(let i=0;i<16;i++){const a=i*Math.PI/8;curve([[x+Math.cos(a)*.085,1.46,z+Math.sin(a)*.085],[x+Math.cos(a)*.14,1.64,z+Math.sin(a)*.14]],.004,'#f3d0cc')}
 }
 // Japanese siphon: paired glass bulbs, a vertical stand and tiny burner.
 const sx=-6.84,sz=-3.02;
 cyl(g,.19,.19,.025,steel,sx,1.205,sz);cyl(g,.012,.012,.62,steel,sx-.21,1.53,sz);
 sphere(g,.13,glass,sx,1.4,sz,1,1.2,1);cyl(g,.025,.025,.22,glass,sx,1.61,sz);
 sphere(g,.14,glass,sx,1.8,sz,1,1.05,1);cyl(g,.11,.11,.02,C.dark,sx,1.95,sz);
 cyl(g,.065,.08,.11,'#7b766c',sx,1.275,sz);sphere(g,.035,'#e8a95b',sx,1.35,sz);
 // Brushed gooseneck kettle, with a real curved spout and arched handle.
 const kx=-6.48,kz=-.78;cyl(g,.17,.19,.31,'#d8c9b4',kx,1.36,kz);cyl(g,.18,.18,.026,steel,kx,1.53,kz);
 sphere(g,.033,C.dark,kx,1.56,kz);curve([[kx,1.43,kz-.13],[kx,1.5,kz-.27],[kx,1.65,kz-.31],[kx,1.72,kz-.39]],.018,steel);
 curve([[kx,1.42,kz+.16],[kx,1.52,kz+.32],[kx,1.65,kz+.31],[kx,1.66,kz+.17]],.025,C.dark);
}
function book(g,x,y,z,h=.48,color=C.blue,width=.1){box(g,width,h,.35,color,x,y+h/2,z,.012);box(g,width*.8,.018,.012,'#efdfc4',x,y+h*.75,z+.182);box(g,width*.8,.012,.012,'#efdfc4',x,y+h*.68,z+.182)}
function shelves(g,x,z,w=2.2){
 // A cabinet carcass with a recessed back: the shelves and books occupy real space.
 box(g,w-.1,3.55,.055,'#4c1d28',x,1.86,z-.31);
 for(const side of [-1,1])box(g,.1,3.65,.7,'#5c2532',x+side*(w/2-.05),1.85,z,.018);
 box(g,w,.1,.72,'#6b2e3b',x,3.72,z,.018);
 box(g,w,.1,.72,'#6b2e3b',x,.075,z,.018);
 for(let j=0;j<5;j++){
  const y=.35+j*.68;
  box(g,w-.12,.075,.66,'#6b2e3b',x,y,z,.014);
  box(g,w-.13,.018,.035,'#4c1d28',x,y-.04,z+.27);
  for(let k=0;k<6;k++){
   if(j===1&&k>2)continue;
   book(g,x-w/2+.2+k*.17,y+.04,z+.07,.36+((k+j)%3)*.09,[C.blue,'#f4ead6',C.yellow,'#e8b9b5',C.sky][((k+j)%5)],.12);
  }
 }
 succulentBowl(g,x+.62,2.43,z+.1,.9);
}
function framed(g,x,y,z,w,h,map){box(g,w+.1,h+.1,.07,C.white,x,y,z,.02);imagePlane(g,w,h,map,x,y,z+.045)}
function petPortrait(i){return texture((ctx,w,h)=>{const bg=['#223349','#263859','#4d798c','#edaaa6','#bcd5dd'][i%5];ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);if(i===2){ctx.strokeStyle='#e4c56e';ctx.lineWidth=12;for(let j=0;j<20;j++){ctx.beginPath();ctx.arc((j*89)%w,(j*71)%h,20+j%4*5,0,5);ctx.stroke()}}ctx.fillStyle=i===3?'#181b24':'#b98255';ctx.beginPath();ctx.ellipse(w*.5,h*.78,w*.3,h*.39,0,0,7);ctx.fill();ctx.fillStyle=i===1?'#d4b486':i===3?'#141720':'#d5a46c';ctx.beginPath();ctx.ellipse(w*.5,h*.45,w*.25,h*.26,0,0,7);ctx.fill();if(i%2===0){for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(w*(.5+s*.25),h*.4);ctx.lineTo(w*(.5+s*.2),h*.13);ctx.lineTo(w*(.5+s*.05),h*.32);ctx.fill()}}else{for(const s of [-1,1]){ctx.beginPath();ctx.ellipse(w*(.5+s*.25),h*.48,w*.12,h*.25,s*.2,0,7);ctx.fill()}}ctx.fillStyle='#e5dab3';for(const s of [-1,1]){ctx.beginPath();ctx.ellipse(w*(.5+s*.1),h*.45,w*.045,h*.045,0,0,7);ctx.fill()}ctx.fillStyle='#24221e';for(const s of [-1,1]){ctx.beginPath();ctx.arc(w*(.5+s*.1),h*.45,w*.017,0,7);ctx.fill()}ctx.beginPath();ctx.ellipse(w*.5,h*.57,w*.055,h*.035,0,0,7);ctx.fill();if(i===0){ctx.fillStyle='#3977aa';ctx.beginPath();ctx.ellipse(w*.5,h*.23,w*.27,h*.12,-.2,0,7);ctx.fill();ctx.fillStyle='#ece1b9';ctx.beginPath();ctx.arc(w*.75,h*.65,12,0,7);ctx.fill()}if(i===2){ctx.fillStyle='#e1b451';ctx.beginPath();ctx.ellipse(w*.5,h*.2,w*.37,h*.09,.2,0,7);ctx.fill()}})}
function sofa(g){const s=group(g,1.65,0,-.75);fluffySofa(s)}
function chair(g,x,z){const s=group(g,x,0,z,-.2);cyl(s,.67,.58,.25,'#f0d37a',0,.55,0);box(s,1.25,.75,.22,'#f0d37a',0,1.01,-.46,.12);for(let sign of [-1,1])box(s,.2,.45,1,'#f0d37a',sign*.58,.81,0,.06);
 // Solid tapered oak legs connect visibly to the underside of the seat.
 for(const xx of [-.42,.42])for(const zz of [-.34,.34]){
  const leg=cyl(s,.072,.055,.4,C.oak,xx,.23,zz,12);leg.rotation.z=xx<0?.08:-.08;
  cyl(s,.07,.07,.025,C.gold,xx*1.05,.055,zz,12);
 }return s}
function philosopher(g){const s=group(g,-1.85,.78,1.1,.16);cyl(s,.3,.48,.62,'#8c9d82',0,.35,0,12);sphere(s,.38,'#f0d8ae',0,.91,0,1,1.1,.9);sphere(s,.23,'#b0b2ad',0,.75,.23,1.15,.7,.5);for(let i=0;i<15;i++){let a=i*2.4;sphere(s,.11,'#b5b5af',Math.cos(a)*.33,1.12+Math.sin(a)*.12,Math.sin(a)*.24)}for(let xx of [-.13,.13]){sphere(s,.047,'#22252c',xx,.97,.32);sphere(s,.05,'#eee5d4',xx,.98,.34,.2,.2,.2)}sphere(s,.07,'#d5b18a',0,.89,.35);for(let xx of [-.28,.28]){sphere(s,.21,C.white,xx,.44,.38,.8,1.4,1.4);sphere(s,.1,'#f0d8ae',xx*1.75,.51,.63,1,.8,1)}for(let xx of [-.2,.2]){box(s,.29,.17,.6,C.white,xx,-.05,.3,.05);box(s,.25,.12,.4,'#a76d45',xx,-.3,.52,.04)}}
function lewisPiece(g,x,y,z,type,color){
 cyl(g,.044,.047,.025,color,x,y,z,12);
 if(type==='pawn'){sphere(g,.027,color,x,y+.052,z,1,1,.8);return}
 if(type==='knight'){
  box(g,.05,.066,.035,color,x,y+.055,z,.012);
  sphere(g,.034,color,x,y+.1,z+.012,1,.8,1.25);
  sphere(g,.012,C.dark,x-.014,y+.11,z+.041);return;
 }
 // The Lewis figures are seated people, not abstract Staunton silhouettes.
 box(g,.064,.064,.058,color,x,y+.05,z,.012);
 sphere(g,.029,color,x,y+.103,z+.012,1,1,.85);
 if(type==='rook'){
  box(g,.045,.055,.015,color,x,y+.055,z+.045,.006);
  sphere(g,.012,C.dark,x-.012,y+.105,z+.036);
 }else{
  cyl(g,.032,.036,.019,color,x,y+.138,z+.005,type==='bishop'?8:10);
  if(type==='bishop'){const tip=place(new T.ConeGeometry(.02,.044,8),color,g,x,y+.169,z+.005);tip.rotation.z=.08}
  if(type==='king'||type==='queen')sphere(g,.01,C.gold,x,y+.155,z+.005);
 }
}
function chess(g,x,z){
 const glass=new T.MeshPhysicalMaterial({color:'#d9edf0',transparent:true,opacity:.52,roughness:.09,metalness:.04,depthWrite:false});
 cyl(g,1.07,1.07,.08,glass,x,.63,z,48);
 const rim=place(new T.TorusGeometry(1.035,.018,8,64),'#b8a88b',g,x,.67,z);rim.rotation.x=Math.PI/2;
 bubblePedestal(g,x,z);
 box(g,1.42,.045,1.42,'#866d54',x,.7,z);
 for(let i=0;i<8;i++)for(let j=0;j<8;j++){
  const px=x-.56+i*.16,pz=z-.56+j*.16;
  box(g,.16,.008,.16,(i+j)%2?'#8b6c55':'#e9dcc4',px,.727,pz);
  if(j<2||j>5){const type=(j===1||j===6)?'pawn':['rook','knight','bishop','queen','king','bishop','knight','rook'][i];const piece=group(g,px,.75,pz);piece.name=i===3&&j===6?'interactive-chess-pawn':'lewis-piece';piece.scale.setScalar(1.37);lewisPiece(piece,0,0,0,type,j<2?'#7a3544':'#f1e2bf')}
 }
}
function techCorner(g){
 const pink='#a5b9e4',light='#3a3352',deep='#2f2a33',glow=new T.MeshBasicMaterial({color:'#b79cf0'});glow.name='rgb-glow';
 const screen=texture((ctx,w,h)=>{ctx.fillStyle='#2a2440';ctx.fillRect(0,0,w,h);const gradient=ctx.createLinearGradient(0,0,w,h);gradient.addColorStop(0,'#f0d37a');gradient.addColorStop(1,'#7891cc');ctx.fillStyle=gradient;ctx.beginPath();ctx.arc(w*.68,h*.45,h*.32,0,7);ctx.fill();ctx.fillStyle='#fff0fa';ctx.font='bold 38px sans-serif';ctx.fillText('CREATE  /  PLAY',34,70);ctx.fillStyle='#c9d4f0';for(let i=0;i<5;i++)ctx.fillRect(34,125+i*50,145+i*36,12)});
 // Compact desk stays against the back wall, beside the library.
 box(g,2.35,.12,.95,light,-2.65,1.13,-4.65,.055);
 for(const x of [-3.68,-1.62])for(const z of [-4.95,-4.34])box(g,.07,1.05,.07,deep,x,.55,z,.02);
 const tower=box(g,.39,.72,.45,'#f6eedc',-1.65,1.58,-4.75,.05);tower.name='gamer-pc';box(g,.31,.55,.018,'#2a2440',-1.65,1.59,-4.51,.015);
 for(let i=0;i<3;i++){const fan=place(new T.TorusGeometry(.073,.018,8,24),glow,g,-1.65,1.38+i*.19,-4.49);fan.rotation.x=Math.PI/2}
 // Three framed titles are intentionally generic until Sandra provides exact credentials.
 const paper=texture((ctx,w,h)=>{ctx.fillStyle='#fffaf4';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#d0a88f';ctx.lineWidth=8;ctx.strokeRect(15,15,w-30,h-30);ctx.fillStyle='#7891cc';ctx.fillRect(90,94,w-180,13);for(let j=0;j<3;j++)ctx.fillRect(65,155+j*32,w-130,5);ctx.fillStyle='#d6a44e';ctx.beginPath();ctx.arc(w/2,h-75,22,0,7);ctx.fill()});
 for(const [i,x] of [-3.43,-2.62,-1.81].entries()){box(g,.68,.86,.06,i===1?deep:'#b88e68',x,3.12,-5.53,.02);imagePlane(g,.59,.76,paper,x,3.12,-5.48)}
}
function music(g){
 // A single carved figure-eight body gives the ukulele a continuous silhouette.
 const u=group(g,.15,.08,-3.1,.12);u.name='ukulele';
 const shape=new T.Shape();shape.moveTo(0,.2);
 shape.bezierCurveTo(-.24,.15,-.31,.35,-.23,.57);
 shape.bezierCurveTo(-.12,.72,-.22,.76,-.2,.9);
 shape.bezierCurveTo(-.18,1.1,-.06,1.12,0,1.1);
 shape.bezierCurveTo(.06,1.12,.18,1.1,.2,.9);
 shape.bezierCurveTo(.22,.76,.12,.72,.23,.57);
 shape.bezierCurveTo(.31,.35,.24,.15,0,.2);
 const body=place(new T.ExtrudeGeometry(shape,{depth:.085,bevelEnabled:true,bevelSize:.026,bevelThickness:.02,bevelSegments:3,curveSegments:12}),'#bd8247',u,0,0,0);body.name='ukulele-body';
 const hole=place(new T.TorusGeometry(.08,.012,8,32),'#523b29',u,0,.75,.116);hole.name='ukulele-soundhole';
 sphere(u,.067,'#30251f',0,.75,.12,1,1,.08);
 box(u,.15,.57,.075,'#62432c',0,1.31,.04,.025);box(u,.2,.21,.08,'#ad7540',0,1.69,.04,.025);
 for(let i=0;i<7;i++)box(u,.15,.008,.008,'#d8bd86',0,1.08+i*.07,.092);
 box(u,.16,.03,.04,'#654331',0,.39,.13,.008);
 for(let i=0;i<4;i++){const x=(i-1.5)*.034;box(u,.003,1.27,.003,'#f0e2bf',x,1.05,.146);sphere(u,.023,C.white,(i%2?1:-1)*.13,1.64+(i%2)*.12,.04)}
 // Two visible prongs and a floor base hold it upright.
 const stand=group(g,.15,.08,-3.1,.12);stand.name='ukulele-stand';box(stand,.5,.035,.4,C.dark,0,-.04,0,.015);for(const x of [-.13,.13])box(stand,.035,.31,.045,C.dark,x,.18,.12,.01);
}
// Butter-yellow and periwinkle checkerboard wool rug.
function rug(g){const t=texture((ctx,w,h)=>{const n=12,m=8,sw=w/n,sh=h/m;for(let y=0;y<m;y++)for(let x=0;x<n;x++){ctx.fillStyle=(x+y)%2?'#e8c260':'#8399cf';ctx.fillRect(x*sw,y*sh,sw+1,sh+1)}for(let i=0;i<14000;i++){ctx.fillStyle=i%2?'#ffffff0a':'#2a2f5010';ctx.fillRect(Math.random()*w,Math.random()*h,1,2)}},768,512);const a=place(new T.PlaneGeometry(7,4.6),new T.MeshStandardMaterial({map:t,roughness:1}),g,0,.04,1);a.rotation.x=-Math.PI/2;a.receiveShadow=true}
function lamp(g){cyl(g,.22,.3,.04,C.dark,-.7,.05,-2.9);cyl(g,.018,.018,2.7,C.dark,-.7,1.4,-2.9);for(let j=0;j<3;j++){const q=cyl(g,.12,.18,.35,j===1?'#a8b6e6':'#f0d37a',-.7+(j-1)*.23,2.4+j*.22,-2.9,20);q.rotation.z=(j-1)*.5}const textureStripe=texture((c,w,h)=>{c.fillStyle='#aab3e4';c.fillRect(0,0,w,h);c.fillStyle='#96a0d6';for(let x=0;x<w;x+=32)c.fillRect(x,0,10,h)});const shade=place(new T.CylinderGeometry(.48,.48,.55,32,1,true),new T.MeshStandardMaterial({map:textureStripe,side:T.DoubleSide}),g,.7,3.5,-1.6);cyl(g,.01,.01,.6,C.dark,.7,4.05,-1.6);cyl(g,.46,.46,.015,C.white,.7,3.22,-1.6)}
export function makeSalon(){
 const g=shell(14.5,11.5);g.name='salon';windowPanel(g,-7.03,2,3.4);
 rug(g);coffeeBar(g);teachingCorner(g);musicCorner(g);shelves(g,-5.2,-5.25,2.2);techCorner(g);gamerSetup(g);libraryCollectibles(g);pumpkinPouf(g);puyolBed(g);
 const librarySign=texture((ctx,w,h)=>{ctx.fillStyle='#5a2431';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#f0d37a';ctx.lineWidth=10;ctx.strokeRect(16,16,w-32,h-32);ctx.fillStyle='#fff9e8';ctx.textAlign='center';ctx.font='600 46px sans-serif';ctx.fillText('BIBLIOTECA',w/2,h*.62)},512,128);
 imagePlane(g,1.95,.48,librarySign,-5.2,3.77,-4.83);
 const seating=group(g,0,0,.1);seating.name='sofa';sofa(seating);
 fluffyChair(g);
 chess(g,.1,1.8);music(group(g,1,0,-1.5));lamp(group(g,1,0,-1.5));
 fiddleLeaf(g,-6.4,4.5,1.25);birdOfParadise(g,6.2,-4.5,1.4);wavyMirror(g);libraryScallops(g);
 g.userData.artPanels=[];
 for(let i=0;i<4;i++){const x=.6+i*1.25;framed(g,x,2.95,-5.52,1.03,1.23,petPortrait(i));g.userData.artPanels.push(g.children[g.children.length-1])}
 salonDetails(g);contactShadows(g);addRoomLife(g);mergeStatic(g);return g;
}
function whiteboardTexture(){return texture((ctx,w,h)=>{ctx.fillStyle='#fcfdfb';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#467eb8';ctx.lineWidth=4;for(let i=0;i<6;i++){let x=30+(i%3)*155,y=40+Math.floor(i/3)*160;ctx.strokeRect(x,y,100,55);ctx.beginPath();ctx.moveTo(x+105,y+27);ctx.lineTo(x+145,y+27);ctx.lineTo(x+137,y+20);ctx.stroke()}for(let i=0;i<3;i++){ctx.strokeStyle=['#4b7bc7','#e4ae40','#ed9454'][i];ctx.beginPath();ctx.arc(150+i*60,390,70,0,7);ctx.stroke()}for(let i=0;i<5;i++){ctx.fillStyle=['#f7c86f','#8ac9e8','#f5a6a2'][i%3];ctx.fillRect(380+(i%2)*50,260+i*40,40,35)}})}
function monitor(g,x,y,z){box(g,1.8,1.1,.1,C.dark,x,y,z,.04);const tx=texture((ctx,w,h)=>{ctx.fillStyle='#f7faff';ctx.fillRect(0,0,w,h);ctx.fillStyle='#3158cb';ctx.fillRect(0,0,w,35);ctx.fillStyle='#dbe4f4';ctx.fillRect(0,35,65,h);for(let i=0;i<5;i++){ctx.fillStyle=i%2?'#ee9c45':'#4274d6';ctx.fillRect(95+i*65,270-i*28,38,80+i*28)}ctx.strokeStyle='#3e74c7';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(90,440);ctx.lineTo(170,390);ctx.lineTo(230,405);ctx.lineTo(310,345);ctx.lineTo(450,330);ctx.stroke()});imagePlane(g,1.65,.96,tx,x,y,z+.06);box(g,.08,.35,.08,'#8e9baa',x,y-.7,z);box(g,.65,.04,.4,'#c5ced7',x,y-.88,z+.08)}
function diploma(i){return texture((ctx,w,h)=>{ctx.fillStyle='#fffaf1';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#b3986d';ctx.lineWidth=3;ctx.strokeRect(20,20,w-40,h-40);ctx.fillStyle='#777a80';ctx.fillRect(160,100,190,12);for(let j=0;j<5;j++)ctx.fillRect(90+(j%2)*25,180+j*28,330-(j%2)*50,4);ctx.fillStyle='#c9a24b';ctx.beginPath();ctx.arc(256,385,30,0,7);ctx.fill()})}
export function makeStudio(){const g=shell();windowPanel(g,-5.03,1.7,2.7);rug(g);shelves(g,-3.3,-3.75,2.1);for(let j=0;j<2;j++)framed(g,-.8+j*1.5,3,-4.02,1.05,1.3,diploma(j));box(g,2.8,1.9,.08,'#99a2ac',2.7,2.55,-4.02,.03);imagePlane(g,2.63,1.73,whiteboardTexture(),2.7,2.55,-3.97);box(g,2.8,.04,.18,'#a0a8ad',2.7,1.57,-3.9);box(g,4.9,.12,1.9,C.oakLight,.6,1.3,.15,.04);for(let x of [-1.6,2.8]){box(g,.1,1.22,.1,C.blue,x,.66,-.58);box(g,.1,1.22,.1,C.blue,x,.66,.9);box(g,.1,.08,1.6,C.blue,x,.09,.15)}monitor(g,1.5,2.12,-.45);box(g,1.05,.055,.7,'#8793a1',-.2,1.4,.36,.025);const screen=box(g,1.05,.7,.045,C.dark,-.2,1.76,.03,.03);screen.rotation.x=-.22;box(g,.92,.56,.05,'#d7e6f5',-.2,1.76,.06);box(g,.95,.04,.32,C.white,1.4,1.4,.55,.02);for(let i=0;i<6;i++){let x=-1.3+(i%3)*.27,z=.2+Math.floor(i/3)*.4;const p=box(g,.43,.009,.5,i%2?'#fffdf4':'#f6cb5f',x,1.38+i*.003,z);p.rotation.y=i*.3}box(g,.55,.045,.7,C.white,.45,1.4,.65);for(let i=0;i<5;i++)box(g,.4,.004,.012,'#879bb8',.45,1.425,.45+i*.08);mug(g,2.35,1.37,.65,C.orange);cyl(g,.095,.08,.23,C.white,2.47,1.48,.2);for(let j=0;j<4;j++)cyl(g,.012,.012,.28,[C.blue,C.orange,C.dark][j%3],2.43+j*.025,1.68,.2,5);const ch=group(g,-.3,0,-1.4);box(ch,1,.18,.9,C.blue,0,.72,0,.1);box(ch,1,1.05,.18,C.blue,0,1.29,-.45,.12);cyl(ch,.06,.06,.6,C.dark,0,.36,0);for(let j=0;j<5;j++){let a=j*1.26;const leg=box(ch,.04,.04,1,C.dark,0,.13,0);leg.rotation.y=a;sphere(ch,.075,C.dark,Math.sin(a)*.48,.08,Math.cos(a)*.48)}box(g,.9,.9,.8,C.yellow,-3.7,.5,1.7,.04);for(let i=0;i<3;i++){box(g,.8,.02,.015,'#d49b32',-3.7,.2+i*.25,2.11);box(g,.25,.03,.03,C.dark,-3.7,.33+i*.25,2.13)}const studyDog=createPoodle3D();studyDog.position.set(2.1,0,2.8);studyDog.rotation.y=-.35;g.add(studyDog);plant(g,4.2,0,-3.2,1.4);plant(g,-4.5,0,3.2,1.3);addRoomLife(g,true);return g}
export function addAvatar(g,texture,work=false){const m=new T.SpriteMaterial({map:texture,transparent:true,depthWrite:false});const s=new T.Sprite(m);s.scale.set(work?2.05:2.22,work?2.05:2.22,1);s.position.set(work?-.3:1.3,work?1.65:1.72,work?-1.42:-.45);g.add(s);return s}

// Layered, tactile furniture details. Keep the central walking lanes open.
function salonDetails(g){
 const brass=new T.MeshStandardMaterial({color:'#bd9457',metalness:.7,roughness:.28});
 const ceramic=new T.MeshPhysicalMaterial({color:'#f3eee3',roughness:.26,clearcoat:.35});
 const glass=new T.MeshPhysicalMaterial({color:'#d2e5df',transparent:true,opacity:.3,roughness:.12,depthWrite:false});
 const cord=(points,r,color)=>place(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),32,r,6,false),color,g);
 // Architectural mouldings, warm library light and cabinet panelling.
 for(const y of [.15,.25,3.86]){box(g,14.1,.045,.055,'#ece5d9',0,y,-5.59);box(g,.055,.045,11.1,'#ece5d9',-7.09,y,0)}
 for(const x of [-3.65,-2.85,-2.05,-1.25]){box(g,.045,1.3,.045,'#e9e1d4',x,1.05,-5.59)}
 box(g,3.1,.045,.045,'#e9e1d4',-2.45,.4,-5.59);box(g,3.1,.045,.045,'#e9e1d4',-2.45,1.7,-5.59);
 const glow=new T.MeshBasicMaterial({color:'#ffe2a6'});box(g,2.05,.025,.05,glow,-5.2,3.5,-4.88);
 // Piped sofa cushions and a softly draped ivory throw at the far end.
 const dinoFabric=texture((ctx,w,h)=>{
  ctx.fillStyle='#f5e8cf';ctx.fillRect(0,0,w,h);
  for(let row=0;row<5;row++)for(let col=0;col<4;col++){
   const dx=35+col*130+(row%2)*25,dy=42+row*103;
   ctx.save();ctx.translate(dx,dy);ctx.fillStyle=(row+col)%2?'#74a18b':'#d7856d';
   ctx.beginPath();ctx.ellipse(30,25,29,15,0,0,Math.PI*2);ctx.fill();
   ctx.fillRect(48,-5,8,30);ctx.beginPath();ctx.arc(52,-7,8,0,Math.PI*2);ctx.fill();
   ctx.beginPath();ctx.moveTo(5,23);ctx.lineTo(-18,8);ctx.lineTo(10,31);ctx.fill();
   ctx.fillRect(18,37,7,13);ctx.fillRect(43,37,7,13);ctx.fillStyle='#fff3da';for(let spot=0;spot<4;spot++){ctx.beginPath();ctx.arc(14+spot*10,22,2.2,0,7);ctx.fill()}ctx.fillStyle='#334d46';ctx.beginPath();ctx.arc(55,-9,1.6,0,7);ctx.fill();ctx.restore();
  }
 });
 const blanket=new T.MeshStandardMaterial({map:dinoFabric,roughness:1});
 const throwMesh=box(g,.68,.06,1.12,blanket,3.22,.98,-.42,.025);throwMesh.rotation.z=.05;
 box(g,.68,.49,.065,blanket,3.22,.72,.15,.02);for(let i=0;i<12;i++)cord([[2.91+i*.055,.5,.18],[2.92+i*.055,.38,.19]],.008,'#c9bfa9');
 const topPattern=place(new T.PlaneGeometry(.62,1.02),blanket,g,3.22,1.017,-.42);topPattern.rotation.x=-Math.PI/2;
 imagePlane(g,.62,.43,dinoFabric,3.22,.72,.186);
 // Small, all-white pedestal table between the sofa and music corner.
 mushroomTable(g,4.62,-.45);
 // A Kindle and a clear glass of water belong on this smaller table.
 const kindle=group(g,4.49,.91,-.47,-.16);kindle.name='kindle';box(kindle,.23,.023,.31,'#292c30',0,0,0,.012);box(kindle,.19,.004,.25,'#e5e1cf',0,.014,-.015);
 for(let i=0;i<5;i++)box(kindle,.17,.003,.008,'#7e827f',0,.018,-.1+i*.035);
 const waterGlass=new T.MeshPhysicalMaterial({color:'#d4edf0',transparent:true,opacity:.38,roughness:.08,depthWrite:false});
 cyl(g,.075,.067,.18,waterGlass,4.82,1.0,-.45,24);cyl(g,.064,.064,.006,'#83c7db',4.82,.985,-.45,24);
 // The brewers sit on one shallow serving tray, flush with the stone counter.
 box(g,.62,.018,2.35,'#d7b99a',-6.47,1.194,-1.64,.008);
 coffeeMethods(g);coffeeExtras(g);
 // Lounge window: softly folded linen and slim brass curtain rail.
 for(const z of [.18,3.85])for(let i=0;i<7;i++){const fold=cyl(g,.055,.065,3.0,'#eee9de',-6.88,2.0,z+i*.075,12);fold.scale.x=.6}
 const rail=cyl(g,.022,.022,4.65,brass,-6.86,3.55,2.05);rail.rotation.x=Math.PI/2;
 // A low window bench makes the left-front corner feel lived in.
 box(g,1.05,.18,2.0,C.oakLight,-6.22,.5,1.88,.04);box(g,.97,.14,1.9,'#ede5d4',-6.22,.67,1.88,.06);
 for(const z of [1.13,2.63])for(const x of [-6.6,-5.88])box(g,.07,.43,.07,C.oak,x,.25,z,.015);
 // Accents on the shelves: ceramic vases, laid books, a small hourglass.
 for(let j=0;j<3;j++){box(g,.58,.06,.38,[C.orange,C.blue,C.white][j],-4.57,1.12+j*.065,-4.96,.01)}
 cyl(g,.11,.16,.35,'#b0ba8a',-5.87,2.63,-4.93);cyl(g,.065,.11,.15,'#b0ba8a',-5.87,2.88,-4.93);
 for(let i=0;i<4;i++)cord([[-5.87,2.9,-4.93],[-5.87+Math.sin(i)*.12,3.3,-4.93+Math.cos(i)*.08]],.008,'#ac8d52');
 // Brass picture lights and warm downward pools illuminate the art wall.
 for(let i=0;i<2;i++){const x=1.3+i*2.5;box(g,.48,.045,.09,brass,x,3.8,-5.3,.015);const light=new T.PointLight('#ffdb9e',1.0,3,2);light.position.set(x,3.65,-5.15);g.add(light)}
 // Low ceramic water bowl, visibly filled, within reach of the bed.
 cyl(g,.19,.16,.075,C.white,6.7,.04,2.45,32);cyl(g,.15,.15,.006,'#8ac9dc',6.7,.082,2.45,32);
}

export function applySalonArt(g,{paintings,materials,philosopher}){
 const quadrant=(atlas,i)=>{const t=atlas.clone();t.repeat.set(.5,.5);t.offset.set(i%2*.5,i<2?.5:0);t.needsUpdate=true;return t};
 if(paintings)g.userData.artPanels.forEach((panel,i)=>{panel.material.map=quadrant(paintings,i);panel.material.needsUpdate=true});
 if(materials){
  // Isolate each swatch before wrapping: extruded furniture has UVs beyond 0–1.
  const tile=i=>{const c=document.createElement('canvas'),w=materials.image.width/2,h=materials.image.height/2;c.width=w;c.height=h;c.getContext('2d').drawImage(materials.image,i%2*w,Math.floor(i/2)*h,w,h,0,0,w,h);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=materials.anisotropy;return t};
  const wood=tile(0),blue=tile(1),linen=tile(2),stone=tile(3);
  const replacements=new Map();
  g.traverse(o=>{if(!o.isMesh||!o.material?.isMeshStandardMaterial||o.userData.refined)return;const old=o.material,key='#'+old.color.getHexString();let map,tint='#ffffff';
   if([C.oak,C.oakLight,'#ac7e4d','#b48754'].includes(key))map=wood;
   if(key===C.blue){map=linen;tint=C.blue}
   if(['#ede5d4','#eee9de',C.cream].includes(key))map=linen;
   if(key===C.yellow){map=linen;tint=C.yellow}
   if(key===C.white&&!old.map)map=stone;
   if(!map)return;
   if(!replacements.has(old)){const m=old.clone();m.color.set(tint);m.map=map;m.bumpMap=map;m.bumpScale=map===linen||map===blue?.018:.006;m.roughness=map===stone?.38:.75;replacements.set(old,m)}o.material=replacements.get(old);
  });
 }
 // The guest chair stays available for visitors; no character is placed here.
}

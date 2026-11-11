// The study ("Lo que hago"): desk, dashboard, whiteboard, real diplomas and
// small personal details, in the same palette as the salon.
import * as T from './vendor/three.module.js';

const P={wine:'#7a1f36',deep:'#5e0a24',butter:'#efd88e',butterDeep:'#d9bd62',peri:'#8fa4d6',periLight:'#c9d4f0',rose:'#e8b9b5',cream:'#f6eedc',ink:'#2f2a33',oak:'#c49663',oakLight:'#ddb58b',plum:'#5a2431'};
const cache=new Map();
function mat(color,rough=.6,metal=0){const k=color+rough+metal;if(!cache.has(k))cache.set(k,new T.MeshStandardMaterial({color,roughness:rough,metalness:metal}));return cache.get(k)}
function add(g,geo,m,x,y,z){const o=new T.Mesh(geo,typeof m==='string'?mat(m):m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;g.add(o);return o}
const box=(g,w,h,d,m,x,y,z)=>add(g,new T.BoxGeometry(w,h,d),m,x,y,z);
const cyl=(g,rt,rb,h,m,x,y,z,n=24)=>add(g,new T.CylinderGeometry(rt,rb,h,n),m,x,y,z);
const ball=(g,r,m,x,y,z)=>add(g,new T.SphereGeometry(r,20,14),m,x,y,z);
const grp=(g,x=0,y=0,z=0,ry=0)=>{const a=new T.Group();a.position.set(x,y,z);a.rotation.y=ry;g.add(a);return a};
function canvas(draw,w=512,h=512){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t}
function picture(g,w,h,map,x,y,z,ry=0){const p=add(g,new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map,roughness:.85}),x,y,z);p.rotation.y=ry;p.castShadow=false;return p}
const brass=new T.MeshStandardMaterial({color:'#c9a25e',metalness:.75,roughness:.3});
const velvet=()=>new T.MeshPhysicalMaterial({color:P.wine,roughness:.82,sheen:1,sheenColor:new T.Color('#c0486a'),sheenRoughness:.5});

/* -------------------------------------------------------------- titles */
// Sandra's real credentials (Universidad Privada Boliviana).
export const TITLES=[
 ['Licenciatura en','Ingeniería Industrial','y de Sistemas','2016 – 2020'],
 ['Master in Business Administration','Management','Analytics','2022 – 2024'],
 ['Diplomado en','Big Data &','Data Analytics','2021 – 2024'],
 ['Diplomado en','Sistemas de Información','Gerencial','2021 – 2022'],
 ['Diplomado en','Business Analytics','and Management','2021 – 2022']
];
const titleCache=[];
export function titleTexture(i){
 i%=TITLES.length;if(titleCache[i])return titleCache[i];
 const [kicker,l1,l2,years]=TITLES[i];
 return titleCache[i]=canvas((c,w,h)=>{
  c.fillStyle='#fffaf1';c.fillRect(0,0,w,h);
  c.strokeStyle='#7a1f36';c.lineWidth=6;c.strokeRect(16,16,w-32,h-32);
  c.strokeStyle='#d6b25e';c.lineWidth=2;c.strokeRect(30,30,w-60,h-60);
  c.textAlign='center';c.fillStyle='#7a6670';c.font='600 17px Georgia';c.fillText('UNIVERSIDAD PRIVADA BOLIVIANA',w/2,84);
  c.fillStyle='#d6b25e';c.fillRect(w/2-60,100,120,2);
  c.fillStyle='#5a4650';c.font='italic 22px Georgia';c.fillText(kicker,w/2,160);
  c.fillStyle='#3b2430';c.font='bold 34px Georgia';c.fillText(l1,w/2,214);c.fillText(l2,w/2,256);
  c.fillStyle='#7a6670';c.font='20px Georgia';c.fillText(years,w/2,306);
  c.strokeStyle='#bba79a';c.lineWidth=1.5;c.beginPath();c.moveTo(110,420);c.lineTo(w-110,420);c.stroke();
  // gold seal with burgundy ribbons
  c.fillStyle='#7a1f36';c.beginPath();c.moveTo(w/2-22,470);c.lineTo(w/2-36,540);c.lineTo(w/2-14,522);c.lineTo(w/2,544);c.lineTo(w/2+14,522);c.lineTo(w/2+36,540);c.lineTo(w/2+22,470);c.fill();
  c.fillStyle='#d6b25e';c.beginPath();for(let k=0;k<24;k++){const a=k/24*Math.PI*2,r=k%2?34:40;c.lineTo(w/2+Math.cos(a)*r,462+Math.sin(a)*r)}c.fill();
  c.fillStyle='#e8c870';c.beginPath();c.arc(w/2,462,24,0,7);c.fill();
 },512,620);
}
function titleFrame(g,i,x,y,z,w=.5){const h=w*620/512;box(g,w+.09,h+.09,.06,P.oak,x,y,z);box(g,w+.02,h+.02,.065,'#f3e7cf',x,y,z+.004);picture(g,w,h,titleTexture(i),x,y,z+.04)}

/* --------------------------------------------------------- floor & rug */
export function studioRug(g){
 const t=canvas((c,w,h)=>{c.fillStyle='#f3ead9';c.fillRect(0,0,w,h);
  const bands=[['#7891cc',0],['#b4c3ea',.18],['#7891cc',.36],['#e8c260',.62]];
  for(const [col,off] of bands){c.fillStyle=col;c.beginPath();c.moveTo(0,h*(.25+off));for(let x=0;x<=w;x+=8)c.lineTo(x,h*(.25+off)+Math.sin(x/w*Math.PI*2.2+off*6)*h*.07);for(let x=w;x>=0;x-=8)c.lineTo(x,h*(.25+off)+h*.09+Math.sin(x/w*Math.PI*2.2+off*6+.4)*h*.07);c.fill()}
  for(let k=0;k<2400;k++){c.fillStyle=`rgba(255,255,255,${Math.random()*.08})`;c.fillRect(Math.random()*w,Math.random()*h,2,2)}},512,512);
 const shape=new T.Shape();const rx=3.2,rz=2.25;for(let k=0;k<=72;k++){const a=k/72*Math.PI*2,r=1+.03*Math.sin(a*5);const px=Math.cos(a)*rx*r,pz=Math.sin(a)*rz*r;k?shape.lineTo(px,pz):shape.moveTo(px,pz)}
 const geo=new T.ShapeGeometry(shape,1);const pos=geo.attributes.position,uv=geo.attributes.uv;for(let k=0;k<pos.count;k++)uv.setXY(k,(pos.getX(k)+rx)/(2*rx),(pos.getY(k)+rz)/(2*rz));
 const rug=add(g,geo,new T.MeshStandardMaterial({map:t,roughness:1}),.5,.03,.75);rug.rotation.x=-Math.PI/2;rug.castShadow=false;
 const rim=add(g,new T.ShapeGeometry(shape,1),'#e8dcc4',.5,.025,.75);rim.rotation.x=-Math.PI/2;rim.scale.set(1.025,1.025,1);rim.castShadow=false;
}

/* ------------------------------------------------------------ dashboard */
function dashboardTexture(){return canvas((c,w,h)=>{
 c.fillStyle='#fbf7ef';c.fillRect(0,0,w,h);
 c.fillStyle='#7a1f36';c.fillRect(0,0,w,34);c.fillStyle='#fbf1e1';c.font='bold 17px Georgia';c.fillText('datrio · tablero',16,23);
 c.fillStyle='#efe6d6';c.fillRect(0,34,58,h);for(let k=0;k<5;k++){c.fillStyle=k?'#c9b9a8':'#7a1f36';c.fillRect(18,58+k*40,22,22)}
 const kpi=(x,col)=>{c.fillStyle='#fff';c.fillRect(x,50,128,70);c.fillStyle=col;c.fillRect(x,50,6,70);c.fillStyle='#d8cfc3';c.fillRect(x+18,64,60,8);c.fillStyle='#3b2430';c.fillRect(x+18,84,84,20)};
 kpi(74,'#7a1f36');kpi(214,'#8fa4d6');kpi(354,'#d9bd62');
 c.fillStyle='#fff';c.fillRect(74,136,268,170);
 for(let k=0;k<7;k++){c.fillStyle=k%2?'#8fa4d6':'#7a1f36';const bh=40+((k*37)%90);c.fillRect(92+k*35,286-bh,22,bh)}
 c.fillStyle='#fff';c.fillRect(354,136,128,170);
 const seg=[['#7a1f36',.42],['#efd88e',.28],['#8fa4d6',.3]];let a0=-Math.PI/2;for(const [col,f] of seg){c.fillStyle=col;c.beginPath();c.moveTo(418,214);c.arc(418,214,48,a0,a0+f*Math.PI*2);c.fill();a0+=f*Math.PI*2}
 c.fillStyle='#fff';c.beginPath();c.arc(418,214,26,0,7);c.fill();
 c.fillStyle='#fff';c.fillRect(74,320,408,170);c.strokeStyle='#7a1f36';c.lineWidth=4;c.beginPath();
 [[90,460],[150,430],[210,445],[270,395],[330,405],[390,360],[460,345]].forEach(([x,y],k)=>k?c.lineTo(x,y):c.moveTo(x,y));c.stroke();
 c.strokeStyle='#8fa4d6';c.setLineDash([8,6]);c.beginPath();[[90,470],[150,455],[210,450],[270,430],[330,420],[390,400],[460,390]].forEach(([x,y],k)=>k?c.lineTo(x,y):c.moveTo(x,y));c.stroke();c.setLineDash([]);
},512,512)}

/* ----------------------------------------------------------------- desk */
export function studioDesk(g){
 const d=grp(g,0,0,0);d.name='study-desk';
 // Oak top on burgundy hairpin legs, with a fluted butter drawer unit.
 box(d,4.6,.1,1.7,P.oakLight,.6,1.3,.15);box(d,4.64,.035,1.74,P.oak,.6,1.24,.15);
 const legM=mat(P.deep,.4,.3);
 for(const x of [-1.55,2.75])for(const z of [-.55,.85]){for(const s of [-1,1]){const leg=cyl(d,.018,.018,1.26,legM,x+s*.06,.63,z,8);leg.rotation.z=s*.05}}
 const drawer=grp(d,-1.05,0,.15);box(drawer,.9,1.05,1.4,P.butter,0,.62,0);
 for(let k=0;k<9;k++)cyl(drawer,.026,.026,.98,P.butterDeep,-.38+k*.095,.62,.71,8);
 for(const y of [.95,.62,.29])box(drawer,.18,.035,.04,brass,0,y,.73);
 // Wide monitor with a datrio dashboard, on a slim brass arm.
 const mon=grp(d,1.3,0,-.45);box(mon,1.75,1.0,.07,P.ink,0,2.1,0);
 const scr=add(mon,new T.PlaneGeometry(1.63,.9),new T.MeshBasicMaterial({map:dashboardTexture()}),0,2.1,.04);scr.castShadow=false;
 cyl(mon,.025,.025,.6,brass,0,1.58,-.06,10);box(mon,.42,.03,.28,brass,0,1.37,-.02);
 // Laptop, keyboard, mouse.
 const lap=grp(d,-.25,1.36,.35,.12);box(lap,.86,.025,.58,'#c9ccd2',0,0,0);
 const lid=box(lap,.86,.56,.02,'#c9ccd2',0,.27,-.29);lid.rotation.x=-.25;
 const ls=add(lap,new T.PlaneGeometry(.78,.48),new T.MeshBasicMaterial({map:canvas((c,w,h)=>{c.fillStyle='#f6efe2';c.fillRect(0,0,w,h);c.fillStyle='#7a1f36';c.fillRect(0,0,w,40);for(let k=0;k<6;k++){c.fillStyle=['#8fa4d6','#efd88e','#e8b9b5'][k%3];c.fillRect(30+(k%3)*155,70+Math.floor(k/3)*150,130,120)}},512,320)}),0,.27,-.275);ls.rotation.x=-.25;ls.castShadow=false;
 box(d,.95,.03,.3,'#efe7da',1.3,1.37,.35);for(let k=0;k<4;k++)box(d,.85,.008,.04,'#d8cfc0',1.3,1.388,.24+k*.07);
 ball(d,.055,'#efe7da',1.95,1.38,.4).scale.set(1,.5,1.4);
 // Open notebook with sticky notes and a pen.
 const nb=grp(d,.45,1.36,.62,-.18);box(nb,.32,.012,.44,'#fffaf1',-.165,0,0);box(nb,.32,.012,.44,'#fffaf1',.165,0,0);box(nb,.02,.016,.44,P.wine,0,0,0);
 for(let k=0;k<6;k++)box(nb,.24,.003,.008,'#c9bfb3',-.165,.008,-.15+k*.06);
 const pen=cyl(d,.01,.01,.26,P.wine,.75,1.375,.55,8);pen.rotation.z=Math.PI/2;pen.rotation.y=.4;
 for(const [x,z,col,r] of [[2.15,-.05,P.butter,.2],[2.35,.0,P.rose,-.15],[2.2,.18,P.periLight,.1],[-.75,.75,P.butter,-.2]]){const s=box(d,.2,.006,.2,col,x,1.36,z);s.rotation.y=r}
 // Butter dome desk lamp on a brass arm.
 const lamp=grp(d,-.95,1.35,-.35);cyl(lamp,.14,.16,.04,P.ink,0,.02,0);
 const arm1=cyl(lamp,.014,.014,.7,brass,.12,.36,0,8);arm1.rotation.z=-.35;const arm2=cyl(lamp,.014,.014,.55,brass,.36,.78,.05,8);arm2.rotation.z=.9;
 const shade=add(lamp,new T.SphereGeometry(.2,24,12,0,Math.PI*2,0,Math.PI/2),new T.MeshStandardMaterial({color:P.butter,roughness:.5,side:T.DoubleSide}),.58,.72,.08);shade.rotation.z=-.5;
 ball(lamp,.07,new T.MeshBasicMaterial({color:'#fff1c4'}),.62,.66,.08);
 // Mug (the room-life steam sits above it) and a pencil cup.
 cyl(d,.1,.085,.19,P.wine,2.35,1.45,.65);cyl(d,.082,.082,.007,'#473222',2.35,1.545,.65);
 const handle=add(d,new T.TorusGeometry(.055,.016,6,14),P.wine,2.45,1.46,.65);handle.rotation.y=Math.PI/2;
 cyl(d,.06,.055,.16,P.peri,-.7,1.43,-.45);for(let k=0;k<4;k++){const pc=cyl(d,.008,.008,.22,[P.butter,P.wine,P.rose,P.ink][k],-.7+Math.cos(k*1.6)*.025,1.56,-.45+Math.sin(k*1.6)*.025,6);pc.rotation.z=(k-1.5)*.08}
 // Little framed photo of Puyol on the desk.
 const pf=grp(d,2.05,1.36,-.5,-.35);box(pf,.26,.32,.03,P.oak,0,.16,0);const pp=box(pf,.21,.27,.005,'#fff',0,.16,.018);puyolPhoto(pp,'art/puyol/puyol-1.webp');
 const prop=box(pf,.03,.3,.02,P.oak,0,.15,-.07);prop.rotation.x=.4;
}
function puyolPhoto(mesh,src){if(typeof window==='undefined')return;new T.TextureLoader().load(new URL('./'+src,import.meta.url).href,t=>{t.colorSpace=T.SRGBColorSpace;mesh.material=new T.MeshStandardMaterial({map:t,roughness:.6})})}

/* ---------------------------------------------------------------- chair */
export function studioChair(g){
 const ch=grp(g,-.3,0,-1.4);ch.name='study-chair';const v=velvet();
 add(ch,new T.CapsuleGeometry(.36,.4,6,16),v,0,.76,0).rotation.z=Math.PI/2;
 const back=add(ch,new T.CapsuleGeometry(.34,.5,6,16),v,0,1.32,-.38);back.scale.set(1,1,.42);
 for(const s of [-1,1]){box(ch,.06,.04,.42,P.ink,s*.46,.98,-.02);box(ch,.04,.2,.04,P.ink,s*.46,.86,-.12)}
 cyl(ch,.05,.05,.5,'#cfc8c0',0,.42,0,12);cyl(ch,.09,.09,.08,P.ink,0,.64,0,12);
 for(let k=0;k<5;k++){const a=k/5*Math.PI*2;const leg=box(ch,.06,.05,.5,P.ink,Math.sin(a)*.24,.14,Math.cos(a)*.24);leg.rotation.y=a;ball(ch,.055,P.ink,Math.sin(a)*.48,.06,Math.cos(a)*.48)}
}

/* ----------------------------------------------------------- whiteboard */
function boardTexture(){return canvas((c,w,h)=>{
 c.fillStyle='#fdfcf8';c.fillRect(0,0,w,h);
 c.strokeStyle='#7a1f36';c.lineWidth=4;c.lineJoin='round';
 const node=(x,y,t)=>{c.strokeRect(x,y,120,52);c.fillStyle='#7a1f36';c.font='italic 22px Georgia';c.textAlign='center';c.fillText(t,x+60,y+34)};
 const arrow=(x1,y1,x2,y2)=>{c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();const a=Math.atan2(y2-y1,x2-x1);c.beginPath();c.moveTo(x2,y2);c.lineTo(x2-12*Math.cos(a-.4),y2-12*Math.sin(a-.4));c.moveTo(x2,y2);c.lineTo(x2-12*Math.cos(a+.4),y2-12*Math.sin(a+.4));c.stroke()};
 node(30,40,'datos');node(210,40,'preguntas');node(390,40,'decisiones');arrow(152,66,206,66);arrow(332,66,386,66);arrow(450,96,450,140);
 c.globalAlpha=.55;for(const [col,x] of [['#8fa4d6',110],['#efd88e',170],['#e8b9b5',140]]){c.fillStyle=col;c.beginPath();c.arc(x,x===140?250:215,62,0,7);c.fill()}c.globalAlpha=1;
 c.fillStyle='#3b2430';c.font='bold 20px Georgia';c.textAlign='center';c.fillText('BI',140,232);
 c.strokeStyle='#3b2430';c.lineWidth=3;c.beginPath();c.moveTo(300,330);c.lineTo(300,170);c.moveTo(300,330);c.lineTo(490,330);c.stroke();
 for(let k=0;k<5;k++){c.fillStyle=k%2?'#8fa4d6':'#7a1f36';const bh=40+k*24;c.fillRect(315+k*34,328-bh,22,bh)}
 c.strokeStyle='#d9a43d';c.lineWidth=4;c.beginPath();c.moveTo(320,250);c.quadraticCurveTo(400,170,480,160);c.stroke();
 c.fillStyle='#7a1f36';c.font='italic 30px Georgia';c.textAlign='left';c.fillText('datos → decisiones',40,410);
 c.fillStyle='#7a6670';c.font='italic 20px Georgia';c.fillText('¿y si preguntamos distinto?',40,450);
 for(const [x,y,col,r] of [[400,380,'#efd88e',-.08],[455,420,'#e8b9b5',.06],[405,445,'#c9d4f0',.1]]){c.save();c.translate(x,y);c.rotate(r);c.fillStyle=col;c.fillRect(-26,-24,52,48);c.restore()}
},512,512)}
export function studioWhiteboard(g){
 const wb=grp(g,2.7,0,-4.0);wb.name='study-whiteboard';
 box(wb,3.0,1.95,.06,P.oak,0,2.55,0);picture(wb,2.86,1.81,boardTexture(),0,2.55,.04);
 box(wb,2.9,.05,.16,P.oak,0,1.56,.08);
 for(let k=0;k<4;k++){const mk=cyl(wb,.018,.018,.16,[P.wine,P.peri,P.butterDeep,P.ink][k],-.5+k*.22,1.6,.1,8);mk.rotation.z=Math.PI/2}
 box(wb,.12,.08,.06,'#e6dccd',.7,1.61,.1);
}

/* -------------------------------------------------------- diploma wall */
export function diplomaWall(g){
 const wall=grp(g,0,0,-4.02);wall.name='study-diplomas';
 [-1.8,-1.2,-.6,0,.6].forEach((x,i)=>titleFrame(wall,i,x,i%2?3.0:3.12,0,.5));
 box(wall,2.9,.04,.08,brass,-.6,3.62,.08);
}

/* ------------------------------------------------------------ corkboard */
export function corkboard(g){
 const cb=grp(g,-5.0,0,-2.0,Math.PI/2);cb.name='study-corkboard';
 const cork=canvas((c,w,h)=>{c.fillStyle='#c9a07a';c.fillRect(0,0,w,h);for(let k=0;k<5000;k++){c.fillStyle=Math.random()<.5?'#b88d66':'#d8b58e';c.fillRect(Math.random()*w,Math.random()*h,2,2)}
  for(const [x,y,col,r,lines] of [[60,60,'#efd88e',-.06,3],[250,50,'#e8b9b5',.05,2],[330,250,'#c9d4f0',-.04,3],[70,280,'#fffaf1',.03,4]]){c.save();c.translate(x,y);c.rotate(r);c.fillStyle=col;c.fillRect(0,0,150,130);c.fillStyle='#7a6670';for(let k=0;k<lines;k++)c.fillRect(16,30+k*24,110-k*14,5);c.fillStyle='#7a1f36';c.beginPath();c.arc(75,10,8,0,7);c.fill();c.restore()}
 },512,420);
 box(cb,1.7,1.25,.05,P.oak,0,2.45,0);picture(cb,1.6,1.15,cork,0,2.45,.03);
 const ph=box(cb,.34,.42,.008,'#fff',.42,2.62,.035);ph.rotation.z=.08;puyolPhoto(ph,'art/puyol/puyol-5.webp');
 ball(cb,.025,P.wine,.42,2.85,.05);
}

/* ---------------------------------------------------------------- cart */
export function rollingCart(g){
 const cart=grp(g,-3.75,0,1.65,.3);cart.name='study-cart';const m=mat(P.butter,.45,.1);
 for(const y of [.25,.62,.99]){box(cart,.82,.04,.56,m,0,y,0);box(cart,.82,.12,.03,m,0,y+.06,.27);box(cart,.82,.12,.03,m,0,y+.06,-.27);box(cart,.03,.12,.56,m,.4,y+.06,0);box(cart,.03,.12,.56,m,-.4,y+.06,0)}
 for(const x of [-.39,.39])for(const z of [-.26,.26]){cyl(cart,.016,.016,.95,m,x,.6,z,8);ball(cart,.045,P.ink,x,.06,z)}
 for(let k=0;k<4;k++){const b=box(cart,.06,.28,.22,[P.wine,P.peri,P.rose,P.oak][k],-.25+k*.08,.4,0);b.rotation.z=k===3?.3:0}
 cyl(cart,.12,.1,.18,P.cream,.18,1.1,0);for(let k=0;k<6;k++){const lf=ball(cart,.07,'#6d964e',.18+Math.cos(k)*.07,1.27+(k%3)*.04,Math.sin(k)*.07);lf.scale.set(.7,1.2,.7)}
 box(cart,.5,.05,.36,P.cream,.05,.68,0);box(cart,.46,.05,.34,P.peri,.05,.73,0);
}

/* ----------------------------------------------------------- Puyol's bed */
export function studyBed(g){
 const bed=grp(g,3.35,0,2.55);bed.name='study-bed';
 cyl(bed,.55,.57,.12,'#5e1624',0,.07,0,40);
 const ring=add(bed,new T.TorusGeometry(.48,.16,16,40),new T.MeshPhysicalMaterial({color:'#7a1f36',roughness:.85,sheen:1,sheenColor:new T.Color('#c0486a')}),0,.2,0);ring.rotation.x=Math.PI/2;
 cyl(bed,.42,.42,.08,'#e8b9b5',0,.17,0,32);
}

/* ------------------------------------------------- pouf and floor lamp */
export function studyCorner(g){
 const pouf=grp(g,-2.55,0,3.0);pouf.name='study-pouf';
 const p=add(pouf,new T.SphereGeometry(.42,32,20),velvet(),0,.3,0);p.scale.set(1,.62,1);
 const top=add(pouf,new T.TorusGeometry(.2,.035,8,24),mat(P.deep),0,.53,0);top.rotation.x=Math.PI/2;
 const fl=grp(g,4.55,0,-1.6);fl.name='study-floor-lamp';
 cyl(fl,.2,.24,.05,P.ink,0,.03,0);cyl(fl,.018,.018,2.1,brass,0,1.08,0,10);
 const sh=cyl(fl,.22,.36,.42,new T.MeshStandardMaterial({color:P.butter,roughness:.7,side:T.DoubleSide}),0,2.2,0,28);sh.material.transparent=false;
 ball(fl,.07,new T.MeshBasicMaterial({color:'#fff1c4'}),0,2.08,0);
 const glow=new T.PointLight('#ffdca0',.8,4,2);glow.position.set(0,2.0,0);fl.add(glow);
}

// The three themed corners of the salon: the coffee bar, the class toolbox
// by the window and the music console. Everything sits inside the areas
// Puyol already walks around (walk.js obstacles), so routes stay the same.
import * as T from './vendor/three.module.js';

const cache=new Map();
function mat(color,rough=.6,metal=0){const k=color+rough+metal;if(!cache.has(k))cache.set(k,new T.MeshStandardMaterial({color,roughness:rough,metalness:metal}));return cache.get(k)}
function add(g,geo,m,x,y,z){const o=new T.Mesh(geo,typeof m==='string'?mat(m):m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;g.add(o);return o}
const box=(g,w,h,d,m,x,y,z)=>add(g,new T.BoxGeometry(w,h,d),m,x,y,z);
const cyl=(g,rt,rb,h,m,x,y,z,n=24)=>add(g,new T.CylinderGeometry(rt,rb,h,n),m,x,y,z);
const ball=(g,r,m,x,y,z)=>add(g,new T.SphereGeometry(r,20,14),m,x,y,z);
const tube=(g,pts,r,m)=>add(g,new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(p=>new T.Vector3(...p))),24,r,8,false),m,0,0,0);
function canvas(draw,w=512,h=512){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t}
// A picture on a plane; ry turns it to face the room (left wall faces +x).
function picture(g,w,h,map,x,y,z,ry=0,basic=false){const m=basic?new T.MeshBasicMaterial({map,transparent:true,depthWrite:false}):new T.MeshStandardMaterial({map,roughness:.9});const p=add(g,new T.PlaneGeometry(w,h),m,x,y,z);p.rotation.y=ry;if(basic)p.castShadow=false;return p}

const P={butter:'#efd88e',butterDeep:'#d9bd62',peri:'#8fa4d6',periLight:'#c9d4f0',plum:'#5a2431',berry:'#7a3544',rose:'#e8b9b5',cream:'#f6eedc',ink:'#2f2a33',oak:'#c49663'};
const chrome=new T.MeshStandardMaterial({color:'#e4e6ea',metalness:.9,roughness:.18});
const brass=new T.MeshStandardMaterial({color:'#c9a25e',metalness:.75,roughness:.3});
const glass=new T.MeshPhysicalMaterial({color:'#eef6f6',transparent:true,opacity:.28,roughness:.05,depthWrite:false});
const bulb=new T.MeshBasicMaterial({color:'#ffe7b0'});

function marble(){return canvas((c,w,h)=>{c.fillStyle='#f7f4ee';c.fillRect(0,0,w,h);for(let i=0;i<14;i++){c.strokeStyle=i%3?'#c9c3ba55':'#b9a98f66';c.lineWidth=i%4?1:2.2;c.beginPath();let x=Math.random()*w,y=0;c.moveTo(x,y);while(y<h){x+=(Math.random()-.5)*40;y+=18;c.lineTo(x,y)}c.stroke()}})}

/* ---------------------------------------------------------------- café */
// The bar keeps the old footprint: x -6.98..-5.955, z -4.725..-.375, top at y 1.195,
// so the stool, the AeroPress and Puyol's paw targets still line up.
export function coffeeBar(g){
 const bar=new T.Group();bar.name='coffee-bar';g.add(bar);
 const x=-6.47,z=-2.55,front=-5.955;
 box(bar,1.03,1.02,4.35,P.butter,x,.59,z);
 box(bar,.98,.12,4.3,'#4a3a33',x-.03,.06,z);
 // Fluted front, a thin brass trim line and a foot rail on three brackets.
 for(let k=0;k<70;k++){const r=cyl(bar,.022,.022,.86,P.butterDeep,front+.004,.62,-4.66+k*.0615,10);r.scale.z=.55}
 box(bar,.02,.025,4.35,brass,front+.03,1.07,z);box(bar,.02,.025,4.35,brass,front+.03,.17,z);
 const rail=cyl(bar,.024,.024,4.2,brass,front+.17,.24,z,14);rail.rotation.x=Math.PI/2;
 for(const rz of [-4.4,-2.55,-.7]){box(bar,.17,.025,.03,brass,front+.085,.24,rz)}
 const top=box(bar,1.15,.09,4.5,new T.MeshStandardMaterial({map:marble(),roughness:.25}),x,1.15,z);top.userData.refined=true;

 // Espresso machine with two group heads facing the room.
 const m=new T.Group();m.position.set(-6.72,1.195,-4.12);bar.add(m);
 for(const fx of [-.2,.2])for(const fz of [-.3,.3])cyl(m,.025,.03,.05,chrome,fx,.025,fz,10);
 box(m,.5,.36,.72,P.peri,0,.23,0).material=new T.MeshStandardMaterial({color:P.peri,roughness:.35,metalness:.15});
 box(m,.52,.025,.74,chrome,0,.42,0);
 for(const rz of [-.36,.36])box(m,.5,.05,.012,chrome,0,.46,rz);for(const rx of [-.25,.25])box(m,.012,.05,.72,chrome,rx,.46,0);
 for(const [i,cz] of [-.2,0,.2].entries()){cyl(m,.04,.032,.055,i===1?P.rose:'#fffaf1',-.08,.46,cz,14)}
 box(m,.02,.07,.4,brass,.256,.33,0);
 for(const s of [-1,1]){const gz=s*.19;
  cyl(m,.06,.06,.07,chrome,.3,.17,gz);cyl(m,.052,.048,.04,chrome,.3,.115,gz);
  const handle=cyl(m,.017,.02,.2,'#2b2526',.43,.11,gz,10);handle.rotation.z=Math.PI/2;
  cyl(m,.03,.025,.04,'#fffaf1',.3,.045,gz,14);
  const face=add(m,new T.CircleGeometry(.042,24),mat('#fbf7ef',.4),.252,.3,gz*.45);face.rotation.y=Math.PI/2;
  const rim=add(m,new T.TorusGeometry(.044,.006,6,24),chrome,.253,.3,gz*.45);rim.rotation.y=Math.PI/2;
  const needle=box(m,.003,.032,.004,'#7a3544',.256,.31,gz*.45);needle.rotation.x=s*.6;
 }
 box(m,.24,.025,.7,chrome,.33,.012,0);for(let k=0;k<9;k++)box(m,.22,.004,.012,'#9aa0a8',.33,.027,-.3+k*.075);
 tube(bar,[[-6.47,1.52,-3.8],[-6.38,1.48,-3.76],[-6.32,1.33,-3.72]],.009,chrome);
 cyl(bar,.045,.04,.11,chrome,-6.3,1.25,-3.66,16);
 cyl(bar,.065,.06,.11,'#2b2526',-6.18,1.25,-4.55,16);
 // Burr grinder with a glass hopper full of beans.
 box(bar,.2,.3,.22,P.ink,-6.76,1.345,-3.5).material=new T.MeshStandardMaterial({color:P.ink,roughness:.4,metalness:.3});
 cyl(bar,.1,.05,.22,glass,-6.76,1.62,-3.5,18);cyl(bar,.085,.045,.15,'#4a2e20',-6.76,1.6,-3.5,14);cyl(bar,.105,.105,.02,P.ink,-6.76,1.735,-3.5,18);
 box(bar,.05,.05,.07,chrome,-6.64,1.4,-3.5);cyl(bar,.05,.045,.07,'#fffaf1',-6.6,1.23,-3.5,14);
 // Matcha bowl and bamboo whisk join the pour-over tray.
 const bowl=add(bar,new T.SphereGeometry(.085,20,10,0,Math.PI*2,Math.PI/2,Math.PI/2),mat(P.rose,.35),-6.42,1.29,-1.38);bowl.material.side=T.DoubleSide;
 const tea=add(bar,new T.CircleGeometry(.075,20),mat('#7fa548',.5),-6.42,1.275,-1.38);tea.rotation.x=-Math.PI/2;
 cyl(bar,.025,.035,.08,'#d8c08f',-6.62,1.25,-1.38,10);

 // Wall: a chalk menu between two pendant lamps.
 const menu=canvas((c,w,h)=>{c.fillStyle='#2e3431';c.fillRect(0,0,w,h);for(let i=0;i<3000;i++){c.fillStyle='#ffffff08';c.fillRect(Math.random()*w,Math.random()*h,2,2)}
  c.textAlign='center';c.fillStyle='#f6eedc';c.font='italic 600 64px Georgia';c.fillText('Café de Puyol',w/2,92);
  c.strokeStyle='#efd88e';c.lineWidth=3;c.beginPath();c.moveTo(w*.22,118);c.lineTo(w*.78,118);c.stroke();
  const items=[['Espresso · Cortado','☕'],['V60 · Chemex','✿'],['Sifón · Moka','☁'],['AeroPress · Prensa','★'],['Matcha latte','❀'],['Usucha · Koicha','❀']];
  c.font='34px Georgia';items.forEach(([t,s],i)=>{const col=i%2,row=Math.floor(i/2),cx=w*(.27+col*.46),cy=178+row*62;c.fillStyle=i%3===0?'#efd88e':i%3===1?'#c9d4f0':'#e8b9b5';c.fillText(s+' '+t,cx,cy)});
  c.fillStyle='#f6eedc';c.font='italic 30px Georgia';c.fillText('+ cuñapés recién horneados',w/2,h-38)},768,460);
 box(g,.05,1.04,1.78,P.oak,-7.03,3.3,-2.4);picture(g,1.66,.94,menu,-7.0,3.3,-2.4,Math.PI/2);
 for(const pz of [-3.95,-.95]){cyl(g,.006,.006,.95,P.ink,-6.45,3.6,pz,6);
  const shade=add(g,new T.SphereGeometry(.17,24,12,0,Math.PI*2,0,Math.PI/2),mat(P.butter,.45),-6.45,3.02,pz);shade.material.side=T.DoubleSide;
  cyl(g,.03,.03,.06,brass,-6.45,3.16,pz,12);ball(g,.06,bulb,-6.45,2.99,pz).castShadow=false;}
 const warm=new T.PointLight('#ffd9a0',.8,3.2,2);warm.position.set(-6.3,2.7,-2.4);g.add(warm);

 // Floating oak shelf: bean jars, the cuñapé dome and hanging mugs.
 box(g,.5,.05,4.1,P.oak,-6.81,2.5,-2.6);
 for(const sz of [-4.3,-2.6,-.9])box(g,.4,.03,.03,brass,-6.86,2.44,sz);
 for(const [i,jz] of [-4.1,-3.75,-3.4].entries()){cyl(g,.09,.09,.24,glass,-6.82,2.645,jz,16);cyl(g,.08,.08,.18,'#4a2e20',-6.82,2.615,jz,14);cyl(g,.092,.092,.04,P.oak,-6.82,2.785,jz,16);box(g,.012,.07,.1,[P.butter,P.peri,P.rose][i],-6.73,2.65,jz)}
 cyl(g,.2,.2,.02,'#fffaf1',-6.82,2.535,-1.75,28);cyl(g,.035,.05,.06,'#fffaf1',-6.82,2.555,-1.75,12);
 for(let i=0;i<5;i++){const a=i*Math.PI*2/5;const b=ball(g,.05,i%2?'#d8a766':'#edc88b',-6.82+Math.cos(a)*.1,2.62,-1.75+Math.sin(a)*.1);b.scale.y=.7}
 add(g,new T.SphereGeometry(.17,24,12,0,Math.PI*2,0,Math.PI/2),glass,-6.82,2.58,-1.75);ball(g,.02,brass,-6.82,2.76,-1.75);
 for(let i=0;i<4;i++){const hz=-1.15+i*.17,c=[P.peri,P.butter,P.rose,'#fffaf1'][i];
  box(g,.01,.04,.01,brass,-6.72,2.455,hz);cyl(g,.045,.04,.09,c,-6.72,2.39,hz,14);
  const h=add(g,new T.TorusGeometry(.028,.008,6,12),mat(c,.4),-6.72,2.42,hz+.045);h.rotation.y=Math.PI/2;}
}

/* --------------------------------------------------- class toolbox corner */
// Rests on the window bench (top of the cushion at y .74, x -6.75..-5.7, z .88..2.88).
export function teachingCorner(g){
 const kit=new T.Group();kit.name='teaching-toolbox';kit.position.set(-6.22,.74,1.3);g.add(kit);
 const tin=new T.MeshStandardMaterial({color:P.berry,roughness:.35,metalness:.35});
 // Open cantilever toolbox: a body and two trays fanned out on brass arms.
 box(kit,.62,.3,.4,tin,0,.15,0);box(kit,.56,.02,.34,'#3a1a22',0,.29,0);
 for(const [s,y,dz] of [[-1,.36,-.2],[1,.44,.2]]){
  box(kit,.6,.08,.19,tin,0,y,dz);box(kit,.56,.012,.16,P.cream,0,y+.035,dz);
  for(const ax of [-.285,.285]){const dy=y-.03-.27,len=Math.hypot(dy,dz),arm=box(kit,.012,.014,len,brass,ax,.27+dy/2,dz/2);arm.rotation.x=Math.atan2(-dy,dz)}
  for(let k=0;k<7;k++){const mk=cyl(kit,.013,.013,.13,[P.peri,P.butter,P.rose,'#7fa548','#5f7fc4','#e08b6d',P.plum][k],-.21+k*.07,y+.06,dz,8);mk.rotation.x=Math.PI/2}
 }
 for(let k=0;k<6;k++)cyl(kit,.009,.009,.14,['#e5574f','#f0b43c','#5f7fc4','#7fa548','#b56bb5','#f08a4b'][k],-.15+k*.05,.36,.0,8);
 const ruler=box(kit,.5,.01,.05,P.butter,.0,.315,-.09);ruler.rotation.y=.1;
 for(const s of [-1,1])box(kit,.04,.03,.02,brass,s*.2,.25,.205);
 // Desk globe on a brass meridian.
 const globeMap=canvas((c,w,h)=>{c.fillStyle='#7891cc';c.fillRect(0,0,w,h);c.fillStyle='#f0d37a';let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;for(const [x,y,rx,ry] of [[.18,.35,.09,.12],[.24,.62,.05,.13],[.48,.3,.06,.08],[.52,.55,.05,.12],[.7,.32,.13,.09],[.8,.68,.05,.05],[.33,.9,.2,.03]])for(let k=0;k<9;k++){c.beginPath();c.ellipse((x+(rnd()-.5)*rx*1.4)*w,(y+(rnd()-.5)*ry*1.4)*h,rx*w*(.35+rnd()*.4),ry*h*(.35+rnd()*.4),rnd()*3,0,7);c.fill()}c.strokeStyle='#ffffff44';c.lineWidth=2;for(let i=1;i<6;i++){c.beginPath();c.moveTo(0,i*h/6);c.lineTo(w,i*h/6);c.stroke()}},512,256);
 const globe=new T.Group();globe.position.set(-6.3,.74,2.05);g.add(globe);
 cyl(globe,.1,.12,.03,brass,0,.015,0);cyl(globe,.015,.015,.12,brass,0,.09,0);
 const tilt=new T.Group();tilt.position.y=.31;tilt.rotation.z=.41;globe.add(tilt);
 const earth=add(tilt,new T.SphereGeometry(.15,32,20),new T.MeshStandardMaterial({map:globeMap,roughness:.5}),0,0,0);
 const meridian=add(tilt,new T.TorusGeometry(.17,.008,6,32,Math.PI),brass,0,0,0);meridian.rotation.set(0,Math.PI/2,Math.PI/2);
 g.userData.globe=earth;
 // A little chalkboard leaning on the window.
 const chalk=canvas((c,w,h)=>{c.fillStyle='#2e3431';c.fillRect(0,0,w,h);c.textAlign='center';c.fillStyle='#f6eedc';c.font='italic 600 58px Georgia';c.fillText('¡A probar!',w/2,92);c.font='32px Georgia';c.fillStyle='#efd88e';c.fillText('idea → prueba → ¡ajá!',w/2,160);
  c.strokeStyle='#c9d4f0';c.lineWidth=4;c.beginPath();c.arc(w*.5,236,30,Math.PI*.85,Math.PI*2.15);c.stroke();c.strokeRect(w*.5-12,262,24,16);for(let i=0;i<5;i++){const a=-Math.PI*.9+i*Math.PI*.2;c.beginPath();c.moveTo(w*.5+Math.cos(a)*42,236+Math.sin(a)*42);c.lineTo(w*.5+Math.cos(a)*56,236+Math.sin(a)*56);c.stroke()}},512,320);
 const board=new T.Group();board.position.set(-6.62,.74,2.62);board.rotation.z=.12;g.add(board);
 box(board,.04,.48,.68,P.oak,0,.24,0);picture(board,.6,.4,chalk,.022,.25,0,Math.PI/2);
 box(board,.07,.02,.6,P.oak,.04,.02,0);for(let k=0;k<3;k++){const st=cyl(board,.008,.008,.06,'#fffaf1',.05,.04,-.15+k*.08,6);st.rotation.x=Math.PI/2}
 // Books with an apple for the teacher, and a cup of pencils.
 for(const [i,c] of [P.plum,P.peri,P.butter].entries()){const b=box(g,.3,.05,.22,c,-5.97,.765+i*.05,2.05);b.rotation.y=i*.18-.1}
 ball(g,.06,new T.MeshStandardMaterial({color:'#c8443f',roughness:.35}),-5.97,.95,2.05).scale.y=.92;
 cyl(g,.006,.006,.04,'#5a3a24',-5.97,1.02,2.05,6);const leaf=ball(g,.025,'#6d964e',-5.95,1.02,2.06);leaf.scale.set(1,.3,.5);
 cyl(g,.05,.045,.12,P.peri,-5.92,.8,.98,16);for(let k=0;k<5;k++){const a=k*1.3,p=cyl(g,.007,.007,.2,P.butter,-5.92+Math.cos(a)*.022,.9,.98+Math.sin(a)*.022,6);p.rotation.set(Math.sin(a)*.12,0,Math.cos(a)*.12);cyl(g,.007,.007,.015,P.rose,-5.92+Math.cos(a)*.034,1.0,.98+Math.sin(a)*.034,6)}
 // Pennant garland over the window.
 const pts=[];for(let i=0;i<=12;i++){const t=i/12;pts.push([-6.95,3.38-Math.sin(t*Math.PI)*.22,.45+t*3.1])}
 tube(g,pts,.005,mat('#d8c08f'));
 for(let i=0;i<11;i++){const t=(i+.5)/12,y=3.38-Math.sin(t*Math.PI)*.22,pz=.45+t*3.1;
  const flag=add(g,new T.ConeGeometry(.085,.2,3),mat([P.butter,P.peri,P.rose,P.berry][i%4],.8),-6.95,y-.1,pz);flag.rotation.set(Math.PI,0,0);flag.scale.x=.15}
}

/* ------------------------------------------------------------ music */
// Console footprint x 1.65..5.35, z -5.4..-4.65; record crate stays in front (to z -4.17).
export function musicCorner(g){
 const mc=new T.Group();mc.name='music-corner';g.add(mc);
 const z=-5.02;
 // Mid-century credenza on tapered legs: fluted doors left and right, records in the middle.
 box(mc,3.7,.05,.72,P.oak,3.5,.975,z);box(mc,3.7,.05,.72,P.oak,3.5,.265,z);for(const ex of [1.675,2.95,4.05,5.325])box(mc,.05,.66,.72,P.oak,ex,.62,z);box(mc,3.7,.66,.03,'#3a2a26',3.5,.62,z-.345);
 box(mc,1.08,.03,.66,P.oak,3.5,.62,z);
 for(const lx of [1.8,5.2])for(const lz of [z-.26,z+.26]){const l=cyl(mc,.03,.018,.24,P.ink,lx,.12,lz,10);l.rotation.z=(lx<3?1:-1)*.12}
 for(const [x0,x1] of [[1.72,2.92],[4.08,5.28]]){box(mc,x1-x0+.04,.64,.03,P.peri,(x0+x1)/2-.02,.62,z+.345);for(let xx=x0;xx<x1;xx+=.055){const f=cyl(mc,.02,.02,.62,'#9fb2de',xx,.62,z+.365,8);f.scale.z=.5}
  box(mc,.015,.1,.015,brass,x1-.06,.66,z+.39);}
 for(let k=0;k<12;k++){const s=box(mc,.014,.27,.3,[P.peri,P.butter,P.rose,P.plum,P.cream,'#7fa548'][k%6],3.05+k*.075,.43,z+.05);s.rotation.z=(k%4-1.5)*.04}
 for(let k=0;k<3;k++)box(mc,.32-k*.03,.04,.3,[P.berry,P.butter,P.peri][k],3.3+k*.02,.66+k*.04,z+.05);cyl(mc,.05,.05,.12,P.rose,3.85,.7,z+.05,14);
 // Amplifier with glowing VU meters.
 const amp=new T.Group();amp.position.set(2.55,1.0,z+.02);mc.add(amp);
 box(amp,.6,.16,.38,new T.MeshStandardMaterial({color:'#dcd3c2',metalness:.6,roughness:.3}),0,.08,0);
 const vu=canvas((c,w,h)=>{c.fillStyle='#ffe7a8';c.fillRect(0,0,w,h);c.strokeStyle='#5a2431';c.lineWidth=3;c.beginPath();c.arc(w/2,h*1.1,h*.9,Math.PI*1.2,Math.PI*1.8);c.stroke();c.fillStyle='#7a3544';c.font='bold 22px sans-serif';c.textAlign='center';c.fillText('VU',w/2,h*.85)},128,64);
 for(const vx of [-.15,.0]){picture(amp,.12,.06,vu,vx-.0,.1,.191,0,true);const n=box(amp,.003,.05,.003,'#5a2431',vx,.09,.193);n.rotation.z=.4;n.userData.vu=true}
 for(let k=0;k<3;k++){const kb=cyl(amp,.022,.022,.03,brass,.13+k*.06,.07,.2,14);kb.rotation.x=Math.PI/2}
 g.userData.vuNeedles=amp.children.filter(o=>o.userData.vu);
 // Turntable: oak plinth, platter (the spinning record and arm come from room-life) and an open lid.
 box(mc,.62,.1,.46,P.oak,3.5,1.05,z+.07);cyl(mc,.19,.19,.05,P.ink,3.5,1.145,z+.07,40);
 for(const kx of [3.25,3.32])cyl(mc,.015,.015,.02,chrome,kx,1.11,z+.26,10);
 const lid=box(mc,.62,.01,.46,glass,3.5,1.29,z-.2);lid.rotation.x=-1.25;
 // Speakers with fabric grilles and brass tweeter rings.
 for(const sx of [1.95,5.05]){box(mc,.38,.55,.34,P.oak,sx,1.275,z);box(mc,.32,.48,.01,'#c9d4f0',sx,1.275,z+.172);
  const tw=add(mc,new T.TorusGeometry(.035,.008,6,20),brass,sx,1.43,z+.18);const wf=add(mc,new T.TorusGeometry(.09,.01,6,24),brass,sx,1.2,z+.18);tw.castShadow=wf.castShadow=false}
 // Headphones resting on a little brass stand.
 cyl(mc,.06,.07,.02,brass,4.35,1.01,z,16);cyl(mc,.008,.008,.3,brass,4.35,1.16,z,8);
 const band=add(mc,new T.TorusGeometry(.1,.016,8,24,Math.PI),mat(P.peri,.4),4.35,1.24,z);band.rotation.y=Math.PI/2;
 for(const s of [-1,1]){const cup=cyl(mc,.05,.05,.04,P.peri,4.35,1.21,z+s*.1,18);cup.rotation.x=Math.PI/2;const pad=cyl(mc,.045,.045,.02,P.cream,4.35,1.21,z+s*.075,18);pad.rotation.x=Math.PI/2}
 // "Now playing" sleeve on a small easel.
 const sleeve=canvas((c,w,h)=>{c.fillStyle='#e8b9b5';c.fillRect(0,0,w,h);c.fillStyle='#5a2431';c.beginPath();c.arc(w*.5,h*.48,w*.3,0,7);c.fill();c.fillStyle='#efd88e';c.beginPath();c.arc(w*.5,h*.48,w*.12,0,7);c.fill();c.fillStyle='#8fa4d6';for(let i=0;i<6;i++)c.fillRect(0,h*.82+i*7,w,3);c.fillStyle='#5a2431';c.font='italic 600 26px Georgia';c.textAlign='center';c.fillText('Lado A',w/2,h*.13)},256,256);
 const easel=new T.Group();easel.position.set(4.75,1.0,z-.05);easel.rotation.set(-.18,-.25,0);mc.add(easel);
 box(easel,.3,.3,.01,P.cream,0,.16,0);picture(easel,.28,.28,sleeve,0,.16,.007);box(easel,.03,.2,.02,P.oak,0,.1,-.08).rotation.x=.5;
 // Warm neon over the console, below the paintings.
 const neon=canvas((c,w,h)=>{c.clearRect(0,0,w,h);c.textAlign='center';c.font='italic 700 86px Georgia';c.shadowColor='#ff9fb0';for(const [blur,col] of [[34,'#ff8fa6'],[14,'#ffb8c5'],[0,'#fff0f3']]){c.shadowBlur=blur;c.fillStyle=col;c.fillText('♪ la música',w/2,h*.68)}},768,160);
 box(mc,1.42,.38,.03,'#3a1a22',3.5,1.88,-5.535);picture(mc,1.3,.27,neon,3.5,1.88,-5.515,0,true);
 // Record crate on the floor, right in front of the console.
 const crate=new T.Group();crate.position.set(4.95,0,-4.36);mc.add(crate);
 for(const s of [-1,1]){box(crate,.03,.32,.34,P.oak,s*.24,.16,0);box(crate,.48,.32,.03,P.oak,0,.16,s*.155)}box(crate,.48,.03,.34,P.oak,0,.015,0);
 for(let k=0;k<8;k++){const r=box(crate,.42,.3,.008,[P.peri,P.butter,P.rose,P.plum,P.cream][k%5],0,.19,-.12+k*.032);r.rotation.x=-.2+k*.02}
}

// Small idle motion: the globe turns and the VU needles dance while music plays.
export function animateCorners(room,t){
 const earth=room.userData.globe;if(earth)earth.rotation.y=t*.15;
 const needles=room.userData.vuNeedles;if(needles){const playing=room.userData.activity==='music';needles.forEach((n,i)=>n.rotation.z=playing?.5-Math.abs(Math.sin(t*(5+i*1.7)))*.9:.55)}
}

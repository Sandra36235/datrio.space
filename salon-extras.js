// Maximalist details for the salon: matcha and coffee extras, library
// collectibles with Puyol's photos, the gamer setup, the fluffy sofa and
// armchair, a pumpkin pouf and Puyol's burgundy bed with his little ball.
import * as T from './vendor/three.module.js';

const cache=new Map();
function mat(color,rough=.6,metal=0){const k=color+rough+metal;if(!cache.has(k))cache.set(k,new T.MeshStandardMaterial({color,roughness:rough,metalness:metal}));return cache.get(k)}
function add(g,geo,m,x=0,y=0,z=0){const o=new T.Mesh(geo,typeof m==='string'?mat(m):m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;o.userData.refined=true;g.add(o);return o}
const box=(g,w,h,d,m,x,y,z)=>add(g,new T.BoxGeometry(w,h,d),m,x,y,z);
const cyl=(g,rt,rb,h,m,x,y,z,n=20)=>add(g,new T.CylinderGeometry(rt,rb,h,n),m,x,y,z);
const ball=(g,r,m,x,y,z)=>add(g,new T.SphereGeometry(r,20,14),m,x,y,z);
const group=(g,x=0,y=0,z=0,ry=0)=>{const a=new T.Group();a.position.set(x,y,z);a.rotation.y=ry;g.add(a);return a};
function canvas(draw,w=256,h=256){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t}
function plane(g,w,h,map,x,y,z,ry=0,glow=false){const m=glow?new T.MeshBasicMaterial({map,transparent:true}):new T.MeshStandardMaterial({map,roughness:.8});const p=add(g,new T.PlaneGeometry(w,h),m,x,y,z);p.rotation.y=ry;return p}
const velvet=(color,sheen='#ffd6dc')=>new T.MeshPhysicalMaterial({color,roughness:.78,sheen:1,sheenColor:sheen,sheenRoughness:.45});

const P={butter:'#efd88e',peri:'#a5b9e4',periDeep:'#8fa4d6',plum:'#5a2431',berry:'#7a3544',guinda:'#7d1f30',rose:'#e8b9b5',cream:'#f6eedc',ink:'#2f2a33',oak:'#c49663',matcha:'#7fa548',matchaDeep:'#5d7f2f'};
const glass=new T.MeshPhysicalMaterial({color:'#eef6f6',transparent:true,opacity:.3,roughness:.05,depthWrite:false});
const chrome=new T.MeshStandardMaterial({color:'#e4e6ea',metalness:.9,roughness:.18});
const brass=new T.MeshStandardMaterial({color:'#c9a25e',metalness:.75,roughness:.3});
const gold=new T.MeshStandardMaterial({color:'#e2b84f',metalness:.85,roughness:.22});

// Chesterfield-style tufting on the +z face of a geometry, at a diamond grid; returns button spots.
function tuft(geo,w,h,cols,rows,depth=.06,spread=.05){const v=geo.attributes.position,pts=[];
 for(let r=0;r<rows;r++)for(let c=0;c<cols-(r%2);c++)pts.push([(-w/2)+w*(c+.5+(r%2)*.5)/cols,(-h/2)+h*(r+.5)/rows]);
 let front=0;for(let i=0;i<v.count;i++)front=Math.max(front,v.getZ(i));
 for(let i=0;i<v.count;i++){const z=v.getZ(i);if(z<front*.35)continue;const x=v.getX(i),y=v.getY(i);let d=0;for(const [px,py] of pts){d+=Math.exp(-((x-px)**2+(y-py)**2)/(spread*spread))}v.setZ(i,z-depth*Math.min(1,d)*(z/front))}
 geo.computeVertexNormals();return pts.map(([x,y])=>[x,y,front-depth*.8])}
// Rounded "puffy" block: a superellipsoid with optional channel grooves
// along one axis, like the plump tufted furniture in the reference photo.
function puff(w,h,d,{p=.32,ridges=0,axis='x',depth=.07,seg=36}={}){
 const geo=new T.SphereGeometry(1,seg,Math.round(seg*.7)),v=geo.attributes.position,pw=a=>Math.sign(a)*Math.pow(Math.abs(a),p);
 for(let i=0;i<v.count;i++){let x=pw(v.getX(i)),y=pw(v.getY(i)),z=pw(v.getZ(i));
  if(ridges){const u=({x,y,z})[axis],k=1-depth*.5*(1-Math.cos(Math.PI*2*ridges*(u+1)/2));if(axis!=='x')x*=k;if(axis!=='y')y*=k;if(axis!=='z')z*=k}
  v.setXYZ(i,x*w/2,y*h/2,z*d/2)}
 geo.computeVertexNormals();return geo}

/* ------------------------------------------------- coffee & MATCHA */
// Counter top is y 1.195 between x -6.98 and -5.955; the front strip x≈-6.1 is free.
const lathe=(pts,n=28)=>new T.LatheGeometry(pts.map(([r,y])=>new T.Vector2(r,y)),n);
export function coffeeExtras(g){
 const y0=1.195,fx=-6.1;
 // Moka pot in front of the espresso machine.
 const moka=group(g,fx,y0,-4.05);add(moka,new T.CylinderGeometry(.055,.065,.11,8),chrome,0,.055,0);add(moka,new T.CylinderGeometry(.065,.05,.12,8),chrome,0,.17,0);add(moka,new T.ConeGeometry(.05,.05,8),chrome,0,.255,0);const mh=box(moka,.012,.09,.02,P.ink,-.07,.17,0);mh.rotation.z=.2;
 // Chemex: hourglass glass, wooden collar and leather tie.
 const chemex=group(g,fx,y0,-3.05);add(chemex,lathe([[0,0],[.085,.005],[.095,.06],[.06,.14],[.03,.17],[.06,.2],[.1,.28],[.105,.3]]),glass);cyl(chemex,.045,.04,.07,P.oak,0,.17,0,16);add(chemex,new T.TorusGeometry(.044,.006,6,16),'#6b3f2a',0,.17,0).rotation.x=Math.PI/2;cyl(chemex,.06,.07,.05,'#4a2e20',0,.03,0,16);
 // Digital scales with glowing readouts.
 const readout=t=>canvas((c,w,h)=>{c.fillStyle='#0f1512';c.fillRect(0,0,w,h);c.fillStyle='#9ef0a8';c.font='bold 46px monospace';c.textAlign='center';c.fillText(t,w/2,h*.72)},128,64);
 for(const [sz,txt,top] of [[-2.55,'18.0g','cup'],[-1.98,'250g','none']]){const s=group(g,fx,y0,sz);box(s,.2,.025,.2,P.ink,0,.0125,0);box(s,.17,.005,.17,chrome,0,.028,0);plane(s,.07,.03,readout(txt),.101,.0125,0,Math.PI/2,true);
  if(top==='cup'){cyl(s,.045,.035,.07,'#fffaf1',0,.065,0,16);cyl(s,.04,.04,.004,'#4a2e20',0,.1,0,16)}}
 // French press beside the scales.
 const fp=group(g,fx,y0,-1.5);cyl(fp,.06,.06,.2,glass,0,.11,0,18);cyl(fp,.052,.052,.13,'#4a2e20',0,.075,0,16);for(const a of [0,Math.PI/2,Math.PI,Math.PI*1.5])box(fp,.006,.2,.012,chrome,Math.cos(a)*.062,.11,Math.sin(a)*.062);cyl(fp,.064,.064,.02,chrome,0,.22,0,18);cyl(fp,.006,.006,.08,chrome,0,.26,0,6);ball(fp,.015,P.ink,0,.3,0);
 // Matcha lattes: milk with a bright green layer, in clear glasses.
 for(const lz of [-1.2]){const l=group(g,fx-.02,y0,lz);cyl(l,.045,.04,.15,glass,0,.075,0,16);cyl(l,.038,.036,.07,'#f7f3ea',0,.04,0,14);cyl(l,.04,.038,.05,P.matcha,0,.1,0,14);for(let k=0;k<3;k++)box(l,.018,.018,.018,'#eaf6f8',(k-1)*.015,.12,0)}

 // Stand-up coffee bags along the top shelf, each with its own roast label.
 const bagLabel=(bg,fg,name,origin)=>canvas((c,w,h)=>{c.fillStyle=bg;c.fillRect(0,0,w,h);c.fillStyle=fg;c.textAlign='center';c.font='bold 30px Georgia';c.fillText(name,w/2,h*.42);c.font='20px Georgia';c.fillText(origin,w/2,h*.62);c.beginPath();c.arc(w/2,h*.82,10,0,7);c.fill()},128,192);
 const bags=[['#c9a273','#3a2a1e','Yungas','Bolivia'],['#2f2a33','#efd88e','Espresso','blend'],['#efd88e','#5a2431','Geisha','Panamá'],['#a5b9e4','#2f2a33','Huila','Colombia'],['#e8b9b5','#5a2431','Sidamo','Etiopía'],['#f6eedc','#2f2a33','Caranavi','Bolivia'],['#7a3544','#f6eedc','Decaf','suave']];
 bags.forEach(([bg,fg,name,origin],k)=>{const bz=-3.2+k*.18,b=group(g,-6.86,2.525,bz,0);box(b,.07,.2,.15,bg,0,.1,0);box(b,.05,.03,.15,bg,0,.215,0);ball(b,.012,'#1d1d22',.036,.17,.04);plane(b,.12,.15,bagLabel(bg,fg,name,origin),.0355,.09,0,Math.PI/2);b.rotation.y=(k%3-1)*.06});
 // A burlap sack of green beans beside the bar, beans spilling over the rim.
 const sack=new T.SphereGeometry(1,24,16),sv=sack.attributes.position;for(let i=0;i<sv.count;i++){const y=sv.getY(i),k=y>0?1-y*.25:1;sv.setXYZ(i,sv.getX(i)*.15*k,y*.2,sv.getZ(i)*.14*k)}sack.computeVertexNormals();
 add(g,sack,new T.MeshStandardMaterial({color:'#c4a47a',roughness:1}),-5.8,.18,-4.55);
 for(let k=0;k<14;k++){const a=k*2.4;ball(g,.016,'#7a5a3a',-5.8+Math.cos(a)*.07,.37+(k%3)*.01,-4.55+Math.sin(a)*.06)}
 for(let k=0;k<6;k++)ball(g,.016,'#7a5a3a',-5.62+k*.03,.016,-4.42+Math.sin(k)*.05);

 // Lower floating shelf: the matcha bar.
 box(g,.36,.04,2.0,P.oak,-6.88,2.05,-2.3);
 const sign=canvas((c,w,h)=>{c.fillStyle='#5d7f2f';c.fillRect(0,0,w,h);c.fillStyle='#f6eedc';c.font='600 44px Georgia';c.textAlign='center';c.fillText('抹茶 · matcha bar',w/2,h*.68)},512,72);
 plane(g,1.4,.2,sign,-6.695,1.95,-2.3,Math.PI/2);
 const tinLabel=canvas((c,w,h)=>{c.fillStyle='#f6eedc';c.fillRect(0,0,w,h);c.fillStyle='#5d7f2f';c.font='bold 60px serif';c.textAlign='center';c.fillText('抹茶',w/2,h*.55);c.font='22px Georgia';c.fillText('MATCHA',w/2,h*.85)},128,128);
 const tinMat=new T.MeshStandardMaterial({map:tinLabel,roughness:.5});
 for(let k=0;k<6;k++){const tz=-3.15+k*.14,c=[P.matcha,P.matchaDeep,'#9cc069',P.cream,P.matcha,'#2f4d2a'][k];const tin=cyl(g,.05,.05,.13,c,-6.88,2.135,tz,18);tin.material=mat(c,.45,.2);const l=add(g,new T.CylinderGeometry(.051,.051,.06,18,1,true),tinMat,-6.88,2.13,tz);l.rotation.y=Math.PI/2;cyl(g,.052,.052,.02,k%2?gold:chrome,-6.88,2.21,tz,18)}
 for(const [k,bz] of [-2.25,-2.08].entries()){const b=box(g,.07,.24,.15,k?P.matchaDeep:'#9cc069',-6.9,2.19,bz);b.rotation.z=.04;plane(g,.1,.08,tinLabel,-6.864,2.18,bz,Math.PI/2)}
 for(const [k,cz] of [-1.85,-1.6,-1.38].entries()){const bowl=add(g,new T.SphereGeometry(.07,20,10,0,Math.PI*2,Math.PI/2,Math.PI/2),mat([P.rose,'#3d3a36',P.cream][k],.35),-6.88,2.145,cz);bowl.material.side=T.DoubleSide;const tea=add(g,new T.CircleGeometry(.06,18),mat(P.matcha,.5),-6.88,2.135,cz);tea.rotation.x=-Math.PI/2}
 // Chasen whisks resting on their ceramic holders, and a bamboo scoop.
 const whisk=(x,y,z)=>{const w=group(g,x,y,z);add(w,lathe([[0,0],[.025,.005],[.035,.04],[.02,.07],[.012,.08],[0,.085]]),'#fffaf1');cyl(w,.013,.013,.06,'#d8c08f',0,.11,0,10);for(let k=0;k<16;k++){const a=k*Math.PI/8,t=box(w,.003,.06,.003,'#e6d3a3',Math.cos(a)*.022,.07,Math.sin(a)*.022);t.rotation.set(Math.sin(a)*.3,0,-Math.cos(a)*.3)}};
 whisk(-6.88,2.07,-1.15);whisk(-6.62,y0,-1.38);
 const scoop=box(g,.006,.006,.16,'#d8c08f',-6.33,1.205,-1.3);scoop.rotation.y=.4;
}

/* --------------------------------------------- library collectibles */
// Shelf tops of the library at x -6.3..-4.1, z -5.25: y .3875 + j*.68.
function puyolPhoto(g,url,crop,x,y,z,w,h,ry=0,frame=P.cream){
 const fr=group(g,x,y,z,ry);box(fr,w+.04,h+.04,.02,frame,0,h/2+.02,0);const back=box(fr,.02,h*.7,.02,frame,0,h*.35,-.06);back.rotation.x=.35;
 const m=new T.MeshStandardMaterial({color:'#ffffff',roughness:.7});plane(fr,w,h,null,0,h/2+.02,.011).material=m;
 if(typeof window!=='undefined')new T.TextureLoader().load(url,t=>{t.colorSpace=T.SRGBColorSpace;t.repeat.set(crop[2],crop[3]);t.offset.set(crop[0],crop[1]);m.map=t;m.needsUpdate=true});
}
const photo1=new URL('./art/puyol-photo-1.png',import.meta.url).href,photo2=new URL('./art/puyol-photo-2.webp',import.meta.url).href;
export function libraryCollectibles(g){
 const top=j=>.3875+j*.68,z=-5.05;
 // Framed photos of Puyol: the bow tie portrait and the red harness one.
 puyolPhoto(g,photo1,[.12,.3,.76,.66],-5.35,top(1),z,.24,.3,0,P.guinda);
 puyolPhoto(g,photo2,[.08,.08,.7,.78],-4.95,top(3),z,.2,.26,-.15,'#fffaf1');
 puyolPhoto(g,photo1,[.2,.62,.6,.36],-4.4,top(4),z,.22,.17,.12,gold);
 // A porcelain poodle figurine with a tiny bow tie.
 const fig=group(g,-4.85,top(0),z);const white=mat('#fbf8f2',.3);
 for(const [x,y,zz,r] of [[0,.08,0,.06],[0,.15,.045,.045],[0,.2,.06,.04],[0,.245,.06,.033],[.035,.035,.03,.025],[-.035,.035,.03,.025],[.035,.035,-.04,.025],[-.035,.035,-.04,.025],[0,.12,-.075,.03]])ball(fig,r,white,x,y,zz);
 ball(fig,.008,P.ink,0,.2,.1);box(fig,.04,.015,.01,P.guinda,0,.17,.085);
 // A tiny golden trophy.
 const tr=group(g,-4.5,top(0),z);box(tr,.08,.03,.08,P.ink,0,.015,0);cyl(tr,.01,.015,.06,gold,0,.06,0,10);add(tr,lathe([[0,0],[.02,.005],[.045,.05],[.05,.09],[.048,.09]]),gold,0,.09,0);
 // Vinyl figure with a big head, a glass dome with a mini dinosaur and a little rocket.
 const vf=group(g,-4.95,top(2),z);cyl(vf,.035,.04,.07,P.periDeep,0,.035,0,14);add(vf,puff(.13,.12,.12,{p:.5}),P.butter,0,.13,0);for(const s of [-1,1])ball(vf,.012,P.ink,s*.03,.135,.058);
 const dome=group(g,-4.62,top(2),z);cyl(dome,.07,.075,.025,P.oak,0,.0125,0,20);add(dome,new T.SphereGeometry(.065,20,12,0,Math.PI*2,0,Math.PI/2),glass,0,.025,0);const dino=add(dome,puff(.07,.035,.03,{p:.6}),'#7fa548',0,.05,0);ball(dome,.015,'#7fa548',.035,.07,0);
 const rk=group(g,-4.33,top(2),z);add(rk,lathe([[0,0],[.022,.01],[.025,.08],[.018,.11],[0,.14]]),'#fffaf1');for(let k=0;k<3;k++){const f=box(rk,.004,.04,.03,P.guinda,Math.cos(k*2.1)*.024,.02,Math.sin(k*2.1)*.024);f.rotation.y=-k*2.1}ball(rk,.01,P.periDeep,0,.075,.023);
 // Retro camera and a snow globe with a white poodle inside.
 const cam=group(g,-4.95,top(4),z);box(cam,.14,.08,.05,P.ink,0,.04,0);box(cam,.14,.025,.052,'#c9a273',0,.06,0);cyl(cam,.025,.025,.03,chrome,0,.04,.035,16).rotation.x=Math.PI/2;
 const sg=group(g,-4.7,top(4),z);cyl(sg,.05,.06,.035,P.guinda,0,.0175,0,20);ball(sg,.055,glass,0,.085,0);ball(sg,.02,'#fbf8f2',0,.075,0);ball(sg,.013,'#fbf8f2',0,.1,.004);
}

/* ---------------------------------------------------- gamer setup */
// Desk top at y 1.19 (x -3.87..-1.47, z -5.12..-4.18); tower stays at x -1.65.
export function gamerSetup(g){
 const y0=1.19;
 const screen=canvas((c,w,h)=>{const sky=c.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#2a2440');sky.addColorStop(.6,'#7b5fa8');sky.addColorStop(1,'#f0a6c0');c.fillStyle=sky;c.fillRect(0,0,w,h);
  c.fillStyle='#f6eedc';for(let i=0;i<40;i++)c.fillRect((i*97)%w,(i*53)%(h*.4),3,3);
  c.fillStyle='#4b3a72';for(let x=0;x<w;x+=16){const hh=60+Math.abs(Math.sin(x*.013))*90;c.fillRect(x,h-hh-60,16,hh)}
  c.fillStyle='#5d7f2f';c.fillRect(0,h-60,w,60);c.fillStyle='#7fa548';for(let x=0;x<w;x+=32)c.fillRect(x,h-60,16,8);
  // A pixel poodle hero.
  const px=(x,y,col)=>{c.fillStyle=col;c.fillRect(260+x*8,h-60-120+y*8,8,8)};
  const dog=['..WWW.....','.WWWWW....','.WKWWWW...','.WWWNWWWWW','..WRRWWWWW','...WWWWWWW','...W.W.W.W'];
  dog.forEach((row,y)=>[...row].forEach((ch,x)=>{if(ch!=='.')px(x,y,{W:'#ffffff',K:'#111',N:'#111',R:'#7d1f30'}[ch])}));
  c.fillStyle='#efd88e';c.font='bold 30px monospace';c.fillText('PLAYER 1: PUYOL',28,44);c.fillStyle='#f0a6c0';c.fillText('♥♥♥',w-110,44);
  c.fillStyle='#efd88e';for(let i=0;i<5;i++){c.beginPath();c.arc(420+i*44,h-150-Math.sin(i)*20,9,0,7);c.fill()}},1024,420);
 // Curved ultrawide monitor with a soft backlight and a light bar.
 const mon=group(g,-2.75,0,-4.55);
 const curve=new T.CylinderGeometry(2.2,2.2,.62,48,1,true,Math.PI-.36,.72);
 const panel=add(mon,curve,new T.MeshBasicMaterial({map:screen,side:T.DoubleSide}),0,1.95,2.2-.02);panel.castShadow=false;panel.scale.x=-1;
 const shell=add(mon,new T.CylinderGeometry(2.21,2.21,.66,48,1,true,Math.PI-.37,.74),new T.MeshStandardMaterial({color:P.ink,roughness:.4,side:T.DoubleSide}),0,1.95,2.2-.035);
 box(mon,.06,.42,.06,P.ink,0,1.48,-.27);box(mon,.4,.02,.22,P.ink,0,1.2,-.2);
 box(mon,.5,.03,.05,P.ink,0,2.3,-.25);const bar=box(mon,.46,.008,.03,new T.MeshBasicMaterial({color:'#fff2d0'}),0,2.285,-.22);bar.castShadow=false;
 const halo=add(g,new T.PlaneGeometry(2.0,.95),new T.MeshBasicMaterial({color:'#b79cf0',transparent:true,opacity:.32,depthWrite:false}),-2.75,1.97,-5.54);halo.castShadow=false;
 // Big desk mat, mechanical keyboard, mouse, controller and headset.
 const matTex=canvas((c,w,h)=>{c.fillStyle='#8fa4d6';c.fillRect(0,0,w,h);c.strokeStyle='#b79cf0';c.lineWidth=6;for(let i=-h;i<w;i+=40){c.beginPath();c.moveTo(i,h);c.lineTo(i+h,0);c.stroke()}c.fillStyle='#f0a6c0';c.font='bold 40px monospace';c.fillText('GG',w-90,h-24)},512,160);
 plane(g,1.55,.48,matTex,-2.75,y0+.003,-4.4).rotation.x=-Math.PI/2;
 const kb=group(g,-2.85,y0,-4.38);box(kb,.62,.03,.2,'#fffaf1',0,.015,0);
 const caps=[P.peri,P.cream,P.rose,P.butter];for(let r=0;r<4;r++)for(let k=0;k<13;k++)box(kb,.038,.018,.038,caps[(r+k)%7===0?2:(r===0&&k<2?3:k>10?0:1)],-.27+k*.045,.04,-.07+r*.046);
 const rgb=box(kb,.63,.006,.21,new T.MeshBasicMaterial({color:'#f0a6c0'}),0,.002,0);rgb.castShadow=false;
 const mouse=add(g,puff(.06,.035,.1,{p:.6}),'#fffaf1',-2.25,y0+.02,-4.36);
 const pad=group(g,-3.35,y0,-4.33,.3);add(pad,puff(.16,.04,.1,{p:.55}),P.periDeep,0,.025,0);for(const s of [-1,1])add(pad,puff(.06,.04,.09,{p:.6}),P.periDeep,s*.07,.02,.04);ball(pad,.012,P.ink,-.04,.05,0);for(let k=0;k<4;k++)ball(pad,.009,[P.rose,P.butter,'#7fa548',P.peri][k],.04+Math.cos(k*1.57)*.016,.05,Math.sin(k*1.57)*.016);
 const hs=group(g,-2.05,y0,-4.85);cyl(hs,.06,.07,.02,P.ink,0,.01,0,18);cyl(hs,.01,.01,.3,P.ink,0,.16,0,8);const band=add(hs,new T.TorusGeometry(.09,.016,8,24,Math.PI),mat(P.rose,.4),0,.27,0);band.rotation.y=Math.PI/2;for(const s of [-1,1]){const cup=cyl(hs,.045,.045,.04,P.rose,0,.25,s*.09,18);cup.rotation.x=Math.PI/2;const ring=add(hs,new T.TorusGeometry(.04,.006,6,18),new T.MeshBasicMaterial({color:'#b79cf0'}),0,.25,s*.112);ring.castShadow=false}
 // Streaming mic on a boom arm.
 const arm=group(g,-3.7,y0,-4.95);cyl(arm,.03,.03,.06,P.ink,0,.03,0,10);const a1=box(arm,.015,.45,.015,P.ink,.08,.25,.05);a1.rotation.z=-.4;const a2=box(arm,.015,.35,.015,P.ink,.25,.5,.15);a2.rotation.set(.6,0,.9);add(arm,puff(.06,.12,.06,{p:.6}),'#3a3a40',.38,.42,.3);
 // Hexagon light panels on the wall, between the desk and the paintings.
 const hexes=[];const hexGeo=new T.CylinderGeometry(.15,.15,.02,6);
 for(const [hx,hy] of [[0,0],[.26,.15],[.26,-.15],[.52,0],[.52,.3],[0,.3],[.78,.15]]){const h=add(g,hexGeo,new T.MeshBasicMaterial({color:'#b79cf0'}),-1.05+hx,2.35+hy,-5.54);h.rotation.set(Math.PI/2,0,Math.PI/6);h.castShadow=false;hexes.push(h)}
 // Gaming chair facing the screen: star base, wings, headrest and lumbar pillows.
 const ch=group(g,-2.78,0,-3.63,Math.PI);
 for(let k=0;k<5;k++){const a=k*Math.PI*2/5,leg=box(ch,.05,.04,.34,P.ink,Math.sin(a)*.17,.07,Math.cos(a)*.17);leg.rotation.y=a;ball(ch,.035,P.ink,Math.sin(a)*.33,.035,Math.cos(a)*.33)}
 cyl(ch,.03,.03,.36,chrome,0,.27,0,10);
 add(ch,puff(.56,.13,.54,{p:.4,ridges:3,axis:'z',depth:.05}),velvet(P.periDeep,'#e3e9fa'),0,.5,0);
 for(const s of [-1,1])add(ch,puff(.12,.12,.5,{p:.45}),velvet(P.berry),s*.29,.56,0);
 const back=group(ch,0,.55,-.27);back.rotation.x=-.12;
 add(back,puff(.56,.9,.14,{p:.4,ridges:4,axis:'y',depth:.06}),velvet(P.periDeep,'#e3e9fa'),0,.52,0);
 for(const s of [-1,1])add(back,puff(.11,.7,.16,{p:.45}),velvet(P.berry),s*.3,.48,.02);
 add(back,puff(.36,.12,.08,{p:.5}),velvet(P.cream,'#ffffff'),0,.86,.09);add(back,puff(.34,.14,.08,{p:.5}),velvet(P.cream,'#ffffff'),0,.25,.09);
 for(const s of [-1,1]){box(ch,.05,.2,.05,P.ink,s*.33,.65,0);box(ch,.08,.035,.28,P.ink,s*.33,.76,.02)}
 let towerGlow=null;g.traverse(o=>{if(o.material?.name==='rgb-glow')towerGlow=o});
 g.userData.rgb=[rgb,bar,...hexes,halo,...(towerGlow?[towerGlow]:[])];
}

/* ------------------------------------------- fluffy maximalist seating */
// Sofa group sits at world (1.65, 0, -.65); seat top stays at y .95 for the Kindle scene.
export function fluffySofa(s){
 // Vibrant burgundy velvet; the sheen stays deep red so the colour never washes out.
 const deep=c=>new T.MeshPhysicalMaterial({color:c,roughness:.88,sheen:.45,sheenColor:'#b0284e',sheenRoughness:.6});
 const v=deep('#5e0a24'),v2=deep('#6c0d2b'),btn=deep('#3e0517');
 box(s,4.3,.12,1.35,'#2a0a14',0,.06,0);
 add(s,puff(4.6,.36,1.66,{p:.38}),v,0,.3,0);
 // Overstuffed seat cushions: tall, rounded and bulging past the base.
 for(let i=0;i<3;i++)add(s,puff(1.5,.44,1.38,{p:.48,seg:40}),v2,-1.47+i*1.47,.73,.1);
 // Tall tufted backrest with deep button dimples.
 const backGeo=puff(4.5,.92,.56,{p:.4,seg:52});const buttons=tuft(backGeo,4.3,.78,9,3,.15,.085);
 const back=add(s,backGeo,v,0,1.22,-.6);for(const [bx,by,bz] of buttons)ball(back,.03,btn,bx,by,bz);
 // Fat rolled arms.
 for(const x of [-2.25,2.25]){add(s,puff(.66,.86,1.68,{p:.4,seg:40}),v,x,.74,0);add(s,puff(.72,.3,1.74,{p:.55}),v,x,1.12,.02)}
 // Pillows: plain, floral and a round bolster, like the reference photo.
 const floral=(bg,fg)=>canvas((c,w,h)=>{c.fillStyle=bg;c.fillRect(0,0,w,h);for(let i=0;i<14;i++){const x=(i*73)%w,y=(i*131)%h;c.fillStyle=fg;for(let k=0;k<5;k++){c.beginPath();c.ellipse(x+Math.cos(k*1.26)*10,y+Math.sin(k*1.26)*10,8,5,k*1.26,0,7);c.fill()}c.fillStyle='#fffaf1';c.beginPath();c.arc(x,y,4,0,7);c.fill()}});
 const pil=(x,y,z,m,rz,sc=1)=>{const p=add(s,puff(.62*sc,.56*sc,.2,{p:.55}),m,x,y,z);p.rotation.set(-.2,0,rz);return p};
 const soft=c=>velvet(c,'#ffffff');
 pil(-1.75,1.25,-.25,soft(P.butter),-.12);
 pil(-1.15,1.22,-.2,new T.MeshPhysicalMaterial({map:floral('#f3e7bf','#6f8fd0'),roughness:.85,sheen:.6,sheenColor:'#ffffff'}),.06,.9);
 pil(-.5,1.26,-.27,soft(P.peri),-.05,1.05);
 pil(.55,1.24,-.25,new T.MeshPhysicalMaterial({map:floral('#dfe6f7','#d9b54a'),roughness:.85,sheen:.6,sheenColor:'#ffffff'}),.08);
 pil(1.2,1.25,-.22,soft(P.butter),-.1,1.05);
 pil(1.78,1.22,-.2,soft(P.peri),.12,.88);
 const bol=add(s,puff(.62,.24,.24,{p:.55,ridges:4,axis:'x',depth:.1}),soft(P.rose),-1.45,1.05,.0);bol.rotation.y=.08;
}
export function fluffyChair(g){
 const ch=group(g,-1.85,0,-.15,.5);ch.name='reading-chair';
 const v=velvet(P.peri,'#eef2fc');
 add(ch,puff(1.2,.4,1.05,{p:.35}),v,0,.32,0);
 add(ch,puff(1.0,.26,.86,{p:.35,ridges:2,axis:'z',depth:.08}),velvet(P.periDeep,'#eef2fc'),0,.62,.08);
 // Back made of plump vertical rolls fanned around the seat.
 for(let k=0;k<7;k++){const a=-1.45+k*(2.9/6),r=.5,roll=add(ch,puff(.28,.78,.28,{p:.42}),v,Math.sin(a)*r,.82-Math.abs(a)*.08,-Math.cos(a)*r*.82);roll.rotation.y=-a;roll.rotation.x=-.08}
 return ch;
}
// Yellow pumpkin pouf (has its own spot in walk.js).
export function pumpkinPouf(g){
 const geo=new T.SphereGeometry(1,48,24),v=geo.attributes.position;
 for(let i=0;i<v.count;i++){const x=v.getX(i),y=v.getY(i),z=v.getZ(i),a=Math.atan2(z,x),k=1-.09*(1-Math.cos(a*10))/2;v.setXYZ(i,x*.36*k,y*.24*(y<0?.85:1),z*.36*k)}
 geo.computeVertexNormals();const p=add(g,geo,velvet(P.butter,'#fff6d8'),-4.9,.24,2.3);
 cyl(g,.03,.03,.03,'#7fa548',-4.9,.49,2.3,10);
}

/* --------------------------------------------- Puyol's burgundy bed */
export function puyolBed(g){
 const bed=group(g,5.8,0,2.55);bed.name='puyol-bed';
 cyl(bed,.66,.68,.14,'#5e1624',0,.08,0,48);
 add(bed,new T.TorusGeometry(.56,.15,20,64),velvet('#661425','#b8566a'),0,.27,0).rotation.x=Math.PI/2;
 const paws=canvas((c,w,h)=>{c.fillStyle='#7d2434';c.fillRect(0,0,w,h);c.fillStyle='#f3d6da';for(let row=0;row<4;row++)for(let col=0;col<4;col++){const px=32+col*62+(row%2)*12,py=32+row*62;c.beginPath();c.ellipse(px,py+9,8,6,0,0,7);c.fill();for(let t=0;t<3;t++){c.beginPath();c.ellipse(px-9+t*9,py-2-(t%2)*3,3,4,0,0,7);c.fill()}}});
 const cushion=add(bed,puff(1.0,.16,1.0,{p:.6}),new T.MeshPhysicalMaterial({map:paws,roughness:.85,sheen:.5,sheenColor:'#d98a96'}),0,.2,0);
 // A tiny soccer ball to play with.
 const ballTex=canvas((c,w,h)=>{c.fillStyle='#ffffff';c.fillRect(0,0,w,h);c.fillStyle='#1d1d22';for(let i=0;i<12;i++){const x=(i%4)*w/4+(Math.floor(i/4)%2)*w/8+w/8,y=Math.floor(i/4)*h/3+h/6;c.beginPath();for(let k=0;k<5;k++){const a=k*Math.PI*2/5-Math.PI/2;c.lineTo(x+Math.cos(a)*14,y+Math.sin(a)*14)}c.fill()}},256,128);
 const b=add(g,new T.SphereGeometry(.09,24,16),new T.MeshStandardMaterial({map:ballTex,roughness:.5}),5.2,.09,1.95);b.rotation.set(.4,.6,.2);b.name='puyol-ball';
}

// RGB lights slowly cycle through pastel hues; the pouf and sofa stay still.
export function animateExtras(room,t){
 for(const p of plants){p.crown.rotation.z=Math.sin(t*.6+p.phase)*.02;p.crown.rotation.x=Math.sin(t*.45+p.phase)*.014}
 const lights=room.userData.rgb;if(!lights)return;
 lights.forEach((m,i)=>m.material.color.setHSL(((t*.05+i*.07)%1+.72)%1,.85,.64));
}

/* ------------------------------------------------- a plant collection */
const leafMat=c=>new T.MeshStandardMaterial({color:c,roughness:.65,side:T.DoubleSide});
function shapeLeaf(points){const sh=new T.Shape();sh.moveTo(...points[0]);for(let i=1;i<points.length;i++)sh.lineTo(...points[i]);const g=new T.ShapeGeometry(sh,1);const v=g.attributes.position;for(let i=0;i<v.count;i++)v.setZ(i,-Math.abs(v.getX(i))*.35+Math.sin(v.getY(i)*3)*.02);g.computeVertexNormals();return g}
function outline(fn,n=24){const pts=[];for(let i=0;i<=n;i++){const t=i/n;pts.push([fn(t),t])}for(let i=n;i>=0;i--){const t=i/n;pts.push([-fn(t),t])}return pts}
function pot(g,kind,color,h=.45,r=.24){
 const prof=[];for(let i=0;i<=24;i++){const t=i/24;let rr=r*(.78+t*.3);if(kind==='belly')rr=r*(.7+Math.sin(t*Math.PI)*.45);if(kind==='cyl')rr=r;prof.push(new T.Vector2(rr,t*h))}
 const geo=new T.LatheGeometry(prof,kind==='ribbed'?48:32);if(kind==='ribbed'){const v=geo.attributes.position;for(let i=0;i<v.count;i++){const x=v.getX(i),z=v.getZ(i),a=Math.atan2(z,x),k=1+.06*Math.cos(a*16);v.setX(i,x*k);v.setZ(i,z*k)}geo.computeVertexNormals()}
 add(g,geo,new T.MeshStandardMaterial({color,roughness:.45}));const lip=kind==='belly'?r*.7:kind==='cyl'?r:r*1.08;cyl(g,lip*1.02,lip*1.02,.02,color,0,h,0,32);cyl(g,lip*.92,lip*.92,.02,'#3e2c22',0,h+.005,0,24);return h}
const plants=[];
function sway(root){const crown=new T.Group();root.add(crown);plants.push({crown,phase:root.position.x*1.3+root.position.z});return crown}
export function fiddleLeaf(g,x,z,s=1){const root=group(g,x,0,z);root.scale.setScalar(s);const h=pot(root,'ribbed','#7a0c2c',.42,.26);const c=sway(root);c.position.y=h;
 add(c,new T.TubeGeometry(new T.CatmullRomCurve3([[0,0,0],[.04,.5,0],[-.03,1.0,.02],[.02,1.3,0]].map(p=>new T.Vector3(...p))),16,.025,8),'#6b4a33');
 const geo=shapeLeaf(outline(t=>.13*Math.sin(Math.pow(t,.8)*Math.PI)*(1-.25*Math.sin(t*Math.PI*2.2)),20));
 const mats=[leafMat('#3f6b35'),leafMat('#4c7d3d'),leafMat('#355c2d')];
 for(let i=0;i<16;i++){const a=i*2.4,y=.55+i*.055,l=add(c,geo,mats[i%3],Math.cos(a)*.08,y,Math.sin(a)*.08);l.scale.setScalar(.85+(i%3)*.15);l.rotation.set(-.7+(i%4)*.18,a,0)}}
export function birdOfParadise(g,x,z,s=1){const root=group(g,x,0,z);root.scale.setScalar(s);const h=pot(root,'belly','#efd88e',.4,.24);const c=sway(root);c.position.y=h;
 const geo=shapeLeaf(outline(t=>.11*Math.sin(Math.pow(t,.9)*Math.PI),18));const mats=[leafMat('#2f6b4a'),leafMat('#3f7d57')];
 for(let i=0;i<9;i++){const a=i*2.1,len=.7+(i%3)*.15,lean=.25+(i%3)*.12,end=[Math.cos(a)*lean*.6,.55+(i%4)*.12,Math.sin(a)*lean*.6];
  add(c,new T.TubeGeometry(new T.CatmullRomCurve3([[0,0,0],[end[0]*.4,end[1]*.6,end[2]*.4],end].map(p=>new T.Vector3(...p))),12,.012,6),'#4f6f3c');const l=add(c,geo,mats[i%2],...end);l.scale.set(len,len*1.2,len);l.rotation.set(-lean,a+Math.PI/2,0)}
 const fl=group(c,.08,.95,.05);for(let k=0;k<4;k++){const p=add(fl,new T.ConeGeometry(.02,.16,6),k<3?'#f08a3c':'#5f7fc4',Math.cos(k*.5)*.05,.04+k*.02,0);p.rotation.z=-1.1+k*.25}}
export function snakePlant(g,x,z,s=1){const root=group(g,x,0,z);root.scale.setScalar(s);const h=pot(root,'cyl','#8fa4d6',.42,.22);const c=sway(root);c.position.y=h;
 const geo=shapeLeaf(outline(t=>.05*Math.sin(Math.pow(t,.55)*Math.PI),16)),edge=shapeLeaf(outline(t=>.058*Math.sin(Math.pow(t,.55)*Math.PI),16));
 for(let i=0;i<11;i++){const a=i*2.4,r=.04+(i%3)*.04,len=.7+(i%4)*.18,l=group(c,Math.cos(a)*r,0,Math.sin(a)*r,a);l.rotation.z=(i%5-2)*.06;
  const e=add(l,edge,leafMat('#d9c45a'),0,0,-.004);e.scale.set(1,len,1);const m=add(l,geo,leafMat(i%2?'#2f5b37':'#3c6e42'),0,0,0);m.scale.set(1,len,1);
  for(let b=0;b<4;b++){const band=box(l,.06,.008,.002,'#7fa26a',0,len*(.2+b*.18),.003);band.castShadow=false}}}
export function faceCactus(g,x,y,z,s=1,ry=0){const root=group(g,x,y,z,ry);root.scale.setScalar(s);const h=pot(root,'belly','#e8b9b5',.3,.2);
 for(const s2 of [-1,1])ball(root,.018,'#2f2a33',s2*.07,.17,.255);const smile=add(root,new T.TorusGeometry(.04,.008,6,12,Math.PI),'#2f2a33',0,.13,.26);smile.rotation.z=Math.PI;
 const c=sway(root);c.position.y=h;const cm=new T.MeshStandardMaterial({color:'#5f8f4a',roughness:.6});
 add(c,puff(.2,.5,.2,{p:.6}),cm,0,.24,0);for(const [ax,ay] of [[-.13,.28],[.13,.18]]){const arm=add(c,puff(.09,.22,.09,{p:.6}),cm,ax,ay,0);arm.rotation.z=ax<0?.3:-.3}
 for(let k=0;k<5;k++)add(c,new T.SphereGeometry(.03,10,8),'#f0a6c0',Math.cos(k*1.26)*.035,.5,Math.sin(k*1.26)*.035)}
export function succulentBowl(g,x,y,z,s=1){const root=group(g,x,y,z);root.scale.setScalar(s);add(root,new T.SphereGeometry(.2,24,12,0,Math.PI*2,Math.PI/2,Math.PI/2),'#f6eedc',0,.2,0).material.side=T.DoubleSide;cyl(root,.19,.19,.02,'#3e2c22',0,.19,0,24);
 for(const [rx,rz,c,sc] of [[0,0,'#8fb79a',1],[.1,.05,'#b7c98a',.7],[-.09,.06,'#9aa7c9',.75],[.03,-.1,'#c98fa0',.6]]){const ros=group(root,rx,.2,rz);for(let k=0;k<12;k++){const a=k*2.4,r=.02+k*.004,petal=add(ros,new T.SphereGeometry(.035,10,6),c,Math.cos(a)*r,.01+k*.002,Math.sin(a)*r);petal.scale.set(.6*sc,.3*sc,1.1*sc);petal.rotation.y=-a}}}

/* ------------------------------------------- furniture with personality */
// Scalloped butter trim along the library's top and shelves.
export function libraryScallops(g,x=-5.2,z=-5.25,w=2.2){const m=new T.MeshStandardMaterial({color:'#efd88e',roughness:.5,side:T.DoubleSide}),geo=new T.CircleGeometry(.07,16,Math.PI,Math.PI);
 for(const y of [3.67,...[0,1,2,3,4].map(j=>.35+j*.68-.04)]){const n=Math.floor((w-.16)/.14);for(let k=0;k<n;k++){const sc=add(g,geo,m,x-w/2+.15+k*.14,y-.005,z+.365);sc.castShadow=false}}}
// Chess table: the glass top now rests on a stack of soft bubbles.
export function bubblePedestal(g,x,z){const m=new T.MeshPhysicalMaterial({color:'#efd88e',roughness:.3,clearcoat:.6});for(const [y,r] of [[.12,.2],[.3,.15],[.43,.11],[.53,.085]])add(g,new T.SphereGeometry(r,24,16),m,x,y,z);add(g,new T.TorusGeometry(.3,.05,12,32),m,x,.05,z).rotation.x=Math.PI/2}
// Side table shaped like a mushroom with a wavy rose cap (top stays at y .9).
export function mushroomTable(g,x,z){const cap=new T.Shape();for(let i=0;i<=64;i++){const a=i/64*Math.PI*2,r=.47+.025*Math.sin(a*10);i?cap.lineTo(Math.cos(a)*r,Math.sin(a)*r):cap.moveTo(Math.cos(a)*r,Math.sin(a)*r)}
 const top=add(g,new T.ExtrudeGeometry(cap,{depth:.05,bevelEnabled:true,bevelThickness:.012,bevelSize:.012,bevelSegments:3}),new T.MeshPhysicalMaterial({color:'#e8b9b5',roughness:.35,clearcoat:.5}),x,.9,z);top.rotation.x=Math.PI/2;
 add(g,new T.LatheGeometry([[.16,0],[.12,.15],[.08,.45],[.09,.7],[.14,.84]].map(([r,y])=>new T.Vector2(r,y)),32),new T.MeshPhysicalMaterial({color:'#f6eedc',roughness:.4,clearcoat:.4}),x,0,z)}
// A wavy burgundy mirror on the left wall, like the one in the photo.
export function wavyMirror(g,z=4.62,y=2.2){const sh=(rx,ry,amp)=>{const s=new T.Shape();for(let i=0;i<=96;i++){const a=i/96*Math.PI*2,k=1+amp*Math.sin(a*9);const px=Math.cos(a)*rx*k,py=Math.sin(a)*ry*k;i?s.lineTo(px,py):s.moveTo(px,py)}return s};
 const frame=sh(.5,1.05,.045);frame.holes.push(sh(.4,.95,.03));
 const f=add(g,new T.ExtrudeGeometry(frame,{depth:.05,bevelEnabled:true,bevelThickness:.015,bevelSize:.015,bevelSegments:3}),new T.MeshPhysicalMaterial({color:'#6b0f28',roughness:.35,clearcoat:.7}),-7.03,y,z);f.rotation.y=Math.PI/2;
 const glassTex=canvas((c,w,h)=>{const gr=c.createLinearGradient(0,0,w,h);gr.addColorStop(0,'#eef3f7');gr.addColorStop(.45,'#cfd8e3');gr.addColorStop(.55,'#f7fafc');gr.addColorStop(1,'#b9c4d2');c.fillStyle=gr;c.fillRect(0,0,w,h)});
 const mg=new T.ShapeGeometry(sh(.4,.95,.03),48);const uv=mg.attributes.uv,pv=mg.attributes.position;for(let i=0;i<uv.count;i++)uv.setXY(i,pv.getX(i)/.9+.5,pv.getY(i)/2+.5);
 const m=add(g,mg,new T.MeshStandardMaterial({map:glassTex,metalness:.3,roughness:.08}),-7.0,y,z);m.rotation.y=Math.PI/2}

/* ------------------------------------------------ soft contact shadows */
let blobTex=null;
export function contactShadows(g){
 if(!blobTex)blobTex=canvas((c,w,h)=>{const gr=c.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);gr.addColorStop(0,'rgba(60,30,25,.55)');gr.addColorStop(.55,'rgba(60,30,25,.28)');gr.addColorStop(1,'rgba(60,30,25,0)');c.fillStyle=gr;c.fillRect(0,0,w,h)},128,128);
 const m=new T.MeshBasicMaterial({map:blobTex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});
 const spots=[[1.65,-.6,5.1,2.0,.9],[-1.85,-.15,1.5,1.4,.8],[.1,1.8,1.3,1.3,.5],[-4.9,2.3,.95,.95,.8],[5.8,2.55,1.75,1.75,.8],[4.62,-.45,.9,.9,.7],
  [3.5,-4.75,4.0,1.1,.7],[-6.25,-2.55,1.5,4.7,.6],[-5.2,-4.95,2.5,1.0,.6],[-2.65,-4.6,2.7,1.2,.55],[-2.78,-3.63,1.0,1.0,.7],
  [-6.4,4.5,.85,.85,.8],[6.2,-4.5,.85,.85,.8],[6.05,-2.05,.75,.75,.8],[-6.2,1.88,1.35,2.3,.6],[-5.4,-.7,.8,.8,.6],[4.95,-4.36,.7,.55,.6],[1.15,-4.6,.6,.5,.5]];
 for(const [x,z,w,d,o] of spots){const s=new T.Mesh(new T.PlaneGeometry(w,d),m.clone());s.material.opacity=o;s.rotation.x=-Math.PI/2;s.position.set(x,.046,z);s.renderOrder=1;s.userData.refined=true;g.add(s)}
}

/* ------------------------------------------- performance: static merge */
// Bakes every mesh that never moves into one mesh per material, so the room draws
// in a few dozen calls instead of ~1,700. Animated or scripted objects stay separate.
// Identical materials created in different places collapse into one shared material.
const canon=new Map();
function canonical(mt){const c=v=>v&&v.isColor?v.getHexString():v;const sig=[mt.type,c(mt.color),mt.roughness,mt.metalness,mt.map?.uuid,mt.bumpMap?.uuid,mt.bumpScale,mt.side,mt.sheen,c(mt.sheenColor),mt.sheenRoughness,mt.clearcoat,c(mt.emissive),mt.emissiveIntensity,mt.flatShading,mt.vertexColors,mt.polygonOffset].join('|');if(!canon.has(sig))canon.set(sig,mt);return canon.get(sig)}
const KEEP=new Set(['poodle-3d','ukulele','ukulele-stand','kindle','interactive-chess-pawn']);
export function mergeStatic(root){
 root.updateMatrixWorld(true);
 const life=root.userData.life||{},skip=new Set([...(life.curtains||[]).map(c=>c.mesh),life.record,...(life.fans||[]),root.userData.globe,...(root.userData.vuNeedles||[]),...(root.userData.rgb||[]),...(root.userData.artPanels||[]),...plants.map(p=>p.crown)].filter(Boolean));
 const inv=new T.Matrix4().copy(root.matrixWorld).invert(),groups=new Map(),victims=[];
 const dynamic=o=>{for(let p=o;p&&p!==root;p=p.parent){if(skip.has(p)||KEEP.has(p.name)||p.name?.startsWith('botanical'))return true}return false};
 root.traverse(o=>{
  if(!o.isMesh||Array.isArray(o.material)||o.material.transparent||o.isInstancedMesh||o.isSkinnedMesh||!o.visible||dynamic(o))return;
  const g=o.geometry;if(!g.attributes.position||!g.attributes.normal||g.morphAttributes?.position)return;
  o.material=canonical(o.material);
  // Tiny pieces don't need to cast shadows.
  if(!g.boundingSphere)g.computeBoundingSphere();const s=o.matrixWorld.getMaxScaleOnAxis()*g.boundingSphere.radius;const cast=o.castShadow&&s>.14;
  const key=o.material.uuid+'|'+(g.attributes.uv?'uv':'')+'|'+cast+'|'+o.receiveShadow+'|'+o.renderOrder;
  if(!groups.has(key))groups.set(key,{material:o.material,cast,receive:o.receiveShadow,uv:!!g.attributes.uv,items:[],order:o.renderOrder,refined:o.userData.refined});
  groups.get(key).items.push(o);victims.push(o);
 });
 const m=new T.Matrix4(),nm=new T.Matrix3(),v=new T.Vector3();
 for(const grp of groups.values()){
  if(grp.items.length<2){continue}
  let vc=0,ic=0;for(const o of grp.items){const g=o.geometry;vc+=g.attributes.position.count;ic+=g.index?g.index.count:g.attributes.position.count}
  const pos=new Float32Array(vc*3),nor=new Float32Array(vc*3),uv=grp.uv?new Float32Array(vc*2):null,idx=vc>65535?new Uint32Array(ic):new Uint16Array(ic);
  let vo=0,io=0;
  for(const o of grp.items){const g=o.geometry,p=g.attributes.position,n=g.attributes.normal,u=g.attributes.uv;m.multiplyMatrices(inv,o.matrixWorld);nm.getNormalMatrix(m);
   for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(m);pos.set([v.x,v.y,v.z],(vo+i)*3);v.fromBufferAttribute(n,i).applyMatrix3(nm).normalize();nor.set([v.x,v.y,v.z],(vo+i)*3);if(uv)uv.set([u.getX(i),u.getY(i)],(vo+i)*2)}
   if(g.index){for(let i=0;i<g.index.count;i++)idx[io+i]=g.index.getX(i)+vo;io+=g.index.count}else{for(let i=0;i<p.count;i++)idx[io+i]=vo+i;io+=p.count}
   vo+=p.count;}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(pos,3));geo.setAttribute('normal',new T.BufferAttribute(nor,3));if(uv)geo.setAttribute('uv',new T.BufferAttribute(uv,2));geo.setIndex(new T.BufferAttribute(idx,1));geo.computeBoundingSphere();
  const mesh=new T.Mesh(geo,grp.material);mesh.castShadow=grp.cast;mesh.receiveShadow=grp.receive;mesh.renderOrder=grp.order;mesh.userData.refined=grp.refined;mesh.name='merged';root.add(mesh);
  for(const o of grp.items){o.parent.remove(o)}
 }
 // Groups left with a single mesh keep the original, only the tiny-shadow rule applies.
 for(const grp of groups.values())if(grp.items.length<2)for(const o of grp.items)o.castShadow=grp.cast;
}

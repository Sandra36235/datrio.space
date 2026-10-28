import * as T from './vendor/three.module.js';

// A seated, fully volumetric character. No camera-facing body/face artwork.
export function makeSeatedAvatar(){
 const root=new T.Group();root.name='avatar-seated-3d';
 const material=(color,roughness=.55,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
 const skin=material('#b87b56',.65),lip=material('#955947'),dark=material('#211b1b'),hair=material('#38251f',.36),hairLight=material('#60402d',.43),shirt=material('#24262c',.9),denim=material('#80afd2',.85),seam=material('#b5d0df'),cream=material('#f1e7cf',.65),sole=material('#c6a678'),gold=material('#c9a05c',.3,.65);
 function mesh(g,geo,mat,x=0,y=0,z=0){const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m}
 function ell(g,m,p,r){const a=mesh(g,new T.SphereGeometry(1,32,24),m,...p);a.scale.set(...r);return a}
 function tube(g,points,r,m){return mesh(g,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),32,r,8,false),m)}
 function bone(g,a,b,r1,r2,m){const start=new T.Vector3(...a),end=new T.Vector3(...b),v=end.clone().sub(start);const o=mesh(g,new T.CylinderGeometry(r2,r1,v.length(),20),m,...start.add(end).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return o}
 function lock(g,points,r,m){
  const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),n=36,sides=8,frames=curve.computeFrenetFrames(n,false),v=[],uv=[],indices=[];
  for(let j=0;j<=n;j++){const t=j/n,c=curve.getPointAt(t),rad=r*(.09+.91*Math.pow(1-t,.45));for(let k=0;k<=sides;k++){const a=k/sides*Math.PI*2,p=c.clone().addScaledVector(frames.normals[j],Math.cos(a)*rad).addScaledVector(frames.binormals[j],Math.sin(a)*rad);v.push(...p.toArray());uv.push(k/sides,t);if(j<n&&k<sides){const q=j*(sides+1)+k;indices.push(q,q+1,q+sides+1,q+1,q+sides+2,q+sides+1)}}}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(v,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();return mesh(g,geo,m);
 }
 function ring(g,center,rx,ry,r,m){const points=[];for(let i=0;i<=40;i++){const a=i/40*Math.PI*2;points.push([center[0]+Math.cos(a)*rx,center[1]+Math.sin(a)*ry,center[2]])}return tube(g,points,r,m)}
 function palm(g,p,rotation=0){const hand=new T.Group();hand.position.set(...p);hand.rotation.z=rotation;g.add(hand);ell(hand,skin,[0,0,0],[.059,.085,.035]);for(let i=0;i<4;i++){const x=-.038+i*.025;bone(hand,[x,-.045,0],[x,-.13+(i%3)*.008,.008],.012,.009,skin);ell(hand,skin,[x,-.13+(i%3)*.008,.008],[.01,.014,.011])}bone(hand,[-.04,.01,0],[-.076,-.037,.015],.019,.012,skin);return hand}
 // Hips rest on the sofa cushion at y=.94. Feet reach the floor.
 ell(root,skin,[0,1.08,0],[.24,.18,.18]);ell(root,denim,[0,1.01,.04],[.27,.16,.22]);
 const torso=mesh(root,new T.LatheGeometry([new T.Vector2(.20,0),new T.Vector2(.19,.08),new T.Vector2(.23,.25),new T.Vector2(.27,.4),new T.Vector2(.25,.46),new T.Vector2(.09,.49)],48),shirt,0,1.13,0);torso.scale.z=.67;
 ring(root,[0,1.14,.005],.2,.005,.012,shirt);bone(root,[0,1.56,0],[0,1.78,0],.075,.071,skin);
 // Denim seams, waistband, button and belt loops.
 tube(root,[[-.24,1.08,.12],[0,1.13,.22],[.24,1.08,.12]],.009,seam);ell(root,gold,[0,1.09,.23],[.016,.016,.006]);
 for(const x of [-.17,.14])bone(root,[x,1.07,.19],[x,1.13,.19],.009,.009,denim);
 for(const s of [-1,1]){
  const hip=[s*.14,1.0,.06],knee=[s*.20,.79,.63],ankle=[s*.22,.18,.73];
  bone(root,hip,[s*.18,.88,.4],.14,.13,denim);ell(root,denim,[s*.18,.88,.4],[.133,.12,.08]);
  bone(root,[s*.18,.87,.39],knee,.105,.085,skin);ell(root,skin,knee,[.087,.083,.085]);bone(root,knee,ankle,.075,.047,skin);
  const shoe=new T.Group();shoe.position.set(s*.22,.12,.77);shoe.rotation.y=s*.1;root.add(shoe);
  ell(shoe,sole,[0,-.04,.07],[.105,.045,.22]);ell(shoe,cream,[0,.015,.07],[.103,.073,.21]);ell(shoe,shirt,[0,.035,-.08],[.075,.055,.045]);
  for(let i=0;i<3;i++)tube(shoe,[[s*.095,-.005,-.025+i*.045],[s*.087,.055,.015+i*.045],[s*.04,.071,.02+i*.045]],.012,dark);
  for(let i=0;i<4;i++)tube(shoe,[[-.048,.075,.02+i*.025],[0,.082,.03+i*.025],[.048,.075,.02+i*.025]],.005,cream);
  tube(root,[[s*.11,1.025,.23],[s*.16,.98,.33],[s*.24,.95,.3]],.006,seam);
 }
 // Relaxed left arm, artisan bracelets, and a raised right hand near the chin.
 bone(root,[.25,1.49,0],[.33,1.34,.08],.095,.078,shirt);bone(root,[.32,1.35,.075],[.36,1.1,.24],.061,.051,skin);ell(root,skin,[.36,1.1,.24],[.053,.055,.053]);bone(root,[.36,1.1,.24],[.25,.95,.48],.05,.034,skin);palm(root,[.25,.93,.51],-.25);
 const braceletColors=[material('#af6539'),material('#258b89'),gold,cream];
 for(let j=0;j<4;j++){const y=.985+j*.027,z=.44-j*.025;for(let i=0;i<12;i++){const a=i/12*Math.PI*2;ell(root,braceletColors[j],[.265+Math.cos(a)*.042,y+Math.sin(a)*.018,z+Math.sin(a)*.032],[.009,.01,.009])}}
 bone(root,[-.25,1.49,0],[-.34,1.33,.1],.095,.08,shirt);bone(root,[-.33,1.34,.09],[-.4,1.12,.36],.062,.047,skin);ell(root,skin,[-.4,1.12,.36],[.05,.054,.05]);bone(root,[-.4,1.12,.36],[-.28,1.72,.31],.046,.033,skin);
 const thoughtful=palm(root,[-.265,1.77,.32],Math.PI*.9);thoughtful.rotation.x=-.3;
 ell(root,shirt,[-.30,1.62,.33],[.049,.048,.049]);const watch=mesh(root,new T.BoxGeometry(.073,.07,.018),dark,-.30,1.63,.38);watch.rotation.z=-.16;
 // Sculpted elongated face with a tapered jaw, cheek planes and integrated nose bridge.
 const head=new T.Group();head.position.set(0,2.03,.015);head.rotation.y=-.12;head.rotation.z=.055;root.add(head);
 const profile=[[-.42,.035],[-.36,.14],[-.27,.225],[-.12,.29],[.06,.315],[.24,.28],[.36,.2],[.43,.025]];
 const verts=[],indices=[];
 for(let j=0;j<=48;j++){const y=-.42+j/48*.85;let k=0;while(k<profile.length-2&&y>profile[k+1][0])k++;const t=(y-profile[k][0])/(profile[k+1][0]-profile[k][0]),r=T.MathUtils.lerp(profile[k][1],profile[k+1][1],t);for(let i=0;i<=64;i++){const a=i/64*Math.PI*2,x=Math.cos(a)*r;let z=Math.sin(a)*r*.86;if(z>0){z+=.026*Math.exp(-((x/.13)**2)-(((y+.13)/.13)**2));z+=.055*Math.exp(-((x/.045)**2)-(((y+.055)/.105)**2))}verts.push(x,y,z);if(j<48&&i<64){const n=j*65+i;indices.push(n,n+65,n+1,n+1,n+65,n+66)}}}
 const faceGeo=new T.BufferGeometry();faceGeo.setAttribute('position',new T.Float32BufferAttribute(verts,3));faceGeo.setIndex(indices);faceGeo.computeVertexNormals();mesh(head,faceGeo,skin).name='sculpted-face';
 const lens=new T.MeshPhysicalMaterial({color:'#f1e4cb',transparent:true,opacity:.065,roughness:.08,clearcoat:1,depthWrite:false});
 for(const s of [-1,1]){
  ell(head,skin,[s*.305,-.035,0],[.057,.086,.041]);ell(head,lip,[s*.328,-.035,.025],[.022,.045,.013]);
  ell(head,material('#eee4d6',.25),[s*.132,.025,.241],[.079,.059,.035]);ell(head,material('#603d26',.18),[s*.132,.023,.273],[.037,.043,.012]);ell(head,dark,[s*.132,.023,.284],[.02,.031,.007]);ell(head,material('#ffffff',.1),[s*.12,.04,.29],[.009,.01,.004]);
  tube(head,[[s*.06,.055,.269],[s*.12,.082,.271],[s*.195,.055,.252]],.009,dark);
  tube(head,[[s*.065,.145,.244],[s*.13,.165,.255],[s*.205,.14,.226]],.019,hair);
  ring(head,[s*.143,.033,.31],.126,.105,.016,dark);const glass=ell(head,lens,[s*.143,.033,.312],[.113,.092,.006]);glass.castShadow=false;bone(head,[s*.263,.06,.3],[s*.31,.065,-.015],.012,.012,dark);ell(head,gold,[s*.262,.085,.309],[.012,.017,.007]);
 }
 tube(head,[[-.023,.048,.315],[0,.06,.326],[.023,.048,.315]],.012,dark);
 ell(head,skin,[0,-.08,.31],[.042,.035,.04]);for(const s of [-1,1])ell(head,lip,[s*.022,-.1,.326],[.009,.005,.004]);
 tube(head,[[-.075,-.195,.249],[-.035,-.18,.277],[0,-.19,.281],[.032,-.181,.276],[.071,-.193,.25]],.012,lip);tube(head,[[-.065,-.199,.252],[0,-.213,.276],[.062,-.197,.253]],.014,lip);
 // Long hair is sculpted as tapered locks, with finer highlight strands.
 ell(head,hair,[0,.12,-.11],[.345,.365,.235]);
 for(let i=0;i<22;i++){const a=Math.PI*.12+i/21*Math.PI*.76,x=Math.cos(a)*.32,z=-Math.sin(a)*.21;lock(head,[[x,.31,z],[x*1.15,-.05,z-.07],[x*1.26,-.5,z-.06],[x*1.1,-.91,z+.015]],.07,i%4?hair:hairLight)}
 for(const s of [-1,1])for(let j=0;j<6;j++){const x=s*(.27+j*.012);lock(head,[[s*.21,.36,.05],[x,.12,.13],[x*1.18,-.35,.11],[x*1.08,-.79,.13+j*.014]],.047,j%3?hair:hairLight)}
 for(let i=0;i<8;i++)lock(head,[[.17+i*.009,.38,-.015],[.05,.47,.14],[-.2,.34,.235],[-.31,.12,.15]],.04,i%3?hair:hairLight);
 // Fine-line poodle tattoo on the inside of the left arm.
 ring(root,[.343,1.23,.215],.02,.022,.002,dark);ring(root,[.32,1.228,.214],.009,.018,.002,dark);ring(root,[.366,1.228,.214],.009,.018,.002,dark);ell(root,dark,[.343,1.224,.217],[.004,.003,.002]);
 // The printed shirt graphic follows a curved surface, not a floating character plane.
 const printGeo=new T.PlaneGeometry(.25,.29,16,16);const pos=printGeo.attributes.position;for(let i=0;i<pos.count;i++){const y=.24+pos.getY(i),r=y<.25?.19+(y-.08)/.17*.04:.23+(y-.25)/.15*.04;pos.setZ(i,Math.sqrt(Math.max(.001,r*r-pos.getX(i)**2))*.67+.003)}printGeo.computeVertexNormals();
 const print=mesh(root,printGeo,new T.MeshStandardMaterial({transparent:true,opacity:0,depthWrite:false,roughness:.9}),0,1.37,.005);print.name='shirt-print';
 root.userData.setShirtTexture=tex=>{const t=tex.clone();t.repeat.set(.115,.17);t.offset.set(.215,.465);t.needsUpdate=true;print.material.map=t;print.material.opacity=1;print.material.needsUpdate=true};
 root.userData.modelType='volumetric-seated-character';return root;
}

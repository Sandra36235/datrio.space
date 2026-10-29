import assert from 'node:assert/strict';
const gradient={addColorStop(){}};
const ctx=new Proxy({createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(o,k)=>k in o?o[k]:()=>{}});
globalThis.document={createElement:()=>({getContext:()=>ctx,width:256,height:256})};
const T=await import('../vendor/three.module.js');
const {createPoodle3D,posePoodle3D}=await import('../poodle3d.js?v=living-room-1');
const {route,walkable}=await import('../walk.js?v=living-room-1');
const dog=createPoodle3D();
for(const action of ['stand','sit','lick','stand']){
 for(let frame=0;frame<180;frame++)posePoodle3D(dog,frame/60,false,false,action,1/60);
 dog.updateWorldMatrix(true,true);
 const bounds=new T.Box3().setFromObject(dog);
 assert(Number.isFinite(bounds.min.y)&&bounds.min.y>-.06,action+': model below floor');
 dog.traverse(o=>{assert([...o.position,...o.quaternion,...o.scale].every(Number.isFinite),action+': invalid transform');});
 if(action==='lick'){
  const paw=dog.userData.rig.knees[0].getObjectByName('paw').getWorldPosition(new T.Vector3());
  const tongue=dog.userData.rig.tongue.getWorldPosition(new T.Vector3());
  assert(paw.distanceTo(tongue)<.15,'Raised paw must reach the mouth');
 }
 console.log(action+': grounded, finite transforms'+(action==='lick'?', paw reaches mouth':''));
}
assert(dog.userData.rig.sit<.001&&dog.userData.rig.lick<.001,'Pose must reset before walking');
assert(!walkable(6.05,-2.05),'New floor plant must block walking');
assert(route({x:2.6,z:2},{x:-5.6,z:-.7}).length>0,'Coffee route must remain reachable');
const {makeSalon,makeStudio}=await import('../rooms.js?v=living-room-1');
const {animateRoom}=await import('../room-life.js?v=living-room-1');
for(const room of [makeSalon(),makeStudio()]){
 assert(animateRoom(room,.016,false),'Ambient animation should run');
 assert(!animateRoom(room,.016,true),'Reduced motion should pause ambient animation');
 console.log(room.name||'studio', 'builds successfully');
}
console.log('Animation and navigation checks passed.');
const {activities,createActivities}=await import('../activities.js?v=activities-6');
const room=makeSalon(),player=new T.Group(),pu= createPoodle3D();room.add(player);player.add(pu);player.position.set(2.6,.04,2);
const scenes=createActivities(room,player,pu);
for(const [name,station] of Object.entries(activities)){
 assert(walkable(station.destination.x,station.destination.z),name+': destination blocked');
 assert(route(player.position,station.destination).length>0,name+': destination unreachable');
 player.position.set(station.destination.x,.04,station.destination.z);
 scenes.begin(name);scenes.arrive();
 for(let i=0;i<180;i++){const f=scenes.focus||station.focus;player.rotation.y=Math.atan2(f.x-player.position.x,f.z-player.position.z);scenes.update(1/60,false);posePoodle3D(pu,i/60,false,false,name==='coffee'?'brew':name,1/60);}
 if(name==='coffee'){
  const pressPaw=pu.userData.rig.knees[0].getObjectByName('paw').getWorldPosition(new T.Vector3()),handle=room.getObjectByName('aeropress-plunger').localToWorld(new T.Vector3(0,1.02,0));
  assert(pressPaw.distanceTo(handle)<.12,'Paw should push the AeroPress plunger');
  assert(room.getObjectByName('puyol-coffee-stool').visible,'Coffee stool did not appear');
  assert(room.getObjectByName('puyol-aeropress').visible,'AeroPress did not appear');
  assert(room.getObjectByName('aeropress-plunger').position.y<0,'AeroPress plunger did not move');
  const stool=room.getObjectByName('puyol-coffee-stool');
  assert(stool.position.x===station.destination.x,'Coffee stool is not aligned with Puyol');
 }
 if(name==='chess')assert(room.getObjectByName('interactive-chess-pawn').position.z!==2.2,'Chess piece did not move');
 if(name==='chess'){
  pu.updateWorldMatrix(true,true);
  const paw=pu.userData.rig.knees[1].getObjectByName('paw').getWorldPosition(new T.Vector3());
  const chin=pu.userData.rig.head.getObjectByName('lower-jaw').getWorldPosition(new T.Vector3());
  assert(paw.distanceTo(chin)<.22,'Chess paw should touch Puyol’s chin');
 }
 if(name==='music'){
  assert(room.getObjectByName('ukulele').scale.x<1,'Ukulele did not move');
  const uke=room.getObjectByName('ukulele').getWorldPosition(new T.Vector3()),chest=pu.getWorldPosition(new T.Vector3()).add(new T.Vector3(0,.5,0));
  assert(uke.distanceTo(chest)<.8,'Puyol should hold the ukulele against his chest');
  const neckPaw=pu.userData.rig.knees[1].getObjectByName('paw').getWorldPosition(new T.Vector3()),neck=room.getObjectByName('ukulele').localToWorld(new T.Vector3(0,1.3,.16));
  assert(neckPaw.distanceTo(neck)<.12,'Left paw should hold the ukulele neck');
 }
 if(name==='read'){
  assert(room.getObjectByName('kindle').scale.x>1,'Kindle was not picked up');
  assert(Math.abs(player.position.z+.6)<.01&&pu.position.y>.85,'Puyol did not climb onto the sofa');
 }
 scenes.end();
 if(name==='coffee'||name==='read'){
  assert(scenes.hopping,name+': Puyol should hop down instead of teleporting');
  assert(pu.position.y>.3,name+': Puyol vanished from his seat');
 }
 for(let i=0;i<90;i++){scenes.update(1/60,false);posePoodle3D(pu,3+i/60,false,false,'stand',1/60);}
 assert(!scenes.hopping,name+': hop down never finished');
 assert(!room.getObjectByName('puyol-coffee-stool').visible,name+': prop was not cleared');
 assert(Math.abs(player.position.z-station.destination.z)<.01&&pu.position.length()===0,name+': Puyol did not return to the floor');
}
console.log('All four interactive stations are reachable and restore their props.');

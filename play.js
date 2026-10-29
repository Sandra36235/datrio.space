import * as T from './vendor/three.module.js';
import {route,walkable} from './walk.js?v=living-room-1';
import {createPoodle3D,posePoodle3D} from './poodle3d.js?v=living-room-1';

export function createWalk(room,canvas,onCoffee,wake,reduced){
 const player=new T.Group(),dog=createPoodle3D();room.add(player);player.add(dog);player.position.set(2.6,.04,2);
 const shadow=new T.Mesh(new T.CircleGeometry(.42,32),new T.MeshBasicMaterial({color:'#65554a',transparent:true,opacity:.16,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.015;shadow.scale.y=1.35;player.add(shadow);
 const marker=new T.Mesh(new T.RingGeometry(.13,.19,24),new T.MeshBasicMaterial({color:'#e99c29',side:T.DoubleSide}));marker.rotation.x=-Math.PI/2;marker.position.y=.055;marker.visible=false;room.add(marker);
 const ray=new T.Raycaster(),plane=new T.Plane(new T.Vector3(0,1,0),0),keys=new Set();
 let path=[],elapsed=0,idle=0,enabled=true,near=false,autoCoffee=false,forced=null,until=0;
 const hud=document.createElement('div');hud.className='walk-hud';
 hud.innerHTML='<span class="walk-status" aria-live="polite">Toca el suelo para guiar a Puyol.</span><div class="puyol-actions" aria-label="Juega con Puyol"><button type="button" class="puyol-sit" aria-pressed="false">Siéntate</button><button type="button" class="puyol-groom" aria-pressed="false">Límpiate la patita</button></div><button type="button" class="coffee-walk">Vamos por un café ↗</button><button type="button" class="coffee-open" hidden>Preparar una pausa · E</button>';
 canvas.parentElement.append(hud);
 const status=hud.querySelector('.walk-status'),go=hud.querySelector('.coffee-walk'),interact=hud.querySelector('.coffee-open');
 const sitButton=hud.querySelector('.puyol-sit'),groomButton=hud.querySelector('.puyol-groom');
 function stop(){keys.clear();path=[];marker.visible=false;autoCoffee=false;}
 function stand(){forced=null;idle=0;}
 function perform(action){stop();forced=action;until=elapsed+9;wake();}
 sitButton.onclick=()=>perform('sit');groomButton.onclick=()=>perform('lick');
 function destination(p){stand();path=route(player.position,p);if(path.length){marker.position.set(p.x,.055,p.z);marker.visible=true;wake();}else status.textContent='Elige un lugar libre del suelo.';}
 function coffee(){autoCoffee=true;destination({x:-5.2,z:-2.2});}go.onclick=coffee;interact.onclick=()=>{stop();onCoffee();};
 function advance(obj,list,speed,dt){if(!list.length)return false;const p=list[0],dx=p.x-obj.position.x,dz=p.z-obj.position.z,d=Math.hypot(dx,dz),s=speed*dt;if(d<=s){obj.position.x=p.x;obj.position.z=p.z;list.shift();}else{obj.position.x+=dx/d*s;obj.position.z+=dz/d*s;}if(d>.001){const yaw=Math.atan2(dx,dz),delta=Math.atan2(Math.sin(yaw-obj.rotation.y),Math.cos(yaw-obj.rotation.y));obj.rotation.y+=delta*(1-Math.exp(-dt*14));}return true;}
 return {player,dog:player,model:dog,coffee,stop,perform,
  enabled(v){enabled=v;hud.hidden=!v;stop();},
  click(e,camera){if(!enabled)return;const r=canvas.getBoundingClientRect();ray.setFromCamera(new T.Vector2((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2),camera);const p=new T.Vector3();if(ray.ray.intersectPlane(plane,p)&&walkable(p.x,p.z)){autoCoffee=false;destination(p);}},
  key(e,down){const k=e.key.toLowerCase();if(!enabled)return false;if(['arrowleft','arrowright','arrowup','arrowdown','w','a','s','d'].includes(k)){e.preventDefault();if(down){keys.add(k);path=[];autoCoffee=false;marker.visible=false;stand();wake();}else keys.delete(k);return true;}if(down&&k==='e'&&near){interact.click();return true;}return false;},
  update(dt,camera){
   if(!enabled)return false;elapsed+=dt;
   const intent=keys.size>0||path.length>0;let moving=false;
   if(intent)stand();else idle+=dt;
   // Finish getting up before moving, so seated Puyol never slides across the floor.
   if(dog.userData.rig.sit<.08){
    if(keys.size){
     const x=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft')),z=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'));
     const yaw=Math.atan2(camera.position.x,camera.position.z),dx=x*Math.cos(yaw)+z*Math.sin(yaw),dz=-x*Math.sin(yaw)+z*Math.cos(yaw),length=Math.hypot(dx,dz)||1,nx=player.position.x+dx/length*dt*2,nz=player.position.z+dz/length*dt*2;
     if(walkable(nx,player.position.z))player.position.x=nx;if(walkable(player.position.x,nz))player.position.z=nz;
     if(x||z){const target=Math.atan2(dx,dz),delta=Math.atan2(Math.sin(target-player.rotation.y),Math.cos(target-player.rotation.y));player.rotation.y+=delta*(1-Math.exp(-dt*14));moving=true;}
    }else moving=advance(player,path,2,dt);
   }
   if(!path.length)marker.visible=false;
   if(forced&&elapsed>until){forced=null;idle=0;}
   const cycle=idle%24,action=intent?'stand':forced||(reduced?'stand':cycle>9&&cycle<14?'lick':cycle>4&&cycle<18?'sit':'stand');
   posePoodle3D(dog,elapsed,moving,reduced,action,dt);
   near=Math.hypot(player.position.x+5.2,player.position.z+2.2)<.65;interact.hidden=!near;go.hidden=near;
   const message=near?'Aquí empiezan las buenas pausas.':action==='lick'?'Puyol se está limpiando la patita.':action==='sit'?'Puyol se toma un descansito.':'Guía a Puyol con flechas o WASD · Arrastra para girar';
   if(status.textContent!==message)status.textContent=message;
   sitButton.setAttribute('aria-pressed',String(action==='sit'));groomButton.setAttribute('aria-pressed',String(action==='lick'));
   if(autoCoffee&&near&&!path.length)autoCoffee=false;
   return !reduced||moving||intent||Math.abs(dog.userData.rig.sit-(action==='stand'?0:1))>.002;
  }
 };
}

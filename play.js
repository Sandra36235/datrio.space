import * as T from './vendor/three.module.js';
import {route,walkable} from './walk.js';
import {createPoodle3D,posePoodle3D} from './poodle3d.js?v=tail-pom-1';
export function createWalk(room,canvas,onCoffee,wake,reduced){
 const player=new T.Group(),dog=createPoodle3D();room.add(player);player.add(dog);player.position.set(2.6,.04,2);
 const shadow=new T.Mesh(new T.CircleGeometry(.42,32),new T.MeshBasicMaterial({color:'#65554a',transparent:true,opacity:.16,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.015;shadow.scale.y=1.35;player.add(shadow);
 const marker=new T.Mesh(new T.RingGeometry(.13,.19,24),new T.MeshBasicMaterial({color:'#e99c29',side:T.DoubleSide}));marker.rotation.x=-Math.PI/2;marker.position.y=.055;marker.visible=false;room.add(marker);
 const ray=new T.Raycaster(),plane=new T.Plane(new T.Vector3(0,1,0),0),keys=new Set();let path=[],phase=0,enabled=true,near=false,autoCoffee=false;
 const hud=document.createElement('div');hud.className='walk-hud';hud.innerHTML='<span class="walk-status" aria-live="polite">Toca el suelo para guiar a mi poodle.</span><button class="coffee-walk">Vamos por un café ↗</button><button class="coffee-open" hidden>Preparar una pausa · E</button>';canvas.parentElement.append(hud);
 const status=hud.querySelector('.walk-status'),go=hud.querySelector('.coffee-walk'),interact=hud.querySelector('.coffee-open');
 function stop(){keys.clear();path=[];marker.visible=false;autoCoffee=false}
 function destination(p){path=route(player.position,p);if(path.length){marker.position.set(p.x,.055,p.z);marker.visible=true;wake()}else status.textContent='Elige un lugar libre del suelo.'}
 function coffee(){autoCoffee=true;destination({x:-5.2,z:-2.2})}go.onclick=coffee;interact.onclick=()=>{stop();onCoffee()};
 function advance(obj,list,speed,dt){if(!list.length)return false;const p=list[0],dx=p.x-obj.position.x,dz=p.z-obj.position.z,d=Math.hypot(dx,dz),s=speed*dt;if(d<=s){obj.position.x=p.x;obj.position.z=p.z;list.shift()}else{obj.position.x+=dx/d*s;obj.position.z+=dz/d*s}if(d>.001)obj.rotation.y=Math.atan2(dx,dz);return true}
 return {player,dog:player,model:dog,coffee,stop,
  enabled(v){enabled=v;hud.hidden=!v;stop()},
  click(e,camera){if(!enabled)return;const r=canvas.getBoundingClientRect();ray.setFromCamera(new T.Vector2((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2),camera);const p=new T.Vector3();if(ray.ray.intersectPlane(plane,p)&&walkable(p.x,p.z)){autoCoffee=false;destination(p)}},
  key(e,down){const k=e.key.toLowerCase();if(!enabled)return false;if(['arrowleft','arrowright','arrowup','arrowdown','w','a','s','d'].includes(k)){e.preventDefault();if(down){keys.add(k);path=[];autoCoffee=false;marker.visible=false;wake()}else keys.delete(k);return true}if(down&&k==='e'&&near){interact.click();return true}return false},
  update(dt,camera){if(!enabled)return false;phase+=dt*9;let moving=false;
   if(keys.size){let x=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft')),z=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'));const yaw=Math.atan2(camera.position.x,camera.position.z),dx=x*Math.cos(yaw)+z*Math.sin(yaw),dz=-x*Math.sin(yaw)+z*Math.cos(yaw),length=Math.hypot(dx,dz)||1,nx=player.position.x+dx/length*dt*2,nz=player.position.z+dz/length*dt*2;if(walkable(nx,player.position.z))player.position.x=nx;if(walkable(player.position.x,nz))player.position.z=nz;if(x||z){player.rotation.y=Math.atan2(dx,dz);moving=true}}
   else moving=advance(player,path,2,dt);
   if(!path.length)marker.visible=false;
   posePoodle3D(dog,phase,moving,reduced);
   near=Math.hypot(player.position.x+5.2,player.position.z+2.2)<.65;interact.hidden=!near;go.hidden=near;status.textContent=near?'Aquí empiezan las buenas pausas.':'Guía al poodle con flechas o WASD · Arrastra para girar';
   if(autoCoffee&&near&&!path.length)autoCoffee=false;return moving||keys.size>0||path.length>0;
  }
 };
}

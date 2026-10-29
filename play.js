import * as T from './vendor/three.module.js';
import {route,walkable} from './walk.js?v=living-room-1';
import {createPoodle3D,posePoodle3D} from './poodle3d.js?v=activities-6';
import {activities,createActivities} from './activities.js?v=activities-6';

export function createWalk(room,canvas,onCoffee,wake,reduced){
 const player=new T.Group(),dog=createPoodle3D();room.add(player);player.add(dog);player.position.set(2.6,.04,2);
 const shadow=new T.Mesh(new T.CircleGeometry(.42,32),new T.MeshBasicMaterial({color:'#65554a',transparent:true,opacity:.16,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.015;shadow.scale.y=1.35;player.add(shadow);
 const marker=new T.Mesh(new T.RingGeometry(.13,.19,24),new T.MeshBasicMaterial({color:'#e99c29',side:T.DoubleSide}));marker.rotation.x=-Math.PI/2;marker.position.y=.055;marker.visible=false;room.add(marker);
 const scenes=createActivities(room,player,dog);
 const ray=new T.Raycaster(),plane=new T.Plane(new T.Vector3(0,1,0),0),keys=new Set();
 let path=[],elapsed=0,idle=0,enabled=true,near=false,pending=null,forced=null,until=0;
 const hud=document.createElement('div');hud.className='walk-hud';
 hud.innerHTML='<span class="walk-status" aria-live="polite">Toca el suelo para guiar a Puyol.</span><div class="puyol-menu" id="puyol-activities" aria-label="Actividades de Puyol" hidden><button type="button" data-activity="coffee">☕ Preparar café</button><button type="button" data-activity="chess">♟ Jugar ajedrez</button><button type="button" data-activity="music">♫ Tocar ukulele</button><button type="button" data-activity="read">▤ Leer Kindle</button><button type="button" data-activity="sit">Siéntate</button><button type="button" data-activity="lick">Límpiate la patita</button></div><button type="button" class="activity-toggle" aria-expanded="false" aria-controls="puyol-activities">Jugar con Puyol ✦</button><button type="button" class="coffee-walk">Vamos por un café ↗</button><button type="button" class="coffee-open" hidden>Más sobre el café · E</button>';
 canvas.parentElement.append(hud);
 const status=hud.querySelector('.walk-status'),go=hud.querySelector('.coffee-walk'),interact=hud.querySelector('.coffee-open');
 const menu=hud.querySelector('.puyol-menu'),toggle=hud.querySelector('.activity-toggle');
 function closeMenu(){menu.hidden=true;toggle.setAttribute('aria-expanded','false');}
 toggle.onclick=()=>{menu.hidden=!menu.hidden;toggle.setAttribute('aria-expanded',String(!menu.hidden));};
 function cancelScene(){scenes.end();pending=null;}
 function stop(){keys.clear();path=[];marker.visible=false;cancelScene();closeMenu();}
 function stand(){forced=null;idle=0;}
 function perform(action){stop();forced=action;until=elapsed+9;wake();}
 function destination(p,activity=null){cancelScene();stand();if(activity){scenes.begin(activity);pending=activity;}path=route(player.position,p);if(path.length){marker.position.set(p.x,.055,p.z);marker.visible=true;wake();}else if(activity&&Math.hypot(player.position.x-p.x,player.position.z-p.z)<.35){scenes.arrive();pending=null;wake();}else{cancelScene();status.textContent='Elige un lugar libre del suelo.';}}
 function goActivity(name){const station=activities[name];if(!station)return;closeMenu();destination(station.destination,name);}
 menu.onclick=e=>{const action=e.target.closest('[data-activity]')?.dataset.activity;if(!action)return;if(action==='sit'||action==='lick')perform(action);else goActivity(action);};
 function coffee(){goActivity('coffee');}go.onclick=coffee;interact.onclick=()=>{stop();onCoffee();};
 function advance(obj,list,speed,dt){if(!list.length)return false;const p=list[0],dx=p.x-obj.position.x,dz=p.z-obj.position.z,d=Math.hypot(dx,dz),s=speed*dt;if(d<=s){obj.position.x=p.x;obj.position.z=p.z;list.shift();}else{obj.position.x+=dx/d*s;obj.position.z+=dz/d*s;}if(d>.001){const yaw=Math.atan2(dx,dz),delta=Math.atan2(Math.sin(yaw-obj.rotation.y),Math.cos(yaw-obj.rotation.y));obj.rotation.y+=delta*(1-Math.exp(-dt*14));}return true;}
 return {player,dog:player,model:dog,coffee,stop,perform,goActivity,
  get activity(){return scenes.ready?scenes.current:null;},
  enabled(v){enabled=v;hud.hidden=!v;stop();},
  click(e,camera){if(!enabled)return;const r=canvas.getBoundingClientRect();ray.setFromCamera(new T.Vector2((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2),camera);const p=new T.Vector3();if(ray.ray.intersectPlane(plane,p)&&walkable(p.x,p.z))destination(p);},
  key(e,down){const k=e.key.toLowerCase();if(!enabled)return false;if(down&&k==='escape'&&!menu.hidden){closeMenu();return true;}if(['arrowleft','arrowright','arrowup','arrowdown','w','a','s','d'].includes(k)){e.preventDefault();if(down){keys.add(k);path=[];marker.visible=false;cancelScene();stand();wake();}else keys.delete(k);return true;}if(down&&k==='e'&&near){interact.click();return true;}return false;},
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
   if(!path.length){marker.visible=false;if(pending&&!keys.size){scenes.arrive();pending=null;}}
   if(forced&&elapsed>until){forced=null;idle=0;}
   if(scenes.ready){const focus=activities[scenes.current].focus,target=Math.atan2(focus.x-player.position.x,focus.z-player.position.z),delta=Math.atan2(Math.sin(target-player.rotation.y),Math.cos(target-player.rotation.y));player.rotation.y+=delta*(1-Math.exp(-dt*7));}
   const cycle=idle%24,action=scenes.ready?(scenes.current==='coffee'?'brew':scenes.current):intent?'stand':forced||(reduced?'stand':cycle>9&&cycle<14?'lick':cycle>4&&cycle<18?'sit':'stand');
   posePoodle3D(dog,elapsed,moving,reduced,action,dt);
   scenes.update(dt,reduced);
   shadow.visible=!(scenes.ready&&(scenes.current==='coffee'||scenes.current==='read'));
   near=Math.hypot(player.position.x+5.6,player.position.z+.7)<.65;interact.hidden=!near;go.hidden=near;
   const message=scenes.ready?`${activities[scenes.current].label} con Puyol · Elige otra actividad cuando quieras.`:pending?`Puyol va hacia ${activities[pending].label.toLowerCase()}.`:near?'Aquí empiezan las buenas pausas.':action==='lick'?'Puyol se está limpiando la patita.':action==='sit'?'Puyol se toma un descansito.':'Guía a Puyol con flechas o WASD · Arrastra para girar';
   if(status.textContent!==message)status.textContent=message;
   menu.querySelectorAll('[data-activity]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.activity===action||button.dataset.activity===scenes.current)));
   return !reduced||moving||intent||Math.abs(dog.userData.rig.sit-(action==='stand'?0:1))>.002;
  }
 };
}

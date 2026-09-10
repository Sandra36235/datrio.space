const DEMO_KEY = 'datrio_async_demo_v1';
const EXPEDITION_KEY = 'datrio_async_demo_active';
const EXPEDITION_CODE_KEY = 'datrio_async_demo_code';
const seed = () => ({
 sectors: [{id:1,nombre:'Sector Alfa (demo)',nivel_contencion:'Bajo'},{id:2,nombre:'Sector Delta (demo)',nivel_contencion:'Alto'}],
 investigators: [{id:1,nombre:'Investigador de muestra A',codigo_empleado:'DEMO-01',especialidad:'Exploración'},{id:2,nombre:'Investigador de muestra B',codigo_empleado:'DEMO-02',especialidad:'Contención'}],
 equipment: [{id:1,nombre:'Radio',descripcion:'Equipo de demostración',stock_disponible:8,disponible_ahora:8},{id:2,nombre:'Traje protector',descripcion:'Equipo de demostración',stock_disponible:5,disponible_ahora:5},{id:3,nombre:'Cámara',descripcion:'Equipo de demostración',stock_disponible:4,disponible_ahora:4}],
 tariffs: [{id:1,nivel_riesgo:'Bajo',compensacion_economica:100,descripcion:'Valor ficticio de demostración'},{id:2,nivel_riesgo:'Moderado',compensacion_economica:250,descripcion:'Valor ficticio de demostración'},{id:3,nivel_riesgo:'Alto',compensacion_economica:500,descripcion:'Valor ficticio de demostración'}],
 expeditions: [], nextId:1
});
function readDemo(){try { return JSON.parse(sessionStorage.getItem(DEMO_KEY)) || seed(); } catch { return seed(); }}
function saveDemo(data){sessionStorage.setItem(DEMO_KEY,JSON.stringify(data));}
function getActiveExpedition(){return Number(sessionStorage.getItem(EXPEDITION_KEY)) || null;}
function setActiveExpedition(id,code){sessionStorage.setItem(EXPEDITION_KEY,String(id));sessionStorage.setItem(EXPEDITION_CODE_KEY,code);}
function getActiveExpeditionCode(){return sessionStorage.getItem(EXPEDITION_CODE_KEY)||'';}
function clearSession(){[DEMO_KEY,EXPEDITION_KEY,EXPEDITION_CODE_KEY].forEach(k=>sessionStorage.removeItem(k));}
async function requireAuth(){return {email:'Visitante · demostración'};}
function requireActiveExpedition(){const id=getActiveExpedition();if(!id)location.href='nueva.html';return id;}
function showMessage(text,success=false){const el=document.querySelector('#message');if(el){el.textContent=text;el.className=success?'message success':'message';}}
function wireLogout(){document.querySelector('#logout-button')?.addEventListener('click',()=>{clearSession();location.href='/';});}
function setWelcome(){const el=document.querySelector('#welcome-message');if(el)el.textContent='Antonio Nuñez · Datos ficticios';}
function goTo(page){location.href=page;}
async function api(path,options={}){
 const data=readDemo(), body=options.body?JSON.parse(options.body):{};
 if(path==='/expeditions/bootstrap')return data;
 if(path==='/expeditions'){
   let sector=data.sectors.find(s=>s.id===Number(body.sectorId));
   if(body.newSector){if(!body.newSector.nombre?.trim())throw Error('Escribí el nombre del sector.');sector={...body.newSector,id:Date.now()};data.sectors.push(sector);}
   const investigator=data.investigators.find(i=>i.id===Number(body.investigatorId));
   if(!sector||!investigator)throw Error('Seleccioná un sector y un investigador.');
   const expedition={id:data.nextId++,codigo:'DEMO-'+Date.now().toString().slice(-6),sector,investigator,reservations:[],tariff:null,estado:'Planificada (demo)'};
   data.expeditions.push(expedition);saveDemo(data);return {expedition};
 }
 const match=path.match(/^\/expeditions\/(\d+)\/(equipment|tariff|confirm|ticket)$/);
 if(!match)throw Error('Esta función no está disponible en la demo.');
 const expedition=data.expeditions.find(e=>e.id===Number(match[1]));
 if(!expedition)throw Error('Creá una expedición de demostración primero.');
 if(match[2]==='equipment'){
   const item=data.equipment.find(e=>e.id===Number(body.equipmentId)),quantity=Number(body.quantity);
   if(!item||!Number.isInteger(quantity)||quantity<1||quantity>item.disponible_ahora)throw Error('Cantidad no disponible.');
   item.disponible_ahora-=quantity;expedition.reservations.push({name:item.nombre,quantity});saveDemo(data);return {disponible_ahora:item.disponible_ahora};
 }
 if(match[2]==='tariff'){
   if(!expedition.reservations.length)throw Error('Reservá al menos un equipo antes de continuar.');
   const tariff=data.tariffs.find(t=>t.id===Number(body.tariffId));if(!tariff)throw Error('Seleccioná un riesgo válido.');
   expedition.tariff=tariff;saveDemo(data);return {tariff};
 }
 if(!expedition.tariff||!expedition.reservations.length)throw Error('Completá equipamiento y riesgo primero.');
 if(match[2]==='confirm'){expedition.estado='Confirmada (simulación)';saveDemo(data);return {};}
 return {ticket:{codigo:expedition.codigo,estado:expedition.estado,sector:expedition.sector.nombre,nivel_contencion:expedition.sector.nivel_contencion,investigador:expedition.investigator.nombre,nivel_riesgo:expedition.tariff.nivel_riesgo,compensacion_economica:expedition.tariff.compensacion_economica,equipamiento:expedition.reservations.map(r=>r.name+' × '+r.quantity).join(', ')}};
}

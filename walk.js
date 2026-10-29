// Navigation on the salon floor. Bounds include clearance for the character.
export const obstacles=[[5.6,6.65,-2.65,-1.4],[-7,-5.65,-4.9,-1.05],[-6.5,-3.9,-5.5,-4.6],[-3.95,-1.3,-5.5,-3.15],[-.95,4.2,-1.8,.5],[-2.9,-.8,-1.15,1.0],[-1.15,1.35,.55,3.05],[.6,5.65,-5.5,-4.15],[-7,-5.7,3.7,5.4],[5.6,6.8,-5.2,-3.8],[-6.95,-5.45,.55,3.15],[4.05,5.2,-1.05,.15],[5,6.6,1.75,3.35],[-.1,.7,-4.8,-4]];
export function walkable(x,z){return x>=-6.7&&x<=6.7&&z>=-5.25&&z<=5.3&&!obstacles.some(([a,b,c,d])=>x>=a&&x<=b&&z>=c&&z<=d)}
const step=.2;
const key=(x,z)=>`${x},${z}`;
export function route(from,to){
 const start=[Math.round(from.x/step),Math.round(from.z/step)],goal=[Math.round(to.x/step),Math.round(to.z/step)];
 if(!walkable(goal[0]*step,goal[1]*step))return [];
 const queue=[start],seen=new Map([[key(...start),null]]);let found;
 for(let i=0;i<queue.length;i++){const p=queue[i];if(p[0]===goal[0]&&p[1]===goal[1]){found=p;break}
 for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1]]){const q=[p[0]+dx,p[1]+dz],k=key(...q);if(!seen.has(k)&&walkable(q[0]*step,q[1]*step)){seen.set(k,p);queue.push(q)}}}
 if(!found)return [];const result=[];while(seen.get(key(...found))){result.push({x:found[0]*step,z:found[1]*step});found=seen.get(key(...found))}return result.reverse();
}

export const TRACKS=[
 {id:'ring',name:'Michelin Ring',place:'Circuit permanent',level:'Intermediar',color:'#294842',points:[[360,455],[180,455],[106,406],[100,265],[122,131],[232,83],[396,100],[440,169],[397,242],[459,282],[530,244],[527,146],[620,94],[768,105],[837,192],[812,276],[692,299],[655,376],[549,449]]},
 {id:'urban',name:'Urban Sprint',place:'Circuit stradal',level:'Tehnic',color:'#303e4c',points:[[355,446],[148,446],[103,363],[109,143],[190,90],[348,94],[383,163],[283,210],[299,275],[473,278],[514,187],[488,103],[654,89],[806,122],[824,225],[738,246],[732,362],[623,446]]},
 {id:'desert',name:'Desert GP',place:'Viteză în deșert',level:'Rapid',color:'#61543e',points:[[357,450],[171,433],[100,337],[115,175],[248,103],[453,86],[706,106],[817,171],[836,263],[746,308],[669,224],[575,197],[503,276],[606,379],[550,451]]},
 {id:'monaco',name:'Harbour Circuit',place:'Viraje de precizie',level:'Avansat',color:'#23494a',points:[[381,458],[199,442],[100,361],[128,256],[105,137],[224,83],[333,118],[307,210],[375,245],[429,156],[513,101],[605,113],[558,238],[654,272],[735,158],[821,163],[821,317],[679,365],[607,444]]},
 {id:'eight',name:'Crossroads',place:'Intersecție la nivel',level:'Expert',color:'#344632',points:[[450,275],[312,130],[191,107],[107,176],[102,350],[203,433],[323,383],[450,275],[580,140],[716,112],[817,184],[809,358],[701,432],[577,384]]}
];
export const TYRES=[
 {id:'soft',name:'Soft',label:'Aderență',grip:1.14,accel:91,max:233,color:'#ff646c',description:'Aderență mai bună în viraje. Viteză maximă mai mică.'},
 {id:'medium',name:'Medium',label:'Echilibrat',grip:1,accel:99,max:249,color:'#ffdb55',description:'Echilibru între accelerație, aderență și viteză.'},
 {id:'hard',name:'Hard',label:'Viteză',grip:.88,accel:105,max:267,color:'#e4edf5',description:'Rapid pe liniile drepte. Frânează mai devreme în viraje.'}
];
export type Sample={x:number;y:number;a:number;k:number;d:number};
export type Lane={samples:Sample[];length:number};
const cache=new Map<string,Lane[]>();
export function lanesFor(id:string):Lane[]{
 if(cache.has(id))return cache.get(id)!;
 const pts=(TRACKS.find(t=>t.id===id)||TRACKS[0]).points,raw:{x:number;y:number}[]=[];
 for(let i=0;i<pts.length;i++)for(let j=0;j<40;j++){
  const t=j/40,p0=pts[(i+pts.length-1)%pts.length],p1=pts[i],p2=pts[(i+1)%pts.length],p3=pts[(i+2)%pts.length];
  const v=(z:number)=>.5*((2*p1[z])+(-p0[z]+p2[z])*t+(2*p0[z]-5*p1[z]+4*p2[z]-p3[z])*t*t+(-p0[z]+3*p1[z]-3*p2[z]+p3[z])*t*t*t);
  raw.push({x:v(0),y:v(1)});
 }
 const result=[-9,9].map(offset=>{
  const arr=raw.map((p,i)=>{const b=raw[(i+raw.length-1)%raw.length],n=raw[(i+1)%raw.length],a=Math.atan2(n.y-b.y,n.x-b.x);return {x:p.x-Math.sin(a)*offset,y:p.y+Math.cos(a)*offset};});
  let d=0;const samples=arr.map((p,i)=>{if(i)d+=Math.hypot(p.x-arr[i-1].x,p.y-arr[i-1].y);const b=arr[(i+arr.length-2)%arr.length],n=arr[(i+2)%arr.length],a=Math.atan2(n.y-p.y,n.x-p.x),a0=Math.atan2(p.y-b.y,p.x-b.x),delta=Math.atan2(Math.sin(a-a0),Math.cos(a-a0));return {...p,a:Math.atan2(n.y-b.y,n.x-b.x),k:Math.abs(delta)/Math.max(1,(Math.hypot(n.x-p.x,n.y-p.y)+Math.hypot(p.x-b.x,p.y-b.y))/2),d};});
  return {samples,length:d+Math.hypot(arr[0].x-arr.at(-1)!.x,arr[0].y-arr.at(-1)!.y)};
 });cache.set(id,result);return result;
}
export function sample(lane:Lane,d:number):Sample{
 d=((d%lane.length)+lane.length)%lane.length;let l=0,r=lane.samples.length-1;
 while(l<r){const m=Math.ceil((l+r)/2);if(lane.samples[m].d<=d)l=m;else r=m-1;}
 const p=lane.samples[l],q=lane.samples[(l+1)%lane.samples.length],t=(d-p.d)/((q.d||lane.length)-p.d),da=Math.atan2(Math.sin(q.a-p.a),Math.cos(q.a-p.a));return {x:p.x+(q.x-p.x)*t,y:p.y+(q.y-p.y)*t,a:p.a+da*t,k:p.k+(q.k-p.k)*t,d};
}
export type Car={id:string;name:string;lane:number;tyre:string;distance:number;speed:number;respawn:number;grace:number;crashes:number;lapStart:number;lastLap:number;bestLap:number;finished:number|null;input:number};
export type Race={track:string;cars:Car[];time:number;countdown:number;target:number;status:'ready'|'countdown'|'racing'|'finished';winner:string|null;collisionCooldown:number;extra:boolean;reason?:string};
export function newRace(track:string,players:{id:string;name:string;lane:number;tyre:string}[]):Race{return {track,cars:players.map(p=>({...p,distance:0,speed:0,respawn:0,grace:0,crashes:0,lapStart:0,lastLap:0,bestLap:0,finished:null,input:0})),time:0,countdown:3,target:8,status:'countdown',winner:null,collisionCooldown:0,extra:false};}
export function limitAt(track:string,car:Car,ahead=0){const p=sample(lanesFor(track)[car.lane],car.distance+ahead),tyre=TYRES.find(t=>t.id===car.tyre)||TYRES[1];return Math.min(tyre.max,Math.sqrt(125*tyre.grip/Math.max(.001,p.k)));}
export function botInput(r:Race,c:Car){const target=Math.min(limitAt(r.track,c),limitAt(r.track,c,22),limitAt(r.track,c,45))*.88;return c.speed>target?-1:1;}
export function step(r:Race,dt:number){
 if(r.status==='finished'||r.status==='ready')return;
 if(r.status==='countdown'){r.countdown-=dt;if(r.countdown<=0){r.status='racing';r.countdown=0;}return;}
 r.time+=dt;r.collisionCooldown=Math.max(0,r.collisionCooldown-dt);const lanes=lanesFor(r.track);
 for(const c of r.cars){
  if(c.finished!==null)continue;
  if(c.respawn>0){c.respawn=Math.max(0,c.respawn-dt);c.speed=0;continue;}
  c.grace=Math.max(0,c.grace-dt);const t=TYRES.find(t=>t.id===c.tyre)||TYRES[1];
  c.speed=Math.max(0,Math.min(t.max,c.speed+(c.input===-1?-205:c.input===1?t.accel:-34)*dt));
  if(c.speed>limitAt(r.track,c)*1.035&&c.grace<=0){c.respawn=1;c.crashes++;c.speed=0;c.grace=.25;continue;}
  const prev=c.distance;c.distance+=c.speed*dt;const len=lanes[c.lane].length;
  if(Math.floor(c.distance/len)>Math.floor(prev/len)){
   const crossing=r.time-(c.distance-Math.floor(c.distance/len)*len)/Math.max(1,c.speed);c.lastLap=crossing-c.lapStart;c.lapStart=crossing;c.bestLap=c.bestLap?Math.min(c.bestLap,c.lastLap):c.lastLap;
   if(c.distance>=r.target*len)c.finished=crossing;
  }
 }
 if(r.track==='eight'&&r.collisionCooldown<=0&&r.cars.length===2){const[a,b]=r.cars,pa=sample(lanes[a.lane],a.distance),pb=sample(lanes[b.lane],b.distance);if(!a.respawn&&!b.respawn&&a.finished===null&&b.finished===null&&Math.hypot(pa.x-pb.x,pa.y-pb.y)<17&&Math.abs(Math.sin(pa.a-pb.a))>.35){for(const c of r.cars){c.speed=0;c.respawn=1;c.crashes++;}r.collisionCooldown=1.5;}}
 const done=r.cars.filter(c=>c.finished!==null);
 if(done.length){if(r.cars.length===2&&done.length===2&&Math.abs(done[0].finished!-done[1].finished!)<=.01){r.target++;r.extra=true;for(const c of r.cars)c.finished=null;}
 else if(r.cars.length===1||done.length===2||r.time-done[0].finished!>.02){r.winner=[...done].sort((a,b)=>a.finished!-b.finished!)[0].id;r.status='finished';}}
}
export function advance(r:Race,seconds:number){let left=seconds;while(left>0){const dt=Math.min(left,1/120);step(r,dt);left-=dt;}}
export function formatTime(s:number){if(!s)return '—';return `${Math.floor(s/60)}:${(s%60).toFixed(3).padStart(6,'0')}`;}

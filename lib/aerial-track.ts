import {lanesFor} from './race';
const backgrounds=new Map<string,HTMLCanvasElement>();
/** Static aerial scenery is rendered once per circuit, independently of physics. */
export function aerialTrack(id:string){
 if(backgrounds.has(id))return backgrounds.get(id)!;
 const canvas=document.createElement('canvas');canvas.width=1920;canvas.height=1100;
 const c=canvas.getContext('2d')!;c.scale(2,2);
 let seed=Array.from(id).reduce((a,b)=>a+b.charCodeAt(0),73);const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const lanes=lanesFor(id),mid=lanes[0].samples.map((p,i)=>({x:(p.x+lanes[1].samples[i].x)/2,y:(p.y+lanes[1].samples[i].y)/2}));
 const path=new Path2D();mid.forEach((p,i)=>i?path.lineTo(p.x,p.y):path.moveTo(p.x,p.y));path.closePath();
 const distance=(x:number,y:number)=>{let best=1e8;for(let i=0;i<mid.length;i+=3){const p=mid[i];best=Math.min(best,(x-p.x)**2+(y-p.y)**2);}return Math.sqrt(best);};
 const desert=id==='desert';c.fillStyle=desert?'#ab9568':'#5b703b';c.fillRect(0,0,960,550);
 for(let i=0;i<58000;i++){const x=random()*960,y=random()*550;c.fillStyle=desert?(i%2?'#ead3a42c':'#66513425'):(i%3?'#adc57421':'#203e272d');c.fillRect(x,y,random()*3+.4,random()*2+.3);}
 c.lineJoin='round';c.lineCap='round';
 // Gravel runoff, service verge, steel guardrails and red-white kerbs.
 for(const [width,color] of [[93,'#37412f'],[89,'#b0b7ad'],[85,'#4a5146'],[79,'#a18c68'],[65,'#718347'],[58,'#e2dfcf'],[49,'#262a2b']] as const){c.lineWidth=width;c.strokeStyle=color;c.stroke(path);}
 c.lineWidth=56;c.strokeStyle='#b53c32';c.setLineDash([11,12]);c.stroke(path);c.setLineDash([]);c.lineWidth=48;c.strokeStyle='#303334';c.stroke(path);
 c.save();c.lineWidth=44;c.strokeStyle='#424748';c.stroke(path);c.restore();
 // Fine aggregate is clipped to the actual asphalt footprint.
 const road=new Path2D();for(let i=0;i<mid.length;i++){const p=mid[i],n=mid[(i+1)%mid.length],a=Math.atan2(n.y-p.y,n.x-p.x);const x=p.x-Math.sin(a)*23,y=p.y+Math.cos(a)*23;i?road.lineTo(x,y):road.moveTo(x,y);}for(let i=mid.length-1;i>=0;i--){const p=mid[i],n=mid[(i+1)%mid.length],a=Math.atan2(n.y-p.y,n.x-p.x);road.lineTo(p.x+Math.sin(a)*23,p.y-Math.cos(a)*23);}road.closePath();
 c.save();c.clip(road,'evenodd');for(let i=0;i<42000;i++){c.fillStyle=i%2?'#d6d5cf16':'#080e121c';c.fillRect(random()*960,random()*550,1,1);}c.restore();
 for(const lane of lanes){const groove=new Path2D();lane.samples.forEach((p,i)=>i?groove.lineTo(p.x,p.y):groove.moveTo(p.x,p.y));groove.closePath();c.strokeStyle='#171d20';c.lineWidth=1.8;c.stroke(groove);c.strokeStyle='#b0aaa15e';c.lineWidth=.5;c.stroke(groove);}
 // Trees with overlapping crowns and consistent afternoon shadows.
 for(let i=0;i<760;i++){const x=8+random()*944,y=8+random()*534,r=4+random()*9;if(distance(x,y)<55+r||y>478&&x>250&&x<660)continue;if(desert&&random()>.18)continue;c.fillStyle='#10200f55';c.beginPath();c.ellipse(x+5,y+5,r+3,r*.8,0,0,Math.PI*2);c.fill();for(let j=0;j<7;j++){const angle=j*2.4,px=x+Math.cos(angle)*r*.4,py=y+Math.sin(angle)*r*.4;const g=c.createRadialGradient(px-2,py-2,0,px,py,r*.75);g.addColorStop(0,j%2?'#819b49':'#6a893d');g.addColorStop(.55,'#3d612d');g.addColorStop(1,'#233e24');c.fillStyle=g;c.beginPath();c.arc(px,py,r*.75,0,Math.PI*2);c.fill();}}
 // Pit buildings, roof ribs and paddock apron along the south boundary.
 c.fillStyle='#87867a';c.fillRect(264,492,390,48);
 for(let i=0;i<7;i++){const x=273+i*53;c.fillStyle='#17211f66';c.fillRect(x+5,503,47,29);c.fillStyle='#c3c4be';c.fillRect(x,497,46,26);c.fillStyle='#737e80';c.fillRect(x+3,500,40,20);c.strokeStyle='#adb5b3';c.lineWidth=1;for(let y=502;y<520;y+=4){c.beginPath();c.moveTo(x+3,y);c.lineTo(x+43,y);c.stroke();}c.fillStyle='#253b4d';c.fillRect(x+8,525,29,4);}
 // Grandstand roofs and tiny spectator rows, kept clear of the track.
 for(const x of [180,360,560,730]){if(distance(x,32)<65)continue;c.fillStyle='#182a3266';c.fillRect(x-42,14,92,34);c.fillStyle='#c8cdd1';c.fillRect(x-46,9,92,14);c.fillStyle='#31588d';c.fillRect(x-44,11,88,9);for(let y=27;y<43;y+=5)for(let xx=x-42;xx<x+43;xx+=4){c.fillStyle=random()>.5?'#c9bbaa':'#294367';c.fillRect(xx,y,2,3);}}
 c.fillStyle='#073e94';c.fillRect(377,530,202,17);c.font='italic bold 13px Arial';c.textAlign='center';c.fillStyle='#fff';c.fillText('MICHELIN  RACE CHALLENGE',478,543);c.textAlign='left';
 backgrounds.set(id,canvas);return canvas;
}

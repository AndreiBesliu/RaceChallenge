'use client';
import {useEffect,useRef} from 'react';
import {Race,TRACKS,lanesFor,sample} from '@/lib/race';
export default function RaceCanvas({race}:{race:Race}){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{const canvas=ref.current;if(!canvas)return;const ctx=canvas.getContext('2d');if(!ctx)return;const dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=960*dpr;canvas.height=550*dpr;ctx.scale(dpr,dpr);
 const t=TRACKS.find(x=>x.id===race.track)||TRACKS[0],lanes=lanesFor(race.track);ctx.fillStyle='#101e29';ctx.fillRect(0,0,960,550);
 ctx.strokeStyle='#1c2c36';ctx.lineWidth=1;for(let x=0;x<960;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,550);ctx.stroke();}for(let y=0;y<550;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(960,y);ctx.stroke();}
 const path=(ps:{x:number;y:number}[])=>{ctx.beginPath();ps.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();};
 const mid=lanes[0].samples.map((p,i)=>({x:(p.x+lanes[1].samples[i].x)/2,y:(p.y+lanes[1].samples[i].y)/2}));
 path(mid);ctx.lineJoin='round';ctx.lineCap='round';ctx.strokeStyle=t.color;ctx.lineWidth=86;ctx.stroke();ctx.strokeStyle='#101920';ctx.lineWidth=62;ctx.stroke();ctx.strokeStyle='#d7d9d3';ctx.lineWidth=54;ctx.stroke();ctx.setLineDash([13,13]);ctx.strokeStyle='#d7494f';ctx.stroke();ctx.setLineDash([]);ctx.strokeStyle='#303b47';ctx.lineWidth=45;ctx.stroke();ctx.strokeStyle='#58616b';ctx.lineWidth=1;ctx.setLineDash([4,7]);ctx.stroke();ctx.setLineDash([]);
 for(let lane=0;lane<2;lane++){path(lanes[lane].samples);ctx.strokeStyle=lane===0?'#d3b85135':'#60b8f235';ctx.lineWidth=1;ctx.stroke();}
 const start=sample(lanes[0],0);ctx.save();ctx.translate(start.x+Math.sin(start.a)*9,start.y-Math.cos(start.a)*9);ctx.rotate(start.a);for(let x=0;x<2;x++)for(let y=0;y<8;y++){ctx.fillStyle=(x+y)%2===0?'#e9edf2':'#111a25';ctx.fillRect(x*6-6,y*5.5-22,6,5.5);}ctx.restore();ctx.font='700 12px sans-serif';ctx.fillStyle='#84949e';ctx.fillText('START / FINISH',start.x-35,start.y+48);
 ctx.textAlign='center';ctx.font='italic 800 30px sans-serif';ctx.fillStyle='#dbe6ed';ctx.fillText('MICHELIN',465,340);ctx.font='600 11px sans-serif';ctx.fillStyle='#7f94a1';ctx.fillText('R A C E   C H A L L E N G E',465,360);ctx.textAlign='left';ctx.font='600 12px monospace';ctx.fillText('CIRCUIT '+String(TRACKS.indexOf(t)+1).padStart(2,'0'),30,32);ctx.fillText(t.name.toUpperCase(),30,51);ctx.textAlign='right';ctx.fillText('↑ N',930,35);ctx.textAlign='left';
 for(const c of race.cars){const p=sample(lanes[c.lane],c.distance);ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.a);if(c.respawn>0){ctx.globalAlpha=.42;ctx.rotate(c.respawn*3);ctx.translate(12,15);}ctx.shadowColor='#000a';ctx.shadowBlur=5;ctx.fillStyle='#090e14';ctx.fillRect(-9,-9,7,5);ctx.fillRect(-9,4,7,5);ctx.fillRect(5,-9,6,5);ctx.fillRect(5,4,6,5);ctx.fillStyle=c.lane===0?'#ffe052':'#5ac7ff';ctx.fillRect(-11,-8,3,16);ctx.fillRect(-9,-4,16,8);ctx.beginPath();ctx.moveTo(7,-3);ctx.lineTo(16,0);ctx.lineTo(7,3);ctx.fill();ctx.fillRect(11,-8,3,16);ctx.fillStyle='#1d2935';ctx.fillRect(-1,-3,5,6);ctx.fillStyle='#fff';ctx.fillRect(0,-2,2,4);ctx.restore();if(c.respawn>0){ctx.fillStyle='#fff';ctx.font='bold 13px monospace';ctx.fillText(c.respawn.toFixed(1)+'s',p.x+15,p.y-15);}}
 },[race]);
 return <canvas ref={ref} className="race-canvas" aria-label="Circuit văzut complet de sus. Controlează mașina cu săgețile sus și jos."/>;
}

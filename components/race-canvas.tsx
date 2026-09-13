'use client';
import {useEffect,useRef} from 'react';
import {Race,TRACKS,lanesFor,sample} from '@/lib/race';
import {aerialTrack} from '@/lib/aerial-track';
export default function RaceCanvas({race}:{race:Race}){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{const canvas=ref.current;if(!canvas)return;const ctx=canvas.getContext('2d');if(!ctx)return;const dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=960*dpr;canvas.height=550*dpr;ctx.scale(dpr,dpr);
 const lanes=lanesFor(race.track);ctx.drawImage(aerialTrack(race.track),0,0,960,550);
 const start=sample(lanes[0],0);ctx.save();ctx.translate(start.x+Math.sin(start.a)*9,start.y-Math.cos(start.a)*9);ctx.rotate(start.a);for(let x=0;x<2;x++)for(let y=0;y<8;y++){ctx.fillStyle=(x+y)%2===0?'#e9edf2':'#111a25';ctx.fillRect(x*6-6,y*5.5-22,6,5.5);}ctx.restore();ctx.font='700 12px sans-serif';ctx.fillStyle='#84949e';ctx.fillText('START / FINISH',start.x-35,start.y+48);
 for(const c of race.cars){const p=sample(lanes[c.lane],c.distance);ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.a);if(c.respawn>0){ctx.globalAlpha=.42;ctx.rotate(c.respawn*3);ctx.translate(12,15);}ctx.shadowColor='#000a';ctx.shadowBlur=5;ctx.fillStyle='#090e14';ctx.fillRect(-9,-9,7,5);ctx.fillRect(-9,4,7,5);ctx.fillRect(5,-9,6,5);ctx.fillRect(5,4,6,5);ctx.fillStyle=c.lane===0?'#ffe052':'#5ac7ff';ctx.fillRect(-11,-8,3,16);ctx.fillRect(-9,-4,16,8);ctx.beginPath();ctx.moveTo(7,-3);ctx.lineTo(16,0);ctx.lineTo(7,3);ctx.fill();ctx.fillRect(11,-8,3,16);ctx.fillStyle='#1d2935';ctx.fillRect(-1,-3,5,6);ctx.fillStyle='#fff';ctx.fillRect(0,-2,2,4);ctx.restore();if(c.respawn>0){ctx.fillStyle='#fff';ctx.font='bold 13px monospace';ctx.fillText(c.respawn.toFixed(1)+'s',p.x+15,p.y-15);}}
 },[race]);
 return <canvas ref={ref} className="race-canvas" aria-label="Circuit văzut complet de sus. Controlează mașina cu săgețile sus și jos."/>;
}

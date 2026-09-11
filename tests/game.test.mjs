
import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,mkdirSync} from 'node:fs';
import {build} from 'esbuild';
import {newRace,advance,step,lanesFor,limitAt,botInput,TRACKS} from '../lib/race.ts';
mkdirSync('work',{recursive:true});
await build({entryPoints:['lib/game-service.ts'],bundle:true,platform:'node',format:'esm',outfile:'work/service-test.mjs'});
const {GameService}=await import('../work/service-test.mjs');
function fixture(){
 const sqlite=new DatabaseSync(':memory:');sqlite.exec(readFileSync('drizzle/0000_thin_micromacro.sql','utf8'));
 const db={prepare(sql){return {bind(...args){return {first:async()=>sqlite.prepare(sql).get(...args)||null,all:async()=>({results:sqlite.prepare(sql).all(...args)}),run:async()=>({meta:{changes:Number(sqlite.prepare(sql).run(...args).changes)}})};}};},async batch(qs){sqlite.exec('BEGIN');try{const results=[];for(const q of qs)results.push(await q.run());sqlite.exec('COMMIT');return results;}catch(e){sqlite.exec('ROLLBACK');throw e;}}};
 const at=(id,time=100000)=>new GameService(db,id,time);
 return {sqlite,db,at};
}
const two=[{id:'a',name:'A',lane:0,tyre:'medium'},{id:'b',name:'B',lane:1,tyre:'soft'}];
test('Every circuit has finite, closed lane geometry and a bot can finish 8 laps',()=>{
 for(const t of TRACKS){const lanes=lanesFor(t.id);assert.equal(lanes.length,2);for(const l of lanes){assert.ok(l.length>1500);assert.ok(l.samples.every(p=>Object.values(p).every(Number.isFinite)));}
 const r=newRace(t.id,[two[0]]);for(let n=0;n<120*360&&r.status!=='finished';n++){r.cars[0].input=botInput(r,r.cars[0]);step(r,1/120);}assert.equal(r.status,'finished',t.name);assert.ok(r.cars[0].bestLap>10);assert.ok(r.cars[0].distance>=8*lanes[0].length);}
});
test('Acceleration is gradual, coasting slows, braking slows faster',()=>{
 const r=newRace('desert',[two[0]]);r.status='racing';r.cars[0].input=1;advance(r,.3);const speed=r.cars[0].speed;assert.ok(speed>20&&speed<40);const coast=structuredClone(r),brake=structuredClone(r);coast.cars[0].input=0;brake.cars[0].input=-1;advance(coast,.1);advance(brake,.1);assert.ok(coast.cars[0].speed<speed);assert.ok(brake.cars[0].speed<coast.cars[0].speed);
});
test('Excessive corner speed causes exactly one second of respawn at the same distance',()=>{
 const r=newRace('ring',[two[0]]);r.status='racing';const c=r.cars[0],curve=lanesFor('ring')[0].samples.reduce((a,b)=>a.k>b.k?a:b);c.distance=curve.d;c.speed=240;c.input=1;const d=c.distance;step(r,1/120);assert.equal(c.respawn,1);assert.equal(c.distance,d);advance(r,.99);assert.equal(c.distance,d);assert.equal(c.speed,0);advance(r,.03);assert.ok(c.distance>d);assert.equal(c.crashes,1);
});
test('Soft tyres permit more speed through the same curve than hard tyres',()=>{
 const c=newRace('ring',[two[0]]).cars[0];c.distance=lanesFor('ring')[0].samples.reduce((a,b)=>a.k>b.k?a:b).d;c.tyre='soft';const s=limitAt('ring',c);c.tyre='hard';assert.ok(s>limitAt('ring',c));
});
test('A photo finish adds a ninth lap and retains speed',()=>{
 const r=newRace('desert',two);r.status='racing';r.time=170;for(const c of r.cars){c.distance=lanesFor(r.track)[c.lane].length*8-.05;c.speed=40;c.input=0;}step(r,.005);assert.equal(r.target,9);assert.equal(r.status,'racing');assert.equal(r.winner,null);assert.ok(r.cars.every(c=>c.speed>0&&c.finished===null));
});
test('Profile identity, authorization, invitation ownership and lane selection',async()=>{
 const {at,sqlite}=fixture();await assert.rejects(()=>at(null).me(),e=>e.status===401);
 const a=await at('a').me(),b=await at('b').me();assert.equal(a.admin,1);assert.equal(b.admin,0);
 await at('b').profile({name:'Pilot B',country:'România',avatar:'B',tyre:'hard'});
 await assert.rejects(()=>at('b').createTournament({}),e=>e.status===403);
 const r=await at('a').challenge({target:'b',track:'ring',tyre:'medium'});
 await assert.rejects(()=>at('a').accept({id:r.id,lane:0,tyre:'soft'}));
 await assert.rejects(()=>at('intruder').tick({id:r.id,input:1}),e=>e.status===403);
 await at('b').accept({id:r.id,lane:0,tyre:'soft'});
 const d=JSON.parse(sqlite.prepare('SELECT data FROM rooms WHERE id=?').get(r.id).data);
 assert.equal(d.race.cars[1].lane,0);assert.equal(d.race.cars[0].lane,1);assert.equal(d.race.cars[1].tyre,'soft');
 assert.equal(sqlite.prepare('SELECT COUNT(*) n FROM locks').get().n,2);
});
test('Concurrent settlement cannot award points twice; record survives a crash',async()=>{
 const {at,sqlite}=fixture();await at('a').me();await at('b').me();const {id}=await at('a').challenge({target:'b',track:'ring',tyre:'medium'});await at('b').accept({id,lane:1,tyre:'soft'});
 const row=sqlite.prepare('SELECT * FROM rooms WHERE id=?').get(id),d=JSON.parse(row.data);d.race.status='finished';d.race.winner='a';d.race.time=190;d.race.cars[0].bestLap=22;d.race.cars[0].finished=190;d.race.cars[0].crashes=3;d.race.cars[1].bestLap=25;
 sqlite.prepare("UPDATE rooms SET status='finished',data=? WHERE id=?").run(JSON.stringify(d),id);
 await at('a').tick({id,input:0});await at('b').tick({id,input:0});await at('a').tick({id,input:0});
 assert.equal(sqlite.prepare("SELECT points FROM players WHERE id='a'").get().points,3);assert.equal(sqlite.prepare("SELECT points FROM players WHERE id='b'").get().points,-3);assert.equal(sqlite.prepare('SELECT COUNT(*) n FROM results').get().n,1);assert.equal(sqlite.prepare('SELECT COUNT(*) n FROM records').get().n,2);assert.equal(sqlite.prepare('SELECT COUNT(*) n FROM locks').get().n,0);
});
test('Server rejects forged commands and pauses/resumes both cars after signal loss',async()=>{
 const {at}=fixture();await at('a').me();await at('b').me();const {id}=await at('a').challenge({target:'b',track:'ring',tyre:'medium'});await at('b').accept({id,lane:1,tyre:'soft'});
 await assert.rejects(()=>at('a',100100).tick({id,input:200}),e=>e.status===400);
 let d=await at('a',101500).tick({id,input:1});assert.equal(d.paused,true);const progress=d.race.time;
 d=await at('b',101600).tick({id,input:1});assert.equal(d.paused,false);assert.equal(d.race.time,progress);assert.ok(d.race.cars.every(c=>c.input===0));
});
test('Ten seconds without reconnect yields one forfeit and exactly +3/-3',async()=>{
 const {at,sqlite}=fixture();await at('a').me();await at('b').me();const {id}=await at('a').challenge({target:'b',track:'ring',tyre:'medium'});await at('b').accept({id,lane:1,tyre:'soft'});
 for(let t=100800;t<111000;t+=800)await at('a',t).tick({id,input:0});const d=await at('a',111100).tick({id,input:0});assert.equal(d.race.status,'finished');assert.equal(d.race.winner,'a');assert.equal(sqlite.prepare("SELECT points FROM players WHERE id='b'").get().points,-3);
});
test('Private messages are isolated from other users and tournament channels require membership',async()=>{
 const {at}=fixture();for(const id of ['a','b','c'])await at(id).me();await at('a').message({channel:'dm:b',body:'private test'});assert.equal((await at('b').chat('dm:a')).messages.length,1);assert.equal((await at('c').chat('dm:a')).messages.length,0);await assert.rejects(()=>at('c').chat('tournament:missing'),e=>e.status===403);await assert.rejects(()=>at('a').message({channel:'Global',body:'a'.repeat(501)}));
});
test('Tournament capacity, bracket progression and season reset retain total points',async()=>{
 const {at,sqlite}=fixture();for(const id of ['a','b','c'])await at(id).me();const {id}=await at('a').createTournament({name:'Test Cup',track:'ring',starts:110000,max:2,rules:'8 laps'});
 await at('a').join({id});await at('b').join({id});await assert.rejects(()=>at('c').join({id}));await at('a',110001).lobby();let t=sqlite.prepare('SELECT * FROM tournaments WHERE id=?').get(id);assert.equal(t.status,'running');const pair=JSON.parse(t.data).pairs[0];await at(pair.b,110100).accept({id:pair.room,lane:1,tyre:'medium'});
 const row=sqlite.prepare('SELECT * FROM rooms WHERE id=?').get(pair.room),d=JSON.parse(row.data);d.race.status='finished';d.race.winner=pair.a;d.race.time=180;d.race.cars[0].bestLap=21;
 sqlite.prepare("UPDATE rooms SET status='finished',data=? WHERE id=?").run(JSON.stringify(d),pair.room);await at(pair.a,110200).tick({id:pair.room,input:0});await at('a',110300).lobby();t=sqlite.prepare('SELECT * FROM tournaments WHERE id=?').get(id);assert.equal(t.status,'finished');assert.equal(t.winner,pair.a);
 const before=sqlite.prepare('SELECT points FROM players WHERE id=?').get(pair.a).points;await at('a',110400).newSeason({name:'Season 02'});const l=await at('a',110500).lobby();assert.equal(l.season.name,'Season 02');assert.ok(l.standings.every(p=>p.points===0));assert.equal(sqlite.prepare('SELECT points FROM players WHERE id=?').get(pair.a).points,before);assert.equal(sqlite.prepare('SELECT titles FROM players WHERE id=?').get(pair.a).titles,1);
});


test('A complete authoritative duel reaches the finish and writes one result',async()=>{
 const {at,sqlite}=fixture();await at('a').me();await at('b').me();const {id}=await at('a').challenge({target:'b',track:'desert',tyre:'medium'});await at('b').accept({id,lane:1,tyre:'soft'});
 let data=JSON.parse(sqlite.prepare('SELECT data FROM rooms WHERE id=?').get(id).data),clock=100000;
 for(let n=0;n<2000&&data.race.status!=='finished';n++){clock+=180;for(const uid of ['a','b']){const car=data.race.cars.find(c=>c.id===uid);data=await at(uid,clock).tick({id,input:botInput(data.race,car)});}}
 assert.equal(data.race.status,'finished');assert.ok(data.race.time>100);assert.equal(sqlite.prepare('SELECT COUNT(*) n FROM results').get().n,1);assert.ok(sqlite.prepare('SELECT COUNT(*) n FROM records').get().n>0);
});
test('Two cars colliding at a figure-eight intersection both respawn',()=>{
 const r=newRace('eight',two);r.status='racing';const lanes=lanesFor('eight');let closest=null;
 for(const a of lanes[0].samples)for(const b of lanes[1].samples){if(Math.abs(a.d-b.d)<lanes[0].length*.25||Math.abs(Math.sin(a.a-b.a))<.35)continue;const d=Math.hypot(a.x-b.x,a.y-b.y);if(!closest||d<closest.d)closest={a,b,d};}
 assert.ok(closest.d<17);r.cars[0].distance=closest.a.d;r.cars[1].distance=closest.b.d;for(const c of r.cars)c.speed=20;step(r,1/120);assert.ok(r.cars.every(c=>c.respawn===1&&c.crashes===1));
});


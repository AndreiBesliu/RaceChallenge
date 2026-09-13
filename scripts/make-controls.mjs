import sharp from 'sharp';
import {mkdir} from 'node:fs/promises';
await mkdir('public/controls',{recursive:true});
for(const [name,color,shape] of [['accelerate','#ffdc22','<path d="M64 24 99 62H78v39H50V62H29Z"/>'],['brake','#ffffff','<path d="m64 104 35-38H78V27H50v39H29Z"/>']]){
 await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><g fill="${color}" stroke="#082a56" stroke-width="4" stroke-linejoin="round">${shape}</g></svg>`)).png().toFile(`public/controls/${name}.png`);
}

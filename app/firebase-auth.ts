import {env} from 'cloudflare:workers';
export type FirebaseUser={userId:string;displayName:string;email:string;fullName:string|null};
export async function getFirebaseUser(req:Request):Promise<FirebaseUser|null>{
 const h=req.headers.get('authorization')||'';if(!h.startsWith('Bearer '))return null;
 try{const key=(env as any).FIREBASE_API_KEY;if(!key)return null;const r=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(key)}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({idToken:h.slice(7)})});if(!r.ok)return null;const b:any=await r.json(),u=b.users?.[0];if(!u?.localId||!u.email)return null;return {userId:u.localId,email:u.email,displayName:u.displayName||u.email,fullName:u.displayName||null};}catch{return null;}
}

// Synthetic provider only. Production always uses the official SDK, not these proofs.
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
import http from 'node:http';
// Node fetch normalizes Host; this local-only transport exercises the exact
// production Host/Origin checks without weakening them for test addresses.
export function fixtureFetch(url,options={}){return new Promise((resolve,reject)=>{const request=http.request(url,{method:options.method||'GET',headers:options.headers||{}},response=>{const chunks=[];response.on('data',x=>chunks.push(x));response.on('end',()=>{const headers=new Headers();for(let i=0;i<response.rawHeaders.length;i+=2)headers.append(response.rawHeaders[i],response.rawHeaders[i+1]);resolve(new Response(Buffer.concat(chunks),{status:response.statusCode,headers}));});});request.on('error',reject);request.end(options.body);});}
const fetch=fixtureFetch;
export const owner='did:plc:aaaaaaaaaaaaaaaaaaaaaaaa',stranger='did:plc:bbbbbbbbbbbbbbbbbbbbbbbb';
export const origin='https://pixie-project-companion-production.up.railway.app';
export const host=new URL(origin).host;
export function syntheticProvider(now=Date.now){
 let revokeFails=false,expired=false;const options=[];
 return {options,setExpired:value=>{expired=value;},setRevokeFailure:value=>{revokeFails=value;},factory:async config=>{
  options.push(config);
  const session=did=>({did,async getTokenInfo(){const record=await config.sessionStore.get(did);if(!record)throw Error('Synthetic token revoked.');return {sub:did,expired:expired||record.until<=now()};},async signOut(){await config.sessionStore.del(did);}});
  return {async authorize(did,opts){assert.equal(did,owner);const state=randomUUID();await config.stateStore.set(state,{appState:opts.state,synthetic:true});return new URL('https://identity.example.test/authorize?state='+state);},async callback(params){const state=params.get('state'),saved=await config.stateStore.get(state);if(!saved||params.get('iss')!=='https://identity.example.test'||!['owner','stranger'].includes(params.get('code')))throw Error('Synthetic callback rejected.');await config.stateStore.del(state);const did=params.get('code')==='owner'?owner:stranger;await config.sessionStore.set(did,{did,until:now()+12*60*60_000,syntheticToken:'never-expose-this-fixture-token'});return {session:session(did),state:saved.appState};},async restore(did){if(!await config.sessionStore.get(did))throw Error('No synthetic OAuth session.');return session(did);},async revoke(did){if(revokeFails)throw Error('Synthetic provider unavailable.');await config.sessionStore.del(did);}};
 }};
}
export function cookieJar(){const values=new Map();return {header:()=>[...values].map(([k,v])=>k+'='+v).join('; '),take(response){for(const value of response.headers.getSetCookie()){const [pair]=value.split(';');const i=pair.indexOf('=');values.set(pair.slice(0,i),pair.slice(i+1));}}};}
export async function login(base,jar=cookieJar(),code='owner'){
 const headers={Host:host};let response=await fetch(base+'/api/auth/session',{headers:{...headers,Cookie:jar.header()}});assert.equal(response.status,200);jar.take(response);const status=await response.json();
 response=await fetch(base+'/api/auth/login',{method:'POST',headers:{...headers,Origin:origin,Cookie:jar.header(),'X-Pixie-CSRF':status.csrf,'Content-Type':'application/json'},body:JSON.stringify({ownerDid:stranger,redirect_uri:'https://evil.example/'})});assert.equal(response.status,200);const state=new URL((await response.json()).url).searchParams.get('state');
 const callback='/?state='+state+'&code='+code+'&iss='+encodeURIComponent('https://identity.example.test');
 response=await fetch(base+callback,{headers:{...headers,Cookie:jar.header()},redirect:'manual'});jar.take(response);
 if(code!=='owner')return {response,jar,callback};
 assert.equal(response.status,303);assert.equal(response.headers.get('Location'),'/#account');
 const ready=await fetch(base+'/api/auth/session',{headers:{...headers,Cookie:jar.header()}});const current=await ready.json();assert.equal(current.session.did,owner);
 return {response,jar,csrf:current.csrf,callback};
}

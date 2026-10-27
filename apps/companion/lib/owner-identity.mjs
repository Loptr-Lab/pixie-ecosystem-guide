import {createHash,randomBytes,timingSafeEqual} from 'node:crypto';
import path from 'node:path';
import {readFile} from 'node:fs/promises';
import {identityStore} from './identity-store.mjs';
import {railwayIdentityOrigin} from './identity-origin.mjs';
import {serverFetch} from './server-fetch.mjs';
const lifetime=8*60*60_000,loginLifetime=10*60_000;
const cookieName='__Host-pixie-owner',loginCookie='__Host-pixie-login';
const nonce=()=>randomBytes(32).toString('base64url');
const hash=value=>createHash('sha256').update(value).digest('hex');
const equal=(a,b)=>typeof a==='string'&&typeof b==='string'&&Buffer.byteLength(a)===Buffer.byteLength(b)&&timingSafeEqual(Buffer.from(a),Buffer.from(b));
const fail=(status,message)=>Object.assign(Error(message),{status});
function cookie(request,name){const values=String(request.headers.cookie||'').split(';').map(x=>x.trim()).filter(x=>x.startsWith(name+'='));if(values.length!==1)return '';const value=values[0].slice(name.length+1);return /^[A-Za-z0-9_-]{43}$/.test(value)?value:'';}
function setCookie(name,value,maxAge){return name+'='+value+'; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age='+maxAge;}
export function ownerIdentityConfiguration(env){
 if(!env.PIXIE_SESSION_SECRET)return null;
 if(env.PIXIE_OWNER_DID&&!/^did:(plc:[a-z2-7]{24}|web:[A-Za-z0-9._%:-]+)$/.test(env.PIXIE_OWNER_DID))throw Error('Invalid administrative DID.');
 if(!/^[a-f0-9]{64}$/.test(env.PIXIE_SESSION_SECRET||'')||env.PIXIE_SESSION_SECRET===env.PIXIE_MCP_TOKEN)throw Error('Configure a separate identity encryption key.');
 if(!env.PIXIE_DATA_FILE||!path.isAbsolute(env.PIXIE_DATA_FILE))throw Error('Identity storage requires the configured private workspace path.');
 return {ownerDid:env.PIXIE_OWNER_DID||null,secret:env.PIXIE_SESSION_SECRET,file:path.join(path.dirname(env.PIXIE_DATA_FILE),'identity.enc')};
}
export function createOwnerIdentity({ownerDid,secret,file,now=Date.now,oauthFactory}={}){
 const store=identityStore(file,secret,now);let clientPromise;
 async function client(){return clientPromise||(clientPromise=(async()=>{
  const metadata=JSON.parse(await readFile(new URL('../public/oauth-client-metadata-railway.json',import.meta.url),'utf8'));
  const options={clientMetadata:metadata,stateStore:store.stateStore,sessionStore:store.sessionStore,responseMode:'query'};
  if(oauthFactory)return oauthFactory(options);
  const {NodeOAuthClient,requestLocalLock}=await import('@atproto/oauth-client-node');
  return new NodeOAuthClient({...options,requestLock:requestLocalLock,fetch:(url,init={})=>serverFetch(url,{...init,signal:init.signal?AbortSignal.any([init.signal,AbortSignal.timeout(10_000)]):AbortSignal.timeout(10_000)})});
 })());}
 function sameOrigin(request){if(request.headers.origin!==railwayIdentityOrigin||request.headers.host!==new URL(railwayIdentityOrigin).host||request.headers['sec-fetch-site']==='cross-site')throw fail(403,'Invalid identity origin.');}
 function trustedHost(request){if(request.headers.host!==new URL(railwayIdentityOrigin).host)throw fail(403,'Invalid identity host.');}
 async function current(request){
  const id=cookie(request,cookieName);if(!id)return null;
  const key=hash(id),record=await store.transaction(s=>s.browsers[key]);
  if(!record||!record.did)return null;
  try{const session=await(await client()).restore(record.did);const info=await session.getTokenInfo();if(session.did!==record.did||info.sub!==record.did||info.expired)throw Error('Session expired.');const active=await store.transaction(s=>s.browsers[key]);return active?{...active,key}:null;}
  catch{await store.transaction(s=>{delete s.browsers[key];});return null;}
 }
 function csrf(request,session){sameOrigin(request);if(!session||!equal(request.headers['x-pixie-csrf'],session.csrf))throw fail(403,'Session or CSRF check failed.');}
 async function status(request,response){
  trustedHost(request);const session=await current(request);if(session)return {service:'pixie-server-identity',configured:true,session:{did:session.did},csrf:session.csrf};
  let raw=cookie(request,loginCookie),key=raw?hash(raw):'',record=key?await store.transaction(s=>s.logins[key]):null;
  if(!record){raw=nonce();key=hash(raw);record={csrf:nonce(),attempts:0,expires:now()+loginLifetime};await store.transaction(s=>{if(Object.keys(s.logins).length>=128)throw fail(429,'Too many pending sign-ins. Try later.');s.logins[key]=record;});response.setHeader('Set-Cookie',setCookie(loginCookie,raw,600));}
  return {service:'pixie-server-identity',configured:true,session:null,csrf:record.csrf};
 }
 async function readRequestIdentity(request){
  const chunks=[];let size=0;for await(const part of request){size+=part.length;if(size>4096)throw fail(413,'Invalid sign-in request.');chunks.push(part);}
  let payload;try{payload=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw fail(400,'Invalid sign-in request.');}
  if(typeof payload.handle!=='string'||payload.handle.length>254||!/^([a-z0-9-]+\.)+[a-z0-9-]+$/i.test(payload.handle))throw fail(400,'Enter a valid Atmosphere handle.');return payload;
 }
 async function login(request){
  sameOrigin(request);const raw=cookie(request,loginCookie),key=raw?hash(raw):'';
  const record=await store.transaction(s=>{const r=s.logins[key];if(!r||!equal(request.headers['x-pixie-csrf'],r.csrf))throw fail(403,'Sign-in CSRF check failed.');if(r.attempts>=5)throw fail(429,'Too many sign-in attempts. Try later.');r.attempts++;return r;});
  const payload=await readRequestIdentity(request);
  const url=await(await client()).authorize(payload.handle,{state:key,scope:'atproto',prompt:'consent',signal:AbortSignal.timeout(15_000)});
  if(url.protocol!=='https:')throw fail(403,'The identity provider must use HTTPS.');
  return {url:url.href};
 }
 async function callback(request,response,params){
  trustedHost(request);
  if(['state','code','iss','error'].some(key=>params.getAll(key).length>1))throw fail(400,'Invalid OAuth response.');
  const raw=cookie(request,loginCookie),key=raw?hash(raw):'';
  const pending=await store.transaction(s=>s.logins[key]);
  const state=params.get('state');const saved=state?await store.stateStore.get(state):null;
  if(!pending||!saved||saved.appState!==key)throw fail(403,'Sign-in is expired or belongs to another browser.');
  // Consume the browser transaction before exchanging the one-time authorization code.
  await store.transaction(s=>{if(!s.logins[key])throw fail(403,'Sign-in already used.');delete s.logins[key];});
  const result=await(await client()).callback(params);
  if(result.state!==key||!/^did:(plc:[a-z2-7]{24}|web:[A-Za-z0-9._%:-]+)$/.test(result.session.did)){await result.session.signOut().catch(()=>{});throw fail(403,'Identity verification failed.');}
  const info=await result.session.getTokenInfo();if(info.sub!==result.session.did||info.expired)throw fail(401,'Identity verification failed.');
  const id=nonce(),record={did:result.session.did,role:result.session.did===ownerDid?'admin':'member',csrf:nonce(),expires:now()+lifetime};
  await store.transaction(s=>{const prior=cookie(request,cookieName);if(prior)delete s.browsers[hash(prior)];if(Object.keys(s.browsers).length>=256)throw fail(429,'Session capacity reached.');s.browsers[hash(id)]=record;});
  response.setHeader('Set-Cookie',[setCookie(cookieName,id,lifetime/1000),setCookie(loginCookie,'',0)]);
 }
 async function logout(request,response){
  sameOrigin(request);const id=cookie(request,cookieName),record=id?await store.transaction(s=>s.browsers[hash(id)]):null;
  // Logout never requires a still-valid upstream token. Always invalidate locally first.
  csrf(request,record);
  await store.transaction(s=>{delete s.browsers[hash(id)];const pending=cookie(request,loginCookie);if(pending)delete s.logins[hash(pending)];});
  response.setHeader('Set-Cookie',[setCookie(cookieName,'',0),setCookie(loginCookie,'',0)]);
  let revoked=true;try{await(await client()).revoke(record.did);}catch{revoked=false;}finally{await store.sessionStore.del(record.did);}
  return {signedOut:true,revoked};
 }
 return {ready:async()=>{await store.ready();await client();},current,csrf,status,login,callback,logout};
}

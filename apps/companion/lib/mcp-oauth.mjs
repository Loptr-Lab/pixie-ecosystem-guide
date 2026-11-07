import {randomBytes,createHash,timingSafeEqual} from 'node:crypto';
import path from 'node:path';
import {railwayIdentityOrigin as origin} from './identity-origin.mjs';
import {createMcpOAuthStore} from './mcp-oauth-store.mjs';
export const mcpOAuthScope='pixie:public';
export const publicMcpTools=new Set(['prepare_task_contract','resume_task_contract','update_task_contract','check_task_action','export_project_handoff','prepare_checkpoint','resume_checkpoint','list_projects','get_project_status','suggest_contribution','prepare_feedback','discover_resources','get_resource','prepare_enquiry','prepare_followup','resume_followup']);
const resource=origin+'/mcp',cookieName='__Host-pixie-mcp',minute=60_000;
const hash=value=>createHash('sha256').update(value).digest('hex');
const nonce=()=>randomBytes(32).toString('base64url');
const equal=(a,b)=>typeof a==='string'&&typeof b==='string'&&Buffer.byteLength(a)===Buffer.byteLength(b)&&timingSafeEqual(Buffer.from(a),Buffer.from(b));
const failure=(status,error)=>Object.assign(Error(error),{status,oauthError:error});
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function cookie(request){const values=String(request.headers.cookie||'').split(';').map(v=>v.trim()).filter(v=>v.startsWith(cookieName+'='));return values.length===1&&/^[A-Za-z0-9_-]{43}$/.test(values[0].slice(cookieName.length+1))?values[0].slice(cookieName.length+1):'';}
function parseClients(raw){
 let value;try{value=JSON.parse(raw);}catch{throw Error('Invalid MCP OAuth client configuration.');}
 if(!Array.isArray(value)||value.length<1||value.length>16)throw Error('Invalid MCP OAuth client configuration.');
 const clients=new Map();
 for(const row of value){
  if(!row||!/^[-A-Za-z0-9_]{8,100}$/.test(row.id)||typeof row.name!=='string'||!row.name.trim()||row.name.length>100||typeof row.enabled!=='boolean'||!Number.isSafeInteger(row.revision)||row.revision<1||!Array.isArray(row.redirectUris)||row.redirectUris.length!==1||clients.has(row.id))throw Error('Invalid MCP OAuth client configuration.');
  const redirect=row.redirectUris[0];if(typeof redirect!=='string'||!(redirect==='https://chatgpt.com/connector_platform_oauth_redirect'||/^https:\/\/chatgpt\.com\/connector\/oauth\/[A-Za-z0-9_-]+$/.test(redirect)))throw Error('Register the exact verified ChatGPT callback.');
  clients.set(row.id,Object.freeze({...row,redirectUris:Object.freeze([...row.redirectUris])}));
 }
 return clients;
}
export function mcpOAuthConfiguration(env){
 if(!env.PIXIE_MCP_OAUTH_ENABLED||env.PIXIE_MCP_OAUTH_ENABLED==='0')return null;
 if(env.PIXIE_MCP_OAUTH_ENABLED!=='1'||!/^[a-f0-9]{64}$/.test(env.PIXIE_MCP_OAUTH_KEY||'')||[env.PIXIE_SESSION_SECRET,env.PIXIE_MCP_TOKEN].includes(env.PIXIE_MCP_OAUTH_KEY)||!path.isAbsolute(env.PIXIE_DATA_FILE||''))throw Error('Invalid MCP OAuth configuration.');
 return {clients:parseClients(env.PIXIE_MCP_OAUTH_CLIENTS),file:path.join(path.dirname(env.PIXIE_DATA_FILE),'mcp-oauth.enc'),key:env.PIXIE_MCP_OAUTH_KEY};
}
export function createMcpOAuth({clients,store,now=Date.now}){
 if(!(clients instanceof Map))throw Error('Invalid MCP OAuth clients.');
 const challenge='Bearer resource_metadata="'+origin+'/.well-known/oauth-protected-resource/mcp", scope="'+mcpOAuthScope+'"';
 const client=id=>clients.get(id)?.enabled?clients.get(id):null;
 function clean(s){for(const group of ['transactions','codes','grants','access','refresh'])for(const [id,row]of Object.entries(s[group]))if(row.expires<=now())delete s[group][id];}
 function insert(s,group,id,row){if(Object.keys(s[group]).length>=2048)throw failure(429,'temporarily_unavailable');s[group][id]=row;}
 function active(s,id){const g=s.grants[id],c=g&&client(g.client);return g&&!g.revoked&&g.expires>now()&&c&&c.revision===g.revision&&g.issuer===origin&&g.resource===resource&&g.scope===mcpOAuthScope?g:null;}
 function revoke(s,id){if(s.grants[id])s.grants[id].revoked=true;}
 function mint(s,grantId){const g=s.grants[grantId],access='pxoa_'+nonce(),refresh='pxor_'+nonce();insert(s,'access',hash(access),{grant:grantId,expires:Math.min(now()+15*minute,g.expires)});insert(s,'refresh',hash(refresh),{grant:grantId,used:false,expires:g.expires});return {access_token:access,token_type:'Bearer',expires_in:Math.floor((Math.min(now()+15*minute,g.expires)-now())/1000),refresh_token:refresh,scope:mcpOAuthScope};}
 const limits=new Map();
 function limit(request){const key=request.socket.remoteAddress||'unknown',bucket=Math.floor(now()/minute);if(limits.size>1024)for(const [k,v]of limits)if(v.bucket!==bucket)limits.delete(k);let row=limits.get(key);if(!row||row.bucket!==bucket){if(limits.size>=2048)throw failure(429,'temporarily_unavailable');limits.set(key,row={bucket,count:0});}if(++row.count>90)throw failure(429,'temporarily_unavailable');}
 function trusted(request,mutation=false){if(request.headers.host!==new URL(origin).host||(request.headers.origin&&request.headers.origin!==origin)||(mutation&&(request.headers.origin!==origin||request.headers['sec-fetch-site']==='cross-site')))throw failure(403,'access_denied');}
 async function fields(request){if(!/^application\/x-www-form-urlencoded(?:;|$)/i.test(request.headers['content-type']||''))throw failure(415,'invalid_request');let size=0;const chunks=[];for await(const chunk of request){size+=chunk.length;if(size>8192)throw failure(413,'invalid_request');chunks.push(chunk);}return unique(new URLSearchParams(Buffer.concat(chunks).toString('utf8')));}
 function unique(params){for(const key of params.keys())if(params.getAll(key).length!==1)throw failure(400,'invalid_request');return params;}
 function headers(response){response.setHeader('Cache-Control','no-store');response.setHeader('Pragma','no-cache');response.setHeader('Referrer-Policy','no-referrer');response.setHeader('X-Content-Type-Options','nosniff');response.setHeader('Content-Security-Policy',"default-src 'none'; form-action 'self' https://chatgpt.com; frame-ancestors 'none'; base-uri 'none'");}
 function json(response,status,value){response.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});response.end(JSON.stringify(value));}
 function redirect(response,url){response.writeHead(303,{Location:url});response.end();}
 function page(response,content){response.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});response.end('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Connect PIXIE</title><main><h1>PIXIE Project Companion</h1>'+content+'</main></html>');}
 function callback(tx,parameters){const url=new URL(tx.redirect);for(const [key,value]of Object.entries({...parameters,state:tx.state,iss:origin}))url.searchParams.set(key,value);return url.href;}
 async function transactionFor(request,id){return store.transaction(s=>{clean(s);const tx=s.transactions[id];if(!tx||!equal(tx.browser,hash(cookie(request)))||!client(tx.client))throw failure(400,'invalid_request');return structuredClone(tx);});}
 return {
  ready:()=>store.ready(),challenge,
  // Only a server-stored, cookie-bound local continuation can alter callback navigation.
  continuation:async request=>{const raw=cookie(request);if(!raw)return null;return store.transaction(s=>{clean(s);const entry=Object.entries(s.transactions).find(([,t])=>equal(t.browser,hash(raw))&&t.stage==='login');return entry?'/oauth/authorize?request='+entry[0]:null;});},
  authenticate:async request=>{
   trusted(request);limit(request);const value=request.headers.authorization;if(typeof value!=='string'||!/^Bearer pxoa_[A-Za-z0-9_-]{43}$/.test(value))return null;
   return store.transaction(s=>{clean(s);const token=s.access[hash(value.slice(7))],g=token&&active(s,token.grant);return g?{kind:'oauth-public',grant:token.grant}:null;});
  },
  async route(request,response,url,identity){
   if(!['/.well-known/oauth-protected-resource','/.well-known/oauth-protected-resource/mcp','/.well-known/oauth-authorization-server'].includes(url.pathname)&&!url.pathname.startsWith('/oauth/'))return false;
   headers(response);
   try{
    trusted(request);limit(request);
    if(request.method==='GET'&&url.pathname.startsWith('/.well-known/oauth-protected-resource')){json(response,200,{resource,authorization_servers:[origin],scopes_supported:[mcpOAuthScope]});return true;}
    if(request.method==='GET'&&url.pathname==='/.well-known/oauth-authorization-server'){json(response,200,{issuer:origin,authorization_endpoint:origin+'/oauth/authorize',token_endpoint:origin+'/oauth/token',revocation_endpoint:origin+'/oauth/revoke',response_types_supported:['code'],grant_types_supported:['authorization_code','refresh_token'],token_endpoint_auth_methods_supported:['none'],code_challenge_methods_supported:['S256'],authorization_response_iss_parameter_supported:true,scopes_supported:[mcpOAuthScope]});return true;}
    if(url.pathname==='/oauth/authorize'&&request.method==='GET'){
     const p=unique(url.searchParams);let id=p.get('request'),tx;
     if(id){if(!/^[A-Za-z0-9_-]{43}$/.test(id)||[...p.keys()].length!==1)throw failure(400,'invalid_request');tx=await transactionFor(request,id);}
     else{
      const c=client(p.get('client_id'));if(!c||!c.redirectUris.includes(p.get('redirect_uri')))throw failure(400,'invalid_request');
      const base={client:c.id,revision:c.revision,redirect:p.get('redirect_uri'),state:p.get('state')||''};
      if(base.state.length>1024)throw failure(400,'invalid_request');
      const err=p.get('response_type')!=='code'?'unsupported_response_type':p.get('resource')!==resource?'invalid_target':p.get('scope')!==mcpOAuthScope?'invalid_scope':p.get('code_challenge_method')!=='S256'||! /^[A-Za-z0-9_-]{43}$/.test(p.get('code_challenge')||'')?'invalid_request':null;
      if(err){redirect(response,callback(base,{error:err}));return true;}
      id=nonce();const raw=nonce();tx={...base,browser:hash(raw),csrf:nonce(),challenge:p.get('code_challenge'),stage:'pending',expires:now()+10*minute};
      await store.transaction(s=>{clean(s);insert(s,'transactions',id,tx);});response.setHeader('Set-Cookie',cookieName+'='+raw+'; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=600');
     }
     const session=await identity.current(request);if(session&&tx.did&&session.did!==tx.did)throw failure(403,'access_denied');
     if(session&&!tx.did){await store.transaction(s=>{const current=s.transactions[id];if(!current||current.did&&current.did!==session.did)throw failure(403,'access_denied');current.did=session.did;});tx.did=session.did;}
     const name=escape(client(tx.client).name),destination=escape(tx.redirect),account=session?'<p>Signed in as '+escape(session.did)+'.</p>':'';
     page(response,account+'<p>Connect '+name+' to public project lookup and unsubmitted drafts. This does not grant private workspace access, post to GitHub or enroll members.</p><p>This connection can stay authorized for up to seven days. Signing out of the website does not revoke it. Use <a href="/oauth/connections">connected public tools</a> to revoke access.</p><p>Return destination: '+destination+'</p><form method="post" action="/oauth/consent"><input type="hidden" name="request" value="'+id+'"><input type="hidden" name="csrf" value="'+tx.csrf+'"><button name="decision" value="'+(session?'approve':'login')+'">'+(session?'Authorize public tools':'Continue to existing Atmosphere sign-in')+'</button><button name="decision" value="deny">Cancel</button></form>');return true;
    }
    if(url.pathname==='/oauth/consent'&&request.method==='POST'){
     trusted(request,true);const p=await fields(request),id=p.get('request'),tx=await transactionFor(request,id);if(!equal(tx.csrf,p.get('csrf')))throw failure(403,'access_denied');
     const decision=p.get('decision');if(decision==='deny'){await store.transaction(s=>{delete s.transactions[id];});redirect(response,callback(tx,{error:'access_denied'}));return true;}
     if(decision==='login'){await store.transaction(s=>{const current=s.transactions[id];if(!current||!equal(current.csrf,tx.csrf))throw failure(400,'invalid_request');current.stage='login';});redirect(response,'/#account');return true;}
     const session=await identity.current(request);if(decision!=='approve'||!session||!/^did:(plc:[a-z2-7]{24}|web:[A-Za-z0-9._%:-]+)$/.test(session.did))throw failure(403,'access_denied');
     const code='pxoc_'+nonce();await store.transaction(s=>{clean(s);const pending=s.transactions[id],c=client(tx.client);if(!pending||!c||c.revision!==tx.revision||!equal(pending.csrf,tx.csrf)||(pending.did&&pending.did!==session.did))throw failure(400,'invalid_request');delete s.transactions[id];insert(s,'codes',hash(code),{...tx,did:session.did,expires:now()+minute,used:false});});redirect(response,callback(tx,{code}));return true;
    }
    if(url.pathname==='/oauth/token'&&request.method==='POST'){
     if(request.headers.authorization)throw failure(400,'invalid_request');const p=await fields(request);if(p.has('client_secret'))throw failure(400,'invalid_request');const c=client(p.get('client_id'));if(!c)throw failure(401,'invalid_client');if(p.get('resource')!==resource)throw failure(400,'invalid_target');
     const result=await store.transaction(s=>{clean(s);
      if(p.get('grant_type')==='authorization_code'){
       const code=s.codes[hash(p.get('code')||'')],verifier=p.get('code_verifier')||'';
       if(!code||code.client!==c.id||code.revision!==c.revision||code.redirect!==p.get('redirect_uri')||! /^[A-Za-z0-9._~-]{43,128}$/.test(verifier)||!equal(createHash('sha256').update(verifier).digest('base64url'),code.challenge))return {error:'invalid_grant'};
       if(code.used){revoke(s,code.grant);return {error:'invalid_grant'};}
       const grant=nonce();insert(s,'grants',grant,{client:c.id,revision:c.revision,did:code.did,issuer:origin,resource,scope:mcpOAuthScope,consented:now(),expires:now()+7*24*60*minute,revoked:false});code.used=true;code.grant=grant;return mint(s,grant);
      }
      if(p.get('grant_type')==='refresh_token'){
       const saved=s.refresh[hash(p.get('refresh_token')||'')],g=saved&&active(s,saved.grant);if(!g||g.client!==c.id)return {error:'invalid_grant'};if(saved.used){revoke(s,saved.grant);return {error:'invalid_grant'};}if(p.has('scope')&&p.get('scope')!==mcpOAuthScope)return {error:'invalid_scope'};saved.used=true;return mint(s,saved.grant);
      }
      return {error:'unsupported_grant_type'};
     });json(response,result.error?400:200,result);return true;
    }
    if(url.pathname==='/oauth/revoke'&&request.method==='POST'){
     const p=await fields(request),c=client(p.get('client_id'));if(!c)throw failure(401,'invalid_client');await store.transaction(s=>{clean(s);const tokenHash=hash(p.get('token')||''),t=s.refresh[tokenHash]||s.access[tokenHash],g=t&&s.grants[t.grant];if(g&&g.client===c.id)revoke(s,t.grant);});json(response,200,{});return true;
    }
    if(url.pathname==='/oauth/connections'&&request.method==='GET'){
     const session=await identity.current(request);if(!session)throw failure(401,'access_denied');const rows=await store.transaction(s=>{clean(s);return Object.entries(s.grants).filter(([,g])=>g.did===session.did&&!g.revoked).map(([id,g])=>({id,name:clients.get(g.client)?.name||'Disabled client'}));});
     page(response,'<h2>Connected public tools</h2>'+rows.map(row=>'<form method="post" action="/oauth/connections/revoke"><p>'+escape(row.name)+'</p><input type="hidden" name="grant" value="'+row.id+'"><input type="hidden" name="csrf" value="'+session.csrf+'"><button>Revoke connection</button></form>').join('')+'<p>Signing out of the website does not revoke these connections.</p>');return true;
    }
    if(url.pathname==='/oauth/connections/revoke'&&request.method==='POST'){
     trusted(request,true);const p=await fields(request),session=await identity.current(request);if(!session||!equal(session.csrf,p.get('csrf')))throw failure(403,'access_denied');await store.transaction(s=>{clean(s);const g=s.grants[p.get('grant')];if(!g||g.did!==session.did)throw failure(403,'access_denied');revoke(s,p.get('grant'));});redirect(response,'/oauth/connections');return true;
    }
    throw failure(405,'invalid_request');
   }catch(error){json(response,error.oauthError?error.status:503,{error:error.oauthError||'temporarily_unavailable'});return true;}
  }
 };
}
export function configuredMcpOAuth(config){return config?createMcpOAuth({clients:config.clients,store:createMcpOAuthStore(config)}):null;}

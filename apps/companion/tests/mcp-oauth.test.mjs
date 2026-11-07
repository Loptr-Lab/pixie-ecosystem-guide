import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,unlink,symlink,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createMcpOAuthStore} from '../lib/mcp-oauth-store.mjs';
import {createMcpOAuth,mcpOAuthConfiguration,publicMcpTools} from '../lib/mcp-oauth.mjs';
import {createCompanionServer} from '../server.mjs';
import {createOwnerIdentity} from '../lib/owner-identity.mjs';
import {syntheticProvider,cookieJar,fixtureFetch,origin,host,owner,stranger} from './fixtures/owner-identity.mjs';
const key='ab'.repeat(32),callback='https://chatgpt.com/connector/oauth/synthetic-test-only';
const client={id:'synthetic-chatgpt',name:'Synthetic ChatGPT',revision:1,enabled:true,redirectUris:[callback]};
const verifier='synthetic-verifier-'.repeat(4),scope='pixie:public',legacy='synthetic-owner-'.repeat(4);
const challenge=createHash('sha256').update(verifier).digest('base64url');
async function fixture(t){
 const dir=await mkdtemp(path.join(os.tmpdir(),'pixie-oauth-')),file=path.join(dir,'mcp-oauth.enc');const store=createMcpOAuthStore({file,key});await store.initialize();let time=Date.now(),did=owner;
 const clients=new Map([[client.id,client]]),oauth=createMcpOAuth({clients,store,now:()=>time});
 const identity={current:async()=>did?{did,csrf:'synthetic-browser-csrf'}:null};
 const server=createCompanionServer({token:legacy,mcpOAuth:oauth,identityConfig:null,identity,fetcher:async()=>{throw Error('No external calls');}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
 t.after(async()=>{await new Promise(resolve=>server.close(resolve));await rm(dir,{recursive:true,force:true});});
 async function request(route,{method='GET',body,cookie='',headers={}}={}){return fixtureFetch(base+route,{method,headers:{Host:host,...(method==='POST'?{'Content-Type':'application/x-www-form-urlencoded',Origin:origin}:{}),...(cookie?{Cookie:cookie}:{}),...headers},body:body instanceof URLSearchParams?body.toString():body});}
 const params=extra=>new URLSearchParams({client_id:client.id,redirect_uri:callback,response_type:'code',resource:origin+'/mcp',scope,state:'synthetic-state',code_challenge:challenge,code_challenge_method:'S256',...extra});
 async function authorize(){const r=await request('/oauth/authorize?'+params());assert.equal(r.status,200);const cookie=r.headers.getSetCookie()[0].split(';')[0],html=await r.text();return {cookie,id:html.match(/name="request" value="([^"]+)"/)[1],csrf:html.match(/name="csrf" value="([^"]+)"/)[1]};}
 const consent=(tx,decision='approve')=>request('/oauth/consent',{method:'POST',cookie:tx.cookie,body:new URLSearchParams({request:tx.id,csrf:tx.csrf,decision})});
 const exchange=(code,extra={})=>request('/oauth/token',{method:'POST',body:new URLSearchParams({grant_type:'authorization_code',client_id:client.id,redirect_uri:callback,resource:origin+'/mcp',code,code_verifier:verifier,...extra})});
 async function grant(){const tx=await authorize(),r=await consent(tx);assert.equal(r.status,303);const url=new URL(r.headers.get('Location'));assert.equal(url.searchParams.get('iss'),origin);assert.equal(url.searchParams.get('state'),'synthetic-state');const code=url.searchParams.get('code'),token=await exchange(code);assert.equal(token.status,200);return {tx,code,...await token.json()};}
 const rpc=(token,method='tools/list',params={})=>request('/mcp',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params})});
 return {store,oauth,file,clients,request,params,authorize,consent,exchange,grant,rpc,setDid:value=>{did=value;},advance:value=>{time+=value;}};
}

test('OAuth configuration defaults off and refuses unsafe callbacks or shared keys',()=>{
 assert.equal(mcpOAuthConfiguration({}),null);const env={PIXIE_MCP_OAUTH_ENABLED:'1',PIXIE_MCP_OAUTH_KEY:key,PIXIE_DATA_FILE:'/data/private/workspace.json',PIXIE_MCP_OAUTH_CLIENTS:JSON.stringify([client])};assert.equal(mcpOAuthConfiguration(env).clients.size,1);
 for(const patch of [{PIXIE_MCP_OAUTH_ENABLED:'true'},{PIXIE_SESSION_SECRET:key},{PIXIE_MCP_OAUTH_KEY:'bad'},{PIXIE_MCP_OAUTH_CLIENTS:'[]'},{PIXIE_MCP_OAUTH_CLIENTS:JSON.stringify([{...client,redirectUris:['https://evil.test/callback']}])}])assert.throws(()=>mcpOAuthConfiguration({...env,...patch}));
});

test('discovery, public lookup/draft and durable owner-scoped revocation reuse existing tools',async t=>{
 const f=await fixture(t),meta=await(await f.request('/.well-known/oauth-authorization-server')).json();assert.deepEqual(meta.code_challenge_methods_supported,['S256']);assert.deepEqual(meta.token_endpoint_auth_methods_supported,['none']);assert.equal(meta.registration_endpoint,undefined);
 assert.equal((await(await f.request('/.well-known/oauth-protected-resource/mcp')).json()).resource,origin+'/mcp');
 const unauth=await f.request('/mcp',{method:'POST',body:'{}'});assert.equal(unauth.status,401);assert.match(unauth.headers.get('WWW-Authenticate'),/resource_metadata/);
 const g=await f.grant();const init=await(await f.rpc(g.access_token,'initialize',{protocolVersion:'2025-11-25'})).json();assert.equal(init.result.protocolVersion,'2025-11-25');
 const tools=await(await f.rpc(g.access_token)).json();assert.equal(tools.result.tools.length,16);assert.ok(tools.result.tools.every(tool=>publicMcpTools.has(tool.name)));
 assert.equal((await(await f.rpc(g.access_token,'tools/call',{name:'list_projects'})).json()).result.structuredContent.projects.length,13);
 assert.equal((await(await f.rpc(g.access_token,'tools/call',{name:'prepare_checkpoint',arguments:{project_id:'training',task:'Synthetic OAuth only',next_action:'Review draft'}})).json()).result.structuredContent.status,'draft — not submitted');
 for(const name of ['workspace_list','workspace_create','new_future_tool'])assert.equal((await(await f.rpc(g.access_token,'tools/call',{name})).json()).result.isError,true);
 f.setDid(null);assert.equal((await f.request('/api/workspace',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+g.access_token},body:'{}'})).status,401);f.setDid(owner);
 const disk=await readFile(f.file,'utf8');for(const secret of [g.access_token,g.refresh_token,g.code,owner])assert.ok(!disk.includes(secret));
 const html=await(await f.request('/oauth/connections')).text(),grant=html.match(/name="grant" value="([^"]+)"/)[1];
 f.setDid(stranger);assert.equal((await f.request('/oauth/connections/revoke',{method:'POST',body:new URLSearchParams({grant,csrf:'synthetic-browser-csrf'})})).status,403);
 f.setDid(owner);assert.equal((await f.request('/oauth/connections/revoke',{method:'POST',body:new URLSearchParams({grant,csrf:'synthetic-browser-csrf'})})).status,303);assert.equal((await f.rpc(g.access_token)).status,401);
 const restored=createMcpOAuth({clients:f.clients,store:createMcpOAuthStore({file:f.file,key})});assert.equal(await restored.authenticate({headers:{host,authorization:'Bearer '+g.access_token},socket:{remoteAddress:'synthetic'}}),null);
 assert.ok((await(await f.rpc(legacy)).json()).result.tools.some(tool=>tool.name==='workspace_list'));
});

test('PKCE/client/resource/redirect binding and concurrent code redemption fail closed',async t=>{
 const f=await fixture(t),tx=await f.authorize(),r=await f.consent(tx),code=new URL(r.headers.get('Location')).searchParams.get('code');
 for(const extra of [{code_verifier:'wrong'},{redirect_uri:'https://evil.test/'},{resource:origin+'/other'},{client_id:'unknown'}])assert.ok((await f.exchange(code,extra)).status>=400);
 const results=await Promise.all([f.exchange(code),f.exchange(code)]);assert.deepEqual(results.map(r=>r.status).sort(),[200,400]);const token=await results.find(r=>r.status===200).json();assert.equal((await f.rpc(token.access_token)).status,401);
});

test('refresh rotation/replay, revocation, expiration and client disable',async t=>{
 const f=await fixture(t),g=await f.grant(),refresh=token=>f.request('/oauth/token',{method:'POST',body:new URLSearchParams({grant_type:'refresh_token',client_id:client.id,resource:origin+'/mcp',refresh_token:token})});
 const rotated=await(await refresh(g.refresh_token)).json();assert.notEqual(rotated.refresh_token,g.refresh_token);assert.equal((await f.rpc(rotated.access_token)).status,200);assert.equal((await refresh(g.refresh_token)).status,400);assert.equal((await f.rpc(rotated.access_token)).status,401);
 const second=await f.grant();await f.request('/oauth/revoke',{method:'POST',body:new URLSearchParams({client_id:client.id,token:second.refresh_token})});assert.equal((await f.rpc(second.access_token)).status,401);
 const third=await f.grant();f.advance(16*60_000);assert.equal((await f.rpc(third.access_token)).status,401);assert.equal((await refresh(third.refresh_token)).status,200);f.clients.set(client.id,{...client,enabled:false});assert.equal((await refresh(third.refresh_token)).status,401);
});

test('consent browser/CSRF/origin/DID binding, cancellation and issuer errors',async t=>{
 const f=await fixture(t),tx=await f.authorize(),p={request:tx.id,csrf:tx.csrf,decision:'approve'};
 assert.equal((await f.request('/oauth/consent',{method:'POST',body:new URLSearchParams(p)})).status,400);
 assert.equal((await f.request('/oauth/consent',{method:'POST',cookie:tx.cookie,body:new URLSearchParams({...p,csrf:'wrong'})})).status,403);
 assert.equal((await f.request('/oauth/consent',{method:'POST',cookie:tx.cookie,headers:{Origin:'https://evil.test'},body:new URLSearchParams(p)})).status,403);
 f.setDid(stranger);assert.equal((await f.consent(tx)).status,400);f.setDid(owner);
 const cancel=new URL((await f.consent(tx,'deny')).headers.get('Location'));assert.equal(cancel.searchParams.get('error'),'access_denied');assert.equal(cancel.searchParams.get('iss'),origin);
 const wrong=await f.request('/oauth/authorize?'+f.params({redirect_uri:'https://evil.test'}));assert.equal(wrong.status,400);assert.equal(wrong.headers.get('Location'),null);
 const noPkce=await f.request('/oauth/authorize?'+f.params({code_challenge_method:'plain'}));assert.equal(new URL(noPkce.headers.get('Location')).searchParams.get('error'),'invalid_request');assert.equal((await f.request('/oauth/authorize?'+f.params()+'&client_id=duplicate')).status,400);
 f.setDid(null);const anonymous=await f.authorize();assert.equal((await f.consent(anonymous)).status,403);assert.equal((await f.consent(anonymous,'login')).headers.get('Location'),'/#account');assert.match(await f.oauth.continuation({headers:{cookie:anonymous.cookie}}),/^\/oauth\/authorize\?request=/);
});

test('missing, wrong-key and symlink stores never reset or become ready',async t=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'pixie-oauth-fail-'));t.after(()=>rm(dir,{recursive:true,force:true}));const file=path.join(dir,'oauth.enc'),store=createMcpOAuthStore({file,key});await assert.rejects(store.ready());await store.initialize();await assert.rejects(store.initialize());await assert.rejects(createMcpOAuthStore({file,key:'cd'.repeat(32)}).ready());await unlink(file);await assert.rejects(store.ready());await symlink(path.join(dir,'missing'),file);await assert.rejects(store.ready());
});


test('existing verified Atmosphere callback resumes only the bound consent transaction',async t=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'pixie-oauth-login-'));t.after(()=>rm(dir,{recursive:true,force:true}));
 const store=createMcpOAuthStore({file:path.join(dir,'mcp.enc'),key});await store.initialize();const provider=syntheticProvider();
 const identity=createOwnerIdentity({file:path.join(dir,'identity.enc'),secret:'cd'.repeat(32),oauthFactory:provider.factory});
 const oauth=createMcpOAuth({clients:new Map([[client.id,client]]),store});const server=createCompanionServer({token:legacy,identityConfig:null,identity,mcpOAuth:oauth});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));t.after(()=>new Promise(resolve=>server.close(resolve)));
 const base='http://127.0.0.1:'+server.address().port,jar=cookieJar();
 async function request(route,method='GET',body,headers={}){const r=await fixtureFetch(base+route,{method,headers:{Host:host,Cookie:jar.header(),...(method==='POST'?{Origin:origin}:{}),...headers},body});jar.take(r);return r;}
 const parameters=new URLSearchParams({client_id:client.id,redirect_uri:callback,response_type:'code',resource:origin+'/mcp',scope,state:'synthetic-outer-state',code_challenge:challenge,code_challenge_method:'S256'});
 const html=await(await request('/oauth/authorize?'+parameters)).text(),id=html.match(/name="request" value="([^"]+)"/)[1],csrf=html.match(/name="csrf" value="([^"]+)"/)[1];
 assert.equal((await request('/oauth/consent','POST',new URLSearchParams({request:id,csrf,decision:'login'}).toString(),{'Content-Type':'application/x-www-form-urlencoded'})).headers.get('Location'),'/#account');
 const session=await(await request('/api/auth/session')).json();const login=await(await request('/api/auth/login','POST',JSON.stringify({handle:'owner.test'}),{'Content-Type':'application/json','X-Pixie-CSRF':session.csrf})).json();const state=new URL(login.url).searchParams.get('state');assert.notEqual(state,'synthetic-outer-state');
 const signed=await request('/?'+new URLSearchParams({state,code:'owner',iss:'https://identity.example.test'}));assert.equal(signed.status,303);assert.equal(signed.headers.get('Location'),'/oauth/authorize?request='+id);
 const resumed=await(await request(signed.headers.get('Location'))).text();assert.ok(resumed.includes(owner));assert.ok(resumed.includes('Authorize public tools'));
 const approved=await request('/oauth/consent','POST',new URLSearchParams({request:id,csrf,decision:'approve'}).toString(),{'Content-Type':'application/x-www-form-urlencoded'});assert.equal(approved.status,303);const response=new URL(approved.headers.get('Location'));assert.equal(response.searchParams.get('state'),'synthetic-outer-state');assert.ok(response.searchParams.get('code'));
});

test('expired codes, cross-origin MCP, static/refresh credentials and duplicate form fields are rejected',async t=>{
 const f=await fixture(t),tx=await f.authorize(),r=await f.consent(tx),code=new URL(r.headers.get('Location')).searchParams.get('code');f.advance(61_000);assert.equal((await f.exchange(code)).status,400);
 const g=await f.grant();assert.equal((await f.rpc(g.refresh_token)).status,401);assert.equal((await f.rpc('invalid')).status,401);
 assert.equal((await f.request('/mcp',{method:'POST',headers:{Origin:'https://evil.test',Authorization:'Bearer '+g.access_token},body:'{}'})).status,403);
 const duplicate=await f.request('/oauth/token',{method:'POST',body:'grant_type=refresh_token&grant_type=authorization_code'});assert.equal(duplicate.status,400);
 const revoked=await f.request('/oauth/revoke',{method:'POST',body:new URLSearchParams({client_id:client.id,token:'unknown'})});assert.equal(revoked.status,200);
 f.advance(8*24*60*60_000);assert.equal((await f.rpc(g.access_token)).status,401);
});

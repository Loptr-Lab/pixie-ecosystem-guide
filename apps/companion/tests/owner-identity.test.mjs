import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,readFile,stat,writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createCompanionServer} from '../server.mjs';
import {createOwnerIdentity,ownerIdentityConfiguration} from '../lib/owner-identity.mjs';
import {createFileWorkspaceStore} from '../lib/workspace-store.mjs';
import {owner,stranger,origin,host,syntheticProvider,cookieJar,login,fixtureFetch as fetch} from './fixtures/owner-identity.mjs';
const token='synthetic-machine-only-token-'.repeat(2);
async function fixture(){
 const dir=await mkdtemp(path.join(os.tmpdir(),'pixie-owner-'));let time=Date.now(),server,base;
 const now=()=>time,provider=syntheticProvider(now),file=path.join(dir,'identity.enc');
 const config={ownerDid:owner,secret:'a'.repeat(64),file,now,oauthFactory:provider.factory};
 const start=async()=>{const identity=createOwnerIdentity(config);await identity.ready();server=createCompanionServer({token,identity,identityConfig:null,modelProvider:null,workspaceFile:path.join(dir,'workspace.json'),workspaceStore:createFileWorkspaceStore(path.join(dir,'workspace.json'))});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base='http://127.0.0.1:'+server.address().port;};
 await start();
 return {dir,file,provider,get base(){return base;},advance:ms=>{time+=ms;},async restart(){await new Promise(resolve=>server.close(resolve));await start();},async close(){await new Promise(resolve=>server.close(resolve));await rm(dir,{recursive:true,force:true});},post:(route,jar,csrf,payload={},extra={})=>fetch(base+route,{method:'POST',headers:{Host:host,Origin:origin,Cookie:jar?.header()||'','Content-Type':'application/json','X-Pixie-CSRF':csrf||'',...extra},body:JSON.stringify(payload)})};
}
test('owner configuration is explicit and uses an independent key',()=>{
 assert.equal(ownerIdentityConfiguration({}),null);
 for(const env of [{PIXIE_OWNER_DID:owner},{PIXIE_OWNER_DID:'not-a-did',PIXIE_SESSION_SECRET:'a'.repeat(64),PIXIE_DATA_FILE:'/private/workspace.json'},{PIXIE_OWNER_DID:owner,PIXIE_SESSION_SECRET:'a'.repeat(64),PIXIE_MCP_TOKEN:'a'.repeat(64),PIXIE_DATA_FILE:'/private/workspace.json'}])assert.throws(()=>ownerIdentityConfiguration(env));
});
test('verified owner cookie opens the same private store as machine MCP and survives restart',async()=>{
 const f=await fixture();try{
  const authenticated=await login(f.base);const {jar,csrf,response}=authenticated;
  const headers=response.headers.getSetCookie().join(';');assert.match(headers,/Secure/);assert.match(headers,/HttpOnly/);assert.match(headers,/SameSite=Lax/);
  const created=await f.post('/api/workspace',jar,csrf,{name:'workspace_create',args:{name:'Synthetic owner project'}});assert.equal(created.status,200);const project=(await created.json()).project;
  const mcp=await f.post('/mcp',null,null,{jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'workspace_get',arguments:{project_id:project.id}}},{Authorization:'Bearer '+token});assert.notEqual((await mcp.json()).result?.structuredContent?.project?.id,project.id);
  assert.equal((await f.post('/mcp',jar,csrf,{jsonrpc:'2.0',id:1,method:'tools/list'})).status,401);
  await f.restart();const saved=await f.post('/api/workspace',jar,csrf,{name:'workspace_get',args:{project_id:project.id}});assert.equal(saved.status,200);assert.equal((await saved.json()).project.id,project.id);
  const raw=await readFile(f.file,'utf8');assert.doesNotMatch(raw,/never-expose|syntheticToken|did:plc|Synthetic owner project/);assert.equal((await stat(f.file)).mode&0o777,0o600);
  assert.doesNotMatch(await(await fetch(f.base+'/api/auth/session',{headers:{Host:host,Cookie:jar.header()}})).text(),/never-expose|access_token|refresh_token|synthetic-machine/);
 }finally{await f.close();}
});
test('independent DID, forged identity and browser bearer never authorize private records',async()=>{
 const f=await fixture();try{
  const foreign=await login(f.base,cookieJar(),'stranger');assert.equal(foreign.response.status,303);const project=await f.post('/api/workspace',foreign.jar,foreign.csrf,{name:'workspace_create',args:{name:'Other private project'}});assert.equal(project.status,200);
  for(const extra of [{Authorization:'Bearer '+token},{'x-atproto-did':owner,'x-openai-user-id':'forged'},{Cookie:'__Host-pixie-owner='+'a'.repeat(43)}])assert.equal((await f.post('/api/workspace',null,null,{name:'workspace_list',args:{}},extra)).status,401);
  assert.equal((await fetch(f.base+'/.pixie-data/identity.enc')).status,404);
 }finally{await f.close();}
});
test('login, callback and workspace requests enforce CSRF, browser binding and one-time state',async()=>{
 const f=await fixture();try{
  const jar=cookieJar(),initial=await fetch(f.base+'/api/auth/session',{headers:{Host:host}});jar.take(initial);const csrf=(await initial.json()).csrf;
  for(const extra of [{Origin:'https://evil.example'},{Origin:''},{'X-Pixie-CSRF':'wrong'},{'Sec-Fetch-Site':'cross-site'}])assert.equal((await f.post('/api/auth/login',jar,csrf,{},extra)).status,403);
  const start=await f.post('/api/auth/login',jar,csrf,{handle:'owner.test'});const state=new URL((await start.json()).url).searchParams.get('state');
  const wrong=await fetch(f.base+'/?state='+state+'&code=owner&iss=https://identity.example.test',{headers:{Host:host},redirect:'manual'});assert.equal(wrong.status,403);
  const result=await login(f.base,jar);const replay=await fetch(f.base+result.callback,{headers:{Host:host,Cookie:result.jar.header()},redirect:'manual'});assert.equal(replay.status,403);
  for(const extra of [{'X-Pixie-CSRF':'wrong'},{Origin:''},{Origin:'https://evil.example'},{Host:'evil.example'}])assert.equal((await f.post('/api/workspace',result.jar,result.csrf,{name:'workspace_list',args:{}},extra)).status,403);
 }finally{await f.close();}
});
test('session expiry denies workspace access without deleting creator content',async()=>{
 const f=await fixture();try{const {jar,csrf}=await login(f.base);assert.equal((await f.post('/api/workspace',jar,csrf,{name:'workspace_create',args:{name:'Preserved after expiry'}})).status,200);f.advance(8*60*60_000+1);assert.equal((await f.post('/api/workspace',jar,csrf,{name:'workspace_list',args:{}})).status,401);assert.match(await readFile(path.join(f.dir,'users', (await import('node:crypto')).createHash('sha256').update(owner).digest('hex')+'.json'),'utf8'),/Preserved after expiry/);}finally{await f.close();}
});
test('sign-out requires CSRF and revokes local access even if upstream revoke fails',async()=>{
 const f=await fixture();try{const {jar,csrf}=await login(f.base);assert.equal((await f.post('/api/auth/logout',jar,'wrong')).status,403);f.provider.setRevokeFailure(true);const response=await f.post('/api/auth/logout',jar,csrf);assert.equal(response.status,200);assert.deepEqual(await response.json(),{signedOut:true,revoked:false});assert.match(response.headers.getSetCookie().join(';'),/Max-Age=0/);assert.equal((await f.post('/api/workspace',jar,csrf,{name:'workspace_list',args:{}})).status,401);}finally{await f.close();}
});
test('tampered encrypted state fails closed rather than resetting saved authentication',async()=>{
 const f=await fixture();try{const {jar,csrf}=await login(f.base);await writeFile(f.file,'tampered');const response=await f.post('/api/workspace',jar,csrf,{name:'workspace_list',args:{}});assert.notEqual(response.status,200);assert.equal(await readFile(f.file,'utf8'),'tampered');}finally{await f.close();}
});
test('expired or removed OAuth credentials cannot keep an otherwise valid browser cookie authorized',async()=>{
 const f=await fixture();try{let result=await login(f.base);f.provider.setExpired(true);assert.equal((await f.post('/api/workspace',result.jar,result.csrf,{name:'workspace_list',args:{}})).status,401);f.provider.setExpired(false);result=await login(f.base);await f.provider.options.at(-1).sessionStore.del(owner);assert.equal((await f.post('/api/workspace',result.jar,result.csrf,{name:'workspace_list',args:{}})).status,401);}finally{await f.close();}
});
test('expired browser-bound login state and duplicate callback parameters are rejected',async()=>{
 const f=await fixture();try{const jar=cookieJar(),initial=await fetch(f.base+'/api/auth/session',{headers:{Host:host}});jar.take(initial);const csrf=(await initial.json()).csrf;const started=await f.post('/api/auth/login',jar,csrf,{handle:'owner.test'});const state=new URL((await started.json()).url).searchParams.get('state');f.advance(10*60_000+1);assert.equal((await fetch(f.base+'/?state='+state+'&code=owner&iss=https://identity.example.test',{headers:{Host:host,Cookie:jar.header()}})).status,403);assert.equal((await fetch(f.base+'/?state=a&state=b&code=owner',{headers:{Host:host}})).status,400);}finally{await f.close();}
});
test('changing administrator DID never revokes an authenticated member session',async()=>{
 const f=await fixture();try{const {jar}=await login(f.base);const identity=createOwnerIdentity({ownerDid:'did:plc:bbbbbbbbbbbbbbbbbbbbbbbb',secret:'a'.repeat(64),file:f.file,oauthFactory:f.provider.factory});assert.equal((await identity.current({headers:{cookie:jar.header()}}))?.did,owner);}finally{await f.close();}
});
test('the pinned official SDK initializes with the preserved Railway metadata',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'pixie-sdk-'));try{await createOwnerIdentity({ownerDid:owner,secret:'d'.repeat(64),file:path.join(dir,'identity.enc')}).ready();}finally{await rm(dir,{recursive:true,force:true});}
});

test('two verified DIDs have isolated list, read, export, and erase operations',async()=>{
 const f=await fixture();try{
  const a=await login(f.base,cookieJar(),'owner'),b=await login(f.base,cookieJar(),'stranger');
  const create=async(user,name)=>{const response=await f.post('/api/workspace',user.jar,user.csrf,{name:'workspace_create',args:{name}});assert.equal(response.status,200);return(await response.json()).project.id;};
  const aid=await create(a,'A private workspace'),bid=await create(b,'B private workspace');
  const run=async(user,name,args={})=>{const response=await f.post('/api/workspace',user.jar,user.csrf,{name,args});assert.equal(response.status,200);return response.json();};
  assert.deepEqual((await run(a,'workspace_list')).projects.map(p=>p.id),[aid]);
  assert.deepEqual((await run(b,'workspace_list')).projects.map(p=>p.id),[bid]);
  for(const [user,other] of [[a,bid],[b,aid]]){
   for(const [name,args] of [
    ['workspace_get',{project_id:other}],
    ['workspace_select',{project_id:other}],
    ['workspace_update',{project_id:other,name:'Spoofed update'}],
    ['workspace_delete',{project_id:other,confirmation:other}],
    ['workspace_export',{project_id:other}],
    ['workspace_chat',{project_id:other,message:'Leak private data',consent:true}]
   ]){
    const response=await f.post('/api/workspace',user.jar,user.csrf,{name,args});
    assert.notEqual(response.status,200,name+' must not cross DID boundaries');
   }
  }
  const cross=await f.post('/api/workspace',b.jar,b.csrf,{name:'workspace_get',args:{project_id:aid}});
  assert.notEqual((await cross.json()).project?.id,aid);
  assert.doesNotMatch(JSON.stringify(await run(b,'workspace_export',{})),/A private workspace/);
  await f.restart();assert.deepEqual((await run(a,'workspace_list')).projects.map(p=>p.id),[aid]);
  assert.deepEqual((await run(b,'workspace_list')).projects.map(p=>p.id),[bid]);
  const logout=await f.post('/api/auth/logout',a.jar,a.csrf);assert.equal(logout.status,200);
  assert.deepEqual((await run(b,'workspace_list')).projects.map(p=>p.id),[bid]);
 }finally{await f.close();}
});

test('anonymous session bootstrap cannot reserve all login slots',async()=>{
 const f=await fixture();try{
  for(let n=0;n<140;n++)assert.equal((await fetch(f.base+'/api/auth/session',{headers:{Host:host}})).status,200);
  const user=await login(f.base);assert.equal((await f.post('/api/workspace',user.jar,user.csrf,{name:'workspace_list',args:{}})).status,200);
 }finally{await f.close();}
});
test('independent authentication-store instances preserve concurrent sessions',async()=>{
 const {identityStore}=await import('../lib/identity-store.mjs');const dir=await mkdtemp(path.join(os.tmpdir(),'pixie-identity-overlap-'));try{
  const file=path.join(dir,'identity.enc'),a=identityStore(file,'a'.repeat(64)),b=identityStore(file,'a'.repeat(64));let enter;const entered=new Promise(r=>enter=r);
  const pending=a.transaction(async state=>{enter();await new Promise(r=>setTimeout(r,50));state.browsers.first={did:owner,expires:Date.now()+60000};});await entered;
  await Promise.all([pending,b.transaction(state=>{state.browsers.second={did:stranger,expires:Date.now()+60000};})]);
  assert.equal(await a.transaction(state=>Object.keys(state.browsers).length),2);
 }finally{await rm(dir,{recursive:true,force:true});}
});

test('foreign nested records, ownership claims and imports cannot escape the session workspace',async()=>{
 const f=await fixture();try{
  const a=await login(f.base),b=await login(f.base,cookieJar(),'stranger');
  const run=async(user,name,args={})=>{const r=await f.post('/api/workspace',user.jar,user.csrf,{name,args});assert.equal(r.status,200);return r.json();};
  const ap=(await run(a,'workspace_create',{name:'A private sentinel'})).project;
  const bp=(await run(b,'workspace_create',{name:'B private sentinel'})).project;
  const task=(await run(a,'workspace_add_task',{project_id:ap.id,title:'A task'})).project.tasks[0];
  const source=(await run(a,'workspace_add_source',{project_id:ap.id,title:'A source',url:'https://example.test'})).project.sources[0];
  for(const [name,args] of [['workspace_add_task',{title:'foreign'}],['workspace_add_source',{title:'foreign',url:'https://example.test'}],['workspace_add_note',{text:'foreign'}],['workspace_update_task',{task_id:task.id,title:'foreign'}],['workspace_check_source',{source_id:source.id}],['workspace_prepare_handoff',{}],['workspace_save_handoff',{text:'foreign'}]]){
   const r=await f.post('/api/workspace',b.jar,b.csrf,{name,args:{project_id:ap.id,...args}});assert.equal(r.status,404,name);assert.doesNotMatch(await r.text(),/A private sentinel|A task|A source/);
  }
  assert.notEqual((await f.post('/api/workspace',b.jar,b.csrf,{name:'workspace_update_task',args:{project_id:bp.id,task_id:task.id,title:'foreign'}})).status,200);
  assert.equal((await f.post('/api/workspace',b.jar,b.csrf,{name:'workspace_list',args:{did:owner}})).status,400);
  const backup=(await run(b,'workspace_export')).backup;backup.projects[0].id=ap.id;backup.selectedId=ap.id;
  await run(b,'workspace_import',{backup_json:JSON.stringify(backup),strategy:'reject-conflicts'});
  assert.equal((await run(a,'workspace_get',{project_id:ap.id})).project.name,'A private sentinel');
  const forged=structuredClone(backup);forged.projects[0].ownerDid=owner;
  assert.notEqual((await f.post('/api/workspace',b.jar,b.csrf,{name:'workspace_import',args:{backup_json:JSON.stringify(forged)}})).status,200);
  await run(b,'workspace_clear',{confirmation:'DELETE ALL SAVED PROJECTS'});
  assert.equal((await run(a,'workspace_get',{project_id:ap.id})).project.name,'A private sentinel');
 }finally{await f.close();}
});

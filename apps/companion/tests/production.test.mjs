import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {productionConfiguration,startProduction} from '../scripts/start-production.mjs';
import {owner,host,syntheticProvider,fixtureFetch} from './fixtures/owner-identity.mjs';
const token='synthetic-production-test-token-'.repeat(2);
const config=mount=>({NODE_ENV:'production',PIXIE_LOCAL_OWNER:'0',PIXIE_MCP_TOKEN:token,RAILWAY_VOLUME_MOUNT_PATH:mount,PIXIE_DATA_FILE:path.join(mount,'private','workspace.json'),PORT:'0'});
const close=server=>new Promise(resolve=>server.close(resolve));
test('production fails closed without private authentication or an explicit volume boundary',()=>{
 const env=config('/synthetic-volume');
 for(const patch of [{NODE_ENV:'development'},{PIXIE_LOCAL_OWNER:'1'},{PIXIE_MCP_TOKEN:''},{RAILWAY_VOLUME_MOUNT_PATH:''},{PIXIE_DATA_FILE:'/ephemeral/workspace.json'}])assert.throws(()=>productionConfiguration({...env,...patch}));
});
test('production readiness rejects corrupt encrypted owner state and preserves it',async()=>{
 const mount=await mkdtemp(path.join(os.tmpdir(),'pixie-auth-ready-'));const env={...config(mount),PIXIE_OWNER_DID:owner,PIXIE_SESSION_SECRET:'e'.repeat(64)};const provider=syntheticProvider();let server;
 try{server=await startProduction(env,{oauthFactory:provider.factory});const base='http://127.0.0.1:'+server.address().port;assert.equal((await fixtureFetch(base+'/api/auth/session',{headers:{Host:host}})).status,200);await writeFile(path.join(mount,'private','identity.enc'),'preserved corrupt identity');assert.equal((await fetch(base+'/ready')).status,503);await close(server);server=null;await assert.rejects(startProduction(env,{oauthFactory:provider.factory}));}
 finally{if(server)await close(server);await rm(mount,{recursive:true,force:true});}
});
test('production refuses unscoped machine workspace access across restart while preserving volume',async()=>{
 const mount=await mkdtemp(path.join(os.tmpdir(),'pixie-volume-'));const env=config(mount);let server;
 try{
  server=await startProduction(env);let base='http://127.0.0.1:'+server.address().port;
  const call=(name,args={},authorized=true)=>fetch(base+'/api/workspace',{method:'POST',headers:{'Content-Type':'application/json',...(authorized?{Authorization:'Bearer '+token}:{})},body:JSON.stringify({name,args})});
  assert.equal((await fetch(base+'/ready')).status,200);
  assert.equal((await call('workspace_list',{},false)).status,401);
  assert.equal((await fetch(base+'/mcp',{method:'POST',body:'{}'})).status,401);
  assert.equal((await (await fetch(base+'/api/workspace/capabilities')).json()).localOwner,false);
  assert.equal((await call('workspace_list')).status,401);
  const created=await fetch(base+'/mcp',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'workspace_create',arguments:{name:'Synthetic restart project',purpose:'Verify private mounted storage'}}})});assert.equal(created.status,200);assert.equal((await created.json()).result?.structuredContent?.project,undefined);
  assert.equal((await fetch(base+'/private/workspace.json')).status,404);
  assert.equal((await fetch(base+'/.pixie-data/workspace.json')).status,404);
  await close(server);server=await startProduction(env);base='http://127.0.0.1:'+server.address().port;
  const rpc=await fetch(base+'/mcp',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'workspace_get',arguments:{project_id:project.id}}})});
  assert.equal(rpc.status,200);const body=await rpc.json();assert.equal(body.result?.structuredContent?.project,undefined);assert.ok(!JSON.stringify(body).includes(token));
  assert.equal((await call('workspace_list')).status,401);
  await writeFile(env.PIXIE_DATA_FILE,'synthetic corrupt state');assert.equal((await fetch(base+'/ready')).status,503);
  await close(server);server=null;await assert.rejects(startProduction(env),/preserved/);
 }finally{if(server)await close(server);await rm(mount,{recursive:true,force:true});}
});

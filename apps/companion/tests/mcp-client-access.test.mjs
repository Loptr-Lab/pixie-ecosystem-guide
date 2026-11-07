import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readMcpClientHashes,identifyMcpClient} from '../lib/mcp-client-access.mjs';
import {createCompanionServer} from '../server.mjs';

const owner='synthetic-owner-'.repeat(4);
const clientA='synthetic-client-A-'.repeat(4),clientB='synthetic-client-B-'.repeat(4);
const sha=value=>createHash('sha256').update(value).digest('hex');
const config=JSON.stringify({'pilot-a':sha(clientA),'pilot-b':sha(clientB)});

test('independent client grants are distinct from the retained owner credential',()=>{
 const clients=readMcpClientHashes(config,owner);
 assert.deepEqual(identifyMcpClient('Bearer '+clientA,owner,clients),{kind:'public-client',id:'pilot-a'});
 assert.deepEqual(identifyMcpClient('Bearer '+clientB,owner,clients),{kind:'public-client',id:'pilot-b'});
 assert.deepEqual(identifyMcpClient('Bearer '+owner,owner,clients),{kind:'existing-machine'});
 for(const header of [undefined,'Basic '+clientA,'Bearer wrong','Bearer '+clientA+' ', 'Bearer '+'x'.repeat(3000)])assert.equal(identifyMcpClient(header,owner,clients),null);
});

test('invalid registries and duplicate/owner credentials fail closed without echoing configuration',()=>{
 for(const raw of ['[]','null','{bad',JSON.stringify({'pilot-a':'not-a-hash'}),JSON.stringify({'pilot-a':sha(owner)}),JSON.stringify({a:sha(clientA),b:sha(clientA)})]){
  assert.throws(()=>readMcpClientHashes(raw,owner),error=>!error.message.includes(raw)&&/configuration|distinct/.test(error.message));
 }
 assert.deepEqual({...readMcpClientHashes('',owner)},{});
});

test('removing one configured grant revokes that client without revoking another or the existing bearer',()=>{
 const clients=readMcpClientHashes(JSON.stringify({'pilot-b':sha(clientB)}),owner);
 assert.equal(identifyMcpClient('Bearer '+clientA,owner,clients),null);
 assert.equal(identifyMcpClient('Bearer '+clientB,owner,clients).id,'pilot-b');
 assert.equal(identifyMcpClient('Bearer '+owner,owner,clients).kind,'existing-machine');
});

test('two synthetic client connections initialize, discover and draft through existing public tools; private operations stay denied',async()=>{
 let external=0,privateAccess=0;
 const server=createCompanionServer({token:owner,mcpClientHashes:config,
  fetcher:async()=>{external++;throw Error('No live external calls allowed in this test');},
  workspaceStore:{read:async()=>{privateAccess++;throw Error('Private access forbidden');},write:async()=>{privateAccess++;throw Error('Private write forbidden');}},
  identityConfig:null,identity:null});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const origin='http://127.0.0.1:'+server.address().port;
 const post=async(value,token=clientA,route='/mcp',extra={})=>fetch(origin+route,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token,...extra},body:JSON.stringify(value)});
 const rpc=(method,params={})=>({jsonrpc:'2.0',id:1,method,params});
 try{
  for(const token of [clientA,clientB]){
   const init=await(await post(rpc('initialize',{protocolVersion:'2025-11-25',capabilities:{},clientInfo:{name:'synthetic-pilot',version:'1'}}),token)).json();
   assert.equal(init.result.protocolVersion,'2025-11-25');
   const tools=await(await post(rpc('tools/list'),token)).json();
   assert.ok(tools.result.tools.some(t=>t.name==='list_projects'));
   assert.ok(tools.result.tools.some(t=>t.name==='prepare_checkpoint'));
   assert.ok(tools.result.tools.every(t=>!t.name.startsWith('workspace_')));
   const list=await(await post(rpc('tools/call',{name:'list_projects',arguments:{}}),token)).json();
   assert.equal(list.result.structuredContent.projects.length,13);
   const project=await(await post(rpc('tools/call',{name:'get_project_status',arguments:{project_id:'training',refresh:false}}),token)).json();
   assert.equal(project.result.structuredContent.id,'training');
   const draft=await(await post(rpc('tools/call',{name:'prepare_checkpoint',arguments:{project_id:'training',task:'Synthetic pilot only',next_action:'Review without posting'}}),token)).json();
   assert.equal(draft.result.structuredContent.status,'draft — not submitted');
   assert.equal(new URL(draft.result.structuredContent.destination).pathname,'/Loptr-Lab/training/issues/new');
   for(const name of ['workspace_list','workspace_create','workspace_export','workspace_clear','workspace_chat']){
    const denied=await(await post(rpc('tools/call',{name,arguments:{}}),token)).json();
    assert.equal(denied.result.isError,true);assert.match(denied.result.content[0].text,/public project and draft/);
   }
   const invalid=await(await post(rpc('tools/call',{name:'get_project_status',arguments:{project_id:'unsupported'}}),token)).json();assert.equal(invalid.result.isError,true);
   const unknown=await(await post(rpc('tools/call',{name:'not_a_tool',arguments:{}}),token)).json();assert.equal(unknown.result.isError,true);
   assert.equal((await post({},token,'/api/workspace',{'oai-authenticated-user-id':'forged'})).status,401);
  }
  assert.equal((await post(rpc('tools/list'),'invalid', '/mcp',{'oai-authenticated-user-id':'forged'})).status,401);
  const malformed=await(await post({})).json();assert.equal(malformed.error.code,-32600);
  assert.equal((await post({jsonrpc:'2.0',method:'notifications/initialized'})).status,202);
  const oldList=await(await post(rpc('tools/list'),owner)).json();assert.ok(oldList.result.tools.some(t=>t.name==='workspace_list'));
  const ownerPrivate=await(await post(rpc('tools/call',{name:'workspace_list',arguments:{}}),owner)).json();assert.equal(ownerPrivate.result.isError,true);
  assert.equal(external,0);assert.equal(privateAccess,0);
 }finally{await new Promise(resolve=>server.close(resolve));}
});

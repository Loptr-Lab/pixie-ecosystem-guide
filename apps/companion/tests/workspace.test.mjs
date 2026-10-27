import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,readFile,stat,writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createWorkspaceService,validateWorkspace} from '../lib/workspace.mjs';
import {createMemoryWorkspaceStore,createFileWorkspaceStore} from '../lib/workspace-store.mjs';
import {createModelProvider} from '../lib/model-provider.mjs';
import {createCompanionServer} from '../server.mjs';
const service=()=>createWorkspaceService(createMemoryWorkspaceStore());
const create=(s,name='Fictional recording')=>s.run('workspace_create',{name,purpose:'Finish an original recording',outcome:'A reviewed release brief'});

test('complete project journey persists across new server-store instances and preserves provenance',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'pixie-private-'));const filename=path.join(dir,'private','workspace.json');
 try{
  let s=createWorkspaceService(createFileWorkspaceStore(filename));const {project}=await create(s);const id=project.id;
  await s.run('workspace_add_source',{project_id:id,title:'Creator rights source',url:'https://example.org/rights',excerpt:'Creator-supplied excerpt',creatorCheckedOn:'Creator checked today'});
  await s.run('workspace_add_note',{project_id:id,text:'Ask which agreement is appropriate.'});
  let task=(await s.run('workspace_add_task',{project_id:id,title:'Prepare agreement questions',nextAction:'Draft three questions'})).project.tasks[0];
  await s.run('workspace_update_task',{project_id:id,task_id:task.id,status:'blocked',blocker:'Awaiting scope clarification',nextAction:'Ask the creator to confirm the intended use'});
  s=createWorkspaceService(createFileWorkspaceStore(filename));const resumed=await s.run('workspace_get',{project_id:id});
  assert.equal(resumed.project.sources[0].checkState,'linked');assert.equal(resumed.project.sources[0].checkedAt,null);
  assert.equal(resumed.project.notes[0].kind,'creator-statement');assert.equal(resumed.resume.blocked[0].blocker,'Awaiting scope clarification');assert.match(resumed.resume.nextAction,/intended use/);
  const handoff=await s.run('workspace_prepare_handoff',{project_id:id});assert.match(handoff.handoff,/Prepare agreement questions/);assert.match(handoff.handoff,/not fetched/);assert.match(handoff.handoff,/unresolved|Unresolved/);
  await s.run('workspace_save_handoff',{project_id:id,text:handoff.handoff+'\nCreator-edited review note.'});
  const backup=(await s.run('workspace_export',{project_id:id})).backup;
  await s.run('workspace_clear',{confirmation:'DELETE ALL SAVED PROJECTS'});
  await s.run('workspace_import',{backup_json:JSON.stringify(backup)});
  const restored=await s.run('workspace_get',{project_id:id});assert.equal(restored.project.id,id);assert.match(restored.project.handoff,/Creator-edited/);assert.equal(restored.project.tasks[0].id,task.id);
  assert.equal((await stat(filename)).mode&0o777,0o600);
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('project/task boundaries, archiving and completion evidence are enforced transactionally',async()=>{
 const s=service();const a=(await create(s,'Project A')).project;const b=(await create(s,'Project B')).project;
 const task=(await s.run('workspace_add_task',{project_id:a.id,title:'A only'})).project.tasks[0];
 await assert.rejects(s.run('workspace_update_task',{project_id:b.id,task_id:task.id,status:'active'}),/does not belong/);
 assert.equal((await s.run('workspace_get',{project_id:b.id})).project.tasks.length,0);
 await assert.rejects(s.run('workspace_update_task',{project_id:a.id,task_id:task.id,status:'done'}),/evidence/);
 assert.equal((await s.run('workspace_get',{project_id:a.id})).project.tasks[0].status,'todo');
 await s.run('workspace_update_task',{project_id:a.id,task_id:task.id,status:'done',completionEvidence:'Creator reviewed the draft.'});
 await s.run('workspace_update',{project_id:a.id,archived:true});await assert.rejects(s.run('workspace_add_note',{project_id:a.id,text:'not saved'}),/archived/);
 await s.run('workspace_update',{project_id:a.id,archived:false});await s.run('workspace_add_note',{project_id:a.id,text:'Restored work'});
 assert.equal((await s.run('workspace_get',{project_id:a.id})).project.notes.length,1);
});
test('restore is validated atomically and never silently overwrites existing identities',async()=>{
 const s=service();const p=(await create(s)).project;const backup=(await s.run('workspace_export',{})).backup;
 await assert.rejects(s.run('workspace_import',{backup_json:JSON.stringify(backup)}),/already exists/);
 assert.equal((await s.run('workspace_list',{})).projects.length,1);
 const restored=await s.run('workspace_import',{backup_json:JSON.stringify(backup),strategy:'copy-conflicts'});assert.notEqual(restored.restoredIds[0],p.id);
 const bad=structuredClone(backup);bad.projects[0].token='private';await assert.rejects(s.run('workspace_import',{backup_json:JSON.stringify(bad)}),/Unsupported saved fields/);
 const broken=structuredClone(backup);broken.projects[0].sources=[{id:crypto.randomUUID(),url:'javascript:alert(1)'}];assert.throws(()=>validateWorkspace(broken));
 assert.equal((await s.run('workspace_list',{})).projects.length,2);
 await assert.rejects(s.run('workspace_delete',{project_id:p.id,confirmation:crypto.randomUUID()}),/exact project/);
});
test('corrupt storage is preserved and failed saves are never acknowledged as success',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'pixie-corrupt-'));const file=path.join(dir,'workspace.json');await writeFile(file,'not JSON');
 try{const s=createWorkspaceService(createFileWorkspaceStore(file));await assert.rejects(create(s),/preserved/);assert.equal(await readFile(file,'utf8'),'not JSON');}finally{await rm(dir,{recursive:true,force:true});}
});
test('model absence and research failure remain recoverable; no fake reply or verification',async()=>{
 const s=createWorkspaceService(createMemoryWorkspaceStore(),{fetcher:async()=>{throw Error('offline')}});const p=(await create(s)).project;
 await assert.rejects(s.run('workspace_chat',{project_id:p.id,message:'What next?',consent:true}),error=>error.code==='MODEL_UNAVAILABLE');
 assert.equal((await s.run('workspace_get',{project_id:p.id})).project.messages.length,0);
 const added=await s.run('workspace_add_source',{project_id:p.id,title:'Public file',url:'https://github.com/Loptr-Lab/training/blob/main/README.md'});
 const checked=await s.run('workspace_check_source',{project_id:p.id,source_id:added.project.sources[0].id});assert.equal(checked.source.checkState,'failed');assert.equal(checked.source.checkedAt,null);assert.match(checked.source.lastError,/offline/);
 assert.equal((await s.run('workspace_get',{project_id:p.id})).project.sources.length,1);
});
test('external model receives only selected context, credentials stay server-side and no action executes',async()=>{
 const calls=[];const provider=createModelProvider({url:'https://model.example.invalid/v1/chat/completions',key:'fixture-server-key',model:'fixture',fetcher:async(url,options)=>{calls.push(options);return Response.json({choices:[{message:{content:'AI suggestion: prepare three agreement questions. Not legal advice.'}}]});}});
 const s=createWorkspaceService(createMemoryWorkspaceStore(),{model:provider});const a=(await create(s,'Selected project')).project;await create(s,'Other private project');
 await assert.rejects(s.run('workspace_chat',{project_id:a.id,message:'Help',consent:false}),/Confirm/);
 const reply=await s.run('workspace_chat',{project_id:a.id,message:'Help me prepare questions.',consent:true});assert.equal(reply.project.messages[1].kind,'ai-suggestion');assert.equal(reply.project.tasks.length,0);
 assert.equal(calls.length,1);assert.doesNotMatch(calls[0].body,/Other private project/);assert.match(calls[0].body,/Selected project/);
 assert.doesNotMatch(JSON.stringify((await s.run('workspace_export',{})).backup),/fixture-server-key/);
});
test('machine bearer alone cannot read or write anyone’s workspace',async()=>{
 const store=createMemoryWorkspaceStore();const token='fixture-only-'.repeat(4);const server=createCompanionServer({token,workspaceStore:store,modelProvider:null});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='http://127.0.0.1:'+server.address().port;
 const post=(url,value,headers={})=>fetch(origin+url,{method:'POST',headers:{'content-type':'application/json',...headers},body:JSON.stringify(value)});
 try{
  assert.equal((await post('/api/workspace',{name:'workspace_list',args:{}},{'oai-authenticated-user-id':'spoof'})).status,401);
  assert.equal((await post('/api/workspace',{name:'workspace_create',args:{name:'Rejected browser bearer'}},{Authorization:'Bearer '+token})).status,401);
  const made=await post('/mcp',{jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'workspace_create',arguments:{name:'Shared saved project'}}},{Authorization:'Bearer '+token});assert.equal(made.status,200);assert.equal((await made.json()).result?.structuredContent?.project,undefined);
  const rpc={jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'workspace_get',arguments:{project_id:'no-machine-grant'}}};
  assert.equal((await post('/mcp',rpc,{'oai-authenticated-user-id':'spoof'})).status,401);
  const fromMcp=await(await post('/mcp',rpc,{Authorization:'Bearer '+token})).json();assert.equal(fromMcp.result?.structuredContent?.project,undefined);
  assert.equal((await post('/api/workspace',{name:'workspace_list',args:{}},{Authorization:'Bearer '+token,Origin:'https://evil.invalid'})).status,403);
  const publicCall=await post('/api/companion',{name:'workspace_list',args:{}});assert.notEqual(publicCall.status,200);
  assert.doesNotMatch(await(await fetch(origin+'/health')).text(),new RegExp(token));
 }finally{await new Promise(resolve=>server.close(resolve));}
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {runTool, handleRpc, toolDefinitions} from '../lib/companion.mjs';
const args = {project_id:'training',outcome:'Check one public contribution route',authorized_actions:'inspect_sources\nprepare_drafts\nexport_checkpoint',constraints:'No publication\nNo private records',completion_criteria:'Record the destination and observed barrier',next_action:'Read the current contribution instructions'};
const noNetwork=()=>{throw Error('Unexpected external call');};
test('task stewardship preserves identity, immutable scope and essential context across clients',async()=>{
 const prepared=await runTool('prepare_task_contract',args,noNetwork);
 assert.equal(prepared.reviewRequired,true);
 const record_json=JSON.stringify(prepared.record);
 const updated=await runTool('update_task_contract',{record_json,status:'active',progress:'Read the instructions',next_action:'Inspect the link',completion_evidence:''},noNetwork);
 for(const key of ['task_id','outcome','authorized_actions','constraints','completion_criteria','project_id'])assert.deepEqual(updated.record[key],prepared.record[key]);
 assert.equal(updated.record.revision,2);
 const imported=await runTool('resume_task_contract',{record_json:JSON.stringify(updated.record)},noNetwork);
 assert.deepEqual(imported.record,updated.record);assert.equal(imported.reviewRequired,true);
 const rpc=await handleRpc({jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'resume_task_contract',arguments:{record_json}}},true,noNetwork);
 assert.deepEqual(rpc.body.result.structuredContent.record,prepared.record);
});
test('scope expansion and consequential actions cannot become silent execution',async()=>{
 const prepared=await runTool('prepare_task_contract',args,noNetwork),record_json=JSON.stringify(prepared.record);
 await assert.rejects(runTool('update_task_contract',{record_json,status:'active',progress:'',next_action:'Publish',authorized_actions:'publish'},noNetwork),/Unexpected field/);
 for(const action of ['publish','deploy','delete','read_public_checkpoint']){
  const result=await runTool('check_task_action',{record_json,action},noNetwork);
  assert.equal(result.inScope,false);assert.equal(result.executed,false);
 }
 await assert.rejects(runTool('prepare_task_contract',{...args,authorized_actions:'publish'},noNetwork));
 await assert.rejects(runTool('update_task_contract',{record_json,status:'verified',progress:'',next_action:'Done'},noNetwork));
 await assert.rejects(runTool('update_task_contract',{record_json,status:'reported_complete',progress:'',next_action:'Review'},noNetwork),/evidence/);
});
test('untrusted imports reject unknown fields, forged URLs, invalid identities and unsupported status',async()=>{
 const prepared=await runTool('prepare_task_contract',args,noNetwork);
 for(const change of [{token:'secret'},{sourceUrl:'https://evil.invalid'},{task_id:'not-an-id'},{revision:-1},{project_id:'missing'},{authorized_actions:['publish']},{constraints:[]},{status:'verified'}]){
  await assert.rejects(runTool('resume_task_contract',{record_json:JSON.stringify({...prepared.record,...change})},noNetwork));
 }
 assert.ok(toolDefinitions.find(tool=>tool.name==='check_task_action'));
});

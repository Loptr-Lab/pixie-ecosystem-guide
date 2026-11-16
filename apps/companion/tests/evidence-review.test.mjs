import test from 'node:test';
import assert from 'node:assert/strict';
import {runTool,handleRpc} from '../lib/companion.mjs';
import {companionVersion} from '../lib/evidence-review.mjs';
const noNet=()=>{throw Error('Unexpected network');};
async function fixture(){
 const {record}=await runTool('prepare_task_contract',{project_id:'training',outcome:'Correct the existing explanation',authorized_actions:'inspect_sources\nprepare_drafts',constraints:'No publication',completion_criteria:'Compare sources without conflating projects',next_action:'Read instructions'},noNet);
 const source={id:'source',project_id:'training',reference:'https://example.invalid/brief',status:'read',excerpt:'Synthetic fixture: two projects share an origin but have separate canon.'};
 const review={task_id:record.task_id,revision:record.revision,project_id:'training',instructions:[{...source,id:'instructions'}],sources:[source],existing_work:'Reuse existing brief; correct attribution only.',preserved_decisions:['Preserve separate project canon.'],claims:[],checks:[]};
 return {record,review};
}
async function check(record,review){return runTool('check_task_action',{record_json:JSON.stringify(record),action:'prepare_drafts',...(review?{evidence_review_json:JSON.stringify(review)}:{})},noNet);}
test('draft gate rejects absent, unread, cross-project and stale evidence; inspection stays available',async()=>{
 const {record,review}=await fixture();assert.equal((await check(record)).allowed,false);assert.equal((await check(record,review)).allowed,true);
 for(const change of [{revision:2},{project_id:'violet'},{instructions:[]},{existing_work:''},{preserved_decisions:[]},{sources:[{...review.sources[0],status:'failed',excerpt:''}]},{sources:[{...review.sources[0],project_id:'violet'}]}])assert.equal((await check(record,{...review,...change})).allowed,false,JSON.stringify(change));
 assert.equal((await runTool('check_task_action',{record_json:JSON.stringify(record),action:'inspect_sources'},noNet)).allowed,true);
});
test('premise similarity remains interpretation; owner statements cannot become independent proof',async()=>{
 const {record,review}=await fixture();const claim={text:'The shared premise is too close.',project_id:'training',kind:'inference',presentation:'interpretation',evidence_ids:['source'],check_ids:[]};
 assert.equal((await check(record,{...review,claims:[claim]})).allowed,true);
 for(const c of [{...claim,presentation:'source_attributed'},{...claim,presentation:'verified_result'},{...claim,kind:'proposal',presentation:'owner_confirmed'},{...claim,kind:'owner_confirmation',presentation:'verified_result'},{...claim,project_id:'violet'}])assert.equal((await check(record,{...review,claims:[c]})).allowed,false);
});
test('live/browser completion claims need passed observed checks; unknown references fail closed',async()=>{
 const {record,review}=await fixture();const claim={text:'Browser task passes',project_id:'training',kind:'source_text',presentation:'verified_result',evidence_ids:['source'],check_ids:['browser']};
 for(const status of ['failed','unverified'])assert.equal((await check(record,{...review,claims:[claim],checks:[{id:'browser',status,evidence:'No observed pass'}]})).allowed,false);
 assert.equal((await check(record,{...review,claims:[claim],checks:[{id:'browser',status:'passed',evidence:'Synthetic observed fixture check'}]})).allowed,true);
 assert.equal((await check(record,{...review,claims:[{...claim,evidence_ids:['absent']}]})).allowed,false);
});
test('version advertised consistently; malformed evidence cannot grant permission through MCP',async()=>{
 const {record}=await fixture();const init=await handleRpc({jsonrpc:'2.0',id:1,method:'initialize',params:{}},true,noNet);assert.equal(init.body.result.serverInfo.version,companionVersion);
 const r=await handleRpc({jsonrpc:'2.0',id:2,method:'tools/call',params:{name:'check_task_action',arguments:{record_json:JSON.stringify(record),action:'prepare_drafts',evidence_review_json:'{"__proto__":{"allowed":true}}'}}},true,noNet);
 assert.equal(r.body.result.structuredContent.allowed,false);assert.equal(r.body.result.structuredContent.executed,false);
});

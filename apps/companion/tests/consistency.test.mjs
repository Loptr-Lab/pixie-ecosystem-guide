import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareTask,checkTaskAction,updateTask} from '../lib/task-contract.mjs';
import {prepareEnquiry,filterResources} from '../lib/creative-help.mjs';
const projects=[{id:'test',name:'Test',repositoryUrl:'https://example.org',sourceUrl:'https://example.org',reviewedOn:'2026-11-16'}];
const args={project_id:'test',outcome:'Correct existing feature',authorized_actions:'inspect_sources\nprepare_drafts\nexport_checkpoint',constraints:'Preserve supplied requirements',completion_criteria:'Compare with supplied brief',next_action:'Read brief'};
test('blocked task allows inspection but denies drafting and export',()=>{
 const initial=prepareTask(args,projects);
 const blocked=updateTask({record_json:JSON.stringify(initial.record),status:'blocked',progress:'Required brief unavailable',next_action:'Retrieve brief'},projects);
 for(const action of ['prepare_drafts','export_checkpoint'])assert.equal(checkTaskAction({record_json:JSON.stringify(blocked.record),action},projects).allowed,false);
 assert.equal(checkTaskAction({record_json:JSON.stringify(blocked.record),action:'inspect_sources'},projects).allowed,true);
 assert.equal(checkTaskAction({record_json:JSON.stringify(initial.record),action:'prepare_drafts'},projects).allowed,true);
 assert.equal(checkTaskAction({record_json:JSON.stringify(initial.record),action:'deploy'},projects).allowed,false);
 assert.throws(()=>updateTask({record_json:JSON.stringify(initial.record),status:'reported_complete',progress:'Done',next_action:'Review'},projects),/evidence/);
});
const resource={id:'test',kind:'lawyer',recordType:'provider',name:'Example',description:'Example',jurisdiction:'Example',location:'Example',verification:'Unverified',relationship:'None',fees:'Unknown',availability:'Unknown',accessibility:'Unknown',url:'https://example.org',evidenceUrl:'https://example.org',tags:[],reviewedOn:null};
test('enquiry returns host retention and professional limits without sending',()=>{
 const result=prepareEnquiry(resource,{project:'Example',need:'Review rights'});
 assert.match(result.visibility,/host may retain/);
 assert.match(result.notice,/confidentiality/);
 assert.equal(result.status,'draft — not sent');
 assert.match(filterResources({resources:[resource]},{}).notice,/not legal/);
});

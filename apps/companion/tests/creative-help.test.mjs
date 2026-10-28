import test from 'node:test';
import assert from 'node:assert/strict';
import {readResources,filterResources,prepareEnquiry,createFollowup,resumeFollowup,resourceSource} from '../lib/creative-help.mjs';
import {runTool,handleRpc} from '../lib/companion.mjs';
const provider={id:'fixture-music',name:'Fixture music solicitor',kind:'lawyer',recordType:'provider',description:'Music copyright and publishing',url:'https://example.org/music',evidenceUrl:'https://example.org/music',tags:['music','copyright'],jurisdiction:'England and Wales',location:'London',reviewedOn:'2026-10-23',verification:'Provider description only; credentials unchecked',relationship:'External resource, not a partner',fees:'Ask',availability:'Unchecked',accessibility:'Ask'};
const directory={...provider,id:'fixture-directory',name:'Solicitor directory',recordType:'directory',location:''};
const data={schema:'made-sick-resources/v1',owner:'Made-Sick.org',resources:[provider,directory]};
function fixture(payload=data){return async url=>{assert.equal(url,resourceSource);return {ok:true,text:async()=>JSON.stringify(payload)}};}
test('London music journey reads Made-Sick and distinguishes a provider from a search route',async()=>{
 const result=await runTool('discover_resources',{kind:'lawyer',query:'music copyright',jurisdiction:'England',location:'London'},fixture());
 assert.equal(result.resources.length,2);assert.equal(result.resources[0].recordType,'provider');assert.match(result.resources[1].fit.join(' '),/Directory route/);assert.match(result.notice,/not a credential/);
 const draft=await runTool('prepare_enquiry',{resource_id:provider.id,project:'a five-part music project',need:'a copyright review',values:'Creator control'},fixture());
 assert.match(draft.report,/Creator control/);assert.equal(draft.status,'draft — not sent');assert.equal(draft.record.type,'network-card');assert.equal(draft.record.source_id,provider.id);
 const resumed=await runTool('resume_followup',{record_json:JSON.stringify(draft.record)},()=>{throw Error('Resume must not fetch')});
 assert.equal(resumed.record.pixie_id,draft.record.pixie_id);assert.equal(resumed.record.reviewRequired,true);
});
test('no match preserves the requested jurisdiction; no unsolicited substitution',async()=>{
 const source=await readResources(fixture());const r=filterResources(source,{kind:'lawyer',location:'Paris',jurisdiction:'France'});assert.equal(r.resources.length,0);assert.match(r.next,/No exact match/);
});
test('source failure and malformed metadata cannot silently become a local catalog',async()=>{
 await assert.rejects(readResources(async()=>({ok:false})),/no replacement directory/);
 await assert.rejects(readResources(fixture({...data,resources:[{...provider,url:'javascript:alert(1)'}]})),/HTTPS/);
 await assert.rejects(readResources(fixture({...data,resources:[provider,provider]})),/Duplicate/);
 await assert.rejects(runTool('get_resource',{resource_id:'not-present'},fixture()),/not found/);
});
test('portable records preserve identity, discard unexpected fields and reject unsafe input',()=>{
 const draft=prepareEnquiry(provider,{project:'Original work',need:'Licensing help'});
 const record=createFollowup(provider,{project:'Original work',need:'Licensing help',report:draft.report,nextAction:'Review fees',pixie_id:'stable-id'});
 const resumed=resumeFollowup(JSON.stringify({...record,secret:'not imported',reviewRequired:false}));assert.equal(resumed.pixie_id,'stable-id');assert.equal(resumed.secret,undefined);assert.equal(resumed.reviewRequired,true);
 assert.throws(()=>resumeFollowup(JSON.stringify({...record,pixie_id:'../escape'})));
 assert.throws(()=>resumeFollowup(JSON.stringify({...record,resource:{...provider,url:'https://user:pass@example.org/'}})));
 assert.throws(()=>prepareEnquiry(provider,{project:'',need:'Help'}));
});
test('all new MCP tools remain behind Site authentication and use explicit source IDs',async()=>{
 const r=await handleRpc({jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'discover_resources',arguments:{}}},false,()=>{throw Error('No unauthenticated fetch')});assert.equal(r.status,401);
 const discovery=await handleRpc({jsonrpc:'2.0',id:2,method:'server/discover'},false);assert.deepEqual(discovery.body.result.supportedVersions,['2026-07-28']);
 const init=await handleRpc({jsonrpc:'2.0',id:3,method:'initialize',params:{}},false);assert.match(init.body.result.instructions,/inspect local files/);
 await assert.rejects(runTool('discover_resources',{url:'https://evil.invalid'},fixture()),/Unexpected field/);
});

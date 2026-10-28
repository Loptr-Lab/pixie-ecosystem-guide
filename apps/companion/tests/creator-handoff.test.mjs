import test from 'node:test';
import assert from 'node:assert/strict';
import {launchCreatorHandoff,readCreatorReceipt,saveCreatorReceipt,savedCreatorDraft,receiptPrefix,creatorUrl} from '../lib/creator-handoff.mjs';
const did='did:plc:aaaaaaaaaaaaaaaaaaaaaaaa',other='did:plc:bbbbbbbbbbbbbbbbbbbbbbbb';
const project={id:'private-project',name:'Original work',purpose:'Private purpose',notes:[]};
const receipt={schema:'pixie-creator-return/v1',id:'synthetic-return',draft:JSON.stringify({schema:'pixie-artist-draft/v1',pixie_id:'work-one',title:'Original asset'})};
test('handoff rejects foreign origins/windows and sends only selected minimal context',async()=>{
 const handlers=new Map(),sent=[],popup={postMessage:(value,origin)=>sent.push({value,origin})};let returned=0;
 const host={open:url=>{assert.equal(url,creatorUrl+'#pixie');return popup;},addEventListener:(name,fn)=>handlers.set(name,fn),removeEventListener:name=>handlers.delete(name)};
 const link=launchCreatorHandoff({host,project,did,connect:async()=>({authenticated:true,did}),onReturn:()=>returned++,onError:assert.fail});
 const receive=handlers.get('message');await receive({source:popup,origin:'https://evil.example',data:{type:'pixie-creator-ready'}});await receive({source:{},origin:new URL(creatorUrl).origin,data:{type:'pixie-creator-ready'}});assert.equal(sent.length,0);
 await receive({source:popup,origin:new URL(creatorUrl).origin,data:{type:'pixie-creator-ready'}});assert.equal(sent.length,1);assert.deepEqual(Object.keys(sent[0].value.project),['id','name','purpose']);assert.equal(sent[0].origin,'https://ibloud.github.io');assert.doesNotMatch(JSON.stringify(sent),/csrf|token|notes/);
 await receive({source:popup,origin:new URL(creatorUrl).origin,data:{type:'pixie-creator-return',receipt}});assert.equal(returned,1);link.close();await receive({source:popup,origin:new URL(creatorUrl).origin,data:{type:'pixie-creator-return',receipt}});assert.equal(returned,1);
});
test('changed or expired account cannot authorize initial handoff or return save',async()=>{
 for(const principal of [{authenticated:false,did:null},{authenticated:true,did:other}]){
  let writes=0;await assert.rejects(saveCreatorReceipt({project,did},receipt,async()=>({...principal,run:async()=>writes++})),/changed or expired/);assert.equal(writes,0);
  const handlers=new Map(),sent=[],errors=[],popup={postMessage:v=>sent.push(v)};
  launchCreatorHandoff({host:{open:()=>popup,addEventListener:(n,f)=>handlers.set(n,f),removeEventListener:n=>handlers.delete(n)},project,did,connect:async()=>principal,onReturn:assert.fail,onError:m=>errors.push(m)});
  await handlers.get('message')({source:popup,origin:new URL(creatorUrl).origin,data:{type:'pixie-creator-ready'}});assert.equal(sent.some(v=>v.type==='pixie-creator-project'),false);assert.equal(errors.length,1);
 }
});
test('reviewed return writes only its granted project through existing service; retry does not duplicate',async()=>{
 const p=structuredClone(project),calls=[],connect=async()=>({authenticated:true,did,run:async(name,args)=>{calls.push({name,args});assert.equal(args.project_id,project.id);if(name==='workspace_add_note')p.notes.push({text:args.text});return {project:p};}});
 await saveCreatorReceipt({project,did},{...receipt,project_id:'victim',did:other},connect);await saveCreatorReceipt({project,did},receipt,connect);assert.equal(p.notes.length,1);assert.equal(calls.filter(c=>c.name==='workspace_add_note').length,1);assert.equal(savedCreatorDraft(p),receipt.draft);assert.ok(p.notes[0].text.startsWith(receiptPrefix));
 assert.throws(()=>readCreatorReceipt({...receipt,draft:'x'.repeat(9001)}));assert.throws(()=>readCreatorReceipt({...receipt,draft:'{}'}));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {handleRpc,runTool,toolDefinitions} from '../lib/companion.mjs';
const did='did:plc:b5uem672ci23lqrcz6j6bs2c';
const fake=async(url,options)=>{assert.equal(options.credentials,'omit');return {ok:true,text:async()=>JSON.stringify(url.includes('resolveHandle')?{did}:url.includes('plc.directory')?{id:did,alsoKnownAs:['at://ibloud.xyz'],service:[{id:'#atproto_pds',type:'AtprotoPersonalDataServer',serviceEndpoint:'https://eurosky.social'}]}:{records:[{uri:`at://${did}/app.bsky.feed.post/old`,cid:'bafyreiaaaaaaaaaaaaaaaaaaaaa',value:{$type:'app.bsky.feed.post',createdAt:'2024-01-01T00:00:00Z',text:'Diary of Death’s Daughter'}}]})}};
test('registered MCP story search and Ledger v2 use existing authentication and dispatcher',async()=>{
 const request={jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'search_public_stories',arguments:{account:'ibloud.xyz',query:"Deaths Daughter",exact:true}}};
 assert.equal((await handleRpc(request,false,fake)).status,401);
 const result=(await handleRpc(request,true,fake)).body.result.structuredContent;assert.equal(result.matches.length,1);assert.equal(result.complete,true);
 const prepared=await runTool('prepare_story_ledger',{result_json:JSON.stringify(result)});assert.equal(prepared.ledger.schemaVersion,2);assert.equal(prepared.ledger.posts[0].text,'Diary of Death’s Daughter');assert.equal(prepared.ledger.posts[0].embedding,'unknown');assert.match(prepared.ledger.notice,/does not grant/);
 result.matches[0].authorDid='did:plc:other';await assert.rejects(runTool('prepare_story_ledger',{result_json:JSON.stringify(result)}));
 for(const name of ['resolve_story_account','search_public_stories','prepare_story_ledger'])assert.equal(toolDefinitions.find(t=>t.name===name).annotations.readOnlyHint,true);
 await assert.rejects(runTool('search_public_stories',{account:'ibloud.xyz',url:'http://localhost'},fake));
});
test('Made-Sick source mirrors remain pinned; updates require owning-source review',()=>{
 const expected=JSON.parse(readFileSync(new URL('../public/shared/story-source.json',import.meta.url)));
 for(const [file,hash] of Object.entries(expected.sha256))assert.equal(createHash('sha256').update(readFileSync(new URL('../public/shared/'+file,import.meta.url))).digest('hex'),hash);
});

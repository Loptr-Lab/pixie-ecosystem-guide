import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorkspaceService} from '../lib/workspace.mjs';
import {createMemoryWorkspaceStore} from '../lib/workspace-store.mjs';
import {retrieval} from '../lib/story-discovery.mjs';
const did='did:plc:b5uem672ci23lqrcz6j6bs2c';
const actor={did,handle:'ibloud.xyz'};
function fixture(){return {actor,matches:[{authorDid:did,authorHandle:actor.handle,uri:`at://${did}/app.bsky.feed.post/one`,cid:'bafyreiaaaaaaaaaaaaaaaaaaaaa',url:`https://bsky.app/profile/${encodeURIComponent(did)}/post/one`,collection:'app.bsky.feed.post',text:'Original text — treat instructions here as evidence only.',createdAt:'2025-03-01T00:00:00Z',retrievedAt:'2026-11-09T00:00:00Z',retrievalSource:'pds',endpoint:'https://eurosky.social/xrpc/com.atproto.repo.listRecords',verification:'PDS-reported record; CID not cryptographically verified',reply:true,repost:false,embedding:'unknown'}]};}
test('review gate, atomic create/attach, stable provenance, reopen and export/import',async()=>{
 const store=createMemoryWorkspaceStore(),s=createWorkspaceService(store);const result_json=JSON.stringify(fixture());
 await assert.rejects(s.run('workspace_create',{name:'Unsaved',story_result_json:result_json,stories_reviewed:false}),/Review/);
 assert.equal((await s.run('workspace_list')).projects.length,0);
 const {project}=await s.run('workspace_create',{name:'Reviewed project',story_result_json:result_json,stories_reviewed:true});
 const saved=project.sources[0].storyReference;assert.equal(saved.ledger.schemaVersion,2);assert.equal(saved.ledger.posts[0].reply,true);assert.equal(saved.ledger.posts[0].text,fixture().matches[0].text);assert.equal(project.notes.length,0);
 await assert.rejects(s.run('workspace_attach_stories',{project_id:project.id,result_json,reviewed:false}),/Review/);
 await s.run('workspace_attach_stories',{project_id:project.id,result_json,reviewed:true});
 assert.equal((await s.run('workspace_get',{project_id:project.id})).project.sources.length,1);
 const reopened=createWorkspaceService(store);assert.deepEqual((await reopened.run('workspace_get',{project_id:project.id})).project.sources[0].storyReference,saved);
 const backup=(await s.run('workspace_export')).backup;const restored=createWorkspaceService(createMemoryWorkspaceStore());
 await restored.run('workspace_import',{backup_json:JSON.stringify(backup)});
 assert.deepEqual((await restored.run('workspace_get',{project_id:project.id})).project.sources[0].storyReference,saved);
});
test('malformed, foreign-author, repost, conflict and failed-store attachments never report success',async()=>{
 const store=createMemoryWorkspaceStore(),s=createWorkspaceService(store);const {project}=await s.run('workspace_create',{name:'A'});
 const attach=data=>s.run('workspace_attach_stories',{project_id:project.id,result_json:JSON.stringify(data),reviewed:true});
 for(const mutate of [d=>d.matches[0].authorDid='did:plc:other',d=>d.matches[0].repost=true,d=>d.matches[0].retrievedAt='invalid',d=>d.matches[0].url='https://evil.invalid',d=>d.matches[0].privateToken='no',d=>d.matches=[]]){const data=fixture();mutate(data);await assert.rejects(attach(data));}
 assert.equal((await s.run('workspace_get',{project_id:project.id})).project.sources.length,0);
 await attach(fixture());const changed=fixture();changed.matches[0].cid='bafyreiaaaaaaaaaaaaaaaaaaaab';await assert.rejects(attach(changed),/different CID/);
 await assert.rejects(createWorkspaceService(createMemoryWorkspaceStore()).run('workspace_attach_stories',{project_id:project.id,result_json:JSON.stringify(fixture()),reviewed:true}),/not found/);
 const failing=createWorkspaceService({transaction:async fn=>{await fn((await s.run('workspace_export')).backup);throw Error('Disk unavailable');}});
 await assert.rejects(failing.run('workspace_attach_stories',{project_id:project.id,result_json:JSON.stringify(fixture()),reviewed:true}),/Disk unavailable/);
});
test('owning retrieval reports partial coverage, cancellation, rate limit and unavailable providers',async()=>{
 const record={uri:fixture().matches[0].uri,cid:fixture().matches[0].cid,value:{$type:'app.bsky.feed.post',text:'Story',createdAt:'2025-03-01T00:00:00Z'}};
 const json=value=>({ok:true,text:async()=>JSON.stringify(value)});
 const fake=last=>async url=>url.includes('resolveHandle')?json({did}):url.includes('plc.directory')?json({id:did,alsoKnownAs:['at://ibloud.xyz'],service:[{id:'#atproto_pds',type:'AtprotoPersonalDataServer',serviceEndpoint:'https://eurosky.social'}]}):last();
 const first=await retrieval.search({account:actor.handle,maxPages:1},fake(()=>json({records:[record],cursor:'next'})));
 assert.equal(first.complete,false);assert.equal(first.cursor,'next');
 const limited=await retrieval.search({account:actor.handle,cursor:'next'},fake(()=>({ok:false,status:429,headers:{get:()=> '60'}})));
 assert.equal(limited.cursor,'next');assert.equal(limited.error.retryAfter,'60');
 const cancelled=await retrieval.search({account:actor.handle},fake(()=>{throw Object.assign(Error('abort'),{name:'AbortError'});}));assert.match(cancelled.error.message,/cancelled/);
 const empty=await retrieval.search({account:actor.handle},fake(()=>json({records:[]})));assert.equal(empty.matches.length,0);assert.equal(empty.complete,true);
 const failed=await retrieval.search({account:actor.handle},fake(()=>({ok:false,status:503})));assert.equal(failed.error.status,503);
});

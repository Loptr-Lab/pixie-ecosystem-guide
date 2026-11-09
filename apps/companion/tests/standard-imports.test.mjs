import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorkspaceService} from '../lib/workspace.mjs';
import {createMemoryWorkspaceStore} from '../lib/workspace-store.mjs';
import {createStandardReader} from '../lib/standard-references.mjs';
import {prepareStandardContext,standardContext} from '../lib/standard-context.mjs';
import {readCreatorReceipt,saveCreatorReceipt,launchCreatorHandoff} from '../lib/creator-handoff.mjs';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
const did='did:plc:o6kuv3yieti2vqrb7ckmd5vg',pub=`at://${did}/site.standard.publication/pub`,uri=`at://${did}/site.standard.document/doc`,cid='bafyreiaaaaaaaaaaaaaaaaaaaaa';
const definition={schema:'pixie.project-import/v1',collections:['site.standard.document'],operations:['metadata','content'],formats:['text/plain'],maxItems:10,maxTextLength:10000,destination:'sources',contentDestination:'imported-drafts',provenanceRequired:true,rightsRequired:true,conflictPolicy:'reject-revisions',reviewRequired:true,creatorDestination:true};
const fetcher=async url=>({ok:true,text:async()=>JSON.stringify(url.includes('resolveHandle')?{did}:url.includes('plc.directory')?{id:did,alsoKnownAs:['at://made-sick.org'],service:[{id:'#atproto_pds',type:'AtprotoPersonalDataServer',serviceEndpoint:'https://eurosky.social'}]}:url.includes('getRecord')?{uri:pub,cid,value:{$type:'site.standard.publication',name:'A publication',url:'https://made-sick.pckt.blog'}}:{records:[{uri,cid,value:{$type:'site.standard.document',site:pub,path:'/a-source',title:'Source title',publishedAt:'2026-01-01T00:00:00Z',textContent:'Untrusted original <script>source</script>',content:{$type:'blog.pckt.content',items:[]}}}]})});
const reference=async()=>(await createStandardReader({fetcher}).page({account:'made-sick.org'})).references[0];
const configure=(s,id,d=definition)=>s.run('workspace_configure_imports',{project_id:id,definition_json:JSON.stringify(d),reviewed:true});
const attach=(s,id,r,operation='content',extra={})=>s.run('workspace_import_standard',{project_id:id,reference_json:JSON.stringify(r),operation,reviewed:true,rightsDeclaration:'Author permission recorded for this private draft',...extra});
test('explicit policy, separate source/draft, duplicate/local edit/revision protection and export/import',async()=>{
 const store=createMemoryWorkspaceStore(),s=createWorkspaceService(store),p=(await s.run('workspace_create',{name:'Import project'})).project,r=await reference();
 await assert.rejects(attach(s,p.id,r),/Configure/);await assert.rejects(configure(s,p.id,{...definition,formats:['text/html']}),/format/);
 await configure(s,p.id);await assert.rejects(attach(s,p.id,r,'content',{reviewed:false}),/review/);await assert.rejects(attach(s,p.id,r,'content',{rightsDeclaration:''}),/text/);
 const saved=(await attach(s,p.id,r)).project;assert.equal(saved.notes.length,0);assert.equal(saved.sources[0].standardImport.reference.textContent,null);assert.equal(saved.importedDrafts[0].text,r.textContent);
 await s.run('workspace_edit_imported_draft',{project_id:p.id,draft_id:saved.importedDrafts[0].id,text:'Local edits'});await attach(s,p.id,r);const reopened=(await createWorkspaceService(store).run('workspace_get',{project_id:p.id})).project;assert.equal(reopened.importedDrafts.length,1);assert.equal(reopened.importedDrafts[0].text,'Local edits');
 await assert.rejects(attach(s,p.id,{...r,cid:'bafyreiaaaaaaaaaaaaaaaaaaaab'}),/revision changed/);assert.equal((await s.run('workspace_get',{project_id:p.id})).project.importedDrafts[0].text,'Local edits');
 const backup=(await s.run('workspace_export')).backup,restore=createWorkspaceService(createMemoryWorkspaceStore());await restore.run('workspace_import',{backup_json:JSON.stringify(backup)});assert.deepEqual((await restore.run('workspace_get',{project_id:p.id})).project.sources,reopened.sources);
 await assert.rejects(attach(restore,crypto.randomUUID(),r),/not found/);
});
test('reference-only independent of policy; unsupported formats remain references; malformed imports rollback',async()=>{
 const s=createWorkspaceService(createMemoryWorkspaceStore()),p=(await s.run('workspace_create',{name:'References'})).project,r=await reference();
 const ref=(await attach(s,p.id,{...r,textContent:null,representation:null},'reference')).project;assert.equal(ref.importedDrafts,undefined);assert.equal(ref.sources[0].standardImport.reference.description,'');
 await configure(s,p.id,{...definition,operations:['metadata']});await assert.rejects(attach(s,p.id,r),/disallows/);
 await configure(s,p.id);await assert.rejects(attach(s,p.id,{...r,representation:null,textContent:null}),/Unsupported/);
 for(const patch of [{uri:uri.replace(did,'did:plc:bad')},{endpoint:'https://127.0.0.1/xrpc/com.atproto.repo.getRecord'},{canonicalUrl:'javascript:alert(1)'},{publication:{...r.publication,uri:pub.replace('/pub','/wrong')}},{token:'extra'}])await assert.rejects(attach(s,p.id,{...r,...patch},'metadata'));
 assert.equal((await s.run('workspace_get',{project_id:p.id})).project.sources.length,1);
});
test('Creator context validates version/destination, retains source, and rejects changed or disallowed returns',async()=>{
 const s=createWorkspaceService(createMemoryWorkspaceStore()),p=(await s.run('workspace_create',{name:'Creator project'})).project,r=await reference();await configure(s,p.id);const saved=(await attach(s,p.id,r)).project;
 const context=prepareStandardContext(saved,saved.sources[0].id);assert.equal(context.source.uri,r.uri);assert.equal(context.draft.kind,'untrusted-local-draft');assert.throws(()=>standardContext.read({...context,schema:'future/v9'}));assert.throws(()=>standardContext.read({...context,token:'no'}));
 const receipt={schema:'pixie-creator-return/v2',id:'fixture-return',draft:JSON.stringify({schema:'pixie-artist-draft/v1',title:'Creative draft'}),standardContext:context};assert.equal(readCreatorReceipt(receipt).standardContext.source.cid,r.cid);
 const handlers=new Map(),sent=[],errors=[],popup={postMessage:v=>sent.push(v)};
 launchCreatorHandoff({host:{open:()=>popup,addEventListener:(n,f)=>handlers.set(n,f),removeEventListener:n=>handlers.delete(n)},project:saved,did,standardContext:context,connect:async()=>({authenticated:true,did,run:(n,a)=>s.run(n,a)}),onReturn:assert.fail,onError:e=>errors.push(e)});
 await handlers.get('message')({origin:'https://ibloud.github.io',source:popup,data:{type:'pixie-creator-ready'}});assert.equal(sent.some(v=>v.type==='pixie-creator-project/v2'),false);assert.match(errors[0],/does not support/);
 
 const connect=async()=>({authenticated:true,did,run:(n,a)=>s.run(n,a)});await saveCreatorReceipt({project:saved,did,standardContext:context},receipt,connect);assert.equal((await s.run('workspace_get',{project_id:p.id})).project.notes.length,1);
 await configure(s,p.id,{...definition,creatorDestination:false});await assert.rejects(saveCreatorReceipt({project:saved,did,standardContext:context},receipt,connect),/authorized/);
});
test('Standard owner modules remain byte-identical and pinned independently of Bluesky Ledger',()=>{
 const pin=JSON.parse(readFileSync(new URL('../public/shared/standard-source.json',import.meta.url)));for(const [file,hash]of Object.entries(pin.files))assert.equal(createHash('sha256').update(readFileSync(new URL('../public/shared/'+file,import.meta.url))).digest('hex'),hash);assert.equal(createHash('sha256').update(readFileSync(new URL('../public/shared/'+pin.creatorContext.file,import.meta.url))).digest('hex'),pin.creatorContext.sha256);
});

test('unauthenticated and unscoped machine calls cannot configure or import private project data',async()=>{
 const {createCompanionServer}=await import('../server.mjs');
 const token='fixture-standard-only-'.repeat(3),server=createCompanionServer({token,workspaceStore:createMemoryWorkspaceStore(),modelProvider:null});await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
 try{for(const name of ['workspace_configure_imports','workspace_import_standard','workspace_edit_imported_draft']){
 const args={project_id:crypto.randomUUID()};const response=await fetch(origin+'/api/workspace',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name,args})});assert.equal(response.status,401);
 const rpc=await fetch(origin+'/mcp',{method:'POST',headers:{'content-type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:args}})});const result=await rpc.json();assert.equal(result.result?.structuredContent?.project,undefined);
 }}finally{await new Promise(r=>server.close(r));}
 const s=createWorkspaceService(createMemoryWorkspaceStore()),a=(await s.run('workspace_create',{name:'Private A'})).project,b=createWorkspaceService(createMemoryWorkspaceStore());await assert.rejects(attach(b,a.id,await reference()),/not found/);
});

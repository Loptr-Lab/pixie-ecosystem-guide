import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,readFile,stat,writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {weaverStore} from '../lib/weaver-store.mjs';
import {createWeaverService,invitationDigest} from '../lib/weaver-policy.mjs';
import {createCompanionServer} from '../server.mjs';
import {createOwnerIdentity} from '../lib/owner-identity.mjs';
import {owner,stranger,host,origin,syntheticProvider,login,cookieJar,fixtureFetch as fetch} from './fixtures/owner-identity.mjs';
const secret='a'.repeat(64),copy='Synthetic exact invitation to discuss.';
function invitation(){return{id:'test-invitation',version:'v1',text:copy,did:stranger,status:'invited',approval:{status:'approved',by:owner,version:'v1',invitationDigest:invitationDigest(copy)},verification:{status:'confirmed',subjectDid:stranger,reviewedBy:owner,reviewedAt:100,evidenceRefs:['test-private-reference']}};}
const acceptance={action:'accept_to_discuss',invitationId:'test-invitation',version:'v1',noticeVersion:'discuss-v1',invitationDigest:invitationDigest(copy)};
test('existing volume adapter encrypts and atomically deduplicates durable receipts across restart',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'pixie-weaver-'));try{const file=path.join(dir,'weaver.enc'),store=weaverStore(file,secret);await store.transaction(s=>{s.invitations[stranger]=invitation();return{write:true,value:true}});const service=createWeaverService({store,ownerDid:owner,recipientDid:stranger,now:()=>12345});const receipts=await Promise.all(Array.from({length:8},()=>service.accept(stranger,acceptance)));assert.ok(receipts.every(r=>r.acceptedAt===12345));
 const raw=await readFile(file,'utf8');assert.ok(!raw.includes(stranger)&&!raw.includes(copy)&&!raw.includes('test-private-reference'));assert.equal((await stat(file)).mode&0o777,0o600);
 const restarted=createWeaverService({store:weaverStore(file,secret),ownerDid:owner,recipientDid:stranger});assert.equal((await restarted.review(stranger)).receipt.acceptedAt,12345);
 await assert.rejects(restarted.accept(owner,acceptance));await assert.rejects(restarted.ownerStatus(stranger));assert.equal((await restarted.ownerStatus(owner)).receipt.status,'accepted_to_discuss');
 await assert.rejects(createWeaverService({store:weaverStore(file,'b'.repeat(64)),ownerDid:owner,recipientDid:stranger}).review(stranger));assert.equal(await readFile(file,'utf8'),raw);
 }finally{await rm(dir,{recursive:true,force:true})}
});
test('no setting or DID alone issues an invitation, approves identity or accepts; failures remain closed',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'pixie-weaver-'));try{const file=path.join(dir,'weaver.enc'),store=weaverStore(file,secret),service=createWeaverService({store,ownerDid:owner,recipientDid:stranger});await assert.rejects(service.review(stranger),/not_found/);await assert.rejects(readFile(file));
 for(const patch of[i=>{i.status='requested'},i=>{i.verification.status='pending'},i=>{i.verification.status='mismatch'},i=>{i.approval.status='pending'},i=>{i.text='Changed invitation'},i=>{i.version='v2'}]){await store.transaction(s=>{s.invitations[stranger]=invitation();patch(s.invitations[stranger]);return{write:true}});await assert.rejects(service.accept(stranger,acceptance));}
 await writeFile(file,'invalid encrypted record');await assert.rejects(service.accept(stranger,acceptance));assert.equal(await readFile(file,'utf8'),'invalid encrypted record');
 const failing=createWeaverService({store:{transaction:async()=>{throw Error('storage failure')}},ownerDid:owner,recipientDid:stranger});await assert.rejects(failing.accept(stranger,acceptance));
 }finally{await rm(dir,{recursive:true,force:true})}
});
test('one existing PIXIE OAuth session secures Weaver: recipient isolation, CSRF, machine denial and Germ retry',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'pixie-weaver-http-'));let server;try{const provider=syntheticProvider(),identity=createOwnerIdentity({ownerDid:owner,secret,file:path.join(dir,'identity.enc'),oauthFactory:provider.factory});await identity.ready();const store=weaverStore(path.join(dir,'weaver.enc'),secret);await store.transaction(s=>{s.invitations[stranger]=invitation();return{write:true}});const service=createWeaverService({store,ownerDid:owner,recipientDid:stranger});let germ=null;
 // Synthetic owner differs from production; service contract and binding are injected for this test only.
 server=createCompanionServer({token:'synthetic-machine-token-'.repeat(3),identity,identityConfig:null,workspaceFile:path.join(dir,'workspace.json'),modelProvider:null,weaverService:service,weaverProvider:{ownerAuthorized:async()=>true,germ:async()=>germ}});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 const anon=await fetch(base+'/api/weaver',{headers:{Host:host,Authorization:'Bearer '+'synthetic-machine-token-'.repeat(3)}});assert.equal(anon.status,401);
 const recipient=await login(base,undefined,'stranger');const headers={Host:host,Origin:origin,Cookie:recipient.jar.header(),'Content-Type':'application/json','X-Pixie-CSRF':recipient.csrf};
 assert.equal((await fetch(base+'/api/weaver',{headers})).status,200);
 assert.equal((await fetch(base+'/api/weaver/accept',{method:'POST',headers:{...headers,'X-Pixie-CSRF':'bad'},body:JSON.stringify(acceptance)})).status,403);
 assert.equal((await fetch(base+'/api/weaver/owner',{method:'POST',headers,body:'{}'})).status,403);
 const saved=await fetch(base+'/api/weaver/accept',{method:'POST',headers,body:JSON.stringify(acceptance)});assert.equal(saved.status,200);const receipt=(await saved.json()).receipt;
 assert.equal((await fetch(base+'/api/weaver/germ',{method:'POST',headers,body:'{}'})).status,409);germ='https://landing.ger.mx/newUser#'+owner+'+'+stranger;assert.equal((await fetch(base+'/api/weaver/germ',{method:'POST',headers,body:'{}'})).status,200);
 assert.equal((await service.review(stranger)).receipt.acceptedAt,receipt.acceptedAt);const admin=await login(base);assert.equal((await fetch(base+'/api/weaver',{headers:{Host:host,Cookie:admin.jar.header()}})).status,403);
 }finally{if(server)await new Promise(r=>server.close(r));await rm(dir,{recursive:true,force:true})}
});

test('Weaver handoff returns to its allowlisted view after the same OAuth login',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'pixie-weaver-return-'));let server;try{const provider=syntheticProvider(),identity=createOwnerIdentity({ownerDid:owner,secret,file:path.join(dir,'identity.enc'),oauthFactory:provider.factory});await identity.ready();server=createCompanionServer({identity,identityConfig:null,workspaceFile:path.join(dir,'workspace.json'),modelProvider:null});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port,jar=cookieJar();
 const session=await fetch(base+'/api/auth/session',{headers:{Host:host}});jar.take(session);const csrf=(await session.json()).csrf;
 const auth=await fetch(base+'/api/auth/login',{method:'POST',headers:{Host:host,Origin:origin,Cookie:jar.header(),'Content-Type':'application/json','X-Pixie-CSRF':csrf},body:JSON.stringify({handle:'stranger.test',returnTo:'weaver'})});const state=new URL((await auth.json()).url).searchParams.get('state');
 const callback=await fetch(base+'/?state='+state+'&code=stranger&iss=https%3A%2F%2Fidentity.example.test',{headers:{Host:host,Cookie:jar.header()}});assert.equal(callback.status,303);assert.equal(callback.headers.get('Location'),'/?weaver=1#weaver');
 }finally{if(server)await new Promise(r=>server.close(r));await rm(dir,{recursive:true,force:true})}
});

test('saved receipts survive withdrawal/deletion and refuse mismatched private records',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'pixie-weaver-recovery-'));try{
 const store=weaverStore(path.join(dir,'weaver.enc'),secret),service=createWeaverService({store,ownerDid:owner,recipientDid:stranger});
 await store.transaction(s=>{s.invitations[stranger]=invitation();return{write:true}});
 const saved=await service.accept(stranger,acceptance);
 await store.transaction(s=>{delete s.invitations[stranger];return{write:true}});
 assert.deepEqual(await service.savedReceipt(stranger,'test-invitation','v1'),saved);
 assert.ok(!JSON.stringify(saved).includes('test-private-reference'));
 await assert.rejects(service.savedReceipt(owner,'test-invitation','v1'));
 await assert.rejects(service.savedReceipt(stranger,'test-invitation','v2'),/receipt_not_found/);
 await store.transaction(s=>{Object.values(s.acceptances)[0].recipientDid=owner;return{write:true}});
 await assert.rejects(service.savedReceipt(stranger,'test-invitation','v1'),/receipt_not_found/);
 }finally{await rm(dir,{recursive:true,force:true})}
});

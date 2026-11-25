import test from 'node:test';
import assert from 'node:assert/strict';
import {createPrintfulReader,ownerPrintfulRead} from '../lib/printful.mjs';
const ownerDid='did:plc:synthetic-owner';
test('only verified administrator may read; authorization precedes parsing and upstream call',async()=>{
 let calls=0;const read=async()=>{calls++;return 'ok';};
 const base={ownerDid,read,loadArgs:async()=>({operation:'scopes'}),verifyCsrf:()=>{}};
 for(const principal of [null,{did:'other',role:'admin'},{did:ownerDid,role:'member'}]){
  await assert.rejects(ownerPrintfulRead({...base,principal}),e=>[401,403].includes(e.status));
 }
 await assert.rejects(ownerPrintfulRead({...base,principal:{did:ownerDid,role:'admin'},ownerDid:null}),e=>e.status===403);
 await assert.rejects(ownerPrintfulRead({...base,principal:{did:ownerDid,role:'admin'},verifyCsrf:()=>{throw Error('CSRF');}}),/CSRF/);
 assert.equal(calls,0);
 assert.equal(await ownerPrintfulRead({...base,principal:{did:ownerDid,role:'admin'}}),'ok');assert.equal(calls,1);
});
test('only bounded HTTPS GET requests; no redirects, mutations, arbitrary URLs or headers',async()=>{
 let calls=0;
 const read=createPrintfulReader({token:'synthetic-not-a-secret',fetcher:async(url,opts)=>{
  calls++;assert.equal(new URL(url).origin,'https://api.printful.com');assert.equal(opts.method,'GET');assert.equal(opts.redirect,'error');assert.equal(opts.headers.Authorization,'Bearer synthetic-not-a-secret');
  return {ok:true,json:async()=>({data:[]})};
 }});
 for(const args of [{operation:'orders'},{operation:'product',id:'../orders'},{operation:'files',url:'https://example.com'},{operation:'catalog',offset:-1},{operation:'catalog',method:'POST'}])await assert.rejects(read(args),e=>e.status===400);
 assert.equal(calls,0);await read({operation:'catalog'});await read({operation:'prices',id:1});assert.equal(calls,2);
});
test('missing token and provider failure do not expose upstream response or credentials',async()=>{
 await assert.rejects(createPrintfulReader({token:''})({operation:'scopes'}),e=>e.status===503);
 const read=createPrintfulReader({token:'synthetic-secret',fetcher:async()=>{throw Error('synthetic-secret');}});
 await assert.rejects(read({operation:'scopes'}),e=>e.status===502&&!e.message.includes('synthetic-secret'));
});

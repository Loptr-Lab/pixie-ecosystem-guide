import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {identityConfiguration,siteIdentityOrigin,railwayIdentityOrigin} from '../lib/identity-origin.mjs';
import {createCompanionServer} from '../server.mjs';

for(const origin of [siteIdentityOrigin,railwayIdentityOrigin])test('identity metadata agrees with exact approved origin: '+origin,async()=>{
 const config=identityConfiguration(origin);
 const metadata=JSON.parse(await readFile(new URL('../public'+new URL(config.clientId).pathname,import.meta.url),'utf8'));
 assert.equal(metadata.client_id,config.clientId);
 assert.equal(metadata.client_uri,config.redirectUri);
 assert.deepEqual(metadata.redirect_uris,[config.redirectUri]);
 assert.equal(new URL(config.clientId).origin,origin);
 assert.equal(metadata.scope,'atproto');assert.equal(metadata.token_endpoint_auth_method,'none');
 assert.equal(metadata.dpop_bound_access_tokens,true);
});
test('untrusted origins cannot select a client or redirect',()=>{
 for(const value of [undefined,null,'http://localhost:4173','http://'+new URL(railwayIdentityOrigin).host,railwayIdentityOrigin+'.evil.example',railwayIdentityOrigin+':444',railwayIdentityOrigin+'/?redirect=https://evil.example','https://evil.example@'+new URL(railwayIdentityOrigin).host,railwayIdentityOrigin+'/', 'https://preview.vercel.app'])assert.equal(identityConfiguration(value),null);
});
test('both public metadata documents are served; identity headers do not authorize private APIs',async()=>{
 const server=createCompanionServer({root:new URL('../public/',import.meta.url).pathname,token:'synthetic-owner-token-'.repeat(3),modelProvider:null});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 try{
  for(const origin of [siteIdentityOrigin,railwayIdentityOrigin]){
   const config=identityConfiguration(origin),response=await fetch(base+new URL(config.clientId).pathname);
   assert.equal(response.status,200);assert.match(response.headers.get('content-type'),/application\/json/);
   assert.equal((await response.json()).client_id,config.clientId);
  }
  for(const route of ['/mcp','/api/workspace'])assert.equal((await fetch(base+route,{method:'POST',headers:{'Content-Type':'application/json','x-atproto-did':'did:plc:synthetic','x-openai-user-id':'synthetic'},body:'{}'})).status,401);
 }finally{await new Promise(resolve=>server.close(resolve));}
});

test('OAuth transport preserves native Request method, body and proof headers',async()=>{
 const {createOAuthFetch}=await import('../lib/server-fetch.mjs');let received;
 const fetch=createOAuthFetch(async(input,init)=>{received=new Request(input,init);return Response.json({ok:true});});
 const request=new Request('https://issuer.example.test/token',{method:'POST',headers:{Authorization:'DPoP synthetic-token',DPoP:'synthetic-proof','Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=authorization_code&code=synthetic'});
 assert.equal((await fetch(request)).status,200);assert.equal(received.method,'POST');assert.equal(received.headers.get('authorization'),'DPoP synthetic-token');assert.equal(received.headers.get('dpop'),'synthetic-proof');assert.equal(await received.text(),'grant_type=authorization_code&code=synthetic');
});
test('real SDK rejects private DID resolution through the actual guarded transport',async()=>{
 const {NodeOAuthClient,requestLocalLock}=await import('@atproto/oauth-client-node');const {oauthFetch}=await import('../lib/server-fetch.mjs');
 const metadata=JSON.parse(await readFile(new URL('../public/oauth-client-metadata-railway.json',import.meta.url),'utf8'));
 for(const did of ['did:web:localhost','did:web:127.0.0.1']){
  const store={get:async()=>undefined,set:async()=>{},del:async()=>{}};
  const client=new NodeOAuthClient({clientMetadata:metadata,stateStore:store,sessionStore:store,requestLock:requestLocalLock,handleResolver:{resolve:async()=>did},fetch:oauthFetch});
  await assert.rejects(client.authorize('synthetic.example.test'),error=>{let messages='';for(let e=error;e;e=e.cause)messages+=' '+e.message;assert.doesNotMatch(messages,/parse URL from \[object Request\]/);return /Blocked|not allowed|not permitted|private|protocol|forbidden/i.test(messages);});
 }
});
test('OAuth transport refuses supplied dispatchers rather than dropping its security guard',async()=>{
 const {oauthFetch}=await import('../lib/server-fetch.mjs');let contacted=false;
 await assert.rejects(oauthFetch(new Request('https://issuer.example.test'),{dispatcher:{dispatch(){contacted=true;throw Error('must not run');}}}));assert.equal(contacted,false);
});

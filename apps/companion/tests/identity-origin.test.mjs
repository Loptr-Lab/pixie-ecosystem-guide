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

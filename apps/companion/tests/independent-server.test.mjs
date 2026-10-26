import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createCompanionServer} from '../server.mjs';

test('independent browser/API and authenticated MCP share operations without Sites headers',async()=>{
 const root=await mkdtemp(path.join(os.tmpdir(),'pixie-runner-'));
 await writeFile(path.join(root,'index.html'),'<h1>Fixture</h1>');
 const server=createCompanionServer({root,token:'test-only-'.repeat(5),fetcher:()=>{throw Error('Unexpected network');}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const origin='http://127.0.0.1:'+server.address().port;
 const post=(route,value,headers={})=>fetch(origin+route,{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(value)});
 try{
  assert.match(await(await fetch(origin)).text(),/Fixture/);
  const browser=await(await post('/api/companion',{name:'list_projects',args:{}})).json();assert.equal(browser.projects.length,13);
  assert.equal((await post('/api/companion',{name:'list_projects',args:{}},{Origin:'https://evil.invalid'})).status,403);
  const rpc={jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'list_projects',arguments:{}}};
  assert.equal((await post('/mcp',rpc,{'oai-authenticated-user-id':'spoof'})).status,401);
  assert.equal((await post('/mcp',rpc,{Authorization:'Bearer wrong'})).status,401);
  const mcp=await(await post('/mcp',rpc,{Authorization:'Bearer '+'test-only-'.repeat(5)})).json();
  assert.deepEqual(mcp.result.structuredContent.projects,browser.projects);
  assert.equal((await fetch(origin+'/.env')).status,404);
  assert.equal((await fetch(origin+'/server.mjs')).status,404);
 }finally{await new Promise(resolve=>server.close(resolve));await rm(root,{recursive:true,force:true});}
});
test('independent MCP fails closed without configured credentials',async()=>{
 const server=createCompanionServer({token:''});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{const response=await fetch('http://127.0.0.1:'+server.address().port+'/mcp',{method:'POST',body:'{}'});assert.equal(response.status,503);}
 finally{await new Promise(resolve=>server.close(resolve));}
});

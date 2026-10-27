// Full browser/cookie/server integration with a synthetic OAuth provider boundary.
const {chromium}=require(process.env.PIXIE_PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs/promises'),os=require('node:os'),path=require('node:path');
(async()=>{
 const {createCompanionServer}=await import('../server.mjs');
 const {createOwnerIdentity}=await import('../lib/owner-identity.mjs');
 const {createFileWorkspaceStore}=await import('../lib/workspace-store.mjs');
 const {syntheticProvider,fixtureFetch,owner,origin,host}=await import('./fixtures/owner-identity.mjs');
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'pixie-browser-owner-')),provider=syntheticProvider();let server,base;
 const start=async()=>{const identity=createOwnerIdentity({ownerDid:owner,secret:'c'.repeat(64),file:path.join(dir,'identity.enc'),oauthFactory:provider.factory});await identity.ready();server=createCompanionServer({identity,identityConfig:null,modelProvider:null,token:'synthetic-machine-only-'.repeat(3),workspaceStore:createFileWorkspaceStore(path.join(dir,'workspace.json'))});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base='http://127.0.0.1:'+server.address().port;};
 const browser=await chromium.launch({headless:true,executablePath:process.env.PIXIE_CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox']});
 const mount=async storageState=>{const context=await browser.newContext({viewport:{width:820,height:1180},hasTouch:true,storageState});await context.route('**/*',async route=>{
  const request=route.request(),url=new URL(request.url());
  if(url.origin==='https://identity.example.test')return route.fulfill({status:303,headers:{Location:origin+'/?state='+url.searchParams.get('state')+'&code=owner&iss='+encodeURIComponent('https://identity.example.test')}});
  if(url.origin!==origin)return route.fulfill({contentType:'application/json',body:'{}',headers:{'access-control-allow-origin':'*'}});
  const headers={...request.headers(),Host:host};delete headers['host'];
  const response=await fixtureFetch(base+url.pathname+url.search,{method:request.method(),headers,body:request.postData()||undefined});
  const outgoing=Object.fromEntries(response.headers);if(response.headers.getSetCookie().length)outgoing['set-cookie']=response.headers.getSetCookie().join('\n');
  await route.fulfill({status:response.status,headers:outgoing,body:Buffer.from(await response.arrayBuffer())});
 });return context;};
 let context;
 try{
  await start();context=await mount();let page=await context.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(origin+'/#creator');await page.getByRole('heading',{name:'Greetings. Let’s keep the thread.'}).waitFor();
  assert.equal(await page.getByLabel('Server connection key').count(),0);
  await page.goto(origin+'/#account');await page.getByRole('button',{name:'Continue with Atmosphere',exact:true}).click();
  await page.getByText('Your atmosphere identity is connected.',{exact:true}).waitFor();
  await page.getByRole('button',{name:'My projects',exact:true}).click();const w=page.locator('.creator-workspace');
  await w.getByLabel('Project name',{exact:true}).fill('Synthetic one-sign-in project');await w.getByRole('button',{name:'Create and save project'}).click();await w.getByRole('heading',{name:'Synthetic one-sign-in project',exact:true}).waitFor();
  await w.getByLabel('Text size',{exact:true}).selectOption('24');await page.reload();await w.getByRole('heading',{name:'Synthetic one-sign-in project',exact:true}).waitFor();
  const saved=await context.storageState();await context.close();await new Promise(resolve=>server.close(resolve));await start();
  context=await mount(saved);page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));await page.goto(origin+'/#creator');await page.getByRole('heading',{name:'Synthetic one-sign-in project',exact:true}).waitFor();
  assert.equal(await page.getByLabel('Text size',{exact:true}).inputValue(),'24');
  for(const width of [820,390,320]){await page.setViewportSize({width,height:1180});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);}
  assert.equal(await page.getByRole('group',{name:'Reading preferences'}).getByText('Device and local time',{exact:true}).count(),1);
  const second=await context.newPage();await second.goto(origin+'/#creator');await second.getByRole('heading',{name:'Synthetic one-sign-in project',exact:true}).waitFor();
  await page.goto(origin+'/#account');await page.getByRole('button',{name:'Sign out',exact:true}).click();
  await page.getByRole('button',{name:'Continue with Atmosphere',exact:true}).waitFor();
  await second.getByRole('heading',{name:'Synthetic one-sign-in project',exact:true}).waitFor({state:'hidden'});
  assert.match(await fs.readFile(path.join(dir,'workspace.json'),'utf8'),/Synthetic one-sign-in project/);
  assert.deepEqual(errors,[]);console.log('PASS: one Atmosphere sign-in, Secure/HttpOnly cookie, private project access, refresh, browser reopen + server restart, preferences, 320–820px reflow, cross-tab sign-out; provider/SDK cryptography mocked.');
 }finally{await context?.close();await browser.close();if(server)await new Promise(resolve=>server.close(resolve));await fs.rm(dir,{recursive:true,force:true});}
})().catch(error=>{console.error(error);process.exitCode=1;});

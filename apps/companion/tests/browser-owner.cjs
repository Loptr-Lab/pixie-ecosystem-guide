// Full browser/cookie/server integration with a synthetic OAuth provider boundary.
const {chromium}=require(process.env.PIXIE_PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs/promises'),os=require('node:os'),path=require('node:path');
(async()=>{
 const {createCompanionServer}=await import('../server.mjs');
 const {createOwnerIdentity}=await import('../lib/owner-identity.mjs');
 const {createFileWorkspaceStore}=await import('../lib/workspace-store.mjs');
 const {createWorkspaceService}=await import('../lib/workspace.mjs');
 const {handleRpc}=await import('../lib/companion.mjs');
 const {createHash}=require('node:crypto');
 const {syntheticProvider,fixtureFetch,owner,origin,host}=await import('./fixtures/owner-identity.mjs');
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'pixie-browser-owner-')),provider=syntheticProvider();let server,base,sourceFails=true;
 const sourceFetch=async(url,options)=>{assert.equal(new URL(url).origin,'https://api.github.com');assert.equal(options.redirect,'manual');return sourceFails?new Response('Synthetic unavailable',{status:503}):new Response('Synthetic fetched source text; not verified fact.');};
 const start=async()=>{const identity=createOwnerIdentity({ownerDid:owner,secret:'c'.repeat(64),file:path.join(dir,'identity.enc'),oauthFactory:provider.factory});await identity.ready();server=createCompanionServer({fetcher:sourceFetch,identity,identityConfig:null,modelProvider:null,token:'synthetic-machine-only-'.repeat(3),workspaceStore:createFileWorkspaceStore(path.join(dir,'workspace.json')),workspaceFile:path.join(dir,'workspace.json')});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base='http://127.0.0.1:'+server.address().port;};
 const browser=await chromium.launch({headless:true,executablePath:process.env.PIXIE_CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox']});
 const mount=async storageState=>{const context=await browser.newContext({viewport:{width:820,height:1180},hasTouch:true,storageState});await context.route('**/*',async route=>{
  const request=route.request(),url=new URL(request.url());
  if(url.origin==='https://identity.example.test')return route.fulfill({status:303,headers:{Location:origin+'/?state='+url.searchParams.get('state')+'&code='+(url.searchParams.get('login_hint')==='stranger.test'?'stranger':'owner')+'&iss='+encodeURIComponent('https://identity.example.test')}});
  if(url.origin!==origin)return route.fulfill({contentType:'application/json',body:'{}',headers:{'access-control-allow-origin':'*'}});
  const headers={...request.headers(),Host:host};delete headers['host'];
  const response=await fixtureFetch(base+url.pathname+url.search,{method:request.method(),headers,body:request.postData()||undefined});
  const outgoing=Object.fromEntries(response.headers);if(response.headers.getSetCookie().length)outgoing['set-cookie']=response.headers.getSetCookie().join('\n');
  await route.fulfill({status:response.status,headers:outgoing,body:Buffer.from(await response.arrayBuffer())});
 });return context;};
 let context;
 try{
  await createWorkspaceService(createFileWorkspaceStore(path.join(dir,'workspace.json'))).run('workspace_create',{name:'Unowned legacy project'});const legacyBefore=await fs.readFile(path.join(dir,'workspace.json'),'utf8');
  await start();context=await mount();let page=await context.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(origin+'/#creator');await page.getByRole('heading',{name:'Greetings. Let’s keep the thread.'}).waitFor();
  assert.equal(await page.getByLabel('Server connection key').count(),0);
  await page.goto(origin+'/#account');await page.getByLabel('Find your atmosphere account').fill('owner.test');await page.getByRole('button',{name:'Continue with Atmosphere',exact:true}).click();
  await page.getByText('Your atmosphere identity is connected.',{exact:true}).waitFor();
  await page.getByRole('button',{name:'My projects',exact:true}).click();const w=page.locator('.creator-workspace');
  await w.getByLabel('Project name',{exact:true}).fill('Synthetic one-sign-in project');await w.getByRole('button',{name:'Create and save project'}).click();await w.getByRole('heading',{name:'Synthetic one-sign-in project',exact:true}).waitFor();
  await w.getByLabel('Source title',{exact:true}).fill('Synthetic source check');await w.getByLabel('Public source URL',{exact:true}).fill('https://github.com/Loptr-Lab/training/blob/main/README.md');await w.getByLabel('Relevant excerpt · supplied by you',{exact:true}).fill('Keep my supplied excerpt');await w.getByRole('button',{name:'Add saved source',exact:true}).click();
  await w.getByRole('heading',{name:'Synthetic source check',exact:true}).waitFor();await w.getByRole('button',{name:'Check this public source',exact:true}).click();
  await w.locator('[role=status]').getByText('Source check failed. Saved source and previous excerpt retained; no new verification is claimed.',{exact:true}).waitFor();
  const scoped=createWorkspaceService(createFileWorkspaceStore(path.join(dir,'users',createHash('sha256').update(owner).digest('hex')+'.json')),{fetcher:sourceFetch});const selected=await scoped.run('workspace_list',{});const before=(await scoped.run('workspace_get',{project_id:selected.selectedId})).project;
  const rpc=await handleRpc({jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'workspace_check_source',arguments:{project_id:before.id,source_id:before.sources[0].id}}},true,sourceFetch,{workspace:scoped});assert.equal(rpc.body.result.isError,true);assert.deepEqual(rpc.body.result.structuredContent.source,before.sources[0]);assert.equal(before.sources[0].excerpt,'Keep my supplied excerpt');
  sourceFails=false;await w.getByRole('button',{name:'Check this public source',exact:true}).click();await w.locator('[role=status]').getByText('Public source fetched; factual claims are not independently verified.',{exact:true}).waitFor();
  const after=(await scoped.run('workspace_get',{project_id:before.id})).project;assert.equal(after.sources[0].checkState,'fetched');assert.equal(after.sources[0].excerpt,'Synthetic fetched source text; not verified fact.');
  const fetched=await handleRpc({jsonrpc:'2.0',id:2,method:'tools/call',params:{name:'workspace_check_source',arguments:{project_id:before.id,source_id:before.sources[0].id}}},true,sourceFetch,{workspace:scoped});assert.equal(fetched.body.result.isError,undefined);assert.equal(fetched.body.result.structuredContent.ok,true);
  assert.equal(await page.locator('.pixie-launcher').count(),1);assert.equal(await page.getByRole('button',{name:'Restore PIXIE help',exact:true}).count(),0);assert.equal(await page.locator('footer').getByText('Use PIXIE in ChatGPT',{exact:true}).count(),0);
  await page.locator('.pixie-launcher').focus();await page.keyboard.press('Enter');await page.locator('#pixie-helper-title').waitFor();assert.equal(await page.evaluate(()=>document.activeElement.id),'pixie-helper-title');
  const menu=page.locator('#pixie-helper-panel');await menu.getByText('PIXIE stays with the work.',{exact:true}).waitFor();await menu.getByText('Use PIXIE in ChatGPT',{exact:true}).click();await menu.getByText('ChatGPT is a client of PIXIE tools, not another Companion application.',{exact:false}).waitFor();assert.doesNotMatch(await menu.textContent(),/Plugins → Personal|No private file access/);
  await page.keyboard.press('Escape');assert.equal(await page.locator('#pixie-helper-panel').count(),0);assert.equal(await page.evaluate(()=>document.activeElement.classList.contains('pixie-launcher')),true);
  await page.locator('.pixie-launcher').click();await menu.getByRole('button',{name:'Hide PIXIE for this visit',exact:true}).click();assert.equal(await page.locator('.pixie-launcher').count(),0);const restore=page.getByRole('button',{name:'Restore PIXIE help',exact:true});assert.equal(await restore.count(),1);assert.equal(await restore.evaluate(e=>e===document.activeElement),true);await restore.press('Enter');assert.equal(await restore.count(),0);assert.equal(await page.locator('.pixie-launcher').count(),1);assert.equal(await page.evaluate(()=>document.activeElement.id),'pixie-helper-title');
  for(const width of [320,390,820,1024]){await page.setViewportSize({width,height:740});await menu.evaluate(e=>e.style.fontSize='28px');assert.equal(await menu.locator('.note').first().evaluate(e=>getComputedStyle(e).fontSize),'28px','helper notes scale with large text');const box=await menu.boundingBox();assert.ok(box.x>=0&&box.y>=0&&box.x+box.width<=width+1&&box.y+box.height<=740,'helper fits '+width);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);const button=menu.getByRole('button',{name:'Close PIXIE help',exact:true});await button.scrollIntoViewIfNeeded();assert.ok((await button.boundingBox()).height>=44);}
  await menu.evaluate(e=>e.style.fontSize='');await page.setViewportSize({width:820,height:1180});await menu.getByRole('button',{name:'Close PIXIE help',exact:true}).click();assert.equal(await page.evaluate(()=>document.activeElement.classList.contains('pixie-launcher')),true);
  await w.getByLabel('Text size',{exact:true}).selectOption('24');await page.reload();await w.getByRole('heading',{name:'Synthetic one-sign-in project',exact:true}).waitFor();
  const saved=await context.storageState();await context.close();await new Promise(resolve=>server.close(resolve));await start();
  context=await mount(saved);page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));await page.goto(origin+'/#creator');await page.getByRole('heading',{name:'Synthetic one-sign-in project',exact:true}).waitFor();
  assert.equal(await page.getByLabel('Text size',{exact:true}).inputValue(),'24');
  for(const width of [820,390,320]){await page.setViewportSize({width,height:1180});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);}
  assert.equal(await page.getByRole('group',{name:'Reading preferences'}).getByText('Device and local time',{exact:true}).count(),1);
  const measurements=[];
  for(const theme of ['dark','light']){
   await page.getByLabel('Theme',{exact:true}).selectOption(theme);
   const scan=await page.evaluate(()=>{
    function rgb(c){const n=c.match(/[\d.]+/g)?.map(Number);return n?.length>=3?n.slice(0,3):null;}
    function lum(c){return c.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);}
    let minimum=Infinity,count=0;const failures=[],walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    while(walker.nextNode()){const t=walker.currentNode,e=t.parentElement;if(!t.textContent.trim()||!e?.getClientRects().length||['OPTION','SCRIPT','STYLE'].includes(e.tagName)||e.closest(':disabled'))continue;const cs=getComputedStyle(e);let p=e,bg;while(p){bg=getComputedStyle(p).backgroundColor;if(bg!=='transparent'&&bg!=='rgba(0, 0, 0, 0)')break;p=p.parentElement;}const fg=rgb(cs.color),back=rgb(bg||'');if(!fg||!back)continue;const a=lum(fg),b=lum(back),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05),large=parseFloat(cs.fontSize)>=24||(parseFloat(cs.fontSize)>=18.66&&parseInt(cs.fontWeight)>=700);count++;minimum=Math.min(minimum,ratio);if(ratio<(large?3:4.5))failures.push({text:t.textContent.trim().slice(0,70),ratio,font:cs.fontSize});}
    return {minimum,count,failures};
   });assert.deepEqual(scan.failures,[],theme+' text contrast');measurements.push({theme,...scan});
  }
  await page.getByLabel('Theme',{exact:true}).selectOption('dark');
  await provider.options.at(-1).sessionStore.del(owner);
  const switched=await context.newPage();await switched.goto(origin+'/#account');await switched.getByLabel('Find your atmosphere account').fill('stranger.test');await switched.getByRole('button',{name:'Continue with Atmosphere',exact:true}).click();await switched.waitForFunction(()=>document.querySelector('#account code')?.textContent==='did:plc:bbbbbbbbbbbbbbbbbbbbbbbb');
  const refreshed=page.waitForResponse(r=>r.url().endsWith('/api/workspace/capabilities'));await page.bringToFront();await page.evaluate(()=>dispatchEvent(new Event('focus')));await refreshed;await page.getByRole('heading',{name:'Synthetic one-sign-in project',exact:true}).waitFor({state:'hidden'});
  await page.getByRole('button',{name:'My projects',exact:true}).click();const newWorkspace=page.locator('.creator-workspace');await newWorkspace.getByLabel('Project name',{exact:true}).fill('Independent second account');await newWorkspace.getByRole('button',{name:'Create and save project'}).click();await newWorkspace.getByRole('heading',{name:'Independent second account',exact:true}).waitFor();
  const second=await context.newPage();await second.goto(origin+'/#creator');await second.getByRole('heading',{name:'Independent second account',exact:true}).waitFor();
  await page.goto(origin+'/#account');await page.getByRole('button',{name:'Sign out',exact:true}).click();
  await page.getByRole('button',{name:'Continue with Atmosphere',exact:true}).waitFor();
  await second.getByRole('heading',{name:'Independent second account',exact:true}).waitFor({state:'hidden'});
  assert.equal(await fs.readFile(path.join(dir,'workspace.json'),'utf8'),legacyBefore);
  assert.match(await fs.readFile(path.join(dir,'users',createHash('sha256').update(owner).digest('hex')+'.json'),'utf8'),/Synthetic one-sign-in project/);
  assert.deepEqual(errors,[]);console.log('PASS: one helper, conditional restore, menu guidance/Escape/focus/320–1024px reflow; browser and explicitly scoped MCP share saved source failure/retry outcomes; one Atmosphere sign-in, Secure/HttpOnly cookie, private project access, refresh, browser reopen + server restart, preferences, 320–820px reflow, account switching, cross-tab sign-out, dark/light text contrast and legacy-data preservation; provider/SDK cryptography mocked.');
 }finally{await context?.close();await browser.close();if(server)await new Promise(resolve=>server.close(resolve));await fs.rm(dir,{recursive:true,force:true});}
})().catch(error=>{console.error(error);process.exitCode=1;});

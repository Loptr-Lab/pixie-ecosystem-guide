const {chromium}=require(process.env.PIXIE_PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
(async()=>{
 const {createCompanionServer}=await import('../server.mjs');
 const {createFileWorkspaceStore}=await import('../lib/workspace-store.mjs');
 const http=require('node:http'),os=require('node:os');
 const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'pixie-browser-'));
 const app=createCompanionServer({allowLocalOwner:true,modelProvider:null,workspaceStore:createFileWorkspaceStore(path.join(temporary,'workspace.json'))});
 const staticApp=createCompanionServer({modelProvider:null});
 const staticServer=http.createServer((req,res)=>{if(req.url.startsWith('/api/')||req.url==='/health'){res.writeHead(404);res.end();}else staticApp.emit('request',req,res)});
 const listen=server=>new Promise(resolve=>server.listen(0,'127.0.0.1',()=>resolve('http://127.0.0.1:'+server.address().port)));
 const serverUrl=await listen(app),browserUrl=await listen(staticServer);
 try{

 for(const [mode,base] of [['server',serverUrl],['browser',browserUrl]]){
  const profile=path.join(temporary,'profile-'+mode);
  let context=await chromium.launchPersistentContext(profile,{headless:true,executablePath:process.env.PIXIE_CHROMIUM||'/usr/bin/chromium',viewport:{width:1440,height:1000},timezoneId:'America/Chicago',acceptDownloads:true});
  let page=context.pages()[0];const open=async()=>{await page.goto(base+'/#creator');await page.getByRole('heading',{name:'Greetings. Let’s keep the thread.'}).waitFor();await page.waitForFunction(()=>{const e=document.querySelector('.creator-workspace [role=status]');return e&&!/Opening|Working/.test(e.textContent)});};
  try{
   await open();const w=page.locator('.creator-workspace');
   if(!await w.getByLabel('Project name',{exact:true}).isVisible())await w.getByText('Create a project',{exact:true}).click();
   const name='Creator acceptance '+mode+' '+Date.now();
   await w.getByLabel('Project name',{exact:true}).fill(name);await w.getByLabel('What are you working on?').fill('A fictional original recording');await w.getByLabel('What would a useful outcome look like?').fill('A reviewed permission brief');
   await w.getByRole('button',{name:'Create and save project'}).click();await w.getByRole('heading',{name,exact:true}).waitFor();
   await w.getByLabel('Source title',{exact:true}).fill('Creator reference');await w.getByLabel('Public source URL').fill('https://example.org/reference');await w.getByLabel('Relevant excerpt',{exact:false}).fill('Creator-supplied excerpt for the brief.');await w.getByRole('button',{name:'Add saved source'}).click();await w.getByRole('heading',{name:'Creator reference'}).waitFor();
   await w.getByLabel('New task',{exact:true}).fill('Prepare three agreement questions');await w.getByLabel('Next step for this task').fill('List the intended uses');await w.getByRole('button',{name:'Add saved task'}).click();
   const task=w.getByRole('form',{name:'Task: Prepare three agreement questions'});await task.waitFor();await task.getByLabel('Task status').selectOption('blocked');await task.getByLabel('Blocker',{exact:true}).fill('Need intended-use decision');await task.getByLabel('Task next action').fill('Ask the creator to confirm use');await task.getByRole('button',{name:'Save task progress'}).click();await w.getByText('Task progress saved.',{exact:true}).waitFor();
   await page.reload();await w.getByRole('heading',{name,exact:true}).waitFor();await w.getByText('Ask the creator to confirm use',{exact:false}).first().waitFor();assert.equal(await task.getByLabel('Task status').inputValue(),'blocked');
   await context.close();context=await chromium.launchPersistentContext(profile,{headless:true,executablePath:process.env.PIXIE_CHROMIUM||'/usr/bin/chromium',viewport:{width:820,height:1180},timezoneId:'America/Chicago',acceptDownloads:true});page=context.pages()[0];await open();const restored=page.locator('.creator-workspace');await restored.getByRole('heading',{name,exact:true}).waitFor();assert.equal(await restored.locator('.creator-item h3').filter({hasText:'Creator reference'}).count(),1);
   await restored.getByRole('button',{name:'Prepare handoff from saved work'}).click();await restored.getByText('Handoff prepared and saved as an editable draft.',{exact:true}).waitFor();const handoff=restored.getByLabel('Handoff draft',{exact:true});assert.match(await handoff.inputValue(),/Creator reference/);assert.match(await handoff.inputValue(),/Need intended-use decision/);await handoff.fill((await handoff.inputValue())+'\nCreator-edited final note.');await restored.getByRole('button',{name:'Save edited handoff'}).click();await restored.getByText('Edited handoff saved.',{exact:true}).waitFor();
   await restored.getByLabel('Message for the selected project').fill('What should I do next?');await restored.getByRole('checkbox',{name:/I choose to send/}).check();await restored.getByRole('button',{name:'Ask PIXIE',exact:true}).click();await restored.getByRole('alert').filter({hasText:'No model provider'}).waitFor();assert.equal(await restored.locator('.creator-conversation li').count(),0);
   await restored.getByLabel('Message for the selected project').fill('');
   await restored.getByRole('button',{name:'Check this public source'}).click();await restored.locator('.creator-item').filter({hasText:'Creator reference'}).getByRole('alert').waitFor();
   await restored.getByText('Create a project',{exact:true}).click();await restored.getByLabel('Project name',{exact:true}).fill('Second '+name);await restored.getByRole('button',{name:'Create and save project'}).click();await restored.getByRole('heading',{name:'Second '+name,exact:true}).waitFor();assert.equal(await restored.getByRole('heading',{name:'Creator reference',exact:true}).count(),0);assert.equal(await restored.getByRole('heading',{name:'Prepare three agreement questions',exact:true}).count(),0);
   const options=await restored.getByLabel('Select saved project').locator('option').evaluateAll(os=>os.map(o=>({value:o.value,text:o.textContent})));const first=options.find(o=>o.text===name);await restored.getByLabel('Select saved project').selectOption(first.value);await restored.getByRole('heading',{name,exact:true}).waitFor();
   const downloading=page.waitForEvent('download');await restored.getByRole('button',{name:'Export selected project',exact:true}).click();const backup=await downloading;const backupPath=await backup.path();const json=JSON.parse(fs.readFileSync(backupPath,'utf8'));assert.equal(json.projects[0].id,first.value);assert.match(json.projects[0].handoff,/Creator-edited final note/);
   page.once('dialog',d=>d.accept());await restored.getByRole('button',{name:'Erase all saved projects'}).click();await restored.getByText('Saved workspace cleared; exported files are unchanged.',{exact:true}).waitFor();await restored.getByLabel('Choose a workspace backup').setInputFiles(backupPath);await restored.getByRole('button',{name:'Validate and restore backup'}).click();await restored.getByRole('heading',{name,exact:true}).waitFor();assert.match(await restored.getByLabel('Handoff draft',{exact:true}).inputValue(),/Creator-edited final note/);
   await restored.getByLabel('Theme',{exact:true}).selectOption('light');await restored.getByLabel('Text size',{exact:true}).selectOption('24');await page.reload();await restored.getByRole('heading',{name,exact:true}).waitFor();assert.equal(await restored.getByLabel('Theme',{exact:true}).inputValue(),'light');assert.equal(await restored.getByLabel('Text size',{exact:true}).inputValue(),'24');
   fs.mkdirSync('review-evidence',{recursive:true});
   for(const width of [1440,820,390,320]){await page.setViewportSize({width,height:1180});const sizes=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));assert.ok(sizes.scroll<=sizes.width,mode+' overflow '+width);}
   await page.setViewportSize({width:820,height:1180});await page.screenshot({path:'review-evidence/'+mode+'-workspace-ipad.png',fullPage:true});await restored.getByLabel('Theme',{exact:true}).selectOption('dark');await restored.getByLabel('Text size',{exact:true}).selectOption('18');await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'review-evidence/'+mode+'-workspace-desktop.png'});
   await page.reload();await page.keyboard.press('Tab');assert.match(await page.locator(':focus').innerText(),/Skip/i);await page.keyboard.press('Enter');assert.ok(await page.locator('main').evaluate(e=>e.contains(document.activeElement)||document.activeElement===e));
   console.log('PASS',mode,': create/source/task, reload + browser restart, isolation, status/resume, edited handoff, backup/clear/restore stable identity, unavailable model, research failure, preferences, 320–1440 reflow');
  }finally{await context.close();fs.rmSync(profile,{recursive:true,force:true});}
 }
 }finally{await Promise.all([new Promise(r=>app.close(r)),new Promise(r=>staticServer.close(r))]);fs.rmSync(temporary,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exit(1)});

const {chromium}=require(process.env.PIXIE_PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const {createCompanionServer}=await import('../server.mjs');
 const {createMemoryWorkspaceStore}=await import('../lib/workspace-store.mjs');
 const server=createCompanionServer({allowLocalOwner:true,workspaceStore:createMemoryWorkspaceStore(),modelProvider:null});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium'});
 try{
 const page=await browser.newPage({viewport:{width:820,height:1180}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const did='did:plc:b5uem672ci23lqrcz6j6bs2c';
 await page.route('https://bsky.social/**',r=>r.fulfill({json:{did}}));
 await page.route('https://plc.directory/**',r=>r.fulfill({json:{id:did,alsoKnownAs:['at://ibloud.xyz'],service:[{id:'#atproto_pds',type:'AtprotoPersonalDataServer',serviceEndpoint:'https://eurosky.social'}]}}));
 await page.route('https://eurosky.social/**',r=>r.fulfill({json:{records:[{uri:`at://${did}/app.bsky.feed.post/one`,cid:'bafyreiaaaaaaaaaaaaaaaaaaaaa',value:{$type:'app.bsky.feed.post',text:'Fixture original story text <script>not executable</script>',createdAt:'2025-03-01T00:00:00Z'}}]}}));
 await page.goto('http://127.0.0.1:'+server.address().port+'/#creator');
 await page.getByRole('button',{name:'Project work',exact:true}).click();
 await page.locator('.pixie-launcher').focus();await page.keyboard.press('Enter');
 const helper=page.locator('#pixie-helper-panel');
 await helper.getByText('Build a project from story references',{exact:true}).focus();await page.keyboard.press('Enter');
 assert.match(await helper.textContent(),/Attaching a reference does not publish it or establish ownership or accepted canon/);
 await helper.getByRole('button',{name:'Open My projects →',exact:true}).focus();await page.keyboard.press('Enter');
 assert.equal(await page.locator('#pixie-helper-panel').count(),0);
 assert.equal(await page.evaluate(()=>document.activeElement.id),'creator-title');
 assert.equal(new URL(page.url()).hash,'#creator');
 const w=page.locator('.creator-workspace');await w.getByLabel('Project name',{exact:true}).fill('Story review fixture');
 const finder=w.getByRole('group',{name:'Find public story references · optional'});
 await finder.getByLabel('Public account',{exact:true}).fill('ibloud.xyz');
 await finder.getByRole('button',{name:'Search public stories',exact:true}).click();
 await finder.getByRole('status').filter({hasText:/records checked|No search/}).waitFor();await finder.getByRole('checkbox',{name:/Select reference/}).check();
 assert.equal(await w.getByRole('heading',{name:'Saved story provenance'}).count(),0);
 const review=finder.getByRole('checkbox',{name:/I reviewed these original texts/});
 await review.check();await w.getByRole('button',{name:'Create and save project'}).click();
 await w.getByRole('heading',{name:'Story review fixture',exact:true}).waitFor();
 await page.reload();await w.getByRole('heading',{name:'Story review fixture',exact:true}).waitFor();
 const provenance=w.getByText('Saved story provenance · Ledger v2',{exact:true});await provenance.waitFor();await provenance.click();
 assert.match(await w.locator('.creator-item').filter({hasText:'Saved story provenance'}).innerText(),/at:\/\/did/);
 const download=page.waitForEvent('download');await w.getByRole('button',{name:'Download saved story Ledger v2'}).click();const file=await download;const fs=require('node:fs');const ledger=JSON.parse(fs.readFileSync(await file.path(),'utf8'));assert.equal(ledger.posts[0].text,'Fixture original story text <script>not executable</script>');assert.equal(ledger.posts[0].authorDid,did);
 // Existing-project flow, explicit review and deduplication.
 const existing=w.getByRole('group',{name:'Find public story references · optional'}).last();
 await existing.getByLabel('Public account',{exact:true}).fill('ibloud.xyz');await existing.getByRole('button',{name:'Search public stories',exact:true}).click();await existing.getByRole('checkbox',{name:/Select reference/}).check();
 assert.equal(await w.getByRole('button',{name:'Attach reviewed story references'}).isDisabled(),true);
 await existing.getByRole('checkbox',{name:/I reviewed these original texts/}).check();await w.getByRole('button',{name:'Attach reviewed story references'}).click();await w.getByText('Reviewed story references saved to this project.',{exact:true}).waitFor();assert.equal(await w.getByText('Saved story provenance · Ledger v2',{exact:true}).count(),1);
 for(const width of [820,390,320]){await page.setViewportSize({width,height:1180});await w.getByLabel('Text size',{exact:true}).selectOption('24');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'reflow '+width);}
 await page.keyboard.press('Tab');assert.equal(await page.locator(':focus').count(),1);
 assert.deepEqual(errors,[]);console.log('PASS story search → inspect/select → review → create/attach → save/reopen → Ledger v2 download; no script execution; 320–820px at 24px text. Fixtures only.');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1});

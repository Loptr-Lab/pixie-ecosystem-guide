const {chromium}=require(process.env.PIXIE_PLAYWRIGHT_MODULE||'playwright');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const baseUrl=process.env.PIXIE_BASE_URL||'http://127.0.0.1:4173';
const out=process.env.PIXIE_EVIDENCE_DIR||path.resolve('review-evidence');fs.mkdirSync(out,{recursive:true});
(async()=>{
const browser=await chromium.launch({executablePath:process.env.PIXIE_CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:820,height:1000},acceptDownloads:true});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(baseUrl+'/#task');
const task=page.locator('.task-steward');await task.getByLabel('Requested outcome').fill('Review one public contribution route');
await task.getByLabel('Finished when').fill('Record the intended destination and any observed barrier');
await task.getByLabel('Next action',{exact:true}).fill('Read the Training contributor guide');
await task.getByRole('button',{name:'Prepare task contract'}).click();
await task.getByRole('heading',{name:'Task contract · Loptr Lab Training'}).waitFor();
assert.equal(await task.getByRole('button',{name:'Download task checkpoint'}).isDisabled(),true);
await task.getByLabel('Progress',{exact:true}).fill('Read the public instructions');
assert.equal(await task.getByRole('checkbox').isDisabled(),true);
await task.getByRole('button',{name:'Update task draft'}).click();
await task.getByLabel('Check a proposed action').fill('deploy');
await task.getByRole('button',{name:'Check scope · no execution'}).click();
await task.getByRole('status').filter({hasText:'Consequential or unsupported action'}).waitFor();
await task.getByRole('checkbox').check();
const wait=page.waitForEvent('download');await task.getByRole('button',{name:'Download task checkpoint'}).click();
const download=await wait;const file=path.join(out,'reviewed-task.json');await download.saveAs(file);const record=JSON.parse(fs.readFileSync(file));
assert.equal(record.progress,'Read the public instructions');assert.equal(record.project_id,'training');assert.equal(record.revision,2);
page.once('dialog',d=>d.accept());await task.getByRole('button',{name:'Clear working task'}).click();
await task.getByLabel('Resume a task checkpoint from a file').setInputFiles(file);
await task.getByRole('heading',{name:'Task contract · Loptr Lab Training'}).waitFor();
assert.equal(await task.getByRole('button',{name:'Download task checkpoint'}).isDisabled(),true);
await task.getByRole('checkbox').check();const secondWait=page.waitForEvent('download');await task.getByRole('button',{name:'Download task checkpoint'}).click();
const second=await secondWait;await second.saveAs(path.join(out,'restored-task.json'));
assert.deepEqual(JSON.parse(fs.readFileSync(path.join(out,'restored-task.json'))),record);
await task.getByLabel('Existing project',{exact:true}).selectOption('duet');
await task.getByText('This task remains attached to its original project',{exact:false}).waitFor();
assert.equal(await task.getByRole('heading',{name:'Task contract · Loptr Lab Training'}).count(),1);
const contrast=await task.evaluate(root=>{
 function luminance(color){return color.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);}
 let minimum=Infinity,count=0;const failures=[];const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 while(walker.nextNode()){const node=walker.currentNode,el=node.parentElement;if(!node.textContent.trim()||!el.getClientRects().length||['OPTION','SCRIPT'].includes(el.tagName))continue;let parent=el,bg;while(parent){bg=getComputedStyle(parent).backgroundColor;if(bg!=='rgba(0, 0, 0, 0)'&&bg!=='transparent')break;parent=parent.parentElement;}if(!parent)continue;const style=getComputedStyle(el),a=luminance(style.color),b=luminance(bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);count++;minimum=Math.min(minimum,ratio);if(ratio<4.5)failures.push({text:node.textContent.trim().slice(0,60),ratio});}
 return {minimum,count,failures};
});assert.deepEqual(contrast.failures,[]);
const layouts=[];
for(const width of [1440,820,390,320]){
 await page.setViewportSize({width,height:1000});
 const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,body:parseFloat(getComputedStyle(document.querySelector('.project-surface')).fontSize),taskLabel:parseFloat(getComputedStyle(document.querySelector('.task-steward label')).fontSize)}));
 assert.equal(layout.overflow,false);layouts.push({width,...layout});
 await page.screenshot({path:path.join(out,`task-${width}.png`),fullPage:true});
}
const keyboardPage=await browser.newPage();await keyboardPage.goto(baseUrl+'/#task');await keyboardPage.locator('.task-steward').waitFor();await keyboardPage.keyboard.press('Tab');await keyboardPage.keyboard.press('Enter');
const keyboard=await keyboardPage.evaluate(()=>document.activeElement.id);assert.equal(keyboard,'pixie-main');
await page.emulateMedia({reducedMotion:'reduce'});const motion=await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior);
const result={contrast,taskRoundtrip:true,scopeExpansionNotExecuted:true,projectSwitchPreservesTask:true,freshReviewRequired:true,unsavedProgressCannotExport:true,layouts,keyboard,motion,pageErrors:errors,limits:'Chromium viewport checks, not physical iPad/Safari or VoiceOver; no live external provider account or plugin installation tested.'};
assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
await browser.close();
})();

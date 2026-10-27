// Synthetic adapter lifecycle checks. The real OAuth SDK/provider is deliberately mocked.
const {chromium}=require(process.env.PIXIE_PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
const site='https://pixie-project-companion.ibloud-ivxx.chatgpt.site';
const railway='https://pixie-project-companion-production.up.railway.app';
const sdk=`export class BrowserOAuthClient {
 constructor(options){window.identityCalls.push({kind:'metadata',metadata:options.clientMetadata});}
 addEventListener(){} removeEventListener(){}
 async init(){window.identityCalls.push({kind:'init'});const did=localStorage.getItem('synthetic.identity.did');return did?{session:{did}}:undefined;}
 async signIn(handle,options){window.identityCalls.push({kind:'signIn',handle,options});localStorage.setItem('synthetic.identity.did',handle.startsWith('second.')?'did:plc:syntheticsecond':'did:plc:syntheticfirst');}
 async revoke(did){window.identityCalls.push({kind:'revoke',did});localStorage.removeItem('synthetic.identity.did');}
}`;
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PIXIE_CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  for(const origin of [railway,site,'https://untrusted-preview.example']){
   const context=await browser.newContext({viewport:{width:820,height:1180},hasTouch:true});
   await context.addInitScript(()=>{window.identityCalls=[];});
   await context.route('**/*',async route=>{
    const url=new URL(route.request().url());
    if(url.origin==='https://esm.sh')return route.fulfill({contentType:'text/javascript',body:sdk,headers:{'access-control-allow-origin':'*'}});
    if(url.origin!==origin)return route.fulfill({contentType:'application/json',body:'{}',headers:{'access-control-allow-origin':'*'}});
    if(url.pathname.startsWith('/api/')||url.pathname==='/health')return route.fulfill({status:404,body:'unavailable in static fixture'});
    const file=path.resolve(__dirname,'../tangled-site','.'+(url.pathname==='/'?'/index.html':url.pathname));
    if(!file.startsWith(path.resolve(__dirname,'../tangled-site')+path.sep))return route.abort();
    try{const body=await fs.readFile(file);return route.fulfill({body,contentType:({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'})[path.extname(file)]});}catch{return route.fulfill({status:404,body:'not found'});}
   });
   const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(origin+'/#account');
   const account=page.locator('#account');const handle=account.getByLabel('Find your atmosphere account');
   await handle.waitFor();const submit=account.getByRole('button',{name:'Continue to sign in'});
   if(origin.includes('untrusted')){
    assert.equal(await submit.isDisabled(),true);
    assert.equal(await account.getByRole('link',{name:'Open published account sign-in'}).getAttribute('href'),site+'/#account');
    await page.goto(origin+'/?state=synthetic&code=synthetic#account');await page.locator('#companion-identity form').waitFor();
    assert.equal(await page.evaluate(()=>window.identityCalls.length),0);
   }else{
    await handle.fill('first.synthetic.test');await submit.click();await page.waitForFunction(()=>window.identityCalls.some(c=>c.kind==='signIn'));
    const configured=await page.evaluate(()=>window.identityCalls.find(c=>c.kind==='metadata').metadata);
    const file=origin===site?'oauth-client-metadata.json':'oauth-client-metadata-railway.json';
    assert.deepEqual(configured,JSON.parse(await fs.readFile(path.resolve(__dirname,'../public',file),'utf8')));
    await page.goto(origin+'/?state=synthetic&code=synthetic#account');await account.getByText('Your atmosphere identity is connected.',{exact:true}).waitFor();
    assert.equal(await account.locator('code').textContent(),'did:plc:syntheticfirst');
    await page.reload();await account.getByRole('button',{name:'Sign out',exact:true}).waitFor();
    assert.equal(await account.locator('code').textContent(),'did:plc:syntheticfirst');
    await account.getByRole('button',{name:'Sign out',exact:true}).click();await handle.waitFor();
    assert.equal(await page.evaluate(()=>localStorage.getItem('pixie.identity:'+document.querySelector('#companion-identity').dataset.clientId)),null);
    await handle.fill('second.synthetic.test');await submit.click();await page.waitForFunction(()=>window.identityCalls.some(c=>c.kind==='signIn'&&c.handle==='second.synthetic.test'));
    await page.goto(origin+'/?state=synthetic-second&code=synthetic-second#account');await account.getByRole('button',{name:'Sign out',exact:true}).waitFor();
    assert.equal(await account.locator('code').textContent(),'did:plc:syntheticsecond');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   }
   assert.deepEqual(errors,[]);console.log('PASS synthetic identity adapter:',origin);await context.close();
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});

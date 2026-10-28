// Independent runner for the recovered Companion, not a replacement Site identity.
import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {timingSafeEqual} from 'node:crypto';
import {createWorkspaceService} from './lib/workspace.mjs';
import {createFileWorkspaceStore,createDidWorkspaceResolver} from './lib/workspace-store.mjs';
import {createModelProvider} from './lib/model-provider.mjs';
import {serverFetch} from './lib/server-fetch.mjs';
import {runTool,handleRpc} from './lib/companion.mjs';
import {createOwnerIdentity,ownerIdentityConfiguration} from './lib/owner-identity.mjs';

const defaultRoot=fileURLToPath(new URL('./tangled-site/',import.meta.url));
const maximumBody=2_100_000;
function authorized(header,token){
 if(!token||token.length<32||typeof header!=='string')return false;
 const expected=Buffer.from('Bearer '+token),actual=Buffer.from(header);
 return expected.length===actual.length&&timingSafeEqual(expected,actual);
}
async function body(request){
 let length=0;const chunks=[];
 for await(const chunk of request){length+=chunk.length;if(length>maximumBody)throw Object.assign(Error('Request too large'),{status:413});chunks.push(chunk);}
 return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
export function createCompanionServer({root=defaultRoot,token=process.env.PIXIE_MCP_TOKEN||'',fetcher=serverFetch,workspaceStore,workspaceFile=process.env.PIXIE_DATA_FILE||fileURLToPath(new URL('./.pixie-data/workspace.json',import.meta.url)),modelProvider,allowLocalOwner=false,readyCheck,identityConfig=ownerIdentityConfiguration(process.env),identity=identityConfig?createOwnerIdentity(identityConfig):null}={}){
 const store=workspaceStore||createFileWorkspaceStore(workspaceFile);
 const model=modelProvider===undefined?createModelProvider({url:process.env.PIXIE_MODEL_URL,key:process.env.PIXIE_MODEL_API_KEY,model:process.env.PIXIE_MODEL_NAME,fetcher}):modelProvider;
 const services={workspace:createWorkspaceService(store,{model,fetcher})};
 const userStores=createDidWorkspaceResolver(workspaceFile);
 const userServices=new Map();
 function forDid(did){if(!userServices.has(did))userServices.set(did,{workspace:createWorkspaceService(userStores(did),{model,fetcher})});return userServices.get(did);}
 const server=http.createServer(async(request,response)=>{
  const json=(status,value)=>{response.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});response.end(JSON.stringify(value));};
  try{
   const url=new URL(request.url,'http://localhost');
   if(url.pathname.startsWith('/api/auth/')||(url.pathname==='/'&&url.searchParams.has('state')&&(url.searchParams.has('code')||url.searchParams.has('error')))){
    if(!identity){if(url.pathname==='/api/auth/session'&&request.method==='GET'){json(200,{service:'pixie-server-identity',configured:false,session:null});return;}json(503,{error:'Owner identity is not configured.'});return;}
    try{
     response.setHeader('Referrer-Policy','no-referrer');
     if(url.pathname==='/api/auth/session'&&request.method==='GET'){json(200,await identity.status(request,response));return;}
     if(url.pathname==='/'&&request.method==='GET'){await identity.callback(request,response,url.searchParams);response.writeHead(303,{Location:'/#account','Cache-Control':'no-store'});response.end();return;}
     if(request.method==='POST'&&String(request.headers['content-type']||'').startsWith('application/json')){
      if(url.pathname==='/api/auth/login'){json(200,await identity.login(request));return;}
      if(url.pathname==='/api/auth/logout'){json(200,await identity.logout(request,response));return;}
     }
     json(405,{error:'Unsupported identity request.'});return;
    }catch(error){json([400,401,403,429].includes(error.status)?error.status:503,{error:[400,401,403,429].includes(error.status)?error.message:'Identity verification is unavailable. No private access was granted.'});return;}
   }
   if(url.pathname==='/ready'){if(!readyCheck){json(503,{ready:false});return;}try{await readyCheck();json(200,{ready:true});}catch{json(503,{ready:false});}return;}
   if(url.pathname==='/health'){json(200,{service:'pixie-companion',mode:'independent',mcp:token.length>=32?'bearer-auth configured':'disabled until configured'});return;}
   if(url.pathname.startsWith('/api/workspace')){
    const host=request.headers.host||'';const hostName=host.replace(/:\d+$/,'');
    const localOwner=allowLocalOwner&&['127.0.0.1','::1'].includes(server.address()?.address)&&['127.0.0.1','::1','::ffff:127.0.0.1'].includes(request.socket.remoteAddress)&&['127.0.0.1','localhost'].includes(hostName);
    const origin=request.headers.origin;
    if((origin&&new URL(origin).host!==host)||request.headers['sec-fetch-site']==='cross-site'){json(403,{error:'Invalid workspace origin'});return;}
    let principal=null;try{principal=localOwner?null:await identity?.current(request);}catch{json(503,{error:'Owner identity verification is unavailable.'});return;}
    if(url.pathname==='/api/workspace/capabilities'&&request.method==='GET'){json(200,{localOwner,authenticated:!!principal,did:principal?.did||null,identityConfigured:!!identity,csrf:principal?.csrf||null,modelConfigured:!!model,modelEndpoint:model?new URL(process.env.PIXIE_MODEL_URL||'https://configured-provider.invalid').origin:null});return;}
    if(url.pathname!=='/api/workspace'){json(404,{error:'Not found'});return;}
    if(request.method!=='POST'){response.writeHead(405,{Allow:'POST'});response.end();return;}
    if(!localOwner&&!principal){json(401,{error:'Sign in with your Atmosphere identity to open your private workspace.'});return;}
    if(!localOwner)identity.csrf(request,principal);
    if(!String(request.headers['content-type']||'').startsWith('application/json')){json(415,{error:'Use application/json'});return;}
    const payload=await body(request);if(typeof payload.name!=='string'||!payload.name.startsWith('workspace_')){json(400,{error:'Use a workspace operation.'});return;}
    json(200,await runTool(payload.name,payload.args,fetcher,localOwner?services:forDid(principal.did)));return;
   }
   if(url.pathname==='/api/companion'||url.pathname==='/mcp'){
    if(request.method!=='POST'){response.writeHead(405,{Allow:'POST'});response.end();return;}
    if(url.pathname==='/api/companion'){
     const origin=request.headers.origin;
     if(origin){const parsed=new URL(origin);if(!['http:','https:'].includes(parsed.protocol)||parsed.host!==request.headers.host){json(403,{error:'Invalid origin'});return;}}
     const payload=await body(request);json(200,await runTool(payload.name,payload.args,fetcher));return;
    }
    // Never trust Sites identity headers on an independent public server.
    if(token.length<32){json(503,{error:'Independent MCP authentication is not configured.'});return;}
    if(!authorized(request.headers.authorization,token)){json(401,{error:'Bearer authentication required.'});return;}
    // Machine credentials never imply a browser user's project identity.
    // Do not give a global workspace to an unscoped bearer token.
    const result=await handleRpc(await body(request),true,fetcher,{workspace:{run:async()=>{throw Error('Machine workspace access requires an explicit principal grant.');}}});
    if(result.body===null){response.writeHead(result.status);response.end();}else json(result.status,result.body);
    return;
   }
   if(!['GET','HEAD'].includes(request.method)){response.writeHead(405,{Allow:'GET, HEAD'});response.end();return;}
   const decoded=decodeURIComponent(url.pathname);
   if(decoded.split('/').some(part=>part==='..'||part.startsWith('.'))){json(404,{error:'Not found'});return;}
   const file=path.resolve(root,'.'+(decoded==='/'?'/index.html':decoded));
   if(!file.startsWith(path.resolve(root)+path.sep)){json(404,{error:'Not found'});return;}
   const info=await stat(file);if(!info.isFile())throw Error('Not a file');
   const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png'};
   const type=types[path.extname(file)];if(!type){json(404,{error:'Not found'});return;}
   response.writeHead(200,{'Content-Type':type,'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Cache-Control':'no-store'});
   response.end(request.method==='HEAD'?undefined:await readFile(file));
  }catch(error){json(error.status||((error.code==='ENOENT'||error.message==='Not a file')?404:400),{error:error.message||'Request failed'});}
 });
 return server;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const port=Number(process.env.PORT||4173),host=process.env.HOST||'127.0.0.1';
 createCompanionServer({allowLocalOwner:host==='127.0.0.1'&&process.env.NODE_ENV!=='production'&&process.env.PIXIE_LOCAL_OWNER!=='0'}).listen(port,host,()=>console.log(`PIXIE independent runner listening on ${host}:${port}. No deployment performed.`));
}

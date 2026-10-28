// Launch the existing server with a verified persistent-data boundary. No provisioning.
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {mkdir,stat,realpath,open,unlink} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {createCompanionServer} from '../server.mjs';
import {createFileWorkspaceStore} from '../lib/workspace-store.mjs';
import {createOwnerIdentity,ownerIdentityConfiguration} from '../lib/owner-identity.mjs';
const inside=(parent,child)=>{const relative=path.relative(parent,child);return relative!==''&&!relative.startsWith('..'+path.sep)&&relative!=='..'&&!path.isAbsolute(relative);};
export function productionConfiguration(env){
 if(env.NODE_ENV!=='production')throw Error('NODE_ENV must be production.');
 if(!env.PIXIE_MCP_TOKEN||env.PIXIE_MCP_TOKEN.length<32)throw Error('Configure a private PIXIE_MCP_TOKEN of at least 32 characters.');
 if(env.PIXIE_LOCAL_OWNER!=='0')throw Error('PIXIE_LOCAL_OWNER must be 0.');
 const mount=env.RAILWAY_VOLUME_MOUNT_PATH,file=env.PIXIE_DATA_FILE;
 if(!mount||!file||!path.isAbsolute(mount)||!path.isAbsolute(file)||!inside(mount,file))throw Error('PIXIE_DATA_FILE must be inside the explicitly mounted persistent volume.');
 if(inside(fileURLToPath(new URL('../tangled-site/',import.meta.url)),file))throw Error('Private storage cannot be inside public assets.');
 const port=Number(env.PORT||4173);if(!Number.isInteger(port)||port<0||port>65535)throw Error('Invalid PORT.');
 return {mount,file,port,host:'0.0.0.0',token:env.PIXIE_MCP_TOKEN};
}
export async function startProduction(env=process.env,{oauthFactory}={}){
 const config=productionConfiguration(env);
 if(!(await stat(config.mount)).isDirectory())throw Error('The configured volume is unavailable.');
 await mkdir(path.dirname(config.file),{recursive:true,mode:0o700});
 const actualMount=await realpath(config.mount),actualParent=await realpath(path.dirname(config.file));
 if(actualParent!==actualMount&&!inside(actualMount,actualParent))throw Error('Storage resolves outside its volume.');
 const store=createFileWorkspaceStore(config.file);
 const identityConfig=ownerIdentityConfiguration(env);
 const identity=identityConfig?createOwnerIdentity({...identityConfig,oauthFactory}):null;
 const readyCheck=async()=>{
  await store.transaction(async state=>({result:true,write:false,state}));
  await identity?.ready();
  const probe=path.join(actualParent,'.ready-'+randomUUID());let handle;
  try{handle=await open(probe,'wx',0o600);await handle.sync();}
  finally{if(handle){await handle.close();await unlink(probe);}}
 };
 await readyCheck();
 const server=createCompanionServer({token:config.token,workspaceStore:store,workspaceFile:config.file,allowLocalOwner:false,readyCheck,identity,identityConfig:null});
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(config.port,config.host,resolve);});
 return server;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 startProduction().then(server=>{
  console.log('PIXIE production server ready. Private persistent storage checked; local-owner bypass disabled.');
  for(const signal of ['SIGTERM','SIGINT'])process.once(signal,()=>server.close(()=>process.exit(0)));
 }).catch(()=>{console.error('PIXIE production startup refused. Check private authentication, mounted storage, valid saved data and port configuration.');process.exitCode=1;});
}

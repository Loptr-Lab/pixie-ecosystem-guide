import {createCipheriv,createDecipheriv,randomBytes} from 'node:crypto';
import {readFile,open,rename,unlink} from 'node:fs/promises';
import path from 'node:path';
import {withPrivateFileLock} from './workspace-store.mjs';
const groups=['transactions','codes','grants','access','refresh'];
const aad=Buffer.from('pixie-mcp-oauth/v1');
export function createMcpOAuthStore({file,key}){
 if(!path.isAbsolute(file||'')||!/^[a-f0-9]{64}$/.test(key||''))throw Error('Invalid MCP OAuth storage configuration.');
 const secret=Buffer.from(key,'hex');let queue=Promise.resolve();
 const empty=()=>({version:1,...Object.fromEntries(groups.map(g=>[g,{}]))});
 async function read(){
  const raw=await readFile(file);if(raw.length>8_000_000)throw Error('OAuth storage capacity exceeded.');
  const envelope=JSON.parse(raw);if(envelope.version!==1)throw Error('Invalid OAuth storage.');
  const decipher=createDecipheriv('aes-256-gcm',secret,Buffer.from(envelope.iv,'base64'));decipher.setAAD(aad);decipher.setAuthTag(Buffer.from(envelope.tag,'base64'));
  const state=JSON.parse(Buffer.concat([decipher.update(Buffer.from(envelope.data,'base64')),decipher.final()]));
  if(state.version!==1||groups.some(g=>!state[g]||typeof state[g]!=='object'||Array.isArray(state[g])||Object.keys(state[g]).length>2048))throw Error('Invalid OAuth storage.');
  for(const group of groups)for(const [id,row]of Object.entries(state[group])){if(!/^[A-Za-z0-9_-]{43}$|^[a-f0-9]{64}$/.test(id)||!row||typeof row!=='object'||Array.isArray(row)||!Number.isSafeInteger(row.expires))throw Error('Invalid OAuth storage record.');}
  return state;
 }
 async function write(state){
  const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',secret,iv);cipher.setAAD(aad);
  const data=Buffer.concat([cipher.update(JSON.stringify(state)),cipher.final()]);
  const raw=JSON.stringify({version:1,iv:iv.toString('base64'),tag:cipher.getAuthTag().toString('base64'),data:data.toString('base64')});if(raw.length>8_000_000)throw Error('OAuth storage capacity exceeded.');
  const temporary=file+'.'+randomBytes(12).toString('hex');let handle;
  try{handle=await open(temporary,'wx',0o600);await handle.writeFile(raw);await handle.sync();await handle.close();handle=null;await rename(temporary,file);const directory=await open(path.dirname(file),'r');try{await directory.sync();}finally{await directory.close();}}
  finally{await handle?.close();await unlink(temporary).catch(()=>{});}
 }
 function locked(operation){const pending=queue.then(()=>withPrivateFileLock(file,operation));queue=pending.catch(()=>{});return pending;}
 return {
  // Explicit offline initialization only. Startup NEVER creates/replaces lost state.
  initialize:()=>locked(async()=>{try{await readFile(file);throw Error('OAuth storage already exists.');}catch(error){if(error.code!=='ENOENT')throw error;}await write(empty());}),
  ready:()=>locked(read),
  transaction:fn=>locked(async()=>{const state=await read();const result=await fn(state);await write(state);return result;})
 };
}

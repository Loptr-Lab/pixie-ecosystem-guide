// Private Weaver records on the existing persistent volume; never workspace exports.
import {createCipheriv,createDecipheriv,createHmac,randomBytes} from 'node:crypto';
import {readFile,open,rename,unlink} from 'node:fs/promises';
import path from 'node:path';
import {withPrivateFileLock} from './workspace-store.mjs';
export function weaverStore(file,secret){
 if(!path.isAbsolute(file)||!/^[a-f0-9]{64}$/.test(secret||''))throw Error('Private Weaver storage is not configured.');
 const key=createHmac('sha256',Buffer.from(secret,'hex')).update('pixie-weaver/private-records/v1').digest(),aad=Buffer.from('pixie-weaver/v1');let queue=Promise.resolve();
 async function read(){let raw;try{raw=await readFile(file,'utf8');}catch(e){if(e.code==='ENOENT')return{schema:1,invitations:{},acceptances:{}};throw e;}
  const e=JSON.parse(raw);if(e.version!==1)throw Error('Unsupported private record format.');const d=createDecipheriv('aes-256-gcm',key,Buffer.from(e.iv,'base64'));d.setAAD(aad);d.setAuthTag(Buffer.from(e.tag,'base64'));const state=JSON.parse(Buffer.concat([d.update(Buffer.from(e.data,'base64')),d.final()]).toString());
  if(state?.schema!==1||!state.invitations||typeof state.invitations!=='object'||Array.isArray(state.invitations)||!state.acceptances||typeof state.acceptances!=='object'||Array.isArray(state.acceptances))throw Error('Invalid private records.');return state;
 }
 async function save(state){const iv=randomBytes(12),c=createCipheriv('aes-256-gcm',key,iv);c.setAAD(aad);const data=Buffer.concat([c.update(JSON.stringify(state)),c.final()]);const temp=file+'.'+randomBytes(12).toString('hex');let h;
  try{h=await open(temp,'wx',0o600);await h.writeFile(JSON.stringify({version:1,iv:iv.toString('base64'),tag:c.getAuthTag().toString('base64'),data:data.toString('base64')}));await h.sync();await h.close();h=null;await rename(temp,file);const directory=await open(path.dirname(file),'r');try{await directory.sync();}finally{await directory.close();}}
  finally{await h?.close();await unlink(temp).catch(()=>{});}
 }
 return{ready:()=>withPrivateFileLock(file,read),transaction(operation){const pending=queue.then(()=>withPrivateFileLock(file,async()=>{const state=await read();const result=await operation(state);if(result.write)await save(state);return result.value;}));queue=pending.catch(()=>{});return pending;}};
}

import {createCipheriv,createDecipheriv,randomBytes} from 'node:crypto';
import {mkdir,readFile,open,rename,unlink} from 'node:fs/promises';
import path from 'node:path';

// Existing single-writer filesystem storage; OAuth secrets are encrypted separately
// from creator content and must never appear in workspace exports or public assets.
export function identityStore(file,secret,now=Date.now){
 const key=Buffer.from(secret,'hex');
 if(key.length!==32||!/^[a-f0-9]{64}$/.test(secret))throw Error('Configure an independent 32-byte identity encryption key.');
 let queue=Promise.resolve();
 const empty=()=>({schema:1,states:{},oauth:{},browsers:{},logins:{}});
 async function read(){
  let raw;try{raw=await readFile(file,'utf8');}catch(e){if(e.code==='ENOENT')return empty();throw e;}
  const envelope=JSON.parse(raw);if(envelope.version!==1)throw Error('Unsupported identity state.');
  const decipher=createDecipheriv('aes-256-gcm',key,Buffer.from(envelope.iv,'base64'));decipher.setAAD(Buffer.from('pixie-owner-identity/v1'));decipher.setAuthTag(Buffer.from(envelope.tag,'base64'));
  const value=JSON.parse(Buffer.concat([decipher.update(Buffer.from(envelope.data,'base64')),decipher.final()]).toString());
  if(value.schema!==1||['states','oauth','browsers','logins'].some(k=>!value[k]||Array.isArray(value[k])||typeof value[k]!=='object'))throw Error('Invalid identity state.');
  return value;
 }
 async function write(value){
  await mkdir(path.dirname(file),{recursive:true,mode:0o700});
  const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv);cipher.setAAD(Buffer.from('pixie-owner-identity/v1'));
  const data=Buffer.concat([cipher.update(JSON.stringify(value)),cipher.final()]);
  const temp=file+'.'+randomBytes(12).toString('hex');let handle;
  try{handle=await open(temp,'wx',0o600);await handle.writeFile(JSON.stringify({version:1,iv:iv.toString('base64'),tag:cipher.getAuthTag().toString('base64'),data:data.toString('base64')}));await handle.sync();await handle.close();handle=null;await rename(temp,file);}
  finally{await handle?.close();await unlink(temp).catch(()=>{});}
 }
 function transaction(fn){const pending=queue.then(async()=>{const state=await read();for(const group of ['states','oauth','browsers','logins'])for(const [id,row]of Object.entries(state[group]))if(row.expires<=now())delete state[group][id];const result=await fn(state);await write(state);return result;});queue=pending.catch(()=>{});return pending;}
 function sdkStore(group,ttl){return {get:id=>transaction(s=>Object.hasOwn(s[group],id)?s[group][id].value:undefined),set:(id,value)=>transaction(s=>{if(typeof id!=='string'||id==='__proto__'||id.length>512)throw Error('Invalid identity key.');if(Object.keys(s[group]).length>=128&&!Object.hasOwn(s[group],id))throw Error('Identity capacity reached.');s[group][id]={value,expires:now()+ttl};}),del:id=>transaction(s=>{delete s[group][id];})};}
 return {transaction,ready:read,stateStore:sdkStore('states',10*60_000),sessionStore:sdkStore('oauth',8*60*60_000)};
}

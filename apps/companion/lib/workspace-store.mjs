// Server-only durable adapter. Atomic writes, serialized operations, no public files.
import {readFile,mkdir,writeFile,rename,chmod,unlink,open,lstat,realpath} from 'node:fs/promises';
import {setTimeout as pause} from 'node:timers/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {emptyWorkspace,validateWorkspace} from './workspace.mjs';
// Both private stores use one OS-visible exclusive lock per file, not just a
// process-local promise queue. Never break a lock automatically after a crash.
export async function withPrivateFileLock(filename,operation){
 const directory=path.dirname(filename);
 let info;try{info=await lstat(directory);}catch(error){if(error.code!=='ENOENT')throw error;}
 if(info?.isSymbolicLink())throw Error('Private storage cannot use a symbolic-link directory.');
 await mkdir(directory,{recursive:true,mode:0o700});
 try{if((await lstat(filename)).isSymbolicLink())throw Error('Private storage cannot use a symbolic-link file.');}catch(error){if(error.code!=='ENOENT')throw error;}
 const lock=path.join(await realpath(directory),path.basename(filename)+'.lock');
 const deadline=Date.now()+2000;let handle;
 while(!handle){try{handle=await open(lock,'wx',0o600);}catch(error){if(error.code!=='EEXIST')throw error;if(Date.now()>=deadline)throw Object.assign(Error('Private storage is busy. No save was confirmed; preserve any existing lock for operator review.'),{status:503,code:'PRIVATE_STORAGE_BUSY'});await pause(10);}}
 try{return await operation();}finally{await handle.close();await unlink(lock);}
}
export function createFileWorkspaceStore(filename){
 let queue=Promise.resolve();
 return {transaction(operation){
  const pending=queue.then(()=>withPrivateFileLock(filename,async()=>{
   let state;try{state=validateWorkspace(JSON.parse(await readFile(filename,'utf8')));}catch(error){if(error.code==='ENOENT')state=emptyWorkspace();else throw Error('Saved workspace could not be read or validated. Original data was preserved; restore a reviewed backup or repair the file.');}
   const {state:next,write,result}=await operation(structuredClone(state));
   if(write){validateWorkspace(next);await mkdir(path.dirname(filename),{recursive:true,mode:0o700});await chmod(path.dirname(filename),0o700);const temp=filename+'.'+crypto.randomUUID()+'.tmp';try{await writeFile(temp,JSON.stringify(next,null,2)+'\n',{mode:0o600,flag:'wx'});await rename(temp,filename);}catch(error){await unlink(temp).catch(()=>{});throw error;}}
   return result;
  }));queue=pending.catch(()=>{});return pending;
 }};
}
export function createMemoryWorkspaceStore(initial=emptyWorkspace()){
 let state=validateWorkspace(initial),queue=Promise.resolve();
 return {transaction(operation){const pending=queue.then(async()=>{const result=await operation(structuredClone(state));if(result.write)state=validateWorkspace(result.state);return result.result;});queue=pending.catch(()=>{});return pending;}};
}

// Server-controlled workspace namespaces. A caller never supplies a filename or
// namespace, and the unowned legacy workspace.json is never claimed on login.
export function createDidWorkspaceResolver(dataFile,{makeStore=createFileWorkspaceStore}={}){
 if(typeof dataFile!=='string'||!path.isAbsolute(dataFile))throw Error('A private absolute workspace path is required.');
 const root=path.join(path.dirname(dataFile),'users');
 const cache=new Map();
 return function forPrincipal(did){
  if(typeof did!=='string'||!/^did:(plc:[a-z2-7]{24}|web:[A-Za-z0-9._%:-]+)$/.test(did))throw Error('A verified AT Protocol DID is required.');
  const hash=createHash('sha256').update(did).digest('hex');
  if(!cache.has(hash))cache.set(hash,makeStore(path.join(root,hash+'.json')));
  return cache.get(hash);
 };
}

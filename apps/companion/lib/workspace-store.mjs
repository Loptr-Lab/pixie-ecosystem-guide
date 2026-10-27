// Server-only durable adapter. Atomic writes, serialized operations, no public files.
import {readFile,mkdir,writeFile,rename,chmod,unlink} from 'node:fs/promises';
import path from 'node:path';
import {emptyWorkspace,validateWorkspace} from './workspace.mjs';
export function createFileWorkspaceStore(filename){
 let queue=Promise.resolve();
 return {transaction(operation){
  const pending=queue.then(async()=>{
   let state;try{state=validateWorkspace(JSON.parse(await readFile(filename,'utf8')));}catch(error){if(error.code==='ENOENT')state=emptyWorkspace();else throw Error('Saved workspace could not be read or validated. Original data was preserved; restore a reviewed backup or repair the file.');}
   const {state:next,write,result}=await operation(structuredClone(state));
   if(write){validateWorkspace(next);await mkdir(path.dirname(filename),{recursive:true,mode:0o700});await chmod(path.dirname(filename),0o700);const temp=filename+'.'+crypto.randomUUID()+'.tmp';try{await writeFile(temp,JSON.stringify(next,null,2)+'\n',{mode:0o600,flag:'wx'});await rename(temp,filename);}catch(error){await unlink(temp).catch(()=>{});throw error;}}
   return result;
  });queue=pending.catch(()=>{});return pending;
 }};
}
export function createMemoryWorkspaceStore(initial=emptyWorkspace()){
 let state=validateWorkspace(initial),queue=Promise.resolve();
 return {transaction(operation){const pending=queue.then(async()=>{const result=await operation(structuredClone(state));if(result.write)state=validateWorkspace(result.state);return result.result;});queue=pending.catch(()=>{});return pending;}};
}

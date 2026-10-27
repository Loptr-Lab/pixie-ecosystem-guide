// Explicit browser handoff, not OAuth, CORS authorization or a machine credential.
export const creatorUrl='https://ibloud.github.io/pixie-creator-os/';
export const receiptPrefix='PIXIE Creator draft\n';
export function readCreatorReceipt(value){
 if(!value||value.schema!=='pixie-creator-return/v1'||typeof value.id!=='string'||!/^[a-zA-Z0-9-]{1,80}$/.test(value.id)||typeof value.draft!=='string'||value.draft.length>9000)throw Error('Invalid or oversized Creator draft. Export it locally instead.');
 const draft=JSON.parse(value.draft);
 if(draft.schema!=='pixie-artist-draft/v1')throw Error('Unsupported Creator draft.');
 return {schema:value.schema,id:value.id,draft:value.draft};
}
export function savedCreatorDraft(project){
 for(const note of [...project.notes].reverse())if(note.text.startsWith(receiptPrefix))try{return readCreatorReceipt(JSON.parse(note.text.slice(receiptPrefix.length))).draft;}catch{}
 return null;
}
export async function saveCreatorReceipt(grant,value,connect){
 const receipt=readCreatorReceipt(value),connection=await connect();
 if(!connection.authenticated||connection.did!==grant.did)throw Error('The Atmosphere account changed or expired. Nothing was saved.');
 const {project}=await connection.run('workspace_get',{project_id:grant.project.id});
 const text=receiptPrefix+JSON.stringify(receipt);
 if(project.notes.some(n=>n.text===text))return project;
 return (await connection.run('workspace_add_note',{project_id:grant.project.id,text})).project;
}
export function launchCreatorHandoff({host=window,project,did,connect,onReturn,onError,onDisconnect=()=>{}}){
 if(!did)throw Error('Sign in with Atmosphere before sharing a private project.');
 const popup=host.open(creatorUrl+'#pixie','_blank');
 if(!popup)throw Error('Allow this requested Creator OS tab, or use the existing draft export.');
 const origin=new URL(creatorUrl).origin,grant={project,did};let active=true,connected=false;
 const close=()=>{if(!active)return;active=false;try{popup.postMessage({type:'pixie-creator-disconnect'},origin);}catch{}host.removeEventListener('message',receive);host.removeEventListener('pagehide',close);onDisconnect?.();};
 async function receive(event){
  if(!active||event.origin!==origin||event.source!==popup)return;
  try{
   if(event.data?.type==='pixie-creator-ready'){
    const c=await connect();if(!active)return;
    if(!c.authenticated||c.did!==did){close();throw Error('Sign-in changed. Reopen Creator OS from the correct private project.');}
    if(!connected){connected=true;popup.postMessage({type:'pixie-creator-project',project:{id:project.id,name:project.name,purpose:project.purpose},did,draft:savedCreatorDraft(project)},origin);}
   }else if(event.data?.type==='pixie-creator-return'&&connected){onReturn(readCreatorReceipt(event.data.receipt),grant);}
   else if(event.data?.type==='pixie-creator-close')close();
  }catch(error){onError(error.message);}
 }
 host.addEventListener('message',receive);host.addEventListener('pagehide',close);
 return {close,saved:id=>{if(active)popup.postMessage({type:'pixie-creator-saved',id},origin);}};
}

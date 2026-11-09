import {standardContext,prepareStandardContext} from './standard-context.mjs';
// Explicit browser handoff, not OAuth, CORS authorization or a machine credential.
export const creatorUrl='https://ibloud.github.io/pixie-creator-os/';
export const receiptPrefix='PIXIE Creator draft\n';
export function readCreatorReceipt(value){
 if(!value||!['pixie-creator-return/v1','pixie-creator-return/v2'].includes(value.schema)||typeof value.id!=='string'||!/^[a-zA-Z0-9-]{1,80}$/.test(value.id)||typeof value.draft!=='string'||value.draft.length>9000)throw Error('Invalid or oversized Creator draft. Export it locally instead.');
 const draft=JSON.parse(value.draft);
 if(draft.schema!=='pixie-artist-draft/v1')throw Error('Unsupported Creator draft.');
 if(value.schema==='pixie-creator-return/v2'){const context=standardContext.read(value.standardContext);if(JSON.stringify(value).length>9500)throw Error('Combined Creator receipt exceeds private note limit.');return {schema:value.schema,id:value.id,draft:value.draft,standardContext:context};}
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
 if(receipt.schema==='pixie-creator-return/v2'){if(!grant.standardContext||project.id!==receipt.standardContext.projectId||JSON.stringify(receipt.standardContext)!==JSON.stringify(grant.standardContext)||project.importDefinition?.creatorDestination!==true)throw Error('Returned Standard context was not authorized for this project.');const source=project.sources.find(s=>s.standardImport?.reference.uri===receipt.standardContext.source.uri&&s.standardImport?.reference.cid===receipt.standardContext.source.cid);if(!source||JSON.stringify(prepareStandardContext(project,source.id))!==JSON.stringify(receipt.standardContext))throw Error('Saved context changed. Review it again before returning.');}
 const text=receiptPrefix+JSON.stringify(receipt);
 if(project.notes.some(n=>n.text===text))return project;
 return (await connection.run('workspace_add_note',{project_id:grant.project.id,text})).project;
}
export function launchCreatorHandoff({host=window,project,did,connect,onReturn,onError,onDisconnect=()=>{},standardContext:context=null}){
 if(!did)throw Error('Sign in with Atmosphere before sharing a private project.');
 if(context){standardContext.read(context);if(context.projectId!==project.id)throw Error('Standard context destination mismatch.');if(project.importDefinition?.creatorDestination!==true)throw Error('Project definition disallows Creator context.');}
 const popup=host.open(creatorUrl+'#pixie','_blank');
 if(!popup)throw Error('Allow this requested Creator OS tab, or use the existing draft export.');
 const origin=new URL(creatorUrl).origin,grant={project,did,standardContext:context};let active=true,connected=false;
 const close=()=>{if(!active)return;active=false;try{popup.postMessage({type:'pixie-creator-disconnect'},origin);}catch{}host.removeEventListener('message',receive);host.removeEventListener('pagehide',close);onDisconnect?.();};
 async function receive(event){
  if(!active||event.origin!==origin||event.source!==popup)return;
  try{
   if(event.data?.type==='pixie-creator-ready'){
    const c=await connect();if(!active)return;
    if(!c.authenticated||c.did!==did){close();throw Error('Sign-in changed. Reopen Creator OS from the correct private project.');}
    if(!connected){if(context){const fresh=(await c.run('workspace_get',{project_id:project.id})).project;const source=fresh.sources.find(s=>s.standardImport?.reference.uri===context.source.uri&&s.standardImport.reference.cid===context.source.cid);if(!source||JSON.stringify(prepareStandardContext(fresh,source.id))!==JSON.stringify(context)){close();throw Error('Saved Standard context or project permission changed. Review it again.');}}if(context&&!event.data.standardContextVersions?.includes(1)){close();throw Error('Creator OS does not support this Standard context version. No project payload was sent.');}connected=true;popup.postMessage({type:context?'pixie-creator-project/v2':'pixie-creator-project',...(context?{standardContext:context}:{}),project:{id:project.id,name:project.name,purpose:project.purpose},did,draft:savedCreatorDraft(project)},origin);}
   }else if(event.data?.type==='pixie-creator-return'&&connected){onReturn(readCreatorReceipt(event.data.receipt),grant);}
   else if(event.data?.type==='pixie-creator-close')close();
  }catch(error){onError(error.message);}
 }
 host.addEventListener('message',receive);host.addEventListener('pagehide',close);
 return {close,saved:id=>{if(active)popup.postMessage({type:'pixie-creator-saved',id},origin);}};
}

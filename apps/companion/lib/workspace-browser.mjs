import {emptyWorkspace,validateWorkspace,createWorkspaceService} from './workspace.mjs';
function openDatabase(){return new Promise((resolve,reject)=>{const request=indexedDB.open('pixie-creator-workspace',1);request.onupgradeneeded=()=>request.result.createObjectStore('records');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(Error('Private browser storage is unavailable. No project was saved.'));});}
export function browserStore(){let database;let queue=Promise.resolve();return {transaction(operation){const pending=queue.then(async()=>{
 const db=database||(database=await openDatabase());
 const state=await new Promise((resolve,reject)=>{const tx=db.transaction('records','readonly');const request=tx.objectStore('records').get('workspace');request.onsuccess=()=>resolve(request.result?validateWorkspace(request.result):emptyWorkspace());request.onerror=()=>reject(request.error);});
 const value=await operation(structuredClone(state));
 if(value.write)await new Promise((resolve,reject)=>{const tx=db.transaction('records','readwrite');const store=tx.objectStore('records');let conflict=false;const check=store.get('workspace');check.onsuccess=()=>{if((check.result?.revision||0)!==state.revision){conflict=true;tx.abort();}else store.put(validateWorkspace(value.state),'workspace');};tx.oncomplete=()=>resolve();tx.onabort=()=>reject(Error(conflict?'This workspace changed in another tab. Reload before retrying; nothing overwritten.':'Could not save browser data.'));tx.onerror=()=>reject(tx.error);});
 return value.result;
});queue=pending.catch(()=>{});return pending;}};}
export async function connectWorkspace(){
 let health=null;try{const response=await fetch('/health',{signal:AbortSignal.timeout(3000),cache:'no-store'});if(response.ok){const value=await response.json();if(value.service==='pixie-companion')health=value;}}catch{}
 let prior=false;try{prior=localStorage.getItem('pixie.workspace.backend')==='server';}catch{}
 if(!health){if(prior||location.hostname==='pixie-project-companion-production.up.railway.app')throw Error('Your independent server is unavailable. Its saved projects have not been replaced. Start it and retry.');const service=createWorkspaceService(browserStore());return {mode:'browser',localOwner:true,modelConfigured:false,notice:'Private project data is stored in IndexedDB on this browser and origin. Export backups before clearing browser data. This is not cross-device synchronization.',run:(name,args)=>service.run(name,args)};}
 const response=await fetch('/api/workspace/capabilities',{cache:'no-store'});if(!response.ok)throw Error('Workspace capabilities unavailable.');const capabilities=await response.json();
 try{localStorage.setItem('pixie.workspace.backend','server');}catch{}
 return {...capabilities,mode:'server',notice:capabilities.authenticated||capabilities.localOwner?'Private projects are saved by this server. Your projects are isolated by your verified Atmosphere identity.':'Sign in through the Atmosphere account menu to access your private projects.',async run(name,args){
  const response=await fetch('/api/workspace',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-Pixie-CSRF':capabilities.csrf||''},body:JSON.stringify({name,args})});const value=await response.json();if(!response.ok){if(response.status===401)window.dispatchEvent(new Event('pixie-identity-change'));throw Error(value.error||'Workspace request failed.');}return value;
 }};
}

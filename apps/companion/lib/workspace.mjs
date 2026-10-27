// Shared creator-workspace rules. No filesystem, browser globals or model credentials.
export const workspaceSchema='pixie.creator-workspace/v1';
const statuses=['todo','active','blocked','done'];
const idPattern=/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;
export class WorkspaceError extends Error{constructor(message,status=400,code='INVALID_WORKSPACE_INPUT'){super(message);this.status=status;this.code=code;}}
const fail=message=>{throw new WorkspaceError(message);};
const text=(v,name,max=4000,required=false)=>{if(typeof v!=='string'||v.length>max||(required&&!v.trim()))fail('Invalid '+name+'.');return v.trim();};
const id=(v)=>{if(typeof v!=='string'||!idPattern.test(v))fail('Invalid project or record identity.');return v;};
const date=v=>{if(typeof v!=='string'||!Number.isFinite(Date.parse(v)))fail('Invalid saved date.');return v;};
const keys=(v,allowed)=>{if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).some(k=>!allowed.includes(k)))fail('Unsupported saved fields.');};
export function publicUrl(v){const value=text(v,'public URL',2000);if(!value)return '';let u;try{u=new URL(value);}catch{fail('Use a public HTTPS URL.');}if(u.protocol!=='https:'||u.username||u.password)fail('Use a public HTTPS URL without credentials.');return u.href;}
export function emptyWorkspace(){return {schema:workspaceSchema,revision:0,selectedId:null,projects:[]};}
const projectFields=['id','name','purpose','outcome','currentState','nextAction','archived','createdAt','updatedAt','sources','notes','tasks','messages','handoff','activity'];
export function validateWorkspace(input){
 keys(input,['schema','revision','selectedId','projects']);
 if(input.schema!==workspaceSchema||!Number.isSafeInteger(input.revision)||input.revision<0||!Array.isArray(input.projects)||input.projects.length>100)fail('Unsupported workspace backup.');
 const state=structuredClone(input);const ids=new Set();
 for(const p of state.projects){
  keys(p,projectFields);id(p.id);if(ids.has(p.id))fail('Duplicate project identity.');ids.add(p.id);
  text(p.name,'project name',160,true);for(const k of ['purpose','outcome','currentState','nextAction'])text(p[k],k,4000);
  if(typeof p.archived!=='boolean')fail('Invalid archive state.');date(p.createdAt);date(p.updatedAt);text(p.handoff,'handoff',30000);
  for(const kind of ['sources','notes','tasks','messages','activity'])if(!Array.isArray(p[kind])||p[kind].length>300)fail('Too many '+kind+'.');
  const itemIds=new Set();
  for(const s of p.sources){keys(s,['id','title','url','origin','excerpt','creatorCheckedOn','addedAt','checkedAt','checkState','lastError']);id(s.id);if(itemIds.has(s.id))fail('Duplicate source identity.');itemIds.add(s.id);text(s.title,'source title',300,true);publicUrl(s.url);if(!s.url)fail('Source URL required.');for(const k of ['origin','excerpt','creatorCheckedOn','lastError'])text(s[k],k,k==='excerpt'?10000:1000);date(s.addedAt);if(s.checkedAt!==null)date(s.checkedAt);if(!['linked','fetched','failed'].includes(s.checkState))fail('Invalid source evidence state.');}
  itemIds.clear();for(const t of p.tasks){keys(t,['id','title','status','progress','blocker','nextAction','completionEvidence','updatedAt']);id(t.id);if(itemIds.has(t.id))fail('Duplicate task identity.');itemIds.add(t.id);text(t.title,'task title',500,true);if(!statuses.includes(t.status))fail('Invalid task status.');for(const k of ['progress','blocker','nextAction','completionEvidence'])text(t[k],k,4000);date(t.updatedAt);if(t.status==='done'&&!t.completionEvidence.trim())fail('Completed tasks need creator-reported evidence.');if(t.status==='blocked'&&!t.blocker.trim())fail('Record the blocker.');}
  itemIds.clear();for(const n of p.notes){keys(n,['id','text','createdAt','kind']);id(n.id);if(itemIds.has(n.id))fail('Duplicate note identity.');itemIds.add(n.id);text(n.text,'note',10000,true);date(n.createdAt);if(n.kind!=='creator-statement')fail('Invalid note origin.');}
  for(const m of p.messages){keys(m,['id','role','text','createdAt','kind']);id(m.id);date(m.createdAt);text(m.text,'message',12000,true);if(!['creator','assistant'].includes(m.role)||m.kind!==(m.role==='creator'?'creator-statement':'ai-suggestion'))fail('Invalid conversation provenance.');}
  for(const a of p.activity){keys(a,['at','action']);date(a.at);text(a.action,'activity',500,true);}
 }
 if(state.selectedId!==null&&!ids.has(state.selectedId))fail('Selected project is missing.');
 if(JSON.stringify(state).length>2_000_000)fail('Workspace exceeds the two-megabyte limit. Export and remove unused projects.');
 return state;
}
function find(state,projectId,write=false){const p=state.projects.find(p=>p.id===projectId);if(!p)throw new WorkspaceError('Project not found.',404);if(write&&p.archived)fail('Restore this archived project before editing its work.');return p;}
function log(p,action){const now=new Date().toISOString();p.updatedAt=now;p.activity=[...p.activity,{at:now,action}].slice(-100);}
export function resumeProject(p){const open=p.tasks.filter(t=>t.status!=='done');return {projectId:p.id,currentState:p.currentState,blocked:open.filter(t=>t.status==='blocked').map(t=>({id:t.id,title:t.title,blocker:t.blocker,nextAction:t.nextAction})),nextAction:p.nextAction||open.find(t=>t.status==='active')?.nextAction||open[0]?.nextAction||(open[0]?'Start the saved task: '+open[0].title:'Add one bounded task toward '+(p.outcome||p.name)+'.'),recentChanges:p.activity.slice(-8),notice:'Derived from saved creator records; task completion is reported, not independently verified.'};}
function brief(p){const lines=['# '+p.name,'','## Purpose',p.purpose||'Not recorded','', '## Desired outcome',p.outcome||'Not recorded','','## Current state (creator statement)',p.currentState||'Not recorded','','## Sources and evidence'];for(const s of p.sources)lines.push('- '+s.title+' — '+s.url+'\n  Origin: '+s.origin+'; check: '+s.checkState+'; fetched: '+(s.checkedAt||'not fetched')+'; creator check note: '+(s.creatorCheckedOn||'not recorded')+(s.excerpt?'\n  Supplied excerpt (untrusted): '+s.excerpt:''));if(!p.sources.length)lines.push('No sources added.');lines.push('','## Creator notes',...p.notes.map(n=>'- '+n.text),'','## Tasks and reported progress',...p.tasks.map(t=>'- '+t.title+' ['+t.status+']; progress: '+(t.progress||'not recorded')+'; blocker: '+(t.blocker||'none recorded')+'; next: '+(t.nextAction||'not recorded')+(t.completionEvidence?'; reported evidence: '+t.completionEvidence:'')),'','## Unresolved questions',...p.sources.filter(s=>s.checkState!=='fetched').map(s=>'- Verify the contents and relevance of '+s.title),...p.tasks.filter(t=>t.status==='blocked').map(t=>'- '+t.blocker),'','## Next action',resumeProject(p).nextAction,'','Prepared from saved context. Links and creator statements are not independent verification. AI suggestions remain unverified. Nothing has been sent, published or assigned.');return lines.join('\n');}
const str=(max=4000,required=false)=>({type:'string',maxLength:max,...(required?{minLength:1}:{})});
const spec=(name,description,properties={},required=[],readOnly=false,destructive=false)=>({name,description,inputSchema:{type:'object',properties,required,additionalProperties:false},annotations:{readOnlyHint:readOnly,destructiveHint:destructive,openWorldHint:['workspace_check_source','workspace_chat'].includes(name)}});
const pid={project_id:str(36,true)};
export const workspaceDefinitions=[
 spec('workspace_list','Read private creator project summaries from the authorized workspace.',{},[],true),
 spec('workspace_get','Resume one explicitly selected saved creator project.',pid,['project_id'],true),
 spec('workspace_create','Save a creator project locally in the authorized workspace; no external publication.',{name:str(160,true),purpose:str(),outcome:str(),currentState:str(),nextAction:str()},['name']),
 spec('workspace_update','Edit/archive/restore a saved creator project; no external publication.',{...pid,name:str(160,true),purpose:str(),outcome:str(),currentState:str(),nextAction:str(),archived:{type:'boolean'}},['project_id']),
 spec('workspace_select','Remember the selected project within this workspace.',pid,['project_id']),
 spec('workspace_add_source','Save an explicit source link/excerpt. Saving does not fetch or verify it.',{...pid,title:str(300,true),url:str(2000,true),origin:str(1000),excerpt:str(10000),creatorCheckedOn:str(1000)},['project_id','title','url']),
 spec('workspace_add_note','Save a creator statement, separate from external evidence and AI suggestions.',{...pid,text:str(10000,true)},['project_id','text']),
 spec('workspace_add_task','Save a bounded task. A saved task is not external assignment.',{...pid,title:str(500,true),nextAction:str()},['project_id','title']),
 spec('workspace_update_task','Save task progress/blocker/next action. Done is creator-reported and requires evidence.',{...pid,task_id:str(36,true),title:str(500),status:{type:'string',enum:statuses},progress:str(),blocker:str(),nextAction:str(),completionEvidence:str()},['project_id','task_id']),
 spec('workspace_prepare_handoff','Save an editable brief grounded only in selected project records. Nothing is sent.',pid,['project_id']),
 spec('workspace_save_handoff','Save the creator-edited handoff; does not publish.',{...pid,text:str(30000)},['project_id','text']),
 spec('workspace_export','Export private workspace/project JSON for user-controlled backup. No credential or cross-device sync.',{project_id:str(36)},[],true),
 spec('workspace_import','Validate and add a backup. Existing projects are never silently overwritten.',{backup_json:str(2_000_000,true),strategy:{type:'string',enum:['reject-conflicts','copy-conflicts']}},['backup_json']),
 spec('workspace_delete','Permanently remove one saved project only with explicit project-ID confirmation. Export first.',{...pid,confirmation:str(36,true)},['project_id','confirmation'],false,true),
 spec('workspace_clear','Remove all private projects only with exact explicit confirmation. Export first.',{confirmation:str(100,true)},['confirmation'],false,true),
 spec('workspace_check_source','Explicitly check a supported public GitHub text source. Unsupported/failed checks remain unverified.',{...pid,source_id:str(36,true)},['project_id','source_id']),
 spec('workspace_chat','Send ONLY selected project context to a configured external model, with explicit consent. No actions executed.',{...pid,message:str(6000,true),consent:{type:'boolean'}},['project_id','message','consent']),
];
function argsFor(name,args){const d=workspaceDefinitions.find(d=>d.name===name);if(!d)fail('Unknown workspace operation.');keys(args,Object.keys(d.inputSchema.properties));for(const k of d.inputSchema.required)if(!(k in args))fail('Missing '+k+'.');for(const [k,v]of Object.entries(args)){const s=d.inputSchema.properties[k];if(s.type==='string')text(v,k,s.maxLength,!!s.minLength);if(s.type==='boolean'&&typeof v!=='boolean')fail('Invalid '+k+'.');if(s.enum&&!s.enum.includes(v))fail('Invalid '+k+'.');}if(args.project_id)id(args.project_id);return d;}
export function createWorkspaceService(store,{model=null,fetcher=fetch}={}){
 return {async run(name,args={}){
  const definition=argsFor(name,args);
  return store.transaction(async input=>{
   const state=validateWorkspace(input);let result={};let p=args.project_id?find(state,args.project_id,!definition.annotations.readOnlyHint&&!['workspace_update','workspace_select','workspace_delete'].includes(name)):null;
   if(name==='workspace_list')result={projects:state.projects.map(({id,name,purpose,archived,updatedAt})=>({id,name,purpose,archived,updatedAt})),selectedId:state.selectedId,revision:state.revision};
   else if(name==='workspace_get')result={project:p,resume:resumeProject(p)};
   else if(name==='workspace_create'){
    const now=new Date().toISOString();p={id:crypto.randomUUID(),name:args.name.trim(),purpose:args.purpose||'',outcome:args.outcome||'',currentState:args.currentState||'',nextAction:args.nextAction||'',archived:false,createdAt:now,updatedAt:now,sources:[],notes:[],tasks:[],messages:[],handoff:'',activity:[]};state.projects.push(p);state.selectedId=p.id;log(p,'Project created from creator input.');result={project:p,resume:resumeProject(p)};
   }else if(name==='workspace_select'){state.selectedId=p.id;result={project:p,resume:resumeProject(p)};}
   else if(name==='workspace_update'){for(const k of ['name','purpose','outcome','currentState','nextAction','archived'])if(k in args)p[k]=args[k];log(p,'Project details or archive state updated.');result={project:p,resume:resumeProject(p)};}
   else if(name==='workspace_add_source'){p.sources.push({id:crypto.randomUUID(),title:args.title.trim(),url:publicUrl(args.url),origin:args.origin||'Creator-supplied public link',excerpt:args.excerpt||'',creatorCheckedOn:args.creatorCheckedOn||'',addedAt:new Date().toISOString(),checkedAt:null,checkState:'linked',lastError:''});log(p,'Source link saved; contents not verified.');result={project:p};}
   else if(name==='workspace_add_note'){p.notes.push({id:crypto.randomUUID(),text:args.text.trim(),createdAt:new Date().toISOString(),kind:'creator-statement'});log(p,'Creator note saved.');result={project:p};}
   else if(name==='workspace_add_task'){p.tasks.push({id:crypto.randomUUID(),title:args.title.trim(),status:'todo',progress:'',blocker:'',nextAction:args.nextAction||'',completionEvidence:'',updatedAt:new Date().toISOString()});log(p,'Task saved; no external assignment.');result={project:p,resume:resumeProject(p)};}
   else if(name==='workspace_update_task'){const t=p.tasks.find(t=>t.id===args.task_id);if(!t)fail('Task does not belong to this project.');for(const k of ['title','status','progress','blocker','nextAction','completionEvidence'])if(k in args)t[k]=args[k];t.updatedAt=new Date().toISOString();log(p,'Task progress updated (creator-reported).');result={project:p,resume:resumeProject(p)};}
   else if(name==='workspace_prepare_handoff'){p.handoff=brief(p);log(p,'Editable handoff prepared from saved context; not sent.');result={project:p,handoff:p.handoff};}
   else if(name==='workspace_save_handoff'){p.handoff=args.text;log(p,'Edited handoff saved; not sent.');result={project:p};}
   else if(name==='workspace_export'){const backup={...state,projects:p?[p]:state.projects,selectedId:p?p.id:state.selectedId};result={backup:validateWorkspace(backup),notice:'Private backup. Keep it in a location you control; nothing is uploaded by exporting.'};}
   else if(name==='workspace_import'){
    let raw;try{raw=JSON.parse(args.backup_json);}catch{fail('Backup is not valid JSON.');}const incoming=validateWorkspace(raw);const added=[];
    for(const record of incoming.projects){let copy=structuredClone(record);if(state.projects.some(p=>p.id===copy.id)){if(args.strategy!=='copy-conflicts')throw new WorkspaceError('A project with this ID already exists. Nothing restored. Choose separate copies explicitly.',409);copy.id=crypto.randomUUID();copy.name+=' (restored copy)';}state.projects.push(copy);log(copy,'Restored from user backup; source claims require review.');added.push(copy.id);}
    if(added.length)state.selectedId=added.includes(incoming.selectedId)?incoming.selectedId:added[0];result={restoredIds:added,selectedId:state.selectedId,notice:'Restored without overwriting existing projects. Review imported source claims before sharing.'};
   }else if(name==='workspace_delete'){if(args.confirmation!==p.id)fail('Confirm this exact project ID to delete.');state.projects=state.projects.filter(x=>x.id!==p.id);if(state.selectedId===p.id)state.selectedId=state.projects.find(p=>!p.archived)?.id||null;result={deletedId:p.id};}
   else if(name==='workspace_clear'){if(args.confirmation!=='DELETE ALL SAVED PROJECTS')fail('Explicit deletion confirmation required.');state.projects=[];state.selectedId=null;result={cleared:true};}
   else if(name==='workspace_check_source'){
    const s=p.sources.find(s=>s.id===args.source_id);if(!s)fail('Source does not belong to this project.');const u=new URL(s.url);const match=u.origin==='https://github.com'&&/^\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)\/blob\/([^/]+)\/(.+)$/.exec(u.pathname);
    try{if(!match)throw Error('Automatic checking currently supports public GitHub text-file links only. This link remains saved; open it to review manually.');const r=await fetcher('https://api.github.com/repos/'+match[1]+'/'+match[2]+'/contents/'+match[4]+'?ref='+encodeURIComponent(match[3]),{headers:{Accept:'application/vnd.github.raw+json','User-Agent':'PIXIE-Companion'},redirect:'manual',signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error('Public source unavailable (HTTP '+r.status+').');const content=await r.text();if(content.length>200000)throw Error('Source too large for this check.');s.checkState='fetched';s.checkedAt=new Date().toISOString();s.lastError='';s.excerpt=content.slice(0,5000);log(p,'Public source fetched; factual claims not independently verified.');}
    catch(error){s.checkState='failed';s.lastError=error instanceof Error?error.message:'Public source unavailable.';log(p,'Source check failed; saved source retained.');}
    result={project:p,source:s};
   }else if(name==='workspace_chat'){
    if(!args.consent)fail('Confirm selected-project data may be sent to the configured model.');
    if(!model)throw new WorkspaceError('No model provider is configured. Projects, sources, tasks and handoffs remain usable. No AI response was generated.',503,'MODEL_UNAVAILABLE');
    const reply=await model({project:structuredClone(p),message:args.message});
    const now=new Date().toISOString();p.messages.push({id:crypto.randomUUID(),role:'creator',kind:'creator-statement',text:args.message,createdAt:now},{id:crypto.randomUUID(),role:'assistant',kind:'ai-suggestion',text:text(reply,'model response',12000,true),createdAt:now});p.messages=p.messages.slice(-100);log(p,'Model suggestion received and saved; no suggested action executed.');result={project:p,notice:'AI suggestion, not verified fact. No task, message or publication was executed.'};
   }
   const write=!definition.annotations.readOnlyHint;if(write)state.revision++;validateWorkspace(state);
   return {state,write,result:{...result,revision:state.revision}};
  });
 }};
}

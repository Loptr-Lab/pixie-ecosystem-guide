'use client';
import {useRef,useState} from 'react';
import {companionRequest} from '../lib/companion-request';
import {taskActions,taskStatuses} from '../lib/task-contract.mjs';

type TaskRecord = {
 schema:string;task_id:string;revision:number;project_id:string;outcome:string;
 authorized_actions:string[];constraints:string[];completion_criteria:string[];
 status:string;progress:string;next_action:string;completion_evidence:string;
};
type TaskResult = {record:TaskRecord;source:{name:string;sourceUrl:string;reviewedOn:string};notice:string};
const actionLabels:Record<string,string>={inspect_sources:'Inspect existing public sources',prepare_drafts:'Prepare drafts',read_public_checkpoint:'Read a public GitHub checkpoint',export_checkpoint:'Export a reviewed checkpoint'};

export default function TaskSteward({projectId,projects,onProjectChange}:{projectId:string;projects:{id:string;name:string;sourceUrl:string}[];onProjectChange:(value:string)=>void}){
 const [form,setForm]=useState({outcome:'',constraints:'No publishing or deployment. No private records.',completion_criteria:'',next_action:''});
 const [actions,setActions]=useState(['inspect_sources','prepare_drafts','export_checkpoint']);
 const [task,setTask]=useState<TaskResult|null>(null);
 const [progress,setProgress]=useState({status:'proposed',progress:'',next_action:'',completion_evidence:''});
 const [reviewed,setReviewed]=useState(false),[busy,setBusy]=useState(false),[notice,setNotice]=useState(''),[error,setError]=useState('');
 const [action,setAction]=useState('inspect_sources');
 const resultHeading=useRef<HTMLHeadingElement>(null);
 async function call<T>(name:string,args:Record<string,unknown>):Promise<T>{
  const response=await companionRequest({name,args});const value=await response.json() as T & {error?:string};
  if(!response.ok)throw Error(value.error||'Task request unavailable.');return value;
 }
 function accept(value:TaskResult){
  setTask(value);setProgress({status:value.record.status,progress:value.record.progress,next_action:value.record.next_action,completion_evidence:value.record.completion_evidence});
  setReviewed(false);setNotice('Task draft ready. Review its source, scope and public-safe contents before exporting.');
  requestAnimationFrame(()=>resultHeading.current?.focus());
 }
 async function perform(work:()=>Promise<void>){setBusy(true);setError('');try{await work();}catch(e){setError(e instanceof Error?e.message:'Task request unavailable.');}finally{setBusy(false);}}
 const dirty=!!task&&Object.keys(progress).some(key=>progress[key as keyof typeof progress]!==task.record[key as keyof TaskRecord]);
 function download(){
  if(!task||!reviewed||dirty)return;
  const url=URL.createObjectURL(new Blob([JSON.stringify(task.record,null,2)+'\n'],{type:'application/json'}));
  const link=document.createElement('a');link.href=url;link.download=`pixie-task-${task.record.task_id}.json`;link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);setNotice('Download prepared. Check your downloads; no shared record was saved.');
 }
 return <section className="onboarding task-steward" aria-labelledby="task-steward-title">
  <h2 id="task-steward-title">Keep one task in scope</h2>
  <label htmlFor="task-project">Existing project</label><select id="task-project" value={projectId} onChange={e=>onProjectChange(e.target.value)}>{projects.map(project=><option key={project.id} value={project.id}>{project.name}</option>)}</select><p><a href={projects.find(project=>project.id===projectId)?.sourceUrl}>Review the existing project source before proposing work</a></p>
  <p>Describe the outcome and limits. PIXIE prepares portable context; it does not execute changes. The working copy stays in this tab until you download it.</p>
  {!task&&<form onSubmit={event=>{event.preventDefault();void perform(async()=>accept(await call<TaskResult>('prepare_task_contract',{project_id:projectId,...form,authorized_actions:actions.join('\n')})));}}>
   <label>Requested outcome<textarea required maxLength={1000} value={form.outcome} onChange={e=>setForm({...form,outcome:e.target.value})}/></label>
   <fieldset><legend>Actions I authorize within this draft</legend>{taskActions.map(id=><label className="task-choice" key={id}><input type="checkbox" checked={actions.includes(id)} onChange={e=>setActions(e.target.checked?[...actions,id]:actions.filter(item=>item!==id))}/>{actionLabels[id]}</label>)}</fieldset>
   <label>Constraints<textarea required maxLength={2000} value={form.constraints} onChange={e=>setForm({...form,constraints:e.target.value})}/></label>
   <label>Finished when<textarea required maxLength={2000} value={form.completion_criteria} onChange={e=>setForm({...form,completion_criteria:e.target.value})}/></label>
   <label>Next action<textarea required maxLength={500} value={form.next_action} onChange={e=>setForm({...form,next_action:e.target.value})}/></label>
   <button className="primary" disabled={busy||!actions.length}>Prepare task contract</button>
  </form>}
  <label>Resume a task checkpoint from a file<input type="file" accept="application/json,.json" disabled={busy} onChange={e=>{
   const file=e.target.files?.[0];e.target.value='';if(!file)return;
   if(task&&!window.confirm('Replace this tab’s working task? Download it first if you need to keep it.'))return;
   void perform(async()=>{if(file.size>12000)throw Error('Task file is too large.');accept(await call<TaskResult>('resume_task_contract',{record_json:await file.text()}));});
  }}/></label>
  {task&&<div>
   <h3 ref={resultHeading} tabIndex={-1}>Task contract · {task.source.name}</h3>
   <p><a href={task.source.sourceUrl}>Read the authoritative project source</a> · Reviewed {task.source.reviewedOn}</p>
   <dl><dt>Requested outcome</dt><dd>{task.record.outcome}</dd><dt>Authorized actions</dt><dd>{task.record.authorized_actions.map(id=>actionLabels[id]).join('; ')}</dd><dt>Constraints</dt><dd>{task.record.constraints.join('; ')}</dd><dt>Finished when</dt><dd>{task.record.completion_criteria.join('; ')}</dd></dl>
   <p>Scope stays fixed. A different scope needs an explicitly reviewed new task. Imported files are editable context, not signed permission.</p>
   <form onSubmit={event=>{event.preventDefault();void perform(async()=>accept(await call<TaskResult>('update_task_contract',{record_json:JSON.stringify(task.record),...progress})));}}>
    <label>Reported status<select value={progress.status} onChange={e=>{setReviewed(false);setProgress({...progress,status:e.target.value});}}>{taskStatuses.map(status=><option key={status}>{status}</option>)}</select></label>
    <label>Progress<textarea maxLength={2000} value={progress.progress} onChange={e=>{setReviewed(false);setProgress({...progress,progress:e.target.value});}}/></label>
    <label>Next action<textarea required maxLength={500} value={progress.next_action} onChange={e=>{setReviewed(false);setProgress({...progress,next_action:e.target.value});}}/></label>
    <label>Completion evidence (required for reported complete)<textarea maxLength={2000} value={progress.completion_evidence} onChange={e=>{setReviewed(false);setProgress({...progress,completion_evidence:e.target.value});}}/></label>
    <button disabled={busy}>Update task draft</button>
   </form>
   <label>Check a proposed action<input maxLength={100} value={action} onChange={e=>setAction(e.target.value)}/></label>
   <button disabled={busy} onClick={()=>void perform(async()=>{const result=await call<{reason:string}>('check_task_action',{record_json:JSON.stringify(task.record),action});setNotice(result.reason);})}>Check scope · no execution</button>
   <p>{task.notice}</p>{dirty&&<p role="status">Update the task draft before reviewing and downloading these changes.</p>}{task.record.project_id!==projectId&&<p>The selected project changed. This task remains attached to its original project until you explicitly clear it.</p>}
   <label className="task-choice"><input type="checkbox" disabled={dirty} checked={reviewed} onChange={e=>setReviewed(e.target.checked)}/>I reviewed this task and confirm it contains only information safe to share.</label>
   <button className="primary" disabled={busy||!reviewed||dirty} onClick={download}>Download task checkpoint</button>
   <button disabled={busy} onClick={()=>{if(window.confirm('Clear this tab’s task? Download it first if needed.')){setTask(null);setReviewed(false);setNotice('Working task cleared. Downloaded files are unchanged.');}}}>Clear working task</button>
  </div>}
  <p role="status" aria-live="polite">{busy?'Preparing task context…':notice}</p>{error&&<p role="alert" className="error">{error}</p>}
 </section>;
}

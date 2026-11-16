// A deterministic gate over explicitly supplied evidence. It does not certify
// the truth of client reports, read sources automatically, or control the host AI.
export const companionVersion = '0.6.0';
const kinds = ['source_text','owner_confirmation','inference','proposal','unresolved'];
function fail(message){throw Error('Evidence review: '+message);}
function exact(value,keys){if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(k=>!keys.includes(k)))fail('unsupported fields.');}
function text(value,max=2000){return typeof value==='string'&&!!value.trim()&&value.length<=max;}
export function reviewActionEvidence(record,json){
 if(!record||!text(record.task_id,100)||!Number.isSafeInteger(record.revision)||record.revision<1||!text(record.project_id,100))fail('invalid current task identity.');
 if(typeof json!=='string'||json.length>24000)fail('supply a bounded review for this task revision.');
 let r;try{r=JSON.parse(json)}catch{fail('unreadable review JSON.');}
 exact(r,['task_id','revision','project_id','instructions','sources','existing_work','preserved_decisions','claims','checks']);
 if(r.task_id!==record.task_id||r.revision!==record.revision||r.project_id!==record.project_id)fail('task, project or revision changed; review current context.');
 const blockers=[];
 for(const name of ['instructions','sources','preserved_decisions','claims','checks'])if(!Array.isArray(r[name])||r[name].length>30)fail('invalid '+name+'.');
 if(!text(r.existing_work))blockers.push('Identify the existing implementation/assignment and smallest correction.');
 if(!r.preserved_decisions.length||r.preserved_decisions.some(v=>!text(v)))blockers.push('Record the explicit decisions and project boundaries that must remain fixed.');
 if(!r.instructions.length)blockers.push('Read applicable instructions.');
 if(!r.sources.length)blockers.push('Read the substantive source before dependent drafting.');
 const ids=new Set();
 for(const s of [...r.instructions,...r.sources]){
  exact(s,['id','project_id','reference','status','excerpt']);
  if(!text(s.id,100)||ids.has(s.id)||!text(s.reference,1000)||!['read','unread','failed'].includes(s.status))fail('invalid source identity, reference or access state.');
  ids.add(s.id);
  if(s.project_id!==record.project_id)blockers.push('A source belongs to a different project; do not silently transfer its authority.');
  if(s.status!=='read'||!text(s.excerpt))blockers.push('Source '+s.id+' has not been substantively read.');
 }
 const checks=new Map();
 for(const c of r.checks){exact(c,['id','status','evidence']);if(!text(c.id,100)||checks.has(c.id)||!['passed','failed','unverified'].includes(c.status)||typeof c.evidence!=='string'||c.evidence.length>2000)fail('invalid verification record.');checks.set(c.id,c);}
 for(const c of r.claims){
  exact(c,['text','project_id','kind','presentation','evidence_ids','check_ids']);
  if(!text(c.text)||!kinds.includes(c.kind)||!['source_attributed','owner_confirmed','interpretation','proposed','unresolved','verified_result'].includes(c.presentation)||!Array.isArray(c.evidence_ids)||!Array.isArray(c.check_ids)||c.evidence_ids.length>30||c.check_ids.length>30)fail('invalid claim.');
  if(c.project_id!==record.project_id)blockers.push('Claim changes project identity or transfers another project’s canon.');
  if(c.evidence_ids.some(id=>!ids.has(id)))blockers.push('Claim cites an unknown source.');
  const expected={source_text:'source_attributed',owner_confirmation:'owner_confirmed',inference:'interpretation',proposal:'proposed',unresolved:'unresolved'}[c.kind];
  if(c.presentation!==expected&&c.presentation!=='verified_result')blockers.push('Claim upgrades an interpretation, proposal or unresolved statement into authority.');
  if(['source_text','owner_confirmation'].includes(c.kind)&&!c.evidence_ids.length)blockers.push('A factual or owner-confirmed claim needs its explicit reference.');
  if(c.presentation==='verified_result'&&(c.kind!=='source_text'||!c.evidence_ids.length||!c.check_ids.length||c.check_ids.some(id=>checks.get(id)?.status!=='passed'||!text(checks.get(id)?.evidence))))blockers.push('Verified-result claim lacks passed checks and observed evidence.');
 }
 return {version:companionVersion,allowed:blockers.length===0,blockers:[...new Set(blockers)],trust:'Participant-supplied evidence reviewed for completeness and consistency, not independently authenticated facts or permission. No external action executed.'};
}

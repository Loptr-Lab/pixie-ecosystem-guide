// Made-Sick owns discovery records. This adapter never stores a second catalog.
export const resourceSource = 'https://made-sick.org/directory-resources.json';
const kinds = ['all','lawyer','accountant','collaborator','resource'];
const clean = (v, n=2000) => { if(typeof v!=='string'||v.length>n)throw Error('Invalid or oversized text');return v; };
const https = value => { const u=new URL(clean(value));if(u.protocol!=='https:'||u.username||u.password)throw Error('Use a public HTTPS URL without credentials');return u.href; };
/** @returns {Record<string, any>} */
export function normalizeResource(r){
 if(!r||!/^[-a-z0-9]{1,80}$/.test(r.id)||!kinds.slice(1).includes(r.kind)||!['provider','directory','community','resource'].includes(r.recordType))throw Error('Unsupported resource');
 const out={id:r.id,kind:r.kind,recordType:r.recordType};
 for(const k of ['name','description','jurisdiction','location','verification','relationship','fees','availability','accessibility'])out[k]=clean(r[k],1500);
 out.url=https(r.url);out.evidenceUrl=https(r.evidenceUrl);
 if(!Array.isArray(r.tags)||r.tags.length>20)throw Error('Invalid tags');out.tags=r.tags.map(x=>clean(x,80));
 if(r.reviewedOn!==null&&!/^\d{4}-\d{2}-\d{2}$/.test(r.reviewedOn))throw Error('Invalid review date');out.reviewedOn=r.reviewedOn;
 out.directoryUrl='https://made-sick.org/directory.html#resource-'+r.id;
 return out;
}
export async function readResources(fetcher=fetch){
 const response=await fetcher(resourceSource,{redirect:'manual',signal:AbortSignal.timeout(7000),headers:{Accept:'application/json'}});
 if(!response.ok)throw Error('Made-Sick resource lookup unavailable. Open https://made-sick.org/directory.html directly; no replacement directory was created.');
 const raw=await response.text();if(raw.length>100000)throw Error('Resource response too large');
 const data=JSON.parse(raw);if(data.schema!=='made-sick-resources/v1'||data.owner!=='Made-Sick.org'||!Array.isArray(data.resources)||data.resources.length>200)throw Error('Unsupported Made-Sick source contract');
 const resources=data.resources.map(normalizeResource);if(new Set(resources.map(x=>x.id)).size!==resources.length)throw Error('Duplicate source IDs');
 return {resources,source:resourceSource,retrievedAt:new Date().toISOString()};
}
export function filterResources(source,{kind='all',query='',jurisdiction='',location=''}={}){
 if(!kinds.includes(kind))throw Error('Unknown resource kind');
 const norm=s=>s.toLowerCase().normalize('NFKC');
 const terms=norm(clean(query,200)).split(/\s+/).filter(Boolean);
 const area=norm(clean(jurisdiction,100)).trim(), place=norm(clean(location,100)).trim();
 const resources=source.resources.filter(r=>(kind==='all'||r.kind===kind)&&(!area||norm(r.jurisdiction).includes(area))&&(!place||norm(r.location).includes(place)||r.recordType==='directory')&&terms.every(t=>norm([r.name,r.description,...r.tags].join(' ')).includes(t))).map(r=>({...r,fit:[kind!=='all'?'Category: '+kind:'Public resource',...terms.map(t=>'Text matches: '+t),...(place?[r.location?'Listed location: '+r.location:'Directory route; filter location on provider site']:[])],openQuestions:['Confirm fees and availability','Confirm access needs and working approach',...(r.kind==='lawyer'||r.kind==='accountant'?['Check individual credentials and jurisdiction']:[])],freshness:!r.reviewedOn?'Date unverified':Date.now()-Date.parse(r.reviewedOn)>90*86400000?'Review older than 90 days; recheck':'Dated source review; current availability unchecked'}));
 return {...source,resources,criteria:{kind,query,jurisdiction,location},notice:'Source relevance, not a credential, ethics or suitability endorsement. No paid ranking. Directory routes are not selected professionals.',next:resources.length?'Inspect a source, then prepare an enquiry.':'No exact match in the current Made-Sick records. Adjust filters or browse the source directory; no substitute match was invented.'};
}
export function prepareEnquiry(resource,{project,need,budget='',access='',values=''}={}){
 const r=normalizeResource(resource);for(const [v,n]of [[project,1000],[need,1500],[budget,200],[access,500],[values,500]])clean(v,n);
 if(!project.trim()||!need.trim())throw Error('Describe the project and help needed');
 const report=`Greetings,\n\nI’m working on ${project.trim()}.\n\nI’m looking for help with ${need.trim()}.\n\nI found ${r.name} through Made-Sick.org. ${r.recordType==='directory'?'Could you help me identify the appropriate professional or search route?':'Could you confirm whether this falls within your expertise and whether you are accepting enquiries?'}\n\n${[budget&&'Budget / scope: '+budget,access&&'Communication / access preferences: '+access,values&&'Working priorities: '+values].filter(Boolean).join('\n')}\n\nPlease let me know the likely scope, fees, availability and what information you need for an initial conversation. Please identify any jurisdiction or specialist limitations.\n\nThank you.`;
 return {resource:r,report,status:'draft — not sent',nextAction:'Review the enquiry, then use the provider’s chosen contact route.',questions:['What deliverable and fee would you propose?','Who will do the work, and what relevant experience do they have?','What are the scope, ownership, confidentiality and exit terms?'],visibility:'Private working draft. No public GitHub issue or contact record is created.'};
}
export function createFollowup(resource,{project,need,budget='',access='',values='',report='',nextAction='',status='draft',followupOn='',pixie_id=''}={}){
 const r=normalizeResource(resource);for(const [v,n]of [[project,1000],[need,1500],[budget,200],[access,500],[values,500],[report,6500],[nextAction,500]])clean(v,n);
 if(!['draft','contacted','reply received','closed'].includes(status))throw Error('Invalid follow-up status');
 if(followupOn&&!/^\d{4}-\d{2}-\d{2}$/.test(followupOn))throw Error('Invalid follow-up date');
 const id=pixie_id||crypto.randomUUID();if(!/^[A-Za-z0-9-]{1,80}$/.test(id))throw Error('Invalid PIXIE ID');
 return {schema:'pixie-network-followup/v1',pixie_id:id,type:'network-card',title:project,source:'Made-Sick.org',source_id:r.id,status,resource:r,project,need,budget,access,values,report,nextAction,followupOn,updated_at:new Date().toISOString(),provenance:[{source_url:r.directoryUrl,evidence_url:r.evidenceUrl,reviewed_on:r.reviewedOn}],reviewRequired:true,verification:'Contact and reply status are user-reported; no external delivery verified'};
}
export function resumeFollowup(json){
 const raw=clean(json,14000);const s=JSON.parse(raw);if(s.schema!=='pixie-network-followup/v1'||s.type!=='network-card'||!s.pixie_id)throw Error('Unsupported follow-up file');
 return createFollowup(s.resource,s); // whitelist fields, preserve identity, require fresh review
}

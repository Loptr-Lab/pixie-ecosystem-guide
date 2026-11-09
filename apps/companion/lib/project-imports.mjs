import {retrieval} from './story-discovery.mjs';
export const importSchema='pixie.project-import/v1';
export const collections=['site.standard.publication','site.standard.document'];
export const operations=['reference','metadata','content'];
const fail=m=>{throw Error(m);};
const keys=(o,list)=>{if(!o||typeof o!=='object'||Array.isArray(o)||Object.keys(o).some(k=>!list.includes(k)))fail('Unsupported import fields.');};
const text=(v,max,required=false)=>{if(typeof v!=='string'||v.length>max||required&&!v.trim())fail('Invalid import text.');return v;};
const date=v=>{text(v,100,true);if(!Number.isFinite(Date.parse(v)))fail('Invalid import timestamp.');};
function uri(v){const m=/^at:\/\/(did:(?:plc:[a-z2-7]{24}|web:[a-z0-9.-]+))\/(site\.standard\.(?:publication|document))\/([a-zA-Z0-9._~:-]{1,512})$/.exec(v||'');if(!m)fail('Invalid Standard.site identity.');return {did:m[1],collection:m[2],rkey:m[3]};}
function https(v){text(v,2000,true);const u=new URL(v);if(u.protocol!=='https:'||u.username||u.password||u.port||/^(localhost|.*\.local|.*\.internal)$/.test(u.hostname)||!/[a-z]$/i.test(u.hostname))fail('Unsafe import URL.');return u;}
export function validateImportDefinition(d){
 keys(d,['schema','collections','operations','formats','maxItems','maxTextLength','destination','contentDestination','provenanceRequired','rightsRequired','conflictPolicy','reviewRequired','creatorDestination']);
 if(d.schema!==importSchema||d.destination!=='sources'||d.contentDestination!=='imported-drafts'||d.provenanceRequired!==true||d.rightsRequired!==true||d.reviewRequired!==true||d.conflictPolicy!=='reject-revisions'||typeof d.creatorDestination!=='boolean')fail('Unsupported project import definition. ');
 for(const [list,allowed]of [[d.collections,collections],[d.operations,operations],[d.formats,['text/plain']]])if(!Array.isArray(list)||!list.length||new Set(list).size!==list.length||list.some(v=>!allowed.includes(v)))fail('Unsupported import collection, operation or format.');
 if(!Number.isInteger(d.maxItems)||d.maxItems<1||d.maxItems>25||!Number.isInteger(d.maxTextLength)||d.maxTextLength<1||d.maxTextLength>20000)fail('Invalid project import limits.');
 return structuredClone(d);
}
export function validateStandardReference(r){
 keys(r,['schema','authorDid','authorHandle','collection','rkey','uri','cid','title','description','publication','site','canonicalUrl','publishedAt','updatedAt','retrievedAt','endpoint','contentType','representation','textContent','contentStatus','relationship','linkError','verification']);
 const ref=uri(r.uri);if(r.schema!=='pixie.standard-reference/v1'||r.authorDid!==ref.did||r.collection!==ref.collection||r.rkey!==ref.rkey||!/^b[a-z2-7]{20,}$/.test(r.cid||''))fail('Invalid source identity or revision.');
 text(r.authorHandle,253,true);text(r.title,5000,true);text(r.description,30000);text(r.contentStatus,2000);date(r.retrievedAt);if(r.publishedAt!==null)date(r.publishedAt);if(r.updatedAt!==null)date(r.updatedAt);
 if(r.collection==='site.standard.document'&&r.publishedAt===null)fail('Document publication date is required.');
 const endpoint=https(r.endpoint);retrieval.publicOrigin(endpoint.origin);
 if(!['/xrpc/com.atproto.repo.getRecord','/xrpc/com.atproto.repo.listRecords'].includes(endpoint.pathname)||endpoint.searchParams.get('repo')!==r.authorDid||endpoint.searchParams.get('collection')!==r.collection||[...endpoint.searchParams.keys()].some(k=>!['repo','collection','rkey','cursor','limit'].includes(k)))fail('Invalid retrieval endpoint.');
 if(r.canonicalUrl!==null)https(r.canonicalUrl);
 if(r.site!==null){if(r.site.startsWith('at://')){if(uri(r.site).collection!=='site.standard.publication')fail('Invalid publication relationship.');}else https(r.site);}
 if(r.publication!==null){keys(r.publication,['uri','cid','authorDid','url','title']);const p=uri(r.publication.uri);if(p.collection!=='site.standard.publication'||p.did!==r.publication.authorDid||r.site!==r.publication.uri||!/^b[a-z2-7]{20,}$/.test(r.publication.cid||''))fail('Invalid publication revision/relationship.');https(r.publication.url);text(r.publication.title,5000,true);}
 if(r.contentType!==null)text(r.contentType,500);if(r.representation!==null&&r.representation!=='text/plain')fail('Unsupported content representation.');if(r.textContent!==null){text(r.textContent,20000);if(r.representation!=='text/plain')fail('Unsupported content format.');}
 if(!['standalone','publication-reference'].includes(r.relationship))fail('Invalid relationship state.');if(r.linkError!==null)text(r.linkError,2000);
 keys(r.verification,['identity','revision','website','detail']);for(const k of ['identity','revision','detail'])text(r.verification[k],2000,true);if(!['not-checked','matched','mismatch','unavailable'].includes(r.verification.website))fail('Invalid verification status.');
 if(JSON.stringify(r).length>90000)fail('Source snapshot exceeds size limit.');return structuredClone(r);
}
export function prepareStandardImport(project,{reference,operation,reviewed,rightsDeclaration=''}){
 if(reviewed!==true)fail('Explicit source and destination review is required.');if(!operations.includes(operation))fail('Unsupported import operation.');
 const r=validateStandardReference(reference);let definition=null;
 if(operation!=='reference'){
  if(!project.importDefinition)fail('Configure this project’s import definition before importing. Reference attachment remains available.');
  definition=validateImportDefinition(project.importDefinition);
  if(!definition.collections.includes(r.collection)||!definition.operations.includes(operation))fail('The project import definition disallows this source or operation.');
 }
 if(!r.canonicalUrl)fail('No canonical web destination is available. Keep the AT-URI and retry when its publication is available.');
 if(operation==='content'){
  text(rightsDeclaration,2000,true);
  if(r.representation!=='text/plain'||typeof r.textContent!=='string'||!definition.formats.includes('text/plain')||r.textContent.length>definition.maxTextLength)fail('Unsupported or oversized content. Attach a reference instead; no rich-body conversion is available.');
 }
 const previous=project.sources.filter(s=>s.standardImport?.reference.uri===r.uri);
 if(previous.some(s=>s.standardImport.reference.cid!==r.cid))fail('Source revision changed. Existing snapshots and local edits were preserved; review separately.');
 const existing=previous.find(s=>s.standardImport.operation===operation);
 if(existing)return {existing};
 if(definition&&project.sources.filter(s=>s.standardImport?.operation!=='reference'&&s.standardImport).length>=definition.maxItems)fail('Project import count limit reached.');
 const draftText=operation==='content'?r.textContent:null;
 // Reference/metadata snapshots exclude bodies; copied text lives only in a separate local draft.
 r.textContent=null;if(operation==='reference')r.description='';
 return {reference:r,definition,draftText,rightsDeclaration:operation==='content'?rightsDeclaration:'',operation};
}
export function validateSavedStandardImport(value){
 keys(value,['schema','operation','reference','definition','rightsDeclaration','importedAt']);
 if(value.schema!=='pixie.standard-import/v1'||!operations.includes(value.operation))fail('Unsupported saved import.');validateStandardReference(value.reference);date(value.importedAt);text(value.rightsDeclaration,2000,value.operation==='content');
 if(value.operation!=='reference'){const d=validateImportDefinition(value.definition);if(!d.operations.includes(value.operation)||!d.collections.includes(value.reference.collection))fail('Saved import violates its recorded definition.');}else if(value.definition!==null)fail('Unexpected reference import policy.');
 if(value.reference.textContent!==null)fail('Source bodies belong in separate imported drafts.');return value;
}

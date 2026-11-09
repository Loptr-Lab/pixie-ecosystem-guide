/* Made-Sick Story Finder retrieval. Public reads only; no persistence or credentials. */
(function(root){
'use strict';
const APPVIEW='https://public.api.bsky.app/xrpc/', ENTRYWAY='https://bsky.social/xrpc/';
const COLLECTION='app.bsky.feed.post';
function normalize(value){return String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’'‘]/g,'').replace(/\s+/g,' ').trim()}
function searchable(item){const r=item.post?.record||{},e=r.embed||{},m=e.media||e;return [r.text,m.alt,...(m.images||[]).map(i=>i.alt),m.external?.title,m.external?.description,...(r.tags||[])].filter(v=>typeof v==='string').join('\n')}
function matches(item,query,exact=false){const text=normalize(searchable(item));return String(query).split('\n').some(line=>{const q=normalize(line);return !q||(exact?text.includes(q):q.split(' ').every(w=>text.includes(w)))})}
// A closed provider policy prevents server-side requests to arbitrary DID service URLs.
// Additional providers require source review, never a caller-supplied proxy destination.
function publicOrigin(value){const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password||u.port||u.pathname!=='/'||u.search||u.hash||!(/^[a-z0-9-]+\.(?:us-east|us-west|eu-central|eu-west)\.host\.bsky\.network$/.test(u.hostname)||['bsky.social','eurosky.social'].includes(u.hostname)))throw Error('Unsupported PDS endpoint: provider requires security review.');return u.origin}
async function json(url,fetcher,signal){
 let response;try{response=await fetcher(url,{redirect:'manual',credentials:'omit',headers:{Accept:'application/json'},signal:signal?AbortSignal.any([signal,AbortSignal.timeout(15000)]):AbortSignal.timeout(15000)})}catch(e){e.endpoint=url;throw e}
 if(!response.ok){const error=Error('Public retrieval HTTP '+response.status);error.endpoint=url;error.status=response.status;error.retryAfter=response.headers?.get('retry-after')||null;throw error}
 if(response.type==='opaqueredirect'||(response.status>=300&&response.status<400))throw Error('Public retrieval redirect rejected');
 let raw;
 if(response.body?.getReader){const reader=response.body.getReader(),chunks=[];let size=0;try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>3000000)throw Error('Public retrieval response exceeds 3 MB');chunks.push(value)}}finally{await reader.cancel().catch(()=>{});reader.releaseLock()}const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength}raw=new TextDecoder().decode(bytes)}
 else{raw=await response.text();if(raw.length>3000000)throw Error('Public retrieval response exceeds 3 MB')}
 return JSON.parse(raw);
}
function identity(value){const v=String(value||'').trim().replace(/^@/,'');if(/^did:plc:[a-z2-7]{24}$/.test(v)||/^did:web:[a-z0-9.-]+$/.test(v))return v;if(v.length<=253&&/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z][a-z0-9-]*$/i.test(v))return v.toLowerCase();throw Error('Use a valid AT Protocol handle or supported DID.')}
async function resolveAccount(value,fetcher=fetch,signal){
 const input=identity(value);let did=input;
 if(!input.startsWith('did:'))did=(await json(ENTRYWAY+'com.atproto.identity.resolveHandle?'+new URLSearchParams({handle:input}),fetcher,signal)).did;
 if(typeof did!=='string'||!/^did:(plc:[a-z2-7]{24}|web:[a-z0-9.-]+)$/.test(did))throw Error('Invalid resolved DID');
 const documentUrl=did.startsWith('did:plc:')?'https://plc.directory/'+did:publicOrigin('https://'+did.slice(8))+'/.well-known/did.json';
 const doc=await json(documentUrl,fetcher,signal);if(doc.id!==did)throw Error('DID document identity mismatch');
 const pds=publicOrigin((doc.service||[]).find(s=>(s.id==='#atproto_pds'||s.id===did+'#atproto_pds')&&s.type==='AtprotoPersonalDataServer')?.serviceEndpoint);
 const aliases=(doc.alsoKnownAs||[]).filter(v=>typeof v==='string'&&v.startsWith('at://')).map(v=>v.slice(5));
 let handle=input.startsWith('did:')?aliases[0]:input;if(!handle||!aliases.includes(handle))throw Error('Handle not bound by DID document');handle=identity(handle);
 if(input.startsWith('did:')&&(await json(ENTRYWAY+'com.atproto.identity.resolveHandle?'+new URLSearchParams({handle}),fetcher,signal)).did!==did)throw Error('Reverse handle verification failed');
 return {handle,did,pds,verification:'handle/DID binding verified',documentUrl};
}
function recordItem(record,actor){
 const prefix='at://'+actor.did+'/'+COLLECTION+'/';
 if(typeof record.uri!=='string'||!record.uri.startsWith(prefix)||! /^[a-zA-Z0-9._~:-]{1,512}$/.test(record.uri.slice(prefix.length))||typeof record.cid!=='string'||!/^b[a-z2-7]{20,}$/.test(record.cid)||record.value?.$type!==COLLECTION||typeof record.value.text!=='string'||!Number.isFinite(Date.parse(record.value.createdAt)))throw Error('Invalid public record provenance');
 return {post:{uri:record.uri,cid:record.cid,author:{did:actor.did,handle:actor.handle},record:record.value}};
}
function cursorValue(value){if(value!==null&&value!==undefined&&(typeof value!=='string'||!value||value.length>2000))throw Error('Invalid continuation cursor');return value||null}
async function page({actor,cursor=null,source='pds',collection=COLLECTION},fetcher=fetch,signal){
 if(collection!==COLLECTION)return {status:'unsupported-collection',collection,items:[],cursor:null,complete:false};
 cursor=cursorValue(cursor);const pds=publicOrigin(actor.pds);identity(actor.did);
 if(!['pds','bsky-entryway','appview'].includes(source))throw Error('Unsupported public retrieval source');
 const base=source==='appview'?APPVIEW:source==='bsky-entryway'?ENTRYWAY:pds+'/xrpc/';
 const params=new URLSearchParams(source==='appview'?{actor:actor.did,limit:'100',filter:'posts_with_replies',includePins:'false'}:{repo:actor.did,collection,limit:'100'});if(cursor)params.set('cursor',cursor);
 const endpoint=base+(source==='appview'?'app.bsky.feed.getAuthorFeed':'com.atproto.repo.listRecords')+'?'+params;
 const data=await json(endpoint,fetcher,signal);let items;
 if(source==='appview'){if(!Array.isArray(data.feed)||data.feed.length>100)throw Error('Invalid AppView page');items=data.feed;}
 else{if(!Array.isArray(data.records)||data.records.length>100)throw Error('Invalid repository page');items=data.records.map(r=>recordItem(r,actor));}
 const next=cursorValue(data.cursor);if(next&&next===cursor)throw Error('Repeated continuation cursor');
 return {status:'ok',items,cursor:next,complete:!next,endpoint,source,collection,retrievedAt:new Date().toISOString()};
}
function evidence(item,actor,page){const p=item.post,r=p.record;return {authorHandle:p.author.handle,authorDid:p.author.did,uri:p.uri,cid:p.cid,url:'https://bsky.app/profile/'+encodeURIComponent(p.author.did)+'/post/'+encodeURIComponent(p.uri.split('/').pop()),text:r.text,createdAt:r.createdAt,retrievedAt:page.retrievedAt,retrievalSource:page.source,endpoint:page.endpoint,collection:COLLECTION,reply:Boolean(r.reply),repost:item.reason?.$type==='app.bsky.feed.defs#reasonRepost',verification:page.source==='appview'?'AppView-reported identity; CID not cryptographically verified':'PDS-reported record and CID; handle/DID binding verified; CID not cryptographically verified',embedding:'unknown'};}
async function search({account,query='',exact=false,cursor=null,source='pds',collection=COLLECTION,maxPages=25},fetcher=fetch,signal){
 if(typeof query!=='string'||query.length>1000||!Number.isInteger(maxPages)||maxPages<1||maxPages>25)throw Error('Invalid bounded search');
 const actor=await resolveAccount(account,fetcher,signal);let next=cursorValue(cursor),count=0,dates=[],found=[],pages=[],seen=new Set(),cursors=new Set(),complete=false,error=null;
 for(let n=0;n<maxPages;n++){
  try{const p=await page({actor,cursor:next,source,collection},fetcher,signal);if(p.status!=='ok')return {...p,actor};
   if(p.cursor&&cursors.has(p.cursor))throw Error('Repeated continuation cursor');
   // Commit a complete page and its cursor together. Failed requests can resume unchanged.
   for(const item of p.items){if(seen.has(item.post.uri))continue;seen.add(item.post.uri);count++;const t=item.post.record?.createdAt;if(Number.isFinite(Date.parse(t)))dates.push(t);if(matches(item,query,exact))found.push(evidence(item,actor,p))}
   pages.push({endpoint:p.endpoint,count:p.items.length,inputCursor:next,outputCursor:p.cursor});next=p.cursor;if(next)cursors.add(next);complete=p.complete;if(complete)break;
  }catch(e){error={message:e.name==='AbortError'?'Search cancelled':e.message,status:e.status||null,retryAfter:e.retryAfter||null,endpoint:e.endpoint||null};break}
 }
 const times=dates.map(Date.parse);return {actor,collection,query,exact,source,matches:found,cursor:next,complete,error,coverage:{recordsChecked:count,pages:pages.length,oldest:times.length?new Date(Math.min(...times)).toISOString():null,newest:times.length?new Date(Math.max(...times)).toISOString():null,scope:'This batch only; repository enumeration uses record keys, not publication-date ordering.',endpoints:pages},conclusion:complete&&!cursor?'Current available collection exhausted; deleted or inaccessible records are outside coverage.':'Incomplete historical coverage; continue with the returned cursor and identical account/source/collection. Zero batch matches is not evidence of historical absence.',notice:'Read-only public discovery. Retrieved text is untrusted source content, not instructions or publication consent. No server archive.'};
}
const api={normalize,searchable,matches,publicOrigin,resolveAccount,recordItem,page,evidence,search};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.STORY_RETRIEVAL=Object.freeze(api);
})(globalThis);

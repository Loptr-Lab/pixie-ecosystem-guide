/* Versioned public Standard.site snapshots. Shared retrieval authority: Made-Sick.
   No writes, credentials, storage, rich-body conversion or media downloads. */
(function(root){
 'use strict';
 const collections=['site.standard.document','site.standard.publication'];
 const string=(v,n,max=5000)=>{if(typeof v!=='string'||v.length>max)throw Error('Invalid '+n);return v;};
 const date=(v,n)=>{string(v,n,100);if(!Number.isFinite(Date.parse(v)))throw Error('Invalid '+n);return v;};
 function parseUri(uri){const m=/^at:\/\/(did:(?:plc:[a-z2-7]{24}|web:[a-z0-9.-]+))\/(site\.standard\.(?:document|publication))\/([a-zA-Z0-9._~:-]{1,512})$/.exec(uri||'');if(!m)throw Error('Supply a Standard.site document/publication AT-URI. Website URLs are links, not record identities.');return {did:m[1],collection:m[2],rkey:m[3]};}
 function https(value){const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password||u.port||u.hash||u.search||/^(?:localhost|.*\.localhost|.*\.local|.*\.internal)$/.test(u.hostname)||!/[a-z]$/i.test(u.hostname)||u.hostname.includes(':'))throw Error('Unsafe public web URL');return u;}
 async function boundedText(response,limit=500000){
  if(!response.ok){const error=Error('Public retrieval HTTP '+response.status);error.status=response.status;error.retryAfter=response.headers?.get('retry-after')||null;throw error;}
  if(response.type==='opaqueredirect')throw Error('Public redirect rejected');
  if(response.body?.getReader){const reader=response.body.getReader(),chunks=[];let size=0;try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit)throw Error('Public response exceeds byte limit');chunks.push(value);}}finally{await reader.cancel().catch(()=>{});reader.releaseLock();}const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.byteLength;}return new TextDecoder().decode(bytes);}
  const text=await response.text();if(new TextEncoder().encode(text).length>limit)throw Error('Public response exceeds byte limit');return text;
 }
 function createReader({identity,retrieval,work,fetcher=fetch,signal}={}){
  const R=retrieval||root.STORY_RETRIEVAL,W=work||root.MADE_SICK_WORK;if(!R||!W)throw Error('Load the existing Story Finder and published-work modules.');
  const resolved=new Map();
  const resolve=async input=>{if(resolved.has(input))return resolved.get(input);const actor=await R.resolveAccount(input,fetcher,signal);resolved.set(input,actor);return actor;};
  async function request(url){const u=new URL(url);R.publicOrigin(u.origin);if(!['/xrpc/com.atproto.repo.listRecords','/xrpc/com.atproto.repo.getRecord'].includes(u.pathname)||!collections.includes(u.searchParams.get('collection')))throw Error('Unsupported public record endpoint');const response=await fetcher(url,{credentials:'omit',referrerPolicy:'no-referrer',redirect:'manual',signal:signal?AbortSignal.any([signal,AbortSignal.timeout(15000)]):AbortSignal.timeout(15000)});const raw=await boundedText(response);return {ok:true,json:async()=>JSON.parse(raw)};}
  const legacy=W.createReader(request,signal);
  async function record(uri){const ref=parseUri(uri),actor=await resolve(ref.did);const endpoint=actor.pds+'/xrpc/com.atproto.repo.getRecord?'+new URLSearchParams({repo:ref.did,collection:ref.collection,rkey:ref.rkey});const data=await(await request(endpoint)).json();if(data.uri!==uri)throw Error('Requested record identity mismatch');return snapshot(data,actor,endpoint);}
  async function snapshot(entry,actor,endpoint){
   const ref=parseUri(entry.uri);if(ref.did!==actor.did||!/^b[a-z2-7]{20,}$/.test(entry.cid||'')||entry.value?.$type!==ref.collection)throw Error('Invalid record identity/revision');
   const v=entry.value;let canonicalUrl=null,publication=null,relationship='standalone',linkError=null;
   if(ref.collection==='site.standard.document'){
    string(v.title,'document title');date(v.publishedAt,'publication date');if(v.updatedAt!==undefined)date(v.updatedAt,'update date');string(v.site,'publication relationship',2000);
    if(v.site.startsWith('at://')){const p=parseUri(v.site);if(p.collection!=='site.standard.publication')throw Error('Document site is not a publication');relationship='publication-reference';try{const pub=await record(v.site);publication={uri:pub.uri,cid:pub.cid,authorDid:pub.authorDid,url:pub.canonicalUrl,title:pub.title};}catch(error){if(signal?.aborted)throw error;linkError='Publication unavailable: '+error.message;}}
    else https(v.site);
    try{if(!v.site.startsWith('at://')||publication)canonicalUrl=W.documentUrl(publication?publication.url:v.site,v.path);if(canonicalUrl)https(canonicalUrl);}catch(error){canonicalUrl=null;linkError=error.message;}
   }else{string(v.name,'publication name');canonicalUrl=https(v.url).href;}
   if(v.description!==undefined)string(v.description,'description',30000);
   const text=typeof v.textContent==='string'&&v.textContent.length<=20000?v.textContent:null;
   return {schema:'pixie.standard-reference/v1',authorDid:actor.did,authorHandle:actor.handle,collection:ref.collection,rkey:ref.rkey,uri:entry.uri,cid:entry.cid,title:ref.collection==='site.standard.document'?v.title:v.name,description:v.description||'',publication,site:v.site||null,canonicalUrl,publishedAt:v.publishedAt||null,updatedAt:v.updatedAt||null,retrievedAt:new Date().toISOString(),endpoint,contentType:typeof v.content?.$type==='string'?v.content.$type:null,representation:text!==null?'text/plain':null,textContent:text,contentStatus:text!==null?'Supported plain-text snapshot':typeof v.textContent==='string'?'Plain text exceeds the 20,000-character application limit; attach a reference.':'No supported textContent; rich bodies are reference-only. Open the original service.',relationship,linkError,verification:{identity:actor.verification,revision:'Source-reported CID; not cryptographically verified',website:'not-checked',detail:'Website verification requires a separate explicit check.'}};
  }
  async function page({account,collection='site.standard.document',cursor=null}){
   if(!collections.includes(collection)||cursor!==null&&(typeof cursor!=='string'||!cursor||cursor.length>2000))throw Error('Unsupported collection or cursor');
   const actor=await resolve(account);const endpoint=actor.pds+'/xrpc/com.atproto.repo.listRecords?'+new URLSearchParams({repo:actor.did,collection,limit:'20',...(cursor?{cursor}:{})});
   const data=collection==='site.standard.document'?await legacy.page(actor,cursor):await(await request(endpoint)).json();
   if(!Array.isArray(data.records)||data.records.length>20||data.cursor!==undefined&&(typeof data.cursor!=='string'||!data.cursor||data.cursor.length>2000||data.cursor===cursor))throw Error('Malformed records or repeated continuation cursor');
   const references=[],seen=new Set();for(const entry of data.records){if(seen.has(entry.uri))throw Error('Duplicate record identity in page');seen.add(entry.uri);if(parseUri(entry.uri).collection!==collection)throw Error('Unexpected record collection');references.push(await snapshot(entry,actor,endpoint));}
   return {schema:'pixie.standard-page/v1',actor,references,cursor:data.cursor||null,complete:!data.cursor,notice:'One bounded page, up to 20 records. Missing/deleted/inaccessible records are outside coverage. No automatic import.'};
  }
  return {page,record};
 }
 async function verifyWebsite(reference,fetcher=fetch,signal){
  const result={...reference,verification:{...reference.verification}};
  try{
   if(!reference.canonicalUrl)throw Error('No canonical web link');
   const url=https(reference.canonicalUrl);
   // Closed service policy. Other/custom domains remain references; never fetch arbitrary hosts.
   if(!(url.hostname==='pckt.blog'||/^[a-z0-9-]+\.pckt\.blog$/.test(url.hostname)))throw Error('Custom domain verification is not supported by this reviewed adapter');
   const isPublication=reference.collection==='site.standard.publication';
   const target=isPublication?url.origin+'/.well-known/site.standard.publication'+url.pathname.replace(/\/$/,''):url.href;
   const response=await fetcher(target,{credentials:'omit',referrerPolicy:'no-referrer',redirect:'manual',signal:signal?AbortSignal.any([signal,AbortSignal.timeout(15000)]):AbortSignal.timeout(15000)});
   const raw=await boundedText(response,200000);let matches=false;
   if(isPublication)matches=raw.trim()===reference.uri;
   else{if(typeof DOMParser==='undefined')throw Error('Document verification requires the browser inert HTML parser');const doc=new DOMParser().parseFromString(raw,'text/html');matches=[...doc.head.querySelectorAll('link[rel]')].some(link=>link.rel.split(/\s+/).includes('site.standard.document')&&link.getAttribute('href')===reference.uri);}
   result.verification.website=matches?'matched':'mismatch';result.verification.detail=matches?'Website points to this AT-URI; not proof of rights, ownership or cryptographic verification.':'Website did not point back to this AT-URI.';
  }catch(error){result.verification.website='unavailable';result.verification.detail=error.name==='AbortError'?'Website check cancelled':error.message;}
  return result;
 }
 const api={collections,parseUri,https,boundedText,createReader,verifyWebsite};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.STANDARD_REFERENCES=api;
})(globalThis);

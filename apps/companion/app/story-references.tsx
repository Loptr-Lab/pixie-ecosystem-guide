'use client';
import {useEffect,useRef,useState} from 'react';
import {retrieval} from '../lib/story-discovery.mjs';
type Props={destination:string;disabled?:boolean;onReview:(result:string|null)=>void};
export default function StoryReferences({destination,disabled=false,onReview}:Props){
 const [account,setAccount]=useState(''),[query,setQuery]=useState(''),[source,setSource]=useState('pds');
 const [pages,setPages]=useState('1'),[result,setResult]=useState<any>(null),[selected,setSelected]=useState<string[]>([]);
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[reviewed,setReviewed]=useState(false);
 const controller=useRef<AbortController|null>(null),generation=useRef(0);
 useEffect(()=>()=>{generation.current++;controller.current?.abort();},[]);
 useEffect(()=>{setReviewed(false);onReview(null);},[destination,onReview]);
 function revoke(){setReviewed(false);onReview(null);}
 function reset(){generation.current++;controller.current?.abort();setBusy(false);setResult(null);setSelected([]);setError('');revoke();}
 async function search(continuing=false){
  revoke();setBusy(true);setError('');const epoch=++generation.current;
  const abort=new AbortController();controller.current=abort;
  try{
   const next=await retrieval.search({account,query,source,maxPages:Number(pages),...(continuing?{cursor:result.cursor}:{})},fetch,abort.signal);
   if(epoch!==generation.current)return;
   if(!Array.isArray(next.matches))throw Error('Provider did not return supported story records.');
   if(continuing){const matches=new Map(result.matches.map((m:any)=>[m.uri,m]));for(const m of next.matches)matches.set(m.uri,m);next.matches=[...matches.values()];}
   setResult(next);if(!continuing)setSelected([]);
   if(next.error)setError(next.error.message+(next.error.retryAfter?' · Retry after '+next.error.retryAfter+' seconds.':''));
  }catch(e){if(epoch===generation.current)setError(e instanceof Error?e.message:'Search failed. Nothing attached.');}
  finally{if(epoch===generation.current)setBusy(false);}
 }
 const chosen=result?.matches.filter((m:any)=>selected.includes(m.uri))||[];
 return <fieldset disabled={disabled} className="creator-card"><legend>Find public story references · optional</legend>
 <p>Search public records, inspect their source and choose what belongs in <strong>{destination}</strong>. Search text is untrusted evidence, separate from your notes and accepted story canon.</p>
 <label>Public account<input maxLength={253} value={account} onChange={e=>{reset();setAccount(e.target.value);}}/></label>
 <label>Story search words<input maxLength={1000} value={query} onChange={e=>{reset();setQuery(e.target.value);}}/></label>
 <label>Public retrieval source<select value={source} onChange={e=>{reset();setSource(e.target.value);}}><option value="pds">Account PDS · repository records</option><option value="bsky-entryway">Bluesky repository relay</option><option value="appview">AppView · indexed feed</option></select></label>
 <label>Maximum pages per batch<select value={pages} onChange={e=>{reset();setPages(e.target.value);}}><option value="1">1 page · up to 100 records</option><option value="5">5 pages · up to 500 records</option><option value="25">25 pages · up to 2,500 records</option></select></label>
 <button type="button" disabled={busy||!account.trim()} onClick={()=>void search()}>Search public stories</button>
 {busy&&<button type="button" onClick={()=>controller.current?.abort()}>Cancel story search</button>}
 <p role="status" aria-live="polite">{busy?'Searching public records…':result?`${result.coverage?.recordsChecked||0} records checked in the last batch; ${result.matches.length} results available. ${result.conclusion}`:'No search yet. No references attached.'}</p>
 {error&&<p role="alert">{error}</p>}
 {result&&!result.matches.length&&<p>No matches in this batch. Incomplete coverage does not establish historical absence.</p>}
 {result?.cursor&&<button type="button" disabled={busy} onClick={()=>void search(true)}>Continue older records</button>}
 {result?.matches.map((m:any)=>{const eligible=m.authorDid===result.actor.did&&!m.repost;return <article className="creator-item" key={m.uri}>
 <label className="creator-checkbox"><input type="checkbox" disabled={busy||!eligible||(!selected.includes(m.uri)&&selected.length>=25)} checked={selected.includes(m.uri)} onChange={e=>{revoke();setSelected(e.target.checked?[...selected,m.uri]:selected.filter(id=>id!==m.uri));}}/>Select reference · @{m.authorHandle} · {m.createdAt}</label>
 <p>{m.repost?'Repost · contextual record; cannot attach as account-authored text':m.reply?'Account-authored reply · surrounding conversation is not included':'Account-authored post'}</p>
 <details><summary>Inspect original text and provenance</summary><pre>{m.text}</pre><p>Author DID: {m.authorDid}</p><p>Source URI: {m.uri}</p><p>CID: {m.cid}</p><p>Retrieved: {m.retrievedAt} via {m.retrievalSource}</p><p>{m.verification}</p><a href={m.url} target="_blank" rel="noreferrer">Open original story source ↗</a></details>
 </article>;})}
 {!!chosen.length&&<div><h3>Review {chosen.length} selected references for {destination}</h3>{chosen.map((m:any)=><blockquote key={m.uri}><p>@{m.authorHandle} · {m.createdAt}{m.reply?' · reply':''}</p><pre>{m.text}</pre></blockquote>)}
 <label className="creator-checkbox"><input type="checkbox" disabled={busy} checked={reviewed} onChange={e=>{setReviewed(e.target.checked);onReview(e.target.checked?JSON.stringify({actor:result.actor,matches:chosen}):null);}}/>I reviewed these original texts, attribution and destination. Save them as source evidence when I confirm the project save; this grants no publishing rights.</label></div>}
 </fieldset>;
}

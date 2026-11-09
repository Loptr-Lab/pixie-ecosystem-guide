// Reviewed, byte-identical Made-Sick modules; no runtime code download.
import * as retrievalModule from '../public/shared/story-retrieval.js';
import * as ledgerModule from '../public/shared/story-ledger.js';
// Node ESM initializes the global; Vite interops the same UMD files as CommonJS.
export const retrieval=globalThis.STORY_RETRIEVAL||retrievalModule.default;
const ledger=globalThis.STORY_LEDGER||ledgerModule.default;
export function prepareStoryLedger(raw){
 const data=JSON.parse(raw);
 if(!data.actor||!Array.isArray(data.matches)||data.matches.length>2500)throw Error('Use an explicit reviewed story-search result.');
 const selectedAt=new Map(),items=data.matches.map(m=>{
  if(m.authorDid!==data.actor.did||m.collection!=='app.bsky.feed.post'||m.repost)throw Error('Only original account records are supported for this ledger draft.');
  selectedAt.set(m.uri,new Date().toISOString());
  return retrieval.recordItem({uri:m.uri,cid:m.cid,value:{$type:m.collection,text:m.text,createdAt:m.createdAt,...(m.reply?{reply:{}}:{})}},data.actor);
 });
 return {ledger:ledger.exportLedger({actor:data.actor,items,selectedAt}),status:'Prepared for explicit user export; not saved or published. Imported provenance is untrusted until rechecked against its public source.'};
}

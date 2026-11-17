import {createHash,timingSafeEqual} from 'node:crypto';

// These grants identify individual MCP connections, not people or workspace owners.
// Configuration holds hashes only; raw client credentials never belong in source.
export function readMcpClientHashes(raw='',ownerToken=''){
 if(!raw)return Object.freeze({});
 let entries;try{entries=JSON.parse(raw);}catch{throw Error('Invalid MCP client credential configuration.');}
 if(!entries||Array.isArray(entries)||typeof entries!=='object'||Object.keys(entries).length>100)throw Error('Invalid MCP client credential configuration.');
 const ownerHash=createHash('sha256').update(ownerToken).digest('hex');
 const seen=new Set(),result=Object.create(null);
 for(const [id,hash] of Object.entries(entries)){
  if(!/^[a-z0-9][a-z0-9._-]{0,63}$/i.test(id)||typeof hash!=='string'||!/^[a-f0-9]{64}$/i.test(hash))throw Error('Invalid MCP client credential configuration.');
  const normalized=hash.toLowerCase();
  if(normalized===ownerHash||seen.has(normalized))throw Error('MCP client credentials must be distinct.');
  seen.add(normalized);result[id]=normalized;
 }
 return Object.freeze(result);
}

export function identifyMcpClient(header,ownerToken,clients){
 if(typeof header!=='string'||!header.startsWith('Bearer '))return null;
 const token=header.slice(7);
 if(ownerToken.length>=32){
  const expected=Buffer.from(ownerToken),actual=Buffer.from(token);
  if(expected.length===actual.length&&timingSafeEqual(expected,actual))return {kind:'existing-machine'};
 }
 if(header.length>2048||!/^[A-Za-z0-9_-]{32,256}$/.test(token))return null;
 const hash=createHash('sha256').update(token).digest();
 for(const [id,expected] of Object.entries(clients)){
  if(timingSafeEqual(Buffer.from(expected,'hex'),hash))return {kind:'public-client',id};
 }
 return null;
}

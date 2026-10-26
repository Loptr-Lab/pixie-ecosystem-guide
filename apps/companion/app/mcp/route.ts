import { hasSiteIdentity } from '../../lib/site-access.mjs';
import { handleRpc } from '../../lib/companion.mjs';
export async function POST(request:Request){
 if(Number(request.headers.get('content-length')||0)>16000)return new Response('Request too large',{status:413});
 const raw=await request.text();
 if(raw.length>16000)return new Response('Request too large',{status:413});
 let body;try{body=JSON.parse(raw);}catch{return Response.json({jsonrpc:'2.0',id:null,error:{code:-32700,message:'Parse error'}},{status:400});}
 const result=await handleRpc(body,hasSiteIdentity(request.headers));
 if(result.body===null)return new Response(null,{status:result.status});
 return Response.json(result.body,{status:result.status,headers:{'Cache-Control':'no-store'}});
}
export function GET(){return new Response('Stateless MCP: use POST.',{status:405,headers:{Allow:'POST'}});}

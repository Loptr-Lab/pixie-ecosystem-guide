import { runTool } from '../../../lib/companion.mjs';
export async function POST(request:Request){
 const origin=request.headers.get('origin');
 if(origin&&origin!==new URL(request.url).origin)return Response.json({error:'Invalid origin'},{status:403});
 const raw=await request.text();if(raw.length>16000)return Response.json({error:'Request too large'},{status:413});
 try{const {name,args}=JSON.parse(raw);return Response.json(await runTool(name,args),{headers:{'Cache-Control':'no-store'}});}
 catch(e){return Response.json({error:e instanceof Error?e.message:'Invalid request'},{status:400});}
}

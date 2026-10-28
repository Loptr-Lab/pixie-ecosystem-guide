declare const __PIXIE_STATIC__: boolean;
export const staticCompanion = typeof __PIXIE_STATIC__ !== 'undefined' && __PIXIE_STATIC__;
export async function companionRequest(payload:{name:string;args:Record<string,unknown>}):Promise<Response>{
 if(!staticCompanion)return fetch('/api/companion',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
 try{
  const {runTool}=await import('./companion.mjs');
  return Response.json(await runTool(payload.name,payload.args));
 }catch(error){return Response.json({error:error instanceof Error?error.message:'Request unavailable.'},{status:400});}
}

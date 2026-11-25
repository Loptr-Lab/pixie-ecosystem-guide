// Owner-only read adapter. Never accept arbitrary URLs, headers, or methods.
export function createPrintfulReader({token=process.env.PRINTFUL_API_TOKEN,fetcher=globalThis.fetch}={}){
 return async function read(args){
  if(!token)throw Object.assign(Error('Printful is not configured.'),{status:503});
  if(!args||typeof args!=='object'||Array.isArray(args))throw Object.assign(Error('Invalid Printful request.'),{status:400});
  const {operation,id,offset=0}=args;
  const paths={scopes:'/v2/oauth-scopes',categories:'/v2/catalog-categories',catalog:'/v2/catalog-products',product:'/v2/catalog-products/'+id,variants:'/v2/catalog-products/'+id+'/catalog-variants',prices:'/v2/catalog-variants/'+id+'/prices',mockup_styles:'/v2/catalog-products/'+id+'/mockup-styles',store_products:'/store/products',store_product:'/store/products/'+id,files:'/files'};
  const requiresId=['product','variants','prices','mockup_styles','store_product'].includes(operation);
  const paged=['catalog','variants','store_products','files'].includes(operation);
  if(!Object.hasOwn(paths,operation)||Object.keys(args).some(k=>!['operation','id','offset'].includes(k))||(requiresId?!Number.isSafeInteger(id)||id<=0:id!==undefined)||!Number.isSafeInteger(offset)||offset<0||(!paged&&offset!==0))throw Object.assign(Error('Invalid Printful operation or parameters.'),{status:400});
  const url=new URL(paths[operation],'https://api.printful.com');
  if(paged){url.searchParams.set('limit','20');url.searchParams.set('offset',String(offset));}
  if(operation==='catalog')url.searchParams.set('selling_region_name','north_america');
  let response;
  try{response=await fetcher(url.href,{method:'GET',headers:{Authorization:'Bearer '+token,Accept:'application/json'},redirect:'error',signal:AbortSignal.timeout(10000)});}
  catch{throw Object.assign(Error('Printful connection unavailable.'),{status:502});}
  if(!response.ok)throw Object.assign(Error('Printful returned HTTP '+response.status+'.'),{status:502});
  try{return {operation,source:'Printful',retrievedAt:new Date().toISOString(),result:await response.json()};}
  catch{throw Object.assign(Error('Invalid Printful response.'),{status:502});}
 };
}
export async function ownerPrintfulRead({principal,ownerDid,verifyCsrf,read,loadArgs}){
 if(!principal)throw Object.assign(Error('Sign in required.'),{status:401});
 if(!ownerDid||principal.did!==ownerDid||principal.role!=='admin')throw Object.assign(Error('Administrator access required.'),{status:403});
 verifyCsrf();
 return read(await loadArgs());
}

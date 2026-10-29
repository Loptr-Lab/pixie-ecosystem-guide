import {createHash} from 'node:crypto';
import {providers} from './weaver-germ.mjs';
export function supportDraft(code){
 const allowed=new Set(['invitation_not_found','invitation_account_mismatch','issued_invitation_required','invitation_review_pending','invitation_approval_pending','named_person_verification_pending','confirmed_identity_mismatch','invitation_version_changed','owner_access_forbidden']);
 const state=allowed.has(code)?code:'private_service_unavailable',marker='weaver-support-'+createHash('sha256').update('pixie-weaver/v1:'+state).digest('hex').slice(0,12);
 const title='['+marker+'] Weaver technical state: '+state,body='Component: PIXIE Weaver response v1\nTechnical state: '+state+'\nCheck existing issues before creating a duplicate. Do not add DIDs, handles, invitation text, correspondence, evidence or tokens. Issue closure never approves or accepts an invitation.';
 return{body,searchUrl:'https://github.com/Loptr-Lab/duet-solo-hackathon/issues?q='+encodeURIComponent('is:issue in:title '+marker),draftUrl:'https://github.com/Loptr-Lab/duet-solo-hackathon/issues/new?title='+encodeURIComponent(title)+'&body='+encodeURIComponent(body)};
}
export function weaverRoutes({identity,service,provider=providers()}){
 return async function handle(request,response,json,readBody){
  if(!identity||!service){json(503,{error:'Private Weaver acceptance is not configured. No acceptance was saved.'});return;}
  try{
   const principal=await identity.current(request);if(!principal){json(401,{error:'Sign in through PIXIE to review your existing invitation.'});return;}
   const url=new URL(request.url,'http://localhost');
   if(request.headers.origin&&request.headers.origin!=='https://pixie-project-companion-production.up.railway.app')throw Object.assign(Error('Invalid Weaver origin.'),{statusCode:403});
   if(request.method==='POST'){identity.csrf(request,principal);if(!(String(request.headers['content-type']||'').split(';')[0].trim()==='application/json')){json(415,{error:'Use JSON.'});return;}}
   if(await provider.ownerAuthorized()!==true){json(409,{error:'Owner authorization remains pending.'});return;}
   if(url.pathname==='/api/weaver/owner'&&request.method==='POST'){json(200,await service.ownerStatus(principal.did));return;}
   if(url.pathname==='/api/weaver'&&request.method==='GET'){const view=await service.review(principal.did);json(200,{...view,csrf:principal.csrf,germEligible:view.receipt?!!(await provider.germ(principal.did)):false});return;}
   if(url.pathname==='/api/weaver/accept'&&request.method==='POST'){json(200,{receipt:await service.accept(principal.did,await readBody(request))});return;}
   if(url.pathname==='/api/weaver/germ'&&request.method==='POST'){const view=await service.review(principal.did);if(!view.receipt){json(409,{error:'acceptance_required'});return;}const link=await provider.germ(principal.did);json(link?200:409,link?{url:link,acceptanceUnchanged:true}:{error:'germ_handoff_unavailable',acceptanceUnchanged:true});return;}
   json(404,{error:'Not found'});
  }catch(e){const code=e.statusCode||e.status;json([400,401,403,404,409].includes(code)?code:503,{error:[400,401,403,404,409].includes(code)?e.message:'Private verification or storage unavailable. No new save is confirmed.',support:supportDraft(e.message)});}
 };
}

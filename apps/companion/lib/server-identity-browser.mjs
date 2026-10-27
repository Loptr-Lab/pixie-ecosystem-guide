// No owner/MCP key, OAuth access token or refresh token crosses this interface.
export async function serverIdentity(){
 const response=await fetch('/api/auth/session',{credentials:'same-origin',cache:'no-store'});
 if(response.status===404)return null; // Original Site/static preview keeps its existing SDK.
 if(!response.ok)throw Error('Atmosphere sign-in is unavailable. Reload to retry.');
 if(!String(response.headers.get('content-type')).includes('application/json'))return null;
 const initial=await response.json();if(initial.service!=='pixie-server-identity')return null;
 let current=initial;
 async function status(){const r=await fetch('/api/auth/session',{credentials:'same-origin',cache:'no-store'});if(!r.ok)throw Error('Identity session unavailable.');current=await r.json();return current.session?{session:current.session}:null;}
 async function post(action,payload={}){
  const r=await fetch('/api/auth/'+action,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-Pixie-CSRF':current.csrf||''},body:JSON.stringify(payload)});
  const value=await r.json();if(!r.ok)throw Error(value.error||'Identity request failed.');return value;
 }
 return {configured:initial.configured,status,async signIn(handle){if(!current.configured)throw Error('Atmosphere sign-in is unavailable.');await status();const value=await post('login',{handle});const url=new URL(value.url);if(url.protocol!=='https:')throw Error('Unsafe identity-provider redirect.');window.location.assign(url.href);},async signOut(){const value=await post('logout');try{localStorage.setItem('pixie.identity.logout',String(Date.now()));}catch{}window.dispatchEvent(new Event('pixie-identity-change'));await status();return value;}};
}

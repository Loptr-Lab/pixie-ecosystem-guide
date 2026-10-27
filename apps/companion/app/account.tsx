'use client';
import {useEffect,useRef,useState} from 'react';
import {identityConfiguration,siteIdentityOrigin} from '../lib/identity-origin.mjs';
import {serverIdentity} from '../lib/server-identity-browser.mjs';

type IdentityUI = {destroy:()=>void};
declare global {
 interface Window { PixieIdentity?: {mount:(element:HTMLElement,options?:Record<string,unknown>)=>IdentityUI}; }
}
const loads = new Map<string,Promise<void>>();
const publishedIdentity=identityConfiguration(siteIdentityOrigin)!;
function loadScript(src:string) {
 if (!loads.has(src)) loads.set(src,new Promise<void>((resolve,reject)=>{
  const script=document.createElement('script');script.src=src;script.async=true;
  script.onload=()=>resolve();script.onerror=()=>{loads.delete(src);script.remove();reject(new Error('Account tools could not load.'));};
  document.head.appendChild(script);
 }));
 return loads.get(src)!;
}
export default function Account(){
 const panel=useRef<HTMLDivElement>(null);const details=useRef<HTMLDetailsElement>(null);const [error,setError]=useState('');const [connected,setConnected]=useState(false);
 useEffect(()=>{
  let disposed=false,ui:IdentityUI|undefined,observer:MutationObserver|undefined;
  const open=()=>{if(window.location.hash==='#account'&&details.current)details.current.open=true;};open();
  window.addEventListener('hashchange',open);
  loadScript('./shared/atproto-account.js?v=1').then(()=>loadScript('./shared/atproto-sign-in.js?v=2')).then(async()=>{
   const serverAuth=await serverIdentity();
   if(!disposed&&panel.current){
    const config=identityConfiguration(window.location.origin)||publishedIdentity;
    panel.current.dataset.clientId=config.clientId;
    panel.current.dataset.redirectUri=config.redirectUri;
    ui=window.PixieIdentity?.mount(panel.current,{serverAuth});
    const form=panel.current.querySelector('form');
    if(form){observer=new MutationObserver(()=>setConnected(form.hidden));observer.observe(form,{attributes:true,attributeFilter:['hidden']});setConnected(form.hidden);}
   }
  }).catch(()=>{if(!disposed)setError('Account tools could not load. You can continue without signing in; reload to try again.');});
  const closeOutside=(event:PointerEvent)=>{if(details.current&&!details.current.contains(event.target as Node))details.current.open=false;};
  const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'&&!event.defaultPrevented&&details.current?.open&&!panel.current?.querySelector('[aria-expanded="true"]')){details.current.open=false;details.current.querySelector('summary')?.focus();}};
  document.addEventListener('pointerdown',closeOutside);document.addEventListener('keydown',escape);
  return()=>{disposed=true;observer?.disconnect();ui?.destroy();window.removeEventListener('hashchange',open);document.removeEventListener('pointerdown',closeOutside);document.removeEventListener('keydown',escape);};
 },[]);
 return <details id="account" className="account-menu" ref={details}>
  <summary>{connected?'Account':'Sign in'}</summary>
  <div className="account-panel"><h2>Your atmosphere account</h2>
  {error&&<p role="status">{error}</p>}
  <div id="companion-identity" ref={panel} data-client-id={publishedIdentity.clientId} data-redirect-uri={publishedIdentity.redirectUri} data-app-name="PIXIE Project Companion"/>
  <noscript><p>Sign-in needs JavaScript. Public resources and GitHub contribution paths remain available.</p></noscript>
  </div>
 </details>;
}

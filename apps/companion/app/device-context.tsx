'use client';
import {useEffect,useState} from 'react';
import {browserContext} from '../lib/browser-context.mjs';
export default function DeviceContext(){
 const [override,setOverride]=useState('');
 const [context,setContext]=useState<ReturnType<typeof browserContext>|null>(null);
 useEffect(()=>{
  const refresh=()=>{let zone='';try{zone=Intl.DateTimeFormat().resolvedOptions().timeZone;}catch{}setContext(browserContext(navigator,new Date(),zone,override));};
  refresh();const timer=window.setInterval(refresh,60000);window.addEventListener('focus',refresh);
  return()=>{window.clearInterval(timer);window.removeEventListener('focus',refresh);};
 },[override]);
 if(!context)return null;
 return <details className="onboarding device-context"><summary>Device and local time</summary><p>{context.device==='apple-touch'?'Apple touch device — likely iPad; model unconfirmed':context.device} · {context.source}</p><p>{context.localTime} · {context.timeZone}</p><label htmlFor="pixie-device">Correct the device for this session</label><select id="pixie-device" value={override} onChange={e=>setOverride(e.target.value)}><option value="">Use browser hints</option><option value="ipad">iPad / iPad Pro</option><option value="ios">iPhone</option><option value="android">Android</option><option value="mac">Mac</option><option value="windows">Windows</option><option value="unknown">Other / unknown</option></select><p>{context.guidance}</p><p className="note">{context.limits} These checks stay in this browser session; they are not sent to ChatGPT or included in public reports.</p></details>;
}

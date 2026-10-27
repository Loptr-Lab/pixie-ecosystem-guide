// Reuse the pinned server toolchain's proxy-aware transport, preserving CA/TLS trust.
import {createRequire} from 'node:module';
let transport;
let safeOAuthFetch;
// Reuse the SDK's locked Node safety adapter. Its dispatcher must stay paired
// with native fetch; replacing it with the toolchain proxy dispatcher disables
// its DNS/private-address and redirect-hop checks.
export function oauthFetch(input,options={}){
 if(!safeOAuthFetch)safeOAuthFetch=createOAuthFetch();
 return safeOAuthFetch(input,options);
}
export function createOAuthFetch(fetch=globalThis.fetch){
  const require=createRequire(import.meta.url);
  const sdk=createRequire(require.resolve('@atproto/oauth-client-node'));
  const resolver=createRequire(sdk.resolve('@atproto-labs/handle-resolver-node'));
  const {safeFetchWrap}=resolver('@atproto-labs/fetch-node');
  return safeFetchWrap({fetch,ssrfProtection:true,allowHttp:false,allowImplicitRedirect:true,timeout:10000,responseMaxSize:512*1024});
}
export async function serverFetch(url,options={}){
 if(!transport){const require=createRequire(import.meta.url);const tools=createRequire(require.resolve('wrangler'));const {fetch,EnvHttpProxyAgent}=tools('undici');transport={fetch,dispatcher:new EnvHttpProxyAgent()};}
 return transport.fetch(url,{...options,dispatcher:transport.dispatcher});
}

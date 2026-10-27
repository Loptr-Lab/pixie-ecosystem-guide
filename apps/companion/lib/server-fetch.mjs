// Reuse the pinned server toolchain's proxy-aware transport, preserving CA/TLS trust.
import {createRequire} from 'node:module';
let transport;
export async function serverFetch(url,options={}){
 if(!transport){const require=createRequire(import.meta.url);const tools=createRequire(require.resolve('wrangler'));const {fetch,EnvHttpProxyAgent}=tools('undici');transport={fetch,dispatcher:new EnvHttpProxyAgent()};}
 return transport.fetch(url,{...options,dispatcher:transport.dispatcher});
}

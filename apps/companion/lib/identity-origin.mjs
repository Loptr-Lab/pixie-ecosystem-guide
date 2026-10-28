// Exact reviewed origins only. Never derive an OAuth redirect from query/Host input.
export const siteIdentityOrigin = 'https://pixie-project-companion.ibloud-ivxx.chatgpt.site';
export const railwayIdentityOrigin = 'https://pixie-project-companion-production.up.railway.app';
export function identityConfiguration(origin) {
 if (origin !== siteIdentityOrigin && origin !== railwayIdentityOrigin) return null;
 return {
  clientId: origin + (origin === siteIdentityOrigin ? '/oauth-client-metadata.json' : '/oauth-client-metadata-railway.json'),
  redirectUri: origin + '/',
 };
}

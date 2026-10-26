/** Trusted identity headers are injected by Sites dispatch after its private-site access check.
 * This stateless app needs presence of a signed-in visitor, not a per-user storage key.
 * Never synthesize an ID from email or use email to access user-owned records.
 */
export function hasSiteIdentity(headers){
 return Boolean(headers.get('oai-authenticated-user-id')?.trim() || headers.get('oai-authenticated-user-email')?.trim());
}

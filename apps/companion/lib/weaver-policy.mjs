import crypto from 'node:crypto';
export const OWNER={handle:'ibloud.wsocial.eu',did:'did:plc:wa3u3bat5knu2hguqmq7siq4',pds:'https://pds.wsocial.network'};
export const ACCEPTANCE_NOTICE = 'Acceptance opens discussion of Weaver, differing interpretations, contributions and possible rights or obligations. It does not itself confirm disputed history, establish a relationship, transfer rights, waive rights, authorize publication or accept separate collaboration terms.';
function fail(code, status = 403) { const e = new Error(code); e.statusCode = status; throw e; }
export function invitationDigest(text) { return crypto.createHash('sha256').update(text).digest('hex'); }
export function validate(inv, did, version, ownerDid = OWNER.did) {
  if (!inv) fail('invitation_not_found', 404);
  if (inv.did !== did) fail('invitation_account_mismatch');
  if (inv.status !== 'invited') fail('issued_invitation_required');
  if (typeof inv.id !== 'string' || !inv.id || typeof inv.version !== 'string' || !inv.version || typeof inv.text !== 'string' || !inv.text.trim()) fail('invitation_review_pending', 409);
  if (version !== undefined && inv.version !== version) fail('invitation_version_changed', 409);
  if (inv.approval?.status !== 'approved' || inv.approval.by !== ownerDid || inv.approval.version !== inv.version || inv.approval.invitationDigest !== invitationDigest(inv.text)) fail('invitation_approval_pending', 409);
  const v = inv.verification;
  if (v?.status === 'mismatch') fail('confirmed_identity_mismatch');
  if (v?.status !== 'confirmed' || v.subjectDid !== did || v.reviewedBy !== ownerDid || !Number.isFinite(v.reviewedAt) || !Array.isArray(v.evidenceRefs) || !v.evidenceRefs.length || v.evidenceRefs.length > 20 || !v.evidenceRefs.every(x => typeof x === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(x))) fail('named_person_verification_pending', 409);
}
function acceptanceId(inv, did) { return crypto.createHash('sha256').update(JSON.stringify([inv.id, inv.version, did])).digest('hex'); }
function receipt(record) { return { invitationId: record.invitationId, version: record.version, acceptedAt: record.acceptedAt, recipientDid: record.recipientDid, noticeVersion: record.noticeVersion, invitationDigest: record.invitationDigest, status: 'accepted_to_discuss' }; }

export function createWeaverService({store,recipientDid,ownerDid=OWNER.did,now=Date.now}){
 if(!/^did:(plc:[a-z2-7]{24}|web:[A-Za-z0-9._%:-]+)$/.test(recipientDid||'')||recipientDid===ownerDid)throw Error('A separate Weaver recipient DID is required.');
 function eligible(inv,did,version){if(did!==recipientDid)fail('invitation_account_mismatch');validate(inv,did,version,ownerDid);}
 function present(inv,did,state){const record=state.acceptances[acceptanceId(inv,did)];if(record&&record.invitationDigest!==invitationDigest(inv.text))fail('invitation_version_changed',409);return{invitationId:inv.id,version:inv.version,text:inv.text,invitationDigest:invitationDigest(inv.text),notice:ACCEPTANCE_NOTICE,noticeVersion:'discuss-v1',receipt:record?receipt(record):null};}
 return{
  async review(did){return store.transaction(state=>{const inv=state.invitations[did];eligible(inv,did);return{write:false,value:present(inv,did,state)};});},
  async accept(did,body){return store.transaction(state=>{const inv=state.invitations[did];eligible(inv,did,body?.version);if(body?.action!=='accept_to_discuss'||body.noticeVersion!=='discuss-v1')fail('explicit_acceptance_required',400);if(body.invitationId!==inv.id||body.invitationDigest!==invitationDigest(inv.text)||body.version!==inv.version)fail('invitation_version_changed',409);const existing=present(inv,did,state).receipt;if(existing)return{write:false,value:existing};const record={recipientDid:did,invitationId:inv.id,version:inv.version,invitationDigest:invitationDigest(inv.text),noticeVersion:'discuss-v1',acceptedAt:now(),verificationEvidenceRefs:[...inv.verification.evidenceRefs]};state.acceptances[acceptanceId(inv,did)]=record;return{write:true,value:receipt(record)};});},
  async ownerStatus(actor){if(actor!==ownerDid)fail('owner_access_forbidden');return store.transaction(state=>{const inv=state.invitations[recipientDid];return{write:false,value:inv?{invitationId:inv.id,version:inv.version,issued:inv.status==='invited',verification:inv.verification?.status||'pending',receipt:state.acceptances[acceptanceId(inv,recipientDid)]?receipt(state.acceptances[acceptanceId(inv,recipientDid)]):null}:{status:'no_existing_invitation'}};});}
 };
}

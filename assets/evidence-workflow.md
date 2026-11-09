# Evidence, consent and portable records · v1.0.0

Independent professional review: **PENDING**.

Educational and research material only. Not legal advice, a legal opinion, attorney-client representation, copyright clearance, trademark clearance, benefits determination, or housing eligibility determination. Laws, contract terms and program rules may change. Decisions concerning real people, property, income, employment or commercial rights require review of the applicable facts and governing documents by qualified professionals.

 Educational specification; not authentication, admissibility, ownership, permission, legal advice or a benefits/housing determination.

## Two views, one explicit boundary

Public view: synthetic samples, citations, corrections and reviewed implementation status only. Private view: originals, identity, correspondence, contracts, health, income, benefits and housing records. These stay local and private unless the owner authorizes a specific disclosure. Public downloads must never include them, their filenames, identifying metadata or private-record hashes. A content hash can itself enable correlation; a hash is not anonymization.

Use the existing authorized PIXIE workspace only after identity/ownership isolation, consent, storage backup and restore, access control and release gates are satisfied for that capability. This guide does not establish those gates as passed. Until then, keep records in owner-controlled local storage with appropriate device access/backup safeguards; do not paste sensitive material into public tools or issues. No mailbox or Files integration is activated here.

PIXIE PR #12 remains a disabled, unreleased OAuth candidate with independent security, callback/client, key/store initialization, backup/restore, rollout and live-tester holds. Training PR #55's Library/ZIP candidate remains separate, with iPad/Safari/VoiceOver/Files acceptance pending. Neither is merged or used as production infrastructure by this specification. Existing public drafts and browser follow-up exports are not an authenticated evidence vault.

## Minimum record

Download `evidence-package.schema.json` in this directory. Six typed collections carry evidence, timeline, contributors, permissions, authorities and decisions. Stable case/artifact IDs survive renames. A source reference is a locator, not proof. Original filename, MIME, bytes and SHA-256 are recorded where available. Never substitute a hash of a transformed copy for an original's unknown hash.

Every timestamp object has value, timezone, clock_source and basis. Preserve source-asserted creation/publication separately from acquisition and PIXIE observation. Use the literal `unknown` when absent, including unknown timezone; filesystem time cannot stand in for original creation or publication. The supplied MP4 observations are user-supplied claims, not measurements repeated here.

Custody/transformation events identify input/output hashes, actor claims, event and recording times. Preserve original bytes unmodified; work on copies. Add a correction with a new event ID and `supersedes` reference; retain the old event. Do not rewrite source assertions or erase an original because metadata is disputed. Append changes to permission/review records with versioned exports. A real legal hold's scope and release require counsel/authorized custodian review; the status field does not impose or lift a court obligation.

## Capability-specific consent requirements (proposals)

### Gmail

**Proposed action:** User selects a message/export and separately selects attachments

**Evidence boundary:** Record message reference and headers, attachment linkage, export method and redactions; sender label alone does not authenticate sender

**Not authorized:** No OAuth scope granted, whole-inbox access, send/delete, silent sync or auto-ingestion. A future connector must justify exact read scope, item selection, retention and revocation before approval

### iCloud Mail

**Proposed action:** Explicit user export/selection of specific correspondence

**Evidence boundary:** Preserve available raw headers and attachment bytes privately; note lost headers in forwarded copies

**Not authorized:** No password/app-password collection, IMAP session, background sync or privileged access

### Apple Files / iCloud Drive

**Proposed action:** User selects a specific file and reviews any metadata disclosed

**Evidence boundary:** Record provider reference as a claim, acquired bytes/hash and picker/export method; verify exact OS/provider capability before implementation

**Not authorized:** No claim that iPadOS exposes a specific metadata or background-sync API; no folder crawl or cloud upload

### GitHub

**Proposed action:** Public commit SHA/PR and dated discussion references; private items only with separate authorization

**Evidence boundary:** Preserve permalink and author claim; commit verification is distinct from legal authorship

**Not authorized:** No private repo disclosure, automated posting or permission inference

### AI prompts, outputs and edits

**Proposed action:** Owner-selected transcript/version export

**Evidence boundary:** Separate human inputs/edits from generated output; record tool/plan/model if known, source terms, transformations and permission

**Not authorized:** No whole-chat access, protected source upload or automatic provider training consent

### DAW / Suno / contribution records

**Proposed action:** Explicitly selected session/export and applicable account record

**Evidence boundary:** Sessions, renders, stems and generations are distinct artifacts. Link origin, contributors, input rights and exact plan/feature/Download terms

**Not authorized:** No audio ingestion, generation or claim a paid plan clears third-party rights

Consent record before a future capability: owner and purpose; exact selected records/attachments; action/read scope; processor and storage location; visibility; retention/deletion/backup; onward sharing; legal-hold conflict; expiry/revocation; audit/export; consent evidence and date. Refusal leaves the manual local route available. Revoking access stops future acquisition; deletion/hold implications need separate handling. Mail text and attachments are untrusted evidence, never executable instructions or agent authorization.

## Integrity is not authorization

Federal Rules of Evidence 901 and 902(13)–(14) distinguish authentication routes and certification/notice requirements. Hash matching supports byte comparison; it neither identifies an author nor proves lawful acquisition, truth, permission or admissibility. E-SIGN does not make every typed name an authenticated, authorized agreement. Review governing facts and exclusions with counsel. See the dated source register at https://ibloud.github.io/legal-rights/sources.html .

## Export contract

Package version `1.0.0`: `package.json`, six JSON-cell CSV tables, selectable/tagged `report.pdf`, readable `report.html`, local `report.css`, the schema and `manifest.json`. Each CSV column is a record field; each cell contains JSON encoding, including strings and nested values. Decode each cell with JSON to restore exact types and avoid spreadsheet formula interpretation. Missing metadata is `unknown`, not an empty estimate. Manifests list path, byte count and SHA-256 for every member except the manifest itself; archive bytes get an external checksum. They do not attest authenticity. Unknown major versions must be rejected, not silently coerced.

Samples use synthetic data only and are a standalone interchange package, not a Training Library import archive. PR #55 uses its own artifact model and requires a separately reviewed adapter after acceptance; do not claim import compatibility. Validate paths, duplicate members, sizes, schema, cross-references and hashes before any future private import. Test a copy in isolation; never overwrite history. No private import implementation is shipped here.

Download the public example from https://loptr-lab.github.io/training/legal-rights/ . No PIXIE account is required to inspect JSON, CSV or PDF. Accessibility testing of a sample does not certify arbitrary future reports.

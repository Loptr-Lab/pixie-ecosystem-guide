# One canonical Companion — coordinated cutover, owner direction 27 October 2026

The sole intended Companion application instance is the **existing Railway**
service: https://pixie-project-companion-production.up.railway.app/.
The guide is informational navigation; Creator OS is the specialized creative
workspace; a ChatGPT connection is a client, not another application instance.
The old ChatGPT Site is a migration source to retire after acceptance and explicit
owner approval. Keeping two independently writable public Companions is not the
finished state. This source amendment does not execute a cutover or retire anything.

## Current observed release and candidate

Railway readback on 27 October: deployment `9dd33fcd-7361-4231-944d-79e4374cd93b`,
source `fbd7d3fadbcca4fdf0f92d4713249d84d4d7babd`, SUCCESS. PR #5 candidate
parent is `5fe4f0c680546444a455435a7b4d4fbdb93d7e66` (84-test source-check
correction). The helper/navigation amendment is reviewed on top of that parent.
Re-read the actual service before release; these are dated observations, not a
future pin or deployment authorization. Existing /data volume is in US East;
do not apply the unrelated staged region/replica patch. Owner supplied the explicit
“Auto deploy is disabled” / Enable source state; Wait for CI alone is insufficient.

## Dependency inventory and prepared navigation

| Surface / dependency | Source evidence and disposition |
| --- | --- |
| Companion helper | app/pixie-helper.tsx and lib/pixie-guide.mjs; one persistent menu, conditional restore, canonical Railway enquiry link. Footer content moves into that menu |
| Public guide | root index.html and assets/make-room-for-the-work.html/.pdf; ordinary navigation targets Railway. The root build still produces only the guide, not another backend |
| Creator OS | PR #62 registry/My PIXIE already point to Railway; this amendment corrects the two remaining Network Intelligence enquiry routes in network-intelligence.js. No origin checks are broadened |
| Original Site OAuth identity | lib/identity-origin.mjs, public/oauth-client-metadata.json and shared atproto-sign-in.js preserve the Site client ID and exact Site callback origin. Retained migration dependency, not navigation. Do not rewrite or invalidate in this source cutover |
| Railway OAuth identity | separate existing oauth-client-metadata-railway.json and server identity implementation; origin-specific client/callback tested independently. Existing accounts retain their DID, but browser sessions do not cross origins |
| Original Site MCP | Site /mcp, app/mcp/route.ts and lib/site-access.mjs use host-injected identity headers; installed connection's endpoint migration is NOT verified. Recovered adapters/tests retained until replacement client acceptance and retirement approval |
| Railway MCP | server.mjs /mcp requires the separate machine bearer. It rejects spoofed Site headers and unscoped private workspace access. Do not paste a token into browser/UI or simply replace the installed endpoint. Private client access needs an explicitly reviewed principal-grant design; none is enabled here |
| Site browser records | recovered workspace-browser.mjs uses origin-local IndexedDB pixie-creator-workspace/records/workspace; follow-up/task drafts may be in-tab or exported files. Inspect the actual user's Site storage/export before retirement. Recovered routes do not establish that every live Site record has been inventoried |
| Railway private records | existing mounted volume, server-selected hashed DID workspace files, encrypted identity file, possible unowned legacy workspace and lock files. Verify actual PIXIE_DATA_FILE and adjacent persistent artifacts privately; do not assume the sample path or workspace.json is the only file |
| OAuth/browser secrets | origin-local sessions are not a transferable workspace backup. Never put OAuth tokens, identity secrets, machine credentials, private records or decryption keys into GitHub/checkpoints |
| Source recovery/history | source-recovery.json, original Site adapter tests and dated hosting records are provenance, not evidence of ongoing dual-runtime authorization. Preserve history; do not delete assets to hide dependencies |

No live Site login/retrieval was attempted. No account/record/session sync is
inferred. Remaining Site URLs in auth metadata, origin allowlists, tests, dated
hosting records and this inventory are intentional migration dependencies.

## Exact cutover gates (maintainer executes only after separate approval)

1. **Freeze source and release evidence:** record PR #5 and Creator #62 SHA, current
   service/deployment, region/volume, active client/tool endpoints and autodeploy
   state. Keep existing release and backup rules below. A static/protected preview
   is not the authenticated production workspace or another canonical instance.
2. **Verified backup:** back up all identified Railway persistence through an
   approved private owner-controlled route; encrypt cloud copies, keep keys
   separate, record a manifest/integrity hashes and prove isolated restoration.
   This backup remains unverified in current evidence; no private transfer is
   performed here. Inventory/export Site browser and any other live persistence
   separately. Absence from recovered source is not absence of live data.
3. **Explicit transfer if required:** identify whose data each Site export contains;
   have that owner review its contents and destination DID. Existing validated
   workspace_import supports reject-conflicts/copy-conflicts; compare project,
   task, source and handoff IDs/counts/content before and after an isolated restore,
   then the approved import. Verify A/B separation and source provenance. Leave
   unowned legacy data untouched until ownership is explicitly resolved. No first-
   login assignment, copying cookies/tokens, or automatic cross-origin import.
4. **Browser acceptance:** approve compatible source at the existing Railway service
   and fixed Creator URL, then test one Atmosphere sign-in per account, callbacks,
   private save/reopen, consent-bound Creator handoff, logout/switching, source-
   failure recovery and approved restart persistence. Physical iPad Safari,
   VoiceOver, keyboard, Files and safe-area checks need recorded live acceptance.
5. **ChatGPT client dependency:** inventory the installed connection separately.
   Verify public tool calls on Railway with the authorized client auth mechanism;
   preserve the current endpoint until the owner separately approves its update.
   Prove unauthorized/private A/B denial and document unsupported private MCP
   operations. No public installation URL or automatic context transfer is claimed.
6. **Coordinated navigation:** review/publish the prepared guide, ebook, Companion
   and Creator routes together under their existing PRs. Static links cannot move
   sessions or data. This source work does not publish those changes.
7. **Retirement after acceptance:** obtain explicit owner approval. If the old host
   supports a route-preserving redirect, verify it; otherwise use a clear moved
   notice to the canonical Railway app. Preserve reviewed exports/archives. Verify
   callbacks and installed clients no longer depend on the Site before removing
   its active writable runtime and obsolete integrations. Do not delete the Site
   first or claim redirect support without checking it.
8. **Final proof:** ordinary entry paths reach one Railway Companion, private
   records remain isolated and durable, and the old host has no independently
   writable application. Until that evidence exists, consolidation is incomplete.

## Evidence already available and still missing

Source-check baseline: 84 tests, typecheck/build, independent guide build and
synthetic browser/isolation/handoff checks passed at 5fe4f0c. Creator source at
4ff005f passed its 62-case CI and user confirmed My Apps add/launch/persistence/
remove. These are not verified backups, Site export/transfer, installed-client
migration, physical iPad acceptance or retirement evidence. Re-run the affected
checks for the new helper/navigation candidate and record its exact SHA in PR #5.

---

# Existing Companion Railway deployment

This config starts the existing `apps/companion/server.mjs`; it does not create a
service, app or repository. Apply it only to the verified existing Companion
service, never to the guide or iCloud mail service. PR #5 stays unmerged. Keep the
existing ChatGPT Site, domains, installed plugin and Tangled unchanged.

## Verified source and preview

Source repository: `Loptr-Lab/pixie-ecosystem-guide`, branch `creator-workspace`.
Fetched reading-preferences commit: `6f9e9f2909e1e284329d185100d97de8902ad8b2`.
It removes global DeviceContext and nests its sole instance in My projects →
Reading preferences. Browser acceptance checks location and visibility on other
views. Later deployment-preparation commits preserve this change.

The existing Vercel project's GitHub integration reports Ready for that commit:
https://vercel.com/niquedevereaux-6363/pixie-ecosystem-guide-preview/2YpkPtnaVkpuy6enSUnDT4LoWETh

Existing preview URL:
https://pixie-ecosystem-guide-preview-git-cr-599794-niquedevereaux-6363.vercel.app

Direct verification from this environment is blocked by the egress proxy:
`curl: (56) CONNECT tunnel failed, response 403`. That is a proxy denial, not an
observed HTTP response from Vercel. GitHub CI tests/typecheck/build passed at the
reading-preferences commit. The preview is static: IndexedDB stays local to that
browser/origin. It does not host MCP or share server projects. Do not point its
browser bundle at private Railway storage or place an owner token in build variables.

## Existing-service configuration to apply after authenticated access

1. Verify the actual Railway project, service and environment IDs and their current
   GitHub source, root directory, build/start settings, domains, volume and deployment
   hooks. Record the current successful deployment ID and take a volume backup.
   No Railway service identity is established by the repository alone.
2. On that service only, use existing repository and `creator-workspace`, root
   directory `/apps/companion`, config file `/apps/companion/railway.json`.
   Railpack should detect the pinned pnpm version/lockfile. Install with frozen
   lockfile and retained supply-chain policy, explicitly including build dependencies
   (`corepack pnpm install --frozen-lockfile --prod=false`); build
   `corepack pnpm run build`. Keep these dependencies in the runtime too: the
   existing proxy-aware fetch adapter uses the locked Wrangler/Undici installation.
   Do not prune dev dependencies without first replacing that adapter. Do not relax
   policy or regenerate dependencies to make a build pass. Set
   `RAILPACK_NODE_VERSION=22` and require Node >=22.19.0 in build/runtime logs. Verify the build logs before proceeding.
3. Use the service's existing persistent volume, mounted at `/data`, or attach one
   to this existing service if none exists. Never detach/format/replace a volume
   containing work. Railway must supply `RAILWAY_VOLUME_MOUNT_PATH`. Set
   `PIXIE_DATA_FILE=/data/private/workspace.json`; do not set fake mount variables
   to make an ephemeral directory look persistent. Take a backup before imports.
4. Privately configure `NODE_ENV=production`, `PIXIE_LOCAL_OWNER=0` and a random
   `PIXIE_MCP_TOKEN` of at least 32 characters. Do not send the token in chat,
   URLs, screenshots, PRs or logs. It is now exclusively a machine MCP credential.
   Configure a separate, privately generated `PIXIE_SESSION_SECRET` as described in
   [Atmosphere identity and isolated storage](../README.md#atmosphere-identity-and-isolated-project-storage).
   `PIXIE_OWNER_DID` is optional admin metadata, not a restriction on supported sign-ins.
   No model key is required to run the workspace. No deployed settings are changed
   by this source review; do not apply these settings or unpin production implicitly.
   See `production.env.example` for the non-secret variable list.
5. Start `node scripts/start-production.mjs`. It checks auth configuration,
   writable mounted storage and saved JSON validity before listening on
   `0.0.0.0:$PORT`. Missing volume/auth or corrupt saved data fails startup.
   `/ready` returns 200 only if the saved state validates and a private write probe
   succeeds; otherwise 503 without paths or content. Railway health-check path is
   `/ready`, timeout 120 seconds, one replica, bounded on-failure restarts.
6. Use the existing Railway-generated HTTPS domain. Railway terminates TLS at its
   edge. Verify HTTPS and plain-HTTP redirect before entering any credentials.
   Do not switch custom domains or publish a private service over plain HTTP.
   No public access to projects is permitted: UI loads publicly but workspace API
   requires a verified Atmosphere session for that specific DID. A machine MCP
   bearer never grants unscoped access to user workspaces. The browser has no
   connection-key form and never uses `PIXIE_MCP_TOKEN`. Per-DID project files
   live under a server-derived hashed path on the same private volume. Readiness/health return
   only service availability, never project records.

Private JSON and encrypted identity writes use atomic replacement and an exclusive
per-file lock across Node processes. Keep exactly one replica in the existing
volume's region. Contention returns a failure without claiming a save; crashes
can leave a lock requiring operator review. Stop writers, back up/validate the
files and verify no active writer before removing a confirmed stale lock under
separate approval. Never automatically break locks or reset private storage.
See the [corrective review](../README.md#corrective-security-review).

Historical rollback reference (superseded; do not treat as current production): `9e83676856e38f1f34a17ce5bf44fe631b8d2f15`, deployment
`96f284b4-a179-4421-81cc-62ba849f7743`. Preserve this rollback reference and the
existing volume in `us-east4-eqdc4a`. Do not apply either pending region/replica
change. Candidate code review does not authorize unpinning, changing secrets or
restarting the service. No workspace-schema migration is introduced.

## Existing contributor acceptance workflow

Use the already established [PIXIE contributor procedure](https://github.com/Loptr-Lab/training/blob/review/pixie-contributor-focus-2026-10-27/docs/pixie-contributors.md#pixie-private-workspace-acceptance--proposed-contributor-test) in Training PR #48. Contributors verify one Atmosphere sign-in, synthetic create/save/reopen, sign-out, accessibility and safe defect reporting; they do not handle Railway secrets, production backups, MCP access or real participant data. The maintainer must first verify encrypted volume backup and isolated recovery before releasing a candidate URL. The reviewed multi-account authorization tests remain a maintainer release gate. Preserve existing GitHub issue-based contribution and checkpoint flow; do not add a parallel onboarding process.

## Required live verification before acceptance

Use the actual existing HTTPS URL, obtained from authenticated Railway service
state, not a guessed domain. Record timestamp, commit SHA and deployment ID:

- `GET /` → 200; browser shows device/time only inside reading preferences.
- `GET /ready` → 200; `/health` → 200, no private content.
- Unauthenticated `POST /api/workspace` and `POST /mcp` → 401.
- Cross-origin workspace requests → 403; forged Sites identity headers do not
  replace verified per-user authorization. Public `/api/companion` cannot read the workspace.
- Complete the one existing Atmosphere sign-in independently with two synthetic test identities.
  Verify another DID cannot open private records. Do not enter a bearer key in the browser.
  Create a disposable synthetic project with a unique label; record its ID.
- MCP machine bearer does not grant access to either person's private workspace;
  authorization must be explicitly principal-scoped before machine workspace tools
  are enabled. Inspect static assets/network failures for private data leaks.
- Restart the **same existing service** once after a backup; then verify readiness
  and retrieve both test projects through their respective accounts. Verify the same volume is
  attached. Test a redeploy as well before claiming durable migration acceptance.
- Remove only the disposable project with explicit ID confirmation. Preserve
  existing work. Log status codes/IDs or redacted evidence, never keys or content.

Local synthetic production tests perform auth rejection, per-user separation,
blocked unscoped MCP access, full server restart recovery, protected-file rejection and corrupt-state
readiness failure. They do not prove Railway volume persistence or remote TLS.

## Rollback and remaining access blocker

Before changes, retain deployment IDs/settings and a separately protected volume
backup. Roll back to a prior known-safe deployment on the same service with the
same volume; do not delete the volume or downgrade into an incompatible schema.
This release uses the existing workspace schema. If readiness fails, stop and
repair/restore a reviewed backup; never replace saved data with an empty workspace.
The old ChatGPT Site is a temporary migration source, not a permanent second Companion. Keep it intact until the cutover gates below pass and the owner explicitly authorizes retirement.

Current Railway service and volume must be checked against connected Railway state before any deployment; do not assume this documentation is live proof of the candidate revision. Never apply unrelated staged configuration changes.

## Weaver scope — review code, 29 October 2026

Railway read-only inspection identified existing project patient-respect, production environment and pixie-project-companion service, with the pixie-companion-workspace volume mounted at /data (single replica). Its current successful deployment is ce0202ae6d7cc12b843c7a4a92f69ba35da0125b. Source creator-workspace is newer. Existing staged region configuration is unrelated and was left untouched; no accept-deploy or variable mutation was performed.

Variable names present: HOST, NODE_ENV, PIXIE_DATA_FILE, PIXIE_LOCAL_OWNER, PIXIE_MCP_TOKEN, PIXIE_SESSION_SECRET. Values were not retrieved. Proposed optional setting is **PIXIE_WEAVER_RECIPIENT_DID=did:plc:c23lgmpk664gb47ygj7z7l6a**. The public handle renmakesmusic.bsky.social and reverse PLC document matched on 29 October 2026. This routes one invitation recipient; it does not issue an invitation, verify a named person, approve terms, record acceptance or grant administrator rights. Never use the recipient as PIXIE_OWNER_DID. Public provenance: https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=renmakesmusic.bsky.social and https://plc.directory/did:plc:c23lgmpk664gb47ygj7z7l6a .

The owner requested this project-specific exception to general open recruitment. Existing public Companion recruitment, other DID workspaces, original Site identity/migration and machine MCP boundaries remain unchanged. Weaver follows its issued-invitation contract in Loptr-Lab/duet-solo-hackathon PR #105, with one existing server OAuth sign-in. The public Weaver page only navigates to `/?weaver=1#weaver`; it transfers no cookie/token or private invitation data. The existing OAuth login returns to that allowlisted view, with no arbitrary redirect or second connection key.

New private Weaver records are a separate encrypted weaver.enc file beside PIXIE_DATA_FILE on the same verified volume. A purpose-bound AES-GCM key is derived from the existing PIXIE_SESSION_SECRET; no new credential, service, database or dependency is introduced. OS-visible locking, fsync, atomic rename and an immutable acceptance key preserve durability/idempotence. Neither private invitations nor evidence refs enter creator exports, browser storage, public PDS records or machine-MCP authority. Configuring a recipient does not create a record: only pre-existing privately approved/versioned invitations with separate confirmed review evidence are eligible. No issuing/evidence editing endpoint is provided and no real record was prepared or changed.

Owner authorization is a separate current binding for ibloud.wsocial.eu (did:plc:wa3u3bat5knu2hguqmq7siq4), checked before privileged Weaver operations. A matching OAuth DID alone does not approve or accept. W Identity is unsupported/disabled. Germ remains the documented optional person-controlled handoff after durable acceptance; missing/failed permissions show no actionable destination and never change acceptance. The owner declaration remains unverified after HTTP 403 in the earlier environment check.

Before release: review and back up existing volume/identity artifacts privately, review the companion and Weaver commits, configure the recipient only in the intended service after approval, verify existing invitation/evidence privately, and complete real-account and physical-device acceptance. No source-only test authorizes accepting the pending Railway patch or publishing. Static Vercel previews explicitly lack backend identity/storage and cannot simulate a real acceptance.

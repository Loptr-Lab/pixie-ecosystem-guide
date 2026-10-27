# PIXIE Project Companion — independent source review

This is the recovered Companion application module inside the existing PIXIE
guide repository. It is executable source, not a replacement guide or a released
hosting migration. The guide's root application, build and Pages workflow remain
separate and unchanged. Existing ChatGPT Site/App/plugin identities remain live.

## Source and ownership

Owner direction on 26 October 2026 selected this repository, subject to preserving
the guide, as the preferred existing GitHub home. This review module was recovered
from local reconciled source `ee595556dfd352fdcb6342ea5de20b6688f79ff8`.
That history retains Sites v17 `73ef3b57` and Tangled's `2214950e` / `90287b0d`.
`source-recovery.json` distinguishes preserved, adapted and new files by hash.
No private Site bindings, credentials, caches, unrelated starter components or
private participant records were imported. The original checkouts and archives
are retained. No new license or rights transfer is implied by source availability.

The task contract and independent Node runner are new implementation. Shared
project/resource operations, contributor checkpoints, identity UI, styles and
mirror safeguards are recovered and extended, rather than recreated. Retained
`app/api/companion` and `app/mcp` files document the original Sites adapters;
`server.mjs` supplies the independent HTTP adapters. Neither trusts the other's
authentication mechanism implicitly.

## Build and run outside Sites

Requires Node >=22.13 and the pinned pnpm version in package.json.

```sh
cd apps/companion
pnpm install --frozen-lockfile
pnpm test
pnpm run typecheck
pnpm run build
pnpm start
```

The runner defaults to `127.0.0.1:4173`. `HOST` and `PORT` select an explicitly
approved deployment's bind address; changing them does not provision or deploy a
service. The existing Vite build writes `tangled-site/`, ignored generated output.
The guide's root build does not copy or publish this module.

Frozen installation succeeded using the verified local pnpm cache after restoring
`pnpm-workspace.yaml`, which was omitted from recovery. Locked package versions
and the supply-chain policy were preserved. This is not evidence of a fresh
network installation on another machine.

## Persistent creator workspace

My projects supports creating, selecting, editing, archiving and restoring projects;
purpose, outcome, state and next action; tasks with progress, blockers and completion
evidence; creator notes; sources with separately labelled supplied excerpts and
retrieval results; and editable, downloadable handoffs. Backup import validates the
whole file before saving and never overwrites existing project IDs. Conflicts can
be imported explicitly as distinct copies. Export before changing hosting origins.
Unsaved edits are excluded from exports and warned about when switching projects.

The independent runner stores this private workspace in `.pixie-data/workspace.json`
(or `PIXIE_DATA_FILE`) with atomic writes and owner-only permissions. UI and
`workspace_*` MCP tools use the same service and store. Back up the data file along
with exports; Git does not back it up. Loopback development permits the local
owner. Production browser access requires a server-verified Atmosphere session
for the explicitly configured owner DID. The machine bearer key works only on
MCP, never on browser workspace requests. Production requires HTTPS and
`NODE_ENV=production`. This is a single-owner store, not multi-user isolation.

A static-only web preview instead uses that browser/origin's IndexedDB, explicitly
labelled in the interface. It survives reloads and normal browser restarts but not
browser-data deletion. It does not share data with the independent MCP, other
origins or other devices. Private browsing can discard it. No synchronization is
active. Exports contain project content, not connection keys.

Conversation is enabled only when the independent server has all three private
settings: `PIXIE_MODEL_URL` (HTTPS OpenAI-compatible chat-completions endpoint),
`PIXIE_MODEL_API_KEY`, and `PIXIE_MODEL_NAME`. The user explicitly consents before
sending selected-project context. Bounded recent notes, excerpts, tasks and messages
are sent to that provider; other projects and credentials are excluded. Answers
are labelled AI suggestions, execute no actions, and do not become verified facts.
No provider is configured in this checkpoint: the interface reports unavailable
and saves no fabricated reply. Live provider acceptance remains outstanding.
Public-source checks currently support public GitHub text files; unsupported or
failed checks remain visible as failures beside the retained supplied source.

## HTTP and MCP boundaries

- `/`: independent browser workspace. Find help, Project work and Task stewardship
  share the existing service functions. Browser-static mode executes validated
  read/draft operations locally; external public-source reads still require
  provider availability and CORS. No private database or automatic posting.
- `POST /api/companion`: same supported read/draft operations, same-origin browser
  checks, bounded request body and no server task persistence.
- `POST /mcp`: shared `handleRpc`/`runTool` operations with independent bearer
  authentication. Configure `PIXIE_MCP_TOKEN` privately with at least 32 characters;
  never commit or embed it in browser code. Without it MCP fails closed with 503;
  invalid credentials return 401. Fake Sites identity headers do not authorize it.
- `/health`: reports runner mode and whether MCP authentication is configured;
  never reveals a credential. A health response is not release acceptance.

This minimal bearer adapter is a tested transport boundary, not a completed
multi-user OAuth installation flow. Real ChatGPT/other-client connection and
per-client authorization/revocation require review before public service release.
Do not expose an unconfigured endpoint or treat web identity sign-in as MCP auth.
Atmosphere identity uses the existing AT Protocol provider, account panel and
exact reviewed HTTPS origins in `lib/identity-origin.mjs`. The original Site
keeps the browser SDK and its unchanged
`/oauth-client-metadata.json` and root redirect. The Railway origin
`https://pixie-project-companion-production.up.railway.app` uses the public
`/oauth-client-metadata-railway.json` and its own root redirect. Other origins
cannot start OAuth here and retain the link to the original Site. No Host header,
query parameter or imported record selects a redirect. These are independent
origin-bound sessions, not synchronized accounts. Railway's root callback is now
verified by the official server SDK, pinned at `@atproto/oauth-client-node@0.5.10`.
Client ID, metadata, redirect and atproto-only scope remain unchanged. No provider
or domain is added. Browser JavaScript cannot assert ownership or supply an issuer,
redirect, DID or bearer credential to authorize private workspace operations.

### Owner identity configuration

Set `PIXIE_OWNER_DID` to the owner's independently verified, stable DID, never a
display name, unverified handle or a DID taken from a login request. Maintainers
must confirm the DID out of band before configuring it. Set `PIXIE_SESSION_SECRET`
privately to 32 cryptographically random bytes encoded as 64 lowercase hex
characters, distinct from `PIXIE_MCP_TOKEN`. Do not paste either secret into chat,
GitHub, browser code or Vite/build variables. No real DID/key is committed here.
Missing owner configuration disables private browser access; partial/invalid
configuration fails closed. Machine MCP remains independently bearer-protected.

The server verifies OAuth state, issuer, PKCE, token exchange and DPoP using the
official SDK; only the configured DID can receive a random opaque `__Host-` cookie
with Secure, HttpOnly and SameSite=Lax. Sessions expire after eight hours. Exact
Host/Origin, browser-bound one-time OAuth state and per-session CSRF headers protect
login, logout and workspace requests. The MCP bearer is rejected by the browser
workspace endpoint, and a browser cookie cannot authorize MCP.

OAuth keys/tokens, transaction state and hashed browser sessions are encrypted
with AES-256-GCM in `identity.enc`, beside `PIXIE_DATA_FILE` on the existing private
volume, using atomic writes and 0600 permissions. No database/service or workspace
schema migration is introduced. Back up this encrypted file and its independent
key securely; exclude it from shared exports. Keep one server/writer, as already
required. Do not change the encryption key or delete/reset identity state to mask
an error. Changing the owner DID invalidates existing browser authorization.

Existing Railway browser-only OAuth sessions cannot safely be promoted into server
authorization: one fresh Atmosphere sign-in is required. There is no second key
entry. Existing Site sessions, creator files, IndexedDB and reading preferences
are preserved. Server cookies/OAuth state survive restart with the same private
file/key. Sign-out invalidates server browser sessions and pending logins first,
then attempts provider revocation; local private access stays revoked if the
provider is unavailable. Real provider revocation still requires live acceptance.

`node tests/browser-owner.cjs` exercises one sign-in through the actual server
cookie/workspace boundary with a synthetic provider, including restart, reopening,
cross-tab sign-out, reading preferences and reflow. The older browser-identity
fixture below checks the preserved browser-SDK path for Site/static use.

`node tests/browser-identity.cjs` (with the same Playwright variables described
below) exercises both origins' sign-in initiation, callback initialization,
restoration, revocation/sign-out, account switching and invalid-origin rejection
using a mocked SDK and synthetic identities. It does not test real provider
authorization, PKCE/state/DPoP cryptography, token exchange or Safari's storage.
Live Railway and original-Site provider round trips and physical iPad/Safari
acceptance remain required. Do not retire or redeploy the original Site here.

## Supported operations: read versus draft versus execution

| Operations | Behavior |
| --- | --- |
| list_projects, get_project_status, discover_resources, get_resource, resume_checkpoint | Read curated/public sources; retain dates and retrieval limitations. |
| suggest_contribution, prepare_feedback, prepare_checkpoint, prepare_enquiry | Prepare proposals/drafts. GitHub submission and professional contact remain user actions. |
| export_project_handoff, prepare_followup, resume_followup | Prepare/validate explicit portable context. No automatic synchronization or server storage. |
| prepare_task_contract, update_task_contract, resume_task_contract | Maintain explicit task context; scope fields stay fixed during updates. Imported context requires fresh review. |
| check_task_action | Reports in-scope/out-of-scope/approval requirement. Executes nothing and grants no credentials. |

No supported operation publishes, deploys, merges, sends correspondence, spends,
grants repository access or approves canon. Explicit confirmed workspace deletion
affects only saved creator records; it does not delete repositories or sources. A scope check cannot constrain
unrelated tools in a host, and an editable file is not cryptographic authorization.
The companion's own task updates cannot silently change outcome, project, actions,
constraints or completion criteria. A new scope requires a new explicitly reviewed
task. Reported completion requires evidence but is not verified completion.

## Portable continuity and privacy

Task stewardship records outcome, supported actions, constraints, completion
criteria, status, progress, next action and evidence. Download/import preserves
task ID and revision. Edits must update the working contract before export, and
every import/update resets the public-safe review gate. Changing the selected
project does not silently discard or reassign the working task.

For public task stewardship, only export public-safe material. Its working text
remains in tab memory; downloaded files belong to the user. The separate My projects
workspace persists as described above; inspect private content before sharing exports. Existing Remember/Forget retains only a public GitHub
issue pointer on that device. GitHub issues remain the shared contribution record.
No opaque chat memory, cross-domain draft transfer or synchronization is claimed.
MCP clients/hosting providers have their own retention. Do not enter credentials,
private briefs, health/benefits records or confidential correspondence.

## Tests and accessibility

`pnpm test` covers existing project/resource/checkpoint behavior, task round-trips,
scope rejection, forged imports, completion evidence, independent HTTP/MCP parity,
fail-closed authentication and the existing mirror safety fixtures.

`pnpm run check:browser` uses a separately available Playwright/Chromium runner;
set `PIXIE_PLAYWRIGHT_MODULE` to its module path, `PIXIE_CHROMIUM` to the browser
executable, and `PIXIE_BASE_URL` to the local runner. It does not deploy or submit
anything. Evidence defaults to ignored `review-evidence/`. Browser tooling is not
an application runtime dependency.

Physical iPad Safari/Files, VoiceOver, a desktop screen reader, clean install,
independent live-source checks and a separate contributor's plugin installation
remain acceptance gates. Never substitute a build, viewport emulation or an
automated contrast check for those observations. Preserve existing identities,
styles, explicit consent and source-first behavior in future changes.

## Existing plugin and Tangled mirror

The installed plugin remains the existing owner-identified 1.0.4 release; the
local historical public-submission manifest says 1.0.3 and is not a verified new
release. Installed tools still expose the previous catalog; these new task tools
are source candidates, not installed changes. Plugin search did not return an
editable PIXIE release ID. No replacement plugin or guessed release was created.

The existing public Tangled mirror was read without mutation at
`https://tangled.org/made-sick.org/pixie-project-companion`: main advertised
`90287b0d64475df606667078d9bb98bbfc07651a`, with no tags in that response.
It is NOT synchronized with this new GitHub module. The source roots differ:
this repository contains the guide plus `apps/companion`; the existing mirror
contains the older Companion at its root. Do not push the whole guide repository
through the retained mirror helper, force-update the mirror, activate automation,
or invent a second mirror. Agree and verify a history-preserving module mapping
under separate authorization after source review. Until then report not synced.

## Release and Site-retirement gate

Do not merge/deploy this module, change domains, repoint the existing plugin or
delete the Site merely because local tests pass. First verify clean installation,
independent hosted behavior, live source access, accessibility, auth/client update,
mirror mapping and every Site-bound dependency. Record exact source/build/client
and human acceptance evidence. Source recovery, review publication, deployment,
plugin update and Site retirement are distinct actions.

## Current local verification and mirror review

`pnpm test` includes persistent workspace round-trips, isolated project operations,
validated non-overwriting imports, corrupt-file preservation, unavailable-model
behavior, provider-context isolation, and private API/MCP state parity. Run
`node tests/browser-workspace.cjs` after building, with the same Playwright/Chromium
variables described above. It starts its own loopback servers and temporary file
store; it never erases an existing workspace. It checks both server and static
storage, browser restart, handoff edits, export/clear/restore, reading preferences,
keyboard skip navigation and 320–1440 px reflow. Test data is fictional.

The retained whole-root mirror helper now refuses this module layout.
`scripts/prepare-module-mirror.mjs` prepares only a local review bundle from pinned
source and Tangled commits. It projects `apps/companion` to the existing mirror
root and retains both histories as parents. Projected commit IDs differ from
GitHub IDs; exact module tree identity is recorded. Review deletions, ownership,
privacy, hosting/build triggers and rollback before authorizing any application.
There is no push mode and synchronization remains inactive.

The existing Site MCP at
`https://pixie-project-companion.ibloud-ivxx.chatgpt.site/mcp` remains separate and
unchanged. A Vercel static preview serves the web interface only. This independent
MCP has source tests, but hosted deployment and plugin connection remain unfinished.

## Existing Railway service preparation

Service-specific Railpack/start/readiness configuration is in `railway.json`.
The existing guide root build is untouched. Use the fail-closed production launcher
`node scripts/start-production.mjs`, with a privately configured owner token,
local-owner bypass disabled and a real persistent volume. See
[deployment/RAILWAY.md](deployment/RAILWAY.md) for exact existing-service settings,
non-secret variables, verification evidence, rollback and current access blockers.
This prepares configuration; it does not establish a deployed Railway runtime.
The static Vercel preview continues to use browser storage and hosts no MCP.

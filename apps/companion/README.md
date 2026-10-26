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

This review built and type-checked outside Sites with available pinned
dependencies. A separate clean offline install was attempted and blocked because
the package mirror lacked supply-chain metadata (`ERR_PNPM_NO_OFFLINE_META` for
`@alloc/quick-lru`). No policy bypass, lockfile rewrite or false clean-install
claim was made. Verify a fresh network-enabled checkout/install before acceptance.
The recovered dependency declarations/lock remain intact apart from application
name and runnable script adaptation; unused starter dependency reduction is not
silently represented as completed.

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
The existing AT Protocol client metadata remains bound to the published Site;
another origin offers the existing sign-in link rather than claiming migrated
OAuth. Do not retire the Site while that dependency remains.

## Supported operations: read versus draft versus execution

| Operations | Behavior |
| --- | --- |
| list_projects, get_project_status, discover_resources, get_resource, resume_checkpoint | Read curated/public sources; retain dates and retrieval limitations. |
| suggest_contribution, prepare_feedback, prepare_checkpoint, prepare_enquiry | Prepare proposals/drafts. GitHub submission and professional contact remain user actions. |
| export_project_handoff, prepare_followup, resume_followup | Prepare/validate explicit portable context. No automatic synchronization or server storage. |
| prepare_task_contract, update_task_contract, resume_task_contract | Maintain explicit task context; scope fields stay fixed during updates. Imported context requires fresh review. |
| check_task_action | Reports in-scope/out-of-scope/approval requirement. Executes nothing and grants no credentials. |

No supported operation publishes, deploys, merges, sends correspondence, spends,
deletes, grants repository access or approves canon. A scope check cannot constrain
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

Only export public-safe material. Working text remains in tab memory; downloaded
files belong to the user. Existing Remember/Forget retains only a public GitHub
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

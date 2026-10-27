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

Production is pinned to `9e83676856e38f1f34a17ce5bf44fe631b8d2f15`, deployment
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
The ChatGPT Site remains the existing working fallback; do not retire it.

Current Railway service and volume must be checked against connected Railway state before any deployment; do not assume this documentation is live proof of the candidate revision. Never apply unrelated staged configuration changes.

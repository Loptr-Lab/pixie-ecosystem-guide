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
   `RAILPACK_NODE_VERSION=22`. Verify the build logs before proceeding.
3. Use the service's existing persistent volume, mounted at `/data`, or attach one
   to this existing service if none exists. Never detach/format/replace a volume
   containing work. Railway must supply `RAILWAY_VOLUME_MOUNT_PATH`. Set
   `PIXIE_DATA_FILE=/data/private/workspace.json`; do not set fake mount variables
   to make an ephemeral directory look persistent. Take a backup before imports.
4. Privately configure `NODE_ENV=production`, `PIXIE_LOCAL_OWNER=0` and a random
   `PIXIE_MCP_TOKEN` of at least 32 characters. Do not send the token in chat,
   URLs, screenshots, PRs or logs. It is now exclusively a machine MCP credential.
   Configure the independently verified `PIXIE_OWNER_DID` and separate private
   `PIXIE_SESSION_SECRET` as specified in [owner identity configuration](../README.md#owner-identity-configuration).
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
   requires the verified owner cookie; MCP requires the separate machine bearer.
   The browser has no connection-key form and never uses `PIXIE_MCP_TOKEN`.
   This is one owner/store, not per-user authorization. Readiness/health return
   only service availability, never project records.

The JSON file store serializes writes within one process. Keep exactly one
replica and one writer. Do not run another server/CLI against the same file or
assume multi-region writes are supported. Confirm Railway does not overlap active
writers during rolling deployments before accepting this storage model.

## Required live verification before acceptance

Use the actual existing HTTPS URL, obtained from authenticated Railway service
state, not a guessed domain. Record timestamp, commit SHA and deployment ID:

- `GET /` → 200; browser shows device/time only inside reading preferences.
- `GET /ready` → 200; `/health` → 200, no private content.
- Unauthenticated `POST /api/workspace` and `POST /mcp` → 401.
- Cross-origin workspace requests → 403; forged Sites identity headers do not
  replace verified owner authorization. Public `/api/companion` cannot read the workspace.
- Complete the one existing Atmosphere sign-in with the configured owner identity.
  Verify another DID cannot open private records. Do not enter a bearer key in the browser.
  Create a disposable synthetic project with a unique label; record its ID.
- Authenticated MCP `workspace_get` of that exact ID returns the same saved data.
  The runtime browser and MCP share the one mounted JSON file. Inspect page
  source/static assets/network failures to confirm no token/private record leak.
- Restart the **same existing service** once after a backup; then verify readiness
  and retrieve that ID through both browser and MCP. Verify the same volume is
  attached. Test a redeploy as well before claiming durable migration acceptance.
- Remove only the disposable project with explicit ID confirmation. Preserve
  existing work. Log status codes/IDs or redacted evidence, never keys or content.

Local synthetic production tests perform auth rejection, same-store API/MCP
reads, full server restart recovery, protected-file rejection and corrupt-state
readiness failure. They do not prove Railway volume persistence or remote TLS.

## Rollback and remaining access blocker

Before changes, retain deployment IDs/settings and a separately protected volume
backup. Roll back to a prior known-safe deployment on the same service with the
same volume; do not delete the volume or downgrade into an incompatible schema.
This release uses the existing workspace schema. If readiness fails, stop and
repair/restore a reviewed backup; never replace saved data with an empty workspace.
The ChatGPT Site remains the existing working fallback; do not retire it.

At preparation time there are no callable Railway plugin tools, no Railway CLI
installation/link, no configured Railway secret/identity binding, and no Railway
or Vercel token environment variable in this session. Existing Railway service ID,
volume attachment and runtime domain are therefore unverified and cannot be
safely changed. Enable the authenticated Railway connection (do not paste a token)
and identify the existing Companion service to apply this configuration.

# PIXIE hosting and DNS

Decision recorded 18 October 2026: use the existing public GitHub guide as the
PIXIE front door; preserve the working companion runtime and plugin connection.
Do not create another guide, repo or hosting service to accomplish this.

## What lives where

| Component | Source / hosting | Purpose |
|---|---|---|
| Public PIXIE front door | This repository / GitHub Pages | Explain PIXIE and route to the right existing tool |
| Contributor coordination runtime | Existing Project Companion Site, version 12 | Project catalog, draft preparation and explicit GitHub issue reads |
| Creator workflow | ibloud/pixie-creator-os / its existing Pages site | Mobile activation and reporting preparation; manual sharing |
| Holdings | ibloud/pixie-holdings / its existing Pages site | Synthetic consequence test bench |

PIXIE does not have to remain hosted on ChatGPT. GitHub can hold application
source for contributor development. GitHub Pages serves static files; it cannot
run the current server endpoints. Those endpoints presently include
`/api/companion` and `/mcp`, with the MCP route using the Site-provided identity
headers. Moving their server requires an explicit replacement for authentication,
deployment and acceptance testing, not just DNS or a copied HTML file.

Main currently contains the guide. The authoritative Companion module is under
review in [PR #5](https://github.com/Loptr-Lab/pixie-ecosystem-guide/pull/5), at
`apps/companion/`. This does not establish completed migration, plugin cutover
or Tangled synchronization. See the dated runtime evidence below.

## Historical guide blocker — 18 October 2026

At commit f595cce2546e8346737170227ab46a99ee2e3e7e the guide's build and artifact
upload succeeded, but the deployment job returned 404 and explicitly requested
that GitHub Pages be enabled. No Pages configuration was returned by the public
API. Local build and checks also passed on 18 October 2026.

## Enable the existing guide

1. Open https://github.com/Loptr-Lab/pixie-ecosystem-guide/settings/pages.
2. Under Build and deployment, choose GitHub Actions as the source.
3. Rerun the failed deployment workflow. Verify the default project URL:
   https://loptr-lab.github.io/pixie-ecosystem-guide/.
4. Set the custom domain to `pixie.loptrlab.com` in that repository's Pages settings.
5. In Porkbun DNS for `loptrlab.com`, use the record below. Change only the exact
   `pixie` hostname; leave other project and email records alone.

| Type | Host | Answer / value | TTL |
|---|---|---|---|
| CNAME | pixie | Loptr-Lab.github.io | Default / automatic |

Do not include `https://` or the repository path in the answer. Replace a
conflicting record at the same hostname only after inspecting it. If GitHub
requests ownership verification, copy the exact TXT name and value it supplies;
do not guess them. No apex A records or nameserver changes are required for this
subdomain.

6. Wait for the Pages DNS check and certificate, then enable Enforce HTTPS.
7. Check the guide, Companion link, mobile navigation and certificate at
   https://pixie.loptrlab.com before changing other public links to call it live.

No DNS or repository Pages settings were changed by this documentation update.
Do not point this hostname directly at the ChatGPT Site: this decision assigns
it to the existing GitHub guide. Server migration is not required for the guide
to link to the current companion.

Official references:
- https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
- https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages

## Rollback

Keep the current companion URL operational. If guide publication or domain
validation fails, retain existing links and diagnose the failed step. Do not
change other project domains or remove a working runtime to force the cutover.

## Companion runtime status — 27 October 2026

Authenticated Railway reads supersede the earlier preparation-time access blocker
in PR #5's deployment instructions. No Railway changes were made by this review.

- Existing project: `patient-respect` (`3befc402-a30d-40e0-a75a-f40238a9944a`).
  Production environment: `ea712c96-8716-4fa3-920f-dc70143f58c6`.
- Companion service: `pixie-project-companion`
  (`d0aa9bfc-a683-453d-a775-a22a2e87d0cc`), source pinned to PR #5 commit
  `b1976e6bf0d39fefc212f5f634ef8d8995878a01`, root `/apps/companion`.
- Deployment `e9738d3a-8ba2-43f6-8a1b-8abae2c75c58` reports **SUCCESS**.
  Runtime logs show the volume mount and production-ready startup with private
  storage checked and local-owner bypass disabled. Configured healthcheck is
  `/ready`; an independent HTTP response has not been observed.
- Live volume `pixie-companion-workspace`
  (`90d791cf-67eb-4c69-8e6b-23a29c8ef2e6`) is mounted at `/data` in
  `us-east4-eqdc4a`, matching the live single-replica deployment.
- **Access blocker:** authenticated service state returns no generated or custom
  HTTP domains and no TCP proxies. There is no verified external runtime URL
  for browser, readiness or MCP acceptance. This is no longer an unavailable
  Railway-connection problem.
- **Separate authorized staged correction:** after verifying live service/volume
  placement, the unapplied `sfo` move in patch
  `5776cfc6-60b5-4a4b-bfae-734e5eaed5ef` was replaced with
  `sfo: null` and one replica in `us-east4-eqdc4a`. Read-back confirms effective
  placement matches the live service and volume. Railway still lists two staged
  fields (the explicit removal and replica restatement); the patch was not applied,
  and the deployment, volume, domains and credentials were not changed.

The smallest resolution path is to preserve the verified one-writer placement
and review the remaining staged fields without applying them, then obtain separate
owner approval for exposing the existing service through a Railway-generated
HTTPS domain. Do not change custom DNS or create another service. Preserve a
protected backup and the known deployment/configuration before any runtime change.

After authorization, follow the [existing deployment acceptance procedure](https://github.com/Loptr-Lab/pixie-ecosystem-guide/blob/b1976e6bf0d39fefc212f5f634ef8d8995878a01/apps/companion/deployment/RAILWAY.md#required-live-verification-before-acceptance):
observe HTTPS and `/ready` 200, anonymous workspace/MCP 401, authenticated
browser/MCP access to the same synthetic project, private-file rejection and
recovery after an approved same-service restart/redeploy. Do not use real private
records for acceptance. No secret values belong in documentation or logs.

PR #5 records 52 passing local tests, typecheck, production builds and browser
checks; these are reported source-review evidence, not a fresh run here or Railway
restart proof. Physical iPad/Safari/VoiceOver, live browser/MCP authentication,
external readiness and mounted-volume restart/redeploy recovery remain unverified.
The current Site/plugin stays in place. The static preview is not the hosted MCP.

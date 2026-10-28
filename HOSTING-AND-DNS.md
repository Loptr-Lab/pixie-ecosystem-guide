## Current owner direction — 27 October 2026

The one canonical Companion application runtime is the existing Railway service:
https://pixie-project-companion-production.up.railway.app/.
This repository's public guide is navigation, and ChatGPT is a client integration.
The old ChatGPT Site is a temporary migration source to retire after accepted
replacement/data/client verification and explicit approval, not a permanent
second writable Companion. Prepared navigation routes to Railway. Existing
source identities, OAuth callbacks and installed endpoints are preserved while
migration dependencies remain unresolved. Where dated hosting/DNS/source claims below differ, this direction supersedes
them. Existing build and contribution instructions remain applicable. No DNS or
hosting change is authorized here. Follow the existing
[canonical cutover inventory](apps/companion/deployment/RAILWAY.md).

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

This repository currently publishes the guide source, not the complete companion
application source. Full runtime-source publication and deployment synchronization
remain a separate bounded task. Do not claim the server has migrated or that a
source mirror is its new authority without an actual release handoff.

## Verified blocker

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

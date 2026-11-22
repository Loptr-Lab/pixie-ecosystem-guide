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

# PIXIE Ecosystem Guide

This is a plain-language, out-of-world guide to PIXIE’s place across Loptr Lab. It explains how a deliberately transmedia story can be discovered across separate media, while the studio’s repositories also contain genuinely separate stories, planning documents, prototypes, and code references at different stages. The guide maps those pieces; it does not connect them into one service or declare every link part of one fictional continuity.

Loptr Lab identifies its current transmedia ARG concept focus as *50 Ways to Leave Another*. The experience remains in development and is not a complete, end-to-end playable release. The owner identifies the public “Pixie” story treatment in *Urban Alien Adventures* as a source for PIXIE’s creation. That post says further development of the story should remain offline; this guide links to it as context, not as a playable clue or invitation to rewrite it.

The guide describes PIXIE as a recurring, project-specific helper/interface idea. The owner’s comparison to VIKI from *I, Robot* is presented as a warning against overriding people’s choices, not as a claim about current software. MCP is a connection protocol, not the character and not evidence that all projects share access. Project cards link to source notes and state what is live, experimental, planned, or not currently working.

## Participation and feedback

Visitors can start with one project, ask what is actually working, flag confusing wording, or identify an accessibility barrier. For code, follow the instructions in that project’s own repository. Loptr Lab says current open reviews and contributions are voluntary and unpaid; scope, time, public credit, and an exit path should be agreed in writing before work begins. Participation does not promise employment, ownership, academic credit, or future pay. See the [collaboration pathways](https://ibloud.github.io/collaborate/) and [mission and participation terms](https://github.com/ibloud/ibloud.github.io/blob/main/MISSION.md).

The guide’s feedback link opens a public GitHub issue; anyone can read it and the person posting needs a GitHub account. Do not share private or confidential information. Public repository visibility does not itself grant permission to reuse story material, artwork, or code; no new license has been selected for this guide.

## Run and check locally

Requires Node.js 22 or newer. There are no package dependencies to install.

```sh
npm start
npm run build
npm run check
```

The dependency-free build writes static files to `public/`. It embeds the role cards and focus areas in the initial HTML so the published page remains useful without JavaScript.

## GitHub Pages and `pixie.loptrlab.com`

The existing public repository `Loptr-Lab/duet-solo-hackathon` already publishes a different site at `break.loptrlab.com`. Do not change its Pages domain or root deployment. The approved guide destination is the separate public repository `Loptr-Lab/pixie-ecosystem-guide`.

The Pages workflow uses GitHub Actions and publishes `public/`. The first public deployment can use GitHub’s default project URL and remain `noindex` while the custom domain is pending. To use `pixie.loptrlab.com`, the owner must add the CNAME in Porkbun: Type `CNAME`, Host `pixie`, Answer/Value `Loptr-Lab.github.io`. Add a TXT verification record only if GitHub supplies its exact value. No DNS records are changed from this workspace. Do not call the custom domain live until DNS and HTTPS are verified.

Official references:

- [About custom domains and GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages)
- [Managing a custom domain for your GitHub Pages site](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-your-custom-domain-for-your-github-pages-site)
- [Verifying your custom domain for GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages)
- [Using custom workflows with GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)

## Hosting decision and DNS handoff

Use this existing GitHub repository as PIXIE’s public guide/front door. Keep the
working Project Companion Site and plugin identity in place during acceptance.
See [HOSTING-AND-DNS.md](HOSTING-AND-DNS.md) for the exact DNS record, verified
deployment blocker and separation between source development and server hosting.

## Companion application source review

The owner selected this existing repository as the preferred source home for a
separate Companion module, subject to preserving this guide. The recovered,
independently runnable application is under [apps/companion](apps/companion/README.md).
Its build, tests and Node/MCP runner are independent of the root guide build.
This source review does not deploy the module, migrate the existing Site/plugin,
change domains or establish mirror synchronization. Follow the module's explicit
acceptance and Site-retirement gates; the guide's existing functionality remains.


## PIXIE development methodology

The emerging **PIXIE Development Protocol (PDP)** is a reusable approach for designing, building, testing, governing, and releasing MCP servers, bots, assistants, and agentic workflows. It is grounded in existing PIXIE projects and does not replace MCP or imply that all projects share runtime, data, or permissions.

Breadcrumb: **PIXIE Ecosystem Guide → [PIXIE Development Protocol](docs/PIXIE-DEVELOPMENT-PROTOCOL.md) → Project Brief → Capability/Permission Map → Tool Contract → Tests/Evidence → Release Record**.

The protocol is working version 0.1; use it as a review checklist and propose improvements through pull requests. It is not a certification that existing implementations already satisfy every requirement.


## PIXIE Control Plane coordination breadcrumb

**Breadcrumb:** [PIXIE Ecosystem Guide](README.md) → Control Plane review → [PIXIE Holdings](https://github.com/ibloud/pixie-holdings) (hardware/resource stewardship) → [PIXIE Creator OS](https://github.com/ibloud/pixie-creator-os) (creative coordination and app catalog) → Companion / My PIXIE (private identity, consent, persistence).

This is a cross-project concept-validation and delivery plan, not a declaration that these repositories share a runtime or that external integrations are connected. The proposed layers retain separate ownership and data boundaries.

### What decision-makers are being asked to validate

- ATProto/ecosystem stewards: portable identity and public-record boundaries without exposing private projects.
- App/service developers: a capability-aware coordination layer that does not claim installation, authorization, or publishing on their behalf.
- Hardware and creative-tool developers: evidence-based device capability discovery and permission boundaries.
- MCP implementers: explicit tool contracts, scoped consent, preview-before-action, and testable handoffs.
- Accessibility practitioners: keyboard/focus, assistive technology, recovery, and low-burden control.
- Developer-relations/ecosystem leads: whether a reproducible reference slice and catalog provenance are useful.

### Organic curated source distribution

Catalog discovery should draw from official app directories and documentation, repository releases/issues, hardware specifications, developer conversations, user-submitted sources, and first-party compatibility tests. Each item needs provenance, discovery/check timestamps, confidence, capabilities, compatibility notes, and a lifecycle status. Discovery is not verification; verification is not integration; integration is not user authorization. Preserve stale/unknown states and avoid unsupported claims.

### Delivery and testing gates

1. Audit the current Holdings control panel, Creator OS My Apps/Connections, Companion private persistence, and source/catalog surfaces.
2. Agree on data ownership, capability and permission contracts, stable PIXIE identifiers, and catalog provenance.
3. Build one vertical slice with one real, verified adapter and a user-confirmed handoff; keep fallback/manual paths visible.
4. Test denial, disconnect/revoke, recovery/export, destination mismatch, stale/unverified catalog entries, keyboard/accessibility, and private-data leakage.
5. Publish a demo, architecture notes, test evidence, limitations, and a focused feedback request for the roles above.

**Status:** concept and delivery plan documented. Audit, implementation, real adapter, device tests, and decision-maker validation are separate acceptance gates. Vercel is not required for this documentation slice; deployment status is not asserted.

Related breadcrumbs: [Holdings](https://github.com/ibloud/pixie-holdings), [Creator OS](https://github.com/ibloud/pixie-creator-os), and [PIXIE Development Protocol](docs/PIXIE-DEVELOPMENT-PROTOCOL.md).


## Digital Jockey Network — cross-project breadcrumb

**Breadcrumb:** PIXIE Ecosystem Guide → [PIXIE Creator OS](https://github.com/ibloud/pixie-creator-os) → [My Audience / Digital Jockey Studio](https://ibloud.github.io/pixie-creator-os/digital-jockey.html) → [Digital Jockey Network architecture](https://github.com/ibloud/pixie-creator-os/blob/main/docs/digital-jockey-network.md) → [Play It Forward / Your Week on Air](https://loptr-lab.github.io/pay-it-forward/radio/).

The relationship is intentional but not a shared runtime: Creator OS is the creator-side workstation and local project-prompt generator; Play It Forward is the audience-facing community-radio reference experience. The Digital Jockey Network is the proposed social layer connecting independent DJ/station identities, shows, discovery, follows, recommendations and collaboration. AT Protocol / Atmosphere is the intended interoperable direction, not a claim of current authentication or publishing integration.

Current evidence/status:
- Play It Forward manual show builder: implementation under review in [PR #27](https://github.com/Loptr-Lab/pay-it-forward/pull/27).
- Creator OS Digital Jockey Studio and prompt generator: implementation under review in [PR #70](https://github.com/ibloud/pixie-creator-os/pull/70).
- Apple Music account import, timestamped weekly history, public DJ profiles, follows, feeds, moderation and live audio broadcasting remain separate future acceptance gates.

Do not merge private listening history into public social records by default. A tracklist and link are not audio hosting rights or evidence of a play event. Each project keeps its own source of truth and permissions.


### Digital Jockey Network — capability disclosure

The following status applies across [Creator OS Digital Jockey Studio](https://ibloud.github.io/pixie-creator-os/digital-jockey.html) and [Play It Forward / Your Week on Air](https://loptr-lab.github.io/pay-it-forward/radio/). The applications remain separate; cross-links are navigation, not a shared login or data integration.

**Works now in the review implementation:** Creator OS generates a reusable project prompt locally in the browser. Play It Forward lets a person manually create a titled show with a DJ note, tracklist, artist names, and external listening links, then share a read-only view encoded in the URL fragment. Neither function requires an Apple Music account connection; the prompt is not sent to an AI service and the show payload is not uploaded to the server.

**Planned, not live:** DJ/station profiles and archives; follows, feeds, recommendations, submissions, collaboration and moderation; Apple Music authorization/import and timestamped listening history; AT Protocol identity/authentication/publishing; audio hosting and live broadcasts.

**Needed for development:** Apple developer/MusicKit configuration and consent/security/privacy tests; a backend and operational owner for persistent accounts and social data; AT Protocol/PDS and existing Lexicon review plus a tested publishing adapter; decisions for identity, visibility, moderation, blocking, deletion and export; music-rights/provider review before audio hosting or rebroadcast; accessibility, security, abuse, recovery and release testing.

**Disclosure rule:** a manually entered playlist is not verified listening history; a tracklist is not proof of a play event; an external link is not permission to rebroadcast. Private listening history is not public by default. Do not describe planned integrations as connected or available until implemented, authorized, and tested. See the project-specific [Creator OS status and development requirements](https://github.com/ibloud/pixie-creator-os/blob/feat/digital-jockey-studio/docs/digital-jockey-network.md#capability-disclosure--works--planned--needed) and [Play It Forward status and requirements](https://github.com/Loptr-Lab/pay-it-forward/blob/feat/week-on-air-radio/docs/WEEK-ON-AIR.md#capability-disclosure--works--planned--needed).

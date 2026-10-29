Read [brand-guidelines.md](brand-guidelines.md) before changing brand, copy, images or presentation. Reuse the accepted Companion sigil and existing shared CSS; do not invent replacements.

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

# Approved main publication — 28 October 2026

Owner reviewed the isolated Vercel previews and instructed “Push to main”. This
supersedes the source-publication hold in the dated preview records below.
Approved visual: https://pixie-ecosystem-guide-preview-rgxn10mi9-niquedevereaux-6363.vercel.app/

Publish the reviewed guide, shared stylesheet, generated PIXIE sigil and hero art,
and corresponding Companion presentation changes through the existing repository
workflow. Main triggers the existing public guide Pages build/deployment. This
approval does not change Railway settings, auto-deploy, DNS, installed MCP
connections, or authorize migration/retirement of the old Site. Unverified live
provider and physical-device acceptance gates remain stated below. The separately
unidentified MCP information page remains outside this implemented change.

Existing-work/source check: clean current main 63c96756c55592ff0fd59d67021e7c9ef621a909;
repository AGENTS.md, canonical principles and ecosystem architecture were read;
merged PR #5 correction and Creator #62 continuity were preserved. The 16-file
change contains no OAuth, consent, private workspace, handoff, API/tool contract,
source recovery or deployment configuration changes. server.mjs only adds the
image/png MIME type needed to serve the reviewed generated brand symbol.

The authoritative stylesheet remains apps/companion/app/globals.css. Companion,
public guide and online field guide inherit it through existing build paths.
New art is an owner-requested generated proposal accepted for this publication,
not a recovered approved original or invented character chronology. Generated
masters are preserved in assets/; the Companion public sigil copy is identical.
Loptr Lab, Duet, 50 Ways and Made-Sick remain untouched.

---

# PIXIE hero illustration preview — 28 October 2026

Owner requested a graphic like the supplied ethereal companion reference in the
upper-right hero space, and asked whether the approved color scheme was followed.
The seven source colors are intact: midnight #071923, plum #211823, slate #354955,
mist #93999F, parchment #F2E5CE, gold #D5AB68, teal #A9E2E5. Material 3 surface,
contrast and light-mode roles also use derived tones; the preview is not limited
to only those seven RGB values. Artwork uses the source colorway with natural
illustrative skin/shading tones. No palette replacement or new theme control.

A new decorative illustration was generated from the owner's current visual
reference and requested placement. It is a preview proposal, not a recovered
approved Cameo, Winged Spark or Guiding Star original. Existing supplied originals
were not overwritten. The generated sigil remains unchanged. Previous approved
scope and preview-only boundaries persist; no chronology or capabilities added.

Isolated copy: /workspace/work/pixie-hero-preview. Changes from previous preview:
index.html hero-copy/figure; assets/pixie-hero-proposal.png; existing build asset
copy; layout in the same apps/companion/app/globals.css; this existing QA record.
Desktop/tablet use a two-column hero with the illustration on the upper right;
mobile places it below copy/actions. Existing breathing and reduced-motion
behavior remain unchanged. No text or controls overlap the graphic.

Verification: existing guide check/build and Companion production build passed.
Chromium viewports 1440/1194/1024/820/390/320 passed placement assertions, no
horizontal overflow, no broken images, exact seven palette tokens, and keyboard
skip navigation. Hero screenshots inspected at iPad and mobile widths. These are
viewport checks, not physical iPad/Safari or VoiceOver acceptance. The previously
passed 84-test suite and owner/helper checks concern the preceding runtime; no
runtime logic changes are made here and they were not newly rerun for this art.

Production and maintained sources remain unchanged. Excluded Loptr Lab, Duet,
50 Ways and Made-Sick code/assets/settings/deployments remain untouched. Next:
owner visual review of this new Vercel preview, not a production release.

---

# Material 3 and breathing PIXIE sigil — isolated preview, 28 October 2026

Status: ready for owner visual review; no production approval inferred.

This work is isolated under /workspace/work/pixie-m3-preview. The previous
candidate and maintained repositories remain unchanged. No source was pushed,
PR merged, production release promoted, DNS edited or Railway setting changed.

Read-only references:
- Material 3 color roles: https://m3.material.io/styles/color/roles
- Official implementation guidance: https://developer.android.com/develop/ui/compose/designsystems/material3
- Existing Design Bible: https://github.com/Loptr-Lab/veiled-dominion-engine/blob/main/docs/design/DESIGN_BIBLE.md
- Existing Loptr Lab and Duet source: their current index.html/public/index.html.

Design: explicit surface/container and corresponding on-color roles derived
from the approved PIXIE palette; neutral blue-slate tonal containers replace
large plum cards. Teal identifies actions/selection and gold remains a restrained
identity signal. Light preference uses cool neutral surfaces. App typography,
header/navigation, preferences and form spacing were reduced to a clear hierarchy.
Existing labels, reading preferences, privacy controls and workflows are preserved.

After confirming the supplied originals were not available as files, the owner
explicitly requested a new symbol based on Duet and Loptr Lab. The new generated
PIXIE proposal uses nested guiding-spark linework, an open orbit, aged gold and
a teal core. It is a new proposal, not a recovered original or a replacement
claimed to carry an established chronology. Header, helper and favicon use it.
The generated master remains in generated_images; no excluded project asset
was changed or copied as PIXIE's mark.

Breathing adapts the existing fixed decorative rhythm: 7s ease-in-out, opacity
1 at endpoints and .5 at midpoint. It animates the symbol, not live status or
text. prefers-reduced-motion disables it and leaves opacity 1. The existing
Design Bible remains the authority; no competing brand guidelines were created.

Verification:
- Existing Companion tests: 84/84 passed, none skipped.
- Guide checks/build, Companion build and typecheck passed.
- Existing task browser contract passed.
- Existing owner/helper browser acceptance passed, including keyboard/Escape,
  focus restoration, hidden-only restore, 28px helper notes, private DID isolation,
  source failure/retry, account switching and dark/light text contrast. Identity
  providers were synthetic; this is not live OAuth acceptance.
- 24 browser viewport combinations: guide, online field guide and four Companion
  views at 1440/820/390/320 CSS pixels; zero page errors, page overflow, broken
  images, missing image alternatives or sampled text-contrast failures.
- Motion inspected at exact timeline 0 and 3500ms, computed duration 7s and
  easing ease-in-out. Reduced-motion computed animation none, opacity 1.
- Generated icon rendered at 16/24/32/48px. Fine geometry naturally simplifies
  at favicon size; header/helper use 56px. Physical iPad/VoiceOver remain untested.
- Theme-switch transitions initially caused a transient contrast dip; background
  color transitions were removed, and the unchanged owner browser check passed.

Preview: https://pixie-ecosystem-guide-preview-cq2jm6xws-niquedevereaux-6363.vercel.app/
Companion: /companion/index.html
Vercel deployment dpl_iRdnQ8477fBX6iH6ucvSN9cDwfzq, READY, target staging.
Only public built assets were uploaded. The static Companion uses browser
storage; this preview does not replace or verify the Railway backend, provider
sign-in or installed MCP connection. Local browser verification and remote HTTP
verification are distinct. Owner review is next; production is on hold.

Loptr Lab, Duet, 50 Ways and Made-Sick were inspected only where relevant and
were not modified. The separately requested MCP information-page source remains
unidentified; /mcp protocol behavior was preserved and not converted to HTML.

---

# Creator workspace review checkpoint

Local implementation only; no release authorization, push, merge, deployment or synchronization.

## Verified

- 50 Node tests passed, including shared private UI/MCP state, persistent file-store recovery, validated restore, project isolation and provider-context isolation.
- TypeScript check and production Vite build passed. Root ecosystem guide build and checks passed without changes to its application.
- Chromium exercised server-backed and static IndexedDB journeys: create project/source/task, blocker and next action, reload and browser restart, project isolation, editable handoff, export/clear/restore retaining IDs, honest absent model and failed research, persistent light/dark and 18/20/24px preferences.
- Keyboard skip-to-main activation passed. No horizontal overflow at 320, 390, 820 or 1440px with enlarged text. Existing task-contract browser checks passed with no page errors; sampled contrast minimum 8.62:1.
- Browser acceptance uses isolated temporary stores and fictional data, never an existing creator workspace.
- Generated assets rebuilt in ignored tangled-site/. Evidence screenshots in ignored review-evidence/. No credentials, private project data, browser profiles or data store included in the commit.
- Restored omitted pnpm policy; frozen install succeeded using the verified local cache, without changing dependency versions.

## Limits and separate gates

Physical iPad Safari, Files, VoiceOver and a desktop screen reader are untested. Viewport emulation is not a device test. No configured live model provider; fixture integration and honest unavailable behavior passed. Fresh installation on another network/machine remains unverified.

The live Site MCP and installed plugin are unchanged. Static hosting does not host the independent MCP or share its saved state. Independent hosted MCP, per-client authentication and plugin connection remain unfinished. Server persistence is single-owner, not multi-user isolation or cross-device synchronization.

Tangled main remains 90287b0d64475df606667078d9bb98bbfc07651a. It descends from Sites v17 73ef3b57460693526930ee84a305ea82587e27c5 through 2214950e0821ff1691001fcbb01e11a3a8a3239e (device/time guidance) and a hosting-trigger commit. The recovered GitHub module has different roots/history. Review the local projected-tree bundle, including removed generated assets and existing hosting triggers, before any external operation. Retain both histories and the original standalone candidate.

Old standalone checkpoint d3467e8f58b64867c37c10350b9d510db3020fe6 and candidate archives are preserved. Duet extraction remains on hold; C# models, four-player rules, canonical runtime and Made-Sick release review are unchanged and separate.

## Next review action

Run the built Companion locally, create one non-sensitive project and review its saved handoff and backup. Review model/privacy and mirror mapping separately before authorizing any push or public testing deployment.

## Railway preparation checkpoint — 27 October 2026

Fetched creator-workspace 6f9e9f2909e1e284329d185100d97de8902ad8b2 by fast-forward,
preserving the intervening CI and reading-preferences commits. All original 50
tests passed again; the extended production suite passed 52/52, type checking and
both production builds passed. Browser acceptance in server and static modes now
asserts device/time is nested in Reading preferences, absent on Find help, and
visible on My projects. Existing data/continuity journeys still pass.

New production tests verify missing-auth/volume refusal, local-owner bypass off,
401 without a bearer, shared API/MCP saved identity, full server restart recovery,
404 for attempted private-file URLs, and 503 readiness for corrupt saved state.
These tests use a temporary synthetic volume directory, not Railway storage.
Actual Railway volume attachment, remote restart/redeploy persistence and edge TLS
remain unverified. Authenticated Railway tools/credentials and the existing
Companion service identity are missing. Do not claim those checks as completed.

The existing Vercel integration reports a Ready preview for the reading-preferences
commit; direct URL verification is blocked here by proxy CONNECT 403. Exact URL,
non-secret existing-service configuration, rollback and acceptance checks are in
`deployment/RAILWAY.md`. The Site, guide, installed plugin, domains and Tangled
remain unchanged. No Railway deployment or provisioning has been performed.

# PIXIE identity review — 28 October 2026

This dated implementation record extends the existing QA history below. It does
not replace the authoritative brand guidelines, whose location has not yet been
retrieved. Production publication remains pending owner review of the Vercel
preview and resolution of the artwork, brand-document and MCP-page gaps.

## Continuity and approved direction

Read the current repository `AGENTS.md`, `lib/principles.mjs`, the canonical
`ibloud/ibloud.github.io/docs/ECOSYSTEM_ARCHITECTURE.md`, Companion PR #5 metadata
and discussion, and the affected guide, application, build and test sources.
The authoritative baseline is guide main
`63c96756c55592ff0fd59d67021e7c9ef621a909` (PR #5 merged). Its current-main
Railway wording and merge-marker/obsolete-hosting regression checks are retained.
Creator PR #62 is already merged; its current Vercel record identifies main
`9358a26f97f6012e3107dd61ae96075ea1889569`. Creator source was not edited.
Older local Companion and guide checkouts were preserved; this candidate was
prepared in an isolated snapshot of current guide main rather than overwriting
them. Existing JPEG and PDF blob IDs exactly match that main tree.

The owner's supplied assignment approves these roles:

| Palette | Role implemented in this candidate |
| --- | --- |
| Midnight ink `#071923` | Default canvas, input backgrounds and text on teal actions |
| Velvet plum `#211823` | Companion cards, guidance, helper and guide atmosphere |
| Blue slate `#354955` | Structural separators and secondary surfaces |
| Mist gray `#93999F` | Secondary text on dark surfaces; existing light preference's canvas |
| Warm parchment `#F2E5CE` | Primary reading text; small light-theme raised surfaces |
| Aged gold `#D5AB68` | Headings, identity accents and orientation |
| Glacial teal `#A9E2E5` | Links, selected navigation, actions and focus |

Default surfaces remain dark. The existing light preference uses mist and ink,
preserving a distinct light reading option without a large bright beige canvas.
No reading controls or preference keys were added.

## Implemented design and stylesheet ownership

`apps/companion/app/globals.css` is the one authoritative stylesheet. It contains
the palette and semantic roles, system sans-serif reading type, Georgia display
type, 8/16/24/32/48/64px spacing, shared focus and reduced-motion behavior, guide,
field-guide and Companion layouts, controls, responsive rules and existing
account/helper presentation. Explicit pixel font sizes are at least 18px.
Surface selectors are scoped so guide headings, headers and buttons cannot
change Companion controls. The functional hidden attribute is kept outside the
component cascade layer. All former `!important` declarations were removed;
duplicate exact-selector declarations were consolidated in their conditions.

Consumers:

- Companion's static entry and existing React layout import this source directly
  and identify their body as `pixie-companion`.
- The public guide identifies its body as `pixie-guide`. Its `src/styles.css` is
  only a local-development import adapter. The existing root build copies the
  authoritative stylesheet byte-for-byte to `public/src/styles.css`; checks
  reject generated stylesheet drift.
- The online field guide uses `pixie-reader` and that same built stylesheet;
  its competing embedded stylesheet was removed. Text, authorship, dates and
  destinations remain intact. The supplied PDF was preserved, not regenerated.
- Preformatted checkpoint/comment/Creator-return text uses the stylesheet's
  existing report-content treatment instead of repeated inline presentation.

This arrangement keeps the authoritative source inside the Companion module,
so its existing module mirror projection remains self-contained. No mirror was
written, activated or synchronized. No new package, dependency declaration,
service, database, OAuth origin or deployment configuration was added.

Voice remains warm, direct and practical: existing navigation and headings are
retained with their factual project distinctions. No new integration, memory,
hosting, public-installation or automatic-sharing claims were added. Existing
source imagery remains uncropped with its alternatives and attribution intact.

## Symbols and authoritative-brand update still pending

The three approved generated originals were not found among the supplied local
attachments, current guide/Companion tree, Creator tree or the relevant connected
Drive searches. Their exact filenames and authoritative asset locations remain
unknown; this is a retrieval gap, not evidence of deletion. No replacement art,
symbol chronology or generated derivative was invented. Existing Unicode marks
remain existing interface marks, not claimed versions of the approved artwork.

| Approved expression | Intended use when the supplied original is available | Current status |
| --- | --- | --- |
| Guiding Star | Identity/orientation, navigation and legible favicon variants | Original and small-icon variants pending |
| Winged Spark | Creative movement and capability-related content | Original and web variants pending |
| PIXIE Cameo | The single existing companion helper's personality/presence | Original and web variants pending |

Preserve each original and its source metadata before making web/icon variants.
Verify the resulting artwork at actual small sizes and with meaningful image
alternatives. Do not imply the three expressions establish a dated evolution.
The palette/roles, inheritance, typography, spacing, accessibility, voice and
image rules in this review must be incorporated into the existing authoritative
brand document once its actual location is supplied; no competing guidelines
were created here.

The separately requested MCP information page could not be identified. Current
source contains the protocol `/mcp` endpoint, not an HTML information page:
GET remains 405 with POST guidance, and its tool contracts, authentication,
connection instructions and privacy limits remain unchanged. This endpoint was
not repurposed into a page. Visual acceptance of the existing information page
requires its URL/source; it is not counted as completed.

Current repository documentation names `pixie.loptrlab.com` as a planned guide
domain. No evidence here establishes that the differently spelled
`pixie.loprrlab.com` is intended, or that the planned domain is live. No DNS,
domain, Railway settings, auto-deploy, production aliases or installed ChatGPT
connection were changed.

## Verification and limits

- Companion: 84/84 existing Node unit/integration/security tests passed, with
  none skipped; typecheck and production static build passed.
- Guide: existing source/content/hosting checks and build passed, including the
  retained current-main wording checks, shared-CSS drift assertion and rejection
  of `!important`. `git diff --check` passed.
- Chromium: 24 combinations of guide, online field guide, My projects, Find
  help, Project work and Task stewardship at 1440, 820, 390 and 320 CSS pixels.
  No page errors, horizontal page overflow or missing image alternatives were
  found. The sampled visible text on resolved solid backgrounds passed 4.5:1;
  this automated scan does not certify imagery, gradients or all interactive
  states. Skip-link and guidance-heading contrast defects were corrected.
- Existing task browser contract passed: review-gated export/import, stable
  project identity, no scope expansion, keyboard skip navigation, contrast and
  reduced-motion behavior. Existing owner browser checks passed: one helper,
  hide/restore/Escape/focus, notes scaling to 28px, private DID isolation,
  source-failure/retry, account switching and dark/light contrast.
- Existing workspace browser journey passed for both real local server storage
  and browser storage: create/save/reopen, sources/tasks, backups and restoration,
  model-unavailable recovery, reading preferences and reflow. Its first run timed
  out at the final browser-mode Tab assertion; an unchanged rerun passed both
  storage modes. No application change was made to mask the timeout.
- Existing identity browser tests passed approved Railway, legacy Site and
  untrusted-origin fixtures. Tests use synthetic upstream identity dependencies;
  real provider sign-in and physical iPad Safari/Files/VoiceOver remain pending.
- The cross-application Creator browser test was not run to completion because
  its reviewed Creator checkout was not present locally. No change to handoff
  authorization, consent, storage or origin checks is part of this design patch.
- New local implementation has no remote CI commit yet. Historical CI evidence
  for merged PR #5 is not claimed as CI for this candidate.

Vercel preview verified READY: `dpl_A3qjVM9pKLpRodTZFGYidd4yxSXy`, API target
`staging` (non-production), in the existing `pixie-ecosystem-guide-preview` project.
https://pixie-ecosystem-guide-preview-ojj0glgkz-niquedevereaux-6363.vercel.app/
Guide HTML, Companion HTML, shared guide CSS, compiled Companion CSS and its
entry JavaScript each returned HTTP 200 through the authenticated Vercel tool.
This is remote HTTP verification; browser layout checks were performed locally.
A temporary Vercel review link was created; project protection stays enabled.

Vercel review uses only compiled public guide assets and a static Companion
under `/companion/`. That Companion retains its existing browser-storage mode;
the preview does not provide or verify Railway sign-in, MCP or durable server
storage. Guide production links retain their original destinations. Review the
preview before approving any source publication or production release.

## Excluded-project proposals — not implemented

Loptr Lab, Duet, 50 Ways and Made-Sick code, copy, images, styles, settings and
deployments were untouched. Any later PIXIE-reference update there is a separate
proposal: inspect the owning source, preserve each project's own identity/canon,
and only consider navigation or symbol treatment after the approved artwork and
authoritative brand guidance are available. Such changes need their own scoped
review and verification; this record authorizes none of them.

---

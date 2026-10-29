---
brand: PIXIE
owner: Dominique Devereaux
scope: PIXIE public guide, Companion and field guide in this repository
status: Consolidated existing owner direction; no new visual choices
reviewed: 2026-10-29
stylesheet: apps/companion/app/globals.css
---
# PIXIE brand guidelines

## Authority
Read this file, AGENTS.md and apps/companion/lib/principles.mjs before changing
presentation, copy or images. Existing [design QA](apps/companion/design-qa.md)
records the 28 October owner approval and exact art/CSS implementation. Earlier
“brand source unretrieved” notes are historical, not a reason to invent new art.
The [Design Bible](https://github.com/Loptr-Lab/veiled-dominion-engine/blob/main/docs/design/DESIGN_BIBLE.md)
remains the motion/creative-lineage reference; its studio monochrome palette does
not override PIXIE's later owner-directed colorway. Canonical ecosystem governance
remains ibloud/ibloud.github.io. Product repositories retain runtime authority.

## Purpose and people
PIXIE stays with the work: helps creators and contributors find the next useful
step, prepare enquiries and records, coordinate and return with context. She carries
administrative work so people can deepen creative practice. Companion is the current
workspace; the guide explains it; ChatGPT is a client; MCP is a protocol, not another
character. Creator OS, Holdings, Made-Sick and 50 Ways have distinct responsibilities.
The historical public discovery prototype is not the full Companion.

## Accepted icon versus page imagery
| Asset | Role and source |
| --- | --- |
| assets/pixie-sigil-proposal.png | Accepted generated sigil master for the 28 October publication; nested guiding spark, open orbit, gold and teal core |
| apps/companion/public/pixie-sigil-proposal.png | Identical runtime copy used by the actual persistent helper in app/pixie-helper.tsx |
| assets/pixie-hero-proposal.png | Accepted decorative guide hero/page illustration, not the launcher icon |

The word “proposal” in these filenames is historical; acceptance is recorded in the
QA publication entry. Reuse the exact current Companion sigil. Do not substitute a
Unicode star, stock icon, unrelated favicon.svg, newly generated logo or portrait.
The owner-supplied Crescent Muse / Midnight Spark / Luminous Compass images express
complementary aspects across the ecosystem, not an invented dated evolution. Use
page imagery in pages; do not replace the current helper icon. Exact original asset
mapping is incomplete in this repository: do not rename/relabel missing originals
as recovered or decide their final placement without direction. Preserve supplied
originals and source metadata before derivatives. Do not reconstruct them from chat.

## Color and roles
| Source color | Hex | Intended role |
| --- | --- | --- |
| Midnight ink | #071923 | Canvas, dark text on light actions |
| Velvet plum | #211823 | Atmospheric depth, restrained guidance surfaces |
| Blue slate | #354955 | Structure and secondary surfaces |
| Mist gray | #93999F | Secondary tone / existing light preference input |
| Warm parchment | #F2E5CE | Reading text and small raised light surfaces |
| Aged gold | #D5AB68 | Identity and orientation |
| Glacial teal | #A9E2E5 | Actions, selected navigation and guidance |

Use existing semantic surface/container/on-color pairs in globals.css. Derived
contrast tones are permitted by the existing implementation, not an independent
palette replacement. Keep default dark surfaces and the existing cool light
preference; no bright beige canvas, heavy purple cards or new theme controls.
Verify actual pairs. Do not claim that every source color is readable on every other.

## Typography, spacing and shared CSS
System sans is the reading face; Georgia is the established display face. Semantic
roles separate display, headline, title, body and labels. Maintain readable existing
18px-plus explicit type, user reading preferences and normal tracking. Do not shrink
text to fit. Keep prose bounded without creating empty editorial columns or placing
long content in narrow right rails. Shared 8/16/24/32/48/64 spacing tokens express
relatedness; preserve responsive gutters, natural text height and useful hierarchy.
apps/companion/app/globals.css is the sole source. Guide/reader/Companion selectors
are scoped. Existing build copies CSS byte-for-byte; src/styles.css is the existing
development adapter, not another theme. No new CSS framework, competing stylesheet,
page presentation or silent overrides. Review complete pages and breakpoint boundaries.

## Helper behavior and motion
Reuse the single existing contextual helper and restore-only-when-hidden behavior.
Keep focus, Escape/close, reading preferences and explicit project-information
consent. No duplicate helper, owner-only setup path or fake live chat. On other
sites the owner requests a persistent bottom-right entry using this same sigil;
opening Companion does not imply transferred data or connected session.
Existing breathing is decorative 7s ease-in-out, opacity 1 at endpoints and .5
at midpoint. Reduced motion disables animation and retains visibility. Do not
animate text or represent decorative motion as live system status.

## Voice and example
Observant, warm, direct, practical and willing to challenge a weak decision; witty
only when useful. Lead with a specific weak spot, why it matters and a useful action.
Example: “Your proposed fee is missing a payment date. Record when it is due before
you book the session.” Avoid “Ensure compliance with all applicable obligations.”
No corporate filler, invented memory, endorsements, legal approval or automated
publishing claims. Distinguish evidence, interpretation, proposals and unknowns.
Preserve human choice, creator credit, compensation, consent, privacy and exit.

## Material 3 and accessibility
Official reference https://m3.material.io/; owner-supplied implementation skill
https://github.com/skydashnet/material-design-3-ui-skill (third-party, not Google).
Read relevant color, type, spacing, adaptive, navigation, component and accessibility
references before design. Choose controls by behavior and define relevant focus,
pressed, selected, hidden, loading, unavailable, error and recovery states.
Maintain contrast, text scaling, generous targets, safe areas, semantic names and
keyboard/screen-reader paths. No forced fixed-height reading boxes. Distinguish
local browser checks, physical iPad Safari, VoiceOver and actual provider behavior.
Documentation and green tests alone are not full Material/accessibility certification.

## Release and continuity
No new repository, service, database, sign-in gate, art or runtime because an older
surface is incomplete. Use current source and preserve all private workspace,
OAuth, consent and cutover safeguards. A website link is not a shared runtime.
Update this file when owner direction changes; keep exact source/date/status.
Preview before release. Guide publication does not itself approve Railway settings,
MCP changes, old Site retirement, DNS or storage migration.

29 October 2026: consolidated existing source and accepted artwork references;
documentation only. No Companion UI, icon, code or runtime deployment changed.

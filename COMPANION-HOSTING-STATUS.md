# PIXIE Companion: current development and release status

Updated 27 October 2026. **One Companion. Specialized projects. No duplicate workflows.**
Scope expansion is frozen: stabilize the existing Companion and support the current
contributor. This status updates the older hosting handoff; it does not authorize
merging, deployment, domain changes, plugin replacement or repository archival.

## Current work and responsibility

| Existing repository | Responsibility and current boundary |
| --- | --- |
| [pixie-ecosystem-guide](https://github.com/Loptr-Lab/pixie-ecosystem-guide) | Authoritative Companion source in `apps/companion`, branch `creator-workspace`, [PR #5](https://github.com/Loptr-Lab/pixie-ecosystem-guide/pull/5). Preserve the separate root guide and its build. Finish release verification before adding capabilities. |
| [training](https://github.com/Loptr-Lab/training) | Canonical contributor onboarding, training, participation and review instructions. Follow its [contributor process](https://github.com/Loptr-Lab/training/blob/main/CONTRIBUTING.md); do not create another intake or dashboard. |
| [pixie-creator-os](https://github.com/ibloud/pixie-creator-os) | Specialized creative preparation and reviewed manual sharing. Review its existing project/session storage and handoff contracts for overlap before any Companion integration; no integration is approved by this status. |
| [pixie-holdings](https://github.com/ibloud/pixie-holdings) | Synthetic consequence-testing project. Its game state and examples are not private creator records or real financial instructions. Preserve the assigned work below. |
| [pixie-device-stewardship](https://github.com/ibloud/pixie-device-stewardship) | Device, accessibility and file stewardship. The existing read-only iCloud adapter is a separate bounded capability, [local-repair PR #35](https://github.com/ibloud/pixie-device-stewardship/pull/35); no mail-to-Companion integration or live-mail access is authorized here. |
| [pixie-device-stewardship-iH5F](https://github.com/ibloud/pixie-device-stewardship-iH5F) | Overlapping older repository, archival candidate only. Keep it intact until dependencies, inbound links, unique history/work, releases and a recoverable archive are verified and archival is separately approved. Those checks are not complete. |

The [canonical ecosystem architecture](https://github.com/ibloud/ibloud.github.io/blob/main/docs/ECOSYSTEM_ARCHITECTURE.md)
retains broader project and story boundaries. This page records immediate release
status, not a replacement architecture or new development roadmap.

## Companion acceptance: verified versus outstanding

PR #5's inspected head is `b1976e6bf0d39fefc212f5f634ef8d8995878a01`.
Its GitHub checks passed. The recorded local verification passed 52 tests, type
checking, Companion production build and the separate guide build/checks.
Synthetic production tests establish successful startup, `/ready` 200, 401 without
a bearer on private workspace/MCP operations, same-store API/MCP identity and
recovery after a full local server restart. Corrupt saved state gives readiness
503 and refuses restart without overwriting the data.

Chromium checks cover browser/server persistence, project isolation, backup/restore,
keyboard navigation and 320–1440px reflow. **Device and local time is inside My
projects → Reading preferences, not global.** These are browser-emulation results,
not physical iPad Safari, Files, VoiceOver or desktop screen-reader acceptance.

The existing Vercel integration reports a Ready static preview for this head.
This environment's direct preview request was blocked by the proxy:
`curl: (56) CONNECT tunnel failed, response 403`. This is not a Vercel response.
Static preview data stays in that browser/origin's IndexedDB; the preview hosts no
MCP and does not share Railway project storage.

**Railway blocker:** this session has no callable authenticated Railway tools or
approved Railway CLI/token/connection. The existing Companion project/service,
environment, volume and runtime URL have not been verified. No Railway deployment
or configuration change is established. Local tests do not prove Railway volume
persistence, HTTPS behavior or remote restart/redeploy recovery.

To resolve it, a maintainer must enable the authenticated Railway connection and
identify the existing Companion service, without pasting secrets in chat. Inspect
its current source/settings/dependencies and back up its existing volume first.
Then use the already prepared [service configuration and acceptance checks](https://github.com/Loptr-Lab/pixie-ecosystem-guide/blob/creator-workspace/apps/companion/deployment/RAILWAY.md)
and [application run instructions](https://github.com/Loptr-Lab/pixie-ecosystem-guide/blob/creator-workspace/apps/companion/README.md).
Applying settings, deploying and restarting the remote service require separate
explicit authorization; this documentation update does not grant it.

Before replacement acceptance, record the actual existing HTTPS URL, deployment
commit/ID, `/ready` response, unauthorized API/MCP 401s, authenticated browser/MCP
same-project retrieval, persistent-volume attachment and successful restart and
redeploy recovery. Use disposable synthetic data; retain private records and
backups. Complete physical iPad/accessibility checks and verify the browser UI.
The owner bearer grants access to all projects in the single-owner server store;
never give it to public testers or call it multi-user isolation.

The [existing ChatGPT Site](https://pixie-project-companion.ibloud-ivxx.chatgpt.site/)
and its `/mcp` endpoint remain in place. Preserve the guide, installed plugin,
domains and original source/archives. PR #5 stays unmerged; Tangled's 152-change
mapping stays inactive. Do not retire the Site until acceptance and explicit
owner authorization. No new features, repositories or parallel workflows are
part of stabilization.

## Existing contributor assignment

[Holdings issue #18](https://github.com/ibloud/pixie-holdings/issues/18) is assigned
to **sweetytweety2406-wq**. The [maintainer's scope agreement](https://github.com/ibloud/pixie-holdings/issues/18#issuecomment-6436714216)
authorizes a proposed historical Drive archive-mapper **schema and workflow using
synthetic examples only**. Keep coordination and the eventual draft PR in Holdings;
do not implement a competing schema here, open a duplicate assignment, access
private Drive contents, or expand scope without maintainer agreement.

No corresponding draft PR was open at this check. When it arrives, the maintainer
reviews the agreed deliverable and gives actionable, file-specific feedback on
missing fields, ambiguous workflow decisions, privacy/rights boundaries and the
synthetic example. Link each requested correction to issue #18's agreed scope;
separate optional ideas from required corrections. Do not turn review into live
Drive integration or migration. Use the existing [training contributor journey](https://github.com/Loptr-Lab/training/blob/main/docs/pixie-contributors.md)
for participation and review, not a second intake process.

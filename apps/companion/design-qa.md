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

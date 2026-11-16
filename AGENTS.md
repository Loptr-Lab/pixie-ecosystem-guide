# Repository instruction entry — Loptr-Lab/pixie-ecosystem-guide

Scope: this repository. Existing public PIXIE guide and Companion source in apps/companion; guide, client/plugin and runtime are distinct.

Before work, explicitly read the [shared ecosystem instructions](https://github.com/ibloud/ibloud.github.io/blob/docs/agent-design-continuity/docs/ECOSYSTEM_INSTRUCTIONS.md)
(or `docs/ECOSYSTEM_INSTRUCTIONS.md` in a locally available `ibloud/ibloud.github.io` checkout),
then the local sources below and any applicable nested `AGENTS.md`.
A link does not automatically load or inherit instructions. The shared file is under
review in portfolio PR #59; it is not yet a merged production record. If unavailable,
identify the gap and stop only work dependent on it; do not fabricate its contents.
Local security, privacy, canon, license, tests and release authority remain local.

## Local essentials and sources

The Companion-specific instructions below retain their scope. One AT Protocol OAuth sign-in, DID-owned private workspaces and strict cross-user isolation remain mandatory. Never migrate/assign/delete legacy unowned data or claim a false save. Fail closed; preserve backup, cutover, OAuth/MCP and owner-release gates. Root build/check are not Companion acceptance. Brand guidance is not authority to resolve the held full-backend source handoff.

Read: [README.md](README.md), [brand-guidelines.md](brand-guidelines.md), [HOSTING-AND-DNS.md](HOSTING-AND-DNS.md), [COMPANION-HOSTING-STATUS.md](COMPANION-HOSTING-STATUS.md), [apps/companion/lib/principles.mjs](apps/companion/lib/principles.mjs), [apps/companion/deployment/RAILWAY.md](apps/companion/deployment/RAILWAY.md).
Inspect existing changes, open issues/PRs and unpublished work before creating a duplicate.
Use the current contribution entry in README and the local contribution policy where present;
record ideas as proposals, not automatic assignments. Identify exact source conflicts and
preserve behavior; do not invent precedence or relax a hold.

## Existing work

Reuse [brand/instruction PR #9](https://github.com/Loptr-Lab/pixie-ecosystem-guide/pull/9). Private plugin #12, runtime blockers #7 and data-loss recovery issue #17 retain their gates.

## Checks and release boundary

Commands confirmed in local scripts/configuration (not a claim of current passing results):

- `npm run check`
- `npm run build`
- `cd apps/companion && npm test`
- `cd apps/companion && npm run typecheck`
- `cd apps/companion && npm run build`

Local hosting records designate Pages guide and existing Railway Companion; migration/cutover holds remain. Current service and review behavior unverified.
No merge, deploy, release, DNS, authentication or infrastructure change is authorized
by this instruction structure. Preserve existing palettes, symbols, stylesheet ownership,
privacy and governance gates. Report committed documentation, checks, previews, merged
source and observed live behavior separately. Automated checks do not establish physical
iPad/Safari/VoiceOver acceptance. MCP tools do not automatically discover or enforce this file.

No nested AGENTS.md was found in the inspected revision; add one only for materially different directory requirements.

---

## Retained project instructions

Read [brand-guidelines.md](brand-guidelines.md) before changing brand, copy, images or presentation. Reuse the accepted Companion sigil and existing shared CSS; do not invent replacements.

# PIXIE Companion — binding development instructions

Applies to this repository's `apps/companion` changes. Read these before editing.

## Authority and order
1. Read `apps/companion/lib/principles.mjs`, the canonical [ecosystem architecture](https://github.com/ibloud/ibloud.github.io/blob/main/docs/ECOSYSTEM_ARCHITECTURE.md), affected source, current tests, and PR discussion. Preserve established requirements; an implementation gap is **not** permission to alter scope.
2. Identify the existing owner/source, exact defect, minimum files to change, and behavior that must not change. Reuse existing functionality before proposing new code.
3. Never reinterpret temporary implementation limitations as product requirements. If requirements conflict, report the exact source conflict before changing behavior.
4. Implement only the approved correction, without extra sign-in steps, repositories, databases, services, dependencies, directories, or unrelated UI. Preserve established CSS, accessibility, privacy, exports, and legacy data.
5. Validate with unit, integration, typecheck, production build, end-to-end user flows, and security negative tests. Green CI is not proof of live iPad/provider acceptance; explicitly mark untested items.
6. Keep deployment separate from implementation: no merge, Railway release, storage migration, DNS change, plugin update, or legacy Site retirement based solely on tests. Require verified storage backup, release review, and real-world acceptance.

## Non-negotiable user contract
- Supported Atmosphere identities authenticate with **one** AT Protocol OAuth sign-in.
- Every authenticated DID gets a private workspace. No second browser/server connection key.
- A verified user can create, save, reopen, edit, export/import, and delete their own projects only.
- A signed-in user cannot access another's list, projects, selected project, sources, messages, imports, exports, deletion, or model context.
- Admin role is separate from record ownership; machine MCP credentials do not grant blanket user workspace access.
- The legacy unowned workspace file must not be silently assigned, overwritten, migrated, or deleted.
- Server outages must fail closed and never switch a logged-in Railway user into anonymous browser storage.
- Never publish private drafts or record a false save success.

## Required implementation report
Cite the exact documentation read, files changed, constraints preserved, test commands/results, CI commit SHA, and remaining unverified acceptance gates. Report deviations as failures, not as progress. No claims of deployment without verified Railway state.

These rules are project constraints, not new product decisions. Any change to them requires explicit owner approval and source-linked review.


## Canonical runtime and helper — owner amendment, 27 October 2026

One Companion application instance: the existing Railway service. The old
ChatGPT Site is a migration source pending verified data/client cutover and
explicit retirement approval, not a second permanent app. ChatGPT is a client.
Preserve original OAuth/MCP dependencies until resolved; no automatic session or
record synchronization. Keep a single persistent contextual helper, with its
restore control visible only while hidden. ChatGPT instructions belong inside
that menu, not in duplicate footer/owner-only setup controls. Use explicit
project-information consent language, not a blanket claim of no private access.
Use deployment/RAILWAY.md's existing cutover gates; consolidation is incomplete
until one canonical runtime serves users and the old writable runtime is retired.

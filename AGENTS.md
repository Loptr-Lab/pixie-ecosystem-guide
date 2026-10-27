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

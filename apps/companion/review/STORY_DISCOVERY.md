# Public historical story discovery — separate review

Made-Sick owns the reusable reader and unchanged Ledger v2 exporter:
https://github.com/ibloud/made-sick/pull/72 . The source pin and SHA-256 hashes are
in `public/shared/story-source.json`; mirrored modules must remain byte-identical.
No runtime download/eval, service, dependency, database or paid infrastructure.

## Exact change

- `lib/companion.mjs`: registers `resolve_story_account`,
  `search_public_stories`, `prepare_story_ledger` through existing dispatch/auth.
- `lib/story-discovery.mjs`: imports the reviewed Made-Sick modules and prepares
  explicit Ledger v2 drafts. Foreign/repost payloads are rejected; imported
  evidence is untrusted, not publication consent or verified ownership.
- `public/shared/story-retrieval.js`, `story-ledger.js`, `story-source.json`:
  reviewed upstream source and pins, not another implementation authority.
- `tests/story-discovery.test.mjs`: registered RPC discovery/invocation,
  unauthenticated rejection, source/ledger validation, read-only annotations,
  unexpected-field rejection and pinned-source integrity.
- `review/STORY_DISCOVERY_HTTP.json`: actual local HTTP MCP request and returned
  live historical results, with auth denial and Ledger v2 preparation. No token.
- `review/STORY_DISCOVERY_BROWSER.json`: labelled fixture browser acceptance
  replaying actual retrieved posts, with accessibility tree and viewport results.

## Root cause and actual result

The previous dispatcher/installed tool set exposed no Story Finder operation.
Existing Finder already continued after 2,500 posts; no total-depth cap was found.
It was AppView-only and did not normalize apostrophe variants. Reuse the owning
module with direct-PDS public listRecords, explicit Bluesky entryway relay and
hydrated AppView alternatives; report incomplete coverage and retained cursor.

The actual HTTP `/mcp` tool returned 10 old title posts from March–May 2025 after
checking 2,500 records in a continued batch. A full live dispatcher run examined
27,490 records in 12 bounded invocations, with 31 full-title matches and 107
original-text matches across the required phrases. Full source IDs, canonical
links, timestamps, original excerpts, endpoints and cursor/date coverage are in
Made-Sick `docs/story-history-acceptance.md` and its JSON. No claim that a CID was
cryptographically verified. Other authors' public thread context is attributed
separately and not copied into the owner's ledger.

## Validation and unchanged constraints

Read both AGENTS.md files, Companion principles, canonical ecosystem architecture,
Made-Sick retrieval/ledger/schema/tests, existing dispatcher/server/adapters/tests,
`deployment/RAILWAY.md`, current open PR listings and PR #12 body/diff/discussion.

- Companion `npm test`: **86/86 pass**.
- `npm run typecheck`, `npm run build`: pass.
- Root guide `npm run check`, `npm run build`: pass.
- Made-Sick `cd tests && npm test`: **85/85 pass**, including identity, pagination,
  >2,500 continuation, normalization, errors, 429, cancel retention, duplicate/cycle
  handling, streamed size/redirect/SSRF-negative checks and existing Ledger v2.
- Actual existing local HTTP adapter/default proxy-aware server transport: new
  tool discovery, live historical search, 401 without bearer, schemaVersion 2.
- Chromium 820×1180 and 390×1180: keyboard Enter load, source selector, results,
  selection/export availability, accessible labels/live status, no JS errors or
  horizontal overflow. Network fixtures replayed real retrieved records; this
  does not claim browser-provider acceptance. Local preview was
  `http://127.0.0.1:8765/story-finder.html`; no public preview publication claimed.

Private DID isolation, legacy storage, OAuth, machine principal restrictions,
consent, existing styles, source ownership and canon remain unchanged. No
credentials were requested for public reads. MCP connection authentication is
retained separately; the HTTP acceptance used a random local test bearer.

## Release gates — not complete

Direct PDS remains blocked by the running cloud proxy: fresh HTTPS CONNECT 403 at
`https://morel.us-east.host.bsky.network/xrpc/com.atproto.repo.listRecords`, while
fresh runtime status still lists the prior allowlist. Reported settings addition
has not been observed applied. Successful live results are explicitly the
`bsky-entryway` repository relay, not direct-PDS or AppView index search.

The installed ChatGPT plugin has not acquired these new tools. **Do not declare
full assignment PASS or installed-plugin acceptance.** Local implementation and
live repository retrieval are verified; direct PDS, installed-plugin/tool
release, physical iPad Safari/VoiceOver and production-route acceptance remain
open. No source merge, Railway release, secret, DNS, storage migration or plugin
activation occurred. PR #12's disabled OAuth issuer/security work and positive
allowlist are untouched; any future inclusion must receive its own review.

## Preview build correction — 9 November 2026

The existing Vercel Companion project selected the Next.js framework even though
its existing build runs Vite and emits `tangled-site`. Deployment
`dpl_HabVG8VUjmvfVUHZMXSu8k6XNARR` completed Vite successfully, then failed with
`NEXT_OUTPUT_DIR_MISSING` while looking for `.next`.

`apps/companion/vercel.json` now disables framework inference and selects the
existing build/output directory. It affects the existing static review preview;
it adds no server, MCP endpoint, private workspace integration or Railway change.
The static preview remains browser-local and cannot establish installed-plugin
acceptance. No dependency or lockfile change is needed.

### Current direct-PDS recheck

The earlier proxy denial is historical: on 9 November at 15:17 UTC, the actual
local HTTP `/mcp` adapter with its default proxy-aware `serverFetch` successfully
searched the verified direct PDS. Two bounded pages examined 200 records, returned
one exact title match, and retained continuation. Unauthenticated access returned
401; authenticated access returned 200. Redacted public-source evidence is in
`STORY_DISCOVERY_DIRECT_PDS.json`; the ephemeral local bearer was not recorded.
This resolves the observed direct-PDS connectivity blocker for this environment,
not full historical enumeration, deployed MCP or installed-plugin acceptance.

Repair validation: 86 Companion tests, typecheck, Vite build and root guide
check/build pass. Made-Sick's existing 85 tests also pass. No runtime, OAuth,
private persistence or installed connection was changed.

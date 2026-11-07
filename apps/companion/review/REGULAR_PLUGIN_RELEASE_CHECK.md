# Regular PIXIE plugin — private release check, 7 November 2026

Prepared with Codex assistance. This is evidence for the existing release issue, not a public listing or authorization to deploy. No real tester, customer record, credentials or owner session is used in fixtures.

## 1. Verified source and resource inventory

| Resource | Exact observation | Limits |
| --- | --- | --- |
| Authoritative application source | Public `Loptr-Lab/pixie-ecosystem-guide`, `apps/companion/`; main inspected at `4b403db201500e9d2c79b148aff16529f8b1ef3f`. Authenticated GitHub account has admin/push/read permissions. AGENTS.md and deployment/RAILWAY.md identify Railway as the intended canonical application. | Existing Site remains a migration source with active connections; cutover is incomplete and not executed here. |
| Existing Railway service | Project `3befc402-a30d-40e0-a75a-f40238a9944a`, environment `ea712c96-8716-4fa3-920f-dc70143f58c6`, service `d0aa9bfc-a683-453d-a775-a22a2e87d0cc`. Connected Railway readback associates it with Dominique's Projects and `Loptr-Lab/pixie-ecosystem-guide`, branch `creator-workspace`, root `/apps/companion`. | Service access was verified through the authenticated provider; this is not a legal-ownership attestation. No variable values were fetched. |
| Railway live revision | Latest provider deployment `cfcba878-ff5e-454d-bcab-63ce475a4fb3`, SUCCESS, source `ce0202ae6d7cc12b843c7a4a92f69ba35da0125b`. Existing HTTPS domain `https://pixie-project-companion-production.up.railway.app`, MCP `/mcp`. | Direct HTTP probes from this executor fail at the outbound proxy with CONNECT 403; no HTTP status from Railway or live MCP success is inferred. |
| Railway configuration | Node server, POST JSON stateless Streamable HTTP adapter; `/ready` health check; existing `/data` 5 GB volume in US East. Six variable names read: HOST, NODE_ENV, PIXIE_DATA_FILE, PIXIE_LOCAL_OWNER, PIXIE_MCP_TOKEN, PIXIE_SESSION_SECRET. | Existing two-field staged patch `5776cfc6-60b5-4a4b-bfae-734e5eaed5ef` remains untouched. No service, region, replicas, volume, domain or environment values changed. |
| Site | `appgprj_6accfeb0e59881919021fb6630aff686`, title PIXIE Project Companion; caller role owner; active/public website. Saved v18 source `a957a689d5c6c2ff3c223628618482992fbef6ef`, deployment `appgdep_6ae1c5d94ab88191a11bf4a4af950c47`. Existing endpoint `https://pixie-project-companion.ibloud-ivxx.chatgpt.site/mcp`. | Public website is not public plugin distribution. No Site source, deployment, identity or audience changed. |
| Existing Sites-generated plugin | `plugin_asdk_app_sites_95d14a1ec7c08191a3a06c47a1369b1e`, USER/PRIVATE, v1.0.4, release `pluginrel_6ad52bbcd1508191ba0f9445362a797f`. Read back unchanged after regular-package creation. | Working owner connection is not independent installation proof. Preserve it. |
| Separate regular candidate | `plugins_6aef414f9e3481919d39b41e1e0880e3`, USER/PRIVATE, v0.1.0, release `pluginrel_6aef41503ce88191b24962656b429aff`. https://chatgpt.com/plugins/plugins_6aef414f9e3481919d39b41e1e0880e3 | Package was created/imported and read back; no external account installation, connection or public discoverability is claimed. |

The deployed Railway SHA was fetched and compared with main. The MCP dispatcher and browser identity implementation match; `server.mjs` differs only in a static PNG MIME entry before this candidate. Thus the observed deployed source does not contain an MCP OAuth provider or independently issued client registry.

## 2. Authentication decision

**Sites OAuth: BLOCKED for independently registered clients.** Actual protected-resource metadata retrieved with curl advertises `https://auth.openai.com`, the exact Site `/mcp` resource, and `openid`, `resource.invoke`, `email`, `offline_access`, `profile`. The established user-visible setup reports DCR unavailable (no registration endpoint) and CIMD unavailable (not advertised). Support supplied by the owner confirms that Sites uses its generated plugin flow and personal-account sharing/public submission of that identity is unsupported. This work does not override those findings. The raw OpenAI authorization-server document could not be fetched from this executor (403); absence of DCR/CIMD is not claimed as a newly independently retrieved metadata result.

The Site's MCP adapter uses Sites-injected identity after platform authorization. Its internal client is not a user-provisionable credential for an arbitrary callback. Do not copy it, invent scopes/endpoints, add a guessed registration URL or treat a generic Sign in with ChatGPT client as permission for this resource. Python urllib was separately rejected by Cloudflare browser-signature policy; curl retrieved the public resource document. Neither result proves authenticated independent access.

A final curl initialization probe received the actual Site HTTP 401 challenge with `openid resource.invoke email`. A post-creation call through the unchanged installed Sites plugin returned the 13-project catalog. The old plugin's version, release ID and private scope were then read back unchanged.

**Railway OAuth: not implemented.** Inspection of the exact deployed `server.mjs`, `lib/companion.mjs`, `lib/owner-identity.mjs` and deployed configuration shows a single machine bearer for `/mcp`, not OAuth client registration. The existing `oauth-client-metadata-railway.json` registers the browser application as an AT Protocol client; it is not an MCP authorization server or a place to add ChatGPT callback URLs. No MCP authorization/token/registration route or callback allowlist exists in the inspected server. There is no config-only OAuth registration switch to enable.

**Minimum prepared private-pilot change:** retain existing bearer authentication and add optional independently provisioned, hashed public-client grants on the same server. No OAuth provider, DCR, CIMD, AT Protocol flow, PDS, Sign in with ChatGPT or new host is introduced. The package explicitly uses API-key/bearer mode; no OAuth client or scopes are claimed. Private import accepts that configuration, but runtime host support and public-directory eligibility still require verification. If the intended host/directory requires OAuth, this bearer candidate is insufficient; a separately reviewed OAuth integration is required, not a metadata-only change.

## 3. Minimum code and configuration change — NOT DEPLOYED

- `lib/mcp-client-access.mjs` parses an optional map of opaque connection labels to SHA-256 credential hashes. Invalid data, reused owner credentials and duplicate hashes fail closed. Raw keys are never persisted in the registry, returned or packaged. Removing one grant revokes that credential when the approved server configuration is reloaded; immediate distributed revocation is not claimed.
- `server.mjs` keeps the current bearer behavior and authenticated endpoint. New-client credentials reach the same `handleRpc`/`runTool` implementation with no browser principal or private workspace service. Their discovery omits all 17 `workspace_*` operations and direct attempts receive an explicit denial. Existing legacy client discovery and private denial remain intact.
- `deployment/production.env.example` documents the optional setting without a value. It is not configured in Railway. No production credential is retrieved, generated, rotated or shared.
- Existing business logic, Site adapters, browser OAuth, accounts, storage and dependencies are unchanged. Four focused tests exercise the new access boundary.

## 4. Regular package and readback

`release/pixie-project-companion-public/` contains one portable plugin: `plugin.json`, `mcp.json`, README and the existing skill/agent metadata. Skills were copied from existing private release v1.0.4, with a short regular-pilot connection boundary appended; the original release remains unchanged. No server business logic, private App binding, `.app.json`, secrets, URLs with credentials or dependencies are shipped.

The exact owner description is used in manifest `description` and `interface.longDescription`:

> PIXIE helps Loptr Lab contributors discover projects, choose scoped tasks, prepare GitHub checkpoint drafts, and resume public issues. It does not post automatically, enroll members, or access private chat history.

The configured endpoint is the existing Railway `/mcp`; `extensions.com.openai.auth` is `{type: api_key, headerScheme: bearer}`. No credential value, OAuth client or scope is included. Private plugin creation succeeded. Readback confirmed the root identity, exact description and bearer declaration in both portable and generated legacy MCP configurations; no Site App binding was added. This proves package ingestion, not a working connection.

Archive: `pixie-project-companion-public-0.1.0.zip`, SHA-256 `5044f78428ece2415e0db8ae1709f08a745824ab82a82e18436fb968fa05e106`. The final ZIP was opened and checked: five expected files, parseable JSON, valid skill frontmatter, subtitle <=30 characters, exact remote URL, no `apps` declarations, private keys, tokens, symlinks or extra wrappers. The package contains no branding replacement. No approved public icon or publisher verification is asserted. Existing public skill distribution license/notice must be reconciled before directory submission; no new blanket license was invented.

## 5. Test results

Environment: Linux, Node v24.19.0, repository-pinned pnpm 11.25.0. The clean checkout initially lacked dependencies: baseline tests could not load Wrangler/Undici and the pinned identity SDK. The first Corepack install also failed because its default home cache was inaccessible. Repeating the repository's frozen-lockfile install with `COREPACK_HOME=/workspace/work/corepack-cache` succeeded; supply-chain policy, lockfile and manifests were not changed.

| Check | Exact execution / evidence | Result |
| --- | --- | --- |
| Supported dependency install | `COREPACK_HOME=/workspace/work/corepack-cache corepack pnpm install --frozen-lockfile --prod=false` in apps/companion | PASS after environment-only cache relocation |
| Existing baseline | `node --test tests/*.test.mjs` after installation, before access change | PASS, 84 tests |
| New access boundary | `node --test tests/mcp-client-access.test.mjs` | PASS, 4 tests |
| Combined final suite | `node --test tests/*.test.mjs` | PASS, 88 tests |
| Typecheck | `COREPACK_HOME=/workspace/work/corepack-cache corepack pnpm run typecheck` | PASS |
| Production build (local only) | `COREPACK_HOME=/workspace/work/corepack-cache corepack pnpm run build` | PASS; no deployment |
| MCP protocol | Local HTTP initialization negotiates 2025-11-25; list/discovery and initialized notification; malformed RPC, unsupported project and unknown tool errors | PASS with synthetic clients |
| Public lookup/draft | Both synthetic client grants call existing list_projects and prepare_checkpoint; draft points to Training issue creation and remains unsubmitted | PASS; 13 catalog projects; zero external calls and zero private-store accesses in this test |
| Permissions | Missing/wrong bearer, forged Sites identity, direct private operation, private API access denied; legacy credential behavior retained; independent revocation | PASS locally; no real identity acceptance claim |
| Public tool annotations | 16 public tools; boolean readOnlyHint/openWorldHint/destructiveHint present | PASS source/runtime inventory |
| Site owner tool lookup/draft/resume | Existing installed connection exercised in this conversation; checkpoint issue 42 read with dated source | PASS owner-side only, not the new regular plugin |
| Railway live HTTP/MCP | Outbound proxy CONNECT 403; web fetch also could not retrieve domain | BLOCKED, not an observed server failure |
| New regular plugin import/readback | Plugin Creator save plus source readers | PASS ingestion; connection and tool availability in a separate account NOT RUN |
| Model-level positive/negative review prompts | Five positive / three negative cases prepared in package | NOT RUN through the new regular installed connection |
| Independent external tester | No separate authorized tester session or individually provisioned live grant available; candidate is undeployed | BLOCKED; no installation proof |

No real issue, message, email, social post, private workspace or remote service record was created by protocol tests. The existing release issue receives a separate explicitly authorized public evidence update; that is not a test side effect.

## 6. Exact remaining release blockers

1. Owner review of the minimal credential-grant source and authentication choice. No deployed config-only OAuth solution exists; do not call this OAuth registration support.
2. A separately approved rollout to the same existing Railway service, including the established backup/restore and release gates. The pre-existing staged patch must not be applied incidentally. Current source pin/live credentials remain untouched.
3. Secure independent credential provisioning for a real authorized tester; no owner bearer sharing. Verify the target host can actually configure this package's bearer connection. If not, stop and review OAuth requirements before further authentication code.
4. Live protocol/security checks and separate-account import/install, public lookup/draft, denial, error recovery and disconnect/revocation. Local synthetic A/B credentials are not independent humans or hosted acceptance.
5. Resolve environment access to Railway for live verification, or obtain recorded checks from an authorized external test environment. Do not infer availability or failure from proxy denial.
6. Public directory requirements remain separate: supported authentication eligibility, verified publisher, public website/support/privacy/terms coverage, distribution rights/notice, approved icon, real demo, country/commerce decisions, portal checks and owner attestations. The five-file private candidate is not submission-ready.
7. Owner approval before any merge, public publication, MCP Market submission, purchase or Site retirement. Physical iPad/Safari/VoiceOver acceptance remains pending.

Current status: separate regular plugin created PRIVATE; candidate source prepared for review; external installation BLOCKED; public release and MCP Market NOT SUBMITTED. No new identity provider, hosting service or duplicate PIXIE tool implementation was created.

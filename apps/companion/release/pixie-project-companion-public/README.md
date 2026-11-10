# PIXIE regular plugin — private pilot candidate

This is a separate regular plugin package. It does not modify the Sites-generated private plugin, its App binding, release, OAuth or connections. No second PIXIE tool implementation or hosting service is included.

## Host gate: STOP — not a working ChatGPT bearer connection

Verified 7 November 2026: [ChatGPT authentication documentation](https://developers.openai.com/plugins/build/auth#client-identification) says ChatGPT cannot present custom API keys. The [submission portal](https://developers.openai.com/plugins/deploy/submission#authentication-limitations) has no API-key or bearer-token input, even though this manifest declaration is schema-valid. Do not follow the conditional provisioning instructions below for ChatGPT or deploy the grant pilot on that basis. Import success is not connection support.

The existing draft PR #12 proposes reviewing an MCP OAuth amendment on the same runtime, or obtaining an explicit supported API-key exception from OpenAI. Neither is implemented or release-approved. This package remains private and blocked; no token may be embedded in headers and no protected server may be declared unauthenticated. The following original pilot instructions are historical and conditional, not a supported installation path.

## Installation status: BLOCKED for external testers

The configured endpoint is the existing Railway `/mcp`, not a guessed new URL. Its current deployed authentication is a single machine bearer credential, not independently registered OAuth. No DCR/CIMD fallback, OAuth scopes, internal Site client, owner token or callback is packaged.

The paired source-only candidate adds optional `PIXIE_MCP_CLIENT_TOKEN_HASHES` so a maintainer can authorize distinct public-client credentials and revoke one independently. It is NOT deployed or configured. Until that source and configuration receive separate owner approval, do not give a tester the existing owner/machine token. An installed package or successful import does not prove the server accepts a tester.

Only public project/draft tools are intended for this pilot. New-client discovery omits workspace tools and denies direct private calls; public functions are delegated to the existing `handleRpc`/`runTool` implementation. Private browser sessions, creator records and existing Atmosphere sign-in are unchanged. Legacy machine-client behavior is preserved.

## After an approved candidate release

A maintainer must provision a separate high-entropy credential for each authorized tester through a secure channel. Store only its SHA-256 hash under an opaque client label in the new optional server setting; raw values never belong in this package, GitHub, logs or the browser UI. The source tests use explicitly synthetic values. A revoked entry takes effect when the approved configuration is reloaded by the existing service; no instantaneous live revocation is claimed.

Import/install this regular plugin privately in the supported ChatGPT host and configure its bearer/API-key connection through the host's secure connection UI, using that tester's credential. Whether the target host/imported connection supports this mode must be verified; the portable declaration alone is not proof. If it offers only OAuth or cannot store a per-user bearer, stop and record the exact incompatibility. Do not select no-auth, reuse the Site client or add a provider without review.

Use the installed connection to list projects, prepare a synthetic Training checkpoint without posting, and resume the explicit public Training issue 42. Record actual calls and results. Verify another credential and the legacy owner credential independently, private-operation denial, invalid-input handling, and disconnect/revocation. These host and separate-user checks have NOT RUN.

Remove/disconnect only this regular candidate in the host to uninstall. Leave the existing Sites-generated plugin and Site untouched. Confirm the removed connection can no longer call tools; no GitHub or private workspace deletion is involved.

## Release hold

Private only. No public listing, MCP Market submission, production deployment or merge is authorized. External tester acceptance, live credential provisioning, security review and owner approval remain mandatory. API-key authentication eligibility for an OpenAI public-directory release is not verified. Published support/privacy/terms pages, verified publisher, countries/commerce choices, approved icon, a real host demo and saved-submission review remain incomplete. Do not call this ZIP submission-ready.

Tool behavior test fixtures are not an independent human evaluation. Public-source GitHub reads can be rate-limited; report that and use the tester’s own authorized source connection or direct issue link. Never borrow the owner's account.

Support and durable release record: https://github.com/Loptr-Lab/training/issues/42
Owning source: https://github.com/Loptr-Lab/pixie-ecosystem-guide/tree/main/apps/companion

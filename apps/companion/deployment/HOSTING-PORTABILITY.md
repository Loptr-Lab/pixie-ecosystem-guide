# PIXIE Companion hosting portability

**Current runtime:** Railway is the canonical hosted Companion today. It is a deployment choice, not a PIXIE protocol, identity, or data-model requirement. Railway failure currently interrupts the hosted application; provider portability is a documented target, not yet implemented or tested.

## Recommended alternative: Render Web Service + Persistent Disk

Render is the first practical alternative to evaluate for a like-for-like hosted migration because it supports Node web services and service-attached persistent disks. It can run the Companion from the existing repository, provided the service is configured for Node 22+, the same production start command, required secrets, HTTPS, and a disk mounted at the application's data path.

- Docs: https://render.com/docs/web-services
- Persistent disks: https://render.com/docs/disks
- Deployment behavior: https://render.com/docs/deploys

**Important tradeoffs:** persistent disks are attached to a single service instance; disk-backed services cannot horizontally scale and deploys incur a brief instance swap/downtime. Disk-backed services require paid compute. Render's default filesystem is ephemeral, so all PIXIE durable data must be under the configured mount. Snapshot features are not a substitute for verified, application-consistent backups. Confirm current plan, region, disk, backup and pricing details before migration.

### Candidate mapping (not a deployment recipe or authorization)

| Railway current | Render candidate |
| --- | --- |
| Existing Node service | Web Service |
| Repository Loptr-Lab/pixie-ecosystem-guide | Same repo and reviewed release branch |
| Root /apps/companion | Root apps/companion |
| Node >=22.19 | Node >=22.19, verify runtime logs |
| node scripts/start-production.mjs | Same command |
| Railway PORT | Render-provided port; app must bind 0.0.0.0 |
| Volume mounted at /data | Persistent disk mounted at /data |
| PIXIE_DATA_FILE=/data/private/workspace.json | Preserve exact data path |
| Health/readiness /ready | Configure health check /ready and verify semantics |
| Secrets: session secret, MCP token, owner config | Transfer privately; rotate only through reviewed procedure |

Validate the current source's actual start script, environment contract, readiness behavior and persistent-file layout before creating any service. This table is a planning crosswalk; no host-specific config has been tested on Render.

## Other viable options

- **Fly.io:** Docker/Node app with a Fly Volume mounted at /data. Volumes are local to one Machine/region and are not automatically replicated. Good option if the team wants more infrastructure control; requires more operational familiarity. Docs: https://fly.io/docs/volumes/
- **Self-hosted Docker on a VPS:** strongest provider independence and potentially lowest long-term infrastructure cost, but Loptr Lab assumes responsibility for OS updates, TLS/reverse proxy, firewall, monitoring, backups, restore drills and uptime. Use a persistent host bind mount for /data; never deploy with an empty replacement volume.
- **Managed database/object storage (future architecture):** reduce dependence on host-local disks and enable multi-instance scaling, but requires a deliberate storage adapter/schema migration, backup/restore validation, authorization testing and cost review. Not a drop-in alternative today.

## Portability requirements before any move

1. Treat Git as source of truth for code/config; never for user workspace data, secrets, OAuth state, private identity material or backups.
2. Document the full persistence inventory and exact paths from live service configuration. Current source references /data; verify actual PIXIE_DATA_FILE, identity/encryption files, locks and any legacy data privately.
3. Produce a private, encrypted, owner-controlled backup and manifest; hash files; perform an isolated restore test. No verified backup/restore evidence is currently recorded.
4. Keep one writable canonical instance during migration. Do not dual-write or run two independently writable Companions against copied data.
5. Preserve DID/account boundaries, consent and provenance. Migration must not transfer browser sessions, OAuth tokens, secrets, or ownership implicitly.
6. Test a synthetic workspace end-to-end on the candidate: sign-in, save, reopen, per-user isolation, export/import, restart persistence, readiness, unauthorized access and rollback.
7. DNS/domain cutover, client endpoint changes, old-host retirement and any data transfer require explicit approval. Keep Railway and its volume intact until acceptance and rollback window complete.
8. Provider-independent backups must be stored separately from the runtime provider and recovery keys separately from encrypted backups. Test restoration periodically.

## Status

- Railway is currently the canonical hosted runtime.
- Render is the recommended first alternative for a managed-host migration evaluation.
- Fly.io and Docker/VPS are documented alternatives.
- No Render/Fly/VPS deployment, portability adapter, backup, restore, data transfer or failover has been performed or verified.
- This documentation does not authorize creating services, changing DNS, moving secrets/data, modifying Railway settings, or retiring the current service.

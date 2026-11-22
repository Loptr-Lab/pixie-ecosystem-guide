# PIXIE Development Protocol (PDP)

**Status:** Working methodology, version 0.1 — derived from existing PIXIE projects; not a claim that every project complies yet.

**Purpose:** A repeatable approach for designing, building, testing, governing, and releasing an MCP server, bot, assistant, or agentic workflow. MCP is one interface option, not the methodology itself.

## Breadcrumbs

[PIXIE Ecosystem Guide](../README.md) → [PIXIE Development Protocol](./PIXIE-DEVELOPMENT-PROTOCOL.md) → Project brief → Capability map → Implementation → Evaluation → Release evidence

## The protocol: P-I-X-I-E

### P — Purpose
- State the user, real problem, intended outcome, and non-goals.
- Describe the human workflow before selecting a model, framework, or protocol.
- Identify what success looks like in observable terms.
- Keep a project brief short enough to review and version.

**Deliverable:** Project brief and scope boundary.

### I — Intelligence and information
- Identify authoritative sources and their ownership.
- Separate verified facts, user-provided context, inference, recommendations, and unknowns.
- Define memory/context scope, retention, provenance, freshness, and deletion behavior.
- Prefer retrieval from the named source of truth over duplicated or unverified state.
- Document what the system cannot know and how it responds to missing or conflicting information.

**Deliverable:** Source-of-truth and context map.

### X — eXecution boundaries
- Inventory capabilities by authority: read, analyze, recommend, prepare, execute, publish, remember, and delete.
- For each capability, specify actor, target, scope, consent, authentication, authorization, reversibility, and audit evidence.
- Default to read-only or preparation where consequences are uncertain.
- Preview consequential actions; require explicit approval at the correct boundary.
- Fail closed when authorization, source data, or state is uncertain. Do not imply success before confirmation.

**Deliverable:** Capability/permission matrix and threat model.

### I — Interface and integration
- Build a shared capability layer where multiple interfaces are expected; adapters should not redefine authority.
- Select MCP, chat, web, voice, API, or automation interfaces based on the user workflow.
- Specify tool names, input/output schemas, error states, idempotency, pagination, rate limits, and timeout behavior.
- Keep human-readable interaction paths and accessible alternatives.
- Avoid introducing extra services, dependencies, credentials, or databases without a documented need.

**Deliverable:** Interface contract and tool specification.

### E — Evaluation and evidence
- Test the ordinary workflow, boundary cases, failures, and adversarial misuse.
- Verify permissions, consent, source attribution, privacy, and data isolation.
- Test negative cases: unauthorized action, missing context, stale/conflicting source, duplicate request, timeout, and cancellation.
- Include accessibility and human-review checks.
- Record commands, results, commit SHA, reviewer decisions, and deployment evidence. Separate code tests from real-world acceptance.

**Deliverable:** Test/evidence checklist and release record.

## Required project artifacts

1. **Brief:** purpose, users, problem, scope, non-goals, success criteria.
2. **Source map:** authoritative data, provenance, freshness, context/memory rules.
3. **Capability matrix:** capability, authority level, user, resource, consent, confirmation, reversibility, and audit.
4. **Interface specification:** schemas, errors, behavior, and adapter boundaries.
5. **Risk review:** privacy, security, abuse, failure, and human impact.
6. **Evaluation plan:** happy paths, negative tests, accessibility, and acceptance criteria.
7. **Release record:** source SHA, test results, known limitations, deployment evidence, rollback and handoff.

The brief and tool-spec templates are included inline above. Copy them into the project's documentation and adapt them; do not treat a template as a substitute for project-specific decisions.

## Capability authority levels

| Level | Meaning | Default |
|---|---|---|
| Read | Retrieve or inspect approved information | Allowed only within access scope |
| Analyze | Interpret data or explain options | Clearly label inference |
| Recommend | Suggest a course of action | Human decides |
| Prepare | Draft or stage an action | Preview and editable |
| Execute | Make a change with external effect | Explicit authorization and confirmation |
| Publish / send | Expose content to other people or services | Separate approval gate |
| Remember | Persist user/project context | Explain scope, retention, and control |
| Delete | Remove data or state | Verify target and completion |

A capability may combine levels only when its contract explicitly says so. One permission does not grant adjacent permissions.

## Project brief template

- Project / version:
- User and workflow:
- Problem / desired outcome:
- Non-goals:
- Success criteria:
- Source of truth:
- Context and memory:
- Capabilities:
- Authority and consent:
- Interface(s):
- Risks and mitigations:
- Test and acceptance plan:
- Deployment / rollback:
- Owner and review date:

## Tool specification template

For every tool, document:
- Name and plain-language purpose
- Input schema, required fields, validation
- Output schema and provenance
- Authority level and permission check
- Side effects, idempotency, and reversibility
- Confirmation/preview requirements
- Failure modes and safe error responses
- Logging/audit expectations
- Test cases including unauthorized and malformed calls

## Release gate

A release is not ready merely because the build passes. Require:
- Scope and source review
- Tests pass at the proposed commit
- No unresolved high-risk authorization/privacy issue
- Tool contracts and user-facing limitations documented
- Review of consequential action gates
- Deployment target and rollback documented
- Real-world acceptance items explicitly marked verified or unverified
- No deployment or migration without separate authorization where required

## Existing PIXIE examples

This protocol is being grounded in existing work, not invented in isolation:
- **PIXIE Ecosystem Guide:** source and status boundaries; the guide is not a live assistant.
- **PIXIE Companion:** explicit ownership, authentication, privacy, fail-closed behavior, and deployment acceptance gates.
- **PIXIE Holdings MCP:** preview/prepare operations and no implied authority to spend, publish, or transmit.
- **Project Companion:** bounded tools, source context, and documented limitations.

These are examples to inspect; they are not a blanket certification of every implementation.

## Breadcrumb and navigation convention

For protocol and implementation documentation, keep a short trail:
**Ecosystem Guide → Development Protocol → Project Brief → Capability/Permission Map → Tool Contract → Tests/Evidence → Release Record.**

A breadcrumb identifies the current document and its parent; it must not imply a software integration, shared service, or deployment that has not been verified.

## Change control

Version this methodology through reviewed pull requests. When a project uncovers a reusable lesson, propose an amendment with the project, evidence, and impact. Keep project-specific exceptions documented locally and linked back here. Do not silently weaken consent, authority, privacy, or testing requirements.

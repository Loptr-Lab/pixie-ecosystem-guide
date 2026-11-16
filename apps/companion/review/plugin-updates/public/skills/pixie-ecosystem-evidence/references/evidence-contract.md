# Evidence review input

The executable accepts one JSON object on stdin: `{"record":{...},"review":{...}}`.

record needs task_id (explicit task identifier), revision (positive task revision), project_id (selected project identifier). These are reported context, not authenticated approval.

review has the same task_id/revision/project_id, plus:
- instructions and sources: arrays of {id, project_id, reference, status: read|unread|failed, excerpt}. Read entries require actual substantive content. IDs must be unique. Use explicit owner-message references for owner confirmations. Contextual cross-project sources require separate scoped review; do not pretend they belong to the selected project.
- existing_work: existing assignment/implementation and smallest change.
- preserved_decisions: nonempty list of fixed owner requirements and project boundaries.
- claims: array of {text, project_id, kind, presentation, evidence_ids, check_ids}. Match source_text/source_attributed, owner_confirmation/owner_confirmed, inference/interpretation, proposal/proposed, unresolved/unresolved. Only source_text may use verified_result, with known evidence_ids and known passed check_ids containing observed evidence. Omitting claims does not validate an unexamined draft.
- checks: array of {id, status: passed|failed|unverified, evidence}.

No network, storage, credentials, publication or actions are performed. Empty missing evidence must block, not be invented. A successful report is a consistency result, not independent truth or permission.

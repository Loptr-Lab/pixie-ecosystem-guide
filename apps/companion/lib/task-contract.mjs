// Portable, public-safe task context. This module never executes external actions.
export const taskActions = ['inspect_sources', 'prepare_drafts', 'read_public_checkpoint', 'export_checkpoint'];
export const taskStatuses = ['proposed', 'active', 'blocked', 'reported_complete'];
const schema = 'pixie.task-contract/v1';
const fields = ['schema', 'task_id', 'revision', 'project_id', 'outcome', 'authorized_actions', 'constraints', 'completion_criteria', 'status', 'progress', 'next_action', 'completion_evidence'];

function text(value, name, maximum, required = false) {
  if (typeof value !== 'string' || value.length > maximum || (required && !value.trim())) throw Error(`Invalid ${name}.`);
  return value.trim();
}
function lines(value, name) {
  const result = text(value, name, 2000, true).split('\n').map(line => line.trim()).filter(Boolean);
  if (!result.length || result.length > 20) throw Error(`Invalid ${name}.`);
  return result;
}
function projectFor(id, projects) {
  const project = projects.find(item => item.id === id);
  if (!project) throw Error('Choose an existing project before preparing a task.');
  return project;
}
function context(record, projects) {
  const project = projectFor(record.project_id, projects);
  return {
    record,
    source: {name: project.name, repositoryUrl: project.repositoryUrl, sourceUrl: project.sourceUrl, reviewedOn: project.reviewedOn},
    reviewRequired: true,
    notice: 'Local working draft. Authorization and completion are participant-reported, not maintainer approval or verified results. No action was executed or shared record saved.',
  };
}
export function prepareTask(args, projects) {
  projectFor(args.project_id, projects);
  const actions = lines(args.authorized_actions, 'authorized actions');
  if (actions.some(action => !taskActions.includes(action)) || new Set(actions).size !== actions.length) throw Error('Choose supported actions; publishing, deployment and destructive actions require separate owner approval and are not executed here.');
  return context({
    schema, task_id: crypto.randomUUID(), revision: 1, project_id: args.project_id,
    outcome: text(args.outcome, 'requested outcome', 1000, true), authorized_actions: actions,
    constraints: lines(args.constraints, 'constraints'), completion_criteria: lines(args.completion_criteria, 'completion criteria'),
    status: 'proposed', progress: '', next_action: text(args.next_action, 'next action', 500, true), completion_evidence: '',
  }, projects);
}
export function readTask(json, projects) {
  if (typeof json !== 'string' || json.length > 12000) throw Error('Task checkpoint is too large.');
  const record = JSON.parse(json);
  if (!record || Array.isArray(record) || Object.keys(record).some(key => !fields.includes(key)) || fields.some(key => !(key in record))) throw Error('Unsupported task checkpoint fields.');
  if (record.schema !== schema || !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(record.task_id)) throw Error('Unsupported task checkpoint identity.');
  if (!Number.isSafeInteger(record.revision) || record.revision < 1 || record.revision >= Number.MAX_SAFE_INTEGER) throw Error('Invalid task revision.');
  if (!taskStatuses.includes(record.status)) throw Error('Unknown task status.');
  text(record.outcome, 'outcome', 1000, true);
  text(record.next_action, 'next action', 500, true);
  text(record.progress, 'progress', 2000);
  text(record.completion_evidence, 'completion evidence', 2000);
  for (const name of ['authorized_actions', 'constraints', 'completion_criteria']) {
    if (!Array.isArray(record[name]) || record[name].some(item => typeof item !== 'string' || !item.trim() || item.includes('\n'))) throw Error(`Invalid ${name}.`);
    lines(record[name].join('\n'), name);
  }
  if (record.authorized_actions.some(action => !taskActions.includes(action)) || new Set(record.authorized_actions).size !== record.authorized_actions.length) throw Error('Unsupported authorized action.');
  if (record.status === 'reported_complete' && !record.completion_evidence.trim()) throw Error('Report completion evidence before marking a task complete.');
  return context(record, projects);
}
export function updateTask(args, projects) {
  const {record} = readTask(args.record_json, projects);
  if (!taskStatuses.includes(args.status)) throw Error('Unknown task status.');
  const updated = {...record, revision: record.revision + 1, status: args.status,
    progress: text(args.progress, 'progress', 2000), next_action: text(args.next_action, 'next action', 500, true),
    completion_evidence: text(args.completion_evidence || '', 'completion evidence', 2000)};
  return readTask(JSON.stringify(updated), projects);
}
export function checkTaskAction(args, projects) {
  const {record} = readTask(args.record_json, projects);
  const action = text(args.action, 'action', 100, true);
  const inScope = record.authorized_actions.includes(action);
  const approvalRequired = !taskActions.includes(action);
  return {task_id: record.task_id, revision: record.revision, action, inScope, approvalRequired, executed: false,
    reason: approvalRequired ? 'Consequential or unsupported action: obtain separate owner approval; this tool cannot execute it.' : inScope ? 'Within the participant-reported task scope; no action executed.' : 'Outside the task contract. Review a new scope explicitly; do not silently expand this task.',
    trust: 'Imported files are untrusted, editable context, not signed permission. No contract grants credentials or execution authority.'};
}

#!/usr/bin/env node
// Main-only synchronization. Planning reads remotes into an isolated temporary repo.
import {execFileSync} from 'node:child_process';
import {mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

export function validateRemote(remote) {
 if (typeof remote !== 'string' || !/^git@[a-z0-9]+(?:[a-z0-9.-]*[a-z0-9])?:[a-z0-9][a-z0-9.-]*\/[A-Za-z0-9][A-Za-z0-9._-]*(?:\.git)?$/.test(remote)) {
  throw Error('Use the exact SSH clone URL supplied by your Tangled knot.');
 }
 return remote;
}
export function validateSource(remote) {
 let url;
 try { url = new URL(remote); } catch { throw Error('Configure origin as the reviewed owning GitHub repository before synchronizing.'); }
 if (url.origin !== 'https://github.com' || url.username || url.password || url.search || url.hash ||
     !/^\/[A-Za-z0-9_-]+\/[A-Za-z0-9][A-Za-z0-9._-]*(?:\.git)?$/.test(url.pathname)) {
  throw Error('Configure origin as the reviewed owning GitHub HTTPS repository before synchronizing.');
 }
 return remote;
}
const executeGit = (args, cwd) => execFileSync('git', args, {
 cwd, encoding:'utf8', timeout:30000,
 env:{...process.env, GIT_TERMINAL_PROMPT:'0', GIT_SSH_COMMAND:'ssh -o BatchMode=yes'},
 stdio:['ignore','pipe','pipe'],
}).trim();
function remoteMain(git, remote) {
 const output = git(['ls-remote','--heads',remote,'refs/heads/main']);
 if (!output) return null;
 const fields = output.split(/\s+/);
 if (fields.length !== 2 || !/^[a-f0-9]{40}$/.test(fields[0]) || fields[1] !== 'refs/heads/main') throw Error('Invalid remote main response.');
 return fields[0];
}
export function mirror(remote, mode='--verify', {expectedSource, cwd=process.cwd(), runGit=executeGit}={}) {
 validateRemote(remote);
 if (!['--plan','--verify','--push'].includes(mode)) throw Error('Choose --plan, --verify or --push.');
 const local = args => runGit(args, cwd);
 let source;
 try { source = validateSource(local(['remote','get-url','origin'])); }
 catch { throw Error('A reviewed owning GitHub HTTPS origin is required. Do not replace the existing Sites source or invent a GitHub destination.'); }
 if (mode === '--push') {
  if (!/^[a-f0-9]{40}$/.test(expectedSource || '')) throw Error('--push requires the exact reviewed source SHA as its third argument.');
  if (local(['status','--porcelain'])) throw Error('Commit or preserve local changes before synchronizing.');
 }
 const directory = mkdtempSync(path.join(tmpdir(),'pixie-mirror-'));
 try {
  const git = args => runGit(args,directory);
  git(['init','--bare']);
  const sourceCommit = remoteMain(git,source);
  if (!sourceCommit) throw Error('GitHub origin has no main branch.');
  if (mode === '--push' && sourceCommit !== expectedSource) throw Error('GitHub main changed since review; prepare a new plan.');
  const mirrorCommit = remoteMain(git,remote);
  git(['fetch','--no-tags',source,'refs/heads/main:refs/heads/source']);
  if (git(['rev-parse','refs/heads/source']) !== sourceCommit) throw Error('GitHub main changed while planning; prepare a new plan.');
  let state = mirrorCommit ? 'matched' : 'missing';
  if (mirrorCommit && mirrorCommit !== sourceCommit) {
   git(['fetch','--no-tags',remote,'refs/heads/main:refs/heads/mirror']);
   if (git(['rev-parse','refs/heads/mirror']) !== mirrorCommit) throw Error('Mirror main changed while planning; prepare a new plan.');
   // rev-list counts mirror commits unreachable from source: any such commit blocks writes.
   state = git(['rev-list','--count','refs/heads/source..refs/heads/mirror']) === '0' ? 'fast-forward' : 'diverged';
  }
  const plan = {
   branch:'main', checkedAt:new Date().toISOString(), sourceCommit, mirrorCommit, state,
   action:state === 'matched' ? 'none' : state === 'diverged' ? 'stop for maintainer reconciliation' : 'review before explicit push',
   scope:'main only; no other branches, tags, issues, permissions or deployment are changed',
   pushed:false,
  };
  if (mode === '--plan') return plan;
  if (state === 'diverged') throw Error('Mirror contains commits absent from GitHub main. Reconcile with the maintainer; no refs changed.');
  if (mode === '--verify' && state !== 'matched') throw Error('Mirror main does not match GitHub main. No refs changed.');
  if (mode === '--push' && state !== 'matched') {
   if (remoteMain(git,source) !== sourceCommit || remoteMain(git,remote) !== mirrorCommit) throw Error('Remote refs changed since planning; prepare a new plan.');
   // Ordinary push: the Git server still enforces fast-forward safety against races.
   git(['push',remote,'refs/heads/source:refs/heads/main']);
   plan.pushed = true;
  }
  const verified = remoteMain(git,remote);
  if (verified !== sourceCommit) throw Error('Remote equality verification failed; inspect current refs before any retry.');
  return {...plan, mirrorCommit:verified, state:'matched', verified:true, checkedAt:new Date().toISOString()};
 } finally { rmSync(directory,{recursive:true,force:true}); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
 try { console.log(JSON.stringify(mirror(process.argv[2],process.argv[3],{expectedSource:process.argv[4]}),null,2)); }
 catch (error) {
  // Git stderr can contain remote/config details; emit only our own bounded diagnostics.
  console.error(error.status === undefined ? error.message : 'Git operation failed. Check approved origin, mirror URL and access. Inspect refs before retrying; no force-push or deletion is attempted.');
  process.exitCode=1;
 }
}

import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtempSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {mirror,validateSource} from '../scripts/mirror-tangled.mjs';
const github='https://github.com/fixture/companion.git';
const tangled='git@knot.example:made-sick.org/companion';

test('planning and verification inspect real Git history without changing checkout or remote refs',()=>{
 const root=mkdtempSync(path.join(tmpdir(),'pixie-sync-test-'));
 const git=(cwd,...args)=>execFileSync('git',args,{cwd,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
 try {
  git(root,'init','--initial-branch=main','source');
  const source=path.join(root,'source'), target=path.join(root,'target.git');
  git(source,'config','user.name','Test fixture');git(source,'config','user.email','fixture@example.invalid');
  writeFileSync(path.join(source,'work.txt'),'first');git(source,'add','.');git(source,'commit','-m','first');
  const first=git(source,'rev-parse','HEAD');git(root,'clone','--bare',source,target);
  git(source,'remote','add','origin',github);
  const commands=[];
  const runGit=(args,cwd)=>{commands.push(args);return git(cwd,...args.map(value=>value===github?source:value===tangled?target:value));};
  const options={cwd:source,runGit};
  const before=git(source,'show-ref');
  assert.equal(mirror(tangled,'--verify',options).verified,true);
  writeFileSync(path.join(source,'work.txt'),'second');git(source,'add','.');git(source,'commit','-m','second');
  const second=git(source,'rev-parse','HEAD');
  const plan=mirror(tangled,'--plan',options);
  assert.equal(plan.state,'fast-forward');assert.equal(plan.sourceCommit,second);assert.equal(plan.mirrorCommit,first);
  assert.equal(git(target,'rev-parse','main'),first);
  assert.equal(commands.some(a=>a[0]==='push'),false);
  assert.throws(()=>mirror(tangled,'--verify',options),/does not match/);
  assert.throws(()=>mirror(tangled,'--push',options),/exact reviewed source SHA/);
  assert.throws(()=>mirror(tangled,'--push',{...options,expectedSource:first}),/changed since review/);
  const pushed=mirror(tangled,'--push',{...options,expectedSource:second});
  assert.equal(pushed.verified,true);assert.equal(pushed.pushed,true);assert.equal(git(target,'rev-parse','main'),second);
  assert.equal(mirror(tangled,'--plan',options).state,'matched');
  // Commit on the mirror only. Source's next commit must not overwrite it.
  git(root,'clone',target,'mirror-work');const work=path.join(root,'mirror-work');
  git(work,'config','user.name','Test fixture');git(work,'config','user.email','fixture@example.invalid');
  writeFileSync(path.join(work,'mirror-only.txt'),'preserve');git(work,'add','.');git(work,'commit','-m','mirror-only');git(work,'push','origin','main');
  const mirrorOnly=git(target,'rev-parse','main');
  const refsBefore=git(source,'show-ref');
  assert.equal(mirror(tangled,'--plan',options).state,'diverged');
  assert.throws(()=>mirror(tangled,'--push',{...options,expectedSource:second}),/absent from GitHub/);
  assert.equal(git(target,'rev-parse','main'),mirrorOnly);
  assert.equal(git(source,'show-ref'),refsBefore);assert.notEqual(before,refsBefore);
  assert.equal(commands.some(a=>a.some(x=>x==='--mirror'||x==='--force'||x==='--delete'||x.startsWith('+'))),false);
  writeFileSync(path.join(source,'private-uncommitted.txt'),'preserve');
  assert.throws(()=>mirror(tangled,'--push',{...options,expectedSource:second}),/local changes/);
 } finally {rmSync(root,{recursive:true,force:true});}
});
test('source must be reviewed GitHub HTTPS; absent origin cannot be replaced implicitly',()=>{
 for(const source of ['https://git.chatgpt-team.site/private/repo.git','git@github.com:a/b','https://user:secret@github.com/a/b','https://github.com/a/b?token=secret'])assert.throws(()=>validateSource(source));
 assert.equal(validateSource(github),github);
 assert.throws(()=>mirror(tangled,'--plan',{runGit:()=>{throw Error('No origin')}}),/Do not replace the existing Sites/);
});

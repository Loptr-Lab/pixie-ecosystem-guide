import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {prepareModuleMirror} from '../scripts/prepare-module-mirror.mjs';
import {mirror} from '../scripts/mirror-tangled.mjs';
test('module-root mapping preserves both ancestries and exact reviewed content, never pushes',()=>{
 const directory=mkdtempSync(path.join(os.tmpdir(),'pixie-map-test-'));const git=(cwd,...args)=>execFileSync('git',args,{cwd,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
 try{
  git(directory,'init','--initial-branch=main','source');const source=path.join(directory,'source');git(source,'config','user.name','Test fixture');git(source,'config','user.email','fixture@example.invalid');git(source,'remote','add','origin','https://github.com/fixture/guide.git');mkdirSync(path.join(source,'apps/companion'),{recursive:true});writeFileSync(path.join(source,'apps/companion/server.mjs'),'reviewed source');writeFileSync(path.join(source,'index.html'),'guide must not be mirrored');git(source,'add','.');git(source,'commit','-m','reviewed module');const sha=git(source,'rev-parse','HEAD');
  git(directory,'init','--initial-branch=main','old');const old=path.join(directory,'old');git(old,'config','user.name','Test fixture');git(old,'config','user.email','fixture@example.invalid');writeFileSync(path.join(old,'server.mjs'),'existing mirror');git(old,'add','.');git(old,'commit','-m','old mirror');const before=git(old,'rev-parse','HEAD');const target=path.join(directory,'target.git');git(directory,'clone','--bare',old,target);
  const commands=[];const url='https://tangled.org/made-sick.org/pixie-project-companion';const runner=(args,cwd)=>{commands.push(args);return git(cwd,...args.map(x=>x===url?target:x));};
  const result=prepareModuleMirror({sourceCommit:sha,expectedMirror:before,mirrorUrl:url,cwd:source,outputDirectory:path.join(directory,'review'),runGit:runner});
  assert.equal(result.contentMatchesReviewedModule,true);assert.equal(result.sameCommitId,false);assert.equal(result.pushReady,false);assert.equal(result.synchronizationActive,false);
  assert.equal(result.sourceTree,git(source,'rev-parse',sha+':apps/companion'));assert.deepEqual(result.parents,[before,sha]);
  assert.equal(git(target,'rev-parse','main'),before);assert.equal(git(source,'rev-parse','main'),sha);assert.equal(git(source,'remote','get-url','origin'),'https://github.com/fixture/guide.git');assert.equal(commands.some(a=>a[0]==='push'),false);
  assert.throws(()=>mirror('git@knot.example:made-sick.org/pixie-project-companion','--push',{expectedSource:sha,cwd:source}),/Do not mirror the whole root/);
  assert.throws(()=>prepareModuleMirror({sourceCommit:sha,expectedMirror:'a'.repeat(40),mirrorUrl:url,cwd:source,runGit:runner}),/changed or is unavailable/);
 }finally{rmSync(directory,{recursive:true,force:true});}
});

#!/usr/bin/env node
// Read-only remote comparison and local review bundle. Intentionally no push mode.
import {execFileSync} from 'node:child_process';
import {mkdtempSync,mkdirSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const fullSha=v=>typeof v==='string'&&/^[a-f0-9]{40}$/.test(v);
const run=(args,cwd)=>execFileSync('git',args,{cwd,encoding:'utf8',timeout:30000,env:{...process.env,GIT_TERMINAL_PROMPT:'0'},stdio:['ignore','pipe','pipe']}).trim();
export function prepareModuleMirror({sourceCommit,expectedMirror,mirrorUrl,cwd=process.cwd(),outputDirectory,runGit=run}){
 if(!fullSha(sourceCommit)||!fullSha(expectedMirror))throw Error('Pin the exact reviewed source and mirror commits.');
 const mirror=new URL(mirrorUrl);
 if(mirror.origin!=='https://tangled.org'||mirror.username||mirror.password||mirror.search||mirror.hash||!/^\/[a-z0-9][a-z0-9.-]*\/[A-Za-z0-9][A-Za-z0-9._-]*$/.test(mirror.pathname))throw Error('Use the verified existing Tangled HTTPS repository URL.');
 const local=args=>runGit(args,cwd);const root=local(['rev-parse','--show-toplevel']);
 if(local(['status','--porcelain']))throw Error('Preserve and commit local source before preparing the review mapping.');
 if(local(['rev-parse','HEAD'])!==sourceCommit)throw Error('Source HEAD differs from the reviewed commit.');
 const origin=local(['remote','get-url','origin']);const source=new URL(origin);
 if(source.origin!=='https://github.com'||source.username||source.password||source.search||source.hash||!/^\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:\.git)?$/.test(source.pathname))throw Error('Keep the existing approved GitHub origin; do not infer a replacement.');
 const directory=mkdtempSync(path.join(tmpdir(),'pixie-module-map-'));
 try{
  const git=args=>runGit(args,directory);git(['init','--bare']);
  const advertised=git(['ls-remote','--heads',mirror.href,'refs/heads/main']);
  if(advertised.split(/\s+/)[0]!==expectedMirror)throw Error('Tangled main changed or is unavailable. Recompare before preparing any mapping.');
  git(['fetch','--no-tags',root,sourceCommit+':refs/heads/reviewed-source']);
  git(['fetch','--no-tags',mirror.href,'refs/heads/main:refs/heads/existing-mirror']);
  if(git(['rev-parse','refs/heads/existing-mirror'])!==expectedMirror)throw Error('Mirror changed while reading. No source or destination was modified.');
  const prefix='apps/companion';const tree=git(['rev-parse',sourceCommit+':'+prefix]);
  if(git(['cat-file','-t',tree])!=='tree')throw Error('Reviewed source has no Companion module.');
  const message='REVIEW ONLY: map '+prefix+' from '+sourceCommit+' to existing Companion mirror root\n\nSource: '+origin+'\nSource path: '+prefix+'\nMirror base: '+expectedMirror+'\nNo synchronization or deployment authorized.';
  const projected=git(['-c','user.name=PIXIE local review','-c','user.email=review@localhost','commit-tree',tree,'-p',expectedMirror,'-p',sourceCommit,'-m',message]);
  const projectedTree=git(['rev-parse',projected+'^{tree}']);if(projectedTree!==tree)throw Error('Projected tree does not match the reviewed module.');
  const changes=git(['diff','--name-status',expectedMirror,projected]);
  const result={sourceRepository:origin,sourceCommit,sourcePath:prefix,sourceTree:tree,mirrorUrl:mirror.href,mirrorBefore:expectedMirror,projectedCommit:projected,projectedTree,parents:[expectedMirror,sourceCommit],sameCommitId:false,contentMatchesReviewedModule:true,changes:changes.split('\n').filter(Boolean),pushReady:false,synchronizationActive:false,notice:'Local review mapping only. SHA differs because roots/history differ. Review all deletions, existing hosting triggers, licenses and privacy before any external action. Rebuild/hosting decisions and plugin installation are separate.'};
  if(outputDirectory){mkdirSync(outputDirectory,{recursive:true});git(['update-ref','refs/heads/mirror-review',projected]);git(['bundle','create',path.resolve(outputDirectory,'mirror-review.bundle'),'refs/heads/mirror-review']);writeFileSync(path.join(outputDirectory,'mirror-plan.json'),JSON.stringify(result,null,2)+'\n');}
  return result;
 }finally{rmSync(directory,{recursive:true,force:true});}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 try{const [sourceCommit,expectedMirror,mirrorUrl]=process.argv.slice(2);if(process.argv.length!==5)throw Error('Usage: node scripts/prepare-module-mirror.mjs <reviewed GitHub SHA> <verified Tangled SHA> <verified Tangled HTTPS URL>');console.log(JSON.stringify(prepareModuleMirror({sourceCommit,expectedMirror,mirrorUrl,outputDirectory:'review-evidence/mirror-review'}),null,2));}
 catch(error){console.error(error.status===undefined?error.message:'Read-only Git access failed. No source ref, remote destination, synchronization or deployment was changed.');process.exitCode=1;}
}

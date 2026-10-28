import test from 'node:test';
import assert from 'node:assert/strict';
import {projectConnections, projectHandoff} from '../lib/project-connections.mjs';
import {validateRemote} from '../scripts/mirror-tangled.mjs';
import {runTool} from '../lib/companion.mjs';
const project = {id:'test',name:'Test',repositoryUrl:'https://github.com/ibloud/test',issueUrl:'https://github.com/ibloud/test/issues'};
test('unconfigured mirror is explicit and GitHub keeps progress', () => {
 const result = projectConnections(project);
 assert.equal(result.mirror, null); assert.equal(result.coordinationProvider, 'github');
});
test('reviewed mirror never implies synchronization or issue migration', () => {
 const result = projectConnections({...project,tangledMirrorUrl:'https://tangled.org/made-sick.org/pixie-companion'});
 assert.match(result.mirrorStatus,/not checked/); assert.equal(result.coordinationUrl,project.issueUrl);
});
test('rejects misleading mirror destinations', () => {
 for (const url of ['https://tangled.org.evil/a/b','https://tangled.org/a/b?token=x','https://u:p@tangled.org/a/b','https://tangled.org/a/b/issues']) assert.throws(()=>projectConnections({...project,tangledMirrorUrl:url}));
});
test('portable export omits unknown participant content and secrets', () => {
 const result=projectHandoff({...project,token:'secret',chat:'private',draft:'private'});
 assert.equal(result.version,1); assert.doesNotMatch(JSON.stringify(result),/secret|"chat"|"draft"/);
});
test('mirror remote requires SSH and cannot inject git options or shell code', () => {
 assert.equal(validateRemote('git@knot1.tangled.sh:made-sick.org/pixie-companion'),'git@knot1.tangled.sh:made-sick.org/pixie-companion');
 for(const value of ['--upload-pack=evil','https://user:token@tangled.org/a/b','git@host:a/b;touch x','git@host:a/../b']) assert.throws(()=>validateRemote(value));
});
test('public API returns portable context without network access', async () => {
 const result=await runTool('export_project_handoff',{project_id:'training'},()=>{throw Error('Unexpected network');});
 assert.equal(result.format,'pixie.project-handoff'); assert.equal(result.connections.coordinationProvider,'github');
 await assert.rejects(runTool('export_project_handoff',{project_id:'training',token:'x'}));
});

test('dated mirror comparison exports only the reviewed receipt fields', () => {
 const sourceCommit='a'.repeat(40), mirrorCommit='b'.repeat(40);
 const configured={...project,tangledMirrorUrl:'https://tangled.org/made-sick.org/pixie-project-companion',tangledMirrorVerification:{branch:'main',checkedAt:'2026-10-24T12:00:00.000Z',sourceCommit,mirrorCommit,secret:'never export'}};
 const result=projectHandoff(configured);
 assert.equal(result.connections.mirrorStatus,'different at verification');
 assert.equal(result.connections.mirrorVerification.mirrorCommit,mirrorCommit);
 assert.doesNotMatch(JSON.stringify(result),/never export/);
 const equal=projectConnections({...configured,tangledMirrorVerification:{...configured.tangledMirrorVerification,mirrorCommit:sourceCommit}});
 assert.equal(equal.mirrorStatus,'matched at verification');
 assert.match(equal.mirrorVerification.scope,/Current synchronization.*not established/);
});
test('malformed or future-dated receipts cannot imply verification',()=>{
 const receipt={branch:'main',checkedAt:'2026-10-24T12:00:00.000Z',sourceCommit:'a'.repeat(40),mirrorCommit:'a'.repeat(40)};
 const configured={...project,tangledMirrorUrl:'https://tangled.org/made-sick.org/pixie-project-companion'};
 for(const override of [{sourceCommit:'2214950e'},{mirrorCommit:null},{branch:'other'},{checkedAt:'2099-01-01T00:00:00.000Z'},{checkedAt:'2026-02-30T12:00:00.000Z'}])assert.throws(()=>projectConnections({...configured,tangledMirrorVerification:{...receipt,...override}}));
 assert.throws(()=>projectConnections({...project,tangledMirrorVerification:receipt}));
});

import * as module from '../public/shared/standard-context.js';
export const standardContext=globalThis.PIXIE_STANDARD_CONTEXT||module.default;
export function prepareStandardContext(project,sourceId){
 if(project.importDefinition?.creatorDestination!==true)throw Error('This project import definition does not permit Creator OS context.');
 const saved=project.sources.find(s=>s.id===sourceId)?.standardImport;if(!saved)throw Error('Select a saved Standard.site reference.');
 const r=saved.reference,d=project.importedDrafts?.find(d=>d.sourceId===sourceId);
 if(!project.importDefinition.collections.includes(r.collection)||d&&(!project.importDefinition.operations.includes('content')||!project.importDefinition.formats.includes('text/plain')||d.text.length>project.importDefinition.maxTextLength))throw Error('The current project definition does not permit this source/content for Creator OS.');
 return standardContext.read({schema:'pixie.standard-creator-context/v1',projectId:project.id,source:{uri:r.uri,cid:r.cid,authorDid:r.authorDid,title:r.title,url:r.canonicalUrl,retrievedAt:r.retrievedAt,publishedAt:r.publishedAt},draft:d?{id:d.id,text:d.text,kind:'untrusted-local-draft'}:null,rightsDeclaration:saved.rightsDeclaration});
}

export const checkpointStorageKey='pixie.checkpoint.v1';
export function checkpointPointer(projectId,issueUrl,projects){
 const project=projects.find(p=>p.id===projectId);
 if(!project||typeof issueUrl!=='string')throw new Error('Choose a known project and its public issue URL.');
 const url=new URL(issueUrl);
 const prefix='/'+project.repository+'/issues/';
 if(url.origin!=='https://github.com'||url.username||url.password||url.search||url.hash||!url.pathname.startsWith(prefix)||!/^\d+$/.test(url.pathname.slice(prefix.length)))throw new Error('Choose an issue in the selected project.');
 return {version:1,projectId,issueUrl:url.href};
}
export function readCheckpointPointer(raw,projects){
 try{const value=JSON.parse(raw);if(value.version!==1)return null;return checkpointPointer(value.projectId,value.issueUrl,projects);}catch{return null;}
}

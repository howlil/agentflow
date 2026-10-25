import {mkdir,writeFile} from 'node:fs/promises';
import {decodeContract,buildPrompt} from './contract.mjs';
export async function prepare({repository,owner,issueNumber,token,request=fetch}) {
 if(!/^[\w.-]+\/[\w.-]+$/.test(repository)||!owner||!token||!/^[1-9][0-9]{0,8}$/.test(String(issueNumber)))
  throw new Error('Invalid trusted execution context');
 const response=await request('https://api.github.com/repos/'+repository+'/issues/'+issueNumber,{
  headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'},
  signal:AbortSignal.timeout(15000)
 });
 if(!response.ok) throw new Error('GitHub issue fetch failed: '+response.status);
 const issue=await response.json();
 if(issue.state!=='open'||issue.pull_request||issue.user?.login?.toLowerCase()!==owner.toLowerCase())
  throw new Error('Only open issues authored by repository owner may execute');
 const contract=decodeContract(issue.body,repository);
 return {contract,prompt:buildPrompt(contract,issueNumber)};
}
if(process.argv[1] && import.meta.url===new URL('file://'+process.argv[1]).href) {
 try {
  const value=await prepare({repository:process.env.GITHUB_REPOSITORY,owner:process.env.GITHUB_REPOSITORY_OWNER,
   issueNumber:process.env.AGENTFLOW_ISSUE_NUMBER,token:process.env.GITHUB_TOKEN});
  await mkdir('.agentflow-run',{recursive:true});
  await writeFile('.agentflow-run/contract.json',JSON.stringify(value.contract,null,2)+'\n',{mode:0o600});
  await writeFile('.agentflow-run/prompt.md',value.prompt,{mode:0o600});
  console.log('Validated '+value.contract.requirements.length+' requirement(s)');
 } catch(err) {console.error(err.message);process.exitCode=1;}
}

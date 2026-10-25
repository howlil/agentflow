import {execFileSync} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {pathsFromGit} from './patch-policy.mjs';
const git=(...args)=>execFileSync('git',args,{encoding:'utf8',maxBuffer:25_000_000});
try {
 const paths=pathsFromGit(git('ls-files','--modified','--others','--exclude-standard','-z')
   .split('\0').filter(x=>x&&!x.startsWith('.agentflow-run/')).join('\0'));
 if(!paths.length) throw new Error('No code changes generated');
 git('add','--',...paths);
 const staged=pathsFromGit(git('diff','--cached','--name-only','-z','--no-renames'));
 if(!staged.length) throw new Error('No staged changes');
 if(git('diff','--cached','--raw').split('\n').some(x=>/^:.*\b(120000|160000)\b/.test(x)))
  throw new Error('Symlink/submodule changes are prohibited');
 const patch=git('diff','--cached','--binary','--no-ext-diff');
 if(!patch.trim()||Buffer.byteLength(patch)>3_000_000) throw new Error('Empty or oversized patch');
 await mkdir('.agentflow-run',{recursive:true});
 await writeFile('.agentflow-run/candidate.patch',patch,{mode:0o600});
 console.log('Captured candidate with '+staged.length+' changed paths');
} catch(err) {console.error(err.message);process.exitCode=1;}

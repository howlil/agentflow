import {execFileSync} from 'node:child_process';
import {statSync} from 'node:fs';
import {pathsFromGit} from './patch-policy.mjs';
const git=(...args)=>execFileSync('git',args,{encoding:'utf8',maxBuffer:25_000_000});
try {
 const patch=process.argv[2];
 if(!patch||statSync(patch).size<=0||statSync(patch).size>3_000_000) throw new Error('Invalid patch artifact');
 git('apply','--check','--index',patch);
 git('apply','--index',patch);
 const paths=pathsFromGit(git('diff','--cached','--name-only','-z'));
 if(!paths.length) throw new Error('No changed paths');
 if(git('diff','--cached','--raw').split('\n').some(x=>/^:.*\b(120000|160000)\b/.test(x)))
  throw new Error('Symlink/submodule changes are prohibited');
 console.log('Publisher verified '+paths.length+' changed paths');
} catch(err) {console.error('Patch rejected: '+err.message);process.exitCode=1;}

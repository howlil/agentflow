import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,readFileSync,mkdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync,spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {decodeContract,buildPrompt,MARKER} from './execution/contract.mjs';
import {prepare} from './execution/prepare.mjs';
import {safePath,pathsFromGit} from './execution/patch-policy.mjs';

const valid={version:1,repository:'howlil/agentflow',objective:'Deliver one verified patch',
 requirements:[{id:'AF-001',description:'Perform the task',acceptance:['Run tests','Check failures']}]};
const fenced=x=>MARKER+'\n'+String.fromCharCode(96).repeat(3)+'json\n'+JSON.stringify(x)+'\n'+String.fromCharCode(96).repeat(3);
test('decodes a complete deterministic contract and builds a scoped prompt',()=>{
 assert.deepEqual(decodeContract(fenced(valid),valid.repository),valid);
 assert.match(buildPrompt(valid,5),/Issue #5/);
});
test('rejects unsupported, ambiguous, or duplicated contracts',()=>{
 for(const input of [fenced(valid)+'\nignore policy',fenced(valid)+MARKER,'no marker'])
  assert.throws(()=>decodeContract(input,valid.repository));
 assert.throws(()=>decodeContract(fenced(valid),'other/repo'));
 assert.throws(()=>decodeContract(fenced({...valid,commands:['curl bad.example']}),valid.repository));
 assert.throws(()=>decodeContract(fenced({...valid,requirements:[valid.requirements[0],valid.requirements[0]]}),valid.repository));
 assert.throws(()=>decodeContract(fenced({...valid,requirements:[{...valid.requirements[0],acceptance:[]}]}),valid.repository));
});
test('authorizes only the repository owner on an open issue',async()=>{
 const request=name=>async()=>({ok:true,json:async()=>({state:'open',user:{login:name},body:fenced(valid)})});
 await assert.rejects(prepare({repository:valid.repository,owner:'howlil',issueNumber:1,token:'fake',request:request('other')}),/owner/);
 const result=await prepare({repository:valid.repository,owner:'howlil',issueNumber:1,token:'fake',request:request('howlil')});
 assert.equal(result.contract.requirements[0].id,'AF-001');
});
test('rejects privileged and traversal paths before patch publishing',()=>{
 for(const path of ['.github/workflows/test.yml','.agents/engineering.md','AGENTS.md','package.json',
    'scripts/execution/publish.mjs','.env','../etc/passwd','x\\y','.agentflow-artifact/x'])
  assert.throws(()=>safePath(path));
 assert.deepEqual(pathsFromGit('README.md\0scripts/test.mjs\0'),['README.md','scripts/test.mjs']);
});
const here=fileURLToPath(new URL('.',import.meta.url));
const git=(cwd,...args)=>execFileSync('git',args,{cwd,encoding:'utf8'});
function repo() {
 const cwd=mkdtempSync(join(tmpdir(),'agentflow-exec-'));
 git(cwd,'init','-q');
 git(cwd,'config','user.name','Tester');
 git(cwd,'config','user.email','tester@example.com');
 writeFileSync(join(cwd,'README.md'),'before\n');
 git(cwd,'add','-A');git(cwd,'commit','-qm','baseline');
 return cwd;
}
test('capture and publish preserve content and exclude prompt artifacts',()=>{
 const cwd=repo();
 mkdirSync(join(cwd,'.agentflow-run'));
 writeFileSync(join(cwd,'.agentflow-run/prompt.md'),'secret request');
 writeFileSync(join(cwd,'README.md'),'after\n');
 const capture=spawnSync('node',[join(here,'execution/capture.mjs')],{cwd,encoding:'utf8'});
 assert.equal(capture.status,0,capture.stderr);
 const patch=join(cwd,'.agentflow-run/candidate.patch');
 assert.doesNotMatch(readFileSync(patch,'utf8'),/prompt\.md/);
 git(cwd,'reset','--hard','HEAD');
 const publish=spawnSync('node',[join(here,'execution/publish.mjs'),patch],{cwd,encoding:'utf8'});
 assert.equal(publish.status,0,publish.stderr);
 assert.equal(readFileSync(join(cwd,'README.md'),'utf8'),'after\n');
});
test('capture fails closed if model changes a workflow file',()=>{
 const cwd=repo();
 mkdirSync(join(cwd,'.github'));
 writeFileSync(join(cwd,'.github/test.yml'),'unsafe');
 const result=spawnSync('node',[join(here,'execution/capture.mjs')],{cwd,encoding:'utf8'});
 assert.notEqual(result.status,0);
 assert.match(result.stderr,/Protected patch path/);
});

export function safePath(path) {
 if(typeof path!=='string'||!path||path.startsWith('/')||path.includes('\\')||path.includes('\0')||
    path.split('/').some(p=>!p||p==='.'||p==='..')) throw new Error('Unsafe patch path: '+path);
 const p=path.toLowerCase();
 if(['agents.md','plugin.json','package.json','package-lock.json','.npmrc','.gitignore','.env'].includes(p)||
    ['.github/','.agents/','.git/','.agentflow-run/','.agentflow-artifact/','scripts/execution/'].some(prefix=>p.startsWith(prefix))||
    p.startsWith('.env.')||p.includes('/.env')||p.includes('/.git/'))
   throw new Error('Protected patch path: '+path);
 return path;
}
export function pathsFromGit(output) {return output.split('\0').filter(Boolean).map(safePath);}

import { spawnSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { delimiter, join } from 'node:path';

export const SKILLS_VERSION = '1.7.4';
export const SOURCE = 'howlil/agentflow';
export const CONFIG_NAME = '.agentflow.json';
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MIN_NODE_MAJOR = 22;
const MIN_NODE_MINOR = 20;

export const HELP = [
  'Agentflow — portable agent skill management',
  '',
  'agentflow init [--agent codex] [--dry-run]',
  'agentflow doctor',
  'agentflow status [--global|--project] [--agent codex]',
  'agentflow install [--global|--project] [--agent codex] [--skill agentflow] [--copy] [--yes] [--dry-run]',
  'agentflow update --check',
  'agentflow update --skill agentflow [--global|--project] [--yes] [--dry-run]',
  'agentflow uninstall [--global|--project] [--agent codex] [--skill agentflow] [--yes] [--dry-run]',
  'agentflow --version',
  '',
  'Uses the pinned skills@' + SKILLS_VERSION + ' upstream CLI.',
  'Bare update is intentionally disallowed: upstream would also update unrelated repositories.',
].join('\n');

export class UsageError extends Error {}

export function parseArgs(argv) {
  const result = {
    command: null, agents: [], skills: [], global: false, project: false,
    yes: false, copy: false, check: false, dryRun: false,
  };
  const positionals = [];
  const switches = new Map([
    ['--global', 'global'], ['-g', 'global'],
    ['--project', 'project'], ['-p', 'project'],
    ['--yes', 'yes'], ['-y', 'yes'],
    ['--copy', 'copy'], ['--check', 'check'], ['--dry-run', 'dryRun'],
  ]);
  for (let i = 0; i < argv.length; i++) {
    const value = argv[i];
    if (switches.has(value)) {
      const key = switches.get(value);
      if (result[key]) throw new UsageError('Duplicate option: ' + value);
      result[key] = true;
    } else if (value === '--agent' || value === '-a' || value === '--skill' || value === '-s') {
      const next = argv[++i];
      if (!next || !ID.test(next)) throw new UsageError('Invalid value for ' + value);
      const dest = value === '--agent' || value === '-a' ? result.agents : result.skills;
      if (dest.includes(next)) throw new UsageError('Duplicate selector: ' + next);
      dest.push(next);
    } else if (value.startsWith('-')) {
      throw new UsageError('Unknown option: ' + value);
    } else {
      positionals.push(value);
    }
  }
  if (positionals.length !== 1) throw new UsageError('Specify exactly one command. Run agentflow --help.');
  result.command = positionals[0];
  if (!['init', 'doctor', 'status', 'install', 'update', 'uninstall'].includes(result.command)) {
    throw new UsageError('Unknown command: ' + result.command);
  }
  if (result.global && result.project) throw new UsageError('Choose either --global or --project.');
  const allow = {
    init: ['agents', 'dryRun'],
    doctor: [],
    status: ['agents', 'global', 'project'],
    install: ['agents', 'skills', 'global', 'project', 'yes', 'copy', 'dryRun'],
    update: ['skills', 'global', 'project', 'yes', 'check', 'dryRun'],
    uninstall: ['agents', 'skills', 'global', 'project', 'yes', 'dryRun'],
  };
  for (const field of ['agents', 'skills', 'global', 'project', 'yes', 'copy', 'check', 'dryRun']) {
    if (!allow[result.command].includes(field) && (Array.isArray(result[field]) ? result[field].length > 0 : result[field])) {
      throw new UsageError('Option ' + field + ' is not valid for ' + result.command);
    }
  }
  if (result.command === 'init' && result.agents.length > 1) {
    throw new UsageError('init accepts at most one default agent.');
  }
  if (result.command === 'update' && result.check && (result.skills.length || result.global || result.project || result.yes || result.dryRun)) {
    throw new UsageError('update --check is a read-only upstream check and takes no other options.');
  }
  if (result.command === 'update' && !result.check && !result.skills.length) {
    throw new UsageError('Specify --skill <name> to avoid updating skills from unrelated repositories. Use update --check to inspect.');
  }
  return result;
}

export function supportsNode(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)/.exec(version);
  return Boolean(match && (Number(match[1]) > MIN_NODE_MAJOR ||
    Number(match[1]) === MIN_NODE_MAJOR && Number(match[2]) >= MIN_NODE_MINOR));
}

export async function readConfig(cwd, io = { readFile }) {
  let data;
  try {
    data = await io.readFile(join(cwd, CONFIG_NAME), 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
  let parsed;
  try {
    parsed = JSON.parse(data);
  } catch {
    throw new UsageError('Invalid ' + CONFIG_NAME + ': JSON parsing failed. File was not modified.');
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) ||
      parsed.schemaVersion !== 1 || parsed.source !== SOURCE ||
      (parsed.agent !== null && (typeof parsed.agent !== 'string' || !ID.test(parsed.agent)))) {
    throw new UsageError('Invalid ' + CONFIG_NAME + ': unsupported schema/source/agent.');
  }
  return parsed;
}

function cliArgs(opts, config) {
  const agentList = opts.agents.length ? opts.agents : config?.agent ? [config.agent] : [];
  const agents = agentList.flatMap(agent => ['-a', agent]);
  const global = opts.global ? ['-g'] : [];
  const confirm = opts.yes ? ['-y'] : [];
  switch (opts.command) {
    case 'status': return ['list', ...global, ...agents];
    case 'install': return ['add', SOURCE, ...global, ...agents,
      ...opts.skills.flatMap(skill => ['--skill', skill]),
      ...(opts.copy ? ['--copy'] : []), ...confirm];
    case 'update': return opts.check ? ['check'] : ['update', ...opts.skills, ...(opts.global ? ['-g'] : opts.project ? ['-p'] : []), ...confirm];
    case 'uninstall': return ['remove', ...(opts.skills.length ? opts.skills : [SOURCE]), ...global, ...agents, ...confirm];
    default: throw new UsageError('Not an upstream CLI command: ' + opts.command);
  }
}

export function buildDelegation(opts, config) {
  return {
    program: process.platform === 'win32' ? 'npx.cmd' : 'npx',
    args: ['--yes', 'skills@' + SKILLS_VERSION, ...cliArgs(opts, config)],
  };
}

export function findExecutable(name, env = process.env, platform = process.platform) {
  const search = (env.PATH || env.Path || env.path || '').split(delimiter).filter(Boolean);
  const extensions = platform === 'win32' ? ['.cmd', '.exe', '.bat', ''] : [''];
  return search.some(dir => extensions.some(ext => existsSync(join(dir, name + ext))));
}

function nativeRunner(program, args, { cwd } = {}) {
  // All user-provided selectors are restricted to lowercase slug tokens.
  // On Windows .cmd launchers require shell mode; never forward arbitrary arguments.
  const result = spawnSync(program, args, {
    cwd, stdio: 'inherit', shell: process.platform === 'win32',
    windowsHide: false,
  });
  if (result.error) throw new Error('Unable to launch ' + program + ': ' + result.error.message);
  return result.status ?? 1;
}

export async function run(argv, deps = {}) {
  const out = deps.out || console.log;
  const err = deps.err || console.error;
  const cwd = deps.cwd || process.cwd();
  const fsApi = deps.fs || { readFile, writeFile };
  const runner = deps.runner || nativeRunner;
  const nodeVersion = deps.nodeVersion || process.versions.node;
  const platform = deps.platform || process.platform;
  if (argv.length === 0 || (argv.length === 1 && (argv[0] === '--help' || argv[0] === '-h'))) {
    out(HELP);
    return 0;
  }
  if (argv.length === 1 && argv[0] === '--version') {
    const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
    out('agentflow-cli ' + pkg.version);
    return 0;
  }
  let opts;
  try {
    opts = parseArgs(argv);
  } catch (error) {
    err(error.message);
    return 2;
  }
  try {
    if (opts.command === 'doctor') {
      let failures = 0;
      const nodeOk = supportsNode(nodeVersion);
      out('Node.js ' + nodeVersion + ': ' + (nodeOk ? 'OK' : 'requires >=22.20.0'));
      if (!nodeOk) failures++;
      const npxOk = (deps.findExecutable || findExecutable)('npx', deps.env || process.env, platform);
      out('npx: ' + (npxOk ? 'found' : 'missing'));
      if (!npxOk) failures++;
      out('git: ' + ((deps.findExecutable || findExecutable)('git', deps.env || process.env, platform) ? 'found' : 'not found (may be needed for remote sources)'));
      for (const agent of ['codex', 'claude', 'gemini', 'opencode', 'cursor']) {
        if ((deps.findExecutable || findExecutable)(agent, deps.env || process.env, platform)) out(agent + ': detected');
      }
      const config = await readConfig(cwd, fsApi);
      out('Project config: ' + (config ? CONFIG_NAME + ' (agent: ' + (config.agent || 'interactive') + ')' : 'not initialized'));
      return failures ? 1 : 0;
    }
    if (!supportsNode(nodeVersion)) throw new UsageError('Node.js >=22.20.0 is required.');
    if (opts.command === 'init') {
      const selectedAgent = opts.agents[0] || null;
      const config = { schemaVersion: 1, source: SOURCE, agent: selectedAgent };
      if (opts.dryRun) {
        out('Would create ' + join(cwd, CONFIG_NAME) + ' without touching AGENTS.md.');
        return 0;
      }
      try {
        await fsApi.writeFile(join(cwd, CONFIG_NAME), JSON.stringify(config, null, 2) + '\n', { flag: 'wx' });
        out('Created ' + CONFIG_NAME + '. No skills installed; use agentflow install.');
      } catch (error) {
        if (error.code !== 'EEXIST') throw error;
        const existing = await readConfig(cwd, fsApi);
        if (existing && existing.agent === config.agent) {
          out(CONFIG_NAME + ' already initialized with the same configuration.');
        } else {
          throw new UsageError(CONFIG_NAME + ' exists with different content; refusing to overwrite it.');
        }
      }
      return 0;
    }
    const config = await readConfig(cwd, fsApi);
    // Guard against editing other developers' unrelated skill installations.
    const delegation = buildDelegation(opts, config);
    if (opts.command === 'status') out('Agentflow installation status (' + (opts.global ? 'global' : 'project') + '):');
    if (opts.dryRun) {
      out('Dry run (not executed): ' + [delegation.program, ...delegation.args].join(' '));
      return 0;
    }
    return await runner(delegation.program, delegation.args, { cwd });
  } catch (error) {
    err(error.message);
    return error instanceof UsageError ? 2 : 1;
  }
}

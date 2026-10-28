import { spawn, execFile } from 'node:child_process';
import { access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { homedir } from 'node:os';
import { delimiter, join } from 'node:path';
import { promisify } from 'node:util';
const exec = promisify(execFile);

export function providerEnv() {
  const env = { ...process.env };
  for (const key of Object.keys(env)) {
    if (/^(OPENAI_API_KEY|CODEX_API_KEY|ANTHROPIC_API_KEY|ANTHROPIC_AUTH_TOKEN|ANTHROPIC_BASE_URL|CLAUDE_CODE_OAUTH_TOKEN|CLAUDECODE|CLAUDE_CODE_USE_BEDROCK|CLAUDE_CODE_USE_VERTEX|CLAUDE_CODE_USE_FOUNDRY)$/.test(key)) delete env[key];
  }
  env.PATH = [join(homedir(), '.local/bin'), '/opt/homebrew/bin', '/usr/local/bin', env.PATH || '/usr/bin:/bin'].join(delimiter);
  env.CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC = '1';
  env.NO_COLOR = '1';
  return env;
}

export async function findCLI(provider) {
  const name = provider === 'codex' ? 'codex' : 'claude';
  const candidates = providerEnv().PATH.split(delimiter).map(p => join(p, name));
  if (provider === 'codex') candidates.push('/Applications/ChatGPT.app/Contents/Resources/codex-cli/CodexCLI.app/Contents/MacOS/codex', '/Applications/Codex.app/Contents/Resources/codex');
  for (const candidate of candidates) {
    try { await access(candidate, constants.X_OK); return candidate; } catch {}
  }
  return null;
}

export async function providerStatus(provider) {
  const path = await findCLI(provider);
  if (!path) return { installed: false, authenticated: false, message: 'CLI não encontrado.' };
  try {
    const { stdout, stderr } = await exec(path, provider === 'codex' ? ['login', 'status'] : ['auth', 'status'], { timeout: 15000, maxBuffer: 128000, env: providerEnv() });
    if (provider === 'codex') {
      const authenticated = /logged in using chatgpt/i.test(stdout + stderr);
      return { installed: true, authenticated, message: authenticated ? 'Login ChatGPT ativo' : 'Entre com ChatGPT no Codex CLI; login por API não é usado.' };
    }
    const auth = JSON.parse(stdout);
    const authenticated = auth.loggedIn === true && auth.authMethod === 'claude.ai' && auth.apiProvider === 'firstParty';
    return { installed: true, authenticated, message: authenticated ? 'Login Claude ativo' : 'Entre com sua assinatura no Claude Code; login por API não é usado.' };
  } catch {
    return { installed: true, authenticated: false, message: 'Login não confirmado. Autentique o CLI e atualize o status.' };
  }
}

export function cliArgs(provider, schemaPath, schema) {
  if (provider === 'codex') return [
    '--search', '-a', 'never', 'exec', '--ignore-user-config', '--skip-git-repo-check', '--ephemeral',
    '--sandbox', 'read-only', '--json', '--color', 'never', '--output-schema', schemaPath,
    '-c', 'model_provider="openai"', '-c', 'features.shell_tool=false', '-c', 'features.apply_patch=false',
    '-c', 'features.multi_agent=false', '-'
  ];
  return [
    '-p', '--output-format', 'stream-json', '--verbose', '--json-schema', JSON.stringify(schema),
    '--no-session-persistence', '--permission-mode', 'dontAsk', '--tools', 'WebSearch,WebFetch',
    '--allowedTools', 'WebSearch,WebFetch', '--disable-slash-commands', '--strict-mcp-config',
    '--mcp-config', '{"mcpServers":{}}', '--setting-sources', '',
    '--settings', '{"disableAllHooks":true}'
  ];
}

export function extractResult(provider, events) {
  if (provider === 'claude') {
    const result = events.findLast(e => e.type === 'result');
    if (result?.is_error || (result?.subtype && result.subtype !== 'success')) throw new Error(result.result || result.errors?.join(' ') || 'O Claude encerrou sem completar a pesquisa.');
    if (result?.structured_output) return result.structured_output;
    if (result?.result) return parseJSON(result.result);
  } else {
    const failed = events.findLast(e => e.type === 'turn.failed' || e.type === 'error');
    const texts = events.filter(e => e.type === 'item.completed' && e.item?.type === 'agent_message').map(e => e.item.text);
    for (const text of texts.reverse()) { try { return parseJSON(text); } catch {} }
    if (failed) throw new Error(failed.error?.message || failed.message || 'O Codex não concluiu a pesquisa.');
  }
  throw new Error('O provedor não retornou o formato esperado. Tente novamente ou copie o prompt.');
}

export function parseJSON(raw) {
  return JSON.parse(raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, ''));
}

export function spawnProvider({ path, provider, prompt, schemaPath, schema, cwd, onProgress }) {
  const child = spawn(path, cliArgs(provider, schemaPath, schema), { cwd, env: providerEnv(), stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true, detached: process.platform !== 'win32' });
  let buffer = '', bytes = 0, stderr = '', killed = false;
  const events = [];
  let hardKill;
  const cancel = () => {
    if (killed || child.exitCode !== null) return;
    killed = true;
    try { process.platform === 'win32' ? child.kill('SIGTERM') : process.kill(-child.pid, 'SIGTERM'); } catch {}
    hardKill = setTimeout(() => { try { process.platform === 'win32' ? child.kill('SIGKILL') : process.kill(-child.pid, 'SIGKILL'); } catch {} }, 2500);
    hardKill.unref();
  };
  const done = new Promise((resolve, reject) => {
    const timer = setTimeout(() => { cancel(); reject(new Error('A pesquisa atingiu 10 minutos. Tente um recorte menor ou outro provedor.')); }, 600000);
    const processLine = line => {
      try {
        const event = JSON.parse(line);
        events.push(event);
        if (event.item?.type === 'web_search' || event.type === 'assistant' && event.message?.content?.some(c => c.type === 'tool_use')) onProgress('Consultando fontes e comparando passagens…');
        if (event.type === 'turn.started' || event.type === 'system' && event.subtype === 'init') onProgress('Investigando a obra e as referências…');
      } catch {}
    };
    child.stdout.on('data', chunk => {
      bytes += chunk.length;
      if (bytes > 8000000) { cancel(); reject(new Error('A resposta excedeu o limite. Reduza o recorte.')); return; }
      buffer += chunk.toString();
      const lines = buffer.split('\n'); buffer = lines.pop();
      for (const line of lines) if (line.trim()) processLine(line);
    });
    child.stderr.on('data', chunk => { stderr = (stderr + chunk.toString()).slice(-5000); });
    child.stdin.on('error', () => {});
    child.on('error', error => { clearTimeout(timer); reject(error); });
    child.on('close', code => {
      clearTimeout(timer);
      clearTimeout(hardKill);
      if (buffer.trim()) processLine(buffer);
      if (killed) { reject(new Error('Pesquisa interrompida.')); return; }
      try {
        if (code !== 0) {
          const result = events.findLast(e => e.type === 'result');
          throw new Error(result?.result || events.findLast(e => e.type === 'error')?.message || stderr || 'O CLI encerrou sem resposta.');
        }
        resolve(extractResult(provider, events));
      } catch (error) { reject(error); }
    });
    child.stdin.end(prompt);
  });
  return { cancel, done };
}

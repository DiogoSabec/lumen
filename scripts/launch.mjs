import { spawn } from 'node:child_process';
import { mkdir, open, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const port = Number(process.env.LUMEN_PORT || 4318);
const url = `http://127.0.0.1:${port}`;
async function running() {
  try {
    const response = await fetch(`${url}/api/health`, { signal: AbortSignal.timeout(20000) });
    const data = await response.json();
    return data.app === 'lumen';
  } catch { return false; }
}
if (!await running()) {
  await mkdir(join(root, '.runtime'), { recursive: true, mode: 0o700 });
  const log = await open(join(root, '.runtime', 'server.log'), 'a', 0o600);
  const server = spawn(process.execPath, [join(root, 'server.mjs')], { cwd: root, detached: true, stdio: ['ignore', log.fd, log.fd], windowsHide: true, env: process.env });
  await writeFile(join(root, '.runtime', 'server.pid'), String(server.pid), { mode: 0o600 });
  server.unref();
  await log.close();
  let ready = false;
  for (let attempt = 0; attempt < 30; attempt++) {
    await new Promise(resolve => setTimeout(resolve, 250));
    if (await running()) { ready = true; break; }
  }
  if (!ready) throw new Error('O Lumen não iniciou. Veja .runtime/server.log ou execute npm start.');
}
if (!process.env.LUMEN_NO_OPEN) {
  if (process.platform === 'darwin') spawn('/usr/bin/open', [url], { detached: true, stdio: 'ignore' }).unref();
  else if (process.platform === 'win32') spawn('cmd', ['/c', 'start', '', url], { detached: true, stdio: 'ignore', windowsHide: true }).unref();
  else spawn('xdg-open', [url], { detached: true, stdio: 'ignore' }).unref();
}

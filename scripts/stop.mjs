import { readFile, unlink } from 'node:fs/promises';
const pidURL = new URL('../.runtime/server.pid', import.meta.url);
try {
  const pid = Number(await readFile(pidURL, 'utf8'));
  // Verify the process identity before sending a signal; PIDs can be reused.
  const { execFileSync } = await import('node:child_process');
  const command = execFileSync('/bin/ps', ['-p', String(pid), '-o', 'command='], { encoding: 'utf8' });
  const serverPath = new URL('../server.mjs', import.meta.url).pathname;
  if (!command.includes(decodeURIComponent(serverPath))) throw new Error('O processo salvo já não é o servidor Lumen.');
  process.kill(pid, 'SIGTERM');
  await unlink(pidURL);
  console.log('Servidor Lumen encerrado.');
} catch (error) {
  if (error.code === 'ENOENT' || error.code === 'ESRCH') console.log('Nenhum servidor iniciado pelo atalho está ativo.');
  else { console.error(error.message); process.exitCode = 1; }
}

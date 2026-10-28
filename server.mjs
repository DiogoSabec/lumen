import http from 'node:http';
import { readFile, writeFile, mkdir, readdir, rename, unlink, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join, resolve, extname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { studySchema, isStudy, enforceMode, validateInput } from './lib/schema.mjs';
import { buildPrompt, buildDiscussionPrompt } from './lib/prompt.mjs';
import { findCLI, providerStatus, spawnProvider } from './lib/providers.mjs';
import { checkSources, plainText } from './lib/sources.mjs';
import { collectImages, mediaName, MEDIA_TYPES } from './lib/media.mjs';

const root = fileURLToPath(new URL('.', import.meta.url));
const dataDir = process.env.LUMEN_DATA_DIR || join(root, '.data', 'studies');
const agentDir = join(root, '.runtime', 'research');
const mediaDir = process.env.LUMEN_MEDIA_DIR || (process.env.LUMEN_DATA_DIR ? join(process.env.LUMEN_DATA_DIR, 'media') : join(root, '.data', 'media'));
await Promise.all([mkdir(dataDir, { recursive: true, mode: 0o700 }), mkdir(agentDir, { recursive: true, mode: 0o700 }), mkdir(mediaDir, { recursive: true, mode: 0o700 })]);
const schemaPath = join(root, '.runtime', 'schema.json');
await writeFile(schemaPath, JSON.stringify(studySchema), { mode: 0o600 });
const port = Number(process.env.LUMEN_PORT || 4318);
const jobs = new Map();
const renders = new Map();
let healthCache;
let activeJob;

const safeError = error => String(error?.message || error).replace(/\x1b\[[0-9;]*m/g, '').replace(/(?:sk-|Bearer\s+)[A-Za-z0-9_\-.]{12,}/g, '[credencial omitida]').replaceAll(process.env.HOME || '\0', '~').slice(0, 1600);
const pathFor = id => { if (!/^[a-f0-9-]{36}$/.test(id)) throw new Error('Identificador inválido.'); return join(dataDir, `${id}.json`); };
async function save(study) {
  const file = pathFor(study.id), tmp = `${file}.${randomUUID()}.tmp`;
  await writeFile(tmp, JSON.stringify(study, null, 2), { mode: 0o600 });
  await rename(tmp, file);
}
async function listStudies() {
  const files = (await readdir(dataDir)).filter(f => /^[a-f0-9-]{36}\.json$/.test(f));
  const results = await Promise.allSettled(files.map(f => readFile(join(dataDir, f), 'utf8').then(JSON.parse)));
  return results.filter(r => r.status === 'fulfilled').map(r => ({ id: r.value.id, title: r.value.title, mode: r.value.mode, provider: r.value.provider, createdAt: r.value.createdAt, theme: r.value.request?.theme || r.value.title, depth: r.value.request?.depth || 'standard', count: r.value.items.length, completed: r.value.completed || [], demo: r.value.demo === true, round: r.value.round || 1, dynamic: r.value.mode === 'study' || !!r.value.presentation?.html })).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
// A reader's link between a Catholic fragment and a scene, stored as text so it survives new rounds.
const shortText = (value, max) => typeof value === 'string' && value.length <= max;
const validThread = t => t && typeof t === 'object' && t.church && t.scene && shortText(t.church.label, 300) && shortText(t.church.locator, 300) && shortText(t.scene.title, 300) && shortText(t.scene.locator, 300) && shortText(t.note, 600) && shortText(t.createdAt, 40);
function publicJob(job) { return { id: job.id, state: job.state, progress: job.progress, studyId: job.studyId, error: job.error, startedAt: job.startedAt }; }
async function runJob(job, input) {
  try {
    job.progress = 'Verificando o login da assinatura…';
    const auth = await providerStatus(input.provider);
    if (job.state === 'cancelled') return;
    if (!auth.authenticated) throw new Error(auth.message);
    const path = await findCLI(input.provider);
    job.progress = 'Iniciando a pesquisa em segundo plano…';
    const previous = job.previous;
    const prompt = previous ? await buildDiscussionPrompt(previous, job.message, input.language) : await buildPrompt(input);
    if (job.state === 'cancelled') return;
    const process = spawnProvider({ path, provider: input.provider, prompt, schemaPath, schema: studySchema, cwd: agentDir, onProgress: message => { if (job.state === 'running') job.progress = message; } });
    job.cancelProcess = process.cancel;
    const result = await process.done;
    if (job.state === 'cancelled') return;
    if (!isStudy(result)) throw new Error('A resposta veio em um formato incompleto. Tente um recorte menor ou outro provedor.');
    const sourced = await checkSources(enforceMode(result, input.mode), { signal: job.controller.signal, onProgress: message => { job.progress = message; } });
    if (job.state === 'cancelled') return;
    const checked = await collectImages(sourced, { mediaDir, signal: job.controller.signal, onProgress: message => { job.progress = message; } });
    if (job.state === 'cancelled') return;
    const now = new Date().toISOString();
    const kinds = new Set(checked.items.flatMap(item => item.references.map(ref => ref.kind)));
    for (const [kind, name] of [['bible', 'passagem bíblica'], ['catechism', 'referência do Catecismo'], ['church', 'documento oficial além do Catecismo']]) {
      if (!kinds.has(kind)) checked.limitations.push(`Esta etapa não confirmou uma ${name}; essa família de fontes continua em aberto.`);
    }
    // Merge user-owned fields from disk: notes may have changed during the research.
    const latest = previous ? JSON.parse(await readFile(pathFor(previous.id), 'utf8')) : null;
    const snapshot = previous ? Object.fromEntries(['title', 'scope', 'introduction', 'evidenceNote', 'items', 'closingQuestions', 'limitations', 'images', 'presentation', 'round'].map(key => [key, previous[key] ?? (key === 'round' ? 1 : '')])) : null;
    const study = { ...checked, id: previous?.id || randomUUID(), mode: input.mode, provider: input.provider, createdAt: previous?.createdAt || now, updatedAt: now, request: input, notes: latest?.notes || '', threads: latest?.threads || [], completed: [], revealed: {}, interactiveState: {}, round: (previous?.round || (previous ? 1 : 0)) + 1, conversation: [...(previous?.conversation || []), ...(previous ? [{ round: (previous.round || 1) + 1, message: job.message, response: `${checked.introduction}\n${plainText(checked.presentation.html)}`.slice(0, 12000), createdAt: now }] : [])].slice(-24), snapshots: [...(previous?.snapshots || []), ...(snapshot ? [snapshot] : [])].slice(-24) };
    await save(study);
    job.studyId = study.id; job.state = 'completed'; job.progress = 'Investigação pronta.';
  } catch (error) {
    if (job.state !== 'cancelled') { job.state = 'failed'; job.error = safeError(error); job.progress = 'A pesquisa não foi concluída.'; }
  } finally { if (activeJob === job.id) activeJob = null; }
}
function json(res, status, value) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(value));
}
async function bodyOf(req) {
  let length = 0; const chunks = [];
  for await (const chunk of req) { length += chunk.length; if (length > 256000) throw new Error('Conteúdo muito grande. Use até 20 mil caracteres de material de apoio.'); chunks.push(chunk); }
  try { return JSON.parse(Buffer.concat(chunks).toString()); } catch { throw new Error('Os dados enviados não são um JSON válido.'); }
}
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.json': 'application/json' };
const server = http.createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
  try {
    if (![ `127.0.0.1:${port}`, `localhost:${port}` ].includes(req.headers.host)) return json(res, 403, { error: 'Acesso permitido apenas neste computador.' });
    if (req.headers.origin && ![`http://127.0.0.1:${port}`, `http://localhost:${port}`].includes(req.headers.origin)) return json(res, 403, { error: 'Origem não permitida.' });
    const url = new URL(req.url, `http://127.0.0.1:${port}`);
    const path = url.pathname;
    if (['POST', 'PATCH', 'DELETE'].includes(req.method) && req.headers['x-lumen'] !== 'local') return json(res, 403, { error: 'Use o painel local para esta ação.' });
    if (path === '/api/render' && req.method === 'POST') {
      const body = await bodyOf(req);
      if (typeof body.html !== 'string' || body.html.length > 180000 || !/^[a-f0-9]{32}$/.test(body.nonce)) throw new Error('A apresentação interativa excedeu o formato permitido.');
      const id = randomUUID();
      renders.set(id, { html: body.html, nonce: body.nonce });
      if (renders.size > 40) renders.delete(renders.keys().next().value);
      return json(res, 201, { id });
    }
    const renderMatch = path.match(/^\/render\/([a-f0-9-]{36})$/);
    if (renderMatch && req.method === 'GET') {
      const render = renders.get(renderMatch[1]);
      if (!render) return json(res, 404, { error: 'Apresentação expirada. Reabra o estudo.' });
      res.setHeader('Content-Security-Policy', `sandbox allow-scripts; default-src 'none'; script-src 'nonce-${render.nonce}'; style-src 'unsafe-inline'; img-src data: http://127.0.0.1:${port}/media/ http://localhost:${port}/media/; font-src data:; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'self'`);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(render.html); return;
    }
    const mediaMatch = path.match(/^\/media\/([^/]+)$/);
    if (mediaMatch && req.method === 'GET') {
      if (!mediaName.test(mediaMatch[1])) return json(res, 404, { error: 'Imagem não encontrada.' });
      const content = await readFile(join(mediaDir, mediaMatch[1]));
      res.writeHead(200, { 'Content-Type': MEDIA_TYPES[extname(mediaMatch[1]).slice(1)], 'Cache-Control': 'private, max-age=604800, immutable' });
      res.end(content); return;
    }
    if (path === '/api/health' && req.method === 'GET') {
      if (!healthCache || Date.now() - healthCache.time > 15000) {
        const [codex, claude] = await Promise.all([providerStatus('codex'), providerStatus('claude')]);
        healthCache = { time: Date.now(), providers: { codex, claude } };
      }
      return json(res, 200, { app: 'lumen', version: '1.0.0', providers: healthCache.providers, activeJob: activeJob || null });
    }
    if (path === '/api/prompt' && req.method === 'POST') return json(res, 200, { prompt: await buildPrompt(validateInput(await bodyOf(req))) });
    if (path === '/api/jobs' && req.method === 'POST') {
      const input = validateInput(await bodyOf(req));
      if (activeJob) return json(res, 409, { error: 'Já existe uma pesquisa em andamento. Aguarde ou interrompa antes de iniciar outra.' });
      // Keep only a bounded set of completed job summaries in memory.
      for (const [id, previous] of jobs) if (jobs.size > 30 && previous.state !== 'running') jobs.delete(id);
      const job = { id: randomUUID(), state: 'running', progress: 'Preparando a investigação…', startedAt: new Date().toISOString(), controller: new AbortController() };
      jobs.set(job.id, job); activeJob = job.id;
      json(res, 202, publicJob(job));
      runJob(job, input);
      return;
    }
    const jobMatch = path.match(/^\/api\/jobs\/([a-f0-9-]{36})(\/cancel)?$/);
    if (jobMatch) {
      const job = jobs.get(jobMatch[1]);
      if (!job) return json(res, 404, { error: 'Pesquisa não encontrada. O servidor pode ter reiniciado.' });
      if (req.method === 'POST' && jobMatch[2]) {
        if (job.state === 'running') { job.state = 'cancelled'; job.progress = 'Pesquisa interrompida.'; job.controller.abort(); job.cancelProcess?.(); }
        return json(res, 200, publicJob(job));
      }
      if (req.method === 'GET' && !jobMatch[2]) return json(res, 200, publicJob(job));
    }
    if (path === '/api/studies' && req.method === 'GET') return json(res, 200, await listStudies());
    if (path === '/api/demo' && req.method === 'POST') {
      const body = await bodyOf(req);
      const mode = body.mode === 'direct' ? 'direct' : 'study';
      const fixture = JSON.parse(await readFile(join(root, 'examples', `zelda-${mode}${body.language === 'en' ? '.en' : ''}.json`), 'utf8'));
      for (const image of fixture.images || []) {
        if (image.status === 'ok' && mediaName.test(image.file)) await copyFile(join(root, 'examples', 'media', image.file), join(mediaDir, image.file)).catch(() => { image.status = 'failed'; image.message = 'Imagem do exemplo ausente nesta pasta.'; });
      }
      const study = { ...fixture, id: randomUUID(), mode, provider: 'curated', demo: true, createdAt: new Date().toISOString(), notes: '', completed: [], revealed: {} };
      await save(study);
      return json(res, 201, study);
    }
    const studyMatch = path.match(/^\/api\/studies\/([a-f0-9-]{36})$/);
    const discussMatch = path.match(/^\/api\/studies\/([a-f0-9-]{36})\/discuss$/);
    if (discussMatch && req.method === 'POST') {
      if (activeJob) return json(res, 409, { error: 'Aguarde a pesquisa atual ou interrompa antes de continuar a conversa.' });
      const previous = JSON.parse(await readFile(pathFor(discussMatch[1]), 'utf8'));
      const body = await bodyOf(req);
      if (typeof body.message !== 'string' || !body.message.trim() || body.message.length > 8000) throw new Error('Escreva sua hipótese ou pergunta, com até 8 mil caracteres.');
      const input = validateInput({ ...(previous.request || { theme: previous.title, mode: previous.mode, medium: 'Obra ou tema', depth: 'standard', scope: previous.scope, spoilers: previous.demo === true }), mode: previous.mode, provider: body.provider, language: body.language === 'en' || body.language === 'pt' ? body.language : previous.request?.language });
      const job = { id: randomUUID(), state: 'running', progress: 'Preparando a próxima etapa…', startedAt: new Date().toISOString(), controller: new AbortController(), previous, message: body.message.trim() };
      jobs.set(job.id, job); activeJob = job.id;
      json(res, 202, publicJob(job)); runJob(job, input); return;
    }
    if (studyMatch) {
      const file = pathFor(studyMatch[1]);
      if (req.method === 'DELETE') { await unlink(file); return json(res, 200, { deleted: true }); }
      const study = JSON.parse(await readFile(file, 'utf8'));
      if (req.method === 'GET') return json(res, 200, study);
      if (req.method === 'PATCH') {
        const body = await bodyOf(req);
        if (typeof body.notes === 'string' && body.notes.length <= 50000) study.notes = body.notes;
        if (Array.isArray(body.completed)) study.completed = body.completed.filter(x => Number.isInteger(x) && x >= 0 && x < study.items.length);
        if (body.revealed && typeof body.revealed === 'object') study.revealed = Object.fromEntries(Object.entries(body.revealed).filter(([key, value]) => /^\d+$/.test(key) && Number.isInteger(value) && value >= 0 && value <= 2).slice(0, 8));
        if (body.interactiveState && typeof body.interactiveState === 'object' && !Array.isArray(body.interactiveState) && JSON.stringify(body.interactiveState).length <= 20000) study.interactiveState = body.interactiveState;
        if (typeof body.hypothesisDraft === 'string' && body.hypothesisDraft.length <= 8000) study.hypothesisDraft = body.hypothesisDraft;
        if (Array.isArray(body.threads) && body.threads.length <= 40 && body.threads.every(validThread)) study.threads = body.threads.map(t => ({ church: { label: t.church.label, locator: t.church.locator }, scene: { title: t.scene.title, locator: t.scene.locator }, note: t.note, createdAt: t.createdAt }));
        await save(study); return json(res, 200, { saved: true });
      }
    }
    if (path.startsWith('/api/')) return json(res, 404, { error: 'Recurso não encontrado.' });
    if (req.method !== 'GET' && req.method !== 'HEAD') return json(res, 405, { error: 'Método não permitido.' });
    const relative = path === '/' ? 'index.html' : decodeURIComponent(path.slice(1));
    const file = resolve(root, 'public', relative);
    if (!file.startsWith(join(root, 'public') + '/') || relative.split('/').some(p => p.startsWith('.'))) return json(res, 403, { error: 'Arquivo não permitido.' });
    const content = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch (error) {
    json(res, error.code === 'ENOENT' ? 404 : 400, { error: error.code === 'ENOENT' ? 'Arquivo ou estudo não encontrado.' : safeError(error) });
  }
});
server.listen(port, '127.0.0.1', () => console.log(`Lumen disponível em http://127.0.0.1:${port}`));
server.on('error', error => { console.error(error.code === 'EADDRINUSE' ? `A porta ${port} já está em uso. Abra o Lumen existente ou defina LUMEN_PORT.` : safeError(error)); process.exit(1); });
function shutdown() {
  for (const job of jobs.values()) if (job.state === 'running') { job.controller.abort(); job.cancelProcess?.(); }
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 3500).unref();
}
process.on('SIGTERM', shutdown); process.on('SIGINT', shutdown);

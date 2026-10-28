import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { isStudy, enforceMode, validateInput } from '../lib/schema.mjs';
import { cliArgs, providerEnv, extractResult } from '../lib/providers.mjs';
import { checkSources, isPublicAddress, normalized, plainText, safeLink } from '../lib/sources.mjs';
import { buildPrompt, buildDiscussionPrompt } from '../lib/prompt.mjs';
import { collectImages, imageInfo, pageImage, wikiTitle } from '../lib/media.mjs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const fixture = JSON.parse(await readFile(new URL('../examples/zelda-study.json', import.meta.url), 'utf8'));

test('a prepared study satisfies the complete response contract', () => {
  const raw = structuredClone(fixture);
  for (const item of raw.items) { delete item.quotationStatus; for (const ref of item.references) delete ref.check; }
  raw.images = raw.images.map(({ kind, page, url, alt, caption, credit }) => ({ kind, page, url, alt, caption, credit }));
  assert.ok(isStudy(raw));
  assert.ok(!isStudy({ ...fixture, items: [{ title: 'Incomplete' }] }));
  assert.ok(!isStudy({ ...fixture, presentation: { html: '<h2>Missing fields</h2>' } }));
});

test('study mode never persists the direct explanation field', () => {
  const polluted = structuredClone(fixture);
  polluted.items[0].explanation = 'An interpretation that must not be exposed.';
  const safe = enforceMode(polluted, 'study');
  assert.equal(safe.items[0].explanation, '');
  assert.notEqual(enforceMode(polluted, 'direct').items[0].explanation, '');
});

test('invalid providers, empty themes and oversized excerpts are rejected', () => {
  assert.throws(() => validateInput({ theme: 'Zelda', provider: 'shell', mode: 'study' }));
  assert.throws(() => validateInput({ theme: ' ', provider: 'codex', mode: 'study' }));
  assert.throws(() => validateInput({ theme: 'Zelda', provider: 'codex', mode: 'study', evidence: 'x'.repeat(20001) }));
  assert.equal(validateInput({ theme: '$(touch unwanted)', provider: 'codex', mode: 'study' }).theme, '$(touch unwanted)');
});

test('CLIs are subscription-oriented and permit only research capabilities', () => {
  const codex = cliArgs('codex', '/schema.json', {});
  assert.ok(codex.includes('read-only'));
  assert.ok(codex.includes('features.shell_tool=false'));
  assert.ok(codex.includes('--ignore-user-config'));
  assert.ok(!codex.some(x => x.includes('dangerously')));
  const claude = cliArgs('claude', '/schema.json', {});
  assert.equal(claude[claude.indexOf('--tools') + 1], 'WebSearch,WebFetch');
  assert.ok(claude.includes('--no-session-persistence'));
  assert.ok(claude.includes('--strict-mcp-config'));
  assert.ok(!claude.includes('--bare'));
  const previous = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = 'test-value';
  assert.equal(providerEnv().OPENAI_API_KEY, undefined);
  if (previous === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = previous;
});

test('structured results and provider quota failures are handled', () => {
  assert.deepEqual(extractResult('codex', [{ type: 'item.completed', item: { type: 'agent_message', text: '{"ok":true}' } }]), { ok: true });
  assert.deepEqual(extractResult('claude', [{ type: 'result', subtype: 'success', structured_output: { ok: true } }]), { ok: true });
  assert.throws(() => extractResult('claude', [{ type: 'result', is_error: true, result: 'Usage limit reached' }]), /Usage limit/);
});

test('source checker locates actual text and omits unsupported quotations', async () => {
  const study = structuredClone(fixture);
  study.items = [study.items[0]];
  study.items[0].quotation = 'This phrase was invented';
  const checked = await checkSources(study, { fetcher: async url => ({ url, text: 'Fortitude is the moral virtue that ensures firmness in difficulties and constancy in the pursuit of the good.' }) });
  assert.equal(checked.items[0].quotation, '');
  assert.equal(checked.items[0].quotationStatus, 'omitted');
  assert.equal(checked.items[0].references.find(r => r.kind === 'catechism').check.status, 'located');
  assert.equal(checked.items[0].references.find(r => r.kind === 'bible').check.status, 'reachable');
});

test('failed source access is explicit and never becomes verification', async () => {
  const checked = await checkSources(fixture, { fetcher: async () => { throw new Error('HTTP 403'); } });
  assert.ok(checked.items.every(i => !i.quotation));
  assert.ok(checked.items.flatMap(i => i.references).every(r => r.check.status === 'pending'));
});

test('local URLs and reserved addresses cannot be used as source URLs', () => {
  for (const url of ['http://example.com', 'https://localhost', 'https://127.0.0.1', 'https://[::1]', 'https://foo.local', 'https://user:secret@example.com', 'javascript:alert(1)']) assert.equal(safeLink(url), '');
  for (const address of ['127.0.0.1', '10.0.0.1', '192.168.1.2', '169.254.169.254', '::1', '::ffff:127.0.0.1', 'fc00::1', 'fe80::1']) assert.equal(isPublicAddress(address), false);
  assert.equal(isPublicAddress('8.8.8.8'), true);
  assert.equal(isPublicAddress('2606:4700:4700::1111'), true);
});

test('HTML text and quotation normalization preserve text without scripts', () => {
  assert.equal(plainText('<script>doBadThing()</script><p>Amor &amp; raz&#227;o</p>'), 'Amor & razão');
  assert.equal(normalized('  “Let’s  read.” '), '"let\'s read."');
});

test('prompts preserve independent fragments, creative freedom and real user discussion', async () => {
  const prompt = await buildPrompt(validateInput({ theme: 'An unknown film', provider: 'codex', mode: 'study' }));
  assert.match(prompt, /conjuntos independentes/);
  assert.match(prompt, /liberdade criativa/);
  assert.match(prompt, /Não há resposta única/);
  const discussion = await buildDiscussionPrompt({ ...fixture, mode: 'study', conversation: [] }, 'Minha hipótese: coragem precisa de um fim bom.');
  assert.match(discussion, /Mensagem efetivamente enviada/);
  assert.match(discussion, /coragem precisa de um fim bom/);
});

const png = (w, h) => { const b = Buffer.alloc(64); b.writeUInt32BE(0x89504e47, 0); b.writeUInt32BE(0x0d0a1a0a, 4); b.writeUInt32BE(13, 8); b.write('IHDR', 12, 'latin1'); b.writeUInt32BE(w, 16); b.writeUInt32BE(h, 20); return b; };

test('images are recognized by their own bytes, never by name or header', () => {
  assert.deepEqual(imageInfo(png(640, 480)), { ext: 'png', width: 640, height: 480 });
  const gif = Buffer.from('GIF89a\x40\x01\xf0\x00' + ' '.repeat(20), 'latin1');
  assert.deepEqual(imageInfo(gif), { ext: 'gif', width: 320, height: 240 });
  const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x04, 0x00, 0x00, 0xff, 0xc0, 0x00, 0x11, 0x08, 0x01, 0x2c, 0x01, 0x90, 0x03, 0, 0, 0, 0, 0, 0]);
  assert.deepEqual(imageInfo(jpeg), { ext: 'jpg', width: 400, height: 300 });
  assert.equal(imageInfo(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>')), null);
  assert.equal(imageInfo(Buffer.from('<!doctype html><title>Just a moment...</title>')), null);
});

test('a page declares its own image, and wiki articles are recognized', () => {
  assert.equal(pageImage('<head><meta content="/img/a.png?x=1&amp;y=2" property="og:image"></head>', 'https://wiki.example.org/wiki/A'), 'https://wiki.example.org/img/a.png?x=1&y=2');
  assert.equal(pageImage("<meta name='twitter:image' content='https://cdn.example.org/b.jpg'>", 'https://example.org/'), 'https://cdn.example.org/b.jpg');
  assert.equal(pageImage('<meta property="og:image" content="http://127.0.0.1/secret.png">', 'https://example.org/'), '');
  assert.equal(wikiTitle('https://zeldawiki.wiki/wiki/File:OoT_Sheik_Artwork.png'), 'File:OoT Sheik Artwork.png');
  assert.equal(wikiTitle('https://example.org/blog/post'), '');
});

test('images are downloaded, checked and cached; failures are explicit and never shown', async t => {
  const mediaDir = await mkdtemp(join(tmpdir(), 'lumen-media-'));
  t.after(() => rm(mediaDir, { recursive: true, force: true }));
  const fetched = [];
  const imageFetcher = async url => { fetched.push(url); if (url.endsWith('fake.png')) return { url, bytes: Buffer.from('<html>blocked</html>') }; return { url, bytes: png(800, 600) }; };
  const pageFetcher = async url => ({ url, html: '<meta property="og:image" content="https://cdn.example.org/from-page.png">' });
  const wikiFetcher = async url => url.includes('/wiki/') ? 'https://cdn.example.org/from-wiki.png' : '';
  const study = { images: [
    { kind: 'character', page: '', url: 'https://cdn.example.org/direct.png', alt: 'a', caption: 'Direta', credit: 'c' },
    { kind: 'map', page: 'https://example.org/article', url: '', alt: 'b', caption: 'Pela página', credit: 'c' },
    { kind: 'item', page: 'https://wiki.example.org/wiki/Sword', url: '', alt: 'c', caption: 'Pelo wiki', credit: 'c' },
    { kind: 'other', page: '', url: 'https://cdn.example.org/fake.png', alt: 'd', caption: 'Falsa', credit: 'c' },
    { kind: 'shell', page: 'file:///etc/passwd', url: 'http://localhost/x.png', alt: 'e', caption: 'Local', credit: 'c' }
  ] };
  const result = await collectImages(study, { mediaDir, imageFetcher, pageFetcher, wikiFetcher });
  assert.deepEqual(result.images.map(i => i.status), ['ok', 'ok', 'ok', 'failed', 'failed']);
  assert.equal(result.images[1].source, 'https://cdn.example.org/from-page.png');
  assert.equal(result.images[2].source, 'https://cdn.example.org/from-wiki.png');
  assert.match(result.images[0].file, /^[a-f0-9]{32}\.png$/);
  assert.equal(result.images[0].width, 800);
  assert.match(result.images[3].message, /não é uma imagem/);
  assert.equal(result.images[4].kind, 'other');
  assert.equal(result.images[4].url, '');
  const before = fetched.length;
  await collectImages({ images: [study.images[0]] }, { mediaDir, imageFetcher, pageFetcher, wikiFetcher });
  assert.equal(fetched.length, before, 'a cached image is not downloaded again');
});

test('the reader chooses the language of the answer and of the prepared example', async () => {
  assert.equal(validateInput({ theme: 'Zelda', provider: 'codex', mode: 'study' }).language, 'pt');
  assert.equal(validateInput({ theme: 'Zelda', provider: 'codex', mode: 'study', language: 'en' }).language, 'en');
  assert.equal(validateInput({ theme: 'Zelda', provider: 'codex', mode: 'study', language: 'fr' }).language, 'pt');
  assert.match(await buildPrompt(validateInput({ theme: 'Zelda', provider: 'codex', mode: 'direct', language: 'en' })), /Idioma da resposta: inglês/);
  assert.match(await buildPrompt(validateInput({ theme: 'Zelda', provider: 'codex', mode: 'direct' })), /Idioma da resposta: português brasileiro/);
  assert.match(await buildDiscussionPrompt({ ...fixture, mode: 'study', conversation: [] }, 'Hello', 'en'), /Idioma da resposta: inglês/);
  for (const mode of ['study', 'direct']) {
    const english = JSON.parse(await readFile(new URL(`../examples/zelda-${mode}.en.json`, import.meta.url), 'utf8'));
    const portuguese = JSON.parse(await readFile(new URL(`../examples/zelda-${mode}.json`, import.meta.url), 'utf8'));
    assert.equal(english.language, 'en');
    const raw = structuredClone(english);
    delete raw.language;
    for (const item of raw.items) { delete item.quotationStatus; for (const ref of item.references) delete ref.check; }
    raw.images = raw.images.map(({ kind, page, url, alt, caption, credit }) => ({ kind, page, url, alt, caption, credit }));
    assert.ok(isStudy(raw), mode);
    assert.deepEqual(english.items.flatMap(i => i.references.map(r => [r.url, r.excerpt, r.check.status])), portuguese.items.flatMap(i => i.references.map(r => [r.url, r.excerpt, r.check.status])), 'both languages share the same checked sources');
    assert.deepEqual(english.items.map(i => i.quotation), portuguese.items.map(i => i.quotation), 'quotations stay in the source language');
  }
});

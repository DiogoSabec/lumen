import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fetchPage, openPublic, readLimited, safeLink } from './sources.mjs';

export const IMAGE_KINDS = ['character', 'place', 'map', 'item', 'scene', 'artwork', 'other'];
export const MEDIA_TYPES = { png: 'image/png', jpg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp' };
export const mediaName = /^[a-f0-9]{32}\.(png|jpg|gif|webp)$/;

// Reads the format and size from the file's own bytes; anything else is not accepted as an image.
export function imageInfo(bytes) {
  if (bytes.length > 24 && bytes.readUInt32BE(0) === 0x89504e47) return { ext: 'png', width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  if (bytes.length > 10 && bytes.toString('latin1', 0, 4) === 'GIF8') return { ext: 'gif', width: bytes.readUInt16LE(6), height: bytes.readUInt16LE(8) };
  if (bytes.length > 30 && bytes.toString('latin1', 0, 4) === 'RIFF' && bytes.toString('latin1', 8, 12) === 'WEBP') {
    const chunk = bytes.toString('latin1', 12, 16);
    if (chunk === 'VP8X') return { ext: 'webp', width: 1 + bytes.readUIntLE(24, 3), height: 1 + bytes.readUIntLE(27, 3) };
    if (chunk === 'VP8L') { const bits = bytes.readUInt32LE(21); return { ext: 'webp', width: 1 + (bits & 0x3fff), height: 1 + ((bits >>> 14) & 0x3fff) }; }
    if (chunk === 'VP8 ') return { ext: 'webp', width: bytes.readUInt16LE(26) & 0x3fff, height: bytes.readUInt16LE(28) & 0x3fff };
    return null;
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    let i = 2;
    while (i + 9 < bytes.length) {
      if (bytes[i] !== 0xff) { i++; continue; }
      const marker = bytes[i + 1];
      if (marker === 0xff || marker === 0x01 || marker >= 0xd0 && marker <= 0xd8) { i += marker === 0xff ? 1 : 2; continue; }
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return { ext: 'jpg', width: bytes.readUInt16BE(i + 7), height: bytes.readUInt16BE(i + 5) };
      i += 2 + bytes.readUInt16BE(i + 2);
    }
  }
  return null;
}

const decode = text => text.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
// The image a page declares for itself (Open Graph, Twitter card or image_src).
export function pageImage(html, pageURL) {
  const tags = html.slice(0, 400000).match(/<(meta|link)\b[^>]*>/gi) || [];
  const found = {};
  for (const tag of tags) {
    const attrs = {};
    for (const [, name, , a, b, c] of tag.matchAll(/([\w:-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/g)) attrs[name.toLowerCase()] = decode(a ?? b ?? c ?? '');
    const key = (attrs.property || attrs.name || attrs.rel || '').toLowerCase();
    const value = attrs.content || attrs.href;
    if (value && ['og:image:secure_url', 'og:image', 'og:image:url', 'twitter:image', 'twitter:image:src', 'image_src'].includes(key)) found[key] ??= value;
  }
  for (const key of ['og:image:secure_url', 'og:image', 'og:image:url', 'twitter:image', 'twitter:image:src', 'image_src']) {
    if (!found[key]) continue;
    try { const url = safeLink(new URL(found[key], pageURL).href); if (url) return url; } catch {}
  }
  return '';
}

// Wikis (Wikipedia, Commons, Fandom, game wikis) answer through the MediaWiki API even when
// their HTML sits behind a bot challenge. Asks for the article's main image or the file itself.
export function wikiTitle(pageURL) {
  try { const match = new URL(pageURL).pathname.match(/^\/wiki\/(.+)$/); return match ? decodeURIComponent(match[1]).replace(/_/g, ' ') : ''; } catch { return ''; }
}
export async function fetchWikiImage(pageURL, signal) {
  const title = wikiTitle(pageURL);
  if (!title) return '';
  const file = /^(file|arquivo|ficheiro|image|imagem):/i.test(title);
  for (const path of ['/w/api.php', '/api.php']) {
    const api = new URL(path, pageURL);
    const params = { action: 'query', format: 'json', redirects: '1', titles: title, ...(file ? { prop: 'imageinfo', iiprop: 'url', iiurlwidth: '1200' } : { prop: 'pageimages', piprop: 'thumbnail|original', pithumbsize: '1200' }) };
    for (const [key, value] of Object.entries(params)) api.searchParams.set(key, value);
    try {
      const { response } = await openPublic(api.href, signal, 'application/json');
      if (!/json/.test(response.headers.get('content-type') || '')) { await response.body?.cancel(); continue; }
      const data = JSON.parse((await readLimited(response, 1000000, 'Resposta grande demais.')).toString('utf8'));
      for (const page of Object.values(data?.query?.pages || {})) {
        const found = file ? page.imageinfo?.[0]?.thumburl || page.imageinfo?.[0]?.url : page.thumbnail?.source || page.original?.source;
        const url = found && safeLink(found);
        if (url) return url;
      }
      return '';
    } catch (error) { if (signal?.aborted) throw error; }
  }
  return '';
}

export async function fetchImage(raw, signal) {
  const { url, response } = await openPublic(raw, signal, 'image/webp,image/png,image/jpeg,image/gif;q=0.9,*/*;q=0.1');
  const type = response.headers.get('content-type') || '';
  if (/text\/|json|xml|svg/i.test(type)) { await response.body?.cancel(); throw new Error('O endereço não aponta para uma imagem.'); }
  const bytes = await readLimited(response, 6000000, 'Imagem grande demais (acima de 6 MB).');
  return { url, bytes };
}

const clean = (value, max) => typeof value === 'string' ? value.trim().slice(0, max) : '';
export async function collectImages(study, { mediaDir, signal, onProgress = () => {}, pageFetcher = fetchPage, imageFetcher = fetchImage, wikiFetcher = fetchWikiImage } = {}) {
  const requested = (Array.isArray(study.images) ? study.images : []).slice(0, 12);
  if (!requested.length) return { ...study, images: [] };
  await mkdir(mediaDir, { recursive: true, mode: 0o700 });
  const store = async (url, timeout) => {
    const key = createHash('sha256').update(url).digest('hex').slice(0, 32);
    for (const ext of Object.keys(MEDIA_TYPES)) {
      try { const info = imageInfo(await readFile(join(mediaDir, `${key}.${ext}`))); if (info) return { file: `${key}.${ext}`, width: info.width, height: info.height, source: url }; } catch {}
    }
    const { bytes } = await imageFetcher(url, timeout);
    const info = imageInfo(bytes);
    if (!info) throw new Error('O arquivo não é uma imagem PNG, JPEG, GIF ou WebP.');
    if (info.width < 48 || info.height < 48 || info.width > 16000 || info.height > 16000) throw new Error('Dimensões de imagem fora do esperado.');
    const file = `${key}.${info.ext}`, tmp = join(mediaDir, `${file}.${randomUUID()}.tmp`);
    await writeFile(tmp, bytes, { mode: 0o600 });
    await rename(tmp, join(mediaDir, file));
    return { file, width: info.width, height: info.height, source: url };
  };
  const resolve = async image => {
    const base = { kind: IMAGE_KINDS.includes(image?.kind) ? image.kind : 'other', page: safeLink(image?.page), url: safeLink(image?.url), alt: clean(image?.alt, 400), caption: clean(image?.caption, 400), credit: clean(image?.credit, 300) };
    let reason = 'Sem endereço de imagem ou página.';
    const attempt = async url => { const timeout = AbortSignal.timeout(30000); return store(url, signal ? AbortSignal.any([signal, timeout]) : timeout); };
    if (base.url) { try { return { ...base, ...(await attempt(base.url)), status: 'ok' }; } catch (error) { reason = error.message; } }
    if (base.page && wikiTitle(base.page)) {
      try {
        const timeout = AbortSignal.timeout(12000);
        const found = await wikiFetcher(base.page, signal ? AbortSignal.any([signal, timeout]) : timeout);
        if (found) return { ...base, ...(await attempt(found)), status: 'ok' };
      } catch (error) { reason = error.message; }
    }
    if (base.page) {
      try {
        const timeout = AbortSignal.timeout(12000);
        const page = await pageFetcher(base.page, signal ? AbortSignal.any([signal, timeout]) : timeout);
        const found = pageImage(page.html, page.url);
        if (!found) reason = 'A página não indica uma imagem principal.';
        else return { ...base, ...(await attempt(found)), status: 'ok' };
      } catch (error) { reason = error.message; }
    }
    signal?.throwIfAborted();
    return { ...base, status: 'failed', message: reason };
  };
  const results = new Array(requested.length);
  let next = 0, done = 0;
  const worker = async () => {
    while (next < requested.length) {
      signal?.throwIfAborted();
      const i = next++;
      results[i] = await resolve(requested[i]);
      onProgress(`Buscando imagens: ${++done} de ${requested.length}…`);
    }
  };
  await Promise.all([worker(), worker(), worker()]);
  return { ...study, images: results };
}

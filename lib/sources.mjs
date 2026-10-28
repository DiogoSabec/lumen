import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

export function safeLink(raw) {
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:' || url.username || url.password || url.port && url.port !== '443') return '';
    if (url.hostname === 'localhost' || url.hostname.endsWith('.local') || url.hostname.endsWith('.internal') || isIP(url.hostname.replace(/[\[\]]/g, ''))) return '';
    return url.href;
  } catch { return ''; }
}

export function isPublicAddress(address) {
  if (isIP(address) === 4) {
    const [a, b] = address.split('.').map(Number);
    return !(a === 0 || a === 10 || a === 127 || a === 169 && b === 254 || a === 172 && b >= 16 && b <= 31 || a === 192 && b === 168 || a === 100 && b >= 64 && b <= 127 || a >= 224);
  }
  // IPv6: permit global unicast only, excluding mapped IPv4 and all local ranges.
  return isIP(address) === 6 && /^[23][a-f0-9]{3}:/i.test(address) && !/^2001:db8:/i.test(address);
}

export function plainText(html) {
  const entities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', ndash: '–', mdash: '—', hellip: '…' };
  return html.replace(/<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (all, code) => {
      if (code[0] !== '#') return entities[code] ?? all;
      const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : all;
    }).replace(/\s+/g, ' ').trim();
}

export function normalized(text) {
  return text.normalize('NFKC').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim().toLowerCase();
}

// Opens a public HTTPS URL, following redirects only to other public addresses.
export async function openPublic(raw, signal, accept) {
  let url = safeLink(raw);
  if (!url) throw new Error('URL inválida ou fora do formato permitido.');
  for (let i = 0; i < 4; i++) {
    const host = new URL(url).hostname;
    const addresses = await new Promise((resolve, reject) => {
      const abort = () => reject(signal?.reason || new Error('Consulta interrompida.'));
      if (signal?.aborted) { abort(); return; }
      signal?.addEventListener('abort', abort, { once: true });
      lookup(host, { all: true }).then(resolve, reject).finally(() => signal?.removeEventListener('abort', abort));
    });
    if (!addresses.length || addresses.some(x => !isPublicAddress(x.address))) throw new Error('Endereço local ou reservado.');
    const response = await fetch(url, { signal, redirect: 'manual', headers: { 'User-Agent': 'Lumen-Local/1.0 (personal source verification)', Accept: accept } });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location');
      await response.body?.cancel();
      url = location && safeLink(new URL(location, url).href);
      if (!url) throw new Error('Redirecionamento inválido.');
      continue;
    }
    if (!response.ok) { await response.body?.cancel(); throw new Error(`A fonte retornou HTTP ${response.status}.`); }
    return { url, response };
  }
  throw new Error('A página redirecionou vezes demais.');
}

export async function readLimited(response, max, message) {
  const chunks = []; let size = 0;
  for await (const chunk of response.body) {
    size += chunk.length;
    if (size > max) throw new Error(message);
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export async function fetchPage(raw, signal) {
  const { url, response } = await openPublic(raw, signal, 'text/html,text/plain;q=0.9');
  const type = response.headers.get('content-type') || '';
  if (!/text\/(html|plain)|application\/xhtml\+xml/.test(type)) { await response.body?.cancel(); throw new Error('Formato sem leitura automática; confira o original.'); }
  const bytes = await readLimited(response, 2000000, 'Página grande demais para conferência automática.');
  const encoding = (type.match(/charset\s*=\s*["']?([\w-]+)/i) || bytes.subarray(0, 2000).toString('latin1').match(/charset\s*=\s*["']?([\w-]+)/i))?.[1] || 'utf-8';
  let html;
  try { html = new TextDecoder(encoding).decode(bytes); } catch { html = bytes.toString('utf8'); }
  return { url, html };
}

export async function fetchSource(raw, signal) {
  const { url, html } = await fetchPage(raw, signal);
  return { url, text: plainText(html) };
}

export async function checkSources(study, { signal, onProgress = () => {}, fetcher = fetchSource } = {}) {
  const refs = study.items.flatMap(item => item.references);
  const unique = [...new Set(refs.map(r => safeLink(r.url)).filter(Boolean))].slice(0, 20);
  const pages = new Map();
  let done = 0, next = 0;
  const worker = async () => {
    while (next < unique.length) {
      signal?.throwIfAborted();
      const url = unique[next++];
      try {
        const timeout = AbortSignal.timeout(10000);
        const page = await fetcher(url, signal ? AbortSignal.any([signal, timeout]) : timeout);
        pages.set(url, { ...page, norm: normalized(page.text) });
      } catch (error) { pages.set(url, { error: error.message }); }
      onProgress(`Conferindo fontes: ${++done} de ${unique.length}…`);
    }
  };
  await Promise.all([worker(), worker()]);
  signal?.throwIfAborted();
  const checkedAt = new Date().toISOString();
  return { ...study, items: study.items.map(item => {
    const references = item.references.map(ref => {
      const url = safeLink(ref.url);
      const page = pages.get(url);
      const excerpt = normalized(ref.excerpt);
      const located = !page?.error && page?.norm && excerpt.length >= 15 && page.norm.includes(excerpt);
      return { ...ref, url, check: {
        status: located ? 'located' : page && !page.error ? 'reachable' : 'pending',
        message: located ? (page.preparationSnapshot ? 'Trecho localizado no conteúdo consultado durante a preparação do exemplo. Confira a edição original.' : 'Trecho localizado na página. A pertinência da interpretação exige leitura.') : page && !page.error ? 'Página acessível; o trecho exato não foi localizado. Confira a seção.' : page?.error || 'Referência a conferir manualmente.',
        checkedAt
      }};
    });
    const quotationURL = safeLink(item.quotationReference);
    const page = pages.get(quotationURL);
    const quotation = normalized(item.quotation);
    const quotationLocated = quotation.length >= 8 && page?.norm?.includes(quotation);
    return { ...item, references, quotation: quotationLocated ? item.quotation : '', quotationStatus: quotationLocated ? 'located' : item.quotation ? 'omitted' : 'absent', quotationReference: quotationLocated ? quotationURL : '' };
  }) };
}

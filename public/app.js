import { presentationDocument } from './presentation.js';
import { roseSVG, lightFraction, ripple, random } from './rose.js';
import { t, tServer, getLang, setLang, locale, applyStatic } from './i18n.js';
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const drawings = {
  lantern: '<path d="M9 3h6M12 3v2.5M8 6.5h8l1.2 2.2v8.6L16 19.5H8l-1.2-2.2V8.7z"/><path d="M12 10.5c1.4 1.5 1.9 2.6 1.9 3.4a1.9 1.9 0 0 1-3.8 0c0-.8.5-1.9 1.9-3.4zM9.5 21h5"/>',
  book: '<path d="M3 5.5c3-1.2 6-1.2 9 .8 3-2 6-2 9-.8v13c-3-1.2-6-1.2-9 .8-3-2-6-2-9-.8z"/><path d="M12 6.3v13"/>',
  shelf: '<path d="M3 20.5h18M5 20.5V6h3v14.5M9.5 20.5V3.5H13v17M14.5 20.5l-.6-13.6 3-.3 1.6 13.9"/>',
  library: '<path d="M4 20V9l8-5 8 5v11M4 20h16M8 20v-6a4 4 0 0 1 8 0v6M12 4v3"/>',
  refresh: '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M6 6a8 8 0 0 1 13 3M18 18A8 8 0 0 1 5 15"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.7 9a2.4 2.4 0 1 1 3.3 2.2c-1 .5-1 1.1-1 2M12 16.5h.01"/>',
  dice: '<rect x="4" y="4" width="16" height="16" rx="3.5"/><path d="M8.6 8.6h.01M15.4 8.6h.01M12 12h.01M8.6 15.4h.01M15.4 15.4h.01" stroke-width="2.6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  back: '<path d="M20 12H4m5-5-5 5 5 5"/>',
  shield: '<path d="m12 3 8 3v6c0 4-4 7-8 9-4-2-8-5-8-9V6zM8 12l3 3 5-6"/>',
  scroll: '<path d="M7 4h11a2 2 0 0 1 2 2v1h-3M7 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V6M7 4a2 2 0 0 1 2 2v1M9 11h6M9 15h4"/>',
  keys: '<circle cx="6.5" cy="6.5" r="3"/><path d="m8.6 8.6 10.4 10.4M15.5 15.5l-2 2M18 18l-1.6 1.6"/><circle cx="17.5" cy="6.5" r="3"/><path d="M15.4 8.6 5 19M8.5 15.5l2 2M6 18l1.6 1.6"/>',
  quill: '<path d="M20 4C12 4.5 7 10 5 20M20 4c-.6 5.4-4 9.5-9.4 11.3M9 13.5l3.5 1"/>',
  external: '<path d="M14 3h7v7M21 3l-10 10M10 5H4v15h15v-6"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  download: '<path d="M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5"/>',
  trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/>',
  thread: '<circle cx="5.5" cy="7" r="2.5"/><circle cx="18.5" cy="17" r="2.5"/><path d="M8 7.8c5 1 3 9.4 8 9"/>'
};
const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${drawings[name] || drawings.lantern}</svg>`;
function hydrateIcons(root = document) { $$('[data-icon]', root).forEach(el => { el.innerHTML = icon(el.dataset.icon); }); }
const scallop = (r, bumps, depth) => Array.from({ length: bumps * 2 }, (_, i) => { const a = i * Math.PI / bumps, rad = i % 2 ? r - depth : r; return `${i ? 'L' : 'M'}${(12 + rad * Math.cos(a)).toFixed(2)} ${(12 + rad * Math.sin(a)).toFixed(2)}`; }).join('') + 'Z';
const sealEdge = scallop(10.5, 14, 1.1);
const seals = {
  located: `<path d="${sealEdge}" fill="#d9a520"/><circle cx="12" cy="12" r="6.6" fill="none" stroke="#7a5a0c" stroke-width="1.2"/><path d="m8.8 12.2 2.2 2.2 4.4-4.6" fill="none" stroke="#5a3f06" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>`,
  reachable: `<path d="${sealEdge}" fill="#ebcf98"/><circle cx="12" cy="12" r="6.6" fill="none" stroke="#7c4d14" stroke-width="1.2"/><circle cx="11.2" cy="11.2" r="2.6" fill="none" stroke="#7c4d14" stroke-width="1.6"/><path d="m13.2 13.2 2.2 2.2" stroke="#7c4d14" stroke-width="1.8" stroke-linecap="round"/>`,
  pending: '<circle cx="12" cy="12" r="9.5" fill="none" stroke="#5f4b37" stroke-width="1.5" stroke-dasharray="2.4 2.6"/><path d="M12 8v4.5l2.6 1.6" fill="none" stroke="#5f4b37" stroke-width="1.6" stroke-linecap="round"/>'
};
const sealSVG = status => `<svg viewBox="0 0 24 24" aria-hidden="true">${seals[status] || seals.pending}</svg>`;
function waxSVG() {
  const blob = Array.from({ length: 36 }, (_, i) => { const a = i * Math.PI / 18, r = 26 + (i % 3 === 0 ? 2.2 : i % 2 ? -.6 : .9); return `${i ? 'L' : 'M'}${(r * Math.cos(a)).toFixed(2)} ${(r * Math.sin(a)).toFixed(2)}`; }).join('') + 'Z';
  const body = `<path d="${blob}" fill="#b8321b"/><circle r="18" fill="#a02a15" stroke="#7e1f10" stroke-width="1.6"/><path d="M0-11l2.6 6.6L9.5-3.4 4 1.4 5.8 8.6 0 4.8l-5.8 3.8L-4 1.4-9.5-3.4l6.9-1z" fill="#d9553a"/><path d="M-19-9a21 21 0 0 1 14-11" stroke="#ffffff55" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  return `<svg viewBox="-32 -32 64 64"><defs><clipPath id="wax-l"><path d="M-40-40H2L-2 40h-38z"/></clipPath><clipPath id="wax-r"><path d="M2-40h38v80H-2z"/></clipPath></defs><g class="half left"><g clip-path="url(#wax-l)">${body}</g></g><g class="half right"><g clip-path="url(#wax-r)">${body}</g></g></svg>`;
}
function candleSVG(n) {
  const heights = n === 1 ? [30] : [26, 32, 22], gap = 17, start = 32 - (n - 1) * gap / 2;
  return `<svg viewBox="0 0 64 46" aria-hidden="true">${Array.from({ length: n }, (_, i) => { const x = start + i * gap, top = 45 - heights[i]; return `<rect class="wax-stick" x="${x - 4.5}" y="${top}" width="9" height="${heights[i] - 1}" rx="1.5"/><path class="wick" d="M${x} ${top}v-3"/><g class="flame"><path d="M${x} ${top - 16}c3 4 4.6 6.4 4.6 8.6a4.6 4.6 0 0 1-9.2 0c0-2.2 1.6-4.6 4.6-8.6z"/><ellipse class="flame-core" cx="${x}" cy="${top - 7}" rx="1.8" ry="2.6"/></g>`; }).join('')}</svg>`;
}
hydrateIcons();
$$('[data-seal]').forEach(el => { el.outerHTML = sealSVG(el.dataset.seal); });
$$('[data-candles]').forEach(el => { el.innerHTML = candleSVG(Number(el.dataset.candles)); });
$('#wax').innerHTML = waxSVG();
$('#wordmark-rose').innerHTML = roseSVG({ seed: 'lumen', mode: 'direct' });

const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function safeURL(raw) { try { const u = new URL(raw); return u.protocol === 'https:' && !u.username && !u.password ? u.href : ''; } catch { return ''; } }
const providerName = p => ({ claude: 'Claude', codex: 'ChatGPT (Codex)', curated: t('Exemplo preparado') }[p] || t('Pesquisa'));
const modeName = m => m === 'study' ? t('Modo estudo') : t('Resposta direta');
const formatDate = d => new Intl.DateTimeFormat(locale(), { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'America/Sao_Paulo' }).format(new Date(d));
const roman = n => { let out = ''; for (const [v, s] of [[100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]) while (n >= v) { out += s; n -= v; } return out; };
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
let currentStudy = null, studies = [], health = null, activeJob = null, pollTimer, timeTimer, notesTimer, toastTimer, previewTimer, frameChannel = '';
let saveChain = Promise.resolve();
let jobMeta = {}, jobMessage = '', jobLight = 0, previewKey = '';
let board = null, linkSelection = { church: null, scene: null };
const form = $('#study-form');
const WORKS = [['Zelda: Ocarina of Time', 'Jogo'], ['Hollow Knight', 'Jogo'], ['Undertale', 'Jogo'], ['Shadow of the Colossus', 'Jogo'], ['Journey', 'Jogo'], ['Celeste', 'Jogo'], ['Final Fantasy X', 'Jogo'], ['The Last of Us', 'Jogo'], ['Dark Souls', 'Jogo'], ['Interestelar', 'Filme', 'Interstellar'], ['O Show de Truman', 'Filme', 'The Truman Show'], ['Toy Story 3', 'Filme'], ['Divertida Mente', 'Filme', 'Inside Out'], ['O Rei Leão', 'Filme', 'The Lion King'], ['Up: Altas Aventuras', 'Filme', 'Up'], ['Matrix', 'Filme', 'The Matrix'], ['O Senhor dos Anéis', 'Livro', 'The Lord of the Rings'], ['O Pequeno Príncipe', 'Livro', 'The Little Prince'], ['Os Miseráveis', 'Livro', 'Les Misérables'], ['Frankenstein', 'Livro'], ['Dom Quixote', 'Livro', 'Don Quixote'], ['Harry Potter e a Pedra Filosofal', 'Livro', 'Harry Potter and the Philosopher’s Stone'], ['Avatar: A Lenda de Aang', 'Série', 'Avatar: The Last Airbender'], ['Stranger Things', 'Série'], ['Breaking Bad', 'Série'], ['Fullmetal Alchemist: Brotherhood', 'Anime'], ['A Viagem de Chihiro', 'Anime', 'Spirited Away'], ['Frieren e a Jornada para o Além', 'Anime', 'Frieren: Beyond Journey’s End'], ['Vinland Saga', 'Mangá'], ['Naruto', 'Mangá'], ['One Piece', 'Mangá']];

async function api(path, { method = 'GET', data, signal } = {}) {
  let response;
  try { response = await fetch(path, { method, signal, headers: { 'X-Lumen': 'local', ...(data === undefined ? {} : { 'Content-Type': 'application/json' }) }, ...(data === undefined ? {} : { body: JSON.stringify(data) }) }); }
  catch (error) { if (error.name === 'AbortError') throw error; throw new Error(t('Não foi possível falar com o servidor local. Abra o Lumen novamente e tente outra vez.')); }
  const result = await response.json();
  if (!response.ok) throw new Error(tServer(result.error || 'Não foi possível completar a ação.'));
  return result;
}
function toast(message) { clearTimeout(toastTimer); $('#toast').textContent = message; $('#toast').hidden = false; toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 4000); }
function formValues() {
  const f = new FormData(form);
  return { theme: f.get('theme'), mode: f.get('mode'), provider: f.get('provider'), depth: f.get('depth'), medium: f.get('medium'), scope: f.get('scope'), evidence: f.get('evidence'), spoilers: f.get('spoilers') === 'on', spoilerLimit: f.get('spoilerLimit') };
}
function storeDraft() { try { localStorage.setItem('lumen-draft', JSON.stringify(formValues())); } catch {} }
function restoreDraft() {
  try {
    const draft = JSON.parse(localStorage.getItem('lumen-draft') || '{}');
    for (const [name, value] of Object.entries(draft)) {
      if (name === 'provider' || name === 'mode') { const radio = $(`input[name="${name}"][value="${value === 'claude' || value === 'codex' || value === 'study' || value === 'direct' ? value : ''}"]`); if (radio) radio.checked = true; }
      else if (name === 'spoilers') $('#spoilers').checked = value === true;
      else if (['theme', 'depth', 'medium', 'scope', 'evidence', 'spoilerLimit'].includes(name) && typeof value === 'string') form.elements[name].value = value;
    }
  } catch {}
}
function updateSpoilers() {
  const enabled = $('#spoilers').checked;
  $('#spoiler-description').textContent = enabled ? t('Aberto: spoilers dentro do recorte escolhido.') : t('Lacrado: só a premissa, por padrão.');
  $('#spoiler-limit-field').hidden = enabled;
}
// The preview window belongs to the theme being typed; the same seed marks the study later.
function updatePreview() {
  const v = formValues(), theme = (v.theme || '').trim(), key = `${theme}|${v.mode}|${v.depth}|${getLang()}`;
  if (key === previewKey) return;
  previewKey = key;
  $('#preview-rose').innerHTML = roseSVG({ seed: theme || 'lumen', mode: v.mode, depth: v.depth, lit: false, texture: true });
  ripple($('#preview-rose svg'));
  $('#window-caption').innerHTML = theme ? t('A rosácea de <strong>{theme}</strong>. O modo muda o vidro; o fôlego, as pétalas.', { theme: esc(theme) }) : t('Cada tema acende uma rosácea própria. Ela marca o estudo na sua estante.');
}
async function refreshHealth() {
  $('#refresh-status').disabled = true;
  try {
    health = await api('/api/health');
    for (const p of ['codex', 'claude']) {
      $(`#${p}-dot`).className = `provider-dot ${health.providers[p].authenticated ? 'connected' : 'disconnected'}`;
      $(`#${p}-dot`).title = tServer(health.providers[p].message);
    }
    $('#connection-details').innerHTML = Object.entries(health.providers).map(([p, status]) => `<p><strong>${esc(providerName(p))}</strong><br>${esc(tServer(status.message))}</p>`).join('');
    updateProviderStatus();
    if (health.activeJob && !activeJob) watchJob(health.activeJob, false);
  } catch (error) { $('#provider-status').textContent = error.message; }
  finally { $('#refresh-status').disabled = false; }
}
function updateProviderStatus() {
  if (!health) return;
  const p = formValues().provider;
  $('#provider-status').textContent = `${providerName(p)}: ${tServer(health.providers[p].message)}`;
}
async function refreshStudies() {
  studies = await api('/api/studies');
  $('#notebook-count').textContent = studies.length;
  if ((location.hash || '#explorar') === '#caderno') renderNotebook();
}
const pageTitles = { explorar: 'Lumen — histórias contra a luz', caderno: 'Estante — Lumen', fontes: 'Método — Lumen', resultado: 'Estudo — Lumen', andamento: 'Pesquisando — Lumen' };
function route() {
  const hash = location.hash || '#explorar';
  if (hash === '#main') { $('#main').focus(); return; }
  const match = hash.match(/^#estudo\/([a-f0-9-]{36})$/);
  const name = match ? 'resultado' : ['#explorar', '#caderno', '#fontes', '#andamento'].includes(hash) ? hash.slice(1) : 'explorar';
  $$('.page').forEach(el => { el.hidden = el.id !== name; });
  $$('.nav-link').forEach(el => { if (el.dataset.nav === name || name === 'resultado' && el.dataset.nav === 'caderno') el.setAttribute('aria-current', 'page'); else el.removeAttribute('aria-current'); });
  document.title = t(pageTitles[name]);
  if (name === 'caderno') refreshStudies().then(renderNotebook).catch(error => { $('#notebook-list').innerHTML = `<p class="error-message">${esc(error.message)}</p>`; });
  if (match) loadStudy(match[1]);
  if (name === 'andamento' && !activeJob) {
    startWorking({}); $('#working-title').textContent = t('Nenhuma pesquisa em andamento');
    $('#job-progress').textContent = t('Comece uma investigação para acender a rosácea.');
    $('#cancel-job').hidden = true; $('#job-back').hidden = false;
  }
  window.scrollTo({ top: 0, behavior: 'instant' });
}

const spineTones = { study: ['#23358f', '#1d2c78', '#2c3f9e', '#173b6e'], direct: ['#a52c19', '#8f2416', '#b23d25', '#7d2a1c'], demo: ['#8f6a1f', '#7d5c19', '#94701f'] };
function volumeHTML(s) {
  const progress = s.dynamic ? t('Etapa {n}', { n: s.round || 1 }) : t('{a} de {b} trilhas lidas', { a: s.completed.length, b: s.count });
  const foot = s.dynamic ? roman(s.round || 1) : s.count && s.completed.length === s.count ? icon('check') : '';
  const by = s.provider === 'curated' ? t('exemplo preparado') : t('com {provider}', { provider: providerName(s.provider) });
  return `<li class="volume"><button class="spine" data-open="${esc(s.id)}" aria-describedby="label-${esc(s.id)}"><span class="spine-rose">${roseSVG({ seed: s.theme || s.title, mode: s.mode, depth: s.depth })}</span><span class="spine-title">${esc(s.title)}</span><span class="spine-foot">${foot}</span></button><span class="volume-label" id="label-${esc(s.id)}"><strong>${esc(s.title)}</strong>${esc(modeName(s.mode))}, ${esc(by)}.<br>${esc(progress)}, ${esc(formatDate(s.createdAt))}.</span><button class="icon-button volume-delete" data-delete="${esc(s.id)}" aria-label="${esc(t('Excluir {title}', { title: s.title }))}" title="${esc(t('Excluir estudo'))}">${icon('trash')}</button></li>`;
}
function renderNotebook() {
  if (!studies.length) {
    $('#notebook-list').innerHTML = `<div class="empty-shelf"><h2>${t('A estante ainda está vazia.')}</h2><p>${t('Cada investigação vira um volume aqui, com a rosácea do tema na lombada.')}</p><div class="actions"><a href="#explorar" class="primary-button">${t('Começar uma investigação')}</a><button class="secondary-button on-vault" data-demo="study">${t('Abrir o exemplo de Zelda')}</button></div></div>`;
    return;
  }
  $('#notebook-list').innerHTML = `<ul class="shelf">${studies.map(volumeHTML).join('')}</ul><div class="shelf-gap"></div>`;
  $$('#notebook-list .spine').forEach((spine, i) => {
    const s = studies[i], r = random(s.id), tones = spineTones[s.demo ? 'demo' : s.mode] || spineTones.study;
    spine.style.setProperty('--spine', tones[Math.floor(r() * tones.length)]);
    spine.style.setProperty('--spine-w', `${Math.round(60 + r() * 20)}px`);
    spine.style.setProperty('--spine-h', `${Math.round(270 + r() * 56)}px`);
  });
}
async function loadStudy(id) {
  try {
    if (currentStudy?.id !== id) {
      $('#resultado').innerHTML = `<p class="loading-line">${t('Tirando o volume da estante…')}</p>`; currentStudy = await api(`/api/studies/${id}`);
      try {
        const recovery = JSON.parse(localStorage.getItem(`lumen-unsaved-${id}`) || 'null');
        if (recovery) { for (const key of ['notes', 'completed', 'revealed', 'interactiveState', 'hypothesisDraft', 'threads']) if (Object.hasOwn(recovery, key)) currentStudy[key] = recovery[key]; saveCurrent(); }
      } catch {}
    }
    if (location.hash === `#estudo/${id}`) renderStudy();
  } catch (error) { $('#resultado').innerHTML = `<p class="error-message">${esc(error.message)}</p><a href="#caderno" class="text-button on-vault">${t('Voltar à estante')}</a>`; }
}
function referenceHTML(ref) {
  const url = safeURL(ref.url), status = ['located', 'reachable', 'pending'].includes(ref.check?.status) ? ref.check.status : 'pending';
  const title = t({ located: 'Texto localizado', reachable: 'Conferir seção', pending: 'A conferir' }[status]);
  return `<div class="reference"><div class="reference-heading">${url ? `<a href="${esc(url)}" target="_blank" rel="noreferrer noopener">${esc(ref.label)}${icon('external')}</a>` : `<span class="ref-label">${esc(ref.label)}</span>`}<span class="seal ${status}" title="${esc(tServer(ref.check?.message || 'Referência não conferida automaticamente.'))}">${sealSVG(status)}${title}</span></div><p class="ref-location">${esc(ref.locator)}${ref.language ? `, ${esc(ref.language)}` : ''}</p>${status === 'located' && ref.excerpt ? `<p class="ref-excerpt" lang="${ref.language?.toLowerCase().includes('ingl') ? 'en' : 'pt'}">“${esc(ref.excerpt)}”</p>` : ''}${ref.note ? `<p class="ref-note">${esc(ref.note)}</p>` : ''}</div>`;
}
const okImages = s => (s.images || []).map((image, index) => ({ image, index })).filter(({ image }) => image.status === 'ok' && /^[a-f0-9]{32}\.(png|jpg|gif|webp)$/.test(image.file || ''));
function imageCreditsHTML(s) {
  const images = s.images || [];
  if (!images.length) return '';
  return `<div class="image-credits"><h3>${t('Imagens desta etapa')}</h3><ul>${images.map(image => `<li>${image.status === 'ok' ? `<img src="/media/${esc(image.file)}" alt="" width="56" height="56" loading="lazy">` : '<span class="image-missing" aria-hidden="true"></span>'}<div><strong>${esc(image.caption || image.alt || t('Imagem'))}</strong>${image.credit ? `<span>${esc(image.credit)}</span>` : ''}${image.status === 'ok' ? '' : `<span class="image-error">${esc(t('Não exibida: {reason}', { reason: tServer(image.message || 'não foi possível baixar.') }))}</span>`}${safeURL(image.page) ? `<a href="${esc(safeURL(image.page))}" target="_blank" rel="noreferrer noopener">${t('Página de origem')}${icon('external')}</a>` : ''}</div></li>`).join('')}</ul></div>`;
}
const galleryHTML = s => { const list = okImages(s); return list.length ? `<div class="gallery">${list.map(({ image }) => `<figure class="gallery-item"><img src="/media/${esc(image.file)}" alt="${esc(image.alt)}" width="${image.width | 0}" height="${image.height | 0}" loading="lazy"><figcaption>${esc(image.caption)}${image.credit ? `<small>${esc(image.credit)}</small>` : ''}</figcaption></figure>`).join('')}</div>` : ''; };
function trailHTML(item, index, study) {
  const revealed = study.revealed?.[index] || 0;
  const done = study.completed?.includes(index);
  return `<article class="trail" id="trilha-${index}"><div class="trail-header"><h2><span class="trail-number">${roman(index + 1)}</span>${esc(item.title)}</h2><button class="completed-toggle ${done ? 'is-done' : ''}" data-complete="${index}" aria-pressed="${done ? 'true' : 'false'}" aria-label="${esc(t(done ? 'Desmarcar trilha {n} como lida' : 'Marcar trilha {n} como lida', { n: index + 1 }))}"><span class="box">${done ? icon('check') : ''}</span>${t('Lida')}</button></div><p class="scene">${esc(item.scene)}</p><p class="scene-location">${esc(item.sceneLocator)}</p>${item.quotation ? `<blockquote>“${esc(item.quotation)}”<cite>${esc(t('Fala no idioma da fonte, {language}.', { language: item.references.find(r => r.kind === 'work' && r.url === item.quotationReference)?.language || t('edição identificada na referência') }))}${safeURL(item.quotationReference) ? ` <a href="${esc(safeURL(item.quotationReference))}" target="_blank" rel="noreferrer noopener">${t('Abrir transcrição')}</a>` : ''}</cite></blockquote>` : ''}${item.quotationStatus === 'omitted' ? `<p class="ref-note">${t('Uma fala não confirmada foi omitida. A cena aparece em paráfrase.')}</p>` : ''}<p class="question">${esc(item.question)}</p>${study.mode === 'direct' && item.explanation ? `<div class="explanation">${esc(item.explanation)}</div>` : ''}<div class="references"><h3>${t('Abra as fontes. Leia o contexto.')}</h3>${item.references.map(referenceHTML).join('')}</div>${study.mode === 'study' && item.hints.length ? `<div class="hint-block">${item.hints.slice(0, revealed).map((hint, i) => `<p class="hint-text"><span>${t('Pista {n}', { n: roman(i + 1) })}</span>${esc(hint)}</p>`).join('')}${revealed < item.hints.length ? `<button class="hint-button" data-hint="${index}"><span>${revealed ? t('Mais uma pista?') : t('Quer uma pequena pista?')}</span>${icon('plus')}</button>` : ''}</div>` : ''}<p class="limit-text"><strong>${study.mode === 'study' ? t('Teste sua leitura.') : t('Até onde vai a analogia.')}</strong> ${esc(item.limits)}</p><div class="practice">${icon('quill')}<span>${esc(item.practice)}</span></div></article>`;
}
function studyHeader(s) {
  const dynamic = s.mode === 'study' || !!s.presentation?.html;
  return `<a href="#caderno" class="result-back">${icon('back')}${t('Voltar à estante')}</a><header class="study-head"><div class="study-rose">${roseSVG({ seed: s.request?.theme || s.title, mode: s.mode, depth: s.request?.depth, texture: true })}</div><div><div class="study-tags"><span class="tag mode-${s.mode === 'study' ? 'study' : 'direct'}">${esc(modeName(s.mode))}</span>${s.demo ? `<span class="tag demo">${t('Exemplo preparado, com spoilers')}</span>` : `<span class="tag">${esc(providerName(s.provider))}</span>`}<span class="tag">${dynamic ? t('Etapa {n}', { n: s.round || 1 }) : esc(formatDate(s.createdAt))}</span></div><h1 class="study-title">${esc(s.title)}</h1>${s.scope ? `<p class="study-scope">${esc(s.scope)}</p>` : ''}</div></header>`;
}
function toolsHTML(s, caption) {
  const switchText = t(s.demo ? (s.mode === 'study' ? 'Abrir o exemplo em resposta direta' : 'Abrir o exemplo em modo estudo') : (s.mode === 'study' ? 'Refazer em resposta direta' : 'Refazer em modo estudo'));
  return `<div class="result-tools"><span class="progress-caption">${caption}</span><button class="text-button" data-export="md">${icon('download')}${t('Exportar Markdown')}</button><button class="text-button" data-export="json">${t('Salvar JSON')}</button><button class="text-button" id="switch-mode">${switchText}</button></div>`;
}
const glossHTML = (s, extra = '') => `<aside class="gloss" aria-labelledby="gloss-title"><h2 id="gloss-title">${t('Glosas')}</h2><p>${t('Notas na margem: o que chamou sua atenção, que hipótese vale testar.')}</p><label for="study-notes" class="sr-only">${t('Suas glosas')}</label><textarea id="study-notes" class="ruled" maxlength="50000" placeholder="${esc(t('Sua reflexão começa com uma frase…'))}">${esc(s.notes || '')}</textarea><small id="notes-status">${t('Glosas salvas neste Mac.')}</small>${extra}</aside>`;
function renderStudy() {
  const s = currentStudy;
  if (!s) return;
  if (s.mode === 'study' || s.presentation?.html) { renderExperience(s); return; }
  board = null;
  $('#resultado').innerHTML = `${studyHeader(s)}<div class="folio study-folio"><div class="study-main"><p class="study-intro">${esc(s.introduction)}</p>${toolsHTML(s, t('{a} de {b} trilhas lidas', { a: s.completed?.length || 0, b: s.items.length }))}${galleryHTML(s)}<div class="trails">${s.items.map((item, i) => trailHTML(item, i, s)).join('')}</div>${!s.items.length ? `<p class="error-message">${t('Faltou material para abrir trilhas confiáveis. Veja as limitações e complemente o recorte ou os trechos.')}</p>` : ''}<details class="evidence-note"><summary>${t('Sobre as fontes desta investigação')}</summary><p>${esc(s.evidenceNote)}</p>${imageCreditsHTML(s)}</details>${s.limitations.length ? `<details class="limitations"><summary>${t('Limites e pontos a conferir')}</summary><ul>${s.limitations.map(l => `<li>${esc(l)}</li>`).join('')}</ul></details>` : ''}<section class="study-section result-ending"><h2>${s.mode === 'study' ? t('Agora, a sua leitura.') : t('Para levar com você.')}</h2><ul>${s.closingQuestions.map(q => `<li>${esc(q)}</li>`).join('')}</ul><a href="#explorar" class="primary-button small">${t('Investigar outra história')}</a></section></div>${glossHTML(s, `<ul class="gloss-index">${s.items.map((item, i) => `<li><a href="#trilha-${i}" data-scroll="trilha-${i}"><b>${roman(i + 1)}</b>${esc(item.title)}</a></li>`).join('')}</ul>`)}</div>`;
}
function saveCurrent({ requireSuccess = false } = {}) {
  if (!currentStudy) return Promise.resolve();
  const s = currentStudy, id = s.id;
  const payload = { notes: s.notes || '', completed: [...(s.completed || [])], revealed: { ...(s.revealed || {}) }, interactiveState: s.interactiveState || {}, hypothesisDraft: s.hypothesisDraft || '', threads: s.threads || [] };
  const serialized = JSON.stringify(payload);
  try { localStorage.setItem(`lumen-unsaved-${id}`, serialized); } catch {}
  const attempt = saveChain.catch(() => {}).then(() => api(`/api/studies/${id}`, { method: 'PATCH', data: payload })).then(() => {
    try { if (localStorage.getItem(`lumen-unsaved-${id}`) === serialized) localStorage.removeItem(`lumen-unsaved-${id}`); } catch {}
    if (currentStudy?.id === id && $('#notes-status')) $('#notes-status').textContent = t('Glosas salvas neste Mac.');
    return true;
  });
  saveChain = attempt.catch(error => { if (currentStudy?.id === id && $('#notes-status')) $('#notes-status').textContent = t('Não foi possível salvar. O rascunho ficou neste navegador; tente de novo.'); toast(error.message); return false; });
  return requireSuccess ? attempt : saveChain;
}

function fallbackPresentation(study) {
  const allRefs = study.items.flatMap(item => item.references);
  const unique = [];
  allRefs.forEach((ref, index) => { if (ref.kind !== 'work' && !unique.some(x => x.ref.url === ref.url && x.ref.locator === ref.locator)) unique.push({ ref, index }); });
  return {
    html: `${okImages(study).length ? `<section class="pictures">${okImages(study).map(({ index }) => `<figure data-lumen-image="${index}"></figure>`).join('')}</section>` : ''}<section><h2>${t('Os primeiros fragmentos.')}</h2><p>${t('Leia sem procurar pares prontos. Um texto pode dialogar com várias cenas — e a sua hipótese pode abrir um caminho que não foi sugerido.')}</p><div class="fragments">${unique.map(({ ref, index }, i) => `<article><button class="fragment-choice" data-fragment="${esc(String.fromCharCode(65 + i))} — ${esc(ref.locator)}"><strong>${t('Fragmento {letter}', { letter: String.fromCharCode(65 + i) })}</strong><span>${t('Escolher este ponto de partida')}</span></button><div data-lumen-source="${index}"></div></article>`).join('')}</div></section><section><h2>${t('Fragmentos da história.')}</h2><p>${t('Cenas para observar. Você também pode lembrar de outra passagem da obra.')}</p>${study.items.map((item, i) => `<article><h3>${esc(item.title)}</h3><div data-lumen-scene="${i}"></div></article>`).join('')}</section><section class="challenge"><h2>${t('O seu primeiro desafio.')}</h2><p>${t('Que personagem, cena, objeto ou acontecimento veio à sua cabeça ao ler um desses textos? Por quê?')}</p><p>${t('Escolha um fragmento acima ou comece com uma hipótese sua. Não existe uma resposta única a adivinhar.')}</p><button id="begin-hypothesis">${t('Escrever minha interpretação')}</button><p id="chosen" aria-live="polite"></p></section>`,
    css: '.pictures{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px}.pictures .lumen-image{margin:0}.fragments article{padding:6px 0 20px}.fragment-choice{display:flex;align-items:center;justify-content:space-between;gap:15px;width:100%;text-align:left;background:transparent;border:0;border-radius:0;padding:0}.fragment-choice strong{font-size:22px}.fragment-choice span{font-size:14px;color:var(--lumen-muted)}.fragment-choice[aria-pressed=true]{color:var(--lumen-red);background:transparent}.challenge{border:2px solid var(--lumen-ink);border-radius:3px;padding:25px;margin:30px 0 0}.challenge h2{margin-top:0}@media(max-width:500px){.fragment-choice{align-items:start;flex-direction:column;gap:4px}.challenge{padding:19px}}',
    javascript: `const say=${JSON.stringify({ chose: t('Você escolheu '), want: t('Quero investigar o fragmento '), mine: t('. Minha interpretação é: '), start: t('Minha interpretação é que esse texto se relaciona com...'), point: t('Seu ponto de partida: ') }).replaceAll('<', '\\u003c')};document.querySelectorAll('[data-fragment]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-fragment]').forEach(b=>b.setAttribute('aria-pressed','false'));button.setAttribute('aria-pressed','true');Lumen.saveState({fragment:button.dataset.fragment});document.getElementById('chosen').textContent=say.chose+button.dataset.fragment;Lumen.draft(say.want+button.dataset.fragment+say.mine);}));document.getElementById('begin-hypothesis').addEventListener('click',()=>Lumen.draft(say.start));if(Lumen.state.fragment){document.getElementById('chosen').textContent=say.point+Lumen.state.fragment;}`,

    invitation: t('Qual conexão você encontrou? Conte sua hipótese e o que, na obra e na leitura, a sustenta.')
  };
}

// Ligações: the reader ties a Catholic fragment to a scene. Both lists are shuffled
// so their order never suggests a ready-made pair.
const churchKey = ref => `${ref.label}|${ref.locator}`;
const sceneKey = item => `${item.title}|${item.sceneLocator}`;
function boardData(s) {
  const church = [];
  s.items.flatMap(item => item.references).forEach(ref => { if (ref.kind !== 'work' && !church.some(x => churchKey(x) === churchKey(ref))) church.push(ref); });
  const scenes = s.items.filter(item => item.scene);
  const r = random(`${s.id}|ligacoes`), shuffle = list => list.map(x => [r(), x]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
  return { church: shuffle(church), scenes: shuffle(scenes) };
}
function boardHTML(s) {
  board = boardData(s); linkSelection = { church: null, scene: null };
  if (!board.church.length || !board.scenes.length) { board = null; return ''; }
  return `<section class="study-section" id="board" aria-labelledby="board-title"><h2 id="board-title">${t('Ligações')}</h2><p class="section-lead">${t('Escolha um fragmento da Igreja e uma cena da obra. Nenhum par vem pronto: a ligação é sua, e a conversa vai testá-la.')}</p><div class="board" id="board-grid"><svg class="board-threads" id="board-threads" aria-hidden="true"></svg><div class="board-col church"><h3>${t('Da Igreja')}</h3><ul>${board.church.map((ref, i) => `<li><button type="button" class="board-tile" data-link-church="${i}" aria-pressed="false"><strong>${esc(ref.label)}</strong><span>${esc(ref.locator)}</span></button></li>`).join('')}</ul></div><div class="board-col work"><h3>${t('Da obra')}</h3><ul>${board.scenes.map((item, i) => `<li><button type="button" class="board-tile" data-link-scene="${i}" aria-pressed="false"><strong>${esc(item.title)}</strong><span>${esc(item.sceneLocator)}</span></button></li>`).join('')}</ul></div></div><div id="link-compose" aria-live="polite"></div><div id="thread-list"></div></section>`;
}
function renderBoardState() {
  if (!board || !$('#board')) return;
  const threads = currentStudy.threads || [];
  $$('[data-link-church]').forEach(el => { const i = Number(el.dataset.linkChurch); el.setAttribute('aria-pressed', String(linkSelection.church === i)); el.classList.toggle('linked', threads.some(t => churchKey(t.church) === churchKey(board.church[i]))); });
  $$('[data-link-scene]').forEach(el => { const i = Number(el.dataset.linkScene); el.setAttribute('aria-pressed', String(linkSelection.scene === i)); el.classList.toggle('linked', threads.some(t => `${t.scene.title}|${t.scene.locator}` === sceneKey(board.scenes[i]))); });
  const ref = board.church[linkSelection.church], scene = board.scenes[linkSelection.scene];
  $('#link-compose').innerHTML = ref && scene
    ? `<div class="link-compose"><p>${t('Ligando <strong>{ref}</strong> à cena <strong>{scene}</strong>.', { ref: esc(ref.label), scene: esc(scene.title) })}</p><div><label for="link-note">${t('O que sustenta a ligação?')} <span class="optional">${t('opcional')}</span></label><input id="link-note" maxlength="600" placeholder="${esc(t('O detalhe da cena e o trecho da fonte que se tocam…'))}"></div><div class="buttons"><button type="button" class="secondary-button" id="save-link">${t('Guardar ligação')}</button><button type="button" class="primary-button small" id="send-link">${t('Levar para a conversa')}</button></div></div>`
    : ref ? `<p class="board-empty">${t('Agora escolha uma cena da obra.')}</p>` : scene ? `<p class="board-empty">${t('Agora escolha um fragmento da Igreja.')}</p>` : '';
  $('#thread-list').innerHTML = threads.length ? `<div class="threads"><h3>${t('Suas ligações ({n})', { n: threads.length })}</h3><ul class="thread-list">${threads.map((link, i) => `<li><p>${t('<strong>{label}</strong>, {locator}, com a cena <strong>{scene}</strong>', { label: esc(link.church.label), locator: esc(link.church.locator), scene: esc(link.scene.title) })}${link.note ? `<br><em>${esc(link.note)}</em>` : ''}</p><div class="buttons"><button type="button" class="text-button" data-thread-send="${i}">${t('Levar para a conversa')}</button><button type="button" class="text-button danger" data-thread-remove="${i}">${t('Desfazer')}</button></div></li>`).join('')}</ul></div>` : '';
  drawThreads(true);
}
function drawThreads(animate = false) {
  const svg = $('#board-threads'), grid = $('#board-grid');
  if (!svg || !grid || !board) return;
  const box = grid.getBoundingClientRect();
  const anchor = (el, side) => { const r = el.getBoundingClientRect(); return [side === 'right' ? r.right - box.left : r.left - box.left, r.top - box.top + r.height / 2]; };
  const path = (a, b) => { const dx = Math.max(30, (b[0] - a[0]) * .4); return `M${a[0]} ${a[1]}C${a[0] + dx} ${a[1] + 26} ${b[0] - dx} ${b[1] + 26} ${b[0]} ${b[1]}`; };
  const lines = [];
  for (const t of currentStudy.threads || []) {
    const ci = board.church.findIndex(ref => churchKey(ref) === churchKey(t.church)), si = board.scenes.findIndex(item => sceneKey(item) === `${t.scene.title}|${t.scene.locator}`);
    if (ci >= 0 && si >= 0 && !(ci === linkSelection.church && si === linkSelection.scene)) lines.push(`<path class="saved" d="${path(anchor($(`[data-link-church="${ci}"]`), 'right'), anchor($(`[data-link-scene="${si}"]`), 'left'))}"/>`);
  }
  if (linkSelection.church !== null && linkSelection.scene !== null) lines.push(`<path${animate && !reduced() ? ' class="sewing"' : ''} d="${path(anchor($(`[data-link-church="${linkSelection.church}"]`), 'right'), anchor($(`[data-link-scene="${linkSelection.scene}"]`), 'left'))}"/>`);
  svg.innerHTML = lines.join('');
  const sewing = $('path.sewing', svg);
  if (sewing) sewing.style.setProperty('--len', String(Math.ceil(sewing.getTotalLength())));
}
function keepThread({ send = false } = {}) {
  const ref = board?.church[linkSelection.church], scene = board?.scenes[linkSelection.scene];
  if (!ref || !scene) return;
  const note = ($('#link-note')?.value || '').trim().slice(0, 600);
  const thread = { church: { label: ref.label.slice(0, 300), locator: ref.locator.slice(0, 300) }, scene: { title: scene.title.slice(0, 300), locator: scene.sceneLocator.slice(0, 300) }, note, createdAt: new Date().toISOString() };
  const threads = (currentStudy.threads || []).filter(t => !(churchKey(t.church) === churchKey(thread.church) && `${t.scene.title}|${t.scene.locator}` === `${thread.scene.title}|${thread.scene.locator}`));
  currentStudy.threads = [...threads, thread].slice(-40);
  linkSelection = { church: null, scene: null };
  renderBoardState(); saveCurrent();
  if (send) sendThread(thread); else toast(t('Ligação guardada.'));
}
function sendThread(link) {
  const text = t('Liguei {label} ({locator}) à cena “{scene}”. O que sustenta a ligação: {note}', { label: link.church.label, locator: link.church.locator, scene: link.scene.title, note: link.note || '' });
  draftHypothesis(text);
}
function draftHypothesis(text) {
  if (!$('#hypothesis')) return;
  $('#hypothesis').value = text.slice(0, 8000); currentStudy.hypothesisDraft = $('#hypothesis').value;
  $('#discussion-panel').scrollIntoView({ behavior: reduced() ? 'instant' : 'smooth', block: 'center' }); $('#hypothesis').focus({ preventScroll: true });
  const end = $('#hypothesis').value.length; $('#hypothesis').setSelectionRange(end, end);
  queueNotesSave();
}

async function renderExperience(s) {
  const p = s.presentation?.html ? s.presentation : fallbackPresentation(s);
  const refs = s.items.flatMap(item => item.references);
  const boardSection = s.mode === 'study' ? boardHTML(s) : (board = null, '');
  $('#resultado').innerHTML = `${studyHeader(s)}<div class="folio study-folio"><div class="study-main"><p class="study-intro">${esc(s.introduction)}</p>${toolsHTML(s, t('Seu caminho, uma descoberta por vez.'))}<div id="experience-loading" class="loading-line">${t('Abrindo a página desta etapa…')}</div><iframe id="experience-frame" title="${esc(t('Experiência interativa desta investigação'))}" sandbox="allow-scripts" referrerpolicy="no-referrer"></iframe><div id="experience-error" class="error-message" hidden></div>${boardSection}<section class="study-section discussion-panel" id="discussion-panel"><h2>${t('Sua leitura')}</h2><p>${esc(p.invitation || t('Qual hipótese você quer discutir?'))}</p><form id="discussion-form"><label for="hypothesis">${t('Sua interpretação, pergunta ou pedido de pista')}</label><textarea id="hypothesis" class="ruled" maxlength="8000" rows="5" required placeholder="${esc(t('O que veio à sua cabeça? Que detalhe sustenta essa conexão?'))}">${esc(s.hypothesisDraft || '')}</textarea><div class="discussion-actions"><label for="discussion-provider">${t('Continuar com')}</label><select id="discussion-provider"><option value="codex" ${s.provider !== 'claude' ? 'selected' : ''}>ChatGPT (Codex)</option><option value="claude" ${s.provider === 'claude' ? 'selected' : ''}>Claude</option></select><button class="primary-button small" type="submit">${t('Continuar investigação')}</button></div><small>${t('Envia sua mensagem e o contexto deste estudo ao provedor escolhido.')}</small><p id="discussion-error" class="error-message" role="alert" hidden></p></form></section>${s.conversation?.length ? `<details class="conversation-log"><summary>${s.conversation.length === 1 ? t('O caminho até aqui (1 conversa)') : t('O caminho até aqui ({n} conversas)', { n: s.conversation.length })}</summary>${s.conversation.map(turn => `<article><strong>${t('Etapa {n}: sua leitura', { n: turn.round })}</strong><p>${esc(turn.message)}</p><details><summary>${t('Rever a resposta')}</summary><p>${esc(turn.response)}</p></details></article>`).join('')}</details>` : ''}<details class="evidence-note" id="source-audit"><summary>${t('Acervo de fontes')} (${refs.length} ${t(refs.length === 1 ? 'referência' : 'referências')}${s.images?.length ? `, ${s.images.length} ${t(s.images.length === 1 ? 'imagem' : 'imagens')}` : ''})</summary><p>${esc(s.evidenceNote)}</p>${refs.map((ref, i) => `<div id="source-${i}">${referenceHTML(ref)}</div>`).join('')}${imageCreditsHTML(s)}</details>${s.limitations.length ? `<details class="limitations"><summary>${t('Limites e pontos a conferir')}</summary><ul>${s.limitations.map(l => `<li>${esc(l)}</li>`).join('')}</ul></details>` : ''}</div>${glossHTML(s, `<p class="experience-caption">${t('A IA escolhe o formato de cada etapa. O percurso muda com as suas perguntas.')}</p>`)}</div>`;
  renderBoardState();
  frameChannel = crypto.randomUUID();
  const channel = frameChannel;
  try {
    const document = presentationDocument({ ...s, presentation: p }, referenceHTML, channel, t);
    const render = await api('/api/render', { method: 'POST', data: document });
    if (currentStudy?.id !== s.id || frameChannel !== channel || !$('#experience-frame')) return;
    $('#experience-frame').src = `/render/${render.id}`;
    $('#experience-loading').hidden = true;
  } catch (error) {
    if ($('#experience-error')) { $('#experience-error').textContent = t('{message} Você pode usar o acervo de fontes e continuar a conversa abaixo.', { message: error.message }); $('#experience-error').hidden = false; $('#experience-loading').hidden = true; }
  }
}

window.addEventListener('message', event => {
  const frame = $('#experience-frame');
  if (!frame || event.source !== frame.contentWindow || event.data?.lumen !== frameChannel) return;
  const { type, data } = event.data;
  if (type === 'height' && Number.isFinite(data)) { frame.style.height = `${Math.min(20000, Math.max(300, data + 10))}px`; requestAnimationFrame(() => drawThreads()); }
  if (type === 'draft' && typeof data === 'string') draftHypothesis(data);
  if (type === 'state' && data && typeof data === 'object' && !Array.isArray(data)) {
    try { if (JSON.stringify(data).length <= 20000) { currentStudy.interactiveState = data; queueNotesSave(); } } catch {}
  }
  if (type === 'source' && Number.isInteger(data) && data >= 0 && data < currentStudy.items.flatMap(x => x.references).length) {
    $('#source-audit').open = true; $(`#source-${data}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  if (type === 'ui-error') { $('#experience-error').textContent = t('Uma interação desta página falhou. Você pode continuar pelo campo de conversa ou pelas fontes.'); $('#experience-error').hidden = false; }
});

document.addEventListener('submit', async event => {
  if (event.target.id !== 'discussion-form') return;
  event.preventDefault();
  const button = event.target.querySelector('button[type="submit"]');
  button.disabled = true; $('#discussion-error').hidden = true;
  try {
    await saveCurrent({ requireSuccess: true });
    const job = await api(`/api/studies/${currentStudy.id}/discuss`, { method: 'POST', data: { message: $('#hypothesis').value, provider: $('#discussion-provider').value, language: getLang() } });
    watchJob(job.id, true, { theme: currentStudy.request?.theme || currentStudy.title, mode: currentStudy.mode, depth: currentStudy.request?.depth });
  } catch (error) { $('#discussion-error').textContent = error.message; $('#discussion-error').hidden = false; button.disabled = false; }
});
function queueNotesSave() { clearTimeout(notesTimer); if ($('#notes-status')) $('#notes-status').textContent = t('Salvando suas glosas…'); notesTimer = setTimeout(saveCurrent, 650); }
function download(content, extension, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a'); a.href = url; a.download = `${currentStudy.title.replace(/[^\p{L}\p{N} -]/gu, '').slice(0, 80) || 'estudo'}-${currentStudy.mode}.${extension}`;
  a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function markdownStudy(s) {
  const lines = [`# ${s.title}`, '', `${modeName(s.mode)}, ${providerName(s.provider)}, ${formatDate(s.createdAt)}`, '', s.scope, '', s.introduction, '', `${t('Fontes')}: ${s.evidenceNote}`, ''];
  const imageLines = (s.images || []).map(image => `- ${image.caption || image.alt}${image.credit ? ` (${image.credit})` : ''}${image.page ? ` — ${image.page}` : ''}${image.status === 'ok' ? '' : ` [${t('não exibida')}]`}`);
  const threads = (s.threads || []).map(link => `- ${link.church.label} (${link.church.locator}) ${t('com a cena')} “${link.scene.title}”${link.note ? `: ${link.note}` : ''}`);
  if (s.mode === 'study') {
    const refs = s.items.flatMap(item => item.references);
    lines.push(`## ${t('Fragmentos católicos')}`, '');
    const seen = new Set();
    for (const ref of refs.filter(r => r.kind !== 'work')) {
      const key = `${ref.url}|${ref.locator}`;
      if (seen.has(key)) continue;
      seen.add(key);
      lines.push(`### ${ref.label}`, '', `${ref.locator}, ${ref.language}`, '', ref.url || t('URL a conferir'), '', `${t('Estado')}: ${ref.check?.status || 'pending'}`, '');
      if (ref.check?.status === 'located' && ref.excerpt) lines.push(`> ${ref.excerpt}`, '');
      lines.push(ref.note, '');
    }
    lines.push(`## ${t('Fragmentos da obra')}`, '');
    for (const item of s.items) { lines.push(`### ${item.title}`, '', item.scene, '', item.sceneLocator, ''); if (item.quotation) lines.push(`> ${item.quotation}`, '', item.quotationReference, ''); }
    if (s.presentation?.html) {
      const template = document.createElement('template'); template.innerHTML = s.presentation.html;
      template.content.querySelectorAll('script,style').forEach(el => el.remove());
      lines.push(`## ${t('Página da investigação')}`, '', template.content.textContent.trim(), '');
    }
    if (imageLines.length) lines.push(`## ${t('Imagens')}`, '', ...imageLines, '');
    if (threads.length) lines.push(`## ${t('Minhas ligações')}`, '', ...threads, '');
    lines.push(`## ${t('Perguntas em aberto')}`, '', ...s.closingQuestions.map(q => `- ${q}`), '', `## ${t('Conversa')}`, '');
    for (const turn of s.conversation || []) lines.push(`### ${t('Etapa {n}', { n: turn.round })}`, '', `${t('Sua mensagem')}: ${turn.message}`, '', turn.response, '');
    lines.push(`## ${t('Limitações')}`, '', ...s.limitations.map(l => `- ${l}`), '', `## ${t('Minhas glosas')}`, '', s.notes || '');
    return lines.join('\n');
  }
  s.items.forEach((item, i) => {
    lines.push(`## ${i + 1}. ${item.title}`, '', item.scene, '', item.sceneLocator, '');
    if (item.quotation) lines.push(`> ${item.quotation}`, '', `${t('Transcrição')}: ${item.quotationReference}`, '');
    lines.push(item.question, '');
    if (s.mode === 'direct') lines.push(item.explanation, '');
    item.references.forEach(ref => { lines.push(`- ${ref.label}, ${ref.locator} (${ref.language}) — ${ref.url || t('URL não confirmada')}`, `  ${t('Estado')}: ${ref.check?.status || 'pending'}. ${ref.note}`); if (ref.check?.status === 'located' && ref.excerpt) lines.push(`  ${t('Trecho no idioma da fonte')}: “${ref.excerpt}”`); });
    if (s.mode === 'study') item.hints.slice(0, s.revealed?.[i] || 0).forEach((h, j) => lines.push('', `${t('Pista {n}', { n: j + 1 })}: ${h}`));
    lines.push('', `${t('Limites')}: ${item.limits}`, '', `${t('Para fazer')}: ${item.practice}`, '');
  });
  if (imageLines.length) lines.push(`## ${t('Imagens')}`, '', ...imageLines, '');
  lines.push(`## ${t('Reflexão')}`, '', ...s.closingQuestions.map(q => `- ${q}`), '', `## ${t('Limitações')}`, '', ...s.limitations.map(l => `- ${l}`), '', `## ${t('Minhas glosas')}`, '', s.notes || '');
  return lines.join('\n');
}
async function openDemo(mode) {
  const buttons = $$('[data-demo]'); buttons.forEach(b => { b.disabled = true; });
  try { const s = await api('/api/demo', { method: 'POST', data: { mode, language: getLang() } }); currentStudy = s; await refreshStudies(); location.hash = `#estudo/${s.id}`; }
  catch (error) { toast(error.message); }
  finally { buttons.forEach(b => { b.disabled = false; }); }
}

// The rose lights up with the research: elapsed time sets a slow baseline,
// each progress message from the server raises the floor.
function progressFraction(message, seconds) {
  let floor = .04;
  if (/Iniciando/.test(message)) floor = .1;
  if (/Investigando|Consultando/.test(message)) floor = .2;
  const checking = message.match(/Conferindo fontes: (\d+) de (\d+)/);
  if (checking) floor = .7 + .25 * Number(checking[1]) / Math.max(1, Number(checking[2]));
  return Math.min(.96, Math.max(floor, .86 * (1 - Math.exp(-seconds / 90))));
}
function startWorking(meta) {
  jobMeta = meta || {}; jobLight = 0;
  $('#working-title').textContent = jobMeta.theme || t('Sua investigação');
  $('#working-rose').classList.remove('is-complete');
  $('#working-rose').innerHTML = roseSVG({ seed: jobMeta.theme || 'lumen', mode: jobMeta.mode, depth: jobMeta.depth, lit: false, texture: true });
  lightFraction($('#working-rose svg'), .02);
}
function jobClock(startedAt) {
  clearInterval(timeTimer);
  const tick = () => {
    const seconds = Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
    $('#working-time').textContent = t('{m} min {s} s. A pesquisa pode levar alguns minutos.', { m: Math.floor(seconds / 60), s: String(seconds % 60).padStart(2, '0') });
    jobLight = Math.max(jobLight, progressFraction(jobMessage, seconds));
    lightFraction($('#working-rose svg'), jobLight);
  };
  tick(); timeTimer = setInterval(tick, 1000);
}
async function watchJob(id, navigate = true, meta) {
  clearTimeout(pollTimer);
  activeJob = id;
  if (meta) { try { localStorage.setItem('lumen-job-meta', JSON.stringify(meta)); } catch {} }
  else { try { meta = JSON.parse(localStorage.getItem('lumen-job-meta') || '{}'); } catch { meta = {}; } }
  startWorking(meta);
  try { localStorage.setItem('lumen-job', id); } catch {}
  if (navigate) location.hash = '#andamento';
  $('#job-error').hidden = true; $('#job-back').hidden = true; $('#cancel-job').hidden = false; $('#cancel-job').disabled = false;
  $('#generate-button').disabled = true;
  let failures = 0;
  const poll = async () => {
    try {
      const job = await api(`/api/jobs/${id}`);
      failures = 0;
      jobMessage = job.progress; $('#job-progress').textContent = tServer(job.progress);
      if (!timeTimer) jobClock(job.startedAt);
      if (job.state === 'completed') {
        stopWatching(); lightFraction($('#working-rose svg'), 1); $('#working-rose').classList.add('is-complete');
        await refreshStudies(); currentStudy = null;
        setTimeout(() => { location.hash = `#estudo/${job.studyId}`; toast(t('Sua investigação está na estante.')); }, reduced() ? 0 : 1100);
        return;
      }
      if (job.state === 'failed' || job.state === 'cancelled') {
        stopWatching(); $('#cancel-job').hidden = true; $('#job-back').hidden = false;
        if (job.error) { $('#job-error').textContent = tServer(job.error); $('#job-error').hidden = false; }
        return;
      }
      pollTimer = setTimeout(poll, 1800);
    } catch (error) {
      if (++failures < 3) { $('#job-progress').textContent = t('Tentando restabelecer a conexão local…'); pollTimer = setTimeout(poll, 2500); return; }
      stopWatching(); $('#job-error').textContent = error.message; $('#job-error').hidden = false; $('#cancel-job').hidden = true; $('#job-back').hidden = false;
    }
  };
  poll();
}
function stopWatching() {
  activeJob = null; clearTimeout(pollTimer); clearInterval(timeTimer); timeTimer = null;
  $('#generate-button').disabled = false;
  try { localStorage.removeItem('lumen-job'); localStorage.removeItem('lumen-job-meta'); } catch {}
}

form.addEventListener('input', event => {
  storeDraft(); updateSpoilers(); updateProviderStatus();
  clearTimeout(previewTimer);
  if (event.target.id === 'theme') previewTimer = setTimeout(updatePreview, 260); else updatePreview();
});
form.addEventListener('submit', async event => {
  event.preventDefault();
  $('#form-error').hidden = true; $('#generate-button').disabled = true;
  const values = formValues();
  try { const job = await api('/api/jobs', { method: 'POST', data: { ...values, language: getLang() } }); watchJob(job.id, true, { theme: values.theme.trim(), mode: values.mode, depth: values.depth }); }
  catch (error) { $('#form-error').textContent = error.message; $('#form-error').hidden = false; $('#generate-button').disabled = false; }
});
$('#roll-button').addEventListener('click', () => {
  const current = $('#theme').value;
  let pick;
  const title = work => getLang() === 'en' && work[2] || work[0];
  do pick = WORKS[Math.floor(Math.random() * WORKS.length)]; while (title(pick) === current);
  $('#theme').value = title(pick); $('#medium').value = pick[1];
  storeDraft(); updatePreview();
  const button = $('#roll-button'); button.classList.remove('rolling'); void button.offsetWidth; button.classList.add('rolling');
});
$('#copy-prompt').addEventListener('click', async () => {
  if (!form.reportValidity()) return;
  try { const { prompt } = await api('/api/prompt', { method: 'POST', data: { ...formValues(), language: getLang() } }); await navigator.clipboard.writeText(prompt); toast(t('Prompt copiado. Pode usar no Claude ou no ChatGPT.')); }
  catch (error) { toast(error.message); }
});
$('#refresh-status').addEventListener('click', refreshHealth);
$('#cancel-job').addEventListener('click', async () => {
  if (!activeJob) return;
  $('#cancel-job').disabled = true;
  try { await api(`/api/jobs/${activeJob}/cancel`, { method: 'POST', data: {} }); }
  catch (error) { toast(error.message); $('#cancel-job').disabled = false; }
});
$('#how-button').addEventListener('click', () => $('#how-dialog').showModal());
$('#close-how').addEventListener('click', () => $('#how-dialog').close());
$('#understood').addEventListener('click', () => $('#how-dialog').close());
$('#how-dialog').addEventListener('click', event => { if (event.target === $('#how-dialog')) { const r = event.target.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) event.target.close(); } });
document.addEventListener('click', async event => {
  const example = event.target.closest('[data-example]');
  if (example) { $('#theme').value = getLang() === 'en' && example.dataset.exampleEn || example.dataset.example; $('#medium').value = example.dataset.medium; storeDraft(); updatePreview(); $('#theme').focus(); }
  const demo = event.target.closest('[data-demo]'); if (demo) openDemo(demo.dataset.demo);
  const open = event.target.closest('[data-open]'); if (open) location.hash = `#estudo/${open.dataset.open}`;
  const del = event.target.closest('[data-delete]');
  if (del) {
    if (!confirm(t('Excluir este estudo e suas glosas deste Mac? Esta ação não pode ser desfeita.'))) return;
    try { await api(`/api/studies/${del.dataset.delete}`, { method: 'DELETE' }); await refreshStudies(); renderNotebook(); toast(t('Estudo excluído.')); } catch (error) { toast(error.message); }
  }
  const hint = event.target.closest('[data-hint]');
  if (hint && currentStudy) {
    const index = Number(hint.dataset.hint); currentStudy.revealed ||= {}; currentStudy.revealed[index] = Math.min((currentStudy.revealed[index] || 0) + 1, currentStudy.items[index].hints.length);
    const scroll = window.scrollY; renderStudy(); window.scrollTo(0, scroll); saveCurrent();
  }
  const complete = event.target.closest('[data-complete]');
  if (complete && currentStudy) {
    const index = Number(complete.dataset.complete); currentStudy.completed ||= [];
    currentStudy.completed = currentStudy.completed.includes(index) ? currentStudy.completed.filter(x => x !== index) : [...currentStudy.completed, index];
    const scroll = window.scrollY; renderStudy(); window.scrollTo(0, scroll); saveCurrent();
  }
  const church = event.target.closest('[data-link-church]'), scene = event.target.closest('[data-link-scene]');
  if (church) { const i = Number(church.dataset.linkChurch); linkSelection.church = linkSelection.church === i ? null : i; renderBoardState(); }
  if (scene) { const i = Number(scene.dataset.linkScene); linkSelection.scene = linkSelection.scene === i ? null : i; renderBoardState(); }
  if (event.target.closest('#save-link')) keepThread();
  if (event.target.closest('#send-link')) keepThread({ send: true });
  const sendSaved = event.target.closest('[data-thread-send]');
  if (sendSaved && currentStudy?.threads) sendThread(currentStudy.threads[Number(sendSaved.dataset.threadSend)]);
  const removeSaved = event.target.closest('[data-thread-remove]');
  if (removeSaved && currentStudy?.threads) { currentStudy.threads = currentStudy.threads.filter((_, i) => i !== Number(removeSaved.dataset.threadRemove)); renderBoardState(); saveCurrent(); }
  const exportButton = event.target.closest('[data-export]');
  if (exportButton && currentStudy) { exportButton.dataset.export === 'json' ? download(JSON.stringify(currentStudy, null, 2), 'json', 'application/json') : download(markdownStudy(currentStudy), 'md', 'text/markdown'); }
  const scroll = event.target.closest('[data-scroll]');
  if (scroll) { event.preventDefault(); document.getElementById(scroll.dataset.scroll)?.scrollIntoView({ behavior: reduced() ? 'instant' : 'smooth', block: 'start' }); }
  if (event.target.closest('#switch-mode') && currentStudy) {
    if (currentStudy.demo) { openDemo(currentStudy.mode === 'study' ? 'direct' : 'study'); return; }
    const request = currentStudy.request;
    if (request) {
      for (const key of ['theme', 'medium', 'scope', 'evidence', 'depth', 'spoilerLimit', 'provider']) form.elements[key].value = request[key] || '';
      $('#spoilers').checked = request.spoilers === true;
    }
    form.elements.mode.value = currentStudy.mode === 'study' ? 'direct' : 'study';
    storeDraft(); updateSpoilers(); updateProviderStatus(); updatePreview(); location.hash = '#explorar';
    toast(t('Recorte mantido. Comece uma nova pesquisa no outro modo.'));
  }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Enter' && event.target.id === 'link-note') { event.preventDefault(); keepThread(); }
});
document.addEventListener('input', event => {
  if (event.target.id === 'study-notes' && currentStudy) { currentStudy.notes = event.target.value; queueNotesSave(); }
  if (event.target.id === 'hypothesis' && currentStudy) { currentStudy.hypothesisDraft = event.target.value; queueNotesSave(); }
});
let resizeFrame;
window.addEventListener('resize', () => { cancelAnimationFrame(resizeFrame); resizeFrame = requestAnimationFrame(() => drawThreads()); });
window.addEventListener('hashchange', () => { if (notesTimer) { clearTimeout(notesTimer); saveCurrent(); } route(); });
window.addEventListener('pagehide', () => {
  if (!currentStudy) return;
  const payload = { notes: currentStudy.notes || '', completed: currentStudy.completed || [], revealed: currentStudy.revealed || {}, interactiveState: currentStudy.interactiveState || {}, hypothesisDraft: currentStudy.hypothesisDraft || '', threads: currentStudy.threads || [] };
  fetch(`/api/studies/${currentStudy.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'X-Lumen': 'local' }, body: JSON.stringify(payload), keepalive: true }).catch(() => {});
});
document.fonts?.ready.then(() => drawThreads());
function renderLanguage() {
  applyStatic();
  $$('[data-lang]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.lang === getLang())));
  updateSpoilers(); updateProviderStatus(); updatePreview();
  if (health) $('#connection-details').innerHTML = Object.entries(health.providers).map(([p, status]) => `<p><strong>${esc(providerName(p))}</strong><br>${esc(tServer(status.message))}</p>`).join('');
  $('#notebook-count').textContent = studies.length;
}
$$('[data-lang]').forEach(button => button.addEventListener('click', () => {
  if (button.dataset.lang === getLang()) return;
  if (notesTimer) { clearTimeout(notesTimer); saveCurrent(); }
  setLang(button.dataset.lang); renderLanguage();
  if (!activeJob) route();
  else { $('#job-progress').textContent = tServer(jobMessage); document.title = t('Pesquisando — Lumen'); }
}));
renderLanguage(); restoreDraft(); updateSpoilers(); updatePreview(); route();
Promise.allSettled([refreshHealth(), refreshStudies()]);
try { const savedJob = localStorage.getItem('lumen-job'); if (savedJob && /^[a-f0-9-]{36}$/.test(savedJob)) watchJob(savedJob); } catch {}

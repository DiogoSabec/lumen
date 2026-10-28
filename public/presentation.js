// The model controls this document's content, layout and interactions.
// The host retains control of network requests, persistence and model invocations.
// A small, fixed icon set the model can place with data-lumen-icon.
export const ICONS = {
  memory: '<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4h4M12 8v4l3 2"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  hourglass: '<path d="M6 3h12M6 21h12M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  book: '<path d="M3 5.5c3-1.2 6-1.2 9 .8 3-2 6-2 9-.8v13c-3-1.2-6-1.2-9 .8-3-2-6-2-9-.8z"/><path d="M12 6.3v13"/>',
  bible: '<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5z"/><path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3M12 6.5v7M9.5 9h5"/>',
  scroll: '<path d="M7 4h11a2 2 0 0 1 2 2v1h-3M7 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V6M7 4a2 2 0 0 1 2 2v1M9 11h6M9 15h4"/>',
  quill: '<path d="M20 4C12 4.5 7 10 5 20M20 4c-.6 5.4-4 9.5-9.4 11.3M9 13.5l3.5 1"/>',
  cross: '<path d="M12 3v18M7 8h10"/>',
  church: '<path d="M12 2v4M10 4h4M5 21V11l7-5 7 5v10M3 21h18M10 21v-5a2 2 0 0 1 4 0v5"/>',
  chalice: '<path d="M7 3h10c0 5-2 8-5 8s-5-3-5-8zM12 11v7M8 21h8M10 18h4"/>',
  keys: '<circle cx="6.5" cy="6.5" r="3"/><path d="m8.6 8.6 10.4 10.4M15.5 15.5l-2 2M18 18l-1.6 1.6"/><circle cx="17.5" cy="6.5" r="3"/><path d="M15.4 8.6 5 19M8.5 15.5l2 2M6 18l1.6 1.6"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l3 3M15 8l2 2"/>',
  dove: '<path d="M3 13c3.5 0 6-2 8-5.5 1 2.5 3 3.5 6 3.5l4-3-1.2 5C18.6 17 15 19 11 19H7l-3 2 1-4c-1.2-1-2-2.3-2-4z"/><path d="M15 11h.01"/>',
  flame: '<path d="M12 3c1 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-3-1-5 1-8z"/>',
  candle: '<path d="M9 10h6v11H9zM12 10V7.5"/><path d="M12 2.5c1.2 1.3 1.6 2.2 1.6 3a1.6 1.6 0 0 1-3.2 0c0-.8.4-1.7 1.6-3z"/>',
  lantern: '<path d="M9 3h6M12 3v2.5M8 6.5h8l1.2 2.2v8.6L16 19.5H8l-1.2-2.2V8.7z"/><path d="M12 10.5c1.4 1.5 1.9 2.6 1.9 3.4a1.9 1.9 0 0 1-3.8 0c0-.8.5-1.9 1.9-3.4zM9.5 21h5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  heart: '<path d="M12 20s-8-4.6-8-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 8 2.8C20 15.4 12 20 12 20z"/>',
  hand: '<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11M11 10V4.5a1.5 1.5 0 0 1 3 0V11M14 10.5V6a1.5 1.5 0 0 1 3 0v8c0 4-2.5 7-6.5 7-3 0-4.5-2-6-4l-2-3.5a1.5 1.5 0 0 1 2.6-1.5L8 13"/>',
  person: '<circle cx="12" cy="7" r="3.5"/><path d="M5 21c0-3.9 3.1-7 7-7s7 3.1 7 7"/>',
  people: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 5a3 3 0 0 1 0 6M18 14c2 .6 3 2.6 3 6"/>',
  crown: '<path d="M3 8l4 4 5-7 5 7 4-4-2 11H5z"/>',
  sword: '<path d="M21 3 9.5 14.5M21 3v4L10.5 17.5M21 3h-4L6.5 13.5M6 13l5 5M4.5 19.5l2-2M3 21l1.5-1.5"/>',
  shield: '<path d="m12 3 8 3v6c0 4.5-3.5 7.5-8 9-4.5-1.5-8-4.5-8-9V6z"/>',
  scales: '<path d="M12 3v18M5 7h14M8 21h8"/><path d="M5 7 2 14a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z"/>',
  anchor: '<circle cx="12" cy="5" r="2"/><path d="M12 7v14M5 13a7 7 0 0 0 14 0M8 11h8"/>',
  map: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5z"/>',
  mountain: '<path d="M2 20 9 8l4 6 3-4 6 10z"/>',
  tree: '<path d="M12 21v-6M12 15c-5 0-7-3-7-6a4 4 0 0 1 3-4 5 5 0 0 1 8 0 4 4 0 0 1 3 4c0 3-2 6-7 6z"/>',
  leaf: '<path d="M5 19C5 10 10 5 20 4c0 10-5 15-14 15zM5 19l8-8"/>',
  water: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
  door: '<path d="M6 21V4h12v17M3 21h18M14.5 12.5h.01"/>',
  music: '<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
  link: '<path d="M10 14a4 4 0 0 1 0-5.6l2.4-2.4a4 4 0 0 1 5.6 5.6L16.6 13M14 10a4 4 0 0 1 0 5.6l-2.4 2.4a4 4 0 0 1-5.6-5.6L7.4 11"/>',
  question: '<circle cx="12" cy="12" r="9"/><path d="M9.7 9a2.4 2.4 0 1 1 3.3 2.2c-1 .5-1 1.1-1 2M12 16.5h.01"/>',
  skull: '<path d="M12 3a8 8 0 0 0-8 8c0 3 1.5 5 4 6v3h8v-3c2.5-1 4-3 4-6a8 8 0 0 0-8-8z"/><circle cx="9" cy="11" r="1.5"/><circle cx="15" cy="11" r="1.5"/><path d="M10.5 20v-2M13.5 20v-2"/>'
};
export function presentationDocument(study, referenceHTML, channel, t = text => text) {
  const p = study.presentation;
  const template = document.createElement('template');
  template.innerHTML = p.html;
  const denied = 'script,iframe,object,embed,link,meta,base,audio,video,style';
  template.content.querySelectorAll(denied).forEach(el => el.remove());
  for (const el of template.content.querySelectorAll('*')) {
    for (const attr of [...el.attributes]) {
      if (/^on/i.test(attr.name) || ['srcdoc', 'formaction', 'action', 'target', 'autofocus'].includes(attr.name)) el.removeAttribute(attr.name);
    }
    if (el.tagName === 'IMG' && !el.getAttribute('src')?.startsWith('data:image/')) el.remove();
    if (el.tagName === 'A') { el.removeAttribute('href'); el.setAttribute('role', 'note'); }
  }
  const refs = study.items.flatMap(item => item.references);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  for (const el of template.content.querySelectorAll('[data-lumen-source]')) {
    const index = Number(el.dataset.lumenSource), ref = refs[index];
    if (!Number.isInteger(index) || !ref) { el.textContent = t('Referência não encontrada nesta etapa.'); continue; }
    el.classList.add('lumen-source');
    el.innerHTML = referenceHTML(ref);
    for (const anchor of el.querySelectorAll('a')) { anchor.removeAttribute('href'); anchor.removeAttribute('target'); anchor.setAttribute('role', 'button'); anchor.setAttribute('tabindex', '0'); anchor.dataset.sourceIndex = String(index); }
  }
  for (const el of template.content.querySelectorAll('[data-lumen-scene]')) {
    const index = Number(el.dataset.lumenScene), item = study.items[index];
    if (!Number.isInteger(index) || !item) { el.textContent = t('Cena não encontrada nesta etapa.'); continue; }
    el.classList.add('lumen-scene');
    el.innerHTML = `<p>${escape(item.scene)}</p><small>${escape(item.sceneLocator)}</small>${item.quotation ? `<blockquote>“${escape(item.quotation)}”</blockquote><small>${t('Fala no idioma da fonte. Transcrição identificada no acervo de referências.')}</small>` : ''}${item.quotationStatus === 'omitted' ? `<small>${t('Fala literal omitida: a conferência automática não a localizou.')}</small>` : ''}`;
  }
  // Compact, clickable source seals; quotations and dialogue appear only when the text was located.
  const sealState = ref => ['located', 'reachable', 'pending'].includes(ref?.check?.status) ? ref.check.status : 'pending';
  const sealName = { located: t('Texto localizado'), reachable: t('Conferir seção'), pending: t('A conferir') };
  const shortLabel = ref => { const head = String(ref.label || 'Fonte').split(/ [—–-] /)[0].trim(); return head.length > 32 ? `${head.slice(0, 31)}…` : head; };
  const cite = (ref, index, label, state = sealState(ref)) => `<button type="button" class="lumen-cite ${state}" data-source-index="${index}" title="${escape(`${ref.label}, ${ref.locator} (${sealName[state]})`)}" aria-label="${escape(t('Fonte: {label}, {locator}. {state}. Abrir no acervo.', { label: ref.label, locator: ref.locator, state: sealName[state] }))}"><i aria-hidden="true"></i>${escape(label || shortLabel(ref))}</button>`;
  const langOf = text => /ingl/i.test(text || '') ? 'en' : /latim|latin/i.test(text || '') ? 'la' : /espanh/i.test(text || '') ? 'es' : /japon/i.test(text || '') ? 'ja' : 'pt';
  const translation = el => { const text = String(el.dataset.translation || '').trim().slice(0, 600); return text ? `<p class="lumen-translation"><span>${t('Tradução livre')}</span>${escape(text)}</p>` : ''; };
  for (const el of template.content.querySelectorAll('[data-lumen-cite]')) {
    const index = Number(el.dataset.lumenCite), ref = refs[index];
    if (!Number.isInteger(index) || !ref) { el.remove(); continue; }
    el.outerHTML = cite(ref, index, String(el.dataset.label || '').trim().slice(0, 40));
  }
  for (const el of template.content.querySelectorAll('[data-lumen-quote]')) {
    const index = Number(el.dataset.lumenQuote), ref = refs[index];
    if (!Number.isInteger(index) || !ref) { el.remove(); continue; }
    el.classList.add('lumen-quote');
    el.innerHTML = sealState(ref) === 'located' && ref.excerpt
      ? `<blockquote lang="${langOf(ref.language)}">“${escape(ref.excerpt)}”</blockquote>${translation(el)}<p class="lumen-quote-source">${escape(ref.locator)}${cite(ref, index)}</p>`
      : `<p class="lumen-quote-missing">${t('O trecho literal desta fonte não foi localizado automaticamente. Leia o contexto na própria fonte.')}</p><p class="lumen-quote-source">${escape(ref.locator)}${cite(ref, index)}</p>`;
  }
  for (const el of template.content.querySelectorAll('[data-lumen-dialogue]')) {
    const index = Number(el.dataset.lumenDialogue), item = study.items[index];
    if (!Number.isInteger(index) || !item) { el.remove(); continue; }
    const source = refs.findIndex(ref => ref.kind === 'work' && ref.url && ref.url === item.quotationReference);
    el.classList.add('lumen-quote', 'lumen-dialogue');
    el.innerHTML = item.quotation
      ? `<blockquote lang="${langOf(refs[source]?.language)}">“${escape(item.quotation)}”</blockquote>${translation(el)}<p class="lumen-quote-source">${t('Fala no idioma da fonte.')} ${escape(item.sceneLocator)}${source >= 0 ? cite(refs[source], source, '', 'located') : ''}</p>`
      : `<p class="lumen-quote-missing">${t('A fala desta cena não foi confirmada; ela aparece em paráfrase.')}</p><p>${escape(item.scene)}</p><p class="lumen-quote-source">${escape(item.sceneLocator)}</p>`;
  }
  for (const el of template.content.querySelectorAll('[data-lumen-icon]')) {
    const drawing = ICONS[String(el.dataset.lumenIcon || '').toLowerCase()];
    if (!drawing) { el.remove(); continue; }
    el.classList.add('lumen-icon');
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${drawing}</svg>`;
  }
  // Images were downloaded and checked by the server; the model only chooses where they go.
  const images = Array.isArray(study.images) ? study.images : [];
  for (const el of template.content.querySelectorAll('[data-lumen-image]')) {
    const index = Number(el.dataset.lumenImage), image = images[index];
    if (!Number.isInteger(index) || image?.status !== 'ok' || !/^[a-f0-9]{32}\.(png|jpg|gif|webp)$/.test(image.file || '')) { el.remove(); continue; }
    el.classList.add('lumen-image');
    el.dataset.kind = String(image.kind || 'other').replace(/[^a-z]/g, '');
    el.innerHTML = `<img src="/media/${image.file}" alt="${escape(image.alt)}" width="${Math.max(1, image.width | 0)}" height="${Math.max(1, image.height | 0)}" loading="lazy" decoding="async"><figcaption>${image.caption ? `<span>${escape(image.caption)}</span>` : ''}${image.credit ? `<small>${escape(image.credit)}</small>` : ''}</figcaption>`;
  }
  const nonce = crypto.randomUUID().replaceAll('-', '');
  const json = value => JSON.stringify(value).replaceAll('<', '\\u003c').replaceAll('\u2028', '\\u2028').replaceAll('\u2029', '\\u2029');
  const failure = t('Uma interação desta página falhou. Você pode continuar pelo campo de conversa.');
  const bridge = `
    const channel = ${json(channel)};
    const send = (type, data) => parent.postMessage({lumen:channel,type,data}, '*');
    window.Lumen = Object.freeze({state:${json(study.interactiveState || {})}, draft:text=>send('draft',String(text).slice(0,8000)),saveState:state=>send('state',state)});
    document.addEventListener('submit', e=>e.preventDefault());
    document.addEventListener('click',e=>{const source=e.target.closest('[data-source-index]');if(source)send('source',Number(source.dataset.sourceIndex));});
    document.addEventListener('keydown',e=>{const source=e.target.closest('[data-source-index]');if(source&&(e.key==='Enter'||e.key===' ')){e.preventDefault();send('source',Number(source.dataset.sourceIndex));}});
    const report=()=>send('height',Math.ceil(document.documentElement.scrollHeight));
    new ResizeObserver(report).observe(document.body);window.addEventListener('load',report);report();
    window.addEventListener('error',()=>send('ui-error',${json(failure)}));
  `;
  const script = `${bridge}\ntry {\n${p.javascript}\n} catch(error) { send('ui-error',${json(failure)}); }`;
  const css = `
    :root{--lumen-ink:#2b1d14;--lumen-muted:#5f4b37;--lumen-paper:#f3e7cb;--lumen-paper-light:#fbf4e2;--lumen-paper-deep:#e8d6ac;--lumen-line:#d7c194;--lumen-red:#b8321b;--lumen-blue:#23358f;--lumen-gold:#c99a2e}
    *{box-sizing:border-box}body{margin:0;padding:1px 2px 20px;color:var(--lumen-ink);background:transparent;font:18px/1.7 "Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;overflow-wrap:anywhere}h1,h2,h3{line-height:1.15;font-weight:700;letter-spacing:-.01em}h1{font-size:36px}h2{font-size:28px;margin:32px 0 16px;color:var(--lumen-red)}h3{font-size:21px}p{max-width:70ch}button,input,textarea,select{font:16px/1.5 "Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;color:var(--lumen-ink)}button{cursor:pointer;border:1.5px solid var(--lumen-ink);border-radius:3px;padding:10px 15px;background:var(--lumen-paper-light);font-weight:600}button:hover{background:var(--lumen-paper-deep)}button[aria-pressed=true]{background:var(--lumen-blue);border-color:var(--lumen-blue);color:var(--lumen-paper-light)}button:focus-visible,a:focus-visible,[tabindex]:focus-visible{outline:3px solid var(--lumen-blue);outline-offset:3px}textarea,input{padding:11px;border:1.5px solid #2b1d1459;border-radius:3px;background:var(--lumen-paper-light);max-width:100%}textarea{width:100%;min-height:110px;resize:vertical}small{font-size:14.5px;line-height:1.6;color:var(--lumen-muted)}blockquote{font-size:22px;line-height:1.5;font-style:italic;margin:18px 0;padding-left:18px;border-left:3px solid var(--lumen-red)}a{color:var(--lumen-blue);cursor:pointer;text-decoration:underline;text-underline-offset:3px}svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.6;display:inline-block;vertical-align:middle}.reference-heading{display:flex;gap:12px;align-items:start;justify-content:space-between}.reference a,.ref-label{font-weight:700}.ref-location{font-size:15px;font-style:italic;color:var(--lumen-muted);margin:6px 0}.ref-excerpt{font-size:19px;font-style:italic;margin:12px 0}.ref-note{font-size:15.5px;color:var(--lumen-muted);white-space:pre-line}.seal{display:inline-flex;align-items:center;gap:6px;font-size:14.5px;font-weight:700;white-space:nowrap}.seal svg{width:22px;height:22px;stroke:none}.seal.located{color:#7a5a0c}.seal.reachable{color:#7c4d14}.seal.pending{color:var(--lumen-muted)}.lumen-source{margin:15px 0;padding:18px 0;border-top:1px solid var(--lumen-line)}.lumen-image{margin:22px 0;display:flex;flex-direction:column;gap:8px;min-width:0}.lumen-image img{display:block;width:100%;height:auto;max-height:560px;object-fit:contain;background:var(--lumen-paper-light);border:1.5px solid var(--lumen-ink);border-radius:3px;padding:8px}.lumen-image[data-kind=map] img,.lumen-image[data-kind=artwork] img{width:auto;max-width:100%;padding:0}.lumen-image[data-kind=map] img{max-height:none}.lumen-image[data-kind=scene] img{padding:0}.lumen-icon{display:inline-flex;align-items:center;justify-content:center;width:1.5em;height:1.5em;flex-shrink:0;vertical-align:-.32em;color:var(--lumen-red)}.lumen-icon svg{width:100%;height:100%}.lumen-cite{display:inline-flex;align-items:center;gap:6px;max-width:100%;margin:0 0 0 6px;padding:1px 10px 1px 7px;border:1px solid #2b1d1438;border-radius:999px;background:var(--lumen-paper-light);color:var(--lumen-muted);font-size:13.5px;font-weight:700;font-style:normal;line-height:1.6;vertical-align:.08em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.lumen-cite:hover{border-color:var(--lumen-ink);background:var(--lumen-paper-deep);color:var(--lumen-ink)}.lumen-cite i{width:9px;height:9px;flex-shrink:0;border-radius:50%;background:#d9a520;box-shadow:0 0 0 2px #d9a52038}.lumen-cite.reachable i{background:#ebcf98;box-shadow:inset 0 0 0 1.5px #7c4d14}.lumen-cite.pending i{background:transparent;box-shadow:none;border:1.5px dashed var(--lumen-muted)}.lumen-quote{margin:18px 0}.lumen-quote blockquote{margin:0}.lumen-translation{margin:8px 0 0;font-size:16.5px}.lumen-translation span{display:inline-block;margin-right:8px;padding:0 8px;border-radius:999px;background:#23358f14;color:var(--lumen-blue);font-size:13px;font-weight:700}.lumen-quote-source{display:flex;flex-wrap:wrap;align-items:center;gap:4px;margin:8px 0 0;font-size:14.5px;font-style:italic;color:var(--lumen-muted)}.lumen-quote-missing{font-style:italic;color:var(--lumen-muted);font-size:16px}.lumen-image figcaption span{display:block;font-style:italic;font-size:16px;line-height:1.4}.lumen-image figcaption small{display:block;margin-top:2px}.lumen-scene{padding:15px 0}.lumen-scene p{margin:0 0 10px}.lumen-scene small{display:block}.lumen-scene blockquote{margin-bottom:9px}@media(max-width:600px){body{font-size:17px}h1{font-size:28px}h2{font-size:24px}.reference-heading{display:block}.seal{margin-top:7px}}@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
  `;
  return { nonce, html: `<!doctype html><html lang="${(study.language || study.request?.language) === 'en' ? 'en' : 'pt-BR'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline'; img-src data: ${location.origin}/media/; font-src data:; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'"><style>${css}\n${p.css.replace(/<\/style/gi, '<\\/style')}</style></head><body>${template.innerHTML}<script nonce="${nonce}">${script.replace(/<\/script/gi, '<\\/script')}</script></body></html>` };
}

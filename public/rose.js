// Procedural rose windows. Each theme produces the same window every time:
// the theme sets the structure, the mode sets the glass, the depth sets the petals.
const GLASS = {
  cobalt: '#1f4fb8', sky: '#4c97d6', ruby: '#b51c3c', rose: '#d0567c', emerald: '#178a5c',
  teal: '#168a99', amber: '#e7a218', gold: '#f2c641', violet: '#6b3fa3', night: '#24318f'
};
const PALETTES = {
  study: ['cobalt', 'sky', 'emerald', 'teal', 'amber', 'violet', 'night'],
  direct: ['ruby', 'amber', 'gold', 'cobalt', 'rose', 'violet', 'night']
};
const LEAD = '#120e26';
const PETALS = { brief: 6, standard: 8, deep: 12 };
let uid = 0;

export const normalizeSeed = text => String(text || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim() || 'lumen';
function hash(text) {
  let h = 2166136261;
  for (const c of text) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
export function random(seedText) {
  let a = hash(seedText);
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const f = n => Math.round(n * 100) / 100;
const polar = (r, a) => `${f(r * Math.cos(a))} ${f(r * Math.sin(a))}`;
const sector = (r1, r2, a1, a2) => `M${polar(r2, a1)}A${r2} ${r2} 0 0 1 ${polar(r2, a2)}L${polar(r1, a2)}A${r1} ${r1} 0 0 0 ${polar(r1, a1)}Z`;

// Real glass is never one flat colour: each pane drifts a little lighter or darker.
function shade(hex, amount) {
  const n = parseInt(hex.slice(1), 16), target = amount < 0 ? 0 : 255, t = Math.abs(amount);
  return '#' + [16, 8, 0].map(shift => Math.round(((n >> shift) & 255) * (1 - t) + target * t).toString(16).padStart(2, '0')).join('');
}
export function roseSVG({ seed = 'lumen', mode = 'study', depth = 'standard', lit = true, texture = false, className = '' } = {}) {
  const n = PETALS[depth] || 8;
  const shape = random(normalizeSeed(seed));
  const glass = random(`${normalizeSeed(seed)}|${mode}`);
  const palette = PALETTES[mode] || PALETTES.study;
  const pick = () => GLASS[palette[Math.floor(glass() * palette.length)]];
  const tone = { wedgeA: pick(), wedgeB: pick(), ring: pick(), petal: pick(), inner: pick(), medal: pick(), lobe: pick(), bead: pick(), core: pick() };
  if (tone.petal === tone.wedgeA) tone.petal = GLASS[mode === 'direct' ? 'gold' : 'amber'];
  const alternate = shape() > .35, round = shape() > .55, quatrefoil = shape() > .5, beads = shape() > .3;
  const step = Math.PI * 2 / n, turn = -Math.PI / 2 + (shape() > .5 ? step / 2 : 0);
  const w = 56 * Math.sin(Math.PI / n) * (round ? .5 : .62);
  const id = `rose${++uid}`;
  const panes = [];
  const attrs = (tier, order, color) => `class="pane${lit ? ' lit' : ''}" data-tier="${tier}" data-order="${order}" fill="${shade(color, (glass() - .5) * .22)}"`;
  const pane = (tier, order, color, d, rotate) => panes.push({ tier, order, html: `<path ${attrs(tier, order, color)} d="${d}"${rotate === undefined ? '' : ` transform="rotate(${rotate})"`}/>` });
  const circle = (tier, order, color, cx, cy, r) => panes.push({ tier, order, html: `<circle ${attrs(tier, order, color)} cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}"/>` });
  const petal = round
    ? `M19 0C28 ${f(-w * 1.25)} 64 ${f(-w * 1.35)} 72 0C64 ${f(w * 1.35)} 28 ${f(w * 1.25)} 19 0Z`
    : `M19 0C23 ${f(-w)} 30 ${f(-w)} 38 ${f(-w)}L56 ${f(-w)}C65 ${f(-w)} 70 ${f(-w * .45)} 73 0C70 ${f(w * .45)} 65 ${f(w)} 56 ${f(w)}L38 ${f(w)}C30 ${f(w)} 23 ${f(w)} 19 0Z`;
  const innerPetal = `M24 0C28 ${f(-w * .6)} 38 ${f(-w * .6)} 45 0C38 ${f(w * .6)} 28 ${f(w * .6)} 24 0Z`;
  for (let i = 0; i < n; i++) {
    const a = turn + i * step, deg = f(a * 180 / Math.PI);
    const wedge = alternate && i % 2 ? tone.wedgeB : tone.wedgeA;
    pane(1, i, wedge, sector(16, 44, a - step / 2, a + step / 2));
    pane(1, i + n, shade(wedge, -.12), sector(44, 76, a - step / 2, a + step / 2));
    pane(4, i, tone.ring, sector(76, 95, a, a + step / 2));
    pane(4, i + n, shade(tone.ring, .1), sector(76, 95, a + step / 2, a + step));
    pane(2, i, tone.petal, petal, deg);
    pane(3, i, tone.inner, innerPetal, deg);
    circle(3, i, tone.medal, 59 * Math.cos(a), 59 * Math.sin(a), Math.min(w * .5, 6.5));
    circle(5, i, tone.lobe, 85.5 * Math.cos(a), 85.5 * Math.sin(a), 8.6);
    if (beads) circle(5, i + n, tone.bead, 86 * Math.cos(a + step / 2), 86 * Math.sin(a + step / 2), 4);
  }
  circle(0, 0, tone.core, 0, 0, 16);
  if (quatrefoil) for (let i = 0; i < 4; i++) circle(0, i + 1, GLASS.gold, 7.5 * Math.cos(i * Math.PI / 2 + Math.PI / 4), 7.5 * Math.sin(i * Math.PI / 2 + Math.PI / 4), 5.4);
  else circle(0, 1, GLASS.gold, 0, 0, 7.5);
  panes.sort((x, y) => x.tier - y.tier || x.order - y.order);
  const grain = texture ? `<filter id="${id}g" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency=".055" numOctaves="3" seed="${Math.floor(shape() * 90)}"/><feColorMatrix values="0 0 0 0 .07 0 0 0 0 .05 0 0 0 0 .12 0 0 0 -1.6 1.1"/><feComposite in2="SourceGraphic" operator="in"/></filter>` : '';
  return `<svg class="rose ${className}" viewBox="-100 -100 200 200" aria-hidden="true" focusable="false"><defs>${grain}<radialGradient id="${id}s" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="scale(96)"><stop offset="0" stop-color="#fff8dc" stop-opacity=".42"/><stop offset=".55" stop-color="#fff8dc" stop-opacity=".08"/><stop offset="1" stop-color="#fff8dc" stop-opacity="0"/></radialGradient></defs><circle r="97" fill="${LEAD}"/><g stroke="${LEAD}" stroke-width="1.7" stroke-linejoin="round">${panes.map(p => p.html).join('')}</g>${texture ? `<circle class="rose-grain" r="95" filter="url(#${id}g)"/>` : ''}<circle class="rose-shine" r="95" fill="url(#${id}s)"/><circle r="96.5" fill="none" stroke="#d8c79a" stroke-width="3.2"/><circle r="99" fill="none" stroke="#8d7a52" stroke-width="1"/></svg>`;
}

// Panes ordered from the centre outward, the order in which light reaches them.
const panesOf = svg => [...svg.querySelectorAll('.pane')];
export function lightFraction(svg, fraction) {
  if (!svg) return;
  const all = panesOf(svg), count = Math.round(Math.max(0, Math.min(1, fraction)) * all.length);
  all.forEach((el, i) => el.classList.toggle('lit', i < count));
  svg.style.setProperty('--shine', String(Math.max(0, Math.min(1, fraction))));
}
export function ripple(svg) {
  if (!svg) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { lightFraction(svg, 1); return; }
  const tiers = [...new Set(panesOf(svg).map(el => el.dataset.tier))];
  lightFraction(svg, 0);
  tiers.forEach((tier, i) => setTimeout(() => svg.querySelectorAll(`.pane[data-tier="${tier}"]`).forEach(el => el.classList.add('lit')), 70 + i * 85));
  setTimeout(() => svg.style.setProperty('--shine', '1'), 70 + tiers.length * 85);
}

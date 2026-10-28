const string = { type: 'string' };
const strings = { type: 'array', items: string };
const object = properties => ({ type: 'object', properties, required: Object.keys(properties), additionalProperties: false });

export const referenceSchema = object({
  kind: { type: 'string', enum: ['bible', 'catechism', 'church', 'saint', 'work'] },
  label: string,
  locator: string,
  url: string,
  excerpt: string,
  language: string,
  note: string
});

export const imageSchema = object({
  kind: { type: 'string', enum: ['character', 'place', 'map', 'item', 'scene', 'artwork', 'other'] },
  page: string,
  url: string,
  alt: string,
  caption: string,
  credit: string
});

export const studySchema = object({
  title: string,
  scope: string,
  introduction: string,
  evidenceNote: string,
  items: {
    type: 'array',
    items: object({
      title: string,
      scene: string,
      sceneLocator: string,
      quotation: string,
      quotationReference: string,
      question: string,
      references: { type: 'array', items: referenceSchema },
      hints: strings,
      explanation: string,
      limits: string,
      practice: string
    })
  },
  closingQuestions: strings,
  limitations: strings,
  images: { type: 'array', items: imageSchema },
  presentation: object({
    html: string,
    css: string,
    javascript: string,
    invitation: string
  })
});

export function isStudy(value) {
  const matches = (v, schema) => {
    if (schema.type === 'string') return typeof v === 'string' && v.length <= 30000 && (!schema.enum || schema.enum.includes(v));
    if (schema.type === 'array') return Array.isArray(v) && v.length <= 40 && v.every(x => matches(x, schema.items));
    return v !== null && typeof v === 'object' && !Array.isArray(v) && schema.required.every(k => Object.hasOwn(v, k) && matches(v[k], schema.properties[k])) && Object.keys(v).every(k => Object.hasOwn(schema.properties, k));
  };
  return matches(value, studySchema) && value.items.length <= 8 && value.images.length <= 12 && value.items.every(x => x.references.length <= 12);
}

export function enforceMode(study, mode) {
  return {
    ...study,
    items: study.items.map(item => ({ ...item, explanation: mode === 'study' ? '' : item.explanation, hints: item.hints.slice(0, 2) }))
  };
}

export function validateInput(body) {
  if (!body || typeof body !== 'object') throw new Error('Preencha os dados da investigação.');
  if (!['codex', 'claude'].includes(body.provider)) throw new Error('Escolha Claude ou ChatGPT.');
  if (!['study', 'direct'].includes(body.mode)) throw new Error('Escolha um dos dois modos.');
  const clean = (key, max, fallback = '') => {
    if (body[key] === undefined) return fallback;
    if (typeof body[key] !== 'string' || body[key].length > max) throw new Error(`O campo ${key} excede o tamanho permitido.`);
    return body[key].trim();
  };
  const theme = clean('theme', 500);
  if (!theme) throw new Error('Conte qual obra ou tema você quer investigar.');
  return {
    theme,
    provider: body.provider,
    mode: body.mode,
    medium: clean('medium', 80, 'Obra ou tema'),
    scope: clean('scope', 2000),
    evidence: clean('evidence', 20000),
    depth: ['brief', 'standard', 'deep'].includes(body.depth) ? body.depth : 'standard',
    spoilers: body.spoilers === true,
    spoilerLimit: clean('spoilerLimit', 500),
    language: body.language === 'en' ? 'en' : 'pt'
  };
}

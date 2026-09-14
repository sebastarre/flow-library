import {
  ACCIONES, CATEGORIAS, CONTEXTO, IDIOMAS, LIMITES, LOGICAS, SLUG_RE, TIPOS_CONDICION,
  normalizeFlow, slugify, validateFlow,
} from './validate.js';

const app = document.getElementById('app');
const toastEl = document.getElementById('toast');
const DRAFT_KEY = 'flow-library:borrador';

let data = null;
let loadErrors = null;
let form = null;
let refreshPublish = () => {};
let lastLibraryHash = '#/';

/* ---------- Language ---------- */
// The flow parts of the page (and the whole flow page) follow the flow's language.
// Site chrome (library, form instructions) stays in Spanish.

const UI = {
  es: {
    code: 'es',
    allFlows: 'Todos los flows', copy: 'Copiar', copied: 'Copiado', copyLink: 'Copiar link', linkCopied: 'Link copiado',
    copyAll: 'Copiar todo', flowCopied: 'Flow copiado', edit: 'Editar', addFlow: 'Agregar flow',
    copyFailed: 'No se pudo copiar. Seleccioná el texto y copialo a mano.',
    howto: 'En LearnWise andá a Tutor Assistant → Flujos y creá un flujo nuevo. Copiá cada campo con su botón y pegalo en el mismo lugar.',
    note: 'Ojo: ', notes: 'Notas',
    step1: 'Activador', step2: 'Condiciones', step3: 'Respuesta',
    sub1: 'Defina el evento que inicia este flujo',
    sub2: 'Criterios que deben cumplirse para que el flujo continúe.',
    sub3: 'Defina lo que sucederá si se cumplen el activador y las condiciones.',
    event: 'Evento', logic: 'Lógica de condiciones', noConditions: 'Sin condiciones: el flujo corre siempre que ocurre el activador.',
    condition: 'Condición', action: 'Acción', config: 'Configuración', otherAction: 'Otra acción',
    matching: 'Ejemplos coincidentes', nonMatching: 'Ejemplos no coincidentes', example: 'Ejemplo',
    examples: (n) => (n === 1 ? '1 ejemplo' : `${n} ejemplos`),
    conditions: (n) => (n === 1 ? '1 condición' : `${n} condiciones`),
    userMessage: 'Mensaje del usuario', explanation: 'Explicación', noExamples: 'Todavía no hay ejemplos cargados.',
    empty: 'Vacío', notSet: 'Sin configurar', on: 'Activado', off: 'Desactivado', checked: 'Marcado', unchecked: 'Sin marcar', yes: 'Sí', no: 'No',
    escalar: 'Solicitar al usuario escalar para consultas no resueltas',
    escalarDesc: "Cuando el asistente de IA no sabe la respuesta a una pregunta, presentará el botón de escalamiento 'contactar soporte' al usuario.",
    mejoras: 'Crear elementos de mejora de conocimientos para consultas no resueltas',
    mejorasDesc: 'Cuando el asistente de IA no sabe la respuesta a una pregunta, agregará automáticamente un nuevo elemento a su lista de tareas de mejora de conocimientos.',
    advanced: 'Configuración avanzada', directrices: 'Directrices de búsqueda', estilo: 'Estilo de respuesta',
    anular: 'Anular estilo de respuesta', anularDesc: 'Si no está marcado, sus instrucciones se agregarán a las instrucciones globales.',
    instruirIa: 'Instruir a la IA para generar mensaje', seguirGlobales: 'También seguir las instrucciones globales de respuesta', instruccion: 'Instrucción',
    botonNombre: 'Nombre del botón', botonTipo: 'Tipo de botón', url: 'URL', mostrarIcono: 'Mostrar ícono',
    addCondition: 'Agregar una condición', addAction: 'Agregar una acción', addExample: 'Agregar ejemplo',
    footer1: 'Los flows se guardan en ', footer2: '. Cambiar un flow acá no cambia LearnWise: hacé el mismo cambio en los dos lados.',
    notFound: 'No encontramos ese flow', notFoundLead: 'Puede que lo hayan renombrado o borrado.',
  },
  en: {
    code: 'en',
    allFlows: 'All flows', copy: 'Copy', copied: 'Copied', copyLink: 'Copy link', linkCopied: 'Link copied',
    copyAll: 'Copy all', flowCopied: 'Flow copied', edit: 'Edit', addFlow: 'Add flow',
    copyFailed: "Couldn't copy. Select the text and copy it manually.",
    howto: 'In LearnWise, go to Tutor Assistant → Flows and create a new flow. Copy each field with its button and paste it into the same place.',
    note: 'Note: ', notes: 'Notes',
    step1: 'Trigger', step2: 'Conditions', step3: 'Response',
    sub1: 'Define the event that starts this flow',
    sub2: 'Criteria that must be met for the flow to continue.',
    sub3: 'Define what happens when the trigger and the conditions are met.',
    event: 'Event', logic: 'Condition logic', noConditions: 'No conditions: the flow runs every time the trigger happens.',
    condition: 'Condition', action: 'Action', config: 'Configuration', otherAction: 'Other action',
    matching: 'Matching examples', nonMatching: 'Non-matching examples', example: 'Example',
    examples: (n) => (n === 1 ? '1 example' : `${n} examples`),
    conditions: (n) => (n === 1 ? '1 condition' : `${n} conditions`),
    userMessage: 'User message', explanation: 'Explanation', noExamples: 'No examples added yet.',
    empty: 'Empty', notSet: 'Not set', on: 'On', off: 'Off', checked: 'Checked', unchecked: 'Unchecked', yes: 'Yes', no: 'No',
    escalar: 'Ask the user to escalate unresolved queries',
    escalarDesc: "When the AI assistant doesn't know the answer to a question, it will show the user the 'contact support' escalation button.",
    mejoras: 'Create knowledge improvement items for unresolved queries',
    mejorasDesc: "When the AI assistant doesn't know the answer to a question, it will automatically add a new item to your knowledge improvement task list.",
    advanced: 'Advanced settings', directrices: 'Search guidelines', estilo: 'Response style',
    anular: 'Override response style', anularDesc: 'If unchecked, your instructions will be added to the global instructions.',
    instruirIa: 'Instruct the AI to generate the message', seguirGlobales: 'Also follow the global response instructions', instruccion: 'Instruction',
    botonNombre: 'Button name', botonTipo: 'Button type', url: 'URL', mostrarIcono: 'Show icon',
    addCondition: 'Add a condition', addAction: 'Add an action', addExample: 'Add example',
    footer1: 'Flows are stored on ', footer2: ". Changing a flow here doesn't change LearnWise: make the same change in both places.",
    notFound: "We couldn't find that flow", notFoundLead: 'It may have been renamed or deleted.',
  },
};
let L = UI.es;

// Same order and texts as "Agregar una acción" in LearnWise. Types without their own fields yet use a free-text "Configuración".
const CATALOGO_ACCIONES = [
  { tipo: ACCIONES.MENSAJE, icono: 'message', es: ['Mensaje', 'Enviar una respuesta de texto personalizada'], en: ['Message', 'Send a custom text response'] },
  { tipo: ACCIONES.BOTON, icono: 'external', es: ['Botón', 'Mostrar un botón o enlace clicable'], en: ['Button', 'Show a clickable button or link'] },
  { tipo: ACCIONES.BUSCAR, icono: 'search', es: ['Buscar en conocimientos', 'Consultar su base de conocimientos'], en: ['Search knowledge', 'Query your knowledge base'] },
  { tipo: 'Seguimientos', icono: 'question', es: ['Seguimientos', 'Sugerir preguntas de seguimiento'], en: ['Follow-ups', 'Suggest follow-up questions'] },
  { tipo: 'Iframe', icono: 'frame', es: ['Iframe', 'Incrustar contenido externo en línea'], en: ['Iframe', 'Embed external content inline'] },
  { tipo: 'Solicitud API', icono: 'api', es: ['Solicitud API', 'Llamar a un endpoint API externo'], en: ['API request', 'Call an external API endpoint'] },
  { tipo: 'Enviar correo electrónico', icono: 'at', es: ['Enviar correo electrónico', 'Enviar correo electrónico'], en: ['Send email', 'Send an email'] },
  { tipo: 'Mejora', icono: 'trend', es: ['Mejora', 'Marcar para seguimiento de revisión'], en: ['Improvement', 'Flag for review follow-up'] },
  { tipo: 'Transferencia', icono: 'transfer', beta: true, es: ['Transferencia', 'Transferir a otro asistente'], en: ['Transfer', 'Transfer to another assistant'] },
  { tipo: 'Modo de estudio', icono: 'cap', es: ['Modo de estudio', 'Ingresar al cuestionario de autoevaluación'], en: ['Study mode', 'Enter the self-assessment quiz'] },
  { tipo: 'Iniciar H5P interactivo', icono: 'puzzle', es: ['Iniciar H5P interactivo', 'Cuestionarios, tarjetas de memoria, arrastrar palabras y más'], en: ['Start interactive H5P', 'Quizzes, flashcards, drag the words and more'] },
];

// Flow files always store the Spanish option labels; English flows show them translated.
const VALORES_EN = {
  'El usuario envía un mensaje': 'User sends a message',
  'Cualquier condición coincide': 'Any condition matches',
  'Todas las condiciones coinciden': 'All conditions match',
  'Contexto de la conversación': 'Conversation context',
  'Rol de usuario': 'User role',
  'Datos externos': 'External data',
  Curso: 'Course',
  'Programación': 'Schedule',
  'Mensaje personalizado': 'Custom message',
  'Enlace externo': 'External link',
  ...Object.fromEntries(CATALOGO_ACCIONES.filter((c) => c.tipo !== ACCIONES.MENSAJE).map((c) => [c.tipo, c.en[0]])),
};
const VALORES_ES = Object.fromEntries(Object.entries(VALORES_EN).map(([es, en]) => [en, es]));
const mostrar = (lang, v) => (lang === 'en' ? VALORES_EN[v] ?? v : v);
const guardar = (lang, v) => (lang === 'en' ? VALORES_ES[v] ?? v : v);

/* ---------- DOM helpers ---------- */

function h(tag, props, ...kids) {
  const el = document.createElement(tag);
  let value;
  for (const [k, v] of Object.entries(props ?? {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'value') value = v;
    else if (k === 'checked') el.checked = true;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat(Infinity)) {
    if (kid == null || kid === false) continue;
    el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  }
  if (value !== undefined) el.value = value;
  return el;
}

const PATHS = {
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  up: '<path d="M6 15l6-6 6 6"/>',
  down: '<path d="M6 9l6 6 6-6"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  message: '<path d="M20 11.5a8 8 0 0 1-11.6 7.1L4 20l1.4-4.2A8 8 0 1 1 20 11.5z"/>',
  question: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.3M12 17h.01"/>',
  frame: '<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><path d="M10 10l-2 2 2 2M14 10l2 2-2 2"/>',
  api: '<text x="12" y="15" text-anchor="middle" font-size="8.5" font-weight="700" font-family="system-ui, sans-serif" fill="currentColor" stroke="none">API</text>',
  at: '<circle cx="12" cy="12" r="3.5"/><path d="M15.5 8.5V13a2.5 2.5 0 0 0 5 0v-1a8.5 8.5 0 1 0-3.3 6.7"/>',
  trend: '<path d="M3 16l5-5 4 3 8-8"/><path d="M3 20h18"/>',
  transfer: '<circle cx="6" cy="18" r="2"/><rect x="16" y="4" width="4" height="4" rx="1"/><path d="M6 16V9a3 3 0 0 1 3-3h7"/>',
  cap: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5M22 9v5"/>',
  puzzle: '<path d="M10 4a2 2 0 1 1 4 0v2h4v4h-1.5a2 2 0 1 0 0 4H18v4h-4v-1.5a2 2 0 1 0-4 0V18H6v-4h1.5a2 2 0 1 0 0-4H6V6h4z"/>',
};

function icon(name) {
  return h('span', { class: 'icon', html: `<svg viewBox="0 0 24 24" aria-hidden="true">${PATHS[name]}</svg>` });
}

let toastTimer;
function toast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
}

const normalizar = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/* ---------- Clipboard ---------- */

async function copyText(plain, html) {
  try {
    if (html && window.ClipboardItem && navigator.clipboard?.write) {
      await navigator.clipboard.write([new ClipboardItem({
        'text/plain': new Blob([plain], { type: 'text/plain' }),
        'text/html': new Blob([html], { type: 'text/html' }),
      })]);
    } else {
      await navigator.clipboard.writeText(plain);
    }
    return true;
  } catch {
    const ta = h('textarea', { class: 'clip-fallback', value: plain });
    document.body.append(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

function copyButton(getPlain, { label = L.copy, getHtml = null, big = false, iconName = 'copy', done = L.copied } = {}) {
  const failed = L.copyFailed;
  const btn = h('button', { type: 'button', class: big ? 'btn' : 'copy-btn' });
  const idle = () => btn.replaceChildren(icon(iconName), label);
  idle();
  btn.addEventListener('click', async () => {
    const ok = await copyText(getPlain(), getHtml?.());
    if (!ok) return toast(failed);
    btn.replaceChildren(icon('check'), done);
    btn.classList.add('is-done');
    toast(done);
    setTimeout(() => { idle(); btn.classList.remove('is-done'); }, 1600);
  });
  return btn;
}

/* ---------- Rich text (Estilo de respuesta) ---------- */
// Lines starting with "- " are bullets, indented lines continue the bullet above, *text* is italic, **text** is bold.

function escapeHtml(s) {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function richToHtml(text) {
  const inline = (s) => escapeHtml(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
  let html = '';
  let items = null;
  const closeList = () => { if (items) html += `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`; items = null; };
  for (const line of text.split(/\r?\n/)) {
    const bullet = line.match(/^\s*[-•]\s+(.*)$/);
    if (bullet) (items ??= []).push(inline(bullet[1]));
    else if (items && /^\s{2,}\S/.test(line)) items[items.length - 1] += `<br>${inline(line.trim())}`;
    else { closeList(); if (line.trim()) html += `<p>${inline(line)}</p>`; }
  }
  closeList();
  return html;
}

const richToPlain = (text) => text.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1');

/* ---------- Shared pieces ---------- */

function stepCard(n, ...content) {
  return h('section', { class: `step step-${n}` },
    h('header', { class: 'step-head' },
      h('span', { class: 'step-num' }, String(n)),
      h('div', null, h('h2', null, L[`step${n}`]), h('p', null, L[`sub${n}`]))),
    h('div', { class: 'step-body' }, content));
}

function topbar() {
  const onForm = location.hash.startsWith('#/nuevo') || location.hash.startsWith('#/editar');
  return h('header', { class: 'topbar' },
    h('div', { class: 'wrap' },
      h('a', { class: 'brand', href: lastLibraryHash }, h('span', { class: 'brand-mark' }, 'F'), h('span', null, 'Flow Library ', h('small', null, '· LearnWise'))),
      onForm ? null : h('a', { class: 'btn btn-small', href: '#/nuevo' }, icon('plus'), L.addFlow)));
}

function footer() {
  const repo = data ? `https://github.com/${data.repo}` : null;
  return h('footer', { class: 'footer wrap' },
    L.footer1, repo ? h('a', { href: repo, target: '_blank', rel: 'noopener' }, 'GitHub') : 'GitHub', L.footer2);
}

const flowLink = (f) => `${location.origin}${location.pathname}#/flow/${f.slug}`;

function flowTags(f) {
  return h('div', { class: 'card-tags' },
    h('span', { class: 'tag' }, f.categoria),
    h('span', { class: 'lang', title: IDIOMAS[f.idioma] }, f.idioma.toUpperCase()));
}

/* ---------- Library ---------- */

const filtro = { q: '', idioma: '', cat: '' };

function libraryHash() {
  const params = new URLSearchParams();
  if (filtro.idioma) params.set('idioma', filtro.idioma);
  if (filtro.cat) params.set('cat', filtro.cat);
  const qs = params.toString();
  return `#/${qs ? `?${qs}` : ''}`;
}

function textoBuscable(f) {
  const partes = [f.nombre, f.descripcion, f.categoria, IDIOMAS[f.idioma], f.activador];
  for (const c of f.condiciones.lista) {
    partes.push(c.tipo, mostrar('en', c.tipo), c.contexto, c.valor);
    for (const e of [...(c.coincidentes ?? []), ...(c.no_coincidentes ?? [])]) partes.push(e.mensaje);
  }
  for (const a of f.respuesta) partes.push(a.tipo, mostrar('en', a.tipo));
  return normalizar(partes.filter(Boolean).join(' '));
}

function viewLibrary(params) {
  document.title = 'Flow Library';
  filtro.idioma = Object.hasOwn(IDIOMAS, params.get('idioma') ?? '') ? params.get('idioma') : '';
  filtro.cat = CATEGORIAS.includes(params.get('cat')) ? params.get('cat') : '';
  lastLibraryHash = libraryHash();

  const setFiltro = (key, value) => {
    filtro[key] = value;
    history.replaceState(null, '', libraryHash());
    rerender();
  };

  const porIdioma = data.flows.filter((f) => !filtro.idioma || f.idioma === filtro.idioma);
  const grid = h('div', { class: 'grid' });
  const count = h('p', { class: 'result-count', 'aria-live': 'polite' });

  const renderGrid = () => {
    const q = normalizar(filtro.q.trim());
    const items = porIdioma.filter((f) => (!filtro.cat || f.categoria === filtro.cat) && (!q || textoBuscable(f).includes(q)));
    count.textContent = items.length === 1 ? '1 flow' : `${items.length} flows`;
    grid.replaceChildren(...(items.length ? items.map(card) : [h('div', { class: 'empty' }, 'No hay flows que coincidan con estos filtros.')]));
  };
  renderGrid();

  const option = (key, value, label, n) => h('button', {
    type: 'button', class: 'chip', 'aria-pressed': String(filtro[key] === value), onclick: () => setFiltro(key, value),
  }, label, h('span', { class: 'chip-count' }, String(n)));

  return h('main', { class: 'wrap' },
    h('div', { class: 'hero' },
      h('h1', null, 'Flows listos para copiar'),
      h('p', { class: 'lead' }, 'Abrí un flow y copiá cada campo en LearnWise (Tutor Assistant → Flujos). Cada campo tiene su propio botón para copiar.')),
    h('div', { class: 'toolbar' },
      h('label', { class: 'search' }, icon('search'),
        h('input', {
          type: 'search', placeholder: 'Buscar por nombre, contexto o mensaje de ejemplo…', 'aria-label': 'Buscar flows', value: filtro.q,
          oninput: (e) => { filtro.q = e.target.value; renderGrid(); },
        }))),
    h('div', { class: 'filters' },
      h('div', { class: 'filter-row' },
        h('span', { class: 'filter-label' }, 'Idioma'),
        h('div', { class: 'chips', role: 'group', 'aria-label': 'Filtrar por idioma' },
          option('idioma', '', 'Todos', data.flows.length),
          Object.entries(IDIOMAS).map(([code, name]) => option('idioma', code, name, data.flows.filter((f) => f.idioma === code).length)))),
      h('div', { class: 'filter-row' },
        h('span', { class: 'filter-label' }, 'Categoría'),
        h('div', { class: 'chips', role: 'group', 'aria-label': 'Filtrar por categoría' },
          option('cat', '', 'Todas', porIdioma.length),
          CATEGORIAS.map((c) => option('cat', c, c, porIdioma.filter((f) => f.categoria === c).length))))),
    count,
    grid);
}

function card(f) {
  const T = UI[f.idioma];
  const ejemplos = f.condiciones.lista.reduce((n, c) => n + (c.coincidentes?.length ?? 0) + (c.no_coincidentes?.length ?? 0), 0);
  return h('a', { class: 'card', href: `#/flow/${f.slug}`, lang: f.idioma },
    flowTags(f),
    h('h3', null, f.nombre),
    h('p', null, f.descripcion),
    h('div', { class: 'card-meta' },
      h('span', { class: 'meta-pill' }, T.conditions(f.condiciones.lista.length)),
      ejemplos ? h('span', { class: 'meta-pill' }, T.examples(ejemplos)) : null,
      f.respuesta.map((a) => h('span', { class: 'meta-pill' }, mostrar(f.idioma, a.tipo)))));
}

/* ---------- Flow detail ---------- */

function field(label, value, { rich = false, limit = null, emptyText = L.empty, warn = false } = {}) {
  const v = value ?? '';
  const empty = !v.trim();
  const body = empty
    ? h('div', { class: `field-value ${warn ? 'is-warn' : 'is-empty'}` }, emptyText)
    : rich
      ? h('div', { class: 'field-value rich', html: richToHtml(v) })
      : h('div', { class: 'field-value' }, v);
  return h('div', { class: 'field' },
    h('div', { class: 'field-head' },
      h('span', { class: 'field-label' }, label),
      h('span', { class: 'field-count' }, limit ? `${v.length}/${limit}` : ''),
      empty ? null : copyButton(() => (rich ? richToPlain(v) : v), { getHtml: rich ? () => richToHtml(v) : null })),
    body);
}

function stateText(on, kind) {
  return kind === 'check' ? (on ? L.checked : L.unchecked) : (on ? L.on : L.off);
}

function setting(label, on, desc, kind = 'switch') {
  const mark = kind === 'check'
    ? h('span', { class: `checkbox${on ? ' on' : ''}` }, on ? icon('check') : null)
    : h('span', { class: `switch${on ? ' on' : ''}` });
  return h('div', { class: 'setting' },
    h('div', { class: 'setting-text' }, h('div', { class: 'setting-label' }, label), desc ? h('div', { class: 'setting-desc' }, desc) : null),
    h('span', { class: 'state' }, stateText(on, kind), mark));
}

function blockHead(kicker, title, tools) {
  return h('div', { class: 'block-head' }, h('span', { class: 'block-kicker' }, kicker), h('h3', null, title), tools);
}

function ejemplosView(list, kind) {
  return h('details', { class: 'examples', open: list.length > 0 },
    h('summary', null,
      h('span', { class: `badge ${kind}` }, kind === 'match' ? L.matching : L.nonMatching),
      h('span', { class: 'muted' }, L.examples(list.length))),
    h('div', { class: 'examples-body' },
      list.length
        ? h('ol', { class: 'example-list' }, list.map((e) => h('li', { class: 'example' },
          field(L.userMessage, e.mensaje),
          field(L.explanation, e.explicacion, { limit: LIMITES.explicacion }))))
        : h('p', { class: 'muted' }, L.noExamples)));
}

function condicionView(c, i) {
  const head = blockHead(`${L.condition} ${i + 1}`, mostrar(L.code, c.tipo));
  if (c.tipo !== CONTEXTO) return h('div', { class: 'block' }, head, field(L.config, c.valor));
  return h('div', { class: 'block' }, head,
    field(mostrar(L.code, CONTEXTO), c.contexto),
    ejemplosView(c.coincidentes, 'match'),
    ejemplosView(c.no_coincidentes, 'nomatch'));
}

function accionView(a, i) {
  const head = blockHead(`${L.action} ${i + 1}`, mostrar(L.code, a.tipo));
  switch (a.tipo) {
    case ACCIONES.BUSCAR:
      return h('div', { class: 'block' }, head,
        setting(L.escalar, a.escalar_no_resueltas, L.escalarDesc),
        setting(L.mejoras, a.crear_mejoras, L.mejorasDesc),
        h('h4', { class: 'sub' }, L.advanced),
        field(L.directrices, a.directrices_busqueda, { limit: LIMITES.directrices_busqueda }),
        field(L.estilo, a.estilo_respuesta, { limit: LIMITES.estilo_respuesta, rich: true }),
        setting(L.anular, a.anular_estilo, L.anularDesc, 'check'));
    case ACCIONES.MENSAJE:
      return h('div', { class: 'block' }, head,
        setting(L.instruirIa, a.instruir_ia),
        setting(L.seguirGlobales, a.seguir_instrucciones_globales),
        field(L.instruccion, a.instruccion));
    case ACCIONES.BOTON:
      return h('div', { class: 'block' }, head,
        field(L.botonNombre, a.nombre),
        field(L.botonTipo, mostrar(L.code, a.tipo_boton)),
        field(L.url, a.url, { warn: true, emptyText: L.notSet }),
        setting(L.mostrarIcono, a.mostrar_icono));
    default:
      return h('div', { class: 'block' }, head, field(L.config, a.valor));
  }
}

function flowToText(f) {
  const T = UI[f.idioma];
  const v = (x) => mostrar(f.idioma, x);
  const onOff = (x) => (x ? T.on : T.off);
  const out = [`FLOW: ${f.nombre}`, f.descripcion, '', `1. ${T.step1.toUpperCase()}`, v(f.activador), '', `2. ${T.step2.toUpperCase()}`, `${T.logic}: ${v(f.condiciones.logica)}`];
  f.condiciones.lista.forEach((c, i) => {
    out.push('', `${T.condition} ${i + 1} — ${v(c.tipo)}`);
    if (c.tipo !== CONTEXTO) return out.push(c.valor);
    out.push(`${v(CONTEXTO)}: ${c.contexto}`);
    for (const [titulo, lista] of [[T.matching, c.coincidentes], [T.nonMatching, c.no_coincidentes]]) {
      out.push(`${titulo}:`);
      if (!lista.length) out.push(`  (${T.noExamples})`);
      for (const e of lista) out.push(`- ${T.userMessage}: ${e.mensaje}`, `  ${T.explanation}: ${e.explicacion}`);
    }
  });
  out.push('', `3. ${T.step3.toUpperCase()}`);
  f.respuesta.forEach((a, i) => {
    out.push('', `${T.action} ${i + 1} — ${v(a.tipo)}`);
    switch (a.tipo) {
      case ACCIONES.BUSCAR:
        out.push(
          `${T.escalar}: ${onOff(a.escalar_no_resueltas)}`,
          `${T.mejoras}: ${onOff(a.crear_mejoras)}`,
          `${T.directrices}:`, a.directrices_busqueda,
          `${T.estilo}:`, richToPlain(a.estilo_respuesta),
          `${T.anular}: ${a.anular_estilo ? T.yes : T.no}`);
        break;
      case ACCIONES.MENSAJE:
        out.push(`${T.instruirIa}: ${onOff(a.instruir_ia)}`, `${T.seguirGlobales}: ${onOff(a.seguir_instrucciones_globales)}`, `${T.instruccion}: ${a.instruccion}`);
        break;
      case ACCIONES.BOTON:
        out.push(`${T.botonNombre}: ${a.nombre}`, `${T.botonTipo}: ${v(a.tipo_boton)}`, `${T.url}: ${a.url || `(${T.notSet})`}`, `${T.mostrarIcono}: ${onOff(a.mostrar_icono)}`);
        break;
      default:
        out.push(a.valor);
    }
  });
  if (f.notas) out.push('', `${T.notes}: ${f.notas}`);
  return out.join('\n');
}

function viewFlow(slug) {
  const f = data.flows.find((x) => x.slug === slug);
  if (!f) return viewNotFound();
  L = UI[f.idioma];
  document.title = `${f.nombre} · Flow Library`;
  const { lista, logica } = f.condiciones;

  return h('main', { class: 'wrap', lang: f.idioma },
    h('a', { class: 'back', href: lastLibraryHash }, icon('back'), L.allFlows),
    h('div', { class: 'flow-head' },
      h('div', null,
        flowTags(f),
        h('h1', null, f.nombre),
        h('p', { class: 'lead' }, f.descripcion)),
      h('div', { class: 'flow-actions' },
        copyButton(() => flowLink(f), { label: L.copyLink, big: true, iconName: 'link', done: L.linkCopied }),
        copyButton(() => flowToText(f), { label: L.copyAll, big: true, done: L.flowCopied }),
        h('a', { class: 'btn', href: `#/editar/${f.slug}` }, icon('edit'), L.edit))),
    h('p', { class: 'howto' }, icon('info'), h('span', null, L.howto)),
    f.notas ? h('p', { class: 'note' }, h('span', null, h('strong', null, L.note), f.notas)) : null,
    stepCard(1, field(L.event, mostrar(L.code, f.activador))),
    stepCard(2,
      h('div', { class: 'logic' },
        h('span', { class: 'field-label' }, L.logic),
        h('div', { class: 'radios' }, LOGICAS.map((l) => h('span', { class: `radio${l === logica ? ' on' : ''}` }, h('span', { class: 'dot' }), mostrar(L.code, l))))),
      lista.length ? lista.map(condicionView) : h('p', { class: 'muted' }, L.noConditions)),
    stepCard(3, f.respuesta.map(accionView)));
}

function viewNotFound() {
  document.title = 'Flow Library';
  return h('main', { class: 'wrap' },
    h('div', { class: 'hero' }, h('h1', null, L.notFound), h('p', { class: 'lead' }, L.notFoundLead)),
    h('a', { class: 'btn', href: '#/' }, icon('back'), L.allFlows));
}

/* ---------- Add / edit form ---------- */

const nuevoEjemplo = () => ({ mensaje: '', explicacion: '' });

function nuevaCondicion(tipo) {
  return tipo === CONTEXTO ? { tipo, contexto: '', coincidentes: [nuevoEjemplo()], no_coincidentes: [nuevoEjemplo()] } : { tipo, valor: '' };
}

function nuevaAccion(tipo) {
  switch (tipo) {
    case ACCIONES.BUSCAR:
      return { tipo, escalar_no_resueltas: false, crear_mejoras: false, directrices_busqueda: '', estilo_respuesta: '', anular_estilo: false };
    case ACCIONES.MENSAJE:
      return { tipo, instruir_ia: true, seguir_instrucciones_globales: true, instruccion: '' };
    case ACCIONES.BOTON:
      return { tipo, nombre: '', tipo_boton: 'Enlace externo', url: '', mostrar_icono: false };
    default:
      return { tipo, valor: '' };
  }
}

const flowVacio = () => ({
  nombre: '', idioma: '', categoria: '', descripcion: '', activador: 'El usuario envía un mensaje',
  condiciones: { logica: LOGICAS[0], lista: [nuevaCondicion(CONTEXTO)] },
  respuesta: [nuevaAccion(ACCIONES.BUSCAR)],
  notas: '',
});

function loadDraft() {
  try {
    const saved = JSON.parse(localStorage.getItem(DRAFT_KEY));
    return saved?.draft ? saved : null;
  } catch { return null; }
}

function saveDraft() {
  if (form?.mode !== 'nuevo') return;
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ draft: form.draft, slug: form.slug, slugTouched: form.slugTouched })); } catch { /* storage unavailable */ }
}

function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY); } catch { /* storage unavailable */ }
}

function rerender() {
  const y = window.scrollY;
  render();
  window.scrollTo(0, y);
}

function changed() {
  saveDraft();
  refreshPublish();
}

let uid = 0;
function input(obj, key, { label, placeholder, multiline = false, rows = 3, limit = null, required = false, help = null, list = null, readonly = false, onInput = null, show = (v) => v, parse = (v) => v } = {}) {
  const id = `f${++uid}`;
  const ctrl = h(multiline ? 'textarea' : 'input', {
    id, class: 'input', placeholder, rows: multiline ? rows : null, type: multiline ? null : 'text',
    list, readonly, value: show(obj[key] ?? ''),
  });
  const counter = limit ? h('span', { class: 'field-count' }) : null;
  const updateCounter = () => {
    if (!counter) return;
    counter.textContent = `${ctrl.value.length}/${limit}`;
    counter.classList.toggle('over', ctrl.value.length > limit);
  };
  ctrl.addEventListener('input', () => {
    obj[key] = parse(ctrl.value);
    updateCounter();
    onInput?.(ctrl.value);
    changed();
  });
  updateCounter();
  return h('div', { class: 'form-field' },
    h('div', { class: 'field-head' }, h('label', { for: id, class: 'field-label' }, label, required ? h('span', { class: 'req' }, ' *') : null), counter),
    help ? h('p', { class: 'help' }, help) : null,
    ctrl);
}

function choice(obj, key, label, options) {
  return h('div', { class: 'form-field' },
    h('span', { class: 'field-label' }, label, h('span', { class: 'req' }, ' *')),
    h('div', { class: 'chips', role: 'radiogroup', 'aria-label': label },
      options.map(([value, text]) => h('label', { class: `chip${obj[key] === value ? ' is-on' : ''}` },
        h('input', { type: 'radio', name: key, value, checked: obj[key] === value, onchange: () => { obj[key] = value; changed(); rerender(); } }),
        text))));
}

function toggle(obj, key, label, desc, kind = 'switch') {
  const mark = h('span', { class: kind === 'check' ? 'checkbox' : 'switch' });
  const state = h('span', { class: 'state' });
  const labels = { on: L.on, off: L.off, checked: L.checked, unchecked: L.unchecked };
  const paint = () => {
    const on = obj[key];
    mark.classList.toggle('on', on);
    if (kind === 'check') mark.replaceChildren(on ? icon('check') : '');
    state.replaceChildren(kind === 'check' ? (on ? labels.checked : labels.unchecked) : (on ? labels.on : labels.off), mark);
  };
  const box = h('input', { type: 'checkbox', checked: obj[key], onchange: (e) => { obj[key] = e.target.checked; paint(); changed(); } });
  paint();
  return h('label', { class: 'setting' },
    box,
    h('span', { class: 'setting-text' }, h('span', { class: 'setting-label' }, label), desc ? h('span', { class: 'setting-desc', style: 'display:block' }, desc) : null),
    state);
}

function listTools(list, i, what) {
  const move = (to) => { [list[i], list[to]] = [list[to], list[i]]; changed(); rerender(); };
  return h('div', { class: 'block-tools' },
    h('button', { type: 'button', class: 'icon-btn', title: 'Subir', 'aria-label': `Subir ${what}`, disabled: i === 0, onclick: () => move(i - 1) }, icon('up')),
    h('button', { type: 'button', class: 'icon-btn', title: 'Bajar', 'aria-label': `Bajar ${what}`, disabled: i === list.length - 1, onclick: () => move(i + 1) }, icon('down')),
    h('button', {
      type: 'button', class: 'icon-btn danger', title: 'Borrar', 'aria-label': `Borrar ${what}`,
      onclick: () => { if (confirm(`¿Borrar ${what}?`)) { list.splice(i, 1); changed(); rerender(); } },
    }, icon('trash')));
}

function conditionPicker(lista) {
  return h('div', { class: 'add-row' },
    h('span', { class: 'field-label' }, L.addCondition),
    TIPOS_CONDICION.map((tipo) => h('button', {
      type: 'button', class: 'btn btn-small',
      onclick: () => { lista.push(nuevaCondicion(tipo)); changed(); rerender(); },
    }, icon('plus'), mostrar(L.code, tipo))));
}

function actionPicker(lista) {
  return h('div', { class: 'add-row' },
    h('span', { class: 'field-label' }, L.addAction),
    h('div', { class: 'action-grid' }, CATALOGO_ACCIONES.map((c) => h('button', {
      type: 'button', class: 'action-option',
      onclick: () => { lista.push(nuevaAccion(c.tipo)); changed(); rerender(); },
    },
    icon(c.icono),
    h('span', { class: 'action-text' },
      h('span', { class: 'action-title' }, c[L.code][0], c.beta ? h('span', { class: 'beta' }, 'beta') : null),
      h('span', { class: 'action-desc' }, c[L.code][1]))))));
}

function ejemplosForm(list, kind) {
  return h('details', { class: 'examples', open: true },
    h('summary', null, h('span', { class: `badge ${kind}` }, kind === 'match' ? L.matching : L.nonMatching), h('span', { class: 'muted' }, L.examples(list.length))),
    h('div', { class: 'examples-body' },
      list.map((e, j) => h('div', { class: 'example' },
        h('div', { class: 'example-top' },
          h('span', { class: 'muted' }, `${L.example} ${j + 1}`),
          h('button', {
            type: 'button', class: 'icon-btn danger', title: 'Borrar ejemplo', 'aria-label': `Borrar ejemplo ${j + 1}`,
            onclick: () => { list.splice(j, 1); changed(); rerender(); },
          }, icon('trash'))),
        input(e, 'mensaje', { label: L.userMessage, required: true }),
        input(e, 'explicacion', { label: L.explanation, multiline: true, rows: 2, limit: LIMITES.explicacion }))),
      h('button', { type: 'button', class: 'btn btn-small', style: 'align-self:flex-end', onclick: () => { list.push(nuevoEjemplo()); changed(); rerender(); } }, icon('plus'), L.addExample)));
}

function condicionForm(c, i, lista) {
  const head = blockHead(`${L.condition} ${i + 1}`, mostrar(L.code, c.tipo), listTools(lista, i, `la condición ${i + 1}`));
  if (c.tipo !== CONTEXTO) {
    return h('div', { class: 'block' }, head,
      input(c, 'valor', { label: L.config, multiline: true, required: true, help: 'Escribí cómo está configurada esta condición en LearnWise.' }));
  }
  return h('div', { class: 'block' }, head,
    input(c, 'contexto', { label: mostrar(L.code, CONTEXTO), multiline: true, rows: 3, required: true, placeholder: 'Cuándo aplica: qué dice o quiere el usuario, y qué no.' }),
    ejemplosForm(c.coincidentes, 'match'),
    ejemplosForm(c.no_coincidentes, 'nomatch'));
}

function accionForm(a, i, lista) {
  const esOtra = a.otra || !CATALOGO_ACCIONES.some((c) => c.tipo === a.tipo);
  const head = blockHead(`${L.action} ${i + 1}`, esOtra ? L.otherAction : mostrar(L.code, a.tipo), listTools(lista, i, `la acción ${i + 1}`));
  if (esOtra) {
    return h('div', { class: 'block' }, head,
      input(a, 'tipo', { label: 'Nombre de la acción', required: true, placeholder: 'Como aparece en LearnWise' }),
      input(a, 'valor', { label: L.config, multiline: true, help: 'Escribí cada ajuste de esta acción tal como está en LearnWise.' }));
  }
  switch (a.tipo) {
    case ACCIONES.BUSCAR:
      return h('div', { class: 'block' }, head,
        toggle(a, 'escalar_no_resueltas', L.escalar, L.escalarDesc),
        toggle(a, 'crear_mejoras', L.mejoras, L.mejorasDesc),
        h('h4', { class: 'sub' }, L.advanced),
        input(a, 'directrices_busqueda', { label: L.directrices, multiline: true, rows: 4, limit: LIMITES.directrices_busqueda }),
        input(a, 'estilo_respuesta', {
          label: L.estilo, multiline: true, rows: 12, limit: LIMITES.estilo_respuesta,
          help: 'Para una viñeta, empezá la línea con "- ". Para cursiva, *así*. Al copiar desde la librería se pegan como viñetas.',
        }),
        toggle(a, 'anular_estilo', L.anular, L.anularDesc, 'check'));
    case ACCIONES.MENSAJE:
      return h('div', { class: 'block' }, head,
        toggle(a, 'instruir_ia', L.instruirIa),
        toggle(a, 'seguir_instrucciones_globales', L.seguirGlobales),
        input(a, 'instruccion', { label: L.instruccion, multiline: true, required: true }));
    case ACCIONES.BOTON:
      return h('div', { class: 'block' }, head,
        h('div', { class: 'form-grid' },
          input(a, 'nombre', { label: L.botonNombre, required: true }),
          input(a, 'tipo_boton', { label: L.botonTipo, required: true, list: 'tipos-boton', show: (v) => mostrar(L.code, v), parse: (v) => guardar(L.code, v) })),
        input(a, 'url', { label: L.url, placeholder: 'https://… (puede quedar vacía)' }),
        toggle(a, 'mostrar_icono', L.mostrarIcono));
    default:
      return h('div', { class: 'block' }, head,
        input(a, 'valor', { label: L.config, multiline: true, help: 'Esta acción todavía no tiene sus campos propios. Anotá cómo está configurada en LearnWise (puede quedar vacía).' }));
  }
}

function draftFlow() {
  const draft = structuredClone(form.draft);
  for (const a of draft.respuesta) delete a.otra;
  return normalizeFlow(draft);
}

function formErrors() {
  const errores = validateFlow(draftFlow());
  if (form.mode === 'nuevo') {
    if (!SLUG_RE.test(form.slug)) errores.unshift('Nombre del archivo: usá solo minúsculas, números y guiones (por ejemplo "pedido-de-prorroga").');
    else if (data.flows.some((f) => f.slug === form.slug)) errores.unshift(`Ya existe un flow con el archivo "${form.slug}". Cambiá el nombre del archivo.`);
  }
  return errores;
}

const fileContent = () => `${JSON.stringify(draftFlow(), null, 2)}\n`;

function githubUrl(text) {
  const base = `https://github.com/${data.repo}`;
  if (form.mode === 'editar') return `${base}/edit/${data.branch}/flows/${form.slug}.json`;
  const url = `${base}/new/${data.branch}/flows?filename=${encodeURIComponent(`${form.slug}.json`)}`;
  const withValue = `${url}&value=${encodeURIComponent(text)}`;
  return withValue.length < 8000 ? withValue : url;
}

function publishPanel() {
  const status = h('div');
  const pre = h('pre', { class: 'json' });
  const btn = h('button', {
    type: 'button', class: 'btn btn-primary',
    onclick: async () => {
      const text = fileContent();
      const ok = await copyText(text);
      window.open(githubUrl(text), '_blank', 'noopener');
      toast(ok ? 'Archivo copiado. Terminá en GitHub.' : 'Abrí GitHub, pero no se pudo copiar: copiá el archivo desde «Ver el archivo».');
    },
  }, icon('external'), form.mode === 'editar' ? 'Copiar y abrir GitHub para guardar' : 'Copiar y abrir GitHub para publicar');

  const panelDetails = h('details', null, h('summary', null, 'Ver el archivo'), pre);
  refreshPublish = () => {
    const errores = formErrors();
    status.replaceChildren(errores.length
      ? h('ul', { class: 'errors' }, errores.map((e) => h('li', null, e)))
      : h('p', { class: 'ok' }, 'Todo completo. Ya se puede guardar.'));
    btn.disabled = errores.length > 0;
    if (panelDetails.open) pre.textContent = fileContent();
  };
  panelDetails.addEventListener('toggle', () => { if (panelDetails.open) pre.textContent = fileContent(); });
  refreshPublish();

  const pasos = form.mode === 'editar'
    ? ['Tocá el botón: se copia el flow y se abre el archivo en GitHub.', 'En GitHub, hacé clic en el texto, seleccioná todo (Ctrl+A) y pegá (Ctrl+V).', 'Tocá «Commit changes».', 'En 1 o 2 minutos se actualiza la librería.']
    : ['Tocá el botón: se copia el flow y se abre GitHub con el archivo nuevo.', 'Si el editor de GitHub aparece vacío, pegá (Ctrl+V). Si ya tiene el texto, no hace falta.', 'Tocá «Commit changes».', 'En 1 o 2 minutos el flow aparece en la librería.'];

  return h('section', { class: 'publish', lang: 'es' },
    h('h2', null, 'Guardar en la librería'),
    h('ol', null, pasos.map((p) => h('li', null, p))),
    status,
    btn,
    panelDetails,
    h('p', { class: 'help' }, 'Necesitás una cuenta de GitHub con permiso en el repositorio. Sin permiso, GitHub te ofrece «Propose changes» y el dueño lo aprueba.'));
}

function viewForm(mode, slug) {
  const key = `${mode}:${slug ?? ''}`;
  if (form?.key !== key) {
    if (mode === 'editar') {
      const f = data.flows.find((x) => x.slug === slug);
      if (!f) return viewNotFound();
      const { slug: _omit, ...rest } = structuredClone(f);
      form = { key, mode, slug, slugTouched: true, draft: { notas: '', ...rest } };
    } else {
      const saved = loadDraft();
      form = { key, mode, slug: saved?.slug ?? '', slugTouched: saved?.slugTouched ?? false, draft: saved?.draft ?? flowVacio() };
    }
  }
  const { draft } = form;
  const lang = Object.hasOwn(IDIOMAS, draft.idioma ?? '') ? draft.idioma : 'es';
  L = UI[lang];
  document.title = `${mode === 'editar' ? 'Editar flow' : 'Agregar flow'} · Flow Library`;

  const slugInput = input(form, 'slug', {
    label: 'Nombre del archivo', required: mode === 'nuevo', readonly: mode === 'editar',
    help: mode === 'editar' ? 'No se puede cambiar al editar.' : 'Se arma solo desde el nombre. Solo minúsculas, números y guiones.',
    onInput: () => { form.slugTouched = true; },
  });
  const slugCtrl = slugInput.querySelector('input');
  const nombreInput = input(draft, 'nombre', {
    label: 'Nombre del flow', required: true, placeholder: 'Como se llama en LearnWise',
    onInput: (v) => { if (mode === 'nuevo' && !form.slugTouched) { form.slug = slugify(v); slugCtrl.value = form.slug; } },
  });

  return h('main', { class: 'wrap' },
    h('a', { class: 'back', href: mode === 'editar' ? `#/flow/${slug}` : lastLibraryHash }, icon('back'), mode === 'editar' ? 'Volver al flow' : 'Todos los flows'),
    h('div', { class: 'form-intro', lang: 'es' },
      h('div', null,
        h('h1', { style: 'font-size:clamp(24px,4.5vw,30px);letter-spacing:-0.02em;line-height:1.2' }, mode === 'editar' ? `Editar: ${data.flows.find((f) => f.slug === slug)?.nombre}` : 'Agregar un flow'),
        h('p', { class: 'lead' }, 'Completá los campos igual que en LearnWise. Si el flow está en inglés, los campos se muestran en inglés. Al final, la página arma el archivo y te lleva a GitHub para guardarlo.')),
      mode === 'nuevo'
        ? h('button', { type: 'button', class: 'btn btn-small btn-danger', onclick: () => { if (confirm('¿Borrar todo lo cargado y empezar de cero?')) { clearDraft(); form = null; rerender(); } } }, 'Empezar de cero')
        : null),
    h('datalist', { id: 'activadores' }, h('option', { value: mostrar(lang, 'El usuario envía un mensaje') })),
    h('datalist', { id: 'tipos-boton' }, h('option', { value: mostrar(lang, 'Enlace externo') })),
    h('section', { class: 'form-card', lang: 'es' },
      h('h2', null, 'Datos del flow'),
      h('div', { class: 'form-grid' },
        nombreInput,
        choice(draft, 'idioma', 'Idioma del flow', Object.entries(IDIOMAS)),
        choice(draft, 'categoria', 'Categoría', CATEGORIAS.map((c) => [c, c]))),
      input(draft, 'descripcion', { label: 'Descripción corta', required: true, multiline: true, rows: 2, help: 'Se muestra en la tarjeta de la librería. Una o dos oraciones, en el idioma del flow: cuándo se activa y qué hace.' }),
      slugInput),
    h('div', { lang },
      stepCard(1, input(draft, 'activador', { label: L.event, required: true, list: 'activadores', show: (v) => mostrar(lang, v), parse: (v) => guardar(lang, v) })),
      stepCard(2,
        h('div', { class: 'logic' },
          h('span', { class: 'field-label' }, L.logic),
          h('div', { class: 'radios', role: 'radiogroup' }, LOGICAS.map((l) => h('label', { class: `radio${draft.condiciones.logica === l ? ' on' : ''}` },
            h('input', { type: 'radio', name: 'logica', value: l, checked: draft.condiciones.logica === l, onchange: () => { draft.condiciones.logica = l; changed(); rerender(); } }),
            h('span', { class: 'dot' }), mostrar(lang, l))))),
        draft.condiciones.lista.map((c, i, lista) => condicionForm(c, i, lista)),
        conditionPicker(draft.condiciones.lista)),
      stepCard(3,
        draft.respuesta.map((a, i, lista) => accionForm(a, i, lista)),
        actionPicker(draft.respuesta))),
    h('section', { class: 'form-card', lang: 'es' },
      h('h2', null, 'Notas (opcional)'),
      input(draft, 'notas', { label: 'Algo que haya que saber antes de usarlo', multiline: true, rows: 2, placeholder: 'Ej.: el botón necesita la URL de soporte de cada institución.' })),
    publishPanel());
}

/* ---------- Router ---------- */

function viewErrors() {
  return h('main', { class: 'wrap' },
    h('div', { class: 'hero' }, h('h1', null, 'No se pudieron cargar los flows'), h('p', { class: 'lead' }, 'Revisá estos problemas en los archivos de la carpeta flows/:')),
    h('ul', { class: 'errors' }, loadErrors.map((e) => h('li', null, e))));
}

function render() {
  const [path, query = ''] = location.hash.replace(/^#\/?/, '').split('?');
  const [section, param] = path.split('/').map(decodeURIComponent);
  L = UI.es;
  if (section !== 'nuevo' && section !== 'editar') refreshPublish = () => {};
  let view;
  if (loadErrors) view = viewErrors();
  else if (section === 'flow' && param) view = viewFlow(param);
  else if (section === 'nuevo') view = viewForm('nuevo');
  else if (section === 'editar' && param) view = viewForm('editar', param);
  else if (!section) view = viewLibrary(new URLSearchParams(query));
  else view = viewNotFound();
  // Header and footer follow the language the view picked.
  const onFlowPage = section === 'flow';
  if (!onFlowPage) L = UI.es;
  document.documentElement.lang = L.code;
  app.replaceChildren(topbar(), view, footer());
}

window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });

try {
  const res = await fetch('flows.json', { cache: 'no-cache' });
  const body = await res.json();
  if (!res.ok) loadErrors = body.errors ?? [`Error ${res.status}`];
  else data = body;
} catch (err) {
  loadErrors = [`No se pudo leer flows.json (${err.message}).`];
}
render();

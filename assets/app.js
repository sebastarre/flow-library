import {
  ACCIONES, ACTIVADORES, ACTIVADOR_MENSAJE, CATEGORIAS, CONDICIONES, CONTEXTO, IDIOMAS, LIMITES, LOGICAS, SLUG_RE, VALORES_EN,
  guardar, mostrar, normalizeFlow, nuevoItem, nuevoValor, slugify, t, tituloItem, validateFlow, visibleFields,
} from './validate.js';

const app = document.getElementById('app');
const toastEl = document.getElementById('toast');
const DRAFT_KEY = 'flow-library:borrador';
const LANG_KEY = 'flow-library:idioma';

let data = null;
let loadErrors = null;
let form = null;
let refreshPublish = () => {};
let lastLibraryHash = '#/';

/* ---------- Language ---------- */
// Two languages are in play:
// - U, the interface language (library, buttons, form instructions), picked in the top bar. English by default.
// - L, the language of the LearnWise fields of a flow (Trigger, Conditions, field names), which follows the flow's
//   own language so copied labels match LearnWise. Field names live in schema.js.

const UI = {
  es: {
    code: 'es', languageLabel: 'Idioma',
    // Interface
    heroTitle: 'Flows listos para copiar',
    heroLead: 'Abrí un flow y copiá cada campo en LearnWise (Tutor Assistant → Flujos). Cada campo tiene su propio botón para copiar.',
    searchPlaceholder: 'Buscar por nombre, contexto o mensaje de ejemplo…', searchLabel: 'Buscar flows',
    filterLanguage: 'Idioma', filterCategory: 'Categoría', allLanguages: 'Todos', allCategories: 'Todas',
    noResults: 'No hay flows que coincidan con estos filtros.',
    allFlows: 'Todos los flows', copy: 'Copiar', copied: 'Copiado', copyLink: 'Copiar link', linkCopied: 'Link copiado',
    copyAll: 'Copiar todo', flowCopied: 'Flow copiado', edit: 'Editar', addFlow: 'Agregar flow',
    copyFailed: 'No se pudo copiar. Seleccioná el texto y copialo a mano.',
    howto: 'En LearnWise andá a Tutor Assistant → Flujos y creá un flujo nuevo. Copiá cada campo con su botón y pegalo en el mismo lugar.',
    note: 'Ojo: ',
    footer1: 'Los flows se guardan en ', footer2: '. Cambiar un flow acá no cambia LearnWise: hacé el mismo cambio en los dos lados.',
    notFound: 'No encontramos ese flow', notFoundLead: 'Puede que lo hayan renombrado o borrado.',
    loadError: 'No se pudieron cargar los flows', loadErrorLead: 'Revisá estos problemas en los archivos de la carpeta flows/:',
    readError: (msg) => `No se pudo leer flows.json (${msg}).`,
    backToFlow: 'Volver al flow', editTitle: (n) => `Editar: ${n}`, addTitle: 'Agregar un flow',
    formLead: 'Completá los campos igual que en LearnWise. Los campos de LearnWise se muestran en el idioma del flow. Al final, la página arma el archivo y te lleva a GitHub para guardarlo.',
    startOver: 'Empezar de cero', startOverConfirm: '¿Borrar todo lo cargado y empezar de cero?',
    flowDetails: 'Datos del flow', flowName: 'Nombre del flow', flowNamePlaceholder: 'Como se llama en LearnWise',
    flowLanguage: 'Idioma del flow', category: 'Categoría',
    description: 'Descripción corta', descriptionHelp: 'Se muestra en la tarjeta de la librería. Una o dos oraciones, en el idioma del flow: cuándo se activa y qué hace.',
    fileName: 'Nombre del archivo', fileNameHelpEdit: 'No se puede cambiar al editar.', fileNameHelpNew: 'Se arma solo desde el nombre. Solo minúsculas, números y guiones.',
    notesTitle: 'Notas (opcional)', notesLabel: 'Algo que haya que saber antes de usarlo', notesPlaceholder: 'Ej.: el botón necesita la URL de soporte de cada institución.',
    saveTitle: 'Guardar en la librería',
    saveStepsEdit: ['Tocá el botón: se copia el flow y se abre el archivo en GitHub.', 'En GitHub, hacé clic en el texto, seleccioná todo (Ctrl+A) y pegá (Ctrl+V).', 'Tocá «Commit changes».', 'En 1 o 2 minutos se actualiza la librería.'],
    saveStepsNew: ['Tocá el botón: se copia el flow y se abre GitHub con el archivo nuevo.', 'Si el editor de GitHub aparece vacío, pegá (Ctrl+V). Si ya tiene el texto, no hace falta.', 'Tocá «Commit changes».', 'En 1 o 2 minutos el flow aparece en la librería.'],
    saveButtonEdit: 'Copiar y abrir GitHub para guardar', saveButtonNew: 'Copiar y abrir GitHub para publicar',
    viewFile: 'Ver el archivo', allGood: 'Todo completo. Ya se puede guardar.',
    saveHelp: 'Necesitás una cuenta de GitHub con permiso en el repositorio. Sin permiso, GitHub te ofrece «Propose changes» y el dueño lo aprueba.',
    fileCopied: 'Archivo copiado. Terminá en GitHub.', fileNotCopied: 'Abrí GitHub, pero no se pudo copiar: copiá el archivo desde «Ver el archivo».',
    slugInvalid: 'Nombre del archivo: usá solo minúsculas, números y guiones (por ejemplo "pedido-de-prorroga").',
    slugTaken: (s) => `Ya existe un flow con el archivo "${s}". Cambiá el nombre del archivo.`,
    moveUp: 'Subir', moveDown: 'Bajar', remove: 'Borrar', removeConfirm: (what) => `¿Borrar ${what}?`,
    theCondition: (n) => `la condición ${n}`, theAction: (n) => `la acción ${n}`, theTrigger: (n) => `el activador ${n}`,
    theExample: (n) => `el ejemplo ${n}`, theRow: (n) => `la fila ${n}`, theItem: (n) => `el ítem ${n}`,
    actionName: 'Nombre de la acción', actionNamePlaceholder: 'Como aparece en LearnWise',
    richHelp: 'Formato: "- " viñeta, "1. " lista numerada, "# " título, *cursiva*, **negrita**, [texto](https://link). Al copiar se pega con formato.',
    date: 'fecha', time: 'hora', timeZone: 'zona horaria',
  },
  en: {
    code: 'en', languageLabel: 'Language',
    heroTitle: 'Flows ready to copy',
    heroLead: 'Open a flow and copy each field into LearnWise (Tutor Assistant → Flows). Every field has its own copy button.',
    searchPlaceholder: 'Search by name, context or example message…', searchLabel: 'Search flows',
    filterLanguage: 'Language', filterCategory: 'Category', allLanguages: 'All', allCategories: 'All',
    noResults: 'No flows match these filters.',
    allFlows: 'All flows', copy: 'Copy', copied: 'Copied', copyLink: 'Copy link', linkCopied: 'Link copied',
    copyAll: 'Copy all', flowCopied: 'Flow copied', edit: 'Edit', addFlow: 'Add flow',
    copyFailed: "Couldn't copy. Select the text and copy it manually.",
    howto: 'In LearnWise, go to Tutor Assistant → Flows and create a new flow. Copy each field with its button and paste it into the same place.',
    note: 'Note: ',
    footer1: 'Flows are stored on ', footer2: ". Changing a flow here doesn't change LearnWise: make the same change in both places.",
    notFound: "We couldn't find that flow", notFoundLead: 'It may have been renamed or deleted.',
    loadError: "Couldn't load the flows", loadErrorLead: 'Check these problems in the files in the flows/ folder:',
    readError: (msg) => `Couldn't read flows.json (${msg}).`,
    backToFlow: 'Back to the flow', editTitle: (n) => `Edit: ${n}`, addTitle: 'Add a flow',
    formLead: "Fill in the fields as they are in LearnWise. The LearnWise fields show in the flow's language. At the end, the page builds the file and takes you to GitHub to save it.",
    startOver: 'Start over', startOverConfirm: 'Clear everything and start over?',
    flowDetails: 'Flow details', flowName: 'Flow name', flowNamePlaceholder: 'As it is named in LearnWise',
    flowLanguage: 'Flow language', category: 'Category',
    description: 'Short description', descriptionHelp: "Shown on the library card. One or two sentences in the flow's language: when it triggers and what it does.",
    fileName: 'File name', fileNameHelpEdit: "Can't be changed when editing.", fileNameHelpNew: 'Built from the name. Lowercase letters, numbers and hyphens only.',
    notesTitle: 'Notes (optional)', notesLabel: 'Anything to know before using it', notesPlaceholder: "E.g. the button needs each institution's support URL.",
    saveTitle: 'Save to the library',
    saveStepsEdit: ['Press the button: the flow is copied and the file opens on GitHub.', 'On GitHub, click the text, select all (Ctrl+A) and paste (Ctrl+V).', 'Press "Commit changes".', 'The library updates in 1 or 2 minutes.'],
    saveStepsNew: ['Press the button: the flow is copied and GitHub opens with the new file.', "If GitHub's editor is empty, paste (Ctrl+V). If the text is already there, you don't need to.", 'Press "Commit changes".', 'The flow shows up in the library in 1 or 2 minutes.'],
    saveButtonEdit: 'Copy and open GitHub to save', saveButtonNew: 'Copy and open GitHub to publish',
    viewFile: 'View the file', allGood: 'Everything is filled in. Ready to save.',
    saveHelp: 'You need a GitHub account with access to the repository. Without access, GitHub offers "Propose changes" and the owner approves it.',
    fileCopied: 'File copied. Finish on GitHub.', fileNotCopied: 'GitHub opened, but copying failed: copy the file from "View the file".',
    slugInvalid: 'File name: use lowercase letters, numbers and hyphens only (for example "extension-request").',
    slugTaken: (s) => `A flow with the file "${s}" already exists. Change the file name.`,
    moveUp: 'Move up', moveDown: 'Move down', remove: 'Delete', removeConfirm: (what) => `Delete ${what}?`,
    theCondition: (n) => `condition ${n}`, theAction: (n) => `action ${n}`, theTrigger: (n) => `trigger ${n}`,
    theExample: (n) => `example ${n}`, theRow: (n) => `row ${n}`, theItem: (n) => `item ${n}`,
    actionName: 'Action name', actionNamePlaceholder: 'As shown in LearnWise',
    richHelp: 'Formatting: "- " bullet, "1. " numbered list, "# " heading, *italic*, **bold**, [text](https://link). It pastes with formatting.',
    date: 'date', time: 'time', timeZone: 'time zone',
  },
};

// LearnWise field labels, per flow language.
const LW = {
  es: {
    code: 'es',
    step1: 'Activador', step2: 'Condiciones', step3: 'Respuesta',
    sub1: 'Defina el evento que inicia este flujo',
    sub2: 'Criterios que deben cumplirse para que el flujo continúe.',
    sub3: 'Defina lo que sucederá si se cumplen el activador y las condiciones.',
    required: 'Obligatorio', optional: 'Opcional',
    triggerQuestion: '¿Qué activa el flujo?', addTrigger: 'Agregar un activador',
    logic: 'Lógica de condiciones', noConditions: 'Sin condiciones: el flujo corre siempre que ocurre el activador.',
    condition: 'Condición', action: 'Acción', config: 'Configuración', otherAction: 'Otra acción',
    matching: 'Ejemplos coincidentes', nonMatching: 'Ejemplos no coincidentes', example: 'Ejemplo',
    examples: (n) => (n === 1 ? '1 ejemplo' : `${n} ejemplos`),
    conditions: (n) => (n === 1 ? '1 condición' : `${n} condiciones`),
    userMessage: 'Mensaje del usuario', explanation: 'Explicación', noExamples: 'Todavía no hay ejemplos cargados.',
    empty: 'Vacío', notSet: 'Sin configurar', on: 'Activado', off: 'Desactivado', checked: 'Marcado', unchecked: 'Sin marcar', yes: 'Sí', no: 'No',
    at: 'a las', add: 'Agregar', notes: 'Notas',
    addCondition: 'Agregar una condición', addAction: 'Agregar una acción', addExample: 'Agregar ejemplo',
  },
  en: {
    code: 'en',
    step1: 'Trigger', step2: 'Conditions', step3: 'Response',
    sub1: 'Define the event that starts this flow',
    sub2: 'Criteria that must be met for the flow to continue.',
    sub3: 'Define what happens when the trigger and the conditions are met.',
    required: 'Required', optional: 'Optional',
    triggerQuestion: 'What starts the flow?', addTrigger: 'Add a trigger',
    logic: 'Condition logic', noConditions: 'No conditions: the flow runs every time the trigger happens.',
    condition: 'Condition', action: 'Action', config: 'Configuration', otherAction: 'Other action',
    matching: 'Matching examples', nonMatching: 'Non-matching examples', example: 'Example',
    examples: (n) => (n === 1 ? '1 example' : `${n} examples`),
    conditions: (n) => (n === 1 ? '1 condition' : `${n} conditions`),
    userMessage: 'User message', explanation: 'Explanation', noExamples: 'No examples added yet.',
    empty: 'Empty', notSet: 'Not set', on: 'On', off: 'Off', checked: 'Checked', unchecked: 'Unchecked', yes: 'Yes', no: 'No',
    at: 'at', add: 'Add', notes: 'Notes',
    addCondition: 'Add a condition', addAction: 'Add an action', addExample: 'Add example',
  },
};

function idiomaGuardado() {
  try { return localStorage.getItem(LANG_KEY); } catch { return null; }
}

let U = UI[idiomaGuardado()] ?? UI.en;
let L = LW[U.code];
const txt = (texto) => t(texto, L.code);

function setUiLang(code) {
  U = UI[code];
  try { localStorage.setItem(LANG_KEY, code); } catch { /* storage unavailable */ }
  rerender();
}

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

function copyButton(getPlain, { label = U.copy, getHtml = null, big = false, iconName = 'copy', done = U.copied } = {}) {
  const failed = U.copyFailed;
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

/* ---------- Rich text ---------- */
// "- " bullets, "1. " numbered lists, "# " headings (up to ####), indented lines continue the item above,
// *italic*, **bold**, `code` and [text](https://link).

function escapeHtml(s) {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function richToHtml(text) {
  const inline = (s) => escapeHtml(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  let html = '';
  let list = null;
  const closeList = () => {
    if (list) html += `<${list.tag}>${list.items.map((i) => `<li>${i}</li>`).join('')}</${list.tag}>`;
    list = null;
  };
  const addItem = (tag, content) => {
    if (list?.tag !== tag) { closeList(); list = { tag, items: [] }; }
    list.items.push(inline(content));
  };
  for (const line of text.split(/\r?\n/)) {
    const bullet = line.match(/^\s*[-•]\s+(.*)$/);
    const numbered = line.match(/^\s*\d+[.)]\s+(.*)$/);
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (bullet) addItem('ul', bullet[1]);
    else if (numbered) addItem('ol', numbered[1]);
    else if (list && /^\s{2,}\S/.test(line)) list.items[list.items.length - 1] += `<br>${inline(line.trim())}`;
    else {
      closeList();
      if (heading) html += `<h${heading[1].length}>${inline(heading[2])}</h${heading[1].length}>`;
      else if (line.trim()) html += `<p>${inline(line)}</p>`;
    }
  }
  closeList();
  return html;
}

const richToPlain = (text) => text
  .replace(/^(#{1,4})\s+/gm, '')
  .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '$1 ($2)')
  .replace(/`([^`]+)`/g, '$1')
  .replace(/\*\*(.+?)\*\*/g, '$1')
  .replace(/\*(.+?)\*/g, '$1');

/* ---------- Shared pieces ---------- */

function stepCard(n, content, badge = null) {
  return h('section', { class: `step step-${n}` },
    h('header', { class: 'step-head' },
      h('span', { class: 'step-num' }, String(n)),
      h('div', null,
        h('h2', null, L[`step${n}`], badge ? h('span', { class: `step-badge ${badge === L.required ? 'required' : 'optional'}` }, badge) : null),
        h('p', null, L[`sub${n}`]))),
    h('div', { class: 'step-body' }, content));
}

function blockHead(kicker, title, tools = null, subtitle = '', beta = false) {
  return h('div', { class: 'block-head' },
    h('div', { class: 'block-title' },
      h('span', { class: 'block-kicker' }, kicker),
      h('h3', null, title, beta ? h('span', { class: 'beta' }, 'beta') : null),
      subtitle ? h('p', { class: 'block-sub' }, subtitle) : null),
    tools);
}

function langSwitch() {
  return h('div', { class: 'lang-switch', role: 'group', 'aria-label': U.languageLabel },
    ['en', 'es'].map((code) => h('button', {
      type: 'button', class: 'lang-btn', lang: code, title: IDIOMAS[code], 'aria-pressed': String(U.code === code),
      onclick: () => { if (U.code !== code) setUiLang(code); },
    }, code.toUpperCase())));
}

function topbar() {
  const onForm = location.hash.startsWith('#/nuevo') || location.hash.startsWith('#/editar');
  return h('header', { class: 'topbar' },
    h('div', { class: 'wrap' },
      h('a', { class: 'brand', href: lastLibraryHash }, h('span', { class: 'brand-mark' }, 'F'), h('span', null, 'Flow Library ', h('small', null, '· LearnWise'))),
      h('div', { class: 'topbar-actions' },
        langSwitch(),
        onForm ? null : h('a', { class: 'btn btn-small', href: '#/nuevo' }, icon('plus'), U.addFlow))));
}

function footer() {
  const repo = data ? `https://github.com/${data.repo}` : null;
  return h('footer', { class: 'footer wrap' },
    U.footer1, repo ? h('a', { href: repo, target: '_blank', rel: 'noopener' }, 'GitHub') : 'GitHub', U.footer2);
}

const flowLink = (f) => `${location.origin}${location.pathname}#/flow/${f.slug}`;

function flowTags(f) {
  return h('div', { class: 'card-tags' },
    h('span', { class: 'tag' }, f.categoria),
    h('span', { class: 'lang', title: IDIOMAS[f.idioma] }, f.idioma.toUpperCase()));
}

const pad = (n) => String(n).padStart(2, '0');

function fechaTexto(v) {
  if (!v?.fecha) return '';
  const [y, m, d] = v.fecha.split('-');
  const fecha = L.code === 'en' ? `${m}/${d}/${y}` : `${d}/${m}/${y}`;
  let hora = '';
  if (v.hora) {
    const [hh, mm] = v.hora.split(':').map(Number);
    hora = ` ${L.at} ${hh % 12 || 12}:${pad(mm)} ${hh < 12 ? 'AM' : 'PM'}`;
  }
  return `${fecha}${hora}${v.zona ? ` (${v.zona})` : ''}`;
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

const buscables = new WeakMap();
function textoBuscable(f) {
  if (!buscables.has(f)) {
    const partes = [IDIOMAS[f.idioma]];
    const walk = (x) => {
      if (typeof x === 'string') partes.push(x, VALORES_EN[x] ?? '');
      else if (Array.isArray(x)) x.forEach(walk);
      else if (x && typeof x === 'object') Object.values(x).forEach(walk);
    };
    walk(f);
    buscables.set(f, normalizar(partes.join(' ')));
  }
  return buscables.get(f);
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
    grid.replaceChildren(...(items.length ? items.map(card) : [h('div', { class: 'empty' }, U.noResults)]));
  };
  renderGrid();

  const option = (key, value, label, n) => h('button', {
    type: 'button', class: 'chip', 'aria-pressed': String(filtro[key] === value), onclick: () => setFiltro(key, value),
  }, label, h('span', { class: 'chip-count' }, String(n)));

  return h('main', { class: 'wrap' },
    h('div', { class: 'hero' },
      h('h1', null, U.heroTitle),
      h('p', { class: 'lead' }, U.heroLead)),
    h('div', { class: 'toolbar' },
      h('label', { class: 'search' }, icon('search'),
        h('input', {
          type: 'search', placeholder: U.searchPlaceholder, 'aria-label': U.searchLabel, value: filtro.q,
          oninput: (e) => { filtro.q = e.target.value; renderGrid(); },
        }))),
    h('div', { class: 'filters' },
      h('div', { class: 'filter-row' },
        h('span', { class: 'filter-label' }, U.filterLanguage),
        h('div', { class: 'chips', role: 'group', 'aria-label': U.filterLanguage },
          option('idioma', '', U.allLanguages, data.flows.length),
          Object.entries(IDIOMAS).map(([code, name]) => option('idioma', code, name, data.flows.filter((f) => f.idioma === code).length)))),
      h('div', { class: 'filter-row' },
        h('span', { class: 'filter-label' }, U.filterCategory),
        h('div', { class: 'chips', role: 'group', 'aria-label': U.filterCategory },
          option('cat', '', U.allCategories, porIdioma.length),
          CATEGORIAS.map((c) => option('cat', c, c, porIdioma.filter((f) => f.categoria === c).length))))),
    count,
    grid);
}

function card(f) {
  const T = LW[f.idioma];
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

function field(label, value, { rich = false, limit = null, emptyText = L.empty, warn = false, mono = false, prefix = null, copy = null } = {}) {
  const v = value ?? '';
  const empty = !String(v).trim();
  const body = empty
    ? h('div', { class: `field-value ${warn ? 'is-warn' : 'is-empty'}` }, emptyText)
    : rich
      ? h('div', { class: 'field-value rich', html: richToHtml(v) })
      : h('div', { class: `field-value${mono ? ' mono' : ''}` }, prefix ? h('span', { class: 'affix-inline' }, prefix) : null, v);
  return h('div', { class: 'field' },
    h('div', { class: 'field-head' },
      h('span', { class: 'field-label' }, label),
      h('span', { class: 'field-count' }, limit ? `${v.length}/${limit}` : ''),
      empty ? null : copyButton(() => copy ?? (rich ? richToPlain(v) : v), { getHtml: rich ? () => richToHtml(v) : null })),
    body);
}

function setting(label, on, desc, kind = 'switch') {
  const mark = kind === 'check'
    ? h('span', { class: `checkbox${on ? ' on' : ''}` }, on ? icon('check') : null)
    : h('span', { class: `switch${on ? ' on' : ''}` });
  return h('div', { class: 'setting' },
    h('div', { class: 'setting-text' }, h('div', { class: 'setting-label' }, label), desc ? h('div', { class: 'setting-desc' }, desc) : null),
    h('span', { class: 'state' }, kind === 'check' ? (on ? L.checked : L.unchecked) : (on ? L.on : L.off), mark));
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

function listView(label, items) {
  return h('div', { class: 'field' },
    h('div', { class: 'field-head' }, h('span', { class: 'field-label' }, label)),
    items.length
      ? h('div', { class: 'list-items' }, items.map((x) => h('div', { class: 'list-item' }, h('span', null, x), copyButton(() => x))))
      : h('div', { class: 'field-value is-empty' }, L.empty));
}

function pairsView(f, pairs) {
  const [c1, c2] = f.cols.map(txt);
  return h('div', { class: 'field' },
    h('div', { class: 'field-head' }, h('span', { class: 'field-label' }, txt(f.label))),
    pairs.length
      ? h('div', { class: 'pairs' }, pairs.map((p) => h('div', { class: 'pair' }, field(c1, p.nombre), field(c2, p.valor))))
      : h('div', { class: 'field-value is-empty' }, L.empty));
}

function fieldView(f, item) {
  const label = txt(f.label);
  const v = item[f.key];
  switch (f.kind) {
    case 'heading': return h('h4', { class: 'sub' }, txt(f.text));
    case 'info': return null;
    case 'toggle': return setting(label, v, txt(f.help));
    case 'check': return setting(label, v, txt(f.help), 'check');
    case 'rich': return field(label, v, { rich: true, limit: f.limit });
    case 'code': return field(label, v, { mono: true, limit: f.limit });
    case 'select': case 'radio': return field(label, mostrar(L.code, v));
    case 'number': return field(label, `${v}${f.suffix ? ` ${f.suffix}` : ''}`, { copy: String(v) });
    case 'datetime': return field(label, fechaTexto(v));
    case 'list': return listView(label, v);
    case 'pairs': return pairsView(f, v);
    case 'examples': return ejemplosView(v, f.match ? 'match' : 'nomatch');
    default: return field(label, v, { limit: f.limit, prefix: f.prefix, warn: f.emptyWarn, emptyText: f.emptyWarn ? L.notSet : L.empty });
  }
}

function itemView(specs, item, i, kicker) {
  const spec = specs.find((s) => s.tipo === item.tipo);
  if (!spec) return h('div', { class: 'block' }, blockHead(`${kicker} ${i + 1}`, item.tipo), field(L.config, item.valor));
  return h('div', { class: 'block' },
    blockHead(`${kicker} ${i + 1}`, tituloItem(spec, item, L.code), null, txt(spec.subtitulo), spec.beta),
    visibleFields(spec, item).map((f) => fieldView(f, item)));
}

function activadorView(a) {
  const spec = ACTIVADORES.find((s) => s.tipo === a.tipo);
  return h('div', { class: 'trigger' },
    h('span', { class: 'trigger-name' }, mostrar(L.code, a.tipo)),
    spec ? visibleFields(spec, a).map((f) => h('span', { class: 'trigger-value', title: txt(f.label) }, `${a[f.key]}${f.suffix ?? ''}`)) : null);
}

function fieldText(f, item) {
  const label = txt(f.label);
  const v = item[f.key];
  const vacio = `(${L.empty})`;
  switch (f.kind) {
    case 'heading': return [`[${txt(f.text)}]`];
    case 'info': return [];
    case 'toggle': return [`${label}: ${v ? L.on : L.off}`];
    case 'check': return [`${label}: ${v ? L.yes : L.no}`];
    case 'rich': case 'textarea': case 'code': return [`${label}:`, (f.kind === 'rich' ? richToPlain(v) : v) || vacio];
    case 'select': case 'radio': return [`${label}: ${mostrar(L.code, v)}`];
    case 'number': return [`${label}: ${v}${f.suffix ?? ''}`];
    case 'datetime': return [`${label}: ${fechaTexto(v) || vacio}`];
    case 'list': return [`${label}:`, ...(v.length ? v.map((x) => `- ${x}`) : [`  ${vacio}`])];
    case 'pairs': return [`${label}:`, ...(v.length ? v.map((p) => `- ${p.nombre}: ${p.valor}`) : [`  ${vacio}`])];
    case 'examples': {
      const lines = [`${f.match ? L.matching : L.nonMatching}:`];
      if (!v.length) lines.push(`  (${L.noExamples})`);
      for (const e of v) lines.push(`- ${L.userMessage}: ${e.mensaje}`, `  ${L.explanation}: ${e.explicacion}`);
      return lines;
    }
    default: return [`${label}: ${v ? `${f.prefix ?? ''}${v}` : `(${f.emptyWarn ? L.notSet : L.empty})`}`];
  }
}

function itemText(specs, item, i, kicker) {
  const spec = specs.find((s) => s.tipo === item.tipo);
  if (!spec) return ['', `${kicker} ${i + 1} — ${item.tipo}`, item.valor];
  return ['', `${kicker} ${i + 1} — ${tituloItem(spec, item, L.code)}`, ...visibleFields(spec, item).flatMap((f) => fieldText(f, item))];
}

// The copied text is written entirely in the flow's language.
function flowToText(f) {
  const anterior = L;
  L = LW[f.idioma];
  try {
    const activadores = f.activadores.map((a) => {
      const spec = ACTIVADORES.find((s) => s.tipo === a.tipo);
      const extra = spec ? visibleFields(spec, a).map((x) => `${a[x.key]}${x.suffix ?? ''}`).join(' ') : '';
      return `- ${mostrar(L.code, a.tipo)}${extra ? ` (${extra})` : ''}`;
    });
    const out = [
      `FLOW: ${f.nombre}`, f.descripcion,
      '', `1. ${L.step1.toUpperCase()}`, ...activadores,
      '', `2. ${L.step2.toUpperCase()}`, `${L.logic}: ${mostrar(L.code, f.condiciones.logica)}`,
      ...f.condiciones.lista.flatMap((c, i) => itemText(CONDICIONES, c, i, L.condition)),
      '', `3. ${L.step3.toUpperCase()}`,
      ...f.respuesta.flatMap((a, i) => itemText(ACCIONES, a, i, L.action)),
    ];
    if (f.notas) out.push('', `${L.notes}: ${f.notas}`);
    return out.join('\n');
  } finally {
    L = anterior;
  }
}

function viewFlow(slug) {
  const f = data.flows.find((x) => x.slug === slug);
  if (!f) return viewNotFound();
  L = LW[f.idioma];
  document.title = `${f.nombre} · Flow Library`;
  const { lista, logica } = f.condiciones;

  return h('main', { class: 'wrap' },
    h('a', { class: 'back', href: lastLibraryHash }, icon('back'), U.allFlows),
    h('div', { class: 'flow-head' },
      h('div', null,
        flowTags(f),
        h('h1', { lang: f.idioma }, f.nombre),
        h('p', { class: 'lead', lang: f.idioma }, f.descripcion)),
      h('div', { class: 'flow-actions' },
        copyButton(() => flowLink(f), { label: U.copyLink, big: true, iconName: 'link', done: U.linkCopied }),
        copyButton(() => flowToText(f), { label: U.copyAll, big: true, done: U.flowCopied }),
        h('a', { class: 'btn', href: `#/editar/${f.slug}` }, icon('edit'), U.edit))),
    h('p', { class: 'howto' }, icon('info'), h('span', null, U.howto)),
    f.notas ? h('p', { class: 'note' }, h('span', null, h('strong', null, U.note), h('span', { lang: f.idioma }, f.notas))) : null,
    h('div', { lang: f.idioma },
      stepCard(1, f.activadores.map(activadorView)),
      stepCard(2, [
        h('div', { class: 'logic' },
          h('span', { class: 'field-label' }, L.logic),
          h('div', { class: 'radios' }, LOGICAS.map((l) => h('span', { class: `radio${l === logica ? ' on' : ''}` }, h('span', { class: 'dot' }), mostrar(L.code, l))))),
        lista.length ? lista.map((c, i) => itemView(CONDICIONES, c, i, L.condition)) : h('p', { class: 'muted' }, L.noConditions),
      ]),
      stepCard(3, f.respuesta.map((a, i) => itemView(ACCIONES, a, i, L.action)))));
}

function viewNotFound() {
  document.title = 'Flow Library';
  return h('main', { class: 'wrap' },
    h('div', { class: 'hero' }, h('h1', null, U.notFound), h('p', { class: 'lead' }, U.notFoundLead)),
    h('a', { class: 'btn', href: '#/' }, icon('back'), U.allFlows));
}

/* ---------- Add / edit form ---------- */

const buscarSpec = (specs, tipo) => specs.find((s) => s.tipo === tipo);

const flowVacio = () => ({
  nombre: '', idioma: '', categoria: '', descripcion: '',
  activadores: [nuevoItem(buscarSpec(ACTIVADORES, ACTIVADOR_MENSAJE))],
  condiciones: { logica: LOGICAS[0], lista: [nuevoItem(buscarSpec(CONDICIONES, CONTEXTO))] },
  respuesta: [nuevoItem(buscarSpec(ACCIONES, 'Buscar en conocimientos'))],
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
const nextId = () => `f${++uid}`;

function fieldHead(id, label, required, extra = null) {
  return h('div', { class: 'field-head' },
    h(id ? 'label' : 'span', { for: id, class: 'field-label' }, label, required ? h('span', { class: 'req' }, ' *') : null),
    extra);
}

function bareInput(obj, key, { type = 'text', placeholder, list, min, max, label, show = (v) => v, parse = (v) => v } = {}) {
  const ctrl = h('input', { type, class: 'input', placeholder, list, min, max, 'aria-label': label, value: show(obj[key] ?? '') });
  ctrl.addEventListener('input', () => { obj[key] = parse(ctrl.value); changed(); });
  return ctrl;
}

function input(obj, key, {
  label, placeholder, multiline = false, rows = 3, limit = null, required = false, help = null, list = null, readonly = false,
  onInput = null, show = (v) => v, parse = (v) => v, type = 'text', min, max, prefix = null, suffix = null, mono = false,
} = {}) {
  const id = nextId();
  const ctrl = h(multiline ? 'textarea' : 'input', {
    id, class: `input${mono ? ' mono' : ''}`, placeholder, rows: multiline ? rows : null, type: multiline ? null : type,
    list, readonly, min, max, value: show(obj[key] ?? ''),
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
  const control = prefix || suffix
    ? h('div', { class: 'input-group' }, prefix ? h('span', { class: 'affix' }, prefix) : null, ctrl, suffix ? h('span', { class: 'affix' }, suffix) : null)
    : ctrl;
  return h('div', { class: 'form-field' }, fieldHead(id, label, required, counter), help ? h('p', { class: 'help' }, help) : null, control);
}

function choice(obj, key, label, options) {
  return h('div', { class: 'form-field' },
    fieldHead(null, label, true),
    h('div', { class: 'chips', role: 'radiogroup', 'aria-label': label },
      options.map(([value, text]) => h('label', { class: `chip${obj[key] === value ? ' is-on' : ''}` },
        h('input', { type: 'radio', name: key, value, checked: obj[key] === value, onchange: () => { obj[key] = value; changed(); rerender(); } }),
        text))));
}

function toggle(obj, key, label, desc, kind = 'switch', rerenderOnChange = false) {
  const mark = h('span', { class: kind === 'check' ? 'checkbox' : 'switch' });
  const state = h('span', { class: 'state' });
  const labels = { on: L.on, off: L.off, checked: L.checked, unchecked: L.unchecked };
  const paint = () => {
    const on = obj[key];
    mark.classList.toggle('on', on);
    if (kind === 'check') mark.replaceChildren(on ? icon('check') : '');
    state.replaceChildren(kind === 'check' ? (on ? labels.checked : labels.unchecked) : (on ? labels.on : labels.off), mark);
  };
  const box = h('input', {
    type: 'checkbox', checked: obj[key],
    onchange: (e) => { obj[key] = e.target.checked; paint(); changed(); if (rerenderOnChange) rerender(); },
  });
  paint();
  return h('label', { class: 'setting' },
    box,
    h('span', { class: 'setting-text' }, h('span', { class: 'setting-label' }, label), desc ? h('span', { class: 'setting-desc', style: 'display:block' }, desc) : null),
    state);
}

function trashButton(what, onDelete) {
  const label = `${U.remove} ${what}`;
  return h('button', { type: 'button', class: 'icon-btn danger', title: label, 'aria-label': label, onclick: onDelete }, icon('trash'));
}

function listTools(list, i, what) {
  const move = (to) => { [list[i], list[to]] = [list[to], list[i]]; changed(); rerender(); };
  return h('div', { class: 'block-tools' },
    h('button', { type: 'button', class: 'icon-btn', title: U.moveUp, 'aria-label': `${U.moveUp} ${what}`, disabled: i === 0, onclick: () => move(i - 1) }, icon('up')),
    h('button', { type: 'button', class: 'icon-btn', title: U.moveDown, 'aria-label': `${U.moveDown} ${what}`, disabled: i === list.length - 1, onclick: () => move(i + 1) }, icon('down')),
    trashButton(what, () => { if (confirm(U.removeConfirm(what))) { list.splice(i, 1); changed(); rerender(); } }));
}

function selectField(obj, key, label, options, { required = false, help = null, onChange }) {
  const id = nextId();
  const valores = options.map((o) => o.value);
  if (obj[key] && !valores.includes(obj[key])) valores.push(obj[key]);
  const sel = h('select', { id, class: 'input', value: obj[key], onchange: (e) => { obj[key] = e.target.value; onChange(); } },
    valores.map((v) => h('option', { value: v }, mostrar(L.code, v))));
  return h('div', { class: 'form-field' }, fieldHead(id, label, required), help ? h('p', { class: 'help' }, help) : null, sel);
}

function radioField(obj, key, label, options, onChange) {
  const name = nextId();
  return h('div', { class: 'form-field' },
    fieldHead(null, label, false),
    h('div', { class: 'radios', role: 'radiogroup', 'aria-label': label }, options.map((o) => h('label', { class: `radio${obj[key] === o.value ? ' on' : ''}` },
      h('input', { type: 'radio', name, value: o.value, checked: obj[key] === o.value, onchange: () => { obj[key] = o.value; onChange(); rerender(); } }),
      h('span', { class: 'dot' }), mostrar(L.code, o.value)))));
}

function listForm(f, arr, label, help) {
  const item = txt(f.item);
  return h('div', { class: 'form-field' },
    fieldHead(null, label, f.required),
    help ? h('p', { class: 'help' }, help) : null,
    arr.map((_, j) => h('div', { class: 'row-edit' },
      bareInput(arr, j, { placeholder: `${item} ${j + 1}`, label: `${item} ${j + 1}` }),
      trashButton(U.theItem(j + 1), () => { arr.splice(j, 1); changed(); rerender(); }))),
    h('button', { type: 'button', class: 'btn btn-small', style: 'align-self:flex-start', onclick: () => { arr.push(''); changed(); rerender(); } },
      icon('plus'), `${L.add} ${item.toLowerCase()}`));
}

function pairsForm(f, arr, help) {
  const [c1, c2] = f.cols.map(txt);
  return h('div', { class: 'form-field' },
    fieldHead(null, txt(f.label), false),
    help ? h('p', { class: 'help' }, help) : null,
    arr.map((p, j) => h('div', { class: 'row-edit' },
      bareInput(p, 'nombre', { placeholder: c1, label: `${c1} ${j + 1}` }),
      bareInput(p, 'valor', { placeholder: c2, label: `${c2} ${j + 1}` }),
      trashButton(U.theRow(j + 1), () => { arr.splice(j, 1); changed(); rerender(); }))),
    h('button', { type: 'button', class: 'btn btn-small', style: 'align-self:flex-start', onclick: () => { arr.push({ nombre: '', valor: '' }); changed(); rerender(); } },
      icon('plus'), txt(f.add)));
}

function datetimeForm(v, label, help, required) {
  return h('div', { class: 'form-field' },
    fieldHead(null, label, required),
    help ? h('p', { class: 'help' }, help) : null,
    h('div', { class: 'datetime' },
      bareInput(v, 'fecha', { type: 'date', label: `${label}: ${U.date}` }),
      h('span', { class: 'muted' }, L.at),
      bareInput(v, 'hora', { type: 'time', label: `${label}: ${U.time}` }),
      bareInput(v, 'zona', { list: 'zonas-horarias', placeholder: 'America/Buenos_Aires', label: `${label}: ${U.timeZone}` })));
}

function ejemplosForm(list, kind) {
  return h('details', { class: 'examples', open: true },
    h('summary', null, h('span', { class: `badge ${kind}` }, kind === 'match' ? L.matching : L.nonMatching), h('span', { class: 'muted' }, L.examples(list.length))),
    h('div', { class: 'examples-body' },
      list.map((e, j) => h('div', { class: 'example' },
        h('div', { class: 'example-top' },
          h('span', { class: 'muted' }, `${L.example} ${j + 1}`),
          trashButton(U.theExample(j + 1), () => { list.splice(j, 1); changed(); rerender(); })),
        input(e, 'mensaje', { label: L.userMessage, required: true }),
        input(e, 'explicacion', { label: L.explanation, multiline: true, rows: 2, limit: LIMITES.explicacion }))),
      h('button', { type: 'button', class: 'btn btn-small', style: 'align-self:flex-end', onclick: () => { list.push({ mensaje: '', explicacion: '' }); changed(); rerender(); } }, icon('plus'), L.addExample)));
}

function fieldForm(f, item, spec) {
  if (f.kind === 'heading') return h('h4', { class: 'sub' }, txt(f.text));
  if (f.kind === 'info') return h('p', { class: 'info-note' }, icon('info'), h('span', null, txt(f.text)));
  const label = txt(f.label);
  const help = txt(f.help) || null;
  const placeholder = txt(f.placeholder) || null;
  const afecta = spec.fields.some((x) => x.showIf);
  const alCambiar = () => { changed(); if (afecta) rerender(); };
  switch (f.kind) {
    case 'toggle': case 'check':
      return toggle(item, f.key, label, help, f.kind, afecta);
    case 'textarea':
      return input(item, f.key, { label, placeholder, help, required: f.required, multiline: true, rows: f.rows ?? 3, limit: f.limit });
    case 'rich':
      return input(item, f.key, { label, placeholder, required: f.required, multiline: true, rows: f.rows ?? 6, limit: f.limit, help: [help, U.richHelp].filter(Boolean).join(' ') });
    case 'code':
      return input(item, f.key, { label, placeholder, help, required: f.required, multiline: true, rows: 6, mono: true });
    case 'number':
      return input(item, f.key, { label, help, type: 'number', min: f.min, max: f.max, suffix: f.suffix, show: String, parse: (x) => (x === '' ? 0 : Number(x)) });
    case 'select':
      if (f.free) {
        const listId = nextId();
        return h('div', null,
          input(item, f.key, { label, help, required: f.required, list: listId, show: (v) => mostrar(L.code, v), parse: (v) => guardar(L.code, v) }),
          h('datalist', { id: listId }, f.options.map((o) => h('option', { value: mostrar(L.code, o.value) }))));
      }
      return selectField(item, f.key, label, f.options, { required: f.required, help, onChange: alCambiar });
    case 'radio':
      return radioField(item, f.key, label, f.options, changed);
    case 'list':
      return listForm(f, item[f.key], label, help);
    case 'pairs':
      return pairsForm(f, item[f.key], help);
    case 'datetime':
      return datetimeForm(item[f.key], label, help, f.required);
    case 'examples':
      return ejemplosForm(item[f.key], f.match ? 'match' : 'nomatch');
    default:
      return input(item, f.key, {
        label, placeholder, help, required: f.required, prefix: f.prefix,
        parse: f.prefix ? (x) => x.replace(/^https?:\/\//i, '') : (x) => x,
      });
  }
}

function itemForm(specs, item, i, arr, kicker, what) {
  const spec = specs.find((s) => s.tipo === item.tipo);
  const tools = listTools(arr, i, what);
  if (!spec) {
    return h('div', { class: 'block' }, blockHead(`${kicker} ${i + 1}`, L.otherAction, tools),
      input(item, 'tipo', { label: U.actionName, required: true, placeholder: U.actionNamePlaceholder }),
      input(item, 'valor', { label: L.config, multiline: true }));
  }
  for (const f of spec.fields) if (f.key && item[f.key] === undefined) item[f.key] = nuevoValor(f);
  return h('div', { class: 'block' },
    blockHead(`${kicker} ${i + 1}`, tituloItem(spec, item, L.code), tools, txt(spec.subtitulo), spec.beta),
    visibleFields(spec, item).map((f) => fieldForm(f, item, spec)));
}

function activadoresForm(arr) {
  const tipos = arr.map((a) => a.tipo);
  const disponibles = tipos.includes(ACTIVADOR_MENSAJE)
    ? []
    : ACTIVADORES.filter((s) => !tipos.includes(s.tipo) && (arr.length === 0 || s.tipo !== ACTIVADOR_MENSAJE));
  return [
    arr.map((a, i) => {
      const spec = ACTIVADORES.find((s) => s.tipo === a.tipo);
      if (spec) for (const f of spec.fields) if (a[f.key] === undefined) a[f.key] = nuevoValor(f);
      return h('div', { class: 'trigger' },
        h('span', { class: 'trigger-name' }, mostrar(L.code, a.tipo)),
        spec ? spec.fields.map((f) => h('div', { class: 'input-group' },
          bareInput(a, f.key, { type: 'number', min: f.min, max: f.max, label: txt(f.label), show: String, parse: (x) => (x === '' ? 0 : Number(x)) }),
          h('span', { class: 'affix' }, f.suffix))) : null,
        trashButton(U.theTrigger(i + 1), () => { arr.splice(i, 1); changed(); rerender(); }));
    }),
    disponibles.length
      ? h('div', { class: 'add-row' },
        h('span', { class: 'field-label' }, arr.length ? L.addTrigger : L.triggerQuestion),
        disponibles.map((s) => h('button', { type: 'button', class: 'btn btn-small', onclick: () => { arr.push(nuevoItem(s)); changed(); rerender(); } },
          arr.length ? icon('plus') : null, mostrar(L.code, s.tipo))))
      : null,
  ];
}

function conditionPicker(lista, activadores) {
  const conMensaje = activadores.length === 0 || activadores.some((a) => a.tipo === ACTIVADOR_MENSAJE);
  return h('div', { class: 'add-row' },
    h('span', { class: 'field-label' }, L.addCondition),
    CONDICIONES.filter((s) => s.tipo !== CONTEXTO || conMensaje).map((s) => h('button', {
      type: 'button', class: 'btn btn-small',
      onclick: () => { lista.push(nuevoItem(s)); changed(); rerender(); },
    }, icon('plus'), mostrar(L.code, s.tipo))));
}

function actionPicker(lista) {
  return h('div', { class: 'add-row' },
    h('span', { class: 'field-label' }, L.addAction),
    h('div', { class: 'action-grid' }, ACCIONES.map((s) => h('button', {
      type: 'button', class: 'action-option',
      onclick: () => { lista.push(nuevoItem(s)); changed(); rerender(); },
    },
    icon(s.icono),
    h('span', { class: 'action-text' },
      h('span', { class: 'action-title' }, txt(s.boton)[0], s.beta ? h('span', { class: 'beta' }, 'beta') : null),
      h('span', { class: 'action-desc' }, txt(s.boton)[1]))))));
}

function draftFlow() {
  return normalizeFlow(structuredClone(form.draft));
}

function formErrors() {
  const errores = validateFlow(draftFlow(), U.code);
  if (form.mode === 'nuevo') {
    if (!SLUG_RE.test(form.slug)) errores.unshift(U.slugInvalid);
    else if (data.flows.some((f) => f.slug === form.slug)) errores.unshift(U.slugTaken(form.slug));
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
      toast(ok ? U.fileCopied : U.fileNotCopied);
    },
  }, icon('external'), form.mode === 'editar' ? U.saveButtonEdit : U.saveButtonNew);

  const panelDetails = h('details', null, h('summary', null, U.viewFile), pre);
  refreshPublish = () => {
    const errores = formErrors();
    status.replaceChildren(errores.length
      ? h('ul', { class: 'errors' }, errores.map((e) => h('li', null, e)))
      : h('p', { class: 'ok' }, U.allGood));
    btn.disabled = errores.length > 0;
    if (panelDetails.open) pre.textContent = fileContent();
  };
  panelDetails.addEventListener('toggle', () => { if (panelDetails.open) pre.textContent = fileContent(); });
  refreshPublish();

  return h('section', { class: 'publish' },
    h('h2', null, U.saveTitle),
    h('ol', null, (form.mode === 'editar' ? U.saveStepsEdit : U.saveStepsNew).map((p) => h('li', null, p))),
    status,
    btn,
    panelDetails,
    h('p', { class: 'help' }, U.saveHelp));
}

function zonasHorarias() {
  let zonas = [];
  try { zonas = Intl.supportedValuesOf('timeZone'); } catch { /* older browsers */ }
  return h('datalist', { id: 'zonas-horarias' }, zonas.map((z) => h('option', { value: z })));
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
      form = {
        key, mode, slug: saved?.slug ?? '', slugTouched: saved?.slugTouched ?? false,
        draft: saved ? { notas: '', ...normalizeFlow(saved.draft) } : flowVacio(),
      };
    }
  }
  const { draft } = form;
  const lang = Object.hasOwn(IDIOMAS, draft.idioma ?? '') ? draft.idioma : U.code;
  L = LW[lang];
  document.title = `${mode === 'editar' ? U.edit : U.addFlow} · Flow Library`;

  const slugInput = input(form, 'slug', {
    label: U.fileName, required: mode === 'nuevo', readonly: mode === 'editar',
    help: mode === 'editar' ? U.fileNameHelpEdit : U.fileNameHelpNew,
    onInput: () => { form.slugTouched = true; },
  });
  const slugCtrl = slugInput.querySelector('input');
  const nombreInput = input(draft, 'nombre', {
    label: U.flowName, required: true, placeholder: U.flowNamePlaceholder,
    onInput: (v) => { if (mode === 'nuevo' && !form.slugTouched) { form.slug = slugify(v); slugCtrl.value = form.slug; } },
  });

  return h('main', { class: 'wrap' },
    h('a', { class: 'back', href: mode === 'editar' ? `#/flow/${slug}` : lastLibraryHash }, icon('back'), mode === 'editar' ? U.backToFlow : U.allFlows),
    h('div', { class: 'form-intro' },
      h('div', null,
        h('h1', { style: 'font-size:clamp(24px,4.5vw,30px);letter-spacing:-0.02em;line-height:1.2' }, mode === 'editar' ? U.editTitle(data.flows.find((f) => f.slug === slug)?.nombre) : U.addTitle),
        h('p', { class: 'lead' }, U.formLead)),
      mode === 'nuevo'
        ? h('button', { type: 'button', class: 'btn btn-small btn-danger', onclick: () => { if (confirm(U.startOverConfirm)) { clearDraft(); form = null; rerender(); } } }, U.startOver)
        : null),
    zonasHorarias(),
    h('section', { class: 'form-card' },
      h('h2', null, U.flowDetails),
      h('div', { class: 'form-grid' },
        nombreInput,
        choice(draft, 'idioma', U.flowLanguage, Object.entries(IDIOMAS)),
        choice(draft, 'categoria', U.category, CATEGORIAS.map((c) => [c, c]))),
      input(draft, 'descripcion', { label: U.description, required: true, multiline: true, rows: 2, help: U.descriptionHelp }),
      slugInput),
    h('div', { lang },
      stepCard(1, activadoresForm(draft.activadores), L.required),
      stepCard(2, [
        h('div', { class: 'logic' },
          h('span', { class: 'field-label' }, L.logic),
          h('div', { class: 'radios', role: 'radiogroup' }, LOGICAS.map((l) => h('label', { class: `radio${draft.condiciones.logica === l ? ' on' : ''}` },
            h('input', { type: 'radio', name: 'logica', value: l, checked: draft.condiciones.logica === l, onchange: () => { draft.condiciones.logica = l; changed(); rerender(); } }),
            h('span', { class: 'dot' }), mostrar(lang, l))))),
        draft.condiciones.lista.map((c, i, arr) => itemForm(CONDICIONES, c, i, arr, L.condition, U.theCondition(i + 1))),
        conditionPicker(draft.condiciones.lista, draft.activadores),
      ], L.optional),
      stepCard(3, [
        draft.respuesta.map((a, i, arr) => itemForm(ACCIONES, a, i, arr, L.action, U.theAction(i + 1))),
        actionPicker(draft.respuesta),
      ], L.required)),
    h('section', { class: 'form-card' },
      h('h2', null, U.notesTitle),
      input(draft, 'notas', { label: U.notesLabel, multiline: true, rows: 2, placeholder: U.notesPlaceholder })),
    publishPanel());
}

/* ---------- Router ---------- */

function viewErrors() {
  return h('main', { class: 'wrap' },
    h('div', { class: 'hero' }, h('h1', null, U.loadError), h('p', { class: 'lead' }, U.loadErrorLead)),
    h('ul', { class: 'errors' }, loadErrors.map((e) => h('li', null, e))));
}

function render() {
  const [path, query = ''] = location.hash.replace(/^#\/?/, '').split('?');
  const [section, param] = path.split('/').map(decodeURIComponent);
  L = LW[U.code];
  if (section !== 'nuevo' && section !== 'editar') refreshPublish = () => {};
  let view;
  if (loadErrors) view = viewErrors();
  else if (section === 'flow' && param) view = viewFlow(param);
  else if (section === 'nuevo') view = viewForm('nuevo');
  else if (section === 'editar' && param) view = viewForm('editar', param);
  else if (!section) view = viewLibrary(new URLSearchParams(query));
  else view = viewNotFound();
  document.documentElement.lang = U.code;
  app.replaceChildren(topbar(), view, footer());
}

window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });

try {
  const res = await fetch('flows.json', { cache: 'no-cache' });
  const body = await res.json();
  if (!res.ok) loadErrors = body.errors ?? [`Error ${res.status}`];
  else data = body;
} catch (err) {
  loadErrors = [U.readError(err.message)];
}
render();

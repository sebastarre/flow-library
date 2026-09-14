import {
  ACCIONES, CONTEXTO, LIMITES, LOGICAS, SLUG_RE, TIPOS_ACCION, TIPOS_CONDICION,
  normalizeFlow, slugify, validateFlow,
} from './validate.js';

const app = document.getElementById('app');
const toastEl = document.getElementById('toast');
const DRAFT_KEY = 'flow-library:borrador';
const OTRA_ACCION = 'Otra acción';

let data = null;
let loadErrors = null;
let form = null;
let refreshPublish = () => {};

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

function copyButton(getPlain, { label = 'Copiar', getHtml = null, big = false, iconName = 'copy', done = 'Copiado' } = {}) {
  const btn = h('button', { type: 'button', class: big ? 'btn' : 'copy-btn' });
  const idle = () => btn.replaceChildren(icon(iconName), label);
  idle();
  btn.addEventListener('click', async () => {
    const ok = await copyText(getPlain(), getHtml?.());
    if (!ok) return toast('No se pudo copiar. Seleccioná el texto y copialo a mano.');
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

const SUBTITULOS = {
  1: 'Defina el evento que inicia este flujo',
  2: 'Criterios que deben cumplirse para que el flujo continúe.',
  3: 'Defina lo que sucederá si se cumplen el activador y las condiciones.',
};
const DESCRIPCIONES = {
  escalar_no_resueltas: "Cuando el asistente de IA no sabe la respuesta a una pregunta, presentará el botón de escalamiento 'contactar soporte' al usuario.",
  crear_mejoras: 'Cuando el asistente de IA no sabe la respuesta a una pregunta, agregará automáticamente un nuevo elemento a su lista de tareas de mejora de conocimientos.',
  anular_estilo: 'Si no está marcado, sus instrucciones se agregarán a las instrucciones globales.',
};

function stepCard(n, title, ...content) {
  return h('section', { class: `step step-${n}` },
    h('header', { class: 'step-head' },
      h('span', { class: 'step-num' }, String(n)),
      h('div', null, h('h2', null, title), h('p', null, SUBTITULOS[n]))),
    h('div', { class: 'step-body' }, content));
}

function topbar() {
  const onForm = location.hash.startsWith('#/nuevo') || location.hash.startsWith('#/editar');
  return h('header', { class: 'topbar' },
    h('div', { class: 'wrap' },
      h('a', { class: 'brand', href: '#/' }, h('span', { class: 'brand-mark' }, 'F'), h('span', null, 'Librería de flows ', h('small', null, '· LearnWise'))),
      onForm ? null : h('a', { class: 'btn btn-small', href: '#/nuevo' }, icon('plus'), 'Agregar flow')));
}

function footer() {
  const repo = data ? `https://github.com/${data.repo}` : null;
  return h('footer', { class: 'footer wrap' },
    'Los flows se guardan en ', repo ? h('a', { href: repo, target: '_blank', rel: 'noopener' }, 'GitHub') : 'GitHub',
    '. Cambiar un flow acá no cambia LearnWise: hacé el mismo cambio en los dos lados.');
}

const flowLink = (f) => `${location.origin}${location.pathname}#/flow/${f.slug}`;

/* ---------- Library ---------- */

const filtro = { q: '', cat: '' };

function textoBuscable(f) {
  const partes = [f.nombre, f.descripcion, f.categoria, f.activador];
  for (const c of f.condiciones.lista) {
    partes.push(c.tipo, c.contexto, c.valor);
    for (const e of [...(c.coincidentes ?? []), ...(c.no_coincidentes ?? [])]) partes.push(e.mensaje);
  }
  for (const a of f.respuesta) partes.push(a.tipo);
  return normalizar(partes.filter(Boolean).join(' '));
}

function viewLibrary() {
  document.title = 'Librería de flows';
  const categorias = [...new Set(data.flows.map((f) => f.categoria).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));
  const grid = h('div', { class: 'grid' });
  const count = h('p', { class: 'result-count', 'aria-live': 'polite' });

  const renderGrid = () => {
    const q = normalizar(filtro.q.trim());
    const items = data.flows.filter((f) => (!filtro.cat || f.categoria === filtro.cat) && (!q || textoBuscable(f).includes(q)));
    count.textContent = items.length === 1 ? '1 flow' : `${items.length} flows`;
    grid.replaceChildren(...(items.length ? items.map(card) : [h('div', { class: 'empty' }, 'No hay flows que coincidan con la búsqueda.')]));
  };

  const chips = h('div', { class: 'chips', role: 'group', 'aria-label': 'Filtrar por categoría' });
  const renderChips = () => chips.replaceChildren(...['', ...categorias].map((cat) =>
    h('button', {
      type: 'button', class: 'chip', 'aria-pressed': String(filtro.cat === cat),
      onclick: () => { filtro.cat = cat; renderChips(); renderGrid(); },
    }, cat || 'Todas')));
  renderChips();
  renderGrid();

  return h('main', { class: 'wrap' },
    h('div', { class: 'hero' },
      h('h1', null, 'Flows listos para copiar'),
      h('p', { class: 'lead' }, 'Abrí un flow y copiá cada campo en LearnWise (Tutor Assistant → Flujos). Cada campo tiene su propio botón para copiar.')),
    h('div', { class: 'toolbar' },
      h('label', { class: 'search' }, icon('search'),
        h('input', {
          type: 'search', placeholder: 'Buscar por nombre, contexto o mensaje de ejemplo…', 'aria-label': 'Buscar flows', value: filtro.q,
          oninput: (e) => { filtro.q = e.target.value; renderGrid(); },
        })),
      categorias.length > 1 ? chips : null),
    count,
    grid);
}

function card(f) {
  const ejemplos = f.condiciones.lista.reduce((n, c) => n + (c.coincidentes?.length ?? 0) + (c.no_coincidentes?.length ?? 0), 0);
  const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;
  return h('a', { class: 'card', href: `#/flow/${f.slug}` },
    f.categoria ? h('span', { class: 'tag' }, f.categoria) : null,
    h('h3', null, f.nombre),
    h('p', null, f.descripcion),
    h('div', { class: 'card-meta' },
      h('span', { class: 'meta-pill' }, plural(f.condiciones.lista.length, 'condición', 'condiciones')),
      ejemplos ? h('span', { class: 'meta-pill' }, plural(ejemplos, 'ejemplo', 'ejemplos')) : null,
      f.respuesta.map((a) => h('span', { class: 'meta-pill' }, a.tipo))));
}

/* ---------- Flow detail ---------- */

function field(label, value, { rich = false, limit = null, emptyText = 'Vacío', warn = false } = {}) {
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

function setting(label, on, desc, kind = 'switch') {
  const mark = kind === 'check'
    ? h('span', { class: `checkbox${on ? ' on' : ''}` }, on ? icon('check') : null)
    : h('span', { class: `switch${on ? ' on' : ''}` });
  return h('div', { class: 'setting' },
    h('div', { class: 'setting-text' }, h('div', { class: 'setting-label' }, label), desc ? h('div', { class: 'setting-desc' }, desc) : null),
    h('span', { class: 'state' }, kind === 'check' ? (on ? 'Marcado' : 'Sin marcar') : (on ? 'Activado' : 'Desactivado'), mark));
}

function blockHead(kicker, title, tools) {
  return h('div', { class: 'block-head' }, h('span', { class: 'block-kicker' }, kicker), h('h3', null, title), tools);
}

function ejemplosView(list, kind) {
  const label = kind === 'match' ? 'Ejemplos coincidentes' : 'Ejemplos no coincidentes';
  return h('details', { class: 'examples', open: list.length > 0 },
    h('summary', null,
      h('span', { class: `badge ${kind}` }, label),
      h('span', { class: 'muted' }, list.length === 1 ? '1 ejemplo' : `${list.length} ejemplos`)),
    h('div', { class: 'examples-body' },
      list.length
        ? h('ol', { class: 'example-list' }, list.map((e) => h('li', { class: 'example' },
          field('Mensaje del usuario', e.mensaje),
          field('Explicación', e.explicacion, { limit: LIMITES.explicacion }))))
        : h('p', { class: 'muted' }, 'Todavía no hay ejemplos cargados.')));
}

function condicionView(c, i) {
  const head = blockHead(`Condición ${i + 1}`, c.tipo);
  if (c.tipo !== CONTEXTO) return h('div', { class: 'block' }, head, field('Configuración', c.valor));
  return h('div', { class: 'block' }, head,
    field('Contexto de la conversación', c.contexto),
    ejemplosView(c.coincidentes, 'match'),
    ejemplosView(c.no_coincidentes, 'nomatch'));
}

function accionView(a, i) {
  const head = blockHead(`Acción ${i + 1}`, a.tipo);
  switch (a.tipo) {
    case ACCIONES.BUSCAR:
      return h('div', { class: 'block' }, head,
        setting('Solicitar al usuario escalar para consultas no resueltas', a.escalar_no_resueltas, DESCRIPCIONES.escalar_no_resueltas),
        setting('Crear elementos de mejora de conocimientos para consultas no resueltas', a.crear_mejoras, DESCRIPCIONES.crear_mejoras),
        h('h4', { class: 'sub' }, 'Configuración avanzada'),
        field('Directrices de búsqueda', a.directrices_busqueda, { limit: LIMITES.directrices_busqueda }),
        field('Estilo de respuesta', a.estilo_respuesta, { limit: LIMITES.estilo_respuesta, rich: true }),
        setting('Anular estilo de respuesta', a.anular_estilo, DESCRIPCIONES.anular_estilo, 'check'));
    case ACCIONES.MENSAJE:
      return h('div', { class: 'block' }, head,
        setting('Instruir a la IA para generar mensaje', a.instruir_ia),
        setting('También seguir las instrucciones globales de respuesta', a.seguir_instrucciones_globales),
        field('Instrucción', a.instruccion));
    case ACCIONES.BOTON:
      return h('div', { class: 'block' }, head,
        field('Nombre del botón', a.nombre),
        field('Tipo de botón', a.tipo_boton),
        field('URL', a.url, { warn: true, emptyText: 'Sin configurar' }),
        setting('Mostrar ícono', a.mostrar_icono));
    default:
      return h('div', { class: 'block' }, head, field('Configuración', a.valor));
  }
}

const onOff = (v) => (v ? 'Activado' : 'Desactivado');

function flowToText(f) {
  const out = [`FLOW: ${f.nombre}`, f.descripcion, '', '1. ACTIVADOR', f.activador, '', '2. CONDICIONES', `Lógica de condiciones: ${f.condiciones.logica}`];
  f.condiciones.lista.forEach((c, i) => {
    out.push('', `Condición ${i + 1} — ${c.tipo}`);
    if (c.tipo !== CONTEXTO) return out.push(c.valor);
    out.push(`Contexto: ${c.contexto}`);
    for (const [titulo, lista] of [['Ejemplos coincidentes', c.coincidentes], ['Ejemplos no coincidentes', c.no_coincidentes]]) {
      out.push(`${titulo}:`);
      if (!lista.length) out.push('  (sin ejemplos)');
      for (const e of lista) out.push(`- Mensaje del usuario: ${e.mensaje}`, `  Explicación: ${e.explicacion}`);
    }
  });
  out.push('', '3. RESPUESTA');
  f.respuesta.forEach((a, i) => {
    out.push('', `Acción ${i + 1} — ${a.tipo}`);
    switch (a.tipo) {
      case ACCIONES.BUSCAR:
        out.push(
          `Solicitar al usuario escalar para consultas no resueltas: ${onOff(a.escalar_no_resueltas)}`,
          `Crear elementos de mejora de conocimientos para consultas no resueltas: ${onOff(a.crear_mejoras)}`,
          'Directrices de búsqueda:', a.directrices_busqueda,
          'Estilo de respuesta:', richToPlain(a.estilo_respuesta),
          `Anular estilo de respuesta: ${a.anular_estilo ? 'Sí' : 'No'}`);
        break;
      case ACCIONES.MENSAJE:
        out.push(
          `Instruir a la IA para generar mensaje: ${onOff(a.instruir_ia)}`,
          `También seguir las instrucciones globales de respuesta: ${onOff(a.seguir_instrucciones_globales)}`,
          `Instrucción: ${a.instruccion}`);
        break;
      case ACCIONES.BOTON:
        out.push(`Nombre del botón: ${a.nombre}`, `Tipo de botón: ${a.tipo_boton}`, `URL: ${a.url || '(sin configurar)'}`, `Mostrar ícono: ${onOff(a.mostrar_icono)}`);
        break;
      default:
        out.push(a.valor);
    }
  });
  if (f.notas) out.push('', `Notas: ${f.notas}`);
  return out.join('\n');
}

function viewFlow(slug) {
  const f = data.flows.find((x) => x.slug === slug);
  if (!f) return viewNotFound();
  document.title = `${f.nombre} · Librería de flows`;
  const { lista, logica } = f.condiciones;

  return h('main', { class: 'wrap' },
    h('a', { class: 'back', href: '#/' }, icon('back'), 'Todos los flows'),
    h('div', { class: 'flow-head' },
      h('div', null,
        f.categoria ? h('span', { class: 'tag' }, f.categoria) : null,
        h('h1', null, f.nombre),
        h('p', { class: 'lead' }, f.descripcion)),
      h('div', { class: 'flow-actions' },
        copyButton(() => flowLink(f), { label: 'Copiar link', big: true, iconName: 'link', done: 'Link copiado' }),
        copyButton(() => flowToText(f), { label: 'Copiar todo', big: true, done: 'Flow copiado' }),
        h('a', { class: 'btn', href: `#/editar/${f.slug}` }, icon('edit'), 'Editar'))),
    h('p', { class: 'howto' }, icon('info'),
      h('span', null, 'En LearnWise andá a Tutor Assistant → Flujos y creá un flujo nuevo. Copiá cada campo con su botón y pegalo en el mismo lugar.')),
    f.notas ? h('p', { class: 'note' }, h('span', null, h('strong', null, 'Ojo: '), f.notas)) : null,
    stepCard(1, 'Activador', field('Evento', f.activador)),
    stepCard(2, 'Condiciones',
      h('div', { class: 'logic' },
        h('span', { class: 'field-label' }, 'Lógica de condiciones'),
        h('div', { class: 'radios' }, LOGICAS.map((l) => h('span', { class: `radio${l === logica ? ' on' : ''}` }, h('span', { class: 'dot' }), l)))),
      lista.length ? lista.map(condicionView) : h('p', { class: 'muted' }, 'Sin condiciones: el flujo corre siempre que ocurre el activador.')),
    stepCard(3, 'Respuesta', f.respuesta.map(accionView)));
}

function viewNotFound() {
  document.title = 'No encontrado · Librería de flows';
  return h('main', { class: 'wrap' },
    h('div', { class: 'hero' }, h('h1', null, 'No encontramos ese flow'), h('p', { class: 'lead' }, 'Puede que lo hayan renombrado o borrado.')),
    h('a', { class: 'btn', href: '#/' }, icon('back'), 'Ver todos los flows'));
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
      return { tipo: '', valor: '', otra: true };
  }
}

const flowVacio = () => ({
  nombre: '', descripcion: '', categoria: '', activador: 'El usuario envía un mensaje',
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
function input(obj, key, { label, placeholder, multiline = false, rows = 3, limit = null, required = false, help = null, list = null, readonly = false, onInput = null } = {}) {
  const id = `f${++uid}`;
  const ctrl = h(multiline ? 'textarea' : 'input', {
    id, class: 'input', placeholder, rows: multiline ? rows : null, type: multiline ? null : 'text',
    list, readonly, value: obj[key] ?? '',
  });
  const counter = limit ? h('span', { class: 'field-count' }) : null;
  const updateCounter = () => {
    if (!counter) return;
    counter.textContent = `${ctrl.value.length}/${limit}`;
    counter.classList.toggle('over', ctrl.value.length > limit);
  };
  ctrl.addEventListener('input', () => {
    obj[key] = ctrl.value;
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

function toggle(obj, key, label, desc, kind = 'switch') {
  const mark = h('span', { class: kind === 'check' ? 'checkbox' : 'switch' });
  const state = h('span', { class: 'state' });
  const paint = () => {
    const on = obj[key];
    mark.classList.toggle('on', on);
    if (kind === 'check') mark.replaceChildren(on ? icon('check') : '');
    state.replaceChildren(kind === 'check' ? (on ? 'Marcado' : 'Sin marcar') : (on ? 'Activado' : 'Desactivado'), mark);
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

function addRow(label, options, onAdd) {
  return h('div', { class: 'add-row' },
    h('span', { class: 'field-label' }, label),
    options.map((o) => h('button', { type: 'button', class: 'btn btn-small', onclick: () => { onAdd(o); changed(); rerender(); } }, icon('plus'), o)));
}

function ejemplosForm(list, kind) {
  const label = kind === 'match' ? 'Ejemplos coincidentes' : 'Ejemplos no coincidentes';
  return h('details', { class: 'examples', open: true },
    h('summary', null, h('span', { class: `badge ${kind}` }, label), h('span', { class: 'muted' }, list.length === 1 ? '1 ejemplo' : `${list.length} ejemplos`)),
    h('div', { class: 'examples-body' },
      list.map((e, j) => h('div', { class: 'example' },
        h('div', { class: 'example-top' },
          h('span', { class: 'muted' }, `Ejemplo ${j + 1}`),
          h('button', {
            type: 'button', class: 'icon-btn danger', title: 'Borrar ejemplo', 'aria-label': `Borrar ejemplo ${j + 1}`,
            onclick: () => { list.splice(j, 1); changed(); rerender(); },
          }, icon('trash'))),
        input(e, 'mensaje', { label: 'Mensaje del usuario', required: true }),
        input(e, 'explicacion', { label: 'Explicación', multiline: true, rows: 2, limit: LIMITES.explicacion }))),
      h('button', { type: 'button', class: 'btn btn-small', style: 'align-self:flex-end', onclick: () => { list.push(nuevoEjemplo()); changed(); rerender(); } }, icon('plus'), 'Agregar ejemplo')));
}

function condicionForm(c, i, lista) {
  const head = blockHead(`Condición ${i + 1}`, c.tipo, listTools(lista, i, `la condición ${i + 1}`));
  if (c.tipo !== CONTEXTO) {
    return h('div', { class: 'block' }, head,
      input(c, 'valor', { label: 'Configuración', multiline: true, required: true, help: 'Escribí cómo está configurada esta condición en LearnWise.' }));
  }
  return h('div', { class: 'block' }, head,
    input(c, 'contexto', { label: 'Contexto de la conversación', multiline: true, rows: 3, required: true, placeholder: 'Cuándo aplica: qué dice o quiere el usuario, y qué no.' }),
    ejemplosForm(c.coincidentes, 'match'),
    ejemplosForm(c.no_coincidentes, 'nomatch'));
}

function accionForm(a, i, lista) {
  const esOtra = a.otra || !TIPOS_ACCION.includes(a.tipo);
  const head = blockHead(`Acción ${i + 1}`, esOtra ? OTRA_ACCION : a.tipo, listTools(lista, i, `la acción ${i + 1}`));
  if (esOtra) {
    return h('div', { class: 'block' }, head,
      input(a, 'tipo', { label: 'Nombre de la acción', required: true, placeholder: 'Como aparece en LearnWise' }),
      input(a, 'valor', { label: 'Configuración', multiline: true, required: true, help: 'Escribí cada ajuste de esta acción tal como está en LearnWise.' }));
  }
  switch (a.tipo) {
    case ACCIONES.BUSCAR:
      return h('div', { class: 'block' }, head,
        toggle(a, 'escalar_no_resueltas', 'Solicitar al usuario escalar para consultas no resueltas', DESCRIPCIONES.escalar_no_resueltas),
        toggle(a, 'crear_mejoras', 'Crear elementos de mejora de conocimientos para consultas no resueltas', DESCRIPCIONES.crear_mejoras),
        h('h4', { class: 'sub' }, 'Configuración avanzada'),
        input(a, 'directrices_busqueda', { label: 'Directrices de búsqueda', multiline: true, rows: 4, limit: LIMITES.directrices_busqueda }),
        input(a, 'estilo_respuesta', {
          label: 'Estilo de respuesta', multiline: true, rows: 12, limit: LIMITES.estilo_respuesta,
          help: 'Para una viñeta, empezá la línea con "- ". Para cursiva, *así*. Al copiar desde la librería se pegan como viñetas.',
        }),
        toggle(a, 'anular_estilo', 'Anular estilo de respuesta', DESCRIPCIONES.anular_estilo, 'check'));
    case ACCIONES.MENSAJE:
      return h('div', { class: 'block' }, head,
        toggle(a, 'instruir_ia', 'Instruir a la IA para generar mensaje'),
        toggle(a, 'seguir_instrucciones_globales', 'También seguir las instrucciones globales de respuesta'),
        input(a, 'instruccion', { label: 'Instrucción', multiline: true, required: true }));
    case ACCIONES.BOTON:
      return h('div', { class: 'block' }, head,
        h('div', { class: 'form-grid' },
          input(a, 'nombre', { label: 'Nombre del botón', required: true }),
          input(a, 'tipo_boton', { label: 'Tipo de botón', required: true, list: 'tipos-boton' })),
        input(a, 'url', { label: 'URL', placeholder: 'https://… (puede quedar vacía)' }),
        toggle(a, 'mostrar_icono', 'Mostrar ícono'));
    default:
      return null;
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

  return h('section', { class: 'publish' },
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
  document.title = `${mode === 'editar' ? 'Editar flow' : 'Agregar flow'} · Librería de flows`;
  const categorias = [...new Set(data.flows.map((f) => f.categoria).filter(Boolean))];

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
    h('a', { class: 'back', href: mode === 'editar' ? `#/flow/${slug}` : '#/' }, icon('back'), mode === 'editar' ? 'Volver al flow' : 'Todos los flows'),
    h('div', { class: 'form-intro' },
      h('div', null,
        h('h1', { style: 'font-size:clamp(24px,4.5vw,30px);letter-spacing:-0.02em;line-height:1.2' }, mode === 'editar' ? `Editar: ${data.flows.find((f) => f.slug === slug)?.nombre}` : 'Agregar un flow'),
        h('p', { class: 'lead' }, 'Completá los campos igual que en LearnWise. Al final, la página arma el archivo y te lleva a GitHub para guardarlo.')),
      mode === 'nuevo'
        ? h('button', { type: 'button', class: 'btn btn-small btn-danger', onclick: () => { if (confirm('¿Borrar todo lo cargado y empezar de cero?')) { clearDraft(); form = null; rerender(); } } }, 'Empezar de cero')
        : null),
    h('datalist', { id: 'categorias' }, categorias.map((c) => h('option', { value: c }))),
    h('datalist', { id: 'activadores' }, h('option', { value: 'El usuario envía un mensaje' })),
    h('datalist', { id: 'tipos-boton' }, h('option', { value: 'Enlace externo' })),
    h('section', { class: 'form-card' },
      h('h2', null, 'Datos del flow'),
      h('div', { class: 'form-grid' }, nombreInput, input(draft, 'categoria', { label: 'Categoría', list: 'categorias', placeholder: 'Ej.: Tutoría, Soporte' })),
      input(draft, 'descripcion', { label: 'Descripción corta', required: true, multiline: true, rows: 2, help: 'Se muestra en la tarjeta de la librería. Una o dos oraciones: cuándo se activa y qué hace.' }),
      slugInput),
    stepCard(1, 'Activador', input(draft, 'activador', { label: 'Evento', required: true, list: 'activadores' })),
    stepCard(2, 'Condiciones',
      h('div', { class: 'logic' },
        h('span', { class: 'field-label' }, 'Lógica de condiciones'),
        h('div', { class: 'radios', role: 'radiogroup' }, LOGICAS.map((l) => h('label', { class: `radio${draft.condiciones.logica === l ? ' on' : ''}` },
          h('input', { type: 'radio', name: 'logica', value: l, checked: draft.condiciones.logica === l, onchange: () => { draft.condiciones.logica = l; changed(); rerender(); } }),
          h('span', { class: 'dot' }), l)))),
      draft.condiciones.lista.map((c, i, lista) => condicionForm(c, i, lista)),
      addRow('Agregar una condición', TIPOS_CONDICION, (tipo) => draft.condiciones.lista.push(nuevaCondicion(tipo)))),
    stepCard(3, 'Respuesta',
      draft.respuesta.map((a, i, lista) => accionForm(a, i, lista)),
      addRow('Agregar una acción', [...TIPOS_ACCION, OTRA_ACCION], (tipo) => draft.respuesta.push(nuevaAccion(tipo)))),
    h('section', { class: 'form-card' },
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
  const [section, param] = location.hash.replace(/^#\/?/, '').split('/').map(decodeURIComponent);
  if (section !== 'nuevo' && section !== 'editar') refreshPublish = () => {};
  let view;
  if (loadErrors) view = viewErrors();
  else if (section === 'flow' && param) view = viewFlow(param);
  else if (section === 'nuevo') view = viewForm('nuevo');
  else if (section === 'editar' && param) view = viewForm('editar', param);
  else if (!section) view = viewLibrary();
  else view = viewNotFound();
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

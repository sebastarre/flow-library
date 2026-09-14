// Flow file format and validation, shared by the website (browser) and the build script (Node).
// The building blocks and their fields are defined in schema.js.
import {
  ACCIONES, ACTIVADORES, ACTIVADOR_MENSAJE, CATEGORIAS, CONDICIONES, CONTEXTO, IDIOMAS, LIMITES, LOGICAS, t,
} from './schema.js';

export * from './schema.js';

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugify(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, '');
}

const str = (v) => (typeof v === 'string' ? v : '');
const lista = (v) => (Array.isArray(v) ? v : []);

function valorVacio(f) {
  if ('default' in f) return structuredClone(f.default);
  switch (f.kind) {
    case 'toggle': case 'check': return false;
    case 'number': return 0;
    case 'list': case 'pairs': case 'examples': return [];
    case 'datetime': return { fecha: '', hora: '', zona: '' };
    default: return '';
  }
}

// Value for a field of an item just added in the form.
export function nuevoValor(f) {
  if (f.kind === 'examples') return [{ mensaje: '', explicacion: '' }];
  if (f.kind === 'datetime') {
    let zona = '';
    try { zona = Intl.DateTimeFormat().resolvedOptions().timeZone ?? ''; } catch { /* no Intl */ }
    return { fecha: '', hora: '00:00', zona };
  }
  return valorVacio(f);
}

export function nuevoItem(spec) {
  const item = { tipo: spec.tipo };
  for (const f of spec.fields) if (f.key) item[f.key] = nuevoValor(f);
  return item;
}

function normalizeValue(f, v) {
  switch (f.kind) {
    case 'toggle': case 'check': return typeof v === 'boolean' ? v : valorVacio(f);
    case 'number': return typeof v === 'number' && Number.isFinite(v) ? v : valorVacio(f);
    case 'list': return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : valorVacio(f);
    case 'pairs': return lista(v).map((p) => ({ nombre: str(p?.nombre), valor: str(p?.valor) }));
    case 'examples': return lista(v).map((e) => ({ mensaje: str(e?.mensaje), explicacion: str(e?.explicacion) }));
    case 'datetime': return { fecha: str(v?.fecha), hora: str(v?.hora), zona: str(v?.zona) };
    default: return typeof v === 'string' ? v : valorVacio(f);
  }
}

// Returns the item with its fields in schema order; hidden fields are dropped unless keepHidden.
export function normalizeItem(specs, item, { keepHidden = false } = {}) {
  const o = item ?? {};
  const spec = specs.find((s) => s.tipo === o.tipo);
  if (!spec) return { tipo: str(o.tipo), valor: str(o.valor) };
  const out = { tipo: spec.tipo };
  for (const f of spec.fields) if (f.key) out[f.key] = normalizeValue(f, o[f.key]);
  if (!keepHidden) {
    const hidden = spec.fields.filter((f) => f.key && f.showIf && !f.showIf(out));
    for (const f of hidden) delete out[f.key];
  }
  return out;
}

// Older files have a single "activador" string instead of the "activadores" list.
const activadoresDe = (f) => (Array.isArray(f.activadores) ? f.activadores : typeof f.activador === 'string' && f.activador ? [{ tipo: f.activador }] : null);

export function normalizeFlow(flow) {
  const f = flow ?? {};
  const c = f.condiciones ?? {};
  const out = {
    nombre: str(f.nombre),
    idioma: str(f.idioma),
    categoria: str(f.categoria),
    descripcion: str(f.descripcion),
    activadores: lista(activadoresDe(f)).map((a) => normalizeItem(ACTIVADORES, a)),
    condiciones: { logica: str(c.logica), lista: lista(c.lista).map((x) => normalizeItem(CONDICIONES, x)) },
    respuesta: lista(f.respuesta).map((x) => normalizeItem(ACCIONES, x)),
  };
  if (str(f.notas).trim()) out.notas = f.notas;
  return out;
}

function formatoOk(f, v) {
  const obj = (x) => x && typeof x === 'object' && !Array.isArray(x);
  const textos = (x, keys) => keys.every((k) => x[k] === undefined || typeof x[k] === 'string');
  switch (f.kind) {
    case 'toggle': case 'check': return typeof v === 'boolean';
    case 'number': return typeof v === 'number' && Number.isFinite(v);
    case 'list': return Array.isArray(v) && v.every((x) => typeof x === 'string');
    case 'pairs': return Array.isArray(v) && v.every((p) => obj(p) && textos(p, ['nombre', 'valor']));
    case 'examples': return Array.isArray(v) && v.every((e) => obj(e) && textos(e, ['mensaje', 'explicacion']));
    case 'datetime': return obj(v) && textos(v, ['fecha', 'hora', 'zona']);
    default: return typeof v === 'string';
  }
}

function validarItem(specs, item, donde, errores, { allowUnknown = false } = {}) {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return errores.push(`${donde}: formato inválido.`);
  const spec = specs.find((s) => s.tipo === item.tipo);
  if (!spec) {
    if (!allowUnknown) return errores.push(`${donde}: tipo desconocido "${item.tipo ?? ''}".`);
    if (typeof item.tipo !== 'string' || !item.tipo.trim()) return errores.push(`${donde}: falta el tipo.`);
    if (item.valor !== undefined && typeof item.valor !== 'string') errores.push(`${donde}: la configuración tiene que ser texto.`);
    return;
  }
  const full = normalizeItem(specs, item, { keepHidden: true });
  for (const f of spec.fields) {
    if (!f.key) continue;
    const nombre = `${donde}, «${t(f.label, 'es') || f.key}»`;
    if (item[f.key] !== undefined && !formatoOk(f, item[f.key])) { errores.push(`${nombre}: formato inválido.`); continue; }
    if (f.showIf && !f.showIf(full)) continue;
    const v = full[f.key];
    switch (f.kind) {
      case 'toggle': case 'check':
        break;
      case 'examples':
        v.forEach((e, j) => {
          const ej = `${donde}, ejemplo ${f.match ? 'coincidente' : 'no coincidente'} ${j + 1}`;
          if (!e.mensaje.trim()) errores.push(`${ej}: falta el mensaje del usuario.`);
          if (e.explicacion.length > LIMITES.explicacion) errores.push(`${ej}: la explicación supera los ${LIMITES.explicacion} caracteres.`);
        });
        break;
      case 'list':
        if (f.required && !v.length) errores.push(`${nombre}: agregá al menos uno.`);
        v.forEach((x, j) => { if (!x.trim()) errores.push(`${nombre}: el ítem ${j + 1} está vacío.`); });
        break;
      case 'pairs':
        v.forEach((p, j) => { if (!p.nombre.trim()) errores.push(`${nombre}: a la fila ${j + 1} le falta «${t(f.cols[0], 'es')}».`); });
        break;
      case 'datetime':
        if (f.required && !v.fecha) errores.push(`${nombre}: falta la fecha.`);
        if (v.fecha && !/^\d{4}-\d{2}-\d{2}$/.test(v.fecha)) errores.push(`${nombre}: la fecha tiene que ser AAAA-MM-DD.`);
        if (v.hora && !/^\d{2}:\d{2}$/.test(v.hora)) errores.push(`${nombre}: la hora tiene que ser HH:MM.`);
        break;
      case 'number':
        if (f.min != null && v < f.min) errores.push(`${nombre}: tiene que ser ${f.min} o más.`);
        if (f.max != null && v > f.max) errores.push(`${nombre}: tiene que ser ${f.max} o menos.`);
        break;
      default:
        if (f.required && !v.trim()) errores.push(`${nombre}: no puede quedar vacío.`);
        if (f.limit && v.length > f.limit) errores.push(`${nombre}: supera los ${f.limit} caracteres.`);
    }
  }
}

// Returns a list of problems in plain Spanish; an empty list means the flow is valid.
export function validateFlow(f) {
  if (!f || typeof f !== 'object' || Array.isArray(f)) return ['El archivo tiene que ser un objeto JSON.'];
  const errores = [];
  const texto = (v) => typeof v === 'string' && v.trim() !== '';
  const need = (ok, msg) => { if (!ok) errores.push(msg); };

  need(texto(f.nombre), 'Falta el nombre del flow.');
  need(Object.hasOwn(IDIOMAS, f.idioma ?? ''), `Elegí el idioma del flow ("${Object.keys(IDIOMAS).join('" o "')}").`);
  need(CATEGORIAS.includes(f.categoria), `Elegí la categoría: ${CATEGORIAS.join(', ')}.`);
  need(texto(f.descripcion), 'Falta la descripción corta.');
  need(f.notas === undefined || typeof f.notas === 'string', 'Las notas tienen que ser texto.');

  const activadores = activadoresDe(f);
  if (!activadores || activadores.length === 0) {
    errores.push('Agregá al menos un activador.');
  } else {
    activadores.forEach((a, i) => validarItem(ACTIVADORES, a, `Activador ${i + 1}`, errores));
    const tipos = activadores.map((a) => a?.tipo);
    if (new Set(tipos).size !== tipos.length) errores.push('Hay activadores repetidos.');
    if (tipos.includes(ACTIVADOR_MENSAJE) && tipos.length > 1) errores.push(`«${ACTIVADOR_MENSAJE}» no se puede combinar con otros activadores.`);
  }
  const conMensaje = !activadores || activadores.some((a) => a?.tipo === ACTIVADOR_MENSAJE);

  const c = f.condiciones;
  if (!c || typeof c !== 'object' || Array.isArray(c)) {
    errores.push('Falta la sección de condiciones.');
  } else {
    need(LOGICAS.includes(c.logica), `Lógica de condiciones: tiene que ser "${LOGICAS.join('" o "')}".`);
    if (!Array.isArray(c.lista)) errores.push('Las condiciones tienen que ser una lista.');
    else c.lista.forEach((cond, i) => {
      validarItem(CONDICIONES, cond, `Condición ${i + 1}`, errores);
      if (cond?.tipo === CONTEXTO && !conMensaje) errores.push(`Condición ${i + 1}: «${CONTEXTO}» solo se puede usar con el activador «${ACTIVADOR_MENSAJE}».`);
    });
  }

  if (!Array.isArray(f.respuesta) || f.respuesta.length === 0) errores.push('Agregá al menos una acción en Respuesta.');
  else f.respuesta.forEach((a, i) => validarItem(ACCIONES, a, `Acción ${i + 1}`, errores, { allowUnknown: true }));

  return errores;
}

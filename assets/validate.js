// Flow file format and validation, shared by the website (browser) and the build script (Node).
// The building blocks and their fields are defined in schema.js.
import {
  ACCIONES, ACTIVADORES, ACTIVADOR_MENSAJE, CATEGORIAS, CONDICIONES, CONTEXTO, IDIOMAS, LIMITES, LOGICAS, mostrar, t,
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

/* ---------- Validation ---------- */

const MENSAJES = {
  es: {
    objeto: 'El archivo tiene que ser un objeto JSON.',
    trigger: 'Activador', condition: 'Condición', action: 'Acción',
    formato: (d) => `${d}: formato inválido.`,
    tipoDesconocido: (d, tipo) => `${d}: tipo desconocido "${tipo}".`,
    faltaTipo: (d) => `${d}: falta el tipo.`,
    configTexto: (d) => `${d}: la configuración tiene que ser texto.`,
    ejemplo: (d, match, j) => `${d}, ejemplo ${match ? 'coincidente' : 'no coincidente'} ${j}`,
    faltaMensaje: (e) => `${e}: falta el mensaje del usuario.`,
    explicacionLarga: (e, max) => `${e}: la explicación supera los ${max} caracteres.`,
    alMenosUno: (n) => `${n}: agregá al menos uno.`,
    itemVacio: (n, j) => `${n}: el ítem ${j} está vacío.`,
    filaSinCol: (n, j, col) => `${n}: a la fila ${j} le falta «${col}».`,
    faltaFecha: (n) => `${n}: falta la fecha.`,
    fechaFormato: (n) => `${n}: la fecha tiene que ser AAAA-MM-DD.`,
    horaFormato: (n) => `${n}: la hora tiene que ser HH:MM.`,
    minimo: (n, min) => `${n}: tiene que ser ${min} o más.`,
    maximo: (n, max) => `${n}: tiene que ser ${max} o menos.`,
    vacio: (n) => `${n}: no puede quedar vacío.`,
    limite: (n, max) => `${n}: supera los ${max} caracteres.`,
    faltaNombre: 'Falta el nombre del flow.',
    idioma: (ops) => `Elegí el idioma del flow (${ops}).`,
    categoria: (ops) => `Elegí la categoría: ${ops}.`,
    faltaDescripcion: 'Falta la descripción corta.',
    notas: 'Las notas tienen que ser texto.',
    sinActivador: 'Agregá al menos un activador.',
    activadoresRepetidos: 'Hay activadores repetidos.',
    mensajeExclusivo: (tipo) => `«${tipo}» no se puede combinar con otros activadores.`,
    sinCondiciones: 'Falta la sección de condiciones.',
    logica: (ops) => `Lógica de condiciones: tiene que ser ${ops}.`,
    condicionesLista: 'Las condiciones tienen que ser una lista.',
    contextoSoloMensaje: (d, ctx, trig) => `${d}: «${ctx}» solo se puede usar con el activador «${trig}».`,
    sinAcciones: 'Agregá al menos una acción en Respuesta.',
    o: 'o',
  },
  en: {
    objeto: 'The file must be a JSON object.',
    trigger: 'Trigger', condition: 'Condition', action: 'Action',
    formato: (d) => `${d}: invalid format.`,
    tipoDesconocido: (d, tipo) => `${d}: unknown type "${tipo}".`,
    faltaTipo: (d) => `${d}: missing type.`,
    configTexto: (d) => `${d}: the configuration must be text.`,
    ejemplo: (d, match, j) => `${d}, ${match ? 'matching' : 'non-matching'} example ${j}`,
    faltaMensaje: (e) => `${e}: missing user message.`,
    explicacionLarga: (e, max) => `${e}: the explanation is over ${max} characters.`,
    alMenosUno: (n) => `${n}: add at least one.`,
    itemVacio: (n, j) => `${n}: item ${j} is empty.`,
    filaSinCol: (n, j, col) => `${n}: row ${j} is missing «${col}».`,
    faltaFecha: (n) => `${n}: missing date.`,
    fechaFormato: (n) => `${n}: the date must be YYYY-MM-DD.`,
    horaFormato: (n) => `${n}: the time must be HH:MM.`,
    minimo: (n, min) => `${n}: must be ${min} or more.`,
    maximo: (n, max) => `${n}: must be ${max} or less.`,
    vacio: (n) => `${n}: can't be empty.`,
    limite: (n, max) => `${n}: is over ${max} characters.`,
    faltaNombre: 'Missing flow name.',
    idioma: (ops) => `Choose the flow language (${ops}).`,
    categoria: (ops) => `Choose the category: ${ops}.`,
    faltaDescripcion: 'Missing short description.',
    notas: 'Notes must be text.',
    sinActivador: 'Add at least one trigger.',
    activadoresRepetidos: 'There are repeated triggers.',
    mensajeExclusivo: (tipo) => `«${tipo}» can't be combined with other triggers.`,
    sinCondiciones: 'Missing conditions section.',
    logica: (ops) => `Condition logic: must be ${ops}.`,
    condicionesLista: 'Conditions must be a list.',
    contextoSoloMensaje: (d, ctx, trig) => `${d}: «${ctx}» can only be used with the «${trig}» trigger.`,
    sinAcciones: 'Add at least one action in Response.',
    o: 'or',
  },
};

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

function validarItem(specs, item, donde, errores, lang, { allowUnknown = false } = {}) {
  const M = MENSAJES[lang];
  if (!item || typeof item !== 'object' || Array.isArray(item)) return errores.push(M.formato(donde));
  const spec = specs.find((s) => s.tipo === item.tipo);
  if (!spec) {
    if (!allowUnknown) return errores.push(M.tipoDesconocido(donde, item.tipo ?? ''));
    if (typeof item.tipo !== 'string' || !item.tipo.trim()) return errores.push(M.faltaTipo(donde));
    if (item.valor !== undefined && typeof item.valor !== 'string') errores.push(M.configTexto(donde));
    return;
  }
  const full = normalizeItem(specs, item, { keepHidden: true });
  for (const f of spec.fields) {
    if (!f.key) continue;
    const nombre = `${donde}, «${t(f.label, lang) || f.key}»`;
    if (item[f.key] !== undefined && !formatoOk(f, item[f.key])) { errores.push(M.formato(nombre)); continue; }
    if (f.showIf && !f.showIf(full)) continue;
    const v = full[f.key];
    switch (f.kind) {
      case 'toggle': case 'check':
        break;
      case 'examples':
        v.forEach((e, j) => {
          const ej = M.ejemplo(donde, f.match, j + 1);
          if (!e.mensaje.trim()) errores.push(M.faltaMensaje(ej));
          if (e.explicacion.length > LIMITES.explicacion) errores.push(M.explicacionLarga(ej, LIMITES.explicacion));
        });
        break;
      case 'list':
        if (f.required && !v.length) errores.push(M.alMenosUno(nombre));
        v.forEach((x, j) => { if (!x.trim()) errores.push(M.itemVacio(nombre, j + 1)); });
        break;
      case 'pairs':
        v.forEach((p, j) => { if (!p.nombre.trim()) errores.push(M.filaSinCol(nombre, j + 1, t(f.cols[0], lang))); });
        break;
      case 'datetime':
        if (f.required && !v.fecha) errores.push(M.faltaFecha(nombre));
        if (v.fecha && !/^\d{4}-\d{2}-\d{2}$/.test(v.fecha)) errores.push(M.fechaFormato(nombre));
        if (v.hora && !/^\d{2}:\d{2}$/.test(v.hora)) errores.push(M.horaFormato(nombre));
        break;
      case 'number':
        if (f.min != null && v < f.min) errores.push(M.minimo(nombre, f.min));
        if (f.max != null && v > f.max) errores.push(M.maximo(nombre, f.max));
        break;
      default:
        if (f.required && !v.trim()) errores.push(M.vacio(nombre));
        if (f.limit && v.length > f.limit) errores.push(M.limite(nombre, f.limit));
    }
  }
}

// Returns a list of problems in plain language (Spanish by default); an empty list means the flow is valid.
export function validateFlow(f, lang = 'es') {
  const M = MENSAJES[lang] ?? MENSAJES.es;
  lang = MENSAJES[lang] ? lang : 'es';
  if (!f || typeof f !== 'object' || Array.isArray(f)) return [M.objeto];
  const errores = [];
  const texto = (v) => typeof v === 'string' && v.trim() !== '';
  const need = (ok, msg) => { if (!ok) errores.push(msg); };
  const opciones = (list) => list.map((x) => `"${x}"`).join(` ${M.o} `);

  need(texto(f.nombre), M.faltaNombre);
  need(Object.hasOwn(IDIOMAS, f.idioma ?? ''), M.idioma(opciones(Object.keys(IDIOMAS))));
  need(CATEGORIAS.includes(f.categoria), M.categoria(CATEGORIAS.join(', ')));
  need(texto(f.descripcion), M.faltaDescripcion);
  need(f.notas === undefined || typeof f.notas === 'string', M.notas);

  const activadores = activadoresDe(f);
  if (!activadores || activadores.length === 0) {
    errores.push(M.sinActivador);
  } else {
    activadores.forEach((a, i) => validarItem(ACTIVADORES, a, `${M.trigger} ${i + 1}`, errores, lang));
    const tipos = activadores.map((a) => a?.tipo);
    if (new Set(tipos).size !== tipos.length) errores.push(M.activadoresRepetidos);
    if (tipos.includes(ACTIVADOR_MENSAJE) && tipos.length > 1) errores.push(M.mensajeExclusivo(mostrar(lang, ACTIVADOR_MENSAJE)));
  }
  const conMensaje = !activadores || activadores.some((a) => a?.tipo === ACTIVADOR_MENSAJE);

  const c = f.condiciones;
  if (!c || typeof c !== 'object' || Array.isArray(c)) {
    errores.push(M.sinCondiciones);
  } else {
    need(LOGICAS.includes(c.logica), M.logica(opciones(LOGICAS.map((l) => mostrar(lang, l)))));
    if (!Array.isArray(c.lista)) errores.push(M.condicionesLista);
    else c.lista.forEach((cond, i) => {
      const donde = `${M.condition} ${i + 1}`;
      validarItem(CONDICIONES, cond, donde, errores, lang);
      if (cond?.tipo === CONTEXTO && !conMensaje) errores.push(M.contextoSoloMensaje(donde, mostrar(lang, CONTEXTO), mostrar(lang, ACTIVADOR_MENSAJE)));
    });
  }

  if (!Array.isArray(f.respuesta) || f.respuesta.length === 0) errores.push(M.sinAcciones);
  else f.respuesta.forEach((a, i) => validarItem(ACCIONES, a, `${M.action} ${i + 1}`, errores, lang, { allowUnknown: true }));

  return errores;
}

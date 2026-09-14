// Flow format shared by the website (browser) and the build script (Node).
// Field names and option labels match the LearnWise UI (Tutor Assistant → Flujos).

export const CONTEXTO = 'Contexto de la conversación';
export const TIPOS_CONDICION = [CONTEXTO, 'Rol de usuario', 'URL', 'Datos externos', 'Curso', 'Programación'];
export const LOGICAS = ['Cualquier condición coincide', 'Todas las condiciones coinciden'];
export const ACCIONES = {
  BUSCAR: 'Buscar en conocimientos',
  MENSAJE: 'Mensaje personalizado',
  BOTON: 'Botón',
};
export const TIPOS_ACCION = Object.values(ACCIONES);
export const LIMITES = { explicacion: 1000, directrices_busqueda: 10000, estilo_respuesta: 10000 };
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
const bool = (v) => v === true;
const lista = (v) => (Array.isArray(v) ? v : []);
const ejemplos = (v) => lista(v).map((e) => ({ mensaje: str(e?.mensaje), explicacion: str(e?.explicacion) }));

// Returns the flow with every field in a fixed order and only the fields its types use.
export function normalizeFlow(flow) {
  const f = flow ?? {};
  const c = f.condiciones ?? {};
  const out = {
    nombre: str(f.nombre),
    descripcion: str(f.descripcion),
    categoria: str(f.categoria),
    activador: str(f.activador),
    condiciones: { logica: str(c.logica), lista: lista(c.lista).map(normalizeCondicion) },
    respuesta: lista(f.respuesta).map(normalizeAccion),
  };
  if (str(f.notas).trim()) out.notas = f.notas;
  return out;
}

function normalizeCondicion(cond) {
  const c = cond ?? {};
  if (c.tipo === CONTEXTO) {
    return { tipo: CONTEXTO, contexto: str(c.contexto), coincidentes: ejemplos(c.coincidentes), no_coincidentes: ejemplos(c.no_coincidentes) };
  }
  return { tipo: str(c.tipo), valor: str(c.valor) };
}

function normalizeAccion(accion) {
  const a = accion ?? {};
  switch (a.tipo) {
    case ACCIONES.BUSCAR:
      return {
        tipo: a.tipo,
        escalar_no_resueltas: bool(a.escalar_no_resueltas),
        crear_mejoras: bool(a.crear_mejoras),
        directrices_busqueda: str(a.directrices_busqueda),
        estilo_respuesta: str(a.estilo_respuesta),
        anular_estilo: bool(a.anular_estilo),
      };
    case ACCIONES.MENSAJE:
      return {
        tipo: a.tipo,
        instruir_ia: bool(a.instruir_ia),
        seguir_instrucciones_globales: bool(a.seguir_instrucciones_globales),
        instruccion: str(a.instruccion),
      };
    case ACCIONES.BOTON:
      return { tipo: a.tipo, nombre: str(a.nombre), tipo_boton: str(a.tipo_boton), url: str(a.url), mostrar_icono: bool(a.mostrar_icono) };
    default:
      return { tipo: str(a.tipo), valor: str(a.valor) };
  }
}

// Returns a list of problems in plain Spanish; an empty list means the flow is valid.
export function validateFlow(f) {
  if (!f || typeof f !== 'object' || Array.isArray(f)) return ['El archivo tiene que ser un objeto JSON.'];
  const errores = [];
  const texto = (v) => typeof v === 'string' && v.trim() !== '';
  const esBool = (v) => typeof v === 'boolean';
  const opcional = (v) => v === undefined || typeof v === 'string';
  const need = (ok, msg) => { if (!ok) errores.push(msg); };
  const limite = (v, max, donde) => need(typeof v !== 'string' || v.length <= max, `${donde}: supera los ${max} caracteres.`);

  need(texto(f.nombre), 'Falta el nombre del flow.');
  need(texto(f.descripcion), 'Falta la descripción corta.');
  need(opcional(f.categoria), 'La categoría tiene que ser texto.');
  need(opcional(f.notas), 'Las notas tienen que ser texto.');
  need(texto(f.activador), 'Falta el activador.');

  const c = f.condiciones;
  if (!c || typeof c !== 'object' || Array.isArray(c)) {
    errores.push('Falta la sección de condiciones.');
  } else {
    need(LOGICAS.includes(c.logica), `Lógica de condiciones: tiene que ser "${LOGICAS.join('" o "')}".`);
    if (!Array.isArray(c.lista)) errores.push('Las condiciones tienen que ser una lista.');
    else c.lista.forEach((cond, i) => {
      const donde = `Condición ${i + 1}`;
      if (!cond || typeof cond !== 'object') return errores.push(`${donde}: formato inválido.`);
      if (!TIPOS_CONDICION.includes(cond.tipo)) return errores.push(`${donde}: tipo desconocido "${cond.tipo}".`);
      if (cond.tipo !== CONTEXTO) return need(texto(cond.valor), `${donde}: falta la configuración.`);
      need(texto(cond.contexto), `${donde}: falta el contexto de la conversación.`);
      for (const [clave, nombre] of [['coincidentes', 'coincidente'], ['no_coincidentes', 'no coincidente']]) {
        if (!Array.isArray(cond[clave])) { errores.push(`${donde}: los ejemplos ${nombre}s tienen que ser una lista.`); continue; }
        cond[clave].forEach((e, j) => {
          const ej = `${donde}, ejemplo ${nombre} ${j + 1}`;
          need(texto(e?.mensaje), `${ej}: falta el mensaje del usuario.`);
          need(opcional(e?.explicacion), `${ej}: la explicación tiene que ser texto.`);
          limite(e?.explicacion, LIMITES.explicacion, ej);
        });
      }
    });
  }

  if (!Array.isArray(f.respuesta) || f.respuesta.length === 0) {
    errores.push('Agregá al menos una acción en Respuesta.');
  } else f.respuesta.forEach((a, i) => {
    const donde = `Acción ${i + 1}`;
    if (!a || typeof a !== 'object') return errores.push(`${donde}: formato inválido.`);
    if (!texto(a.tipo)) return errores.push(`${donde}: falta el tipo de acción.`);
    switch (a.tipo) {
      case ACCIONES.BUSCAR:
        for (const k of ['escalar_no_resueltas', 'crear_mejoras', 'anular_estilo']) need(esBool(a[k]), `${donde}: "${k}" tiene que ser true o false.`);
        need(typeof a.directrices_busqueda === 'string', `${donde}: faltan las directrices de búsqueda.`);
        need(typeof a.estilo_respuesta === 'string', `${donde}: falta el estilo de respuesta.`);
        limite(a.directrices_busqueda, LIMITES.directrices_busqueda, `${donde}, directrices de búsqueda`);
        limite(a.estilo_respuesta, LIMITES.estilo_respuesta, `${donde}, estilo de respuesta`);
        break;
      case ACCIONES.MENSAJE:
        for (const k of ['instruir_ia', 'seguir_instrucciones_globales']) need(esBool(a[k]), `${donde}: "${k}" tiene que ser true o false.`);
        need(texto(a.instruccion), `${donde}: falta la instrucción.`);
        break;
      case ACCIONES.BOTON:
        need(texto(a.nombre), `${donde}: falta el nombre del botón.`);
        need(texto(a.tipo_boton), `${donde}: falta el tipo de botón.`);
        need(typeof a.url === 'string', `${donde}: la URL tiene que ser texto (puede quedar vacía).`);
        need(esBool(a.mostrar_icono), `${donde}: "mostrar_icono" tiene que ser true o false.`);
        break;
      default:
        need(texto(a.valor), `${donde}: falta la configuración.`);
    }
  });

  return errores;
}

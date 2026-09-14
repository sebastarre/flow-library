// LearnWise flow building blocks, as they appear in the LearnWise UI (Tutor Assistant → Flujos).
// Files store the Spanish labels as values; `en` is what English flows show instead.
//
// Field kinds that hold data: text, textarea, rich, code, toggle, check, select, radio, number,
// list (strings), pairs ({ nombre, valor }), datetime ({ fecha, hora, zona }), examples.
// Display-only kinds: heading, info. `showIf(item)` hides a field unless it returns true.

export const IDIOMAS = { en: 'English', es: 'Español' };
export const CATEGORIAS = ['Chat', 'Tutor', 'AI Ops'];
export const LIMITES = { explicacion: 1000, largo: 10000 };

const tx = (es, en) => ({ es, en });
export const t = (texto, lang) => (texto == null || typeof texto === 'string' ? texto ?? '' : texto[lang] ?? texto.es ?? '');

export const LOGICAS = ['Cualquier condición coincide', 'Todas las condiciones coinciden'];
const LOGICAS_EN = ['Any condition matches', 'All conditions match'];

/* ---------- 1. Activador ---------- */

export const ACTIVADOR_MENSAJE = 'El usuario envía un mensaje';

export const ACTIVADORES = [
  { tipo: ACTIVADOR_MENSAJE, en: 'User sends a message', fields: [] },
  { tipo: 'Al cargar la página', en: 'On page load', fields: [] },
  {
    tipo: 'Tiempo en la página', en: 'Time on page', fields: [
      { key: 'minutos', kind: 'number', label: tx('Minutos', 'Minutes'), suffix: 'm', min: 0, default: 0 },
      { key: 'segundos', kind: 'number', label: tx('Segundos', 'Seconds'), suffix: 's', min: 0, max: 59, default: 0 },
    ],
  },
  { tipo: 'Se abre el chat', en: 'Chat opens', fields: [] },
];

/* ---------- 2. Condiciones ---------- */

export const CONTEXTO = 'Contexto de la conversación';

export const CONDICIONES = [
  {
    tipo: CONTEXTO, en: 'Conversation context', fields: [
      { key: 'contexto', kind: 'textarea', required: true, label: tx('Contexto de la conversación', 'Conversation context'), placeholder: tx('Cuándo aplica: qué dice o quiere el usuario, y qué no.', 'When it applies: what the user says or wants, and what not.') },
      { key: 'coincidentes', kind: 'examples', match: true },
      { key: 'no_coincidentes', kind: 'examples' },
    ],
  },
  {
    tipo: 'Rol de usuario', en: 'User role', fields: [
      { key: 'roles', kind: 'list', required: true, label: tx('Rol(es) de usuario', 'User role(s)'), item: tx('Rol', 'Role') },
    ],
  },
  {
    tipo: 'URL', en: 'URL', fields: [
      { key: 'operador', kind: 'select', free: true, default: 'Coincide', options: [{ value: 'Coincide', en: 'Matches' }], label: tx('Operador', 'Operator') },
      {
        key: 'url', kind: 'text', required: true, label: tx('URL', 'URL'), placeholder: 'https://site.com/courses',
        help: tx(
          'Se activa solo cuando la URL completa coincide exactamente, incluido https:// y cualquier parámetro ?query; por ejemplo, https://site.com/courses no coincide con https://site.com/courses/psychology.',
          'Only triggers when the full URL matches exactly, including https:// and any ?query parameter; for example, https://site.com/courses does not match https://site.com/courses/psychology.'),
      },
    ],
  },
  {
    tipo: 'Datos externos', en: 'External data', fields: [
      { key: 'valor', kind: 'textarea', label: tx('Configuración', 'Configuration') },
    ],
  },
  {
    tipo: 'Curso', en: 'Course', fields: [
      { key: 'campo', kind: 'select', free: true, default: 'Nombre', options: [{ value: 'Nombre', en: 'Name' }], label: tx('Campo', 'Field') },
      { key: 'operador', kind: 'select', free: true, default: 'Es igual a', options: [{ value: 'Es igual a', en: 'Equals' }], label: tx('Operador', 'Operator') },
      { key: 'cursos', kind: 'list', required: true, label: tx('Cursos', 'Courses'), item: tx('Curso', 'Course') },
    ],
  },
  {
    tipo: 'Programación', en: 'Schedule', fields: [
      { key: 'inicio', kind: 'datetime', required: true, label: tx('Fecha y hora de inicio', 'Start date and time') },
      { key: 'fin', kind: 'datetime', label: tx('Fecha y hora de fin', 'End date and time') },
    ],
  },
];

/* ---------- 3. Respuesta ---------- */

const informa = (a) => a.informar_usuario === true;

// Same order as "Agregar una acción" in LearnWise.
export const ACCIONES = [
  {
    tipo: 'Mensaje personalizado', en: 'Custom message', icono: 'message',
    boton: tx(['Mensaje', 'Enviar una respuesta de texto personalizada'], ['Message', 'Send a custom text response']),
    fields: [
      { key: 'instruir_ia', kind: 'toggle', label: tx('Instruir a la IA para generar mensaje', 'Instruct the AI to generate the message'), help: tx('Si está desactivado, el mensaje aparecerá tal cual.', 'If off, the message appears exactly as written.') },
      { key: 'seguir_instrucciones_globales', kind: 'toggle', default: true, showIf: (a) => a.instruir_ia === true, label: tx('También seguir las instrucciones globales de respuesta', 'Also follow the global response instructions') },
      { key: 'instruccion', kind: 'rich', required: true, label: tx('Mensaje', 'Message'), placeholder: tx('Agregar mensaje personalizado aquí…', 'Add custom message here…') },
    ],
  },
  {
    tipo: 'Botón', en: 'Button', icono: 'external',
    boton: tx(['Botón', 'Mostrar un botón o enlace clicable'], ['Button', 'Show a clickable button or link']),
    titulo: (a, lang) => (lang === 'en' ? VALORES_EN[a.tipo_boton] ?? a.tipo_boton : a.tipo_boton) || t(tx('Botón', 'Button'), lang),
    fields: [
      { key: 'nombre', kind: 'text', required: true, label: tx('Nombre del botón', 'Button name'), placeholder: 'Contact support' },
      { key: 'tipo_boton', kind: 'select', free: true, default: 'Enlace externo', options: [{ value: 'Enlace externo', en: 'External link' }], label: tx('Tipo de botón', 'Button type') },
      { key: 'url', kind: 'text', emptyWarn: true, label: tx('URL', 'URL'), placeholder: 'https://ejemplo.com' },
      { key: 'mostrar_icono', kind: 'toggle', label: tx('Mostrar icono', 'Show icon') },
      { key: 'icono', kind: 'text', showIf: (a) => a.mostrar_icono === true, label: tx('Icono', 'Icon'), placeholder: tx('Nombre del icono en LearnWise', 'Icon name in LearnWise') },
    ],
  },
  {
    tipo: 'Buscar en conocimientos', en: 'Search knowledge', icono: 'search',
    boton: tx(['Buscar en conocimientos', 'Consultar su base de conocimientos'], ['Search knowledge', 'Query your knowledge base']),
    subtitulo: tx('Buscar en la base de conocimientos para una respuesta', 'Search the knowledge base for an answer'),
    fields: [
      {
        key: 'escalar_no_resueltas', kind: 'toggle',
        label: tx('Solicitar al usuario escalar para consultas no resueltas', 'Ask the user to escalate unresolved queries'),
        help: tx("Cuando el asistente de IA no sabe la respuesta a una pregunta, presentará el botón de escalamiento 'contactar soporte' al usuario.", "When the AI assistant doesn't know the answer to a question, it will show the user the 'contact support' escalation button."),
      },
      {
        key: 'crear_mejoras', kind: 'toggle',
        label: tx('Crear elementos de mejora de conocimientos para consultas no resueltas', 'Create knowledge improvement items for unresolved queries'),
        help: tx('Cuando el asistente de IA no sabe la respuesta a una pregunta, agregará automáticamente un nuevo elemento a su lista de tareas de mejora de conocimientos.', "When the AI assistant doesn't know the answer to a question, it will automatically add a new item to your knowledge improvement task list."),
      },
      { kind: 'heading', text: tx('Configuración avanzada', 'Advanced settings') },
      { key: 'directrices_busqueda', kind: 'textarea', rows: 4, limit: LIMITES.largo, label: tx('Directrices de búsqueda', 'Search guidelines') },
      { key: 'estilo_respuesta', kind: 'rich', rows: 12, limit: LIMITES.largo, label: tx('Estilo de respuesta', 'Response style') },
      { key: 'anular_estilo', kind: 'check', label: tx('Anular estilo de respuesta', 'Override response style'), help: tx('Si no está marcado, sus instrucciones se agregarán a las instrucciones globales.', 'If unchecked, your instructions will be added to the global instructions.') },
    ],
  },
  {
    tipo: 'Seguimientos', en: 'Follow-ups', icono: 'question',
    boton: tx(['Seguimientos', 'Sugerir preguntas de seguimiento'], ['Follow-ups', 'Suggest follow-up questions']),
    titulo: tx('Pregunta(s) de seguimiento', 'Follow-up question(s)'),
    fields: [
      { key: 'modo', kind: 'select', default: 'Generado por IA', options: [{ value: 'Generado por IA', en: 'AI generated' }, { value: 'Manual', en: 'Manual' }], label: tx('Modo', 'Mode') },
      {
        kind: 'info', showIf: (a) => a.modo === 'Generado por IA',
        text: tx(
          'Usa la conversación para generar preguntas de seguimiento relevantes automáticamente. Si no hay búsqueda en conocimientos ni un mensaje anterior del asistente, las preguntas se generan a partir del historial previo de la conversación: puede que no aparezcan al inicio de una conversación.',
          "Uses the conversation to generate relevant follow-up questions automatically. If there is no knowledge search or earlier assistant message, the questions come from the previous conversation history: they may not appear at the start of a conversation."),
      },
      { key: 'preguntas', kind: 'list', required: true, showIf: (a) => a.modo === 'Manual', label: tx('Preguntas de seguimiento', 'Follow-up questions'), item: tx('Pregunta', 'Question') },
    ],
  },
  {
    tipo: 'Iframe', en: 'Iframe', icono: 'frame',
    boton: tx(['Iframe', 'Incrustar contenido externo en línea'], ['Iframe', 'Embed external content inline']),
    fields: [
      { key: 'titulo', kind: 'text', label: tx('Título', 'Title'), placeholder: tx('Título del iframe personalizado', 'Custom iframe title') },
      { key: 'enlace', kind: 'text', required: true, prefix: 'https://', label: tx('Enlace', 'Link'), placeholder: 'ejemplo.com' },
      { key: 'ventana_emergente', kind: 'check', default: true, label: tx('Opción de abrir en ventana emergente si es posible', 'Option to open in a pop-up window if possible') },
      { key: 'altura', kind: 'number', default: 30, min: 1, suffix: 'vh', label: tx('Altura del iframe', 'Iframe height'), help: tx('El predeterminado es 30 vh', 'The default is 30 vh') },
      { kind: 'info', text: tx('No todos los sitios soportan iframes.', 'Not all sites support iframes.') },
    ],
  },
  {
    tipo: 'Solicitud API', en: 'API request', icono: 'api',
    boton: tx(['Solicitud API', 'Llamar a un endpoint API externo'], ['API request', 'Call an external API endpoint']),
    titulo: (a, lang) => `${lang === 'en' ? 'API request' : 'Solicitud API'} ${a.metodo ?? ''}`.trim(),
    subtitulo: tx('Realizar acciones en sistemas externos a través de API.', 'Take actions in external systems through an API.'),
    fields: [
      { kind: 'info', text: tx('Se pueden usar variables de plantilla en los campos, por ejemplo {{user.name}} o {{session.id}}.', 'Template variables can be used in the fields, for example {{user.name}} or {{session.id}}.') },
      { key: 'metodo', kind: 'select', required: true, default: 'POST', options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => ({ value: m, en: m })), label: tx('Método del endpoint API', 'API endpoint method') },
      { key: 'url', kind: 'text', required: true, label: tx('URL del endpoint API', 'API endpoint URL'), help: tx('La URL donde se enviarán los datos del formulario', 'The URL the form data is sent to'), placeholder: tx('Ingrese URL', 'Enter URL') },
      {
        key: 'autenticacion', kind: 'select', free: true, required: true, default: 'No Authentication', options: [{ value: 'No Authentication', en: 'No Authentication' }],
        label: tx('Tipo de autenticación', 'Authentication type'),
        help: tx('Poné solo el tipo. Nunca escribas claves, tokens ni contraseñas: la librería es pública.', 'Only the type. Never write keys, tokens or passwords here: the library is public.'),
      },
      { key: 'encabezados', kind: 'pairs', label: tx('Encabezados (opcional)', 'Headers (optional)'), add: tx('Agregar encabezado', 'Add header'), cols: [tx('Nombre', 'Name'), tx('Valor', 'Value')] },
      { key: 'parametros', kind: 'pairs', label: tx('Parámetros de consulta (opcional)', 'Query parameters (optional)'), add: tx('Agregar parámetro de consulta', 'Add query parameter'), cols: [tx('Nombre', 'Name'), tx('Valor', 'Value')] },
      {
        key: 'mapeo_json', kind: 'pairs', label: tx('Mapeo de ruta JSON', 'JSON path mapping'), add: tx('Agregar ruta JSON', 'Add JSON path'), cols: [tx('Nombre', 'Name'), tx('Ruta JSON', 'JSON path')],
        help: tx('Use una ruta JSON para extraer un valor específico de la respuesta. Deje en blanco para usar la respuesta completa.', 'Use a JSON path to extract a specific value from the response. Leave blank to use the full response.'),
      },
      { key: 'cuerpo_json', kind: 'code', default: '{}', label: tx('Contenido JSON de la solicitud', 'Request JSON body') },
      { key: 'informar_usuario', kind: 'toggle', default: true, label: tx('Informar al usuario del resultado', 'Inform the user of the result'), help: tx('Si está habilitado, configurará los mensajes en el chat para éxito y error de la API.', 'If on, you set the chat messages for API success and error.') },
      { key: 'mensaje_espera', kind: 'textarea', rows: 2, showIf: informa, label: tx('Mostrar mientras la API trabaja', 'Show while the API is working'), help: tx('Use {{variables}} para insertar valores dinámicos.', 'Use {{variables}} to insert dynamic values.'), placeholder: tx('ej. "Procesando su solicitud"', 'e.g. "Processing your request"') },
      { kind: 'heading', showIf: informa, text: tx('En caso de éxito', 'On success') },
      { key: 'exito_instruir_ia', kind: 'toggle', showIf: informa, label: tx('Instruir a la IA para generar mensajes', 'Instruct the AI to generate messages') },
      { key: 'mensaje_exito', kind: 'rich', required: true, showIf: informa, label: tx('Mensaje de éxito', 'Success message'), placeholder: tx('ej. "Su solicitud se procesó correctamente"', 'e.g. "Your request was processed successfully"') },
      { kind: 'heading', showIf: informa, text: tx('En caso de error', 'On error') },
      { key: 'error_instruir_ia', kind: 'toggle', showIf: informa, label: tx('Instruir a la IA para generar mensajes', 'Instruct the AI to generate messages') },
      { key: 'mensaje_error', kind: 'rich', required: true, showIf: informa, label: tx('Mensaje de error', 'Error message'), placeholder: tx('ej. "Su solicitud no se procesó correctamente"', 'e.g. "Your request was not processed successfully"') },
    ],
  },
  {
    tipo: 'Enviar correo electrónico', en: 'Send email', icono: 'at',
    boton: tx(['Enviar correo electrónico', 'Enviar correo electrónico'], ['Send email', 'Send an email']),
    subtitulo: tx('Envía una notificación por correo electrónico al destinatario configurado cuando se activa.', 'Sends an email notification to the configured recipient when triggered.'),
    fields: [
      { key: 'para', kind: 'text', required: true, label: tx('Enviar a', 'Send to'), placeholder: 'ejemplo@email.com', help: tx('Separe múltiples correos electrónicos con una coma. La librería es pública: usá direcciones genéricas o de ejemplo.', 'Separate multiple emails with a comma. The library is public: use generic or example addresses.') },
      { key: 'asunto', kind: 'text', required: true, label: tx('Asunto', 'Subject'), placeholder: tx('Asunto del correo electrónico', 'Email subject') },
      { key: 'cuerpo', kind: 'rich', required: true, label: tx('Cuerpo', 'Body'), help: tx('Puede usar alias de datos externos (ej. {{user.name}}).', 'You can use external data aliases (e.g. {{user.name}}).'), placeholder: tx('Escriba el cuerpo de su correo electrónico aquí…', 'Write the body of your email here…') },
      { key: 'responder_a', kind: 'radio', default: 'Correo electrónico específico', options: [{ value: 'Correo electrónico específico', en: 'Specific email' }, { value: 'Participante de la conversación', en: 'Conversation participant' }], label: tx('Responder a', 'Reply to') },
      { key: 'responder_a_correo', kind: 'text', showIf: (a) => a.responder_a === 'Correo electrónico específico', label: tx('Correo para responder', 'Reply-to email'), placeholder: 'ejemplo@email.com' },
    ],
  },
  {
    tipo: 'Mejora', en: 'Improvement', icono: 'trend',
    boton: tx(['Mejora', 'Marcar para seguimiento de revisión'], ['Improvement', 'Flag for review follow-up']),
    titulo: tx('Tarea de mejora', 'Improvement task'),
    subtitulo: tx('Este flujo de trabajo creará una tarea en Mejoras.', 'This workflow will create a task in Improvements.'),
    fields: [],
  },
  {
    tipo: 'Transferencia', en: 'Transfer', icono: 'transfer', beta: true,
    boton: tx(['Transferencia', 'Transferir a otro asistente'], ['Transfer', 'Transfer to another assistant']),
    titulo: tx('Transferencia a otro asistente', 'Transfer to another assistant'),
    subtitulo: tx('Continúa la conversación en otro asistente cuando se activa.', 'Continues the conversation in another assistant when triggered.'),
    fields: [
      { key: 'asistente', kind: 'text', required: true, label: tx('Asistente', 'Assistant'), placeholder: tx('Nombre del asistente', 'Assistant name') },
    ],
  },
  {
    tipo: 'Modo de estudio', en: 'Study mode', icono: 'cap',
    boton: tx(['Modo de estudio', 'Ingresar al cuestionario de autoevaluación'], ['Study mode', 'Enter the self-assessment quiz']),
    subtitulo: tx('Ingresar al cuestionario de autoevaluación del modo de estudio.', 'Enter the study mode self-assessment quiz.'),
    fields: [
      { key: 'texto_sin_formato', kind: 'toggle', default: true, label: tx('Preguntas de texto sin formato', 'Plain text questions'), help: tx('Preguntas y respuestas clásicas en el hilo del chat, sin widgets.', 'Classic questions and answers in the chat thread, without widgets.') },
      { key: 'ejercicios_h5p', kind: 'toggle', label: tx('Ejercicios interactivos H5P', 'Interactive H5P exercises'), help: tx('Combina widgets H5P interactivos (arrastrar palabras, tarjetas didácticas, opción múltiple) en las preguntas del modo de estudio.', 'Mixes interactive H5P widgets (drag the words, flashcards, multiple choice) into the study mode questions.') },
      {
        key: 'instrucciones', kind: 'textarea', rows: 4, limit: LIMITES.largo, label: tx('Instrucciones personalizadas', 'Custom instructions'),
        help: tx('Instrucciones que definen cómo funciona el modo de estudio cuando se inicia desde este flujo.', 'Instructions that define how study mode works when started from this flow.'),
        placeholder: tx('Ejemplo: "Haz siempre una sola pregunta a la vez y termina con una pregunta abierta."', 'Example: "Always ask one question at a time and finish with an open question."'),
      },
    ],
  },
  {
    tipo: 'Iniciar H5P interactivo', en: 'Start interactive H5P', icono: 'puzzle',
    boton: tx(['Iniciar H5P interactivo', 'Cuestionarios, tarjetas de memoria, arrastrar palabras y más'], ['Start interactive H5P', 'Quizzes, flashcards, drag the words and more']),
    subtitulo: tx('Lanzar un ejercicio de aprendizaje interactivo — cuestionarios, tarjetas de memoria, arrastrar palabras y más.', 'Launch an interactive learning exercise — quizzes, flashcards, drag the words and more.'),
    fields: [
      { key: 'modo', kind: 'select', free: true, default: 'Automático (predeterminado)', options: [{ value: 'Automático (predeterminado)', en: 'Automatic (default)' }], label: tx('Modo', 'Mode'), help: tx('Decide el interactivo correcto basándose en el contexto.', 'Picks the right interactive based on the context.') },
    ],
  },
];

/* ---------- Translations of stored values ---------- */

export const VALORES_EN = {};
LOGICAS.forEach((l, i) => { VALORES_EN[l] = LOGICAS_EN[i]; });
for (const spec of [...ACTIVADORES, ...CONDICIONES, ...ACCIONES]) {
  VALORES_EN[spec.tipo] = spec.en;
  for (const f of spec.fields) for (const o of f.options ?? []) VALORES_EN[o.value] ??= o.en;
}
const VALORES_ES = Object.fromEntries(Object.entries(VALORES_EN).map(([es, en]) => [en, es]));

export const mostrar = (lang, v) => (lang === 'en' ? VALORES_EN[v] ?? v : v);
export const guardar = (lang, v) => (lang === 'en' ? VALORES_ES[v] ?? v : v);

export const visibleFields = (spec, item) => spec.fields.filter((f) => !f.showIf || f.showIf(item));

export function tituloItem(spec, item, lang) {
  if (typeof spec.titulo === 'function') return spec.titulo(item, lang);
  return t(spec.titulo, lang) || mostrar(lang, spec.tipo);
}

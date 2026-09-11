# Human Help Needed

Ruta: Tutor Assistant → Flujos → Human Help Needed (Integrado)

## 1. Activador

El usuario envía un mensaje

## 2. Condiciones

**Lógica de condiciones:** Cualquier condición coincide

### Condición 1 — Contexto de la conversación

User explicitly asks for human help, wants to contact support, escalate to a person, or otherwise indicates wanting to speak with a human agent rather than the AI assistant.

**Ejemplos coincidentes:**

| Mensaje del usuario | Explicación |
|---|---|
| "I need to talk to a real person" | Direct request to speak with a human rather than the AI |
| "Can I escalate this to support?" | Explicit request for escalation to human support |
| "I want to contact support" | Direct request to contact human support |
| "This isn't working, I need actual help" | Frustrated user explicitly asking for better assistance |
| "Transfer me to an agent" | Clear request to be transferred to a human agent |

**Ejemplos no coincidentes:**

| Mensaje del usuario | Explicación |
|---|---|
| "Can you help me with my homework?" | General request for help with a topic, not asking for human assistance |
| "I need help finding my transcript" | Request for help with a specific task, not asking for human assistance |
| "How do I contact the admissions office?" | Question about how to contact an office, not a request for immediate human help |

## 3. Respuesta

### Acción 1 — Mensaje personalizado

- **Instruir a la IA para generar mensaje:** activado
- **También seguir las instrucciones globales de respuesta:** sí
- **Instrucción:** "Sure! Click the button below to contact support."

### Acción 2 — Botón

- **Nombre del botón:** Contact Support
- **Tipo de botón:** Enlace externo
- **URL:** sin configurar. Poner la URL de soporte de cada institución; sin ella el botón no lleva a ningún lado.
- **Mostrar ícono:** desactivado

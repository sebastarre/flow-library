# Flows Extracted from LearnWise - CX University

## Extraction Status

**Date:** 2026-09-17  
**Source:** admin.learnwise.ai/CX University  
**Total Asistentes:** ~15+  
**Flows Extracted:** 7  
**Estimated Total:** 90+  

## Extracted Flows (by Assistant)

### Chat Assistant: LMS Flows (Spanish) - `XRZWIJfGLLDE`
**Category:** Chat  
**Language:** Spanish  
**Flows:**
- ✅ `bienestar-estudiante-crisis.json` - Bienestar del Estudiante - Crisis o Angustia Grave
  - Trigger: User message
  - Conditions: 3 conversation contexts (self-harm thoughts, severe depression, crisis)
  - Actions: Custom message, Button (contact wellness), Email notification
  - **Status:** COMPLETE

- ✅ `soporte-it-hardware-software.json` - Soporte de IT - Hardware, Software y Conectividad
  - Trigger: User message
  - Conditions: 3 contexts (network issues, authentication problems, hardware/software issues)
  - Actions: Button (contact IT support)
  - **Status:** COMPLETE

- ✅ `extensiones-trabajos-solicitud.json` - Extensiones de Trabajos - Solicitud o Elegibilidad
  - Trigger: User message
  - Conditions: 2 contexts (explicit extension request, extenuating circumstances)
  - Actions: API request (to register extension request)
  - **Status:** COMPLETE (API URL needs configuration)

- ✅ `mensaje-proactivo-estudiantes.json` - Mensaje proactivo: involucrando a los estudiantes
  - Trigger: Page load
  - Conditions: URL contains "/courses"
  - Actions: Notification
  - **Status:** COMPLETE (Content fields need to be filled in)

---

### Standard/Existing Flows (Already in Repo)
- ✅ `human-help-needed.json` - Human Help Needed (Built-in)
- ✅ `guided-problem-solving.json` - Guided Problem Solving (Tutor)
- ✅ `work-review-student-submission-feedback.json` - Work Review (Tutor)

---

## Pending Asistentes

### High Priority (Tutor Flows)
- **Tutor Assisstany Flows (Spanish)** - `o2paPcpm7r_Q`
  - Flows: 9 total (7 custom)
    - Tutoría Socrática - Resolución Guiada de Problemas
    - Ejemplo Resuelto - Demostración Modelada y Desafío para el Estudiante
    - Análisis de Errores - Encuentra y Corrige los Errores
    - Revisión de Trabajo - Retroalimentación sobre la Entrega del Estudiante
    - Soporte Humano Solicitado
    - Información del Asistente
    - Escenario de Juego de Rol/Simulación

### Other Asistentes
- Giota's Test Assistant - `t_p8XQHJLd4w`
- Lumi tutor Test - `b7BThyCF9gJs`
- M Tutor - `nFfN9ysbtcoM`
- Giota's AI Ops - `kFaD04ns7Cg0`
- Pietro Testing - `cWGjgFW2htQA`
- Canvas installation test - `c41zLsHqo9rc`
- Brendan's assistant - `NSJh-m0sJ6Kg`
- AI Ops Assistant - `Nq8uIcwuUWOI`
- Brendan's IT Help Center Assistant - `a1mIz_l2V99g`
- Brendan's Canvas [learnwise.test] - `fJ58eJjtO_14`
- Brendan's Moodle Test - `7X2_QpNeCf5U`
- Brendan's Bb Test - `5FHsxzLc9i3w`
- Brendan's Canvas [learnwise] - `1wEbTDlqiyRY`
- M Blackboard integration - `d3HfHdWYr1s`
- Feedback - `452lRqRAAc2`

---

## Schema Reference

Each flow JSON follows this structure:
```json
{
  "nombre": "string",
  "idioma": "es" | "en",
  "categoria": "Chat" | "Tutor" | "AI Ops",
  "descripcion": "string",
  "activadores": [{"tipo": "string"}],
  "condiciones": {
    "logica": "Cualquier condición coincide" | "Todas las condiciones coinciden",
    "lista": [
      {
        "tipo": "string",
        "contexto": "string",  // if tipo is "Contexto de la conversación"
        "coincidentes": [{"mensaje": "string", "explicacion": "string"}],
        "no_coincidentes": [{"mensaje": "string", "explicacion": "string"}]
      }
    ]
  },
  "respuesta": [
    {
      "tipo": "Mensaje personalizado" | "Botón" | "Solicitud API" | "Notificación" | ...,
      // type-specific fields follow
    }
  ],
  "notas": "string"
}
```

---

## Next Steps

1. **Extract Tutor Assisstany Flows** - The most comprehensive tutor-based flows (7 custom)
2. **Extract AI Ops Flows** - From Giota's AI Ops assistant
3. **Extract Test Assistants** - Quick sampling from test/sandbox assistants
4. **Fill in Missing Details** - Add titles, content, and API endpoints for flows that need configuration
5. **Validate All JSONs** - Run through `assets/validate.js` to ensure schema compliance

---

## Automation Notes

For faster extraction of remaining flows, consider:
- Use LearnWise API if available for bulk export
- Script browser automation to extract flow JSON payloads from inspector/network requests
- Focus on custom flows; built-in flows (Human Help Needed, Assistant Information, etc.) are already standardized


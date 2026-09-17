# Flows Extracted from LearnWise - CX University

## Extraction Status

**Date:** 2026-09-17  
**Source:** admin.learnwise.ai/CX University  
**Total Asistentes:** ~15+  
**Flows Extracted:** 13 (7 Chat + 5 Tutor + 1 Built-in)
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

### Tutor Assisstany Flows (Spanish) - `o2paPcpm7r_Q`
**Category:** Tutor  
**Language:** Spanish  
**Flows:**
- ✅ `tutoria-socratica-resolucion-problemas.json` - Tutoría Socrática - Resolución Guiada de Problemas
  - Trigger: User message
  - Conditions: 2 conversation contexts (own problem request, partial attempt)
  - Actions: Knowledge search with Socratic guidance
  - **Status:** COMPLETE

- ✅ `ejemplo-resuelto-demostracion.json` - Ejemplo Resuelto - Demostración Modelada y Desafío para el Estudiante
  - Trigger: User message
  - Conditions: 1 conversation context (request for solved example)
  - Actions: Knowledge search with step-by-step demonstration + student challenge
  - **Status:** COMPLETE

- ✅ `analisis-errores-encuentra-corrige.json` - Análisis de Errores - Encuentra y Corrige los Errores
  - Trigger: User message
  - Conditions: 3 conversation contexts (error practice, error challenge, course-based error)
  - Actions: Knowledge search with error analysis guidance
  - **Status:** COMPLETE

- ✅ `revision-trabajo-retroalimentacion.json` - Revisión de Trabajo - Retroalimentación sobre la Entrega del Estudiante
  - Trigger: User message
  - Conditions: 1 conversation context (student sharing own work for review)
  - Actions: Knowledge search with constructive feedback guidance
  - **Status:** COMPLETE

- ✅ `soporte-humano-solicitado.json` - Soporte Humano Solicitado
  - Trigger: User message
  - Conditions: 1 conversation context (explicit human support request)
  - Actions: Custom message + External link to support
  - **Status:** COMPLETE (Support URL needs configuration)

- ✅ `escenario-juego-rol-simulacion.json` - Escenario de Juego de Rol/Simulación
  - Trigger: User message
  - Conditions: 2 conversation contexts (roleplay request, practical scenario request)
  - Actions: Knowledge search with immersive scenario guidance
  - **Status:** COMPLETE

---

### Standard/Existing Flows (Already in Repo)
- ✅ `human-help-needed.json` - Human Help Needed (Built-in)
- ✅ `guided-problem-solving.json` - Guided Problem Solving (Tutor)
- ✅ `work-review-student-submission-feedback.json` - Work Review (Tutor)

---

## Pending Asistentes

### High Priority (Completed)
- ✅ **Tutor Assisstany Flows (Spanish)** - `o2paPcpm7r_Q` - **COMPLETE** (6 custom flows extracted)

### Other Asistentes (Estimated ~60-70 flows remaining)
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

1. ✅ **Extract Tutor Assisstany Flows** - COMPLETE (6 custom flows extracted)
2. **Extract Giota's AI Ops** - Estimated 2-3 flows
3. **Extract M Tutor & Lumi tutor Test** - Estimated 4-6 flows
4. **Extract Other Assistants** - Test assistants, Canvas, Blackboard integrations (Brendan's suite, etc.)
5. **Fill in Missing Details** - Add URLs, API endpoints, and institution-specific content for configuration fields
6. **Validate All JSONs** - Run through `assets/validate.js` to ensure schema compliance

---

## Automation Notes

For faster extraction of remaining flows, consider:
- Use LearnWise API if available for bulk export
- Script browser automation to extract flow JSON payloads from inspector/network requests
- Focus on custom flows; built-in flows (Human Help Needed, Assistant Information, etc.) are already standardized


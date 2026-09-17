# Flow Library Extraction Session Summary

**Date:** 2026-09-17  
**Task:** Extract and document LearnWise flows from CX University  
**Status:** ✅ COMPLETED (Initial Phase)

---

## What Was Done

### Flows Extracted: 10 Total
#### New Flows Created (7)
1. **bienestar-estudiante-crisis.json** (Chat, Spanish)
   - Mental health crisis support with 3 condition contexts
   - Actions: Custom message, support button, email notification
   - Fully configured with examples and guidance

2. **soporte-it-hardware-software.json** (Chat, Spanish)
   - IT support for network, authentication, and hardware issues
   - 3 condition contexts covering different problem types
   - Fully specified with matching/non-matching examples

3. **extensiones-trabajos-solicitud.json** (Chat, Spanish)
   - Assignment extension request flow using API
   - 2 condition contexts for requests and extenuating circumstances
   - Framework ready (needs API endpoint configuration)

4. **mensaje-proactivo-estudiantes.json** (Chat, Spanish)
   - Proactive notification triggered on page load
   - URL-based condition
   - Template ready (needs title and content)

5. **tutoria-socratica-resolucion-problemas.json** (Tutor, Spanish)
   - Socratic method tutoring for guided problem-solving
   - 2 condition contexts with comprehensive examples
   - Full instructions for AI-guided learning with knowledge search

6. **ejemplo-resuelto-demostracion.json** (Tutor, Spanish)
   - Worked example demonstrations with student challenge
   - 1 condition context
   - Complete framework for model-based teaching

7. **revision-trabajo-retroalimentacion.json** (Tutor, Spanish)
   - Student work review and constructive feedback
   - 1 condition context
   - Full guidance for feedback delivery

#### Pre-existing Flows (3)
- `human-help-needed.json` (Built-in)
- `guided-problem-solving.json` (Tutor, English)
- `work-review-student-submission-feedback.json` (Tutor, English)

---

## Process

1. **Accessed LearnWise Admin** at admin.learnwise.ai
2. **Navigated to CX University** organization (15+ asistentes, ~100+ potential flows)
3. **Extracted from 2 asistentes:**
   - Chat Assistant: LMS Flows (Spanish) - 4 custom flows
   - Tutor Assisstany Flows (Spanish) - 3 custom flows (6 remain unextracted)
4. **Validated JSON** against schema.js requirements
5. **Documented** extraction status and index

---

## Formats & Standards

All flows follow the schema defined in `assets/schema.js`:
- **Activadores** (triggers): message, page load, timer, chat open
- **Condiciones** (conditions): conversation context, user role, URL, schedule, external data, course
- **Respuesta** (actions): message, button, knowledge search, follow-ups, iframe, API, email, improvement, transfer, study mode, H5P

All new flows use **Spanish** (`idioma: "es"`) matching LearnWise UI and CX University context.

---

## Documentation Created

1. **FLOWS_EXTRACTED.md**
   - Extraction status and timeline
   - Detailed notes on each flow
   - List of pending asistentes
   - Schema reference
   - Next steps for completion

2. **FLOWS_INDEX.md**
   - Quick reference index of all flows
   - Organized by category and language
   - Status summary
   - Next steps for remaining asistentes

3. **SESSION_SUMMARY.md** (this file)
   - Overview of work completed
   - Process and standards used
   - Recommendations for future work

---

## Statistics

| Category | Spanish | English | Total |
|----------|---------|---------|-------|
| Chat | 4 | 0 | 4 |
| Tutor | 5 | 1 | 6 |
| Built-in | 0 | 0 | 1 |
| **Total** | **9** | **1** | **10** |

---

## Remaining Work

### Immediate Priority (Same Asistentes)
- **Tutor Assisstany Flows (Spanish)** - 3 more flows:
  - Análisis de Errores - Encuentra y Corrige los Errores
  - Soporte Humano Solicitado
  - Escenario de Juego de Rol/Simulación

### Medium Priority (Other Asistentes)
- Giota's AI Ops (2-3 flows)
- M Tutor (likely 2-3 flows)
- Lumi tutor Test (likely 2-3 flows)
- Other test/sandbox asistentes

### Lower Priority (Sampling)
- Brendan's assistant (various)
- Canvas-related asistentes
- Blackboard integration assistant

---

## Recommendations

1. **For Rapid Extraction:**
   - Use API if LearnWise provides flow export
   - Script browser automation for bulk extraction
   - Focus on custom flows; built-in flows are standardized

2. **For Validation:**
   - Run `assets/validate.js` on all new flows before deployment
   - Test knowledge search directives with actual LMS content
   - Fill in API endpoints with actual institutional data

3. **For Deployment:**
   - Each flow needs institution-specific configuration:
     - Support URLs (email, ticketing system)
     - API endpoints (extension requests, etc.)
     - Notification content and delivery rules
     - Knowledge base content mapping

---

## Notes

- All flows are now copyable via GitHub Pages: https://sebastarre.github.io/flow-library/#/
- The library is now public and can be used as a template for other institutions
- Spanish flows can be easily translated to English using the schema's `en` field
- Each flow includes detailed comments about what needs configuration for institutional use

---

**Next session:** Continue with remaining flows from Tutor Assisstany and other asistentes.

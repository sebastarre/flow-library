# Flow Library Index

## Quick Reference

This file lists all flows currently in the repository, organized by category and language.

### By Category

#### Chat Flows (Spanish)
- `bienestar-estudiante-crisis.json` - Bienestar del Estudiante - Crisis o Angustia Grave
  - From: Chat Assistant: LMS Flows (Spanish)
  - Triggers: User message | Conditions: 3 conversation contexts | Actions: Message, Button, Email
  - **Status:** Complete

- `soporte-it-hardware-software.json` - Soporte de IT - Hardware, Software y Conectividad
  - From: Chat Assistant: LMS Flows (Spanish)
  - Triggers: User message | Conditions: 3 contexts | Actions: Button (support link)
  - **Status:** Complete

- `extensiones-trabajos-solicitud.json` - Extensiones de Trabajos - Solicitud o Elegibilidad
  - From: Chat Assistant: LMS Flows (Spanish)
  - Triggers: User message | Conditions: 2 contexts | Actions: API request
  - **Status:** Complete (API URL needs configuration)

- `mensaje-proactivo-estudiantes.json` - Mensaje proactivo: involucrando a los estudiantes
  - From: Chat Assistant: LMS Flows (Spanish)
  - Triggers: Page load | Conditions: URL | Actions: Notification
  - **Status:** Complete (Content fields need to be filled)

#### Tutor Flows (Spanish)
- `guided-problem-solving.json` - Guided Problem Solving
  - From: Standard/Example
  - Triggers: User message | Conditions: 2 contexts | Actions: Knowledge search
  - **Status:** Complete

- `tutoria-socratica-resolucion-problemas.json` - Tutoría Socrática - Resolución Guiada de Problemas
  - From: Tutor Assisstany Flows (Spanish)
  - Triggers: User message | Conditions: 2 contexts | Actions: Knowledge search
  - **Status:** Complete

- `ejemplo-resuelto-demostracion.json` - Ejemplo Resuelto - Demostración Modelada y Desafío
  - From: Tutor Assisstany Flows (Spanish)
  - Triggers: User message | Conditions: 1 context | Actions: Knowledge search
  - **Status:** Complete

- `revision-trabajo-retroalimentacion.json` - Revisión de Trabajo - Retroalimentación sobre la Entrega
  - From: Tutor Assisstany Flows (Spanish)
  - Triggers: User message | Conditions: 1 context | Actions: Knowledge search
  - **Status:** Complete

- `work-review-student-submission-feedback.json` - Work Review (English)
  - From: Standard/Example
  - Triggers: User message | Conditions: 1 context | Actions: Knowledge search
  - **Status:** Complete

#### Built-in/Standard Flows
- `human-help-needed.json` - Human Help Needed
  - **Status:** Built-in, complete

---

## Total: 10 flows

- Chat: 4 (Spanish)
- Tutor: 5 (Spanish) + 1 (English)
- Built-in: 1

---

## Next Steps

Still need to extract flows from:
- Tutor Assisstany Flows: Análisis de Errores, Soporte Humano Solicitado, Escenario de Juego de Rol
- Other asistentes: Giota's AI Ops, M Tutor, Lumi Tutor Test, test assistants, etc.

For bulk extraction, see FLOWS_EXTRACTED.md for workflow notes.

# Adding and improving flows

## Improve a flow
Open the flow file on GitHub → pencil icon → edit → "Commit changes". Write one line saying what you changed.

The file and LearnWise are separate: make the same change in LearnWise (or, if you changed LearnWise first, update the file) so both stay the same.

## Add a flow
1. Create `flows/<short-name>.md` (lowercase, hyphens, e.g. `deadline-extension.md`) using the template below.
2. Add a row to the table in README.md with the flow's raw URL:
   `https://raw.githubusercontent.com/sebastarre/flow-library/main/flows/<short-name>.md`

## Template

Copy this and replace everything in `<...>`. Leave out Acción 2 if the flow has no button.

```
# <Flow name>

Ruta: Tutor Assistant → Flujos → <Flow name>

## 1. Activador

El usuario envía un mensaje

## 2. Condiciones

**Lógica de condiciones:** Cualquier condición coincide

### Condición 1 — Contexto de la conversación

<One or two sentences: what the user says or wants when this flow should run.>

**Ejemplos coincidentes:**

| Mensaje del usuario | Explicación |
|---|---|
| "<message>" | <why it matches> |

**Ejemplos no coincidentes:**

| Mensaje del usuario | Explicación |
|---|---|
| "<message>" | <why it does not match> |

## 3. Respuesta

### Acción 1 — Mensaje personalizado

- **Instruir a la IA para generar mensaje:** <activado / desactivado>
- **También seguir las instrucciones globales de respuesta:** <sí / no>
- **Instrucción:** "<what the assistant should say or do>"

### Acción 2 — Botón

- **Nombre del botón:** <label>
- **Tipo de botón:** Enlace externo
- **URL:** <link>
- **Mostrar ícono:** <activado / desactivado>
```

## Options that exist in LearnWise

Only use these. If a flow needs something that isn't listed, write it in plain words and check in LearnWise that it exists before relying on it. Add it here once confirmed.

| Setting | Known options |
|---|---|
| Activador | El usuario envía un mensaje |
| Lógica de condiciones | Cualquier condición coincide |
| Condition types | Contexto de la conversación, Rol de usuario, URL, Datos externos, Curso, Programación |
| Action types | Mensaje personalizado, Botón |
| Tipo de botón | Enlace externo |

## Writing good conditions
- Describe the context in one or two sentences, including what it is *not* when that's easy to confuse.
- At least 5 matching examples, varied: direct requests, indirect ones, frustrated ones.
- At least 3 non-matching examples that are close calls: they use similar words but want something else ("How do I contact the admissions office?" is not a request to talk to a human now). These show the AI where the line is.
- Every example gets a short explanation of why it matches or not.
- A new flow's matching examples should not also match another flow's conditions.

## Keep it public-safe
This repo is public. No client names, internal URLs, or personal data. Use placeholders such as `https://support.example.edu`.

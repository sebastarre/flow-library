# Librería de flows

Flows de LearnWise listos para copiar. Cualquiera con el link puede verlos y copiarlos:

**https://sebastarre.github.io/flow-library/**

## Copiar un flow

1. Abrí la librería y elegí un flow. Podés filtrar por idioma (English / Español) y categoría (Chat, Tutor, AI Ops), o buscar por nombre, contexto o mensaje de ejemplo. Los flows en inglés se muestran con toda la página en inglés.
2. En LearnWise, andá a Tutor Assistant → Flujos y creá un flujo nuevo.
3. Cada campo del flow tiene su botón **Copiar**. Copiá y pegá campo por campo, en el mismo orden: Activador, Condiciones y Respuesta.

Cada flow tiene su propio link (botón **Copiar link**) para mandarlo directo. **Copiar todo** copia el flow entero como texto.

## Agregar un flow

1. En la librería, tocá **Agregar flow**.
2. Elegí el idioma y la categoría, y completá el formulario con los mismos campos que tiene el flujo en LearnWise. Lo que vas cargando queda guardado en tu navegador.
3. Cuando no falte nada, tocá **Copiar y abrir GitHub para publicar**.
4. En GitHub, pegá el texto si el editor aparece vacío y tocá **Commit changes**.
5. En 1 o 2 minutos el flow aparece en la librería.

Para guardar hace falta una cuenta de GitHub con permiso en este repositorio. Sin permiso, GitHub ofrece **Propose changes** y el dueño lo aprueba.

## Editar un flow

Abrí el flow, tocá **Editar**, cambiá lo que haga falta y tocá **Copiar y abrir GitHub para guardar**. En GitHub, seleccioná todo el texto, pegá encima y tocá **Commit changes**.

Cambiar un flow acá **no** cambia LearnWise, y cambiarlo en LearnWise no cambia la librería. Cuando cambies uno, cambiá el otro igual.

## Qué hay en el repositorio

| Carpeta / archivo | Qué es |
|---|---|
| `flows/` | Un archivo `.json` por flow. Es lo único que cambia al agregar o editar flows. |
| `index.html`, `assets/` | La página de la librería. |
| `scripts/` | Revisa los flows y arma la página. |
| `.github/workflows/pages.yml` | Publica la página cada vez que cambia algo en `main`. |

Si un flow tiene un error, la publicación falla y la librería sigue mostrando la versión anterior. El error aparece en la pestaña **Actions** del repositorio.

Para verla en tu computadora: `node scripts/serve.mjs` y abrí http://localhost:4173.

## Es público

Todo lo que se sube acá lo puede ver cualquiera. No subas nombres de clientes, URLs internas ni datos personales.

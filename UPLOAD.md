# Subida de imágenes a Cloudflare R2

## Cómo funciona el flujo, de punta a punta

1. Un elemento `image` en el JSON puede nacer con `props.src: null, props.status: "empty"`
   (así es como un agente de IA debe dejarlo si el usuario no adjuntó una foto — ver
   `AI_CONTRACT.md`).
2. `render.js` detecta ese estado y en vez de una `<img>` dibuja un placeholder clickeable
   (`.canvas-image-placeholder`).
3. Al tocarlo (o al tocar "Reemplazar imagen…" desde el inspector), se emite el evento
   `image:request-upload` con el `elementId`. `upload.js` lo escucha y abre el modal.
4. El usuario suelta un archivo o lo elige con el file picker. `upload.js` hace
   `POST` a `UPLOAD_ENDPOINT` (por defecto `/api/upload`) con un `FormData` que lleva el
   archivo en el campo `file`.
5. `functions/api/upload.js` (Cloudflare Pages Function) recibe el archivo, valida tipo/tamaño,
   y lo guarda en el bucket con `env.BUCKET.put(key, file.stream(), {...})`.
6. Devuelve `{ "url": "..." }`. `upload.js` escribe esa URL en `props.src` del elemento
   (`status: "ready"`) y el canvas se re-renderiza con la imagen real.

## Qué necesitás desplegar vos (esto no lo puedo hacer yo por vos)

Este paquete incluye el código de las Functions listo para copiar, pero desplegar en tu
cuenta de Cloudflare es un paso manual que no puedo ejecutar desde acá.

1. Los archivos `functions/api/upload.js` y `functions/api/image/[key].js` deben vivir en la
   raíz de un proyecto de Cloudflare Pages (junto a `index.html`, etc.) — Pages detecta
   automáticamente cualquier archivo bajo `functions/` y lo sirve como endpoint. Si preferís
   un Worker en vez de Pages, movés el cuerpo de `onRequestPost`/`onRequestGet` a tu
   `export default { fetch(request, env) {...} }` y resolvés las rutas vos con un router.
2. Confirmá el binding: dijiste que ya lo hiciste, pero para que quede documentado —
   Cloudflare Dashboard → tu proyecto Pages → Settings → Functions → R2 bucket bindings
   → Variable name: `BUCKET` → tu bucket real.
3. (Opcional pero recomendado) Conectá un dominio público al bucket (R2.dev subdomain o
   un dominio propio) y seteá la variable de entorno `PUBLIC_R2_URL` (Settings → Environment
   variables) con esa base, ej. `https://assets.99copias.com`. Si no lo hacés, las imágenes
   se sirven igual vía `functions/api/image/[key].js`, solo que pasan por tu Function en cada
   request en vez de ir directo al CDN de R2.
4. Si `index.html` termina sirviéndose en un dominio distinto al de las Functions, seteá
   `window.UPLOAD_ENDPOINT` en el HTML antes de cargar `upload.js` con la URL absoluta, y
   ajustá `Access-Control-Allow-Origin` en `functions/api/upload.js` (ahora mismo es `*`,
   conviene algo más restrictivo antes de ir a producción).

## Límites actuales (v1)

- 8MB por archivo, solo `image/*` — validado tanto en el cliente (`upload.js`) como en el
  servidor (`functions/api/upload.js`); nunca confiar solo en la validación del cliente.
- Sin auth: cualquiera que tenga la URL del endpoint puede subir un archivo. Para una versión
  pública/comunitaria hace falta como mínimo un token o Cloudflare Access delante de
  `/api/upload` antes de abrirlo a internet.
- Sin resize/optimización server-side. Si hace falta, es un buen lugar para meter
  Cloudflare Image Resizing antes del `.put()`.

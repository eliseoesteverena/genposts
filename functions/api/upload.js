// Cloudflare Pages Function — se sirve automáticamente en /api/upload
// si este archivo vive en functions/api/upload.js dentro de un proyecto
// de Cloudflare Pages con el binding R2 'BUCKET' ya configurado
// (Settings → Functions → R2 bucket bindings → variable name = BUCKET).
//
// Si en cambio es un Worker "clásico" (no Pages), el mismo cuerpo de
// onRequestPost va dentro de tu export default { async fetch(request, env) {...} }.

export async function onRequestPost(context) {
  const { request, env } = context;

  // --- CORS: ajustar allow-origin al dominio real donde vive index.html ---
  const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return json({ error: 'Falta el campo "file".' }, 400, CORS_HEADERS);
    }
    if (!file.type || !file.type.startsWith('image/')) {
      return json({ error: 'El archivo debe ser una imagen.' }, 400, CORS_HEADERS);
    }
    const MAX_BYTES = 8 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      return json({ error: 'Máximo 8MB.' }, 400, CORS_HEADERS);
    }

    const ext = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
    const key = `uploads/${crypto.randomUUID()}.${ext}`;

    await env.BUCKET.put(key, file.stream(), {
      httpMetadata: { contentType: file.type }
    });

    // Si el bucket tiene un dominio público (R2.dev o custom domain) conectado,
    // arma la URL final ahí. Si no, servila vía una ruta GET propia (ver abajo).
    const PUBLIC_BASE = env.PUBLIC_R2_URL || null; // ej. 'https://assets.99copias.com'
    const url = PUBLIC_BASE ? `${PUBLIC_BASE}/${key}` : `/api/image/${encodeURIComponent(key)}`;

    return json({ url, key }, 200, CORS_HEADERS);
  } catch (err) {
    return json({ error: String(err && err.message || err) }, 500, CORS_HEADERS);
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

function json(body, status, headers) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...(headers || {}) }
  });
}

// GET /api/image/:key — sirve un objeto de R2 directo, para el caso en que el
// bucket BUCKET no tenga un dominio público (r2.dev o custom domain) conectado.
// Si sí lo tenés, seteá PUBLIC_R2_URL (ver functions/api/upload.js) y esta ruta
// no hace falta: la URL guardada en el JSON ya apunta directo al bucket.

export async function onRequestGet(context) {
  const { params, env } = context;
  const key = decodeURIComponent(params.key);

  const obj = await env.BUCKET.get(key);
  if (!obj) {
    return new Response('No encontrado', { status: 404 });
  }

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set('etag', obj.httpEtag);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  headers.set('Access-Control-Allow-Origin', '*');

  return new Response(obj.body, { headers });
}

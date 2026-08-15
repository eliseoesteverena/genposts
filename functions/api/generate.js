// Cloudflare Pages Function — POST /api/generate
// Proxy server-side a Gemini: la API key nunca viaja al cliente.
// Requiere la variable de entorno GEMINI_API_KEY (Settings -> Environment variables).
// El nombre del modelo es configurable via GEMINI_MODEL (default abajo) porque estos
// nombres cambian con el tiempo y no queremos tener que editar codigo para actualizarlo.

// Import relativo cruzando fuera de functions/ hasta la raiz del proyecto:
// se apoya en que el bundler de Cloudflare Pages Functions (esbuild) resuelve
// imports relativos normales, no solo dentro de functions/. Si el deploy
// fallara por esto, la alternativa es duplicar validate.js dentro de
// functions/ - pero esa duplicacion es exactamente lo que causo el bug del
// icono "check" (dos validadores que se desincronizaron), asi que vale la
// pena confirmar que este import funcione antes de resignarse a duplicar.
import { validateDesignDocument, validateComponentElements, validateBrandTokens } from '../../validate.js';

const DEFAULT_MODEL = 'gemini-3.1-flash-lite';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

const SYSTEM_PROMPTS = {
  brand: 'Sos un asistente de identidad de marca. Devolves SOLO un objeto JSON con tokens de diseno DTCG parciales, nunca texto fuera del JSON.\n' +
    'Reglas:\n' +
    '- Claves permitidas: color.primitive.{paper,white,ink,yellow}, fontFamily.{serif,sans}, dimension.radius.{sm,md,lg,xl,full}, dimension.stroke-width.{hairline,bold}, dimension.shadow-offset.{sm,md,lg}.\n' +
    '- NUNCA incluyas la clave "semantic" bajo ningun motivo.\n' +
    '- Los valores de dimension son numeros en px, sin unidad (8, no "8px").\n' +
    '- fontFamily es un stack CSS completo con fallback generico al final.\n' +
    '- Si el pedido no menciona algo, no lo incluyas (respuesta parcial valida).\n' +
    '- Si hay imagenes de referencia adjuntas, la paleta de la imagen tiene prioridad sobre el texto.',

  component: 'Sos un generador de componentes de diseno reusables para un editor tipo Canva. Devolves SOLO un array JSON de elementos (rect/text/icon/image), nunca un objeto contenedor, nunca texto fuera del JSON.\n' +
    'Reglas:\n' +
    '- Coordenadas relativas a (0,0): el grupo empieza cerca del origen, no del centro de ningun lienzo.\n' +
    '- 3 a 6 elementos. Cada elemento: id (kebab-case unico), name, type (rect|text|icon|image), x, y, width, height, zIndex, props.\n' +
    '- rect.props requiere fill. text.props requiere text,fontFamily,fontSize,color. icon.props requiere name (sparkle|doc|pin|arrow-right|check|x|plus|star|heart) y color. image.props requiere src (null si no hay imagen) y fit.\n' +
    '- Usa referencias a tokens semanticos del design system dado (formato "{color.semantic.text}"), nunca valores crudos si existe un token aplicable.\n' +
    '- No generes flex ni contenedores anidados: todo es plano y absoluto.',

  post: 'Sos un generador de posts de Instagram para un editor tipo Canva, guiado por un contrato JSON estricto. Devolves SOLO un objeto JSON {meta, elements}, nunca texto fuera del JSON.\n' +
    'Reglas:\n' +
    '- meta: {format: "square"|"portrait"|"story", width, height, background}. width siempre 1080. height: square=1080, portrait=1350, story=1920.\n' +
    '- elements: array plano de rect/text/icon/image en position absoluto (x,y en px desde el borde del lienzo). Sin flex, sin contenedores anidados, sin auto-centrado: si algo debe quedar centrado, calculalo vos (x = (ancho_lienzo - ancho_elemento)/2).\n' +
    '- Cada elemento: id (kebab-case unico), name, type, x, y, width, height, zIndex (mayor=mas arriba), props segun tipo (ver reglas de "component" arriba).\n' +
    '- Usa SIEMPRE que exista un token semantico aplicable del design system dado, en vez de valores crudos.\n' +
    '- Si el usuario no adjunto una imagen concreta para un elemento image, dejalo con src:null, status:"empty" - nunca inventes una URL.\n' +
    '- Genera una composicion con densidad real (15-30 elementos si el contenido lo amerita) - no generes un unico bloque de texto centrado salvo que el pedido sea literalmente eso.\n' +
    '- highlightWords en un texto: maximo 2-3 palabras, para la palabra clave a resaltar.\n' +
    '- Si el contexto incluye "anchoredElements": esos elementos YA EXISTEN en el lienzo con posiciones fijas (fueron ubicados de antemano, no por vos). NO los repitas, NO les cambies x/y/width/height. Generá el resto de la composicion (fondo, titulo, acentos, texto adicional) alrededor de ellos, respetando esas posiciones como ocupadas - dejales el espacio libre correspondiente. Incluilos igual en tu array "elements" de salida, tal cual vinieron.',

  remix: 'Sos un generador de posts de Instagram. Se te da un documento JSON existente como PLANTILLA y un pedido de contenido nuevo. Devolves SOLO el documento JSON completo {meta, elements} con el layout de la plantilla preservado y el contenido reemplazado.\n' +
    'Reglas:\n' +
    '- Mantene la cantidad de elementos, sus tipos, x/y/width/height y zIndex identicos a la plantilla salvo que el contenido nuevo requiera ajustar el tamano de un bloque de texto.\n' +
    '- Reemplaza unicamente texto (props.text), imagenes (props.src, dejar null si no hay reemplazo) y datos de contenido.\n' +
    '- No toques props.fill, colores, tipografias ni tokens - esos vienen de la marca y ya estan bien en la plantilla.\n' +
    '- Si el contenido nuevo es mucho mas largo/corto, podes ajustar fontSize o width como ultimo recurso.',

  'edit-element': 'Sos un editor de un unico elemento de diseno (rect/text/icon/image). Se te da el elemento actual en JSON y una instruccion en lenguaje natural. Devolves SOLO el objeto "props" actualizado de ese elemento, nunca el elemento completo, nunca texto fuera del JSON.\n' +
    'Reglas:\n' +
    '- Solo modifica lo que la instruccion pide explicita o implicitamente.\n' +
    '- Si la instruccion es de contenido, editas props.text.\n' +
    '- Si es de estilo y existe un token semantico aplicable, usalo en vez de un valor crudo.\n' +
    '- No agregues claves que no existian en el objeto props original salvo que sea estrictamente necesario.'
};

export async function onRequestPost(context) {
  const request = context.request;
  const env = context.env;

  if (!env.GEMINI_API_KEY) {
    return json({ error: 'Falta configurar GEMINI_API_KEY en las variables de entorno del proyecto.' }, 500);
  }

  let body;
  try { body = await request.json(); }
  catch (e) { return json({ error: 'Body invalido, se esperaba JSON.' }, 400); }

  const kind = body.kind;
  const prompt = body.prompt;
  const ctx = body.context;
  const images = body.images;

  const systemPrompt = SYSTEM_PROMPTS[kind];
  if (!systemPrompt) {
    return json({ error: 'kind invalido: "' + kind + '". Valores validos: ' + Object.keys(SYSTEM_PROMPTS).join(', ') }, 400);
  }
  if (!prompt || typeof prompt !== 'string') {
    return json({ error: 'Falta "prompt" (string) en el body.' }, 400);
  }

  const basePrompt = systemPrompt + '\n\n--- CONTEXTO ---\n' + JSON.stringify(ctx || {}) + '\n\n--- PEDIDO DEL USUARIO ---\n' + prompt;
  const imageParts = [];
  if (Array.isArray(images)) {
    images.forEach(function(img){
      if (img && img.mimeType && img.data) imageParts.push({ inlineData: { mimeType: img.mimeType, data: img.data } });
    });
  }

  const MAX_ATTEMPTS = 2; // 1 intento + 1 reintento con correccion, no mas: cada llamada cuesta tiempo/dinero.
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let promptText = basePrompt;
    if (attempt > 1) {
      promptText += '\n\n--- TU RESPUESTA ANTERIOR FALLO ---\n' +
        'Devolviste: ' + JSON.stringify(lastError.raw).slice(0, 800) + '\n' +
        'Error: ' + lastError.message + '\n' +
        'Corregi el problema y devolve SOLO el JSON correcto, nada de texto adicional.';
    }
    const parts = [{ text: promptText }].concat(imageParts);

    let attemptResult;
    try {
      attemptResult = await callGeminiOnce(env, parts, kind);
    } catch (err) {
      // Error de red/HTTP con Gemini: no tiene sentido reintentar con "correccion",
      // el problema no es la respuesta - devolvemos el error directo.
      return json({ error: err.message }, 502);
    }

    if (attemptResult.ok) {
      return json({ result: attemptResult.parsed }, 200);
    }
    lastError = attemptResult; // { message, raw }
  }

  return json({
    error: 'La respuesta de Gemini no cumple el formato esperado despues de ' + MAX_ATTEMPTS + ' intentos.',
    details: lastError.message,
    raw: lastError.raw
  }, 502);
}

/** Una llamada a Gemini + parseo + validacion. Nunca lanza por JSON invalido -
 *  eso se devuelve como { ok:false } para que el caller decida si reintentar;
 *  solo lanza ante errores reales de red/HTTP con la API. */
async function callGeminiOnce(env, parts, kind) {
  const model = env.GEMINI_MODEL || DEFAULT_MODEL;
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent';

  let geminiRes;
  try {
    geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: parts }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.8 }
      })
    });
  } catch (err) {
    throw new Error('No se pudo contactar a Gemini: ' + err.message);
  }

  if (!geminiRes.ok) {
    let detail = '';
    try { detail = JSON.stringify(await geminiRes.json()); } catch (e) {}
    throw new Error('Gemini respondio ' + geminiRes.status + ': ' + detail);
  }

  const geminiData = await geminiRes.json();
  const candidate = geminiData && geminiData.candidates && geminiData.candidates[0];
  const textOut = candidate && candidate.content && candidate.content.parts && candidate.content.parts[0] && candidate.content.parts[0].text;

  if (!textOut) {
    throw new Error('Gemini no devolvio contenido utilizable.');
  }

  let parsed;
  try { parsed = JSON.parse(textOut); }
  catch (e) { return { ok: false, message: 'JSON invalido: ' + e.message, raw: textOut }; }

  const validation = validateByKind(kind, parsed);
  if (!validation.valid) {
    return { ok: false, message: 'No cumple el formato: ' + validation.errors.join('; '), raw: parsed };
  }

  return { ok: true, parsed: parsed };
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

function json(body, status) {
  const headers = { 'Content-Type': 'application/json' };
  for (const k in CORS_HEADERS) headers[k] = CORS_HEADERS[k];
  return new Response(JSON.stringify(body), { status: status, headers: headers });
}

function validateByKind(kind, data) {
  if (kind === 'brand') {
    return validateBrandTokens(data);
  }
  if (kind === 'component') {
    return validateComponentElements(data);
  }
  if (kind === 'post' || kind === 'remix') {
    return validateDesignDocument(data);
  }
  if (kind === 'edit-element') {
    // props sueltas de un elemento: no tiene "type" propio para validar
    // contra REQUIRED_BY_TYPE sin mas contexto, se mantiene una validacion
    // minima aca (es el unico caso donde no reusamos validate.js entero).
    const errors = (typeof data !== 'object' || data === null) ? ['debe ser un objeto de props'] : [];
    return { valid: errors.length === 0, errors: errors };
  }
  return { valid: false, errors: ['kind desconocido: ' + kind] };
}

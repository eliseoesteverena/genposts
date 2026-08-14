// Cloudflare Pages Function — captura TODO bajo /api/auth/* (sign-up, sign-in,
// sign-out, get-session, etc. - BetterAuth expone su propio ruteo interno).
//
// Requiere, en Settings del proyecto de Cloudflare Pages:
//  - D1 database binding con variable name "DB" (Settings -> Functions -> D1)
//  - Environment variable BETTER_AUTH_SECRET (string random, 32+ caracteres)
//  - Environment variable BETTER_AUTH_URL (la URL publica del sitio, ej.
//    https://tu-proyecto.pages.dev)
//
// Ver AUTH.md para el detalle de setup paso a paso.

import { betterAuth } from 'better-auth';
import { Kysely } from 'kysely';
import { D1Dialect } from 'kysely-d1';

// IMPORTANTE: la instancia de BetterAuth se crea DE NUEVO en cada request,
// nunca como singleton a nivel de modulo. Reusar una sola instancia entre
// requests en el runtime de Workers puede dejar la conexion a D1 en un
// estado invalido (issue conocido de la comunidad, no es capricho nuestro).
function getAuth(env) {
  return betterAuth({
    database: {
      db: new Kysely({ dialect: new D1Dialect({ database: env.DB }) }),
      type: 'sqlite'
    },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false
    },
    socialProviders: {}
  });
}

export async function onRequest(context) {
  const env = context.env;

  if (!env.DB) {
    return errorResponse('Falta el binding D1 "DB". Ver AUTH.md.', 500);
  }
  if (!env.BETTER_AUTH_SECRET) {
    return errorResponse('Falta la variable de entorno BETTER_AUTH_SECRET. Ver AUTH.md.', 500);
  }

  const auth = getAuth(env);
  try {
    return await auth.handler(context.request);
  } catch (err) {
    return errorResponse('Error interno de auth: ' + err.message, 500);
  }
}

function errorResponse(message, status) {
  return new Response(JSON.stringify({ error: message }), {
    status: status,
    headers: { 'Content-Type': 'application/json' }
  });
}

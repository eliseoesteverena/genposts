# Autenticación — BetterAuth (email + contraseña)

## Qué se implementó

- `functions/api/auth/[[route]].js` — instancia BetterAuth sobre D1 (vía Kysely),
  re-creada en cada request (ver comentario en el archivo — no es opcional).
- `schema-auth.sql` — las 4 tablas core de BetterAuth (`user`, `session`, `account`,
  `verification`).
- `auth-client.js` — cliente sin bundler: llama directo a los endpoints REST de
  BetterAuth con `fetch`. No usamos el paquete cliente oficial de npm porque
  este proyecto no tiene paso de build; el cliente oficial es, de todos modos,
  solo un wrapper delgado sobre estos mismos endpoints.
- `screen-auth.js` — pantalla de login/registro + estado del usuario en el sidebar.
- **Alcance de esta entrega**: la autenticación es real y funcional (crear cuenta,
  iniciar sesión, cerrar sesión, sesión persistente por cookie), pero **no gatea
  el resto de la app todavía** — los datos (marcas, tokens, posts) siguen viviendo
  en `localStorage`, no atados a la cuenta. Eso es una pieza aparte que no
  estaba en el pedido original.

## Qué falta que hagas vos (no lo puedo hacer desde acá)

1. **Crear la base D1** y bindearla como `DB`:
   Dashboard de Cloudflare → tu proyecto Pages → Settings → Functions →
   D1 database bindings → Variable name: `DB` → tu base (o creá una nueva ahí mismo).
2. **Aplicar el schema**:
   ```
   wrangler d1 execute <NOMBRE_DE_TU_DB> --file=schema-auth.sql --remote
   ```
3. **Variables de entorno** (Settings → Environment variables):
   - `BETTER_AUTH_SECRET`: un string random de 32+ caracteres (`openssl rand -hex 32`).
   - `BETTER_AUTH_URL`: la URL pública del sitio (ej. `https://tu-proyecto.pages.dev`).
4. **Instalar las dependencias antes de desplegar** (`package.json` ya las declara):
   ```
   npm install
   ```
   Cloudflare Pages corre esto solo si el deploy es vía Git; si usás `wrangler pages deploy`
   directo, corré `npm install` vos antes.

## Dos advertencias reales, no hipotéticas

- **Reinstanciar por request, no singleton.** Ya está resuelto en el código
  (`getAuth(env)` se llama fresco en cada `onRequest`), pero si alguien
  "optimiza" esto moviendo la instancia a nivel de módulo, va a reintroducir
  fallos intermitentes con la conexión a D1.
- **Bug abierto de sesión que expira a los 5 minutos** (issue #4203 del
  repo de better-auth, reabierto en enero 2026). El fix documentado por la
  comunidad pasa por usar el paquete `better-auth-cloudflare` (agrega cache de
  sesión en KV) en vez de la integración directa con Kysely que hice acá. No
  lo usé de entrada porque agrega una dependencia extra para un problema que
  quizás ya esté resuelto para cuando esto se despliegue.

## Lo que no pude verificar desde este entorno

No tengo acceso a una cuenta de Cloudflare real, a D1, ni a la posibilidad de
instalar `better-auth`/`kysely`/`kysely-d1` (sin red hacia el registro de npm
en este sandbox). Validé sintaxis de todos los archivos y la lógica de
`auth-client.js` por inspección — no pude mockear un server BetterAuth real
para probarlo de punta a punta como sí hice con el proxy de Gemini.

La prueba real de "crear cuenta → cerrar sesión → iniciar sesión de nuevo" la
tenés que hacer vos, en un deploy real, después de los pasos de arriba.

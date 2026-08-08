# AI Contract — cómo un agente genera un diseño

Este documento es para pegarse como contexto/system prompt de un agente de IA (Claude, GPT,
etc.) al que se le pide "diseñá un post que diga tal cosa". El agente debe devolver **un único
JSON válido contra `schema.json`**, y nada más.

## 1. Reglas no negociables

1. Devolvé **solo el JSON**, sin explicación antes o después, sin backticks de markdown.
2. El documento tiene exactamente dos claves de primer nivel obligatorias: `meta` y `elements`
   (más `tokens`, opcional, casi nunca necesaria — ver §4).
3. **No hay layout automático.** No existe flexbox, grid, ni centrado automático. Cada elemento
   de `elements` lleva su propia posición absoluta `x`/`y` en píxeles dentro del lienzo
   (`meta.width` × `meta.height`). Si un texto debe quedar centrado, el agente calcula el `x`
   a mano: `x = (meta.width - width) / 2`.
4. Todo elemento es individual y plano. No hay contenedores ni anidamiento: una "tarjeta con
   precio" no es un elemento — son 4 o 5 elementos independientes (`rect` de fondo + `text` de
   label + `text` de precio + `icon`), cada uno con su propio `x`/`y`/`zIndex`.
5. `zIndex` define el orden de apilado (mayor = más arriba). No importa el orden dentro del
   array `elements`.
6. Todo `id` es único, estable, y en `kebab-case` descriptivo (`price-card-bw`, no `el3`).
7. Usá **tokens siempre que exista uno aplicable** en vez de valores crudos — ver §3. Un valor
   crudo (`"#f5d949"`) es aceptable solo si de verdad no hay token semántico razonable.

## 2. Los 4 tipos de elemento

| type | para qué | props obligatorias |
|---|---|---|
| `rect` | fondos, tarjetas, botones, marcos | `fill` |
| `text` | cualquier texto | `text`, `fontFamily`, `fontSize`, `color` |
| `icon` | íconos del set embebido: `sparkle`, `doc`, `pin`, `arrow-right` | `name`, `color` |
| `image` | fotos/logos subidos por el usuario | `src`, `fit` |

Ver `schema.json` → `definitions` para el detalle completo de cada `props`.

### Reglas específicas de `image`

- Si el usuario **no adjuntó** una imagen concreta para ese elemento, generá el elemento igual
  pero con `props.src: null` y `props.status: "empty"`. La UI va a mostrar un placeholder
  clickeable para que la persona suba la imagen después — no inventes una URL.
- Nunca inventes una URL de imagen que no exista. Si el usuario pidió "poné una foto de la
  fachada del local", eso es un elemento `image` vacío (`src: null`), no un `rect` de relleno.
- `"brand:logo99"` está reservado para el isotipo de la marca 99copias — usalo solo si el
  usuario pide explícitamente el logo de la marca.

### Texto: resaltados

`textProps.highlightWords` es un array de substrings de `text` que se resaltan con el
marcador de marca (subrayado degradé). Usalo para la palabra o frase que el usuario quiera
enfatizar (p.ej. un precio, una palabra clave), nunca más de 2-3 palabras por bloque de texto.

## 3. Tokens: usalos, no inventes valores

Antes de escribir un color, tamaño, radio, sombra o tipografía crudo, revisá si existe un
token semántico en `tokens.json` que aplique (ver `TOKENS.md` para la lista completa y la
convención). Ejemplos de mapeo típico:

| Necesito... | Usá el token |
|---|---|
| Color de texto principal | `{color.semantic.text}` |
| Color de texto secundario/gris | `{color.semantic.text-muted}` |
| Fondo del lienzo | `{color.semantic.surface}` |
| Fondo de una tarjeta blanca | `{color.semantic.surface-card}` |
| Fondo de una tarjeta destacada | `{color.semantic.surface-accent}` |
| Borde/trazo estándar | `{color.semantic.border}` |
| Color de sombra offset | `{color.semantic.shadow}` |
| Radio chico/mediano/grande/pill | `{dimension.radius.sm}` / `.md` / `.lg` / `.full` |
| Grosor de borde | `{dimension.stroke-width.bold}` |
| Offset de sombra | `{dimension.shadow-offset.md}` |
| Tipografía de titular | `{fontFamily.serif}` |
| Tipografía de texto general | `{fontFamily.sans}` |
| Tipografía de datos/urls | `{fontFamily.mono}` |
| Peso de texto destacado | `{fontWeight.semibold}` o `{fontWeight.bold}` |
| El degradé arcoíris de marca (para el CTA) | `{gradient.brand-rainbow}` |

Si necesitás un valor que genuinamente no existe (ej. un color de marca nuevo que el usuario
pidió explícitamente), podés declararlo en `meta.tokens` del propio documento en vez de tocar
`tokens.json` global — mismo formato DTCG, ver `TOKENS.md §4`.

## 4. Formato del lienzo

`meta.format` es uno de `square` (1080×1080), `portrait` (1080×1350), `story` (1080×1920).
`meta.width`/`meta.height` deben coincidir exactamente con ese formato. Si el usuario no
especifica, usá `square`.

## 5. Ejemplo mínimo completo

Pedido: *"Un post cuadrado que diga 'Envío gratis' en grande, centrado, con fondo de marca."*

```json
{
  "meta": { "format": "square", "width": 1080, "height": 1080, "background": "{color.semantic.surface}" },
  "elements": [
    {
      "id": "headline",
      "name": "Titular",
      "type": "text",
      "x": 90, "y": 460, "width": 900, "height": 160,
      "zIndex": 10,
      "props": {
        "text": "Envío gratis",
        "fontFamily": "{fontFamily.serif}",
        "fontSize": 96,
        "fontWeight": "{fontWeight.semibold}",
        "color": "{color.semantic.text}",
        "align": "center",
        "highlightWords": ["gratis"]
      }
    }
  ]
}
```

Nota cómo `x`/`width` se calcularon para centrar el bloque de texto (`(1080-900)/2 = 90`) —
no hay `align-self` ni auto-centrado del lienzo, solo del texto dentro de su propia caja
(`textProps.align`).

## 6. Qué NO hacer

- No agregues claves fuera del schema (`additionalProperties: false` en `meta`).
- No pongas HTML dentro de `text` — es texto plano, `\n` para salto de línea.
- No dejes `zIndex` repetidos si el orden visual importa entre esos elementos (empatan de forma
  indefinida; mejor ser explícito).
- No generes un `rect` gigante como "fondo de sección" si en realidad el fondo del lienzo
  (`meta.background`) ya resuelve eso — usá `rect` solo para formas visibles con su propio
  borde/sombra/radio (tarjetas, botones, placas).

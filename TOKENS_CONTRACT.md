# Tokens Contract — generación de Brand Kit

Este es el contrato que se le da a la IA **solo** para la acción "crear/editar marca". Es
deliberadamente mucho más chico que `AI_CONTRACT.md` (que es para generar posts) porque el
alcance de esta acción es mucho menor: acá la IA nunca toca un layout, nunca genera un
elemento — solo propone una paleta, tipografías y un estilo.

## Regla central: solo primitivos, nunca semánticos

El documento de tokens tiene dos capas (ver `TOKENS.md`): `primitive` (valores crudos) y
`semantic` (alias con intención de uso, ej. `color.semantic.text` → `{color.primitive.ink}`).

**La IA solo puede devolver valores dentro de `*.primitive.*`, `fontFamily.*` y
`dimension.*`. Nunca debe incluir la clave `semantic` en su respuesta, bajo ningún motivo.**

Esto no es una restricción arbitraria: como los tokens semánticos son alias que apuntan a los
primitivos, en cuanto la IA cambia `color.primitive.ink`, todo lo que ya usa
`color.semantic.text` se actualiza solo. Si la IA devolviera semánticos también, correría el
riesgo de pisar una decisión que la persona ya ajustó a mano en el Brand Kit (por ejemplo, si
alguien separó manualmente el color de texto del color de borde, que por defecto comparten el
mismo primitivo).

## Formato de respuesta

Un objeto JSON parcial, con **solo las claves que la IA efectivamente quiere proponer**
(no hace falta que devuelva las 4 categorías si el pedido es, por ejemplo, "cambiame nomás la
tipografía"):

```json
{
  "color": {
    "primitive": {
      "paper": { "$value": "#f4f1ea" },
      "ink":   { "$value": "#1a1a1a" },
      "white": { "$value": "#ffffff" },
      "yellow":{ "$value": "#d4a017" }
    }
  },
  "fontFamily": {
    "serif": { "$value": "'Fraunces', Georgia, serif" },
    "sans":  { "$value": "'Inter', -apple-system, sans-serif" }
  },
  "dimension": {
    "radius":        { "sm": { "$value": 8 }, "md": { "$value": 12 }, "lg": { "$value": 24 }, "xl": { "$value": 32 }, "full": { "$value": 999 } },
    "stroke-width":  { "hairline": { "$value": 1 }, "bold": { "$value": 2 } },
    "shadow-offset": { "sm": { "$value": 2 }, "md": { "$value": 4 }, "lg": { "$value": 8 } }
  }
}
```

Reglas de valores:
- `color.primitive.*`: exactamente 4 claves posibles — `paper` (fondo), `white` (superficie/
  tarjetas — puede no ser blanco puro, es el color de las tarjetas sobre el fondo), `ink`
  (texto/bordes), `yellow` (acento — a pesar del nombre heredado, puede ser cualquier color,
  es el "color de marca" principal). No inventes claves nuevas dentro de `color.primitive`.
- `fontFamily.serif` / `fontFamily.sans`: un stack CSS de fuentes completo, con fallbacks
  genéricos al final (`serif`/`sans-serif`). Preferí fuentes de Google Fonts ampliamente
  disponibles salvo que el usuario pida algo específico.
- `dimension.*`: números en píxeles (no strings, no unidad). Mantené la relación de tamaño
  entre `sm < md < lg < xl` dentro de cada grupo.
- Si el usuario adjuntó imágenes de referencia, extraé la paleta y el tono de ahí antes que de
  la descripción textual — la imagen manda si hay conflicto entre lo escrito y lo mostrado.

## Qué NO hacer

- No devuelvas `semantic` bajo ninguna clave.
- No devuelvas `gradient` salvo que el usuario pida explícitamente un degradé de marca — es
  un elemento de firma visual, no algo que se genera por defecto.
- No devuelvas elementos de diseño, componentes, ni nada fuera de la forma de arriba.
- No uses valores con unidad en `dimension` (`"8px"` es incorrecto, `8` es correcto).

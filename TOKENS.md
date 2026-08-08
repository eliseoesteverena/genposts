# Sistema de tokens de diseño

## Por qué DTCG y no un formato propio

Usamos el **W3C Design Tokens Community Group (DTCG) Format Module — versión 2025.10**
(spec estable desde octubre 2025: https://www.designtokens.org/tr/drafts/format/).

Es el formato que ya hablan Figma Variables, Style Dictionary v4, Tokens Studio, Penpot,
Sketch y la mayoría de las herramientas de IA para diseño. Elegirlo en vez de inventar un
esquema propio significa:

- `tokens.json` se puede importar/exportar directo desde Figma o Style Dictionary sin escribir un conversor.
- Cualquier agente de IA ya entrenado en diseño de producto reconoce `$value`/`$type`/`$description` sin explicación adicional.
- No reinventamos alias/referencias: usamos la sintaxis de llaves `{grupo.token}` tal cual la define el spec.

## Estructura: primitivos + semánticos (dos capas)

```
color.primitive.ink        →  "#131211"                (valor crudo, sin significado)
color.semantic.text        →  "{color.primitive.ink}"   (alias con intención de uso)
```

- **Primitivos**: la paleta/escala cruda. Nunca se referencian directo desde un elemento del diseño.
- **Semánticos**: lo que un elemento realmente usa (`color.semantic.text`, `color.semantic.surface-accent`).
  Si mañana cambia el brand, se re-apunta el semántico al nuevo primitivo y todo el diseño se actualiza solo.

Esto es el patrón recomendado por el propio DTCG y por Material Design 3 / Tailwind: nombrar
por **categoría de propiedad** (color, dimension, fontFamily...), no por elemento+propiedad
(`rect-border-radius`). Un token `dimension.radius.lg` sirve para el `radius` de un `rect`, de
una `image`, o de lo que se agregue después — un token por elemento sería no-reusable y
obligaría a duplicar valores.

## Categorías estándar que ya existen

| Grupo | $type DTCG | Ejemplos |
|---|---|---|
| `color` | `color` | `color.semantic.text`, `color.semantic.surface` |
| `dimension.radius` | `dimension` | `dimension.radius.sm` … `dimension.radius.full` |
| `dimension.stroke-width` | `dimension` | `dimension.stroke-width.bold` |
| `dimension.shadow-offset` | `dimension` | `dimension.shadow-offset.md` |
| `fontFamily` | `fontFamily` | `fontFamily.serif`, `fontFamily.sans`, `fontFamily.mono` |
| `fontWeight` | `fontWeight` | `fontWeight.semibold` |
| `gradient` | `gradient` (extensión de proyecto, ver nota abajo) | `gradient.brand-rainbow` |

## Cómo referenciar un token desde un elemento

Cualquier propiedad de `props` en `design.json` acepta **un valor literal o una referencia**:

```json
"color": "#131211"               // literal — válido, pero no se actualiza si cambia el brand
"color": "{color.semantic.text}" // referencia — se resuelve contra tokens.json en tiempo de render
```

El renderer (`render.js`) resuelve toda cadena que matchee `^\{[\w.\-]+\}$` contra el árbol de
`tokens.json`, siguiendo alias recursivamente si el propio token referenciado es a su vez un alias.

## Cómo debe nombrar un agente de IA un token nuevo

Si al generar un diseño el modelo necesita un valor que no existe en `tokens.json`, **no debe
inventar sintaxis nueva**. Debe:

1. Preferir un token semántico existente si el valor es razonablemente cercano (no crear
   `color.semantic.text-2` si `color.semantic.text-muted` ya cubre el caso).
2. Si de verdad hace falta uno nuevo, agregarlo respetando la forma DTCG completa:
   ```json
   "color": { "semantic": { "surface-warning": { "$value": "#fdecea", "$type": "color", "$description": "..." } } }
   ```
3. Nombrar en **kebab-case**, en inglés, por categoría → intención (`surface-warning`, no
   `warningBg` ni `fondo_advertencia`).
4. Nunca poner un valor crudo (hex, px) directo en `props` si ya existe o se puede crear un
   token semántico para ese propósito — es lo que hace que el diseño siga siendo editable
   globalmente desde el panel de tokens.

Ver `AI_CONTRACT.md` para las reglas completas que se le dan a un modelo como contexto.

## Nota sobre `$type: "gradient"`

DTCG 2025.10 no estandariza aún un tipo `gradient` en el core spec. Usamos la convención de
facto que ya siguen Tokens Studio y varios plugins de Style Dictionary: `$value` es
`{ angle, stops: [{ color, position }] }`. Está documentado explícitamente en `tokens.json`
para que quede claro que es una extensión de proyecto, no parte del estándar.

## El panel de tokens (UI)

En el panel lateral, la pestaña **Tokens** lista `tokens.json` agrupado igual que el archivo
(color → primitive/semantic, dimension → radius/stroke-width/shadow-offset, etc.). Cada token
es editable ahí; el cambio se propaga a **todos los elementos que lo referencian** en el
próximo render, sin tocar `design.json`. Crear un token nuevo desde el panel sigue las mismas
reglas de nombrado de este documento.

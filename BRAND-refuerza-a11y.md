# Design system — "weAAAre / Refuerza tu A11y"

Destilado a partir de inspección visual de las piezas de referencia (carrusel de slides,
formato 4:5). Este documento describe **intención de diseño**, no CSS — se le pasa a un
agente junto con `AI_CONTRACT.md` para que sepa *qué gusto tiene* esta marca, no solo la
sintaxis del JSON. Los valores de color son aproximados por inspección visual; si hace falta
precisión de producción, conviene verificarlos con un color-picker sobre el archivo fuente
antes de fijarlos como tokens definitivos.

## 1. Personalidad de marca

Editorial, cálida, hecha a mano — como una libreta de trabajo real, no un template genérico
de redes. La referencia constante es el objeto físico: cuaderno anillado, tarjetas de papel
recortado, esquinas mordidas. Es seria en el contenido (accesibilidad, sistemas de diseño)
pero informal en la forma. Nada de gradientes corporativos fríos ni sombras suaves difusas:
todo tiene un borde duro, una sombra dura, un trazo negro definido.

## 2. Paleta

| Uso | Aproximación | Notas |
|---|---|---|
| Fondo exterior / marco | `#0d0d0d` casi negro puro | Es el "cuaderno" en sí, siempre negro |
| Superficie / tarjeta de contenido | `#f5f4ef` crema cálido, no blanco puro | El "papel" |
| Texto principal | `#0d0d0d` | Siempre negro sobre crema, sin grises intermedios en el body |
| Acento 1 (blob esquina) | degradé violeta→azul, aprox. `#7c6cf6 → #4fa8ff` | Difuminado/suave, no sólido |
| Acento 2 (blob esquina) | degradé coral→durazno, aprox. `#ff7a59 → #ffd39a` | Difuminado/suave, no sólido |
| Acento puntual (badges de herramientas) | rosa Storybook `#ff4785` cuando aparece ese logo | Solo si el contenido lo amerita, no decorativo |

Regla de uso: **el negro y el crema son el 90% de cada pieza.** Los degradés de color son
manchas de luz en las esquinas inferiores, nunca ocupan más del ~20% del área ni tocan el
centro de la composición. No hay paleta "arcoíris" en este brand — a diferencia de otros
proyectos con acento multicolor, acá el color es escaso y cada blob es de un solo par de
tonos.

## 3. Tipografía

- **Titulares**: sans-serif geométrica, muy bold (peso 700+), interlineado ajustado
  (~1.1-1.15), siempre en minúscula excepto la primera letra. Se subrayan a mano con una
  barra gruesa negra debajo de cada línea — el subrayado es parte del logotipo del título,
  no un adorno opcional.
- **Números grandes** (el índice de slide "01.", "02."...; los números de fecha "23", "06"):
  serif editorial con números "old-style"/desiguales, peso regular — mismo espíritu que el
  resto del sistema 99copias (Fraunces o equivalente). Es la única tipografía con curvas
  suaves en todo el sistema; contrasta a propósito contra la geometría dura de todo lo demás.
- **Body/párrafo**: sans-serif regular, tamaño cómodo de lectura, sin negrita, gris-negro
  (mismo `#0d0d0d`, no gris real — el brand no usa grises intermedios).
- **Etiquetas/metadata** (nombre del speaker, "Julio"/"Agosto"): sans-serif bold pero en
  tamaño chico, funcionan como microcopy con jerarquía propia dentro de las tarjetas.

## 4. Forma y geometría

- **Radios grandes en todo.** Tarjetas, marcos, badges: nunca esquinas vivas, siempre
  redondeadas generosamente (equivalente a `dimension.radius.xl` o mayor en nuestro token set).
- **Sombra dura offset, sin blur**, igual que el resto del sistema 99copias — coherente con
  ese proyecto, es un lenguaje que se puede compartir entre marcas.
- **El motivo de la espiral de cuaderno** (columna de círculos/anillos a lo largo del borde
  izquierdo de la tarjeta) es un elemento de firma recurrente en cada slide — no decorativo
  opcional, es parte de la identidad del formato "cuaderno".
- **La muesca/mordida en el borde superior** (y a veces inferior) de la tarjeta de papel,
  como si el cuaderno tuviera una perforación real, es otro elemento de firma recurrente.
  Ver limitación conocida en `AI_CONTRACT.md §8` — hoy se aproxima, no se reproduce fiel.
- **Logos como sellos, no como iconografía sistemática**: el isotipo de marca ("Refuerza tu
  A11y", con forma de cinta/ribbon) y el logo del estudio ("weAAAre", pills apiladas) son
  wordmarks vectoriales específicos — se tratan siempre como asset de imagen a subir, nunca
  se reconstruyen con primitivas geométricas (ver regla en `AI_CONTRACT.md §7.1`).

## 5. Patrones de composición (heurísticas, no medidas exactas)

- **Cada slide es una única tarjeta centrada** con márgen negro visible alrededor —
  nunca el contenido llega al borde del lienzo.
- **Jerarquía vertical típica**, de arriba hacia abajo: logo/marca (esquina superior) →
  número de slide grande → titular subrayado → párrafo de cuerpo corto (2-3 líneas máximo,
  nunca un bloque largo) → aire generoso → una o dos tarjetas/pills de metadata en la base →
  blobs de color asomando desde las esquinas inferiores, por detrás del contenido.
- **Densidad baja-media**: cada slide tiene entre 15 y 35 elementos si se cuenta cada
  primitiva individual (espiral incluida), pero visualmente se percibe como "poco cargado"
  porque hay mucho aire entre bloques. La densidad de elementos no es lo mismo que densidad
  visual — esto es clave para no sobre-llenar el lienzo.
- **Cuando hay foto** (headshot de una persona, ej. slide de speaker): la foto ocupa una
  franja vertical completa a un costado de la tarjeta (no un recuadro chico), con el texto
  y los badges de herramientas (Figma, Storybook, etc. como íconos chicos con su nombre) del
  otro lado. Los badges de herramienta son pills chicas: ícono + texto, mismo estilo que las
  tarjetas de precio del sistema 99copias.
- **Las tarjetas de metadata inferiores mezclan tamaños de tipografía dentro de la misma
  caja** (ej. "Jueves" chico + "23" gigante + "&" chico + "06" gigante + "Julio"/"Agosto"
  chico, todo en una sola pill) — es un patrón reusable: título grande, gente pequeña
  quirúrgicamente ubicada alrededor.

## 6. Tokens sugeridos (namespace `brand-a11y`, formato DTCG)

Para no chocar con los tokens de 99copias, este brand vive bajo su propio namespace — mismo
patrón que usé en la prueba anterior vía `meta.tokens` del propio documento (ver
`TOKENS.md §4`):

```json
{
  "color": {
    "$type": "color",
    "brand-a11y": {
      "ink":         { "$value": "#0d0d0d" },
      "paper":       { "$value": "#f5f4ef" },
      "pink-accent": { "$value": "#ff4785" }
    }
  },
  "gradient": {
    "$type": "gradient",
    "brand-a11y": {
      "blob-violet": { "$value": { "angle": 135, "stops": [{ "color": "#7c6cf6", "position": 0 }, { "color": "#4fa8ff", "position": 100 }] } },
      "blob-coral":  { "$value": { "angle": 135, "stops": [{ "color": "#ff7a59", "position": 0 }, { "color": "#ffd39a", "position": 100 }] } }
    }
  }
}
```

Las dimensiones (radios, grosor de borde, offset de sombra) y las tipografías (`fontFamily.serif`/
`.sans`) reusan el set global de `tokens.json` sin cambios — este brand no necesita una escala
tipográfica propia, solo paleta y gradientes propios.

## 7. Qué NO hacer en este brand

- No usar el degradé arcoíris multicolor de 99copias — ese es un acento de esa marca
  específica, no un patrón genérico del sistema.
- No usar grises intermedios para texto secundario — este brand resuelve la jerarquía con
  tamaño y peso, no con opacidad/gris.
- No llenar el lienzo. Si un slide se siente "vacío" comparado con la referencia, el
  problema casi seguro es que falta *aire*, no que falten elementos.

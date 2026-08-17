# Sistema de diseño

Registro corporativo en blancos y azules: elegante, legible y directo. Sustituye
al sistema anterior en hueso y terracota.

## Color

```
--fondo         #F7F9FC   blanco azulado, fondo de pagina
--superficie    #FFFFFF   blanco puro, bloques y cabeceras
--texto         #0F1D33   azul muy oscuro, nunca negro puro
--apagado       #55657D   gris azulado, texto secundario
--linea         #DCE3EC   reglas y bordes
--linea-fuerte  #C3CEDD   subrayados y separadores marcados
--acento        #1A5FB4   azul corporativo, enlaces y detalles
--acento-oscuro #14498A   estado hover
--acento-tenue  #EAF2FB   fondos de etiqueta
```

Contrastes medidos sobre el fondo de página: texto 16,0:1, secundario 5,6:1,
acento 6,0:1. Todos cumplen AA para texto normal.

El texto es azul oscuro y no negro. Unifica la paleta y cansa menos que el negro
puro sobre blanco.

**La profundidad se consigue con el par de blancos**, no con sombras: un bloque
blanco puro sobre el fondo azulado ya se despega. El sitio no usa ni una sombra
ni un degradado.

## Tipografía

```
titulares h1-h2   Instrument Serif   400
subtitulos h3-h4  Public Sans        600
cuerpo            Public Sans        400
datos y rotulos   JetBrains Mono     400
```

Serif en los titulares de mayor rango y sans en el resto: el contraste entre las
dos familias es lo que da el registro elegante. A tamaño pequeño el serif pierde
claridad, así que los subtítulos bajan a sans en semibold.

Escala modular de ratio 1,25. Interlineado 1,65 en cuerpo y 1,12 en titulares.

## Forma

- `--radio: 3px`. Esquinas presentes pero casi rectas.
- Bordes de 1 px. Ninguna sombra.
- Bloques blancos sobre fondo azulado.
- Ancho de página 1080 px; medida de lectura 700 px.

## Componentes

**Cifras de cabecera.** Rejilla de valores en serif grande con la etiqueta en
monoespaciada debajo. Da la escala del trabajo antes de leer nada.

**Rótulo de sección.** Barra corta de acento, número y nombre en versalitas
monoespaciadas.

**Tira de métricas.** Dos variantes: la de cabecera, en rejilla con cifra
grande, y la compacta de dos columnas para listados largos dentro de un
proyecto. Cifras siempre con `tabular-nums`.

**Etiquetas de tecnología.** Texto en monoespaciada sobre fondo azul tenue con
borde. Son nombres, nunca logos ni iconos.

## Accesibilidad

Medido con Lighthouse sobre el build servido en local: **100 en accesibilidad,
rendimiento, buenas prácticas y SEO** en la home y en las páginas de proyecto.
25 auditorías de accesibilidad superadas, ninguna fallida.

Decisiones que lo sostienen:

- **Enlace de salto al contenido**, oculto fuera de pantalla hasta que recibe el
  foco. No usa `display:none`, que lo sacaría del orden de tabulación.
- **Los rótulos de sección son encabezados reales** (`h2`), no párrafos con
  aspecto de título. Cada `section` se nombra con `aria-labelledby` apuntando al
  suyo. La jerarquía va `h1 → h2 → h3` sin saltos.
- **El nivel de encabezado es semántica y el tamaño es CSS.** El proyecto
  principal se ve más grande que los otros dos y sigue siendo un `h3`.
- **La tabla de resultados es una `<table>` real** con `th`, `scope` y `caption`,
  en vez de divs con roles ARIA. Scrollea dentro de su marco en pantallas
  estrechas sin arrastrar la página.
- **En las listas de descripción la etiqueta va antes que el valor**, que es el
  orden correcto; cuando visualmente manda la cifra, se invierte con
  `flex-direction: column-reverse`, no cambiando el HTML.
- **Los SVG llevan `role="img"` y nombre accesible**, con `desc` cuando el
  diagrama necesita explicación.
- Sin `tabindex` positivos. Foco visible con `:focus-visible`.

## Rendimiento

Se precargan las dos fuentes de la primera pantalla. La de titulares se añadió
al medir un desplazamiento de diseño de 0,043 provocado por su intercambio, que
se notaba justo en el titular: con la precarga bajó a **0**.

El sitio entero pesa 175 KB y no sirve ni un byte de JavaScript.

## Se mantiene del brief original

Sin degradados. Sin sombras. Sin glassmorphism. Sin iconos de librería. Sin
emoji. Sin animaciones de scroll ni fade-in al entrar en viewport. Sin selector
de tema. Sin hero a pantalla completa. Sin saludos tipo "Hola, soy". Sin Inter,
Roboto, Poppins ni Montserrat. Nada de `scale`, `translate` ni `rotate` en
hover: los cambios de estado son de color y de borde.

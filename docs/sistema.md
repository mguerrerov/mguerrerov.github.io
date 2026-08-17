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

## Se mantiene del brief original

Sin degradados. Sin sombras. Sin glassmorphism. Sin iconos de librería. Sin
emoji. Sin animaciones de scroll ni fade-in al entrar en viewport. Sin selector
de tema. Sin hero a pantalla completa. Sin saludos tipo "Hola, soy". Sin Inter,
Roboto, Poppins ni Montserrat. Nada de `scale`, `translate` ni `rotate` en
hover: los cambios de estado son de color y de borde.

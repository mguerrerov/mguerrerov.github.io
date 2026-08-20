# Portfolio bilingüe español / inglés

Fecha: 2026-08-20
Estado: aprobado, pendiente de plan de implementación

## Objetivo

Que un visitante que no lee español pueda recorrer el portfolio entero en
inglés, y que al entrar en una página de proyecto siga en inglés sin tener que
volver a elegir.

## Decisión de arquitectura

El idioma vive en la URL, no en el navegador.

```
/                          español
/proyectos/gh-archive/     español
/en/                       inglés
/en/proyectos/gh-archive/  inglés
```

El español se queda en la raíz: las URLs actuales no cambian, así que no se
rompe ningún enlace ya compartido ni lo ya indexado.

El conmutador es un enlace a la misma página en el otro idioma, calculado desde
`Astro.url.pathname`. Como el idioma está en la ruta, navegar a una subpágina
desde la home inglesa mantiene el inglés sin `localStorage`, sin cookies y sin
JavaScript. Esto no es una optimización: la restricción del proyecto es cero JS
por defecto y funcionamiento sin JS.

No hay redirección automática por el idioma del navegador. Manda siempre lo que
el visitante ha pedido en la URL.

## Reparto entre ficheros duplicados y diccionario

**Prosa larga: un fichero por idioma.** Las cuatro páginas de proyecto se
duplican en `src/pages/en/proyectos/`. Un sistema de claves de traducción sobre
200 líneas de prosa técnica la convierte en un diccionario ilegible e impide que
las dos versiones diverjan cuando el inglés necesite otra frase.

**Texto corto y repetido: diccionario.** Conmutador, "Saltar al contenido",
rótulos de sección, cabeceras de tabla y etiquetas de diagrama van a
`src/i18n/textos.ts`. Aparecen en varios sitios y duplicarlos los desincroniza.

La frontera es esa: si el texto se lee como prosa, vive en su fichero de idioma;
si es una etiqueta reutilizada, vive en el diccionario.

## Componentes

Los diez componentes de `src/components/` y el layout `Proyecto.astro` reciben
un prop `idioma` (`'es' | 'en'`, por defecto `'es'`) y leen sus rótulos del
diccionario. `Base.astro` usa ese prop para el `lang` del `<html>`, el
`og:locale` y los `hreflang`.

## SEO

- `<html lang>` correcto en cada versión.
- `hreflang` recíproco entre cada par de páginas, más `x-default` al español.
  Es lo que distingue "misma página en dos idiomas" de "contenido duplicado".
- `og:locale` `es_ES` o `en_US`.
- El canonical de cada página apunta a sí misma, no a la versión española.
- `sitemap.xml.ts` pasa de 5 a 10 rutas, manteniendo la lista explícita a mano
  que ya usa. `/muestra` sigue fuera.

## Diseño del conmutador

Texto plano `ES / EN`, con el idioma activo marcado y sin enlazar. Sin banderas,
sin iconos y sin emoji: los tres están prohibidos en el proyecto, y una bandera
además nombra un país, no un idioma.

Va alineado arriba, dentro de la columna de 680 px, separado del contenido por
la regla de 1px que ya usa el sistema. No es un botón ni lleva fondo de acento:
el acento se reserva para enlaces y detalles pequeños.

## Traducción del contenido

La spec del proyecto reserva para el autor las dos líneas de presentación de la
home y los textos de decisiones y de "qué se rompió" de cada proyecto. Esos
fragmentos se traducen igual, pero se entregan **marcados como borrador
pendiente de reescritura**: la voz es suya y una traducción no puede
suplantarla. El resto —prosa técnica, rótulos, navegación— es traducción normal.

Las cifras no se tocan. Se adaptan solo los separadores decimales y de millar al
uso inglés (`241,3 M` → `241.3 M`), porque en inglés la coma decimal se lee como
separador de millares y cambiaría el valor.

## Fuera de alcance

- Un tercer idioma.
- Traducir `/muestra`, que es una página interna de sistema tipográfico.
- Traducir `docs/`, que es documentación interna.
- Detección automática de idioma.

## Verificación

- `npm run build` sin errores ni avisos nuevos.
- Las 10 rutas responden 200 en el build local.
- Ninguna página bajo `/en/` conserva texto español suelto, incluidos los
  rótulos dentro de los SVG de los diagramas, que es donde más fácil se escapan.
- `hreflang` recíproco: cada página apunta a su pareja y la pareja de vuelta.
- Las tres comprobaciones de datos personales del proyecto antes del push.

## Registro

Las decisiones no obvias de aquí (idioma en la URL, reparto fichero/diccionario,
conmutador sin JS) se resumen en tres líneas cada una en `docs/decisiones.md`,
como exige el proyecto.

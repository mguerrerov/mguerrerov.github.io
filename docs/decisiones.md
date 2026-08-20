# Decisiones

Cada decision de diseño no obvia, en tres lineas.

## Fase 1 — Sistema

**Jerarquia de titulares sin negrita.**
Instrument Serif solo se distribuye en peso 400; no existe una negrita real y
sintetizarla con `font-synthesis` deforma el trazo. La jerarquia la marcan el
tamano de la escala modular y el interletrado negativo.

**Public Sans como fuente variable en un solo fichero.**
Google Fonts sirve Public Sans como variable, asi que el mismo woff2 cubre 400 y
600 y se declara con `font-weight: 400 600`. Ahorra una peticion y unos 26 KB
frente a servir los dos pesos por separado.

**Solo se precarga la fuente de cuerpo.**
Public Sans lleva `rel="preload"` porque bloquea la primera lectura; el serif y
la monoespaciada cargan con `font-display: swap` y aparecen despues. Precargar
las tres competiria por ancho de banda en la conexion lenta que hay que soportar.

**Tira de metricas con CSS grid, no tabla ni tabulaciones.**
Dos columnas (`1fr auto`) sobre un `<dl>`: la etiqueta queda a la izquierda y el
valor pegado a la derecha, alineado con `tabular-nums`. Es una lista de
descripcion semanticamente y no arrastra bordes ni fondo de tabla.

**Secciones numeradas en monoespaciada.**
El rotulo `00 —`, `01 —` da estructura navegable sin recurrir a tarjetas ni a
una barra de navegacion. Reutiliza la monoespaciada que ya carga la tira de
metricas, asi que no cuesta nada.

**El aire entre secciones lo pone la regla, no el margen.**
Cuando dos secciones van separadas por un `hr`, el margen entre secciones no
aplica y el espaciado se declara sobre la propia regla. Evita sumar dos
separaciones y dejar el doble de hueco.

## Fase 2 — Home

**La pagina de muestra sobrevive en `/muestra` con `noindex`.**
Sigue siendo util para juzgar el sistema tipografico cuando se toque el CSS,
pero no es contenido del portfolio y no debe aparecer en buscadores. El layout
acepta una prop `indexable` que inyecta la etiqueta `robots`.

**Lista agrupada aparte de la tira de metricas.**
El stack y el contacto comparten forma con la tira de metricas pero alinean el
valor a la izquierda, porque es texto y no una cifra que comparar. En movil
colapsa a una sola columna para no partir los nombres de tecnologia.

**Las dos lineas de presentacion se quedan en 42 caracteres de ancho.**
Van a cuerpo mayor y con la columna mas corta que el resto del texto, para que
se lean como un pie del titular y no como el primer parrafo del sitio.

**Las metricas del proyecto principal se toman de `docs/metrics.md` del repo.**
Las cifras que aparecian como ejemplo en el spec (241,3 M eventos, 1,1 TB) no
coinciden con las medidas reales (1.311,7 M eventos, 149 GiB). Se publica lo
medido y se cita el fichero de origen, nunca la cifra de ejemplo.

**No se mencionan dbt ni Evidence.dev en la ficha de GH Archive.**
La descripcion del repositorio los anuncia, pero sus carpetas contienen solo un
`.gitkeep`: no estan implementados. El portfolio describe lo construido, porque
quien abra el repo lo va a comprobar.

## Fase 3 — Paginas de proyecto

**MDX 4, no 7.** La version 7 de `@astrojs/mdx` exige Astro 7 y el proyecto va
con Astro 5. Se instala la rama 4, compatible, en vez de arrastrar una
actualizacion mayor que nadie ha pedido.

**El SVG y la tira de metricas son componentes `.astro`, no markup en el MDX.**
Dentro de un `.mdx` el HTML se parsea como JSX y los atributos con guion
(`stroke-width`, `font-family`) fallan. Sacarlos a componentes evita reescribir
el SVG en camelCase y lo deja legible.

**El presupuesto de disco se presenta como decision, no como limite fisico.**
La maquina tenia 1.378 GB libres en otro disco: los 250 GB son una restriccion
autoimpuesta. Contarlo como escasez del equipo habria sido falso y ademas
debilita la decision, que tiene mas merito siendo deliberada.

**La home enlaza a la pagina del proyecto, no al repositorio.**
El repositorio se enlaza al final de la pagina de detalle. Mandar al visitante
a GitHub desde la home se salta el texto que explica por que las decisiones son
las que son.

## Fase 4 — Despliegue

**La verificacion anti-fuga vive dentro del workflow, no en una lista de tareas.**
El despliegue falla si `recursos/` aparece versionado o si el grep encuentra un
dato personal en `dist/`. Una comprobacion que depende de acordarse de hacerla
acaba sin hacerse justamente el dia que hace falta.

**Sin `og:image`.** Una imagen de previsualizacion necesita un PNG o JPG, y no
hay ninguno que no sea inventar una. Las tarjetas se comparten sin miniatura,
que es preferible a una imagen generica puesta por rellenar.

**Sin JSON-LD de datos estructurados.** Aportaria poco en un sitio de cuatro
paginas y es justamente el tipo de sitio donde un dato personal se publica sin
verse. No compensa el riesgo.

**El sitemap se genera desde un endpoint con las rutas listadas a mano.**
Evita anadir `@astrojs/sitemap` por cuatro URLs. La lista explicita se lee de un
vistazo y deja claro por que `/muestra` no esta.

**Se despliega en el dominio de GitHub Pages, no en uno propio.**
Un dominio propio cuesta dinero y la restriccion de coste cero manda sobre la
preferencia. La configuracion queda lista para anadirlo: fichero `CNAME` en
`public/` y cambiar `site` en `astro.config.mjs`.

**El grep anti-fuga necesita una excepcion para el email profesional.**
La verificacion previa al despliegue busca `@gmail` y el email de contacto es
justamente una direccion de gmail, asi que siempre dara positivo. Se filtra esa
direccion exacta para que el grep siga detectando cualquier otra.

## Fase 6 — Bilingue

**El idioma vive en la URL, no en el navegador.**
El conmutador es un enlace a `/en/...`, no un control con estado en
`localStorage`. Asi el idioma se mantiene al entrar en una subpagina, la pagina
inglesa se puede compartir e indexar, y no hace falta ni un byte de JavaScript.

**El español se queda en la raiz.**
Las URLs ya compartidas e indexadas no cambian; el ingles cuelga de `/en/`. El
`x-default` del hreflang apunta al español por la misma razon.

**La prosa se duplica y solo las etiquetas van al diccionario.**
Un sistema de claves sobre 200 lineas de prosa tecnica la volveria ilegible e
impediria que las dos versiones divergan. Solo lo repetido —conmutador, miga,
pie, rotulos— vive en `src/i18n/textos.ts`.

**El conmutador no lleva bandera.**
Los iconos y los emoji estan prohibidos en el sitio, y una bandera nombra un
pais y no un idioma: `ES / EN` en monoespaciada dice lo mismo sin ninguna de las
dos cosas.

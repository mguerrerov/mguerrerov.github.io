# Plan de implementación — Portfolio bilingüe es/en

> **Para agentes:** SUB-SKILL REQUERIDA: usa superpowers:subagent-driven-development
> (recomendado) o superpowers:executing-plans para ejecutar este plan tarea a
> tarea. Los pasos usan casillas (`- [ ]`) para seguimiento.

**Objetivo:** Servir el portfolio completo en inglés bajo `/en/`, con un
conmutador de idioma que mantiene el idioma al navegar a subpáginas.

**Arquitectura:** El idioma vive en la URL. El español se queda en la raíz y el
inglés cuelga de `/en/`. El conmutador es un enlace a la misma página en el otro
idioma, calculado desde `Astro.url.pathname`. La prosa larga se duplica por
idioma; las etiquetas repetidas salen de un diccionario en `src/i18n/textos.ts`.

**Stack:** Astro 5 + MDX. Sin dependencias nuevas. Cero JavaScript de cliente.

**Spec:** `docs/superpowers/specs/2026-08-20-bilingue-es-en-design.md`

## Restricciones globales

Copiadas de `CLAUDE-portfolio.md`. Aplican a todas las tareas:

- Coste 0 €. Sin dependencias más allá de Astro salvo aprobación explícita.
- **JavaScript de cliente: cero.** El sitio debe funcionar sin JS.
- CSS propio con variables. Sin Tailwind. CSS explicable antes que ingenioso.
- El sitio se sirve en la raíz del dominio. No configurar `base`.
- Una columna, `max-width: 680px`, móvil primero, único breakpoint en 768px.
- Separadores: regla de 1px en `--linea`. **Nunca tarjetas.**
- El acento (`--acento`) solo en enlaces y detalles pequeños. Nunca como fondo
  de bloque ni en botones.
- **Prohibido:** degradados, sombras, glassmorphism, `border-radius` > 4px,
  iconos de librería, **emoji**, transformaciones en hover, animaciones de
  scroll, selector de tema claro/oscuro.
- Prohibido publicar datos personales en cualquier forma, incluidos `<meta>`,
  Open Graph, `alt`, comentarios HTML y nombres de fichero. El único dato de
  contacto publicable es el email profesional.
- Comentarios de código y mensajes de commit en español.
- Cada decisión de diseño no obvia va a `docs/decisiones.md` en tres líneas.

**Sobre la voz del autor:** los textos de presentación de la home y los de
"decisiones" y "qué se rompió" de cada proyecto los escribe él. Sus traducciones
se entregan marcadas como borrador. Ver Tareas 5 y 6.

## Estrategia de verificación

El proyecto no tiene framework de tests y no se va a añadir uno: sería una
dependencia nueva, y están limitadas por la spec. La verificación es un script
de Node sin dependencias, `scripts/verificar-i18n.mjs`, que corre sobre `dist/`
después del build y comprueba el HTML realmente publicado. Se escribe primero y
se le ve fallar antes de implementar.

---

### Tarea 1: Verificador y diccionario de textos

**Ficheros:**
- Crear: `scripts/verificar-i18n.mjs`
- Crear: `src/i18n/textos.ts`
- Modificar: `package.json` (script `verificar`)

**Interfaces:**
- Produce: `IDIOMAS`, `type Idioma = 'es' | 'en'`, `textos(idioma)`,
  `idiomaDeRuta(pathname)`, `rutaAlterna(pathname)`. Todas las tareas siguientes
  consumen estas cinco.

- [ ] **Paso 1: Escribir el verificador que falla**

Crear `scripts/verificar-i18n.mjs`:

```js
// Verificacion del sitio bilingue sobre el resultado del build.
//
// No hay framework de tests y no se anade uno: seria una dependencia nueva.
// Se comprueba el HTML publicado, que es lo que de verdad ve el visitante.
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const PARES = [
  ['/', '/en/'],
  ['/proyectos/gh-archive/', '/en/proyectos/gh-archive/'],
  ['/proyectos/wikipedia-tiempo-real/', '/en/proyectos/wikipedia-tiempo-real/'],
  ['/proyectos/recomendador-candidatos/', '/en/proyectos/recomendador-candidatos/'],
  ['/proyectos/deteccion-fraude/', '/en/proyectos/deteccion-fraude/'],
];

// Palabras que solo aparecen en castellano. Si alguna sobrevive en una pagina
// inglesa es que quedo texto sin traducir; los rotulos dentro de los SVG son
// donde mas se escapan.
const RASTROS_ES = [
  'Volver al inicio', 'Ver el código', 'Saltar al contenido',
  ' del ', ' que ', ' para ', ' con ', ' los ', ' las ', ' una ',
];

const fallos = [];

const leer = async (ruta) => {
  const f = `dist${ruta}index.html`;
  return existsSync(f) ? readFile(f, 'utf8') : null;
};

for (const [es, en] of PARES) {
  const doc = { es: await leer(es), en: await leer(en) };

  for (const [idioma, ruta] of [['es', es], ['en', en]]) {
    if (!doc[idioma]) {
      fallos.push(`falta la pagina ${ruta}`);
      continue;
    }
    if (!doc[idioma].includes(`<html lang="${idioma}"`)) {
      fallos.push(`${ruta}: falta <html lang="${idioma}">`);
    }
    // hreflang reciproco: cada pagina declara las dos versiones del par.
    for (const destino of [es, en]) {
      const enlace = new RegExp(`hreflang="[a-z-]+" href="[^"]*${destino}"`);
      if (!enlace.test(doc[idioma])) {
        fallos.push(`${ruta}: el hreflang no apunta a ${destino}`);
      }
    }
  }

  if (doc.en) {
    // Solo el texto visible: sin etiquetas, para no mirar clases ni atributos.
    const visible = doc.en.replace(/<[^>]+>/g, ' ');
    for (const rastro of RASTROS_ES) {
      if (visible.includes(rastro)) {
        fallos.push(`${en}: texto sin traducir -> "${rastro.trim()}"`);
      }
    }
  }
}

if (fallos.length) {
  console.error('FALLOS:\n' + fallos.map((f) => `  - ${f}`).join('\n'));
  process.exit(1);
}
console.log(`OK: ${PARES.length * 2} paginas bilingues correctas.`);
```

- [ ] **Paso 2: Ejecutarlo y verlo fallar**

```bash
npm run build && node scripts/verificar-i18n.mjs
```

Esperado: FALLA con `falta la pagina /en/` y las cuatro rutas inglesas. Esto
confirma que el verificador detecta la ausencia antes de implementar nada.

- [ ] **Paso 3: Crear el diccionario**

Crear `src/i18n/textos.ts`:

```ts
// Textos cortos que se repiten en varias paginas. La prosa larga NO vive aqui:
// va en el fichero de su idioma. La frontera es esa: si se lee como prosa, va
// en su pagina; si es una etiqueta reutilizada, va aqui.
export const IDIOMAS = ['es', 'en'] as const;
export type Idioma = (typeof IDIOMAS)[number];

const TEXTOS = {
  es: {
    saltar: 'Saltar al contenido',
    proyecto: 'Proyecto',
    volver: '← Volver al inicio',
    verRepo: 'Ver el código en GitHub →',
    leerMas: 'Leer cómo está hecho →',
    migaPan: 'Miga de pan',
    rotuloIdioma: 'Idioma',
    localeOg: 'es_ES',
    enDesarrollo: 'En desarrollo',
  },
  en: {
    saltar: 'Skip to content',
    proyecto: 'Project',
    volver: '← Back to home',
    verRepo: 'View the code on GitHub →',
    leerMas: 'Read how it works →',
    migaPan: 'Breadcrumb',
    rotuloIdioma: 'Language',
    localeOg: 'en_US',
    enDesarrollo: 'Work in progress',
  },
} as const;

export const textos = (idioma: Idioma) => TEXTOS[idioma];

/** Idioma de una ruta. Todo lo que no cuelga de /en/ es español. */
export const idiomaDeRuta = (pathname: string): Idioma =>
  pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'es';

/**
 * La misma pagina en el otro idioma. Es el destino del conmutador: como el
 * idioma esta en la ruta, seguir navegando mantiene el idioma sin JavaScript.
 */
export const rutaAlterna = (pathname: string): string => {
  const limpia = pathname.endsWith('/') ? pathname : `${pathname}/`;
  return idiomaDeRuta(limpia) === 'en'
    ? limpia.replace(/^\/en/, '') || '/'
    : `/en${limpia}`;
};
```

- [ ] **Paso 4: Añadir el script de verificación**

En `package.json`, dentro de `scripts`:

```json
"verificar": "astro build && node scripts/verificar-i18n.mjs"
```

- [ ] **Paso 5: Commit**

```bash
git add scripts/verificar-i18n.mjs src/i18n/textos.ts package.json
git commit -m "Anadir el diccionario de textos y la verificacion del sitio bilingue"
```

---

### Tarea 2: Conmutador de idioma y cabecera bilingüe

**Ficheros:**
- Crear: `src/components/Idioma.astro`
- Modificar: `src/layouts/Base.astro`

**Interfaces:**
- Consume: `textos`, `idiomaDeRuta`, `rutaAlterna`, `Idioma` (Tarea 1).
- Produce: `Base.astro` acepta el prop `idioma?: Idioma`; si no se pasa, lo
  deduce de `Astro.url.pathname`. `<Idioma />` no lleva props.

- [ ] **Paso 1: Crear el conmutador**

Crear `src/components/Idioma.astro`. Texto plano `ES / EN`, sin banderas ni
iconos: están prohibidos los iconos y los emoji, y una bandera nombra un país,
no un idioma. El idioma activo no se enlaza.

```astro
---
// Conmutador de idioma. Es un enlace a la misma pagina en el otro idioma, no
// un control con estado: el idioma vive en la URL, asi que funciona sin JS y
// se mantiene al entrar en una subpagina.
import { idiomaDeRuta, rutaAlterna, textos } from '../i18n/textos';

const actual = idiomaDeRuta(Astro.url.pathname);
const destino = rutaAlterna(Astro.url.pathname);
const t = textos(actual);
---

<nav class="idioma" aria-label={t.rotuloIdioma}>
  {
    actual === 'es' ? (
      <>
        <span aria-current="true">ES</span>
        <span aria-hidden="true">/</span>
        <a href={destino} hreflang="en" lang="en">EN</a>
      </>
    ) : (
      <>
        <a href={destino} hreflang="es" lang="es">ES</a>
        <span aria-hidden="true">/</span>
        <span aria-current="true">EN</span>
      </>
    )
  }
</nav>

<style>
  .idioma {
    font-family: var(--mono);
    font-size: var(--t--1);
    letter-spacing: 0.06em;
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }

  .idioma a {
    color: var(--acento);
    text-decoration: none;
  }

  .idioma a:hover {
    text-decoration: underline;
  }

  /* El idioma activo queda en apagado: el acento se reserva para lo que se
     puede pulsar. */
  .idioma span {
    color: var(--apagado);
  }

  .idioma span[aria-hidden] {
    color: var(--linea-fuerte);
  }
</style>
```

- [ ] **Paso 2: Hacer bilingüe `Base.astro`**

En `src/layouts/Base.astro`, sustituir el frontmatter y la etiqueta `<html>`:

```astro
---
import '../styles/base.css';
import { idiomaDeRuta, rutaAlterna, textos, type Idioma } from '../i18n/textos';

interface Props {
  titulo: string;
  descripcion?: string;
  indexable?: boolean;
  idioma?: Idioma;
}

const { titulo, descripcion, indexable = true } = Astro.props;

const idioma: Idioma = Astro.props.idioma ?? idiomaDeRuta(Astro.url.pathname);
const t = textos(idioma);

// URL absoluta de esta pagina, para el canonical y para Open Graph.
const canonica = new URL(Astro.url.pathname, Astro.site).href;

// Pareja de esta pagina en el otro idioma, para los hreflang. El canonical
// sigue apuntando a si misma: son dos paginas distintas, no duplicados.
const alterna = new URL(rutaAlterna(Astro.url.pathname), Astro.site).href;
const enEspanol = idioma === 'es' ? canonica : alterna;
const enIngles = idioma === 'es' ? alterna : canonica;
---

<!doctype html>
<html lang={idioma}>
```

Dentro de `<head>`, justo después del `<link rel="canonical">`, añadir los
`hreflang`. Son lo que le dice a Google que las dos versiones son la misma
página en dos idiomas y no contenido duplicado. `x-default` va al español, que
es lo que vive en la raíz:

```astro
    {
      indexable && (
        <>
          <link rel="alternate" hreflang="es" href={enEspanol} />
          <link rel="alternate" hreflang="en" href={enIngles} />
          <link rel="alternate" hreflang="x-default" href={enEspanol} />
        </>
      )
    }
```

Sustituir el `og:locale` fijo:

```astro
    <meta property="og:locale" content={t.localeOg} />
```

Y traducir el enlace de salto del `<body>`:

```astro
    <a class="salto" href="#contenido">{t.saltar}</a>
```

- [ ] **Paso 3: Verificar que la parte española sigue igual**

```bash
npm run build
grep -c 'rel="alternate"' dist/index.html
grep -o '<html lang="es"' dist/index.html
grep -o 'Saltar al contenido' dist/index.html
```

Esperado: `3`, el `lang="es"` y el texto de salto en español. El verificador
completo sigue fallando por las páginas inglesas, que no existen hasta la
Tarea 5.

- [ ] **Paso 4: Commit**

```bash
git add src/components/Idioma.astro src/layouts/Base.astro
git commit -m "Anadir el conmutador de idioma y los hreflang del layout base"
```

---

### Tarea 3: Layout de proyecto bilingüe

**Ficheros:**
- Modificar: `src/layouts/Proyecto.astro`

**Interfaces:**
- Consume: `textos`, `idiomaDeRuta` (Tarea 1); `<Idioma />` (Tarea 2).
- Produce: `Proyecto.astro` sigue recibiendo el mismo `frontmatter` y deduce el
  idioma de la ruta. Las páginas MDX inglesas no tienen que pasarle nada.

- [ ] **Paso 1: Traducir miga de pan, cabecera y pie**

En el frontmatter de `src/layouts/Proyecto.astro`:

```astro
---
// Layout de las paginas de proyecto en MDX. Misma cabecera blanca a ancho
// completo que la home, y despues la prosa en columna de lectura.
import Base from './Base.astro';
import Idioma from '../components/Idioma.astro';
import { idiomaDeRuta, textos } from '../i18n/textos';

interface Props {
  frontmatter: {
    titulo: string;
    resumen: string;
    repo: string;
  };
}

const { titulo, resumen, repo } = Astro.props.frontmatter;

const idioma = idiomaDeRuta(Astro.url.pathname);
const t = textos(idioma);
// El inicio de cada idioma es su propia raiz.
const inicio = idioma === 'es' ? '/' : '/en/';
---
```

En el marcado, el conmutador va dentro del envoltorio de la cabecera, encima de
la miga de pan:

```astro
    <div class="envoltorio">
      <Idioma />
      <nav class="migas" aria-label={t.migaPan}>
        <a href={inicio}>Marcos Guerrero</a>
        <span aria-hidden="true">/</span>
        <span class="apagado">{t.proyecto}</span>
      </nav>
```

Y el pie:

```astro
    <footer class="pie">
      <p>
        <a href={repo}>{t.verRepo}</a>
      </p>
      <p><a href={inicio}>{t.volver}</a></p>
    </footer>
```

- [ ] **Paso 2: Verificar que el español no ha cambiado**

```bash
npm run build
grep -o 'Volver al inicio' dist/proyectos/gh-archive/index.html
grep -o 'href="/"' dist/proyectos/gh-archive/index.html | head -1
```

Esperado: el texto español intacto y el enlace de inicio apuntando a `/`.

- [ ] **Paso 3: Commit**

```bash
git add src/layouts/Proyecto.astro
git commit -m "Traducir la cabecera y el pie de las paginas de proyecto"
```

---

### Tarea 4: Componentes con prop de idioma

**Ficheros:**
- Modificar: `src/components/MetricasGhArchive.astro`,
  `MetricasWikipedia.astro`, `MetricasRecomendador.astro`, `MetricasFraude.astro`
- Modificar: `src/components/DiagramaGhArchive.astro`,
  `DiagramaWikipedia.astro`, `DiagramaRecomendador.astro`
- Modificar: `src/components/TablaFraude.astro`, `AvisoDesarrollo.astro`

**Interfaces:**
- Consume: `Idioma`, `textos` (Tarea 1).
- Produce: los nueve componentes aceptan `idioma?: Idioma` con valor por defecto
  `'es'`. Las páginas españolas no cambian su forma de llamarlos.

`MiniFlujo.astro` NO se toca: ya recibe `etapas` y `titulo` como props, así que
se traduce en la home que lo llama (Tarea 5).

- [ ] **Paso 1: Patrón de las tiras de métricas**

Ejemplo completo para `MetricasWikipedia.astro`. Repetir la misma forma en los
otros tres con sus propias etiquetas:

```astro
---
// Cifras tomadas de docs/metrics.md del repositorio del proyecto. Todas son
// mediciones fechadas del 17 y 18 de agosto de 2026, ninguna es estimacion.
//
// Los valores cambian de separador segun el idioma: en ingles la coma decimal
// se lee como separador de millares y cambiaria la cifra.
import type { Idioma } from '../i18n/textos';

interface Props {
  idioma?: Idioma;
}

const { idioma = 'es' } = Astro.props;

const FILAS = {
  es: [
    ['ritmo de la fuente', '37,4 ev/s sostenidos'],
    ['pico en un segundo', '114 ev/s'],
    ['latencia p50', '15,59 s'],
    ['latencia p95', '55,75 s'],
    ['duplicados en silver', '0 sobre 71.484 filas'],
    ['huecos en bronze', '0'],
    ['puntos de control', '180 MB frente a 13,7 MB de datos'],
    ['coste en aws', '0 €'],
  ],
  en: [
    ['source throughput', '37.4 ev/s sustained'],
    ['one-second peak', '114 ev/s'],
    ['p50 latency', '15.59 s'],
    ['p95 latency', '55.75 s'],
    ['duplicates in silver', '0 out of 71,484 rows'],
    ['gaps in bronze', '0'],
    ['checkpoints', '180 MB against 13.7 MB of data'],
    ['aws cost', '€0'],
  ],
} as const;
---

<dl class="metricas-lista">
  {
    FILAS[idioma].map(([etiqueta, valor]) => (
      <>
        <dt>{etiqueta}</dt>
        <dd>{valor}</dd>
      </>
    ))
  }
</dl>
```

- [ ] **Paso 2: Aplicar el patrón a diagramas, tabla y aviso**

En los tres `Diagrama*.astro` y en `TablaFraude.astro`, extraer los rótulos
visibles al mismo objeto `{ es: [...], en: [...] }` indexado por `idioma`. En
los SVG hay que traducir también el `aria-label` y el `<title>`: son el texto
que oye quien usa un lector de pantalla, y el verificador no los mira.

`AvisoDesarrollo.astro` toma su rótulo del diccionario, porque aparece en más de
un proyecto:

```astro
---
import { textos, type Idioma } from '../i18n/textos';

interface Props {
  idioma?: Idioma;
}

const { idioma = 'es' } = Astro.props;
const t = textos(idioma);
---
```

y usa `{t.enDesarrollo}` donde antes tenía el texto fijo.

- [ ] **Paso 3: Comprobar que el sitio español no ha cambiado ni un carácter**

Esta es la red de seguridad de la tarea: refactorizar nueve componentes no debe
alterar la salida española.

```bash
git stash
npm run build && cp -r dist ../dist-antes
git stash pop
npm run build
diff -r ../dist-antes/proyectos dist/proyectos && echo "ESPANOL INTACTO"
diff ../dist-antes/index.html dist/index.html && echo "HOME INTACTA"
rm -rf ../dist-antes
```

Esperado: `ESPANOL INTACTO` y `HOME INTACTA`, sin diferencias.

- [ ] **Paso 4: Commit**

```bash
git add src/components/
git commit -m "Dar un prop de idioma a los componentes sin tocar el texto español"
```

---

### Tarea 5: Home en inglés

**Ficheros:**
- Crear: `src/pages/en/index.astro`
- Modificar: `src/pages/index.astro`

**Interfaces:**
- Consume: `<Idioma />` (Tarea 2) y los nueve componentes con prop `idioma`
  (Tarea 4).

- [ ] **Paso 1: Añadir el conmutador a la home española**

En `src/pages/index.astro`, importar el componente y colocarlo dentro del
envoltorio de la cabecera, antes del `<h1>`:

```astro
import Idioma from '../components/Idioma.astro';
```

```astro
      <Idioma />
```

- [ ] **Paso 2: Crear la home inglesa**

Copiar `src/pages/index.astro` a `src/pages/en/index.astro` y traducir. Cambios
obligatorios más allá del texto:

- Los `import` suben un nivel: `../../components/…`, `../../i18n/textos`.
- Todos los enlaces internos llevan prefijo: `/proyectos/gh-archive/` pasa a
  `/en/proyectos/gh-archive/`.
- Cada componente recibe el idioma: `<MetricasGhArchive idioma="en" />`.
- `<MiniFlujo>` recibe `etapas` y `titulo` ya en inglés.
- Los separadores numéricos pasan al uso inglés: `0,8364` → `0.8364`,
  `98,57 %` → `98.57%`, `241,3 M` → `241.3 M`, `1,1 TB` → `1.1 TB`.
- El bloque de contacto conserva sus valores —email, GitHub y LinkedIn son los
  mismos—; solo se traducen sus etiquetas.
- La línea de idiomas del stack pasa a `Native Spanish, English B2–C1`.

**Las dos líneas de presentación se traducen como borrador**: la especificación
las reserva al autor. Marcarlas en el fichero, encima del bloque:

```astro
<!-- BORRADOR: traduccion pendiente de reescritura por el autor. La voz de la
     presentacion es suya; esto es solo un punto de partida. -->
```

- [ ] **Paso 3: Verificar**

```bash
npm run build && node scripts/verificar-i18n.mjs
```

Esperado: desaparecen los fallos de `/en/`; siguen los de las cuatro páginas de
proyecto inglesas.

- [ ] **Paso 4: Commit**

```bash
git add src/pages/index.astro src/pages/en/index.astro
git commit -m "Anadir la home en ingles y el conmutador en la home española"
```

---

### Tarea 6: Las cuatro páginas de proyecto en inglés

**Ficheros:**
- Crear: `src/pages/en/proyectos/deteccion-fraude.mdx`
- Crear: `src/pages/en/proyectos/recomendador-candidatos.mdx`
- Crear: `src/pages/en/proyectos/gh-archive.mdx`
- Crear: `src/pages/en/proyectos/wikipedia-tiempo-real.mdx`

**Interfaces:**
- Consume: `Proyecto.astro` (Tarea 3) y los componentes con `idioma` (Tarea 4).

Los nombres de fichero se quedan en español (`wikipedia-tiempo-real`) para que
la ruta inglesa sea la española con `/en/` delante. Eso es lo que permite que
`rutaAlterna()` sea un simple prefijo, sin tabla de equivalencias que mantener.

- [ ] **Paso 1: Traducir una página como plantilla**

Empezar por `deteccion-fraude.mdx`, la más corta (107 líneas). Copiarla a
`src/pages/en/proyectos/deteccion-fraude.mdx` y traducir:

- El `frontmatter`: `titulo` y `resumen` al inglés; `repo` no cambia; `layout`
  pasa a `../../../layouts/Proyecto.astro`.
- Los `import` de componentes suben un nivel más.
- Cada componente recibe `idioma="en"`.
- Separadores numéricos al uso inglés.
- **Las secciones de "decisiones" y de "qué se rompió" se marcan como borrador**,
  con un comentario MDX encima de cada una:

```mdx
{/* BORRADOR: traduccion pendiente de reescritura por el autor. */}
```

- [ ] **Paso 2: Verificar la plantilla antes de repetirla**

```bash
npm run build && node scripts/verificar-i18n.mjs
```

Esperado: desaparece el fallo de `/en/proyectos/deteccion-fraude/`. Si el
verificador señala texto español suelto, arreglarlo **aquí, antes** de traducir
las otras tres: el mismo error se repetiría cuatro veces.

- [ ] **Paso 3: Traducir las tres restantes**

Mismo procedimiento con `recomendador-candidatos.mdx` (114 líneas),
`gh-archive.mdx` (181) y `wikipedia-tiempo-real.mdx` (208). Un commit por
página: son ficheros grandes y así el autor puede revisar la traducción de uno
en uno.

- [ ] **Paso 4: Verificar el conjunto**

```bash
npm run build && node scripts/verificar-i18n.mjs
```

Esperado: `OK: 10 paginas bilingues correctas.`

- [ ] **Paso 5: Commit**

```bash
git add src/pages/en/proyectos/
git commit -m "Traducir al ingles las cuatro paginas de proyecto"
```

---

### Tarea 7: Sitemap, CI, documentación y despliegue

**Ficheros:**
- Modificar: `src/pages/sitemap.xml.ts`
- Modificar: `.github/workflows/verificar.yml`
- Modificar: `docs/decisiones.md`

- [ ] **Paso 1: Ampliar el sitemap a diez rutas**

En `src/pages/sitemap.xml.ts`, sustituir la constante `RUTAS`:

```ts
// Rutas indexables, listadas a mano. Son pocas y cambian poco, y una lista
// explicita se lee mejor que un descubrimiento automatico. /muestra queda fuera
// a proposito: lleva noindex y no es contenido del portfolio.
//
// Cada pagina existe en los dos idiomas. Que son pareja lo declara el hreflang
// de cada una; aqui basta con listarlas todas.
const PAGINAS = [
  '/',
  '/proyectos/gh-archive/',
  '/proyectos/wikipedia-tiempo-real/',
  '/proyectos/recomendador-candidatos/',
  '/proyectos/deteccion-fraude/',
];

const RUTAS = [...PAGINAS, ...PAGINAS.map((ruta) => `/en${ruta}`)];
```

- [ ] **Paso 2: Verificar el sitemap**

```bash
npm run build && grep -c '<url>' dist/sitemap.xml
```

Esperado: `10`.

- [ ] **Paso 3: Enganchar la verificación al CI**

En `.github/workflows/verificar.yml`, en el job `construir`, después del paso
`- run: npm run build`:

```yaml
      # Comprueba que las diez paginas existen, que cada una declara su idioma
      # y su pareja, y que ninguna inglesa se quedo con texto español.
      - name: Verificar el sitio bilingue
        run: node scripts/verificar-i18n.mjs
```

- [ ] **Paso 4: Registrar las decisiones**

Añadir al final de `docs/decisiones.md`, con el formato de tres líneas del
fichero:

```markdown
## Fase 6 — Bilingüe

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
```

- [ ] **Paso 5: Verificación completa antes del push**

Las tres comprobaciones obligatorias del proyecto, más la del sitio bilingüe:

```bash
npm run verificar
git status --ignored | grep recursos
git log --all --name-only --pretty=format: | sort -u | grep -i recursos
grep -rniE "\+34|[0-9]{9}|@gmail|@hotmail" dist/
```

Esperado: `OK: 10 paginas bilingues correctas`; `recursos/` bajo "Ignored
files"; sin salida en la tercera; y en la cuarta únicamente el email profesional
y el identificador del perfil de LinkedIn, que están permitidos.

**Si aparece cualquier otra cosa, parar y avisar al autor.** No reescribir el
historial.

- [ ] **Paso 6: Commit**

```bash
git add src/pages/sitemap.xml.ts .github/workflows/verificar.yml docs/decisiones.md
git commit -m "Listar las rutas inglesas en el sitemap y verificarlas en CI"
```

- [ ] **Paso 7: Entregar, sin desplegar**

El despliegue es manual y lo decide el autor: `npm run desplegar`. Un push no
publica nada. Antes de desplegar, el autor debería revisar los textos marcados
como BORRADOR, que son suyos.

---

## Revisión del plan contra la spec

- Rutas `/en/` con el español en la raíz → Tareas 5 y 6.
- Conmutador sin JS que mantiene el idioma al navegar → Tarea 2.
- Reparto entre prosa duplicada y diccionario → Tareas 1, 4 y 6.
- Prop `idioma` en componentes y layouts → Tareas 3 y 4.
- `lang`, `og:locale`, `hreflang` recíproco y canonical propio → Tarea 2.
- Sitemap de 5 a 10 rutas → Tarea 7.
- Conmutador en texto, sin banderas, dentro de la columna → Tarea 2.
- Textos reservados al autor, marcados como borrador → Tareas 5 y 6.
- Separadores decimales adaptados → Tareas 4, 5 y 6.
- Fuera de alcance respetado: no se toca `/muestra` ni `docs/`, no hay tercer
  idioma ni detección automática de idioma.
- Verificación (build, 10 rutas, hreflang, sin español suelto, datos
  personales) → Tarea 1 y Tarea 7 paso 5.

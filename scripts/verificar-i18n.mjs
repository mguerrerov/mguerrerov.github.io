// Verificacion del sitio bilingue sobre el resultado del build.
//
// No hay framework de tests y no se anade uno: seria una dependencia nueva.
// Se comprueba el HTML publicado, que es lo que de verdad ve el visitante.
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const SITIO = 'https://mguerrerov.netlify.app';

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
    // El destino se ancla a la URL absoluta completa (con el sitio por
    // delante y `"` como cierre): con "[^"]*" suelto, la ruta espanola
    // ("/proyectos/gh-archive/") es sufijo de la ruta inglesa
    // ("https://.../en/proyectos/gh-archive/") y el regex casa igual aunque
    // falte el hreflang espanol. Anclar al origen completo es lo que impide
    // ese falso positivo.
    //
    // Ademas el codigo de idioma se fija a "es" o "en" en vez de aceptar
    // cualquier [a-z-]: la etiqueta "x-default" tambien lleva href al sitio
    // espanol (es el idioma por defecto), asi que un patron laxo la confunde
    // con el hreflang="es" de verdad y el fallo pasa desapercibido igual.
    for (const [codigo, destino] of [
      ['es', es],
      ['en', en],
    ]) {
      const url = `${SITIO}${destino}`;
      const urlEscapada = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const enlace = new RegExp(`hreflang="${codigo}" href="${urlEscapada}"`);
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

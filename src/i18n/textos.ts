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
    avisoGenerico:
      'El pipeline sigue en construcción. Las cifras y las decisiones que se describen aquí son las del estado actual y pueden cambiar.',
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
    avisoGenerico:
      'The pipeline is still under construction. The figures and the decisions described here reflect the current state and may change.',
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

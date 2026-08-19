import type { APIRoute } from 'astro';

// Rutas indexables, listadas a mano. Son pocas y cambian poco, y una lista
// explicita se lee mejor que un descubrimiento automatico. /muestra queda fuera
// a proposito: lleva noindex y no es contenido del portfolio.
const RUTAS = [
  '/',
  '/proyectos/gh-archive/',
  '/proyectos/wikipedia-tiempo-real/',
  '/proyectos/recomendador-candidatos/',
  '/proyectos/deteccion-fraude/',
];

export const GET: APIRoute = ({ site }) => {
  const base = site?.href.replace(/\/$/, '') ?? '';

  const urls = RUTAS.map((ruta) => `  <url><loc>${base}${ruta}</loc></url>`).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};

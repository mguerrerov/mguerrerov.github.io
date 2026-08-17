import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// El repo se sirve en la raiz del dominio de GitHub Pages, asi que no se
// configura `base`. MDX es la unica integracion: las paginas de proyecto son
// prosa larga y en .astro obligarian a envolver cada parrafo en etiquetas.
export default defineConfig({
  site: 'https://mguerrerov.github.io',
  integrations: [mdx()],
});

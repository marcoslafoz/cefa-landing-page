import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';
import compress from 'astro-compress';

export default defineConfig({
  site: 'https://cefa.es',
  // Static by default; individual routes opt-in to SSR with `export const prerender = false`
  // The node adapter handles those server-rendered endpoints (e.g. /api/contact)
  adapter: node({ mode: 'standalone' }),

  build: {
    inlineStylesheets: 'always',
  },

  vite: {
    plugins: [tailwindcss()],
    build: {
      cssCodeSplit: false,
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  },

  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['es', 'en', 'de', 'pl'],
    routing: {
      prefixDefaultLocale: false,
    },
  },

  integrations: [
    react(),
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en-GB',
          es: 'es-ES',
          de: 'de-DE',
          pl: 'pl-PL',
        },
      },
      // Assign crawl priorities and freshness signals so Google focuses
      // crawl budget on high-value pages and knows when content was last updated.
      serialize(item) {
        const url = item.url;
        const lastmod = new Date().toISOString();

        // Homepages: highest priority, updated frequently
        if (/^https:\/\/cefa\.es\/(es\/|de\/|pl\/)?$/.test(url)) {
          return { ...item, priority: 1.0, changefreq: 'weekly', lastmod };
        }

        // Legal/cookies/privacy: low value, rarely changes
        if (/\/(legal|privacy|cookies|privacidad|datenschutz|prywatnosc|polityka)/.test(url)) {
          return { ...item, priority: 0.2, changefreq: 'yearly', lastmod };
        }

        // High-value product/trust pages
        if (
          /\/(certifications|projects|certificaciones|proyectos|zertifikate|projekte|certyfikaty)/.test(
            url
          )
        ) {
          return { ...item, priority: 0.8, changefreq: 'monthly', lastmod };
        }

        // Default for everything else
        return { ...item, priority: 0.6, changefreq: 'monthly', lastmod };
      },
    }),
    compress({
      HTML: {
        comments: false,
      },
      CSS: true,
      JS: true,
      SVG: true,
      Image: false,
    }),
  ],
});

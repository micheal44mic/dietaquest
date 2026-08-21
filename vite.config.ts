import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * GitHub Pages serve il sito sotto /dietaquest/, non alla radice del dominio:
 * senza `base` gli asset e il service worker verrebbero cercati su / e l'app
 * resterebbe bianca. `scope` e `start_url` devono seguire lo stesso percorso,
 * altrimenti l'icona aggiunta alla Home aprirebbe una pagina inesistente.
 */
const BASE = '/dietaquest/'

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        id: BASE,
        scope: BASE,
        name: 'DietaQuest',
        short_name: 'DietaQuest',
        description: 'La tua dieta, trasformata in un gioco',
        theme_color: '#58CC02',
        background_color: '#FFF6EB',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'it',
        start_url: BASE,
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  server: {
    host: true,
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
  },
})

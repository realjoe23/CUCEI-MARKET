import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['cucei.png'],
      manifest: {
        name: 'CUCEI Market',
        short_name: 'CUCEIMarket',
        description: 'Plataforma de vendedores del CUCEI',
        theme_color: '#004a87',
        background_color: '#f4f4f9',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'cucei.png', sizes: '192x192', type: 'image/png' },
          { src: 'cucei.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache' }
          }
        ]
      }
    })
  ],
})

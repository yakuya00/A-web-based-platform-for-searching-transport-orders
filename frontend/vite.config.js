import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    basicSsl(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true, // Чтобы PWA работало и тестировалось даже в режиме npm run dev
      },
      manifest: {
        name: 'LOGIX.', // 👈 Напиши тут красивое название диплома
        short_name: 'LOGIX',
        description: 'Logistická aplikace pro řidiče a dispečery',
        theme_color: '#ffffff',
        background_color: '#f9fafb',
        display: 'standalone', // 💥 МАГИЯ: Запускаем как отдельную программу!
        display_override: ['window-controls-overlay'],
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],

  server: {
    watch: {
      usePolling: true, // <--- ВОТ ЭТА СТРОКА САМАЯ ВАЖНАЯ
    },
    host: true, // Нужно для Docker
    strictPort: true,
    port: 5173,
    proxy: {
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true, // 🔥 ЭТО САМОЕ ВАЖНОЕ: разрешаем WebSockets!
        changeOrigin: true,
      },
      '/chat': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/rating': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      // То же самое для других твоих роутов
      '/user': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/company': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/order': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/vehicle': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import basicSsl from '@vitejs/plugin-basic-ssl';
// https://vite.dev/config/
/**
 * @todo Prevest prozy pouze na /api
 */
export default defineConfig({
  plugins: [react(), basicSsl(), tailwindcss()],

  server: {
    watch: {
      usePolling: true,
    },
    host: true,
    strictPort: true,
    port: 5173,
    proxy: {
      '/socket.io': {
        target: 'http://backend:5000',
        ws: true,
        changeOrigin: true,
      },
      '/chat': {
        target: 'http://backend:5000',
        changeOrigin: true,
      },
      '/rating': {
        target: 'http://backend:5000',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://backend:5000',
        changeOrigin: true,
      },
      '/user': {
        target: 'http://backend:5000',
        changeOrigin: true,
      },
      '/company': {
        target: 'http://backend:5000',
        changeOrigin: true,
      },
      '/common': {
        target: 'http://backend:5000',
        changeOrigin: true,
      },
      '/order': {
        target: 'http://backend:5000',
        changeOrigin: true,
      },
      '/vehicle': {
        target: 'http://backend:5000',
        changeOrigin: true,
      },
      '/vehicle-composition': {
        target: 'http://backend:5000',
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

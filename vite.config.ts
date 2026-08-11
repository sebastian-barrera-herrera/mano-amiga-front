import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // En desarrollo el frontend llama a /api y Vite lo reenvía al backend:
    // así no hay CORS ni variables de entorno que configurar.
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Objetivo amplio: la app debe funcionar en teléfonos Android antiguos.
    target: 'es2018',
    sourcemap: false,
  },
});

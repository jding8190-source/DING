import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import adminApi from './vite-plugin-admin-api';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [react(), tailwindcss(), adminApi()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
            'vendor-motion': ['motion/react'],
            'vendor-icons': ['lucide-react'],
          },
        },
      },
      chunkSizeWarningLimit: 1200,
    },
  };
});

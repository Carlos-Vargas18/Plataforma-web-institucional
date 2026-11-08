import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { emailPlugin } from './src/server/emailPlugin.ts';

export default defineConfig({
  plugins: [react(), emailPlugin()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, mode }) => {
  if (command === 'build' && process.env.VERCEL === '1') {
    const { VITE_API_BASE_URL } = loadEnv(mode, process.cwd(), 'VITE_')
    const api = URL.canParse(VITE_API_BASE_URL ?? '') ? new URL(VITE_API_BASE_URL) : null
    if (!api || api.protocol !== 'https:' || api.username || api.password ||
        api.hostname === 'localhost' || api.hostname.endsWith('.localhost') ||
        api.hostname === '127.0.0.1' || api.hostname === '[::1]' ||
        api.pathname !== '/api/v1' || api.search || api.hash) {
      throw new Error('Configura VITE_API_BASE_URL con la URL HTTPS pública de EduConnect, terminada en /api/v1.')
    }
  }

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: process.env.VITE_BACKEND_ORIGIN || 'http://localhost:8080',
          // Preserve the public Host for the local proxy so Spring sees a same-origin request.
          changeOrigin: Boolean(process.env.VITE_BACKEND_ORIGIN),
          secure: false,
        }
      }
    }
  }
})

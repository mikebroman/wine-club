import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import process from 'node:process'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = String(env.VITE_API_PROXY_TARGET || '').trim()

  const proxy = proxyTarget
    ? {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
      }
    : undefined

  return {
    plugins: [react()],
    server: proxy ? { proxy } : undefined,
  }
})

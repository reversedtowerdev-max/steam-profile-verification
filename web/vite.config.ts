import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['.free.pinggy.net', '.run.pinggy-free.link'],
    proxy: {
      '/api': {
        target: 'https://trycloudflare.com', 
        changeOrigin: true,
        secure: false,
      },
    },
  }
})

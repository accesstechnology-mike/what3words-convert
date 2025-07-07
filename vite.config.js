import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/convert': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
}) 
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'scroll-seamless': resolve(__dirname, '../../dist/react/index.esm.js')
    }
  },
  optimizeDeps: {
    exclude: ['scroll-seamless']
  },
  server: {
    port: 3002,
    open: true
  }
})

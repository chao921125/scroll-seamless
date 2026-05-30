import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      'scroll-seamless': resolve(__dirname, '../../dist/vue/index.esm.js')
    }
  },
  optimizeDeps: {
    exclude: ['scroll-seamless']
  },
  server: {
    port: 3001,
    open: true
  }
})

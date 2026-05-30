import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    // development alias
    // alias: {
    //   'scroll-seamless': '/src/core/index.ts',
    //   'scroll-seamless/vue': '/src/vue/index.ts',
    //   'scroll-seamless/react': '/src/react/index.ts',
    // }
  }
})
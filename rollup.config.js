/**
 * Rollup 构建配置 - Scroll Seamless v2
 * 
 * 支持多入口输出：
 * - core: 核心引擎和工具模块
 * - vue: Vue 3 组件
 * - react: React 组件
 * - plugins: 插件模块
 * - types: TypeScript 类型定义
 * 
 * 输出格式：
 * - ESM (.esm.js)
 * - CJS (.cjs.js)
 * - Types (.d.ts)
 */

import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import dts from 'rollup-plugin-dts'
import terser from '@rollup/plugin-terser'

// 外部依赖（不打包）
const external = ['vue', 'react', 'react-dom']

const typescriptPlugin = typescript({
  tsconfig: './tsconfig.json',
  declaration: false,
  compilerOptions: {
    declaration: false,
    outDir: 'dist'
  }
})

const resolvePlugin = nodeResolve({
  extensions: ['.js', '.ts', '.tsx']
})

const commonjsPlugin = commonjs()

const terserPlugin = terser({
  compress: {
    pure_funcs: ['console.log'],
    drop_console: false
  },
  mangle: {
    toplevel: true
  },
  format: {
    comments: false
  }
})


// 构建配置
export default [
  // ==================== Core 模块 ====================
  
  // Core ESM
  {
    input: 'src/core/index.ts',
    external,
    output: {
      file: 'dist/core/index.esm.js',
      format: 'es',
      exports: 'named',
      sourcemap: true
    },
    plugins: [
      resolvePlugin,
      commonjsPlugin,
      typescriptPlugin,
      terserPlugin
    ]
  },

  // Core CJS
  {
    input: 'src/core/index.ts',
    external,
    output: {
      file: 'dist/core/index.cjs.js',
      format: 'cjs',
      exports: 'named',
      sourcemap: true
    },
    plugins: [
      resolvePlugin,
      commonjsPlugin,
      typescriptPlugin,
      terserPlugin
    ]
  },

  // Core Types
  {
    input: 'src/core/index.ts',
    output: {
      file: 'dist/core/index.d.ts',
      format: 'es'
    },
    plugins: [dts()],
    external
  },

  // ==================== Vue 模块 ====================
  
  // Vue ESM
  {
    input: 'src/vue/index.ts',
    external,
    output: {
      file: 'dist/vue/index.esm.js',
      format: 'es',
      exports: 'named',
      sourcemap: true
    },
    plugins: [
      resolvePlugin,
      commonjsPlugin,
      typescriptPlugin,
      terserPlugin
    ]
  },

  // Vue CJS
  {
    input: 'src/vue/index.ts',
    external,
    output: {
      file: 'dist/vue/index.cjs.js',
      format: 'cjs',
      exports: 'named',
      sourcemap: true
    },
    plugins: [
      resolvePlugin,
      commonjsPlugin,
      typescriptPlugin,
      terserPlugin
    ]
  },

  // Vue Types
  {
    input: 'src/vue/index.ts',
    output: {
      file: 'dist/vue/index.d.ts',
      format: 'es'
    },
    plugins: [dts()],
    external
  },

  // ==================== React 模块 ====================
  
  // React ESM
  {
    input: 'src/react/index.ts',
    external,
    output: {
      file: 'dist/react/index.esm.js',
      format: 'es',
      exports: 'named',
      sourcemap: true
    },
    plugins: [
      resolvePlugin,
      commonjsPlugin,
      typescriptPlugin,
      terserPlugin
    ]
  },

  // React CJS
  {
    input: 'src/react/index.ts',
    external,
    output: {
      file: 'dist/react/index.cjs.js',
      format: 'cjs',
      exports: 'named',
      sourcemap: true
    },
    plugins: [
      resolvePlugin,
      commonjsPlugin,
      typescriptPlugin,
      terserPlugin
    ]
  },

  // React Types
  {
    input: 'src/react/index.ts',
    output: {
      file: 'dist/react/index.d.ts',
      format: 'es'
    },
    plugins: [dts()],
    external
  }
]

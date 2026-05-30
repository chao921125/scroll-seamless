/**
 * Rollup 构建配置 - React 模块
 */

import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import dts from 'rollup-plugin-dts'
import terser from '@rollup/plugin-terser'

// 外部依赖（不打包）
const external = ['react', 'react-dom']

const typescriptPlugin = typescript({
  tsconfig: './tsconfig.json',
  declaration: false,
  compilerOptions: {
    declaration: false,
    outDir: 'dist/react'
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

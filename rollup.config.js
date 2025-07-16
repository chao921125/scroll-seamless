import vue from '@vitejs/plugin-vue'
import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import dts from 'rollup-plugin-dts'
import { terser } from 'rollup-plugin-terser'
import postcss from 'rollup-plugin-postcss'

const external = ['vue', 'react', 'react-dom']

export default [
  // Vue ESM
  {
    input: 'src/vue/index.ts',
    external,
    output: {
      file: 'dist/vue/index.es.js',
      format: 'es',
      exports: 'named',
      sourcemap: true
    },
    plugins: [
      // 只处理 .ts 文件，不处理 .vue 文件
      typescript({ 
        tsconfig: './tsconfig.json', 
        declaration: false,
        compilerOptions: {
          declaration: false
        }
      }),
      nodeResolve(),
      commonjs(),
      postcss({
        extract: false,
        inject: true
      }),
      terser()
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
      // 只处理 .ts 文件，不处理 .vue 文件
      typescript({ 
        tsconfig: './tsconfig.json', 
        declaration: false,
        compilerOptions: {
          declaration: false
        }
      }),
      nodeResolve(),
      commonjs(),
      postcss({
        extract: false,
        inject: true
      }),
      terser()
    ]
  },
  // Vue types
  {
    input: 'src/vue/index.ts',
    output: { file: 'dist/vue/index.d.ts', format: 'es' },
    plugins: [
      dts()
    ],
    external
  },
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
      nodeResolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json', declaration: false }),
      terser()
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
      nodeResolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json', declaration: false }),
      terser()
    ]
  },
  // React types
  {
    input: 'src/react/index.ts',
    output: { file: 'dist/react/index.d.ts', format: 'es' },
    plugins: [dts()],
    external
  },
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
      nodeResolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json', declaration: false }),
      terser()
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
      nodeResolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json', declaration: false }),
      terser()
    ]
  },
  // Core types
  {
    input: 'src/core/index.ts',
    output: { file: 'dist/core/index.d.ts', format: 'es' },
    plugins: [dts()],
    external
  },
  // Types
  {
    input: 'src/types/index.ts',
    output: { file: 'dist/types/index.d.ts', format: 'es' },
    plugins: [dts()],
    external
  }
]
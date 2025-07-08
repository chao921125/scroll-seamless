import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import dts from 'rollup-plugin-dts';
import typescript from '@rollup/plugin-typescript';
import vue from 'rollup-plugin-vue';
import postcss from 'rollup-plugin-postcss';

const packages = ['core', 'vue', 'react'];

export default [
  // JS/TS 打包
  ...packages.map(pkg => (
    pkg === 'core'
      ? {
          input: `src/core/index.ts`,
          output: [
            {
              file: `dist/core/index.esm.js`,
              format: 'esm',
              sourcemap: true
            },
            {
              file: `dist/core/index.cjs.js`,
              format: 'cjs',
              sourcemap: true
            },
            {
              file: `dist/scroll-seamless.umd.js`,
              format: 'umd',
              name: 'ScrollSeamless',
              sourcemap: true
            }
          ],
          plugins: [resolve(), commonjs(), typescript({ declaration: false })],
          external: []
        }
      : pkg === 'vue'
      ? {
          input: `src/vue/index.ts`,
          output: [
            {
              file: `dist/vue/index.esm.js`,
              format: 'esm',
              sourcemap: true
            },
            {
              file: `dist/vue/index.cjs.js`,
              format: 'cjs',
              sourcemap: true
            }
          ],
          plugins: [
            vue({
              target: 'browser',
              preprocessStyles: true,
              css: true
            }),
            resolve(),
            postcss(),
            commonjs(),
            typescript({ declaration: false })
          ],
          external: ['vue']
        }
      : {
          input: `src/${pkg}/index.ts`,
          output: [
            {
              file: `dist/${pkg}/index.esm.js`,
              format: 'esm',
              sourcemap: true
            },
            {
              file: `dist/${pkg}/index.cjs.js`,
              format: 'cjs',
              sourcemap: true
            }
          ],
          plugins: [resolve(), commonjs(), typescript({ declaration: false })],
          external: []
        }
  )),
  // 只为 types 打包类型声明
  {
    input: 'src/types/index.d.ts',
    output: [{ file: 'dist/types/index.d.ts', format: 'es' }],
    plugins: [dts()]
  }
];

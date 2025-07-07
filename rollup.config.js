import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import dts from 'rollup-plugin-dts';
import typescript from '@rollup/plugin-typescript';
import vue from 'rollup-plugin-vue';
import postcss from 'rollup-plugin-postcss';

const packages = ['core', 'vue', 'react'];

export default [
  // JS/TS 打包
  ...packages.map(pkg => ({
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
    plugins:
      pkg === 'vue'
        ? [
            resolve(),
            vue({
              target: 'browser',
              preprocessStyles: true,
              css: true
            }),
            postcss(),
            commonjs(),
            typescript({ declaration: false })
          ]
        : [resolve(), commonjs(), typescript({ declaration: false })],
    external: pkg === 'vue' ? ['vue'] : []
  })),
  // 只为 types 打包类型声明
  {
    input: 'src/types/index.d.ts',
    output: [{ file: 'dist/types/index.d.ts', format: 'es' }],
    plugins: [dts()]
  }
];

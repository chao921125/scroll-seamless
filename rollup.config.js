import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import dts from 'rollup-plugin-dts';

const packages = ['core', 'vue', 'react'];

export default [
  // JS/TS 打包
  ...packages.map(pkg => ({
    input: `${pkg}/index.ts`,
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
    plugins: [resolve(), commonjs()],
    external: [] // 可根据需要配置外部依赖
  })),
  // 类型声明打包
  ...packages.map(pkg => ({
    input: `${pkg}/index.d.ts`,
    output: [{ file: `dist/${pkg}/index.d.ts`, format: 'es' }],
    plugins: [dts()]
  }))
];

# seamless-scroll

一个零依赖、支持 JS、Vue、React 的无缝滚动库，适用于跑马灯、公告栏、新闻等场景。

A seamless scroll library for JS, Vue, and React. Suitable for marquee, bulletin, news, etc.

---

## ✨ 特性 Features
- 零依赖，体积小巧 / Zero dependency, lightweight
- 支持 JS、Vue3、React / Support JS, Vue3, React
- 横向/纵向滚动 / Horizontal & vertical scroll
- 悬停暂停、鼠标滚轮 / Hover stop, mouse wheel
- 步进、贝塞尔曲线、单行模式 / Step, bezier, single line
- 样式可自定义 / Customizable style
- TypeScript 支持 / TypeScript support
- 可扩展、易维护 / Extensible & maintainable

---

## 🛠️ 功能 Features
- 支持多端导入：import、require、UMD
- 公共工具方法已抽离，便于复用和扩展
- 完整测试用例和丰富示例
- 入口文件 index.js/ts 在根目录，打包输出全部在 dist/

---

## 🚀 使用说明 Usage

### 安装 Install
```sh
npm install seamless-scroll
# or
yarn add seamless-scroll
# or
pnpm add seamless-scroll
```

### JS/TS
```js
import { SeamlessScroll } from 'seamless-scroll';
import 'seamless-scroll/dist/seamless-scroll.css';
const scroll = new SeamlessScroll(document.getElementById('box'), { data: ['A','B'] });
```

### Vue
```vue
<template>
  <SeamlessScrollVue :data="items" direction="horizontal" />
</template>
<script setup>
import SeamlessScrollVue from 'seamless-scroll/vue';
</script>
```

### React
```jsx
import SeamlessScroll from 'seamless-scroll/react';
<SeamlessScroll data={['A','B']} direction="horizontal" />
```

### require 方式
```js
const { SeamlessScroll } = require('seamless-scroll');
```

### 更多示例
- [examples/seamless-scroll-demo.js](examples/seamless-scroll-demo.js)
- [examples/seamless-scroll-vue-demo.vue](examples/seamless-scroll-vue-demo.vue)
- [examples/seamless-scroll-react-demo.jsx](examples/seamless-scroll-react-demo.jsx)

---

## 📖 API 文档 / API Docs
详见 [docs/api.md](docs/api.md) | [docs/api.en.md](docs/api.en.md)

## 🤝 贡献指南 / Contributing
详见 [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) | [docs/CONTRIBUTING.en.md](docs/CONTRIBUTING.en.md)

## 🔒 安全策略 / Security Policy
See [SECURITY.md](SECURITY.md)

---

## 📄 License
BSD-3-Clause

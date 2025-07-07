# seamless-scroll

A zero-dependency seamless scroll library for JS, Vue, and React. Suitable for marquee, bulletin, news, etc.

---

## ✨ Features
- Zero dependency, lightweight
- Support for JS, Vue3, React
- Horizontal & vertical scroll
- Hover stop, mouse wheel
- Step, bezier, single line
- Customizable style
- TypeScript support
- Extensible & maintainable

---

## 🛠️ Functionality
- Multi-platform import: import, require, UMD
- Common utility methods are extracted for reuse and extension
- Complete test cases and rich examples
- Entry file index.js/ts in root, all build outputs in dist/

---

## 🚀 Usage

### Install
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

### require usage
```js
const { SeamlessScroll } = require('seamless-scroll');
```

### More examples
- [examples/seamless-scroll-demo.js](examples/seamless-scroll-demo.js)
- [examples/seamless-scroll-vue-demo.vue](examples/seamless-scroll-vue-demo.vue)
- [examples/seamless-scroll-react-demo.jsx](examples/seamless-scroll-react-demo.jsx)

---

## 📖 API Docs
See [docs/api.en.md](docs/api.en.md) | [docs/api.md](docs/api.md)

## 🤝 Contributing
See [docs/CONTRIBUTING.en.md](docs/CONTRIBUTING.en.md) | [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)

## 🔒 Security Policy
See [SECURITY.md](SECURITY.md)

---

## 📄 License
BSD-3-Clause 
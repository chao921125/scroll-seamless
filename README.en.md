# seamless-scroll

[中文文档](./README.md) | English

A zero-dependency seamless scroll library for JS, Vue, and React. Suitable for marquee, bulletin, news, etc.

---

## ✨ Features
- Zero dependency, lightweight
- Support for JS, Vue3, React
- Horizontal & vertical scroll
- Hover stop, mouse wheel
- Step, bezier, single line
- **No built-in style, fully customizable**
- TypeScript support
- Extensible & maintainable

---

## 🛠️ Functionality
- Multi-platform import: import, require, UMD
- Common utility methods are extracted for reuse and extension
- Complete test cases and rich examples
- Entry file index.js/ts in root, all build outputs in dist/

---

## 🚀 Installation
```sh
npm install seamless-scroll
# or
yarn add seamless-scroll
# or
pnpm add seamless-scroll
```

---

## 📚 Usage

### 1. JS/TS
```js
import { SeamlessScroll } from 'seamless-scroll';
// No built-in style, add your own if needed

const container = document.getElementById('scroll-box');
const scroll = new SeamlessScroll(container, {
  data: ['Message 1', 'Message 2', 'Message 3'],
  direction: 'horizontal',
  step: 1,
  stepWait: 10,
  minCountToScroll: 2,
  hoverStop: true,
  wheelEnable: true,
});

// Update data dynamically
setTimeout(() => {
  scroll.updateData(['New 1', 'New 2', 'New 3']);
}, 5000);

// Stop scroll
// scroll.stop();

// Destroy instance
// scroll.destroy();
```

#### Browser usage
```html
<!-- No built-in style, add your own if needed -->
<div id="scroll-container" style="width:400px;height:40px;"></div>
<script src="dist/seamless-scroll.umd.js"></script>
<script>
  const container = document.getElementById('scroll-container');
  const scroll = new window.SeamlessScroll(container, {
    data: ['Seamless', 'Scroll', 'Demo'],
    direction: 'horizontal',
    step: 1,
    hoverStop: true
  });
</script>
```

### 2. Vue Component
```vue
<template>
  <div style="width: 400px; height: 40px; border: 1px solid #ccc;">
    <SeamlessScrollVue
      :data="items"
      direction="horizontal"
      :step="1"
      :stepWait="10"
      :minCountToScroll="2"
      :hoverStop="true"
      :wheelEnable="true"
      ref="scrollRef"
    >
      <template #default>
        <span v-for="item in items" :key="item" style="margin: 0 8px;">{{ item }}</span>
      </template>
    </SeamlessScrollVue>
  </div>
  <button @click="updateData">Update Data</button>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import SeamlessScrollVue from 'seamless-scroll/vue';
const items = ref(['Seamless', 'Scroll', 'Demo']);
const scrollRef = ref();
function updateData() {
  items.value = ['New 1', 'New 2', 'New 3'];
}
</script>
```

### 3. React Component
```jsx
import React, { useRef, useState } from 'react';
import SeamlessScroll from 'seamless-scroll/react';

export default function Demo() {
  const [items, setItems] = useState(['Seamless', 'Scroll', 'Demo']);
  const scrollRef = useRef();
  const updateData = () => setItems(['New 1', 'New 2', 'New 3']);
  return (
    <div>
      <div style={{ width: 400, height: 40, border: '1px solid #ccc' }}>
        <SeamlessScroll
          ref={scrollRef}
          data={items}
          direction="horizontal"
          step={1}
          stepWait={10}
          minCountToScroll={2}
          hoverStop={true}
          wheelEnable={true}
        >
          {items.map(item => (
            <span key={item} style={{ margin: '0 8px' }}>{item}</span>
          ))}
        </SeamlessScroll>
      </div>
      <button onClick={updateData}>Update Data</button>
    </div>
  );
}
```

### 4. require usage
```js
const { SeamlessScroll } = require('seamless-scroll');
```

---

## 🧩 More Examples
- [examples/seamless-scroll-demo.js](examples/seamless-scroll-demo.js)
- [examples/seamless-scroll-vue-demo.vue](examples/seamless-scroll-vue-demo.vue)
- [examples/seamless-scroll-react-demo.jsx](examples/seamless-scroll-react-demo.jsx)

---

## 📖 [API Docs (English)](docs/api.en.md) | [API 文档](docs/api.md)

## 🤝 [Contributing Guide (English)](docs/CONTRIBUTING.en.md) | [贡献指南](docs/CONTRIBUTING.md)

## 🔒 Security Policy
See [SECURITY.md](SECURITY.md)

---

## 📄 License
BSD-3-Clause 
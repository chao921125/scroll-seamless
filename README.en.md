# scroll-seamless

[English](./README.en.md) | 中文文档

A zero-dependency, seamless scroll library supporting JS, Vue, and React. Suitable for marquees, bulletins, news, and more.

---

## ✨ Features
- Zero dependency, lightweight
- Supports JS, Vue3, React
- Horizontal/vertical scrolling
- Pause on hover, mouse wheel support
- Step, bezier curve, single-line mode
- **No style restrictions, fully customizable**
- TypeScript support
- Extensible and easy to maintain

---

## 🛠️ Functionality
- Multi-platform import: import, require, UMD
- Common utility methods are extracted for reuse and extension
- Complete test cases and rich examples
- Entry file index.js/ts in the root directory, all build outputs in dist/

---

## 🚀 Installation
```sh
npm install scroll-seamless
# or
yarn add scroll-seamless
# or
pnpm add scroll-seamless
```

---

## 📚 Usage

### 1. JS/TS
```js
import { ScrollSeamless } from 'scroll-seamless';
const container = document.getElementById('scroll-box');
const scroll = new ScrollSeamless(container, {
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
<script src="dist/scroll-seamless.umd.js"></script>
<script>
  const container = document.getElementById('scroll-container');
  const scroll = new window.ScrollSeamless(container, {
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
    <ScrollSeamlessVue
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
    </ScrollSeamlessVue>
  </div>
  <button @click="updateData">Update Data</button>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import ScrollSeamlessVue from 'scroll-seamless/vue';
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
import ScrollSeamless from 'scroll-seamless/react';

export default function Demo() {
  const [items, setItems] = useState(['Seamless', 'Scroll', 'Demo']);
  const scrollRef = useRef();
  const updateData = () => setItems(['New 1', 'New 2', 'New 3']);
  return (
    <div>
      <div style={{ width: 400, height: 40, border: '1px solid #ccc' }}>
        <ScrollSeamless
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
        </ScrollSeamless>
      </div>
      <button onClick={updateData}>Update Data</button>
    </div>
  );
}
```

### 4. require usage
```js
const { ScrollSeamless } = require('scroll-seamless');
```

---

## 🧩 Examples
- [JS Example](examples/scroll-seamless-demo.js)
- [Vue Example](examples/scroll-seamless-vue-demo.vue)
- [React Example](examples/scroll-seamless-react-demo.jsx)

---

## 📖  API
- Supports horizontal and vertical scrolling, step, bezier curve, pause on hover, mouse wheel, dynamic data update, etc.
- For detailed parameters and methods, see: [API Docs](docs/API.en.md)

---

## 🤝 Contributing Guide
Please read [Contributing Guide](docs/CONTRIBUTING.en.md)

---

## 🔒 Security Policy
See [SECURITY.md](SECURITY.md)

---

## 📄 License
BSD-3-Clause 
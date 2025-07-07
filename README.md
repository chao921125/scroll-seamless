# scroll-seamless

[English](./README.en.md) | 中文文档

一个零依赖、支持 JS、Vue、React 的无缝滚动库，适用于跑马灯、公告栏、新闻等场景。

---

## ✨ 特性 Features
- 零依赖，体积小巧
- 支持 JS、Vue3、React
- 横向/纵向滚动
- 悬停暂停、鼠标滚轮
- 步进、贝塞尔曲线、单行模式
- **无任何样式限制，完全自定义**
- TypeScript 支持
- 可扩展、易维护

---

## 🛠️ 功能 Functionality
- 多端导入：import、require、UMD
- 公共工具方法已抽离，便于复用和扩展
- 完整测试用例和丰富示例
- 入口文件 index.js/ts 在根目录，打包输出全部在 dist/

---

## 🚀 安装 Installation
```sh
npm install scroll-seamless
# 或 or
yarn add scroll-seamless
# 或 or
pnpm add scroll-seamless
```

---

## 📚 使用说明 Usage

### 1. JS/TS
```js
import { ScrollSeamless } from 'scroll-seamless';
// 本库不包含任何样式限制，如需样式请自行添加

const container = document.getElementById('scroll-box');
const scroll = new ScrollSeamless(container, {
  data: ['消息1', '消息2', '消息3'],
  direction: 'horizontal',
  step: 1,
  stepWait: 10,
  minCountToScroll: 2,
  hoverStop: true,
  wheelEnable: true,
});

// 动态更新数据
timer = setTimeout(() => {
  scroll.updateData(['新数据1', '新数据2', '新数据3']);
}, 5000);

// 停止滚动
// scroll.stop();

// 销毁实例
// scroll.destroy();
```

#### 浏览器直接用法
```html
<!-- 本库不包含任何样式限制，如需样式请自行添加 -->
<div id="scroll-container" style="width:400px;height:40px;"></div>
<script src="dist/scroll-seamless.umd.js"></script>
<script>
  const container = document.getElementById('scroll-container');
  const scroll = new window.ScrollSeamless(container, {
    data: ['无缝', '滚动', '示例', 'Seamless', 'Scroll', 'Demo'],
    direction: 'horizontal',
    step: 1,
    hoverStop: true
  });
</script>
```

### 2. Vue 组件
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
  <button @click="updateData">更新数据</button>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import ScrollSeamlessVue from 'scroll-seamless/vue';
const items = ref(['无缝', '滚动', '示例', 'Seamless', 'Scroll', 'Demo']);
const scrollRef = ref();
function updateData() {
  items.value = ['新数据1', '新数据2', '新数据3'];
}
</script>
```

### 3. React 组件
```jsx
import React, { useRef, useState } from 'react';
import ScrollSeamless from 'scroll-seamless/react';

export default function Demo() {
  const [items, setItems] = useState(['无缝', '滚动', '示例', 'Seamless', 'Scroll', 'Demo']);
  const scrollRef = useRef();
  const updateData = () => setItems(['新数据1', '新数据2', '新数据3']);
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
      <button onClick={updateData}>更新数据</button>
    </div>
  );
}
```

### 4. require 方式
```js
const { ScrollSeamless } = require('scroll-seamless');
```

---

## 🧩 更多示例 More Examples
- [examples/scroll-seamless-demo.js](examples/scroll-seamless-demo.js)
- [examples/scroll-seamless-vue-demo.vue](examples/scroll-seamless-vue-demo.vue)
- [examples/scroll-seamless-react-demo.jsx](examples/scroll-seamless-react-demo.jsx)

---

## 📖 [API 文档](docs/api.md) | [API Docs (English)](docs/api.en.md)

## 🤝 [贡献指南](docs/CONTRIBUTING.md) | [Contributing Guide (English)](docs/CONTRIBUTING.en.md)

## 🔒 安全策略 / Security Policy
See [SECURITY.md](SECURITY.md)

---

## 📄 License
BSD-3-Clause

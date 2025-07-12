# scroll-seamless

> 🚩 一个零依赖、支持 JS、Vue、React 的无缝滚动库，适用于跑马灯、公告栏、新闻等场景。


[![npm version](https://img.shields.io/npm/v/scroll-seamless.svg)](https://www.npmjs.com/package/scroll-seamless)
[![npm downloads](https://img.shields.io/npm/dm/scroll-seamless.svg)](https://www.npmjs.com/package/scroll-seamless)
[![License](https://img.shields.io/npm/l/scroll-seamless.svg)](https://github.com/chao921125/scroll-seamless/blob/main/LICENSE)


[English](./README.en.md) | 中文文档

---

## ✨ 特性
- 零依赖，体积小巧
- 支持 JS、Vue3、React
- 横向/纵向滚动
- 悬停暂停、鼠标滚轮
- 步进、贝塞尔曲线、单行模式
- **无任何样式限制，完全自定义**
- TypeScript 支持
- 可扩展、易维护

---

## 🛠️ 功能
- 多端导入：import、require、UMD
- 公共工具方法已抽离，便于复用和扩展
- 完整测试用例和丰富示例
- 入口文件 index.js/ts 在根目录，打包输出全部在 dist/

---

## 🚀 安装
```sh
npm install scroll-seamless
# 或
yarn add scroll-seamless
# 或
pnpm add scroll-seamless
```

---

## 📚 使用说明

### 1. JS/TS
```js
import { ScrollSeamless } from 'scroll-seamless';
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
```

### 2. Vue 组件
```vue
<template>
  <!-- 兼容模式（默认，支持作用域插槽） -->
  <ScrollSeamlessVue :data="items" direction="horizontal">
    <template #default="{ item, index }">
      <span>{{ item }}</span>
    </template>
  </ScrollSeamlessVue>

  <!-- 完全自定义模式（custom=true，slot 只渲染一次，用户可自定义结构） -->
  <ScrollSeamlessVue :data="items" direction="horizontal" :custom="true">
    <span v-for="item in items" :key="item">{{ item }}</span>
  </ScrollSeamlessVue>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import ScrollSeamlessVue from 'scroll-seamless/vue';
const items = ref(['无缝', '滚动', '示例']);
</script>
```

### 3. React 组件
```jsx
import React, { useRef, useState } from 'react';
import ScrollSeamless from 'scroll-seamless/react';
export default function Demo() {
  const [items, setItems] = useState(['无缝', '滚动', '示例']);
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
          {items.map((item, idx) => (
            <span key={idx} style={{ margin: '0 8px' }}>{item}</span>
          ))}
        </ScrollSeamless>
      </div>
      <button onClick={updateData}>更新数据</button>
    </div>
  );
}
```

---

## 📖  API
- 支持横纵向滚动、步进、贝塞尔曲线、悬停暂停、鼠标滚轮、动态数据更新等
- 详细参数与方法请见：[API 文档](docs/API.md)

---

## 🧩 示例
- [JS 示例](examples/scroll-seamless-demo.js)
- [Vue 示例](examples/scroll-seamless-vue-demo.vue)
- [React 示例](examples/scroll-seamless-react-demo.jsx)

---

## 🤝 贡献指南
请阅读 [贡献指南](docs/CONTRIBUTING.md)

---

## 🔒 安全策略
See [SECURITY.md](SECURITY.md)

---

## 📄 License
BSD-3-Clause


基于对本项目结构和实现的阅读，给出以下优化与重构建议：

组件渲染一致性
React 和 Vue 组件的 slot/children 渲染方式建议统一，均采用“作用域插槽/函数式 children”模式，由组件内部统一渲染 data，slot/children 只负责渲染单项，便于维护和扩展。

样式隔离与自定义
建议将核心样式（如横纵向排列、内容复制）与用户自定义样式解耦，核心样式只保证功能，外部样式通过 class/props 扩展，提升灵活性。

逻辑抽离与复用
核心滚动逻辑（如内容复制、动画、事件）可进一步抽离为 hooks/composables（如 useSeamlessScroll），供多端（JS/Vue/React）共用，减少重复代码。

类型与文档完善
TypeScript 类型定义建议更细致，props、事件、方法都应有完整类型说明。API 文档可补充更多自定义用例和边界场景说明。

测试用例补充
建议增加更多边界测试，如极少/极多数据、动态切换方向、极端尺寸、slot/children 复杂内容等，提升健壮性。

性能优化
大数据量时可考虑虚拟滚动（只渲染可视区内容），减少 DOM 数量，提升性能。

事件与回调
可增加滚动周期、到达边界等事件回调，便于业务侧监听和扩展。

如需针对某一建议详细展开或需要具体代码示例，请告知！
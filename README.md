# Scroll Seamless

[![npm version](https://img.shields.io/npm/v/scroll-seamless.svg)](https://www.npmjs.com/package/scroll-seamless)
[![npm downloads](https://img.shields.io/npm/dm/scroll-seamless.svg)](https://www.npmjs.com/package/scroll-seamless)
[![License](https://img.shields.io/npm/l/scroll-seamless.svg)](https://github.com/chao921125/scroll-seamless/blob/main/LICENSE)

> 一个高性能、功能丰富的无缝滚动库，支持 JavaScript、Vue3 和 React，适用于各种滚动展示场景。

## 简介

Scroll Seamless 是一个专为现代 Web 应用设计的无缝滚动库，提供了流畅的滚动体验和丰富的自定义选项。无论是简单的文本轮播，还是复杂的数据展示，Scroll Seamless 都能满足您的需求。支持多种框架集成，性能优化，以及大数据量处理。

本库专注于提供高性能、低内存占用的滚动解决方案，通过优化的渲染策略和内存管理，即使在移动设备上也能保持流畅的滚动体验。同时，丰富的 API 和插件系统使其能够适应各种复杂场景的需求。

## 特性

### 核心功能

- 🚀 **高性能无缝滚动** - 优化的渲染和动画，确保流畅的滚动体验
- 🎯 **多方向支持** - 灵活支持上/下/左/右四个方向的滚动
- 🔄 **真正的无缝衔接** - 精确计算确保无空白间隙，完美循环
- 🧩 **多行多列布局** - 支持复杂的网格布局，满足多样化展示需求

### 用户体验

- 🖱️ **交互控制** - 鼠标悬停暂停、滚轮控制等交互功能
- 📱 **响应式设计** - 自适应不同屏幕尺寸，完美适配移动设备
- ♿ **无障碍功能** - 支持屏幕阅读器和键盘导航，提升可访问性
- 🎛️ **丰富的配置选项** - 可定制的速度、间隔、动画效果等参数

### 开发友好

- 🎨 **统一的渲染模式** - 在 React（函数式 children）和 Vue（作用域插槽）中保持一致的 API
- 🔧 **TypeScript 支持** - 完整的类型定义，提供良好的开发体验
- 🔌 **插件系统** - 可扩展的插件架构，轻松添加自定义功能
- 📊 **性能监控** - 内置性能分析工具，帮助优化应用

### 高级特性

- ⚡ **虚拟滚动** - 高效处理大数据量（10000+ 条），显著提升性能
- 🧩 **自定义渲染** - 完全控制每个滚动项的渲染方式
- 🔄 **数据驱动更新** - 响应式数据变化，自动更新滚动内容
- 🛠️ **丰富的 API** - 提供全面的方法和事件，满足复杂场景需求

## 安装

### NPM

```bash
npm install scroll-seamless
```

### Yarn

```bash
yarn add scroll-seamless
```

### PNPM

```bash
pnpm add scroll-seamless
```

### CDN

```html
<script src="https://unpkg.com/scroll-seamless/dist/scroll-seamless.min.js"></script>
```

## 使用方法

### React 组件

```jsx
import React, { useRef } from "react";
import { ScrollSeamless } from "scroll-seamless/react";

const MyComponent = () => {
  const scrollRef = useRef(null);
  const data = ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"];

  return (
    <div style={{ width: "300px", height: "50px" }}>
      <ScrollSeamless
        ref={scrollRef}
        data={data}
        direction="right"
        step={1}
        hoverStop={true}
        wheelEnable={true}
        rows={1}
        cols={1}
        itemClass="custom-item-class"
      >
        {/* 函数式 children - 渲染单个项目 */}
        {(item, index) => (
          <div
            key={index}
            style={{
              padding: "10px",
              margin: "0 5px",
              backgroundColor: "#f0f0f0",
              borderRadius: "4px",
            }}
          >
            {item}
          </div>
        )}
      </ScrollSeamless>
      
      {/* 控制按钮 */}
      <div className="controls">
        <button onClick={() => scrollRef.current?.start()}>开始</button>
        <button onClick={() => scrollRef.current?.stop()}>停止</button>
        <button onClick={() => scrollRef.current?.updateData()}>更新数据</button>
      </div>
    </div>
  );
};
```

### Vue 组件

```vue
<template>
  <div style="width: 300px; height: 50px;">
    <ScrollSeamless
      ref="scrollRef"
      :data="data"
      direction="right"
      :step="1"
      :hover-stop="true"
      :wheel-enable="true"
      :rows="1"
      :cols="1"
      item-class="custom-item-class"
      v-model="isScrolling"
    >
      <!-- 作用域插槽 - 渲染单个项目 -->
      <template #default="{ item, index }">
        <div
          :key="index"
          style="
          padding: 10px; 
          margin: 0 5px; 
          background-color: #f0f0f0;
          border-radius: 4px;
        "
        >
          {{ item }}
        </div>
      </template>
    </ScrollSeamless>
    
    <!-- 控制按钮 -->
    <div class="controls">
      <button @click="startScroll">开始</button>
      <button @click="stopScroll">停止</button>
      <button @click="updateScrollData">更新数据</button>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { ScrollSeamless } from "scroll-seamless/vue";

export default {
  components: { ScrollSeamless },
  setup() {
    const scrollRef = ref(null);
    const data = ref(["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"]);
    const isScrolling = ref(true);
    
    const startScroll = () => {
      scrollRef.value?.start();
    };
    
    const stopScroll = () => {
      scrollRef.value?.stop();
    };
    
    const updateScrollData = () => {
      data.value = [...data.value, "New Item " + (data.value.length + 1)];
      scrollRef.value?.updateData();
    };

    return { 
      scrollRef, 
      data, 
      isScrolling,
      startScroll,
      stopScroll,
      updateScrollData
    };
  },
};
</script>
```

### JavaScript 核心库

```javascript
import { ScrollSeamless } from "scroll-seamless/core";

const container = document.getElementById("scroll-container");
const scrollInstance = new ScrollSeamless(container, {
  data: ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"],
  direction: "right",
  step: 1,
  hoverStop: true,
  wheelEnable: true,
  rows: 1,
  cols: 1,
  plugins: [], // 可选：添加自定义插件
  performance: { enabled: true }, // 启用性能监控
  accessibility: { enabled: true } // 启用无障碍功能
});

// 控制方法
scrollInstance.start();
scrollInstance.stop();
scrollInstance.updateData();
scrollInstance.destroy();

// 获取状态
const position = scrollInstance.getPosition();
const isRunning = scrollInstance.isRunning();

// 设置选项
scrollInstance.setOptions({
  step: 2,
  direction: "left"
});
```

## 多行多列布局

Scroll Seamless 支持多行多列布局，可以通过 `rows` 和 `cols` 参数来控制：

```jsx
// React 多行多列示例
<ScrollSeamless
  data={data}
  direction="left"
  rows={2}
  cols={2}
>
  {(item, index, rowIndex, colIndex) => (
    <div key={index}>
      {item} (行: {rowIndex}, 列: {colIndex})
    </div>
  )}
</ScrollSeamless>
```

```vue
<!-- Vue 多行多列示例 -->
<ScrollSeamless
  :data="data"
  direction="left"
  :rows="2"
  :cols="2"
>
  <template #default="{ item, index, rowIndex, colIndex }">
    <div :key="index">
      {{ item }} (行: {{ rowIndex }}, 列: {{ colIndex }})
    </div>
  </template>
</ScrollSeamless>
```

## 虚拟滚动（大数据量优化）

对于大数据量场景（如 10000+ 条数据），可以使用虚拟滚动插件来优化性能：

```javascript
import { ScrollSeamless } from "scroll-seamless/core";
import { createVirtualScrollPlugin } from "scroll-seamless/plugins";

// 创建虚拟滚动插件
const virtualScrollPlugin = createVirtualScrollPlugin({
  enabled: true,
  itemWidth: 200, // 每个 item 宽度
  itemHeight: 40, // 每个 item 高度
  bufferSize: 10, // 缓冲区大小
  onRender: (startIndex, endIndex, visibleCount) => {
    console.log(
      `渲染范围: ${startIndex} - ${endIndex}, 可见数量: ${visibleCount}`
    );
  },
});

// 使用插件
const scrollInstance = new ScrollSeamless(container, {
  data: largeData, // 大数据量
  plugins: [virtualScrollPlugin],
  onEvent: (event, data) => {
    if (event === "virtual-scroll-update") {
      console.log("性能指标:", data);
    }
  },
});
```

**性能对比：**

- 传统渲染：需要渲染 `数据量 × 2` 个 DOM 节点
- 虚拟滚动：只渲染可视区域 + 缓冲区的节点
- 性能提升：显著减少内存占用和渲染时间

## 自定义样式

Scroll Seamless 组件核心样式只保证功能性（布局、溢出、内容复制），所有视觉样式均可由用户自定义。

### React 自定义样式

- `className`/`style`：作用于最外层容器
- `contentClassName`：作用于每个内容区（.ss-content）
- `itemClassName`：作用于每个单项

**示例：**

```jsx
<ScrollSeamless
  data={data}
  className="my-scroll-root"
  style={{ border: "1px solid #f00" }}
  contentClassName="my-content"
  itemClassName="my-item"
>
  {(item) => <span>{item}</span>}
</ScrollSeamless>
```

```css
.my-scroll-root {
  background: #fafafa;
}
.my-content {
  padding: 8px 0;
}
.my-item {
  color: #1976d2;
  font-weight: bold;
}
```

### Vue 自定义样式

- `class`/`style`：作用于最外层容器
- `content-class`：作用于每个内容区（.ss-content）
- `item-class`：作用于每个单项

**示例：**

```vue
<ScrollSeamless
  :data="data"
  class="my-scroll-root"
  :style="{ border: '1px solid #f00' }"
  content-class="my-content"
  item-class="my-item"
>
  <template #default="{ item }">
    <span>{{ item }}</span>
  </template>
</ScrollSeamless>
```

## 浏览器兼容性

Scroll Seamless 支持所有现代浏览器，包括：

| Chrome | Firefox | Safari | Edge | IE   | Opera |
| ------ | ------- | ------ | ---- | ---- | ----- |
| 60+    | 60+     | 12+    | 79+  | 11+  | 50+   |

## 常见问题解答

### Q: 如何在动态数据变化时更新滚动内容？

A: 当数据发生变化时，调用组件实例的 `updateData()` 方法即可重新渲染内容。

### Q: 如何控制滚动速度？

A: 通过 `step` 参数控制每一步的像素移动量，数值越大滚动越快。

### Q: 如何在特定条件下暂停滚动？

A: 除了 `hoverStop` 参数外，您还可以随时调用 `stop()` 和 `start()` 方法来控制滚动状态。

### Q: 如何处理大量数据的性能问题？

A: 对于大数据量场景，请使用虚拟滚动插件，它可以显著减少 DOM 节点数量，提高性能。

## 文档

- [快速入门](./docs/QUICK-START.md) - 快速上手指南
- [API 文档](./docs/API.md) - 详细的 API 参考
- [API 文档（英文）](./docs/API.en.md) - API 参考（英文版）
- [React 集成指南](./docs/REACT.md) - React 组件详细使用说明
- [Vue 集成指南](./docs/VUE.md) - Vue 组件详细使用说明
- [贡献指南](./docs/CONTRIBUTING.md) - 如何参与项目开发
- [贡献指南（英文）](./docs/CONTRIBUTING.en.md) - 如何参与项目开发（英文版）
- [安全政策](./docs/SECURITY.md) - 安全漏洞报告流程
- [插件系统](./docs/PLUGINS.md) - 插件系统使用和开发指南
- [虚拟滚动](./docs/VIRTUAL-SCROLL.md) - 虚拟滚动功能详解

## 许可证

BSD-3-Clause
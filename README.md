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

### JavaScript 核心库

```javascript
import { ScrollEngine } from 'scroll-seamless'

const container = document.getElementById('scroll-container')
const scrollInstance = new ScrollEngine(container, {
  data: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'],
  direction: 'left',
  step: 1,
  hoverStop: false,
  wheelEnable: true,
  autoStart: true
})

// 控制方法
scrollInstance.start()
scrollInstance.stop()
scrollInstance.pause()
scrollInstance.resume()
scrollInstance.update()
scrollInstance.destroy()

// 获取状态
const position = scrollInstance.getPosition()
const isRunning = scrollInstance.getIsRunning()
const isPaused = scrollInstance.getIsPaused()
const cycleCount = scrollInstance.getCycleCount()
```

### React 组件

```jsx
import React, { useRef } from 'react'
import { ScrollSeamless } from 'scroll-seamless/react'
import type { ScrollSeamlessRef } from 'scroll-seamless/react'

const MyComponent = () => {
  const scrollRef = useRef<ScrollSeamlessRef>(null)
  const data = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5']

  return (
    <div style={{ width: '300px', height: '50px' }}>
      <ScrollSeamless
        ref={scrollRef}
        data={data}
        direction='left'
        step={1}
        hoverStop={false}
        wheelEnable={true}
        autoStart={true}
      />
      
      {/* 控制按钮 */}
      <div className='controls'>
        <button onClick={() => scrollRef.current?.start()}>开始</button>
        <button onClick={() => scrollRef.current?.stop()}>停止</button>
        <button onClick={() => scrollRef.current?.pause()}>暂停</button>
        <button onClick={() => scrollRef.current?.resume()}>恢复</button>
      </div>
    </div>
  )
}
```

### Vue 组件

```vue
<template>
  <div style="width: 300px; height: 50px;">
    <ScrollSeamless
      ref="scrollRef"
      :data="data"
      direction="left"
      :step="1"
      :hover-stop="false"
      :wheel-enable="true"
      :auto-start="true"
    />
    
    <!-- 控制按钮 -->
    <div class="controls">
      <button @click="startScroll">开始</button>
      <button @click="stopScroll">停止</button>
      <button @click="pauseScroll">暂停</button>
      <button @click="resumeScroll">恢复</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ScrollSeamless } from 'scroll-seamless/vue'

const scrollRef = ref(null)
const data = ref(['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'])

const startScroll = () => {
  scrollRef.value?.start()
}

const stopScroll = () => {
  scrollRef.value?.stop()
}

const pauseScroll = () => {
  scrollRef.value?.pause()
}

const resumeScroll = () => {
  scrollRef.value?.resume()
}
</script>
```

## 多行多列布局

Scroll Seamless 支持多行多列布局，可以通过 `rows` 和 `cols` 参数来控制：

```javascript
import { ScrollEngine } from 'scroll-seamless'

const scrollInstance = new ScrollEngine(container, {
  data: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'],
  direction: 'left',
  rows: 2,  // 水平滚动时，2行垂直排列
  cols: 1   // 水平滚动时，cols参数无效
})

// 垂直滚动时相反
const verticalScroll = new ScrollEngine(container, {
  data: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'],
  direction: 'up',
  rows: 1,  // 垂直滚动时，rows参数无效
  cols: 2   // 垂直滚动时，2列水平排列
})
```

## 自定义渲染

可以通过 `renderItem` 选项自定义每个滚动项的渲染方式：

```javascript
import { ScrollEngine } from 'scroll-seamless'

const scrollInstance = new ScrollEngine(container, {
  data: ['Item 1', 'Item 2', 'Item 3'],
  direction: 'left',
  renderItem: (item, index) => {
    const element = document.createElement('div')
    element.className = 'custom-item'
    element.textContent = `${index + 1}: ${item}`
    element.style.padding = '10px'
    element.style.margin = '0 5px'
    element.style.backgroundColor = '#f0f0f0'
    return element
  }
})
```

## 自定义样式

Scroll Seamless 组件核心样式只保证功能性（布局、溢出、内容复制），所有视觉样式均可由用户自定义。

### React 组件样式

通过 `className` 和 `style` 属性设置容器样式：

```jsx
<ScrollSeamless
  data={data}
  className="my-scroll-container"
  style={{ border: '1px solid #f00', backgroundColor: '#fafafa' }}
/>
```

### Vue 组件样式

通过 `class` 和 `style` 属性设置容器样式：

```vue
<ScrollSeamless
  :data="data"
  class="my-scroll-container"
  :style="{ border: '1px solid #f00', backgroundColor: '#fafafa' }"
/>
```

### JavaScript 核心库样式

通过CSS设置容器和内容区的样式：

```javascript
// 设置容器样式
container.style.border = '1px solid #f00'
container.style.backgroundColor = '#fafafa'

// 通过CSS类设置样式
container.className = 'my-scroll-container'
```

```css
.my-scroll-container {
  border: 1px solid #f00;
  background-color: #fafafa;
}

/* 内容区样式 */
.ss-content {
  padding: 8px 0;
}
```

## 浏览器兼容性

Scroll Seamless 支持所有现代浏览器，包括：

| Chrome | Firefox | Safari | Edge | IE  | Opera |
| ------ | ------- | ------ | ---- | --- | ----- |
| 60+    | 60+     | 12+    | 79+  | 11+ | 50+   |

## 常见问题解答

### Q: 如何在动态数据变化时更新滚动内容？

A: 当数据发生变化时，调用实例的 `update()` 方法即可重新渲染内容。

### Q: 如何控制滚动速度？

A: 通过 `step` 参数控制每一步的像素移动量，数值越大滚动越快。

### Q: 如何在特定条件下暂停滚动？

A: 除了 `hoverStop` 参数外，您还可以随时调用 `pause()` 和 `resume()` 方法来控制滚动状态，或者使用 `stop()` 和 `start()` 方法。

### Q: 如何处理大量数据的性能问题？

A: 对于大数据量场景，可以通过设置合理的 `estimatedItemSize` 和 `bufferSize` 参数来优化性能。

## 文档

- [快速入门](./docs/QUICK-START.md) - 快速上手指南
- [API 文档](./docs/API.md) - 详细的 API 参考
- [API 文档（英文）](./docs/API.en.md) - API 参考（英文版）
- [React 集成指南](./docs/REACT.md) - React 组件详细使用说明
- [Vue 集成指南](./docs/VUE.md) - Vue 组件详细使用说明
- [贡献指南](./docs/CONTRIBUTING.md) - 如何参与项目开发
- [贡献指南（英文）](./docs/CONTRIBUTING.en.md) - 如何参与项目开发（英文版）
- [安全政策](./docs/SECURITY.md) - 安全漏洞报告流程

## 许可证

BSD-3-Clause

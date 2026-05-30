# Scroll Seamless 快速入门指南

本指南将帮助您快速上手 Scroll Seamless 库，实现无缝滚动效果。

## 目录

- [安装](#安装)
- [基础用法](#基础用法)
  - [JavaScript](#javascript)
  - [React](#react)
  - [Vue](#vue)
- [常用配置](#常用配置)
- [控制方法](#控制方法)
- [事件监听](#事件监听)
- [进阶用法](#进阶用法)

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

## 基础用法

### JavaScript

1. 创建一个容器元素：

```html
<div id="scroll-container" style="width: 300px; height: 50px; overflow: hidden;"></div>
```

2. 初始化滚动实例：

```javascript
// ESM 方式（推荐）
import ScrollSeamless from 'scroll-seamless'

// 或 CommonJS 方式
// const ScrollSeamless = require('scroll-seamless').default

// 获取容器元素
const container = document.getElementById("scroll-container")

// 创建数据
const data = ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"]

// 初始化滚动实例
const scrollInstance = new ScrollSeamless(container, {
  data: data,
  direction: "left", // 滚动方向：left, right, up, down
  step: 1, // 每步移动像素
  hoverStop: false // 鼠标悬停暂停
})

// 开始滚动
scrollInstance.start()
```

### React

1. 安装依赖：

```bash
npm install scroll-seamless
```

2. 在组件中使用：

```jsx
import React, { useRef } from "react";
import ScrollSeamless, { ScrollSeamlessRef } from "scroll-seamless";

function ScrollDemo() {
  const scrollRef = useRef<ScrollSeamlessRef>(null);
  const data = ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"];

  return (
    <div>
      {/* 基本用法 */}
      <div style={{ width: "300px", height: "50px", margin: "20px 0" }}>
        <ScrollSeamless
          ref={scrollRef}
          data={data}
          direction="left"
          step={1}
          hoverStop={false}
        />
      </div>

      {/* 控制按钮 */}
      <div>
        <button onClick={() => scrollRef.current?.start()}>开始</button>
        <button onClick={() => scrollRef.current?.stop()}>停止</button>
      </div>
    </div>
  );
}

export default ScrollDemo;
```

### Vue

1. 安装依赖：

```bash
npm install scroll-seamless
```

2. 在组件中使用：

```vue
<template>
  <div>
    <!-- 基本用法 -->
    <div style="width: 300px; height: 50px; margin: 20px 0;">
      <ScrollSeamless
        ref="scrollRef"
        :data="data"
        direction="left"
        :step="1"
        :hover-stop="true"
      />
    </div>

    <!-- 控制按钮 -->
    <div>
      <button @click="startScroll">开始</button>
      <button @click="stopScroll">停止</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import ScrollSeamless, { ScrollSeamlessExpose } from "scroll-seamless"

const scrollRef = ref<ScrollSeamlessExpose | null>(null)
const data = ref(["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"])

const startScroll = () => {
  scrollRef.value?.start()
}

const stopScroll = () => {
  scrollRef.value?.stop()
}
</script>
```

## 导入方式

Scroll Seamless 支持多种导入方式，推荐使用默认导入：

### ESM 方式（推荐）

```javascript
// 默认导入（与 Vue/React 保持一致）
import ScrollSeamless from 'scroll-seamless'

// 命名导入
import { ScrollEngine } from 'scroll-seamless'

// 混合导入
import ScrollSeamless, { ScrollEngine, ScrollEventType } from 'scroll-seamless'
```

### CommonJS 方式

```javascript
// 使用 .default
const ScrollSeamless = require('scroll-seamless').default

// 或命名导出
const { ScrollEngine } = require('scroll-seamless')
```

### Vue 3

```vue
<script setup lang="ts">
import ScrollSeamless, { ScrollSeamlessExpose } from 'scroll-seamless'
</script>
```

### React

```tsx
import ScrollSeamless, { ScrollSeamlessRef } from 'scroll-seamless'
```

> 更多信息请参考 [导入方式指南](../examples/IMPORT-GUIDE.md)

## 常用配置

Scroll Seamless 提供了多种配置选项，以下是最常用的一些：

| 配置项 | 类型 | 默认值 | 说明 |
|-------|------|-------|------|
| `data` | `string[]` | `[]` | 滚动数据数组 |
| `direction` | `'up' \| 'down' \| 'left' \| 'right'` | `'left'` | 滚动方向（所有方向已修复并正常工作） |
| `step` | `number` | `1` | 每步移动像素 |
| `stepWait` | `number` | `0` | 每步等待时间(ms) |
| `delay` | `number` | `0` | 初始延迟时间(ms) |
| `hoverStop` | `boolean` | `false` | 鼠标悬停是否暂停 |
| `wheelEnable` | `boolean` | `false` | 是否启用滚轮控制 |
| `rows` | `number` | `1` | 行数 |
| `cols` | `number` | `1` | 列数 |

## 控制方法

Scroll Seamless 实例提供了以下控制方法：

```javascript
// 开始滚动
scrollInstance.start();

// 停止滚动
scrollInstance.stop();

// 更新数据（数据变化后调用）
scrollInstance.updateData();

// 销毁实例（组件卸载时调用）
scrollInstance.destroy();

// 获取当前位置
const position = scrollInstance.getPosition();

// 检查是否正在滚动
const isRunning = scrollInstance.isRunning();

// 更新配置选项
scrollInstance.setOptions({
  step: 2,
  direction: "right"
});
```

## 事件监听

Scroll Seamless 支持多种事件监听：

```javascript
const scrollInstance = new ScrollSeamless(container, {
  data: data,
  onEvent: (event, data) => {
    switch (event) {
      case 'start':
        console.log('滚动开始', data);
        break;
      case 'stop':
        console.log('滚动停止', data);
        break;
      case 'cycle':
        console.log('完成一次循环', data);
        break;
      case 'reach-end':
        console.log('到达终点', data);
        break;
    }
  }
});
```

## 进阶用法

### 多行多列布局

```javascript
const scrollInstance = new ScrollSeamless(container, {
  data: Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`),
  direction: 'left',
  rows: 2,
  cols: 2
});
```

### 使用插件

```javascript
import ScrollSeamless from "scroll-seamless"
import { createVirtualScrollPlugin } from "scroll-seamless"

// 创建虚拟滚动插件
const virtualScrollPlugin = createVirtualScrollPlugin({
  enabled: true,
  itemWidth: 200,
  itemHeight: 40,
  bufferSize: 10
})

// 使用插件
const scrollInstance = new ScrollSeamless(container, {
  data: largeData,
  plugins: [virtualScrollPlugin]
})
```

### 自定义渲染

在 React 中：

```jsx
<ScrollSeamless
  data={data}
  custom={true}
>
  <div style={{ display: "flex", gap: "10px" }}>
    {data.map((item, index) => (
      <div key={index} className="custom-item">
        {item}
      </div>
    ))}
  </div>
</ScrollSeamless>
```

在 Vue 中：

```vue
<ScrollSeamless
  :data="data"
  :custom="true"
>
  <div style="display: flex; gap: 10px;">
    <div 
      v-for="(item, index) in data" 
      :key="index"
      class="custom-item"
    >
      {{ item }}
    </div>
  </div>
</ScrollSeamless>
```

## 方向示例

### 所有方向滚动示例

```javascript
// 向左滚动（默认）
const leftScroll = new ScrollSeamless(container, {
  data: ["项目 1", "项目 2", "项目 3"],
  direction: "left"
});

// 向右滚动（已修复）
const rightScroll = new ScrollSeamless(container, {
  data: ["项目 1", "项目 2", "项目 3"],
  direction: "right"
});

// 向上滚动（已修复空白问题）
const upScroll = new ScrollSeamless(container, {
  data: ["项目 1", "项目 2", "项目 3"],
  direction: "up"
});

// 向下滚动（已修复）
const downScroll = new ScrollSeamless(container, {
  data: ["项目 1", "项目 2", "项目 3"],
  direction: "down"
});
```

### React 中的方向切换

```jsx
import React, { useState, useRef } from "react";
import ScrollSeamless, { ScrollSeamlessRef } from "scroll-seamless";

function DirectionDemo() {
  const scrollRef = useRef<ScrollSeamlessRef>(null);
  const [direction, setDirection] = useState("left");
  const data = ["项目 1", "项目 2", "项目 3", "项目 4"];

  const changeDirection = (newDirection) => {
    setDirection(newDirection);
    scrollRef.current?.update()
  };

  return (
    <div>
      <div style={{ width: "300px", height: "100px", margin: "20px 0" }}>
        <ScrollSeamless
          ref={scrollRef}
          data={data}
          direction={direction}
          step={1}
          hoverStop={false}
        />
      </div>

      <div>
        <button onClick={() => changeDirection("left")}>向左</button>
        <button onClick={() => changeDirection("right")}>向右</button>
        <button onClick={() => changeDirection("up")}>向上</button>
        <button onClick={() => changeDirection("down")}>向下</button>
      </div>
    </div>
  );
}
```

### Vue 中的方向切换

```vue
<template>
  <div>
    <div style="width: 300px; height: 100px; margin: 20px 0;">
      <ScrollSeamless
        ref="scrollRef"
        :data="data"
        :direction="direction"
        :step="1"
        :hover-stop="true"
      />
    </div>

    <div>
      <button @click="changeDirection('left')">向左</button>
      <button @click="changeDirection('right')">向右</button>
      <button @click="changeDirection('up')">向上</button>
      <button @click="changeDirection('down')">向下</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import ScrollSeamless, { ScrollSeamlessExpose } from "scroll-seamless"

const scrollRef = ref<ScrollSeamlessExpose | null>(null)
const direction = ref("left")
const data = ref(["项目 1", "项目 2", "项目 3", "项目 4"])

const changeDirection = (newDirection: string) => {
  direction.value = newDirection
  scrollRef.value?.update()
}
</script>
```

更多高级用法，请参考 [API 文档](./API.md)。
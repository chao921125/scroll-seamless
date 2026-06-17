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
import { ScrollEngine } from 'scroll-seamless'

// 获取容器元素
const container = document.getElementById("scroll-container")

// 创建数据
const data = ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"]

// 初始化滚动实例
const scrollInstance = new ScrollEngine(container, {
  data: data,
  direction: "left", // 滚动方向：left, right, up, down
  step: 1, // 每步移动像素
  hoverStop: false, // 鼠标悬停暂停
  autoStart: true // 自动开始
})
```

### React

```jsx
import React, { useRef } from "react";
import { ScrollSeamless } from "scroll-seamless/react";
import type { ScrollSeamlessRef } from "scroll-seamless/react";

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
          autoStart={true}
        />
      </div>

      {/* 控制按钮 */}
      <div>
        <button onClick={() => scrollRef.current?.start()}>开始</button>
        <button onClick={() => scrollRef.current?.stop()}>停止</button>
        <button onClick={() => scrollRef.current?.pause()}>暂停</button>
        <button onClick={() => scrollRef.current?.resume()}>恢复</button>
      </div>
    </div>
  );
}

export default ScrollDemo;
```

### Vue

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
        :hover-stop="false"
        :auto-start="true"
      />
    </div>

    <!-- 控制按钮 -->
    <div>
      <button @click="startScroll">开始</button>
      <button @click="stopScroll">停止</button>
      <button @click="pauseScroll">暂停</button>
      <button @click="resumeScroll">恢复</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { ScrollSeamless } from "scroll-seamless/vue"

const scrollRef = ref(null)
const data = ref(["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"])

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

// 暂停滚动
scrollInstance.pause();

// 恢复滚动
scrollInstance.resume();

// 更新数据（数据变化后调用）
scrollInstance.update();

// 销毁实例（组件卸载时调用）
scrollInstance.destroy();

// 获取当前位置
const position = scrollInstance.getPosition();

// 检查是否正在滚动
const isRunning = scrollInstance.getIsRunning();

// 检查是否暂停
const isPaused = scrollInstance.getIsPaused();

// 获取循环次数
const cycleCount = scrollInstance.getCycleCount();
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
import { ScrollEngine } from 'scroll-seamless'

const scrollInstance = new ScrollEngine(container, {
  data: Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`),
  direction: 'left',
  rows: 2,  // 水平滚动时，2行垂直排列
  cols: 1   // 水平滚动时，cols参数无效
})
```

### 自定义渲染

通过 `renderItem` 选项自定义每个滚动项的渲染方式：

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

## 方向示例

### 所有方向滚动示例

```javascript
import { ScrollEngine } from 'scroll-seamless'

// 向左滚动（默认）
const leftScroll = new ScrollEngine(container, {
  data: ["项目 1", "项目 2", "项目 3"],
  direction: "left"
});

// 向右滚动
const rightScroll = new ScrollEngine(container, {
  data: ["项目 1", "项目 2", "项目 3"],
  direction: "right"
});

// 向上滚动
const upScroll = new ScrollEngine(container, {
  data: ["项目 1", "项目 2", "项目 3"],
  direction: "up"
});

// 向下滚动
const downScroll = new ScrollEngine(container, {
  data: ["项目 1", "项目 2", "项目 3"],
  direction: "down"
});
```

更多高级用法，请参考 [API 文档](./API.md)。
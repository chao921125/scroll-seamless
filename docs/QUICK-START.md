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
import { ScrollSeamless } from "scroll-seamless/core";

// 获取容器元素
const container = document.getElementById("scroll-container");

// 创建数据
const data = ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"];

// 初始化滚动实例
const scrollInstance = new ScrollSeamless(container, {
  data: data,
  direction: "left", // 滚动方向：left, right, up, down
  step: 1, // 每步移动像素
  hoverStop: true // 鼠标悬停暂停
});

// 开始滚动
scrollInstance.start();
```

### React

1. 安装依赖：

```bash
npm install scroll-seamless
```

2. 在组件中使用：

```jsx
import React, { useRef } from "react";
import { ScrollSeamless } from "scroll-seamless/react";

function ScrollDemo() {
  const scrollRef = useRef(null);
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
          hoverStop={true}
        >
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
      >
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
    </div>

    <!-- 控制按钮 -->
    <div>
      <button @click="startScroll">开始</button>
      <button @click="stopScroll">停止</button>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { ScrollSeamless } from "scroll-seamless/vue";

export default {
  components: {
    ScrollSeamless
  },
  setup() {
    const scrollRef = ref(null);
    const data = ref(["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"]);

    const startScroll = () => {
      scrollRef.value?.start();
    };

    const stopScroll = () => {
      scrollRef.value?.stop();
    };

    return {
      scrollRef,
      data,
      startScroll,
      stopScroll
    };
  }
};
</script>
```

## 常用配置

Scroll Seamless 提供了多种配置选项，以下是最常用的一些：

| 配置项 | 类型 | 默认值 | 说明 |
|-------|------|-------|------|
| `data` | `string[]` | `[]` | 滚动数据数组 |
| `direction` | `'up' \| 'down' \| 'left' \| 'right'` | `'left'` | 滚动方向 |
| `step` | `number` | `1` | 每步移动像素 |
| `stepWait` | `number` | `0` | 每步等待时间(ms) |
| `delay` | `number` | `0` | 初始延迟时间(ms) |
| `hoverStop` | `boolean` | `true` | 鼠标悬停是否暂停 |
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
import { ScrollSeamless } from "scroll-seamless/core";
import { createVirtualScrollPlugin } from "scroll-seamless/plugins";

// 创建虚拟滚动插件
const virtualScrollPlugin = createVirtualScrollPlugin({
  enabled: true,
  itemWidth: 200,
  itemHeight: 40,
  bufferSize: 10
});

// 使用插件
const scrollInstance = new ScrollSeamless(container, {
  data: largeData,
  plugins: [virtualScrollPlugin]
});
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

更多高级用法，请参考 [API 文档](./API.md)。
# Scroll Seamless

[![npm version](https://img.shields.io/npm/v/scroll-seamless.svg)](https://www.npmjs.com/package/scroll-seamless)
[![npm downloads](https://img.shields.io/npm/dm/scroll-seamless.svg)](https://www.npmjs.com/package/scroll-seamless)
[![License](https://img.shields.io/npm/l/scroll-seamless.svg)](https://github.com/chao921125/scroll-seamless/blob/main/LICENSE)

一个支持 JavaScript、Vue3 和 React 的无缝滚动库。

## 特性

- 🚀 高性能无缝滚动
- 🎯 支持水平/垂直方向
- 🎨 统一的渲染模式（作用域插槽/函数式 children）
- 🎛️ 丰富的配置选项
- 🖱️ 鼠标悬停暂停
- 🎡 滚轮控制
- 📱 响应式设计
- 🔧 TypeScript 支持
- ⚡ 虚拟滚动支持（大数据量优化）
- 🎨 完全自定义模式（custom 模式）

## 安装

```bash
npm install scroll-seamless
```

## 使用方法

### React 组件

```jsx
import React, { useRef } from 'react';
import { ScrollSeamless } from 'scroll-seamless/react';

const MyComponent = () => {
  const scrollRef = useRef(null);
  const data = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'];

  return (
    <div style={{ width: '300px', height: '50px' }}>
      <ScrollSeamless
        ref={scrollRef}
        data={data}
        direction="right"
        step={1}
        hoverStop={true}
        wheelEnable={true}
      >
        {/* 函数式 children - 渲染单个项目 */}
        {(item, index) => (
          <div key={index} style={{ 
            padding: '10px', 
            margin: '0 5px', 
            backgroundColor: '#f0f0f0',
            borderRadius: '4px'
          }}>
            {item}
          </div>
        )}
      </ScrollSeamless>
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
    >
      <!-- 作用域插槽 - 渲染单个项目 -->
      <template #default="{ item, index }">
        <div :key="index" style="
          padding: 10px; 
          margin: 0 5px; 
          background-color: #f0f0f0;
          border-radius: 4px;
        ">
          {{ item }}
        </div>
      </template>
    </ScrollSeamless>
  </div>
</template>

<script>
import { ref } from 'vue';
import { ScrollSeamless } from 'scroll-seamless/vue';

export default {
  components: { ScrollSeamless },
  setup() {
    const scrollRef = ref(null);
    const data = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'];

    return { scrollRef, data };
  }
};
</script>
```

### JavaScript 核心库

```javascript
import { ScrollSeamless } from 'scroll-seamless/core';

const container = document.getElementById('scroll-container');
const scrollInstance = new ScrollSeamless(container, {
  data: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'],
  direction: 'right',
  step: 1,
  hoverStop: true,
  wheelEnable: true
});

// 控制方法
scrollInstance.start();
scrollInstance.stop();
scrollInstance.destroy();
```

## 完全自定义模式（Custom 模式）

当需要完全自定义内容结构时，可以使用 `custom=true` 模式。在这种模式下，组件不会自动渲染 data 数组，而是完全交由用户自定义 slot/children 内容。

### 使用场景

- 复杂的布局结构（如卡片、图片、嵌套元素等）
- 需要自定义样式和交互
- 非标准的数据展示需求
- 需要与其他组件组合使用

### Vue 自定义模式示例

```vue
<template>
  <!-- 完全自定义模式（custom=true，slot 只渲染一次，用户可自定义结构） -->
  <ScrollSeamless
    :data="items"
    direction="right"
    :step="0.5"
    :custom="true"
    :hover-stop="true"
  >
    <div style="display: flex;">
      <div v-for="item in items" :key="item" class="custom-item">
        <div class="item-content">
          <span class="prefix">O</span>
          <span class="text">{{ item }}</span>
          <span class="suffix">P</span>
        </div>
      </div>
    </div>
  </ScrollSeamless>
</template>

<script>
import { ref } from 'vue';
import { ScrollSeamless } from 'scroll-seamless/vue';

export default {
  components: { ScrollSeamless },
  setup() {
    const items = ref(['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5']);
    return { items };
  }
};
</script>

<style scoped>
.custom-item {
  padding: 10px;
  margin: 0 5px;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  border-radius: 8px;
  color: white;
  font-weight: bold;
}

.item-content {
  display: flex;
  align-items: center;
  gap: 5px;
}

.prefix, .suffix {
  font-size: 12px;
  opacity: 0.8;
}
</style>
```

### React 自定义模式示例

```jsx
import React, { useRef } from 'react';
import { ScrollSeamless } from 'scroll-seamless/react';

const CustomScrollDemo = () => {
  const scrollRef = useRef(null);
  const items = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'];

  return (
    <div style={{ width: '600px', height: '80px' }}>
      <ScrollSeamless
        ref={scrollRef}
        data={items}
        direction="right"
        step={0.5}
        custom={true}
        hoverStop={true}
      >
        {/* 完全自定义内容结构 */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {items.map((item, index) => (
            <div key={index} style={{
              padding: '15px',
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              borderRadius: '10px',
              color: 'white',
              fontWeight: 'bold',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '12px', opacity: 0.8 }}>O</span>
              <span>{item}</span>
              <span style={{ fontSize: '12px', opacity: 0.8 }}>P</span>
            </div>
          ))}
        </div>
      </ScrollSeamless>
    </div>
  );
};
```

### 注意事项

1. **slot 内容必须是纯静态结构**：custom 模式下不会自动传递 item/index 参数
2. **内容会被复制两份**：用于实现无缝滚动效果
3. **自定义内容的尺寸**：会直接影响滚动区域的尺寸和效果
4. **性能考虑**：复杂结构会影响渲染性能，建议合理控制内容复杂度

## 虚拟滚动（大数据量优化）

对于大数据量场景（如 10000+ 条数据），可以使用虚拟滚动插件来优化性能：

```javascript
import { ScrollSeamless } from 'scroll-seamless/core';
import { createVirtualScrollPlugin } from 'scroll-seamless/plugins';

// 创建虚拟滚动插件
const virtualScrollPlugin = createVirtualScrollPlugin({
  enabled: true,
  itemWidth: 200,  // 每个 item 宽度
  itemHeight: 40,  // 每个 item 高度
  bufferSize: 10,  // 缓冲区大小
  onRender: (startIndex, endIndex, visibleCount) => {
    console.log(`渲染范围: ${startIndex} - ${endIndex}, 可见数量: ${visibleCount}`);
  }
});

// 使用插件
const scrollInstance = new ScrollSeamless(container, {
  data: largeData, // 大数据量
  plugins: [virtualScrollPlugin],
  onEvent: (event, data) => {
    if (event === 'virtual-scroll-update') {
      console.log('性能指标:', data);
    }
  }
});
```

**性能对比：**
- 传统渲染：需要渲染 `数据量 × 2` 个 DOM 节点
- 虚拟滚动：只渲染可视区域 + 缓冲区的节点
- 性能提升：显著减少内存占用和渲染时间

## 统一渲染模式

Scroll Seamless 采用统一的渲染模式，确保 React 和 Vue 组件的一致性：

### React 函数式 Children
```jsx
<ScrollSeamless data={data}>
  {(item, index) => (
    <div key={index}>{item}</div>
  )}
</ScrollSeamless>
```

### Vue 作用域插槽
```vue
<ScrollSeamless :data="data">
  <template #default="{ item, index }">
    <div :key="index">{{ item }}</div>
  </template>
</ScrollSeamless>
```

这种模式的优势：
- **一致性**：React 和 Vue 组件使用相同的渲染逻辑
- **灵活性**：开发者可以完全控制每个项目的渲染
- **维护性**：组件内部统一管理 data 数组的渲染
- **扩展性**：易于添加新的渲染功能

## 样式隔离与自定义

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
  style={{ border: '1px solid #f00' }}
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

---

## API 文档

### 组件 Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `data` | `string[]` | `[]` | 滚动数据数组 |
| `direction` | `'up' \| 'down' \| 'left' \| 'right'` | `'left'` | 滚动方向（上/下/左/右） |
| `step` | `number` | `1` | 每步移动像素 |
| `stepWait` | `number` | `0` | 每步等待时间(ms) |
| `delay` | `number` | `0` | 初始延迟时间(ms) |
| `hoverStop` | `boolean` | `true` | 鼠标悬停是否暂停 |
| `wheelEnable` | `boolean` | `false` | 是否启用滚轮控制 |
| `custom` | `boolean` | `false` | 是否使用自定义内容 |
| `plugins` | `ScrollSeamlessPlugin[]` | `[]` | 插件数组 |
| `onEvent` | `(event, data) => void` | - | 事件回调 |

### 组件方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `start()` | - | `void` | 开始滚动 |
| `stop()` | - | `void` | 停止滚动 |
| `destroy()` | - | `void` | 销毁实例 |
| `updateData()` | - | `void` | 更新数据 |
| `setOptions()` | `options` | `void` | 设置选项 |

### 事件类型

| 事件 | 触发时机 | 回调参数 |
|------|----------|----------|
| `start` | 开始滚动时 | `{ type, direction, position, cycleCount }` |
| `stop` | 停止滚动时 | `{ type, direction, position, cycleCount }` |
| `destroy` | 销毁实例时 | `{ type, direction, position, cycleCount }` |
| `update` | 数据更新时 | `{ type, direction, position, cycleCount }` |
| `cycle` | 完成一次循环时 | `{ type, direction, position, cycleCount }` |
| `reach-start` | 滚动到起点时 | `{ type, direction, position, cycleCount }` |
| `reach-end` | 滚动到终点时 | `{ type, direction, position, cycleCount }` |

### 虚拟滚动插件配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | `boolean` | `true` | 是否启用虚拟滚动 |
| `itemWidth` | `number` | `200` | 每个 item 宽度（水平滚动） |
| `itemHeight` | `number` | `40` | 每个 item 高度（垂直滚动） |
| `bufferSize` | `number` | `5` | 缓冲区大小 |
| `onRender` | `(start, end, count) => void` | - | 渲染回调 |

## 方向参数说明

- `direction` 仅支持 `'left' | 'right' | 'up' | 'down'`，默认值为 `'left'`，与源码类型完全一致。
- 推荐通过 core 导出的 `DEFAULT_OPTIONS`、类型、工具函数进行多端复用。

## 工具函数与高级用法

可直接从 `scroll-seamless/core/utils` 导入以下工具函数：
- `getLegalDirection(direction)`：方向合法性校验
- `getContentTransform(direction, position, totalLength, isSecondContent)`：内容 transform 计算
- `getContentStyle(direction)`：内容区样式生成
- `fireEvent(handler, event, payload)`：统一事件分发

示例：
```js
import { getLegalDirection, getContentTransform, getContentStyle, fireEvent } from 'scroll-seamless/core/utils';
```

## 事件系统

推荐通过 `fireEvent` 工具函数分发自定义事件，便于插件/扩展统一接入。

## 许可证

BSD-3-Clause

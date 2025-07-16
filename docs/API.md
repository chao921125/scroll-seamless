# Scroll Seamless API 文档

## 目录

- [组件 Props](#组件-props)
- [React 组件特有 Props](#react-组件特有-props)
- [Vue 组件特有 Props](#vue-组件特有-props)
- [组件方法](#组件方法)
- [事件类型](#事件类型)
- [插件 API](#插件-api)
- [核心选项接口](#核心选项接口)
- [工具函数](#工具函数)
- [默认选项](#默认选项)
- [类型定义](#类型定义)
- [使用示例](#使用示例)
- [高级用法](#高级用法)

## 组件 Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `data` | `any[]` | `[]` | 滚动数据数组，可以是任意类型的数据，将传递给渲染函数 |
| `direction` | `'up' \| 'down' \| 'left' \| 'right'` | `'left'` | 滚动方向，支持上下左右四个方向 |
| `step` | `number` | `1` | 每步移动像素，值越大滚动速度越快 |
| `stepWait` | `number` | `0` | 每步等待时间(ms)，可用于控制滚动速度 |
| `delay` | `number` | `0` | 初始延迟时间(ms)，组件挂载后等待指定时间再开始滚动 |
| `hoverStop` | `boolean` | `true` | 鼠标悬停是否暂停滚动 |
| `wheelEnable` | `boolean` | `false` | 是否启用滚轮控制，启用后可通过鼠标滚轮控制滚动 |
| `minCountToScroll` | `number` | `2` | 最小滚动项目数，当数据项少于此值时不会滚动 |
| `rows` | `number` | `1` | 行数，用于多行布局 |
| `cols` | `number` | `1` | 列数，用于多列布局 |
| `custom` | `boolean` | `false` | 是否使用自定义内容，启用后可完全自定义内容结构 |
| `plugins` | `ScrollSeamlessPlugin[]` | `[]` | 插件数组，用于扩展功能 |
| `onEvent` | `(event: string, data: any) => void` | - | 事件回调，用于监听滚动事件 |
| `performance` | `{ enabled: boolean }` | `{ enabled: true }` | 性能监控配置，控制是否启用性能监控 |
| `accessibility` | `{ enabled: boolean }` | `{ enabled: true }` | 无障碍功能配置，控制是否启用无障碍功能 |
| `bezier` | `[number, number, number, number]` | `[0.25, 0.1, 0.25, 1]` | 贝塞尔曲线参数，用于控制动画效果 |
| `singleLine` | `boolean` | `false` | 是否为单行模式，启用后强制单行显示 |
| `dataDriven` | `boolean` | `false` | 是否为数据驱动模式，启用后通过数据变化驱动滚动 |

## React 组件特有 Props

| 属性               | 类型                  | 默认值 | 说明                 |
| ------------------ | --------------------- | ------ | -------------------- |
| `className`        | `string`              | -      | 根容器类名           |
| `style`            | `React.CSSProperties` | -      | 根容器样式           |
| `contentClassName` | `string`              | -      | 内容区类名           |
| `itemClassName`    | `string`              | -      | 单项类名             |
| `children`         | `Function`            | -      | 渲染函数             |

## Vue 组件特有 Props

| 属性           | 类型      | 默认值 | 说明           |
| -------------- | --------- | ------ | -------------- |
| `class`        | `string`  | -      | 根容器类名     |
| `style`        | `Object`  | -      | 根容器样式     |
| `content-class`| `string`  | -      | 内容区类名     |
| `item-class`   | `string`  | -      | 单项类名       |
| `v-model`      | `boolean` | `true` | 是否正在滚动   |

## 组件方法

| 方法 | 参数 | 返回值 | 说明 |
| --- | --- | --- | --- |
| `start()` | - | `void` | 开始滚动，如果已经在滚动则不执行任何操作 |
| `stop()` | - | `void` | 停止滚动，如果已经停止则不执行任何操作 |
| `destroy()` | - | `void` | 销毁实例，清理所有资源，包括DOM元素、事件监听器和插件 |
| `updateData()` | - | `void` | 更新数据并重新渲染，当数据变化后调用此方法刷新显示 |
| `setOptions(options)` | `Partial<ScrollSeamlessOptions>` | `void` | 设置选项，可以动态更新部分或全部配置参数 |
| `getPosition()` | - | `number` | 获取当前滚动位置（像素值） |
| `setPosition(position)` | `number` | `void` | 设置当前滚动位置（像素值） |
| `isRunning()` | - | `boolean` | 获取当前是否正在滚动 |
| `addPlugin(plugin)` | `ScrollSeamlessPlugin` | `void` | 动态添加插件 |
| `removePlugin(pluginId)` | `string` | `void` | 根据ID移除插件 |
| `getPerformance()` | - | `PerformanceMetrics` | 获取性能指标数据 |
| `getRenderMatrix()` | - | `string[][]` | 获取渲染矩阵（用于数据驱动模式） |
| `getTransforms()` | - | `string[]` | 获取变换样式（用于数据驱动模式） |

### 方法详细说明

#### start()

**描述:** 开始滚动动画。如果已经在滚动中，则不会执行任何操作。

**示例:**
```javascript
// 开始滚动
scrollInstance.start();

// 在React中
scrollRef.current?.start();

// 在Vue中
scrollRef.value?.start();
```

#### stop()

**描述:** 停止滚动动画。如果已经停止，则不会执行任何操作。

**示例:**
```javascript
// 停止滚动
scrollInstance.stop();

// 条件控制
if (someCondition) {
  scrollInstance.stop();
} else {
  scrollInstance.start();
}
```

#### destroy()

**描述:** 完全销毁滚动实例，清理所有资源，包括DOM元素、事件监听器和插件。通常在组件卸载时调用。

**示例:**
```javascript
// 销毁实例
scrollInstance.destroy();

// 在React组件卸载时
useEffect(() => {
  return () => {
    if (scrollRef.current) {
      scrollRef.current.destroy();
    }
  };
}, []);
```

#### updateData()

**描述:** 更新数据并重新渲染内容。当数据源发生变化后调用此方法刷新显示。

**示例:**
```javascript
// 更新数据
data.push("New Item");
scrollInstance.updateData();

// 在React中
setData([...data, "New Item"]);
scrollRef.current?.updateData();

// 在Vue中
data.value.push("New Item");
scrollRef.value?.updateData();
```

#### setOptions(options)

**描述:** 动态更新滚动选项。可以更新部分或全部配置参数。

**参数:**
- `options` (Partial\<ScrollSeamlessOptions\>): 要更新的选项对象

**示例:**
```javascript
// 更新多个选项
scrollInstance.setOptions({
  step: 2,
  direction: "right",
  hoverStop: false
});

// 只更新一个选项
scrollInstance.setOptions({ step: 0.5 });
```

#### getPosition()

**描述:** 获取当前滚动位置（像素值）。

**返回值:** `number` - 当前滚动位置

**示例:**
```javascript
// 获取当前位置
const position = scrollInstance.getPosition();
console.log("当前滚动位置:", position);
```

#### setPosition(position)

**描述:** 设置当前滚动位置（像素值）。可用于手动控制滚动位置。

**参数:**
- `position` (number): 要设置的位置值

**示例:**
```javascript
// 设置滚动位置
scrollInstance.setPosition(100);

// 重置到起始位置
scrollInstance.setPosition(0);
```

#### isRunning()

**描述:** 获取当前是否正在滚动。

**返回值:** `boolean` - 是否正在滚动

**示例:**
```javascript
// 检查是否正在滚动
const running = scrollInstance.isRunning();
if (running) {
  console.log("滚动正在进行中");
} else {
  console.log("滚动已停止");
}
```

#### addPlugin(plugin)

**描述:** 动态添加插件到滚动实例。

**参数:**
- `plugin` (ScrollSeamlessPlugin): 要添加的插件对象

**示例:**
```javascript
// 创建并添加插件
const customPlugin = {
  id: 'custom-plugin',
  apply: (instance) => {
    console.log('插件已应用');
  },
  destroy: () => {
    console.log('插件已销毁');
  }
};

scrollInstance.addPlugin(customPlugin);
```

#### removePlugin(pluginId)

**描述:** 根据ID移除已添加的插件。

**参数:**
- `pluginId` (string): 要移除的插件ID

**示例:**
```javascript
// 移除插件
scrollInstance.removePlugin('custom-plugin');
```

#### getPerformance()

**描述:** 获取性能指标数据，包括FPS、内存使用等信息。

**返回值:** `PerformanceMetrics` - 性能指标对象

**示例:**
```javascript
// 获取性能数据
const metrics = scrollInstance.getPerformance();
console.log("FPS:", metrics.fps);
if (metrics.memory) {
  console.log("内存使用:", metrics.memory.usedJSHeapSize / 1048576, "MB");
}
```

## 事件系统

Scroll Seamless 提供了丰富的事件系统，可以通过 `onEvent` 回调函数监听各种滚动事件。

### 事件类型

| 事件 | 触发时机 | 回调参数 |
| --- | --- | --- |
| `start` | 开始滚动时 | `{ type, direction, position, cycleCount }` |
| `stop` | 停止滚动时 | `{ type, direction, position, cycleCount }` |
| `destroy` | 销毁实例时 | `{ type, direction, position, cycleCount }` |
| `update` | 数据更新时 | `{ type, direction, position, cycleCount }` |
| `cycle` | 完成一次循环时 | `{ type, direction, position, cycleCount }` |
| `reach-start` | 滚动到起点时 | `{ type, direction, position, cycleCount }` |
| `reach-end` | 滚动到终点时 | `{ type, direction, position, cycleCount }` |
| `error` | 发生错误时 | `{ type, direction, error, stack }` |
| `virtual-scroll-update` | 虚拟滚动更新时 | `{ startIndex, endIndex, visibleCount }` |
| `virtual-scroll-resize` | 虚拟滚动容器大小变化时 | `{ width, height, visibleCount }` |

### 事件参数详解

- `type`: 事件类型，与事件名称相同
- `direction`: 当前滚动方向
- `position`: 当前滚动位置（像素值）
- `cycleCount`: 已完成的循环次数
- `error`: 错误信息（仅在 `error` 事件中）
- `stack`: 错误堆栈（仅在 `error` 事件中）
- `startIndex`: 当前可见区域的起始索引（仅在虚拟滚动事件中）
- `endIndex`: 当前可见区域的结束索引（仅在虚拟滚动事件中）
- `visibleCount`: 当前可见项目数量（仅在虚拟滚动事件中）

### 事件监听示例

#### 基本事件监听

```javascript
const scrollInstance = new ScrollSeamless(container, {
  data: items,
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
      case 'error':
        console.error('滚动错误:', data.error);
        break;
    }
  }
});
```

#### 在 React 中监听事件

```jsx
<ScrollSeamless
  data={data}
  onEvent={(event, data) => {
    // 事件处理逻辑
    if (event === 'cycle') {
      setCycleCount(prev => prev + 1);
    }
  }}
>
  {(item) => <div>{item}</div>}
</ScrollSeamless>
```

#### 在 Vue 中监听事件

```vue
<template>
  <ScrollSeamless
    :data="data"
    @event="handleEvent"
  >
    <template #default="{ item }">
      <div>{{ item }}</div>
    </template>
  </ScrollSeamless>
</template>

<script setup>
const handleEvent = (event, data) => {
  // 事件处理逻辑
  if (event === 'cycle') {
    cycleCount.value++;
  }
};
</script>
```

#### 监听虚拟滚动事件

```javascript
const scrollInstance = new ScrollSeamless(container, {
  data: largeData,
  plugins: [virtualScrollPlugin],
  onEvent: (event, data) => {
    if (event === 'virtual-scroll-update') {
      console.log(`当前渲染范围: ${data.startIndex} - ${data.endIndex}`);
      console.log(`可见项目数: ${data.visibleCount}`);
      
      // 可以在这里执行额外的逻辑，如数据懒加载
      if (data.endIndex > largeData.length - 20) {
        // 接近末尾，加载更多数据
        loadMoreData();
      }
    }
  }
});
```

## 插件 API

### 插件接口

```typescript
interface ScrollSeamlessPlugin {
  id: string;
  apply: (instance: ScrollSeamless) => void;
  destroy?: () => void;
}
```

### 性能监控插件

```typescript
interface PerformancePluginOptions {
  enabled?: boolean;
  fps?: boolean;
  memory?: boolean;
  onUpdate?: (metrics: PerformanceMetrics) => void;
}

interface PerformanceMetrics {
  fps: number;
  memory?: {
    jsHeapSizeLimit: number;
    totalJSHeapSize: number;
    usedJSHeapSize: number;
  };
}
```

### 虚拟滚动插件

```typescript
interface VirtualScrollPluginOptions {
  enabled?: boolean;
  itemWidth?: number;
  itemHeight?: number;
  bufferSize?: number;
  onRender?: (startIndex: number, endIndex: number, visibleCount: number) => void;
}
```

## 核心选项接口

```typescript
interface ScrollSeamlessOptions {
  data?: any[];
  direction?: 'up' | 'down' | 'left' | 'right';
  step?: number;
  stepWait?: number;
  delay?: number;
  hoverStop?: boolean;
  wheelEnable?: boolean;
  rows?: number;
  cols?: number;
  custom?: boolean;
  plugins?: ScrollSeamlessPlugin[];
  onEvent?: (event: string, data: any) => void;
  performance?: {
    enabled?: boolean;
  };
  accessibility?: {
    enabled?: boolean;
  };
}
```

## 工具函数

### 方向相关

```typescript
function getLegalDirection(direction: string): 'up' | 'down' | 'left' | 'right';
```

返回合法的方向值，如果输入不合法则返回默认方向 'left'。

### 内容样式计算

```typescript
function getContentTransform(
  direction: string, 
  position: number, 
  totalLength: number, 
  isSecondContent: boolean
): string;
```

根据方向、位置和总长度计算内容的 transform 样式。

```typescript
function getContentStyle(direction: string): Record<string, string>;
```

根据方向获取内容区的基础样式。

### 事件分发

```typescript
function fireEvent(
  handler: ((event: string, data: any) => void) | undefined, 
  event: string, 
  payload: any
): void;
```

统一事件分发函数，用于触发事件回调。

## 默认选项

```typescript
const DEFAULT_OPTIONS: ScrollSeamlessOptions = {
  data: [],
  direction: 'left',
  step: 1,
  stepWait: 0,
  delay: 0,
  hoverStop: true,
  wheelEnable: false,
  rows: 1,
  cols: 1,
  custom: false,
  plugins: []
};
```

## 类型定义

完整的类型定义可以在 `src/types/index.ts` 文件中找到。以下是主要的类型定义：

### ScrollDirection

滚动方向类型，定义了四个可能的滚动方向。

```typescript
type ScrollDirection = 'up' | 'down' | 'left' | 'right';
```

### ScrollSeamlessOptions

配置选项接口，定义了所有可配置的参数。

```typescript
interface ScrollSeamlessOptions {
  // 基本配置
  data?: any[];
  direction?: ScrollDirection;
  step?: number;
  stepWait?: number;
  delay?: number;
  minCountToScroll?: number;
  
  // 交互配置
  hoverStop?: boolean;
  wheelEnable?: boolean;
  
  // 布局配置
  rows?: number;
  cols?: number;
  singleLine?: boolean;
  
  // 渲染配置
  custom?: boolean;
  dataDriven?: boolean;
  
  // 动画配置
  bezier?: [number, number, number, number];
  
  // 扩展配置
  plugins?: ScrollSeamlessPlugin[];
  onEvent?: (event: string, data: any) => void;
  performance?: {
    enabled?: boolean;
    autoRestart?: boolean;
  };
  accessibility?: {
    enabled?: boolean;
    ariaLabel?: string;
    ariaLive?: 'off' | 'polite' | 'assertive';
  };
}
```

### ScrollSeamlessPlugin

插件接口，定义了插件的基本结构。

```typescript
interface ScrollSeamlessPlugin {
  id: string;
  apply: (instance: ScrollSeamless) => void;
  destroy?: () => void;
}
```

### ScrollSeamlessEvent

事件类型，定义了所有可能的事件名称。

```typescript
type ScrollSeamlessEvent = 
  | 'start'
  | 'stop'
  | 'destroy'
  | 'update'
  | 'cycle'
  | 'reach-start'
  | 'reach-end'
  | 'error'
  | 'virtual-scroll-update'
  | 'virtual-scroll-resize';
```

### ScrollSeamlessEventPayload

事件数据类型，定义了不同事件的回调参数。

```typescript
interface ScrollSeamlessBaseEventPayload {
  type: string;
  direction: ScrollDirection;
}

interface ScrollSeamlessPositionEventPayload extends ScrollSeamlessBaseEventPayload {
  position: number;
  cycleCount: number;
}

interface ScrollSeamlessErrorEventPayload extends ScrollSeamlessBaseEventPayload {
  error: string;
  stack?: string;
}

interface ScrollSeamlessVirtualScrollEventPayload {
  startIndex: number;
  endIndex: number;
  visibleCount: number;
}

type ScrollSeamlessEventPayload = 
  | ScrollSeamlessPositionEventPayload
  | ScrollSeamlessErrorEventPayload
  | ScrollSeamlessVirtualScrollEventPayload;
```

### ScrollSeamlessController

控制器接口，定义了所有可用的公共方法。

```typescript
interface ScrollSeamlessController {
  start(): void;
  stop(): void;
  destroy(): void;
  updateData(): void;
  setOptions(options: Partial<ScrollSeamlessOptions>): void;
  getPosition(): number;
  setPosition(position: number): void;
  isRunning(): boolean;
  addPlugin(plugin: ScrollSeamlessPlugin): void;
  removePlugin(pluginId: string): void;
  getPerformance(): any;
  getRenderMatrix(): string[][];
  getTransforms(): string[];
}
```

### React 组件类型

React 组件的 Props 类型定义。

```typescript
interface ScrollSeamlessReactProps extends ScrollSeamlessOptions {
  className?: string;
  style?: React.CSSProperties;
  contentClassName?: string;
  itemClassName?: string;
  children?: ((item: any, index: number, rowIndex?: number, colIndex?: number) => React.ReactNode) | React.ReactNode;
}
```

### Vue 组件类型

Vue 组件的 Props 类型定义。

```typescript
interface ScrollSeamlessVueProps extends ScrollSeamlessOptions {
  class?: string | object | string[];
  style?: string | object | string[];
  contentClass?: string;
  itemClass?: string;
  modelValue?: boolean;
}
```

### 使用类型的示例

```typescript
import { ScrollSeamless, ScrollDirection, ScrollSeamlessPlugin } from 'scroll-seamless';

// 使用类型定义创建选项
const options: ScrollSeamlessOptions = {
  data: ['Item 1', 'Item 2', 'Item 3'],
  direction: 'left' as ScrollDirection,
  step: 1,
  hoverStop: true
};

// 创建插件
const myPlugin: ScrollSeamlessPlugin = {
  id: 'my-plugin',
  apply: (instance) => {
    console.log('Plugin applied');
  }
};

// 创建滚动实例
const scrollInstance = new ScrollSeamless(container, {
  ...options,
  plugins: [myPlugin]
});

// 使用控制器方法
scrollInstance.start();

// 类型安全的事件处理
scrollInstance.setOptions({
  onEvent: (event, data) => {
    if (event === 'cycle') {
      const cycleData = data as ScrollSeamlessPositionEventPayload;
      console.log('Cycle count:', cycleData.cycleCount);
    }
  }
});
```

## 使用示例

### 基础使用

```javascript
import { ScrollSeamless } from "scroll-seamless/core";

const container = document.getElementById("scroll-container");
const scrollInstance = new ScrollSeamless(container, {
  data: ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"],
  direction: "right",
  step: 1,
  hoverStop: true
});

scrollInstance.start();
```

### 使用插件

```javascript
import { ScrollSeamless, PerformancePlugin } from "scroll-seamless/core";
import { VirtualScrollPlugin } from "scroll-seamless/plugins";

const performancePlugin = new PerformancePlugin({
  fps: true,
  memory: true,
  onUpdate: (metrics) => {
    console.log('Performance metrics:', metrics);
  }
});

const virtualScrollPlugin = new VirtualScrollPlugin({
  itemHeight: 30,
  bufferSize: 5
});

const scrollInstance = new ScrollSeamless(container, {
  data: Array.from({ length: 1000 }, (_, i) => `Item ${i + 1}`),
  plugins: [performancePlugin, virtualScrollPlugin]
});
```

### 事件监听

```javascript
const scrollInstance = new ScrollSeamless(container, {
  data: items,
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

## 高级用法

### 多行多列布局

```javascript
const scrollInstance = new ScrollSeamless(container, {
  data: Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`),
  direction: 'left',
  rows: 2,
  cols: 2
});
```

### 自定义渲染

React 组件:

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

Vue 组件:

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

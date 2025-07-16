# 虚拟滚动

[![npm version](https://img.shields.io/npm/v/scroll-seamless.svg)](https://www.npmjs.com/package/scroll-seamless)
[![npm downloads](https://img.shields.io/npm/dm/scroll-seamless.svg)](https://www.npmjs.com/package/scroll-seamless)
[![License](https://img.shields.io/npm/l/scroll-seamless.svg)](https://github.com/chao921125/scroll-seamless/blob/main/LICENSE)

> Scroll Seamless 的虚拟滚动插件，用于优化大数据量场景下的性能。

## 什么是虚拟滚动？

虚拟滚动是一种优化技术，它只渲染用户当前可见的内容以及一小部分缓冲区内容，而不是一次性渲染所有数据。这对于处理大型数据集（如成千上万条记录）特别有用，可以显著提升性能和用户体验。

**传统渲染 vs 虚拟滚动：**

- **传统渲染**：需要渲染 `数据量 × 2` 个 DOM 节点（Scroll Seamless 需要复制一份内容实现无缝效果）
- **虚拟滚动**：只渲染可视区域 + 缓冲区的节点
- **性能提升**：显著减少内存占用和渲染时间

## 安装

虚拟滚动插件已包含在 Scroll Seamless 包中，无需额外安装。

```bash
npm install scroll-seamless
```

## 基本使用

### 引入插件

```javascript
import { ScrollSeamless } from "scroll-seamless/core";
import { VirtualScrollPlugin } from "scroll-seamless/plugins";
```

### 创建并配置插件

```javascript
// 创建虚拟滚动插件
const virtualScrollPlugin = new VirtualScrollPlugin({
  enabled: true,
  itemWidth: 200, // 每个项目的宽度（水平滚动时使用）
  itemHeight: 40, // 每个项目的高度（垂直滚动时使用）
  bufferSize: 5, // 可视区域外预渲染的项目数量
  onRender: (startIndex, endIndex, visibleCount) => {
    console.log(
      `渲染范围: ${startIndex} - ${endIndex}, 可见数量: ${visibleCount}`
    );
  },
});

// 使用插件创建滚动实例
const scrollInstance = new ScrollSeamless(container, {
  data: Array.from({ length: 10000 }, (_, i) => `Item ${i + 1}`), // 大数据量
  direction: "left",
  plugins: [virtualScrollPlugin],
  onEvent: (event, data) => {
    if (event === "virtual-scroll-update") {
      console.log("虚拟滚动更新:", data);
    }
  },
});
```

## 在 React 中使用

```jsx
import React, { useRef } from "react";
import { ScrollSeamless } from "scroll-seamless/react";
import { VirtualScrollPlugin } from "scroll-seamless/plugins";

const VirtualScrollDemo = () => {
  const scrollRef = useRef(null);
  const data = Array.from({ length: 10000 }, (_, i) => `Item ${i + 1}`);

  // 创建虚拟滚动插件
  const virtualScrollPlugin = new VirtualScrollPlugin({
    itemWidth: 200,
    bufferSize: 10,
  });

  return (
    <div style={{ width: "600px", height: "80px" }}>
      <ScrollSeamless
        ref={scrollRef}
        data={data}
        direction="left"
        step={1}
        plugins={[virtualScrollPlugin]}
      >
        {(item, index) => (
          <div
            key={index}
            style={{
              width: "200px",
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
  );
};
```

## 在 Vue 中使用

```vue
<template>
  <div style="width: 600px; height: 80px;">
    <ScrollSeamless
      ref="scrollRef"
      :data="data"
      direction="left"
      :step="1"
      :plugins="plugins"
    >
      <template #default="{ item, index }">
        <div
          :key="index"
          style="
            width: 200px;
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
</template>

<script>
import { ref } from "vue";
import { ScrollSeamless } from "scroll-seamless/vue";
import { VirtualScrollPlugin } from "scroll-seamless/plugins";

export default {
  components: { ScrollSeamless },
  setup() {
    const scrollRef = ref(null);
    const data = Array.from({ length: 10000 }, (_, i) => `Item ${i + 1}`);

    // 创建虚拟滚动插件
    const virtualScrollPlugin = new VirtualScrollPlugin({
      itemWidth: 200,
      bufferSize: 10,
    });

    const plugins = [virtualScrollPlugin];

    return {
      scrollRef,
      data,
      plugins,
    };
  },
};
</script>
```

## 高级配置

### 动态项目大小

如果你的项目大小不固定，你可以提供一个函数来计算每个项目的大小：

```javascript
const virtualScrollPlugin = new VirtualScrollPlugin({
  getItemSize: (item, index) => {
    // 根据项目内容或索引计算大小
    return item.length > 10 ? 60 : 40;
  },
});
```

### 监听渲染事件

```javascript
const virtualScrollPlugin = new VirtualScrollPlugin({
  onRender: (startIndex, endIndex, visibleCount) => {
    console.log(
      `渲染范围: ${startIndex} - ${endIndex}, 可见数量: ${visibleCount}`
    );

    // 可以在这里执行额外的逻辑，如数据懒加载
    if (endIndex > data.length - 20) {
      // 接近末尾，加载更多数据
      loadMoreData();
    }
  },
});
```

### 动态更新配置

```javascript
// 创建插件后可以动态更新配置
virtualScrollPlugin.updateConfig({
  bufferSize: 20,
  itemHeight: 50,
});
```

## API 参考

### VirtualScrollPlugin 选项

| 选项          | 类型                                           | 默认值 | 说明                             |
| ------------- | ---------------------------------------------- | ------ | -------------------------------- |
| `enabled`     | `boolean`                                      | `true` | 是否启用虚拟滚动                 |
| `itemWidth`   | `number`                                       | `200`  | 每个项目的宽度（水平滚动时使用） |
| `itemHeight`  | `number`                                       | `40`   | 每个项目的高度（垂直滚动时使用） |
| `bufferSize`  | `number`                                       | `5`    | 可视区域外预渲染的项目数量       |
| `getItemSize` | `(item, index) => number`                      | -      | 动态计算项目大小的函数           |
| `onRender`    | `(startIndex, endIndex, visibleCount) => void` | -      | 渲染回调函数                     |

### VirtualScrollPlugin 方法

| 方法              | 参数                                  | 返回值                           | 说明                   |
| ----------------- | ------------------------------------- | -------------------------------- | ---------------------- |
| `updateConfig`    | `Partial<VirtualScrollPluginOptions>` | `void`                           | 更新插件配置           |
| `getVisibleRange` | -                                     | `{ start: number, end: number }` | 获取当前可见范围的索引 |
| `scrollToIndex`   | `index: number`                       | `void`                           | 滚动到指定索引的项目   |

### 事件

当使用虚拟滚动插件时，Scroll Seamless 实例会触发以下额外事件：

| 事件                    | 触发时机           | 回调参数                                 |
| ----------------------- | ------------------ | ---------------------------------------- |
| `virtual-scroll-update` | 虚拟滚动视图更新时 | `{ startIndex, endIndex, visibleCount }` |
| `virtual-scroll-resize` | 容器大小变化时     | `{ width, height, visibleCount }`        |

## 性能优化建议

1. **设置合适的 bufferSize**：

   - 太小：可能导致滚动时出现白屏
   - 太大：会增加不必要的渲染负担
   - 建议值：5-10 之间，根据项目大小和滚动速度调整

2. **固定项目大小**：

   - 如果可能，尽量使用固定大小的项目
   - 这样可以避免频繁重新计算布局

3. **避免复杂的项目内容**：

   - 简化每个项目的 DOM 结构
   - 减少深层嵌套和复杂的样式计算

4. **使用 key**：

   - 始终为列表项提供稳定的 key
   - 避免使用索引作为 key，特别是当列表项可能重新排序时

5. **监控性能**：
   - 使用 PerformancePlugin 监控滚动性能
   - 关注帧率和内存使用情况

## 常见问题

### Q: 虚拟滚动和无缝滚动如何协同工作？

A: 虚拟滚动插件会智能地计算需要渲染的项目，同时保持无缝滚动效果。它会确保在视图中始终有足够的内容来维持连续滚动的错觉，即使只渲染了一小部分实际数据。

### Q: 我的项目大小不一致，如何处理？

A: 使用 `getItemSize` 函数来动态计算每个项目的大小。请注意，这可能会影响性能，因为需要更频繁地重新计算布局。

### Q: 为什么我看到了闪烁或空白？

A: 可能是 `bufferSize` 设置得太小，或者滚动速度太快。尝试增加缓冲区大小或减小滚动步长。

### Q: 虚拟滚动是否支持所有方向？

A: 是的，虚拟滚动插件支持所有四个方向（上、下、左、右）。

## 示例

查看 `examples/scroll-seamless-virtual-demo.js` 获取完整的示例代码。

## 许可证

BSD-3-Clause

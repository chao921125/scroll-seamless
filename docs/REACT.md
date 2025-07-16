# Scroll Seamless React 集成指南

本指南详细介绍了如何在 React 项目中使用 Scroll Seamless 库。

## 目录

- [安装](#安装)
- [基本用法](#基本用法)
- [组件 Props](#组件-props)
- [组件方法](#组件方法)
- [事件处理](#事件处理)
- [高级用法](#高级用法)
  - [多行多列布局](#多行多列布局)
  - [自定义渲染](#自定义渲染)
  - [虚拟滚动](#虚拟滚动)
  - [插件系统](#插件系统)
- [性能优化](#性能优化)
- [常见问题](#常见问题)

## 安装

```bash
# npm
npm install scroll-seamless

# yarn
yarn add scroll-seamless

# pnpm
pnpm add scroll-seamless
```

## 基本用法

```jsx
import React, { useRef } from "react";
import { ScrollSeamless } from "scroll-seamless/react";

function ScrollDemo() {
  const scrollRef = useRef(null);
  const data = ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"];

  return (
    <div>
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

      <div>
        <button onClick={() => scrollRef.current?.start()}>开始</button>
        <button onClick={() => scrollRef.current?.stop()}>停止</button>
        <button onClick={() => scrollRef.current?.updateData()}>更新数据</button>
      </div>
    </div>
  );
}

export default ScrollDemo;
```

## 组件 Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| `data` | `any[]` | `[]` | 滚动数据数组 |
| `direction` | `'up' \| 'down' \| 'left' \| 'right'` | `'left'` | 滚动方向 |
| `step` | `number` | `1` | 每步移动像素 |
| `stepWait` | `number` | `0` | 每步等待时间(ms) |
| `delay` | `number` | `0` | 初始延迟时间(ms) |
| `hoverStop` | `boolean` | `true` | 鼠标悬停是否暂停 |
| `wheelEnable` | `boolean` | `false` | 是否启用滚轮控制 |
| `rows` | `number` | `1` | 行数 |
| `cols` | `number` | `1` | 列数 |
| `custom` | `boolean` | `false` | 是否使用自定义内容 |
| `className` | `string` | - | 根容器类名 |
| `style` | `React.CSSProperties` | - | 根容器样式 |
| `contentClassName` | `string` | - | 内容区类名 |
| `itemClassName` | `string` | - | 单项类名 |
| `children` | `Function \| ReactNode` | - | 渲染函数或自定义内容 |
| `plugins` | `ScrollSeamlessPlugin[]` | `[]` | 插件数组 |
| `onEvent` | `(event: string, data: any) => void` | - | 事件回调 |

## 组件方法

通过 `ref` 可以访问组件实例方法：

```jsx
const scrollRef = useRef(null);

// 开始滚动
scrollRef.current?.start();

// 停止滚动
scrollRef.current?.stop();

// 更新数据（数据变化后调用）
scrollRef.current?.updateData();

// 销毁实例
scrollRef.current?.destroy();

// 获取当前位置
const position = scrollRef.current?.getPosition();

// 检查是否正在滚动
const isRunning = scrollRef.current?.isRunning();

// 更新配置选项
scrollRef.current?.setOptions({
  step: 2,
  direction: "right"
});
```

## 事件处理

```jsx
<ScrollSeamless
  data={data}
  onEvent={(event, data) => {
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
  }}
>
  {(item) => <div>{item}</div>}
</ScrollSeamless>
```

## 高级用法

### 多行多列布局

```jsx
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

### 自定义渲染

函数式渲染（推荐）：

```jsx
<ScrollSeamless data={data}>
  {(item, index) => (
    <div key={index} className="custom-item">
      <span className="item-index">{index + 1}</span>
      <span className="item-content">{item}</span>
    </div>
  )}
</ScrollSeamless>
```

自定义内容模式：

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

### 虚拟滚动

```jsx
import React from "react";
import { ScrollSeamless } from "scroll-seamless/react";
import { createVirtualScrollPlugin } from "scroll-seamless/plugins";

function VirtualScrollDemo() {
  // 创建大数据集
  const largeData = Array.from({ length: 10000 }, (_, i) => `Item ${i + 1}`);
  
  // 创建虚拟滚动插件
  const virtualScrollPlugin = createVirtualScrollPlugin({
    enabled: true,
    itemWidth: 200,
    itemHeight: 40,
    bufferSize: 10,
    onRender: (startIndex, endIndex, visibleCount) => {
      console.log(`渲染范围: ${startIndex} - ${endIndex}, 可见数量: ${visibleCount}`);
    }
  });

  return (
    <div style={{ width: "600px", height: "300px" }}>
      <ScrollSeamless
        data={largeData}
        plugins={[virtualScrollPlugin]}
        onEvent={(event, data) => {
          if (event === "virtual-scroll-update") {
            console.log("虚拟滚动更新:", data);
          }
        }}
      >
        {(item, index) => (
          <div
            key={index}
            style={{
              padding: "10px",
              margin: "5px",
              backgroundColor: "#f0f0f0",
              borderRadius: "4px",
              width: "180px",
              height: "30px"
            }}
          >
            {item}
          </div>
        )}
      </ScrollSeamless>
    </div>
  );
}

export default VirtualScrollDemo;
```

### 插件系统

```jsx
import React, { useRef, useEffect } from "react";
import { ScrollSeamless } from "scroll-seamless/react";

function PluginDemo() {
  const scrollRef = useRef(null);
  const data = Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`);
  
  // 自定义插件
  const customPlugin = {
    id: 'custom-plugin',
    apply: (instance) => {
      console.log('自定义插件已应用');
      
      // 可以访问实例方法和属性
      const isRunning = instance.isRunning();
      console.log('滚动状态:', isRunning);
      
      // 可以监听事件
      const originalOnEvent = instance.options.onEvent;
      instance.options.onEvent = (event, data) => {
        console.log('插件捕获事件:', event);
        
        // 调用原始事件处理器
        if (originalOnEvent) {
          originalOnEvent(event, data);
        }
      };
    },
    destroy: () => {
      console.log('自定义插件已销毁');
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      // 动态添加插件
      scrollRef.current.addPlugin(customPlugin);
      
      // 组件卸载时清理
      return () => {
        if (scrollRef.current) {
          scrollRef.current.removePlugin('custom-plugin');
        }
      };
    }
  }, []);

  return (
    <div style={{ width: "400px", height: "50px" }}>
      <ScrollSeamless
        ref={scrollRef}
        data={data}
      >
        {(item) => <div>{item}</div>}
      </ScrollSeamless>
    </div>
  );
}

export default PluginDemo;
```

## 性能优化

1. **使用虚拟滚动**：对于大数据集（1000+ 项），始终使用虚拟滚动插件。

2. **避免频繁更新**：不要在每次渲染周期都调用 `updateData()`，而是在数据真正变化时才调用。

3. **使用 React.memo**：对于复杂的项目渲染函数，使用 `React.memo` 避免不必要的重渲染。

```jsx
const ItemComponent = React.memo(({ item, index }) => (
  <div key={index} className="scroll-item">
    {item}
  </div>
));

function ScrollDemo() {
  return (
    <ScrollSeamless data={data}>
      {(item, index) => <ItemComponent item={item} index={index} />}
    </ScrollSeamless>
  );
}
```

4. **优化样式**：避免在滚动项上使用复杂的 CSS 效果，如阴影、模糊等。

5. **合理设置缓冲区**：使用虚拟滚动时，根据实际情况调整 `bufferSize`。

## 常见问题

### Q: 组件不滚动怎么办？

A: 检查以下几点：
- 确保 `data` 数组不为空且长度大于 1
- 检查容器是否有足够的宽度/高度
- 确保没有 CSS 样式覆盖了滚动行为
- 检查控制台是否有错误信息

### Q: 如何在条件渲染中使用？

A: 确保在条件渲染时正确处理 ref：

```jsx
{showScroll && (
  <ScrollSeamless
    ref={scrollRef}
    data={data}
  >
    {(item) => <div>{item}</div>}
  </ScrollSeamless>
)}
```

### Q: 如何在数据异步加载后开始滚动？

A: 使用 `useEffect` 监听数据变化：

```jsx
const [data, setData] = useState([]);
const scrollRef = useRef(null);

useEffect(() => {
  // 异步加载数据
  fetchData().then(result => {
    setData(result);
  });
}, []);

useEffect(() => {
  // 数据加载后更新滚动
  if (data.length > 0 && scrollRef.current) {
    scrollRef.current.updateData();
    scrollRef.current.start();
  }
}, [data]);
```

### Q: 如何实现点击项目的交互？

A: 在渲染函数中添加点击事件：

```jsx
<ScrollSeamless data={data}>
  {(item, index) => (
    <div
      key={index}
      onClick={() => handleItemClick(item, index)}
      style={{ cursor: 'pointer' }}
    >
      {item}
    </div>
  )}
</ScrollSeamless>
```

更多问题请参考 [API 文档](./API.md) 或提交 [Issue](https://github.com/chao921125/scroll-seamless/issues)。
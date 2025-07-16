# Scroll Seamless 插件系统

Scroll Seamless 提供了强大的插件系统，允许您扩展和自定义滚动行为。本文档详细介绍了如何使用内置插件以及如何创建自定义插件。

## 目录

- [插件系统概述](#插件系统概述)
- [内置插件](#内置插件)
  - [性能监控插件](#性能监控插件)
  - [无障碍插件](#无障碍插件)
- [使用插件](#使用插件)
- [创建自定义插件](#创建自定义插件)
- [插件通信](#插件通信)
- [最佳实践](#最佳实践)
- [常见问题](#常见问题)

## 插件系统概述

Scroll Seamless 的插件系统基于简单而强大的设计原则：

1. **可组合性**：多个插件可以同时工作，互不干扰
2. **可扩展性**：插件可以扩展核心功能，而不需要修改核心代码
3. **生命周期管理**：插件有明确的初始化和销毁阶段
4. **访问核心实例**：插件可以访问滚动实例的方法和属性

每个插件都是一个符合以下接口的对象：

```typescript
interface ScrollSeamlessPlugin {
  id: string;                                // 插件唯一标识符
  apply: (instance: ScrollSeamless) => void; // 应用插件的方法
  destroy?: () => void;                      // 可选的销毁方法
}
```

## 内置插件

### 性能监控插件

性能监控插件可以帮助您监控滚动性能，包括 FPS（每秒帧数）和内存使用情况。

```javascript
import { ScrollSeamless, PerformancePlugin } from "scroll-seamless/core";

// 创建性能监控插件
const performancePlugin = new PerformancePlugin({
  enabled: true,       // 是否启用
  fps: true,           // 是否监控 FPS
  memory: true,        // 是否监控内存使用
  onUpdate: (metrics) => {
    console.log('性能指标:', metrics);
    // metrics 包含 fps 和 memory 信息
  }
});

// 使用插件
const scrollInstance = new ScrollSeamless(container, {
  data: data,
  plugins: [performancePlugin]
});
```

性能指标包括：

```typescript
interface PerformanceMetrics {
  fps: number;                 // 当前 FPS
  memory?: {                   // 内存使用情况（如果浏览器支持）
    jsHeapSizeLimit: number;   // JS 堆大小限制
    totalJSHeapSize: number;   // 总 JS 堆大小
    usedJSHeapSize: number;    // 已使用的 JS 堆大小
  };
  timing?: {                   // 时间指标
    renderTime: number;        // 渲染时间
    animationTime: number;     // 动画时间
  };
}
```

### 无障碍插件

无障碍插件为滚动内容添加了无障碍支持，使其对屏幕阅读器和键盘导航更加友好。

```javascript
import { ScrollSeamless, AccessibilityPlugin } from "scroll-seamless/core";

// 创建无障碍插件
const accessibilityPlugin = new AccessibilityPlugin({
  enabled: true,                // 是否启用
  ariaLabel: "滚动内容",         // ARIA 标签
  ariaLive: "polite",           // ARIA 实时区域策略
  keyboardControl: true,        // 是否启用键盘控制
  focusable: true,              // 内容是否可聚焦
  announceItems: true,          // 是否朗读新项目
  pauseOnFocus: true            // 聚焦时是否暂停
});

// 使用插件
const scrollInstance = new ScrollSeamless(container, {
  data: data,
  plugins: [accessibilityPlugin]
});
```

## 使用插件

### 初始化时添加插件

```javascript
import { ScrollSeamless } from "scroll-seamless/core";
import { PerformancePlugin } from "scroll-seamless/core";
import { createVirtualScrollPlugin } from "scroll-seamless/plugins";

// 创建插件实例
const performancePlugin = new PerformancePlugin({ enabled: true });
const virtualScrollPlugin = createVirtualScrollPlugin({ enabled: true });

// 初始化时添加插件
const scrollInstance = new ScrollSeamless(container, {
  data: data,
  plugins: [performancePlugin, virtualScrollPlugin]
});
```

### 动态添加和移除插件

```javascript
// 动态添加插件
scrollInstance.addPlugin({
  id: 'custom-plugin',
  apply: (instance) => {
    console.log('自定义插件已应用');
  },
  destroy: () => {
    console.log('自定义插件已销毁');
  }
});

// 移除插件
scrollInstance.removePlugin('custom-plugin');
```

## 创建自定义插件

创建自定义插件只需要实现 `ScrollSeamlessPlugin` 接口：

```javascript
// 创建自定义插件
const myCustomPlugin = {
  id: 'my-custom-plugin',
  
  // 应用插件
  apply: (instance) => {
    console.log('自定义插件已应用');
    
    // 保存原始事件处理器
    const originalOnEvent = instance.options.onEvent;
    
    // 扩展事件处理
    instance.options.onEvent = (event, data) => {
      // 自定义逻辑
      if (event === 'start') {
        console.log('滚动开始，添加自定义行为');
        // 执行自定义行为...
      }
      
      // 调用原始事件处理器
      if (originalOnEvent) {
        originalOnEvent(event, data);
      }
    };
    
    // 添加自定义方法
    instance._customMethod = () => {
      console.log('执行自定义方法');
    };
    
    // 监听 DOM 事件
    this.clickHandler = () => {
      console.log('容器被点击');
    };
    instance.container.addEventListener('click', this.clickHandler);
  },
  
  // 销毁插件
  destroy: function() {
    console.log('自定义插件已销毁');
    
    // 清理事件监听器
    if (this.clickHandler) {
      instance.container.removeEventListener('click', this.clickHandler);
    }
  }
};

// 使用自定义插件
const scrollInstance = new ScrollSeamless(container, {
  data: data,
  plugins: [myCustomPlugin]
});

// 调用插件添加的方法
scrollInstance._customMethod();
```

### 插件类模式

对于更复杂的插件，可以使用类模式：

```javascript
class AdvancedPlugin {
  constructor(options = {}) {
    this.options = {
      ...this.defaultOptions,
      ...options
    };
    this.id = 'advanced-plugin';
  }
  
  get defaultOptions() {
    return {
      enabled: true,
      feature1: true,
      feature2: false
    };
  }
  
  apply(instance) {
    this.instance = instance;
    console.log('高级插件已应用');
    
    if (this.options.feature1) {
      this.enableFeature1();
    }
    
    if (this.options.feature2) {
      this.enableFeature2();
    }
  }
  
  enableFeature1() {
    console.log('启用特性 1');
    // 实现特性 1...
  }
  
  enableFeature2() {
    console.log('启用特性 2');
    // 实现特性 2...
  }
  
  destroy() {
    console.log('高级插件已销毁');
    this.instance = null;
  }
}

// 使用高级插件
const advancedPlugin = new AdvancedPlugin({
  feature1: true,
  feature2: true
});

const scrollInstance = new ScrollSeamless(container, {
  data: data,
  plugins: [advancedPlugin]
});
```

## 插件通信

插件之间可以通过以下方式进行通信：

### 1. 通过滚动实例

```javascript
// 插件 A
const pluginA = {
  id: 'plugin-a',
  apply: (instance) => {
    // 在实例上存储数据
    instance._pluginAData = {
      value: 42
    };
    
    // 添加方法
    instance._pluginAMethod = () => {
      console.log('Plugin A method called');
    };
  }
};

// 插件 B
const pluginB = {
  id: 'plugin-b',
  apply: (instance) => {
    // 访问插件 A 的数据
    console.log('Plugin A data:', instance._pluginAData);
    
    // 调用插件 A 的方法
    instance._pluginAMethod();
  }
};
```

### 2. 通过事件系统

```javascript
// 插件 A
const pluginA = {
  id: 'plugin-a',
  apply: (instance) => {
    // 保存原始事件处理器
    const originalOnEvent = instance.options.onEvent;
    
    // 扩展事件处理
    instance.options.onEvent = (event, data) => {
      // 发出自定义事件
      if (event === 'cycle') {
        const customEvent = 'plugin-a:cycle-complete';
        const customData = { cycleCount: data.cycleCount };
        
        if (originalOnEvent) {
          originalOnEvent(customEvent, customData);
        }
      }
      
      // 调用原始事件处理器
      if (originalOnEvent) {
        originalOnEvent(event, data);
      }
    };
  }
};

// 插件 B
const pluginB = {
  id: 'plugin-b',
  apply: (instance) => {
    // 保存原始事件处理器
    const originalOnEvent = instance.options.onEvent;
    
    // 监听插件 A 的自定义事件
    instance.options.onEvent = (event, data) => {
      if (event === 'plugin-a:cycle-complete') {
        console.log('Plugin A completed a cycle:', data);
      }
      
      // 调用原始事件处理器
      if (originalOnEvent) {
        originalOnEvent(event, data);
      }
    };
  }
};
```

## 最佳实践

### 1. 插件命名

- 使用有意义的唯一 ID
- 遵循命名约定：`feature-name-plugin`

### 2. 性能考虑

- 避免在高频事件处理器中执行昂贵操作
- 使用节流或防抖技术处理频繁事件
- 在不需要时禁用插件功能

### 3. 错误处理

- 在插件中捕获并处理错误
- 避免影响核心功能

```javascript
const robustPlugin = {
  id: 'robust-plugin',
  apply: (instance) => {
    try {
      // 插件逻辑
    } catch (error) {
      console.error('Plugin error:', error);
      // 可能的恢复逻辑
    }
  }
};
```

### 4. 清理资源

- 在 `destroy` 方法中清理所有资源
- 移除事件监听器
- 清除定时器
- 释放引用

## 常见问题

### Q: 插件的执行顺序是怎样的？

A: 插件按照添加的顺序执行。如果插件之间有依赖关系，请确保按正确的顺序添加它们。

### Q: 如何调试插件问题？

A: 在插件的关键点添加日志，使用浏览器开发工具的断点，或使用性能监控插件来跟踪性能问题。

### Q: 插件可以修改滚动实例的哪些部分？

A: 插件可以访问和修改实例的大部分属性和方法，但应避免修改私有属性（以 `_` 开头）。最好通过扩展事件处理器或添加新方法来增强功能。

### Q: 如何在 React 或 Vue 组件中使用插件？

A: 在组件中，可以通过 `plugins` 属性传递插件数组：

```jsx
// React
<ScrollSeamless
  data={data}
  plugins={[performancePlugin, virtualScrollPlugin]}
>
  {(item) => <div>{item}</div>}
</ScrollSeamless>
```

```vue
<!-- Vue -->
<ScrollSeamless
  :data="data"
  :plugins="[performancePlugin, virtualScrollPlugin]"
>
  <template #default="{ item }">
    <div>{{ item }}</div>
  </template>
</ScrollSeamless>
```

### Q: 如何创建可配置的插件？

A: 使用工厂函数或类构造函数接受配置选项：

```javascript
// 工厂函数方式
function createConfigurablePlugin(options) {
  return {
    id: 'configurable-plugin',
    apply: (instance) => {
      // 使用 options 配置插件行为
    },
    destroy: () => {
      // 清理资源
    }
  };
}

const myPlugin = createConfigurablePlugin({
  feature1: true,
  feature2: false
});
```
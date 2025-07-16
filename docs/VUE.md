# Scroll Seamless Vue 集成指南

本指南详细介绍了如何在 Vue 项目中使用 Scroll Seamless 库。

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

### Vue 3 (Composition API)

```vue
<template>
  <div>
    <div style="width: 300px; height: 50px; margin: 20px 0;">
      <ScrollSeamless
        ref="scrollRef"
        :data="data"
        direction="left"
        :step="1"
        :hover-stop="true"
        v-model="isScrolling"
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

    <div>
      <button @click="startScroll">开始</button>
      <button @click="stopScroll">停止</button>
      <button @click="updateScrollData">更新数据</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { ScrollSeamless } from "scroll-seamless/vue";

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
</script>
```

### Vue 3 (Options API)

```vue
<template>
  <div>
    <div style="width: 300px; height: 50px; margin: 20px 0;">
      <ScrollSeamless
        ref="scrollRef"
        :data="data"
        direction="left"
        :step="1"
        :hover-stop="true"
        v-model="isScrolling"
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

    <div>
      <button @click="startScroll">开始</button>
      <button @click="stopScroll">停止</button>
      <button @click="updateScrollData">更新数据</button>
    </div>
  </div>
</template>

<script>
import { ScrollSeamless } from "scroll-seamless/vue";

export default {
  components: {
    ScrollSeamless
  },
  data() {
    return {
      data: ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"],
      isScrolling: true
    };
  },
  methods: {
    startScroll() {
      this.$refs.scrollRef?.start();
    },
    stopScroll() {
      this.$refs.scrollRef?.stop();
    },
    updateScrollData() {
      this.data = [...this.data, "New Item " + (this.data.length + 1)];
      this.$refs.scrollRef?.updateData();
    }
  }
};
</script>
```

## 组件 Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| `data` | `any[]` | `[]` | 滚动数据数组 |
| `direction` | `'up' \| 'down' \| 'left' \| 'right'` | `'left'` | 滚动方向 |
| `step` | `number` | `1` | 每步移动像素 |
| `stepWait` | `number` | `0` | 每步等待时间(ms) |
| `delay` | `number` | `0` | 初始延迟时间(ms) |
| `hover-stop` | `boolean` | `true` | 鼠标悬停是否暂停 |
| `wheel-enable` | `boolean` | `false` | 是否启用滚轮控制 |
| `rows` | `number` | `1` | 行数 |
| `cols` | `number` | `1` | 列数 |
| `custom` | `boolean` | `false` | 是否使用自定义内容 |
| `class` | `string \| object \| array` | - | 根容器类名 |
| `style` | `string \| object \| array` | - | 根容器样式 |
| `content-class` | `string` | - | 内容区类名 |
| `item-class` | `string` | - | 单项类名 |
| `plugins` | `ScrollSeamlessPlugin[]` | `[]` | 插件数组 |
| `modelValue` (v-model) | `boolean` | `true` | 是否正在滚动 |

## 组件方法

通过 `ref` 可以访问组件实例方法：

```javascript
// Composition API
const scrollRef = ref(null);

// 开始滚动
scrollRef.value?.start();

// 停止滚动
scrollRef.value?.stop();

// 更新数据（数据变化后调用）
scrollRef.value?.updateData();

// 销毁实例
scrollRef.value?.destroy();

// 获取当前位置
const position = scrollRef.value?.getPosition();

// 检查是否正在滚动
const isRunning = scrollRef.value?.isRunning();

// 更新配置选项
scrollRef.value?.setOptions({
  step: 2,
  direction: "right"
});

// Options API
this.$refs.scrollRef?.start();
this.$refs.scrollRef?.stop();
// ...其他方法
```

## 事件处理

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
};
</script>
```

## 高级用法

### 多行多列布局

```vue
<template>
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
</template>
```

### 自定义渲染

作用域插槽渲染（推荐）：

```vue
<template>
  <ScrollSeamless :data="data">
    <template #default="{ item, index }">
      <div :key="index" class="custom-item">
        <span class="item-index">{{ index + 1 }}</span>
        <span class="item-content">{{ item }}</span>
      </div>
    </template>
  </ScrollSeamless>
</template>
```

自定义内容模式：

```vue
<template>
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
</template>
```

### 虚拟滚动

```vue
<template>
  <div style="width: 600px; height: 300px;">
    <ScrollSeamless
      :data="largeData"
      :plugins="[virtualScrollPlugin]"
      @event="handleEvent"
    >
      <template #default="{ item, index }">
        <div
          :key="index"
          style="
            padding: 10px;
            margin: 5px;
            background-color: #f0f0f0;
            border-radius: 4px;
            width: 180px;
            height: 30px;
          "
        >
          {{ item }}
        </div>
      </template>
    </ScrollSeamless>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { ScrollSeamless } from "scroll-seamless/vue";
import { createVirtualScrollPlugin } from "scroll-seamless/plugins";

// 创建大数据集
const largeData = ref(Array.from({ length: 10000 }, (_, i) => `Item ${i + 1}`));

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

const handleEvent = (event, data) => {
  if (event === "virtual-scroll-update") {
    console.log("虚拟滚动更新:", data);
  }
};
</script>
```

### 插件系统

```vue
<template>
  <div style="width: 400px; height: 50px;">
    <ScrollSeamless
      ref="scrollRef"
      :data="data"
    >
      <template #default="{ item }">
        <div>{{ item }}</div>
      </template>
    </ScrollSeamless>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { ScrollSeamless } from "scroll-seamless/vue";

const scrollRef = ref(null);
const data = ref(Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`));

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

onMounted(() => {
  if (scrollRef.value) {
    // 动态添加插件
    scrollRef.value.addPlugin(customPlugin);
  }
});

onBeforeUnmount(() => {
  if (scrollRef.value) {
    scrollRef.value.removePlugin('custom-plugin');
  }
});
</script>
```

## 性能优化

1. **使用虚拟滚动**：对于大数据集（1000+ 项），始终使用虚拟滚动插件。

2. **避免频繁更新**：不要在每次渲染周期都调用 `updateData()`，而是在数据真正变化时才调用。

3. **使用 v-memo**：对于复杂的项目渲染，使用 `v-memo` 避免不必要的重渲染。

```vue
<template>
  <ScrollSeamless :data="data">
    <template #default="{ item, index }">
      <div v-memo="[item]" :key="index" class="scroll-item">
        {{ item }}
      </div>
    </template>
  </ScrollSeamless>
</template>
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

```vue
<template>
  <div v-if="showScroll">
    <ScrollSeamless
      ref="scrollRef"
      :data="data"
    >
      <template #default="{ item }">
        <div>{{ item }}</div>
      </template>
    </ScrollSeamless>
  </div>
</template>
```

### Q: 如何在数据异步加载后开始滚动？

A: 使用 `watch` 监听数据变化：

```vue
<script setup>
import { ref, watch } from "vue";
import { ScrollSeamless } from "scroll-seamless/vue";

const scrollRef = ref(null);
const data = ref([]);

// 异步加载数据
const fetchData = async () => {
  const result = await api.getData();
  data.value = result;
};

// 监听数据变化
watch(data, (newData) => {
  if (newData.length > 0 && scrollRef.value) {
    scrollRef.value.updateData();
    scrollRef.value.start();
  }
}, { deep: true });

// 初始加载
fetchData();
</script>
```

### Q: 如何实现点击项目的交互？

A: 在作用域插槽中添加点击事件：

```vue
<template>
  <ScrollSeamless :data="data">
    <template #default="{ item, index }">
      <div
        :key="index"
        @click="handleItemClick(item, index)"
        style="cursor: pointer;"
      >
        {{ item }}
      </div>
    </template>
  </ScrollSeamless>
</template>

<script setup>
const handleItemClick = (item, index) => {
  console.log('点击了项目:', item, '索引:', index);
  // 处理点击逻辑
};
</script>
```

更多问题请参考 [API 文档](./API.md) 或提交 [Issue](https://github.com/chao921125/scroll-seamless/issues)。
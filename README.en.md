# Scroll Seamless

[![npm version](https://img.shields.io/npm/v/scroll-seamless.svg)](https://www.npmjs.com/package/scroll-seamless)
[![npm downloads](https://img.shields.io/npm/dm/scroll-seamless.svg)](https://www.npmjs.com/package/scroll-seamless)
[![License](https://img.shields.io/npm/l/scroll-seamless.svg)](https://github.com/chao921125/scroll-seamless/blob/main/LICENSE)

A seamless scrolling library for JavaScript, Vue3, and React.

## Features

- 🚀 High-performance seamless scrolling
- 🎯 Horizontal/vertical direction support
- 🎨 Unified rendering mode (scoped slots/function children)
- 🖼️ Multi-row and multi-column layout support
- 🔄 True seamless transitions with no gaps
- 🎛️ Rich configuration options
- 🖱️ Hover pause
- 🎡 Wheel control
- 📱 Responsive design
- 🔧 TypeScript support
- 🔌 Plugin system support
- 📊 Built-in performance monitoring
- ♿ Accessibility features
- ⚡ Virtual scrolling support (optimized for large data sets)
- 🎨 Fully customizable mode

## Installation

```bash
npm install scroll-seamless
```

## Usage

### React Component

```jsx
import React, { useRef } from "react";
import { ScrollSeamless } from "scroll-seamless/react";

const MyComponent = () => {
  const scrollRef = useRef(null);
  const data = ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"];

  return (
    <div style={{ width: "300px", height: "50px" }}>
      <ScrollSeamless
        ref={scrollRef}
        data={data}
        direction="right"
        step={1}
        hoverStop={true}
        wheelEnable={true}
        rows={1}
        cols={1}
        itemClass="custom-item-class"
      >
        {/* Function children - renders individual items */}
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
      
      {/* Control buttons */}
      <div className="controls">
        <button onClick={() => scrollRef.current?.start()}>Start</button>
        <button onClick={() => scrollRef.current?.stop()}>Stop</button>
        <button onClick={() => scrollRef.current?.updateData()}>Update Data</button>
      </div>
    </div>
  );
};
```

### Vue Component

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
      :rows="1"
      :cols="1"
      item-class="custom-item-class"
      v-model="isScrolling"
    >
      <!-- Scoped slot - renders individual items -->
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
    
    <!-- Control buttons -->
    <div class="controls">
      <button @click="startScroll">Start</button>
      <button @click="stopScroll">Stop</button>
      <button @click="updateScrollData">Update Data</button>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { ScrollSeamless } from "scroll-seamless/vue";

export default {
  components: { ScrollSeamless },
  setup() {
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

    return { 
      scrollRef, 
      data, 
      isScrolling,
      startScroll,
      stopScroll,
      updateScrollData
    };
  },
};
</script>
```

### JavaScript Core Library

```javascript
import { ScrollSeamless } from "scroll-seamless/core";

const container = document.getElementById("scroll-container");
const scrollInstance = new ScrollSeamless(container, {
  data: ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"],
  direction: "right",
  step: 1,
  hoverStop: true,
  wheelEnable: true,
  rows: 1,
  cols: 1,
  plugins: [], // Optional: add custom plugins
  performance: { enabled: true }, // Enable performance monitoring
  accessibility: { enabled: true } // Enable accessibility features
});

// Control methods
scrollInstance.start();
scrollInstance.stop();
scrollInstance.updateData();
scrollInstance.destroy();

// Get state
const position = scrollInstance.getPosition();
const isRunning = scrollInstance.isRunning();

// Set options
scrollInstance.setOptions({
  step: 2,
  direction: "left"
});
```

### Multi-row and Multi-column Layout Example

```vue
<template>
  <div style="width: 600px; height: 200px;">
    <ScrollSeamless
      ref="scrollRef"
      :data="items"
      direction="left"
      :step="1"
      :rows="2"
      :cols="2"
      :hover-stop="true"
    >
      <template #default="{ item, index, rowIndex, colIndex }">
        <div class="grid-item">
          <span>{{ item }}</span>
          <small>Row: {{ rowIndex }}, Col: {{ colIndex }}</small>
        </div>
      </template>
    </ScrollSeamless>
  </div>
</template>

<script>
import { ref } from "vue";
import { ScrollSeamless } from "scroll-seamless/vue";

export default {
  components: { ScrollSeamless },
  setup() {
    const scrollRef = ref(null);
    const items = ref(Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`));
    return { scrollRef, items };
  },
};
</script>

<style scoped>
.grid-item {
  padding: 15px;
  margin: 5px;
  background-color: #f0f0f0;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
```

### Using Plugins

```javascript
import { ScrollSeamless, PerformancePlugin } from "scroll-seamless/core";
import { VirtualScrollPlugin } from "scroll-seamless/plugins";

// Create performance monitoring plugin
const performancePlugin = new PerformancePlugin({
  fps: true,
  memory: true,
  onUpdate: (metrics) => {
    console.log('Performance metrics:', metrics);
  }
});

// Create virtual scroll plugin (for large datasets)
const virtualScrollPlugin = new VirtualScrollPlugin({
  itemHeight: 30,
  overscan: 5
});

// Initialize scroll instance with plugins
const scrollInstance = new ScrollSeamless(container, {
  data: Array.from({ length: 1000 }, (_, i) => `Item ${i + 1}`),
  plugins: [performancePlugin, virtualScrollPlugin]
});

// You can also add plugins after instance creation
scrollInstance.addPlugin({
  id: 'custom-plugin',
  apply: (instance) => {
    // Custom plugin logic
    console.log('Custom plugin applied');
  },
  destroy: () => {
    console.log('Custom plugin destroyed');
  }
});

// Remove plugins
scrollInstance.removePlugin('custom-plugin');
```

## Multi-row and Multi-column Layout

Scroll Seamless supports multi-row and multi-column layouts, which can be controlled via the `rows` and `cols` parameters:

```jsx
// React multi-row and multi-column example
<ScrollSeamless
  data={data}
  direction="left"
  rows={2}
  cols={2}
>
  {(item, index, rowIndex, colIndex) => (
    <div key={index}>
      {item} (Row: {rowIndex}, Col: {colIndex})
    </div>
  )}
</ScrollSeamless>
```

```vue
<!-- Vue multi-row and multi-column example -->
<ScrollSeamless
  :data="data"
  direction="left"
  :rows="2"
  :cols="2"
>
  <template #default="{ item, index, rowIndex, colIndex }">
    <div :key="index">
      {{ item }} (Row: {{ rowIndex }}, Col: {{ colIndex }})
    </div>
  </template>
</ScrollSeamless>
```

### React Custom Mode Example

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
        hoverStop={true}
      >
        {/* Completely custom content structure */}
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

## Virtual Scrolling (Large Data Optimization)

For large data scenarios (such as 10,000+ items), you can use the virtual scrolling plugin to optimize performance:

```javascript
import { ScrollSeamless } from 'scroll-seamless/core';
import { createVirtualScrollPlugin } from 'scroll-seamless/plugins';

// Create virtual scrolling plugin
const virtualScrollPlugin = createVirtualScrollPlugin({
  enabled: true,
  itemWidth: 200,  // Width of each item
  itemHeight: 40,  // Height of each item
  bufferSize: 10,  // Buffer size
  onRender: (startIndex, endIndex, visibleCount) => {
    console.log(`Render range: ${startIndex} - ${endIndex}, visible count: ${visibleCount}`);
  }
});

// Use plugin
const scrollInstance = new ScrollSeamless(container, {
  data: largeData, // Large data
  plugins: [virtualScrollPlugin],
  onEvent: (event, data) => {
    if (event === 'virtual-scroll-update') {
      console.log('Performance metrics:', data);
    }
  }
});
```

**Performance Comparison:**
- Traditional rendering: needs to render `data count × 2` DOM nodes
- Virtual scrolling: only renders visible area + buffer nodes
- Performance improvement: significantly reduces memory usage and rendering time

## Unified Rendering Mode

Scroll Seamless adopts a unified rendering mode to ensure consistency between React and Vue components:

### React Functional Children
```jsx
<ScrollSeamless data={data}>
  {(item, index) => (
    <div key={index}>{item}</div>
  )}
</ScrollSeamless>
```

### Vue Scoped Slots
```vue
<ScrollSeamless :data="data">
  <template #default="{ item, index }">
    <div :key="index">{{ item }}</div>
  </template>
</ScrollSeamless>
```

Advantages of this mode:
- **Consistency**: React and Vue components use the same rendering logic
- **Flexibility**: Developers can completely control the rendering of each item
- **Maintainability**: Component internally manages data array rendering uniformly
- **Extensibility**: Easy to add new rendering features

## Style Isolation and Customization

Scroll Seamless component core styles only ensure functionality (layout, overflow, content copying), all visual styles can be customized by users.

### React Custom Styles

- `className`/`style`: Applied to the outermost container
- `contentClassName`: Applied to each content area (.ss-content)
- `itemClassName`: Applied to each item

**Example:**
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

### Vue Custom Styles

- `class`/`style`: Applied to the outermost container
- `content-class`: Applied to each content area (.ss-content)
- `item-class`: Applied to each item

**Example:**
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

## API Documentation

### Component Props

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `data` | `string[]` | `[]` | Scroll data array |
| `direction` | `'up' \| 'down' \| 'left' \| 'right'` | `'left'` | Scroll direction (up/down/left/right) |
> `direction` explanation:
> - `'left'`: content scrolls left (default)
> - `'right'`: content scrolls right
> - `'up'`: content scrolls up
> - `'down'`: content scrolls down
| `step` | `number` | `1` | Pixels moved per step |
| `stepWait` | `number` | `0` | Wait time per step (ms) |
| `delay` | `number` | `0` | Initial delay time (ms) |
| `hoverStop` | `boolean` | `true` | Whether to pause on mouse hover |
| `wheelEnable` | `boolean` | `false` | Whether to enable wheel control |
| `custom` | `boolean` | `false` | Whether to use custom content |
| `plugins` | `ScrollSeamlessPlugin[]` | `[]` | Plugin array |
| `onEvent` | `(event, data) => void` | - | Event callback |

### Component Methods

| Method | Parameters | Return | Description |
|--------|------------|--------|-------------|
| `start()` | - | `void` | Start scrolling |
| `stop()` | - | `void` | Stop scrolling |
| `destroy()` | - | `void` | Destroy instance |
| `updateData()` | - | `void` | Update data |
| `setOptions()` | `options` | `void` | Set options |

### Event Types

| Event | Trigger Time | Callback Parameters |
|-------|--------------|-------------------|
| `start` | When scrolling starts | `{ type, direction, position, cycleCount }` |
| `stop` | When scrolling stops | `{ type, direction, position, cycleCount }` |
| `destroy` | When instance is destroyed | `{ type, direction, position, cycleCount }` |
| `update` | When data is updated | `{ type, direction, position, cycleCount }` |
| `cycle` | When one cycle is completed | `{ type, direction, position, cycleCount }` |
| `reach-start` | When scrolling to start | `{ type, direction, position, cycleCount }` |
| `reach-end` | When scrolling to end | `{ type, direction, position, cycleCount }` |

### Virtual Scrolling Plugin Configuration

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Whether to enable virtual scrolling |
| `itemWidth` | `number` | `200` | Width of each item (horizontal scroll) |
| `itemHeight` | `number` | `40` | Height of each item (vertical scroll) |
| `bufferSize` | `number` | `5` | Buffer size |
| `onRender` | `(start, end, count) => void` | - | Render callback |

## Direction Parameter

- `direction` only supports `'left' | 'right' | 'up' | 'down'`, default is `'left'`, fully consistent with source type.
- It is recommended to use `DEFAULT_OPTIONS`, types, and utility functions exported from core for multi-end reuse.

## Utility Functions & Advanced Usage

You can import the following utility functions from `scroll-seamless/core/utils`:
- `getLegalDirection(direction)`: direction validation
- `getContentTransform(direction, position, totalLength, isSecondContent)`: content transform calculation
- `getContentStyle(direction)`: content area style generation
- `fireEvent(handler, event, payload)`: unified event dispatch

Example:
```js
import { getLegalDirection, getContentTransform, getContentStyle, fireEvent } from 'scroll-seamless/core/utils';
```
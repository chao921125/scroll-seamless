# Scroll Seamless

A seamless scroll library supporting JavaScript, Vue3, and React.

## Features

- 🚀 High-performance seamless scrolling
- 🎯 Supports horizontal/vertical directions
- 🎨 Unified rendering mode (scoped slots/functional children)
- 🎛️ Rich configuration options
- 🖱️ Mouse hover pause
- 🎡 Wheel control
- 📱 Responsive design
- 🔧 TypeScript support
- ⚡ Virtual scrolling support (large data optimization)
- 🎨 Fully custom mode (custom mode)

## Installation

```bash
npm install scroll-seamless
```

## Usage

### React Component

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
        {/* Functional children - render single item */}
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
    >
      <!-- Scoped slot - render single item -->
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

### JavaScript Core Library

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

// Control methods
scrollInstance.start();
scrollInstance.stop();
scrollInstance.destroy();
```

## Fully Custom Mode (Custom Mode)

When you need to completely customize the content structure, you can use `custom=true` mode. In this mode, the component will not automatically render the data array, but completely delegate the slot/children content to the user.

### Use Cases

- Complex layout structures (such as cards, images, nested elements, etc.)
- Need custom styles and interactions
- Non-standard data display requirements
- Need to combine with other components

### Vue Custom Mode Example

```vue
<template>
  <!-- Fully custom mode (custom=true, slot rendered once, user controls structure) -->
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
        custom={true}
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

### Notes

1. **Slot content must be pure static structure**: custom mode does not automatically pass item/index parameters
2. **Content will be copied twice**: for seamless scrolling effect
3. **Custom content dimensions**: will directly affect the scroll area size and effect
4. **Performance considerations**: complex structures will affect rendering performance, recommend reasonable control of content complexity

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

## Event System

It is recommended to use the `fireEvent` utility for custom event dispatch, making plugin/extension integration easier.

## License

BSD-3-Clause 

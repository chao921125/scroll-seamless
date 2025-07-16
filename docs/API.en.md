# scroll-seamless API Documentation

## Parameters
| Name | Type | Description | Default |
| ---- | ---- | ----------- | ------- |
| data | string[] | Scroll content | required |
| direction | 'up' | Scroll direction | 'left' |
|           | 'down' |               |         |
|           | 'left' |               |         |
|           | 'right' |              |         |
| minCountToScroll | number | Minimum items to scroll | 2 |
| step | number | Step speed (px/frame) | 1 |
| stepWait | number | Step wait time (ms) | 0 |
| delay | number | Animation delay (ms) | 0 |
| bezier | [number,number,number,number] | Bezier curve | [0.25,0.1,0.25,1] |
| hoverStop | boolean | Pause on hover | true |
| wheelEnable | boolean | Mouse wheel | false |
| singleLine | boolean | Single line horizontal scroll | false |
| rows | number | Number of rows | 1 |
| cols | number | Number of columns | 1 |
| class | string/object/array | Container custom class | '' |
| style | string/object/array | Container custom style | '' |
| contentClass | string/object/array | Content area custom class | '' |
| itemClass | string/object/array | Item custom class | '' |
| dataDriven | boolean | Data-driven mode | false |
| plugins | ScrollSeamlessPlugin[] | Plugin list | [] |
| performance | PerformancePluginOptions | Performance monitoring config | { enabled: true } |
| accessibility | AccessibilityPluginOptions | Accessibility config | { enabled: true } |

## Methods
- `start()`: Start scrolling
- `stop()`: Stop scrolling
- `destroy()`: Destroy instance
- `isRunning()`: Is scrolling
- `updateData()`: Update data
- `setOptions(options)`: Update options
- `getPosition()`: Get current scroll position
- `setPosition(position)`: Set scroll position
- `addPlugin(plugin)`: Add plugin
- `removePlugin(pluginId)`: Remove plugin
- `getPerformance()`: Get performance data
- `getRenderMatrix()`: Get render matrix (data-driven mode)
- `getTransforms()`: Get transform styles (data-driven mode)

## Types
- ScrollDirection: Scroll direction type ('up' | 'down' | 'left' | 'right')
- ScrollSeamlessEvent: Scroll event type
- ScrollSeamlessEventPayload: Event callback parameter type
- PerformancePluginOptions: Performance monitoring plugin config
- AccessibilityPluginOptions: Accessibility plugin config
- ScrollSeamlessPlugin: Plugin type
- ScrollSeamlessOptions: All parameter type definitions
- ScrollSeamlessController: All method type definitions

## Plugin System
- Support for custom plugin extensions
- Built-in performance monitoring plugin
- Built-in accessibility plugin
- Support for virtual scrolling plugin

## Advanced Usage
### Vue Component
- Supports scoped slots #default="{ item, index, rowIndex, colIndex }"
- Supports v-model for controlling scroll state
- Supports multi-row and multi-column layout (via rows and cols parameters)

### React Component
- Supports function children (item, index, rowIndex, colIndex) => ReactNode
- Supports ref for accessing component instance
- Supports multi-row and multi-column layout (via rows and cols parameters)

### Core Library
- Direct DOM manipulation
- Custom event listeners
- Advanced animation control

---

For more examples and usage, please refer to the main documentation and examples directory. 

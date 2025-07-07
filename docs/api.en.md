# seamless-scroll API Documentation

## Parameters
| Name | Type | Description | Default |
| ---- | ---- | ----------- | ------- |
| data | string[] | Scroll content | required |
| direction | 'horizontal' | 'vertical' | Scroll direction | 'horizontal' |
| minCountToScroll | number | Minimum items to scroll | 2 |
| step | number | Step speed (px/frame) | 1 |
| stepWait | number | Step wait time (ms) | 0 |
| delay | number | Animation delay (ms) | 0 |
| bezier | [number,number,number,number] | Bezier curve | [0.25,0.1,0.25,1] |
| hoverStop | boolean | Pause on hover | true |
| wheelEnable | boolean | Mouse wheel | false |
| singleLine | boolean | Single line horizontal scroll | false |

## Methods
- `start()`: Start scrolling
- `stop()`: Stop scrolling
- `destroy()`: Destroy instance
- `isRunning()`: Is scrolling
- `updateData(data)`: Update data
- `setOptions(options)`: Update options

## Types
- SeamlessScrollOptions: All parameter type definitions
- SeamlessScrollController: All method type definitions

## Extensibility
- Support for custom utility extensions
- Support for custom styles
- Multi-platform usage 
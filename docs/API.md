# scroll-seamless API 文档

## 参数说明
| 参数 | 类型 | 说明 | 默认值 |
| ---- | ---- | ---- | ------ |
| data | string[] | 滚动内容 | 必填 |
| direction | 'horizontal' | 滚动方向 'vertical' | 'horizontal' |
| minCountToScroll | number | 多少条数据开始滚动 | 2 |
| step | number | 步进速度（像素/帧） | 1 |
| stepWait | number | 单步停止等待时间(ms) | 0 |
| delay | number | 动画延时(ms) | 0 |
| bezier | [number,number,number,number] | 贝塞尔曲线 | [0.25,0.1,0.25,1] |
| hoverStop | boolean | 悬停是否停止 | true |
| wheelEnable | boolean | 鼠标滚轮 | false |
| singleLine | boolean | 单行横向滚动 | false |
| custom | boolean | slot渲染模式，true为完全自定义（slot只渲染一次，用户自定义结构），false为兼容作用域插槽 | false |

## 方法说明
- `start()`：启动滚动
- `stop()`：停止滚动
- `destroy()`：销毁实例
- `isRunning()`：是否正在滚动
- `updateData(data)`：更新数据
- `setOptions(options)`：动态更新参数

## 类型 Type
- ScrollSeamlessOptions：所有参数类型定义
- ScrollSeamlessController：所有方法类型定义

## 扩展性
- 支持自定义工具方法扩展
- 支持自定义样式
- 支持多端调用

### slot用法
- 默认（custom=false）：slot支持作用域插槽，#default="{ item, index }"
- 完全自定义（custom=true）：slot只渲染一次，用户可在slot内任意v-for、任意结构

---

如需更多示例和用法，请参考主文档和示例目录。 

# scroll-seamless API 文档

## 参数说明
| 参数 | 类型 | 说明 | 默认值 |
| ---- | ---- | ---- | ------ |
| data | string[] | 滚动内容 | 必填 |
| direction | 'up' | 滚动方向 | 'left' |
|           | 'down' |           |        |
|           | 'left' |           |        |
|           | 'right' |           |        |
> `direction` 说明：
> - `'up'`：内容向上滚动
> - `'down'`：内容向下滚动
> - `'left'`：内容向左滚动（默认）
> - `'right'`：内容向右滚动
| minCountToScroll | number | 多少条数据开始滚动 | 2 |
| step | number | 步进速度（像素/帧） | 1 |
| stepWait | number | 单步停止等待时间(ms) | 0 |
| delay | number | 动画延时(ms) | 0 |
| bezier | [number,number,number,number] | 贝塞尔曲线 | [0.25,0.1,0.25,1] |
| hoverStop | boolean | 悬停是否停止 | true |
| wheelEnable | boolean | 鼠标滚轮 | false |
| singleLine | boolean | 单行横向滚动 | false |
| rows | number | 行数 | 1 |
| cols | number | 列数 | 1 |
| class | string/object/array | 容器自定义类名 | '' |
| style | string/object/array | 容器自定义样式 | '' |
| contentClass | string/object/array | 内容区域自定义类名 | '' |
| itemClass | string/object/array | 项目自定义类名 | '' |
| dataDriven | boolean | 数据驱动模式 | false |
| plugins | ScrollSeamlessPlugin[] | 插件列表 | [] |
| performance | PerformancePluginOptions | 性能监控配置 | { enabled: true } |
| accessibility | AccessibilityPluginOptions | 无障碍配置 | { enabled: true } |

## 方法说明
- `start()`：启动滚动
- `stop()`：停止滚动
- `destroy()`：销毁实例
- `isRunning()`：是否正在滚动
- `updateData()`：更新数据
- `setOptions(options)`：动态更新参数
- `getPosition()`：获取当前滚动位置
- `setPosition(position)`：设置滚动位置
- `addPlugin(plugin)`：添加插件
- `removePlugin(pluginId)`：移除插件
- `getPerformance()`：获取性能数据
- `getRenderMatrix()`：获取渲染矩阵（数据驱动模式）
- `getTransforms()`：获取变换样式（数据驱动模式）

## 类型 Type
- ScrollDirection：滚动方向类型 ('up' | 'down' | 'left' | 'right')
- ScrollSeamlessEvent：滚动事件类型
- ScrollSeamlessEventPayload：事件回调参数类型
- PerformancePluginOptions：性能监控插件配置
- AccessibilityPluginOptions：无障碍插件配置
- ScrollSeamlessPlugin：插件类型
- ScrollSeamlessOptions：所有参数类型定义
- ScrollSeamlessController：所有方法类型定义

## 插件系统
- 支持自定义插件扩展功能
- 内置性能监控插件
- 内置无障碍插件
- 支持虚拟滚动插件

## 高级用法
### Vue组件
- 支持作用域插槽 #default="{ item, index, rowIndex, colIndex }"
- 支持v-model控制滚动状态
- 支持多行多列布局（通过rows和cols参数）

### React组件
- 支持函数式children (item, index, rowIndex, colIndex) => ReactNode
- 支持ref获取组件实例
- 支持多行多列布局（通过rows和cols参数）

### 核心库
- 支持直接操作DOM
- 支持自定义事件监听
- 支持高级动画控制

---

如需更多示例和用法，请参考主文档和示例目录。 

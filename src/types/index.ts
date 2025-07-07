/**
 * 滚动方向类型
 */
export type ScrollDirection = 'horizontal' | 'vertical';

/**
 * 无缝滚动配置项
 */
export interface ScrollSeamlessOptions {
  /** 滚动内容 */
  data: string[];
  /** 滚动方向，默认 horizontal */
  direction?: ScrollDirection;
  /** 多少条数据开始滚动 */
  minCountToScroll?: number;
  /** 步进速度，像素/帧 */
  step?: number;
  /** 单步停止等待时间 ms */
  stepWait?: number;
  /** 动画延时时间 ms */
  delay?: number;
  /** 贝塞尔曲线 */
  bezier?: [number, number, number, number];
  /** 鼠标悬停是否停止，默认 true */
  hoverStop?: boolean;
  /** 鼠标滚轮是否可用，默认 false */
  wheelEnable?: boolean;
  /** 启用单行横向滚动 */
  singleLine?: boolean;
}

/**
 * 无缝滚动控制器接口
 */
export interface ScrollSeamlessController {
  /** 启动滚动动画 */
  start(): void;
  /** 停止滚动动画 */
  stop(): void;
  /** 销毁实例，解绑事件 */
  destroy(): void;
  /** 是否正在滚动 */
  isRunning(): boolean;
  /** 更新滚动数据 */
  updateData(data: string[]): void;
  /** 动态更新参数 */
  setOptions(options: Partial<ScrollSeamlessOptions>): void;
}

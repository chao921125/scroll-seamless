/**
 * 滚动方向类型
 */
export type ScrollDirection = 'up' | 'down' | 'left' | 'right';

/**
 * 滚动事件类型
 */
export type ScrollSeamlessEvent =
  | 'start'
  | 'stop'
  | 'pause'
  | 'resume'
  | 'destroy'
  | 'update'
  | 'cycle'
  | 'reach-end'
  | 'reach-start'
  | 'error';

// 事件回调参数类型
export interface ScrollSeamlessEventPayload {
  type: ScrollSeamlessEvent;
  direction: ScrollDirection;
  position: number;
  cycleCount?: number;
  data?: any;
  error?: string;
  stack?: string;
}



/**
 * 组件 props/options 类型
 */
export interface ScrollSeamlessOptions {
  data: string[];
  direction?: ScrollDirection;
  minCountToScroll?: number;
  step?: number;
  stepWait?: number;
  delay?: number;
  bezier?: [number, number, number, number];
  hoverStop?: boolean;
  wheelEnable?: boolean;
  singleLine?: boolean;
  rows?: number;
  cols?: number;
  onEvent?: (event: ScrollSeamlessEvent, data?: any) => void;
  dataDriven?: boolean;
}

/**
 * 控制器方法类型
 */
export interface ScrollSeamlessController {
  start: () => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  destroy: () => void;
  updateData: () => void;
  setOptions: (options: Partial<ScrollSeamlessOptions>) => void;
  isRunning: () => boolean;
  // 可选：获取当前滚动位置
  getPosition?: () => number;
  setPosition?: (position: number) => void;
  // 渲染相关
  getRenderMatrix?: () => string[][];
  getTransforms?: () => string[];
}

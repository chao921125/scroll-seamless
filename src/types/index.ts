/**
 * Scroll Seamless - 类型定义
 */

// ===== 基础类型 =====

export type ScrollDirection = 'left' | 'right' | 'up' | 'down';

export type ScrollEventType =
  | 'start'
  | 'stop'
  | 'pause'
  | 'resume'
  | 'destroy'
  | 'update'
  | 'error'
  | 'wheel'
  | 'hover'
  | 'cycle'
  | 'position-change'
  | 'delay-end'
  | 'resize'
  | 'performance-degrade'
  | 'offset'
  | 'cycle-count';

// ===== 回调函数类型 =====

export type EventCallback = (type: ScrollEventType, data?: any) => void;

// ===== 配置接口 =====

export interface FadeEdgeOptions {
  enabled?: boolean;
  direction?: 'auto' | 'start' | 'end' | 'both';
  size?: number;
  color?: string;
  zIndex?: number;
}

export interface PerformanceOptions {
  enabled?: boolean;
  fps?: boolean;
  memory?: boolean;
  updateInterval?: number;
  onUpdate?: (metrics: PerformanceMetrics) => void;
}

export interface AccessibilityOptions {
  enabled?: boolean;
  ariaLabel?: string;
  ariaLive?: 'off' | 'polite' | 'assertive';
  role?: string;
  keyboardHint?: boolean;
}

export interface KeyboardOptions {
  enabled?: boolean;
  keyStep?: number;
  keyAcceleration?: boolean;
  keyRepeatDelay?: number;
}

export interface ScrollOptions {
  // ===== 必填项 =====
  data: string[];
  
  // ===== 基础滚动 =====
  direction?: ScrollDirection;
  step?: number;
  stepWait?: number;
  delay?: number;
  bezier?: [number, number, number, number];
  
  // ===== 布局 =====
  rows?: number;
  cols?: number;
  minCountToScroll?: number;
  
  // ===== 交互控制 =====
  hoverStop?: boolean;
  hoverDelay?: number;
  leaveDelay?: number;
  wheelEnable?: boolean;
  wheelSensitivity?: number;
  wheelStep?: number;
  wheelPreventDefault?: boolean;
  
  // ===== 动画控制 =====
  autoStart?: boolean;
  fixedTimeStep?: number;
  maxDeltaTime?: number;
  keepRafOnPause?: boolean;
  
  // ===== 虚拟滚动 =====
  virtualScroll?: boolean;
  bufferSize?: number;
  estimatedItemSize?: number;
  enableReuse?: boolean;
  
  // ===== 响应式 =====
  enableResizeObserver?: boolean;
  resizeDebounce?: number;
  resizeThreshold?: number;
  autoRelayout?: boolean;
  
  // ===== 渐隐效果 =====
  fadeEdge?: FadeEdgeOptions;
  
  // ===== 事件 =====
  onEvent?: (type: ScrollEventType, data?: any) => void;
  enableDomEvents?: boolean;
  eventThrottle?: number;
  
  // ===== 自定义渲染 =====
  renderItem?: (
    item: string,
    index: number,
    rowIndex?: number,
    colIndex?: number
  ) => HTMLElement;
  
  // ===== 分页加载 =====
  onLoadMore?: (currentCount: number) => Promise<string[]> | string[];
  
  // ===== 插件 =====
  plugins?: ScrollPlugin[];
  pluginTimeout?: number;
  strictMode?: boolean;
  
  // ===== 性能监控 =====
  performance?: PerformanceOptions;
  
  // ===== 无障碍 =====
  accessibility?: AccessibilityOptions;
  
  // ===== 键盘控制 =====
  keyboard?: KeyboardOptions;
  
  // ===== 对象池 =====
  minPoolSize?: number;
  maxPoolSize?: number;
  warmupPool?: boolean;
}

// ===== 插件接口 =====

/**
 * 滚动引擎接口（用于插件）
 * 避免循环依赖，只定义插件需要的方法
 */
export interface IScrollEngine {
  start(): void;
  stop(): void;
  pause(): void;
  resume(): void;
  update(): void;
  destroy(): void;
  getPosition(): number;
  getIsRunning(): boolean;
  getIsPaused(): boolean;
  getCycleCount(): number;
  getOptions(): Readonly<RequiredOptions>;
  on(type: ScrollEventType, callback: EventCallback): void;
  off(type: ScrollEventType, callback: EventCallback): void;
}

export interface ScrollPlugin {
  name: string;
  version: string;
  apply(engine: IScrollEngine): void;
  destroy?(): void;
}

// ===== 性能指标 =====

export interface PerformanceMetrics {
  fps: number;
  memory: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  } | null;
  domNodes: number;
  timestamp: number;
}

// ===== 事件数据 =====

export interface HoverEventData {
  type: 'enter' | 'leave';
  timestamp: number;
}

export interface WheelEventData {
  delta: number;
  position: number;
  timestamp: number;
}

export interface CycleEventData {
  count: number;
  direction: ScrollDirection;
  timestamp: number;
}

export interface UpdateEventData {
  oldData: string[];
  newData: string[];
  timestamp: number;
}

export interface ResizeEventData {
  oldSize: { width: number; height: number };
  newSize: { width: number; height: number };
  timestamp: number;
}

// ===== 滚动状态 =====

export interface ScrollState {
  position: number;
  content1: HTMLElement;
  content2: HTMLElement;
  contentSize: number;
}

// ===== 方向配置 =====

export interface DirectionConfig {
  isHorizontal: boolean;
  axis: 'width' | 'height';
  transform: 'translateX' | 'translateY';
  reverse: boolean;
  scrollSize: 'scrollWidth' | 'scrollHeight';
  clientSize: 'clientWidth' | 'clientHeight';
  offsetSize: 'offsetWidth' | 'offsetHeight';
}

// ===== 无缝连接结果 =====

export interface SeamlessResult {
  content1Transform: string;
  content2Transform: string;
  shouldReset: boolean;
}

// ===== 步等待状态 =====

export interface StepWaitState {
  accumulated: number;
  waiting: boolean;
  waitStart: number;
}

// ===== 可见范围 =====

export interface VisibleRange {
  start: number;
  end: number;
  offset: number;
}

// ===== 渲染项 =====

export interface RenderItem {
  element: HTMLElement;
  dataIndex: number;
  position: number;
}

// ===== 必需配置 =====

export interface RequiredOptions {
  data: string[];
  direction: ScrollDirection;
  step: number;
  stepWait: number;
  delay: number;
  bezier: [number, number, number, number];
  rows: number;
  cols: number;
  minCountToScroll: number;
  hoverStop: boolean;
  hoverDelay: number;
  leaveDelay: number;
  wheelEnable: boolean;
  wheelSensitivity: number;
  wheelStep: number;
  wheelPreventDefault: boolean;
  autoStart: boolean;
  fixedTimeStep: number;
  maxDeltaTime: number;
  keepRafOnPause: boolean;
  virtualScroll: boolean;
  bufferSize: number;
  estimatedItemSize: number;
  enableReuse: boolean;
  enableResizeObserver: boolean;
  resizeDebounce: number;
  resizeThreshold: number;
  autoRelayout: boolean;
  fadeEdge: FadeEdgeOptions;
  enableDomEvents: boolean;
  eventThrottle: number;
  plugins: ScrollPlugin[];
  pluginTimeout: number;
  strictMode: boolean;
  minPoolSize: number;
  maxPoolSize: number;
  warmupPool: boolean;
  onLoadMore?: (currentCount: number) => Promise<string[]> | string[];
  renderItem?: (
    item: string,
    index: number,
    rowIndex?: number,
    colIndex?: number
  ) => HTMLElement;
  onEvent?: (type: ScrollEventType, data?: any) => void;
  performance?: PerformanceOptions;
  accessibility?: AccessibilityOptions;
  keyboard?: KeyboardOptions;
}

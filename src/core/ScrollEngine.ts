/**
 * ScrollEngine - 核心滚动引擎
 * 
 * 职责：
 * - 管理无缝滚动的完整生命周期
 * - 协调所有子模块
 * - 提供公共API
 */

import type {
  ScrollOptions,
  RequiredOptions,
  ScrollDirection,
  ScrollEventType,
  ScrollState,
  StepWaitState,
  PerformanceMetrics,
  IScrollEngine,
  EventCallback,
} from '../types';
import {
  MemoryManager,
  DirectionHandler,
  PositionCalculator,
  AnimationManager,
  ErrorHandler,
  DOMCache,
  DataRenderer,
  MultiRowRenderer,
  FadeEdgeManager,
  PluginManager,
} from './utils';

export class ScrollEngine implements IScrollEngine {
  // ===== 配置 =====
  private options: RequiredOptions;
  
  // ===== 核心组件 =====
  private container: HTMLElement;
  private memoryManager: MemoryManager;
  private animationManager: AnimationManager;
  private domCache: DOMCache;
  private dataRenderer!: DataRenderer; // 多行模式下可能不使用，使用 ! 断言
  private multiRowRenderer?: MultiRowRenderer; // 多行/多列渲染协调器
  private fadeEdgeManager?: FadeEdgeManager;
  private pluginManager?: PluginManager;
  
  // ===== 滚动状态 =====
  private states: ScrollState[] = [];
  private stepWaitStates: StepWaitState[] = [];
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private cycleCount: number = 0;
  
  // ===== 事件 =====
  private lastEventTime: number = 0;
  private eventCallbacks: Map<ScrollEventType, EventCallback[]> = new Map();
  
  // ===== 性能监控 =====
  private frameCount: number = 0;
  private lastFpsTime: number = 0;
  private currentFps: number = 0;

  /**
   * 构造函数
   */
  constructor(container: HTMLElement | string, options: ScrollOptions) {
    // 验证容器
    this.container = this.resolveContainer(container);
    
    // 合并配置
    this.options = this.mergeOptions(options);
    
    // 初始化核心组件
    this.memoryManager = new MemoryManager();
    this.animationManager = new AnimationManager({
      fixedTimeStep: this.options.fixedTimeStep,
      maxDeltaTime: this.options.maxDeltaTime,
      keepRafOnPause: this.options.keepRafOnPause,
    });
    this.domCache = new DOMCache();
    
    // 创建DOM结构
    this.createDOMStructure();
    
    // 初始化渲染器（根据 rows/cols 决定使用哪种渲染器）
    const isHorizontal = DirectionHandler.isHorizontal(this.options.direction);
    const totalGroups = isHorizontal ? this.options.rows : this.options.cols;
    
    if (totalGroups > 1) {
      // 多行/多列：使用 MultiRowRenderer
      this.multiRowRenderer = new MultiRowRenderer(this.states, {
        direction: this.options.direction,
        rows: this.options.rows,
        cols: this.options.cols,
        renderItem: this.options.renderItem,
      });
    } else {
      // 单行/单列：使用原有 DataRenderer（保持兼容）
      this.dataRenderer = new DataRenderer(
        this.states[0].content1,
        this.states[0].content2,
        this.options.direction,
        this.options.renderItem
      );
    }
    
    // 初始化渐隐管理器
    if (this.options.fadeEdge?.enabled) {
      this.fadeEdgeManager = new FadeEdgeManager(
        this.container,
        this.options.direction,
        this.options.fadeEdge
      );
    }
    
    // 初始化插件管理器
    if (this.options.plugins && this.options.plugins.length > 0) {
      this.pluginManager = new PluginManager({
        timeout: this.options.pluginTimeout,
        strictMode: this.options.strictMode,
      });
      this.applyPlugins();
    }
    
    // 设置事件监听
    this.setupEventListeners();
    
    // 渲染数据
    this.renderData();
    
    // 自动启动
    if (this.options.autoStart) {
      if (this.options.delay > 0) {
        this.memoryManager.setTimeout(() => {
          this.start();
        }, this.options.delay);
      } else {
        this.start();
      }
    }
  }

  /**
   * 解析容器
   */
  private resolveContainer(container: HTMLElement | string): HTMLElement {
    if (typeof container === 'string') {
      const element = document.querySelector(container);
      if (!element) {
        throw new Error(`[ScrollSeamless] Container not found: ${container}`);
      }
      return element as HTMLElement;
    }
    return container;
  }

  /**
   * 合并配置
   */
  private mergeOptions(options: ScrollOptions): RequiredOptions {
    const defaults: RequiredOptions = {
      data: options.data,
      direction: options.direction ?? 'left',
      step: options.step ?? 1,
      stepWait: options.stepWait ?? 0,
      delay: options.delay ?? 0,
      bezier: options.bezier ?? [0.25, 0.1, 0.25, 1],
      rows: options.rows ?? 1,
      cols: options.cols ?? 1,
      minCountToScroll: options.minCountToScroll ?? 2,
      hoverStop: options.hoverStop ?? false,
      hoverDelay: options.hoverDelay ?? 0,
      leaveDelay: options.leaveDelay ?? 0,
      wheelEnable: options.wheelEnable ?? false,
      wheelSensitivity: options.wheelSensitivity ?? 1.0,
      wheelStep: options.wheelStep ?? 10,
      wheelPreventDefault: options.wheelPreventDefault ?? true,
      autoStart: options.autoStart ?? true,
      fixedTimeStep: options.fixedTimeStep ?? 16.67,
      maxDeltaTime: options.maxDeltaTime ?? 100,
      keepRafOnPause: options.keepRafOnPause ?? true,
      virtualScroll: options.virtualScroll ?? false,
      bufferSize: options.bufferSize ?? 5,
      estimatedItemSize: options.estimatedItemSize ?? 50,
      enableReuse: options.enableReuse ?? true,
      enableResizeObserver: options.enableResizeObserver ?? false,
      resizeDebounce: options.resizeDebounce ?? 100,
      resizeThreshold: options.resizeThreshold ?? 5,
      autoRelayout: options.autoRelayout ?? true,
      fadeEdge: options.fadeEdge ?? { enabled: false },
      enableDomEvents: options.enableDomEvents ?? true,
      eventThrottle: options.eventThrottle ?? 0,
      plugins: options.plugins ?? [],
      pluginTimeout: options.pluginTimeout ?? 5000,
      strictMode: options.strictMode ?? false,
      minPoolSize: options.minPoolSize ?? 10,
      maxPoolSize: options.maxPoolSize ?? 100,
      warmupPool: options.warmupPool ?? true,
      renderItem: options.renderItem,
      onLoadMore: options.onLoadMore,
      onEvent: options.onEvent,
      performance: options.performance,
      accessibility: options.accessibility,
      keyboard: options.keyboard,
    };

    // 验证必填项
    ErrorHandler.validateRequired(defaults.data, 'data', 'object');
    if (!Array.isArray(defaults.data) || defaults.data.length === 0) {
      throw new Error('[ScrollSeamless] data must be a non-empty array');
    }

    return defaults;
  }

  /**
   * 创建DOM结构
   */
  private createDOMStructure(): void {
    const direction = this.options.direction;
    const isHorizontal = DirectionHandler.isHorizontal(direction);
    const rows = isHorizontal ? this.options.rows : 1;
    const cols = !isHorizontal ? this.options.cols : 1;
    
    // 设置容器样式
    this.container.style.position = 'relative';
    this.container.style.overflow = 'hidden';
    
    // 支持多行/多列
    const totalRows = isHorizontal ? rows : cols;
    
    for (let i = 0; i < totalRows; i++) {
      const content1 = document.createElement('div');
      const content2 = document.createElement('div');
      
      content1.className = `ss-content ss-content-${i + 1}`;
      content2.className = `ss-content ss-content-${i + 1}-clone`;
      
      // 设置布局方向
      DirectionHandler.setContentLayout(content1, direction);
      DirectionHandler.setContentLayout(content2, direction);
      
      // 绝对定位
      content1.style.position = 'absolute';
      content2.style.position = 'absolute';
      
      // 多行/多列布局定位
      if (isHorizontal) {
        // 水平滚动：多行垂直排列
        // 计算每行的高度（使用容器高度 / 行数）
        const rowHeight = this.container.clientHeight / rows;
        const topPosition = i * rowHeight;
        
        content1.style.top = `${topPosition}px`;
        content2.style.top = `${topPosition}px`;
        content1.style.left = '0';
        content2.style.left = '0';
        
        // 设置每行的高度
        content1.style.height = `${rowHeight}px`;
        content2.style.height = `${rowHeight}px`;
      } else {
        // 垂直滚动：多列水平排列
        // 计算每列的宽度（使用容器宽度 / 列数）
        const colWidth = this.container.clientWidth / cols;
        const leftPosition = i * colWidth;
        
        content1.style.left = `${leftPosition}px`;
        content2.style.left = `${leftPosition}px`;
        content1.style.top = '0';
        content2.style.top = '0';
        
        // 设置每列的宽度
        content1.style.width = `${colWidth}px`;
        content2.style.width = `${colWidth}px`;
      }
      
      this.container.appendChild(content1);
      this.container.appendChild(content2);
      
      // 创建滚动状态
      this.states.push({
        position: 0,
        content1,
        content2,
        contentSize: 0,
      });
      
      // 创建stepWait状态
      this.stepWaitStates.push({
        accumulated: 0,
        waiting: false,
        waitStart: 0,
      });
    }
    
    // 准备无缝滚动数据
    this.prepareSeamlessData();
  }

  /**
   * 准备无缝滚动数据
   */
  private prepareSeamlessData(): void {
    const containerSize = DirectionHandler.getContainerSize(
      this.container,
      this.options.direction
    );
    
    const avgItemSize = this.options.estimatedItemSize;
    const minCount = PositionCalculator.calculateMinDataCount(
      containerSize,
      avgItemSize,
      this.options.direction
    );
    
    // 计算需要重复的次数
    const repeatCount = Math.ceil(minCount / this.options.data.length);
    
    // 生成无缝数据
    const seamlessData: string[] = [];
    for (let i = 0; i < repeatCount; i++) {
      seamlessData.push(...this.options.data);
    }
    
    // 更新options.data
    (this.options as any).data = seamlessData;
  }

  /**
   * 渲染数据
   * 
   * 扩展说明：
   * - 单行/单列：使用原有 dataRenderer（保持兼容）
   * - 多行/多列：使用 multiRowRenderer 协调器
   */
  private renderData(): void {
    // 根据配置选择渲染器
    if (this.multiRowRenderer) {
      // 多行/多列模式
      this.multiRowRenderer.render(this.options.data);
    } else {
      // 单行/单列模式（原有逻辑）
      this.dataRenderer.render(this.options.data);
    }
    
    // 测量内容尺寸
    this.states.forEach(state => {
      state.contentSize = PositionCalculator.getContentSize(
        state.content1,
        this.options.direction,
        true
      );
    });
    
    // 设置初始位置
    this.setupInitialPositioning();
  }

  /**
   * 设置初始位置
   */
  private setupInitialPositioning(): void {
    const containerSize = DirectionHandler.getContainerSize(
      this.container,
      this.options.direction
    );
    
    this.states.forEach(state => {
      PositionCalculator.detectAndFixBlankAreas(
        state.content1,
        state.content2,
        this.container,
        this.options.direction
      );
      
      PositionCalculator.implementContentPreFilling(
        state.content1,
        state.content2,
        containerSize,
        this.options.direction
      );
    });
  }

  /**
   * 应用插件
   */
  private async applyPlugins(): Promise<void> {
    if (!this.pluginManager || !this.options.plugins) return;
    
    try {
      await this.pluginManager.applyPlugins(this.options.plugins, this);
    } catch (error) {
      ErrorHandler.logError(error as Error, 'ScrollEngine.applyPlugins');
    }
  }

  /**
   * 设置事件监听
   */
  private setupEventListeners(): void {
    // 鼠标悬停
    if (this.options.hoverStop) {
      this.memoryManager.addEventListener(
        this.container,
        'mouseenter',
        this.onMouseEnter as EventListener
      );
      this.memoryManager.addEventListener(
        this.container,
        'mouseleave',
        this.onMouseLeave as EventListener
      );
    }
    
    // 滚轮控制
    if (this.options.wheelEnable) {
      this.memoryManager.addEventListener(
        this.container,
        'wheel',
        this.onWheel as EventListener,
        { passive: false }
      );
    }
  }

  /**
   * 鼠标进入
   */
  private onMouseEnter = (): void => {
    if (!this.isRunning || this.isPaused) return;
    
    if (this.options.hoverDelay > 0) {
      this.memoryManager.setTimeout(() => {
        this.pause();
      }, this.options.hoverDelay);
    } else {
      this.pause();
    }
    
    this.emitEvent('hover', { type: 'enter', timestamp: Date.now() });
  };

  /**
   * 鼠标离开
   */
  private onMouseLeave = (): void => {
    if (!this.isPaused) return;
    
    if (this.options.leaveDelay > 0) {
      this.memoryManager.setTimeout(() => {
        this.resume();
      }, this.options.leaveDelay);
    } else {
      this.resume();
    }
    
    this.emitEvent('hover', { type: 'leave', timestamp: Date.now() });
  };

  /**
   * 滚轮事件
   */
  private onWheel = (event: WheelEvent): void => {
    if (!this.options.wheelEnable) return;
    
    if (this.options.wheelPreventDefault) {
      event.preventDefault();
    }
    
    const delta = event.deltaY * this.options.wheelSensitivity;
    const step = delta > 0 ? this.options.wheelStep : -this.options.wheelStep;
    
    // 更新位置
    this.states.forEach(state => {
      state.position = Math.max(0, Math.min(state.contentSize, state.position + step));
      
      // 应用transform
      const seamlessResult = PositionCalculator.optimizeSeamlessConnection(
        state.position,
        state.contentSize,
        DirectionHandler.getContainerSize(this.container, this.options.direction),
        this.options.direction
      );
      
      state.content1.style.transform = seamlessResult.content1Transform;
      state.content2.style.transform = seamlessResult.content2Transform;
    });
    
    this.emitEvent('wheel', {
      delta,
      position: this.states[0].position,
      timestamp: Date.now(),
    });
  };

  // ===== 公共API =====

  /**
   * 开始滚动
   */
  start(): void {
    if (this.isRunning) return;
    
    // 检查是否应该滚动
    if (!this.shouldScroll()) {
      ErrorHandler.logWarning(
        'Data count is less than minCountToScroll, scrolling disabled',
        'ScrollEngine.start'
      );
      return;
    }
    
    this.isRunning = true;
    this.isPaused = false;
    
    // 注册动画回调
    this.states.forEach((state, index) => {
      const callback = this.createAnimationCallback(state, index);
      this.animationManager.addCallback(callback);
    });
    
    // 启动动画
    this.animationManager.start();
    
    this.emitEvent('start');
  }

  /**
   * 停止滚动
   */
  stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    this.isPaused = false;
    
    this.animationManager.stop();
    
    this.emitEvent('stop');
  }

  /**
   * 暂停滚动
   */
  pause(): void {
    if (!this.isRunning || this.isPaused) return;
    
    this.isPaused = true;
    this.animationManager.pause();
    
    this.emitEvent('pause');
  }

  /**
   * 恢复滚动
   */
  resume(): void {
    if (!this.isRunning || !this.isPaused) return;
    
    this.isPaused = false;
    this.animationManager.resume();
    
    this.emitEvent('resume');
  }

  /**
   * 更新数据
   */
  update(): void {
    const wasRunning = this.isRunning;
    
    // 停止
    this.stop();
    
    // 重新准备数据
    this.prepareSeamlessData();
    
    // 重新渲染
    this.renderData();
    
    // 恢复运行
    if (wasRunning) {
      this.start();
    }
    
    this.emitEvent('update');
  }

  /**
   * 获取当前位置
   */
  getPosition(): number {
    return this.states[0]?.position ?? 0;
  }

  /**
   * 设置位置
   */
  setPosition(position: number): void {
    if (typeof position !== 'number' || isNaN(position)) {
      throw new TypeError('[ScrollSeamless] position must be a valid number');
    }
    
    this.states.forEach(state => {
      state.position = PositionCalculator.clampPosition(position, state.contentSize);
      
      const seamlessResult = PositionCalculator.optimizeSeamlessConnection(
        state.position,
        state.contentSize,
        DirectionHandler.getContainerSize(this.container, this.options.direction),
        this.options.direction
      );
      
      state.content1.style.transform = seamlessResult.content1Transform;
      state.content2.style.transform = seamlessResult.content2Transform;
    });
    
    this.emitEvent('position-change', { position });
  }

  /**
   * 获取运行状态
   */
  getIsRunning(): boolean {
    return this.isRunning;
  }

  /**
   * 获取暂停状态
   */
  getIsPaused(): boolean {
    return this.isPaused;
  }

  /**
   * 获取性能指标
   */
  getPerformance(): PerformanceMetrics {
    return {
      fps: this.currentFps,
      memory: typeof (performance as any).memory === 'object'
        ? (performance as any).memory
        : null,
      domNodes: this.states.reduce((sum, state) => {
        return sum + state.content1.children.length + state.content2.children.length;
      }, 0),
      timestamp: Date.now(),
    };
  }

  /**
   * 获取循环次数
   */
  getCycleCount(): number {
    return this.cycleCount;
  }

  /**
   * 销毁实例
   */
  destroy(): void {
    // 停止动画
    this.stop();
    
    // 清理组件
    this.animationManager.destroy();
    this.dataRenderer?.destroy(); // 单行模式下初始化
    this.multiRowRenderer?.destroy(); // 多行模式下初始化
    this.fadeEdgeManager?.destroy();
    this.pluginManager?.destroy();
    this.domCache.destroy();
    
    // 清理内存
    this.memoryManager.destroy();
    
    // 清空DOM
    this.states.forEach(state => {
      if (state.content1.parentNode) {
        state.content1.parentNode.removeChild(state.content1);
      }
      if (state.content2.parentNode) {
        state.content2.parentNode.removeChild(state.content2);
      }
    });
    
    // 清空状态
    this.states = [];
    this.stepWaitStates = [];
    
    this.emitEvent('destroy');
  }

  /**
   * 获取配置
   */
  getOptions(): Readonly<RequiredOptions> {
    return this.options;
  }

  /**
   * 注册事件监听器
   */
  on(type: ScrollEventType, callback: EventCallback): void {
    // 存储到callbacks数组中
    if (!this.eventCallbacks.has(type)) {
      this.eventCallbacks.set(type, []);
    }
    this.eventCallbacks.get(type)!.push(callback);
  }

  /**
   * 移除事件监听器
   */
  off(type: ScrollEventType, callback: EventCallback): void {
    const callbacks = this.eventCallbacks.get(type);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // ===== 私有方法 =====

  /**
   * 检查是否应该滚动
   */
  private shouldScroll(): boolean {
    return this.options.data.length >= this.options.minCountToScroll;
  }

  /**
   * 创建动画回调
   */
  private createAnimationCallback(state: ScrollState, index: number): (deltaTime: number) => boolean {
    const direction = this.options.direction;
    const container = this.container;
    const containerSize = DirectionHandler.getContainerSize(container, direction);
    
    return (deltaTime: number): boolean => {
      if (!this.isRunning) return false;
      if (this.isPaused) return true;
      
      try {
        // 处理stepWait
        if (this.options.stepWait > 0) {
          const stepWaitState = this.stepWaitStates[index];
          
          if (stepWaitState.waiting) {
            stepWaitState.waitStart += deltaTime;
            if (stepWaitState.waitStart < this.options.stepWait) {
              return true;
            }
            stepWaitState.waiting = false;
            stepWaitState.waitStart = 0;
            stepWaitState.accumulated = 0;
          }
          
          const pixelsPerFrame = this.options.step * (deltaTime / 16.67);
          stepWaitState.accumulated += pixelsPerFrame;
          
          if (stepWaitState.accumulated >= this.options.step) {
            stepWaitState.waiting = true;
            stepWaitState.waitStart = 0;
          }
          
          const nextPosition = state.position + pixelsPerFrame;
          const wasReset = this.applyTransforms(state, nextPosition);
          
          if (!wasReset) {
            state.position = nextPosition;
          }
        } else {
          // 正常连续滚动
          const pixelsPerFrame = this.options.step * (deltaTime / 16.67);
          const nextPosition = state.position + pixelsPerFrame;
          const wasReset = this.applyTransforms(state, nextPosition);
          
          if (!wasReset) {
            state.position = nextPosition;
          }
        }
        
        // FPS计算
        this.frameCount++;
        const now = performance.now();
        if (now - this.lastFpsTime >= 1000) {
          this.currentFps = this.frameCount;
          this.frameCount = 0;
          this.lastFpsTime = now;
        }
        
        return true;
      } catch (error) {
        ErrorHandler.logError(error as Error, 'ScrollEngine.animationCallback');
        return false;
      }
    };
  }

  /**
   * 应用transform
   */
  private applyTransforms(state: ScrollState, position: number): boolean {
    const direction = this.options.direction;
    const containerSize = DirectionHandler.getContainerSize(this.container, direction);
    
    const seamlessResult = PositionCalculator.optimizeSeamlessConnection(
      position,
      state.contentSize,
      containerSize,
      direction
    );
    
    state.content1.style.transform = seamlessResult.content1Transform;
    state.content2.style.transform = seamlessResult.content2Transform;
    
    if (seamlessResult.shouldReset) {
      this.cycleCount++;
      
      this.emitEvent('cycle-count', {
        count: this.cycleCount,
        direction: this.options.direction,
        timestamp: Date.now(),
      });
      
      // 分页加载
      if (this.options.onLoadMore) {
        this.handleLoadMore();
      }
      
      state.position = 0;
      this.setupInitialPositioning();
      return true;
    }
    
    return false;
  }

  /**
   * 处理分页加载
   */
  private async handleLoadMore(): Promise<void> {
    if (!this.options.onLoadMore) return;
    
    try {
      const currentCount = this.options.data.length;
      this.emitEvent('offset', {
        bufferSize: currentCount,
        targetList: this.options.data,
      });
      
      const newData = await Promise.resolve(this.options.onLoadMore(currentCount));
      
      if (newData && newData.length > 0) {
        (this.options as any).data = [...this.options.data, ...newData];
        
        this.emitEvent('offset', {
          bufferSize: this.options.data.length,
          targetList: this.options.data,
          loaded: newData.length,
        });
        
        this.update();
      }
    } catch (error) {
      ErrorHandler.logError(error as Error, 'ScrollEngine.handleLoadMore');
    }
  }

  /**
   * 触发事件
   */
  private emitEvent(type: ScrollEventType, data?: any): void {
    // 节流检查
    if (this.options.eventThrottle > 0) {
      const now = Date.now();
      if (now - this.lastEventTime < this.options.eventThrottle) {
        return;
      }
      this.lastEventTime = now;
    }
    
    // 触发注册的回调
    const callbacks = this.eventCallbacks.get(type);
    if (callbacks) {
      for (const callback of callbacks) {
        try {
          callback(type, data);
        } catch (error) {
          ErrorHandler.logError(error as Error, `ScrollEngine.emitEvent.${type}`);
        }
      }
    }
    
    // 回调函数
    if (this.options.onEvent) {
      try {
        this.options.onEvent(type, data);
      } catch (error) {
        ErrorHandler.logError(error as Error, `ScrollEngine.emitEvent.${type}`);
      }
    }
    
    // DOM事件
    if (this.options.enableDomEvents) {
      try {
        const event = new CustomEvent(`scroll-${type}`, {
          detail: data,
          bubbles: true,
        });
        this.container.dispatchEvent(event);
      } catch (error) {
        // 忽略DOM事件错误
      }
    }
  }
}

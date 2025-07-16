import { ScrollSeamlessOptions, ScrollSeamlessController, ScrollDirection, ScrollSeamlessPlugin } from '../types';
import { MemoryManager } from './utils/MemoryManager';
import { ObjectPool } from './utils/ObjectPool';
import { rafScheduler, AnimationHelper } from './utils/RAFScheduler';
import { DOMCache } from './utils/DOMCache';
import { PluginManager } from './plugins/PluginManager';

/**
 * 滚动状态接口
 */
interface ScrollState {
  content1: HTMLElement;
  content2: HTMLElement;
  position: number;
  animationId: string | null;
}

/**
 * 滚动引擎类 - 重构后的核心实现
 * 提供更好的可扩展性、健壮性和性能
 */
export class ScrollEngine implements ScrollSeamlessController {
  private container: HTMLElement;
  private options: Required<ScrollSeamlessOptions>;
  private memoryManager: MemoryManager;
  private domCache: DOMCache;
  private elementPool: ObjectPool<HTMLElement>;
  private pluginManager: PluginManager;
  
  // 状态管理
  private running = false;
  private rowStates: ScrollState[] = [];
  private colStates: ScrollState[] = [];
  private seamlessData: string[][] = [];
  private seamlessColData: string[][] = [];

  constructor(container: HTMLElement | null, options: ScrollSeamlessOptions) {
    // 输入验证
    if (!container) {
      throw new Error('ScrollEngine: Container element is required');
    }
    
    if (!options.data || !Array.isArray(options.data) || options.data.length === 0) {
      throw new Error('ScrollEngine: Data array is required and cannot be empty');
    }

    this.container = container;
    this.options = this.mergeOptions(options);
    
    // 初始化工具类
    this.memoryManager = new MemoryManager();
    this.domCache = new DOMCache();
    this.elementPool = new ObjectPool(
      () => document.createElement('span'),
      (element) => {
        element.className = 'ss-item';
        element.textContent = '';
        element.removeAttribute('style');
      }
    );
    
    // 初始化插件管理器
    this.pluginManager = new PluginManager(this);
    
    // 注册插件
    if (this.options.plugins && this.options.plugins.length > 0) {
      this.options.plugins.forEach(plugin => {
        this.pluginManager.register(plugin);
      });
    }

    this.initialize();
  }

  /**
   * 合并默认选项和用户选项
   */
  private mergeOptions(options: ScrollSeamlessOptions): Required<ScrollSeamlessOptions> {
    const defaultOptions: Required<ScrollSeamlessOptions> = {
      data: [],
      direction: 'left',
      minCountToScroll: 2,
      step: 1,
      stepWait: 0,
      delay: 0,
      bezier: [0.25, 0.1, 0.25, 1],
      hoverStop: true,
      wheelEnable: false,
      singleLine: false,
      rows: 1,
      cols: 1,
      onEvent: () => {},
      plugins: [],
      performance: { enabled: true },
      accessibility: { enabled: true },
      dataDriven: false
    };

    return { ...defaultOptions, ...options };
  }

  /**
   * 初始化滚动引擎
   */
  private initialize(): void {
    try {
      this.setupContainer();
      this.createScrollElements();
      this.bindEvents();
      this.layout();
      
      if (this.shouldScroll()) {
        this.start();
      }
    } catch (error) {
      console.error('ScrollEngine initialization failed:', error);
      this.handleError(error as Error);
    }
  }

  /**
   * 设置容器样式
   */
  private setupContainer(): void {
    this.container.style.overflow = 'hidden';
    this.container.style.position = 'relative';
  }

  /**
   * 创建滚动元素
   */
  private createScrollElements(): void {
    const isHorizontal = this.options.direction === 'left' || this.options.direction === 'right';
    
    if (isHorizontal) {
      this.createHorizontalElements();
    } else {
      this.createVerticalElements();
    }
  }

  /**
   * 创建水平滚动元素
   */
  private createHorizontalElements(): void {
    const rows = Math.max(1, this.options.rows);
    
    for (let i = 0; i < rows; i++) {
      const rowContainer = this.createElement('div', 'scroll-seamless-row');
      this.setElementStyle(rowContainer, {
        position: 'absolute',
        left: '0',
        top: `${(100 / rows) * i}%`,
        width: '100%',
        height: `${100 / rows}%`,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center' // 垂直居中
      });

      const content1 = this.createElement('div', 'ss-content');
      const content2 = this.createElement('div', 'ss-content');
      
      this.setContentStyle(content1, true);
      this.setContentStyle(content2, true);
      
      // 确保content1在起始位置
      content1.style.left = '0';
      // content2将在运行时动态设置位置
      
      rowContainer.appendChild(content1);
      rowContainer.appendChild(content2);
      this.container.appendChild(rowContainer);

      this.rowStates.push({
        content1,
        content2,
        position: 0,
        animationId: null
      });
    }
  }

  /**
   * 创建垂直滚动元素
   */
  private createVerticalElements(): void {
    const cols = Math.max(1, this.options.cols);
    
    for (let i = 0; i < cols; i++) {
      const colContainer = this.createElement('div', 'scroll-seamless-col');
      this.setElementStyle(colContainer, {
        position: 'relative',
        height: '100%',
        overflow: 'hidden',
        width: `${100 / cols}%`,
        display: 'inline-block',
        textAlign: 'center'
      });

      const content1 = this.createElement('div', 'ss-content');
      const content2 = this.createElement('div', 'ss-content');
      
      this.setContentStyle(content1, false);
      this.setContentStyle(content2, false);
      
      // 确保content1在起始位置
      content1.style.top = '0';
      // content2将在运行时动态设置位置
      
      colContainer.appendChild(content1);
      colContainer.appendChild(content2);
      this.container.appendChild(colContainer);

      this.colStates.push({
        content1,
        content2,
        position: 0,
        animationId: null
      });
    }
  }

  /**
   * 创建元素的辅助方法
   */
  private createElement(tag: string, className: string): HTMLElement {
    const element = document.createElement(tag);
    element.className = className;
    return element;
  }

  /**
   * 设置元素样式的辅助方法
   */
  private setElementStyle(element: HTMLElement, styles: Partial<CSSStyleDeclaration>): void {
    Object.assign(element.style, styles);
  }

  /**
   * 设置内容样式
   */
  private setContentStyle(element: HTMLElement, isHorizontal: boolean): void {
    const baseStyles: Partial<CSSStyleDeclaration> = {
      position: 'absolute',
      top: '0',
      left: '0',
      boxSizing: 'border-box',
      display: isHorizontal ? 'inline-block' : 'block',
      whiteSpace: isHorizontal ? 'nowrap' : 'normal'
    };
    
    if (!isHorizontal) {
      baseStyles.width = '100%';
    }
    
    this.setElementStyle(element, baseStyles);
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    if (this.options.hoverStop) {
      this.memoryManager.addEventListener(this.container, 'mouseenter', this.onMouseEnter.bind(this));
      this.memoryManager.addEventListener(this.container, 'mouseleave', this.onMouseLeave.bind(this));
    }

    if (this.options.wheelEnable) {
      // 修改类型声明，确保 wheel 事件处理器类型正确
      this.memoryManager.addEventListener(
        this.container, 
        'wheel', 
        ((event: Event) => {
          this.onWheel(event as WheelEvent);
        }) as EventListener, 
        { passive: false }
      );
    }
  }

  /**
   * 布局计算
   */
  private layout(): void {
    const isHorizontal = this.options.direction === 'left' || this.options.direction === 'right';
    
    if (isHorizontal) {
      this.layoutHorizontal();
    } else {
      this.layoutVertical();
    }
    
    this.renderContent();
  }

  /**
   * 水平布局计算
   */
  private layoutHorizontal(): void {
    this.seamlessData = [];
    
    for (let i = 0; i < this.rowStates.length; i++) {
      const state = this.rowStates[i];
      const container = state.content1.parentElement as HTMLElement;
      
      if (!container) continue;
      
      const containerWidth = this.domCache.getElementMeasurement(container).width;
      const items = this.calculateSeamlessItems(containerWidth, true);
      this.seamlessData[i] = items;
    }
  }

  /**
   * 垂直布局计算
   */
  private layoutVertical(): void {
    this.seamlessColData = [];
    
    for (let i = 0; i < this.colStates.length; i++) {
      const state = this.colStates[i];
      const container = state.content1.parentElement as HTMLElement;
      
      if (!container) continue;
      
      const containerHeight = this.domCache.getElementMeasurement(container).height;
      const items = this.calculateSeamlessItems(containerHeight, false);
      this.seamlessColData[i] = items;
    }
  }

  /**
   * 计算无缝滚动所需的项目
   */
  private calculateSeamlessItems(containerSize: number, isHorizontal: boolean): string[] {
    const items: string[] = [];
    let totalSize = 0;
    const safetyMargin = 50; // 安全边界，确保不会出现空白
    const targetSize = containerSize * 3 + safetyMargin; // 增加到3倍容器大小来确保足够的内容覆盖
    
    // 批量测量文本尺寸
    const measurements = this.domCache.measureTextBatch(this.options.data, 'ss-item');
    
    // 添加项目间的预估间距 (px)
    const estimatedItemGap = isHorizontal ? 5 : 2; 
    
    let idx = 0;
    while (totalSize < targetSize && idx < this.options.data.length * 20) { // 提高循环上限以确保填满
      const dataIndex = idx % this.options.data.length;
      const item = this.options.data[dataIndex];
      const measurement = measurements[dataIndex];
      
      items.push(item);
      totalSize += (isHorizontal ? measurement.width : measurement.height) + estimatedItemGap;
      idx++;
    }
    
    return items;
  }

  /**
   * 渲染内容
   */
  private renderContent(): void {
    const isHorizontal = this.options.direction === 'left' || this.options.direction === 'right';
    
    if (isHorizontal) {
      this.renderHorizontalContent();
    } else {
      this.renderVerticalContent();
    }
  }

  /**
   * 渲染水平内容
   */
  private renderHorizontalContent(): void {
    for (let i = 0; i < this.rowStates.length; i++) {
      const state = this.rowStates[i];
      const data = this.seamlessData[i] || [];
      
      this.renderStateContent(state, data);
    }
  }

  /**
   * 渲染垂直内容
   */
  private renderVerticalContent(): void {
    for (let i = 0; i < this.colStates.length; i++) {
      const state = this.colStates[i];
      const data = this.seamlessColData[i] || [];
      
      this.renderStateContent(state, data);
    }
  }

  /**
   * 渲染状态内容
   */
  private renderStateContent(state: ScrollState, data: string[]): void {
    // 清空现有内容
    state.content1.innerHTML = '';
    state.content2.innerHTML = '';
    
    // 是否为水平方向
    const isHorizontal = this.options.direction === 'left' || this.options.direction === 'right';
    
    // 渲染内容
    data.forEach(item => {
      const element1 = this.elementPool.acquire();
      const element2 = this.elementPool.acquire();
      
      element1.textContent = item;
      element2.textContent = item;
      
      // 添加基础样式和间距
      if (isHorizontal) {
        element1.style.marginRight = '10px';
        element2.style.marginRight = '10px';
        element1.style.display = 'inline-block';
        element2.style.display = 'inline-block';
      } else {
        element1.style.marginBottom = '5px';
        element2.style.marginBottom = '5px';
        element1.style.display = 'block';
        element2.style.display = 'block';
      }
      
      state.content1.appendChild(element1);
      state.content2.appendChild(element2);
    });
  }

  /**
   * 判断是否应该滚动
   */
  private shouldScroll(): boolean {
    return this.options.data.length >= this.options.minCountToScroll;
  }

  /**
   * 开始滚动
   */
  public start(): void {
    if (this.running) return;
    
    this.running = true;
    this.options.onEvent?.('start', { direction: this.options.direction });
    
    const isHorizontal = this.options.direction === 'left' || this.options.direction === 'right';
    const states = isHorizontal ? this.rowStates : this.colStates;
    
    states.forEach((state, index) => {
      const animationId = AnimationHelper.generateId('scroll');
      state.animationId = animationId;
      
      const animation = this.createScrollAnimation(state, index);
      rafScheduler.schedule(animation);
    });
  }

  /**
   * 创建滚动动画
   */
  private createScrollAnimation(state: ScrollState, index: number) {
    const isHorizontal = this.options.direction === 'left' || this.options.direction === 'right';
    const isReverse = this.options.direction === 'right' || this.options.direction === 'down';
    
    // 预先计算内容尺寸，避免动画中重复计算
    const contentSize = isHorizontal ? 
      state.content1.scrollWidth : 
      state.content1.scrollHeight;
    
    // 预填充第二个内容，确保完美衔接
    if (isHorizontal) {
      state.content2.style.left = `${contentSize}px`;
    } else {
      state.content2.style.top = `${contentSize}px`;
    }
    
    // 确保初始位置正确
    state.position = 0;
    
    // 应用初始变换
    if (isHorizontal) {
      state.content1.style.transform = 'translateX(0)';
      state.content2.style.transform = `translateX(0)`;
      // 使用绝对定位确保第二个内容元素紧接着第一个
      state.content2.style.left = `${contentSize}px`;
    } else {
      state.content1.style.transform = 'translateY(0)';
      state.content2.style.transform = `translateY(0)`;
      // 使用绝对定位确保第二个内容元素紧接着第一个
      state.content2.style.top = `${contentSize}px`;
    }
    
    return {
      id: state.animationId!,
      priority: 1,
      callback: (timestamp: number) => {
        if (!this.running) return false;
        
        const step = this.options.step;
        
        // 更新位置
        if (isReverse) {
          state.position -= step;
          // 当第一个内容完全移出视图时，重置位置
          if (state.position <= -contentSize) {
            state.position = 0;
          }
        } else {
          state.position += step;
          // 当第一个内容完全移出视图时，重置位置
          if (state.position >= contentSize) {
            state.position = 0;
          }
        }
        
        // 应用变换 - 使用绝对定位+transform组合
        if (isHorizontal) {
          // 水平方向滚动
          state.content1.style.transform = `translateX(${isReverse ? state.position : -state.position}px)`;
          state.content2.style.transform = `translateX(${isReverse ? state.position : -state.position}px)`;
        } else {
          // 垂直方向滚动
          state.content1.style.transform = `translateY(${isReverse ? state.position : -state.position}px)`;
          state.content2.style.transform = `translateY(${isReverse ? state.position : -state.position}px)`;
        }
        
        return true; // 继续动画
      }
    };
  }

  /**
   * 停止滚动
   */
  public stop(): void {
    if (!this.running) return;
    
    this.running = false;
    this.options.onEvent?.('stop', { direction: this.options.direction });
    
    // 停止所有动画
    [...this.rowStates, ...this.colStates].forEach(state => {
      if (state.animationId) {
        rafScheduler.unschedule(state.animationId);
        state.animationId = null;
      }
    });
  }

  /**
   * 销毁实例
   */
  public destroy(): void {
    this.stop();
    
    // 销毁所有插件
    this.pluginManager.destroyAll();
    
    // 清理资源
    this.memoryManager.destroy();
    this.domCache.destroy();
    this.elementPool.clear();
    
    // 清空容器
    this.container.innerHTML = '';
    
    this.options.onEvent?.('destroy', { direction: this.options.direction });
  }

  /**
   * 更新数据并重新布局
   */
  public updateData(): void {
    const wasRunning = this.running;
    
    // 停止当前动画
    if (wasRunning) {
      this.stop();
    }

    // 重置所有位置
    [...this.rowStates, ...this.colStates].forEach(state => {
      state.position = 0;
      state.content1.style.transform = '';
      state.content2.style.transform = '';
    });

    // 重新计算布局
    this.layout();
    
    // 如果之前在运行，则重新启动
    if (wasRunning && this.shouldScroll()) {
      // 延迟一帧启动，确保DOM更新完毕
      setTimeout(() => this.start(), 20);
    }
  }

  /**
   * 设置选项
   */
  public setOptions(options: Partial<ScrollSeamlessOptions>): void {
    const wasRunning = this.running;
    this.stop();
    
    this.options = { ...this.options, ...options };
    this.layout();
    
    if (wasRunning && this.shouldScroll()) {
      this.start();
    }
  }

  /**
   * 获取运行状态
   */
  public isRunning(): boolean {
    return this.running;
  }

  /**
   * 获取渲染矩阵（用于数据驱动模式）
   */
  public getRenderMatrix(): string[][] {
    const isHorizontal = this.options.direction === 'left' || this.options.direction === 'right';
    return isHorizontal ? this.seamlessData : this.seamlessColData;
  }

  /**
   * 获取变换样式（用于数据驱动模式）
   */
  public getTransforms(): string[] {
    const isHorizontal = this.options.direction === 'left' || this.options.direction === 'right';
    const states = isHorizontal ? this.rowStates : this.colStates;
    
    return states.map(state => {
      const transform = isHorizontal ? 
        `translateX(${-state.position}px)` : 
        `translateY(${-state.position}px)`;
      return transform;
    });
  }
  
  /**
   * 添加插件
   * @param plugin 插件实例
   */
  public addPlugin(plugin: ScrollSeamlessPlugin): void {
    this.pluginManager.register(plugin);
  }
  
  /**
   * 移除插件
   * @param pluginId 插件ID
   */
  public removePlugin(pluginId: string): void {
    this.pluginManager.unregister(pluginId);
  }
  
  /**
   * 获取当前位置
   * @returns 当前位置
   */
  public getPosition(): number {
    const isHorizontal = this.options.direction === 'left' || this.options.direction === 'right';
    const states = isHorizontal ? this.rowStates : this.colStates;
    
    if (states.length === 0) {
      return 0;
    }
    
    // 返回第一个状态的位置
    return states[0].position;
  }
  
  /**
   * 设置当前位置
   * @param position 位置
   */
  public setPosition(position: number): void {
    const isHorizontal = this.options.direction === 'left' || this.options.direction === 'right';
    const states = isHorizontal ? this.rowStates : this.colStates;
    
    states.forEach(state => {
      state.position = position;
      
      const contentSize = isHorizontal ? 
        state.content1.scrollWidth : 
        state.content1.scrollHeight;
      
      // 应用变换
      const transform1 = isHorizontal ? 
        `translateX(${-position}px)` : 
        `translateY(${-position}px)`;
      const transform2 = isHorizontal ? 
        `translateX(${-position + contentSize}px)` : 
        `translateY(${-position + contentSize}px)`;
      
      state.content1.style.transform = transform1;
      state.content2.style.transform = transform2;
    });
  }
  
  /**
   * 获取性能数据
   * @returns 性能数据
   */
  public getPerformance(): any {
    const performancePlugin = this.pluginManager.getPlugin('performance');
    if (performancePlugin && 'getMetrics' in performancePlugin) {
      return (performancePlugin as any).getMetrics();
    }
    
    // 如果没有性能插件，返回基本的性能数据
    return {
      fps: rafScheduler.getPerformanceMetrics().fps,
      memory: null,
      timing: {
        renderTime: 0,
        animationTime: 0
      },
      elements: {
        total: this.container.querySelectorAll('*').length,
        visible: this.container.querySelectorAll('.ss-item').length
      }
    };
  }

  /**
   * 事件处理器
   */
  private onMouseEnter(): void {
    if (this.options.hoverStop) {
      this.stop();
    }
  }

  private onMouseLeave(): void {
    if (this.options.hoverStop && this.shouldScroll()) {
      this.start();
    }
  }

  private onWheel(event: WheelEvent): void {
    if (!this.options.wheelEnable) return;
    
    event.preventDefault();
    // 这里可以添加滚轮控制逻辑
  }

  /**
   * 错误处理
   */
  private handleError(error: Error): void {
    console.error('ScrollEngine Error:', error);
    
    // 触发错误事件
    this.options.onEvent?.('error', { 
      type: 'error',
      direction: this.options.direction,
      error: error.message,
      stack: error.stack
    });
    
    // 尝试恢复
    try {
      // 停止所有动画
      this.stop();
      
      // 重置状态
      this.rowStates.forEach(state => {
        state.position = 0;
        state.content1.style.transform = 'none';
        state.content2.style.transform = 'none';
      });
      
      this.colStates.forEach(state => {
        state.position = 0;
        state.content1.style.transform = 'none';
        state.content2.style.transform = 'none';
      });
      
      // 如果配置了自动重启，则尝试重新启动
      if (this.options.performance && (this.options.performance as any).autoRestart) {
        setTimeout(() => {
          if (this.shouldScroll()) {
            this.start();
          }
        }, 1000);
      }
    } catch (recoveryError) {
      console.error('ScrollEngine Recovery Failed:', recoveryError);
    }
  }
}
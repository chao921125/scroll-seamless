import type { ScrollSeamlessPlugin, ScrollSeamlessController, ScrollSeamlessOptions } from '../types';

export interface VirtualScrollOptions {
  enabled?: boolean;
  itemHeight?: number; // 每个 item 的高度（垂直滚动时）
  itemWidth?: number;  // 每个 item 的宽度（水平滚动时）
  bufferSize?: number; // 缓冲区大小（渲染比可视区域多几个 item）
  onRender?: (startIndex: number, endIndex: number, visibleCount: number) => void;
}

export interface VirtualScrollMetrics {
  totalItems: number;
  visibleItems: number;
  renderedItems: number;
  startIndex: number;
  endIndex: number;
  scrollPosition: number;
  performance: {
    renderTime: number;
    memoryUsage?: number;
  };
}

export class VirtualScrollPlugin implements ScrollSeamlessPlugin {
  id = 'virtual-scroll';
  private options: Required<VirtualScrollOptions>;
  private instance: ScrollSeamlessController | null = null;
  private container: HTMLElement | null = null;
  private content1: HTMLElement | null = null;
  private content2: HTMLElement | null = null;
  private totalItems: number = 0;
  private visibleStartIndex: number = 0;
  private visibleEndIndex: number = 0;
  private renderedStartIndex: number = 0;
  private renderedEndIndex: number = 0;
  private itemSize: number = 0;
  private containerSize: number = 0;
  private isHorizontal: boolean = true;

  constructor(options: VirtualScrollOptions = {}) {
    this.options = {
      enabled: true,
      itemHeight: 40,
      itemWidth: 200,
      bufferSize: 5,
      onRender: () => {},
      ...options
    };
  }

  apply(instance: ScrollSeamlessController): void {
    this.instance = instance;
    this.container = this.findContainer();
    if (!this.container) return;

    this.content1 = this.container.querySelector('.ss-content') as HTMLElement;
    this.content2 = this.container.querySelectorAll('.ss-content')[1] as HTMLElement;
    
    if (!this.content1 || !this.content2) return;

    this.initializeVirtualScroll();
    this.setupEventListeners();
  }

  destroy(): void {
    this.removeEventListeners();
    this.instance = null;
    this.container = null;
    this.content1 = null;
    this.content2 = null;
  }

  private findContainer(): HTMLElement | null {
    // 通过实例找到容器元素
    if (this.instance && typeof (this.instance as any).container === 'object') {
      return (this.instance as any).container;
    }
    return null;
  }

  private initializeVirtualScroll(): void {
    if (!this.container || !this.content1 || !this.content2) return;

    // 获取滚动方向
    const direction = (this.instance as any)?.options?.direction || 'horizontal';
    this.isHorizontal = direction === 'left' || direction === 'right';

    // 设置容器尺寸
    this.containerSize = this.isHorizontal 
      ? this.container.clientWidth 
      : this.container.clientHeight;

    // 设置 item 尺寸
    this.itemSize = this.isHorizontal 
      ? this.options.itemWidth 
      : this.options.itemHeight;

    // 计算可视区域能容纳的 items 数量
    const visibleCount = Math.ceil(this.containerSize / this.itemSize);
    
    // 设置初始渲染范围
    this.visibleStartIndex = 0;
    this.visibleEndIndex = Math.min(visibleCount - 1, this.totalItems - 1);
    this.renderedStartIndex = Math.max(0, this.visibleStartIndex - this.options.bufferSize);
    this.renderedEndIndex = Math.min(this.totalItems - 1, this.visibleEndIndex + this.options.bufferSize);

    this.renderVisibleItems();
  }

  private setupEventListeners(): void {
    if (!this.container) return;

    // 监听滚动事件
    this.container.addEventListener('scroll', this.onScroll.bind(this), { passive: true });
    
    // 监听容器尺寸变化
    const resizeObserver = new ResizeObserver(this.onResize.bind(this));
    resizeObserver.observe(this.container);
  }

  private removeEventListeners(): void {
    if (!this.container) return;
    this.container.removeEventListener('scroll', this.onScroll.bind(this));
  }

  private onScroll(): void {
    if (!this.options.enabled) return;
    this.updateVisibleRange();
  }

  private onResize(): void {
    if (!this.options.enabled) return;
    this.initializeVirtualScroll();
  }

  private updateVisibleRange(): void {
    if (!this.container) return;

    const scrollPosition = this.isHorizontal 
      ? this.container.scrollLeft 
      : this.container.scrollTop;

    // 计算当前可视区域的起始和结束索引
    const newVisibleStartIndex = Math.floor(scrollPosition / this.itemSize);
    const newVisibleEndIndex = Math.min(
      this.totalItems - 1,
      Math.ceil((scrollPosition + this.containerSize) / this.itemSize) - 1
    );

    // 检查是否需要重新渲染
    if (newVisibleStartIndex !== this.visibleStartIndex || 
        newVisibleEndIndex !== this.visibleEndIndex) {
      
      this.visibleStartIndex = newVisibleStartIndex;
      this.visibleEndIndex = newVisibleEndIndex;

      // 计算需要渲染的范围（包含缓冲区）
      const newRenderedStartIndex = Math.max(0, this.visibleStartIndex - this.options.bufferSize);
      const newRenderedEndIndex = Math.min(this.totalItems - 1, this.visibleEndIndex + this.options.bufferSize);

      // 检查是否需要重新渲染
      if (newRenderedStartIndex !== this.renderedStartIndex || 
          newRenderedEndIndex !== this.renderedEndIndex) {
        
        this.renderedStartIndex = newRenderedStartIndex;
        this.renderedEndIndex = newRenderedEndIndex;
        this.renderVisibleItems();
      }
    }
  }

  private renderVisibleItems(): void {
    if (!this.content1 || !this.content2) return;

    const startTime = performance.now();

    // 清空现有内容
    this.content1.innerHTML = '';
    this.content2.innerHTML = '';

    // 渲染可见的 items
    for (let i = this.renderedStartIndex; i <= this.renderedEndIndex; i++) {
      const item = this.createItem(i);
      this.content1.appendChild(item.cloneNode(true));
      this.content2.appendChild(item);
    }

    // 设置容器高度/宽度以保持滚动条
    const totalHeight = this.totalItems * this.itemSize;
    if (this.isHorizontal) {
      this.content1.style.width = `${totalHeight}px`;
      this.content2.style.width = `${totalHeight}px`;
    } else {
      this.content1.style.height = `${totalHeight}px`;
      this.content2.style.height = `${totalHeight}px`;
    }

    const renderTime = performance.now() - startTime;

    // 触发渲染回调
    this.options.onRender(
      this.renderedStartIndex,
      this.renderedEndIndex,
      this.renderedEndIndex - this.renderedStartIndex + 1
    );

    // 更新性能指标
    this.updateMetrics(renderTime);
  }

  private createItem(index: number): HTMLElement {
    const item = document.createElement('div');
    item.className = 'virtual-item';
    item.style.cssText = `
      ${this.isHorizontal ? 'width' : 'height'}: ${this.itemSize}px;
      display: inline-block;
      white-space: nowrap;
      overflow: hidden;
    `;
    
    // 这里可以根据实际数据渲染内容
    item.textContent = `Item ${index + 1}`;
    
    return item;
  }

  private updateMetrics(renderTime: number): void {
    const metrics: VirtualScrollMetrics = {
      totalItems: this.totalItems,
      visibleItems: this.visibleEndIndex - this.visibleStartIndex + 1,
      renderedItems: this.renderedEndIndex - this.renderedStartIndex + 1,
      startIndex: this.renderedStartIndex,
      endIndex: this.renderedEndIndex,
      scrollPosition: this.isHorizontal 
        ? (this.container?.scrollLeft || 0)
        : (this.container?.scrollTop || 0),
      performance: {
        renderTime,
        memoryUsage: (performance as any).memory?.usedJSHeapSize
      }
    };

    // 可以通过事件或其他方式暴露这些指标
    if (this.instance && typeof (this.instance as any).onEvent === 'function') {
      (this.instance as any).onEvent('virtual-scroll-update', metrics);
    }
  }

  // 公共方法：更新数据
  updateData(data: string[]): void {
    this.totalItems = data.length;
    this.initializeVirtualScroll();
  }

  // 公共方法：获取性能指标
  getMetrics(): VirtualScrollMetrics {
    return {
      totalItems: this.totalItems,
      visibleItems: this.visibleEndIndex - this.visibleStartIndex + 1,
      renderedItems: this.renderedEndIndex - this.renderedStartIndex + 1,
      startIndex: this.renderedStartIndex,
      endIndex: this.renderedEndIndex,
      scrollPosition: this.isHorizontal 
        ? (this.container?.scrollLeft || 0)
        : (this.container?.scrollTop || 0),
      performance: {
        renderTime: 0,
        memoryUsage: (performance as any).memory?.usedJSHeapSize
      }
    };
  }
}

// 导出插件实例创建函数
export function createVirtualScrollPlugin(options?: VirtualScrollOptions): VirtualScrollPlugin {
  return new VirtualScrollPlugin(options);
} 
/**
 * DOMCache - DOM缓存管理器
 * 
 * 职责：
 * - 缓存DOM元素尺寸
 * - 避免频繁读取DOM导致重排
 * - 提供缓存刷新机制
 */

export class DOMCache {
  private sizeCache: Map<HTMLElement, { width: number; height: number; timestamp: number }> = new Map();
  private cacheTimeout: number = 100; // 缓存有效期100ms

  /**
   * 获取元素宽度（带缓存）
   */
  getWidth(element: HTMLElement): number {
    const cached = this.sizeCache.get(element);
    const now = performance.now();

    if (cached && (now - cached.timestamp) < this.cacheTimeout) {
      return cached.width;
    }

    // 缓存失效，重新测量
    const width = element.offsetWidth;
    this.sizeCache.set(element, { width, height: element.offsetHeight, timestamp: now });

    return width;
  }

  /**
   * 获取元素高度（带缓存）
   */
  getHeight(element: HTMLElement): number {
    const cached = this.sizeCache.get(element);
    const now = performance.now();

    if (cached && (now - cached.timestamp) < this.cacheTimeout) {
      return cached.height;
    }

    // 缓存失效，重新测量
    const height = element.offsetHeight;
    this.sizeCache.set(element, { width: element.offsetWidth, height, timestamp: now });

    return height;
  }

  /**
   * 获取元素尺寸（带缓存）
   */
  getSize(element: HTMLElement): { width: number; height: number } {
    const cached = this.sizeCache.get(element);
    const now = performance.now();

    if (cached && (now - cached.timestamp) < this.cacheTimeout) {
      return { width: cached.width, height: cached.height };
    }

    // 缓存失效，重新测量
    const width = element.offsetWidth;
    const height = element.offsetHeight;
    this.sizeCache.set(element, { width, height, timestamp: now });

    return { width, height };
  }

  /**
   * 强制刷新缓存
   */
  refresh(element?: HTMLElement): void {
    if (element) {
      this.sizeCache.delete(element);
    } else {
      this.sizeCache.clear();
    }
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.sizeCache.clear();
  }

  /**
   * 销毁缓存
   */
  destroy(): void {
    this.clear();
  }
}

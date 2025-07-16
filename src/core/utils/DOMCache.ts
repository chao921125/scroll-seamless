/**
 * LRU缓存实现
 */
class LRUCache<K, V> {
  private capacity: number;
  private cache = new Map<K, V>();

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  get(key: K): V | undefined {
    if (this.cache.has(key)) {
      // 移到最后（最近使用）
      const value = this.cache.get(key)!;
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return undefined;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      // 更新现有值
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // 删除最久未使用的项
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

/**
 * DOM测量结果接口
 */
export interface ElementMeasurement {
  width: number;
  height: number;
  offsetWidth: number;
  offsetHeight: number;
  scrollWidth: number;
  scrollHeight: number;
  timestamp: number;
}

/**
 * DOM测量缓存管理器
 */
export class DOMCache {
  private measurementCache: LRUCache<string, ElementMeasurement>;
  private textSizeCache: LRUCache<string, { width: number; height: number }>;
  private resizeObserver: ResizeObserver | null = null;
  private observedElements = new WeakSet<Element>();
  private cacheTimeout = 5000; // 缓存5秒后过期

  constructor(cacheSize = 100) {
    this.measurementCache = new LRUCache(cacheSize);
    this.textSizeCache = new LRUCache(cacheSize * 2);
    
    // 创建ResizeObserver来监听元素尺寸变化
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver((entries) => {
        entries.forEach(entry => {
          const element = entry.target as HTMLElement;
          const key = this.getElementKey(element);
          // 元素尺寸变化时清除缓存
          this.measurementCache.set(key, this.measureElement(element));
        });
      });
    }
  }

  /**
   * 生成元素的唯一键
   */
  private getElementKey(element: HTMLElement): string {
    return `${element.tagName}_${element.className}_${element.id}_${element.textContent?.slice(0, 50)}`;
  }

  /**
   * 生成文本测量的键
   */
  private getTextKey(text: string, className: string, styles?: string): string {
    return `${text}_${className}_${styles || ''}`;
  }

  /**
   * 实际测量元素
   */
  private measureElement(element: HTMLElement): ElementMeasurement {
    const rect = element.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
      offsetWidth: element.offsetWidth,
      offsetHeight: element.offsetHeight,
      scrollWidth: element.scrollWidth,
      scrollHeight: element.scrollHeight,
      timestamp: Date.now()
    };
  }

  /**
   * 获取元素测量结果（带缓存）
   */
  getElementMeasurement(element: HTMLElement, forceRefresh = false): ElementMeasurement {
    const key = this.getElementKey(element);
    
    if (!forceRefresh) {
      const cached = this.measurementCache.get(key);
      if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
        return cached;
      }
    }

    // 开始观察元素（如果支持ResizeObserver）
    if (this.resizeObserver && !this.observedElements.has(element)) {
      this.resizeObserver.observe(element);
      this.observedElements.add(element);
    }

    const measurement = this.measureElement(element);
    this.measurementCache.set(key, measurement);
    return measurement;
  }

  /**
   * 测量文本尺寸（带缓存）
   */
  measureText(
    text: string,
    className: string = 'ss-item',
    styles?: Partial<CSSStyleDeclaration>
  ): { width: number; height: number } {
    const styleStr = styles ? JSON.stringify(styles) : '';
    const key = this.getTextKey(text, className, styleStr);
    
    const cached = this.textSizeCache.get(key);
    if (cached) {
      return cached;
    }

    // 创建临时元素进行测量
    const tempElement = document.createElement('span');
    tempElement.className = className;
    tempElement.textContent = text;
    tempElement.style.position = 'absolute';
    tempElement.style.visibility = 'hidden';
    tempElement.style.whiteSpace = 'nowrap';
    
    // 应用自定义样式
    if (styles) {
      Object.assign(tempElement.style, styles);
    }

    document.body.appendChild(tempElement);
    const measurement = {
      width: tempElement.offsetWidth,
      height: tempElement.offsetHeight
    };
    document.body.removeChild(tempElement);

    this.textSizeCache.set(key, measurement);
    return measurement;
  }

  /**
   * 批量测量文本
   */
  measureTextBatch(
    texts: string[],
    className: string = 'ss-item',
    styles?: Partial<CSSStyleDeclaration>
  ): { width: number; height: number }[] {
    const results: { width: number; height: number }[] = [];
    const uncachedTexts: { text: string; index: number }[] = [];

    // 先检查缓存
    texts.forEach((text, index) => {
      const styleStr = styles ? JSON.stringify(styles) : '';
      const key = this.getTextKey(text, className, styleStr);
      const cached = this.textSizeCache.get(key);
      
      if (cached) {
        results[index] = cached;
      } else {
        uncachedTexts.push({ text, index });
      }
    });

    // 批量测量未缓存的文本
    if (uncachedTexts.length > 0) {
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.visibility = 'hidden';
      container.style.whiteSpace = 'nowrap';
      document.body.appendChild(container);

      uncachedTexts.forEach(({ text, index }) => {
        const span = document.createElement('span');
        span.className = className;
        span.textContent = text;
        
        if (styles) {
          Object.assign(span.style, styles);
        }
        
        container.appendChild(span);
        
        const measurement = {
          width: span.offsetWidth,
          height: span.offsetHeight
        };
        
        results[index] = measurement;
        
        // 缓存结果
        const styleStr = styles ? JSON.stringify(styles) : '';
        const key = this.getTextKey(text, className, styleStr);
        this.textSizeCache.set(key, measurement);
      });

      document.body.removeChild(container);
    }

    return results;
  }

  /**
   * 清除过期缓存
   */
  clearExpiredCache(): void {
    // 这里简化处理，实际应该遍历检查时间戳
    // 由于Map的遍历特性，这里直接清空重建
    const now = Date.now();
    const newCache = new LRUCache<string, ElementMeasurement>(this.measurementCache.size());
    
    // 重新构建未过期的缓存（这里简化实现）
    this.measurementCache.clear();
    this.measurementCache = newCache;
  }

  /**
   * 获取缓存统计
   */
  getCacheStats() {
    return {
      measurementCacheSize: this.measurementCache.size(),
      textCacheSize: this.textSizeCache.size(),
      observedElements: this.observedElements ? 'WeakSet (无法计数)' : 0,
      hasResizeObserver: !!this.resizeObserver
    };
  }

  /**
   * 销毁缓存
   */
  destroy(): void {
    this.measurementCache.clear();
    this.textSizeCache.clear();
    
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }
}
/**
 * 通用对象池实现，用于复用对象以减少垃圾回收
 */
export class ObjectPool<T> {
  private pool: T[] = [];
  private factory: () => T;
  private reset: (item: T) => void;
  private maxSize: number;
  private created = 0;

  constructor(
    factory: () => T,
    reset: (item: T) => void,
    initialSize = 5,
    maxSize = 50
  ) {
    this.factory = factory;
    this.reset = reset;
    this.maxSize = maxSize;
    
    // 预创建初始对象
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.factory());
      this.created++;
    }
  }

  /**
   * 从池中获取对象
   */
  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    
    // 池为空时创建新对象
    this.created++;
    return this.factory();
  }

  /**
   * 将对象归还到池中
   */
  release(item: T): void {
    if (this.pool.length < this.maxSize) {
      this.reset(item);
      this.pool.push(item);
    }
    // 超过最大容量时直接丢弃，让GC回收
  }

  /**
   * 清空池
   */
  clear(): void {
    this.pool.length = 0;
  }

  /**
   * 获取池状态
   */
  getStats() {
    return {
      poolSize: this.pool.length,
      totalCreated: this.created,
      maxSize: this.maxSize
    };
  }
}

/**
 * DOM元素对象池
 */
export class DOMElementPool {
  private spanPool: ObjectPool<HTMLSpanElement>;
  private divPool: ObjectPool<HTMLDivElement>;

  constructor() {
    this.spanPool = new ObjectPool(
      () => document.createElement('span'),
      (span) => {
        span.className = '';
        span.textContent = '';
        span.removeAttribute('style');
      }
    );

    this.divPool = new ObjectPool(
      () => document.createElement('div'),
      (div) => {
        div.className = '';
        div.innerHTML = '';
        div.removeAttribute('style');
      }
    );
  }

  acquireSpan(): HTMLSpanElement {
    return this.spanPool.acquire();
  }

  releaseSpan(span: HTMLSpanElement): void {
    this.spanPool.release(span);
  }

  acquireDiv(): HTMLDivElement {
    return this.divPool.acquire();
  }

  releaseDiv(div: HTMLDivElement): void {
    this.divPool.release(div);
  }

  clear(): void {
    this.spanPool.clear();
    this.divPool.clear();
  }
}
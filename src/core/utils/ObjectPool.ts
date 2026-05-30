/**
 * ObjectPool - 对象池
 * 
 * 职责：
 * - 复用DOM元素，减少GC
 * - 管理对象的创建和回收
 * - 控制池大小
 */

export class ObjectPool<T extends HTMLElement> {
  private pool: T[] = [];
  private minSize: number;
  private maxSize: number;
  private createFn: () => T;
  private resetFn?: (element: T) => void;

  constructor(options: {
    minSize?: number;
    maxSize?: number;
    create: () => T;
    reset?: (element: T) => void;
  }) {
    this.minSize = options.minSize ?? 10;
    this.maxSize = options.maxSize ?? 100;
    this.createFn = options.create;
    this.resetFn = options.reset;

    // 预热对象池
    this.warmup();
  }

  /**
   * 预热对象池
   */
  private warmup(): void {
    for (let i = 0; i < this.minSize; i++) {
      this.pool.push(this.createFn());
    }
  }

  /**
   * 获取对象
   */
  acquire(): T {
    if (this.pool.length > 0) {
      const element = this.pool.pop()!;
      
      // 重置对象状态
      if (this.resetFn) {
        this.resetFn(element);
      }
      
      return element;
    }

    // 池空了，创建新对象
    return this.createFn();
  }

  /**
   * 回收对象
   */
  recycle(element: T): void {
    // 检查池是否已满
    if (this.pool.length >= this.maxSize) {
      // 池满，销毁对象
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      return;
    }

    // 重置对象状态
    if (this.resetFn) {
      this.resetFn(element);
    }

    // 回收到池中
    this.pool.push(element);
  }

  /**
   * 获取池大小
   */
  getSize(): number {
    return this.pool.length;
  }

  /**
   * 清空对象池
   */
  clear(): void {
    this.pool.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
    this.pool = [];
  }

  /**
   * 销毁对象池
   */
  destroy(): void {
    this.clear();
  }
}

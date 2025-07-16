/**
 * 内存管理器 - 负责资源清理和内存泄漏防护
 */
export class MemoryManager {
  private cleanupTasks: (() => void)[] = [];
  private eventListeners: Map<HTMLElement, Map<string, EventListener[]>> = new Map();
  private observers: MutationObserver[] = [];
  private timers: Set<number> = new Set();
  private intervals: Set<number> = new Set();
  private rafIds: Set<number> = new Set();
  private isDestroyed = false;

  /**
   * 添加清理任务
   */
  addCleanupTask(task: () => void): void {
    if (this.isDestroyed) return;
    this.cleanupTasks.push(task);
  }

  /**
   * 安全的事件监听器添加
   */
  addEventListener(
    element: HTMLElement,
    event: string,
    listener: EventListener,
    options?: AddEventListenerOptions
  ): void {
    if (this.isDestroyed) return;

    element.addEventListener(event, listener, options);

    // 记录事件监听器以便清理
    if (!this.eventListeners.has(element)) {
      this.eventListeners.set(element, new Map());
    }
    const elementListeners = this.eventListeners.get(element)!;
    if (!elementListeners.has(event)) {
      elementListeners.set(event, []);
    }
    elementListeners.get(event)!.push(listener);
  }

  /**
   * 移除事件监听器
   */
  removeEventListener(
    element: HTMLElement,
    event: string,
    listener: EventListener
  ): void {
    element.removeEventListener(event, listener);

    // 从记录中移除
    const elementListeners = this.eventListeners.get(element);
    if (elementListeners) {
      const listeners = elementListeners.get(event);
      if (listeners) {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    }
  }

  /**
   * 创建并管理 MutationObserver
   */
  createMutationObserver(
    callback: MutationCallback,
    target: Node,
    options?: MutationObserverInit
  ): MutationObserver {
    if (this.isDestroyed) {
      throw new Error('MemoryManager已销毁，无法创建新的Observer');
    }

    const observer = new MutationObserver(callback);
    observer.observe(target, options);
    this.observers.push(observer);
    return observer;
  }

  /**
   * 管理定时器
   */
  setTimeout(callback: () => void, delay: number): number {
    if (this.isDestroyed) return -1;

    const id = window.setTimeout(() => {
      this.timers.delete(id);
      callback();
    }, delay);
    
    this.timers.add(id);
    return id;
  }

  setInterval(callback: () => void, delay: number): number {
    if (this.isDestroyed) return -1;

    const id = window.setInterval(callback, delay);
    this.intervals.add(id);
    return id;
  }

  clearTimeout(id: number): void {
    window.clearTimeout(id);
    this.timers.delete(id);
  }

  clearInterval(id: number): void {
    window.clearInterval(id);
    this.intervals.delete(id);
  }

  /**
   * 管理 requestAnimationFrame
   */
  requestAnimationFrame(callback: FrameRequestCallback): number {
    if (this.isDestroyed) return -1;

    const id = requestAnimationFrame((timestamp) => {
      this.rafIds.delete(id);
      callback(timestamp);
    });
    
    this.rafIds.add(id);
    return id;
  }

  cancelAnimationFrame(id: number): void {
    cancelAnimationFrame(id);
    this.rafIds.delete(id);
  }

  /**
   * 获取内存使用统计
   */
  getMemoryStats() {
    return {
      cleanupTasks: this.cleanupTasks.length,
      eventListeners: Array.from(this.eventListeners.values())
        .reduce((total, map) => total + Array.from(map.values())
        .reduce((sum, arr) => sum + arr.length, 0), 0),
      observers: this.observers.length,
      timers: this.timers.size,
      intervals: this.intervals.size,
      rafIds: this.rafIds.size,
      isDestroyed: this.isDestroyed
    };
  }

  /**
   * 完全清理所有资源
   */
  destroy(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    // 执行所有清理任务
    this.cleanupTasks.forEach(task => {
      try {
        task();
      } catch (error) {
        console.warn('清理任务执行失败:', error);
      }
    });
    this.cleanupTasks.length = 0;

    // 清理所有事件监听器
    for (const [element, eventMap] of this.eventListeners) {
      for (const [event, listeners] of eventMap) {
        listeners.forEach(listener => {
          try {
            element.removeEventListener(event, listener);
          } catch (error) {
            console.warn('移除事件监听器失败:', error);
          }
        });
      }
    }
    this.eventListeners.clear();

    // 断开所有观察器
    this.observers.forEach(observer => {
      try {
        observer.disconnect();
      } catch (error) {
        console.warn('断开Observer失败:', error);
      }
    });
    this.observers.length = 0;

    // 清理所有定时器
    this.timers.forEach(id => window.clearTimeout(id));
    this.timers.clear();

    this.intervals.forEach(id => window.clearInterval(id));
    this.intervals.clear();

    // 取消所有动画帧
    this.rafIds.forEach(id => cancelAnimationFrame(id));
    this.rafIds.clear();
  }
}
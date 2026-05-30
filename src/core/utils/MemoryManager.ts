/**
 * MemoryManager - 内存管理器
 * 
 * 职责：
 * - 统一管理所有定时器和事件监听器
 * - 确保destroy时完全清理，防止内存泄漏
 * - 提供安全的setTimeout/setInterval包装
 */

export class MemoryManager {
  private timers: Set<number> = new Set();
  private intervals: Set<number> = new Set();
  private eventListeners: Array<{
    element: EventTarget;
    type: string;
    listener: EventListener;
    options?: boolean | AddEventListenerOptions;
  }> = [];
  private resizeObservers: ResizeObserver[] = [];
  private callbacks: Array<() => void> = [];

  /**
   * 安全的setTimeout
   */
  setTimeout(callback: () => void, delay: number): number {
    const id = window.setTimeout(() => {
      this.timers.delete(id);
      callback();
    }, delay);
    this.timers.add(id);
    return id;
  }

  /**
   * 安全的setInterval
   */
  setInterval(callback: () => void, delay: number): number {
    const id = window.setInterval(callback, delay);
    this.intervals.add(id);
    return id;
  }

  /**
   * 安全的事件监听
   */
  addEventListener(
    element: EventTarget,
    type: string,
    listener: EventListener,
    options?: boolean | AddEventListenerOptions
  ): void {
    element.addEventListener(type, listener, options);
    this.eventListeners.push({ element, type, listener, options });
  }

  /**
   * 安全的ResizeObserver
   */
  observeResize(observer: ResizeObserver): void {
    this.resizeObservers.push(observer);
  }

  /**
   * 注册清理回调
   */
  onCleanup(callback: () => void): void {
    this.callbacks.push(callback);
  }

  /**
   * 清理所有资源
   */
  destroy(): void {
    // 清理所有定时器
    this.timers.forEach(id => clearTimeout(id));
    this.timers.clear();

    // 清理所有间隔定时器
    this.intervals.forEach(id => clearInterval(id));
    this.intervals.clear();

    // 移除所有事件监听器
    this.eventListeners.forEach(({ element, type, listener }) => {
      try {
        element.removeEventListener(type, listener);
      } catch (e) {
        // 忽略移除失败
      }
    });
    this.eventListeners = [];

    // 断开所有ResizeObserver
    this.resizeObservers.forEach(observer => {
      try {
        observer.disconnect();
      } catch (e) {
        // 忽略断开失败
      }
    });
    this.resizeObservers = [];

    // 执行所有清理回调
    this.callbacks.forEach(callback => {
      try {
        callback();
      } catch (e) {
        // 忽略清理回调错误
      }
    });
    this.callbacks = [];
  }
}

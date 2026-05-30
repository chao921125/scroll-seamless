/**
 * EventBus - 事件总线
 * 
 * 职责：
 * - 统一管理事件发射
 * - 支持回调函数和DOM事件双通道
 * - 提供事件节流功能
 * - 支持事件监听器管理
 */

import type { ScrollEventType, EventCallback } from '../../types';
import { ErrorHandler } from './ErrorHandler';

export interface EventBusOptions {
  /** 是否启用DOM事件 */
  enableDomEvents?: boolean;
  /** 事件节流间隔（ms） */
  eventThrottle?: number;
}

export class EventBus {
  private container: HTMLElement;
  private callbacks: Map<ScrollEventType, EventCallback[]> = new Map();
  private lastEventTime: number = 0;
  private readonly options: Required<EventBusOptions>;

  constructor(container: HTMLElement, options: EventBusOptions = {}) {
    this.container = container;
    this.options = {
      enableDomEvents: options.enableDomEvents ?? true,
      eventThrottle: options.eventThrottle ?? 0,
    };
  }

  /**
   * 注册事件回调
   */
  on(type: ScrollEventType, callback: EventCallback): void {
    if (!this.callbacks.has(type)) {
      this.callbacks.set(type, []);
    }
    this.callbacks.get(type)!.push(callback);
  }

  /**
   * 移除事件回调
   */
  off(type: ScrollEventType, callback: EventCallback): void {
    const callbacks = this.callbacks.get(type);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * 移除所有指定类型的回调
   */
  offAll(type?: ScrollEventType): void {
    if (type) {
      this.callbacks.delete(type);
    } else {
      this.callbacks.clear();
    }
  }

  /**
   * 发射事件
   */
  emit(type: ScrollEventType, data?: any): void {
    // 节流检查
    if (this.options.eventThrottle > 0) {
      const now = Date.now();
      if (now - this.lastEventTime < this.options.eventThrottle) {
        return;
      }
      this.lastEventTime = now;
    }

    // 触发回调函数
    this.emitCallbacks(type, data);

    // 触发DOM事件
    if (this.options.enableDomEvents) {
      this.emitDomEvent(type, data);
    }
  }

  /**
   * 触发回调函数
   */
  private emitCallbacks(type: ScrollEventType, data: any): void {
    const callbacks = this.callbacks.get(type);
    if (!callbacks || callbacks.length === 0) {
      return;
    }

    for (const callback of callbacks) {
      try {
        callback(type, data);
      } catch (error) {
        ErrorHandler.logError(
          error as Error,
          `EventBus.emitCallbacks.${type}`
        );
      }
    }
  }

  /**
   * 触发DOM事件
   */
  private emitDomEvent(type: ScrollEventType, data: any): void {
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

  /**
   * 获取所有已注册的事件类型
   */
  getRegisteredEvents(): ScrollEventType[] {
    return Array.from(this.callbacks.keys());
  }

  /**
   * 获取指定事件的回调数量
   */
  getCallbackCount(type: ScrollEventType): number {
    return this.callbacks.get(type)?.length ?? 0;
  }

  /**
   * 清理所有事件监听器
   */
  destroy(): void {
    this.callbacks.clear();
    this.lastEventTime = 0;
  }
}

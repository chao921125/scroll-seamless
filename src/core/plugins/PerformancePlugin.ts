import { ScrollSeamlessController, PerformancePluginOptions } from '../../types';
import { rafScheduler } from '../utils/RAFScheduler';

/**
 * 性能指标接口
 */
export interface PerformanceMetrics {
  fps: number;
  memory: {
    jsHeapSizeLimit: number;
    totalJSHeapSize: number;
    usedJSHeapSize: number;
  } | null;
  timing: {
    renderTime: number;
    animationTime: number;
  };
  elements: {
    total: number;
    visible: number;
  };
}

/**
 * 性能监控插件
 * 用于监控滚动性能并提供性能指标
 */
export class PerformancePlugin {
  public id = 'performance';
  private controller: ScrollSeamlessController | null = null;
  private options: Required<PerformancePluginOptions>;
  private metrics: PerformanceMetrics;
  private monitoringInterval: number | null = null;

  constructor(options: PerformancePluginOptions = {}) {
    this.options = {
      enabled: options.enabled !== false,
      fps: options.fps !== false,
      memory: options.memory !== false,
      timing: options.timing !== false,
      onUpdate: options.onUpdate || (() => {}),
      autoRestart: options.autoRestart !== false
    };

    this.metrics = {
      fps: 0,
      memory: null,
      timing: {
        renderTime: 0,
        animationTime: 0
      },
      elements: {
        total: 0,
        visible: 0
      }
    };
  }

  /**
   * 应用插件
   * @param controller 滚动控制器
   */
  apply(controller: ScrollSeamlessController): void {
    this.controller = controller;

    if (this.options.enabled) {
      this.startMonitoring();
    }
  }

  /**
   * 销毁插件
   */
  destroy(): void {
    this.stopMonitoring();
    this.controller = null;
  }

  /**
   * 开始监控
   */
  private startMonitoring(): void {
    if (this.monitoringInterval) {
      return;
    }

    this.monitoringInterval = window.setInterval(() => {
      this.updateMetrics();
    }, 1000) as unknown as number;
  }

  /**
   * 停止监控
   */
  private stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * 更新性能指标
   */
  private updateMetrics(): void {
    // 更新FPS
    if (this.options.fps) {
      const performanceMetrics = rafScheduler.getPerformanceMetrics();
      this.metrics.fps = performanceMetrics.fps;
    }

    // 更新内存使用情况
    if (this.options.memory && window.performance && (performance as any).memory) {
      const memory = (performance as any).memory;
      this.metrics.memory = {
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        totalJSHeapSize: memory.totalJSHeapSize,
        usedJSHeapSize: memory.usedJSHeapSize
      };
    }

    // 更新元素计数
    const container = document.querySelector('.scroll-seamless-vue');
    if (container) {
      this.metrics.elements.total = container.querySelectorAll('*').length;
      this.metrics.elements.visible = container.querySelectorAll('.ss-item').length;
    }

    // 调用回调
    if (this.options.onUpdate) {
      this.options.onUpdate(this.metrics);
    }
  }

  /**
   * 获取性能指标
   * @returns 性能指标
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
}
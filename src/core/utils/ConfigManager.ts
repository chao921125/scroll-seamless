/**
 * ConfigManager - 配置管理器
 * 
 * 职责：
 * - 管理默认配置
 * - 合并用户配置
 * - 验证配置有效性
 * - 提供配置查询接口
 */

import type { ScrollOptions, RequiredOptions, ScrollDirection } from '../../types';
import { ErrorHandler } from './ErrorHandler';

export class ConfigManager {
  /**
   * 默认配置
   */
  private static readonly DEFAULTS: Omit<RequiredOptions, 'data'> = {
    direction: 'left',
    step: 1,
    stepWait: 0,
    delay: 0,
    bezier: [0.25, 0.1, 0.25, 1],
    rows: 1,
    cols: 1,
    minCountToScroll: 2,
    hoverStop: false,
    hoverDelay: 0,
    leaveDelay: 0,
    wheelEnable: false,
    wheelSensitivity: 1.0,
    wheelStep: 10,
    wheelPreventDefault: true,
    autoStart: true,
    fixedTimeStep: 16.67,
    maxDeltaTime: 100,
    keepRafOnPause: true,
    virtualScroll: false,
    bufferSize: 5,
    estimatedItemSize: 50,
    enableReuse: true,
    enableResizeObserver: false,
    resizeDebounce: 100,
    resizeThreshold: 5,
    autoRelayout: true,
    fadeEdge: { enabled: false },
    enableDomEvents: true,
    eventThrottle: 0,
    plugins: [],
    pluginTimeout: 5000,
    strictMode: false,
    minPoolSize: 10,
    maxPoolSize: 100,
    warmupPool: true,
    renderItem: undefined,
    onLoadMore: undefined,
    onEvent: undefined,
    performance: undefined,
    accessibility: undefined,
    keyboard: undefined,
  };

  /**
   * 合并配置
   */
  static mergeOptions(options: ScrollOptions): RequiredOptions {
    const merged: RequiredOptions = {
      data: options.data,
      ...ConfigManager.DEFAULTS,
    };

    // 覆盖用户配置
    Object.keys(options).forEach(key => {
      const value = options[key as keyof ScrollOptions];
      if (value !== undefined) {
        (merged as any)[key] = value;
      }
    });

    // 验证配置
    ConfigManager.validateOptions(merged);

    return merged;
  }

  /**
   * 验证配置
   */
  private static validateOptions(options: RequiredOptions): void {
    // 验证data
    ErrorHandler.validateRequired(options.data, 'data', 'object');
    if (!Array.isArray(options.data) || options.data.length === 0) {
      throw new Error('[ScrollSeamless] data must be a non-empty array');
    }

    // 验证direction
    const validDirections: ScrollDirection[] = ['left', 'right', 'up', 'down'];
    if (!validDirections.includes(options.direction)) {
      throw new Error(
        `[ScrollSeamless] Invalid direction: ${options.direction}. ` +
        `Must be one of: ${validDirections.join(', ')}`
      );
    }

    // 验证step
    if (options.step <= 0) {
      throw new Error('[ScrollSeamless] step must be greater than 0');
    }

    // 验证rows和cols
    if (options.rows < 1) {
      throw new Error('[ScrollSeamless] rows must be at least 1');
    }
    if (options.cols < 1) {
      throw new Error('[ScrollSeamless] cols must be at least 1');
    }

    // 验证性能相关
    if (options.fixedTimeStep <= 0) {
      throw new Error('[ScrollSeamless] fixedTimeStep must be greater than 0');
    }
    if (options.maxDeltaTime <= 0) {
      throw new Error('[ScrollSeamless] maxDeltaTime must be greater than 0');
    }

    // 验证插件相关
    if (options.pluginTimeout <= 0) {
      throw new Error('[ScrollSeamless] pluginTimeout must be greater than 0');
    }

    // 验证对象池
    if (options.minPoolSize < 0) {
      throw new Error('[ScrollSeamless] minPoolSize must be non-negative');
    }
    if (options.maxPoolSize < options.minPoolSize) {
      throw new Error('[ScrollSeamless] maxPoolSize must be >= minPoolSize');
    }

    // 验证fadeEdge
    if (options.fadeEdge?.enabled && options.fadeEdge.size !== undefined && options.fadeEdge.size <= 0) {
      throw new Error('[ScrollSeamless] fadeEdge.size must be greater than 0');
    }

    // 验证虚拟滚动
    if (options.virtualScroll && options.estimatedItemSize <= 0) {
      throw new Error('[ScrollSeamless] estimatedItemSize must be greater than 0 when virtualScroll is enabled');
    }
  }

  /**
   * 获取默认配置
   */
  static getDefaults(): Readonly<Omit<RequiredOptions, 'data'>> {
    return ConfigManager.DEFAULTS;
  }

  /**
   * 检查配置项是否有自定义值
   */
  static hasCustomValue<T extends keyof ScrollOptions>(
    options: ScrollOptions,
    key: T
  ): boolean {
    return options[key] !== undefined;
  }

  /**
   * 获取配置的当前值
   */
  static getValue<T extends keyof RequiredOptions>(
    options: RequiredOptions,
    key: T
  ): RequiredOptions[T] {
    return options[key];
  }

  /**
   * 更新配置
   */
  static updateOption<T extends keyof RequiredOptions>(
    options: RequiredOptions,
    key: T,
    value: RequiredOptions[T]
  ): void {
    options[key] = value;
    
    // 重新验证
    ConfigManager.validateOptions(options);
  }
}

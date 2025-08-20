import { ScrollDirection } from '../../types';

/**
 * 错误类型枚举
 */
export enum ScrollDirectionError {
  INVALID_DIRECTION = 'INVALID_DIRECTION',
  CONTENT_SIZE_CALCULATION_FAILED = 'CONTENT_SIZE_CALCULATION_FAILED',
  ANIMATION_SYNC_FAILED = 'ANIMATION_SYNC_FAILED',
  DIRECTION_CHANGE_FAILED = 'DIRECTION_CHANGE_FAILED',
  TRANSFORM_APPLICATION_FAILED = 'TRANSFORM_APPLICATION_FAILED',
  POSITION_VALIDATION_FAILED = 'POSITION_VALIDATION_FAILED',
  CONTAINER_NOT_FOUND = 'CONTAINER_NOT_FOUND',
  ELEMENT_NOT_ACCESSIBLE = 'ELEMENT_NOT_ACCESSIBLE',
  INVALID_DATA = 'INVALID_DATA'
}

/**
 * 错误详情接口
 */
export interface ErrorDetails {
  code: ScrollDirectionError;
  message: string;
  context?: Record<string, any>;
  timestamp: number;
  stack?: string;
  recoverable: boolean;
}

/**
 * 验证结果接口
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ErrorDetails[];
  warnings: string[];
}

/**
 * 恢复策略接口
 */
export interface RecoveryStrategy {
  canRecover: boolean;
  strategy: 'reset' | 'retry' | 'fallback' | 'ignore';
  maxAttempts: number;
  delay: number;
}

/**
 * 错误处理和验证工具类
 */
export class ErrorHandler {
  private static readonly MAX_RECOVERY_ATTEMPTS = 3;
  private static readonly RECOVERY_DELAY = 100;
  private static readonly DEBUG_MODE = typeof process !== 'undefined' && process.env.NODE_ENV === 'development';
  
  private static errorLog: ErrorDetails[] = [];
  private static recoveryAttempts = new Map<string, number>();

  /**
   * 验证方向参数
   * @param direction 滚动方向
   * @returns 验证结果
   */
  public static validateDirection(direction: any): ValidationResult {
    const errors: ErrorDetails[] = [];
    const warnings: string[] = [];

    // 检查是否为字符串
    if (typeof direction !== 'string') {
      errors.push(this.createError(
        ScrollDirectionError.INVALID_DIRECTION,
        `Direction must be a string, received: ${typeof direction}`,
        { direction, type: typeof direction }
      ));
      return { isValid: false, errors, warnings };
    }

    // 检查是否为有效的方向值
    const validDirections: ScrollDirection[] = ['up', 'down', 'left', 'right'];
    if (!validDirections.includes(direction as ScrollDirection)) {
      errors.push(this.createError(
        ScrollDirectionError.INVALID_DIRECTION,
        `Invalid direction: ${direction}. Valid directions are: ${validDirections.join(', ')}`,
        { direction, validDirections }
      ));
      return { isValid: false, errors, warnings };
    }

    // 检查是否为推荐的方向（可选警告）
    if (direction === 'up' || direction === 'down') {
      warnings.push('Vertical scrolling may have performance implications with large datasets');
    }

    return { isValid: true, errors, warnings };
  }

  /**
   * 验证内容尺寸计算参数
   * @param element 目标元素
   * @param direction 滚动方向
   * @returns 验证结果
   */
  public static validateContentSizeCalculation(
    element: HTMLElement | null,
    direction: ScrollDirection
  ): ValidationResult {
    const errors: ErrorDetails[] = [];
    const warnings: string[] = [];

    // 检查元素是否存在
    if (!element) {
      errors.push(this.createError(
        ScrollDirectionError.ELEMENT_NOT_ACCESSIBLE,
        'Element is null or undefined',
        { element, direction }
      ));
      return { isValid: false, errors, warnings };
    }

    // 检查元素是否在DOM中
    if (!document.contains(element)) {
      errors.push(this.createError(
        ScrollDirectionError.ELEMENT_NOT_ACCESSIBLE,
        'Element is not attached to the DOM',
        { element: element.tagName, direction }
      ));
      return { isValid: false, errors, warnings };
    }

    // 检查元素是否可见
    const computedStyle = getComputedStyle(element);
    if (computedStyle.display === 'none') {
      warnings.push('Element has display: none, size calculation may be inaccurate');
    }

    if (computedStyle.visibility === 'hidden') {
      warnings.push('Element has visibility: hidden, size calculation may be inaccurate');
    }

    // 检查元素是否有内容
    if (element.children.length === 0 && !element.textContent?.trim()) {
      warnings.push('Element appears to be empty, size calculation may return minimal values');
    }

    return { isValid: true, errors, warnings };
  }

  /**
   * 处理内容尺寸计算失败
   * @param element 目标元素
   * @param direction 滚动方向
   * @param error 原始错误
   * @returns 默认尺寸值
   */
  public static handleContentSizeCalculationFailure(
    element: HTMLElement | null,
    direction: ScrollDirection,
    error: Error
  ): number {
    const errorDetails = this.createError(
      ScrollDirectionError.CONTENT_SIZE_CALCULATION_FAILED,
      `Failed to calculate content size: ${error.message}`,
      { element: element?.tagName, direction, originalError: error.message }
    );

    this.logError(errorDetails);

    // 返回基于方向的默认值
    const defaultSizes = {
      left: 200,
      right: 200,
      up: 100,
      down: 100
    };

    const defaultSize = defaultSizes[direction];
    
    if (this.DEBUG_MODE) {
      console.warn(`Using default size ${defaultSize}px for ${direction} direction due to calculation failure`);
    }

    return defaultSize;
  }

  /**
   * 验证动画同步状态
   * @param animationId 动画ID
   * @param expectedState 期望状态
   * @returns 验证结果
   */
  public static validateAnimationSync(
    animationId: string | null,
    expectedState: 'running' | 'paused' | 'stopped'
  ): ValidationResult {
    const errors: ErrorDetails[] = [];
    const warnings: string[] = [];

    if (!animationId) {
      if (expectedState !== 'stopped') {
        errors.push(this.createError(
          ScrollDirectionError.ANIMATION_SYNC_FAILED,
          `Animation ID is null but expected state is ${expectedState}`,
          { animationId, expectedState }
        ));
      }
      return { isValid: expectedState === 'stopped', errors, warnings };
    }

    // 这里可以添加更多的动画状态验证逻辑
    // 例如检查 RAF 调度器中的动画状态

    return { isValid: true, errors, warnings };
  }

  /**
   * 处理动画同步失败并尝试自动恢复
   * @param animationId 动画ID
   * @param recoverCallback 恢复回调函数
   * @returns 恢复是否成功
   */
  public static handleAnimationSyncFailure(
    animationId: string,
    recoverCallback: () => void
  ): boolean {
    const attemptKey = `animation_${animationId}`;
    const currentAttempts = this.recoveryAttempts.get(attemptKey) || 0;

    if (currentAttempts >= this.MAX_RECOVERY_ATTEMPTS) {
      const errorDetails = this.createError(
        ScrollDirectionError.ANIMATION_SYNC_FAILED,
        `Animation sync recovery failed after ${this.MAX_RECOVERY_ATTEMPTS} attempts`,
        { animationId, attempts: currentAttempts },
        false // 不可恢复
      );
      this.logError(errorDetails);
      return false;
    }

    try {
      // 增加尝试次数
      this.recoveryAttempts.set(attemptKey, currentAttempts + 1);

      // 延迟执行恢复
      setTimeout(() => {
        try {
          recoverCallback();
          // 恢复成功，重置尝试次数
          this.recoveryAttempts.delete(attemptKey);
          
          if (this.DEBUG_MODE) {
            console.log(`Animation sync recovered successfully for ${animationId}`);
          }
        } catch (recoveryError) {
          const errorDetails = this.createError(
            ScrollDirectionError.ANIMATION_SYNC_FAILED,
            `Animation sync recovery callback failed: ${recoveryError instanceof Error ? recoveryError.message : String(recoveryError)}`,
            { animationId, attempt: currentAttempts + 1, recoveryError }
          );
          this.logError(errorDetails);
        }
      }, this.RECOVERY_DELAY * (currentAttempts + 1)); // 递增延迟

      return true;
    } catch (error) {
      const errorDetails = this.createError(
        ScrollDirectionError.ANIMATION_SYNC_FAILED,
        `Failed to initiate animation sync recovery: ${error instanceof Error ? error.message : String(error)}`,
        { animationId, error }
      );
      this.logError(errorDetails);
      return false;
    }
  }

  /**
   * 获取恢复策略
   * @param errorCode 错误代码
   * @param context 错误上下文
   * @returns 恢复策略
   */
  public static getRecoveryStrategy(
    errorCode: ScrollDirectionError,
    context?: Record<string, any>
  ): RecoveryStrategy {
    switch (errorCode) {
      case ScrollDirectionError.INVALID_DIRECTION:
        return {
          canRecover: true,
          strategy: 'fallback',
          maxAttempts: 1,
          delay: 0
        };

      case ScrollDirectionError.CONTENT_SIZE_CALCULATION_FAILED:
        return {
          canRecover: true,
          strategy: 'retry',
          maxAttempts: 2,
          delay: 50
        };

      case ScrollDirectionError.ANIMATION_SYNC_FAILED:
        return {
          canRecover: true,
          strategy: 'reset',
          maxAttempts: 3,
          delay: 100
        };

      case ScrollDirectionError.DIRECTION_CHANGE_FAILED:
        return {
          canRecover: true,
          strategy: 'retry',
          maxAttempts: 2,
          delay: 200
        };

      case ScrollDirectionError.TRANSFORM_APPLICATION_FAILED:
        return {
          canRecover: true,
          strategy: 'retry',
          maxAttempts: 2,
          delay: 16
        };

      case ScrollDirectionError.POSITION_VALIDATION_FAILED:
        return {
          canRecover: true,
          strategy: 'reset',
          maxAttempts: 1,
          delay: 0
        };

      case ScrollDirectionError.CONTAINER_NOT_FOUND:
      case ScrollDirectionError.ELEMENT_NOT_ACCESSIBLE:
        return {
          canRecover: false,
          strategy: 'ignore',
          maxAttempts: 0,
          delay: 0
        };

      default:
        return {
          canRecover: false,
          strategy: 'ignore',
          maxAttempts: 0,
          delay: 0
        };
    }
  }

  /**
   * 创建错误详情对象
   * @param code 错误代码
   * @param message 错误消息
   * @param context 错误上下文
   * @param recoverable 是否可恢复
   * @returns 错误详情
   */
  private static createError(
    code: ScrollDirectionError,
    message: string,
    context?: Record<string, any>,
    recoverable = true
  ): ErrorDetails {
    return {
      code,
      message,
      context,
      timestamp: Date.now(),
      stack: this.DEBUG_MODE ? new Error().stack : undefined,
      recoverable
    };
  }

  /**
   * 记录错误
   * @param error 错误详情
   */
  public static logError(error: ErrorDetails): void {
    // 添加到错误日志
    this.errorLog.push(error);

    // 保持日志大小在合理范围内
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-50);
    }

    // 在调试模式下输出到控制台
    if (this.DEBUG_MODE) {
      console.error(`[ScrollEngine Error] ${error.code}: ${error.message}`, {
        context: error.context,
        timestamp: new Date(error.timestamp).toISOString(),
        recoverable: error.recoverable
      });
    }
  }

  /**
   * 记录警告
   * @param message 警告消息
   * @param context 上下文信息
   */
  public static logWarning(message: string, context?: Record<string, any>): void {
    if (this.DEBUG_MODE) {
      console.warn(`[ScrollEngine Warning] ${message}`, context);
    }
  }

  /**
   * 记录调试信息
   * @param message 调试消息
   * @param context 上下文信息
   */
  public static logDebug(message: string, context?: Record<string, any>): void {
    if (this.DEBUG_MODE) {
      console.log(`[ScrollEngine Debug] ${message}`, context);
    }
  }

  /**
   * 获取错误日志
   * @param limit 返回的错误数量限制
   * @returns 错误日志数组
   */
  public static getErrorLog(limit = 10): ErrorDetails[] {
    return this.errorLog.slice(-limit);
  }

  /**
   * 清理错误日志
   */
  public static clearErrorLog(): void {
    this.errorLog.length = 0;
    this.recoveryAttempts.clear();
  }

  /**
   * 获取错误统计信息
   * @returns 错误统计
   */
  public static getErrorStats(): {
    totalErrors: number;
    errorsByType: Record<string, number>;
    recoverableErrors: number;
    activeRecoveryAttempts: number;
  } {
    const errorsByType: Record<string, number> = {};
    let recoverableErrors = 0;

    for (const error of this.errorLog) {
      errorsByType[error.code] = (errorsByType[error.code] || 0) + 1;
      if (error.recoverable) {
        recoverableErrors++;
      }
    }

    return {
      totalErrors: this.errorLog.length,
      errorsByType,
      recoverableErrors,
      activeRecoveryAttempts: this.recoveryAttempts.size
    };
  }

  /**
   * 验证容器元素
   * @param container 容器元素
   * @returns 验证结果
   */
  public static validateContainer(container: HTMLElement | null): ValidationResult {
    const errors: ErrorDetails[] = [];
    const warnings: string[] = [];

    if (!container) {
      errors.push(this.createError(
        ScrollDirectionError.CONTAINER_NOT_FOUND,
        'Container element is null or undefined',
        { container }
      ));
      return { isValid: false, errors, warnings };
    }

    if (!document.contains(container)) {
      errors.push(this.createError(
        ScrollDirectionError.CONTAINER_NOT_FOUND,
        'Container element is not attached to the DOM',
        { container: container.tagName }
      ));
      return { isValid: false, errors, warnings };
    }

    // 检查容器尺寸
    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      warnings.push('Container has zero width or height, scrolling may not work properly');
    }

    return { isValid: true, errors, warnings };
  }

  /**
   * 安全执行函数，带错误处理
   * @param fn 要执行的函数
   * @param errorCode 错误代码
   * @param context 上下文信息
   * @param fallbackValue 失败时的回退值
   * @returns 执行结果或回退值
   */
  public static safeExecute<T>(
    fn: () => T,
    errorCode: ScrollDirectionError,
    context?: Record<string, any>,
    fallbackValue?: T
  ): T | undefined {
    try {
      return fn();
    } catch (error) {
      const errorDetails = this.createError(
        errorCode,
        `Safe execution failed: ${error instanceof Error ? error.message : String(error)}`,
        { ...context, originalError: error }
      );
      this.logError(errorDetails);
      return fallbackValue;
    }
  }
}
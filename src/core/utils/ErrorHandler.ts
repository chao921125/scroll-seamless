/**
 * ErrorHandler - 错误处理器
 * 
 * 职责：
 * - 统一错误日志格式
 * - 错误分级处理
 * - 生产环境降级处理
 */

export class ErrorHandler {
  private static errorCount: number = 0;
  private static maxErrors: number = 10;

  /**
   * 记录错误
   */
  static logError(error: Error | string, context?: string): void {
    this.errorCount++;

    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'string' ? '' : error.stack;

    const prefix = context ? `[ScrollSeamless][${context}]` : '[ScrollSeamless]';
    
    console.error(`${prefix} Error (${this.errorCount}/${this.maxErrors}):`, errorMessage);
    
    if (errorStack && this.errorCount <= 3) {
      // 只显示前3次错误的堆栈
      console.error(errorStack);
    }

    // 超过最大错误数，静默处理
    if (this.errorCount >= this.maxErrors) {
      console.warn(`${prefix} Too many errors, further errors will be silent`);
    }
  }

  /**
   * 记录警告
   */
  static logWarning(message: string, context?: string): void {
    const prefix = context ? `[ScrollSeamless][${context}]` : '[ScrollSeamless]';
    console.warn(`${prefix} Warning:`, message);
  }

  /**
   * 记录信息
   */
  static logInfo(message: string, context?: string): void {
    const prefix = context ? `[ScrollSeamless][${context}]` : '[ScrollSeamless]';
    console.info(`${prefix} Info:`, message);
  }

  /**
   * 验证必填参数
   */
  static validateRequired(value: any, name: string, type?: string): void {
    if (value === undefined || value === null) {
      throw new Error(`[ScrollSeamless] Missing required parameter: ${name}`);
    }

    if (type && typeof value !== type) {
      throw new TypeError(
        `[ScrollSeamless] Invalid type for ${name}: expected ${type}, got ${typeof value}`
      );
    }
  }

  /**
   * 验证数字范围
   */
  static validateNumberRange(
    value: number,
    name: string,
    min?: number,
    max?: number
  ): void {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new TypeError(`[ScrollSeamless] ${name} must be a valid number`);
    }

    if (min !== undefined && value < min) {
      throw new RangeError(`[ScrollSeamless] ${name} must be >= ${min}`);
    }

    if (max !== undefined && value > max) {
      throw new RangeError(`[ScrollSeamless] ${name} must be <= ${max}`);
    }
  }

  /**
   * 安全执行函数，捕获异常
   */
  static safeExecute<T>(
    fn: () => T,
    fallback?: T,
    context?: string
  ): T | undefined {
    try {
      return fn();
    } catch (error) {
      this.logError(error as Error, context);
      return fallback;
    }
  }

  /**
   * 重置错误计数
   */
  static reset(): void {
    this.errorCount = 0;
  }
}

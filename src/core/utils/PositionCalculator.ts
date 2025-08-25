import { ScrollDirection } from '../../types';
import { DirectionHandler } from './DirectionHandler';
import { ErrorHandler, ScrollDirectionError } from './ErrorHandler';

/**
 * 无缝位置计算结果
 */
export interface SeamlessPositionResult {
  content1Transform: string;
  content2Transform: string;
  shouldReset: boolean;
}

/**
 * 内容尺寸缓存项
 */
interface ContentSizeCache {
  element: HTMLElement;
  size: number;
  timestamp: number;
  direction: ScrollDirection;
}

/**
 * 位置计算器类
 * 负责处理滚动位置的精确计算，确保无缝循环
 */
export class PositionCalculator {
  private static readonly CACHE_DURATION = 5000; // 缓存5秒
  private static readonly SAFETY_MARGIN = 1; // 安全边界，防止出现空白
  private static contentSizeCache = new Map<string, ContentSizeCache>();

  /**
   * 获取元素的内容尺寸（带缓存）
   * @param element 目标元素
   * @param direction 滚动方向
   * @param forceRefresh 是否强制刷新缓存
   * @returns 内容尺寸
   */
  public static getContentSize(
    element: HTMLElement,
    direction: ScrollDirection,
    forceRefresh = false
  ): number {
    // 验证输入参数
    const validation = ErrorHandler.validateContentSizeCalculation(element, direction);
    if (!validation.isValid) {
      const error = validation.errors[0];
      ErrorHandler.logError(error);
      return ErrorHandler.handleContentSizeCalculationFailure(element, direction, new Error(error.message));
    }

    // 记录警告
    validation.warnings.forEach(warning => {
      ErrorHandler.logWarning(warning, { element: element?.tagName, direction });
    });

    const cacheKey = this.generateCacheKey(element, direction);
    const now = Date.now();
    
    // 检查缓存
    if (!forceRefresh) {
      const cached = this.contentSizeCache.get(cacheKey);
      if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
        ErrorHandler.logDebug('Using cached content size', {
          element: element.tagName,
          direction,
          size: cached.size,
          cacheAge: now - cached.timestamp
        });
        return cached.size;
      }
    }

    try {
      // 计算实际尺寸
      const size = this.calculateActualContentSize(element, direction);
      
      // 更新缓存
      this.contentSizeCache.set(cacheKey, {
        element,
        size,
        timestamp: now,
        direction
      });

      ErrorHandler.logDebug('Content size calculated and cached', {
        element: element.tagName,
        direction,
        size,
        forceRefresh
      });

      return size;
    } catch (error) {
      return ErrorHandler.handleContentSizeCalculationFailure(
        element,
        direction,
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * 计算实际内容尺寸
   * @param element 目标元素
   * @param direction 滚动方向
   * @returns 实际内容尺寸
   */
  private static calculateActualContentSize(
    element: HTMLElement,
    direction: ScrollDirection
  ): number {
    return ErrorHandler.safeExecute(
      () => {
        const config = DirectionHandler.getDirectionConfig(direction);
        
        // 确保元素可见以获取准确尺寸
        const originalDisplay = element.style.display;
        const originalVisibility = element.style.visibility;
        
        if (originalDisplay === 'none') {
          element.style.display = 'block';
          element.style.visibility = 'hidden';
        }

        let size: number;
        
        if (config.isHorizontal) {
          // 水平方向：使用 scrollWidth，但需要考虑子元素的实际宽度
          size = Math.max(
            element.scrollWidth,
            element.offsetWidth,
            this.calculateChildrenTotalWidth(element)
          );
        } else {
          // 垂直方向：使用 scrollHeight，但需要考虑子元素的实际高度
          size = Math.max(
            element.scrollHeight,
            element.offsetHeight,
            this.calculateChildrenTotalHeight(element)
          );
        }

        // 恢复原始样式
        if (originalDisplay === 'none') {
          element.style.display = originalDisplay;
          element.style.visibility = originalVisibility;
        }

        // 验证计算结果
        if (size <= 0) {
          throw new Error(`Invalid content size calculated: ${size}`);
        }

        // 确保返回有效的尺寸值，添加安全边界
        return Math.max(size + this.SAFETY_MARGIN, 1);
      },
      ScrollDirectionError.CONTENT_SIZE_CALCULATION_FAILED,
      { element: element.tagName, direction },
      // 返回基于方向的默认值
      direction === 'left' || direction === 'right' ? 100 : 50
    ) || (direction === 'left' || direction === 'right' ? 100 : 50);
  }

  /**
   * 计算子元素总宽度
   * @param element 父元素
   * @returns 子元素总宽度
   */
  private static calculateChildrenTotalWidth(element: HTMLElement): number {
    let totalWidth = 0;
    const children = Array.from(element.children) as HTMLElement[];
    
    for (const child of children) {
      const rect = child.getBoundingClientRect();
      const marginLeft = parseFloat(getComputedStyle(child).marginLeft) || 0;
      const marginRight = parseFloat(getComputedStyle(child).marginRight) || 0;
      totalWidth += rect.width + marginLeft + marginRight;
    }
    
    return totalWidth;
  }

  /**
   * 计算子元素总高度
   * @param element 父元素
   * @returns 子元素总高度
   */
  private static calculateChildrenTotalHeight(element: HTMLElement): number {
    let totalHeight = 0;
    const children = Array.from(element.children) as HTMLElement[];
    
    for (const child of children) {
      const rect = child.getBoundingClientRect();
      const marginTop = parseFloat(getComputedStyle(child).marginTop) || 0;
      const marginBottom = parseFloat(getComputedStyle(child).marginBottom) || 0;
      totalHeight += rect.height + marginTop + marginBottom;
    }
    
    return totalHeight;
  }

  /**
   * 计算无缝位置
   * @param position 当前位置
   * @param contentSize 内容尺寸
   * @param containerSize 容器尺寸
   * @param direction 滚动方向
   * @returns 无缝位置计算结果
   */
  public static calculateSeamlessPosition(
    position: number,
    contentSize: number,
    containerSize: number,
    direction: ScrollDirection
  ): SeamlessPositionResult {
    const config = DirectionHandler.getDirectionConfig(direction);
    
    // 确保内容尺寸有效
    if (contentSize <= 0) {
      console.warn('Invalid content size:', contentSize);
      contentSize = containerSize || 100;
    }

    let content1Transform: string;
    let content2Transform: string;
    let shouldReset = false;

    if (config.isReverse) {
      // down 和 right 方向的处理
      content1Transform = `${config.transformProperty}(${position}px)`;
      content2Transform = `${config.transformProperty}(${position}px)`;
      
      // 检查是否需要重置位置
      if (position <= -contentSize) {
        shouldReset = true;
      }
    } else {
      // up 和 left 方向的处理
      content1Transform = `${config.transformProperty}(${-position}px)`;
      content2Transform = `${config.transformProperty}(${-position}px)`;
      
      // 检查是否需要重置位置
      if (position >= contentSize) {
        shouldReset = true;
      }
    }

    return {
      content1Transform,
      content2Transform,
      shouldReset
    };
  }

  /**
   * 修复 up 方向的位置计算
   * 确保向上滚动时内容正确定位，避免空白
   * @param content1 第一个内容元素
   * @param content2 第二个内容元素
   * @param contentSize 内容尺寸
   */
  public static fixUpDirectionPositioning(
    content1: HTMLElement,
    content2: HTMLElement,
    contentSize: number
  ): void {
    // up 方向特殊处理：第二个内容元素应该位于第一个内容元素的上方
    content1.style.top = '0px';
    content2.style.top = `${-contentSize}px`;
    
    // 确保初始变换为0
    content1.style.transform = 'translateY(0px)';
    content2.style.transform = 'translateY(0px)';
  }

  /**
   * 计算循环重置位置
   * @param currentPosition 当前位置
   * @param contentSize 内容尺寸
   * @param direction 滚动方向
   * @returns 重置后的位置
   */
  public static calculateResetPosition(
    currentPosition: number,
    contentSize: number,
    direction: ScrollDirection
  ): number {
    const config = DirectionHandler.getDirectionConfig(direction);
    
    if (config.isReverse) {
      // down 和 right 方向：当位置小于等于负内容尺寸时，重置为0
      if (currentPosition <= -contentSize) {
        return 0;
      }
    } else {
      // up 和 left 方向：当位置大于等于内容尺寸时，重置为0
      if (currentPosition >= contentSize) {
        return 0;
      }
    }
    
    return currentPosition;
  }

  /**
   * 验证位置计算的准确性 - 放宽验证以实现更流畅的滚动
   * @param position 位置值
   * @param contentSize 内容尺寸
   * @param containerSize 容器尺寸
   * @param direction 滚动方向
   * @param options 验证选项
   * @returns 验证结果
   */
  public static validatePositionCalculation(
    position: number,
    contentSize: number,
    containerSize: number,
    direction: ScrollDirection,
    options: { strict?: boolean; allowLargeRange?: boolean } = {}
  ): { isValid: boolean; issues: string[]; warnings?: string[] } {
    const issues: string[] = [];
    const warnings: string[] = [];
    const { strict = false, allowLargeRange = true } = options;
    
    ErrorHandler.logDebug('Validating position calculation', {
      position,
      contentSize,
      containerSize,
      direction,
      strict,
      allowLargeRange
    });
    
    // 检查基本参数 - 只在严格模式下报错，否则只警告
    if (contentSize <= 0) {
      const message = 'Content size must be greater than 0';
      if (strict) {
        issues.push(message);
      } else {
        warnings.push(message);
      }
    }
    
    if (containerSize <= 0) {
      const message = 'Container size must be greater than 0';
      if (strict) {
        issues.push(message);
      } else {
        warnings.push(message);
      }
    }
    
    // 验证方向
    if (!DirectionHandler.isValidDirection(direction)) {
      issues.push(`Invalid direction: ${direction}`);
      return {
        isValid: false,
        issues,
        warnings
      };
    }
    
    try {
      const config = DirectionHandler.getDirectionConfig(direction);
      
      // 极大放宽位置验证范围，优先保证滚动流畅性
      let maxAllowedRange: number;
      
      if (allowLargeRange) {
        // 允许非常大的范围，适应各种滚动场景
        maxAllowedRange = Math.max(contentSize * 10, containerSize * 5, 1000);
      } else {
        // 相对保守的范围
        maxAllowedRange = contentSize * 3;
      }
      
      // 检查是否超出极限范围
      const isOutOfRange = Math.abs(position) > maxAllowedRange;
      
      if (isOutOfRange) {
        const message = `Position ${position} is beyond reasonable range for ${direction} direction (max: ±${maxAllowedRange})`;
        
        if (strict) {
          issues.push(message);
        } else {
          // 在非严格模式下，只有极端情况才报错
          const extremeRange = maxAllowedRange * 5; // 更宽松的极限范围
          if (Math.abs(position) > extremeRange) {
            issues.push(`Position ${position} is extremely out of range (max: ±${extremeRange})`);
          } else {
            warnings.push(message);
          }
        }
      }
      
      // 检查位置是否可能导致性能问题
      this.checkPositionPerformanceImpact(position, contentSize, warnings);
      
    } catch (error) {
      const message = `Failed to validate direction: ${error instanceof Error ? error.message : String(error)}`;
      if (strict) {
        issues.push(message);
      } else {
        warnings.push(message);
      }
    }
    
    const result = {
      isValid: issues.length === 0,
      issues,
      warnings: warnings.length > 0 ? warnings : undefined
    };
    
    ErrorHandler.logDebug('Position validation result', {
      isValid: result.isValid,
      issuesCount: issues.length,
      warningsCount: warnings.length,
      position,
      direction
    });
    
    return result;
  }

  /**
   * 检查位置是否可能影响性能
   * @param position 位置值
   * @param contentSize 内容尺寸
   * @param warnings 警告数组
   */
  private static checkPositionPerformanceImpact(
    position: number,
    contentSize: number,
    warnings: string[]
  ): void {
    // 检查是否有可能影响渲染性能的极大位置值
    const performanceThreshold = 10000; // 10000px 作为性能阈值
    
    if (Math.abs(position) > performanceThreshold) {
      warnings.push(`Large position value (${position}) may impact rendering performance`);
    }
    
    // 检查位置与内容尺寸的比例
    if (contentSize > 0) {
      const ratio = Math.abs(position) / contentSize;
      if (ratio > 50) { // 位置超过内容尺寸50倍
        warnings.push(`Position to content size ratio is very high (${ratio.toFixed(1)}:1)`);
      }
    }
  }

  /**
   * 快速位置验证 - 用于动画循环中的高频验证
   * @param position 位置值
   * @param contentSize 内容尺寸
   * @param direction 滚动方向
   * @returns 是否有效
   */
  public static quickValidatePosition(
    position: number,
    contentSize: number,
    direction: ScrollDirection
  ): boolean {
    try {
      // 只检查最基本的有效性，避免复杂计算
      if (!isFinite(position) || isNaN(position)) {
        return false;
      }
      
      // 允许非常大的范围，只排除明显错误的值
      const extremeLimit = 200000; // 200000px 作为极限，更宽松
      if (Math.abs(position) > extremeLimit) {
        return false;
      }
      
      return true;
      
    } catch {
      return false;
    }
  }

  /**
   * 修正无效位置到安全范围
   * @param position 位置值
   * @param contentSize 内容尺寸
   * @param direction 滚动方向
   * @returns 修正后的位置
   */
  public static correctInvalidPosition(
    position: number,
    contentSize: number,
    direction: ScrollDirection
  ): number {
    try {
      // 处理 NaN 和无穷大
      if (!isFinite(position) || isNaN(position)) {
        ErrorHandler.logWarning('Invalid position detected, resetting to 0', { position, direction });
        return 0;
      }
      
      // 处理极大值
      const extremeLimit = 50000;
      if (Math.abs(position) > extremeLimit) {
        const correctedPosition = Math.sign(position) * extremeLimit;
        ErrorHandler.logWarning('Position exceeds extreme limit, correcting', {
          originalPosition: position,
          correctedPosition,
          direction
        });
        return correctedPosition;
      }
      
      return position;
      
    } catch (error) {
      const errorDetails = {
        code: ScrollDirectionError.POSITION_VALIDATION_FAILED,
        message: 'Failed to correct invalid position',
        context: {
          error: error instanceof Error ? error.message : String(error),
          position,
          direction
        },
        timestamp: Date.now(),
        recoverable: true
      };
      ErrorHandler.logError(errorDetails);
      return 0; // 安全默认值
    }
  }

  /**
   * 批量验证位置数组
   * @param positions 位置数组
   * @param contentSize 内容尺寸
   * @param direction 滚动方向
   * @returns 验证结果
   */
  public static batchValidatePositions(
    positions: number[],
    contentSize: number,
    direction: ScrollDirection
  ): { validPositions: number[]; invalidCount: number; correctedPositions: number[] } {
    const validPositions: number[] = [];
    const correctedPositions: number[] = [];
    let invalidCount = 0;
    
    for (const position of positions) {
      if (this.quickValidatePosition(position, contentSize, direction)) {
        validPositions.push(position);
        correctedPositions.push(position);
      } else {
        invalidCount++;
        const corrected = this.correctInvalidPosition(position, contentSize, direction);
        correctedPositions.push(corrected);
      }
    }
    
    return {
      validPositions,
      invalidCount,
      correctedPositions
    };
  }

  /**
   * 清理内容尺寸缓存
   * @param element 可选的特定元素，如果不提供则清理所有缓存
   */
  public static clearContentSizeCache(element?: HTMLElement): void {
    if (element) {
      // 清理特定元素的缓存
      const keysToDelete: string[] = [];
      for (const [key, cache] of this.contentSizeCache.entries()) {
        if (cache.element === element) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach(key => this.contentSizeCache.delete(key));
    } else {
      // 清理所有缓存
      this.contentSizeCache.clear();
    }
  }

  /**
   * 清理过期的缓存项
   */
  public static cleanupExpiredCache(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    for (const [key, cache] of this.contentSizeCache.entries()) {
      if ((now - cache.timestamp) >= this.CACHE_DURATION) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.contentSizeCache.delete(key));
  }

  /**
   * 生成缓存键
   * @param element 元素
   * @param direction 方向
   * @returns 缓存键
   */
  private static generateCacheKey(element: HTMLElement, direction: ScrollDirection): string {
    // 使用元素的唯一标识和方向生成缓存键
    const elementId = element.id || element.className || 'anonymous';
    const elementHash = this.hashElement(element);
    return `${elementId}_${direction}_${elementHash}`;
  }

  /**
   * 生成元素哈希值
   * @param element 元素
   * @returns 哈希值
   */
  private static hashElement(element: HTMLElement): string {
    // 简单的哈希函数，基于元素的一些属性
    const str = `${element.tagName}_${element.innerHTML.length}_${element.children.length}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * 处理方向切换时的位置重新计算
   * @param content1 第一个内容元素
   * @param content2 第二个内容元素
   * @param oldDirection 旧方向
   * @param newDirection 新方向
   * @param currentPosition 当前位置
   * @returns 新的位置值
   */
  public static handleDirectionChange(
    content1: HTMLElement,
    content2: HTMLElement,
    oldDirection: ScrollDirection,
    newDirection: ScrollDirection,
    currentPosition: number
  ): number {
    // 清理旧方向的样式
    this.clearDirectionStyles(content1, oldDirection);
    this.clearDirectionStyles(content2, oldDirection);
    
    // 获取内容尺寸
    const contentSize = this.getContentSize(content1, newDirection, true);
    
    // 计算新方向的初始位置
    const initialPositions = DirectionHandler.calculateInitialPosition(contentSize, newDirection);
    
    // 设置新方向的初始位置
    DirectionHandler.setInitialPosition(content1, initialPositions.content1Position, newDirection);
    DirectionHandler.setInitialPosition(content2, initialPositions.content2Position, newDirection);
    
    // 应用特殊方向的修复
    if (newDirection === 'up') {
      this.fixUpDirectionPositioning(content1, content2, contentSize);
    } else if (newDirection === 'right') {
      content2.style.left = `${contentSize}px`;
    } else if (newDirection === 'down') {
      content2.style.top = `${contentSize}px`;
    }
    
    // 重置变换
    DirectionHandler.applyTransform(content1, 0, newDirection);
    DirectionHandler.applyTransform(content2, 0, newDirection);
    
    // 返回重置后的位置
    return 0;
  }

  /**
   * 清理方向相关的样式
   * @param element 目标元素
   * @param direction 方向
   */
  public static clearDirectionStyles(element: HTMLElement, direction: ScrollDirection): void {
    const config = DirectionHandler.getDirectionConfig(direction);
    
    // 清理位置属性
    element.style[config.positionProperty] = '';
    
    // 清理变换
    element.style.transform = '';
  }

  /**
   * 验证并修复初始定位 - 修复空白区域问题
   * @param content1 第一个内容元素
   * @param content2 第二个内容元素
   * @param contentSize 内容尺寸
   * @param direction 滚动方向
   */
  public static validateAndFixInitialPositioning(
    content1: HTMLElement,
    content2: HTMLElement,
    contentSize: number,
    direction: ScrollDirection
  ): void {
    const config = DirectionHandler.getDirectionConfig(direction);
    const initialPositions = DirectionHandler.calculateInitialPosition(contentSize, direction);
    
    // 始终设置初始位置，不管当前值是什么
    DirectionHandler.setInitialPosition(content1, initialPositions.content1Position, direction);
    DirectionHandler.setInitialPosition(content2, initialPositions.content2Position, direction);
    
    // 应用特殊方向的修复以避免空白区域
    if (direction === 'up') {
      this.fixUpDirectionPositioning(content1, content2, contentSize);
    } else if (direction === 'right') {
      // right 方向：第二个内容元素在正方向
      content2.style.left = `${contentSize}px`;
    } else if (direction === 'down') {
      // down 方向：第二个内容元素在正方向
      content2.style.top = `${contentSize}px`;
    } else if (direction === 'left') {
      // left 方向：第二个内容在正方向
      content2.style.left = `${contentSize}px`;
    }
  }

  /**
   * 实现内容预填充机制，避免滚动开始时的空白
   * @param content1 第一个内容元素
   * @param content2 第二个内容元素
   * @param containerSize 容器尺寸
   * @param direction 滚动方向
   * @returns 预填充结果
   */
  public static implementContentPreFilling(
    content1: HTMLElement,
    content2: HTMLElement,
    containerSize: number,
    direction: ScrollDirection
  ): { success: boolean; adjustedPositions?: { content1: number; content2: number }; contentSize: number } {
    try {
      const contentSize = this.getContentSize(content1, direction, true);
      const config = DirectionHandler.getDirectionConfig(direction);
      
      ErrorHandler.logDebug('Content pre-filling started', {
        contentSize,
        containerSize,
        direction,
        isHorizontal: config.isHorizontal
      });
      
      // 处理内容尺寸小于容器尺寸的情况
      if (contentSize < containerSize) {
        ErrorHandler.logWarning('Content size is smaller than container size, applying pre-filling strategy', {
          contentSize,
          containerSize,
          direction
        });
        
        return this.handleSmallContentPreFilling(content1, content2, contentSize, containerSize, direction);
      }
      
      // 内容尺寸足够，应用标准预填充策略
      return this.applyStandardPreFilling(content1, content2, contentSize, direction);
      
    } catch (error) {
      const errorDetails = {
        code: ScrollDirectionError.CONTENT_SIZE_CALCULATION_FAILED,
        message: 'Content pre-filling failed',
        context: {
          error: error instanceof Error ? error.message : String(error),
          direction,
          containerSize
        },
        timestamp: Date.now(),
        recoverable: true
      };
      ErrorHandler.logError(errorDetails);
      return { success: false, contentSize: 0 };
    }
  }

  /**
   * 处理小内容的预填充策略
   * @param content1 第一个内容元素
   * @param content2 第二个内容元素
   * @param contentSize 内容尺寸
   * @param containerSize 容器尺寸
   * @param direction 滚动方向
   * @returns 预填充结果
   */
  private static handleSmallContentPreFilling(
    content1: HTMLElement,
    content2: HTMLElement,
    contentSize: number,
    containerSize: number,
    direction: ScrollDirection
  ): { success: boolean; adjustedPositions: { content1: number; content2: number }; contentSize: number } {
    const config = DirectionHandler.getDirectionConfig(direction);
    let content1Position = 0;
    let content2Position: number;
    
    // 计算需要多少个内容副本来填满容器
    const copiesNeeded = Math.ceil(containerSize / contentSize);
    const effectiveContentSize = contentSize * copiesNeeded;
    
    ErrorHandler.logDebug('Small content pre-filling calculation', {
      contentSize,
      containerSize,
      copiesNeeded,
      effectiveContentSize,
      direction
    });
    
    // 根据方向设置第二个内容的位置
    if (direction === 'up') {
      // up 方向：第二个内容在第一个内容上方
      content2Position = -contentSize;
    } else if (direction === 'down') {
      // down 方向：第二个内容在第一个内容下方
      content2Position = contentSize;
    } else if (direction === 'left') {
      // left 方向：第二个内容在第一个内容右方
      content2Position = contentSize;
    } else if (direction === 'right') {
      // right 方向：第二个内容在第一个内容左方
      content2Position = -contentSize;
    } else {
      content2Position = contentSize;
    }
    
    // 应用位置设置
    DirectionHandler.setInitialPosition(content1, content1Position, direction);
    DirectionHandler.setInitialPosition(content2, content2Position, direction);
    
    // 确保变换初始化为0
    DirectionHandler.applyTransform(content1, 0, direction);
    DirectionHandler.applyTransform(content2, 0, direction);
    
    ErrorHandler.logDebug('Small content positions applied', {
      content1Position,
      content2Position,
      direction
    });
    
    return {
      success: true,
      adjustedPositions: {
        content1: content1Position,
        content2: content2Position
      },
      contentSize: effectiveContentSize
    };
  }

  /**
   * 应用标准预填充策略
   * @param content1 第一个内容元素
   * @param content2 第二个内容元素
   * @param contentSize 内容尺寸
   * @param direction 滚动方向
   * @returns 预填充结果
   */
  private static applyStandardPreFilling(
    content1: HTMLElement,
    content2: HTMLElement,
    contentSize: number,
    direction: ScrollDirection
  ): { success: boolean; contentSize: number } {
    // 使用现有的初始定位逻辑，但确保没有空白区域
    this.validateAndFixInitialPositioning(content1, content2, contentSize, direction);
    
    // 确保变换初始化为0，防止初始空白
    DirectionHandler.applyTransform(content1, 0, direction);
    DirectionHandler.applyTransform(content2, 0, direction);
    
    ErrorHandler.logDebug('Standard pre-filling applied', {
      contentSize,
      direction
    });
    
    return {
      success: true,
      contentSize
    };
  }

  /**
   * 添加空白检测和自动修复机制
   * @param content1 第一个内容元素
   * @param content2 第二个内容元素
   * @param containerElement 容器元素
   * @param direction 滚动方向
   * @param currentPosition 当前滚动位置（可选）
   * @returns 检测和修复结果
   */
  public static detectAndFixBlankAreas(
    content1: HTMLElement,
    content2: HTMLElement,
    containerElement: HTMLElement,
    direction: ScrollDirection,
    currentPosition?: number
  ): { hasBlankAreas: boolean; fixedAreas?: string[]; errors?: string[] } {
    const fixedAreas: string[] = [];
    const errors: string[] = [];
    
    try {
      ErrorHandler.logDebug('Starting blank area detection', {
        direction,
        currentPosition,
        content1Id: content1.id || 'content1',
        content2Id: content2.id || 'content2'
      });

      const config = DirectionHandler.getDirectionConfig(direction);
      const containerRect = containerElement.getBoundingClientRect();
      const containerSize = config.isHorizontal ? 
        containerRect.width : 
        containerRect.height;
      const contentSize = this.getContentSize(content1, direction, true);
      
      // 验证基本参数
      if (containerSize <= 0) {
        errors.push('Invalid container size');
        return { hasBlankAreas: false, errors };
      }
      
      if (contentSize <= 0) {
        errors.push('Invalid content size');
        return { hasBlankAreas: false, errors };
      }
      
      // 检测空白区域
      let hasBlankAreas = false;
      
      // 获取当前位置信息
      const content1Rect = content1.getBoundingClientRect();
      const content2Rect = content2.getBoundingClientRect();
      
      ErrorHandler.logDebug('Element positions', {
        content1Rect: { left: content1Rect.left, top: content1Rect.top, right: content1Rect.right, bottom: content1Rect.bottom },
        content2Rect: { left: content2Rect.left, top: content2Rect.top, right: content2Rect.right, bottom: content2Rect.bottom },
        containerRect: { left: containerRect.left, top: containerRect.top, right: containerRect.right, bottom: containerRect.bottom }
      });

      // 根据方向检测特定的空白区域
      const detectionResult = this.detectDirectionSpecificBlanks(
        content1Rect, content2Rect, containerRect, containerSize, direction
      );
      
      if (detectionResult.hasBlank && detectionResult.blankType) {
        hasBlankAreas = true;
        
        // 应用修复
        const fixResult = this.applyBlankAreaFix(
          content1, content2, contentSize, direction, detectionResult.blankType
        );
        
        if (fixResult.success) {
          fixedAreas.push(...fixResult.fixedAreas);
          ErrorHandler.logDebug('Blank area fixed successfully', {
            direction,
            blankType: detectionResult.blankType,
            fixedAreas: fixResult.fixedAreas
          });
        } else {
          errors.push(`Failed to fix ${detectionResult.blankType}: ${fixResult.error}`);
        }
      }
      
      return {
        hasBlankAreas,
        fixedAreas: fixedAreas.length > 0 ? fixedAreas : undefined,
        errors: errors.length > 0 ? errors : undefined
      };
      
    } catch (error) {
      const errorMessage = `Blank area detection failed: ${error instanceof Error ? error.message : String(error)}`;
      const errorDetails = {
        code: ScrollDirectionError.POSITION_VALIDATION_FAILED,
        message: errorMessage,
        context: { direction, currentPosition },
        timestamp: Date.now(),
        recoverable: true
      };
      ErrorHandler.logError(errorDetails);
      errors.push(errorMessage);
      return {
        hasBlankAreas: false,
        errors
      };
    }
  }

  /**
   * 检测特定方向的空白区域
   * @param content1Rect 第一个内容元素的位置信息
   * @param content2Rect 第二个内容元素的位置信息
   * @param containerRect 容器元素的位置信息
   * @param containerSize 容器尺寸
   * @param direction 滚动方向
   * @returns 检测结果
   */
  private static detectDirectionSpecificBlanks(
    content1Rect: DOMRect,
    content2Rect: DOMRect,
    containerRect: DOMRect,
    containerSize: number,
    direction: ScrollDirection
  ): { hasBlank: boolean; blankType?: string } {
    const TOLERANCE = 2; // 允许2px的误差
    
    switch (direction) {
      case 'right':
        // 检测右方向左侧空白
        const leftmostPosition = Math.min(
          content1Rect.left - containerRect.left,
          content2Rect.left - containerRect.left
        );
        
        if (leftmostPosition > TOLERANCE) {
          return { hasBlank: true, blankType: 'right-direction-left-blank' };
        }
        break;
        
      case 'down':
        // 检测下方向上侧空白
        const topmostPosition = Math.min(
          content1Rect.top - containerRect.top,
          content2Rect.top - containerRect.top
        );
        
        if (topmostPosition > TOLERANCE) {
          return { hasBlank: true, blankType: 'down-direction-top-blank' };
        }
        break;
        
      case 'left':
        // 检测左方向右侧空白
        const rightmostPosition = Math.max(
          content1Rect.right - containerRect.left,
          content2Rect.right - containerRect.left
        );
        
        if (rightmostPosition < (containerSize - TOLERANCE)) {
          return { hasBlank: true, blankType: 'left-direction-right-blank' };
        }
        break;
        
      case 'up':
        // 检测上方向下侧空白
        const bottommostPosition = Math.max(
          content1Rect.bottom - containerRect.top,
          content2Rect.bottom - containerRect.top
        );
        
        if (bottommostPosition < (containerSize - TOLERANCE)) {
          return { hasBlank: true, blankType: 'up-direction-bottom-blank' };
        }
        break;
    }
    
    return { hasBlank: false };
  }

  /**
   * 应用空白区域修复
   * @param content1 第一个内容元素
   * @param content2 第二个内容元素
   * @param contentSize 内容尺寸
   * @param direction 滚动方向
   * @param blankType 空白类型
   * @returns 修复结果
   */
  private static applyBlankAreaFix(
    content1: HTMLElement,
    content2: HTMLElement,
    contentSize: number,
    direction: ScrollDirection,
    blankType: string
  ): { success: boolean; fixedAreas: string[]; error?: string } {
    try {
      const fixedAreas: string[] = [];
      
      switch (blankType) {
        case 'right-direction-left-blank':
          // 修复右方向左侧空白：调整 content2 位置到左侧
          DirectionHandler.setInitialPosition(content2, -contentSize, direction);
          fixedAreas.push(blankType);
          break;
          
        case 'down-direction-top-blank':
          // 修复下方向上侧空白：调整 content2 位置到上方
          DirectionHandler.setInitialPosition(content2, -contentSize, direction);
          fixedAreas.push(blankType);
          break;
          
        case 'left-direction-right-blank':
          // 修复左方向右侧空白：确保 content2 在右侧正确位置
          DirectionHandler.setInitialPosition(content2, contentSize, direction);
          fixedAreas.push(blankType);
          break;
          
        case 'up-direction-bottom-blank':
          // 修复上方向下侧空白：确保 content2 在上方正确位置
          DirectionHandler.setInitialPosition(content2, -contentSize, direction);
          fixedAreas.push(blankType);
          break;
          
        default:
          return { success: false, fixedAreas: [], error: `Unknown blank type: ${blankType}` };
      }
      
      return { success: true, fixedAreas };
      
    } catch (error) {
      return {
        success: false,
        fixedAreas: [],
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 运行时空白区域监控
   * @param content1 第一个内容元素
   * @param content2 第二个内容元素
   * @param containerElement 容器元素
   * @param direction 滚动方向
   * @param currentPosition 当前位置
   * @returns 监控结果
   */
  public static monitorRuntimeBlankAreas(
    content1: HTMLElement,
    content2: HTMLElement,
    containerElement: HTMLElement,
    direction: ScrollDirection,
    currentPosition: number
  ): { needsFix: boolean; fixApplied?: boolean; errors?: string[] } {
    try {
      // 只在特定位置检查，避免过度检测
      const contentSize = this.getContentSize(content1, direction);
      const shouldCheck = this.shouldCheckForBlanks(currentPosition, contentSize, direction);
      
      if (!shouldCheck) {
        return { needsFix: false };
      }
      
      const result = this.detectAndFixBlankAreas(
        content1, content2, containerElement, direction, currentPosition
      );
      
      return {
        needsFix: result.hasBlankAreas,
        fixApplied: result.fixedAreas && result.fixedAreas.length > 0,
        errors: result.errors
      };
      
    } catch (error) {
      return {
        needsFix: false,
        errors: [`Runtime monitoring failed: ${error instanceof Error ? error.message : String(error)}`]
      };
    }
  }

  /**
   * 判断是否应该检查空白区域
   * @param currentPosition 当前位置
   * @param contentSize 内容尺寸
   * @param direction 滚动方向
   * @returns 是否应该检查
   */
  private static shouldCheckForBlanks(
    currentPosition: number,
    contentSize: number,
    direction: ScrollDirection
  ): boolean {
    const config = DirectionHandler.getDirectionConfig(direction);
    const checkThreshold = contentSize * 0.1; // 在内容尺寸的10%范围内检查
    
    if (config.isReverse) {
      // down 和 right 方向：在接近重置点时检查
      return Math.abs(currentPosition + contentSize) < checkThreshold || Math.abs(currentPosition) < checkThreshold;
    } else {
      // up 和 left 方向：在接近重置点时检查
      return Math.abs(currentPosition - contentSize) < checkThreshold || Math.abs(currentPosition) < checkThreshold;
    }
  }

  /**
   * 优化内容循环衔接逻辑，确保无缝连接
   * @param position 当前位置
   * @param contentSize 内容尺寸
   * @param containerSize 容器尺寸
   * @param direction 滚动方向
   * @returns 优化后的位置计算结果
   */
  public static optimizeSeamlessConnection(
    position: number,
    contentSize: number,
    containerSize: number,
    direction: ScrollDirection
  ): SeamlessPositionResult {
    try {
      let config;
      try {
        config = DirectionHandler.getDirectionConfig(direction);
      } catch (error) {
        const errorDetails = {
          code: ScrollDirectionError.DIRECTION_CHANGE_FAILED,
          message: 'Failed to get direction config',
          context: {
            error: error instanceof Error ? error.message : String(error),
            direction
          },
          timestamp: Date.now(),
          recoverable: true
        };
        ErrorHandler.logError(errorDetails);
        // Return safe defaults
        return {
          content1Transform: 'translateX(0px)',
          content2Transform: 'translateX(100px)',
          shouldReset: false
        };
      }
      
      // 确保内容尺寸有效
      if (contentSize <= 0) {
        ErrorHandler.logWarning('Invalid content size in seamless connection', { contentSize, direction });
        contentSize = Math.max(containerSize, 100);
      }

      ErrorHandler.logDebug('Optimizing seamless connection', {
        position,
        contentSize,
        containerSize,
        direction,
        isReverse: config.isReverse
      });

      let content1Transform: string;
      let content2Transform: string;
      let shouldReset = false;

      // 使用优化的位置计算逻辑，确保内容元素之间无缝连接
      const optimizedPositions = this.calculateOptimizedPositions(
        position, contentSize, direction, config
      );

      content1Transform = `${config.transformProperty}(${optimizedPositions.content1Position}px)`;
      content2Transform = `${config.transformProperty}(${optimizedPositions.content2Position}px)`;
      shouldReset = optimizedPositions.shouldReset;

      ErrorHandler.logDebug('Seamless connection calculated', {
        content1Transform,
        content2Transform,
        shouldReset,
        direction
      });

      return {
        content1Transform,
        content2Transform,
        shouldReset
      };
      
    } catch (error) {
      const errorDetails = {
        code: ScrollDirectionError.POSITION_VALIDATION_FAILED,
        message: 'Failed to optimize seamless connection',
        context: {
          error: error instanceof Error ? error.message : String(error),
          position,
          contentSize,
          direction
        },
        timestamp: Date.now(),
        recoverable: true
      };
      ErrorHandler.logError(errorDetails);
      
      // 返回安全的默认值
      const config = DirectionHandler.getDirectionConfig(direction);
      return {
        content1Transform: `${config.transformProperty}(0px)`,
        content2Transform: `${config.transformProperty}(${contentSize}px)`,
        shouldReset: false
      };
    }
  }

  /**
   * 计算优化的位置，确保内容元素无缝连接
   * @param position 当前位置
   * @param contentSize 内容尺寸
   * @param direction 滚动方向
   * @param config 方向配置
   * @returns 优化的位置信息
   */
  private static calculateOptimizedPositions(
    position: number,
    contentSize: number,
    direction: ScrollDirection,
    config: any
  ): { content1Position: number; content2Position: number; shouldReset: boolean } {
    let content1Position: number;
    let content2Position: number;
    let shouldReset = false;

    if (config.isReverse) {
      // down 和 right 方向的优化处理
      if (direction === 'right') {
        // right 方向：确保内容从右向左无缝滚动
        content1Position = -position;
        content2Position = -position + contentSize;
        
        // 当第一个内容完全移出视野时重置
        if (position >= contentSize) {
          shouldReset = true;
        }
      } else if (direction === 'down') {
        // down 方向：确保内容从下向上无缝滚动
        content1Position = -position;
        content2Position = -position + contentSize;
        
        // 当第一个内容完全移出视野时重置
        if (position >= contentSize) {
          shouldReset = true;
        }
      } else {
        // 其他反向方向的默认处理
        content1Position = -position;
        content2Position = -position + contentSize;
        
        if (position >= contentSize) {
          shouldReset = true;
        }
      }
    } else {
      // up 和 left 方向的优化处理
      if (direction === 'up') {
        // up 方向：确保内容从下向上无缝滚动，第二个内容在上方
        content1Position = -position;
        content2Position = -position + contentSize;
        
        // 当第一个内容完全移出视野时重置
        if (position >= contentSize) {
          shouldReset = true;
        }
      } else if (direction === 'left') {
        // left 方向：确保内容从右向左无缝滚动，第二个内容在右方
        content1Position = -position;
        content2Position = -position + contentSize;
        
        // 当第一个内容完全移出视野时重置
        if (position >= contentSize) {
          shouldReset = true;
        }
      } else {
        // 其他正向方向的默认处理
        content1Position = -position;
        content2Position = -position + contentSize;
        
        if (position >= contentSize) {
          shouldReset = true;
        }
      }
    }

    return {
      content1Position,
      content2Position,
      shouldReset
    };
  }

  /**
   * 验证无缝连接的正确性
   * @param content1Transform 第一个内容的变换
   * @param content2Transform 第二个内容的变换
   * @param contentSize 内容尺寸
   * @param direction 滚动方向
   * @returns 验证结果
   */
  public static validateSeamlessConnection(
    content1Transform: string,
    content2Transform: string,
    contentSize: number,
    direction: ScrollDirection
  ): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    try {
      // 提取变换值
      const content1Value = this.extractTransformValue(content1Transform);
      const content2Value = this.extractTransformValue(content2Transform);
      
      if (content1Value === null || content2Value === null) {
        issues.push('Failed to extract transform values');
        return { isValid: false, issues };
      }
      
      // 验证两个内容之间的距离是否等于内容尺寸
      const distance = Math.abs(content2Value - content1Value);
      const expectedDistance = contentSize;
      const tolerance = 1; // 允许1px的误差
      
      if (Math.abs(distance - expectedDistance) > tolerance) {
        issues.push(`Content distance mismatch: expected ${expectedDistance}, got ${distance}`);
      }
      
      // 验证变换方向是否正确
      const config = DirectionHandler.getDirectionConfig(direction);
      const expectedProperty = config.transformProperty;
      
      if (!content1Transform.includes(expectedProperty) || !content2Transform.includes(expectedProperty)) {
        issues.push(`Transform property mismatch: expected ${expectedProperty}`);
      }
      
      return {
        isValid: issues.length === 0,
        issues
      };
      
    } catch (error) {
      issues.push(`Validation failed: ${error instanceof Error ? error.message : String(error)}`);
      return { isValid: false, issues };
    }
  }

  /**
   * 从变换字符串中提取数值
   * @param transform 变换字符串
   * @returns 提取的数值，失败时返回null
   */
  public static extractTransformValue(transform: string): number | null {
    try {
      const match = transform.match(/-?\d+(\.\d+)?/);
      return match ? parseFloat(match[0]) : null;
    } catch {
      return null;
    }
  }

  /**
   * 修复内容元素之间的间隙
   * @param content1 第一个内容元素
   * @param content2 第二个内容元素
   * @param contentSize 内容尺寸
   * @param direction 滚动方向
   * @param currentPosition 当前位置
   * @returns 修复结果
   */
  public static fixContentGaps(
    content1: HTMLElement,
    content2: HTMLElement,
    contentSize: number,
    direction: ScrollDirection,
    currentPosition: number
  ): { fixed: boolean; adjustments?: string[] } {
    try {
      const adjustments: string[] = [];
      
      // 获取当前变换值
      const content1Style = getComputedStyle(content1);
      const content2Style = getComputedStyle(content2);
      
      const content1Transform = content1Style.transform;
      const content2Transform = content2Style.transform;
      
      // 验证当前连接
      const validation = this.validateSeamlessConnection(
        content1Transform, content2Transform, contentSize, direction
      );
      
      if (validation.isValid) {
        return { fixed: true }; // 无需修复
      }
      
      // 应用修复
      const optimizedResult = this.optimizeSeamlessConnection(
        currentPosition, contentSize, 0, direction
      );
      
      content1.style.transform = optimizedResult.content1Transform;
      content2.style.transform = optimizedResult.content2Transform;
      
      adjustments.push('Applied optimized transforms');
      
      ErrorHandler.logDebug('Content gaps fixed', {
        direction,
        currentPosition,
        adjustments
      });
      
      return { fixed: true, adjustments };
      
    } catch (error) {
      const errorDetails = {
        code: ScrollDirectionError.CONTENT_SIZE_CALCULATION_FAILED,
        message: 'Failed to fix content gaps',
        context: {
          error: error instanceof Error ? error.message : String(error),
          direction,
          currentPosition
        },
        timestamp: Date.now(),
        recoverable: true
      };
      ErrorHandler.logError(errorDetails);
      
      return { fixed: false };
    }
  }

  /**
   * 获取缓存统计信息
   * @returns 缓存统计
   */
  public static getCacheStats(): {
    totalEntries: number;
    expiredEntries: number;
    memoryUsage: number;
  } {
    const now = Date.now();
    let expiredCount = 0;
    
    for (const cache of this.contentSizeCache.values()) {
      if ((now - cache.timestamp) >= this.CACHE_DURATION) {
        expiredCount++;
      }
    }
    
    return {
      totalEntries: this.contentSizeCache.size,
      expiredEntries: expiredCount,
      memoryUsage: this.contentSizeCache.size * 64 // 估算每个缓存项64字节
    };
  }
}
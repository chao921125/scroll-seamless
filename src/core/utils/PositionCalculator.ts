import { ScrollDirection } from '../../types';
import { DirectionHandler } from './DirectionHandler';

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
    const cacheKey = this.generateCacheKey(element, direction);
    const now = Date.now();
    
    // 检查缓存
    if (!forceRefresh) {
      const cached = this.contentSizeCache.get(cacheKey);
      if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
        return cached.size;
      }
    }

    // 计算实际尺寸
    const size = this.calculateActualContentSize(element, direction);
    
    // 更新缓存
    this.contentSizeCache.set(cacheKey, {
      element,
      size,
      timestamp: now,
      direction
    });

    return size;
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
    const config = DirectionHandler.getDirectionConfig(direction);
    
    try {
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

      // 确保返回有效的尺寸值，添加安全边界
      return Math.max(size + this.SAFETY_MARGIN, 1);
      
    } catch (error) {
      console.warn('Failed to calculate content size:', error);
      // 返回默认值
      return config.isHorizontal ? 100 : 50;
    }
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
   * 验证位置计算的准确性
   * @param position 位置值
   * @param contentSize 内容尺寸
   * @param containerSize 容器尺寸
   * @param direction 滚动方向
   * @returns 验证结果
   */
  public static validatePositionCalculation(
    position: number,
    contentSize: number,
    containerSize: number,
    direction: ScrollDirection
  ): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    // 检查基本参数
    if (contentSize <= 0) {
      issues.push('Content size must be greater than 0');
    }
    
    if (containerSize <= 0) {
      issues.push('Container size must be greater than 0');
    }
    
    if (!DirectionHandler.isValidDirection(direction)) {
      issues.push(`Invalid direction: ${direction}`);
      return {
        isValid: false,
        issues
      };
    }
    
    try {
      // 检查位置范围
      const config = DirectionHandler.getDirectionConfig(direction);
      if (config.isReverse) {
        if (position > 0 || position < -contentSize * 2) {
          issues.push(`Position ${position} is out of valid range for ${direction} direction`);
        }
      } else {
        if (position < 0 || position > contentSize * 2) {
          issues.push(`Position ${position} is out of valid range for ${direction} direction`);
        }
      }
    } catch (error) {
      issues.push(`Failed to validate direction: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    return {
      isValid: issues.length === 0,
      issues
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
   * 验证并修复初始定位
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
    
    // 应用特殊方向的修复
    if (direction === 'up') {
      this.fixUpDirectionPositioning(content1, content2, contentSize);
    } else if (direction === 'right') {
      // 修复水平滚动中 content2 元素的初始 left 位置设置
      content2.style.left = `${contentSize}px`;
    } else if (direction === 'down') {
      // 修复垂直滚动中 content2 元素的初始 top 位置设置
      content2.style.top = `${contentSize}px`;
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
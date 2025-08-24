import { ScrollDirection } from '../../types';
import { DirectionHandler } from './DirectionHandler';

/**
 * 变换应用结果接口
 */
export interface TransformResult {
  success: boolean;
  appliedTransforms: string[];
  errors?: string[];
  fallbackUsed?: boolean;
}

/**
 * 批量样式更新接口
 */
export interface BatchStyleUpdate {
  element: HTMLElement;
  transform: string;
  additionalStyles?: Partial<CSSStyleDeclaration>;
}

/**
 * 性能指标接口
 */
export interface TransformPerformanceMetrics {
  batchUpdateTime: number;
  individualUpdateTime: number;
  transformGenerationTime: number;
  errorCount: number;
  fallbackCount: number;
}

/**
 * 变换管理器类
 * 优化变换应用机制，提供批量更新和错误处理
 */
export class TransformManager {
  private static performanceMetrics: TransformPerformanceMetrics = {
    batchUpdateTime: 0,
    individualUpdateTime: 0,
    transformGenerationTime: 0,
    errorCount: 0,
    fallbackCount: 0
  };

  private static readonly TRANSFORM_CACHE = new Map<string, string>();
  private static readonly MAX_CACHE_SIZE = 1000;

  /**
   * 生成优化的变换字符串
   * 确保每个方向使用正确的变换函数
   * @param position 位置值
   * @param direction 滚动方向
   * @param useCache 是否使用缓存
   * @returns 变换字符串
   */
  public static generateTransformString(
    position: number,
    direction: ScrollDirection,
    useCache: boolean = true
  ): string {
    const startTime = this.getPerformanceNow();
    
    try {
      // 生成缓存键
      const cacheKey = `${direction}_${position}`;
      
      // 检查缓存
      if (useCache && this.TRANSFORM_CACHE.has(cacheKey)) {
        return this.TRANSFORM_CACHE.get(cacheKey)!;
      }

      const config = DirectionHandler.getDirectionConfig(direction);
      let transformValue: number;

      // 统一的变换计算公式 - 所有方向都使用负变换值
      // 这样可以确保一致的行为和更简单的逻辑
      switch (direction) {
        case 'left':
          // left 方向：内容从右向左移动，position 递增
          // transform 需要是负值来实现向左移动的视觉效果
          transformValue = -position;
          break;
        case 'right':
          // right 方向：内容从左向右移动，position 递减（负值）
          // transform 使用负值，由于 position 是负值，结果是正值，实现向右移动
          transformValue = -position;
          break;
        case 'up':
          // up 方向：内容从下向上移动，position 递增
          // transform 需要是负值来实现向上移动的视觉效果
          transformValue = -position;
          break;
        case 'down':
          // down 方向：内容从上向下移动，position 递减（负值）
          // transform 使用负值，由于 position 是负值，结果是正值，实现向下移动
          transformValue = -position;
          break;
        default:
          throw new Error(`Unsupported direction: ${direction}`);
      }

      // 生成变换字符串
      const transformString = `${config.transformProperty}(${transformValue}px)`;

      // 缓存结果（如果缓存未满）
      if (useCache && this.TRANSFORM_CACHE.size < this.MAX_CACHE_SIZE) {
        this.TRANSFORM_CACHE.set(cacheKey, transformString);
      }

      return transformString;
    } catch (error) {
      this.performanceMetrics.errorCount++;
      console.error('Transform generation failed:', error);
      
      // 返回安全的默认变换
      return this.getFallbackTransform(direction);
    } finally {
      this.performanceMetrics.transformGenerationTime += this.getPerformanceNow() - startTime;
    }
  }

  /**
   * 批量应用变换到多个元素
   * 实现批量样式更新以提高性能
   * @param updates 批量更新数组
   * @returns 应用结果
   */
  public static applyBatchTransforms(updates: BatchStyleUpdate[]): TransformResult {
    const startTime = this.getPerformanceNow();
    const appliedTransforms: string[] = [];
    const errors: string[] = [];
    let fallbackUsed = false;

    try {
      // 使用 DocumentFragment 或批量操作来优化性能
      const elementsToUpdate: { element: HTMLElement; styles: Partial<CSSStyleDeclaration> }[] = [];

      // 准备所有样式更新
      for (const update of updates) {
        try {
          const styles: Partial<CSSStyleDeclaration> = {
            transform: update.transform,
            ...update.additionalStyles
          };

          elementsToUpdate.push({
            element: update.element,
            styles
          });

          appliedTransforms.push(update.transform);
        } catch (error) {
          errors.push(`Failed to prepare update for element: ${error}`);
        }
      }

      // 批量应用样式更新
      this.batchApplyStyles(elementsToUpdate);

    } catch (error) {
      this.performanceMetrics.errorCount++;
      errors.push(`Batch transform application failed: ${error}`);
      
      // 尝试逐个应用作为回退
      fallbackUsed = true;
      this.performanceMetrics.fallbackCount++;
      
      for (const update of updates) {
        try {
          this.applySingleTransform(update.element, update.transform, update.additionalStyles);
          appliedTransforms.push(update.transform);
        } catch (fallbackError) {
          errors.push(`Fallback failed for element: ${fallbackError}`);
        }
      }
    } finally {
      this.performanceMetrics.batchUpdateTime += this.getPerformanceNow() - startTime;
    }

    return {
      success: errors.length === 0,
      appliedTransforms,
      errors: errors.length > 0 ? errors : undefined,
      fallbackUsed
    };
  }

  /**
   * 批量应用样式到元素
   * @param elementsToUpdate 要更新的元素和样式
   */
  private static batchApplyStyles(
    elementsToUpdate: { element: HTMLElement; styles: Partial<CSSStyleDeclaration> }[]
  ): void {
    // 在测试环境中同步应用，在生产环境中使用 requestAnimationFrame
    const applyStyles = () => {
      for (const { element, styles } of elementsToUpdate) {
        if (element && element.style) {
          Object.assign(element.style, styles);
        }
      }
    };

    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
      // 测试环境中同步应用
      applyStyles();
    } else {
      // 生产环境中使用 requestAnimationFrame 来批量更新样式，避免强制重排
      if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(applyStyles);
      } else {
        // 如果 requestAnimationFrame 不可用，同步应用
        applyStyles();
      }
    }
  }

  /**
   * 应用单个变换到元素
   * 添加变换应用的错误处理和回退机制
   * @param element 目标元素
   * @param transform 变换字符串
   * @param additionalStyles 额外样式
   */
  public static applySingleTransform(
    element: HTMLElement,
    transform: string,
    additionalStyles?: Partial<CSSStyleDeclaration>
  ): void {
    const startTime = this.getPerformanceNow();

    try {
      // 验证元素是否有效
      if (!element || !element.style) {
        throw new Error('Invalid element provided');
      }

      // 验证变换字符串
      if (!this.isValidTransform(transform)) {
        throw new Error(`Invalid transform string: ${transform}`);
      }

      // 应用变换
      element.style.transform = transform;

      // 应用额外样式
      if (additionalStyles) {
        Object.assign(element.style, additionalStyles);
      }

    } catch (error) {
      this.performanceMetrics.errorCount++;
      console.error('Single transform application failed:', error);
      
      // 尝试回退机制
      try {
        this.applyFallbackTransform(element, transform);
        this.performanceMetrics.fallbackCount++;
      } catch (fallbackError) {
        console.error('Fallback transform failed:', fallbackError);
        // 最后的回退：清除变换
        if (element && element.style) {
          element.style.transform = 'none';
        }
      }
    } finally {
      this.performanceMetrics.individualUpdateTime += this.getPerformanceNow() - startTime;
    }
  }

  /**
   * 验证变换字符串是否有效
   * @param transform 变换字符串
   * @returns 是否有效
   */
  private static isValidTransform(transform: string): boolean {
    // 基本的变换字符串验证
    const transformRegex = /^(translateX|translateY)\(-?\d+(\.\d+)?px\)$/;
    return transformRegex.test(transform);
  }

  /**
   * 应用回退变换
   * @param element 目标元素
   * @param originalTransform 原始变换字符串
   */
  private static applyFallbackTransform(element: HTMLElement, originalTransform: string): void {
    // 验证元素是否有效
    if (!element || !element.style) {
      throw new Error('Cannot apply fallback transform to invalid element');
    }
    
    // 尝试解析原始变换并应用简化版本
    const match = originalTransform.match(/(translateX|translateY)\((-?\d+(?:\.\d+)?)px\)/);
    
    if (match) {
      const [, transformType, value] = match;
      const fallbackTransform = `${transformType}(${parseFloat(value)}px)`;
      element.style.transform = fallbackTransform;
    } else {
      // 如果无法解析，使用默认变换
      element.style.transform = 'translateX(0px)';
    }
  }

  /**
   * 获取回退变换字符串
   * @param direction 滚动方向
   * @returns 回退变换字符串
   */
  private static getFallbackTransform(direction: ScrollDirection): string {
    const config = DirectionHandler.getDirectionConfig(direction);
    return `${config.transformProperty}(0px)`;
  }

  /**
   * 优化的双内容元素变换应用 - 修复空白区域问题
   * 专门用于无缝滚动的双内容元素场景
   * @param content1 第一个内容元素
   * @param content2 第二个内容元素
   * @param position 当前位置
   * @param contentSize 内容尺寸
   * @param direction 滚动方向
   * @returns 应用结果
   */
  public static applySeamlessTransforms(
    content1: HTMLElement,
    content2: HTMLElement,
    position: number,
    contentSize: number,
    direction: ScrollDirection
  ): TransformResult {
    try {
      // 计算两个内容元素的变换
      const transform1 = this.generateTransformString(position, direction);
      
      // 计算第二个内容元素的位置，确保无缝滚动且无空白区域
      let content2Position: number;
      
      if (direction === 'up') {
        // up 方向：第二个内容在第一个内容的上方
        content2Position = position - contentSize;
      } else if (direction === 'down') {
        // down 方向：修复上侧空白 - 第二个内容应该紧跟第一个内容
        content2Position = position - contentSize;
      } else if (direction === 'left') {
        // left 方向：第二个内容在第一个内容的右方
        content2Position = position + contentSize;
      } else if (direction === 'right') {
        // right 方向：修复左侧空白 - 第二个内容应该紧跟第一个内容
        content2Position = position - contentSize;
      } else {
        // 默认情况
        content2Position = position + contentSize;
      }
      
      const transform2 = this.generateTransformString(content2Position, direction);

      // 批量应用变换
      const updates: BatchStyleUpdate[] = [
        { element: content1, transform: transform1 },
        { element: content2, transform: transform2 }
      ];

      return this.applyBatchTransforms(updates);
    } catch (error) {
      this.performanceMetrics.errorCount++;
      return {
        success: false,
        appliedTransforms: [],
        errors: [`Seamless transform application failed: ${error}`],
        fallbackUsed: true
      };
    }
  }

  /**
   * 清除变换缓存
   */
  public static clearTransformCache(): void {
    this.TRANSFORM_CACHE.clear();
  }

  /**
   * 获取性能指标
   * @returns 性能指标
   */
  public static getPerformanceMetrics(): TransformPerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * 重置性能指标
   */
  public static resetPerformanceMetrics(): void {
    this.performanceMetrics = {
      batchUpdateTime: 0,
      individualUpdateTime: 0,
      transformGenerationTime: 0,
      errorCount: 0,
      fallbackCount: 0
    };
  }

  /**
   * 预热变换缓存
   * 为常用的位置值预生成变换字符串
   * @param direction 滚动方向
   * @param maxPosition 最大位置值
   * @param step 步长
   */
  public static warmupTransformCache(
    direction: ScrollDirection,
    maxPosition: number,
    step: number = 1
  ): void {
    for (let position = 0; position <= maxPosition; position += step) {
      this.generateTransformString(position, direction, true);
    }
  }

  /**
   * 获取缓存统计信息
   * @returns 缓存统计
   */
  public static getCacheStats(): { size: number; maxSize: number; hitRate: number } {
    // 简化的缓存统计，实际项目中可以添加更详细的统计
    return {
      size: this.TRANSFORM_CACHE.size,
      maxSize: this.MAX_CACHE_SIZE,
      hitRate: 0 // 需要额外的计数器来计算命中率
    };
  }

  /**
   * 获取性能时间戳，兼容测试环境
   * @returns 时间戳
   */
  private static getPerformanceNow(): number {
    try {
      return performance.now();
    } catch (error) {
      // 在测试环境中，如果 performance.now() 不可用，使用 Date.now()
      return Date.now();
    }
  }
}
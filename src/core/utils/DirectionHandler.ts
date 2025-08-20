import { ScrollDirection } from '../../types';
import { TransformManager } from './TransformManager';

/**
 * 方向配置接口
 */
export interface DirectionConfig {
  direction: ScrollDirection;
  isHorizontal: boolean;
  isReverse: boolean;
  transformProperty: 'translateX' | 'translateY';
  sizeProperty: 'width' | 'height';
  scrollProperty: 'scrollWidth' | 'scrollHeight';
  positionProperty: 'left' | 'top';
}

/**
 * 初始位置计算结果
 */
export interface InitialPositionResult {
  content1Position: number;
  content2Position: number;
}

/**
 * 方向处理工具类
 * 提供方向相关的计算和配置功能
 */
export class DirectionHandler {
  private static readonly DIRECTION_CONFIGS: Record<ScrollDirection, DirectionConfig> = {
    left: {
      direction: 'left',
      isHorizontal: true,
      isReverse: false,
      transformProperty: 'translateX',
      sizeProperty: 'width',
      scrollProperty: 'scrollWidth',
      positionProperty: 'left'
    },
    right: {
      direction: 'right',
      isHorizontal: true,
      isReverse: true,
      transformProperty: 'translateX',
      sizeProperty: 'width',
      scrollProperty: 'scrollWidth',
      positionProperty: 'left'
    },
    up: {
      direction: 'up',
      isHorizontal: false,
      isReverse: false,
      transformProperty: 'translateY',
      sizeProperty: 'height',
      scrollProperty: 'scrollHeight',
      positionProperty: 'top'
    },
    down: {
      direction: 'down',
      isHorizontal: false,
      isReverse: true,
      transformProperty: 'translateY',
      sizeProperty: 'height',
      scrollProperty: 'scrollHeight',
      positionProperty: 'top'
    }
  };

  /**
   * 获取方向配置
   * @param direction 滚动方向
   * @returns 方向配置对象
   */
  public static getDirectionConfig(direction: ScrollDirection): DirectionConfig {
    const config = this.DIRECTION_CONFIGS[direction];
    if (!config) {
      throw new Error(`Invalid scroll direction: ${direction}`);
    }
    return config;
  }

  /**
   * 计算初始位置
   * 确保每个方向的内容元素正确定位
   * @param contentSize 内容尺寸
   * @param direction 滚动方向
   * @returns 初始位置结果
   */
  public static calculateInitialPosition(
    contentSize: number,
    direction: ScrollDirection
  ): InitialPositionResult {
    const config = this.getDirectionConfig(direction);
    
    let content1Position: number;
    let content2Position: number;

    // 第一个内容总是从0开始
    content1Position = 0;

    // 第二个内容的位置根据方向确定
    if (direction === 'up') {
      // up 方向：第二个内容在负方向以避免空白
      content2Position = -contentSize;
    } else if (direction === 'down') {
      // down 方向：第二个内容在正方向
      content2Position = contentSize;
    } else if (direction === 'left') {
      // left 方向：第二个内容在正方向
      content2Position = contentSize;
    } else if (direction === 'right') {
      // right 方向：第二个内容在正方向
      content2Position = contentSize;
    } else {
      // 默认情况（不应该到达这里，但为了类型安全）
      content2Position = contentSize;
    }

    return {
      content1Position,
      content2Position
    };
  }

  /**
   * 计算下一个位置
   * @param currentPosition 当前位置
   * @param step 步长
   * @param contentSize 内容尺寸
   * @param direction 滚动方向
   * @returns 下一个位置
   */
  public static calculateNextPosition(
    currentPosition: number,
    step: number,
    contentSize: number,
    direction: ScrollDirection
  ): number {
    const config = this.getDirectionConfig(direction);
    let nextPosition: number;

    if (config.isReverse) {
      // down 和 right 方向：位置递减
      nextPosition = currentPosition - step;
      
      // 当内容完全移出视图时，重置位置
      if (nextPosition <= -contentSize) {
        nextPosition = 0;
      }
    } else {
      // up 和 left 方向：位置递增
      nextPosition = currentPosition + step;
      
      // 当内容完全移出视图时，重置位置
      if (nextPosition >= contentSize) {
        nextPosition = 0;
      }
    }

    return nextPosition;
  }

  /**
   * 应用变换到元素
   * 使用优化的 TransformManager 进行变换应用
   * @param element 目标元素
   * @param position 位置值
   * @param direction 滚动方向
   */
  public static applyTransform(
    element: HTMLElement,
    position: number,
    direction: ScrollDirection
  ): void {
    // 使用 TransformManager 生成优化的变换字符串
    const transformString = TransformManager.generateTransformString(position, direction);
    
    // 使用 TransformManager 的错误处理机制应用变换
    TransformManager.applySingleTransform(element, transformString);
  }

  /**
   * 批量应用变换到多个元素
   * @param elements 元素和位置的数组
   * @param direction 滚动方向
   * @returns 应用结果
   */
  public static applyBatchTransforms(
    elements: Array<{ element: HTMLElement; position: number }>,
    direction: ScrollDirection
  ) {
    const updates = elements.map(({ element, position }) => ({
      element,
      transform: TransformManager.generateTransformString(position, direction)
    }));

    return TransformManager.applyBatchTransforms(updates);
  }

  /**
   * 设置元素的初始位置属性（left/top）
   * @param element 目标元素
   * @param position 位置值
   * @param direction 滚动方向
   */
  public static setInitialPosition(
    element: HTMLElement,
    position: number,
    direction: ScrollDirection
  ): void {
    const config = this.getDirectionConfig(direction);
    element.style[config.positionProperty] = `${position}px`;
  }

  /**
   * 获取元素的内容尺寸
   * @param element 目标元素
   * @param direction 滚动方向
   * @returns 内容尺寸
   */
  public static getContentSize(
    element: HTMLElement,
    direction: ScrollDirection
  ): number {
    const config = this.getDirectionConfig(direction);
    
    // 使用 scrollWidth/scrollHeight 获取实际内容尺寸
    const size = element[config.scrollProperty] as number;
    
    // 确保返回有效的尺寸值
    return Math.max(size, 0);
  }

  /**
   * 验证方向参数
   * @param direction 滚动方向
   * @returns 是否为有效方向
   */
  public static isValidDirection(direction: string): direction is ScrollDirection {
    return direction in this.DIRECTION_CONFIGS;
  }

  /**
   * 获取所有支持的方向
   * @returns 支持的方向数组
   */
  public static getSupportedDirections(): ScrollDirection[] {
    return Object.keys(this.DIRECTION_CONFIGS) as ScrollDirection[];
  }

  /**
   * 判断是否为水平方向
   * @param direction 滚动方向
   * @returns 是否为水平方向
   */
  public static isHorizontal(direction: ScrollDirection): boolean {
    return this.getDirectionConfig(direction).isHorizontal;
  }

  /**
   * 判断是否为反向滚动
   * @param direction 滚动方向
   * @returns 是否为反向滚动
   */
  public static isReverse(direction: ScrollDirection): boolean {
    return this.getDirectionConfig(direction).isReverse;
  }

  /**
   * 获取变换属性名
   * @param direction 滚动方向
   * @returns 变换属性名
   */
  public static getTransformProperty(direction: ScrollDirection): 'translateX' | 'translateY' {
    return this.getDirectionConfig(direction).transformProperty;
  }

  /**
   * 获取尺寸属性名
   * @param direction 滚动方向
   * @returns 尺寸属性名
   */
  public static getSizeProperty(direction: ScrollDirection): 'width' | 'height' {
    return this.getDirectionConfig(direction).sizeProperty;
  }

  /**
   * 获取滚动尺寸属性名
   * @param direction 滚动方向
   * @returns 滚动尺寸属性名
   */
  public static getScrollProperty(direction: ScrollDirection): 'scrollWidth' | 'scrollHeight' {
    return this.getDirectionConfig(direction).scrollProperty;
  }

  /**
   * 获取位置属性名
   * @param direction 滚动方向
   * @returns 位置属性名
   */
  public static getPositionProperty(direction: ScrollDirection): 'left' | 'top' {
    return this.getDirectionConfig(direction).positionProperty;
  }
}
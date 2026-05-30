/**
 * PositionCalculator - 位置计算器
 * 
 * 职责：
 * - 计算无缝连接的临界点
 * - 优化无缝滚动连接
 * - 处理内容预填充
 * - 检测和修复空白区域
 */

import type { ScrollDirection, SeamlessResult, DirectionConfig } from '../../types';
import { DirectionHandler } from './DirectionHandler';

export class PositionCalculator {
  /**
   * 优化无缝连接
   * 
   * 核心逻辑：
   * - 当content1完全移出容器时，重置到初始位置
   * - content2紧随content1，形成无缝循环
   */
  static optimizeSeamlessConnection(
    position: number,
    contentSize: number,
    containerSize: number,
    direction: ScrollDirection
  ): SeamlessResult {
    const config = DirectionHandler.getDirectionConfig(direction);
    const shouldReset = position >= contentSize;

    if (shouldReset) {
      // 需要重置
      return {
        content1Transform: `${config.transform}(0px)`,
        content2Transform: `${config.transform}(${contentSize}px)`,
        shouldReset: true,
      };
    }

    // 正常滚动
    // reverse方向（right/down）：content2初始在负方向，跟随content1移动
    // 非reverse方向（left/up）：content2初始在正方向，跟随content1移动
    let content1Value: number;
    let content2Value: number;
    
    if (config.reverse) {
      // 向右/向下滚动
      content1Value = position;
      content2Value = position - contentSize; // content2在content1左侧/上方
    } else {
      // 向左/向上滚动
      content1Value = -position;
      content2Value = -(position - contentSize); // content2在content1右侧/下方
    }

    return {
      content1Transform: `${config.transform}(${content1Value}px)`,
      content2Transform: `${config.transform}(${content2Value}px)`,
      shouldReset: false,
    };
  }

  /**
   * 获取内容尺寸（带备用方案）
   */
  static getContentSize(
    content: HTMLElement,
    direction: ScrollDirection,
    useFallback: boolean = false
  ): number {
    const size = DirectionHandler.getContentSize(content, direction);

    // 如果尺寸为0，使用备用方案
    if (size === 0 && useFallback) {
      const firstChild = content.firstElementChild as HTMLElement;
      if (firstChild) {
        return direction === 'left' || direction === 'right'
          ? firstChild.offsetWidth * content.children.length
          : firstChild.offsetHeight * content.children.length;
      }
    }

    return size;
  }

  /**
   * 内容预填充
   * 
   * 在内容开始前添加空白，确保初始位置正确
   */
  static implementContentPreFilling(
    content1: HTMLElement,
    content2: HTMLElement,
    containerSize: number,
    direction: ScrollDirection
  ): void {
    const config = DirectionHandler.getDirectionConfig(direction);
    const isHorizontal = config.isHorizontal;

    // 设置初始位置
    if (isHorizontal) {
      content1.style.marginLeft = '0px';
      content2.style.marginLeft = '0px';
    } else {
      content1.style.marginTop = '0px';
      content2.style.marginTop = '0px';
    }
  }

  /**
   * 检测和修复空白区域
   */
  static detectAndFixBlankAreas(
    content1: HTMLElement,
    content2: HTMLElement,
    container: HTMLElement,
    direction: ScrollDirection
  ): void {
    const contentSize = DirectionHandler.getContentSize(content1, direction);
    const containerSize = DirectionHandler.getContainerSize(container, direction);

    // 如果内容尺寸小于容器，需要复制更多数据
    if (contentSize < containerSize) {
      // 警告：数据不足，但不阻止显示
      console.warn(
        `[ScrollSeamless] Content size (${contentSize}px) is less than container size (${containerSize}px). ` +
        'Consider adding more data or reducing container size.'
      );
    }
  }

  /**
   * 计算无缝滚动需要的最小数据量
   */
  static calculateMinDataCount(
    containerSize: number,
    avgItemSize: number,
    direction: ScrollDirection
  ): number {
    // 需要至少填满容器的2倍，才能无缝循环
    return Math.ceil((containerSize / avgItemSize) * 2);
  }

  /**
   * 限制位置在有效范围内
   */
  static clampPosition(
    position: number,
    contentSize: number
  ): number {
    if (isNaN(position)) {
      throw new Error('Position cannot be NaN');
    }

    if (position < 0) return 0;
    if (position > contentSize) return contentSize;
    return position;
  }
}

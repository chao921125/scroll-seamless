/**
 * DirectionHandler - 方向处理器
 * 
 * 职责：
 * - 处理四向滚动的配置
 * - 判断水平/垂直方向
 * - 提供方向相关的DOM操作方法
 */

import type { ScrollDirection, DirectionConfig } from '../../types';

export class DirectionHandler {
  /**
   * 获取方向配置
   */
  static getDirectionConfig(direction: ScrollDirection): DirectionConfig {
    const isHorizontal = direction === 'left' || direction === 'right';
    const reverse = direction === 'right' || direction === 'down';

    return {
      isHorizontal,
      axis: isHorizontal ? 'width' : 'height',
      transform: isHorizontal ? 'translateX' : 'translateY',
      reverse,
      scrollSize: isHorizontal ? 'scrollWidth' : 'scrollHeight',
      clientSize: isHorizontal ? 'clientWidth' : 'clientHeight',
      offsetSize: isHorizontal ? 'offsetWidth' : 'offsetHeight',
    };
  }

  /**
   * 判断是否为水平方向
   */
  static isHorizontal(direction: ScrollDirection): boolean {
    return direction === 'left' || direction === 'right';
  }

  /**
   * 判断是否为垂直方向
   */
  static isVertical(direction: ScrollDirection): boolean {
    return direction === 'up' || direction === 'down';
  }

  /**
   * 获取容器尺寸
   */
  static getContainerSize(container: HTMLElement, direction: ScrollDirection): number {
    const config = this.getDirectionConfig(direction);
    return container[config.clientSize];
  }

  /**
   * 获取内容尺寸
   */
  static getContentSize(element: HTMLElement, direction: ScrollDirection): number {
    const config = this.getDirectionConfig(direction);
    return element[config.scrollSize];
  }

  /**
   * 应用transform
   */
  static applyTransform(
    element: HTMLElement,
    position: number,
    direction: ScrollDirection
  ): void {
    const config = this.getDirectionConfig(direction);
    const value = config.reverse ? position : -position;
    element.style.transform = `${config.transform}(${value}px)`;
  }

  /**
   * 设置内容布局方向
   */
  static setContentLayout(
    content: HTMLElement,
    direction: ScrollDirection
  ): void {
    const isHorizontal = this.isHorizontal(direction);
    
    content.style.display = 'flex';
    content.style.flexDirection = isHorizontal ? 'row' : 'column';
    content.style.flexWrap = 'nowrap';
  }
}

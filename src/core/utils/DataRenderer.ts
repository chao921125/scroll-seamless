/**
 * DataRenderer - 数据渲染器
 * 
 * 职责：
 * - 根据数据数组渲染DOM元素
 * - 支持自定义renderItem函数
 * - 管理content1和content2的内容
 */

import type { ScrollDirection } from '../../types';
import { DirectionHandler } from './DirectionHandler';

export type RenderItemFunction = (
  item: string,
  index: number,
  rowIndex?: number,
  colIndex?: number
) => HTMLElement;

export class DataRenderer {
  private content1: HTMLElement;
  private content2: HTMLElement;
  private direction: ScrollDirection;
  private renderItemFn: RenderItemFunction;
  private isHorizontal: boolean;

  constructor(
    content1: HTMLElement,
    content2: HTMLElement,
    direction: ScrollDirection,
    renderItem?: RenderItemFunction
  ) {
    this.content1 = content1;
    this.content2 = content2;
    this.direction = direction;
    this.isHorizontal = DirectionHandler.isHorizontal(direction);
    
    // 使用自定义渲染函数或默认函数
    this.renderItemFn = renderItem || this.defaultRenderItem.bind(this);
  }

  /**
   * 默认渲染函数
   */
  private defaultRenderItem(item: string, index: number): HTMLElement {
    const span = document.createElement('span');
    span.className = 'ss-item';
    span.textContent = item;
    return span;
  }

  /**
   * 渲染数据到content1和content2
   */
  render(data: string[]): void {
    // 清空现有内容
    this.clear();

    // 渲染到content1
    data.forEach((item, index) => {
      const element = this.renderItemFn(item, index);
      this.content1.appendChild(element);
    });

    // 克隆到content2
    this.content2.innerHTML = this.content1.innerHTML;
  }

  /**
   * 清空内容
   */
  clear(): void {
    // 安全清空，保留content元素本身的样式
    while (this.content1.firstChild) {
      this.content1.removeChild(this.content1.firstChild);
    }
    while (this.content2.firstChild) {
      this.content2.removeChild(this.content2.firstChild);
    }
  }

  /**
   * 更新渲染函数
   */
  updateRenderItem(renderItem: RenderItemFunction): void {
    this.renderItemFn = renderItem;
  }

  /**
   * 获取渲染统计
   */
  getStats(): { content1Count: number; content2Count: number } {
    return {
      content1Count: this.content1.children.length,
      content2Count: this.content2.children.length,
    };
  }

  /**
   * 销毁渲染器
   */
  destroy(): void {
    this.clear();
  }
}

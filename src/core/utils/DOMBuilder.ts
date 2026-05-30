/**
 * DOMBuilder - DOM构建器
 * 
 * 职责：
 * - 创建和管理滚动DOM结构
 * - 设置容器和内容样式
 * - 支持多行/多列布局
 * - 提供DOM清理功能
 */

import type { ScrollDirection } from '../../types';
import { DirectionHandler } from './DirectionHandler';

export interface DOMBuilderOptions {
  direction: ScrollDirection;
  rows: number;
  cols: number;
}

export interface BuiltContent {
  content1: HTMLElement;
  content2: HTMLElement;
  index: number;
}

export class DOMBuilder {
  private container: HTMLElement;
  private readonly options: DOMBuilderOptions;
  private contents: BuiltContent[] = [];

  constructor(container: HTMLElement, options: DOMBuilderOptions) {
    this.container = container;
    this.options = options;
  }

  /**
   * 创建完整的DOM结构
   */
  build(): BuiltContent[] {
    // 清理旧内容
    this.cleanup();

    // 设置容器样式
    this.setupContainer();

    // 创建内容元素
    const isHorizontal = DirectionHandler.isHorizontal(this.options.direction);
    const totalGroups = isHorizontal ? this.options.rows : this.options.cols;

    for (let i = 0; i < totalGroups; i++) {
      const content = this.createContentGroup(i);
      this.contents.push(content);
    }

    return this.contents;
  }

  /**
   * 设置容器样式
   */
  private setupContainer(): void {
    this.container.style.position = 'relative';
    this.container.style.overflow = 'hidden';
  }

  /**
   * 创建一组内容（content1 + content2）
   */
  private createContentGroup(index: number): BuiltContent {
    const { direction } = this.options;
    const isHorizontal = DirectionHandler.isHorizontal(direction);

    // 创建content1
    const content1 = this.createContentElement(index, false);
    
    // 创建content2
    const content2 = this.createContentElement(index, true);

    // 添加到容器
    this.container.appendChild(content1);
    this.container.appendChild(content2);

    return { content1, content2, index };
  }

  /**
   * 创建单个内容元素
   */
  private createContentElement(index: number, isClone: boolean): HTMLElement {
    const { direction } = this.options;
    const isHorizontal = DirectionHandler.isHorizontal(direction);

    const content = document.createElement('div');
    content.className = isClone 
      ? `ss-content ss-content-${index + 1}-clone`
      : `ss-content ss-content-${index + 1}`;

    // 设置布局方向
    this.setupContentLayout(content, direction);

    // 设置定位
    this.setupContentPosition(content, isHorizontal);

    return content;
  }

  /**
   * 设置内容布局
   */
  private setupContentLayout(content: HTMLElement, direction: ScrollDirection): void {
    DirectionHandler.setContentLayout(content, direction);
  }

  /**
   * 设置内容定位
   */
  private setupContentPosition(content: HTMLElement, isHorizontal: boolean): void {
    content.style.position = 'absolute';
    
    if (isHorizontal) {
      content.style.top = '0';
      content.style.left = '0';
    } else {
      content.style.left = '0';
      content.style.top = '0';
    }
  }

  /**
   * 获取所有创建的内容
   */
  getContents(): ReadonlyArray<BuiltContent> {
    return this.contents;
  }

  /**
   * 清理DOM
   */
  cleanup(): void {
    // 移除所有ss-content元素
    const contents = this.container.querySelectorAll('.ss-content');
    contents.forEach(el => el.remove());
    
    // 清空数组
    this.contents = [];
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.cleanup();
  }
}

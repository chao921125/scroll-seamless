/**
 * MultiRowRenderer - 多行/多列渲染协调器
 * 
 * 职责：
 * - 将数据按行/列分配到不同的滚动状态
 * - 协调多个DataRenderer实例
 * - 保持与原有DataRenderer的兼容性
 * 
 * 设计原则：
 * - 不修改原有DataRenderer逻辑
 * - 通过协调器模式扩展多行/多列功能
 * - 每个滚动状态独立渲染，互不干扰
 */

import type { ScrollDirection, ScrollState } from '../../types';
import { DirectionHandler } from './DirectionHandler';
import { DataRenderer } from './DataRenderer';

export interface MultiRowRendererOptions {
  direction: ScrollDirection;
  rows: number;
  cols: number;
  renderItem?: (
    item: string,
    index: number,
    rowIndex?: number,
    colIndex?: number
  ) => HTMLElement;
}

export class MultiRowRenderer {
  private states: ScrollState[];
  private options: MultiRowRendererOptions;
  private isHorizontal: boolean;
  private totalGroups: number;
  private renderers: DataRenderer[] = [];

  constructor(states: ScrollState[], options: MultiRowRendererOptions) {
    this.states = states;
    this.options = options;
    this.isHorizontal = DirectionHandler.isHorizontal(options.direction);
    this.totalGroups = this.isHorizontal ? options.rows : options.cols;
  }

  /**
   * 渲染数据到所有行/列
   * 
   * 策略：
   * - 单行/单列：使用原有逻辑（兼容）
   * - 多行/多列：按组分配数据
   */
  render(data: string[]): void {
    // 单行/单列情况，使用原有DataRenderer逻辑
    if (this.totalGroups <= 1) {
      this.renderSingleGroup(data);
      return;
    }

    // 多行/多列情况，按组分配
    this.renderMultiGroup(data);
  }

  /**
   * 单行/单列渲染（保持原有逻辑）
   */
  private renderSingleGroup(data: string[]): void {
    if (this.states.length === 0) return;

    const state = this.states[0];
    const renderer = new DataRenderer(
      state.content1,
      state.content2,
      this.options.direction,
      this.options.renderItem
    );

    renderer.render(data);
    this.renderers.push(renderer);
  }

  /**
   * 多行/多列渲染
   * 
   * 数据分配策略：
   * - 水平滚动（rows>1）：数据按行平均分配
   * - 垂直滚动（cols>1）：数据按列平均分配
   * 
   * 例如：data有30条，rows=3
   * - 第0行：data[0-9]
   * - 第1行：data[10-19]
   * - 第2行：data[20-29]
   */
  private renderMultiGroup(data: string[]): void {
    const itemsPerGroup = Math.ceil(data.length / this.totalGroups);

    this.states.forEach((state, groupIndex) => {
      // 计算该组的数据范围
      const startIndex = groupIndex * itemsPerGroup;
      const endIndex = Math.min(startIndex + itemsPerGroup, data.length);
      const groupData = data.slice(startIndex, endIndex);

      // 如果数据不足，跳过该组
      if (groupData.length === 0) {
        return;
      }

      // 为该组创建DataRenderer
      const renderer = new DataRenderer(
        state.content1,
        state.content2,
        this.options.direction,
        // 包装renderItem，传入行/列索引
        this.options.renderItem
          ? (item, index) => {
              const globalIndex = startIndex + index;
              if (this.isHorizontal) {
                return this.options.renderItem!(item, globalIndex, groupIndex, undefined);
              } else {
                return this.options.renderItem!(item, globalIndex, undefined, groupIndex);
              }
            }
          : undefined
      );

      // 渲染该组数据
      renderer.render(groupData);
      this.renderers.push(renderer);
    });
  }

  /**
   * 清空所有渲染内容
   */
  clear(): void {
    this.renderers.forEach(renderer => renderer.destroy());
    this.renderers = [];
  }

  /**
   * 获取渲染统计
   */
  getStats(): {
    totalGroups: number;
    activeGroups: number;
    renderers: Array<{ content1Count: number; content2Count: number }>;
  } {
    return {
      totalGroups: this.totalGroups,
      activeGroups: this.renderers.length,
      renderers: this.renderers.map(r => r.getStats()),
    };
  }

  /**
   * 销毁所有渲染器
   */
  destroy(): void {
    this.clear();
    this.renderers = [];
  }
}

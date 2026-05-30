/**
 * ScrollStateManager - 滚动状态管理器
 * 
 * 职责：
 * - 管理所有滚动状态（position, contentSize等）
 * - 支持多行/多列滚动
 * - 提供状态查询和更新接口
 * - 管理stepWait状态
 */

import type { ScrollState, StepWaitState, ScrollDirection } from '../../types';
import { DirectionHandler } from './DirectionHandler';
import { PositionCalculator } from './PositionCalculator';

export interface ScrollStateManagerOptions {
  rows: number;
  cols: number;
  direction: ScrollDirection;
  stepWait: number;
}

export class ScrollStateManager {
  private states: ScrollState[] = [];
  private stepWaitStates: StepWaitState[] = [];
  private cycleCount: number = 0;
  private readonly options: ScrollStateManagerOptions;

  constructor(options: ScrollStateManagerOptions) {
    this.options = options;
  }

  /**
   * 初始化滚动状态
   */
  initialize(content1: HTMLElement, content2: HTMLElement, index: number = 0): void {
    const state: ScrollState = {
      position: 0,
      content1,
      content2,
      contentSize: 0,
    };

    const stepWaitState: StepWaitState = {
      accumulated: 0,
      waiting: false,
      waitStart: 0,
    };

    this.states.push(state);
    this.stepWaitStates.push(stepWaitState);
  }

  /**
   * 获取指定索引的状态
   */
  getState(index: number = 0): ScrollState {
    return this.states[index];
  }

  /**
   * 获取所有状态
   */
  getAllStates(): ReadonlyArray<ScrollState> {
    return this.states;
  }

  /**
   * 获取状态数量
   */
  getStateCount(): number {
    return this.states.length;
  }

  /**
   * 更新内容尺寸
   */
  updateContentSize(index: number = 0): number {
    const state = this.states[index];
    if (!state) return 0;

    state.contentSize = PositionCalculator.getContentSize(
      state.content1,
      this.options.direction,
      true
    );

    return state.contentSize;
  }

  /**
   * 更新所有内容尺寸
   */
  updateAllContentSizes(): void {
    this.states.forEach((_, index) => {
      this.updateContentSize(index);
    });
  }

  /**
   * 获取stepWait状态
   */
  getStepWaitState(index: number = 0): StepWaitState {
    return this.stepWaitStates[index];
  }

  /**
   * 处理stepWait逻辑
   * @returns 是否应该跳过本次更新
   */
  processStepWait(index: number, deltaTime: number, step: number): boolean {
    if (this.options.stepWait <= 0) {
      return false;
    }

    const stepWaitState = this.stepWaitStates[index];
    
    // 正在等待
    if (stepWaitState.waiting) {
      stepWaitState.waitStart += deltaTime;
      if (stepWaitState.waitStart < this.options.stepWait) {
        return true; // 跳过本次更新
      }
      // 等待结束
      stepWaitState.waiting = false;
      stepWaitState.waitStart = 0;
      stepWaitState.accumulated = 0;
    }

    // 累积像素
    const pixelsPerFrame = step * (deltaTime / 16.67);
    stepWaitState.accumulated += pixelsPerFrame;

    // 达到step，开始等待
    if (stepWaitState.accumulated >= step) {
      stepWaitState.waiting = true;
      stepWaitState.waitStart = 0;
    }

    return false;
  }

  /**
   * 更新位置
   */
  updatePosition(index: number, position: number): void {
    const state = this.states[index];
    if (state) {
      state.position = position;
    }
  }

  /**
   * 增加循环计数
   */
  incrementCycleCount(): number {
    this.cycleCount++;
    return this.cycleCount;
  }

  /**
   * 获取循环计数
   */
  getCycleCount(): number {
    return this.cycleCount;
  }

  /**
   * 重置循环计数
   */
  resetCycleCount(): void {
    this.cycleCount = 0;
  }

  /**
   * 重置所有状态
   */
  resetAll(): void {
    this.states.forEach(state => {
      state.position = 0;
    });
    this.stepWaitStates.forEach(stepWait => {
      stepWait.accumulated = 0;
      stepWait.waiting = false;
      stepWait.waitStart = 0;
    });
    this.cycleCount = 0;
  }

  /**
   * 清理所有状态
   */
  destroy(): void {
    this.states = [];
    this.stepWaitStates = [];
    this.cycleCount = 0;
  }
}

import { ScrollSeamlessOptions, ScrollSeamlessController } from '../types';
import { ScrollEngine } from './ScrollEngine';

// 导出默认选项
export const DEFAULT_OPTIONS: Required<Omit<ScrollSeamlessOptions, 'data'>> = {
  direction: 'left',
  minCountToScroll: 2,
  step: 1,
  stepWait: 0,
  delay: 0,
  bezier: [0.25, 0.1, 0.25, 1],
  hoverStop: true,
  wheelEnable: false,
  singleLine: false,
  rows: 1,
  cols: 1,
  onEvent: () => {},
  dataDriven: false
};

/**
 * 创建无缝滚动实例
 * @param container 容器元素
 * @param options 配置选项
 * @returns 滚动控制器
 */
export function createScrollSeamless(
  container: HTMLElement,
  options: ScrollSeamlessOptions
): ScrollSeamlessController {
  return new ScrollEngine(container, options);
}

// 将 ScrollEngine 重命名为 ScrollSeamless 并作为默认导出
const ScrollSeamless = ScrollEngine;
export default ScrollSeamless;

// 导出工具类
export * from './utils/ObjectPool';
export * from './utils/RAFScheduler';
export * from './utils/MemoryManager';
export * from './utils/DOMCache';

// 导出工具函数
export * from './utils';
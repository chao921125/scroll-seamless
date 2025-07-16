import type { ScrollSeamlessOptions, ScrollSeamlessController } from '../types';
import { ScrollEngine } from './ScrollEngine';

/**
 * 创建无缝滚动的 Hook 函数
 * 为了向后兼容，保留此函数
 * 
 * @param container 容器元素
 * @param options 配置选项
 * @returns 滚动控制器
 */
export function useSeamlessScroll(
  container: HTMLElement,
  options: ScrollSeamlessOptions
): ScrollSeamlessController {
  // 使用新的 ScrollEngine 实现
  return new ScrollEngine(container, options);
}
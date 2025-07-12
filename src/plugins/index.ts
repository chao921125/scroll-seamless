import { createVirtualScrollPlugin, VirtualScrollPlugin } from './virtual-scroll';
import type { VirtualScrollOptions, VirtualScrollMetrics } from './virtual-scroll';

export { createVirtualScrollPlugin, VirtualScrollPlugin };
export type { VirtualScrollOptions, VirtualScrollMetrics };

// 插件工厂函数
export function createPlugins() {
  return {
    virtualScroll: createVirtualScrollPlugin,
  };
} 
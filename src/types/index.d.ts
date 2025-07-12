export * from './index';
export type ScrollDirection = 'horizontal' | 'vertical';
export type ScrollSeamlessEvent =
  | 'start'
  | 'stop'
  | 'destroy'
  | 'update'
  | 'reach-end'
  | 'reach-start';
export interface PerformancePluginOptions {
  enabled?: boolean;
  fps?: boolean;
  memory?: boolean;
  timing?: boolean;
  onUpdate?: (metrics: any) => void;
}
export interface AccessibilityPluginOptions {
  enabled?: boolean;
  ariaLabel?: string;
  keyboardNavigation?: boolean;
  screenReader?: boolean;
  focusable?: boolean;
}
export interface ScrollSeamlessPlugin {
  id: string;
  apply: (instance: ScrollSeamlessController) => void;
  destroy?: () => void;
}
export interface ScrollSeamlessOptions {
  data: string[];
  direction?: ScrollDirection;
  minCountToScroll?: number;
  step?: number;
  stepWait?: number;
  delay?: number;
  bezier?: [number, number, number, number];
  hoverStop?: boolean;
  wheelEnable?: boolean;
  singleLine?: boolean;
  custom?: boolean;
  onEvent?: (event: ScrollSeamlessEvent, data?: any) => void;
  plugins?: ScrollSeamlessPlugin[];
  performance?: PerformancePluginOptions;
  accessibility?: AccessibilityPluginOptions;
}
export interface ScrollSeamlessController {
  start: () => void;
  stop: () => void;
  destroy: () => void;
  updateData: () => void;
  setOptions: (options: Partial<ScrollSeamlessOptions>) => void;
  isRunning: () => boolean;
  getPosition?: () => number;
  setPosition?: (position: number) => void;
  addPlugin?: (plugin: ScrollSeamlessPlugin) => void;
  removePlugin?: (pluginId: string) => void;
  getPerformance?: () => any;
} 
export * from './index';
export type ScrollDirection = 'up' | 'down' | 'left' | 'right';
export type ScrollSeamlessEvent =
  | 'start'
  | 'stop'
  | 'pause'
  | 'resume'
  | 'destroy'
  | 'update'
  | 'error';

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
  rows?: number;
  cols?: number;
  onEvent?: (event: ScrollSeamlessEvent, data?: any) => void;
  dataDriven?: boolean;
}
export interface ScrollSeamlessController {
  start: () => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  destroy: () => void;
  updateData: () => void;
  setOptions: (options: Partial<ScrollSeamlessOptions>) => void;
  isRunning: () => boolean;
  getPosition?: () => number;
  setPosition?: (position: number) => void;
  getRenderMatrix?: () => string[][];
  getTransforms?: () => string[];
} 
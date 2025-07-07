import type { ForwardRefExoticComponent, RefAttributes, ReactNode } from 'react';
import type { ScrollSeamlessOptions } from '../types';

export interface ScrollSeamlessProps extends ScrollSeamlessOptions {
  children?: ReactNode;
  running?: boolean;
}

export interface ScrollSeamlessRef {
  start: () => void;
  stop: () => void;
  destroy: () => void;
  updateData: (data: string[]) => void;
  setOptions: (options: Partial<ScrollSeamlessOptions>) => void;
  isRunning: () => boolean | undefined;
}

export declare const ScrollSeamless: ForwardRefExoticComponent<ScrollSeamlessProps & RefAttributes<ScrollSeamlessRef>>;
export default ScrollSeamless; 
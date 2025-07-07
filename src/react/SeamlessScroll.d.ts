import type { ForwardRefExoticComponent, RefAttributes, ReactNode } from 'react';
import type { SeamlessScrollOptions } from '../../types';

export interface SeamlessScrollProps extends SeamlessScrollOptions {
  children?: ReactNode;
  running?: boolean;
}

export interface SeamlessScrollRef {
  start: () => void;
  stop: () => void;
  destroy: () => void;
  updateData: (data: string[]) => void;
  setOptions: (options: Partial<SeamlessScrollOptions>) => void;
  isRunning: () => boolean | undefined;
}

export declare const SeamlessScroll: ForwardRefExoticComponent<SeamlessScrollProps & RefAttributes<SeamlessScrollRef>>;
export default SeamlessScroll; 
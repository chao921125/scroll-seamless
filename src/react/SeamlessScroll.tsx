import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import type { ForwardedRef, ReactNode } from 'react';
import type { ScrollSeamlessOptions } from '../types';
import { ScrollSeamless as ScrollSeamlessCore } from '../core';

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

const ScrollSeamlessComponent = (
  props: ScrollSeamlessProps,
  ref: ForwardedRef<ScrollSeamlessRef>
) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<ScrollSeamlessCore | null>(null);

  useImperativeHandle(ref, () => ({
    start: () => instanceRef.current?.start(),
    stop: () => instanceRef.current?.stop(),
    destroy: () => instanceRef.current?.destroy(),
    updateData: (data) => instanceRef.current?.updateData(data),
    setOptions: (options) => instanceRef.current?.setOptions(options),
    isRunning: () => instanceRef.current?.isRunning(),
  }), []);

  useEffect(() => {
    if (rootRef.current) {
      instanceRef.current = new ScrollSeamlessCore(rootRef.current, props);
      if (props.running === false) {
        instanceRef.current.stop();
      }
    }
    return () => {
      instanceRef.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (instanceRef.current && props.running !== undefined) {
      if (props.running) instanceRef.current.start();
      else instanceRef.current.stop();
    }
  }, [props.running]);

  useEffect(() => {
    if (instanceRef.current && props.data) {
      instanceRef.current.updateData(props.data);
    }
  }, [props.data]);

  return (
    <div ref={rootRef} style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
      {props.children}
    </div>
  );
};

export const ScrollSeamless = forwardRef(ScrollSeamlessComponent);
export default ScrollSeamless; 
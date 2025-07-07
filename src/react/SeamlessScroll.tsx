import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import type { ForwardedRef, ReactNode } from 'react';
import type { SeamlessScrollOptions } from '../types';
import { SeamlessScroll as SeamlessScrollCore } from '../core';

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

const SeamlessScrollComponent = (
  props: SeamlessScrollProps,
  ref: ForwardedRef<SeamlessScrollRef>
) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<SeamlessScrollCore | null>(null);

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
      instanceRef.current = new SeamlessScrollCore(rootRef.current, props);
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

export const SeamlessScroll = forwardRef(SeamlessScrollComponent);
export default SeamlessScroll; 
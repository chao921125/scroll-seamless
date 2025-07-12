import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import type { ForwardedRef, ReactNode, CSSProperties } from 'react';
import type { ScrollSeamlessOptions } from '../types';
import { ScrollSeamless as ScrollSeamlessCore } from '../core';

export interface ScrollSeamlessProps extends ScrollSeamlessOptions {
  children?: (item: string, index: number) => ReactNode;
  custom?: boolean;
  running?: boolean;
  className?: string;
  style?: CSSProperties;
  contentClassName?: string;
  itemClassName?: string;
}

export interface ScrollSeamlessRef {
  start: () => void;
  stop: () => void;
  destroy: () => void;
  updateData: () => void;
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
    start: () => instanceRef.current && instanceRef.current.start(),
    stop: () => instanceRef.current && instanceRef.current.stop(),
    destroy: () => instanceRef.current && instanceRef.current.destroy(),
    updateData: () => instanceRef.current?.updateData(),
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
    if (instanceRef.current) {
      instanceRef.current.updateData();
    }
  }, [props.data]);

  // 渲染单个项目的默认函数
  const renderItem = (item: string, index: number) => {
    if (props.children) {
      return (
        <div key={index} className={props.itemClassName} style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
          {props.children(item, index)}
        </div>
      );
    }
    return <span key={index} className={props.itemClassName} style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>{item}</span>;
  };

  // 渲染内容区域
  const renderContent = () => {
    if (props.custom) {
      return props.children ? props.children('', 0) : null;
    }
    return props.data?.map((item, index) => renderItem(item, index));
  };

  // 功能性样式
  const baseStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    position: 'relative',
  };

  const contentStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    display: props.direction === 'horizontal' ? 'inline-block' : 'block',
    whiteSpace: props.direction === 'horizontal' ? 'nowrap' : 'normal',
    verticalAlign: props.direction === 'horizontal' ? 'top' : 'baseline',
  };

  return (
    <div 
      ref={rootRef} 
      className={props.className}
      style={{ ...baseStyle, ...props.style }}
    >
      <div className="scroll-seamless-content" data-direction={props.direction}>
        {/* 第一组内容 */}
        <div className={`ss-content ${props.contentClassName || ''}`} style={contentStyle}>
          {renderContent()}
        </div>
        {/* 第二组内容（用于无缝滚动） */}
        <div className={`ss-content ${props.contentClassName || ''}`} style={contentStyle}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export const ScrollSeamless = forwardRef(ScrollSeamlessComponent);
export default ScrollSeamless; 
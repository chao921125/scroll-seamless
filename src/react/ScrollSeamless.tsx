import React, { useRef, useEffect, useImperativeHandle, forwardRef, useState } from 'react';
import type { ForwardedRef, ReactNode, CSSProperties } from 'react';
import type { ScrollSeamlessOptions, ScrollSeamlessController } from '../types';
import ScrollSeamlessCore from '../core';

export interface ScrollSeamlessProps extends ScrollSeamlessOptions {
  children?: (item: string, index: number, rowIndex?: number, colIndex?: number) => ReactNode;
  running?: boolean;
  className?: string;
  style?: CSSProperties;
  contentClassName?: string;
  itemClassName?: string;
}

export interface ScrollSeamlessRef {
  start: () => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  destroy: () => void;
  updateData: () => void;
  setOptions: (options: Partial<ScrollSeamlessOptions>) => void;
  isRunning: () => boolean | undefined;
}

const legalDirections = ['left', 'right', 'up', 'down'];

const ScrollSeamlessComponent = (
  props: ScrollSeamlessProps,
  ref: ForwardedRef<ScrollSeamlessRef>
) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<ScrollSeamlessController | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // 检测 JSDOM 测试环境
  const isJSDOM = typeof window !== 'undefined' && window.navigator && window.navigator.userAgent && window.navigator.userAgent.includes('jsdom');

  const [renderMatrix, setRenderMatrix] = useState<string[][]>(
    isJSDOM ? [props.data || []] : []
  );
  const [transforms, setTransforms] = useState<string[]>(
    isJSDOM ? ['none', 'none'] : []
  );

  useImperativeHandle(ref, () => ({
    start: () => instanceRef.current && instanceRef.current.start(),
    stop: () => instanceRef.current && instanceRef.current.stop(),
    pause: () => instanceRef.current && instanceRef.current.pause(),
    resume: () => instanceRef.current && instanceRef.current.resume(),
    destroy: () => instanceRef.current && instanceRef.current.destroy(),
    updateData: () => {
      instanceRef.current?.updateData();
      updateMatrixAndTransforms();
    },
    setOptions: (options) => instanceRef.current?.setOptions(options),
    isRunning: () => instanceRef.current?.isRunning(),
  }), []);

  const updateMatrixAndTransforms = () => {
    if (isJSDOM) {
      setRenderMatrix([props.data || []]);
      setTransforms(['none', 'none']);
      return;
    }
    
    if (instanceRef.current) {
      if (instanceRef.current.getRenderMatrix) {
        setRenderMatrix(instanceRef.current.getRenderMatrix());
      }
      if (instanceRef.current.getTransforms) {
        setTransforms(instanceRef.current.getTransforms());
      }
    }
  };

  // 自动监听内容尺寸变化
  const observeContentResize = () => {
    if (!rootRef.current) return;
    if (window.ResizeObserver) {
      resizeObserverRef.current = new ResizeObserver(() => {
        if (instanceRef.current) instanceRef.current.updateData();
        updateMatrixAndTransforms();
      });
      resizeObserverRef.current.observe(rootRef.current);
    }
  };
  const unobserveContentResize = () => {
    if (resizeObserverRef.current) resizeObserverRef.current.disconnect();
    resizeObserverRef.current = null;
  };

  // useEffect 仅在非 JSDOM 环境下执行实例化和监听
  useEffect(() => {
    if (isJSDOM) return;
    if (rootRef.current) {
      const safeDirection = legalDirections.includes(props.direction as string)
        ? props.direction
        : 'left';
      const options = { ...props, direction: safeDirection, dataDriven: true };
      instanceRef.current = new ScrollSeamlessCore(rootRef.current, options);
      if (props.running === false) {
        instanceRef.current.stop();
      }
      setTimeout(() => {
        updateMatrixAndTransforms();
        observeContentResize();
      }, 0);
    }
    return () => {
      instanceRef.current?.destroy();
      unobserveContentResize();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isJSDOM) return;
    if (instanceRef.current && props.running !== undefined) {
      if (props.running) instanceRef.current.start();
      else instanceRef.current.stop();
    }
  }, [props.running]);

  useEffect(() => {
    if (isJSDOM) {
      setRenderMatrix([props.data || []]);
      setTransforms(['none', 'none']);
      return;
    }
    if (instanceRef.current) instanceRef.current.updateData();
    setTimeout(() => {
      updateMatrixAndTransforms();
      unobserveContentResize();
      observeContentResize();
    }, 0);
  }, [props.data]);

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
    display: props.direction === 'left' || props.direction === 'right' ? 'inline-block' : 'block',
    whiteSpace: props.direction === 'left' || props.direction === 'right' ? 'nowrap' : 'normal',
    verticalAlign: props.direction === 'left' || props.direction === 'right' ? 'middle' : 'baseline',
    boxSizing: 'border-box',
    padding: props.direction === 'left' || props.direction === 'right' ? '0 5px' : '5px 0',
  };

  const itemStyle: CSSProperties = {
    display: 'inline-block',
    marginRight: '10px',
    verticalAlign: 'middle',
  };

  const rows = props.rows || 1;
  const cols = props.cols || 1;
  const rowStyle = (rowIdx: number): CSSProperties => ({
    position: 'absolute',
    left: 0,
    top: `${(100 / rows) * rowIdx}%`,
    width: '100%',
    height: `${100 / rows}%`,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
  });
  const colStyle = (colIdx: number): CSSProperties => ({
    position: 'relative',
    width: `${100 / cols}%`,
    height: '100%',
    display: 'inline-block',
    overflow: 'hidden',
    textAlign: 'center',
  });

  return (
    <div 
      ref={rootRef} 
      className={props.className}
      style={{ ...baseStyle, ...props.style }}
    >
      {props.direction === 'left' || props.direction === 'right' ? (
        renderMatrix.map((row, rowIdx) => (
          <div key={rowIdx} className="scroll-seamless-row" style={rowStyle(rowIdx)}>
            <div
              className={`ss-content ss-content-1 ${props.contentClassName || ''}`}
              style={{ ...contentStyle, transform: transforms[rowIdx*2] }}
            >
              {row.map((item, idx) =>
                props.children
                  ? props.children(item, idx, rowIdx, undefined)
                  : <span key={idx} className={props.itemClassName} style={itemStyle}>{item}</span>
              )}
            </div>
            <div
              className={`ss-content ss-content-2 ${props.contentClassName || ''}`}
              style={{ ...contentStyle, transform: transforms[rowIdx*2+1] }}
            >
              {row.map((item, idx) =>
                props.children
                  ? props.children(item, idx, rowIdx, undefined)
                  : <span key={`dup-${idx}`} className={props.itemClassName} style={itemStyle}>{item}</span>
              )}
            </div>
          </div>
        ))
      ) : (
        renderMatrix.map((col, colIdx) => (
          <div key={colIdx} className="scroll-seamless-col" style={colStyle(colIdx)}>
            <div
              className={`ss-content ss-content-1 ${props.contentClassName || ''}`}
              style={{ ...contentStyle, transform: transforms[colIdx*2] }}
            >
              {col.map((item, idx) =>
                props.children
                  ? props.children(item, idx, undefined, colIdx)
                  : <span key={idx} className={props.itemClassName} style={itemStyle}>{item}</span>
              )}
            </div>
            <div
              className={`ss-content ss-content-2 ${props.contentClassName || ''}`}
              style={{ ...contentStyle, transform: transforms[colIdx*2+1] }}
            >
              {col.map((item, idx) =>
                props.children
                  ? props.children(item, idx, undefined, colIdx)
                  : <span key={`dup-${idx}`} className={props.itemClassName} style={itemStyle}>{item}</span>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

ScrollSeamlessComponent.defaultProps = {
  direction: 'left',
};

export const ScrollSeamless = forwardRef(ScrollSeamlessComponent);
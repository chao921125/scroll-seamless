import React, { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import { ScrollEngine } from '../core/ScrollEngine'
import type { ScrollOptions, ScrollDirection, ScrollEventType } from '../types'

/**
 * React 无缝滚动组件 Props
 */
export interface ScrollSeamlessProps extends Omit<ScrollOptions, 'onEvent'> {
  /** 自定义类名 */
  className?: string
  /** 自定义样式 */
  style?: React.CSSProperties
  /** 子内容（当使用自定义渲染时） */
  children?: React.ReactNode
  /** 事件回调 */
  onEvent?: (type: ScrollEventType, data?: any) => void
  /** 滚动开始回调 */
  onStart?: (event: any) => void
  /** 滚动停止回调 */
  onStop?: (event: any) => void
  /** 滚动暂停回调 */
  onPause?: (event: any) => void
  /** 滚动恢复回调 */
  onResume?: (event: any) => void
  /** 滚动更新回调 */
  onUpdate?: (event: any) => void
  /** 错误回调 */
  onError?: (event: any) => void
  /** 滚轮回调 */
  onWheel?: (event: any) => void
  /** 悬停回调 */
  onHover?: (event: any) => void
  /** 循环回调 */
  onCycle?: (event: any) => void
  /** 位置变化回调 */
  onPositionChange?: (event: any) => void
  /** 尺寸变化回调 */
  onResize?: (event: any) => void
}

/**
 * React 无缝滚动组件暴露的方法
 */
export interface ScrollSeamlessRef {
  start: () => void
  stop: () => void
  pause: () => void
  resume: () => void
  update: (data: string[]) => void
  getPosition: () => number
  getIsRunning: () => boolean
  getIsPaused: () => boolean
  getCycleCount: () => number
  getInstance: () => ScrollEngine | null
}

/**
 * React 无缝滚动组件
 * 
 * @example
 * ```tsx
 * <ScrollSeamless
 *   data={items}
 *   direction="left"
 *   step={1}
 *   hoverStop={false}
 *   onStart={() => console.log('started')}
 * />
 * ```
 * 
 * @example 使用 ref 控制
 * ```tsx
 * const ref = useRef<ScrollSeamlessRef>(null)
 * 
 * <ScrollSeamless
 *   ref={ref}
 *   data={items}
 *   direction="left"
 * />
 * 
 * // 控制滚动
 * ref.current?.start()
 * ref.current?.pause()
 * ```
 */
const ScrollSeamless = forwardRef<ScrollSeamlessRef, ScrollSeamlessProps>(
  (
    {
      // 必填项
      data,
      
      // 基础滚动
      direction = 'left',
      step = 1,
      stepWait = 0,
      delay = 0,
      
      // 布局
      rows = 1,
      cols = 1,
      minCountToScroll = 2,
      
      // 交互控制
      hoverStop = false,
      hoverDelay = 0,
      leaveDelay = 0,
      wheelEnable = false,
      wheelSensitivity = 1,
      wheelStep = 10,
      
      // 动画控制
      autoStart = true,
      
      // 虚拟滚动
      virtualScroll = false,
      bufferSize = 5,
      
      // 响应式
      enableResizeObserver = true,
      resizeDebounce = 100,
      
      // 其他
      fadeEdge,
      renderItem,
      onLoadMore,
      plugins,
      performance,
      
      // React 特有
      className,
      style,
      children,
      onEvent,
      onStart,
      onStop,
      onPause,
      onResume,
      onUpdate,
      onError,
      onWheel,
      onHover,
      onCycle,
      onPositionChange,
      onResize
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const scrollInstanceRef = useRef<ScrollEngine | null>(null)

    // 初始化滚动引擎
    const initEngine = useCallback(() => {
      if (!containerRef.current) return

      // 销毁旧实例
      if (scrollInstanceRef.current) {
        scrollInstanceRef.current.destroy()
        scrollInstanceRef.current = null
      }

      const options: ScrollOptions = {
        data,
        direction,
        step,
        stepWait,
        delay,
        rows,
        cols,
        minCountToScroll,
        hoverStop,
        hoverDelay,
        leaveDelay,
        wheelEnable,
        wheelSensitivity,
        wheelStep,
        autoStart,
        virtualScroll,
        bufferSize,
        enableResizeObserver,
        resizeDebounce,
        fadeEdge,
        renderItem,
        onLoadMore,
        plugins,
        performance,
        onEvent: (type: ScrollEventType, eventData: any) => {
          // 通用事件回调
          onEvent?.(type, eventData)

          // 具体事件回调
          switch (type) {
            case 'start':
              onStart?.(eventData)
              break
            case 'stop':
              onStop?.(eventData)
              break
            case 'pause':
              onPause?.(eventData)
              break
            case 'resume':
              onResume?.(eventData)
              break
            case 'update':
              onUpdate?.(eventData)
              break
            case 'error':
              onError?.(eventData)
              break
            case 'wheel':
              onWheel?.(eventData)
              break
            case 'hover':
              onHover?.(eventData)
              break
            case 'cycle':
              onCycle?.(eventData)
              break
            case 'position-change':
              onPositionChange?.(eventData)
              break
            case 'resize':
              onResize?.(eventData)
              break
          }
        }
      }

      try {
        scrollInstanceRef.current = new ScrollEngine(containerRef.current, options)
      } catch (error) {
        console.error('[ScrollSeamless] 初始化失败:', error)
        onError?.(error)
      }
    }, [
      data,
      direction,
      step,
      stepWait,
      delay,
      rows,
      cols,
      minCountToScroll,
      hoverStop,
      hoverDelay,
      leaveDelay,
      wheelEnable,
      wheelSensitivity,
      wheelStep,
      autoStart,
      virtualScroll,
      bufferSize,
      enableResizeObserver,
      resizeDebounce,
      fadeEdge,
      renderItem,
      onLoadMore,
      plugins,
      performance,
      onEvent,
      onStart,
      onStop,
      onPause,
      onResume,
      onUpdate,
      onError,
      onWheel,
      onHover,
      onCycle,
      onPositionChange,
      onResize
    ])

    // 生命周期
    useEffect(() => {
      initEngine()

      return () => {
        if (scrollInstanceRef.current) {
          scrollInstanceRef.current.destroy()
          scrollInstanceRef.current = null
        }
      }
    }, [initEngine])

    // 数据变化时重新初始化
    useEffect(() => {
      if (scrollInstanceRef.current) {
        initEngine()
      }
    }, [data, initEngine])

    // 暴露方法
    useImperativeHandle(
      ref,
      () => ({
        start: () => scrollInstanceRef.current?.start(),
        stop: () => scrollInstanceRef.current?.stop(),
        pause: () => scrollInstanceRef.current?.pause(),
        resume: () => scrollInstanceRef.current?.resume(),
        update: (newData: string[]) => {
          // 更新数据需要重新初始化
          if (scrollInstanceRef.current) {
            scrollInstanceRef.current.destroy()
            scrollInstanceRef.current = null
            // 这里无法直接更新props.data，需要父组件通过props传递新数据
            console.warn('[ScrollSeamless] 请通过 props.data 更新数据')
          }
        },
        getPosition: () => scrollInstanceRef.current?.getPosition() ?? 0,
        getIsRunning: () => scrollInstanceRef.current?.getIsRunning() ?? false,
        getIsPaused: () => scrollInstanceRef.current?.getIsPaused() ?? false,
        getCycleCount: () => scrollInstanceRef.current?.getCycleCount() ?? 0,
        getInstance: () => scrollInstanceRef.current
      }),
      []
    )

    return (
      <div
        ref={containerRef}
        className={`scroll-seamless-container ${className || ''}`}
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          position: 'relative',
          ...style
        }}
      >
        {children}
      </div>
    )
  }
)

ScrollSeamless.displayName = 'ScrollSeamless'

export default ScrollSeamless

declare module 'scroll-seamless' {
  import type { ReactNode, CSSProperties, ForwardRefExoticComponent, RefAttributes } from 'react'
  
  export type ScrollDirection = 'left' | 'right' | 'up' | 'down'
  
  export type ScrollEventType =
    | 'start'
    | 'stop'
    | 'pause'
    | 'resume'
    | 'destroy'
    | 'update'
    | 'error'
    | 'wheel'
    | 'hover'
    | 'cycle'
    | 'position-change'
    | 'delay-end'
    | 'resize'
    | 'performance-degrade'
    | 'offset'
    | 'cycle-count'
  
  export interface ScrollSeamlessProps {
    data: string[]
    direction?: ScrollDirection
    step?: number
    stepWait?: number
    hoverStop?: boolean
    hoverDelay?: number
    leaveDelay?: number
    delay?: number
    rows?: number
    cols?: number
    minCountToScroll?: number
    wheelEnable?: boolean
    wheelSensitivity?: number
    wheelStep?: number
    autoStart?: boolean
    virtualScroll?: boolean
    bufferSize?: number
    fadeEdge?: { enabled: boolean; size: number }
    renderItem?: (item: string, index: number) => HTMLElement
    keepRafOnPause?: boolean
    enableDomEvents?: boolean
    eventThrottle?: number
    minPoolSize?: number
    maxPoolSize?: number
    warmupPool?: boolean
    minCountToScroll?: number
    performance?: {
      enabled: boolean
      fps: boolean
      memory: boolean
      updateInterval: number
      onUpdate: (metrics: any) => void
    }
    className?: string
    style?: CSSProperties
    children?: ReactNode
    
    // 事件回调
    onEvent?: (type: ScrollEventType, data?: any) => void
    onStart?: (event: any) => void
    onStop?: (event: any) => void
    onPause?: (event: any) => void
    onResume?: (event: any) => void
  }
  
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
    getInstance: () => any
  }
  
  const ScrollSeamless: ForwardRefExoticComponent<
    ScrollSeamlessProps & RefAttributes<ScrollSeamlessRef>
  >
  
  export default ScrollSeamless
}

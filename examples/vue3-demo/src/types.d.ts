declare module 'scroll-seamless' {
  import type { DefineComponent, VNode, Slot } from 'vue'
  
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
  
  /** 作用域插槽数据类型 */
  export interface ScrollItemSlotData {
    item: string
    index: number
    data: string[]
  }
  
  /** 组件插槽类型 */
  export interface ScrollSeamlessSlots {
    /** 默认插槽（作用域插槽） */
    default?: (slotProps: ScrollItemSlotData) => VNode[]
    /** 自定义项插槽（作用域插槽） */
    item?: (slotProps: ScrollItemSlotData) => VNode[]
  }
  
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
    enableResizeObserver?: boolean
    resizeDebounce?: number
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
    performance?: {
      enabled: boolean
      fps: boolean
      memory: boolean
      updateInterval: number
      onUpdate: (metrics: any) => void
    }
    className?: string
    style?: Record<string, any>
  }
  
  export interface ScrollSeamlessExpose {
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
  
  export const ScrollSeamless: DefineComponent<
    ScrollSeamlessProps,
    {},
    {},
    {},
    ScrollSeamlessExpose,
    {},
    {},
    string,
    ScrollSeamlessSlots
  >
  
  export default ScrollSeamless
}

import { defineComponent, ref, onMounted, onBeforeUnmount, watch, h, computed, useSlots } from 'vue'
import { ScrollEngine } from '../core/ScrollEngine'
import type { ScrollOptions, ScrollDirection, ScrollEventType } from '../types'

export interface ScrollSeamlessProps {
  data: string[]
  direction?: ScrollDirection
  step?: number
  stepWait?: number
  hoverStop?: boolean
  hoverDelay?: number
  leaveDelay?: number
  delay?: number
  bezier?: [number, number, number, number]
  rows?: number
  cols?: number
  minCountToScroll?: number
  wheelEnable?: boolean
  wheelSensitivity?: number
  wheelStep?: number
  autoStart?: boolean
  virtualScroll?: boolean
  bufferSize?: number
  estimatedItemSize?: number
  fadeEdge?: any
  performance?: any
  accessibility?: any
  keyboard?: any
  className?: string
  style?: Record<string, any>
}

export interface ScrollSeamlessEmits {
  (e: 'start', event: any): void
  (e: 'stop', event: any): void
  (e: 'enter', event: any): void
  (e: 'leave', event: any): void
  (e: 'event', type: ScrollEventType, data?: any): void
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
  getInstance: () => ScrollEngine | null
}

export const ScrollSeamless = defineComponent({
  name: 'ScrollSeamless',
  props: {
    data: {
      type: Array as () => string[],
      required: true
    },
    direction: {
      type: String as () => ScrollDirection,
      default: 'left'
    },
    step: {
      type: Number,
      default: 1
    },
    stepWait: {
      type: Number,
      default: 0
    },
    hoverStop: {
      type: Boolean,
      default: false
    },
    hoverDelay: {
      type: Number,
      default: 0
    },
    leaveDelay: {
      type: Number,
      default: 0
    },
    delay: {
      type: Number,
      default: 0
    },
    rows: {
      type: Number,
      default: 0
    },
    cols: {
      type: Number,
      default: 0
    },
    minCountToScroll: {
      type: Number,
      default: 0
    },
    wheelEnable: {
      type: Boolean,
      default: false
    },
    autoStart: {
      type: Boolean,
      default: true
    },
    className: {
      type: String,
      default: ''
    },
    style: {
      type: Object as () => Record<string, any>,
      default: () => ({})
    }
  },
  emits: ['start', 'stop', 'enter', 'leave', 'event'],
  setup(props: ScrollSeamlessProps, { emit, expose }: { emit: ScrollSeamlessEmits, expose: (exposed: ScrollSeamlessExpose) => void }) {
    const containerRef = ref<HTMLElement | null>(null)
    const slots = useSlots()
    let scrollInstance: ScrollEngine | null = null

    const initEngine = () => {
      if (!containerRef.value) return

      // 销毁旧实例
      if (scrollInstance) {
        scrollInstance.destroy()
        scrollInstance = null
      }

      const options: ScrollOptions = {
        data: props.data,
        direction: props.direction,
        step: props.step,
        stepWait: props.stepWait,
        hoverStop: props.hoverStop,
        hoverDelay: props.hoverDelay,
        leaveDelay: props.leaveDelay,
        delay: props.delay,
        rows: props.rows,
        cols: props.cols,
        minCountToScroll: props.minCountToScroll,
        wheelEnable: props.wheelEnable,
        autoStart: props.autoStart,
        onEvent: (type: ScrollEventType, data?: any) => {
          emit('event', type, data)
          
          // 触发具体的事件
          switch (type) {
            case 'start':
              emit('start', data)
              break
            case 'stop':
              emit('stop', data)
              break
            case 'hover':
              emit('enter', data)
              break
          }
        }
      }

      scrollInstance = new ScrollEngine(containerRef.value, options)
      scrollInstance.start()
    }

    onMounted(() => {
      initEngine()
    })

    onBeforeUnmount(() => {
      if (scrollInstance) {
        scrollInstance.destroy()
        scrollInstance = null
      }
    })

    watch(
      () => props.data,
      () => {
        if (scrollInstance) {
          initEngine()
        }
      },
      { deep: true }
    )

    const exposedMethods: ScrollSeamlessExpose = {
      start: () => scrollInstance?.start(),
      stop: () => scrollInstance?.stop(),
      pause: () => scrollInstance?.pause(),
      resume: () => scrollInstance?.resume(),
      update: (data: string[]) => {
        if (scrollInstance) {
          // 需要手动更新数据和重新初始化
          scrollInstance.destroy()
          scrollInstance = null
          
          // 更新props.data会触发watch重新初始化
          // 这里只是提供一个接口
        }
      },
      getPosition: () => scrollInstance?.getPosition() || 0,
      getIsRunning: () => scrollInstance?.getIsRunning() || false,
      getIsPaused: () => scrollInstance?.getIsPaused() || false,
      getCycleCount: () => scrollInstance?.getCycleCount() || 0,
      getInstance: () => scrollInstance
    }

    expose(exposedMethods)

    // Vue 组件不需要渲染内容，只提供一个容器
    // ScrollEngine 会完全管理 DOM
    return () => h(
      'div',
      {
        ref: containerRef,
        class: `scroll-seamless-container ${props.className}`.trim(),
        style: {
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          position: 'relative',
          ...props.style
        }
      }
      // 注意：这里不渲染任何子元素
      // ScrollEngine 会在容器内创建 content1 和 content2
    )
  }
})

export default ScrollSeamless

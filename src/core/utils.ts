// 方向类型
import type { ScrollDirection } from '../types';

/**
 * 合法的滚动方向
 */
export const legalDirections = ['left', 'right', 'up', 'down'] as const;

/**
 * 获取合法的滚动方向，如果不合法则返回默认值 'left'
 * @param direction 滚动方向
 * @returns 合法的滚动方向
 */
export function getLegalDirection(direction: string): ScrollDirection {
  return (legalDirections.includes(direction as ScrollDirection) ? direction : 'left') as ScrollDirection;
}

/**
 * 获取内容的变换样式
 * @param direction 滚动方向
 * @param position 当前位置
 * @param totalLength 内容总长度
 * @param isSecondContent 是否是第二个内容元素
 * @returns 变换样式字符串
 */
export function getContentTransform(
  direction: ScrollDirection,
  position: number,
  totalLength: number,
  isSecondContent: boolean
): string {
  if (direction === 'left') {
    return `translateX(${-position + (isSecondContent ? totalLength : 0)}px)`;
  } else if (direction === 'right') {
    return `translateX(${-position - (isSecondContent ? totalLength : 0)}px)`;
  } else if (direction === 'up') {
    return `translateY(${-position + (isSecondContent ? totalLength : 0)}px)`;
  } else if (direction === 'down') {
    return `translateY(${-position - (isSecondContent ? totalLength : 0)}px)`;
  }
  return '';
}

/**
 * 计算下一个位置
 * @param direction 滚动方向
 * @param position 当前位置
 * @param step 步长
 * @param totalLength 内容总长度
 * @returns 下一个位置
 */
export function getNextPosition(
  direction: ScrollDirection,
  position: number,
  step: number,
  totalLength: number
): number {
  if (direction === 'left' || direction === 'up') {
    position += step;
    if (position >= totalLength) position = 0;
  } else if (direction === 'right' || direction === 'down') {
    position -= step;
    if (position <= -totalLength) position = 0;
  }
  return position;
}

/**
 * 获取内容样式
 * @param direction 滚动方向
 * @returns CSS样式对象
 */
export function getContentStyle(direction: ScrollDirection): Record<string, string | number> {
  if (direction === 'left' || direction === 'right') {
    return {
      position: 'absolute',
      top: 0,
      left: 0,
      display: 'inline-block',
      whiteSpace: 'nowrap',
      verticalAlign: 'top',
    };
  }
  return {
    position: 'absolute',
    top: 0,
    left: 0,
    display: 'block',
    whiteSpace: 'normal',
  };
}

/**
 * 触发事件
 * @param handler 事件处理函数
 * @param event 事件名称
 * @param payload 事件数据
 */
export function fireEvent(
  handler: ((event: string, payload?: any) => void) | undefined,
  event: string,
  payload?: any
): void {
  if (typeof handler === 'function') {
    handler(event, payload);
  }
}

/**
 * 获取渲染数据
 * @param data 原始数据
 * @param direction 滚动方向
 * @returns 处理后的数据
 */
export function getRenderData<T>(data: T[], direction: ScrollDirection): T[] {
  if (direction === 'right' || direction === 'down') {
    return data.slice().reverse();
  }
  return data;
}

/**
 * 防抖函数
 * @param fn 要执行的函数
 * @param delay 延迟时间
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: number | null = null;
  
  return function(this: any, ...args: Parameters<T>): void {
    if (timer) {
      clearTimeout(timer);
    }
    
    timer = window.setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay) as unknown as number;
  };
}

/**
 * 节流函数
 * @param fn 要执行的函数
 * @param limit 时间限制
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return function(this: any, ...args: Parameters<T>): void {
    const now = Date.now();
    
    if (now - lastCall >= limit) {
      fn.apply(this, args);
      lastCall = now;
    }
  };
}

/**
 * 检查浏览器支持的特性
 * @returns 支持的特性对象
 */
export function detectBrowserFeatures(): Record<string, boolean> {
  return {
    requestAnimationFrame: typeof window !== 'undefined' && 'requestAnimationFrame' in window,
    intersectionObserver: typeof window !== 'undefined' && 'IntersectionObserver' in window,
    resizeObserver: typeof window !== 'undefined' && 'ResizeObserver' in window,
    passiveEvents: checkPassiveEventSupport(),
    webAnimations: typeof Element !== 'undefined' && 'animate' in Element.prototype,
    transforms: checkCssPropertySupport('transform'),
    willChange: checkCssPropertySupport('willChange'),
  };
}

/**
 * 检查是否支持被动事件监听器
 * @returns 是否支持
 */
function checkPassiveEventSupport(): boolean {
  let supportsPassive = false;
  
  try {
    const opts = Object.defineProperty({}, 'passive', {
      get: function() {
        supportsPassive = true;
        return true;
      }
    });
    
    window.addEventListener('testPassive', null as any, opts);
    window.removeEventListener('testPassive', null as any, opts);
  } catch (e) {
    // 不支持
  }
  
  return supportsPassive;
}

/**
 * 检查是否支持某个CSS属性
 * @param property CSS属性
 * @returns 是否支持
 */
function checkCssPropertySupport(property: string): boolean {
  return typeof document !== 'undefined' && 
         document.documentElement && 
         property in document.documentElement.style;
}

/**
 * 安全地执行DOM操作
 * @param callback DOM操作回调
 * @returns 操作结果
 */
export function safeDOM<T>(callback: () => T): T | null {
  try {
    return callback();
  } catch (error) {
    console.error('DOM操作失败:', error);
    return null;
  }
}
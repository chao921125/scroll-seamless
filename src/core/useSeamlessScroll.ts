import type { ScrollSeamlessOptions, ScrollSeamlessController } from '../types';
import { DEFAULT_OPTIONS } from './index';

export function useSeamlessScroll(
  container: HTMLElement,
  options: ScrollSeamlessOptions
): ScrollSeamlessController {
  let running = false;
  let frameId: number | null = null;
  let position = 0;
  let opts = { ...DEFAULT_OPTIONS, ...options };
  const contents = container.querySelectorAll('.ss-content');
  if (contents.length < 2) {
    throw new Error('ScrollSeamless: container must have two .ss-content children');
  }
  const content1 = contents[0] as HTMLElement;
  const content2 = contents[1] as HTMLElement;
  let cycleCount = 0;

  function layout() {
    if (opts.direction === 'left' || opts.direction === 'right') {
      const width = content1.scrollWidth;
      content1.style.transform = `translateX(0)`;
      content2.style.transform = `translateX(${width}px)`;
    } else {
      const height = content1.scrollHeight;
      content1.style.transform = `translateY(0)`;
      content2.style.transform = `translateY(${height}px)`;
    }
    position = 0;
    cycleCount = 0;
  }

  function shouldScroll() {
    return true;
  }

  function start() {
    if (running) return;
    running = true;
    opts.onEvent?.('start', { type: 'start', direction: opts.direction, position, cycleCount });
    animate();
  }

  function stop() {
    running = false;
    if (frameId) cancelAnimationFrame(frameId);
    frameId = null;
    opts.onEvent?.('stop', { type: 'stop', direction: opts.direction, position, cycleCount });
  }

  function onMouseEnter() {
    if (opts.hoverStop) stop();
  }
  function onMouseLeave() {
    if (opts.hoverStop && shouldScroll()) start();
  }
  function onWheel(e: WheelEvent) {
    if (!opts.wheelEnable) return;
    e.preventDefault();
    position += e.deltaY || e.deltaX;
    updatePosition();
  }

  function updatePosition() {
    if (opts.direction === 'left' || opts.direction === 'right') {
      const width = content1.scrollWidth;
      if (Math.abs(position) >= width) {
        position = 0;
      }
      content1.style.transform = `translateX(${position}px)`;
      content2.style.transform = `translateX(${position + width}px)`;
    } else {
      const height = content1.scrollHeight;
      if (Math.abs(position) >= height) {
        position = 0;
      }
      content1.style.transform = `translateY(${position}px)`;
      content2.style.transform = `translateY(${position + height}px)`;
    }
  }

  function destroy() {
    stop();
    container.removeEventListener('mouseenter', onMouseEnter);
    container.removeEventListener('mouseleave', onMouseLeave);
    container.removeEventListener('wheel', onWheel);
    opts.onEvent?.('destroy', { type: 'destroy', direction: opts.direction, position, cycleCount });
  }

  function updateData() {
    layout();
    opts.onEvent?.('update', { type: 'update', direction: opts.direction, position, cycleCount });
    if (shouldScroll()) start();
    else stop();
  }

  function isRunning() {
    return running;
  }

  function setOptions(newOptions: Partial<ScrollSeamlessOptions>) {
    opts = { ...opts, ...newOptions };
    layout();
    if (shouldScroll()) start();
    else stop();
  }

  function animate() {
    if (!running) return;
    const step = opts.step;
    const stepWait = opts.stepWait;
    let needWait = false;
    const totalLength = getTotalLength();
    if (opts.direction === 'left' || opts.direction === 'up') {
      position += step;
      if (position >= totalLength) position = 0;
    } else if (opts.direction === 'right' || opts.direction === 'down') {
      position -= step;
      if (Math.abs(position) >= totalLength) position = 0;
    }
    if (opts.direction === 'left' || opts.direction === 'right') {
      content1.style.transform = `translateX(${-position}px)`;
      content2.style.transform = `translateX(${-position + totalLength}px)`;
    } else {
      content1.style.transform = `translateY(${-position}px)`;
      content2.style.transform = `translateY(${-position + totalLength}px)`;
    }
    if (stepWait > 0 && Math.abs(position) % step === 0) {
      needWait = true;
    }
    if (needWait && stepWait > 0) {
      setTimeout(() => {
        frameId = requestAnimationFrame(animate);
      }, stepWait);
    } else {
      frameId = requestAnimationFrame(animate);
    }
  }

  // 动态获取内容总长度（高度/宽度），适配四方向
  function getTotalLength() {
    if (opts.direction === 'left' || opts.direction === 'right') {
      // 横向，宽度
      let total = 0;
      const children = content1.children;
      for (let i = 0; i < children.length; i++) {
        const el = children[i] as HTMLElement;
        total += el.offsetWidth;
      }
      return total;
    } else {
      // 纵向，高度
      let total = 0;
      const children = content1.children;
      for (let i = 0; i < children.length; i++) {
        const el = children[i] as HTMLElement;
        total += el.offsetHeight;
      }
      return total;
    }
  }

  // 初始化
  container.style.overflow = 'hidden';
  container.style.position = 'relative';
  content1.style.position = content2.style.position = 'absolute';
  content1.style.top = content2.style.top = '0';
  content1.style.left = content2.style.left = '0';
  if (opts.direction === 'left' || opts.direction === 'right') {
    content1.style.display = content2.style.display = 'inline-block';
    content1.style.whiteSpace = content2.style.whiteSpace = 'nowrap';
  } else {
    content1.style.display = content2.style.display = 'block';
    content1.style.whiteSpace = content2.style.whiteSpace = 'normal';
  }
  layout();
  if (opts.hoverStop) {
    container.addEventListener('mouseenter', onMouseEnter);
    container.addEventListener('mouseleave', onMouseLeave);
  }
  if (opts.wheelEnable) {
    container.addEventListener('wheel', onWheel, { passive: false });
  }
  if (shouldScroll()) start();

  return {
    start,
    stop,
    destroy,
    updateData,
    setOptions,
    isRunning,
  };
} 
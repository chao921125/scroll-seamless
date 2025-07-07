import { SeamlessScrollOptions, SeamlessScrollController, ScrollDirection } from '../types';

const DEFAULT_OPTIONS: Required<Omit<SeamlessScrollOptions, 'data'>> = {
  direction: 'horizontal',
  minCountToScroll: 2,
  step: 1,
  stepWait: 0,
  delay: 0,
  bezier: [0.25, 0.1, 0.25, 1],
  hoverStop: true,
  wheelEnable: false,
  singleLine: false,
};

/**
 * 无缝滚动主类
 * @see https://github.com/chao921125/postcss-px-convert
 */
export class SeamlessScroll implements SeamlessScrollController {
  /** 滚动容器 */
  private container: HTMLElement;
  /** 配置项 */
  private options: Required<SeamlessScrollOptions>;
  /** 是否正在滚动 */
  private running = false;
  /** requestAnimationFrame id */
  private frameId: number | null = null;
  /** 暂停标记 */
  private paused = false;
  /** 内容节点1 */
  private content1: HTMLElement | null = null;
  /** 内容节点2 */
  private content2: HTMLElement | null = null;
  /** 当前滚动位置 */
  private position = 0;
  /** 悬停标记 */
  private hover = false;

  /**
   * 构造函数
   * @param container 滚动容器
   * @param options 配置项
   */
  constructor(container: HTMLElement, options: SeamlessScrollOptions) {
    this.container = container;
    this.options = { ...DEFAULT_OPTIONS, ...options, data: options.data };
    this.init();
  }

  /**
   * 初始化内容和事件
   */
  private init() {
    this.container.innerHTML = '';
    this.container.style.overflow = 'hidden';
    this.container.style.position = 'relative';
    this.content1 = document.createElement('div');
    this.content2 = document.createElement('div');
    this.setContent();
    this.container.appendChild(this.content1);
    this.container.appendChild(this.content2);
    this.layout();
    if (this.options.hoverStop) {
      this.container.addEventListener('mouseenter', this.onMouseEnter);
      this.container.addEventListener('mouseleave', this.onMouseLeave);
    }
    if (this.options.wheelEnable) {
      this.container.addEventListener('wheel', this.onWheel, { passive: false });
    }
    if (this.shouldScroll()) {
      this.start();
    }
  }

  /**
   * 设置内容 HTML
   */
  private setContent() {
    if (!this.content1 || !this.content2) return;
    const html = this.options.data.map(item => `<div class='ss-item'>${item}</div>`).join('');
    this.content1.innerHTML = html;
    this.content2.innerHTML = html;
    this.content1.className = 'ss-content';
    this.content2.className = 'ss-content';
    this.content1.style.position = this.content2.style.position = 'absolute';
    this.content1.style.top = this.content2.style.top = '0';
    this.content1.style.left = this.content2.style.left = '0';
    this.content1.style.whiteSpace = this.content2.style.whiteSpace = this.options.direction === 'horizontal' ? 'nowrap' : 'normal';
    this.content1.style.display = this.content2.style.display = this.options.singleLine ? 'inline-block' : 'block';
  }

  /**
   * 重新布局内容
   */
  private layout() {
    if (!this.content1 || !this.content2) return;
    if (this.options.direction === 'horizontal') {
      const width = this.content1.scrollWidth;
      this.content1.style.transform = `translateX(0)`;
      this.content2.style.transform = `translateX(${width}px)`;
    } else {
      const height = this.content1.scrollHeight;
      this.content1.style.transform = `translateY(0)`;
      this.content2.style.transform = `translateY(${height}px)`;
    }
    this.position = 0;
  }

  /**
   * 判断是否需要滚动
   */
  private shouldScroll() {
    return this.options.data.length >= this.options.minCountToScroll;
  }

  /**
   * 鼠标移入事件
   */
  private onMouseEnter = () => {
    this.hover = true;
    if (this.options.hoverStop) this.stop();
  };

  /**
   * 鼠标移出事件
   */
  private onMouseLeave = () => {
    this.hover = false;
    if (this.options.hoverStop && this.shouldScroll()) this.start();
  };

  /**
   * 鼠标滚轮事件
   */
  private onWheel = (e: WheelEvent) => {
    if (!this.options.wheelEnable) return;
    e.preventDefault();
    this.position += e.deltaY || e.deltaX;
    this.updatePosition();
  };

  /**
   * 启动滚动动画
   */
  public start(): void {
    if (this.running) return;
    this.running = true;
    this.animate();
  }

  /**
   * 停止滚动动画
   */
  public stop(): void {
    this.running = false;
    if (this.frameId) cancelAnimationFrame(this.frameId);
    this.frameId = null;
  }

  /**
   * 销毁实例，解绑事件
   */
  public destroy(): void {
    this.stop();
    this.container.innerHTML = '';
    this.container.removeEventListener('mouseenter', this.onMouseEnter);
    this.container.removeEventListener('mouseleave', this.onMouseLeave);
    this.container.removeEventListener('wheel', this.onWheel);
  }

  /**
   * 是否正在滚动
   */
  public isRunning(): boolean {
    return this.running;
  }

  /**
   * 更新滚动数据
   * @param data 新数据
   */
  public updateData(data: string[]): void {
    this.options.data = data;
    this.setContent();
    this.layout();
    if (this.shouldScroll()) this.start();
    else this.stop();
  }

  /**
   * 动态更新参数
   * @param options 新参数
   */
  public setOptions(options: Partial<SeamlessScrollOptions>): void {
    this.options = { ...this.options, ...options };
    this.setContent();
    this.layout();
    if (this.shouldScroll()) this.start();
    else this.stop();
  }

  /**
   * 动画帧回调
   */
  private animate = () => {
    if (!this.running || !this.content1 || !this.content2) return;
    const step = this.options.step;
    if (this.options.direction === 'horizontal') {
      const width = this.content1.scrollWidth;
      this.position -= step;
      if (-this.position >= width) {
        this.position += width;
      }
      this.content1.style.transform = `translateX(${this.position}px)`;
      this.content2.style.transform = `translateX(${this.position + width}px)`;
    } else {
      const height = this.content1.scrollHeight;
      this.position -= step;
      if (-this.position >= height) {
        this.position += height;
      }
      this.content1.style.transform = `translateY(${this.position}px)`;
      this.content2.style.transform = `translateY(${this.position + height}px)`;
    }
    this.frameId = requestAnimationFrame(this.animate);
  };

  /**
   * 更新内容位置
   */
  private updatePosition() {
    if (!this.content1 || !this.content2) return;
    if (this.options.direction === 'horizontal') {
      const width = this.content1.scrollWidth;
      if (-this.position >= width) {
        this.position += width;
      } else if (this.position > 0) {
        this.position -= width;
      }
      this.content1.style.transform = `translateX(${this.position}px)`;
      this.content2.style.transform = `translateX(${this.position + width}px)`;
    } else {
      const height = this.content1.scrollHeight;
      if (-this.position >= height) {
        this.position += height;
      } else if (this.position > 0) {
        this.position -= height;
      }
      this.content1.style.transform = `translateY(${this.position}px)`;
      this.content2.style.transform = `translateY(${this.position + height}px)`;
    }
  }
}

export default SeamlessScroll;

import { ScrollSeamlessOptions, ScrollSeamlessController } from '../types';

const DEFAULT_OPTIONS: Required<Omit<ScrollSeamlessOptions, 'data'>> = {
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

export class ScrollSeamless implements ScrollSeamlessController {
  private container: HTMLElement;
  private content1: HTMLElement;
  private content2: HTMLElement;
  private options: Required<ScrollSeamlessOptions>;
  private running = false;
  private frameId: number | null = null;
  private position = 0;

  constructor(container: HTMLElement, options: ScrollSeamlessOptions) {
    this.container = container;
    this.options = { ...DEFAULT_OPTIONS, ...options };
    // 只查找内容节点，不生成内容
    const contents = container.querySelectorAll('.ss-content');
    if (contents.length < 2) {
      throw new Error('ScrollSeamless: container must have two .ss-content children');
    }
    this.content1 = contents[0] as HTMLElement;
    this.content2 = contents[1] as HTMLElement;
    this.init();
  }

  private init() {
    this.container.style.overflow = 'hidden';
    this.container.style.position = 'relative';
    this.content1.style.position = this.content2.style.position = 'absolute';
    this.content1.style.top = this.content2.style.top = '0';
    this.content1.style.left = this.content2.style.left = '0';
    if (this.options.direction === 'horizontal') {
      this.content1.style.display = this.content2.style.display = 'inline-block';
      this.content1.style.whiteSpace = this.content2.style.whiteSpace = 'nowrap';
    } else {
      this.content1.style.display = this.content2.style.display = 'block';
      this.content1.style.whiteSpace = this.content2.style.whiteSpace = 'normal';
    }
    this.layout();
    if (this.shouldScroll()) this.start();
  }

  private layout() {
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

  private shouldScroll() {
    // 由外部保证内容数量
    return true;
  }

  public start(): void {
    if (this.running) return;
    this.running = true;
    this.animate();
  }

  public stop(): void {
    this.running = false;
    if (this.frameId) cancelAnimationFrame(this.frameId);
    this.frameId = null;
  }

  public destroy(): void {
    this.stop();
    // 不清空 innerHTML
  }

  public updateData(): void {
    // 外部重新渲染 slot 后，需手动调用 layout
    this.layout();
    if (this.shouldScroll()) this.start();
    else this.stop();
  }

  public isRunning(): boolean {
    return this.running;
  }

  public setOptions(options: Partial<ScrollSeamlessOptions>): void {
    this.options = { ...this.options, ...options };
    this.layout();
    if (this.shouldScroll()) this.start();
    else this.stop();
  }

  private animate = () => {
    if (!this.running) return;
    const step = this.options.step;
    if (this.options.direction === 'horizontal') {
      const width = this.content1.scrollWidth;
      this.position -= step;
      if (Math.abs(this.position) >= width) {
        this.position = 0;
      }
      this.content1.style.transform = `translateX(${this.position}px)`;
      this.content2.style.transform = `translateX(${this.position + width}px)`;
    } else {
      const height = this.content1.scrollHeight;
      this.position -= step;
      if (Math.abs(this.position) >= height) {
        this.position = 0;
      }
      this.content1.style.transform = `translateY(${this.position}px)`;
      this.content2.style.transform = `translateY(${this.position + height}px)`;
    }
    this.frameId = requestAnimationFrame(this.animate);
  };
}

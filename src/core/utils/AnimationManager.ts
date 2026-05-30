/**
 * AnimationManager - 动画管理器
 * 
 * 职责：
 * - 管理RAF循环
 * - 固定时间步长控制
 * - 暂停/恢复处理
 * - 动画回调执行
 */

export type AnimationCallback = (deltaTime: number) => boolean;

export class AnimationManager {
  private rafId: number | null = null;
  private lastTime: number = 0;
  private accumulator: number = 0;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private keepRafOnPause: boolean = true;
  private fixedTimeStep: number = 16.67;
  private maxDeltaTime: number = 100;
  private callbacks: AnimationCallback[] = [];

  constructor(options: {
    fixedTimeStep?: number;
    maxDeltaTime?: number;
    keepRafOnPause?: boolean;
  } = {}) {
    this.fixedTimeStep = options.fixedTimeStep ?? 16.67;
    this.maxDeltaTime = options.maxDeltaTime ?? 100;
    this.keepRafOnPause = options.keepRafOnPause ?? true;
  }

  /**
   * 注册动画回调
   */
  addCallback(callback: AnimationCallback): void {
    this.callbacks.push(callback);
  }

  /**
   * 移除动画回调
   */
  removeCallback(callback: AnimationCallback): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  /**
   * 清空所有回调
   */
  clearCallbacks(): void {
    this.callbacks = [];
  }

  /**
   * 启动动画循环
   */
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    this.accumulator = 0;

    if (this.keepRafOnPause || !this.isPaused) {
      this.rafId = requestAnimationFrame(this.animationLoop);
    }
  }

  /**
   * 停止动画循环
   */
  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    this.isPaused = false;

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    this.accumulator = 0;
    this.clearCallbacks();
  }

  /**
   * 暂停动画
   */
  pause(): void {
    if (!this.isRunning || this.isPaused) return;

    this.isPaused = true;

    if (!this.keepRafOnPause && this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * 恢复动画
   */
  resume(): void {
    if (!this.isRunning || !this.isPaused) return;

    this.isPaused = false;
    this.lastTime = performance.now();
    this.accumulator = 0;

    if (!this.keepRafOnPause || this.rafId === null) {
      this.rafId = requestAnimationFrame(this.animationLoop);
    }
  }

  /**
   * 动画循环
   */
  private animationLoop = (currentTime: number): void => {
    if (!this.isRunning) return;

    // 如果暂停中，继续RAF但不执行回调
    if (this.isPaused) {
      if (this.keepRafOnPause) {
        this.rafId = requestAnimationFrame(this.animationLoop);
      }
      return;
    }

    // 计算时间间隔
    let deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // 限制最大时间间隔（防止标签页切换后跳跃）
    if (deltaTime > this.maxDeltaTime) {
      deltaTime = this.maxDeltaTime;
    }

    // 累加时间
    this.accumulator += deltaTime;

    // 固定时间步长更新
    while (this.accumulator >= this.fixedTimeStep) {
      // 执行所有动画回调
      let shouldContinue = true;
      for (const callback of this.callbacks) {
        try {
          const result = callback(this.fixedTimeStep);
          if (!result) {
            shouldContinue = false;
          }
        } catch (error) {
          console.error('[AnimationManager] Callback error:', error);
          shouldContinue = false;
        }
      }

      // 如果任何回调返回false，停止动画
      if (!shouldContinue) {
        this.stop();
        return;
      }

      this.accumulator -= this.fixedTimeStep;
    }

    // 继续下一帧
    this.rafId = requestAnimationFrame(this.animationLoop);
  };

  /**
   * 获取运行状态
   */
  getIsRunning(): boolean {
    return this.isRunning;
  }

  /**
   * 获取暂停状态
   */
  getIsPaused(): boolean {
    return this.isPaused;
  }

  /**
   * 销毁动画管理器
   */
  destroy(): void {
    this.stop();
  }
}

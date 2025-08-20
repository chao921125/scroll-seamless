/**
 * 动画接口定义
 */
export interface Animation {
  id: string;
  callback: (timestamp: number) => boolean; // 返回true继续动画，false停止
  priority: number; // 优先级，数字越小优先级越高
  startTime?: number;
  lastFrameTime?: number;
}

/**
 * 性能监控接口
 */
export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  droppedFrames: number;
  activeAnimations: number;
}

/**
 * 统一的requestAnimationFrame调度器
 * 解决多实例时的动画性能问题
 */
export class RAFScheduler {
  private static instance: RAFScheduler | null = null;
  private animations = new Map<string, Animation>();
  private isRunning = false;
  private rafId: number | null = null;
  private lastTimestamp = 0;
  private frameCount = 0;
  private droppedFrames = 0;
  private fpsHistory: number[] = [];
  private maxFPSHistory = 60;
  private frameTimeThreshold = 16.67; // ~60fps (1000ms / 60fps)

  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): RAFScheduler {
    if (!RAFScheduler.instance) {
      RAFScheduler.instance = new RAFScheduler();
    }
    return RAFScheduler.instance;
  }

  /**
   * 添加动画到调度队列
   */
  schedule(animation: Animation): void {
    animation.startTime = performance.now();
    this.animations.set(animation.id, animation);
    
    if (!this.isRunning) {
      this.start();
    }
  }

  /**
   * 移除动画
   */
  unschedule(animationId: string): void {
    this.animations.delete(animationId);
    
    if (this.animations.size === 0) {
      this.stop();
    }
  }

  /**
   * 暂停特定动画 - 增强版本，确保暂停状态正确管理
   */
  pause(animationId: string): void {
    const animation = this.animations.get(animationId);
    if (animation) {
      // 添加暂停标记和时间戳
      (animation as any).paused = true;
      (animation as any).pausedAt = performance.now();
      
      // 记录暂停前的最后帧时间
      if (animation.lastFrameTime) {
        (animation as any).lastActiveFrameTime = animation.lastFrameTime;
      }
    }
  }

  /**
   * 恢复特定动画 - 增强版本，确保恢复时时间连续性
   */
  resume(animationId: string): void {
    const animation = this.animations.get(animationId);
    if (animation && (animation as any).paused) {
      const now = performance.now();
      const pausedDuration = now - ((animation as any).pausedAt || now);
      
      // 恢复动画状态
      (animation as any).paused = false;
      
      // 调整开始时间以补偿暂停时间
      if (animation.startTime) {
        animation.startTime += pausedDuration;
      }
      
      // 更新最后帧时间
      animation.lastFrameTime = now;
      
      // 清理暂停相关的临时属性
      delete (animation as any).pausedAt;
      delete (animation as any).lastActiveFrameTime;
    }
  }

  /**
   * 暂停所有动画
   */
  pauseAll(): void {
    this.animations.forEach(animation => {
      (animation as any).paused = true;
    });
  }

  /**
   * 恢复所有动画
   */
  resumeAll(): void {
    this.animations.forEach(animation => {
      (animation as any).paused = false;
    });
  }

  /**
   * 开始调度循环
   */
  private start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastTimestamp = performance.now();
    this.tick();
  }

  /**
   * 停止调度循环
   */
  private stop(): void {
    this.isRunning = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * 主要的动画循环
   */
  private tick = (): void => {
    if (!this.isRunning) return;

    const timestamp = performance.now();
    const deltaTime = timestamp - this.lastTimestamp;
    
    // 计算FPS
    this.updateFPS(deltaTime);
    
    // 检查是否需要跳帧
    if (deltaTime < this.frameTimeThreshold * 0.8) {
      // 帧率过高，可以适当延迟
      this.rafId = requestAnimationFrame(this.tick);
      return;
    }

    // 按优先级排序动画
    const sortedAnimations = Array.from(this.animations.values())
      .sort((a, b) => a.priority - b.priority);

    const completedAnimations: string[] = [];
    let frameTimeUsed = 0;
    const maxFrameTime = this.frameTimeThreshold * 1.2; // 允许超出20%

    // 执行动画
    for (const animation of sortedAnimations) {
      // 跳过暂停的动画
      if ((animation as any).paused) {
        // 更新暂停动画的时间戳以保持同步
        (animation as any).pausedAt = timestamp;
        continue;
      }

      const animationStart = performance.now();
      
      try {
        const shouldContinue = animation.callback(timestamp);
        
        if (!shouldContinue) {
          completedAnimations.push(animation.id);
        }
        
        animation.lastFrameTime = timestamp;
      } catch (error) {
        console.error(`动画执行错误 (${animation.id}):`, error);
        completedAnimations.push(animation.id);
      }

      frameTimeUsed += performance.now() - animationStart;
      
      // 如果单帧时间过长，跳过剩余低优先级动画
      if (frameTimeUsed > maxFrameTime) {
        this.droppedFrames++;
        break;
      }
    }

    // 清理完成的动画
    completedAnimations.forEach(id => {
      this.animations.delete(id);
    });

    this.lastTimestamp = timestamp;
    this.frameCount++;

    // 继续下一帧或停止
    if (this.animations.size > 0) {
      this.rafId = requestAnimationFrame(this.tick);
    } else {
      this.stop();
    }
  };

  /**
   * 更新FPS统计
   */
  private updateFPS(deltaTime: number): void {
    const fps = 1000 / deltaTime;
    this.fpsHistory.push(fps);
    
    if (this.fpsHistory.length > this.maxFPSHistory) {
      this.fpsHistory.shift();
    }
  }

  /**
   * 获取当前性能指标
   */
  getPerformanceMetrics(): PerformanceMetrics {
    const avgFPS = this.fpsHistory.length > 0 
      ? this.fpsHistory.reduce((sum, fps) => sum + fps, 0) / this.fpsHistory.length
      : 0;

    return {
      fps: Math.round(avgFPS),
      frameTime: this.fpsHistory.length > 0 ? 1000 / avgFPS : 0,
      droppedFrames: this.droppedFrames,
      activeAnimations: this.animations.size
    };
  }

  /**
   * 获取调度器状态
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      frameCount: this.frameCount,
      ...this.getPerformanceMetrics()
    };
  }

  /**
   * 重置性能统计
   */
  resetStats(): void {
    this.frameCount = 0;
    this.droppedFrames = 0;
    this.fpsHistory.length = 0;
  }

  /**
   * 销毁调度器
   */
  destroy(): void {
    this.stop();
    this.animations.clear();
    this.resetStats();
    RAFScheduler.instance = null;
  }
}

/**
 * 动画辅助函数
 */
export class AnimationHelper {
  private static idCounter = 0;

  /**
   * 生成唯一动画ID
   */
  static generateId(prefix = 'anim'): string {
    return `${prefix}_${++this.idCounter}_${Date.now()}`;
  }

  /**
   * 创建简单的位移动画
   */
  static createTransformAnimation(
    element: HTMLElement,
    from: { x: number; y: number },
    to: { x: number; y: number },
    duration: number,
    easing: (t: number) => number = (t) => t
  ): Animation {
    const id = this.generateId('transform');
    let startTime: number | null = null;

    return {
      id,
      priority: 1,
      callback: (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easing(progress);

        const currentX = from.x + (to.x - from.x) * easedProgress;
        const currentY = from.y + (to.y - from.y) * easedProgress;

        element.style.transform = `translate(${currentX}px, ${currentY}px)`;

        return progress < 1;
      }
    };
  }

  /**
   * 创建无限滚动动画
   */
  static createScrollAnimation(
    element: HTMLElement,
    direction: 'left' | 'right' | 'up' | 'down',
    speed: number,
    contentSize: number
  ): Animation {
    const id = this.generateId('scroll');
    let position = 0;
    let lastTimestamp: number | null = null;

    return {
      id,
      priority: 1,
      callback: (timestamp: number) => {
        if (!lastTimestamp) lastTimestamp = timestamp;
        
        const deltaTime = timestamp - lastTimestamp;
        const movement = (speed * deltaTime) / 16.67; // 标准化到60fps

        switch (direction) {
          case 'left':
          case 'up':
            position += movement;
            if (position >= contentSize) position = 0;
            break;
          case 'right':
          case 'down':
            position -= movement;
            if (position <= -contentSize) position = 0;
            break;
        }

        if (direction === 'left' || direction === 'right') {
          element.style.transform = `translateX(${-position}px)`;
        } else {
          element.style.transform = `translateY(${-position}px)`;
        }

        lastTimestamp = timestamp;
        return true; // 无限循环
      }
    };
  }
}

// 导出单例实例
export const rafScheduler = RAFScheduler.getInstance();
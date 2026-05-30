/**
 * FadeEdgeManager - 渐隐边缘管理器
 * 
 * 职责：
 * - 创建和管理渐隐遮罩层
 * - 根据方向设置渐变效果
 * - 响应容器尺寸变化
 */

import type { ScrollDirection, FadeEdgeOptions } from '../../types';
import { DirectionHandler } from './DirectionHandler';

export class FadeEdgeManager {
  private container: HTMLElement;
  private direction: ScrollDirection;
  private options: Required<FadeEdgeOptions>;
  private startFade: HTMLElement | null = null;
  private endFade: HTMLElement | null = null;
  private isHorizontal: boolean;

  constructor(
    container: HTMLElement,
    direction: ScrollDirection,
    options: FadeEdgeOptions = {}
  ) {
    this.container = container;
    this.direction = direction;
    this.isHorizontal = DirectionHandler.isHorizontal(direction);
    
    // 合并默认配置
    this.options = {
      enabled: options.enabled ?? false,
      direction: options.direction ?? 'auto',
      size: options.size ?? 50,
      color: options.color ?? 'transparent',
      zIndex: options.zIndex ?? 10,
    };

    if (this.options.enabled) {
      this.create();
    }
  }

  /**
   * 创建渐隐层
   */
  private create(): void {
    // 确定渐隐方向
    let fadeDirection = this.options.direction;
    if (fadeDirection === 'auto') {
      fadeDirection = 'both';
    }

    // 获取渐隐颜色
    const color = this.options.color === 'transparent'
      ? this.getContainerBackgroundColor()
      : this.options.color;

    // 创建起始侧渐隐层
    if (fadeDirection === 'start' || fadeDirection === 'both') {
      this.startFade = this.createFadeElement('start', color);
      this.container.insertBefore(this.startFade, this.container.firstChild);
    }

    // 创建结束侧渐隐层
    if (fadeDirection === 'end' || fadeDirection === 'both') {
      this.endFade = this.createFadeElement('end', color);
      this.container.appendChild(this.endFade);
    }
  }

  /**
   * 创建单个渐隐元素
   */
  private createFadeElement(type: 'start' | 'end', color: string): HTMLElement {
    const fade = document.createElement('div');
    fade.className = `ss-fade-edge ss-fade-${type}`;
    
    // 基础样式
    fade.style.position = 'absolute';
    fade.style.pointerEvents = 'none';
    fade.style.zIndex = String(this.options.zIndex);

    // 根据方向和类型设置样式
    if (this.isHorizontal) {
      fade.style.top = '0';
      fade.style.bottom = '0';
      fade.style.width = `${this.options.size}px`;
      
      if (type === 'start') {
        fade.style.left = '0';
        fade.style.background = `linear-gradient(to right, ${color}, transparent)`;
      } else {
        fade.style.right = '0';
        fade.style.background = `linear-gradient(to left, ${color}, transparent)`;
      }
    } else {
      fade.style.left = '0';
      fade.style.right = '0';
      fade.style.height = `${this.options.size}px`;
      
      if (type === 'start') {
        fade.style.top = '0';
        fade.style.background = `linear-gradient(to bottom, ${color}, transparent)`;
      } else {
        fade.style.bottom = '0';
        fade.style.background = `linear-gradient(to top, ${color}, transparent)`;
      }
    }

    return fade;
  }

  /**
   * 获取容器背景色
   */
  private getContainerBackgroundColor(): string {
    const style = window.getComputedStyle(this.container);
    return style.backgroundColor || 'transparent';
  }

  /**
   * 更新渐隐层
   */
  update(): void {
    if (!this.options.enabled) return;

    // 销毁旧的
    this.destroy();
    
    // 重新创建
    this.create();
  }

  /**
   * 启用/禁用
   */
  setEnabled(enabled: boolean): void {
    if (enabled && !this.options.enabled) {
      this.options.enabled = true;
      this.create();
    } else if (!enabled && this.options.enabled) {
      this.options.enabled = false;
      this.destroy();
    }
  }

  /**
   * 销毁渐隐层
   */
  destroy(): void {
    if (this.startFade && this.startFade.parentNode) {
      this.startFade.parentNode.removeChild(this.startFade);
      this.startFade = null;
    }
    if (this.endFade && this.endFade.parentNode) {
      this.endFade.parentNode.removeChild(this.endFade);
      this.endFade = null;
    }
  }
}

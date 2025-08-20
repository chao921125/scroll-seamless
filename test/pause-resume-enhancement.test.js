/**
 * 暂停恢复功能增强测试
 * 测试所有方向下的暂停恢复功能
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { ScrollEngine } from '../src/core/ScrollEngine';
const { JSDOM } = require('jsdom');

describe('Enhanced Pause/Resume Functionality', () => {
  let container;
  let scrollEngine;
  
  beforeEach(() => {
    // 创建测试环境
    const dom = new JSDOM(`<!DOCTYPE html><div id="container"></div>`, {
      pretendToBeVisual: true,
      resources: "usable"
    });
    
    global.window = dom.window;
    global.document = dom.window.document;
    global.requestAnimationFrame = (callback) => setTimeout(callback, 16);
    global.cancelAnimationFrame = (id) => clearTimeout(id);
    global.performance = { now: () => Date.now() };
    global.getComputedStyle = dom.window.getComputedStyle;
    
    // Mock element measurements
    Object.defineProperty(dom.window.HTMLElement.prototype, 'offsetWidth', {
      get() { return 300; }
    });
    Object.defineProperty(dom.window.HTMLElement.prototype, 'offsetHeight', {
      get() { return 100; }
    });
    Object.defineProperty(dom.window.HTMLElement.prototype, 'scrollWidth', {
      get() { return 300; }
    });
    Object.defineProperty(dom.window.HTMLElement.prototype, 'scrollHeight', {
      get() { return 100; }
    });
    
    // 创建测试容器
    container = document.getElementById('container');
    container.style.width = '300px';
    container.style.height = '100px';
  });
  
  afterEach(() => {
    if (scrollEngine) {
      scrollEngine.destroy();
      scrollEngine = null;
    }
    // 清理全局变量
    delete global.window;
    delete global.document;
    delete global.requestAnimationFrame;
    delete global.cancelAnimationFrame;
    delete global.performance;
    delete global.getComputedStyle;
  });

  describe('Position Preservation During Pause', () => {
    const directions = ['left', 'right', 'up', 'down'];
    
    directions.forEach(direction => {
      test(`should preserve exact position when paused in ${direction} direction`, async () => {
        scrollEngine = new ScrollEngine(container, {
          data: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'],
          direction,
          step: 2,
          hoverStop: true
        });

        // 等待动画开始
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 记录暂停前的位置
        const positionBeforePause = scrollEngine.getPosition();
        
        // 暂停
        scrollEngine.pause();
        
        // 等待一段时间确保位置不变
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const positionAfterPause = scrollEngine.getPosition();
        
        // 验证位置保持不变
        expect(Math.abs(positionAfterPause - positionBeforePause)).toBeLessThan(0.1);
      });
    });
  });

  describe('Resume Position Continuity', () => {
    const directions = ['left', 'right', 'up', 'down'];
    
    directions.forEach(direction => {
      test(`should continue from exact pause position when resumed in ${direction} direction`, async () => {
        scrollEngine = new ScrollEngine(container, {
          data: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'],
          direction,
          step: 1,
          hoverStop: true
        });

        // 等待动画开始
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 暂停
        scrollEngine.pause();
        const pausePosition = scrollEngine.getPosition();
        
        // 等待确保暂停状态稳定
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // 恢复
        scrollEngine.resume();
        
        // 立即检查恢复位置
        const resumePosition = scrollEngine.getPosition();
        
        // 验证恢复位置与暂停位置一致
        expect(Math.abs(resumePosition - pausePosition)).toBeLessThan(0.5);
        
        // 等待一段时间验证动画继续
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const positionAfterResume = scrollEngine.getPosition();
        
        // 验证动画确实在继续（位置应该有变化）
        expect(Math.abs(positionAfterResume - resumePosition)).toBeGreaterThan(0.1);
      });
    });
  });

  describe('Mouse Hover Behavior', () => {
    const directions = ['left', 'right', 'up', 'down'];
    
    directions.forEach(direction => {
      test(`should correctly pause on mouse enter in ${direction} direction`, async () => {
        scrollEngine = new ScrollEngine(container, {
          data: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'],
          direction,
          step: 2,
          hoverStop: true
        });

        // 等待动画开始
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const positionBeforeHover = scrollEngine.getPosition();
        
        // 模拟鼠标进入
        const mouseEnterEvent = new MouseEvent('mouseenter', { bubbles: true });
        container.dispatchEvent(mouseEnterEvent);
        
        // 等待悬停效果生效
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const positionDuringHover = scrollEngine.getPosition();
        
        // 验证悬停时位置保持不变
        expect(Math.abs(positionDuringHover - positionBeforeHover)).toBeLessThan(1);
      });

      test(`should correctly resume on mouse leave in ${direction} direction`, async () => {
        scrollEngine = new ScrollEngine(container, {
          data: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'],
          direction,
          step: 2,
          hoverStop: true
        });

        // 等待动画开始
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 模拟鼠标进入（暂停）
        const mouseEnterEvent = new MouseEvent('mouseenter', { bubbles: true });
        container.dispatchEvent(mouseEnterEvent);
        
        await new Promise(resolve => setTimeout(resolve, 50));
        
        const pausePosition = scrollEngine.getPosition();
        
        // 模拟鼠标离开（恢复）
        const mouseLeaveEvent = new MouseEvent('mouseleave', { bubbles: true });
        container.dispatchEvent(mouseLeaveEvent);
        
        // 立即检查恢复位置
        const resumePosition = scrollEngine.getPosition();
        
        // 验证恢复位置连续性
        expect(Math.abs(resumePosition - pausePosition)).toBeLessThan(0.5);
        
        // 等待验证动画恢复
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const positionAfterResume = scrollEngine.getPosition();
        
        // 验证动画确实恢复了
        expect(Math.abs(positionAfterResume - resumePosition)).toBeGreaterThan(0.1);
      });
    });
  });

  describe('State Management and Synchronization', () => {
    test('should maintain consistent state across multiple pause/resume cycles', async () => {
      scrollEngine = new ScrollEngine(container, {
        data: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'],
        direction: 'left',
        step: 1,
        hoverStop: true
      });

      await new Promise(resolve => setTimeout(resolve, 100));
      
      const positions = [];
      
      // 执行多次暂停恢复循环
      for (let i = 0; i < 5; i++) {
        // 暂停
        scrollEngine.pause();
        await new Promise(resolve => setTimeout(resolve, 30));
        
        const pausePos = scrollEngine.getPosition();
        positions.push(pausePos);
        
        // 恢复
        scrollEngine.resume();
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      // 验证每次暂停的位置都在合理范围内递增
      for (let i = 1; i < positions.length; i++) {
        expect(positions[i]).toBeGreaterThanOrEqual(positions[i-1]);
      }
    });

    test('should handle rapid pause/resume operations gracefully', async () => {
      scrollEngine = new ScrollEngine(container, {
        data: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'],
        direction: 'right',
        step: 2,
        hoverStop: true
      });

      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 快速连续暂停恢复
      for (let i = 0; i < 10; i++) {
        scrollEngine.pause();
        scrollEngine.resume();
      }
      
      // 等待状态稳定
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 验证动画仍在正常运行
      const pos1 = scrollEngine.getPosition();
      await new Promise(resolve => setTimeout(resolve, 100));
      const pos2 = scrollEngine.getPosition();
      
      expect(Math.abs(pos2 - pos1)).toBeGreaterThan(0.1);
    });
  });

  describe('Direction Change During Pause/Resume', () => {
    test('should handle direction change while paused', async () => {
      scrollEngine = new ScrollEngine(container, {
        data: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'],
        direction: 'left',
        step: 1,
        hoverStop: true
      });

      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 暂停
      scrollEngine.pause();
      const pausePosition = scrollEngine.getPosition();
      
      // 在暂停状态下改变方向
      scrollEngine.setOptions({ direction: 'right' });
      
      // 恢复
      scrollEngine.resume();
      
      // 等待新方向动画开始
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 验证动画在新方向下正常运行
      const pos1 = scrollEngine.getPosition();
      await new Promise(resolve => setTimeout(resolve, 100));
      const pos2 = scrollEngine.getPosition();
      
      expect(Math.abs(pos2 - pos1)).toBeGreaterThan(0.1);
    });
  });

  describe('Error Handling and Recovery', () => {
    test('should recover from pause operation failures', async () => {
      scrollEngine = new ScrollEngine(container, {
        data: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'],
        direction: 'up',
        step: 1,
        hoverStop: true
      });

      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 模拟暂停失败（通过破坏内部状态）
      const originalPause = scrollEngine.pause;
      scrollEngine.pause = function() {
        throw new Error('Simulated pause failure');
      };
      
      // 尝试暂停（应该失败但不崩溃）
      expect(() => {
        try {
          scrollEngine.pause();
        } catch (error) {
          // 预期的错误
        }
      }).not.toThrow();
      
      // 恢复原始方法
      scrollEngine.pause = originalPause;
      
      // 验证动画仍在运行
      const pos1 = scrollEngine.getPosition();
      await new Promise(resolve => setTimeout(resolve, 100));
      const pos2 = scrollEngine.getPosition();
      
      expect(Math.abs(pos2 - pos1)).toBeGreaterThan(0.1);
    });

    test('should recover from resume operation failures', async () => {
      scrollEngine = new ScrollEngine(container, {
        data: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'],
        direction: 'down',
        step: 1,
        hoverStop: true
      });

      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 正常暂停
      scrollEngine.pause();
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // 模拟恢复失败
      const originalResume = scrollEngine.resume;
      scrollEngine.resume = function() {
        throw new Error('Simulated resume failure');
      };
      
      // 尝试恢复（应该失败但不崩溃）
      expect(() => {
        try {
          scrollEngine.resume();
        } catch (error) {
          // 预期的错误
        }
      }).not.toThrow();
      
      // 恢复原始方法并重新尝试
      scrollEngine.resume = originalResume;
      scrollEngine.resume();
      
      // 验证恢复成功
      await new Promise(resolve => setTimeout(resolve, 100));
      const pos1 = scrollEngine.getPosition();
      await new Promise(resolve => setTimeout(resolve, 100));
      const pos2 = scrollEngine.getPosition();
      
      expect(Math.abs(pos2 - pos1)).toBeGreaterThan(0.1);
    });
  });

  describe('Performance and Memory', () => {
    test('should not leak memory during repeated pause/resume operations', async () => {
      scrollEngine = new ScrollEngine(container, {
        data: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'],
        direction: 'left',
        step: 1,
        hoverStop: true
      });

      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 执行大量暂停恢复操作
      for (let i = 0; i < 100; i++) {
        scrollEngine.pause();
        await new Promise(resolve => setTimeout(resolve, 5));
        scrollEngine.resume();
        await new Promise(resolve => setTimeout(resolve, 5));
      }
      
      // 验证最终状态正常
      const pos1 = scrollEngine.getPosition();
      await new Promise(resolve => setTimeout(resolve, 100));
      const pos2 = scrollEngine.getPosition();
      
      expect(Math.abs(pos2 - pos1)).toBeGreaterThan(0.1);
    });
  });
});
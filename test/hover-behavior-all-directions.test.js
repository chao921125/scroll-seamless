/**
 * 鼠标悬停行为测试 - 所有方向
 * 测试所有滚动方向下的鼠标悬停暂停和恢复行为
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { ScrollEngine } from '../src/core/ScrollEngine';
const { JSDOM } = require('jsdom');

describe('Mouse Hover Behavior - All Directions', () => {
  let container;
  let scrollEngine;
  
  beforeEach(() => {
    // 创建测试环境
    const dom = new JSDOM(`<!DOCTYPE html><div id="container"></div>`);
    global.window = dom.window;
    global.document = dom.window.document;
    global.requestAnimationFrame = (callback) => setTimeout(callback, 16);
    global.cancelAnimationFrame = (id) => clearTimeout(id);
    global.performance = { now: () => Date.now() };
    global.MouseEvent = dom.window.MouseEvent;
    
    // 创建测试容器
    container = document.getElementById('container');
    container.style.width = '300px';
    container.style.height = '100px';
    container.style.position = 'relative';
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
    delete global.MouseEvent;
  });

  describe('Hover Pause Behavior', () => {
    const directions = ['left', 'right', 'up', 'down'];
    
    directions.forEach(direction => {
      test(`should immediately pause on mouse enter in ${direction} direction`, async () => {
        let pauseEventTriggered = false;
        
        scrollEngine = new ScrollEngine(container, {
          data: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5', 'Item 6'],
          direction,
          step: 2,
          hoverStop: true,
          onEvent: (eventType, data) => {
            if (eventType === 'pause') {
              pauseEventTriggered = true;
            }
          }
        });

        // 等待动画开始并稳定
        await new Promise(resolve => setTimeout(resolve, 150));
        
        // 记录悬停前的位置
        const positionBeforeHover = scrollEngine.getPosition();
        
        // 模拟鼠标进入事件
        const mouseEnterEvent = new MouseEvent('mouseenter', { 
          bubbles: true,
          cancelable: true 
        });
        container.dispatchEvent(mouseEnterEvent);
        
        // 立即检查暂停效果
        await new Promise(resolve => setTimeout(resolve, 10));
        
        const positionAfterHover = scrollEngine.getPosition();
        
        // 验证位置立即停止变化
        expect(Math.abs(positionAfterHover - positionBeforeHover)).toBeLessThan(1);
        
        // 等待更长时间确保位置保持不变
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const positionAfterWait = scrollEngine.getPosition();
        expect(Math.abs(positionAfterWait - positionAfterHover)).toBeLessThan(0.1);
        
        // 验证暂停事件被触发
        expect(pauseEventTriggered).toBe(true);
      });

      test(`should maintain precise position during hover in ${direction} direction`, async () => {
        scrollEngine = new ScrollEngine(container, {
          data: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5', 'Item 6'],
          direction,
          step: 1,
          hoverStop: true
        });

        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 触发悬停
        const mouseEnterEvent = new MouseEvent('mouseenter', { bubbles: true });
        container.dispatchEvent(mouseEnterEvent);
        
        await new Promise(resolve => setTimeout(resolve, 20));
        
        // 记录悬停期间的多个位置点
        const positions = [];
        for (let i = 0; i < 5; i++) {
          positions.push(scrollEngine.getPosition());
          await new Promise(resolve => setTimeout(resolve, 20));
        }
        
        // 验证所有位置都相同（精确暂停）
        const firstPosition = positions[0];
        positions.forEach(position => {
          expect(Math.abs(position - firstPosition)).toBeLessThan(0.1);
        });
      });
    });
  });

  describe('Hover Resume Behavior', () => {
    const directions = ['left', 'right', 'up', 'down'];
    
    directions.forEach(direction => {
      test(`should smoothly resume on mouse leave in ${direction} direction`, async () => {
        let resumeEventTriggered = false;
        
        scrollEngine = new ScrollEngine(container, {
          data: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5', 'Item 6'],
          direction,
          step: 2,
          hoverStop: true,
          onEvent: (eventType, data) => {
            if (eventType === 'resume') {
              resumeEventTriggered = true;
            }
          }
        });

        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 悬停暂停
        const mouseEnterEvent = new MouseEvent('mouseenter', { bubbles: true });
        container.dispatchEvent(mouseEnterEvent);
        
        await new Promise(resolve => setTimeout(resolve, 50));
        
        const pausePosition = scrollEngine.getPosition();
        
        // 离开恢复
        const mouseLeaveEvent = new MouseEvent('mouseleave', { bubbles: true });
        container.dispatchEvent(mouseLeaveEvent);
        
        // 立即检查恢复位置
        const resumePosition = scrollEngine.getPosition();
        
        // 验证恢复位置连续性
        expect(Math.abs(resumePosition - pausePosition)).toBeLessThan(0.5);
        
        // 等待动画恢复
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const positionAfterResume = scrollEngine.getPosition();
        
        // 验证动画确实恢复了
        expect(Math.abs(positionAfterResume - resumePosition)).toBeGreaterThan(0.5);
        
        // 验证恢复事件被触发
        expect(resumeEventTriggered).toBe(true);
      });

      test(`should handle rapid hover events in ${direction} direction`, async () => {
        scrollEngine = new ScrollEngine(container, {
          data: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5', 'Item 6'],
          direction,
          step: 1,
          hoverStop: true
        });

        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 快速连续的鼠标进入和离开事件
        for (let i = 0; i < 5; i++) {
          const mouseEnterEvent = new MouseEvent('mouseenter', { bubbles: true });
          container.dispatchEvent(mouseEnterEvent);
          
          await new Promise(resolve => setTimeout(resolve, 10));
          
          const mouseLeaveEvent = new MouseEvent('mouseleave', { bubbles: true });
          container.dispatchEvent(mouseLeaveEvent);
          
          await new Promise(resolve => setTimeout(resolve, 10));
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
  });

  describe('Hover State Validation', () => {
    test('should correctly validate hover states across all directions', async () => {
      const directions = ['left', 'right', 'up', 'down'];
      
      for (const direction of directions) {
        // 为每个方向创建新的实例
        if (scrollEngine) {
          scrollEngine.destroy();
        }
        
        scrollEngine = new ScrollEngine(container, {
          data: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'],
          direction,
          step: 1,
          hoverStop: true
        });

        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 悬停
        const mouseEnterEvent = new MouseEvent('mouseenter', { bubbles: true });
        container.dispatchEvent(mouseEnterEvent);
        
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // 验证暂停状态
        const pausePosition = scrollEngine.getPosition();
        
        // 等待确保位置不变
        await new Promise(resolve => setTimeout(resolve, 50));
        
        const positionAfterWait = scrollEngine.getPosition();
        expect(Math.abs(positionAfterWait - pausePosition)).toBeLessThan(0.1);
        
        // 恢复
        const mouseLeaveEvent = new MouseEvent('mouseleave', { bubbles: true });
        container.dispatchEvent(mouseLeaveEvent);
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 验证恢复后动画继续
        const pos1 = scrollEngine.getPosition();
        await new Promise(resolve => setTimeout(resolve, 50));
        const pos2 = scrollEngine.getPosition();
        
        expect(Math.abs(pos2 - pos1)).toBeGreaterThan(0.1);
      }
    });
  });

  describe('Hover with Direction Changes', () => {
    test('should handle hover during direction transitions', async () => {
      scrollEngine = new ScrollEngine(container, {
        data: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'],
        direction: 'left',
        step: 1,
        hoverStop: true
      });

      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 悬停暂停
      const mouseEnterEvent = new MouseEvent('mouseenter', { bubbles: true });
      container.dispatchEvent(mouseEnterEvent);
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // 在悬停状态下改变方向
      scrollEngine.setOptions({ direction: 'right' });
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // 离开恢复
      const mouseLeaveEvent = new MouseEvent('mouseleave', { bubbles: true });
      container.dispatchEvent(mouseLeaveEvent);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 验证新方向下的动画正常
      const pos1 = scrollEngine.getPosition();
      await new Promise(resolve => setTimeout(resolve, 100));
      const pos2 = scrollEngine.getPosition();
      
      expect(Math.abs(pos2 - pos1)).toBeGreaterThan(0.1);
    });
  });

  describe('Hover Error Handling', () => {
    test('should handle hover events when hoverStop is disabled', async () => {
      scrollEngine = new ScrollEngine(container, {
        data: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'],
        direction: 'left',
        step: 2,
        hoverStop: false // 禁用悬停暂停
      });

      await new Promise(resolve => setTimeout(resolve, 100));
      
      const positionBefore = scrollEngine.getPosition();
      
      // 触发悬停事件（应该被忽略）
      const mouseEnterEvent = new MouseEvent('mouseenter', { bubbles: true });
      container.dispatchEvent(mouseEnterEvent);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const positionAfter = scrollEngine.getPosition();
      
      // 验证动画继续运行（没有暂停）
      expect(Math.abs(positionAfter - positionBefore)).toBeGreaterThan(1);
    });

    test('should handle hover events when scroll engine is stopped', async () => {
      scrollEngine = new ScrollEngine(container, {
        data: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'],
        direction: 'left',
        step: 1,
        hoverStop: true
      });

      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 停止滚动引擎
      scrollEngine.stop();
      
      // 触发悬停事件（应该被忽略）
      const mouseEnterEvent = new MouseEvent('mouseenter', { bubbles: true });
      container.dispatchEvent(mouseEnterEvent);
      
      const mouseLeaveEvent = new MouseEvent('mouseleave', { bubbles: true });
      container.dispatchEvent(mouseLeaveEvent);
      
      // 验证没有错误抛出
      expect(() => {
        container.dispatchEvent(mouseEnterEvent);
        container.dispatchEvent(mouseLeaveEvent);
      }).not.toThrow();
    });
  });

  describe('Hover Performance', () => {
    test('should handle hover events efficiently across all directions', async () => {
      const directions = ['left', 'right', 'up', 'down'];
      
      for (const direction of directions) {
        if (scrollEngine) {
          scrollEngine.destroy();
        }
        
        const startTime = performance.now();
        
        scrollEngine = new ScrollEngine(container, {
          data: Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`),
          direction,
          step: 1,
          hoverStop: true
        });

        await new Promise(resolve => setTimeout(resolve, 50));
        
        // 执行多次悬停操作
        for (let i = 0; i < 10; i++) {
          const mouseEnterEvent = new MouseEvent('mouseenter', { bubbles: true });
          container.dispatchEvent(mouseEnterEvent);
          
          await new Promise(resolve => setTimeout(resolve, 5));
          
          const mouseLeaveEvent = new MouseEvent('mouseleave', { bubbles: true });
          container.dispatchEvent(mouseLeaveEvent);
          
          await new Promise(resolve => setTimeout(resolve, 5));
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // 验证性能合理（应该在合理时间内完成）
        expect(duration).toBeLessThan(1000); // 1秒内完成
        
        // 验证最终状态正常
        await new Promise(resolve => setTimeout(resolve, 50));
        const pos1 = scrollEngine.getPosition();
        await new Promise(resolve => setTimeout(resolve, 50));
        const pos2 = scrollEngine.getPosition();
        
        expect(Math.abs(pos2 - pos1)).toBeGreaterThan(0.1);
      }
    });
  });
});
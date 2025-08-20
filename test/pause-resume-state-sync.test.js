/**
 * 暂停恢复状态同步测试
 * 测试暂停恢复功能的状态管理和同步机制
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { ScrollEngine } from '../src/core/ScrollEngine';
const { JSDOM } = require('jsdom');

describe('Pause/Resume State Synchronization', () => {
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
  });

  describe('Transform State Synchronization', () => {
    const directions = ['left', 'right', 'up', 'down'];
    
    directions.forEach(direction => {
      test(`should synchronize transform with position state in ${direction} direction`, async () => {
        scrollEngine = new ScrollEngine(container, {
          data: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'],
          direction,
          step: 2,
          hoverStop: true
        });

        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 暂停并检查变换同步
        scrollEngine.pause();
        
        const position = scrollEngine.getPosition();
        
        // 获取内容元素的变换值
        const isHorizontal = direction === 'left' || direction === 'right';
        const states = isHorizontal ? 
          scrollEngine.rowStates || [] : 
          scrollEngine.colStates || [];
        
        if (states.length > 0) {
          const state = states[0];
          const transform = state.content1.style.transform;
          
          // 验证变换字符串包含正确的变换类型
          if (isHorizontal) {
            expect(transform).toContain('translateX');
          } else {
            expect(transform).toContain('translateY');
          }
        }
        
        // 恢复并验证同步继续
        scrollEngine.resume();
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const newPosition = scrollEngine.getPosition();
        expect(Math.abs(newPosition - position)).toBeGreaterThan(0.1);
      });
    });
  });

  describe('Animation State Consistency', () => {
    test('should maintain consistent animation states across pause/resume cycles', async () => {
      scrollEngine = new ScrollEngine(container, {
        data: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'],
        direction: 'left',
        step: 1,
        hoverStop: true
      });

      await new Promise(resolve => setTimeout(resolve, 100));
      
      const stateSnapshots = [];
      
      // 执行多个暂停恢复周期并记录状态
      for (let i = 0; i < 3; i++) {
        // 暂停
        scrollEngine.pause();
        await new Promise(resolve => setTimeout(resolve, 30));
        
        const pauseState = {
          position: scrollEngine.getPosition(),
          cycle: i,
          type: 'pause'
        };
        stateSnapshots.push(pauseState);
        
        // 恢复
        scrollEngine.resume();
        await new Promise(resolve => setTimeout(resolve, 50));
        
        const resumeState = {
          position: scrollEngine.getPosition(),
          cycle: i,
          type: 'resume'
        };
        stateSnapshots.push(resumeState);
      }
      
      // 验证状态一致性
      for (let i = 0; i < stateSnapshots.length - 1; i++) {
        const current = stateSnapshots[i];
        const next = stateSnapshots[i + 1];
        
        if (current.type === 'pause' && next.type === 'resume' && current.cycle === next.cycle) {
          // 同一周期内的暂停和恢复位置应该接近
          expect(Math.abs(next.position - current.position)).toBeLessThan(1);
        }
      }
    });
  });

  describe('Multi-Direction State Management', () => {
    test('should handle state synchronization when switching between horizontal and vertical', async () => {
      scrollEngine = new ScrollEngine(container, {
        data: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'],
        direction: 'left',
        step: 1,
        hoverStop: true
      });

      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 水平方向暂停
      scrollEngine.pause();
      const horizontalPausePos = scrollEngine.getPosition();
      
      // 切换到垂直方向
      scrollEngine.setOptions({ direction: 'up' });
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // 恢复（现在是垂直方向）
      scrollEngine.resume();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 验证垂直方向动画正常
      const pos1 = scrollEngine.getPosition();
      await new Promise(resolve => setTimeout(resolve, 100));
      const pos2 = scrollEngine.getPosition();
      
      expect(Math.abs(pos2 - pos1)).toBeGreaterThan(0.1);
    });
  });

  describe('Error Recovery and State Restoration', () => {
    test('should recover from state corruption during pause', async () => {
      scrollEngine = new ScrollEngine(container, {
        data: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'],
        direction: 'right',
        step: 2,
        hoverStop: true
      });

      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 正常暂停
      scrollEngine.pause();
      const normalPausePos = scrollEngine.getPosition();
      
      // 模拟状态损坏（修改内部位置）
      if (scrollEngine.rowStates && scrollEngine.rowStates.length > 0) {
        scrollEngine.rowStates[0].position = -999; // 无效位置
      }
      
      // 尝试恢复（应该能处理无效状态）
      scrollEngine.resume();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 验证动画恢复正常
      const pos1 = scrollEngine.getPosition();
      await new Promise(resolve => setTimeout(resolve, 100));
      const pos2 = scrollEngine.getPosition();
      
      expect(Math.abs(pos2 - pos1)).toBeGreaterThan(0.1);
    });

    test('should handle resume when animation IDs are missing', async () => {
      scrollEngine = new ScrollEngine(container, {
        data: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'],
        direction: 'down',
        step: 1,
        hoverStop: true
      });

      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 暂停
      scrollEngine.pause();
      
      // 模拟动画ID丢失
      if (scrollEngine.colStates && scrollEngine.colStates.length > 0) {
        scrollEngine.colStates[0].animationId = null;
      }
      
      // 尝试恢复（应该能处理缺失的动画ID）
      expect(() => {
        scrollEngine.resume();
      }).not.toThrow();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 验证系统仍然稳定
      expect(scrollEngine.getPosition()).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Concurrent State Operations', () => {
    test('should handle concurrent pause/resume operations safely', async () => {
      scrollEngine = new ScrollEngine(container, {
        data: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'],
        direction: 'left',
        step: 1,
        hoverStop: true
      });

      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 并发执行多个暂停恢复操作
      const operations = [];
      
      for (let i = 0; i < 5; i++) {
        operations.push(
          new Promise(resolve => {
            setTimeout(() => {
              scrollEngine.pause();
              setTimeout(() => {
                scrollEngine.resume();
                resolve();
              }, 10);
            }, i * 5);
          })
        );
      }
      
      // 等待所有操作完成
      await Promise.all(operations);
      
      // 等待状态稳定
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 验证最终状态正常
      const pos1 = scrollEngine.getPosition();
      await new Promise(resolve => setTimeout(resolve, 100));
      const pos2 = scrollEngine.getPosition();
      
      expect(Math.abs(pos2 - pos1)).toBeGreaterThan(0.1);
    });
  });

  describe('Memory and Resource Management', () => {
    test('should properly clean up state during destroy', async () => {
      scrollEngine = new ScrollEngine(container, {
        data: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'],
        direction: 'up',
        step: 1,
        hoverStop: true
      });

      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 执行一些暂停恢复操作
      scrollEngine.pause();
      await new Promise(resolve => setTimeout(resolve, 50));
      scrollEngine.resume();
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // 销毁实例
      scrollEngine.destroy();
      
      // 验证容器被清空
      expect(container.innerHTML).toBe('');
      
      // 尝试在销毁后调用方法（应该不会崩溃）
      expect(() => {
        scrollEngine.pause();
        scrollEngine.resume();
      }).not.toThrow();
    });
  });

  describe('Event Synchronization', () => {
    test('should trigger events in correct order during state transitions', async () => {
      const events = [];
      
      scrollEngine = new ScrollEngine(container, {
        data: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'],
        direction: 'left',
        step: 1,
        hoverStop: true,
        onEvent: (eventType, data) => {
          events.push({
            type: eventType,
            timestamp: Date.now(),
            data
          });
        }
      });

      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 清空启动事件
      events.length = 0;
      
      // 执行暂停恢复序列
      scrollEngine.pause();
      await new Promise(resolve => setTimeout(resolve, 30));
      
      scrollEngine.resume();
      await new Promise(resolve => setTimeout(resolve, 30));
      
      // 验证事件顺序
      const pauseEvents = events.filter(e => e.type === 'pause');
      const resumeEvents = events.filter(e => e.type === 'resume');
      
      expect(pauseEvents.length).toBeGreaterThan(0);
      expect(resumeEvents.length).toBeGreaterThan(0);
      
      // 验证暂停事件在恢复事件之前
      if (pauseEvents.length > 0 && resumeEvents.length > 0) {
        expect(pauseEvents[0].timestamp).toBeLessThan(resumeEvents[0].timestamp);
      }
    });
  });
});
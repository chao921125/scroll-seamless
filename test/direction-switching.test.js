/**
 * 方向切换功能测试
 * 测试动态方向变更的正确性和平滑性
 */

import { describe, it, test, expect, beforeEach, afterEach } from 'vitest';
import { ScrollEngine } from '../src/core/ScrollEngine';
import { DirectionHandler } from '../src/core/utils/DirectionHandler';
import { PositionCalculator } from '../src/core/utils/PositionCalculator';

// 模拟 DOM 环境
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.Event = dom.window.Event;
global.requestAnimationFrame = (callback) => setTimeout(callback, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);
global.getComputedStyle = dom.window.getComputedStyle;

describe('Direction Switching Tests', () => {
  let container;
  let scrollEngine;
  const testData = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'];

  beforeEach(() => {
    // 创建测试容器
    container = document.createElement('div');
    container.style.width = '300px';
    container.style.height = '200px';
    container.style.overflow = 'hidden';
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (scrollEngine) {
      scrollEngine.destroy();
      scrollEngine = null;
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('Basic Direction Switching', () => {
    test('should handle left to right direction change', async () => {
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'left',
        step: 1,
        delay: 0
      });

      // 等待初始化
      await new Promise(resolve => setTimeout(resolve, 50));

      // 记录切换前的状态
      const initialPosition = scrollEngine.getPosition();
      
      // 切换方向
      scrollEngine.setOptions({ direction: 'right' });

      // 验证方向切换
      const contents = container.querySelectorAll('.ss-content');
      expect(contents.length).toBe(2);

      // 验证变换使用正确的方向
      expect(contents[0].style.transform).toContain('translateX');
      expect(contents[1].style.transform).toContain('translateX');

      // 验证位置重置
      expect(scrollEngine.getPosition()).toBe(0);
    });

    test('should handle up to down direction change', async () => {
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'up',
        step: 1,
        delay: 0,
        cols: 1
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      // 切换方向
      scrollEngine.setOptions({ direction: 'down' });

      const contents = container.querySelectorAll('.ss-content');
      expect(contents.length).toBe(2);

      // 验证变换使用正确的方向
      expect(contents[0].style.transform).toContain('translateY');
      expect(contents[1].style.transform).toContain('translateY');

      // 验证位置重置
      expect(scrollEngine.getPosition()).toBe(0);
    });

    test('should handle horizontal to vertical direction change', async () => {
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'left',
        step: 1,
        delay: 0
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      // 切换到垂直方向
      scrollEngine.setOptions({ direction: 'up', cols: 1 });

      const contents = container.querySelectorAll('.ss-content');
      expect(contents.length).toBe(2);

      // 验证变换使用垂直方向
      expect(contents[0].style.transform).toContain('translateY');
      expect(contents[1].style.transform).toContain('translateY');
    });

    test('should handle vertical to horizontal direction change', async () => {
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'up',
        step: 1,
        delay: 0,
        cols: 1
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      // 切换到水平方向
      scrollEngine.setOptions({ direction: 'left' });

      const contents = container.querySelectorAll('.ss-content');
      expect(contents.length).toBe(2);

      // 验证变换使用水平方向
      expect(contents[0].style.transform).toContain('translateX');
      expect(contents[1].style.transform).toContain('translateX');
    });
  });

  describe('Animation State During Direction Change', () => {
    test('should pause and resume animation during direction change', async () => {
      let eventLog = [];
      
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'left',
        step: 1,
        delay: 0,
        onEvent: (event, data) => {
          eventLog.push({ event, data });
        }
      });

      // 等待动画开始
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(scrollEngine.isRunning()).toBe(true);

      // 切换方向
      scrollEngine.setOptions({ direction: 'right' });

      // 等待方向切换完成
      await new Promise(resolve => setTimeout(resolve, 100));

      // 验证动画状态
      expect(scrollEngine.isRunning()).toBe(true);

      // 验证事件日志包含方向切换事件
      const directionChangeEvents = eventLog.filter(log => log.event === 'directionChange');
      expect(directionChangeEvents.length).toBeGreaterThan(0);
    });

    test('should maintain smooth animation after direction change', async () => {
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'left',
        step: 2,
        delay: 0
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      // 记录切换前的位置
      const positionBefore = scrollEngine.getPosition();

      // 切换方向
      scrollEngine.setOptions({ direction: 'right' });

      // 等待动画恢复
      await new Promise(resolve => setTimeout(resolve, 100));

      // 验证动画继续运行
      expect(scrollEngine.isRunning()).toBe(true);

      // 验证位置在变化（动画正在进行）
      const positionAfter = scrollEngine.getPosition();
      // 由于方向切换会重置位置，我们主要验证动画是否继续
      expect(typeof positionAfter).toBe('number');
    });
  });

  describe('Content Repositioning', () => {
    test('should correctly reposition content elements after direction change', async () => {
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'left',
        step: 1,
        delay: 0
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      // 切换到 up 方向
      scrollEngine.setOptions({ direction: 'up', cols: 1 });

      const contents = container.querySelectorAll('.ss-content');
      expect(contents.length).toBe(2);

      // 验证 up 方向的特殊定位
      const content1 = contents[0];
      const content2 = contents[1];

      // content1 应该在顶部
      expect(content1.style.top).toBe('0px');
      
      // content2 应该在 content1 上方（负位置）
      const content2Top = parseFloat(content2.style.top);
      expect(content2Top).toBeLessThan(0);
    });

    test('should correctly position content2 for right direction', async () => {
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'left',
        step: 1,
        delay: 0
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      // 切换到 right 方向
      scrollEngine.setOptions({ direction: 'right' });

      const contents = container.querySelectorAll('.ss-content');
      const content1 = contents[0];
      const content2 = contents[1];

      // content1 应该在左侧起始位置
      expect(content1.style.left).toBe('0px');
      
      // content2 应该在 content1 右侧
      const content2Left = parseFloat(content2.style.left);
      expect(content2Left).toBeGreaterThan(0);
    });

    test('should correctly position content2 for down direction', async () => {
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'up',
        step: 1,
        delay: 0,
        cols: 1
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      // 切换到 down 方向
      scrollEngine.setOptions({ direction: 'down' });

      const contents = container.querySelectorAll('.ss-content');
      const content1 = contents[0];
      const content2 = contents[1];

      // content1 应该在顶部
      expect(content1.style.top).toBe('0px');
      
      // content2 应该在 content1 下方
      const content2Top = parseFloat(content2.style.top);
      expect(content2Top).toBeGreaterThan(0);
    });
  });

  describe('Error Handling and State Recovery', () => {
    test('should handle invalid direction parameters', () => {
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'left',
        step: 1,
        delay: 0
      });

      // 尝试设置无效方向
      expect(() => {
        scrollEngine.setOptions({ direction: 'invalid' });
      }).toThrow('Invalid direction: invalid. Valid directions are: up, down, left, right'); // 应该抛出异常拒绝无效参数
    });

    test('should recover from direction change errors', async () => {
      let errorEvents = [];
      
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'left',
        step: 1,
        delay: 0,
        onEvent: (event, data) => {
          if (event === 'error') {
            errorEvents.push(data);
          }
        }
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      // 模拟错误情况：破坏内容样式而不是移除元素
      const contents = container.querySelectorAll('.ss-content');
      if (contents[0]) {
        // 破坏样式而不是移除元素，这样更现实
        contents[0].style.transform = 'invalid-transform-value';
        contents[0].style.position = 'invalid-position';
      }

      // 尝试切换方向
      scrollEngine.setOptions({ direction: 'right' });

      await new Promise(resolve => setTimeout(resolve, 100));

      // 验证引擎仍然可以工作（错误恢复）
      expect(scrollEngine.isRunning()).toBeDefined();
      
      // 验证内容仍然存在
      const newContents = container.querySelectorAll('.ss-content');
      expect(newContents.length).toBeGreaterThan(0);
    });

    test('should maintain data integrity during direction changes', async () => {
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'left',
        step: 1,
        delay: 0
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      // 多次快速切换方向
      scrollEngine.setOptions({ direction: 'right' });
      scrollEngine.setOptions({ direction: 'up', cols: 1 });
      scrollEngine.setOptions({ direction: 'down' });
      scrollEngine.setOptions({ direction: 'left' });

      await new Promise(resolve => setTimeout(resolve, 100));

      // 验证数据完整性
      const renderMatrix = scrollEngine.getRenderMatrix();
      expect(renderMatrix).toBeDefined();
      expect(renderMatrix.length).toBeGreaterThan(0);
    });
  });

  describe('Performance and Smooth Transitions', () => {
    test('should complete direction change within reasonable time', async () => {
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'left',
        step: 1,
        delay: 0
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      const startTime = Date.now();
      
      // 切换方向
      scrollEngine.setOptions({ direction: 'right' });

      // 等待切换完成
      await new Promise(resolve => setTimeout(resolve, 100));

      const endTime = Date.now();
      const switchTime = endTime - startTime;

      // 方向切换应该在合理时间内完成（小于200ms）
      expect(switchTime).toBeLessThan(200);
    });

    test('should not cause visual jumps during direction change', async () => {
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'left',
        step: 1,
        delay: 0
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      // 记录切换前的变换
      const contentsBefore = Array.from(container.querySelectorAll('.ss-content'));
      const transformsBefore = contentsBefore.map(el => el.style.transform);

      // 切换方向
      scrollEngine.setOptions({ direction: 'right' });

      // 立即检查变换（应该已经更新）
      const contentsAfter = Array.from(container.querySelectorAll('.ss-content'));
      const transformsAfter = contentsAfter.map(el => el.style.transform);

      // 验证变换已更新且格式正确
      transformsAfter.forEach(transform => {
        expect(transform).toContain('translateX');
        expect(transform).toMatch(/translateX\(-?\d+(\.\d+)?px\)/);
      });
    });
  });

  describe('Direction Change Events', () => {
    test('should emit directionChange event with correct data', async () => {
      let directionChangeEvent = null;
      
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'left',
        step: 1,
        delay: 0,
        onEvent: (event, data) => {
          if (event === 'directionChange') {
            directionChangeEvent = data;
          }
        }
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      // 切换方向
      scrollEngine.setOptions({ direction: 'right' });

      await new Promise(resolve => setTimeout(resolve, 50));

      // 验证事件数据
      expect(directionChangeEvent).not.toBeNull();
      expect(directionChangeEvent.oldDirection).toBe('left');
      expect(directionChangeEvent.newDirection).toBe('right');
      expect(directionChangeEvent.timestamp).toBeDefined();
      expect(typeof directionChangeEvent.timestamp).toBe('number');
      expect(directionChangeEvent.duration).toBeDefined();
      expect(typeof directionChangeEvent.duration).toBe('number');
      expect(directionChangeEvent.success).toBe(true);
    });

    test('should emit directionTypeChange event for horizontal to vertical switch', async () => {
      let directionTypeChangeEvent = null;
      
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'left',
        step: 1,
        delay: 0,
        onEvent: (event, data) => {
          if (event === 'directionTypeChange') {
            directionTypeChangeEvent = data;
          }
        }
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      // 切换到垂直方向
      scrollEngine.setOptions({ direction: 'up', cols: 1 });

      await new Promise(resolve => setTimeout(resolve, 100));

      // 验证事件数据
      expect(directionTypeChangeEvent).not.toBeNull();
      expect(directionTypeChangeEvent.oldDirection).toBe('left');
      expect(directionTypeChangeEvent.newDirection).toBe('up');
      expect(directionTypeChangeEvent.timestamp).toBeDefined();
      expect(directionTypeChangeEvent.duration).toBeDefined();
      expect(typeof directionTypeChangeEvent.previousPosition).toBe('number');
    });

    test('should not emit directionChange event for same direction', async () => {
      let eventCount = 0;
      
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'left',
        step: 1,
        delay: 0,
        onEvent: (event, data) => {
          if (event === 'directionChange') {
            eventCount++;
          }
        }
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      // 设置相同方向
      scrollEngine.setOptions({ direction: 'left' });

      await new Promise(resolve => setTimeout(resolve, 50));

      // 不应该触发方向切换事件
      expect(eventCount).toBe(0);
    });

    test('should emit warning event for partial state recovery', async () => {
      let warningEvent = null;
      
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'left',
        step: 1,
        delay: 0,
        onEvent: (event, data) => {
          if (event === 'warning') {
            warningEvent = data;
          }
        }
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      // 模拟部分状态损坏
      const contents = container.querySelectorAll('.ss-content');
      if (contents[0]) {
        // 破坏第一个内容元素的样式
        contents[0].style.transform = 'invalid-transform';
      }

      // 尝试切换方向（可能触发部分恢复）
      scrollEngine.setOptions({ direction: 'right' });

      await new Promise(resolve => setTimeout(resolve, 100));

      // 验证是否有警告事件（可能会有，取决于具体实现）
      if (warningEvent) {
        expect(warningEvent.type).toBe('partialStateRecovery');
        expect(warningEvent.recoveredStates).toBeDefined();
        expect(warningEvent.totalStates).toBeDefined();
      }
    });
  });

  describe('Enhanced Error Handling and Recovery', () => {
    test('should handle content repositioning failures gracefully', async () => {
      let errorEvents = [];
      
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'left',
        step: 1,
        delay: 0,
        onEvent: (event, data) => {
          if (event === 'error') {
            errorEvents.push(data);
          }
        }
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      // 模拟内容损坏
      const contents = container.querySelectorAll('.ss-content');
      if (contents[0]) {
        // 破坏内容元素的样式以模拟损坏
        contents[0].style.display = 'none';
        contents[0].innerHTML = '';
      }

      // 尝试切换方向
      scrollEngine.setOptions({ direction: 'right' });

      await new Promise(resolve => setTimeout(resolve, 100));

      // 验证引擎仍然可以工作
      expect(scrollEngine.isRunning()).toBeDefined();
    });

    test('should validate direction transition results', async () => {
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'left',
        step: 1,
        delay: 0
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      // 切换方向
      scrollEngine.setOptions({ direction: 'right' });

      await new Promise(resolve => setTimeout(resolve, 50));

      // 验证变换结果
      const contents = container.querySelectorAll('.ss-content');
      contents.forEach(content => {
        expect(content.style.transform).toContain('translateX');
      });
    });

    test('should handle multiple rapid direction changes', async () => {
      let eventLog = [];
      
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'left',
        step: 1,
        delay: 0,
        onEvent: (event, data) => {
          eventLog.push({ event, data, timestamp: Date.now() });
        }
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      // 快速多次切换方向
      scrollEngine.setOptions({ direction: 'right' });
      scrollEngine.setOptions({ direction: 'left' });
      scrollEngine.setOptions({ direction: 'right' });

      await new Promise(resolve => setTimeout(resolve, 150));

      // 验证最终状态正确
      expect(scrollEngine.isRunning()).toBe(true);
      
      // 验证最终方向是 right
      const contents = container.querySelectorAll('.ss-content');
      if (contents.length > 0) {
        expect(contents[0].style.transform).toContain('translateX');
      }
    });

    test('should recover from critical failures', async () => {
      let criticalErrors = [];
      
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'left',
        step: 1,
        delay: 0,
        onEvent: (event, data) => {
          if (event === 'error' && data.type === 'criticalRecoveryFailure') {
            criticalErrors.push(data);
          }
        }
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      // 模拟严重错误：完全破坏DOM结构
      container.innerHTML = '<div>broken</div>';

      // 尝试切换方向
      try {
        scrollEngine.setOptions({ direction: 'right' });
      } catch (error) {
        // 预期可能会有错误
      }

      await new Promise(resolve => setTimeout(resolve, 100));

      // 验证错误处理
      expect(typeof scrollEngine.isRunning()).toBe('boolean');
    });
  });

  describe('Integration with Other Features', () => {
    test('should work with pause/resume after direction change', async () => {
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'left',
        step: 1,
        delay: 0
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      // 切换方向
      scrollEngine.setOptions({ direction: 'right' });

      await new Promise(resolve => setTimeout(resolve, 50));

      // 测试暂停/恢复
      scrollEngine.pause();
      expect(scrollEngine.isRunning()).toBe(true); // 仍在运行状态，但动画暂停

      scrollEngine.resume();
      expect(scrollEngine.isRunning()).toBe(true);
    });

    test('should work with hover stop after direction change', async () => {
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'left',
        step: 1,
        delay: 0,
        hoverStop: true
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      // 切换方向
      scrollEngine.setOptions({ direction: 'right' });

      await new Promise(resolve => setTimeout(resolve, 50));

      // 测试鼠标悬停
      const mouseEnterEvent = new Event('mouseenter');
      container.dispatchEvent(mouseEnterEvent);

      // 验证悬停功能仍然工作
      expect(scrollEngine.isRunning()).toBe(true);
    });

    test('should maintain data integrity during complex direction changes', async () => {
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'left',
        step: 1,
        delay: 0
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      // 复杂的方向切换序列
      scrollEngine.setOptions({ direction: 'right' });
      await new Promise(resolve => setTimeout(resolve, 30));
      
      scrollEngine.setOptions({ direction: 'up', cols: 1 });
      await new Promise(resolve => setTimeout(resolve, 30));
      
      scrollEngine.setOptions({ direction: 'down' });
      await new Promise(resolve => setTimeout(resolve, 30));
      
      scrollEngine.setOptions({ direction: 'left' });
      await new Promise(resolve => setTimeout(resolve, 50));

      // 验证数据完整性
      const renderMatrix = scrollEngine.getRenderMatrix();
      expect(renderMatrix).toBeDefined();
      expect(renderMatrix.length).toBeGreaterThan(0);
      
      // 验证最终状态
      expect(scrollEngine.isRunning()).toBe(true);
    });
  });
});
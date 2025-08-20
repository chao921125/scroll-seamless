/**
 * 初始定位测试套件
 * 验证内容元素初始定位的正确性
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ScrollEngine } from '../src/core/ScrollEngine.ts';
import { DirectionHandler } from '../src/core/utils/DirectionHandler.ts';
import { PositionCalculator } from '../src/core/utils/PositionCalculator.ts';

// 模拟 DOM 环境
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.getComputedStyle = dom.window.getComputedStyle;
global.requestAnimationFrame = (callback) => setTimeout(callback, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);

describe('初始定位修复测试', () => {
  let container, scrollEngine;
  const testData = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'];

  beforeEach(() => {
    // 创建测试容器
    container = document.createElement('div');
    container.style.width = '300px';
    container.style.height = '200px';
    container.style.position = 'relative';
    container.style.overflow = 'hidden';
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (scrollEngine) {
      scrollEngine.destroy();
      scrollEngine = null;
    }
    document.body.innerHTML = '';
    PositionCalculator.clearContentSizeCache();
  });

  describe('水平滚动初始定位', () => {
    it('left 方向应该正确设置初始位置', () => {
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'left',
        step: 1
      });

      const content1 = container.querySelector('.ss-content:first-child');
      const content2 = container.querySelector('.ss-content:last-child');

      expect(content1).toBeTruthy();
      expect(content2).toBeTruthy();

      // 验证初始位置
      expect(content1.style.left).toBe('0px');
      expect(parseFloat(content2.style.left)).toBeGreaterThan(0);

      // 验证初始变换
      expect(content1.style.transform).toContain('translateX(0px)');
      expect(content2.style.transform).toContain('translateX(0px)');
    });

    it('right 方向应该正确设置初始位置', () => {
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'right',
        step: 1
      });

      const content1 = container.querySelector('.ss-content:first-child');
      const content2 = container.querySelector('.ss-content:last-child');

      expect(content1).toBeTruthy();
      expect(content2).toBeTruthy();

      // 验证初始位置 - right 方向的 content2 应该在正方向
      expect(content1.style.left).toBe('0px');
      expect(parseFloat(content2.style.left)).toBeGreaterThan(0);

      // 验证初始变换
      expect(content1.style.transform).toContain('translateX(0px)');
      expect(content2.style.transform).toContain('translateX(0px)');
    });
  });

  describe('垂直滚动初始定位', () => {
    it('up 方向应该正确设置初始位置以避免空白', () => {
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'up',
        step: 1,
        cols: 1
      });

      const content1 = container.querySelector('.ss-content:first-child');
      const content2 = container.querySelector('.ss-content:last-child');

      expect(content1).toBeTruthy();
      expect(content2).toBeTruthy();

      // 验证初始位置 - up 方向的 content2 应该在负方向以避免空白
      expect(content1.style.top).toBe('0px');
      expect(parseFloat(content2.style.top)).toBeLessThan(0);

      // 验证初始变换
      expect(content1.style.transform).toContain('translateY(0px)');
      expect(content2.style.transform).toContain('translateY(0px)');
    });

    it('down 方向应该正确设置初始位置', () => {
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'down',
        step: 1,
        cols: 1
      });

      const content1 = container.querySelector('.ss-content:first-child');
      const content2 = container.querySelector('.ss-content:last-child');

      expect(content1).toBeTruthy();
      expect(content2).toBeTruthy();

      // 验证初始位置 - down 方向的 content2 应该在正方向
      expect(content1.style.top).toBe('0px');
      expect(parseFloat(content2.style.top)).toBeGreaterThan(0);

      // 验证初始变换
      expect(content1.style.transform).toContain('translateY(0px)');
      expect(content2.style.transform).toContain('translateY(0px)');
    });
  });

  describe('方向切换测试', () => {
    it('从 left 切换到 right 应该重新计算位置', () => {
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'left',
        step: 1
      });

      // 启动滚动以获得一些位置
      scrollEngine.start();
      
      // 等待一些动画帧
      return new Promise(resolve => {
        setTimeout(() => {
          // 切换方向
          scrollEngine.setOptions({ direction: 'right' });

          const content1 = container.querySelector('.ss-content:first-child');
          const content2 = container.querySelector('.ss-content:last-child');

          // 验证位置被重置
          expect(content1.style.left).toBe('0px');
          expect(parseFloat(content2.style.left)).toBeGreaterThan(0);

          // 验证变换被重置
          expect(content1.style.transform).toContain('translateX(0px)');
          expect(content2.style.transform).toContain('translateX(0px)');

          resolve();
        }, 50);
      });
    });

    it('从 up 切换到 down 应该重新计算位置', () => {
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'up',
        step: 1,
        cols: 1
      });

      // 启动滚动以获得一些位置
      scrollEngine.start();
      
      // 等待一些动画帧
      return new Promise(resolve => {
        setTimeout(() => {
          // 切换方向
          scrollEngine.setOptions({ direction: 'down' });

          const content1 = container.querySelector('.ss-content:first-child');
          const content2 = container.querySelector('.ss-content:last-child');

          // 验证位置被重置
          expect(content1.style.top).toBe('0px');
          expect(parseFloat(content2.style.top)).toBeGreaterThan(0);

          // 验证变换被重置
          expect(content1.style.transform).toContain('translateY(0px)');
          expect(content2.style.transform).toContain('translateY(0px)');

          resolve();
        }, 50);
      });
    });

    it('从水平切换到垂直应该正确处理', () => {
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'left',
        step: 1
      });

      // 启动滚动
      scrollEngine.start();
      
      return new Promise(resolve => {
        setTimeout(() => {
          // 切换到垂直方向
          scrollEngine.setOptions({ direction: 'up', cols: 1 });

          // 等待DOM更新
          setTimeout(() => {
            const content1 = container.querySelector('.ss-content:first-child');
            const content2 = container.querySelector('.ss-content:last-child');

            // 验证垂直位置设置
            expect(content1.style.top).toBe('0px');
            const content2Top = parseFloat(content2.style.top);
            expect(content2Top).toBeLessThanOrEqual(0); // up 方向应该是负值或0

            resolve();
          }, 10);
        }, 50);
      });
    }, 10000); // 增加超时时间
  });

  describe('PositionCalculator 方向切换功能', () => {
    let content1, content2;

    beforeEach(() => {
      content1 = document.createElement('div');
      content1.className = 'ss-content';
      content1.style.position = 'absolute';
      content1.innerHTML = '<span>Item 1</span><span>Item 2</span>';

      content2 = document.createElement('div');
      content2.className = 'ss-content';
      content2.style.position = 'absolute';
      content2.innerHTML = '<span>Item 1</span><span>Item 2</span>';

      container.appendChild(content1);
      container.appendChild(content2);

      // 模拟元素尺寸
      Object.defineProperty(content1, 'scrollWidth', { value: 150, configurable: true });
      Object.defineProperty(content1, 'scrollHeight', { value: 50, configurable: true });
      Object.defineProperty(content2, 'scrollWidth', { value: 150, configurable: true });
      Object.defineProperty(content2, 'scrollHeight', { value: 50, configurable: true });
    });

    it('handleDirectionChange 应该正确处理方向切换', () => {
      // 设置初始状态（left 方向）
      content1.style.left = '0px';
      content2.style.left = '150px';
      content1.style.transform = 'translateX(-50px)';
      content2.style.transform = 'translateX(-50px)';

      // 切换到 up 方向
      const newPosition = PositionCalculator.handleDirectionChange(
        content1,
        content2,
        'left',
        'up',
        50
      );

      // 验证新位置
      expect(newPosition).toBe(0);

      // 验证垂直位置设置
      expect(content1.style.top).toBe('0px');
      expect(parseFloat(content2.style.top)).toBeLessThan(0);

      // 验证水平样式被清理
      expect(content1.style.left).toBe('');
      expect(content2.style.left).toBe('');

      // 验证变换被重置
      expect(content1.style.transform).toContain('translateY(0px)');
      expect(content2.style.transform).toContain('translateY(0px)');
    });

    it('validateAndFixInitialPositioning 应该修复错误的初始位置', () => {
      // 设置错误的初始位置
      content1.style.left = '10px'; // 应该是 0px
      content2.style.left = '50px';  // 应该是内容尺寸

      PositionCalculator.validateAndFixInitialPositioning(
        content1,
        content2,
        150,
        'left'
      );

      // 验证位置被修复
      expect(content1.style.left).toBe('0px');
      expect(content2.style.left).toBe('150px');
    });

    it('应该正确处理 up 方向的特殊定位', () => {
      PositionCalculator.validateAndFixInitialPositioning(
        content1,
        content2,
        50,
        'up'
      );

      // 验证 up 方向的特殊定位
      expect(content1.style.top).toBe('0px');
      expect(content2.style.top).toBe('-50px');
    });

    it('应该正确处理 right 方向的特殊定位', () => {
      // 先清理样式
      content1.style.left = '';
      content2.style.left = '';
      
      PositionCalculator.validateAndFixInitialPositioning(
        content1,
        content2,
        150,
        'right'
      );

      // 验证 right 方向的定位
      expect(content1.style.left).toBe('0px');
      expect(content2.style.left).toBe('150px');
    });

    it('应该正确处理 down 方向的特殊定位', () => {
      // 先清理样式
      content1.style.top = '';
      content2.style.top = '';
      
      PositionCalculator.validateAndFixInitialPositioning(
        content1,
        content2,
        50,
        'down'
      );

      // 验证 down 方向的定位
      expect(content1.style.top).toBe('0px');
      expect(content2.style.top).toBe('50px');
    });
  });

  describe('边界条件测试', () => {
    it('应该处理零尺寸内容的初始定位', () => {
      scrollEngine = new ScrollEngine(container, {
        data: [''],
        direction: 'left',
        step: 1
      });

      const content1 = container.querySelector('.ss-content:first-child');
      const content2 = container.querySelector('.ss-content:last-child');

      expect(content1).toBeTruthy();
      expect(content2).toBeTruthy();

      // 即使内容为空，也应该有基本的定位
      expect(content1.style.left).toBe('0px');
      expect(content2.style.left).toBeDefined();
    });

    it('应该处理大量数据的初始定位', () => {
      const largeData = Array.from({ length: 100 }, (_, i) => `Item ${i + 1}`);
      
      scrollEngine = new ScrollEngine(container, {
        data: largeData,
        direction: 'up',
        step: 1,
        cols: 1
      });

      const content1 = container.querySelector('.ss-content:first-child');
      const content2 = container.querySelector('.ss-content:last-child');

      expect(content1).toBeTruthy();
      expect(content2).toBeTruthy();

      // 验证大量数据下的初始定位
      expect(content1.style.top).toBe('0px');
      expect(parseFloat(content2.style.top)).toBeLessThan(0);
    });

    it('应该处理快速方向切换', () => {
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'left',
        step: 1
      });

      // 快速切换多个方向
      scrollEngine.setOptions({ direction: 'right' });
      scrollEngine.setOptions({ direction: 'up', cols: 1 });
      scrollEngine.setOptions({ direction: 'down' });
      scrollEngine.setOptions({ direction: 'left' });

      const content1 = container.querySelector('.ss-content:first-child');
      const content2 = container.querySelector('.ss-content:last-child');

      // 最终应该是 left 方向的正确定位
      expect(content1.style.left).toBe('0px');
      expect(parseFloat(content2.style.left)).toBeGreaterThan(0);
    });
  });

  describe('性能测试', () => {
    it('初始定位设置应该高效执行', () => {
      const startTime = Date.now();
      
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'left',
        step: 1
      });

      const initTime = Date.now() - startTime;
      
      // 初始化应该在合理时间内完成（100ms）
      expect(initTime).toBeLessThan(100);
    });

    it('方向切换应该高效执行', () => {
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'left',
        step: 1
      });

      const startTime = Date.now();
      
      // 执行多次方向切换
      for (let i = 0; i < 10; i++) {
        const directions = ['left', 'right', 'up', 'down'];
        const direction = directions[i % 4];
        scrollEngine.setOptions({ 
          direction: direction,
          cols: direction === 'up' || direction === 'down' ? 1 : undefined
        });
      }

      const switchTime = Date.now() - startTime;
      
      // 10次方向切换应该在合理时间内完成（200ms）
      expect(switchTime).toBeLessThan(200);
    });
  });
});
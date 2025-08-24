/**
 * 空白区域修复测试套件
 * 验证 right 和 down 方向的空白区域修复效果
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ScrollEngine } from '../src/core/ScrollEngine.ts';
import { PositionCalculator } from '../src/core/utils/PositionCalculator.ts';
import { DirectionHandler } from '../src/core/utils/DirectionHandler.ts';
import { TransformManager } from '../src/core/utils/TransformManager.ts';

// 模拟 DOM 环境
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.getComputedStyle = dom.window.getComputedStyle;
global.requestAnimationFrame = (callback) => setTimeout(callback, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);

describe('空白区域修复测试', () => {
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
    TransformManager.clearTransformCache();
  });

  describe('right 方向左侧空白修复', () => {
    it('应该修复 right 方向滚动时左侧空白区域的问题', () => {
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'right',
        step: 1
      });

      const content1 = container.querySelector('.ss-content:first-child');
      const content2 = container.querySelector('.ss-content:last-child');

      expect(content1).toBeTruthy();
      expect(content2).toBeTruthy();

      // 验证初始位置设置 - right 方向的 content2 应该在负方向预填充
      expect(content1.style.left).toBe('0px');
      expect(parseFloat(content2.style.left)).toBeLessThan(0);

      // 验证初始变换
      expect(content1.style.transform).toContain('translateX(0px)');
      expect(content2.style.transform).toContain('translateX(0px)');
    });

    it('应该在 right 方向动画过程中避免左侧空白', async () => {
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'right',
        step: 2
      });

      scrollEngine.start();

      // 等待几个动画帧
      await new Promise(resolve => setTimeout(resolve, 100));

      const content1 = container.querySelector('.ss-content:first-child');
      const content2 = container.querySelector('.ss-content:last-child');

      // 获取变换值
      const content1Transform = content1.style.transform;
      const content2Transform = content2.style.transform;

      expect(content1Transform).toContain('translateX');
      expect(content2Transform).toContain('translateX');

      // 验证两个内容元素的相对位置确保无空白
      const content1X = parseFloat(content1Transform.match(/translateX\(([^)]+)px\)/)?.[1] || '0');
      const content2X = parseFloat(content2Transform.match(/translateX\(([^)]+)px\)/)?.[1] || '0');

      // right 方向：content2 应该在 content1 的左侧
      expect(content2X).toBeLessThan(content1X);
    });

    it('应该正确处理 right 方向的内容循环', async () => {
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'right',
        step: 5 // 较大的步长以快速触发循环
      });

      scrollEngine.start();

      // 等待足够时间让内容循环
      await new Promise(resolve => setTimeout(resolve, 200));

      const content1 = container.querySelector('.ss-content:first-child');
      const content2 = container.querySelector('.ss-content:last-child');

      // 验证循环后位置仍然正确
      expect(content1.style.left).toBe('0px');
      expect(parseFloat(content2.style.left)).toBeLessThan(0);
    });
  });

  describe('down 方向上侧空白修复', () => {
    it('应该修复 down 方向滚动时上侧空白区域的问题', () => {
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

      // 验证初始位置设置 - down 方向的 content2 应该在负方向预填充
      expect(content1.style.top).toBe('0px');
      expect(parseFloat(content2.style.top)).toBeLessThan(0);

      // 验证初始变换
      expect(content1.style.transform).toContain('translateY(0px)');
      expect(content2.style.transform).toContain('translateY(0px)');
    });

    it('应该在 down 方向动画过程中避免上侧空白', async () => {
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'down',
        step: 2,
        cols: 1
      });

      scrollEngine.start();

      // 等待几个动画帧
      await new Promise(resolve => setTimeout(resolve, 100));

      const content1 = container.querySelector('.ss-content:first-child');
      const content2 = container.querySelector('.ss-content:last-child');

      // 获取变换值
      const content1Transform = content1.style.transform;
      const content2Transform = content2.style.transform;

      expect(content1Transform).toContain('translateY');
      expect(content2Transform).toContain('translateY');

      // 验证两个内容元素的相对位置确保无空白
      const content1Y = parseFloat(content1Transform.match(/translateY\(([^)]+)px\)/)?.[1] || '0');
      const content2Y = parseFloat(content2Transform.match(/translateY\(([^)]+)px\)/)?.[1] || '0');

      // down 方向：content2 应该在 content1 的上方
      expect(content2Y).toBeLessThan(content1Y);
    });

    it('应该正确处理 down 方向的内容循环', async () => {
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'down',
        step: 5, // 较大的步长以快速触发循环
        cols: 1
      });

      scrollEngine.start();

      // 等待足够时间让内容循环
      await new Promise(resolve => setTimeout(resolve, 200));

      const content1 = container.querySelector('.ss-content:first-child');
      const content2 = container.querySelector('.ss-content:last-child');

      // 验证循环后位置仍然正确
      expect(content1.style.top).toBe('0px');
      expect(parseFloat(content2.style.top)).toBeLessThan(0);
    });
  });

  describe('内容预填充机制测试', () => {
    it('应该实现内容预填充机制，避免滚动开始时的空白', () => {
      // 创建一个较小的容器来测试预填充
      const smallContainer = document.createElement('div');
      smallContainer.style.width = '100px';
      smallContainer.style.height = '50px';
      smallContainer.style.position = 'relative';
      smallContainer.style.overflow = 'hidden';
      document.body.appendChild(smallContainer);

      const smallScrollEngine = new ScrollEngine(smallContainer, {
        data: ['Short'],
        direction: 'right',
        step: 1
      });

      const content1 = smallContainer.querySelector('.ss-content:first-child');
      const content2 = smallContainer.querySelector('.ss-content:last-child');

      expect(content1).toBeTruthy();
      expect(content2).toBeTruthy();

      // 验证预填充机制工作
      expect(content1.style.left).toBe('0px');
      // 对于小容器，content2 应该被正确定位以避免空白
      const content2Left = parseFloat(content2.style.left);
      expect(content2Left).toBeLessThanOrEqual(0); // 允许0或负值

      smallScrollEngine.destroy();
      smallContainer.remove();
    });

    it('应该处理内容尺寸小于容器尺寸的情况', () => {
      const content1 = document.createElement('div');
      const content2 = document.createElement('div');
      content1.innerHTML = 'Short';
      content2.innerHTML = 'Short';
      
      // 模拟小内容尺寸
      Object.defineProperty(content1, 'scrollWidth', { value: 50, configurable: true });
      Object.defineProperty(content1, 'scrollHeight', { value: 20, configurable: true });

      const result = PositionCalculator.implementContentPreFilling(
        content1,
        content2,
        300, // 容器尺寸大于内容尺寸
        'right'
      );

      expect(result.success).toBe(true);
      expect(result.adjustedPositions).toBeDefined();
      expect(result.adjustedPositions.content1).toBe(0);
      expect(result.adjustedPositions.content2).toBeLessThan(0);
    });
  });

  describe('空白检测和自动修复机制测试', () => {
    it('应该检测并修复 right 方向的左侧空白', () => {
      const content1 = document.createElement('div');
      const content2 = document.createElement('div');
      content1.style.position = 'absolute';
      content2.style.position = 'absolute';
      content1.style.left = '0px';
      content2.style.left = '50px'; // 错误的位置，会导致左侧空白
      
      container.appendChild(content1);
      container.appendChild(content2);

      // 模拟 getBoundingClientRect - 模拟右方向左侧有空白的情况
      content1.getBoundingClientRect = () => ({ left: 10, right: 110, top: 0, bottom: 50, width: 100, height: 50 });
      content2.getBoundingClientRect = () => ({ left: 60, right: 160, top: 0, bottom: 50, width: 100, height: 50 });
      container.getBoundingClientRect = () => ({ left: 0, right: 300, top: 0, bottom: 200, width: 300, height: 200 });

      // 模拟内容尺寸
      Object.defineProperty(content1, 'scrollWidth', { value: 100, configurable: true });

      const result = PositionCalculator.detectAndFixBlankAreas(
        content1,
        content2,
        container,
        'right'
      );

      expect(result.hasBlankAreas).toBe(true);
      expect(result.fixedAreas).toContain('right-direction-left-blank');
      expect(content2.style.left).toBe('-101px'); // 包含安全边界
    });

    it('应该检测并修复 down 方向的上侧空白', () => {
      const content1 = document.createElement('div');
      const content2 = document.createElement('div');
      content1.style.position = 'absolute';
      content2.style.position = 'absolute';
      content1.style.top = '0px';
      content2.style.top = '30px'; // 错误的位置，会导致上侧空白
      
      container.appendChild(content1);
      container.appendChild(content2);

      // 模拟 getBoundingClientRect - 模拟下方向上侧有空白的情况
      content1.getBoundingClientRect = () => ({ left: 0, right: 300, top: 10, bottom: 60, width: 300, height: 50 });
      content2.getBoundingClientRect = () => ({ left: 0, right: 300, top: 40, bottom: 90, width: 300, height: 50 });
      container.getBoundingClientRect = () => ({ left: 0, right: 300, top: 0, bottom: 200, width: 300, height: 200 });

      // 模拟内容尺寸
      Object.defineProperty(content1, 'scrollHeight', { value: 50, configurable: true });

      const result = PositionCalculator.detectAndFixBlankAreas(
        content1,
        content2,
        container,
        'down'
      );

      expect(result.hasBlankAreas).toBe(true);
      expect(result.fixedAreas).toContain('down-direction-top-blank');
      expect(content2.style.top).toBe('-51px'); // 包含安全边界
    });
  });

  describe('优化内容循环衔接逻辑测试', () => {
    it('应该优化 right 方向的内容循环衔接', () => {
      const result = PositionCalculator.optimizeSeamlessConnection(
        50, // 当前位置
        100, // 内容尺寸
        300, // 容器尺寸
        'right'
      );

      expect(result.content1Transform).toBe('translateX(50px)');
      expect(result.content2Transform).toBe('translateX(-50px)');
      expect(result.shouldReset).toBe(false);
    });

    it('应该优化 down 方向的内容循环衔接', () => {
      const result = PositionCalculator.optimizeSeamlessConnection(
        30, // 当前位置
        60, // 内容尺寸
        200, // 容器尺寸
        'down'
      );

      expect(result.content1Transform).toBe('translateY(30px)');
      expect(result.content2Transform).toBe('translateY(-30px)');
      expect(result.shouldReset).toBe(false);
    });

    it('应该在适当时机触发位置重置', () => {
      const result = PositionCalculator.optimizeSeamlessConnection(
        120, // 位置超过内容尺寸
        100, // 内容尺寸
        300, // 容器尺寸
        'right'
      );

      expect(result.shouldReset).toBe(true);
    });

    it('应该处理无效的内容尺寸', () => {
      const result = PositionCalculator.optimizeSeamlessConnection(
        50,
        0, // 无效的内容尺寸
        300,
        'right'
      );

      // 应该使用容器尺寸作为后备
      expect(result.content1Transform).toBeDefined();
      expect(result.content2Transform).toBeDefined();
    });
  });

  describe('集成测试', () => {
    it('应该在所有方向下都能避免空白区域', async () => {
      const directions = ['left', 'right', 'up', 'down'];
      
      for (const direction of directions) {
        const testScrollEngine = new ScrollEngine(container, {
          data: testData,
          direction: direction,
          step: 1,
          cols: direction === 'up' || direction === 'down' ? 1 : undefined
        });

        testScrollEngine.start();
        
        // 等待动画开始
        await new Promise(resolve => setTimeout(resolve, 50));

        const content1 = container.querySelector('.ss-content:first-child');
        const content2 = container.querySelector('.ss-content:last-child');

        expect(content1).toBeTruthy();
        expect(content2).toBeTruthy();

        // 验证初始位置设置正确
        if (direction === 'left' || direction === 'right') {
          expect(content1.style.left).toBe('0px');
          if (direction === 'right') {
            expect(parseFloat(content2.style.left)).toBeLessThan(0);
          } else {
            expect(parseFloat(content2.style.left)).toBeGreaterThan(0);
          }
        } else {
          expect(content1.style.top).toBe('0px');
          if (direction === 'up' || direction === 'down') {
            expect(parseFloat(content2.style.top)).toBeLessThan(0);
          }
        }

        testScrollEngine.destroy();
        container.innerHTML = '';
      }
    });

    it('应该在方向切换时保持无空白状态', async () => {
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'left',
        step: 1
      });

      scrollEngine.start();
      await new Promise(resolve => setTimeout(resolve, 50));

      // 切换到 right 方向
      scrollEngine.setOptions({ direction: 'right' });
      await new Promise(resolve => setTimeout(resolve, 50));

      const content1 = container.querySelector('.ss-content:first-child');
      const content2 = container.querySelector('.ss-content:last-child');

      // 验证切换后无左侧空白
      expect(content1.style.left).toBe('0px');
      expect(parseFloat(content2.style.left)).toBeLessThan(0);

      // 切换到 down 方向
      scrollEngine.setOptions({ direction: 'down', cols: 1 });
      await new Promise(resolve => setTimeout(resolve, 50));

      const newContent1 = container.querySelector('.ss-content:first-child');
      const newContent2 = container.querySelector('.ss-content:last-child');

      // 验证切换后无上侧空白
      expect(newContent1.style.top).toBe('0px');
      expect(parseFloat(newContent2.style.top)).toBeLessThan(0);
    });

    it('应该在暂停恢复过程中保持无空白状态', async () => {
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'right',
        step: 2
      });

      scrollEngine.start();
      await new Promise(resolve => setTimeout(resolve, 100));

      // 暂停
      scrollEngine.pause();
      
      const content1 = container.querySelector('.ss-content:first-child');
      const content2 = container.querySelector('.ss-content:last-child');

      // 记录暂停时的位置
      const pausedContent1Transform = content1.style.transform;
      const pausedContent2Transform = content2.style.transform;

      // 恢复
      scrollEngine.resume();
      await new Promise(resolve => setTimeout(resolve, 50));

      // 验证恢复后位置连续且无空白
      expect(content1.style.transform).toBeDefined();
      expect(content2.style.transform).toBeDefined();
      
      // 验证基本位置设置仍然正确
      expect(content1.style.left).toBe('0px');
      expect(parseFloat(content2.style.left)).toBeLessThan(0);
    });
  });

  describe('性能测试', () => {
    it('空白检测和修复应该高效执行', () => {
      const content1 = document.createElement('div');
      const content2 = document.createElement('div');
      content1.style.position = 'absolute';
      content2.style.position = 'absolute';
      
      container.appendChild(content1);
      container.appendChild(content2);

      // 模拟 getBoundingClientRect
      content1.getBoundingClientRect = () => ({ left: 0, right: 100, top: 0, bottom: 50, width: 100, height: 50 });
      content2.getBoundingClientRect = () => ({ left: 50, right: 150, top: 0, bottom: 50, width: 100, height: 50 });
      container.getBoundingClientRect = () => ({ left: 0, right: 300, top: 0, bottom: 200, width: 300, height: 200 });

      const startTime = Date.now();
      
      // 执行多次检测
      for (let i = 0; i < 100; i++) {
        PositionCalculator.detectAndFixBlankAreas(
          content1,
          content2,
          container,
          'right'
        );
      }

      const executionTime = Date.now() - startTime;
      
      // 100次检测应该在合理时间内完成（100ms）
      expect(executionTime).toBeLessThan(100);
    });

    it('内容预填充应该高效执行', () => {
      const content1 = document.createElement('div');
      const content2 = document.createElement('div');
      
      const startTime = Date.now();
      
      // 执行多次预填充
      for (let i = 0; i < 100; i++) {
        PositionCalculator.implementContentPreFilling(
          content1,
          content2,
          300,
          'right'
        );
      }

      const executionTime = Date.now() - startTime;
      
      // 100次预填充应该在合理时间内完成（50ms）
      expect(executionTime).toBeLessThan(50);
    });
  });
});
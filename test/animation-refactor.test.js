/**
 * 动画重构测试
 * 专门测试重构后的动画创建逻辑
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ScrollEngine } from '../src/core/ScrollEngine.ts';
import { DirectionHandler } from '../src/core/utils/DirectionHandler.ts';

// 模拟 DOM 环境
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.getComputedStyle = dom.window.getComputedStyle;

// 模拟 RAF
let rafCallbacks = [];
let rafId = 1;
global.requestAnimationFrame = vi.fn((callback) => {
  const id = rafId++;
  rafCallbacks.push({ id, callback });
  setTimeout(() => callback(Date.now()), 0);
  return id;
});
global.cancelAnimationFrame = vi.fn((id) => {
  rafCallbacks = rafCallbacks.filter(item => item.id !== id);
});

global.performance = {
  now: () => Date.now()
};

describe('Animation Refactor Tests', () => {
  let container;
  const testData = ['Item 1', 'Item 2', 'Item 3'];

  beforeEach(() => {
    container = document.createElement('div');
    container.style.width = '300px';
    container.style.height = '200px';
    Object.defineProperty(container, 'offsetWidth', { value: 300, configurable: true });
    Object.defineProperty(container, 'offsetHeight', { value: 200, configurable: true });
    document.body.appendChild(container);
    rafCallbacks = [];
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('DirectionHandler Integration', () => {
    it('应该正确获取方向配置', () => {
      const leftConfig = DirectionHandler.getDirectionConfig('left');
      expect(leftConfig.isReverse).toBe(false);
      expect(leftConfig.transformProperty).toBe('translateX');

      const rightConfig = DirectionHandler.getDirectionConfig('right');
      expect(rightConfig.isReverse).toBe(true);
      expect(rightConfig.transformProperty).toBe('translateX');

      const upConfig = DirectionHandler.getDirectionConfig('up');
      expect(upConfig.isReverse).toBe(false);
      expect(upConfig.transformProperty).toBe('translateY');

      const downConfig = DirectionHandler.getDirectionConfig('down');
      expect(downConfig.isReverse).toBe(true);
      expect(downConfig.transformProperty).toBe('translateY');
    });

    it('应该正确计算初始位置', () => {
      const contentSize = 150;

      const leftPos = DirectionHandler.calculateInitialPosition(contentSize, 'left');
      expect(leftPos.content1Position).toBe(0);
      expect(leftPos.content2Position).toBe(contentSize);

      const rightPos = DirectionHandler.calculateInitialPosition(contentSize, 'right');
      expect(rightPos.content1Position).toBe(0);
      expect(rightPos.content2Position).toBe(contentSize);

      const upPos = DirectionHandler.calculateInitialPosition(contentSize, 'up');
      expect(upPos.content1Position).toBe(0);
      expect(upPos.content2Position).toBe(-contentSize);

      const downPos = DirectionHandler.calculateInitialPosition(contentSize, 'down');
      expect(downPos.content1Position).toBe(0);
      expect(downPos.content2Position).toBe(contentSize);
    });

    it('应该正确计算下一个位置', () => {
      const contentSize = 150;
      const step = 5;

      // left 方向（正向）
      let nextPos = DirectionHandler.calculateNextPosition(0, step, contentSize, 'left');
      expect(nextPos).toBe(step);

      // right 方向（反向）
      nextPos = DirectionHandler.calculateNextPosition(0, step, contentSize, 'right');
      expect(nextPos).toBe(-step);

      // up 方向（正向）
      nextPos = DirectionHandler.calculateNextPosition(0, step, contentSize, 'up');
      expect(nextPos).toBe(step);

      // down 方向（反向）
      nextPos = DirectionHandler.calculateNextPosition(0, step, contentSize, 'down');
      expect(nextPos).toBe(-step);
    });

    it('应该正确处理位置重置', () => {
      const contentSize = 150;
      const step = 5;

      // left 方向：当位置 >= contentSize 时重置
      let nextPos = DirectionHandler.calculateNextPosition(contentSize - 1, step, contentSize, 'left');
      expect(nextPos).toBe(0);

      // right 方向：当位置 <= -contentSize 时重置
      nextPos = DirectionHandler.calculateNextPosition(-contentSize + 1, step, contentSize, 'right');
      expect(nextPos).toBe(0);

      // up 方向：当位置 >= contentSize 时重置
      nextPos = DirectionHandler.calculateNextPosition(contentSize - 1, step, contentSize, 'up');
      expect(nextPos).toBe(0);

      // down 方向：当位置 <= -contentSize 时重置
      nextPos = DirectionHandler.calculateNextPosition(-contentSize + 1, step, contentSize, 'down');
      expect(nextPos).toBe(0);
    });
  });

  describe('Transform Application', () => {
    it('应该为所有方向应用负变换值', () => {
      const element = document.createElement('div');
      const position = 50;

      // 测试所有方向
      DirectionHandler.applyTransform(element, position, 'left');
      expect(element.style.transform).toBe('translateX(-50px)');

      DirectionHandler.applyTransform(element, position, 'right');
      expect(element.style.transform).toBe('translateX(-50px)');

      DirectionHandler.applyTransform(element, position, 'up');
      expect(element.style.transform).toBe('translateY(-50px)');

      DirectionHandler.applyTransform(element, position, 'down');
      expect(element.style.transform).toBe('translateY(-50px)');
    });
  });

  describe('ScrollEngine Animation Integration', () => {
    it('应该正确创建 right 方向动画', async () => {
      const scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'right',
        step: 1,
        delay: 0
      });

      expect(scrollEngine.isRunning()).toBe(true);

      // 验证初始状态
      const contents = container.querySelectorAll('.ss-content');
      expect(contents.length).toBe(2);

      // 验证初始位置设置
      expect(contents[0].style.left).toBe('0px');
      expect(parseInt(contents[1].style.left)).toBeGreaterThan(0);

      // 验证变换应用
      expect(contents[0].style.transform).toContain('translateX');
      expect(contents[1].style.transform).toContain('translateX');

      scrollEngine.destroy();
    });

    it('应该正确创建 down 方向动画', async () => {
      const scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'down',
        step: 1,
        delay: 0,
        cols: 1
      });

      expect(scrollEngine.isRunning()).toBe(true);

      // 验证初始状态
      const contents = container.querySelectorAll('.ss-content');
      expect(contents.length).toBe(2);

      // 验证初始位置设置
      expect(contents[0].style.top).toBe('0px');
      expect(parseInt(contents[1].style.top)).toBeGreaterThan(0);

      // 验证变换应用
      expect(contents[0].style.transform).toContain('translateY');
      expect(contents[1].style.transform).toContain('translateY');

      scrollEngine.destroy();
    });

    it('应该正确处理位置更新', async () => {
      const scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'right',
        step: 5,
        delay: 0
      });

      const initialPosition = scrollEngine.getPosition();
      expect(initialPosition).toBe(0);

      // 模拟内容尺寸
      const contents = container.querySelectorAll('.ss-content');
      contents.forEach(content => {
        Object.defineProperty(content, 'scrollWidth', { value: 150, configurable: true });
        Object.defineProperty(content, 'offsetWidth', { value: 150, configurable: true });
      });

      // 触发动画帧
      await new Promise(resolve => setTimeout(resolve, 10));
      rafCallbacks.forEach(item => item.callback(Date.now()));
      await new Promise(resolve => setTimeout(resolve, 10));

      // right 方向位置应该减少
      const newPosition = scrollEngine.getPosition();
      expect(newPosition).toBeLessThanOrEqual(initialPosition);

      scrollEngine.destroy();
    });

    it('应该正确处理暂停和恢复', async () => {
      const scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'left',
        step: 1,
        delay: 0
      });

      // 等待动画开始
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // 触发一些动画帧
      rafCallbacks.forEach(item => item.callback(Date.now()));
      await new Promise(resolve => setTimeout(resolve, 10));

      const positionBeforePause = scrollEngine.getPosition();

      // 暂停动画
      scrollEngine.pause();
      await new Promise(resolve => setTimeout(resolve, 20));

      const positionAfterPause = scrollEngine.getPosition();
      expect(positionAfterPause).toBe(positionBeforePause);

      // 恢复动画
      scrollEngine.resume();
      
      // 触发更多动画帧
      rafCallbacks.forEach(item => item.callback(Date.now()));
      await new Promise(resolve => setTimeout(resolve, 10));

      const positionAfterResume = scrollEngine.getPosition();
      expect(positionAfterResume).toBeGreaterThanOrEqual(positionAfterPause);

      scrollEngine.destroy();
    });
  });

  describe('Error Handling', () => {
    it('应该处理无效方向', () => {
      expect(() => {
        DirectionHandler.getDirectionConfig('invalid');
      }).toThrow('Invalid scroll direction: invalid');
    });

    it('应该验证方向参数', () => {
      expect(DirectionHandler.isValidDirection('left')).toBe(true);
      expect(DirectionHandler.isValidDirection('right')).toBe(true);
      expect(DirectionHandler.isValidDirection('up')).toBe(true);
      expect(DirectionHandler.isValidDirection('down')).toBe(true);
      expect(DirectionHandler.isValidDirection('invalid')).toBe(false);
    });

    it('应该获取支持的方向列表', () => {
      const directions = DirectionHandler.getSupportedDirections();
      expect(directions).toEqual(['left', 'right', 'up', 'down']);
    });
  });
});
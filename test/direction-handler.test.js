/**
 * DirectionHandler 单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DirectionHandler } from '../src/core/utils/DirectionHandler.ts';

// 模拟 DOM 环境
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;

describe('DirectionHandler', () => {
  describe('getDirectionConfig', () => {
    it('应该返回 left 方向的正确配置', () => {
      const config = DirectionHandler.getDirectionConfig('left');
      
      expect(config.direction).toBe('left');
      expect(config.isHorizontal).toBe(true);
      expect(config.isReverse).toBe(false);
      expect(config.transformProperty).toBe('translateX');
      expect(config.sizeProperty).toBe('width');
      expect(config.scrollProperty).toBe('scrollWidth');
      expect(config.positionProperty).toBe('left');
    });

    it('应该返回 right 方向的正确配置', () => {
      const config = DirectionHandler.getDirectionConfig('right');
      
      expect(config.direction).toBe('right');
      expect(config.isHorizontal).toBe(true);
      expect(config.isReverse).toBe(true);
      expect(config.transformProperty).toBe('translateX');
      expect(config.sizeProperty).toBe('width');
      expect(config.scrollProperty).toBe('scrollWidth');
      expect(config.positionProperty).toBe('left');
    });

    it('应该返回 up 方向的正确配置', () => {
      const config = DirectionHandler.getDirectionConfig('up');
      
      expect(config.direction).toBe('up');
      expect(config.isHorizontal).toBe(false);
      expect(config.isReverse).toBe(false);
      expect(config.transformProperty).toBe('translateY');
      expect(config.sizeProperty).toBe('height');
      expect(config.scrollProperty).toBe('scrollHeight');
      expect(config.positionProperty).toBe('top');
    });

    it('应该返回 down 方向的正确配置', () => {
      const config = DirectionHandler.getDirectionConfig('down');
      
      expect(config.direction).toBe('down');
      expect(config.isHorizontal).toBe(false);
      expect(config.isReverse).toBe(true);
      expect(config.transformProperty).toBe('translateY');
      expect(config.sizeProperty).toBe('height');
      expect(config.scrollProperty).toBe('scrollHeight');
      expect(config.positionProperty).toBe('top');
    });

    it('应该对无效方向抛出错误', () => {
      expect(() => {
        DirectionHandler.getDirectionConfig('invalid');
      }).toThrow('Invalid scroll direction: invalid');
    });
  });

  describe('calculateInitialPosition', () => {
    it('left 方向应该返回正确的初始位置', () => {
      const result = DirectionHandler.calculateInitialPosition(100, 'left');
      
      expect(result.content1Position).toBe(0);
      expect(result.content2Position).toBe(100);
    });

    it('right 方向应该返回正确的初始位置', () => {
      const result = DirectionHandler.calculateInitialPosition(100, 'right');
      
      expect(result.content1Position).toBe(0);
      expect(result.content2Position).toBe(100); // 修复后：right 方向第二个内容在正方向
    });

    it('up 方向应该返回正确的初始位置', () => {
      const result = DirectionHandler.calculateInitialPosition(100, 'up');
      
      expect(result.content1Position).toBe(0);
      expect(result.content2Position).toBe(-100); // 修复后：up 方向第二个内容在负方向以避免空白
    });

    it('down 方向应该返回正确的初始位置', () => {
      const result = DirectionHandler.calculateInitialPosition(100, 'down');
      
      expect(result.content1Position).toBe(0);
      expect(result.content2Position).toBe(100); // 修复后：down 方向第二个内容在正方向
    });
  });

  describe('calculateNextPosition', () => {
    it('left 方向应该正确计算下一个位置', () => {
      // 正常递增
      let nextPos = DirectionHandler.calculateNextPosition(50, 2, 100, 'left');
      expect(nextPos).toBe(52);

      // 到达边界时重置
      nextPos = DirectionHandler.calculateNextPosition(98, 2, 100, 'left');
      expect(nextPos).toBe(0);
    });

    it('right 方向应该正确计算下一个位置', () => {
      // 正常递减
      let nextPos = DirectionHandler.calculateNextPosition(-50, 2, 100, 'right');
      expect(nextPos).toBe(-52);

      // 到达边界时重置
      nextPos = DirectionHandler.calculateNextPosition(-98, 2, 100, 'right');
      expect(nextPos).toBe(0);
    });

    it('up 方向应该正确计算下一个位置', () => {
      // 正常递增
      let nextPos = DirectionHandler.calculateNextPosition(50, 2, 100, 'up');
      expect(nextPos).toBe(52);

      // 到达边界时重置
      nextPos = DirectionHandler.calculateNextPosition(98, 2, 100, 'up');
      expect(nextPos).toBe(0);
    });

    it('down 方向应该正确计算下一个位置', () => {
      // 正常递减
      let nextPos = DirectionHandler.calculateNextPosition(-50, 2, 100, 'down');
      expect(nextPos).toBe(-52);

      // 到达边界时重置
      nextPos = DirectionHandler.calculateNextPosition(-98, 2, 100, 'down');
      expect(nextPos).toBe(0);
    });
  });

  describe('applyTransform', () => {
    let element;

    beforeEach(() => {
      element = document.createElement('div');
      element.style = {};
    });

    it('left 方向应该应用正确的变换', () => {
      DirectionHandler.applyTransform(element, 50, 'left');
      expect(element.style.transform).toBe('translateX(-50px)');
    });

    it('right 方向应该应用正确的变换', () => {
      DirectionHandler.applyTransform(element, 50, 'right');
      expect(element.style.transform).toBe('translateX(-50px)'); // 修复后：所有方向都使用负变换值
    });

    it('up 方向应该应用正确的变换', () => {
      DirectionHandler.applyTransform(element, 50, 'up');
      expect(element.style.transform).toBe('translateY(-50px)');
    });

    it('down 方向应该应用正确的变换', () => {
      DirectionHandler.applyTransform(element, 50, 'down');
      expect(element.style.transform).toBe('translateY(-50px)'); // 修复后：所有方向都使用负变换值
    });
  });

  describe('setInitialPosition', () => {
    let element;

    beforeEach(() => {
      element = document.createElement('div');
      element.style = {};
    });

    it('水平方向应该设置 left 属性', () => {
      DirectionHandler.setInitialPosition(element, 100, 'left');
      expect(element.style.left).toBe('100px');

      DirectionHandler.setInitialPosition(element, -50, 'right');
      expect(element.style.left).toBe('-50px');
    });

    it('垂直方向应该设置 top 属性', () => {
      DirectionHandler.setInitialPosition(element, 100, 'up');
      expect(element.style.top).toBe('100px');

      DirectionHandler.setInitialPosition(element, -50, 'down');
      expect(element.style.top).toBe('-50px');
    });
  });

  describe('getContentSize', () => {
    let element;

    beforeEach(() => {
      element = document.createElement('div');
      // 模拟 scrollWidth 和 scrollHeight
      Object.defineProperty(element, 'scrollWidth', {
        value: 200,
        writable: true
      });
      Object.defineProperty(element, 'scrollHeight', {
        value: 150,
        writable: true
      });
    });

    it('水平方向应该返回 scrollWidth', () => {
      const size = DirectionHandler.getContentSize(element, 'left');
      expect(size).toBe(200);

      const sizeRight = DirectionHandler.getContentSize(element, 'right');
      expect(sizeRight).toBe(200);
    });

    it('垂直方向应该返回 scrollHeight', () => {
      const size = DirectionHandler.getContentSize(element, 'up');
      expect(size).toBe(150);

      const sizeDown = DirectionHandler.getContentSize(element, 'down');
      expect(sizeDown).toBe(150);
    });

    it('应该返回非负值', () => {
      element.scrollWidth = -10;
      element.scrollHeight = -5;

      expect(DirectionHandler.getContentSize(element, 'left')).toBe(0);
      expect(DirectionHandler.getContentSize(element, 'up')).toBe(0);
    });
  });

  describe('isValidDirection', () => {
    it('应该验证有效方向', () => {
      expect(DirectionHandler.isValidDirection('left')).toBe(true);
      expect(DirectionHandler.isValidDirection('right')).toBe(true);
      expect(DirectionHandler.isValidDirection('up')).toBe(true);
      expect(DirectionHandler.isValidDirection('down')).toBe(true);
    });

    it('应该拒绝无效方向', () => {
      expect(DirectionHandler.isValidDirection('invalid')).toBe(false);
      expect(DirectionHandler.isValidDirection('')).toBe(false);
      expect(DirectionHandler.isValidDirection(null)).toBe(false);
      expect(DirectionHandler.isValidDirection(undefined)).toBe(false);
    });
  });

  describe('getSupportedDirections', () => {
    it('应该返回所有支持的方向', () => {
      const directions = DirectionHandler.getSupportedDirections();
      
      expect(directions).toContain('left');
      expect(directions).toContain('right');
      expect(directions).toContain('up');
      expect(directions).toContain('down');
      expect(directions).toHaveLength(4);
    });
  });

  describe('便捷方法', () => {
    it('isHorizontal 应该正确判断水平方向', () => {
      expect(DirectionHandler.isHorizontal('left')).toBe(true);
      expect(DirectionHandler.isHorizontal('right')).toBe(true);
      expect(DirectionHandler.isHorizontal('up')).toBe(false);
      expect(DirectionHandler.isHorizontal('down')).toBe(false);
    });

    it('isReverse 应该正确判断反向滚动', () => {
      expect(DirectionHandler.isReverse('left')).toBe(false);
      expect(DirectionHandler.isReverse('right')).toBe(true);
      expect(DirectionHandler.isReverse('up')).toBe(false);
      expect(DirectionHandler.isReverse('down')).toBe(true);
    });

    it('getTransformProperty 应该返回正确的变换属性', () => {
      expect(DirectionHandler.getTransformProperty('left')).toBe('translateX');
      expect(DirectionHandler.getTransformProperty('right')).toBe('translateX');
      expect(DirectionHandler.getTransformProperty('up')).toBe('translateY');
      expect(DirectionHandler.getTransformProperty('down')).toBe('translateY');
    });

    it('getSizeProperty 应该返回正确的尺寸属性', () => {
      expect(DirectionHandler.getSizeProperty('left')).toBe('width');
      expect(DirectionHandler.getSizeProperty('right')).toBe('width');
      expect(DirectionHandler.getSizeProperty('up')).toBe('height');
      expect(DirectionHandler.getSizeProperty('down')).toBe('height');
    });

    it('getScrollProperty 应该返回正确的滚动属性', () => {
      expect(DirectionHandler.getScrollProperty('left')).toBe('scrollWidth');
      expect(DirectionHandler.getScrollProperty('right')).toBe('scrollWidth');
      expect(DirectionHandler.getScrollProperty('up')).toBe('scrollHeight');
      expect(DirectionHandler.getScrollProperty('down')).toBe('scrollHeight');
    });

    it('getPositionProperty 应该返回正确的位置属性', () => {
      expect(DirectionHandler.getPositionProperty('left')).toBe('left');
      expect(DirectionHandler.getPositionProperty('right')).toBe('left');
      expect(DirectionHandler.getPositionProperty('up')).toBe('top');
      expect(DirectionHandler.getPositionProperty('down')).toBe('top');
    });
  });

  describe('边界条件测试', () => {
    it('应该处理零尺寸内容', () => {
      const result = DirectionHandler.calculateInitialPosition(0, 'left');
      expect(result.content1Position).toBe(0);
      expect(result.content2Position).toBe(0);
    });

    it('应该处理负步长', () => {
      const nextPos = DirectionHandler.calculateNextPosition(50, -2, 100, 'left');
      expect(nextPos).toBe(48);
    });

    it('应该处理大步长', () => {
      const nextPos = DirectionHandler.calculateNextPosition(50, 100, 100, 'left');
      expect(nextPos).toBe(0); // 应该重置到0
    });
  });
});
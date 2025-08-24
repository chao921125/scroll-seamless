/**
 * 方向修复验证测试
 * 验证 right 和 down 方向修复后的正确行为
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DirectionHandler } from '../src/core/utils/DirectionHandler.ts';
import { TransformManager } from '../src/core/utils/TransformManager.ts';

// 模拟 DOM 环境
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;

describe('Direction Fix Validation', () => {
  describe('Right Direction Fix', () => {
    it('should calculate correct next position for right direction', () => {
      // right 方向应该是递减的（isReverse: true）
      const nextPosition = DirectionHandler.calculateNextPosition(0, 10, 100, 'right');
      expect(nextPosition).toBe(-10);
    });

    it('should generate correct transform for right direction', () => {
      // right 方向，position = -10，应该生成 translateX(10px)（向右移动）
      const transform = TransformManager.generateTransformString(-10, 'right');
      expect(transform).toBe('translateX(10px)');
    });

    it('should apply correct transform for right direction', () => {
      const element = document.createElement('div');
      
      // 在测试环境中应该能正常应用变换
      DirectionHandler.applyTransform(element, -10, 'right');
      
      expect(element.style.transform).toBe('translateX(10px)');
    });
  });

  describe('Down Direction Fix', () => {
    it('should calculate correct next position for down direction', () => {
      // down 方向应该是递减的（isReverse: true）
      const nextPosition = DirectionHandler.calculateNextPosition(0, 10, 100, 'down');
      expect(nextPosition).toBe(-10);
    });

    it('should generate correct transform for down direction', () => {
      // down 方向，position = -10，应该生成 translateY(10px)（向下移动）
      const transform = TransformManager.generateTransformString(-10, 'down');
      expect(transform).toBe('translateY(10px)');
    });

    it('should apply correct transform for down direction', () => {
      const element = document.createElement('div');
      
      // 在测试环境中应该能正常应用变换
      DirectionHandler.applyTransform(element, -10, 'down');
      
      expect(element.style.transform).toBe('translateY(10px)');
    });
  });

  describe('Left and Up Direction Consistency', () => {
    it('should maintain correct behavior for left direction', () => {
      // left 方向应该是递增的（isReverse: false）
      const nextPosition = DirectionHandler.calculateNextPosition(0, 10, 100, 'left');
      expect(nextPosition).toBe(10);

      // left 方向，position = 10，应该生成 translateX(-10px)（向左移动）
      const transform = TransformManager.generateTransformString(10, 'left');
      expect(transform).toBe('translateX(-10px)');
    });

    it('should maintain correct behavior for up direction', () => {
      // up 方向应该是递增的（isReverse: false）
      const nextPosition = DirectionHandler.calculateNextPosition(0, 10, 100, 'up');
      expect(nextPosition).toBe(10);

      // up 方向，position = 10，应该生成 translateY(-10px)（向上移动）
      const transform = TransformManager.generateTransformString(10, 'up');
      expect(transform).toBe('translateY(-10px)');
    });
  });

  describe('Direction Configuration Validation', () => {
    it('should have correct isReverse configuration', () => {
      const leftConfig = DirectionHandler.getDirectionConfig('left');
      const rightConfig = DirectionHandler.getDirectionConfig('right');
      const upConfig = DirectionHandler.getDirectionConfig('up');
      const downConfig = DirectionHandler.getDirectionConfig('down');

      expect(leftConfig.isReverse).toBe(false);
      expect(rightConfig.isReverse).toBe(true);
      expect(upConfig.isReverse).toBe(false);
      expect(downConfig.isReverse).toBe(true);
    });

    it('should have correct transform properties', () => {
      const leftConfig = DirectionHandler.getDirectionConfig('left');
      const rightConfig = DirectionHandler.getDirectionConfig('right');
      const upConfig = DirectionHandler.getDirectionConfig('up');
      const downConfig = DirectionHandler.getDirectionConfig('down');

      expect(leftConfig.transformProperty).toBe('translateX');
      expect(rightConfig.transformProperty).toBe('translateX');
      expect(upConfig.transformProperty).toBe('translateY');
      expect(downConfig.transformProperty).toBe('translateY');
    });
  });

  describe('Position Reset Logic', () => {
    it('should correctly reset position for right direction', () => {
      // right 方向：当位置到达 -contentSize 时应该重置为 0
      const nextPosition = DirectionHandler.calculateNextPosition(-90, 10, 100, 'right');
      expect(nextPosition).toBe(0); // -90 - 10 = -100，应该重置为 0
    });

    it('should correctly reset position for down direction', () => {
      // down 方向：当位置到达 -contentSize 时应该重置为 0
      const nextPosition = DirectionHandler.calculateNextPosition(-90, 10, 100, 'down');
      expect(nextPosition).toBe(0); // -90 - 10 = -100，应该重置为 0
    });

    it('should correctly reset position for left direction', () => {
      // left 方向：当位置到达 contentSize 时应该重置为 0
      const nextPosition = DirectionHandler.calculateNextPosition(90, 10, 100, 'left');
      expect(nextPosition).toBe(0); // 90 + 10 = 100，应该重置为 0
    });

    it('should correctly reset position for up direction', () => {
      // up 方向：当位置到达 contentSize 时应该重置为 0
      const nextPosition = DirectionHandler.calculateNextPosition(90, 10, 100, 'up');
      expect(nextPosition).toBe(0); // 90 + 10 = 100，应该重置为 0
    });
  });
});
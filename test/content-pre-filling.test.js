/**
 * 内容预填充机制测试
 * 测试 PositionCalculator.implementContentPreFilling 方法
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PositionCalculator } from '../src/core/utils/PositionCalculator.ts';
import { DirectionHandler } from '../src/core/utils/DirectionHandler.ts';

// 模拟 DOM 环境
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.getComputedStyle = dom.window.getComputedStyle;

describe('PositionCalculator - Content Pre-filling', () => {
  let content1, content2, container;

  beforeEach(() => {
    // 创建测试元素
    content1 = document.createElement('div');
    content2 = document.createElement('div');
    container = document.createElement('div');
    
    // 设置基本样式
    content1.style.width = '100px';
    content1.style.height = '50px';
    content2.style.width = '100px';
    content2.style.height = '50px';
    container.style.width = '200px';
    container.style.height = '100px';
    
    // 添加到 DOM
    document.body.appendChild(container);
    container.appendChild(content1);
    container.appendChild(content2);

    // Mock DirectionHandler methods
    vi.spyOn(DirectionHandler, 'getDirectionConfig').mockImplementation((direction) => {
      const configs = {
        'up': { isHorizontal: false, isReverse: false, transformProperty: 'translateY', positionProperty: 'top' },
        'down': { isHorizontal: false, isReverse: true, transformProperty: 'translateY', positionProperty: 'top' },
        'left': { isHorizontal: true, isReverse: false, transformProperty: 'translateX', positionProperty: 'left' },
        'right': { isHorizontal: true, isReverse: true, transformProperty: 'translateX', positionProperty: 'left' }
      };
      return configs[direction];
    });

    vi.spyOn(DirectionHandler, 'setInitialPosition').mockImplementation((element, position, direction) => {
      const config = DirectionHandler.getDirectionConfig(direction);
      element.style[config.positionProperty] = `${position}px`;
    });

    vi.spyOn(DirectionHandler, 'applyTransform').mockImplementation((element, position, direction) => {
      const config = DirectionHandler.getDirectionConfig(direction);
      element.style.transform = `${config.transformProperty}(${position}px)`;
    });

    // Mock PositionCalculator.getContentSize
    vi.spyOn(PositionCalculator, 'getContentSize').mockImplementation((element, direction) => {
      const config = DirectionHandler.getDirectionConfig(direction);
      return config.isHorizontal ? 100 : 50; // 默认内容尺寸
    });
  });

  afterEach(() => {
    document.body.removeChild(container);
    vi.clearAllMocks();
  });

  describe('Standard content size (content >= container)', () => {
    it('should apply standard pre-filling for up direction', () => {
      const result = PositionCalculator.implementContentPreFilling(
        content1, content2, 50, 'up' // container size smaller than content
      );

      expect(result.success).toBe(true);
      expect(result.contentSize).toBe(50); // content size for vertical
      expect(DirectionHandler.applyTransform).toHaveBeenCalledWith(content1, 0, 'up');
      expect(DirectionHandler.applyTransform).toHaveBeenCalledWith(content2, 0, 'up');
    });

    it('should apply standard pre-filling for down direction', () => {
      const result = PositionCalculator.implementContentPreFilling(
        content1, content2, 50, 'down' // container size smaller than content
      );

      expect(result.success).toBe(true);
      expect(result.contentSize).toBe(50); // content size for vertical
      expect(DirectionHandler.applyTransform).toHaveBeenCalledWith(content1, 0, 'down');
      expect(DirectionHandler.applyTransform).toHaveBeenCalledWith(content2, 0, 'down');
    });

    it('should apply standard pre-filling for left direction', () => {
      const result = PositionCalculator.implementContentPreFilling(
        content1, content2, 100, 'left' // container size equal to content
      );

      expect(result.success).toBe(true);
      expect(result.contentSize).toBe(100); // content size for horizontal
      expect(DirectionHandler.applyTransform).toHaveBeenCalledWith(content1, 0, 'left');
      expect(DirectionHandler.applyTransform).toHaveBeenCalledWith(content2, 0, 'left');
    });

    it('should apply standard pre-filling for right direction', () => {
      const result = PositionCalculator.implementContentPreFilling(
        content1, content2, 100, 'right' // container size equal to content
      );

      expect(result.success).toBe(true);
      expect(result.contentSize).toBe(100); // content size for horizontal
      expect(DirectionHandler.applyTransform).toHaveBeenCalledWith(content1, 0, 'right');
      expect(DirectionHandler.applyTransform).toHaveBeenCalledWith(content2, 0, 'right');
    });
  });

  describe('Small content size (content < container)', () => {
    beforeEach(() => {
      // Mock smaller content size
      PositionCalculator.getContentSize.mockImplementation((element, direction) => {
        const config = DirectionHandler.getDirectionConfig(direction);
        return config.isHorizontal ? 50 : 25; // 小于容器尺寸
      });
    });

    it('should handle small content for up direction', () => {
      const result = PositionCalculator.implementContentPreFilling(
        content1, content2, 100, 'up'
      );

      expect(result.success).toBe(true);
      expect(result.adjustedPositions).toBeDefined();
      expect(result.adjustedPositions.content1).toBe(0);
      expect(result.adjustedPositions.content2).toBe(-25);
      expect(result.contentSize).toBe(100); // 4 copies * 25 = 100
    });

    it('should handle small content for down direction', () => {
      const result = PositionCalculator.implementContentPreFilling(
        content1, content2, 100, 'down'
      );

      expect(result.success).toBe(true);
      expect(result.adjustedPositions).toBeDefined();
      expect(result.adjustedPositions.content1).toBe(0);
      expect(result.adjustedPositions.content2).toBe(25);
      expect(result.contentSize).toBe(100); // 4 copies * 25 = 100
    });

    it('should handle small content for left direction', () => {
      const result = PositionCalculator.implementContentPreFilling(
        content1, content2, 200, 'left'
      );

      expect(result.success).toBe(true);
      expect(result.adjustedPositions).toBeDefined();
      expect(result.adjustedPositions.content1).toBe(0);
      expect(result.adjustedPositions.content2).toBe(50);
      expect(result.contentSize).toBe(200); // 4 copies * 50 = 200
    });

    it('should handle small content for right direction', () => {
      const result = PositionCalculator.implementContentPreFilling(
        content1, content2, 200, 'right'
      );

      expect(result.success).toBe(true);
      expect(result.adjustedPositions).toBeDefined();
      expect(result.adjustedPositions.content1).toBe(0);
      expect(result.adjustedPositions.content2).toBe(-50);
      expect(result.contentSize).toBe(200); // 4 copies * 50 = 200
    });
  });

  describe('Edge cases', () => {
    it('should handle zero content size', () => {
      PositionCalculator.getContentSize.mockReturnValue(0);

      const result = PositionCalculator.implementContentPreFilling(
        content1, content2, 100, 'up'
      );

      expect(result.success).toBe(true);
      // Should handle gracefully with fallback
    });

    it('should handle zero container size', () => {
      const result = PositionCalculator.implementContentPreFilling(
        content1, content2, 0, 'up'
      );

      expect(result.success).toBe(true);
      // Should handle gracefully
    });

    it('should handle invalid direction gracefully', () => {
      // Mock DirectionHandler to throw for invalid direction
      DirectionHandler.getDirectionConfig.mockImplementation(() => {
        throw new Error('Invalid direction');
      });

      const result = PositionCalculator.implementContentPreFilling(
        content1, content2, 100, 'invalid'
      );

      expect(result.success).toBe(false);
      expect(result.contentSize).toBe(0);
    });

    it('should handle DOM manipulation errors', () => {
      // Mock setInitialPosition to throw
      DirectionHandler.setInitialPosition.mockImplementation(() => {
        throw new Error('DOM error');
      });

      const result = PositionCalculator.implementContentPreFilling(
        content1, content2, 100, 'up'
      );

      expect(result.success).toBe(false);
    });
  });

  describe('Content size calculations', () => {
    it('should calculate effective content size for multiple copies', () => {
      // Very small content
      PositionCalculator.getContentSize.mockReturnValue(10);

      const result = PositionCalculator.implementContentPreFilling(
        content1, content2, 100, 'up'
      );

      expect(result.success).toBe(true);
      expect(result.contentSize).toBe(100); // 10 copies * 10 = 100
    });

    it('should handle exact container size match', () => {
      PositionCalculator.getContentSize.mockReturnValue(100);

      const result = PositionCalculator.implementContentPreFilling(
        content1, content2, 100, 'up'
      );

      expect(result.success).toBe(true);
      expect(result.contentSize).toBe(100);
      expect(result.adjustedPositions).toBeUndefined(); // Standard pre-filling
    });
  });

  describe('Transform initialization', () => {
    it('should initialize transforms to zero for all directions', () => {
      const directions = ['up', 'down', 'left', 'right'];
      
      directions.forEach(direction => {
        DirectionHandler.applyTransform.mockClear();
        
        PositionCalculator.implementContentPreFilling(
          content1, content2, 100, direction
        );

        expect(DirectionHandler.applyTransform).toHaveBeenCalledWith(content1, 0, direction);
        expect(DirectionHandler.applyTransform).toHaveBeenCalledWith(content2, 0, direction);
      });
    });
  });
});
/**
 * 空白区域检测和自动修复测试
 * 测试 PositionCalculator.detectAndFixBlankAreas 方法
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

describe('PositionCalculator - Blank Area Detection', () => {
  let content1, content2, container;

  beforeEach(() => {
    // 创建测试元素
    content1 = document.createElement('div');
    content2 = document.createElement('div');
    container = document.createElement('div');
    
    // 设置基本样式和位置
    content1.style.width = '100px';
    content1.style.height = '50px';
    content1.style.position = 'absolute';
    content1.style.left = '0px';
    content1.style.top = '0px';
    
    content2.style.width = '100px';
    content2.style.height = '50px';
    content2.style.position = 'absolute';
    content2.style.left = '100px';
    content2.style.top = '0px';
    
    container.style.width = '200px';
    container.style.height = '100px';
    container.style.position = 'relative';
    container.style.overflow = 'hidden';
    
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

    // Mock PositionCalculator.getContentSize
    vi.spyOn(PositionCalculator, 'getContentSize').mockImplementation((element, direction) => {
      const config = DirectionHandler.getDirectionConfig(direction);
      return config.isHorizontal ? 100 : 50;
    });

    // Mock getBoundingClientRect for elements
    container.getBoundingClientRect = vi.fn(() => ({
      left: 0, top: 0, right: 200, bottom: 100, width: 200, height: 100
    }));
  });

  afterEach(() => {
    document.body.removeChild(container);
    vi.clearAllMocks();
  });

  describe('Right direction blank detection', () => {
    it('should detect left-side blank in right direction', () => {
      // 设置有左侧空白的情况
      content1.getBoundingClientRect = vi.fn(() => ({
        left: 50, top: 0, right: 150, bottom: 50, width: 100, height: 50
      }));
      content2.getBoundingClientRect = vi.fn(() => ({
        left: 150, top: 0, right: 250, bottom: 50, width: 100, height: 50
      }));

      const result = PositionCalculator.detectAndFixBlankAreas(
        content1, content2, container, 'right'
      );

      expect(result.hasBlankAreas).toBe(true);
      expect(result.fixedAreas).toContain('right-direction-left-blank');
      expect(DirectionHandler.setInitialPosition).toHaveBeenCalledWith(content2, -100, 'right');
    });

    it('should not detect blank when content is properly positioned', () => {
      // 设置正确定位的情况
      content1.getBoundingClientRect = vi.fn(() => ({
        left: 0, top: 0, right: 100, bottom: 50, width: 100, height: 50
      }));
      content2.getBoundingClientRect = vi.fn(() => ({
        left: 100, top: 0, right: 200, bottom: 50, width: 100, height: 50
      }));

      const result = PositionCalculator.detectAndFixBlankAreas(
        content1, content2, container, 'right'
      );

      expect(result.hasBlankAreas).toBe(false);
      expect(result.fixedAreas).toBeUndefined();
    });
  });

  describe('Down direction blank detection', () => {
    it('should detect top-side blank in down direction', () => {
      // 设置有上侧空白的情况
      content1.getBoundingClientRect = vi.fn(() => ({
        left: 0, top: 25, right: 100, bottom: 75, width: 100, height: 50
      }));
      content2.getBoundingClientRect = vi.fn(() => ({
        left: 0, top: 75, right: 100, bottom: 125, width: 100, height: 50
      }));

      const result = PositionCalculator.detectAndFixBlankAreas(
        content1, content2, container, 'down'
      );

      expect(result.hasBlankAreas).toBe(true);
      expect(result.fixedAreas).toContain('down-direction-top-blank');
      expect(DirectionHandler.setInitialPosition).toHaveBeenCalledWith(content2, -50, 'down');
    });

    it('should not detect blank when content fills from top', () => {
      // 设置从顶部开始的正确定位
      content1.getBoundingClientRect = vi.fn(() => ({
        left: 0, top: 0, right: 100, bottom: 50, width: 100, height: 50
      }));
      content2.getBoundingClientRect = vi.fn(() => ({
        left: 0, top: 50, right: 100, bottom: 100, width: 100, height: 50
      }));

      const result = PositionCalculator.detectAndFixBlankAreas(
        content1, content2, container, 'down'
      );

      expect(result.hasBlankAreas).toBe(false);
      expect(result.fixedAreas).toBeUndefined();
    });
  });

  describe('Left direction blank detection', () => {
    it('should detect right-side blank in left direction', () => {
      // 设置有右侧空白的情况
      content1.getBoundingClientRect = vi.fn(() => ({
        left: 0, top: 0, right: 50, bottom: 50, width: 50, height: 50
      }));
      content2.getBoundingClientRect = vi.fn(() => ({
        left: 50, top: 0, right: 100, bottom: 50, width: 50, height: 50
      }));

      const result = PositionCalculator.detectAndFixBlankAreas(
        content1, content2, container, 'left'
      );

      expect(result.hasBlankAreas).toBe(true);
      expect(result.fixedAreas).toContain('left-direction-right-blank');
      expect(DirectionHandler.setInitialPosition).toHaveBeenCalledWith(content2, 100, 'left');
    });

    it('should not detect blank when content fills to right edge', () => {
      // 设置填满到右边缘的情况
      content1.getBoundingClientRect = vi.fn(() => ({
        left: 0, top: 0, right: 100, bottom: 50, width: 100, height: 50
      }));
      content2.getBoundingClientRect = vi.fn(() => ({
        left: 100, top: 0, right: 200, bottom: 50, width: 100, height: 50
      }));

      const result = PositionCalculator.detectAndFixBlankAreas(
        content1, content2, container, 'left'
      );

      expect(result.hasBlankAreas).toBe(false);
      expect(result.fixedAreas).toBeUndefined();
    });
  });

  describe('Up direction blank detection', () => {
    it('should detect bottom-side blank in up direction', () => {
      // 设置有下侧空白的情况
      content1.getBoundingClientRect = vi.fn(() => ({
        left: 0, top: 0, right: 100, bottom: 25, width: 100, height: 25
      }));
      content2.getBoundingClientRect = vi.fn(() => ({
        left: 0, top: -25, right: 100, bottom: 0, width: 100, height: 25
      }));

      const result = PositionCalculator.detectAndFixBlankAreas(
        content1, content2, container, 'up'
      );

      expect(result.hasBlankAreas).toBe(true);
      expect(result.fixedAreas).toContain('up-direction-bottom-blank');
      expect(DirectionHandler.setInitialPosition).toHaveBeenCalledWith(content2, -50, 'up');
    });

    it('should not detect blank when content fills to bottom edge', () => {
      // 设置填满到底边的情况 - content1 和 content2 应该覆盖整个容器高度
      content1.getBoundingClientRect = vi.fn(() => ({
        left: 0, top: 0, right: 100, bottom: 100, width: 100, height: 100 // 填满整个容器高度
      }));
      content2.getBoundingClientRect = vi.fn(() => ({
        left: 0, top: -50, right: 100, bottom: 50, width: 100, height: 100 // 在上方，但底部到达容器中部
      }));

      const result = PositionCalculator.detectAndFixBlankAreas(
        content1, content2, container, 'up'
      );

      expect(result.hasBlankAreas).toBe(false);
      expect(result.fixedAreas).toBeUndefined();
    });
  });

  describe('Error handling', () => {
    it('should handle invalid container size', () => {
      container.style.width = '0px';
      container.getBoundingClientRect = vi.fn(() => ({
        left: 0, top: 0, right: 0, bottom: 100, width: 0, height: 100
      }));

      const result = PositionCalculator.detectAndFixBlankAreas(
        content1, content2, container, 'right'
      );

      expect(result.hasBlankAreas).toBe(false);
      expect(result.errors).toContain('Invalid container size');
    });

    it('should handle invalid content size', () => {
      PositionCalculator.getContentSize.mockReturnValue(0);
      
      // Also need to mock container size to be valid
      container.getBoundingClientRect = vi.fn(() => ({
        left: 0, top: 0, right: 200, bottom: 100, width: 200, height: 100
      }));

      const result = PositionCalculator.detectAndFixBlankAreas(
        content1, content2, container, 'right'
      );

      expect(result.hasBlankAreas).toBe(false);
      expect(result.errors).toContain('Invalid content size');
    });

    it('should handle DOM manipulation errors', () => {
      DirectionHandler.setInitialPosition.mockImplementation(() => {
        throw new Error('DOM manipulation failed');
      });

      // 设置有空白的情况
      content1.getBoundingClientRect = vi.fn(() => ({
        left: 50, top: 0, right: 150, bottom: 50, width: 100, height: 50
      }));
      content2.getBoundingClientRect = vi.fn(() => ({
        left: 150, top: 0, right: 250, bottom: 50, width: 100, height: 50
      }));

      const result = PositionCalculator.detectAndFixBlankAreas(
        content1, content2, container, 'right'
      );

      expect(result.hasBlankAreas).toBe(true);
      expect(result.errors).toBeDefined();
      expect(result.errors[0]).toContain('Failed to fix right-direction-left-blank');
    });

    it('should handle getBoundingClientRect errors', () => {
      // Reset container to valid state first
      container.getBoundingClientRect = vi.fn(() => ({
        left: 0, top: 0, right: 200, bottom: 100, width: 200, height: 100
      }));
      
      content1.getBoundingClientRect = vi.fn(() => {
        throw new Error('getBoundingClientRect failed');
      });

      const result = PositionCalculator.detectAndFixBlankAreas(
        content1, content2, container, 'right'
      );

      expect(result.hasBlankAreas).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors[0]).toContain('Blank area detection failed');
    });
  });

  describe('Runtime monitoring', () => {
    it('should monitor runtime blank areas at appropriate positions', () => {
      const result = PositionCalculator.monitorRuntimeBlankAreas(
        content1, content2, container, 'right', -90 // 接近重置点
      );

      expect(result.needsFix).toBeDefined();
    });

    it('should skip monitoring when position is not critical', () => {
      const result = PositionCalculator.monitorRuntimeBlankAreas(
        content1, content2, container, 'right', -50 // 中间位置
      );

      expect(result.needsFix).toBe(false);
    });

    it('should handle monitoring errors gracefully', () => {
      PositionCalculator.getContentSize.mockImplementation(() => {
        throw new Error('Content size calculation failed');
      });

      const result = PositionCalculator.monitorRuntimeBlankAreas(
        content1, content2, container, 'right', -90
      );

      expect(result.needsFix).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors[0]).toContain('Runtime monitoring failed');
    });
  });

  describe('Tolerance handling', () => {
    it('should allow small positioning errors within tolerance', () => {
      // 设置在容差范围内的小偏移
      content1.getBoundingClientRect = vi.fn(() => ({
        left: 1, top: 0, right: 101, bottom: 50, width: 100, height: 50 // 1px偏移，在容差内
      }));
      content2.getBoundingClientRect = vi.fn(() => ({
        left: 101, top: 0, right: 201, bottom: 50, width: 100, height: 50
      }));

      const result = PositionCalculator.detectAndFixBlankAreas(
        content1, content2, container, 'right'
      );

      expect(result.hasBlankAreas).toBe(false);
      expect(result.fixedAreas).toBeUndefined();
    });

    it('should detect blanks beyond tolerance threshold', () => {
      // 设置超出容差的偏移
      content1.getBoundingClientRect = vi.fn(() => ({
        left: 5, top: 0, right: 105, bottom: 50, width: 100, height: 50 // 5px偏移，超出容差
      }));
      content2.getBoundingClientRect = vi.fn(() => ({
        left: 105, top: 0, right: 205, bottom: 50, width: 100, height: 50
      }));

      const result = PositionCalculator.detectAndFixBlankAreas(
        content1, content2, container, 'right'
      );

      expect(result.hasBlankAreas).toBe(true);
      expect(result.fixedAreas).toContain('right-direction-left-blank');
    });
  });
});
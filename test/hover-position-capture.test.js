/**
 * 测试 HoverPositionManager 的精确位置捕获功能
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { HoverPositionManager } from '../src/core/utils/HoverPositionManager.js';

describe('HoverPositionManager - Precise Position Capture', () => {
  let mockState;
  let mockElement;

  beforeEach(() => {
    // 创建模拟的 DOM 元素
    mockElement = {
      style: { transform: '' },
      getBoundingClientRect: () => ({ width: 200, height: 100 })
    };

    mockState = {
      content1: mockElement,
      content2: { ...mockElement },
      position: 100,
      animationId: null
    };

    // 模拟 getComputedStyle
    global.getComputedStyle = vi.fn(() => ({
      transform: 'translateX(150px)'
    }));

    // 模拟 DOMMatrix
    global.DOMMatrix = vi.fn().mockImplementation((transform) => {
      if (transform === 'translateX(150px)') {
        return { m41: 150, m42: 0 };
      }
      if (transform === 'translateY(200px)') {
        return { m41: 0, m42: 200 };
      }
      if (transform === 'matrix(1, 0, 0, 1, 100, 50)') {
        return { m41: 100, m42: 50 };
      }
      throw new Error('Invalid transform');
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('captureCurrentPosition', () => {
    test('should capture position from translateX transform', () => {
      global.getComputedStyle.mockReturnValue({
        transform: 'translateX(150px)'
      });

      const position = HoverPositionManager.captureCurrentPosition(mockState, 'left');
      expect(position).toBe(150);
    });

    test('should capture position from translateY transform', () => {
      global.getComputedStyle.mockReturnValue({
        transform: 'translateY(200px)'
      });

      const position = HoverPositionManager.captureCurrentPosition(mockState, 'up');
      expect(position).toBe(200);
    });

    test('should handle matrix transform format', () => {
      global.getComputedStyle.mockReturnValue({
        transform: 'matrix(1, 0, 0, 1, 100, 50)'
      });

      const horizontalPosition = HoverPositionManager.captureCurrentPosition(mockState, 'left');
      expect(horizontalPosition).toBe(100);

      const verticalPosition = HoverPositionManager.captureCurrentPosition(mockState, 'up');
      expect(verticalPosition).toBe(50);
    });

    test('should return 0 for no transform', () => {
      global.getComputedStyle.mockReturnValue({
        transform: 'none'
      });

      const position = HoverPositionManager.captureCurrentPosition(mockState, 'left');
      expect(position).toBe(0);
    });

    test('should fallback to logical position when DOMMatrix fails', () => {
      global.getComputedStyle.mockReturnValue({
        transform: 'translateX(150px)'
      });
      
      global.DOMMatrix.mockImplementation(() => {
        throw new Error('DOMMatrix not supported');
      });

      const position = HoverPositionManager.captureCurrentPosition(mockState, 'left');
      expect(position).toBe(150); // Should parse using regex fallback
    });

    test('should handle translate format with two values', () => {
      global.getComputedStyle.mockReturnValue({
        transform: 'translate(100px, 50px)'
      });
      
      global.DOMMatrix.mockImplementation(() => {
        throw new Error('DOMMatrix not supported');
      });

      const horizontalPosition = HoverPositionManager.captureCurrentPosition(mockState, 'left');
      expect(horizontalPosition).toBe(100);

      const verticalPosition = HoverPositionManager.captureCurrentPosition(mockState, 'up');
      expect(verticalPosition).toBe(50);
    });

    test('should handle translate format with single value', () => {
      global.getComputedStyle.mockReturnValue({
        transform: 'translate(75px)'
      });
      
      global.DOMMatrix.mockImplementation(() => {
        throw new Error('DOMMatrix not supported');
      });

      const horizontalPosition = HoverPositionManager.captureCurrentPosition(mockState, 'left');
      expect(horizontalPosition).toBe(75);

      const verticalPosition = HoverPositionManager.captureCurrentPosition(mockState, 'up');
      expect(verticalPosition).toBe(0); // Y value defaults to 0
    });

    test('should handle matrix3d format', () => {
      global.getComputedStyle.mockReturnValue({
        transform: 'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 120, 80, 0, 1)'
      });
      
      global.DOMMatrix.mockImplementation(() => {
        throw new Error('DOMMatrix not supported');
      });

      const horizontalPosition = HoverPositionManager.captureCurrentPosition(mockState, 'left');
      expect(horizontalPosition).toBe(120);

      const verticalPosition = HoverPositionManager.captureCurrentPosition(mockState, 'up');
      expect(verticalPosition).toBe(80);
    });

    test('should handle translate3d format', () => {
      global.getComputedStyle.mockReturnValue({
        transform: 'translate3d(90px, 60px, 0px)'
      });
      
      global.DOMMatrix.mockImplementation(() => {
        throw new Error('DOMMatrix not supported');
      });

      const horizontalPosition = HoverPositionManager.captureCurrentPosition(mockState, 'left');
      expect(horizontalPosition).toBe(90);

      const verticalPosition = HoverPositionManager.captureCurrentPosition(mockState, 'up');
      expect(verticalPosition).toBe(60);
    });

    test('should return logical position when all parsing fails', () => {
      global.getComputedStyle.mockReturnValue({
        transform: 'invalid-transform'
      });
      
      global.DOMMatrix.mockImplementation(() => {
        throw new Error('DOMMatrix not supported');
      });

      const position = HoverPositionManager.captureCurrentPosition(mockState, 'left');
      expect(position).toBe(100); // Should fallback to state.position
    });

    test('should handle infinite values', () => {
      global.getComputedStyle.mockReturnValue({
        transform: 'matrix(1, 0, 0, 1, Infinity, 0)' // Use matrix format that will fail regex parsing
      });
      
      global.DOMMatrix.mockImplementation(() => ({
        m41: Infinity,
        m42: 0
      }));

      const position = HoverPositionManager.captureCurrentPosition(mockState, 'left');
      expect(position).toBe(100); // Should fallback to state.position
    });

    test('should handle NaN values', () => {
      global.getComputedStyle.mockReturnValue({
        transform: 'matrix(1, 0, 0, 1, NaN, 0)' // Use matrix format that will fail regex parsing
      });
      
      global.DOMMatrix.mockImplementation(() => ({
        m41: NaN,
        m42: 0
      }));

      const position = HoverPositionManager.captureCurrentPosition(mockState, 'left');
      expect(position).toBe(100); // Should fallback to state.position
    });

    test('should handle different scroll directions correctly', () => {
      global.getComputedStyle.mockReturnValue({
        transform: 'translate(100px, 50px)'
      });
      
      global.DOMMatrix.mockImplementation(() => {
        throw new Error('DOMMatrix not supported');
      });

      // Test all directions
      expect(HoverPositionManager.captureCurrentPosition(mockState, 'left')).toBe(100);
      expect(HoverPositionManager.captureCurrentPosition(mockState, 'right')).toBe(100);
      expect(HoverPositionManager.captureCurrentPosition(mockState, 'up')).toBe(50);
      expect(HoverPositionManager.captureCurrentPosition(mockState, 'down')).toBe(50);
    });

    test('should handle complex transform combinations', () => {
      global.getComputedStyle.mockReturnValue({
        transform: 'translateX(100px) scale(1.5) rotate(45deg)'
      });
      
      global.DOMMatrix.mockImplementation(() => {
        throw new Error('DOMMatrix not supported');
      });

      const position = HoverPositionManager.captureCurrentPosition(mockState, 'left');
      expect(position).toBe(100); // Should extract translateX value
    });

    test('should handle negative values', () => {
      global.getComputedStyle.mockReturnValue({
        transform: 'translate(-50px, -25px)'
      });
      
      global.DOMMatrix.mockImplementation(() => {
        throw new Error('DOMMatrix not supported');
      });

      const horizontalPosition = HoverPositionManager.captureCurrentPosition(mockState, 'left');
      expect(horizontalPosition).toBe(-50);

      const verticalPosition = HoverPositionManager.captureCurrentPosition(mockState, 'up');
      expect(verticalPosition).toBe(-25);
    });

    test('should handle decimal values', () => {
      global.getComputedStyle.mockReturnValue({
        transform: 'translate(123.45px, 67.89px)'
      });
      
      global.DOMMatrix.mockImplementation(() => {
        throw new Error('DOMMatrix not supported');
      });

      const horizontalPosition = HoverPositionManager.captureCurrentPosition(mockState, 'left');
      expect(horizontalPosition).toBe(123.45);

      const verticalPosition = HoverPositionManager.captureCurrentPosition(mockState, 'up');
      expect(verticalPosition).toBe(67.89);
    });
  });

  describe('parseTransformPosition - private method behavior', () => {
    test('should prioritize DOMMatrix when available', () => {
      global.getComputedStyle.mockReturnValue({
        transform: 'translateX(150px)'
      });

      // DOMMatrix should be called first
      const position = HoverPositionManager.captureCurrentPosition(mockState, 'left');
      expect(global.DOMMatrix).toHaveBeenCalledWith('translateX(150px)');
      expect(position).toBe(150);
    });

    test('should use regex parsing when DOMMatrix fails', () => {
      global.getComputedStyle.mockReturnValue({
        transform: 'translateX(150px)'
      });
      
      global.DOMMatrix.mockImplementation(() => {
        throw new Error('DOMMatrix not supported');
      });

      const position = HoverPositionManager.captureCurrentPosition(mockState, 'left');
      expect(position).toBe(150); // Should still work via regex
    });
  });

  describe('Error handling and edge cases', () => {
    test('should handle getComputedStyle throwing error', () => {
      global.getComputedStyle.mockImplementation(() => {
        throw new Error('getComputedStyle failed');
      });

      const position = HoverPositionManager.captureCurrentPosition(mockState, 'left');
      expect(position).toBe(100); // Should fallback to state.position
    });

    test('should handle null state', () => {
      const position = HoverPositionManager.captureCurrentPosition(null, 'left');
      expect(position).toBe(null);
    });

    test('should handle missing content1', () => {
      const invalidState = { ...mockState, content1: null };
      const position = HoverPositionManager.captureCurrentPosition(invalidState, 'left');
      expect(position).toBe(null);
    });

    test('should handle empty transform string', () => {
      global.getComputedStyle.mockReturnValue({
        transform: ''
      });

      const position = HoverPositionManager.captureCurrentPosition(mockState, 'left');
      expect(position).toBe(0);
    });

    test('should handle whitespace-only transform', () => {
      global.getComputedStyle.mockReturnValue({
        transform: '   '
      });

      const position = HoverPositionManager.captureCurrentPosition(mockState, 'left');
      expect(position).toBe(0);
    });
  });
});
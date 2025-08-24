/**
 * 无缝连接优化测试
 * 测试 PositionCalculator.optimizeSeamlessConnection 方法
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

describe('PositionCalculator - Seamless Connection', () => {
  let content1, content2;

  beforeEach(() => {
    // 创建测试元素
    content1 = document.createElement('div');
    content2 = document.createElement('div');
    
    // 设置基本样式
    content1.style.width = '100px';
    content1.style.height = '50px';
    content1.style.position = 'absolute';
    
    content2.style.width = '100px';
    content2.style.height = '50px';
    content2.style.position = 'absolute';
    
    // 添加到 DOM
    document.body.appendChild(content1);
    document.body.appendChild(content2);

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
  });

  afterEach(() => {
    document.body.removeChild(content1);
    document.body.removeChild(content2);
    vi.clearAllMocks();
  });

  describe('Right direction optimization', () => {
    it('should optimize right direction positioning', () => {
      const result = PositionCalculator.optimizeSeamlessConnection(
        50, 100, 200, 'right'
      );

      expect(result.content1Transform).toBe('translateX(-50px)');
      expect(result.content2Transform).toBe('translateX(50px)');
      expect(result.shouldReset).toBe(false);
    });

    it('should trigger reset when position reaches content size', () => {
      const result = PositionCalculator.optimizeSeamlessConnection(
        100, 100, 200, 'right'
      );

      expect(result.content1Transform).toBe('translateX(-100px)');
      expect(result.content2Transform).toBe('translateX(0px)');
      expect(result.shouldReset).toBe(true);
    });

    it('should handle positions beyond content size', () => {
      const result = PositionCalculator.optimizeSeamlessConnection(
        150, 100, 200, 'right'
      );

      expect(result.content1Transform).toBe('translateX(-150px)');
      expect(result.content2Transform).toBe('translateX(-50px)');
      expect(result.shouldReset).toBe(true);
    });
  });

  describe('Down direction optimization', () => {
    it('should optimize down direction positioning', () => {
      const result = PositionCalculator.optimizeSeamlessConnection(
        25, 50, 100, 'down'
      );

      expect(result.content1Transform).toBe('translateY(-25px)');
      expect(result.content2Transform).toBe('translateY(25px)');
      expect(result.shouldReset).toBe(false);
    });

    it('should trigger reset when position reaches content size', () => {
      const result = PositionCalculator.optimizeSeamlessConnection(
        50, 50, 100, 'down'
      );

      expect(result.content1Transform).toBe('translateY(-50px)');
      expect(result.content2Transform).toBe('translateY(0px)');
      expect(result.shouldReset).toBe(true);
    });
  });

  describe('Left direction optimization', () => {
    it('should optimize left direction positioning', () => {
      const result = PositionCalculator.optimizeSeamlessConnection(
        50, 100, 200, 'left'
      );

      expect(result.content1Transform).toBe('translateX(-50px)');
      expect(result.content2Transform).toBe('translateX(50px)');
      expect(result.shouldReset).toBe(false);
    });

    it('should trigger reset when position reaches content size', () => {
      const result = PositionCalculator.optimizeSeamlessConnection(
        100, 100, 200, 'left'
      );

      expect(result.content1Transform).toBe('translateX(-100px)');
      expect(result.content2Transform).toBe('translateX(0px)');
      expect(result.shouldReset).toBe(true);
    });
  });

  describe('Up direction optimization', () => {
    it('should optimize up direction positioning', () => {
      const result = PositionCalculator.optimizeSeamlessConnection(
        25, 50, 100, 'up'
      );

      expect(result.content1Transform).toBe('translateY(-25px)');
      expect(result.content2Transform).toBe('translateY(25px)');
      expect(result.shouldReset).toBe(false);
    });

    it('should trigger reset when position reaches content size', () => {
      const result = PositionCalculator.optimizeSeamlessConnection(
        50, 50, 100, 'up'
      );

      expect(result.content1Transform).toBe('translateY(-50px)');
      expect(result.content2Transform).toBe('translateY(0px)');
      expect(result.shouldReset).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should handle invalid content size', () => {
      const result = PositionCalculator.optimizeSeamlessConnection(
        50, 0, 200, 'right'
      );

      expect(result.content1Transform).toBeDefined();
      expect(result.content2Transform).toBeDefined();
      expect(result.shouldReset).toBeDefined();
    });

    it('should handle negative positions', () => {
      const result = PositionCalculator.optimizeSeamlessConnection(
        -25, 100, 200, 'right'
      );

      expect(result.content1Transform).toBe('translateX(25px)');
      expect(result.content2Transform).toBe('translateX(125px)');
      expect(result.shouldReset).toBe(false);
    });

    it('should handle DirectionHandler errors gracefully', () => {
      DirectionHandler.getDirectionConfig.mockImplementation(() => {
        throw new Error('Direction config error');
      });

      const result = PositionCalculator.optimizeSeamlessConnection(
        50, 100, 200, 'right'
      );

      // Should return safe defaults
      expect(result.content1Transform).toBeDefined();
      expect(result.content2Transform).toBeDefined();
      expect(result.shouldReset).toBe(false);
    });
  });

  describe('Seamless connection validation', () => {
    it('should validate correct seamless connection', () => {
      const result = PositionCalculator.validateSeamlessConnection(
        'translateX(-50px)',
        'translateX(50px)',
        100,
        'right'
      );

      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should detect incorrect content distance', () => {
      const result = PositionCalculator.validateSeamlessConnection(
        'translateX(-50px)',
        'translateX(25px)', // Wrong distance
        100,
        'right'
      );

      expect(result.isValid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
      // Check if any issue contains the expected text
      const hasDistanceMismatch = result.issues.some(issue => 
        issue.includes('Content distance mismatch') || issue.includes('distance')
      );
      expect(hasDistanceMismatch).toBe(true);
    });

    it('should detect wrong transform property', () => {
      const result = PositionCalculator.validateSeamlessConnection(
        'translateY(-50px)', // Wrong property for right direction
        'translateY(50px)',
        100,
        'right'
      );

      expect(result.isValid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
      // Check if any issue contains the expected text
      const hasPropertyMismatch = result.issues.some(issue => 
        issue.includes('Transform property mismatch') || issue.includes('property')
      );
      expect(hasPropertyMismatch).toBe(true);
    });

    it('should handle invalid transform strings', () => {
      const result = PositionCalculator.validateSeamlessConnection(
        'invalid-transform',
        'translateX(50px)',
        100,
        'right'
      );

      expect(result.isValid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
      // Check if any issue contains the expected text
      const hasExtractError = result.issues.some(issue => 
        issue.includes('Failed to extract transform values') || issue.includes('extract')
      );
      expect(hasExtractError).toBe(true);
    });
  });

  describe('Content gap fixing', () => {
    beforeEach(() => {
      // Mock getComputedStyle
      global.getComputedStyle = vi.fn((element) => ({
        transform: element === content1 ? 'translateX(-50px)' : 'translateX(25px)' // Incorrect gap
      }));
    });

    it('should fix content gaps when validation fails', () => {
      const result = PositionCalculator.fixContentGaps(
        content1, content2, 100, 'right', 50
      );

      expect(result.fixed).toBe(true);
      expect(result.adjustments).toContain('Applied optimized transforms');
      expect(content1.style.transform).toBe('translateX(-50px)');
      expect(content2.style.transform).toBe('translateX(50px)');
    });

    it('should skip fixing when connection is already valid', () => {
      // Mock correct transforms
      global.getComputedStyle = vi.fn((element) => ({
        transform: element === content1 ? 'translateX(-50px)' : 'translateX(50px)' // Correct gap
      }));

      const result = PositionCalculator.fixContentGaps(
        content1, content2, 100, 'right', 50
      );

      expect(result.fixed).toBe(true);
      expect(result.adjustments).toBeUndefined(); // No adjustments needed
    });

    it('should handle getComputedStyle errors', () => {
      global.getComputedStyle = vi.fn(() => {
        throw new Error('getComputedStyle failed');
      });

      const result = PositionCalculator.fixContentGaps(
        content1, content2, 100, 'right', 50
      );

      expect(result.fixed).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle zero position', () => {
      const result = PositionCalculator.optimizeSeamlessConnection(
        0, 100, 200, 'right'
      );

      expect(result.content1Transform).toBe('translateX(0px)');
      expect(result.content2Transform).toBe('translateX(100px)');
      expect(result.shouldReset).toBe(false);
    });

    it('should handle very large positions', () => {
      const result = PositionCalculator.optimizeSeamlessConnection(
        1000, 100, 200, 'right'
      );

      expect(result.content1Transform).toBe('translateX(-1000px)');
      expect(result.content2Transform).toBe('translateX(-900px)');
      expect(result.shouldReset).toBe(true);
    });

    it('should handle small content size relative to container', () => {
      const result = PositionCalculator.optimizeSeamlessConnection(
        25, 50, 200, 'right'
      );

      expect(result.content1Transform).toBe('translateX(-25px)');
      expect(result.content2Transform).toBe('translateX(25px)');
      expect(result.shouldReset).toBe(false);
    });
  });

  describe('Transform value extraction', () => {
    it('should extract positive values', () => {
      const value = PositionCalculator.extractTransformValue('translateX(50px)');
      expect(value).toBe(50);
    });

    it('should extract negative values', () => {
      const value = PositionCalculator.extractTransformValue('translateY(-25px)');
      expect(value).toBe(-25);
    });

    it('should extract decimal values', () => {
      const value = PositionCalculator.extractTransformValue('translateX(12.5px)');
      expect(value).toBe(12.5);
    });

    it('should return null for invalid transforms', () => {
      const value = PositionCalculator.extractTransformValue('invalid');
      expect(value).toBeNull();
    });
  });
});
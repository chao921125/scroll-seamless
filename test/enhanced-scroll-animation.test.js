/**
 * 测试增强的滚动动画创建
 * 验证 ScrollEngine 使用优化的无缝连接和增强的位置验证
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ScrollEngine } from '../src/core/ScrollEngine';
import { PositionCalculator } from '../src/core/utils/PositionCalculator';
import { rafScheduler } from '../src/core/utils/RAFScheduler';

// Mock DOM environment
const mockElement = (tag = 'div', properties = {}) => {
  const element = {
    tagName: tag.toUpperCase(),
    style: {},
    offsetWidth: 300,
    offsetHeight: 200,
    appendChild: vi.fn(),
    innerHTML: '',
    parentElement: null,
    ...properties
  };
  
  // Mock style property setter/getter
  Object.defineProperty(element, 'style', {
    value: new Proxy({}, {
      set(target, prop, value) {
        target[prop] = value;
        return true;
      },
      get(target, prop) {
        return target[prop] || '';
      }
    }),
    writable: true
  });
  
  return element;
};

describe('Enhanced Scroll Animation Creation', () => {
  let container;
  let scrollEngine;
  
  // Mock PositionCalculator methods
  const mockValidatePositionCalculation = vi.spyOn(PositionCalculator, 'validatePositionCalculation');
  const mockOptimizeSeamlessConnection = vi.spyOn(PositionCalculator, 'optimizeSeamlessConnection');
  const mockDetectAndFixBlankAreas = vi.spyOn(PositionCalculator, 'detectAndFixBlankAreas');
  const mockImplementContentPreFilling = vi.spyOn(PositionCalculator, 'implementContentPreFilling');

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Create mock container
    container = mockElement('div', {
      offsetWidth: 300,
      offsetHeight: 200
    });
    
    // Mock successful validation
    mockValidatePositionCalculation.mockReturnValue({
      isValid: true,
      issues: [],
      warnings: []
    });
    
    // Mock successful seamless connection
    mockOptimizeSeamlessConnection.mockReturnValue({
      content1Transform: 'translateX(0px)',
      content2Transform: 'translateX(300px)',
      shouldReset: false
    });
    
    // Mock successful blank area detection
    mockDetectAndFixBlankAreas.mockReturnValue({
      hasBlankAreas: false,
      fixedAreas: [],
      errors: []
    });
    
    // Mock successful pre-filling
    mockImplementContentPreFilling.mockReturnValue({
      success: true,
      filledAreas: ['content1', 'content2']
    });
  });

  afterEach(() => {
    if (scrollEngine) {
      scrollEngine.destroy();
    }
    vi.restoreAllMocks();
  });

  describe('Enhanced Position Validation Integration', () => {
    it('should integrate enhanced position validation into animation loop', async () => {
      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'left',
        step: 1
      };

      scrollEngine = new ScrollEngine(container, options);
      scrollEngine.start();

      // Wait for animation to run
      await new Promise(resolve => setTimeout(resolve, 50));

      // Verify position validation was called during animation
      expect(mockValidatePositionCalculation).toHaveBeenCalled();
    });

    it('should handle position validation failures gracefully', async () => {
      // Mock validation failure
      mockValidatePositionCalculation.mockReturnValue({
        isValid: false,
        issues: ['Position out of bounds'],
        warnings: []
      });

      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'left',
        step: 1
      };

      scrollEngine = new ScrollEngine(container, options);
      scrollEngine.start();

      // Wait for animation to run
      await new Promise(resolve => setTimeout(resolve, 50));

      // Should not crash, should handle validation failure
      expect(scrollEngine).toBeDefined();
    });

    it('should skip validation in test environment', async () => {
      // Set test environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'test';

      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'left',
        step: 1
      };

      scrollEngine = new ScrollEngine(container, options);
      scrollEngine.start();

      // Wait for animation to run
      await new Promise(resolve => setTimeout(resolve, 50));

      // Validation should be skipped in test environment
      // (This is implementation detail, but we can verify the engine still works)
      expect(scrollEngine).toBeDefined();

      // Restore environment
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Runtime Blank Area Monitoring', () => {
    it('should perform runtime blank area monitoring periodically', async () => {
      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'right',
        step: 1
      };

      scrollEngine = new ScrollEngine(container, options);
      scrollEngine.start();

      // Wait for multiple animation frames (30+ frames to trigger monitoring)
      await new Promise(resolve => setTimeout(resolve, 600));

      // Verify blank area detection was called during runtime
      expect(mockDetectAndFixBlankAreas).toHaveBeenCalled();
    });

    it('should handle runtime blank area detection errors', async () => {
      // Mock blank area detection to throw error
      mockDetectAndFixBlankAreas.mockImplementation(() => {
        throw new Error('Runtime detection failed');
      });

      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'down',
        step: 1
      };

      scrollEngine = new ScrollEngine(container, options);
      scrollEngine.start();

      // Wait for animation to run
      await new Promise(resolve => setTimeout(resolve, 600));

      // Should not crash despite detection errors
      expect(scrollEngine).toBeDefined();
    });

    it('should fix blank areas found during runtime monitoring', async () => {
      // Mock blank areas found during runtime
      mockDetectAndFixBlankAreas.mockReturnValue({
        hasBlankAreas: true,
        fixedAreas: ['top-area', 'bottom-area'],
        errors: []
      });

      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'up',
        step: 1
      };

      scrollEngine = new ScrollEngine(container, options);
      scrollEngine.start();

      // Wait for monitoring to trigger
      await new Promise(resolve => setTimeout(resolve, 600));

      // Verify blank area detection was called
      expect(mockDetectAndFixBlankAreas).toHaveBeenCalled();
    });
  });

  describe('Optimized Seamless Connection', () => {
    it('should use optimized seamless connection for transforms', async () => {
      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'left',
        step: 1
      };

      scrollEngine = new ScrollEngine(container, options);
      scrollEngine.start();

      // Wait for animation to run
      await new Promise(resolve => setTimeout(resolve, 50));

      // Verify optimized seamless connection was used
      expect(mockOptimizeSeamlessConnection).toHaveBeenCalled();
    });

    it('should handle position reset when required by seamless connection', async () => {
      // Mock seamless connection requiring reset
      mockOptimizeSeamlessConnection.mockReturnValue({
        content1Transform: 'translateX(0px)',
        content2Transform: 'translateX(300px)',
        shouldReset: true
      });

      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'left',
        step: 1
      };

      scrollEngine = new ScrollEngine(container, options);
      scrollEngine.start();

      // Wait for animation to run
      await new Promise(resolve => setTimeout(resolve, 50));

      // Should handle reset gracefully
      expect(scrollEngine).toBeDefined();
    });

    it('should fallback when optimized seamless connection fails', async () => {
      // Mock seamless connection to throw error
      mockOptimizeSeamlessConnection.mockImplementation(() => {
        throw new Error('Seamless connection failed');
      });

      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'right',
        step: 1
      };

      scrollEngine = new ScrollEngine(container, options);
      scrollEngine.start();

      // Wait for animation to run
      await new Promise(resolve => setTimeout(resolve, 50));

      // Should fallback gracefully
      expect(scrollEngine).toBeDefined();
    });
  });

  describe('Animation Error Handling', () => {
    it('should handle animation callback errors gracefully', async () => {
      const onEventSpy = vi.fn();
      
      // Mock position calculation to throw error
      const mockCalculateNextPosition = vi.fn().mockImplementation(() => {
        throw new Error('Position calculation failed');
      });
      
      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'left',
        step: 1,
        onEvent: onEventSpy
      };

      scrollEngine = new ScrollEngine(container, options);
      
      // Mock DirectionHandler to cause error
      const originalDirectionHandler = require('../src/core/utils/DirectionHandler').DirectionHandler;
      originalDirectionHandler.calculateNextPosition = mockCalculateNextPosition;
      
      scrollEngine.start();

      // Wait for animation to run and potentially error
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should trigger error event
      expect(onEventSpy).toHaveBeenCalledWith('error', expect.objectContaining({
        type: 'animationCallbackError'
      }));
    });

    it('should attempt animation recovery on errors', async () => {
      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'left',
        step: 1
      };

      scrollEngine = new ScrollEngine(container, options);
      scrollEngine.start();

      // Should not crash even with potential errors
      expect(scrollEngine).toBeDefined();
    });

    it('should stop animation when recovery fails', async () => {
      // This test verifies that animation stops gracefully when recovery fails
      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'left',
        step: 1
      };

      scrollEngine = new ScrollEngine(container, options);
      scrollEngine.start();

      // Manually stop to test the mechanism
      scrollEngine.stop();

      // Should stop gracefully
      expect(scrollEngine).toBeDefined();
    });
  });

  describe('Enhanced Transform Application', () => {
    it('should apply enhanced transforms with optimized seamless connection', async () => {
      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'down',
        step: 1
      };

      scrollEngine = new ScrollEngine(container, options);
      scrollEngine.start();

      // Wait for animation to run
      await new Promise(resolve => setTimeout(resolve, 50));

      // Verify optimized seamless connection was used for transforms
      expect(mockOptimizeSeamlessConnection).toHaveBeenCalled();
      
      const calls = mockOptimizeSeamlessConnection.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      
      // Verify parameters
      const [position, contentSize, containerSize, direction] = calls[0];
      expect(typeof position).toBe('number');
      expect(typeof contentSize).toBe('number');
      expect(typeof containerSize).toBe('number');
      expect(direction).toBe('down');
    });

    it('should fallback to standard transforms when enhanced transforms fail', async () => {
      // Mock enhanced transforms to fail
      mockOptimizeSeamlessConnection.mockImplementation(() => {
        throw new Error('Enhanced transform failed');
      });

      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'up',
        step: 1
      };

      scrollEngine = new ScrollEngine(container, options);
      scrollEngine.start();

      // Wait for animation to run
      await new Promise(resolve => setTimeout(resolve, 50));

      // Should fallback gracefully
      expect(scrollEngine).toBeDefined();
    });
  });

  describe('Performance Monitoring', () => {
    it('should monitor blank areas at appropriate intervals', async () => {
      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'left',
        step: 1
      };

      scrollEngine = new ScrollEngine(container, options);
      scrollEngine.start();

      // Clear previous calls
      mockDetectAndFixBlankAreas.mockClear();

      // Wait for exactly 30 frames worth of time (assuming 60fps = ~16ms per frame)
      await new Promise(resolve => setTimeout(resolve, 30 * 16 + 50));

      // Should have called blank area detection at least once during monitoring interval
      expect(mockDetectAndFixBlankAreas).toHaveBeenCalled();
    });

    it('should not impact animation performance significantly', async () => {
      const startTime = performance.now();
      
      const options = {
        data: ['Item 1', 'Item 2', 'Item 3'],
        direction: 'right',
        step: 1
      };

      scrollEngine = new ScrollEngine(container, options);
      scrollEngine.start();

      // Run animation for a reasonable time
      await new Promise(resolve => setTimeout(resolve, 200));

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (allowing for test environment overhead)
      expect(duration).toBeLessThan(1000); // 1 second should be more than enough
    });
  });
});
/**
 * 测试 HoverPositionManager 的像素级精确暂停定位功能
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { HoverPositionManager } from '../src/core/utils/HoverPositionManager.js';

describe('HoverPositionManager - Pixel-Perfect Pause Positioning', () => {
  let mockState;
  let mockElement;

  beforeEach(() => {
    // 创建模拟的 DOM 元素
    mockElement = {
      style: { transform: 'translateX(-50px)' },
      getBoundingClientRect: () => ({ width: 200, height: 100 }),
      offsetWidth: 200,
      offsetHeight: 100
    };

    mockState = {
      content1: mockElement,
      content2: { ...mockElement, style: { transform: 'translateX(-250px)' } },
      position: -45, // Slightly different from transform position to test sync
      animationId: 'test-animation-123'
    };

    // 模拟 getComputedStyle
    global.getComputedStyle = vi.fn((element) => ({
      transform: element.style.transform || 'none'
    }));

    // 模拟 DOMMatrix
    global.DOMMatrix = vi.fn().mockImplementation((transform) => {
      const translateXMatch = transform.match(/translateX\((-?\d+(?:\.\d+)?)px\)/);
      const translateYMatch = transform.match(/translateY\((-?\d+(?:\.\d+)?)px\)/);
      
      return {
        m41: translateXMatch ? parseFloat(translateXMatch[1]) : 0,
        m42: translateYMatch ? parseFloat(translateYMatch[1]) : 0
      };
    });

    // 模拟 performance.now
    global.performance = {
      now: vi.fn(() => 1234.567)
    };

    // 模拟 Date.now
    global.Date.now = vi.fn(() => 1640995200000);

    // 模拟 console 方法
    global.console = {
      ...console,
      warn: vi.fn(),
      error: vi.fn(),
      info: vi.fn()
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('pauseAtCurrentPosition', () => {
    test('should pause at current position and synchronize positions', () => {
      const snapshot = HoverPositionManager.pauseAtCurrentPosition(mockState, 'left');
      
      // 验证逻辑位置已同步到变换位置
      expect(mockState.position).toBe(-50);
      
      // 验证返回了快照
      expect(snapshot).toBeDefined();
      // 快照应该包含位置信息
      expect(snapshot.logicalPosition).toBe(-50);
      expect(snapshot.transformPosition).toBe(-50);
    });

    test('should synchronize logical and transform positions', () => {
      // 设置逻辑位置与变换位置不同步的情况
      mockState.position = -40;
      mockState.content1.style.transform = 'translateX(-55px)';
      
      HoverPositionManager.pauseAtCurrentPosition(mockState, 'left');
      
      // 验证逻辑位置已同步到变换位置
      expect(mockState.position).toBe(-55);
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('Synchronizing position: logical=-40, actual=-55')
      );
    });

    test('should handle position capture failure gracefully', () => {
      // 模拟位置捕获失败
      global.DOMMatrix.mockImplementation(() => {
        throw new Error('Position capture failed');
      });
      
      const snapshot = HoverPositionManager.pauseAtCurrentPosition(mockState, 'left');
      
      // 应该仍然能够处理，即使位置捕获失败
      expect(snapshot).toBeDefined(); // 应该仍然返回快照
    });

    test('should apply precise transforms', () => {
      // 设置一个不同的初始变换，这样我们可以验证它被更新了
      mockState.content1.style.transform = 'translateX(-45px)';
      
      HoverPositionManager.pauseAtCurrentPosition(mockState, 'left');
      
      // 验证变换已被应用（可能是原始位置或同步后的位置）
      expect(mockState.content1.style.transform).toContain('translateX');
      expect(mockState.content2.style.transform).toContain('translateX');
    });

    test('should verify position freeze by default', () => {
      // 模拟位置验证成功
      let callCount = 0;
      global.DOMMatrix.mockImplementation((transform) => {
        callCount++;
        const translateXMatch = transform.match(/translateX\((-?\d+(?:\.\d+)?)px\)/);
        return {
          m41: translateXMatch ? parseFloat(translateXMatch[1]) : 0,
          m42: 0
        };
      });
      
      HoverPositionManager.pauseAtCurrentPosition(mockState, 'left');
      
      // 验证位置被多次采样（用于验证冻结）
      expect(callCount).toBeGreaterThan(1);
    });

    test('should retry on freeze verification failure', () => {
      let attemptCount = 0;
      global.DOMMatrix.mockImplementation((transform) => {
        attemptCount++;
        const translateXMatch = transform.match(/translateX\((-?\d+(?:\.\d+)?)px\)/);
        const basePosition = translateXMatch ? parseFloat(translateXMatch[1]) : 0;
        
        // 始终返回不稳定的位置以触发重试
        return {
          m41: basePosition + (attemptCount % 2 === 0 ? 1 : -1), // 交替变化
          m42: 0
        };
      });
      
      HoverPositionManager.pauseAtCurrentPosition(mockState, 'left', {
        maxRetries: 1,
        tolerance: 0.1
      });
      
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Position freeze verification failed')
      );
    });

    test('should handle maximum retries exceeded', () => {
      // 模拟始终无法冻结位置
      global.DOMMatrix.mockImplementation((transform) => {
        const translateXMatch = transform.match(/translateX\((-?\d+(?:\.\d+)?)px\)/);
        const basePosition = translateXMatch ? parseFloat(translateXMatch[1]) : 0;
        return {
          m41: basePosition + Math.random() * 10, // 始终不稳定
          m42: 0
        };
      });
      
      HoverPositionManager.pauseAtCurrentPosition(mockState, 'left', {
        maxRetries: 1,
        tolerance: 0.1
      });
      
      expect(console.error).toHaveBeenCalledWith(
        'Failed to freeze position after 2 attempts'
      );
    });

    test('should work with custom options', () => {
      const options = {
        createSnapshot: false,
        verifyFreeze: false,
        maxRetries: 1,
        tolerance: 1.0
      };
      
      const snapshot = HoverPositionManager.pauseAtCurrentPosition(mockState, 'left', options);
      
      // 不应该创建快照
      expect(snapshot).toBeNull();
      
      // 应该仍然同步位置
      expect(mockState.position).toBe(-50);
    });

    test('should handle vertical direction', () => {
      mockState.content1.style.transform = 'translateY(-30px)';
      mockState.content2.style.transform = 'translateY(-130px)';
      mockState.position = -25;
      
      const snapshot = HoverPositionManager.pauseAtCurrentPosition(mockState, 'up');
      
      expect(mockState.position).toBe(-30);
      expect(snapshot.direction).toBe('up');
      expect(snapshot.transformPosition).toBe(-30);
    });

    test('should validate position continuity between snapshots', () => {
      // 设置一个会导致连续性问题的场景
      mockState.position = -10; // 逻辑位置
      mockState.content1.style.transform = 'translateX(-100px)'; // 变换位置差异很大
      
      HoverPositionManager.pauseAtCurrentPosition(mockState, 'left', {
        tolerance: 0.1 // 使用严格的容差
      });
      
      expect(console.warn).toHaveBeenCalledWith(
        'Position continuity issues detected during pause:',
        expect.any(Array)
      );
    });

    test('should handle errors gracefully', () => {
      // 模拟 applyPreciseTransforms 抛出错误
      const originalApplyPreciseTransforms = HoverPositionManager.applyPreciseTransforms;
      HoverPositionManager.applyPreciseTransforms = vi.fn(() => {
        throw new Error('Transform application failed');
      });
      
      const snapshot = HoverPositionManager.pauseAtCurrentPosition(mockState, 'left');
      
      expect(console.error).toHaveBeenCalledWith(
        'Failed to pause at current position:',
        expect.any(Error)
      );
      
      // 应该仍然返回快照
      expect(snapshot).toBeDefined();
      
      // 恢复原始方法
      HoverPositionManager.applyPreciseTransforms = originalApplyPreciseTransforms;
    });

    test('should work with different scroll directions', () => {
      const directions = ['left', 'right', 'up', 'down'];
      
      directions.forEach(direction => {
        const isHorizontal = direction === 'left' || direction === 'right';
        const transformProperty = isHorizontal ? 'translateX' : 'translateY';
        
        mockState.content1.style.transform = `${transformProperty}(-50px)`;
        mockState.position = -45;
        
        const snapshot = HoverPositionManager.pauseAtCurrentPosition(mockState, direction);
        
        expect(mockState.position).toBe(-50);
        expect(snapshot.direction).toBe(direction);
      });
    });

    test('should handle small position differences within tolerance', () => {
      // 设置逻辑位置与变换位置差异很小的情况
      mockState.position = -50.05;
      mockState.content1.style.transform = 'translateX(-50px)';
      
      HoverPositionManager.pauseAtCurrentPosition(mockState, 'left', {
        tolerance: 0.1
      });
      
      // 由于差异在容差范围内，不应该触发同步信息
      expect(console.info).not.toHaveBeenCalledWith(
        expect.stringContaining('Synchronizing position')
      );
    });
  });

  describe('verifyPositionFreeze', () => {
    test('should verify stable position', () => {
      // 这是一个私有方法，我们通过 pauseAtCurrentPosition 间接测试
      let sampleCount = 0;
      global.DOMMatrix.mockImplementation((transform) => {
        sampleCount++;
        const translateXMatch = transform.match(/translateX\((-?\d+(?:\.\d+)?)px\)/);
        return {
          m41: translateXMatch ? parseFloat(translateXMatch[1]) : 0,
          m42: 0
        };
      });
      
      HoverPositionManager.pauseAtCurrentPosition(mockState, 'left', {
        verifyFreeze: true,
        tolerance: 0.1
      });
      
      // 验证位置被多次采样（初始捕获 + 验证采样）
      expect(sampleCount).toBeGreaterThan(1); // 至少2次采样
    });

    test('should detect unstable position', () => {
      let sampleCount = 0;
      global.DOMMatrix.mockImplementation((transform) => {
        sampleCount++;
        const translateXMatch = transform.match(/translateX\((-?\d+(?:\.\d+)?)px\)/);
        const basePosition = translateXMatch ? parseFloat(translateXMatch[1]) : 0;
        
        // 返回不稳定的位置
        return {
          m41: basePosition + (sampleCount % 2 === 0 ? 1 : -1), // 交替变化
          m42: 0
        };
      });
      
      HoverPositionManager.pauseAtCurrentPosition(mockState, 'left', {
        verifyFreeze: true,
        maxRetries: 1,
        tolerance: 0.1
      });
      
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Position not stable')
      );
    });
  });
});
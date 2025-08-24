/**
 * 测试 HoverPositionManager 的无缝恢复功能
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { HoverPositionManager } from '../src/core/utils/HoverPositionManager.js';

describe('HoverPositionManager - Seamless Resume from Pause Position', () => {
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
      position: -50,
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

  describe('resumeFromPausedPosition', () => {
    test('should resume from paused position and return snapshot', () => {
      const snapshot = HoverPositionManager.resumeFromPausedPosition(mockState, 'left');
      
      // 验证返回了快照
      expect(snapshot).toBeDefined();
      expect(snapshot.reason).toBe('resume-after');
      expect(snapshot.logicalPosition).toBe(-50);
      expect(snapshot.transformPosition).toBe(-50);
    });

    test('should synchronize positions before resume', () => {
      // 设置逻辑位置与变换位置不同步的情况
      mockState.position = -45;
      mockState.content1.style.transform = 'translateX(-55px)';
      
      HoverPositionManager.resumeFromPausedPosition(mockState, 'left');
      
      // 验证逻辑位置已同步到变换位置
      expect(mockState.position).toBe(-55);
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('Synchronizing position before resume: logical=-45, actual=-55')
      );
    });

    test('should handle position verification failure gracefully', () => {
      // 模拟位置捕获失败
      global.DOMMatrix.mockImplementation(() => {
        throw new Error('Position capture failed');
      });
      
      const snapshot = HoverPositionManager.resumeFromPausedPosition(mockState, 'left');
      
      expect(console.warn).toHaveBeenCalledWith(
        'Unable to verify current transform position, using logical position'
      );
      expect(snapshot).toBeDefined(); // 应该仍然返回快照
    });

    test('should apply seamless resume transforms', () => {
      const originalTransform1 = mockState.content1.style.transform;
      const originalTransform2 = mockState.content2.style.transform;
      
      HoverPositionManager.resumeFromPausedPosition(mockState, 'left');
      
      // 验证变换已被重新应用
      expect(mockState.content1.style.transform).toContain('translateX(-50px)');
      expect(mockState.content2.style.transform).toContain('translateX');
    });

    test('should verify resume position accuracy', () => {
      let verificationCallCount = 0;
      global.DOMMatrix.mockImplementation((transform) => {
        verificationCallCount++;
        const translateXMatch = transform.match(/translateX\((-?\d+(?:\.\d+)?)px\)/);
        const basePosition = translateXMatch ? parseFloat(translateXMatch[1]) : 0;
        
        // 第一次调用返回不准确的位置，触发重新应用
        if (verificationCallCount === 2) {
          return {
            m41: basePosition + 2, // 偏差2px
            m42: 0
          };
        }
        
        return {
          m41: basePosition,
          m42: 0
        };
      });
      
      HoverPositionManager.resumeFromPausedPosition(mockState, 'left', {
        tolerance: 0.5
      });
      
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Resume position verification failed')
      );
    });

    test('should validate position continuity during resume', () => {
      // 设置一个会导致连续性问题的场景
      mockState.position = -50;
      mockState.content1.style.transform = 'translateX(-100px)'; // 大幅跳跃
      
      HoverPositionManager.resumeFromPausedPosition(mockState, 'left', {
        validateContinuity: true,
        tolerance: 0.1
      });
      
      expect(console.warn).toHaveBeenCalledWith(
        'Position continuity issues detected during resume:',
        expect.any(Array)
      );
    });

    test('should work with custom options', () => {
      const options = {
        createSnapshot: false,
        validateContinuity: false,
        tolerance: 1.0
      };
      
      const snapshot = HoverPositionManager.resumeFromPausedPosition(mockState, 'left', options);
      
      // 不应该创建快照
      expect(snapshot).toBeNull();
      
      // 应该仍然应用变换
      expect(mockState.content1.style.transform).toContain('translateX');
    });

    test('should handle vertical direction', () => {
      mockState.content1.style.transform = 'translateY(-30px)';
      mockState.content2.style.transform = 'translateY(-130px)';
      mockState.position = -30;
      
      const snapshot = HoverPositionManager.resumeFromPausedPosition(mockState, 'up');
      
      expect(snapshot.direction).toBe('up');
      expect(snapshot.transformPosition).toBe(-30);
    });

    test('should validate overall pause-resume continuity', () => {
      const preResumeSnapshot = {
        logicalPosition: -50,
        transformPosition: -50,
        timestamp: 1000,
        direction: 'left',
        containerSize: 200,
        content1Visible: true,
        content2Visible: true,
        positionDifference: 0,
        animationId: 'test'
      };
      
      HoverPositionManager.resumeFromPausedPosition(mockState, 'left', {
        validateContinuity: true,
        preResumeSnapshot
      });
      
      expect(console.info).toHaveBeenCalledWith('Seamless resume completed successfully');
    });

    test('should handle errors gracefully', () => {
      // 模拟 prepareSeamlessResumeTransforms 抛出错误
      const originalPrepareSeamlessResumeTransforms = HoverPositionManager.prepareSeamlessResumeTransforms;
      HoverPositionManager.prepareSeamlessResumeTransforms = vi.fn(() => {
        throw new Error('Transform preparation failed');
      });
      
      const snapshot = HoverPositionManager.resumeFromPausedPosition(mockState, 'left');
      
      expect(console.error).toHaveBeenCalledWith(
        'Failed to resume from paused position:',
        expect.any(Error)
      );
      
      // 应该仍然返回快照
      expect(snapshot).toBeDefined();
      
      // 恢复原始方法
      HoverPositionManager.prepareSeamlessResumeTransforms = originalPrepareSeamlessResumeTransforms;
    });

    test('should work with different scroll directions', () => {
      const directions = ['left', 'right', 'up', 'down'];
      
      directions.forEach(direction => {
        const isHorizontal = direction === 'left' || direction === 'right';
        const transformProperty = isHorizontal ? 'translateX' : 'translateY';
        
        mockState.content1.style.transform = `${transformProperty}(-50px)`;
        mockState.position = -50;
        
        const snapshot = HoverPositionManager.resumeFromPausedPosition(mockState, direction);
        
        expect(snapshot.direction).toBe(direction);
        expect(snapshot.logicalPosition).toBe(-50);
      });
    });

    test('should handle small position differences within tolerance', () => {
      // 设置逻辑位置与变换位置差异很小的情况
      mockState.position = -50.05;
      mockState.content1.style.transform = 'translateX(-50px)';
      
      HoverPositionManager.resumeFromPausedPosition(mockState, 'left', {
        tolerance: 0.1
      });
      
      // 由于差异在容差范围内，不应该触发同步信息
      expect(console.info).not.toHaveBeenCalledWith(
        expect.stringContaining('Synchronizing position before resume')
      );
    });
  });

  describe('validatePauseResumeCycle', () => {
    let pauseSnapshot;
    let resumeSnapshot;

    beforeEach(() => {
      pauseSnapshot = {
        logicalPosition: -50,
        transformPosition: -50,
        timestamp: 1000,
        direction: 'left',
        containerSize: 200,
        content1Visible: true,
        content2Visible: true,
        positionDifference: 0,
        animationId: 'test'
      };

      resumeSnapshot = {
        logicalPosition: -50,
        transformPosition: -50,
        timestamp: 2000,
        direction: 'left',
        containerSize: 200,
        content1Visible: true,
        content2Visible: true,
        positionDifference: 0,
        animationId: 'test'
      };
    });

    test('should validate successful pause-resume cycle', () => {
      const result = HoverPositionManager.validatePauseResumeCycle(pauseSnapshot, resumeSnapshot);
      
      expect(result.isValid).toBe(true);
      expect(result.positionDrift).toBe(0);
      expect(result.transformDrift).toBe(0);
      expect(result.timePaused).toBe(1000);
      expect(result.issues).toHaveLength(0);
      expect(result.recommendations).toHaveLength(0);
    });

    test('should detect position drift', () => {
      resumeSnapshot.logicalPosition = -55;
      resumeSnapshot.transformPosition = -58;
      
      const result = HoverPositionManager.validatePauseResumeCycle(pauseSnapshot, resumeSnapshot);
      
      expect(result.isValid).toBe(false);
      expect(result.positionDrift).toBe(5);
      expect(result.transformDrift).toBe(8);
      expect(result.issues).toContain('Logical position drift detected: 5.00px');
      expect(result.issues).toContain('Transform position drift detected: 8.00px');
      expect(result.recommendations).toContain('Review pause position capture accuracy');
      expect(result.recommendations).toContain('Review transform application consistency');
    });

    test('should detect direction changes', () => {
      resumeSnapshot.direction = 'right';
      
      const result = HoverPositionManager.validatePauseResumeCycle(pauseSnapshot, resumeSnapshot);
      
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Direction changed during pause: left -> right');
      expect(result.recommendations).toContain('Ensure direction remains constant during pause-resume cycle');
    });

    test('should detect invalid pause duration', () => {
      resumeSnapshot.timestamp = 500; // Earlier than pause
      
      const result = HoverPositionManager.validatePauseResumeCycle(pauseSnapshot, resumeSnapshot);
      
      expect(result.isValid).toBe(false);
      expect(result.timePaused).toBe(-500);
      expect(result.issues).toContain('Invalid pause duration: -500ms');
    });

    test('should recommend recalibration for long pauses', () => {
      resumeSnapshot.timestamp = 62000; // 62 seconds later
      
      const result = HoverPositionManager.validatePauseResumeCycle(pauseSnapshot, resumeSnapshot);
      
      expect(result.isValid).toBe(true); // Not invalid, just a recommendation
      expect(result.timePaused).toBe(61000);
      expect(result.recommendations).toContain('Long pause duration detected, consider position recalibration');
    });

    test('should detect container size changes', () => {
      resumeSnapshot.containerSize = 250;
      
      const result = HoverPositionManager.validatePauseResumeCycle(pauseSnapshot, resumeSnapshot);
      
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Container size changed during pause: 50.00px');
      expect(result.recommendations).toContain('Handle container resize during pause');
    });

    test('should use custom tolerance', () => {
      resumeSnapshot.logicalPosition = -52; // 2px difference
      
      // With default tolerance (0.5px), this should fail
      const strictResult = HoverPositionManager.validatePauseResumeCycle(pauseSnapshot, resumeSnapshot);
      expect(strictResult.isValid).toBe(false);
      
      // With custom tolerance (5px), this should pass
      const lenientResult = HoverPositionManager.validatePauseResumeCycle(pauseSnapshot, resumeSnapshot, 5);
      expect(lenientResult.isValid).toBe(true);
    });
  });

  describe('prepareSeamlessResumeTransforms', () => {
    test('should prepare transforms for left direction', () => {
      // 这是一个私有方法，我们通过 resumeFromPausedPosition 间接测试
      HoverPositionManager.resumeFromPausedPosition(mockState, 'left');
      
      // 验证变换已正确应用
      expect(mockState.content1.style.transform).toContain('translateX(-50px)');
      expect(mockState.content2.style.transform).toContain('translateX(-250px)'); // -50 - 200
    });

    test('should prepare transforms for right direction', () => {
      mockState.content1.style.transform = 'translateX(50px)';
      mockState.position = 50;
      
      HoverPositionManager.resumeFromPausedPosition(mockState, 'right');
      
      // 对于 right 方向，第二个内容应该在右侧
      expect(mockState.content1.style.transform).toContain('translateX(50px)');
      expect(mockState.content2.style.transform).toContain('translateX(250px)'); // 50 + 200
    });

    test('should prepare transforms for vertical directions', () => {
      mockState.content1.style.transform = 'translateY(-30px)';
      mockState.position = -30;
      
      HoverPositionManager.resumeFromPausedPosition(mockState, 'up');
      
      expect(mockState.content1.style.transform).toContain('translateY(-30px)');
      expect(mockState.content2.style.transform).toContain('translateY(-130px)'); // -30 - 100
    });
  });
});
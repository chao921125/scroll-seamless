/**
 * 测试 HoverPositionManager 的位置快照系统
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { HoverPositionManager } from '../src/core/utils/HoverPositionManager.js';

describe('HoverPositionManager - Position Snapshot System', () => {
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
    global.Date.now = vi.fn(() => 1640995200000); // 2022-01-01 00:00:00
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createPositionSnapshot', () => {
    test('should create basic position snapshot', () => {
      const snapshot = HoverPositionManager.createPositionSnapshot(mockState, 'left');
      
      expect(snapshot).toMatchObject({
        logicalPosition: -50,
        transformPosition: -50,
        content1Transform: 'translateX(-50px)',
        content2Transform: 'translateX(-250px)',
        direction: 'left',
        animationId: 'test-animation-123',
        reason: 'manual'
      });
      
      expect(snapshot.timestamp).toBe(1640995200000);
      expect(snapshot.performanceTimestamp).toBe(1234.567);
      expect(snapshot.positionDifference).toBe(0); // logical and transform positions match
      expect(snapshot.content1Visible).toBe(true);
      expect(snapshot.content2Visible).toBe(true);
      expect(snapshot.containerSize).toBe(200); // horizontal direction uses offsetWidth
    });

    test('should create snapshot with metadata', () => {
      const metadata = {
        reason: 'pause',
        animationFrame: 12345,
        performanceTimestamp: 5678.901
      };
      
      const snapshot = HoverPositionManager.createPositionSnapshot(mockState, 'left', metadata);
      
      expect(snapshot.reason).toBe('pause');
      expect(snapshot.animationFrame).toBe(12345);
      expect(snapshot.performanceTimestamp).toBe(5678.901);
    });

    test('should handle vertical direction', () => {
      mockState.content1.style.transform = 'translateY(-30px)';
      mockState.content2.style.transform = 'translateY(-130px)';
      
      const snapshot = HoverPositionManager.createPositionSnapshot(mockState, 'up');
      
      expect(snapshot.direction).toBe('up');
      expect(snapshot.transformPosition).toBe(-30);
      expect(snapshot.containerSize).toBe(100); // vertical direction uses offsetHeight
    });

    test('should handle missing transforms', () => {
      mockState.content1.style.transform = '';
      mockState.content2.style.transform = '';
      
      const snapshot = HoverPositionManager.createPositionSnapshot(mockState, 'left');
      
      expect(snapshot.content1Transform).toBe('none');
      expect(snapshot.content2Transform).toBe('none');
      expect(snapshot.transformPosition).toBe(0); // no transform returns 0
    });

    test('should calculate position difference correctly', () => {
      mockState.position = -40; // logical position
      mockState.content1.style.transform = 'translateX(-50px)'; // transform position
      
      const snapshot = HoverPositionManager.createPositionSnapshot(mockState, 'left');
      
      expect(snapshot.positionDifference).toBe(10); // |(-40) - (-50)| = 10
    });

    test('should handle invisible elements', () => {
      // Mock getBoundingClientRect to return zero dimensions
      mockState.content1.getBoundingClientRect = () => ({ width: 0, height: 0 });
      mockState.content2.getBoundingClientRect = () => ({ width: 200, height: 100 });
      
      const snapshot = HoverPositionManager.createPositionSnapshot(mockState, 'left');
      
      expect(snapshot.content1Visible).toBe(false);
      expect(snapshot.content2Visible).toBe(true);
    });

    test('should handle getBoundingClientRect errors', () => {
      mockState.content1.getBoundingClientRect = () => {
        throw new Error('getBoundingClientRect failed');
      };
      
      const snapshot = HoverPositionManager.createPositionSnapshot(mockState, 'left');
      
      expect(snapshot.content1Visible).toBe(false);
    });

    test('should handle container size calculation errors', () => {
      // Remove offsetWidth/offsetHeight to trigger error
      delete mockState.content1.offsetWidth;
      delete mockState.content1.offsetHeight;
      
      const snapshot = HoverPositionManager.createPositionSnapshot(mockState, 'left');
      
      expect(snapshot.containerSize).toBe(0);
    });
  });

  describe('validatePositionContinuity', () => {
    let beforeSnapshot;
    let afterSnapshot;

    beforeEach(() => {
      beforeSnapshot = {
        logicalPosition: -50,
        transformPosition: -50,
        content1Transform: 'translateX(-50px)',
        content2Transform: 'translateX(-250px)',
        timestamp: 1000,
        direction: 'left',
        animationId: 'test-animation',
        reason: 'pause',
        performanceTimestamp: 1000.0,
        animationFrame: null,
        positionDifference: 0,
        content1Visible: true,
        content2Visible: true,
        containerSize: 200
      };

      afterSnapshot = {
        logicalPosition: -50,
        transformPosition: -50,
        content1Transform: 'translateX(-50px)',
        content2Transform: 'translateX(-250px)',
        timestamp: 1100,
        direction: 'left',
        animationId: 'test-animation',
        reason: 'resume',
        performanceTimestamp: 1100.0,
        animationFrame: null,
        positionDifference: 0,
        content1Visible: true,
        content2Visible: true,
        containerSize: 200
      };
    });

    test('should validate continuous positions', () => {
      const result = HoverPositionManager.validatePositionContinuity(beforeSnapshot, afterSnapshot);
      
      expect(result.isValid).toBe(true);
      expect(result.positionDifference).toBe(0);
      expect(result.transformDifference).toBe(0);
      expect(result.issues).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
      expect(result.timeDifference).toBe(100);
      expect(result.performanceTimeDifference).toBe(100);
    });

    test('should detect logical position jumps', () => {
      afterSnapshot.logicalPosition = -100; // Large jump
      
      const result = HoverPositionManager.validatePositionContinuity(beforeSnapshot, afterSnapshot);
      
      expect(result.isValid).toBe(false);
      expect(result.positionDifference).toBe(50);
      expect(result.issues).toContain('Logical position jump detected: 50.00px');
    });

    test('should detect transform position jumps', () => {
      afterSnapshot.transformPosition = -120; // Large jump
      
      const result = HoverPositionManager.validatePositionContinuity(beforeSnapshot, afterSnapshot);
      
      expect(result.isValid).toBe(false);
      expect(result.transformDifference).toBe(70);
      expect(result.issues).toContain('Transform position jump detected: 70.00px');
    });

    test('should detect direction changes', () => {
      afterSnapshot.direction = 'right';
      
      const result = HoverPositionManager.validatePositionContinuity(beforeSnapshot, afterSnapshot);
      
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Direction changed during pause: left -> right');
    });

    test('should detect invalid timestamp sequence', () => {
      afterSnapshot.timestamp = 500; // Earlier than before
      
      const result = HoverPositionManager.validatePositionContinuity(beforeSnapshot, afterSnapshot);
      
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Invalid timestamp sequence: -500ms');
    });

    test('should detect animation ID changes as warnings', () => {
      afterSnapshot.animationId = 'different-animation';
      
      const result = HoverPositionManager.validatePositionContinuity(beforeSnapshot, afterSnapshot);
      
      expect(result.isValid).toBe(true); // warnings don't make it invalid
      expect(result.warnings).toContain('Animation ID changed: test-animation -> different-animation');
    });

    test('should detect visibility changes as warnings', () => {
      afterSnapshot.content1Visible = false;
      afterSnapshot.content2Visible = false;
      
      const result = HoverPositionManager.validatePositionContinuity(beforeSnapshot, afterSnapshot);
      
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Content1 visibility changed: true -> false');
      expect(result.warnings).toContain('Content2 visibility changed: true -> false');
    });

    test('should detect container size changes as warnings', () => {
      afterSnapshot.containerSize = 250; // Size changed by 50px
      
      const result = HoverPositionManager.validatePositionContinuity(beforeSnapshot, afterSnapshot);
      
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Container size changed: 50.00px');
      expect(result.containerSizeDifference).toBe(50);
    });

    test('should detect position synchronization changes', () => {
      beforeSnapshot.positionDifference = 0;
      afterSnapshot.positionDifference = 10; // Sync got worse
      
      const result = HoverPositionManager.validatePositionContinuity(beforeSnapshot, afterSnapshot);
      
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Position synchronization changed: 10.00px');
      expect(result.positionSyncDifference).toBe(10);
    });

    test('should detect invalid performance timestamp sequence', () => {
      afterSnapshot.performanceTimestamp = 500.0; // Earlier than before
      
      const result = HoverPositionManager.validatePositionContinuity(beforeSnapshot, afterSnapshot);
      
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Invalid performance timestamp sequence: -500.00ms');
    });

    test('should use custom tolerance', () => {
      afterSnapshot.logicalPosition = -52; // 2px difference
      
      // With default tolerance (0.5px), this should fail
      const strictResult = HoverPositionManager.validatePositionContinuity(beforeSnapshot, afterSnapshot);
      expect(strictResult.isValid).toBe(false);
      
      // With custom tolerance (5px), this should pass
      const lenientResult = HoverPositionManager.validatePositionContinuity(beforeSnapshot, afterSnapshot, 5);
      expect(lenientResult.isValid).toBe(true);
    });
  });

  describe('validateSnapshotSequence', () => {
    test('should validate sequence with single snapshot', () => {
      const snapshots = [
        {
          logicalPosition: -50,
          transformPosition: -50,
          timestamp: 1000,
          direction: 'left',
          performanceTimestamp: 1000.0
        }
      ];
      
      const result = HoverPositionManager.validateSnapshotSequence(snapshots);
      
      expect(result.isValid).toBe(true);
      expect(result.totalSnapshots).toBe(1);
      expect(result.validTransitions).toBe(0);
      expect(result.invalidTransitions).toHaveLength(0);
    });

    test('should validate continuous sequence', () => {
      const snapshots = [
        {
          logicalPosition: -50,
          transformPosition: -50,
          timestamp: 1000,
          direction: 'left',
          performanceTimestamp: 1000.0,
          positionDifference: 0,
          content1Visible: true,
          content2Visible: true,
          containerSize: 200,
          animationId: 'test'
        },
        {
          logicalPosition: -50.2,
          transformPosition: -50.2,
          timestamp: 1100,
          direction: 'left',
          performanceTimestamp: 1100.0,
          positionDifference: 0,
          content1Visible: true,
          content2Visible: true,
          containerSize: 200,
          animationId: 'test'
        },
        {
          logicalPosition: -50.4,
          transformPosition: -50.4,
          timestamp: 1200,
          direction: 'left',
          performanceTimestamp: 1200.0,
          positionDifference: 0,
          content1Visible: true,
          content2Visible: true,
          containerSize: 200,
          animationId: 'test'
        }
      ];
      
      const result = HoverPositionManager.validateSnapshotSequence(snapshots);
      
      expect(result.isValid).toBe(true);
      expect(result.totalSnapshots).toBe(3);
      expect(result.validTransitions).toBe(2);
      expect(result.invalidTransitions).toHaveLength(0);
      expect(result.summary.maxPositionJump).toBeCloseTo(0.2);
      expect(result.summary.maxTransformJump).toBeCloseTo(0.2);
      expect(result.summary.averageTimeBetweenSnapshots).toBe(100);
    });

    test('should detect invalid transitions in sequence', () => {
      const snapshots = [
        {
          logicalPosition: -50,
          transformPosition: -50,
          timestamp: 1000,
          direction: 'left',
          performanceTimestamp: 1000.0,
          positionDifference: 0,
          content1Visible: true,
          content2Visible: true,
          containerSize: 200,
          animationId: 'test'
        },
        {
          logicalPosition: -100, // Large jump
          transformPosition: -100,
          timestamp: 1100,
          direction: 'left',
          performanceTimestamp: 1100.0,
          positionDifference: 0,
          content1Visible: true,
          content2Visible: true,
          containerSize: 200,
          animationId: 'test'
        },
        {
          logicalPosition: -100.2,
          transformPosition: -100.2,
          timestamp: 1200,
          direction: 'left',
          performanceTimestamp: 1200.0,
          positionDifference: 0,
          content1Visible: true,
          content2Visible: true,
          containerSize: 200,
          animationId: 'test'
        }
      ];
      
      const result = HoverPositionManager.validateSnapshotSequence(snapshots);
      
      expect(result.isValid).toBe(false);
      expect(result.totalSnapshots).toBe(3);
      expect(result.validTransitions).toBe(1);
      expect(result.invalidTransitions).toHaveLength(1);
      expect(result.invalidTransitions[0].index).toBe(1);
      expect(result.summary.maxPositionJump).toBe(50);
    });
  });

  describe('createSnapshotComparisonReport', () => {
    test('should create comparison report for valid transition', () => {
      const beforeSnapshot = {
        logicalPosition: -50,
        transformPosition: -50,
        timestamp: 1000,
        direction: 'left',
        content1Visible: true,
        content2Visible: true,
        containerSize: 200,
        performanceTimestamp: 1000.0,
        positionDifference: 0,
        animationId: 'test'
      };

      const afterSnapshot = {
        logicalPosition: -50.2,
        transformPosition: -50.2,
        timestamp: 1100,
        direction: 'left',
        content1Visible: true,
        content2Visible: true,
        containerSize: 200,
        performanceTimestamp: 1100.0,
        positionDifference: 0,
        animationId: 'test'
      };
      
      const report = HoverPositionManager.createSnapshotComparisonReport(beforeSnapshot, afterSnapshot);
      
      expect(report.summary).toContain('Position continuity VALID');
      expect(report.details.positionChange).toBeCloseTo(-0.2);
      expect(report.details.transformChange).toBeCloseTo(-0.2);
      expect(report.details.timeElapsed).toBe(100);
      expect(report.details.directionChanged).toBe(false);
      expect(report.details.visibilityChanged).toBe(false);
      expect(report.details.sizeChanged).toBe(false);
      expect(report.recommendations).toHaveLength(0);
    });

    test('should create comparison report for invalid transition', () => {
      const beforeSnapshot = {
        logicalPosition: -50,
        transformPosition: -50,
        timestamp: 1000,
        direction: 'left',
        content1Visible: true,
        content2Visible: true,
        containerSize: 200,
        performanceTimestamp: 1000.0,
        positionDifference: 0,
        animationId: 'test'
      };

      const afterSnapshot = {
        logicalPosition: -150, // Large jump
        transformPosition: -160, // Different large jump
        timestamp: 1100,
        direction: 'right', // Direction changed
        content1Visible: false, // Visibility changed
        content2Visible: true,
        containerSize: 250, // Size changed
        performanceTimestamp: 1100.0,
        positionDifference: 5, // Sync got worse
        animationId: 'different' // Animation changed
      };
      
      const report = HoverPositionManager.createSnapshotComparisonReport(beforeSnapshot, afterSnapshot);
      
      expect(report.summary).toContain('Position continuity INVALID');
      expect(report.details.positionChange).toBe(-100);
      expect(report.details.transformChange).toBe(-110);
      expect(report.details.directionChanged).toBe(true);
      expect(report.details.visibilityChanged).toBe(true);
      expect(report.details.sizeChanged).toBe(true);
      
      expect(report.recommendations).toContain('Consider adjusting position synchronization logic');
      expect(report.recommendations).toContain('Review transform application accuracy');
      expect(report.recommendations).toContain('Address critical position continuity issues');
      expect(report.recommendations).toContain('Monitor warning conditions for potential issues');
    });
  });
});
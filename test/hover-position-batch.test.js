/**
 * 测试 HoverPositionManager 的批量位置管理功能
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { HoverPositionManager } from '../src/core/utils/HoverPositionManager.js';

describe('HoverPositionManager - Batch Position Management', () => {
  let mockStates;
  let mockElement;

  beforeEach(() => {
    // 创建模拟的 DOM 元素
    const createMockElement = (transform = 'translateX(-50px)') => ({
      style: { transform },
      getBoundingClientRect: () => ({ width: 200, height: 100 }),
      offsetWidth: 200,
      offsetHeight: 100
    });

    // 创建多个模拟状态
    mockStates = [
      {
        content1: createMockElement('translateX(-50px)'),
        content2: createMockElement('translateX(-250px)'),
        position: -50,
        animationId: 'animation-1'
      },
      {
        content1: createMockElement('translateX(-75px)'),
        content2: createMockElement('translateX(-275px)'),
        position: -75,
        animationId: 'animation-2'
      },
      {
        content1: createMockElement('translateX(-100px)'),
        content2: createMockElement('translateX(-300px)'),
        position: -100,
        animationId: 'animation-3'
      }
    ];

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

    // 模拟 performance.now - 返回递增的时间戳以模拟真实的时间流逝
    let mockTime = 1234.567;
    global.performance = {
      now: vi.fn(() => {
        mockTime += 0.1; // 每次调用增加0.1ms
        return mockTime;
      })
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

  describe('batchPositionManagement', () => {
    test('should handle batch pause operations', () => {
      const result = HoverPositionManager.batchPositionManagement(
        mockStates,
        'left',
        'pause'
      );
      
      expect(result.summary.totalStates).toBe(3);
      expect(result.summary.successCount).toBe(3);
      expect(result.summary.failureCount).toBe(0);
      expect(result.results).toHaveLength(3);
      
      // 验证所有操作都成功
      result.results.forEach(r => {
        expect(r.success).toBe(true);
        expect(r.error).toBeNull();
      });
    });

    test('should handle batch resume operations', () => {
      const result = HoverPositionManager.batchPositionManagement(
        mockStates,
        'left',
        'resume'
      );
      
      expect(result.summary.totalStates).toBe(3);
      expect(result.summary.successCount).toBe(3);
      expect(result.summary.failureCount).toBe(0);
      expect(result.results).toHaveLength(3);
      
      // 验证所有操作都成功
      result.results.forEach(r => {
        expect(r.success).toBe(true);
        expect(r.error).toBeNull();
      });
    });

    test('should create snapshots when requested', () => {
      const result = HoverPositionManager.batchPositionManagement(
        mockStates,
        'left',
        'pause',
        { createSnapshots: true }
      );
      
      expect(result.summary.successCount).toBe(3);
      
      // 验证快照已创建
      result.results.forEach(r => {
        if (r.success) {
          expect(r.snapshot).toBeDefined();
          expect(r.snapshot.logicalPosition).toBeTypeOf('number');
          expect(r.snapshot.transformPosition).toBeTypeOf('number');
        }
      });
    });

    test('should handle errors gracefully', () => {
      // 模拟第二个状态出错
      const errorState = { ...mockStates[1] };
      errorState.content1 = null; // 这会导致错误
      const statesWithError = [mockStates[0], errorState, mockStates[2]];
      
      const result = HoverPositionManager.batchPositionManagement(
        statesWithError,
        'left',
        'pause',
        { continueOnError: true }
      );
      
      expect(result.summary.totalStates).toBe(3);
      expect(result.summary.successCount).toBe(2);
      expect(result.summary.failureCount).toBe(1);
      
      // 验证错误被正确记录
      const failedResult = result.results.find(r => !r.success);
      expect(failedResult).toBeDefined();
      expect(failedResult.error).toBeTruthy();
    });

    test('should stop on error when continueOnError is false', () => {
      // 模拟第一个状态出错
      const errorState = { ...mockStates[0] };
      errorState.content1 = null;
      const statesWithError = [errorState, mockStates[1], mockStates[2]];
      
      const result = HoverPositionManager.batchPositionManagement(
        statesWithError,
        'left',
        'pause',
        { continueOnError: false }
      );
      
      // 应该只处理第一个状态（失败）
      expect(result.results).toHaveLength(1);
      expect(result.summary.failureCount).toBe(1);
      expect(result.summary.successCount).toBe(0);
    });

    test('should validate continuity when requested', () => {
      const result = HoverPositionManager.batchPositionManagement(
        mockStates,
        'left',
        'pause',
        { 
          createSnapshots: true,
          validateContinuity: true,
          tolerance: 0.1
        }
      );
      
      expect(result.summary.successCount).toBe(3);
      // 连续性问题可能存在，因为位置差异较大
      expect(result.continuityIssues).toBeDefined();
    });

    test('should measure execution time', () => {
      const result = HoverPositionManager.batchPositionManagement(
        mockStates,
        'left',
        'pause'
      );
      
      expect(result.summary.averageExecutionTime).toBeGreaterThan(0);
      expect(result.summary.totalExecutionTime).toBeGreaterThan(0);
      
      result.results.forEach(r => {
        expect(r.executionTime).toBeGreaterThan(0);
      });
    });

    test('should work with different directions', () => {
      const directions = ['left', 'right', 'up', 'down'];
      
      directions.forEach(direction => {
        const result = HoverPositionManager.batchPositionManagement(
          mockStates,
          direction,
          'pause'
        );
        
        expect(result.summary.successCount).toBe(3);
        expect(result.summary.failureCount).toBe(0);
      });
    });
  });

  describe('batchCreateSnapshots', () => {
    test('should create snapshots for all states', () => {
      const result = HoverPositionManager.batchCreateSnapshots(
        mockStates,
        'left',
        'test-batch'
      );
      
      expect(result.snapshots).toHaveLength(3);
      expect(result.stats.totalSnapshots).toBe(3);
      expect(result.stats.validSnapshots).toBe(3);
      
      // 验证快照内容
      result.snapshots.forEach((snapshot, index) => {
        expect(snapshot.reason).toBe(`test-batch-${index}`);
        expect(snapshot.direction).toBe('left');
        expect(snapshot.logicalPosition).toBeTypeOf('number');
      });
    });

    test('should calculate statistics correctly', () => {
      const result = HoverPositionManager.batchCreateSnapshots(
        mockStates,
        'left'
      );
      
      expect(result.stats.averagePosition).toBeCloseTo(-75); // (-50 + -75 + -100) / 3
      expect(result.stats.positionVariance).toBeGreaterThan(0);
      expect(result.stats.timeRange.min).toBeGreaterThan(0);
      expect(result.stats.timeRange.max).toBeGreaterThan(0);
    });

    test('should handle snapshot creation errors', () => {
      // 模拟一个会导致快照创建失败的状态
      const errorState = { ...mockStates[0] };
      errorState.content1 = null;
      const statesWithError = [errorState, mockStates[1], mockStates[2]];
      
      const result = HoverPositionManager.batchCreateSnapshots(
        statesWithError,
        'left'
      );
      
      // 应该只创建2个快照（跳过错误的状态）
      expect(result.snapshots.length).toBeLessThan(3);
      expect(result.stats.validSnapshots).toBeLessThan(3);
    });
  });

  describe('batchValidatePositionContinuity', () => {
    test('should validate continuous snapshots', () => {
      // 创建连续的快照
      const snapshots = [
        {
          logicalPosition: -50,
          transformPosition: -50,
          timestamp: 1000,
          direction: 'left',
          containerSize: 200,
          content1Visible: true,
          content2Visible: true,
          positionDifference: 0,
          animationId: 'test'
        },
        {
          logicalPosition: -50.2,
          transformPosition: -50.2,
          timestamp: 1100,
          direction: 'left',
          containerSize: 200,
          content1Visible: true,
          content2Visible: true,
          positionDifference: 0,
          animationId: 'test'
        },
        {
          logicalPosition: -50.4,
          transformPosition: -50.4,
          timestamp: 1200,
          direction: 'left',
          containerSize: 200,
          content1Visible: true,
          content2Visible: true,
          positionDifference: 0,
          animationId: 'test'
        }
      ];
      
      const result = HoverPositionManager.batchValidatePositionContinuity(snapshots);
      
      expect(result.overallValid).toBe(true);
      expect(result.validTransitions).toBe(2);
      expect(result.invalidTransitions).toHaveLength(0);
      expect(result.statistics.maxPositionJump).toBeCloseTo(0.2);
    });

    test('should detect discontinuous snapshots', () => {
      const snapshots = [
        {
          logicalPosition: -50,
          transformPosition: -50,
          timestamp: 1000,
          direction: 'left',
          containerSize: 200,
          content1Visible: true,
          content2Visible: true,
          positionDifference: 0,
          animationId: 'test'
        },
        {
          logicalPosition: -150, // 大跳跃
          transformPosition: -150,
          timestamp: 1100,
          direction: 'left',
          containerSize: 200,
          content1Visible: true,
          content2Visible: true,
          positionDifference: 0,
          animationId: 'test'
        }
      ];
      
      const result = HoverPositionManager.batchValidatePositionContinuity(snapshots);
      
      expect(result.overallValid).toBe(false);
      expect(result.validTransitions).toBe(0);
      expect(result.invalidTransitions).toHaveLength(1);
      expect(result.statistics.maxPositionJump).toBe(100);
    });

    test('should handle empty or single snapshot arrays', () => {
      const emptyResult = HoverPositionManager.batchValidatePositionContinuity([]);
      expect(emptyResult.overallValid).toBe(true);
      expect(emptyResult.validTransitions).toBe(0);
      
      const singleResult = HoverPositionManager.batchValidatePositionContinuity([{
        logicalPosition: -50,
        transformPosition: -50,
        timestamp: 1000,
        direction: 'left',
        containerSize: 200,
        content1Visible: true,
        content2Visible: true,
        positionDifference: 0,
        animationId: 'test'
      }]);
      expect(singleResult.overallValid).toBe(true);
      expect(singleResult.validTransitions).toBe(0);
    });
  });

  describe('getPositionStats', () => {
    test('should calculate basic position statistics', () => {
      const stats = HoverPositionManager.getPositionStats(mockStates, 'left');
      
      expect(stats.totalStates).toBe(3);
      expect(stats.validPositions).toBe(3);
      expect(stats.averagePosition).toBeCloseTo(-75); // (-50 + -75 + -100) / 3
      expect(stats.positionRange.min).toBe(-100);
      expect(stats.positionRange.max).toBe(-50);
      expect(stats.positionVariance).toBeGreaterThan(0);
      expect(stats.standardDeviation).toBeGreaterThan(0);
      expect(stats.healthScore).toBeGreaterThan(0);
    });

    test('should include transform analysis when requested', () => {
      const stats = HoverPositionManager.getPositionStats(mockStates, 'left', {
        includeTransformAnalysis: true
      });
      
      expect(stats.transformAnalysis).toBeDefined();
      expect(stats.transformAnalysis.validTransforms).toBe(3);
      expect(stats.transformAnalysis.averageTransformPosition).toBeCloseTo(-75);
    });

    test('should include synchronization analysis', () => {
      const stats = HoverPositionManager.getPositionStats(mockStates, 'left', {
        includeSynchronizationAnalysis: true
      });
      
      expect(stats.synchronizationAnalysis).toBeDefined();
      expect(stats.synchronizationAnalysis.synchronizedStates).toBeGreaterThanOrEqual(0);
      expect(stats.synchronizationAnalysis.averageSyncDifference).toBeGreaterThanOrEqual(0);
    });

    test('should include performance metrics', () => {
      const stats = HoverPositionManager.getPositionStats(mockStates, 'left', {
        includePerformanceMetrics: true
      });
      
      expect(stats.performanceMetrics).toBeDefined();
      expect(stats.performanceMetrics.captureTime).toBeGreaterThan(0);
      expect(stats.performanceMetrics.averageCaptureTimePerState).toBeGreaterThan(0);
      expect(stats.performanceMetrics.slowestCaptures).toBeDefined();
    });

    test('should handle states with invalid positions', () => {
      // 添加一个无效状态
      const invalidState = {
        content1: null,
        content2: null,
        position: -200,
        animationId: 'invalid'
      };
      const statesWithInvalid = [...mockStates, invalidState];
      
      const stats = HoverPositionManager.getPositionStats(statesWithInvalid, 'left');
      
      expect(stats.totalStates).toBe(4);
      expect(stats.validPositions).toBe(3); // 只有3个有效
      expect(stats.healthScore).toBeLessThan(100); // 健康度应该降低
    });

    test('should calculate health score correctly', () => {
      const stats = HoverPositionManager.getPositionStats(mockStates, 'left');
      
      expect(stats.healthScore).toBeGreaterThan(0);
      expect(stats.healthScore).toBeLessThanOrEqual(100);
    });
  });

  describe('monitorPositionHealth', () => {
    test('should return healthy status for good states', () => {
      const health = HoverPositionManager.monitorPositionHealth(mockStates, 'left');
      
      expect(health.status).toBe('healthy');
      expect(health.score).toBeGreaterThan(80);
      expect(health.issues).toHaveLength(0);
      expect(health.recommendations).toHaveLength(0);
      expect(health.stats).toBeDefined();
    });

    test('should detect low position capture rate', () => {
      // 添加多个无效状态
      const invalidStates = Array(7).fill(null).map((_, i) => ({
        content1: null,
        content2: null,
        position: -i * 10,
        animationId: `invalid-${i}`
      }));
      const statesWithManyInvalid = [...mockStates, ...invalidStates];
      
      const health = HoverPositionManager.monitorPositionHealth(statesWithManyInvalid, 'left');
      
      expect(health.status).not.toBe('healthy');
      expect(health.issues.some(issue => issue.includes('Low position capture rate'))).toBe(true);
      expect(health.recommendations.some(rec => rec.includes('Check DOM element validity'))).toBe(true);
    });

    test('should detect synchronization issues', () => {
      // 创建不同步的状态
      const outOfSyncStates = mockStates.map(state => ({
        ...state,
        position: state.position + 100 // 逻辑位置与变换位置差异很大
      }));
      
      const health = HoverPositionManager.monitorPositionHealth(outOfSyncStates, 'left');
      
      expect(health.issues.some(issue => issue.includes('out of sync'))).toBe(true);
      expect(health.recommendations.some(rec => rec.includes('position synchronization'))).toBe(true);
    });

    test('should return appropriate status based on score', () => {
      // 测试不同健康度分数对应的状态
      const healthyStates = mockStates;
      const healthyResult = HoverPositionManager.monitorPositionHealth(healthyStates, 'left');
      expect(healthyResult.status).toBe('healthy');
      
      // 添加更多问题状态来确保降低分数
      const problematicStates = [
        ...mockStates,
        { content1: null, content2: null, position: -1000, animationId: 'problem1' },
        { content1: null, content2: null, position: -2000, animationId: 'problem2' },
        { content1: null, content2: null, position: -3000, animationId: 'problem3' },
        { content1: null, content2: null, position: -4000, animationId: 'problem4' },
        { content1: null, content2: null, position: -5000, animationId: 'problem5' }
      ];
      const problematicResult = HoverPositionManager.monitorPositionHealth(problematicStates, 'left');
      expect(problematicResult.score).toBeLessThan(80); // 检查分数而不是状态
      expect(['warning', 'critical']).toContain(problematicResult.status);
    });
  });
});
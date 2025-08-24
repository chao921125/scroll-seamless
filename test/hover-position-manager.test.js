/**
 * HoverPositionManager 测试套件
 * 验证精确的悬停位置管理功能
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { HoverPositionManager } from '../src/core/utils/HoverPositionManager.js';

// 模拟 DOM 环境
const mockElement = (transform = 'none') => ({
  style: {
    transform: transform
  },
  offsetWidth: 100,
  offsetHeight: 50,
  scrollWidth: 120,
  scrollHeight: 60
});

// 模拟 getComputedStyle
global.getComputedStyle = vi.fn((element) => ({
  transform: element.style.transform || 'none'
}));

// 模拟 DOMMatrix
global.DOMMatrix = vi.fn().mockImplementation((transform) => {
  if (transform === 'none' || !transform) {
    return { m41: 0, m42: 0 };
  }
  
  // 解析简单的 translate 变换
  const translateXMatch = transform.match(/translateX\((-?\d+(?:\.\d+)?)px\)/);
  const translateYMatch = transform.match(/translateY\((-?\d+(?:\.\d+)?)px\)/);
  
  return {
    m41: translateXMatch ? parseFloat(translateXMatch[1]) : 0,
    m42: translateYMatch ? parseFloat(translateYMatch[1]) : 0
  };
});

// 模拟 console 方法
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn()
};

describe('HoverPositionManager', () => {
  let mockState;
  
  beforeEach(() => {
    mockState = {
      content1: mockElement(),
      content2: mockElement(),
      position: 0,
      animationId: 'test-animation'
    };
    
    // 清除 mock 调用记录
    vi.clearAllMocks();
  });

  describe('captureCurrentPosition', () => {
    test('应该正确捕获水平方向的当前位置', () => {
      // 设置水平变换
      mockState.content1.style.transform = 'translateX(-50px)';
      
      const position = HoverPositionManager.captureCurrentPosition(mockState, 'left');
      
      expect(position).toBe(-50);
    });

    test('应该正确捕获垂直方向的当前位置', () => {
      // 设置垂直变换
      mockState.content1.style.transform = 'translateY(-30px)';
      
      const position = HoverPositionManager.captureCurrentPosition(mockState, 'up');
      
      expect(position).toBe(-30);
    });

    test('当没有变换时应该返回 0', () => {
      const position = HoverPositionManager.captureCurrentPosition(mockState, 'left');
      
      expect(position).toBe(0);
    });

    test('当变换解析失败时应该回退到逻辑位置', () => {
      mockState.position = 25;
      mockState.content1.style.transform = 'invalid-transform';
      
      // 模拟 DOMMatrix 抛出错误
      global.DOMMatrix = vi.fn().mockImplementation(() => {
        throw new Error('Invalid transform');
      });
      
      const position = HoverPositionManager.captureCurrentPosition(mockState, 'left');
      
      expect(position).toBe(25); // 应该回退到逻辑位置
      expect(console.error).toHaveBeenCalled();
    });

    test('应该处理无限值', () => {
      mockState.position = 10;
      
      // 模拟返回无限值的变换矩阵
      global.DOMMatrix = vi.fn().mockImplementation(() => ({
        m41: Infinity,
        m42: 0
      }));
      
      const position = HoverPositionManager.captureCurrentPosition(mockState, 'left');
      
      expect(position).toBe(10); // 应该回退到逻辑位置
      expect(console.warn).toHaveBeenCalledWith('Invalid transform position detected:', Infinity);
    });
  });

  describe('createPositionSnapshot', () => {
    test('应该创建完整的位置快照', () => {
      mockState.position = 15;
      mockState.content1.style.transform = 'translateX(-20px)';
      mockState.content2.style.transform = 'translateX(-120px)';
      
      const snapshot = HoverPositionManager.createPositionSnapshot(mockState, 'left');
      
      expect(snapshot).toMatchObject({
        logicalPosition: 15,
        transformPosition: -20,
        content1Transform: 'translateX(-20px)',
        content2Transform: 'translateX(-120px)',
        direction: 'left'
      });
      expect(snapshot.timestamp).toBeGreaterThan(0);
    });

    test('当无法捕获变换位置时应该使用逻辑位置', () => {
      mockState.position = 30;
      
      // 模拟捕获失败
      global.DOMMatrix = vi.fn().mockImplementation(() => {
        throw new Error('Capture failed');
      });
      
      const snapshot = HoverPositionManager.createPositionSnapshot(mockState, 'up');
      
      expect(snapshot.logicalPosition).toBe(30);
      expect(snapshot.transformPosition).toBe(30); // 应该回退到逻辑位置
    });
  });

  describe('pauseAtCurrentPosition', () => {
    test('应该在当前位置暂停并应用精确变换', () => {
      mockState.content1.style.transform = 'translateX(-40px)';
      mockState.position = 35; // 逻辑位置与变换位置不同
      
      HoverPositionManager.pauseAtCurrentPosition(mockState, 'left');
      
      // 验证逻辑位置已更新为变换位置
      expect(mockState.position).toBe(-40);
      
      // 验证变换已重新应用
      expect(mockState.content1.style.transform).toContain('translateX(-40px)');
      expect(mockState.content2.style.transform).toContain('translateX');
    });

    test('应该处理 right 方向的特殊逻辑', () => {
      mockState.content1.style.transform = 'translateX(20px)';
      
      HoverPositionManager.pauseAtCurrentPosition(mockState, 'right');
      
      expect(mockState.position).toBe(20);
      expect(mockState.content1.style.transform).toContain('translateX(20px)');
    });

    test('应该处理垂直方向', () => {
      mockState.content1.style.transform = 'translateY(-25px)';
      
      HoverPositionManager.pauseAtCurrentPosition(mockState, 'up');
      
      expect(mockState.position).toBe(-25);
      expect(mockState.content1.style.transform).toContain('translateY(-25px)');
    });

    test('当位置捕获失败时应该使用回退策略', () => {
      mockState.position = 50;
      
      // 模拟位置捕获失败
      global.DOMMatrix = vi.fn().mockImplementation(() => {
        throw new Error('Capture failed');
      });
      
      HoverPositionManager.pauseAtCurrentPosition(mockState, 'left');
      
      expect(console.error).toHaveBeenCalledWith('Failed to pause at current position:', expect.any(Error));
      // 应该仍然应用变换（使用回退策略）
      expect(mockState.content1.style.transform).toContain('translateX');
    });
  });

  describe('resumeFromPausedPosition', () => {
    test('应该验证并同步位置状态', () => {
      mockState.position = 60;
      mockState.content1.style.transform = 'translateX(-65px)'; // 位置不同步
      
      HoverPositionManager.resumeFromPausedPosition(mockState, 'left');
      
      // 验证位置已同步
      expect(mockState.position).toBe(-65);
      expect(console.warn).toHaveBeenCalledWith('Position synchronization required before resume');
    });

    test('当位置已同步时不应该发出警告', () => {
      mockState.position = -30;
      mockState.content1.style.transform = 'translateX(-30px)'; // 位置同步
      
      HoverPositionManager.resumeFromPausedPosition(mockState, 'left');
      
      expect(console.warn).not.toHaveBeenCalledWith('Position synchronization required before resume');
    });

    test('应该处理恢复失败的情况', () => {
      // 模拟位置捕获失败
      global.DOMMatrix = vi.fn().mockImplementation(() => {
        throw new Error('Resume failed');
      });
      
      HoverPositionManager.resumeFromPausedPosition(mockState, 'left');
      
      expect(console.error).toHaveBeenCalledWith('Failed to resume from paused position:', expect.any(Error));
    });
  });

  describe('validatePositionContinuity', () => {
    test('应该验证位置连续性', () => {
      const beforeSnapshot = {
        logicalPosition: 10,
        transformPosition: 12,
        content1Transform: 'translateX(12px)',
        content2Transform: 'translateX(-88px)',
        timestamp: 1000,
        direction: 'left'
      };
      
      const afterSnapshot = {
        logicalPosition: 12,
        transformPosition: 12,
        content1Transform: 'translateX(12px)',
        content2Transform: 'translateX(-88px)',
        timestamp: 1100,
        direction: 'left'
      };
      
      const result = HoverPositionManager.validatePositionContinuity(beforeSnapshot, afterSnapshot);
      
      expect(result.isValid).toBe(true);
      expect(result.positionDifference).toBe(2);
      expect(result.transformDifference).toBe(0);
      expect(result.issues).toHaveLength(0);
    });

    test('应该检测位置跳跃', () => {
      const beforeSnapshot = {
        logicalPosition: 10,
        transformPosition: 10,
        content1Transform: 'translateX(10px)',
        content2Transform: 'translateX(-90px)',
        timestamp: 1000,
        direction: 'left'
      };
      
      const afterSnapshot = {
        logicalPosition: 50, // 大幅跳跃
        transformPosition: 55, // 变换位置也跳跃
        content1Transform: 'translateX(55px)',
        content2Transform: 'translateX(-45px)',
        timestamp: 1100,
        direction: 'left'
      };
      
      const result = HoverPositionManager.validatePositionContinuity(beforeSnapshot, afterSnapshot);
      
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Logical position jump detected: 40.00px');
      expect(result.issues).toContain('Transform position jump detected: 45.00px');
    });

    test('应该检测方向变化', () => {
      const beforeSnapshot = {
        logicalPosition: 10,
        transformPosition: 10,
        content1Transform: 'translateX(10px)',
        content2Transform: 'translateX(-90px)',
        timestamp: 1000,
        direction: 'left'
      };
      
      const afterSnapshot = {
        logicalPosition: 10,
        transformPosition: 10,
        content1Transform: 'translateY(10px)',
        content2Transform: 'translateY(-90px)',
        timestamp: 1100,
        direction: 'up' // 方向改变
      };
      
      const result = HoverPositionManager.validatePositionContinuity(beforeSnapshot, afterSnapshot);
      
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Direction changed during pause: left -> up');
    });

    test('应该检测无效的时间戳序列', () => {
      const beforeSnapshot = {
        logicalPosition: 10,
        transformPosition: 10,
        content1Transform: 'translateX(10px)',
        content2Transform: 'translateX(-90px)',
        timestamp: 2000,
        direction: 'left'
      };
      
      const afterSnapshot = {
        logicalPosition: 10,
        transformPosition: 10,
        content1Transform: 'translateX(10px)',
        content2Transform: 'translateX(-90px)',
        timestamp: 1000, // 时间戳倒退
        direction: 'left'
      };
      
      const result = HoverPositionManager.validatePositionContinuity(beforeSnapshot, afterSnapshot);
      
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Invalid timestamp sequence: -1000ms');
    });

    test('应该使用自定义容差', () => {
      const beforeSnapshot = {
        logicalPosition: 10,
        transformPosition: 10,
        content1Transform: 'translateX(10px)',
        content2Transform: 'translateX(-90px)',
        timestamp: 1000,
        direction: 'left'
      };
      
      const afterSnapshot = {
        logicalPosition: 12,
        transformPosition: 12,
        content1Transform: 'translateX(12px)',
        content2Transform: 'translateX(-88px)',
        timestamp: 1100,
        direction: 'left'
      };
      
      // 使用严格的容差
      const result = HoverPositionManager.validatePositionContinuity(beforeSnapshot, afterSnapshot, 1);
      
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Logical position jump detected: 2.00px');
      expect(result.issues).toContain('Transform position jump detected: 2.00px');
    });
  });

  describe('batchPositionManagement', () => {
    test('应该批量处理暂停操作', () => {
      const states = [
        {
          content1: mockElement('translateX(-10px)'),
          content2: mockElement('translateX(-110px)'),
          position: 5,
          animationId: 'anim1'
        },
        {
          content1: mockElement('translateX(-20px)'),
          content2: mockElement('translateX(-120px)'),
          position: 15,
          animationId: 'anim2'
        }
      ];
      
      HoverPositionManager.batchPositionManagement(states, 'left', 'pause');
      
      // 验证所有状态都已更新
      expect(states[0].position).toBe(-10);
      expect(states[1].position).toBe(-20);
    });

    test('应该批量处理恢复操作', () => {
      const states = [
        {
          content1: mockElement('translateX(-30px)'),
          content2: mockElement('translateX(-130px)'),
          position: -30,
          animationId: 'anim1'
        }
      ];
      
      HoverPositionManager.batchPositionManagement(states, 'left', 'resume');
      
      // 验证恢复操作已执行（不会改变已同步的位置）
      expect(states[0].position).toBe(-30);
    });

    test('应该处理批量操作中的错误', () => {
      const states = [
        {
          content1: mockElement(),
          content2: mockElement(),
          position: 0,
          animationId: 'anim1'
        }
      ];
      
      // 模拟操作失败
      global.DOMMatrix = vi.fn().mockImplementation(() => {
        throw new Error('Batch operation failed');
      });
      
      HoverPositionManager.batchPositionManagement(states, 'left', 'pause');
      
      expect(console.error).toHaveBeenCalledWith('Batch pause failed for state 0:', expect.any(Error));
      expect(console.warn).toHaveBeenCalledWith('Batch pause had 1 failures:', expect.any(Array));
    });
  });

  describe('getPositionStats', () => {
    test('应该计算位置统计信息', () => {
      const states = [
        {
          content1: mockElement('translateX(-10px)'),
          content2: mockElement(),
          position: 0,
          animationId: 'anim1'
        },
        {
          content1: mockElement('translateX(-30px)'),
          content2: mockElement(),
          position: 0,
          animationId: 'anim2'
        },
        {
          content1: mockElement('translateX(-20px)'),
          content2: mockElement(),
          position: 0,
          animationId: 'anim3'
        }
      ];
      
      const stats = HoverPositionManager.getPositionStats(states, 'left');
      
      expect(stats.totalStates).toBe(3);
      expect(stats.validPositions).toBe(3);
      expect(stats.averagePosition).toBe(-20); // (-10 + -30 + -20) / 3
      expect(stats.positionRange.min).toBe(-30);
      expect(stats.positionRange.max).toBe(-10);
    });

    test('应该处理无效位置', () => {
      const states = [
        {
          content1: mockElement(),
          content2: mockElement(),
          position: 0,
          animationId: 'anim1'
        }
      ];
      
      // 模拟位置捕获失败
      global.DOMMatrix = vi.fn().mockImplementation(() => {
        throw new Error('Position capture failed');
      });
      
      const stats = HoverPositionManager.getPositionStats(states, 'left');
      
      expect(stats.totalStates).toBe(1);
      expect(stats.validPositions).toBe(0);
      expect(stats.averagePosition).toBe(0);
      expect(stats.positionRange.min).toBe(0);
      expect(stats.positionRange.max).toBe(0);
    });
  });
});
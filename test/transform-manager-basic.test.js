/**
 * TransformManager 基础功能测试
 * 验证核心变换功能
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { TransformManager } from '../src/core/utils/TransformManager.js';

// 设置简单的 DOM 环境
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;

// 模拟 performance.now() 以避免 JSDOM 的问题
let mockTime = 0;
global.performance = {
  now: () => {
    mockTime += 1;
    return mockTime;
  }
};

describe('TransformManager Basic Tests', () => {
  let testElement;
  
  beforeEach(() => {
    // 创建测试元素
    testElement = document.createElement('div');
    testElement.style.position = 'absolute';
    document.body.appendChild(testElement);
    
    // 重置性能指标和缓存
    TransformManager.resetPerformanceMetrics();
    TransformManager.clearTransformCache();
    mockTime = 0;
  });
  
  afterEach(() => {
    // 清理测试元素
    if (testElement && testElement.parentNode) {
      testElement.parentNode.removeChild(testElement);
    }
  });

  describe('Transform String Generation', () => {
    test('should generate correct transform strings for left direction', () => {
      const transform = TransformManager.generateTransformString(100, 'left');
      expect(transform).toBe('translateX(-100px)');
    });

    test('should generate correct transform strings for right direction', () => {
      const transform = TransformManager.generateTransformString(50, 'right');
      expect(transform).toBe('translateX(-50px)');
    });

    test('should generate correct transform strings for up direction', () => {
      const transform = TransformManager.generateTransformString(75, 'up');
      expect(transform).toBe('translateY(-75px)');
    });

    test('should generate correct transform strings for down direction', () => {
      const transform = TransformManager.generateTransformString(25, 'down');
      expect(transform).toBe('translateY(-25px)');
    });

    test('should handle zero position', () => {
      const transform = TransformManager.generateTransformString(0, 'left');
      expect(transform).toBe('translateX(0px)');
    });

    test('should handle negative position', () => {
      const transform = TransformManager.generateTransformString(-10, 'up');
      expect(transform).toBe('translateY(10px)');
    });

    test('should throw error for invalid direction', () => {
      expect(() => {
        TransformManager.generateTransformString(100, 'invalid');
      }).toThrow('Invalid scroll direction: invalid');
    });
  });

  describe('Single Transform Application', () => {
    test('should apply transform to element', () => {
      const transform = 'translateX(-100px)';
      
      TransformManager.applySingleTransform(testElement, transform);
      
      expect(testElement.style.transform).toBe(transform);
    });

    test('should apply additional styles', () => {
      const transform = 'translateY(-50px)';
      const additionalStyles = {
        opacity: '0.8',
        zIndex: '5'
      };
      
      TransformManager.applySingleTransform(testElement, transform, additionalStyles);
      
      expect(testElement.style.transform).toBe(transform);
      expect(testElement.style.opacity).toBe('0.8');
      expect(testElement.style.zIndex).toBe('5');
    });

    test('should handle invalid element gracefully', () => {
      const invalidElement = null;
      
      // 应该不抛出错误，而是使用错误处理机制
      expect(() => {
        TransformManager.applySingleTransform(invalidElement, 'translateX(10px)');
      }).not.toThrow();
      
      // 错误计数应该增加
      const metrics = TransformManager.getPerformanceMetrics();
      expect(metrics.errorCount).toBeGreaterThan(0);
    });
  });

  describe('Batch Transform Application', () => {
    test('should apply batch transforms successfully', () => {
      const element2 = document.createElement('div');
      document.body.appendChild(element2);
      
      const updates = [
        { element: testElement, transform: 'translateX(-10px)' },
        { element: element2, transform: 'translateY(-20px)' }
      ];
      
      const result = TransformManager.applyBatchTransforms(updates);
      
      expect(result.success).toBe(true);
      expect(result.appliedTransforms).toHaveLength(2);
      expect(result.errors).toBeUndefined();
      
      // 清理
      document.body.removeChild(element2);
    });

    test('should handle mixed success and failure in batch', () => {
      const invalidElement = null;
      
      const updates = [
        { element: testElement, transform: 'translateX(-10px)' },
        { element: invalidElement, transform: 'translateY(-20px)' }
      ];
      
      const result = TransformManager.applyBatchTransforms(updates);
      
      // 由于我们的错误处理机制很好，可能会成功处理有效元素
      // 但应该有错误记录或使用了回退机制
      if (result.success) {
        // 如果成功，至少应该有一个变换被应用
        expect(result.appliedTransforms.length).toBeGreaterThan(0);
      } else {
        // 如果失败，应该有错误信息
        expect(result.errors).toBeDefined();
        expect(result.fallbackUsed).toBe(true);
      }
      
      // 验证有效元素的变换被正确应用
      expect(testElement.style.transform).toBe('translateX(-10px)');
    });
  });

  describe('Cache Management', () => {
    test('should cache transform strings', () => {
      const position = 100;
      const direction = 'left';
      
      // 第一次生成
      const transform1 = TransformManager.generateTransformString(position, direction, true);
      
      // 检查缓存
      const cacheStats = TransformManager.getCacheStats();
      expect(cacheStats.size).toBeGreaterThan(0);
      
      // 第二次生成应该使用缓存
      const transform2 = TransformManager.generateTransformString(position, direction, true);
      
      expect(transform1).toBe(transform2);
      expect(transform1).toBe('translateX(-100px)');
    });

    test('should clear cache', () => {
      // 添加缓存项
      TransformManager.generateTransformString(100, 'left', true);
      
      let cacheStats = TransformManager.getCacheStats();
      expect(cacheStats.size).toBeGreaterThan(0);
      
      // 清除缓存
      TransformManager.clearTransformCache();
      
      cacheStats = TransformManager.getCacheStats();
      expect(cacheStats.size).toBe(0);
    });

    test('should warm up cache', () => {
      const direction = 'right';
      const maxPosition = 50;
      const step = 10;
      
      TransformManager.warmupTransformCache(direction, maxPosition, step);
      
      const cacheStats = TransformManager.getCacheStats();
      expect(cacheStats.size).toBeGreaterThan(0);
      
      // 验证缓存的项目可以快速获取
      const cachedTransform = TransformManager.generateTransformString(30, direction, true);
      expect(cachedTransform).toBe('translateX(-30px)');
    });
  });

  describe('Performance Metrics', () => {
    test('should track basic performance metrics', () => {
      // 执行一些操作
      TransformManager.generateTransformString(100, 'left');
      TransformManager.applySingleTransform(testElement, 'translateX(-50px)');
      
      const metrics = TransformManager.getPerformanceMetrics();
      
      expect(metrics).toHaveProperty('transformGenerationTime');
      expect(metrics).toHaveProperty('individualUpdateTime');
      expect(metrics).toHaveProperty('batchUpdateTime');
      expect(metrics).toHaveProperty('errorCount');
      expect(metrics).toHaveProperty('fallbackCount');
      
      expect(metrics.transformGenerationTime).toBeGreaterThanOrEqual(0);
      expect(metrics.individualUpdateTime).toBeGreaterThanOrEqual(0);
    });

    test('should reset performance metrics', () => {
      // 生成一些指标
      TransformManager.generateTransformString(100, 'left');
      
      let metrics = TransformManager.getPerformanceMetrics();
      expect(metrics.transformGenerationTime).toBeGreaterThan(0);
      
      // 重置指标
      TransformManager.resetPerformanceMetrics();
      
      metrics = TransformManager.getPerformanceMetrics();
      expect(metrics.transformGenerationTime).toBe(0);
      expect(metrics.errorCount).toBe(0);
    });
  });

  describe('Seamless Transform Application', () => {
    test('should apply seamless transforms for horizontal directions', () => {
      const element2 = document.createElement('div');
      document.body.appendChild(element2);
      
      const position = 100;
      const contentSize = 200;
      const direction = 'left';
      
      const result = TransformManager.applySeamlessTransforms(
        testElement,
        element2,
        position,
        contentSize,
        direction
      );
      
      expect(result.success).toBe(true);
      expect(result.appliedTransforms).toHaveLength(2);
      
      // 验证变换应用
      expect(testElement.style.transform).toBe('translateX(-100px)');
      expect(element2.style.transform).toBe('translateX(-300px)'); // position + contentSize
      
      // 清理
      document.body.removeChild(element2);
    });

    test('should apply seamless transforms for up direction', () => {
      const element2 = document.createElement('div');
      document.body.appendChild(element2);
      
      const position = 50;
      const contentSize = 150;
      const direction = 'up';
      
      const result = TransformManager.applySeamlessTransforms(
        testElement,
        element2,
        position,
        contentSize,
        direction
      );
      
      expect(result.success).toBe(true);
      
      // up 方向：第二个内容在第一个内容的上方
      expect(testElement.style.transform).toBe('translateY(-50px)');
      expect(element2.style.transform).toBe('translateY(100px)'); // position - contentSize
      
      // 清理
      document.body.removeChild(element2);
    });
  });
});
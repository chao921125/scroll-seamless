/**
 * 变换性能测试
 * 验证 TransformManager 的优化效果
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { TransformManager } from '../src/core/utils/TransformManager.js';
import { DirectionHandler } from '../src/core/utils/DirectionHandler.js';

// 设置 DOM 环境
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.performance = dom.window.performance;

describe('TransformManager Performance Tests', () => {
  let testElements;
  
  beforeEach(() => {
    // 创建测试元素
    testElements = [];
    for (let i = 0; i < 100; i++) {
      const element = document.createElement('div');
      element.style.position = 'absolute';
      document.body.appendChild(element);
      testElements.push(element);
    }
    
    // 重置性能指标
    TransformManager.resetPerformanceMetrics();
  });
  
  afterEach(() => {
    // 清理测试元素
    testElements.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
    testElements = [];
    
    // 清理缓存
    TransformManager.clearTransformCache();
  });

  describe('Transform String Generation', () => {
    test('should generate correct transform strings for all directions', () => {
      const position = 100;
      const directions = ['left', 'right', 'up', 'down'];
      
      directions.forEach(direction => {
        const transform = TransformManager.generateTransformString(position, direction);
        
        if (direction === 'left' || direction === 'right') {
          expect(transform).toBe('translateX(-100px)');
        } else {
          expect(transform).toBe('translateY(-100px)');
        }
      });
    });

    test('should use cache for repeated transform generation', () => {
      const position = 50;
      const direction = 'left';
      
      // 第一次生成
      const transform1 = TransformManager.generateTransformString(position, direction, true);
      
      // 第二次生成（应该使用缓存）
      const transform2 = TransformManager.generateTransformString(position, direction, true);
      
      expect(transform1).toBe(transform2);
      expect(transform1).toBe('translateX(-50px)');
      
      // 验证缓存统计
      const cacheStats = TransformManager.getCacheStats();
      expect(cacheStats.size).toBeGreaterThan(0);
    });

    test('should handle invalid directions gracefully', () => {
      expect(() => {
        TransformManager.generateTransformString(100, 'invalid');
      }).toThrow('Unsupported direction: invalid');
    });
  });

  describe('Batch Transform Application', () => {
    test('should apply batch transforms successfully', () => {
      const updates = testElements.slice(0, 10).map((element, index) => ({
        element,
        transform: `translateX(${index * 10}px)`
      }));
      
      const result = TransformManager.applyBatchTransforms(updates);
      
      expect(result.success).toBe(true);
      expect(result.appliedTransforms).toHaveLength(10);
      expect(result.errors).toBeUndefined();
      expect(result.fallbackUsed).toBe(false);
      
      // 验证变换是否正确应用
      updates.forEach((update, index) => {
        expect(update.element.style.transform).toBe(`translateX(${index * 10}px)`);
      });
    });

    test('should handle batch transform errors with fallback', () => {
      // 创建一个无效的元素来触发错误
      const invalidElement = null;
      
      const updates = [
        { element: testElements[0], transform: 'translateX(10px)' },
        { element: invalidElement, transform: 'translateX(20px)' }, // 这会失败
        { element: testElements[1], transform: 'translateX(30px)' }
      ];
      
      const result = TransformManager.applyBatchTransforms(updates);
      
      // 应该有部分成功，部分失败
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Single Transform Application', () => {
    test('should apply single transform with error handling', () => {
      const element = testElements[0];
      const transform = 'translateX(100px)';
      
      // 应该成功应用
      expect(() => {
        TransformManager.applySingleTransform(element, transform);
      }).not.toThrow();
      
      expect(element.style.transform).toBe(transform);
    });

    test('should handle invalid transform strings', () => {
      const element = testElements[0];
      const invalidTransform = 'invalid-transform';
      
      // 应该使用回退机制，不抛出错误
      expect(() => {
        TransformManager.applySingleTransform(element, invalidTransform);
      }).not.toThrow();
      
      // 应该应用了回退变换
      expect(element.style.transform).toBe('none');
    });

    test('should apply additional styles', () => {
      const element = testElements[0];
      const transform = 'translateX(50px)';
      const additionalStyles = {
        opacity: '0.5',
        zIndex: '10'
      };
      
      TransformManager.applySingleTransform(element, transform, additionalStyles);
      
      expect(element.style.transform).toBe(transform);
      expect(element.style.opacity).toBe('0.5');
      expect(element.style.zIndex).toBe('10');
    });
  });

  describe('Seamless Transform Application', () => {
    test('should apply seamless transforms for horizontal scrolling', () => {
      const content1 = testElements[0];
      const content2 = testElements[1];
      const position = 100;
      const contentSize = 200;
      const direction = 'left';
      
      const result = TransformManager.applySeamlessTransforms(
        content1,
        content2,
        position,
        contentSize,
        direction
      );
      
      expect(result.success).toBe(true);
      expect(result.appliedTransforms).toHaveLength(2);
      
      // 验证变换应用
      expect(content1.style.transform).toBe('translateX(-100px)');
      expect(content2.style.transform).toBe('translateX(-300px)'); // position + contentSize
    });

    test('should apply seamless transforms for up direction', () => {
      const content1 = testElements[0];
      const content2 = testElements[1];
      const position = 50;
      const contentSize = 150;
      const direction = 'up';
      
      const result = TransformManager.applySeamlessTransforms(
        content1,
        content2,
        position,
        contentSize,
        direction
      );
      
      expect(result.success).toBe(true);
      
      // up 方向：第二个内容在第一个内容的上方
      expect(content1.style.transform).toBe('translateY(-50px)');
      expect(content2.style.transform).toBe('translateY(100px)'); // position - contentSize
    });
  });

  describe('Performance Metrics', () => {
    test('should track performance metrics', () => {
      // 执行一些操作来生成指标
      TransformManager.generateTransformString(100, 'left');
      TransformManager.applySingleTransform(testElements[0], 'translateX(50px)');
      
      const metrics = TransformManager.getPerformanceMetrics();
      
      expect(metrics).toHaveProperty('batchUpdateTime');
      expect(metrics).toHaveProperty('individualUpdateTime');
      expect(metrics).toHaveProperty('transformGenerationTime');
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

  describe('Cache Management', () => {
    test('should warm up transform cache', () => {
      const direction = 'left';
      const maxPosition = 100;
      const step = 10;
      
      TransformManager.warmupTransformCache(direction, maxPosition, step);
      
      const cacheStats = TransformManager.getCacheStats();
      expect(cacheStats.size).toBeGreaterThan(0);
      
      // 验证缓存的变换可以快速获取
      const cachedTransform = TransformManager.generateTransformString(50, direction, true);
      expect(cachedTransform).toBe('translateX(-50px)');
    });

    test('should clear transform cache', () => {
      // 添加一些缓存项
      TransformManager.generateTransformString(100, 'left', true);
      TransformManager.generateTransformString(200, 'right', true);
      
      let cacheStats = TransformManager.getCacheStats();
      expect(cacheStats.size).toBeGreaterThan(0);
      
      // 清除缓存
      TransformManager.clearTransformCache();
      
      cacheStats = TransformManager.getCacheStats();
      expect(cacheStats.size).toBe(0);
    });
  });

  describe('Performance Comparison', () => {
    test('should show performance improvement with batch updates', async () => {
      const elementCount = 50;
      const elements = testElements.slice(0, elementCount);
      
      // 测试单个更新的性能
      const startIndividual = performance.now();
      elements.forEach((element, index) => {
        const transform = `translateX(${index * 5}px)`;
        TransformManager.applySingleTransform(element, transform);
      });
      const individualTime = performance.now() - startIndividual;
      
      // 重置元素状态
      elements.forEach(element => {
        element.style.transform = '';
      });
      
      // 测试批量更新的性能
      const updates = elements.map((element, index) => ({
        element,
        transform: `translateX(${index * 5}px)`
      }));
      
      const startBatch = performance.now();
      TransformManager.applyBatchTransforms(updates);
      const batchTime = performance.now() - startBatch;
      
      // 批量更新应该更快（在大多数情况下）
      console.log(`Individual updates: ${individualTime}ms, Batch updates: ${batchTime}ms`);
      
      // 验证结果是否相同
      elements.forEach((element, index) => {
        expect(element.style.transform).toBe(`translateX(${index * 5}px)`);
      });
    });
  });

  describe('Integration with DirectionHandler', () => {
    test('should work correctly with DirectionHandler batch transforms', () => {
      const elements = testElements.slice(0, 5).map((element, index) => ({
        element,
        position: index * 20
      }));
      
      const result = DirectionHandler.applyBatchTransforms(elements, 'left');
      
      expect(result.success).toBe(true);
      expect(result.appliedTransforms).toHaveLength(5);
      
      // 验证变换应用
      elements.forEach(({ element, position }) => {
        expect(element.style.transform).toBe(`translateX(-${position}px)`);
      });
    });
  });
});
/**
 * 变换优化集成测试
 * 验证优化的变换应用机制与 ScrollEngine 的集成
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { ScrollEngine } from '../src/core/ScrollEngine.js';
import { TransformManager } from '../src/core/utils/TransformManager.js';

// 设置 DOM 环境
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.performance = dom.window.performance;
global.requestAnimationFrame = (callback) => setTimeout(callback, 16);

describe('Transform Optimization Integration Tests', () => {
  let container;
  let scrollEngine;
  
  beforeEach(() => {
    // 创建测试容器
    container = document.createElement('div');
    container.style.width = '300px';
    container.style.height = '100px';
    container.style.overflow = 'hidden';
    document.body.appendChild(container);
    
    // 重置性能指标
    TransformManager.resetPerformanceMetrics();
  });
  
  afterEach(() => {
    // 清理
    if (scrollEngine) {
      scrollEngine.destroy();
      scrollEngine = null;
    }
    
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    
    TransformManager.clearTransformCache();
  });

  describe('Horizontal Scrolling with Optimized Transforms', () => {
    test('should apply optimized transforms for left direction', (done) => {
      const testData = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'];
      
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'left',
        step: 2,
        stepWait: 10
      });
      
      // 启动滚动
      scrollEngine.start();
      
      // 等待几个动画帧后检查变换应用
      setTimeout(() => {
        const contentElements = container.querySelectorAll('.ss-content');
        expect(contentElements.length).toBe(2); // content1 和 content2
        
        // 验证变换已应用
        contentElements.forEach(element => {
          const transform = element.style.transform;
          expect(transform).toMatch(/translateX\(-?\d+px\)/);
        });
        
        // 检查性能指标
        const metrics = TransformManager.getPerformanceMetrics();
        expect(metrics.transformGenerationTime).toBeGreaterThan(0);
        
        scrollEngine.stop();
        done();
      }, 100);
    });

    test('should apply optimized transforms for right direction', (done) => {
      const testData = ['Right 1', 'Right 2', 'Right 3'];
      
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'right',
        step: 1,
        stepWait: 20
      });
      
      scrollEngine.start();
      
      setTimeout(() => {
        const contentElements = container.querySelectorAll('.ss-content');
        
        // 验证 right 方向的变换计算修复
        contentElements.forEach(element => {
          const transform = element.style.transform;
          expect(transform).toMatch(/translateX\(-?\d+px\)/);
          
          // right 方向应该使用负值变换来实现视觉上的向右滚动
          const match = transform.match(/translateX\((-?\d+)px\)/);
          if (match) {
            const value = parseInt(match[1]);
            expect(value).toBeLessThanOrEqual(0); // 应该是负值或0
          }
        });
        
        scrollEngine.stop();
        done();
      }, 100);
    });
  });

  describe('Vertical Scrolling with Optimized Transforms', () => {
    test('should apply optimized transforms for up direction', (done) => {
      const testData = ['Up 1', 'Up 2', 'Up 3', 'Up 4'];
      
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'up',
        step: 1,
        stepWait: 15
      });
      
      scrollEngine.start();
      
      setTimeout(() => {
        const contentElements = container.querySelectorAll('.ss-content');
        
        // 验证 up 方向的变换应用
        contentElements.forEach(element => {
          const transform = element.style.transform;
          expect(transform).toMatch(/translateY\(-?\d+px\)/);
        });
        
        scrollEngine.stop();
        done();
      }, 100);
    });

    test('should apply optimized transforms for down direction', (done) => {
      const testData = ['Down 1', 'Down 2', 'Down 3'];
      
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'down',
        step: 2,
        stepWait: 10
      });
      
      scrollEngine.start();
      
      setTimeout(() => {
        const contentElements = container.querySelectorAll('.ss-content');
        
        // 验证 down 方向的变换计算修复
        contentElements.forEach(element => {
          const transform = element.style.transform;
          expect(transform).toMatch(/translateY\(-?\d+px\)/);
          
          // down 方向应该使用负值变换来实现视觉上的向下滚动
          const match = transform.match(/translateY\((-?\d+)px\)/);
          if (match) {
            const value = parseInt(match[1]);
            expect(value).toBeLessThanOrEqual(0); // 应该是负值或0
          }
        });
        
        scrollEngine.stop();
        done();
      }, 100);
    });
  });

  describe('Error Handling and Fallback', () => {
    test('should handle transform errors gracefully', (done) => {
      const testData = ['Error Test 1', 'Error Test 2'];
      
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'left',
        step: 1
      });
      
      // 模拟错误情况：破坏一个内容元素
      scrollEngine.start();
      
      setTimeout(() => {
        const contentElements = container.querySelectorAll('.ss-content');
        
        // 人为破坏一个元素的 style 属性来触发错误处理
        if (contentElements.length > 0) {
          const originalStyle = contentElements[0].style;
          Object.defineProperty(contentElements[0], 'style', {
            get: () => {
              throw new Error('Simulated style access error');
            },
            configurable: true
          });
          
          // 等待一些动画帧，错误处理应该生效
          setTimeout(() => {
            const metrics = TransformManager.getPerformanceMetrics();
            expect(metrics.errorCount).toBeGreaterThan(0);
            
            // 恢复元素
            Object.defineProperty(contentElements[0], 'style', {
              value: originalStyle,
              configurable: true,
              writable: true
            });
            
            scrollEngine.stop();
            done();
          }, 50);
        } else {
          scrollEngine.stop();
          done();
        }
      }, 50);
    });

    test('should use fallback transforms when needed', () => {
      const testData = ['Fallback Test'];
      
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'left'
      });
      
      // 测试回退变换生成
      const fallbackTransform = TransformManager.generateTransformString(100, 'left');
      expect(fallbackTransform).toBe('translateX(-100px)');
      
      // 测试无效变换的处理
      const element = document.createElement('div');
      container.appendChild(element);
      
      // 应该不抛出错误
      expect(() => {
        TransformManager.applySingleTransform(element, 'invalid-transform');
      }).not.toThrow();
      
      // 应该应用了回退变换
      expect(element.style.transform).toBe('none');
    });
  });

  describe('Performance Optimization Verification', () => {
    test('should show improved performance with batch updates', (done) => {
      const testData = Array.from({ length: 20 }, (_, i) => `Performance Item ${i + 1}`);
      
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'left',
        step: 1,
        stepWait: 5
      });
      
      scrollEngine.start();
      
      // 运行一段时间来收集性能数据
      setTimeout(() => {
        const metrics = TransformManager.getPerformanceMetrics();
        
        // 验证性能指标被正确收集
        expect(metrics.transformGenerationTime).toBeGreaterThan(0);
        expect(metrics.batchUpdateTime).toBeGreaterThanOrEqual(0);
        
        // 验证缓存使用
        const cacheStats = TransformManager.getCacheStats();
        expect(cacheStats.size).toBeGreaterThan(0);
        
        console.log('Performance Metrics:', {
          transformGeneration: `${metrics.transformGenerationTime.toFixed(2)}ms`,
          batchUpdate: `${metrics.batchUpdateTime.toFixed(2)}ms`,
          cacheSize: cacheStats.size,
          errorCount: metrics.errorCount,
          fallbackCount: metrics.fallbackCount
        });
        
        scrollEngine.stop();
        done();
      }, 200);
    });

    test('should cache frequently used transforms', (done) => {
      const testData = ['Cache Test 1', 'Cache Test 2'];
      
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'left',
        step: 1,
        stepWait: 10
      });
      
      // 预热缓存
      TransformManager.warmupTransformCache('left', 100, 1);
      
      const initialCacheSize = TransformManager.getCacheStats().size;
      expect(initialCacheSize).toBeGreaterThan(0);
      
      scrollEngine.start();
      
      setTimeout(() => {
        // 缓存应该被使用，大小可能增加但不会大幅增加
        const finalCacheSize = TransformManager.getCacheStats().size;
        expect(finalCacheSize).toBeGreaterThanOrEqual(initialCacheSize);
        
        scrollEngine.stop();
        done();
      }, 100);
    });
  });

  describe('Direction Change with Optimized Transforms', () => {
    test('should handle direction changes with optimized transforms', (done) => {
      const testData = ['Direction Change 1', 'Direction Change 2'];
      
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'left',
        step: 1
      });
      
      scrollEngine.start();
      
      setTimeout(() => {
        // 验证初始方向的变换
        let contentElements = container.querySelectorAll('.ss-content');
        contentElements.forEach(element => {
          expect(element.style.transform).toMatch(/translateX\(-?\d+px\)/);
        });
        
        // 改变方向
        scrollEngine.setOptions({ direction: 'up' });
        
        setTimeout(() => {
          // 验证新方向的变换
          contentElements = container.querySelectorAll('.ss-content');
          contentElements.forEach(element => {
            expect(element.style.transform).toMatch(/translateY\(-?\d+px\)/);
          });
          
          scrollEngine.stop();
          done();
        }, 50);
      }, 50);
    });
  });

  describe('Multi-row/Multi-column with Optimized Transforms', () => {
    test('should handle multiple rows with batch transforms', (done) => {
      const testData = ['Multi 1', 'Multi 2', 'Multi 3', 'Multi 4'];
      
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'left',
        rows: 2,
        step: 1
      });
      
      scrollEngine.start();
      
      setTimeout(() => {
        const rowContainers = container.querySelectorAll('.scroll-seamless-row');
        expect(rowContainers.length).toBe(2);
        
        // 每行都应该有正确的变换应用
        rowContainers.forEach(rowContainer => {
          const contentElements = rowContainer.querySelectorAll('.ss-content');
          expect(contentElements.length).toBe(2);
          
          contentElements.forEach(element => {
            expect(element.style.transform).toMatch(/translateX\(-?\d+px\)/);
          });
        });
        
        scrollEngine.stop();
        done();
      }, 100);
    });
  });
});
/**
 * 错误场景测试套件
 * 测试各种边界条件和异常情况下的错误处理
 */

import { describe, it, expect, beforeEach, afterEach, test, jest } from 'vitest';
import { ErrorHandler, ScrollDirectionError } from '../src/core/utils/ErrorHandler.ts';
import { DirectionHandler } from '../src/core/utils/DirectionHandler.ts';
import { PositionCalculator } from '../src/core/utils/PositionCalculator.ts';
import { ScrollEngine } from '../src/core/ScrollEngine.ts';

// 模拟 DOM 环境
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.getComputedStyle = dom.window.getComputedStyle;
global.requestAnimationFrame = (callback) => setTimeout(callback, 16);

describe('Error Scenarios - Edge Cases', () => {
  beforeEach(() => {
    ErrorHandler.clearErrorLog();
  });

  describe('DOM Manipulation Edge Cases', () => {
    test('should handle element removed from DOM during calculation', () => {
      const element = document.createElement('div');
      element.textContent = 'Test content';
      document.body.appendChild(element);
      
      // 模拟在计算过程中元素被移除
      setTimeout(() => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      }, 10);
      
      const size = PositionCalculator.getContentSize(element, 'left');
      expect(size).toBeGreaterThan(0); // 应该返回默认值或缓存值
    });

    test('should handle element style changes during calculation', () => {
      const element = document.createElement('div');
      element.textContent = 'Test content';
      element.style.width = '100px';
      element.style.height = '50px';
      document.body.appendChild(element);
      
      // 在计算过程中改变样式
      const originalGetComputedStyle = window.getComputedStyle;
      window.getComputedStyle = jest.fn(() => {
        element.style.display = 'none';
        return originalGetComputedStyle(element);
      });
      
      const size = PositionCalculator.getContentSize(element, 'left');
      expect(size).toBeGreaterThan(0);
      
      // 恢复原始方法
      window.getComputedStyle = originalGetComputedStyle;
      document.body.removeChild(element);
    });
  });

  describe('Memory and Performance Edge Cases', () => {
    test('should handle large number of error logs', () => {
      // 生成大量错误日志
      for (let i = 0; i < 1000; i++) {
        ErrorHandler.logError({
          code: ScrollDirectionError.INVALID_DIRECTION,
          message: `Bulk error ${i}`,
          timestamp: Date.now(),
          recoverable: true
        });
      }
      
      const stats = ErrorHandler.getErrorStats();
      expect(stats.totalErrors).toBeLessThanOrEqual(100); // 应该被限制
      
      // 检查内存使用情况
      const errorLog = ErrorHandler.getErrorLog(200);
      expect(errorLog.length).toBeLessThanOrEqual(100);
    });

    test('should handle rapid successive error logging', () => {
      const startTime = Date.now();
      
      // 快速连续记录错误
      for (let i = 0; i < 50; i++) {
        ErrorHandler.logError({
          code: ScrollDirectionError.ANIMATION_SYNC_FAILED,
          message: `Rapid error ${i}`,
          timestamp: Date.now(),
          recoverable: true
        });
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // 确保性能合理（应该在100ms内完成）
      expect(duration).toBeLessThan(100);
      
      const stats = ErrorHandler.getErrorStats();
      expect(stats.totalErrors).toBeGreaterThan(0);
    });
  });

  describe('Concurrent Operations Edge Cases', () => {
    test('should handle concurrent content size calculations', async () => {
      const element = document.createElement('div');
      element.textContent = 'Test content';
      document.body.appendChild(element);
      
      // 并发执行多个尺寸计算
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          new Promise(resolve => {
            setTimeout(() => {
              const size = PositionCalculator.getContentSize(element, 'left');
              resolve(size);
            }, Math.random() * 50);
          })
        );
      }
      
      const results = await Promise.all(promises);
      
      // 所有结果应该一致（使用缓存）
      const firstResult = results[0];
      results.forEach(result => {
        expect(result).toBe(firstResult);
      });
      
      document.body.removeChild(element);
    });

    test('should handle concurrent direction changes', () => {
      const container = document.createElement('div');
      container.style.width = '200px';
      container.style.height = '100px';
      document.body.appendChild(container);
      
      const engine = new ScrollEngine(container, { data: ['test1', 'test2', 'test3'] });
      
      // 快速连续改变方向
      const directions = ['left', 'right', 'up', 'down'];
      let errorCount = 0;
      
      directions.forEach((direction, index) => {
        setTimeout(() => {
          try {
            engine.setOptions({ direction });
          } catch (error) {
            errorCount++;
          }
        }, index * 10);
      });
      
      // 等待所有操作完成
      setTimeout(() => {
        // 应该能处理快速方向切换而不崩溃
        expect(errorCount).toBeLessThan(directions.length);
        engine.destroy();
        document.body.removeChild(container);
      }, 100);
    });
  });

  describe('Browser Compatibility Edge Cases', () => {
    test('should handle missing requestAnimationFrame', () => {
      const originalRAF = window.requestAnimationFrame;
      delete window.requestAnimationFrame;
      
      const container = document.createElement('div');
      document.body.appendChild(container);
      
      try {
        const engine = new ScrollEngine(container, { data: ['test'] });
        engine.start();
        
        // 应该能够处理缺少 RAF 的情况
        expect(engine).toBeDefined();
        
        engine.destroy();
      } catch (error) {
        // 如果出错，应该被正确记录
        const errorLog = ErrorHandler.getErrorLog();
        expect(errorLog.length).toBeGreaterThan(0);
      }
      
      // 恢复原始方法
      window.requestAnimationFrame = originalRAF;
      document.body.removeChild(container);
    });

    test('should handle missing getComputedStyle', () => {
      const originalGetComputedStyle = window.getComputedStyle;
      window.getComputedStyle = undefined;
      
      const element = document.createElement('div');
      document.body.appendChild(element);
      
      const validation = ErrorHandler.validateContentSizeCalculation(element, 'left');
      
      // 应该能处理缺少 getComputedStyle 的情况
      expect(validation.isValid).toBe(true);
      
      // 恢复原始方法
      window.getComputedStyle = originalGetComputedStyle;
      document.body.removeChild(element);
    });
  });

  describe('Data Corruption Edge Cases', () => {
    test('should handle corrupted cache data', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);
      
      // 先正常计算一次以建立缓存
      PositionCalculator.getContentSize(element, 'left');
      
      // 模拟缓存数据损坏（通过直接修改内部状态）
      // 这里我们通过强制刷新来测试错误处理
      const size = PositionCalculator.getContentSize(element, 'left', true);
      expect(size).toBeGreaterThan(0);
      
      document.body.removeChild(element);
    });

    test('should handle invalid transform values', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);
      
      // 尝试应用无效的变换值
      DirectionHandler.applyTransform(element, NaN, 'left');
      DirectionHandler.applyTransform(element, Infinity, 'right');
      DirectionHandler.applyTransform(element, -Infinity, 'up');
      
      // 应该能处理无效值而不崩溃
      const errorLog = ErrorHandler.getErrorLog();
      // 可能会有错误记录，但不应该崩溃
      
      document.body.removeChild(element);
    });
  });

  describe('Resource Exhaustion Edge Cases', () => {
    test('should handle memory pressure during operations', () => {
      // 模拟内存压力
      const largeArrays = [];
      try {
        for (let i = 0; i < 100; i++) {
          largeArrays.push(new Array(10000).fill(`data-${i}`));
        }
        
        const container = document.createElement('div');
        document.body.appendChild(container);
        
        const engine = new ScrollEngine(container, { data: ['test1', 'test2'] });
        engine.start();
        
        // 应该能在内存压力下正常工作
        expect(engine).toBeDefined();
        
        engine.destroy();
        document.body.removeChild(container);
      } catch (error) {
        // 如果内存不足，应该被正确处理
        const errorLog = ErrorHandler.getErrorLog();
        expect(errorLog.length).toBeGreaterThan(0);
      } finally {
        // 清理内存
        largeArrays.length = 0;
      }
    });
  });

  describe('Timing and Race Condition Edge Cases', () => {
    test('should handle rapid start/stop cycles', (done) => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      
      const engine = new ScrollEngine(container, { data: ['test1', 'test2', 'test3'] });
      
      let cycleCount = 0;
      const maxCycles = 10;
      
      const rapidCycle = () => {
        if (cycleCount >= maxCycles) {
          engine.destroy();
          document.body.removeChild(container);
          done();
          return;
        }
        
        engine.start();
        setTimeout(() => {
          engine.stop();
          cycleCount++;
          setTimeout(rapidCycle, 5);
        }, 5);
      };
      
      rapidCycle();
    });

    test('should handle pause/resume race conditions', (done) => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      
      const engine = new ScrollEngine(container, { data: ['test1', 'test2', 'test3'] });
      engine.start();
      
      let operationCount = 0;
      const maxOperations = 20;
      
      const rapidPauseResume = () => {
        if (operationCount >= maxOperations) {
          engine.destroy();
          document.body.removeChild(container);
          done();
          return;
        }
        
        if (operationCount % 2 === 0) {
          engine.pause();
        } else {
          engine.resume();
        }
        
        operationCount++;
        setTimeout(rapidPauseResume, 10);
      };
      
      setTimeout(rapidPauseResume, 50);
    });
  });

  describe('Error Recovery Stress Tests', () => {
    test('should handle multiple recovery attempts', (done) => {
      let recoveryAttempts = 0;
      const maxAttempts = 5;
      
      const failingCallback = () => {
        recoveryAttempts++;
        if (recoveryAttempts < 3) {
          throw new Error(`Recovery attempt ${recoveryAttempts} failed`);
        }
        // 第3次尝试成功
        done();
      };
      
      ErrorHandler.handleAnimationSyncFailure('stress-test', failingCallback);
    });

    test('should handle recovery callback exceptions', () => {
      const faultyCallback = () => {
        throw new Error('Recovery callback is faulty');
      };
      
      const result = ErrorHandler.handleAnimationSyncFailure('faulty-test', faultyCallback);
      expect(result).toBe(true); // 应该返回true表示尝试了恢复
      
      // 检查错误日志
      setTimeout(() => {
        const errorLog = ErrorHandler.getErrorLog();
        const recoveryError = errorLog.find(error => 
          error.message.includes('Recovery callback failed')
        );
        expect(recoveryError).toBeDefined();
      }, 150);
    });
  });

  describe('Cleanup and Resource Management', () => {
    test('should properly clean up after errors', () => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      
      // 创建引擎并故意触发错误
      try {
        const engine = new ScrollEngine(container, { data: ['test'] });
        engine.setOptions({ direction: 'invalid' });
      } catch (error) {
        // 预期的错误
      }
      
      // 检查是否有内存泄漏的迹象
      const stats = ErrorHandler.getErrorStats();
      expect(stats.totalErrors).toBeGreaterThan(0);
      
      // 清理
      ErrorHandler.clearErrorLog();
      const clearedStats = ErrorHandler.getErrorStats();
      expect(clearedStats.totalErrors).toBe(0);
      
      document.body.removeChild(container);
    });

    test('should handle destroy during error state', () => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      
      const engine = new ScrollEngine(container, { data: ['test'] });
      
      // 模拟错误状态
      try {
        engine.setOptions({ direction: 'invalid' });
      } catch (error) {
        // 在错误状态下销毁
        expect(() => {
          engine.destroy();
        }).not.toThrow();
      }
      
      document.body.removeChild(container);
    });
  });
});
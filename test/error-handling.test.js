/**
 * 错误处理和验证测试套件
 * 测试 ErrorHandler 类的各种错误场景和恢复机制
 */

import { describe, it, expect, beforeEach, afterEach, test, vi } from 'vitest';
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

describe('ErrorHandler', () => {
  beforeEach(() => {
    // 清理错误日志
    ErrorHandler.clearErrorLog();
  });

  describe('Direction Validation', () => {
    test('should validate correct directions', () => {
      const validDirections = ['up', 'down', 'left', 'right'];
      
      validDirections.forEach(direction => {
        const result = ErrorHandler.validateDirection(direction);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    test('should reject invalid direction types', () => {
      const invalidDirections = [null, undefined, 123, {}, [], true];
      
      invalidDirections.forEach(direction => {
        const result = ErrorHandler.validateDirection(direction);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].code).toBe(ScrollDirectionError.INVALID_DIRECTION);
      });
    });

    test('should reject invalid direction values', () => {
      const invalidDirections = ['top', 'bottom', 'center', 'diagonal', ''];
      
      invalidDirections.forEach(direction => {
        const result = ErrorHandler.validateDirection(direction);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].code).toBe(ScrollDirectionError.INVALID_DIRECTION);
      });
    });

    test('should provide warnings for vertical directions', () => {
      const verticalDirections = ['up', 'down'];
      
      verticalDirections.forEach(direction => {
        const result = ErrorHandler.validateDirection(direction);
        expect(result.isValid).toBe(true);
        expect(result.warnings.length).toBeGreaterThan(0);
        expect(result.warnings[0]).toContain('performance implications');
      });
    });
  });

  describe('Content Size Calculation Validation', () => {
    let testElement;

    beforeEach(() => {
      testElement = document.createElement('div');
      testElement.textContent = 'Test content';
      document.body.appendChild(testElement);
    });

    afterEach(() => {
      if (testElement && testElement.parentNode) {
        testElement.parentNode.removeChild(testElement);
      }
    });

    test('should validate valid element and direction', () => {
      const result = ErrorHandler.validateContentSizeCalculation(testElement, 'left');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject null element', () => {
      const result = ErrorHandler.validateContentSizeCalculation(null, 'left');
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe(ScrollDirectionError.ELEMENT_NOT_ACCESSIBLE);
    });

    test('should reject element not in DOM', () => {
      const detachedElement = document.createElement('div');
      const result = ErrorHandler.validateContentSizeCalculation(detachedElement, 'left');
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe(ScrollDirectionError.ELEMENT_NOT_ACCESSIBLE);
    });

    test('should warn about hidden elements', () => {
      testElement.style.display = 'none';
      const result = ErrorHandler.validateContentSizeCalculation(testElement, 'left');
      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('display: none');
    });

    test('should warn about empty elements', () => {
      const emptyElement = document.createElement('div');
      document.body.appendChild(emptyElement);
      
      const result = ErrorHandler.validateContentSizeCalculation(emptyElement, 'left');
      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('empty');
      
      document.body.removeChild(emptyElement);
    });
  });

  describe('Content Size Calculation Failure Handling', () => {
    test('should return default values for different directions', () => {
      const error = new Error('Test calculation failure');
      
      const leftSize = ErrorHandler.handleContentSizeCalculationFailure(null, 'left', error);
      const rightSize = ErrorHandler.handleContentSizeCalculationFailure(null, 'right', error);
      const upSize = ErrorHandler.handleContentSizeCalculationFailure(null, 'up', error);
      const downSize = ErrorHandler.handleContentSizeCalculationFailure(null, 'down', error);
      
      expect(leftSize).toBe(200);
      expect(rightSize).toBe(200);
      expect(upSize).toBe(100);
      expect(downSize).toBe(100);
    });

    test('should log error when calculation fails', () => {
      const error = new Error('Test calculation failure');
      ErrorHandler.handleContentSizeCalculationFailure(null, 'left', error);
      
      const errorLog = ErrorHandler.getErrorLog();
      expect(errorLog).toHaveLength(1);
      expect(errorLog[0].code).toBe(ScrollDirectionError.CONTENT_SIZE_CALCULATION_FAILED);
    });
  });

  describe('Animation Sync Validation', () => {
    test('should validate running animation with valid ID', () => {
      const result = ErrorHandler.validateAnimationSync('test-animation-123', 'running');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should validate stopped animation with null ID', () => {
      const result = ErrorHandler.validateAnimationSync(null, 'stopped');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject running animation with null ID', () => {
      const result = ErrorHandler.validateAnimationSync(null, 'running');
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe(ScrollDirectionError.ANIMATION_SYNC_FAILED);
    });

    test('should reject paused animation with null ID', () => {
      const result = ErrorHandler.validateAnimationSync(null, 'paused');
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe(ScrollDirectionError.ANIMATION_SYNC_FAILED);
    });
  });

  describe('Animation Sync Failure Recovery', () => {
    test('should attempt recovery with callback', (done) => {
      let callbackExecuted = false;
      const recoverCallback = () => {
        callbackExecuted = true;
        done();
      };

      const result = ErrorHandler.handleAnimationSyncFailure('test-animation', recoverCallback);
      expect(result).toBe(true);
      
      // 等待回调执行
      setTimeout(() => {
        if (!callbackExecuted) {
          done(new Error('Recovery callback was not executed'));
        }
      }, 200);
    });

    test('should limit recovery attempts', () => {
      const recoverCallback = vi.fn(() => {
        throw new Error('Recovery failed');
      });

      // 尝试超过最大次数
      for (let i = 0; i < 5; i++) {
        ErrorHandler.handleAnimationSyncFailure('test-animation-limit', recoverCallback);
      }

      // 检查错误日志中是否有达到最大尝试次数的错误
      const errorLog = ErrorHandler.getErrorLog();
      const maxAttemptsError = errorLog.find(error => 
        error.message.includes('recovery failed after') && 
        error.message.includes('attempts')
      );
      expect(maxAttemptsError).toBeDefined();
    });
  });

  describe('Container Validation', () => {
    let testContainer;

    beforeEach(() => {
      testContainer = document.createElement('div');
      testContainer.style.width = '200px';
      testContainer.style.height = '100px';
      document.body.appendChild(testContainer);
    });

    afterEach(() => {
      if (testContainer && testContainer.parentNode) {
        testContainer.parentNode.removeChild(testContainer);
      }
    });

    test('should validate valid container', () => {
      const result = ErrorHandler.validateContainer(testContainer);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject null container', () => {
      const result = ErrorHandler.validateContainer(null);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe(ScrollDirectionError.CONTAINER_NOT_FOUND);
    });

    test('should reject container not in DOM', () => {
      const detachedContainer = document.createElement('div');
      const result = ErrorHandler.validateContainer(detachedContainer);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe(ScrollDirectionError.CONTAINER_NOT_FOUND);
    });

    test('should warn about zero-sized container', () => {
      testContainer.style.width = '0px';
      testContainer.style.height = '0px';
      
      const result = ErrorHandler.validateContainer(testContainer);
      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('zero width or height');
    });
  });

  describe('Recovery Strategies', () => {
    test('should provide appropriate recovery strategy for each error type', () => {
      const errorTypes = [
        ScrollDirectionError.INVALID_DIRECTION,
        ScrollDirectionError.CONTENT_SIZE_CALCULATION_FAILED,
        ScrollDirectionError.ANIMATION_SYNC_FAILED,
        ScrollDirectionError.DIRECTION_CHANGE_FAILED,
        ScrollDirectionError.TRANSFORM_APPLICATION_FAILED,
        ScrollDirectionError.POSITION_VALIDATION_FAILED,
        ScrollDirectionError.CONTAINER_NOT_FOUND,
        ScrollDirectionError.ELEMENT_NOT_ACCESSIBLE
      ];

      errorTypes.forEach(errorType => {
        const strategy = ErrorHandler.getRecoveryStrategy(errorType);
        expect(strategy).toHaveProperty('canRecover');
        expect(strategy).toHaveProperty('strategy');
        expect(strategy).toHaveProperty('maxAttempts');
        expect(strategy).toHaveProperty('delay');
        expect(typeof strategy.canRecover).toBe('boolean');
        expect(['reset', 'retry', 'fallback', 'ignore']).toContain(strategy.strategy);
      });
    });
  });

  describe('Error Logging', () => {
    test('should log errors correctly', () => {
      const errorDetails = {
        code: ScrollDirectionError.INVALID_DIRECTION,
        message: 'Test error message',
        context: { test: 'context' },
        timestamp: Date.now(),
        recoverable: true
      };

      ErrorHandler.logError(errorDetails);
      
      const errorLog = ErrorHandler.getErrorLog();
      expect(errorLog).toHaveLength(1);
      expect(errorLog[0]).toEqual(errorDetails);
    });

    test('should maintain error log size limit', () => {
      // 添加超过限制的错误
      for (let i = 0; i < 120; i++) {
        ErrorHandler.logError({
          code: ScrollDirectionError.INVALID_DIRECTION,
          message: `Test error ${i}`,
          timestamp: Date.now(),
          recoverable: true
        });
      }

      const errorLog = ErrorHandler.getErrorLog(200); // 请求所有错误
      expect(errorLog.length).toBeLessThanOrEqual(100); // 应该被限制在100个以内
    });

    test('should provide error statistics', () => {
      // 添加不同类型的错误
      ErrorHandler.logError({
        code: ScrollDirectionError.INVALID_DIRECTION,
        message: 'Direction error 1',
        timestamp: Date.now(),
        recoverable: true
      });

      ErrorHandler.logError({
        code: ScrollDirectionError.INVALID_DIRECTION,
        message: 'Direction error 2',
        timestamp: Date.now(),
        recoverable: true
      });

      ErrorHandler.logError({
        code: ScrollDirectionError.ANIMATION_SYNC_FAILED,
        message: 'Animation error',
        timestamp: Date.now(),
        recoverable: false
      });

      const stats = ErrorHandler.getErrorStats();
      expect(stats.totalErrors).toBe(3);
      expect(stats.errorsByType[ScrollDirectionError.INVALID_DIRECTION]).toBe(2);
      expect(stats.errorsByType[ScrollDirectionError.ANIMATION_SYNC_FAILED]).toBe(1);
      expect(stats.recoverableErrors).toBe(2);
    });
  });

  describe('Safe Execution', () => {
    test('should execute function successfully', () => {
      const testFunction = () => 'success';
      const result = ErrorHandler.safeExecute(
        testFunction,
        ScrollDirectionError.ANIMATION_SYNC_FAILED,
        { test: 'context' }
      );
      expect(result).toBe('success');
    });

    test('should handle function errors and return fallback', () => {
      const testFunction = () => {
        throw new Error('Test error');
      };
      const result = ErrorHandler.safeExecute(
        testFunction,
        ScrollDirectionError.ANIMATION_SYNC_FAILED,
        { test: 'context' },
        'fallback'
      );
      expect(result).toBe('fallback');
      
      // 检查错误是否被记录
      const errorLog = ErrorHandler.getErrorLog();
      expect(errorLog.length).toBeGreaterThan(0);
    });

    test('should return undefined when no fallback provided', () => {
      const testFunction = () => {
        throw new Error('Test error');
      };
      const result = ErrorHandler.safeExecute(
        testFunction,
        ScrollDirectionError.ANIMATION_SYNC_FAILED
      );
      expect(result).toBeUndefined();
    });
  });
});

describe('Integration with DirectionHandler', () => {
  test('should handle invalid direction in getDirectionConfig', () => {
    expect(() => {
      DirectionHandler.getDirectionConfig('invalid');
    }).toThrow();
    
    const errorLog = ErrorHandler.getErrorLog();
    expect(errorLog.length).toBeGreaterThan(0);
    expect(errorLog[0].code).toBe(ScrollDirectionError.INVALID_DIRECTION);
  });

  test('should handle element validation in applyTransform', () => {
    // 测试空元素
    DirectionHandler.applyTransform(null, 100, 'left');
    
    const errorLog = ErrorHandler.getErrorLog();
    expect(errorLog.length).toBeGreaterThan(0);
    expect(errorLog[0].code).toBe(ScrollDirectionError.ELEMENT_NOT_ACCESSIBLE);
  });
});

describe('Integration with PositionCalculator', () => {
  test('should handle content size calculation errors', () => {
    // 测试空元素
    const size = PositionCalculator.getContentSize(null, 'left');
    expect(size).toBeGreaterThan(0); // 应该返回默认值
    
    const errorLog = ErrorHandler.getErrorLog();
    expect(errorLog.length).toBeGreaterThan(0);
    expect(errorLog[0].code).toBe(ScrollDirectionError.ELEMENT_NOT_ACCESSIBLE);
  });
});

describe('Integration with ScrollEngine', () => {
  test('should handle invalid container in constructor', () => {
    expect(() => {
      new ScrollEngine(null, { data: ['test'] });
    }).toThrow();
    
    const errorLog = ErrorHandler.getErrorLog();
    expect(errorLog.length).toBeGreaterThan(0);
    expect(errorLog[0].code).toBe(ScrollDirectionError.CONTAINER_NOT_FOUND);
  });

  test('should handle invalid direction in constructor', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    
    expect(() => {
      new ScrollEngine(container, { data: ['test'], direction: 'invalid' });
    }).toThrow();
    
    const errorLog = ErrorHandler.getErrorLog();
    expect(errorLog.length).toBeGreaterThan(0);
    expect(errorLog[0].code).toBe(ScrollDirectionError.INVALID_DIRECTION);
    
    document.body.removeChild(container);
  });

  test('should handle invalid data in constructor', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    
    expect(() => {
      new ScrollEngine(container, { data: [] });
    }).toThrow();
    
    const errorLog = ErrorHandler.getErrorLog();
    expect(errorLog.length).toBeGreaterThan(0);
    expect(errorLog[0].code).toBe(ScrollDirectionError.INVALID_DATA);
    
    document.body.removeChild(container);
  });

  test('should handle errors in setOptions', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    
    const engine = new ScrollEngine(container, { data: ['test'] });
    
    expect(() => {
      engine.setOptions({ direction: 'invalid' });
    }).toThrow();
    
    const errorLog = ErrorHandler.getErrorLog();
    expect(errorLog.length).toBeGreaterThan(0);
    expect(errorLog[0].code).toBe(ScrollDirectionError.INVALID_DIRECTION);
    
    engine.destroy();
    document.body.removeChild(container);
  });
});
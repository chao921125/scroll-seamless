import { describe, it, expect, beforeEach } from 'vitest';
import { PositionCalculator } from '../src/core/utils/PositionCalculator.ts';

describe('位置验证修复测试', () => {
  describe('validatePositionCalculation 修复', () => {
    it('应该允许 down 方向的小数位置值', () => {
      const result = PositionCalculator.validatePositionCalculation(
        0.5,    // 之前会失败的位置值
        100,    // contentSize
        50,     // containerSize
        'down'  // direction
      );
      
      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('应该允许 right 方向的小数位置值', () => {
      const result = PositionCalculator.validatePositionCalculation(
        1.5,     // 小数位置值
        200,     // contentSize
        100,     // containerSize
        'right'  // direction
      );
      
      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('应该允许 down 方向的正值位置', () => {
      const result = PositionCalculator.validatePositionCalculation(
        50,      // 正值位置
        100,     // contentSize
        50,      // containerSize
        'down'   // direction
      );
      
      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('应该允许 right 方向的正值位置', () => {
      const result = PositionCalculator.validatePositionCalculation(
        75,      // 正值位置
        150,     // contentSize
        100,     // containerSize
        'right'  // direction
      );
      
      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('应该允许合理范围内的位置值', () => {
      const contentSize = 100;
      const maxAllowedRange = contentSize * 3; // 300
      
      // 测试边界值
      const testCases = [
        { position: -299, direction: 'down', shouldPass: true },
        { position: 299, direction: 'down', shouldPass: true },
        { position: -301, direction: 'down', shouldPass: false },
        { position: 301, direction: 'down', shouldPass: false },
        { position: -299, direction: 'right', shouldPass: true },
        { position: 299, direction: 'right', shouldPass: true },
        { position: -301, direction: 'right', shouldPass: false },
        { position: 301, direction: 'right', shouldPass: false },
      ];

      testCases.forEach(({ position, direction, shouldPass }) => {
        const result = PositionCalculator.validatePositionCalculation(
          position,
          contentSize,
          50,
          direction
        );
        
        if (shouldPass) {
          expect(result.isValid).toBe(true);
          expect(result.issues).toHaveLength(0);
        } else {
          expect(result.isValid).toBe(false);
          expect(result.issues.length).toBeGreaterThan(0);
        }
      });
    });

    it('应该为 up 和 left 方向使用相同的宽松验证', () => {
      const testCases = [
        { position: 0.5, direction: 'up' },
        { position: 1.5, direction: 'left' },
        { position: 50, direction: 'up' },
        { position: 75, direction: 'left' },
      ];

      testCases.forEach(({ position, direction }) => {
        const result = PositionCalculator.validatePositionCalculation(
          position,
          100,
          50,
          direction
        );
        
        expect(result.isValid).toBe(true);
        expect(result.issues).toHaveLength(0);
      });
    });

    it('应该正确处理无效的内容尺寸', () => {
      const result = PositionCalculator.validatePositionCalculation(
        50,
        0,      // 无效的内容尺寸
        50,
        'down'
      );
      
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Content size must be greater than 0');
    });

    it('应该正确处理无效的容器尺寸', () => {
      const result = PositionCalculator.validatePositionCalculation(
        50,
        100,
        0,      // 无效的容器尺寸
        'down'
      );
      
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Container size must be greater than 0');
    });

    it('应该正确处理无效的方向', () => {
      const result = PositionCalculator.validatePositionCalculation(
        50,
        100,
        50,
        'invalid' // 无效的方向
      );
      
      expect(result.isValid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it('应该提供更详细的错误信息', () => {
      const contentSize = 100;
      const maxAllowedRange = contentSize * 3;
      const position = 400; // 超出范围
      
      const result = PositionCalculator.validatePositionCalculation(
        position,
        contentSize,
        50,
        'down'
      );
      
      expect(result.isValid).toBe(false);
      expect(result.issues[0]).toContain(`Position ${position} is out of valid range for down direction`);
      expect(result.issues[0]).toContain(`allowed: ${-maxAllowedRange} to ${maxAllowedRange}`);
    });
  });

  describe('修复前后对比', () => {
    it('修复前会失败的案例现在应该通过', () => {
      // 这些是修复前会失败的典型案例
      const problematicCases = [
        { position: 0.5, direction: 'down' },
        { position: 1.0, direction: 'down' },
        { position: 0.1, direction: 'right' },
        { position: 2.5, direction: 'right' },
      ];

      problematicCases.forEach(({ position, direction }) => {
        const result = PositionCalculator.validatePositionCalculation(
          position,
          100,
          50,
          direction
        );
        
        expect(result.isValid).toBe(true);
        expect(result.issues).toHaveLength(0);
      });
    });

    it('应该保持对真正无效位置的检测', () => {
      const contentSize = 100;
      const maxAllowedRange = contentSize * 3;
      
      const invalidCases = [
        { position: maxAllowedRange + 1, direction: 'down' },
        { position: -(maxAllowedRange + 1), direction: 'down' },
        { position: maxAllowedRange + 1, direction: 'right' },
        { position: -(maxAllowedRange + 1), direction: 'right' },
      ];

      invalidCases.forEach(({ position, direction }) => {
        const result = PositionCalculator.validatePositionCalculation(
          position,
          contentSize,
          50,
          direction
        );
        
        expect(result.isValid).toBe(false);
        expect(result.issues.length).toBeGreaterThan(0);
      });
    });
  });

  describe('性能测试', () => {
    it('验证函数应该快速执行', () => {
      const startTime = performance.now();
      
      // 执行多次验证
      for (let i = 0; i < 1000; i++) {
        PositionCalculator.validatePositionCalculation(
          Math.random() * 200 - 100, // -100 到 100 的随机位置
          100,
          50,
          i % 2 === 0 ? 'down' : 'right'
        );
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // 1000次验证应该在100ms内完成
      expect(duration).toBeLessThan(100);
    });
  });
});
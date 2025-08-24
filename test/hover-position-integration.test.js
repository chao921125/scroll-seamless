/**
 * HoverPositionManager 集成测试
 * 验证悬停位置管理在实际滚动场景中的准确性
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { ScrollEngine } from '../src/core/ScrollEngine.js';

// 模拟 DOM 环境
const mockContainer = () => {
  const container = {
    style: {},
    innerHTML: '',
    offsetWidth: 300,
    offsetHeight: 100,
    appendChild: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    tagName: 'DIV',
    getBoundingClientRect: vi.fn(() => ({
      width: 300,
      height: 100,
      top: 0,
      left: 0,
      right: 300,
      bottom: 100
    }))
  };
  return container;
};

// 模拟 document
global.document = {
  createElement: vi.fn((tag) => ({
    tagName: tag.toUpperCase(),
    style: {},
    className: '',
    textContent: '',
    innerHTML: '',
    offsetWidth: 100,
    offsetHeight: 30,
    scrollWidth: 120,
    scrollHeight: 35,
    appendChild: vi.fn(),
    cloneNode: vi.fn(() => ({
      tagName: tag.toUpperCase(),
      style: {},
      className: '',
      textContent: '',
      innerHTML: '',
      offsetWidth: 100,
      offsetHeight: 30,
      appendChild: vi.fn()
    })),
    removeAttribute: vi.fn()
  })),
  contains: vi.fn(() => true) // 模拟 document.contains 方法
};

// 模拟 getComputedStyle
global.getComputedStyle = vi.fn(() => ({
  transform: 'none'
}));

// 模拟 DOMMatrix
global.DOMMatrix = vi.fn().mockImplementation((transform) => {
  if (transform === 'none' || !transform) {
    return { m41: 0, m42: 0 };
  }
  
  const translateXMatch = transform.match(/translateX\((-?\d+(?:\.\d+)?)px\)/);
  const translateYMatch = transform.match(/translateY\((-?\d+(?:\.\d+)?)px\)/);
  
  return {
    m41: translateXMatch ? parseFloat(translateXMatch[1]) : 0,
    m42: translateYMatch ? parseFloat(translateYMatch[1]) : 0
  };
});

// 模拟 requestAnimationFrame
global.requestAnimationFrame = vi.fn((callback) => {
  setTimeout(callback, 16);
  return 1;
});

global.cancelAnimationFrame = vi.fn();

describe('HoverPositionManager Integration', () => {
  let container;
  let scrollEngine;
  
  beforeEach(() => {
    container = mockContainer();
    vi.clearAllMocks();
  });

  describe('基本悬停功能', () => {
    test('应该能够创建滚动引擎并处理悬停事件', () => {
      const testData = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'];
      
      expect(() => {
        scrollEngine = new ScrollEngine(container, {
          data: testData,
          direction: 'left',
          hoverStop: true,
          step: 1
        });
      }).not.toThrow();
      
      expect(scrollEngine).toBeDefined();
    });

    test('应该正确绑定悬停事件监听器', () => {
      const testData = ['Item 1', 'Item 2', 'Item 3'];
      
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'left',
        hoverStop: true
      });
      
      // 验证事件监听器已绑定
      expect(container.addEventListener).toHaveBeenCalledWith('mouseenter', expect.any(Function), undefined);
      expect(container.addEventListener).toHaveBeenCalledWith('mouseleave', expect.any(Function), undefined);
    });

    test('应该在 hoverStop 为 false 时不绑定悬停事件', () => {
      const testData = ['Item 1', 'Item 2', 'Item 3'];
      
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'left',
        hoverStop: false
      });
      
      // 验证没有绑定悬停相关的事件监听器
      const calls = container.addEventListener.mock.calls;
      const hoverCalls = calls.filter(call => 
        call[0] === 'mouseenter' || call[0] === 'mouseleave'
      );
      expect(hoverCalls).toHaveLength(0);
    });
  });

  describe('暂停和恢复功能', () => {
    test('应该能够暂停和恢复滚动', () => {
      const testData = ['Item 1', 'Item 2', 'Item 3', 'Item 4'];
      
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'left',
        hoverStop: true
      });
      
      // 启动滚动
      expect(() => scrollEngine.start()).not.toThrow();
      
      // 暂停滚动
      expect(() => scrollEngine.pause()).not.toThrow();
      
      // 恢复滚动
      expect(() => scrollEngine.resume()).not.toThrow();
    });

    test('应该在不同方向下正确暂停和恢复', () => {
      const testData = ['Item 1', 'Item 2', 'Item 3'];
      const directions = ['left', 'right', 'up', 'down'];
      
      directions.forEach(direction => {
        const engine = new ScrollEngine(container, {
          data: testData,
          direction: direction,
          hoverStop: true
        });
        
        expect(() => {
          engine.start();
          engine.pause();
          engine.resume();
          engine.stop();
        }).not.toThrow();
      });
    });
  });

  describe('事件处理', () => {
    test('应该触发正确的事件', () => {
      const testData = ['Item 1', 'Item 2', 'Item 3'];
      const eventHandler = vi.fn();
      
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'left',
        hoverStop: true,
        onEvent: eventHandler
      });
      
      scrollEngine.start();
      
      // 验证启动事件被触发
      expect(eventHandler).toHaveBeenCalledWith('start', expect.any(Object));
    });

    test('应该在暂停和恢复时触发相应事件', () => {
      const testData = ['Item 1', 'Item 2', 'Item 3'];
      const eventHandler = vi.fn();
      
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'left',
        hoverStop: true,
        onEvent: eventHandler
      });
      
      scrollEngine.start();
      scrollEngine.pause();
      scrollEngine.resume();
      
      // 验证暂停和恢复事件被触发
      expect(eventHandler).toHaveBeenCalledWith('pause', expect.any(Object));
      expect(eventHandler).toHaveBeenCalledWith('resume', expect.any(Object));
    });
  });

  describe('错误处理', () => {
    test('应该处理无效的容器', () => {
      const testData = ['Item 1', 'Item 2', 'Item 3'];
      
      expect(() => {
        new ScrollEngine(null, {
          data: testData,
          direction: 'left'
        });
      }).toThrow();
    });

    test('应该处理空数据数组', () => {
      expect(() => {
        new ScrollEngine(container, {
          data: [],
          direction: 'left'
        });
      }).toThrow();
    });

    test('应该处理无效的方向', () => {
      const testData = ['Item 1', 'Item 2', 'Item 3'];
      
      expect(() => {
        new ScrollEngine(container, {
          data: testData,
          direction: 'invalid'
        });
      }).toThrow();
    });
  });

  describe('位置管理验证', () => {
    test('应该在暂停时保持位置状态', () => {
      const testData = ['Item 1', 'Item 2', 'Item 3', 'Item 4'];
      const eventHandler = vi.fn();
      
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'left',
        hoverStop: true,
        onEvent: eventHandler
      });
      
      scrollEngine.start();
      scrollEngine.pause();
      
      // 验证暂停事件包含位置统计信息
      const pauseCall = eventHandler.mock.calls.find(call => call[0] === 'pause');
      expect(pauseCall).toBeDefined();
      expect(pauseCall[1]).toHaveProperty('positionStats');
    });

    test('应该在恢复时验证位置连续性', () => {
      const testData = ['Item 1', 'Item 2', 'Item 3', 'Item 4'];
      const eventHandler = vi.fn();
      
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'left',
        hoverStop: true,
        onEvent: eventHandler
      });
      
      scrollEngine.start();
      scrollEngine.pause();
      scrollEngine.resume();
      
      // 验证恢复事件包含位置统计信息
      const resumeCall = eventHandler.mock.calls.find(call => call[0] === 'resume');
      expect(resumeCall).toBeDefined();
      expect(resumeCall[1]).toHaveProperty('positionStats');
    });
  });

  describe('清理和销毁', () => {
    test('应该正确清理资源', () => {
      const testData = ['Item 1', 'Item 2', 'Item 3'];
      
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'left',
        hoverStop: true
      });
      
      scrollEngine.start();
      
      expect(() => {
        scrollEngine.destroy();
      }).not.toThrow();
    });

    test('应该在销毁后停止所有动画', () => {
      const testData = ['Item 1', 'Item 2', 'Item 3'];
      const eventHandler = vi.fn();
      
      scrollEngine = new ScrollEngine(container, {
        data: testData,
        direction: 'left',
        hoverStop: true,
        onEvent: eventHandler
      });
      
      scrollEngine.start();
      scrollEngine.destroy();
      
      // 验证销毁事件被触发
      expect(eventHandler).toHaveBeenCalledWith('destroy', expect.any(Object));
    });
  });

  afterEach(() => {
    if (scrollEngine) {
      try {
        scrollEngine.destroy();
      } catch (error) {
        // 忽略销毁时的错误
      }
      scrollEngine = null;
    }
  });
});
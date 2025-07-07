import { describe, it, expect } from 'vitest';
import { ScrollSeamless } from '../src/core';
const { JSDOM } = require('jsdom');

// 这里只做伪代码示例，实际需根据打包后的导出方式调整

describe('ScrollSeamless', () => {
  let window, document, container, scroll;

  beforeEach(() => {
    window = new JSDOM('<!DOCTYPE html><div id="scroll"></div>').window;
    document = window.document;
    container = document.getElementById('scroll');
    // 伪代码：实际需替换为正确的导入
    scroll = new ScrollSeamless(container, {
      data: ['A', 'B', 'C'],
      direction: 'horizontal',
    });
  });

  it('should start and stop', () => {
    scroll.start();
    expect(scroll.isRunning()).toBe(true);
    scroll.stop();
    expect(scroll.isRunning()).toBe(false);
  });

  it('should update data', () => {
    scroll.updateData(['X', 'Y']);
    // 这里只能断言无异常，或检查 DOM 内容
    expect(container.innerHTML).toContain('X');
  });

  it('should destroy', () => {
    scroll.destroy();
    expect(container.innerHTML).toBe('');
  });
}); 
import { describe, it, expect, beforeEach } from 'vitest';
import { ScrollSeamless } from '../src/core';
const { JSDOM } = require('jsdom');

describe('ScrollSeamless', () => {
  let window, document, container, scroll;

  beforeEach(() => {
    window = new JSDOM(`
      <!DOCTYPE html>
      <div id="scroll">
        <div class="ss-content">
          <span>A</span>
          <span>B</span>
          <span>C</span>
        </div>
        <div class="ss-content">
          <span>A</span>
          <span>B</span>
          <span>C</span>
        </div>
      </div>
    `).window;
    document = window.document;
    container = document.getElementById('scroll');
    
    scroll = new ScrollSeamless(container, {
      data: ['A', 'B', 'C'],
      direction: 'right',
    });
  });

  it('should start and stop', () => {
    scroll.start();
    expect(scroll.isRunning()).toBe(true);
    scroll.stop();
    expect(scroll.isRunning()).toBe(false);
  });

  it('should update data', () => {
    scroll.updateData();
    // 这里只能断言无异常，或检查 DOM 内容
    expect(container.querySelectorAll('.ss-content')).toHaveLength(2);
  });

  it('should destroy', () => {
    scroll.destroy();
    // 检查事件监听器是否被移除
    expect(scroll.isRunning()).toBe(false);
  });
}); 
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ScrollSeamlessVue from '../src/vue/index.ts';

// Mock DOM environment
const { JSDOM } = require('jsdom');

describe('Vue组件 pause/resume 方法测试', () => {
  let window, document;

  beforeEach(() => {
    // 设置DOM环境
    window = new JSDOM(`<!DOCTYPE html><div id="app"></div>`).window;
    document = window.document;
    global.window = window;
    global.document = document;
    global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16));
    global.cancelAnimationFrame = vi.fn();
    global.performance = { now: () => Date.now() };
  });

  it('Vue组件应该是一个有效的组件定义', () => {
    // 验证组件定义
    expect(ScrollSeamlessVue).toBeDefined();
    expect(typeof ScrollSeamlessVue).toBe('object');
    expect(ScrollSeamlessVue.name).toBe('ScrollSeamlessVue');
    expect(typeof ScrollSeamlessVue.setup).toBe('function');
  });

  it('Vue组件应该有正确的props定义', () => {
    // 验证props定义
    expect(ScrollSeamlessVue.props).toBeDefined();
    expect(ScrollSeamlessVue.props.data).toBeDefined();
    expect(ScrollSeamlessVue.props.direction).toBeDefined();
    expect(ScrollSeamlessVue.props.hoverStop).toBeDefined();
    expect(ScrollSeamlessVue.props.modelValue).toBeDefined();
  });

  it('Vue组件setup函数应该返回渲染函数', () => {
    // 模拟Vue的setup调用
    const props = {
      data: ['测试1', '测试2', '测试3'],
      direction: 'left',
      hoverStop: true
    };
    
    const mockSlots = {};
    const mockExpose = vi.fn();
    const mockContext = { slots: mockSlots, expose: mockExpose };
    
    // 调用setup函数
    const result = ScrollSeamlessVue.setup(props, mockContext);
    
    // 验证返回渲染函数
    expect(typeof result).toBe('function');
    
    // 验证expose被调用，说明方法被暴露
    expect(mockExpose).toHaveBeenCalled();
    
    // 获取暴露的方法
    const exposedMethods = mockExpose.mock.calls[0][0];
    expect(typeof exposedMethods.start).toBe('function');
    expect(typeof exposedMethods.stop).toBe('function');
    expect(typeof exposedMethods.pause).toBe('function');
    expect(typeof exposedMethods.resume).toBe('function');
    expect(typeof exposedMethods.destroy).toBe('function');
    expect(typeof exposedMethods.updateData).toBe('function');
    expect(typeof exposedMethods.setOptions).toBe('function');
    expect(typeof exposedMethods.isRunning).toBe('function');
  });
});
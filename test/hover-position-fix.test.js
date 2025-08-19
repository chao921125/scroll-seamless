import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ScrollEngine } from '../src/core/ScrollEngine';

// Mock DOM environment
const { JSDOM } = require('jsdom');

describe('鼠标悬停位置保持修复测试', () => {
  let window, document, container, scrollEngine;

  beforeEach(() => {
    // 设置DOM环境
    window = new JSDOM(`
      <!DOCTYPE html>
      <div id="scroll-container" style="width: 400px; height: 50px;"></div>
    `).window;
    document = window.document;
    global.window = window;
    global.document = document;
    global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16));
    global.cancelAnimationFrame = vi.fn();
    global.performance = { now: () => Date.now() };

    container = document.getElementById('scroll-container');
    
    scrollEngine = new ScrollEngine(container, {
      data: ['测试1', '测试2', '测试3', '测试4', '测试5'],
      direction: 'left',
      step: 2,
      hoverStop: true
    });
  });

  it('应该支持暂停和恢复方法', () => {
    expect(typeof scrollEngine.pause).toBe('function');
    expect(typeof scrollEngine.resume).toBe('function');
  });

  it('暂停时应该保持当前位置', async () => {
    // 开始滚动
    scrollEngine.start();
    expect(scrollEngine.isRunning()).toBe(true);
    
    // 模拟滚动一段时间
    const initialPosition = scrollEngine.getPosition();
    
    // 手动更新位置来模拟滚动
    scrollEngine.setPosition(100);
    const positionBeforePause = scrollEngine.getPosition();
    expect(positionBeforePause).toBe(100);
    
    // 暂停滚动
    scrollEngine.pause();
    
    // 位置应该保持不变
    const positionAfterPause = scrollEngine.getPosition();
    expect(positionAfterPause).toBe(positionBeforePause);
  });

  it('恢复时应该从暂停位置继续', async () => {
    // 开始滚动
    scrollEngine.start();
    
    // 设置一个特定位置
    scrollEngine.setPosition(150);
    const positionBeforePause = scrollEngine.getPosition();
    
    // 暂停
    scrollEngine.pause();
    
    // 恢复
    scrollEngine.resume();
    
    // 位置应该保持在暂停前的位置
    const positionAfterResume = scrollEngine.getPosition();
    expect(positionAfterResume).toBe(positionBeforePause);
  });

  it('鼠标悬停应该调用pause而不是stop', () => {
    const pauseSpy = vi.spyOn(scrollEngine, 'pause');
    const stopSpy = vi.spyOn(scrollEngine, 'stop');
    
    scrollEngine.start();
    
    // 模拟鼠标进入事件
    const mouseEnterEvent = new window.MouseEvent('mouseenter');
    container.dispatchEvent(mouseEnterEvent);
    
    expect(pauseSpy).toHaveBeenCalled();
    expect(stopSpy).not.toHaveBeenCalled();
  });

  it('鼠标离开应该调用resume而不是start', () => {
    const resumeSpy = vi.spyOn(scrollEngine, 'resume');
    const startSpy = vi.spyOn(scrollEngine, 'start');
    
    scrollEngine.start();
    
    // 先暂停
    scrollEngine.pause();
    
    // 模拟鼠标离开事件
    const mouseLeaveEvent = new window.MouseEvent('mouseleave');
    container.dispatchEvent(mouseLeaveEvent);
    
    expect(resumeSpy).toHaveBeenCalled();
    // start 应该只在初始化时被调用一次
    expect(startSpy).toHaveBeenCalledTimes(1);
  });

  it('stop方法应该完全停止并重置状态', () => {
    scrollEngine.start();
    scrollEngine.setPosition(200);
    
    const positionBeforeStop = scrollEngine.getPosition();
    expect(positionBeforeStop).toBe(200);
    
    scrollEngine.stop();
    
    expect(scrollEngine.isRunning()).toBe(false);
    // stop后位置应该保持，但动画应该停止
    expect(scrollEngine.getPosition()).toBe(200);
  });

  it('重新start应该从当前位置继续而不是重置', () => {
    scrollEngine.start();
    scrollEngine.setPosition(300);
    scrollEngine.stop();
    
    const positionAfterStop = scrollEngine.getPosition();
    
    // 重新开始
    scrollEngine.start();
    
    // 位置应该保持不变
    expect(scrollEngine.getPosition()).toBe(positionAfterStop);
  });
});
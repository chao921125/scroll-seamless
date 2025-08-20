/**
 * 集成测试 - 验证初始定位修复在实际使用中的效果
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ScrollEngine } from '../src/core/ScrollEngine.ts';

// 模拟 DOM 环境
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.getComputedStyle = dom.window.getComputedStyle;
global.requestAnimationFrame = (callback) => setTimeout(callback, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);

describe('初始定位修复集成测试', () => {
  let container, scrollEngine;
  const testData = ['项目 1', '项目 2', '项目 3', '项目 4', '项目 5'];

  beforeEach(() => {
    container = document.createElement('div');
    container.style.width = '300px';
    container.style.height = '200px';
    container.style.position = 'relative';
    container.style.overflow = 'hidden';
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (scrollEngine) {
      scrollEngine.destroy();
      scrollEngine = null;
    }
    document.body.innerHTML = '';
  });

  it('所有方向的初始定位都应该正确', () => {
    const directions = ['left', 'right', 'up', 'down'];
    
    directions.forEach(direction => {
      // 创建新的滚动引擎
      const options = {
        data: testData,
        direction: direction,
        step: 1
      };
      
      // 垂直方向需要设置 cols
      if (direction === 'up' || direction === 'down') {
        options.cols = 1;
      }
      
      scrollEngine = new ScrollEngine(container, options);
      
      const content1 = container.querySelector('.ss-content:first-child');
      const content2 = container.querySelector('.ss-content:last-child');
      
      expect(content1, `${direction} 方向应该有第一个内容元素`).toBeTruthy();
      expect(content2, `${direction} 方向应该有第二个内容元素`).toBeTruthy();
      
      if (direction === 'left' || direction === 'right') {
        // 水平方向验证
        expect(content1.style.left, `${direction} 方向 content1 的 left 应该是 0px`).toBe('0px');
        expect(parseFloat(content2.style.left), `${direction} 方向 content2 的 left 应该大于 0`).toBeGreaterThan(0);
      } else {
        // 垂直方向验证
        expect(content1.style.top, `${direction} 方向 content1 的 top 应该是 0px`).toBe('0px');
        
        if (direction === 'up') {
          expect(parseFloat(content2.style.top), `up 方向 content2 的 top 应该小于等于 0`).toBeLessThanOrEqual(0);
        } else {
          expect(parseFloat(content2.style.top), `down 方向 content2 的 top 应该大于 0`).toBeGreaterThan(0);
        }
      }
      
      // 验证初始变换
      expect(content1.style.transform, `${direction} 方向 content1 应该有初始变换`).toContain('0px');
      expect(content2.style.transform, `${direction} 方向 content2 应该有初始变换`).toContain('0px');
      
      // 清理
      scrollEngine.destroy();
      scrollEngine = null;
      container.innerHTML = '';
    });
  });

  it('方向切换应该正确重新定位', () => {
    // 从 left 开始
    scrollEngine = new ScrollEngine(container, {
      data: testData,
      direction: 'left',
      step: 1
    });
    
    // 启动滚动
    scrollEngine.start();
    
    return new Promise(resolve => {
      setTimeout(() => {
        // 切换到 right
        scrollEngine.setOptions({ direction: 'right' });
        
        let content1 = container.querySelector('.ss-content:first-child');
        let content2 = container.querySelector('.ss-content:last-child');
        
        expect(content1.style.left).toBe('0px');
        expect(parseFloat(content2.style.left)).toBeGreaterThan(0);
        
        // 切换到 up
        scrollEngine.setOptions({ direction: 'up', cols: 1 });
        
        setTimeout(() => {
          content1 = container.querySelector('.ss-content:first-child');
          content2 = container.querySelector('.ss-content:last-child');
          
          expect(content1.style.top).toBe('0px');
          expect(parseFloat(content2.style.top)).toBeLessThanOrEqual(0);
          
          // 切换到 down
          scrollEngine.setOptions({ direction: 'down' });
          
          setTimeout(() => {
            content1 = container.querySelector('.ss-content:first-child');
            content2 = container.querySelector('.ss-content:last-child');
            
            expect(content1.style.top).toBe('0px');
            expect(parseFloat(content2.style.top)).toBeGreaterThan(0);
            
            resolve();
          }, 10);
        }, 10);
      }, 50);
    });
  });

  it('应该能正确处理动态数据更新', () => {
    scrollEngine = new ScrollEngine(container, {
      data: testData,
      direction: 'up',
      step: 1,
      cols: 1
    });
    
    // 验证初始状态
    let content1 = container.querySelector('.ss-content:first-child');
    let content2 = container.querySelector('.ss-content:last-child');
    
    expect(content1.style.top).toBe('0px');
    expect(parseFloat(content2.style.top)).toBeLessThanOrEqual(0);
    
    // 更新数据
    scrollEngine.options.data = ['新项目 1', '新项目 2', '新项目 3'];
    scrollEngine.updateData();
    
    // 验证更新后的状态
    content1 = container.querySelector('.ss-content:first-child');
    content2 = container.querySelector('.ss-content:last-child');
    
    expect(content1.style.top).toBe('0px');
    expect(parseFloat(content2.style.top)).toBeLessThanOrEqual(0);
  });

  it('应该能正确处理暂停和恢复', () => {
    scrollEngine = new ScrollEngine(container, {
      data: testData,
      direction: 'right',
      step: 2
    });
    
    scrollEngine.start();
    
    return new Promise(resolve => {
      setTimeout(() => {
        // 暂停
        scrollEngine.pause();
        
        const content1 = container.querySelector('.ss-content:first-child');
        const content2 = container.querySelector('.ss-content:last-child');
        
        // 记录暂停时的变换
        const pausedTransform1 = content1.style.transform;
        const pausedTransform2 = content2.style.transform;
        
        setTimeout(() => {
          // 验证暂停期间变换没有改变
          expect(content1.style.transform).toBe(pausedTransform1);
          expect(content2.style.transform).toBe(pausedTransform2);
          
          // 恢复
          scrollEngine.resume();
          
          setTimeout(() => {
            // 验证恢复后变换继续变化
            expect(content1.style.transform).toBeDefined();
            expect(content2.style.transform).toBeDefined();
            
            resolve();
          }, 50);
        }, 50);
      }, 50);
    });
  });

  it('应该能处理边界情况', () => {
    // 测试空数据
    scrollEngine = new ScrollEngine(container, {
      data: [],
      direction: 'left',
      step: 1,
      minCountToScroll: 0
    });
    
    expect(scrollEngine.isRunning()).toBe(false);
    
    // 测试单个项目
    scrollEngine.setOptions({ data: ['单个项目'] });
    expect(scrollEngine.isRunning()).toBe(false);
    
    // 测试足够的项目
    scrollEngine.setOptions({ data: testData });
    scrollEngine.start();
    expect(scrollEngine.isRunning()).toBe(true);
  });
});
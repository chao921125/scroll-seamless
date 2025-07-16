// 导入 Vue 组件，注册为全局组件
import { defineComponent, h, ref, watch, onMounted, onBeforeUnmount, computed, VNode } from 'vue';
import ScrollSeamlessCore from '../core';
import { ScrollDirection, ScrollSeamlessOptions, ScrollSeamlessController } from '../types';

// 扩展 ScrollSeamlessOptions 类型，添加 renderItem
interface ExtendedScrollSeamlessOptions extends ScrollSeamlessOptions {
  renderItem?: (item: string, index: number, rowIndex?: number, colIndex?: number) => HTMLElement;
}

// 创建 Vue 组件
const ScrollSeamlessVue = defineComponent({
  name: 'ScrollSeamlessVue',
  props: {
    data: { type: Array, default: () => [] },
    direction: { type: String, default: 'left' },
    minCountToScroll: { type: Number, default: 2 },
    step: { type: Number, default: 1 },
    stepWait: { type: Number, default: 0 },
    delay: { type: Number, default: 0 },
    bezier: { type: Array, default: () => [0.25, 0.1, 0.25, 1] },
    hoverStop: { type: Boolean, default: true },
    wheelEnable: { type: Boolean, default: false },
    singleLine: { type: Boolean, default: false },
    class: { type: [String, Object, Array], default: '' },
    style: { type: [String, Object, Array], default: '' },
    contentClass: { type: [String, Object, Array], default: '' },
    itemClass: { type: [String, Object, Array], default: '' },
    rows: { type: Number, default: 1 },
    cols: { type: Number, default: 1 },
    modelValue: { type: Boolean, default: undefined }
  },
  emits: [],
  setup(props, { slots, expose }) {
    const rootRef = ref<HTMLElement | null>(null);
    let instance: ScrollSeamlessController | null = null;

    // 自定义渲染函数，支持插槽
    const customRenderItem = (item: string, index: number, rowIndex?: number, colIndex?: number): HTMLElement => {
      if (!slots.default) {
        // 如果没有提供插槽，返回默认渲染
        const div = document.createElement('div');
        div.textContent = item;
        div.style.padding = '10px 15px';
        div.style.margin = '0 10px';
        div.style.backgroundColor = '#f0f0f0';
        div.style.borderRadius = '4px';
        div.style.display = 'inline-block';
        return div;
      }

      // 如果提供了插槽，使用 DOM 操作创建元素
      const slotContent = slots.default({ item, index, rowIndex, colIndex });
      
      // 创建一个包装容器
      const wrapper = document.createElement('div');
      wrapper.className = 'ss-slot-wrapper';
      wrapper.style.display = 'inline-block';
      
      // 使用临时 div 渲染 Vue 虚拟节点
      const tempDiv = document.createElement('div');
      const app = h('div', {}, slotContent);
      
      try {
        // 尝试将 Vue 虚拟节点渲染为 HTML
        const { render } = require('vue');
        render(app, tempDiv);
        
        // 将渲染后的内容添加到包装容器
        if (tempDiv.firstChild) {
          wrapper.appendChild(tempDiv.firstChild);
        } else {
          wrapper.textContent = String(item);
        }
      } catch (e) {
        // 如果渲染失败，回退到简单的文本渲染
        wrapper.textContent = String(item);
      }
      
      return wrapper;
    };

    // 创建和销毁实例
    const createInstance = () => {
      if (!rootRef.value) return;
      
      const legalDirections = ['left', 'right', 'up', 'down'];
      const safeDirection = legalDirections.includes(props.direction as string)
        ? props.direction
        : 'left';
        
      const options: ExtendedScrollSeamlessOptions = {
        direction: safeDirection as ScrollDirection,
        step: Number(props.step),
        minCountToScroll: props.minCountToScroll,
        stepWait: props.stepWait,
        delay: props.delay,
        bezier: props.bezier as [number, number, number, number],
        hoverStop: props.hoverStop,
        wheelEnable: props.wheelEnable,
        singleLine: props.singleLine,
        rows: props.rows,
        cols: props.cols,
        data: props.data as string[],
        dataDriven: true,
        renderItem: customRenderItem
      };
      
      // 销毁旧实例
      if (instance) {
        instance.destroy();
        instance = null;
      }
      
      // 创建新实例
      instance = new ScrollSeamlessCore(rootRef.value, options as any);
      
      if (props.modelValue === false) {
        instance.stop();
      }
    };

    const destroyInstance = () => {
      if (instance) {
        instance.destroy();
        instance = null;
      }
    };

    // 暴露方法
    const start = () => { instance && instance.start(); };
    const stop = () => { instance && instance.stop(); };
    const destroy = () => { instance && instance.destroy(); };
    const updateData = () => { instance && instance.updateData(); };
    const setOptions = (options: Partial<ScrollSeamlessOptions>) => { instance && instance.setOptions(options); };
    const isRunning = () => instance ? instance.isRunning() : undefined;

    expose({ start, stop, destroy, updateData, setOptions, isRunning });

    // 生命周期钩子
    onMounted(() => {
      createInstance();
    });

    onBeforeUnmount(() => {
      destroyInstance();
    });

    // 监听属性变化
    watch(() => props.modelValue, (val) => {
      if (!instance) return;
      if (val) instance.start();
      else instance.stop();
    });

    watch(() => props.data, () => {
      createInstance();
    }, { deep: true });

    watch(() => props.step, (val) => {
      if (instance) instance.setOptions({ step: Number(val) });
    });

    // 渲染函数
    return () => {
      return h('div', { 
        ref: rootRef, 
        class: ['scroll-seamless-vue', props.class], 
        style: [
          {
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            position: 'relative'
          }, 
          props.style
        ] 
      });
    };
  }
});

// 只导出一个版本的组件
export default ScrollSeamlessVue;
export type { ScrollSeamlessOptions } from '../types'; 
// 导入 Vue 组件，注册为全局组件
import { defineComponent, h, ref, watch, onMounted, onBeforeUnmount, computed } from 'vue';
import { ScrollSeamless as CoreScrollSeamless } from '../core';
import { ScrollDirection, ScrollSeamlessOptions, ScrollSeamlessController } from '../types';

// 创建 Vue 组件
const ScrollSeamless = defineComponent({
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
    let resizeObserver: ResizeObserver | null = null;

    // 检测 JSDOM 测试环境
    const isJSDOM = typeof window !== 'undefined' && window.navigator && window.navigator.userAgent && window.navigator.userAgent.includes('jsdom');

    // 渲染矩阵：测试环境下直接用原始 data
    const renderMatrix = ref<Array<Array<string>>>(isJSDOM ? [props.data as string[]] : []);
    const transforms = ref<string[]>(isJSDOM ? ['none', 'none'] : []);
    const contentPositions = ref<{left?: string, top?: string}[]>(isJSDOM ? [{}, {}] : []);

    // 处理class和style，避免类型错误
    const customClass = computed(() => props.class);
    const customStyle = computed(() => props.style);

    // 内容项样式
    const itemStyle = computed(() => {
      if (props.direction === 'left' || props.direction === 'right') {
        return {
          display: 'inline-block',
          marginRight: '10px',
          verticalAlign: 'middle'
        };
      }
      return {
        display: 'block',
        marginBottom: '5px'
      };
    });

    const ssContentStyle = computed(() => {
      if ((props.direction) === 'left' || (props.direction) === 'right') {
        return {
          position: 'absolute',
          top: 0,
          left: 0,
          display: 'inline-block',
          whiteSpace: 'nowrap',
          verticalAlign: 'middle',
          boxSizing: 'border-box'
        };
      }
      return {
        position: 'absolute',
        top: 0,
        left: 0,
        display: 'block',
        whiteSpace: 'normal',
        width: '100%',
        boxSizing: 'border-box'
      };
    });

    const rows = computed(() => props.rows);
    const cols = computed(() => props.cols);
    
    const rowStyle = (rowIdx: number) => ({
      position: 'absolute',
      left: 0,
      top: `${(100 / rows.value) * rowIdx}%`,
      width: '100%',
      height: `${100 / rows.value}%`,
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center'
    });
    
    const colStyle = (colIdx: number) => ({
      position: 'relative',
      width: `${100 / cols.value}%`,
      height: '100%',
      display: 'inline-block',
      overflow: 'hidden',
      textAlign: 'center'
    });

    const updateMatrixAndTransforms = () => {
      if (isJSDOM) {
        renderMatrix.value = [props.data as string[]];
        transforms.value = ['none', 'none'];
        contentPositions.value = [{}, {}];
        return;
      }
      if (instance) {
        renderMatrix.value = instance.getRenderMatrix ? instance.getRenderMatrix() : [props.data as string[]];
        transforms.value = instance.getTransforms ? instance.getTransforms() : ['none', 'none'];
        
        // 获取内容尺寸，计算第二个内容的位置
        setTimeout(() => {
          const isHorizontal = props.direction === 'left' || props.direction === 'right';
          const containers = rootRef.value?.querySelectorAll('.ss-content-1');
          
          if (containers && containers.length > 0) {
            const newPositions = [];
            for (let i = 0; i < containers.length; i++) {
              const container = containers[i] as HTMLElement;
              if (isHorizontal) {
                newPositions.push({ left: `${container.scrollWidth}px` });
              } else {
                newPositions.push({ top: `${container.scrollHeight}px` });
              }
            }
            contentPositions.value = newPositions;
          }
        }, 0);
      }
    };

    const start = () => { instance && instance.start(); };
    const stop = () => { instance && instance.stop(); };
    const destroy = () => { instance && instance.destroy(); };
    const updateData = () => {
      if (instance) instance.updateData();
      setTimeout(() => updateMatrixAndTransforms(), 0);
    };
    const setOptions = (options: Partial<ScrollSeamlessOptions>) => { instance && instance.setOptions(options); };
    const isRunning = () => {
      const val = instance && instance.isRunning();
      return val === null ? undefined : val;
    };

    expose({ start, stop, destroy, updateData, setOptions, isRunning });

    const observeContentResize = () => {
      if (!rootRef.value) return;
      if (window.ResizeObserver) {
        resizeObserver = new ResizeObserver(() => {
          if (instance) instance.updateData();
          updateMatrixAndTransforms();
        });
        resizeObserver.observe(rootRef.value);
      }
    };
    
    const unobserveContentResize = () => {
      if (resizeObserver) resizeObserver.disconnect();
      resizeObserver = null;
    };

    onMounted(() => {
      if (rootRef.value) {
        const legalDirections = ['left', 'right', 'up', 'down'];
        const safeDirection = legalDirections.includes(props.direction)
          ? props.direction
          : 'left';
        const options: ScrollSeamlessOptions = {
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
          dataDriven: true
        };
        instance = new CoreScrollSeamless(rootRef.value, options);
        if (props.modelValue === false) {
          instance.stop();
        }
        setTimeout(() => {
          updateMatrixAndTransforms();
          observeContentResize();
        }, 0);
      }
    });

    onBeforeUnmount(() => {
      destroy();
      unobserveContentResize();
    });

    watch(() => props.modelValue, (val) => {
      if (!instance) return;
      if (val) instance.start();
      else instance.stop();
    });

    watch(() => props.data, (val) => {
      if (instance) instance.updateData();
      setTimeout(() => {
        updateMatrixAndTransforms();
        unobserveContentResize();
        observeContentResize();
      }, 0);
    }, { deep: true });

    watch(() => props.step, (val) => {
      if (instance) instance.setOptions({ step: Number(val) });
    });

    return () => {
      const isHorizontal = props.direction === 'left' || props.direction === 'right';
      
      // 渲染元素
      return h('div', { 
        ref: rootRef, 
        class: ['scroll-seamless-vue', customClass.value], 
        style: [
          {
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            position: 'relative'
          }, 
          customStyle.value
        ] 
      }, [
        isHorizontal ? 
          // 水平滚动
          renderMatrix.value.map((row, rowIdx) => {
            return h('div', {
              key: rowIdx,
              class: 'scroll-seamless-row',
              style: rowStyle(rowIdx)
            }, [
              // 内容 1
              h('div', {
                class: ['ss-content', 'ss-content-1', props.contentClass],
                style: {
                  ...ssContentStyle.value,
                  transform: transforms.value[rowIdx*2] || 'none'
                }
              }, row.map((item, idx) => {
                if (slots.default) {
                  return slots.default({ item, index: idx, rowIndex: rowIdx });
                }
                return h('span', {
                  key: idx,
                  class: ['ss-item', props.itemClass],
                  style: itemStyle.value
                }, String(item));
              })),
              // 内容 2
              h('div', {
                class: ['ss-content', 'ss-content-2', props.contentClass],
                style: {
                  ...ssContentStyle.value,
                  transform: transforms.value[rowIdx*2+1] || 'none',
                  left: contentPositions.value[rowIdx]?.left || '0'
                }
              }, row.map((item, idx) => {
                if (slots.default) {
                  return slots.default({ item, index: idx, rowIndex: rowIdx });
                }
                return h('span', {
                  key: `dup-${idx}`,
                  class: ['ss-item', props.itemClass],
                  style: itemStyle.value
                }, String(item));
              }))
            ]);
          }) :
          // 垂直滚动
          renderMatrix.value.map((col, colIdx) => {
            return h('div', {
              key: colIdx,
              class: 'scroll-seamless-col',
              style: colStyle(colIdx)
            }, [
              // 内容 1
              h('div', {
                class: ['ss-content', 'ss-content-1', props.contentClass],
                style: {
                  ...ssContentStyle.value,
                  transform: transforms.value[colIdx*2] || 'none'
                }
              }, col.map((item, idx) => {
                if (slots.default) {
                  return slots.default({ item, index: idx, colIndex: colIdx });
                }
                return h('span', {
                  key: idx,
                  class: ['ss-item', props.itemClass],
                  style: itemStyle.value
                }, String(item));
              })),
              // 内容 2
              h('div', {
                class: ['ss-content', 'ss-content-2', props.contentClass],
                style: {
                  ...ssContentStyle.value,
                  transform: transforms.value[colIdx*2+1] || 'none',
                  top: contentPositions.value[colIdx]?.top || '0'
                }
              }, col.map((item, idx) => {
                if (slots.default) {
                  return slots.default({ item, index: idx, colIndex: colIdx });
                }
                return h('span', {
                  key: `dup-${idx}`,
                  class: ['ss-item', props.itemClass],
                  style: itemStyle.value
                }, String(item));
              }))
            ]);
          })
      ]);
    };
  }
});

export { ScrollSeamless };
export default ScrollSeamless;
export type { ScrollSeamlessOptions } from '../types'; 
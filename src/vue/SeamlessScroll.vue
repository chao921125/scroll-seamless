<template>
  <div ref="rootRef" class="seamless-scroll-vue">
    <slot />
  </div>
</template>

<script>
import { defineComponent, ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { ScrollSeamless } from '../core';

export default defineComponent({
  name: 'ScrollSeamlessVue',
  props: {
    data: {
      type: Array,
      required: true
    },
    direction: {
      type: String,
      default: 'horizontal'
    },
    minCountToScroll: {
      type: Number,
      default: 2
    },
    step: {
      type: Number,
      default: 1
    },
    stepWait: {
      type: Number,
      default: 0
    },
    delay: {
      type: Number,
      default: 0
    },
    bezier: {
      type: Array,
      default: () => [0.25, 0.1, 0.25, 1]
    },
    hoverStop: {
      type: Boolean,
      default: true
    },
    wheelEnable: {
      type: Boolean,
      default: false
    },
    singleLine: {
      type: Boolean,
      default: false
    },
    modelValue: {
      type: Boolean,
      default: undefined
    }
  },
  emits: [],
  setup(props, { expose }) {
    const rootRef = ref(null);
    /** @type {ScrollSeamless|null} */
    let instance = null;

    // 类型断言（JS环境下仅作注释）
    const data = /** @type {string[]} */ (props.data);
    const bezier = /** @type {[number, number, number, number]} */ (props.bezier);
    const direction = /** @type {'horizontal' | 'vertical'} */ (props.direction);

    const start = () => instance && instance.start();
    const stop = () => instance && instance.stop();
    const destroy = () => instance && instance.destroy();
    const updateData = (data) => instance && instance.updateData(data);
    const setOptions = (options) => instance && instance.setOptions(options);
    const isRunning = () => instance && instance.isRunning();

    expose({ start, stop, destroy, updateData, setOptions, isRunning });

    onMounted(() => {
      if (rootRef.value) {
        instance = new ScrollSeamless(rootRef.value, { ...props, data, bezier, direction });
        if (props.modelValue === false) {
          instance.stop();
        }
      }
    });

    onBeforeUnmount(() => {
      destroy();
    });

    watch(() => props.modelValue, (val) => {
      if (!instance) return;
      if (val) instance.start();
      else instance.stop();
    });

    watch(() => props.data, (val) => {
      if (instance) instance.updateData(/** @type {string[]} */ (val));
    });

    return {
      rootRef
    };
  }
});
</script>

<style scoped>
.seamless-scroll-vue {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}
</style> 
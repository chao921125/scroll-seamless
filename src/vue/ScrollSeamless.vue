<template>
  <div ref="rootRef" class="scroll-seamless-vue" :class="props.class" :style="props.style">
    <div class="scroll-seamless-content" :class="props.direction">
      <!-- 第一组内容 -->
      <div class="ss-content" :class="props.contentClass" :style="ssContentStyle">
        <template v-if="props.custom">
          <slot />
        </template>
        <template v-else>
          <slot
            v-for="(item, idx) in props.data"
            :key="idx"
            :item="item"
            :index="idx"
          >
            <span class="ss-item" :class="props.itemClass">{{ item }}</span>
          </slot>
        </template>
      </div>
      <!-- 第二组内容（用于无缝滚动） -->
      <div class="ss-content" :class="props.contentClass" :style="ssContentStyle">
        <template v-if="props.custom">
          <slot />
        </template>
        <template v-else>
          <slot
            v-for="(item, idx) in props.data"
            :key="`copy-${idx}`"
            :item="item"
            :index="idx"
          >
            <span class="ss-item" :class="props.itemClass">{{ item }}</span>
          </slot>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, watch, onMounted, onBeforeUnmount, computed } from 'vue';
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
    },
    custom: {
      type: Boolean,
      default: false
    },
    class: {
      type: [String, Array, Object],
      default: ''
    },
    style: {
      type: [String, Object, Array],
      default: ''
    },
    contentClass: {
      type: [String, Array, Object],
      default: ''
    },
    itemClass: {
      type: [String, Array, Object],
      default: ''
    }
  },
  emits: [],
  setup(props, { expose }) {
    const rootRef = ref(null);
    let instance = null;

    // 横向时内容容器样式
    const ssContentStyle = computed(() => {
      if (props.direction === 'left' || props.direction === 'right') {
        return {
          position: 'absolute',
          top: 0,
          left: 0,
          display: 'inline-block',
          whiteSpace: 'nowrap',
          verticalAlign: 'top',
        };
      }
      return {
        position: 'absolute',
        top: 0,
        left: 0,
        display: 'block',
        whiteSpace: 'normal',
      };
    });

    const start = () => instance && instance.start();
    const stop = () => instance && instance.stop();
    const destroy = () => instance && instance.destroy();
    const updateData = () => instance && instance.updateData();
    const setOptions = (options) => instance && instance.setOptions(options);
    const isRunning = () => instance && instance.isRunning();

    expose({ start, stop, destroy, updateData, setOptions, isRunning });

    onMounted(() => {
      if (rootRef.value) {
        // 确保 step 为数字类型
        const options = { ...props, step: Number(props.step) };
        instance = new ScrollSeamless(rootRef.value, options);
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
      if (instance) instance.updateData();
    });

    watch(() => props.step, (val) => {
      if (instance) instance.setOptions({ step: Number(val) });
    });

    return {
      rootRef,
      props,
      ssContentStyle,
    };
  }
});
</script>

<style scoped>
.scroll-seamless-vue {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}
</style> 
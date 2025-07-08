<template>
  <div ref="rootRef" class="scroll-seamless-vue">
    <div class="scroll-seamless-content" :class="props.direction">
      <div class="ss-content" :style="ssContentStyle">
        <slot
          v-for="(item, idx) in props.data"
          :item="item"
          :index="idx"
          :key="idx"
        >
          <span class="ss-item">{{ item }}</span>
        </slot>
      </div>
      <div class="ss-content" :style="ssContentStyle">
        <slot
          v-for="(item, idx) in props.data"
          :item="item"
          :index="idx"
          :key="'copy-' + idx"
        >
          <span class="ss-item">{{ item }}</span>
        </slot>
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
    }
  },
  emits: [],
  setup(props, { expose }) {
    const rootRef = ref(null);
    let instance = null;

    // 横向时内容容器样式
    const ssContentStyle = computed(() => {
      if (props.direction === 'horizontal') {
        return {
          display: 'inline-block',
          whiteSpace: 'nowrap',
          verticalAlign: 'top',
        };
      }
      return {};
    });

    // 直接用 props，无类型断言
    const data = props.data;
    const bezier = props.bezier;
    const direction = props.direction;

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
      if (instance) instance.updateData(val);
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
.scroll-seamless-content.horizontal {
  display: flex;
  flex-direction: row;
  white-space: nowrap;
}
.scroll-seamless-content.vertical {
  display: block;
}
.scroll-seamless-content.horizontal > * {
  display: inline-block;
}
</style> 
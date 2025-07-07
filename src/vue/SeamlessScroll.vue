<template>
  <div ref="rootRef" class="seamless-scroll-vue">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, defineProps, defineExpose } from 'vue';
import type { SeamlessScrollOptions } from '../../types';
import { SeamlessScroll } from '../../core';

const props = defineProps<SeamlessScrollOptions & {
  modelValue?: boolean
}>();

const rootRef = ref<HTMLElement | null>(null);
let instance: SeamlessScroll | null = null;

const start = () => instance?.start();
const stop = () => instance?.stop();
const destroy = () => instance?.destroy();
const updateData = (data: string[]) => instance?.updateData(data);
const setOptions = (options: Partial<SeamlessScrollOptions>) => instance?.setOptions(options);
const isRunning = () => instance?.isRunning();

defineExpose({ start, stop, destroy, updateData, setOptions, isRunning });

onMounted(() => {
  if (rootRef.value) {
    instance = new SeamlessScroll(rootRef.value, props);
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
</script>

<style scoped>
.seamless-scroll-vue {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}
</style> 
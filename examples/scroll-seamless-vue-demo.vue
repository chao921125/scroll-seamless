<template>
  <div>
    <div style="width: 300px; height: 50px; border: 1px solid #ccc;">
      <ScrollSeamless
        ref="scrollRef"
        :data="data"
        direction="horizontal"
        :step="1"
        :hover-stop="true"
        :wheel-enable="true"
      >
        <!-- 作用域插槽 - 渲染单个项目 -->
        <template #default="{ item, index }">
          <div :key="index" style="
            padding: 10px; 
            margin: 0 5px; 
            background-color: #f0f0f0;
            border-radius: 4px;
            display: inline-block;
          ">
            {{ item }}
          </div>
        </template>
      </ScrollSeamless>
    </div>
    
    <div style="margin-top: 10px;">
      <button @click="handleStart">开始</button>
      <button @click="handleStop">停止</button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { ScrollSeamless } from '../dist/vue/index.esm.js';

export default {
  name: 'VueDemo',
  components: {
    ScrollSeamless
  },
  setup() {
    const scrollRef = ref(null);
    const data = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'];

    const handleStart = () => {
      scrollRef.value?.start();
    };

    const handleStop = () => {
      scrollRef.value?.stop();
    };

    return {
      scrollRef,
      data,
      handleStart,
      handleStop
    };
  }
};
</script> 
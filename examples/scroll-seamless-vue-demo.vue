<template>
  <div style="width: 400px; height: 40px; border: 1px solid #ccc;">
    <SeamlessScrollVue
      :data="items"
      direction="horizontal"
      :step="1"
      :stepWait="10"
      :minCountToScroll="2"
      :hoverStop="true"
      :wheelEnable="true"
      ref="scrollRef"
    >
      <template #default>
        <span v-for="item in items" :key="item" style="margin: 0 8px;">{{ item }}</span>
      </template>
    </SeamlessScrollVue>
  </div>
  <button @click="updateData">更新数据</button>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SeamlessScrollVue from '../src/vue/SeamlessScroll.vue';

const items = ref(['无缝', '滚动', '示例', 'Seamless', 'Scroll', 'Demo']);
const scrollRef = ref();

function updateData() {
  items.value = ['新数据1', '新数据2', '新数据3'];
  // 也可以通过 scrollRef.value.updateData(items.value) 强制更新
}
</script> 
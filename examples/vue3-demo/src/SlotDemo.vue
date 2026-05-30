<template>
  <div class="demo-container">
    <h1>🎨 Scroll Seamless - 作用域插槽演示</h1>

    <div class="demo-section">
      <h2>示例 1: 基础插槽用法</h2>
      <div class="scroll-box">
        <ScrollSeamless :data="basicItems" direction="left" :step="1">
          <template #item="{ item, index }">
            <div class="basic-item">
              <span class="index">#{{ index + 1 }}</span>
              <span class="text">{{ item }}</span>
            </div>
          </template>
        </ScrollSeamless>
      </div>
    </div>

    <div class="demo-section">
      <h2>示例 2: 彩色卡片（动态样式）</h2>
      <div class="scroll-box">
        <ScrollSeamless :data="colorItems" direction="left" :step="1">
          <template #item="{ item, index }">
            <div 
              class="color-card"
              :style="{
                background: `linear-gradient(135deg, ${colors[index % colors.length]} 0%, ${colors[(index + 1) % colors.length]} 100%)`
              }"
            >
              <span class="emoji">{{ emojis[index % emojis.length] }}</span>
              <span class="text">{{ item }}</span>
            </div>
          </template>
        </ScrollSeamless>
      </div>
    </div>

    <div class="demo-section">
      <h2>示例 3: 消息列表（条件渲染）</h2>
      <div class="scroll-box tall">
        <ScrollSeamless :data="messages" direction="up" :step="0.5">
          <template #item="{ item }">
            <div class="message">
              <span class="content">{{ item }}</span>
            </div>
          </template>
        </ScrollSeamless>
      </div>
    </div>

    <div class="demo-section">
      <h2>示例 4: 默认插槽（兼容旧用法）</h2>
      <div class="scroll-box">
        <ScrollSeamless :data="defaultItems" direction="left" :step="1">
          <template #default="{ item, index, data }">
            <div class="default-item">
              <span>{{ index + 1 }}/{{ data.length }}</span>
              <span>{{ item }}</span>
            </div>
          </template>
        </ScrollSeamless>
      </div>
    </div>

    <div class="demo-section">
      <h2>示例 5: 无插槽（默认渲染）</h2>
      <div class="scroll-box">
        <ScrollSeamless :data="simpleItems" direction="left" :step="1" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ScrollSeamless from 'scroll-seamless'

// 基础示例
const basicItems = ref([
  'Vue 3',
  'React',
  'Angular',
  'Svelte',
  'Next.js',
  'Nuxt',
  'Vite'
])

// 彩色卡片示例
const colorItems = ref([
  '🎯 目标',
  '🚀 启动',
  '💎 钻石',
  '⭐ 星星',
  '🔥 火焰',
  '💡 灵感',
  '🎨 艺术'
])

const colors = [
  '#667eea', '#764ba2', '#f093fb', '#4facfe',
  '#43e97b', '#fa709a', '#fee140'
]

const emojis = ['🎯', '🚀', '💎', '⭐', '🔥', '💡', '🎨']

// 消息列表示例
const messages = ref<string[]>([
  'ℹ️ 系统更新完成 10:30',
  '✅ 数据同步成功 10:35',
  '⚠️ 磁盘空间不足 10:40',
  '❌ 数据库连接失败 10:45',
  'ℹ️ 用户登录成功 10:50',
  '✅ 备份完成 10:55'
])

// 默认插槽示例
const defaultItems = ref([
  '默认插槽 1',
  '默认插槽 2',
  '默认插槽 3',
  '默认插槽 4',
  '默认插槽 5'
])

// 简单示例（无插槽）
const simpleItems = ref([
  '简单项目 1',
  '简单项目 2',
  '简单项目 3',
  '简单项目 4',
  '简单项目 5'
])
</script>

<style scoped>
.demo-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

h1 {
  margin-bottom: 30px;
  color: #333;
  font-size: 28px;
  text-align: center;
}

.demo-section {
  margin-bottom: 40px;
}

h2 {
  margin-bottom: 15px;
  color: #666;
  font-size: 20px;
  padding-left: 10px;
  border-left: 4px solid #1890ff;
}

.scroll-box {
  width: 100%;
  height: 150px;
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  background: white;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.scroll-box.tall {
  height: 300px;
}

/* 基础示例样式 */
.basic-item {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  margin: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  font-weight: 500;
}

.index {
  font-size: 18px;
  font-weight: bold;
  opacity: 0.8;
}

.text {
  font-size: 16px;
}

/* 彩色卡片样式 */
.color-card {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 15px 25px;
  margin: 8px;
  color: white;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  transition: transform 0.3s;
}

.color-card:hover {
  transform: scale(1.05);
}

.emoji {
  font-size: 24px;
}

/* 消息样式 */
.message {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 20px;
  margin: 10px;
  border-radius: 8px;
  border-left: 4px solid;
}

.message-info {
  border-left-color: #1890ff;
  background: #f0f5ff;
}

.message-success {
  border-left-color: #52c41a;
  background: #f6ffed;
}

.message-warning {
  border-left-color: #faad14;
  background: #fffbe6;
}

.message-error {
  border-left-color: #ff4d4f;
  background: #fff2f0;
}

.icon {
  font-size: 24px;
}

.content {
  flex: 1;
  font-size: 15px;
  color: #333;
}

.time {
  font-size: 12px;
  color: #999;
  font-family: monospace;
}

/* 默认插槽样式 */
.default-item {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 18px;
  margin: 8px;
  background: #1890ff;
  color: white;
  border-radius: 6px;
  font-size: 14px;
}

/* 简单样式 */
:deep(.scroll-seamless-item) {
  display: inline-block;
  padding: 10px 20px;
  margin: 5px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 6px;
  font-weight: 500;
}
</style>

<template>
  <div class="demo-container">
    <h1>🚀 Scroll Seamless v2.0 - Vue3 全功能测试</h1>

    <div class="main-layout">
      <!-- 左侧面板 -->
      <div class="left-panel">
        <!-- 状态栏 -->
        <div class="status-bar">
          <div class="status-item">
            <span class="status-label">运行:</span>
            <span class="status-value">{{ isRunning }}</span>
          </div>
          <div class="status-item">
            <span class="status-label">暂停:</span>
            <span class="status-value">{{ isPaused }}</span>
          </div>
          <div class="status-item">
            <span class="status-label">位置:</span>
            <span class="status-value">{{ position }}</span>
          </div>
          <div class="status-item">
            <span class="status-label">循环:</span>
            <span class="status-value">{{ cycleCount }}</span>
          </div>
        </div>

        <!-- 测试区域 -->
        <div class="test-area">
          <h3>📺 滚动展示区域</h3>
          <div class="scroll-box">
            <ScrollSeamless
              :key="configKey"
              ref="scrollRef"
              :data="currentData"
              :direction="config.direction"
              :step="config.step"
              :rows="config.rows"
              :cols="config.cols"
              :step-wait="config.stepWait"
              :delay="config.delay"
              :auto-start="config.autoStart"
              :hover-stop="config.hoverStop"
              :hover-delay="config.hoverDelay"
              :leave-delay="config.leaveDelay"
              :wheel-enable="config.wheelEnable"
              :wheel-sensitivity="config.wheelSensitivity"
              :wheel-step="config.wheelStep"
              :enable-resize-observer="config.enableResizeObserver"
              :resize-debounce="config.resizeDebounce"
              :fade-edge="config.fadeEdge"
              :virtual-scroll="config.virtualScroll"
              :buffer-size="config.bufferSize"
              :render-item="config.customContent ? renderCustomItem : undefined"
              :keep-raf-on-pause="config.keepRafOnPause"
              :enable-dom-events="config.enableDomEvents"
              :event-throttle="config.eventThrottle"
              :min-pool-size="config.minPoolSize"
              :max-pool-size="config.maxPoolSize"
              :warmup-pool="config.warmupPool"
              :min-count-to-scroll="config.minCountToScroll"
              :performance="config.performance ? performanceConfig : undefined"
              @event="handleEvent"
            />
          </div>
        </div>

        <!-- 控制面板 -->
        <div class="control-panel">
          <h3>🎮 控制面板</h3>
          
          <!-- 方向选择 -->
          <div class="control-group">
            <label>🧭 滚动方向</label>
            <select v-model="config.direction" @change="recreateInstance">
              <option value="left">⬅️ 向左滚动</option>
              <option value="right">➡️ 向右滚动</option>
              <option value="up">⬆️ 向上滚动</option>
              <option value="down">⬇️ 向下滚动</option>
            </select>
          </div>

          <!-- 速度控制 -->
          <div class="control-group">
            <label>⚡ 滚动速度</label>
            <div class="slider-container">
              <input 
                type="range" 
                v-model.number="config.step"
                min="0.1" 
                max="5" 
                step="0.1"
                @input="recreateInstance"
              >
              <span class="slider-value">{{ config.step.toFixed(1) }}</span>
            </div>
          </div>

          <!-- 播放控制 -->
          <div class="control-group">
            <label>▶️ 播放控制</label>
            <div class="button-group">
              <button class="success" @click="startScroll">▶️ 开始</button>
              <button class="danger" @click="stopScroll">⏹️ 停止</button>
              <button class="warning" @click="pauseScroll">⏸️ 暂停</button>
              <button @click="resumeScroll">▶️ 恢复</button>
            </div>
          </div>

          <!-- 数据量 -->
          <div class="control-group">
            <label>📊 数据量</label>
            <div class="data-buttons">
              <button @click="setDataCount(10)">10条</button>
              <button @click="setDataCount(50)">50条</button>
              <button @click="setDataCount(100)">100条</button>
              <button @click="setDataCount(200)">200条</button>
            </div>
          </div>

          <!-- 自定义内容快速切换 -->
          <div class="control-group custom-content-section">
            <label class="custom-content-label">
              <span>🎨 自定义内容渲染</span>
              <input 
                type="checkbox" 
                v-model="config.customContent"
                @change="recreateInstance"
              >
            </label>
            <div class="custom-content-hint">
              <span>✨ 启用后显示：</span>
              <span>• 彩色渐变卡片 • Emoji图标 • 悬停动画 • 序号标签</span>
            </div>
            <div class="custom-content-tip">
              💡 提示：勾选后立即生效，再次勾选恢复默认样式
            </div>
          </div>

          <!-- 多行/多列布局 -->
          <div class="control-group">
            <label>📐 多行/多列布局</label>
            <div class="slider-container">
              <span style="min-width: 50px; font-size: 13px;">行数:</span>
              <input 
                type="number" 
                v-model.number="config.rows"
                min="1" 
                max="10"
                @change="recreateInstance"
              >
              <span style="min-width: 50px; font-size: 13px; margin-left: 12px;">列数:</span>
              <input 
                type="number" 
                v-model.number="config.cols"
                min="1" 
                max="10"
                @change="recreateInstance"
              >
            </div>
          </div>

          <!-- 单步停顿 -->
          <div class="control-group">
            <label>⏱️ 单步停顿 (stepWait)</label>
            <div class="slider-container">
              <input 
                type="range" 
                v-model.number="config.stepWait"
                min="0" 
                max="1000" 
                step="50"
                @input="recreateInstance"
              >
              <span class="slider-value">{{ config.stepWait }}ms</span>
            </div>
          </div>

          <!-- 延迟启动 -->
          <div class="control-group">
            <label>⏰ 延迟启动 (delay)</label>
            <div class="slider-container">
              <input 
                type="range" 
                v-model.number="config.delay"
                min="0" 
                max="3000" 
                step="100"
                @input="recreateInstance"
              >
              <span class="slider-value">{{ config.delay }}ms</span>
            </div>
          </div>

          <!-- 鼠标交互 -->
          <div class="control-group">
            <label>
              <input 
                type="checkbox" 
                v-model="config.hoverStop"
                @change="recreateInstance"
              >
              🖱️ 鼠标悬停暂停 (hoverStop)
            </label>
          </div>

          <div class="control-group">
            <label>🕒 悬停延迟 (hoverDelay)</label>
            <div class="slider-container">
              <input 
                type="range" 
                v-model.number="config.hoverDelay"
                min="0" 
                max="1000" 
                step="50"
                @input="recreateInstance"
              >
              <span class="slider-value">{{ config.hoverDelay }}ms</span>
            </div>
          </div>

          <div class="control-group">
            <label>🕒 离开延迟 (leaveDelay)</label>
            <div class="slider-container">
              <input 
                type="range" 
                v-model.number="config.leaveDelay"
                min="0" 
                max="1000" 
                step="50"
                @input="recreateInstance"
              >
              <span class="slider-value">{{ config.leaveDelay }}ms</span>
            </div>
          </div>

          <!-- 滚轮控制 -->
          <div class="control-group">
            <label>
              <input 
                type="checkbox" 
                v-model="config.wheelEnable"
                @change="recreateInstance"
              >
              🎡 滚轮控制 (wheelEnable)
            </label>
          </div>

          <div class="control-group">
            <label>📊 滚轮灵敏度 (wheelSensitivity)</label>
            <div class="slider-container">
              <input 
                type="range" 
                v-model.number="config.wheelSensitivity"
                min="0.1" 
                max="3" 
                step="0.1"
                @input="recreateInstance"
              >
              <span class="slider-value">{{ config.wheelSensitivity.toFixed(1) }}</span>
            </div>
          </div>

          <div class="control-group">
            <label>📏 滚轮步进 (wheelStep)</label>
            <div class="slider-container">
              <input 
                type="range" 
                v-model.number="config.wheelStep"
                min="1" 
                max="50" 
                step="1"
                @input="recreateInstance"
              >
              <span class="slider-value">{{ config.wheelStep }}px</span>
            </div>
          </div>

          <!-- 响应式配置 -->
          <div class="control-group">
            <label>
              <input 
                type="checkbox" 
                v-model="config.enableResizeObserver"
                @change="recreateInstance"
              >
              🔄 ResizeObserver (enableResizeObserver)
            </label>
          </div>

          <div class="control-group">
            <label>⏱️ 防抖延迟 (resizeDebounce)</label>
            <div class="slider-container">
              <input 
                type="range" 
                v-model.number="config.resizeDebounce"
                min="0" 
                max="500" 
                step="10"
                @input="recreateInstance"
              >
              <span class="slider-value">{{ config.resizeDebounce }}ms</span>
            </div>
          </div>

          <!-- 渐隐边缘 -->
          <div class="control-group">
            <label>
              <input 
                type="checkbox" 
                v-model="config.fadeEdge.enabled"
                @change="recreateInstance"
              >
              🌫️ 渐隐边缘 (fadeEdge)
            </label>
          </div>

          <div class="control-group">
            <label>📏 渐隐宽度 (fadeEdge.size)</label>
            <div class="slider-container">
              <input 
                type="range" 
                v-model.number="config.fadeEdge.size"
                min="10" 
                max="200" 
                step="10"
                @input="recreateInstance"
              >
              <span class="slider-value">{{ config.fadeEdge.size }}px</span>
            </div>
          </div>

          <!-- 虚拟滚动 -->
          <div class="control-group">
            <label>
              <input 
                type="checkbox" 
                v-model="config.virtualScroll"
                @change="recreateInstance"
              >
              ⚡ 虚拟滚动 (virtualScroll)
            </label>
          </div>

          <div class="control-group">
            <label>📦 缓冲区大小 (bufferSize)</label>
            <div class="slider-container">
              <input 
                type="range" 
                v-model.number="config.bufferSize"
                min="0" 
                max="20" 
                step="1"
                @input="recreateInstance"
              >
              <span class="slider-value">{{ config.bufferSize }}</span>
            </div>
          </div>

          <!-- 高级配置 -->
          <div class="control-group">
            <label @click="showAdvanced = !showAdvanced" class="advanced-toggle">
              <span>🔧 高级配置</span>
              <span :class="{ 'arrow-rotated': !showAdvanced }">▼</span>
            </label>
            <div v-show="showAdvanced" class="advanced-panel">
              <!-- 动画控制 -->
              <div class="advanced-section">
                <label>🎬 动画控制</label>
                <div>
                  <label>
                    <input type="checkbox" v-model="config.autoStart" @change="recreateInstance">
                    自动启动 (autoStart)
                  </label>
                  <label>
                    <input type="checkbox" v-model="config.keepRafOnPause" @change="recreateInstance">
                    保持RAF (keepRafOnPause)
                  </label>
                </div>
              </div>

              <!-- 事件配置 -->
              <div class="advanced-section">
                <label>📨 事件配置</label>
                <div>
                  <label>
                    <input type="checkbox" v-model="config.enableDomEvents" @change="recreateInstance">
                    DOM事件 (enableDomEvents)
                  </label>
                  <div>
                    <label>事件节流 (eventThrottle):</label>
                    <div class="slider-container">
                      <input 
                        type="range" 
                        v-model.number="config.eventThrottle"
                        min="0" 
                        max="500" 
                        step="10"
                        @input="recreateInstance"
                      >
                      <span class="slider-value">{{ config.eventThrottle }}ms</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 对象池配置 -->
              <div class="advanced-section">
                <label>🗄️ 对象池配置</label>
                <div>
                  <div>
                    <label>最小池大小 (minPoolSize):</label>
                    <input 
                      type="number" 
                      v-model.number="config.minPoolSize"
                      min="0" 
                      max="50"
                      @change="recreateInstance"
                    >
                  </div>
                  <div>
                    <label>最大池大小 (maxPoolSize):</label>
                    <input 
                      type="number" 
                      v-model.number="config.maxPoolSize"
                      min="10" 
                      max="200"
                      @change="recreateInstance"
                    >
                  </div>
                  <label>
                    <input type="checkbox" v-model="config.warmupPool" @change="recreateInstance">
                    预热池 (warmupPool)
                  </label>
                </div>
              </div>

              <!-- 最小滚动数量 -->
              <div class="advanced-section">
                <label>📊 最小滚动数量</label>
                <div>
                  <input 
                    type="number" 
                    v-model.number="config.minCountToScroll"
                    min="1" 
                    max="10"
                    @change="recreateInstance"
                  >
                  <span>(minCountToScroll)</span>
                </div>
              </div>

              <!-- 性能监控 -->
              <div class="advanced-section">
                <label>📈 性能监控</label>
                <div>
                  <label>
                    <input type="checkbox" v-model="config.performance" @change="recreateInstance">
                    启用性能监控 (performance.enabled)
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧日志面板 -->
      <div class="right-panel">
        <div class="log-panel">
          <h3>📝 运行日志</h3>
          <div class="log" ref="logContainer">
            <div v-for="(log, index) in logs" :key="index">{{ log }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import ScrollSeamless, { ScrollSeamlessExpose, ScrollEventType } from 'scroll-seamless'

const scrollRef = ref<ScrollSeamlessExpose | null>(null)
const logContainer = ref<HTMLElement | null>(null)
const showAdvanced = ref(false)

// 状态
const isRunning = ref(false)
const isPaused = ref(false)
const position = ref(0)
const cycleCount = ref(0)
const logs = ref<string[]>([])

// 配置
const config = reactive({
  direction: 'left' as const,
  step: 1,
  rows: 1,
  cols: 1,
  stepWait: 0,
  delay: 0,
  autoStart: true,
  hoverStop: false,
  hoverDelay: 0,
  leaveDelay: 0,
  wheelEnable: false,
  wheelSensitivity: 1.0,
  wheelStep: 10,
  enableResizeObserver: true,
  resizeDebounce: 100,
  fadeEdge: { enabled: false, size: 50 },
  virtualScroll: true,
  bufferSize: 5,
  customContent: false,
  keepRafOnPause: true,
  enableDomEvents: true,
  eventThrottle: 0,
  minPoolSize: 10,
  maxPoolSize: 100,
  warmupPool: true,
  minCountToScroll: 2,
  performance: false
})

// 性能监控配置
const performanceConfig = {
  enabled: true,
  fps: true,
  memory: true,
  updateInterval: 1000,
  onUpdate: (metrics: any) => {
    addLog(`📈 FPS: ${metrics.fps.toFixed(1)}, 内存: ${(metrics.memory?.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`)
  }
}

// 数据
const currentData = ref<string[]>(generateData(10))

function generateData(count: number): string[] {
  return Array.from({ length: count }, (_, i) => `Item ${i + 1}`)
}

// 自定义渲染
function renderCustomItem(item: string, index: number): HTMLElement {
  const div = document.createElement('div')
  const color1 = getRandomColor()
  const color2 = getRandomColor()
  
  div.style.cssText = `
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    margin: 8px;
    background: linear-gradient(135deg, ${color1} 0%, ${color2} 100%);
    color: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    font-weight: 500;
    font-size: 14px;
    transition: transform 0.2s;
    cursor: pointer;
  `
  
  div.innerHTML = `
    <span style="font-size: 20px;">${getEmoji(index)}</span>
    <span>${item}</span>
    <span style="opacity: 0.7; font-size: 12px;">#${index + 1}</span>
  `
  
  div.onmouseenter = () => div.style.transform = 'scale(1.05)'
  div.onmouseleave = () => div.style.transform = 'scale(1)'
  
  return div
}

function getRandomColor(): string {
  const colors = [
    '#667eea', '#764ba2', '#f093fb', '#4facfe', 
    '#43e97b', '#fa709a', '#fee140', '#30cfd0',
    '#a8edea', '#ff9a9e', '#ffecd2', '#ff8a80'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

function getEmoji(index: number): string {
  const emojis = ['🎯', '🚀', '💎', '⭐', '🔥', '💡', '🎨', '🎪', '🎭', '🎬']
  return emojis[index % emojis.length]
}

// 控制方法
function startScroll() {
  scrollRef.value?.start()
  addLog('▶️ 开始滚动')
}

function stopScroll() {
  scrollRef.value?.stop()
  addLog('⏹️ 停止滚动')
}

function pauseScroll() {
  scrollRef.value?.pause()
  addLog('⏸️ 暂停滚动')
}

function resumeScroll() {
  scrollRef.value?.resume()
  addLog('▶️ 恢复滚动')
}

function setDataCount(count: number) {
  currentData.value = generateData(count)
  addLog(`📊 数据量: ${count}条`)
}

// 配置项 key，用于触发组件重新渲染
const configKey = ref(0)

function recreateInstance() {
  configKey.value++
  addLog(`🔄 重新创建实例: ${config.direction}, 速度=${config.step}`)
}

// 事件处理
function handleEvent(type: ScrollEventType, data: any) {
  addLog(`📨 ${type}`, data)
}

// 日志
function addLog(message: string, data?: any) {
  const time = new Date().toLocaleTimeString()
  let log = `[${time}] ${message}`
  
  if (data && typeof data === 'object') {
    log += ' ' + JSON.stringify(data)
  }
  
  logs.value.push(log)
  
  if (logs.value.length > 100) {
    logs.value.shift()
  }
  
  // 滚动到底部
  nextTick(() => {
    if (logContainer.value) {
      logContainer.value.scrollTop = logContainer.value.scrollHeight
    }
  })
}

// 定时更新状态
onMounted(() => {
  addLog('🎉 Vue3 测试页面加载完成')
  
  const statusInterval = setInterval(() => {
    if (scrollRef.value) {
      isRunning.value = scrollRef.value.getIsRunning()
      isPaused.value = scrollRef.value.getIsPaused()
      position.value = Math.round(scrollRef.value.getPosition())
      cycleCount.value = scrollRef.value.getCycleCount()
    }
  }, 500)
  
  // 组件卸载时清理定时器
  onUnmounted(() => {
    clearInterval(statusInterval)
  })
})
</script>

<style scoped>
/* 复用 test.html 的样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.demo-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  padding: 20px;
  background: #f5f5f5;
}

h1 {
  margin-bottom: 20px;
  color: #333;
  font-size: 24px;
}

.main-layout {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.left-panel {
  flex: 1;
  min-width: 0;
}

.right-panel {
  width: 400px;
  flex-shrink: 0;
}

.test-area, .control-panel, .status-bar, .log-panel {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.test-area, .control-panel {
  margin-bottom: 20px;
}

.test-area h3, .control-panel h3, .log-panel h3 {
  margin-bottom: 15px;
  color: #666;
  font-size: 16px;
}

.scroll-box {
  width: 100%;
  height: 200px;
  border: 2px solid #e8e8e8;
  border-radius: 8px;
  background: #fafafa;
  overflow: hidden;
}

.status-bar {
  margin-bottom: 20px;
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-label {
  color: #666;
  font-size: 13px;
}

.status-value {
  font-family: monospace;
  font-size: 14px;
  font-weight: 600;
  color: #1890ff;
  padding: 4px 8px;
  background: #f0f5ff;
  border-radius: 4px;
}

.control-group {
  margin-bottom: 20px;
}

.control-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

select, input[type="number"] {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
}

select:hover {
  border-color: #40a9ff;
}

select:focus {
  outline: none;
  border-color: #40a9ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #1890ff;
  cursor: pointer;
  transition: all 0.3s;
}

input[type="range"]::-webkit-slider-thumb:hover {
  background: #40a9ff;
  transform: scale(1.2);
}

input[type="range"]::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #1890ff;
  cursor: pointer;
  border: none;
}

input[type="range"] {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #e8e8e8;
  outline: none;
  -webkit-appearance: none;
}

.slider-value {
  min-width: 50px;
  padding: 6px 12px;
  background: #f0f0f0;
  border-radius: 4px;
  font-family: monospace;
  font-size: 14px;
  text-align: center;
  font-weight: 600;
  color: #1890ff;
}

.button-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  background: #1890ff;
  color: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

button:active {
  transform: translateY(0);
}

button:hover {
  background: #40a9ff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
}

button.danger {
  background: #ff4d4f;
}

button.success {
  background: #52c41a;
}

button.warning {
  background: #faad14;
}

button.warning:hover {
  background: #ffc53d;
  box-shadow: 0 2px 8px rgba(250, 173, 20, 0.3);
}

button.success:hover {
  background: #73d13d;
  box-shadow: 0 2px 8px rgba(82, 196, 26, 0.3);
}

button.danger:hover {
  background: #ff7875;
  box-shadow: 0 2px 8px rgba(255, 77, 79, 0.3);
}

.data-buttons {
  display: flex;
  gap: 8px;
}

.data-buttons button {
  flex: 1;
  padding: 8px 16px;
}

.custom-content-section {
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  padding: 15px;
  border-radius: 8px;
  border: 2px solid #667eea40;
}

.custom-content-label {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  color: #667eea;
}

.custom-content-hint {
  margin-top: 10px;
  font-size: 12px;
  color: #666;
  line-height: 1.6;
}

.custom-content-tip {
  margin-top: 10px;
  padding: 8px;
  background: white;
  border-radius: 6px;
  font-size: 11px;
  color: #999;
}

.advanced-toggle {
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.arrow-rotated {
  transform: rotate(-90deg);
  transition: transform 0.3s;
}

.advanced-panel {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e8e8e8;
}

.advanced-section {
  margin-bottom: 15px;
}

.advanced-section label {
  font-size: 13px;
  color: #666;
}

.log {
  padding: 12px;
  background: #1e1e1e;
  color: #4ec9b0;
  border-radius: 6px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  max-height: 600px;
  overflow-y: auto;
  line-height: 1.6;
}

.log::-webkit-scrollbar {
  width: 8px;
}

.log::-webkit-scrollbar-track {
  background: #2d2d2d;
  border-radius: 4px;
}

.log::-webkit-scrollbar-thumb {
  background: #4ec9b0;
  border-radius: 4px;
}

.log::-webkit-scrollbar-thumb:hover {
  background: #5fd4bd;
}

.log div {
  margin: 2px 0;
  word-break: break-all;
}
</style>

import React, { useRef, useState, useEffect, useCallback } from 'react'
import ScrollSeamless, { ScrollSeamlessRef, ScrollEventType } from 'scroll-seamless'
import './App.css'

interface ConfigState {
  direction: 'left' | 'right' | 'up' | 'down'
  step: number
  rows: number
  cols: number
  stepWait: number
  delay: number
  autoStart: boolean
  hoverStop: boolean
  hoverDelay: number
  leaveDelay: number
  wheelEnable: boolean
  wheelSensitivity: number
  wheelStep: number
  fadeEdge: { enabled: boolean; size: number }
  virtualScroll: boolean
  bufferSize: number
  customContent: boolean
  keepRafOnPause: boolean
  enableDomEvents: boolean
  eventThrottle: number
  minPoolSize: number
  maxPoolSize: number
  warmupPool: boolean
  minCountToScroll: number
  performance: boolean
}

const generateData = (count: number): string[] => {
  return Array.from({ length: count }, (_, i) => `Item ${i + 1}`)
}

const getRandomColor = (): string => {
  const colors = [
    '#667eea', '#764ba2', '#f093fb', '#4facfe', 
    '#43e97b', '#fa709a', '#fee140', '#30cfd0',
    '#a8edea', '#ff9a9e', '#ffecd2', '#ff8a80'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

const getEmoji = (index: number): string => {
  const emojis = ['🎯', '🚀', '💎', '⭐', '🔥', '💡', '🎨', '🎪', '🎭', '🎬']
  return emojis[index % emojis.length]
}

const App: React.FC = () => {
  const scrollRef = useRef<ScrollSeamlessRef>(null)
  const logContainerRef = useRef<HTMLDivElement>(null)
  
  const [logs, setLogs] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [position, setPosition] = useState(0)
  const [cycleCount, setCycleCount] = useState(0)
  const [currentData, setCurrentData] = useState<string[]>(generateData(10))
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  const [config, setConfig] = useState<ConfigState>({
    direction: 'left',
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

  // 自定义渲染函数
  const renderCustomItem = useCallback((item: string, index: number): HTMLElement => {
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
  }, [])

  const addLog = useCallback((message: string, data?: any) => {
    const time = new Date().toLocaleTimeString()
    let log = `[${time}] ${message}`
    
    if (data && typeof data === 'object') {
      log += ' ' + JSON.stringify(data)
    }
    
    setLogs(prev => {
      const newLogs = [...prev, log]
      if (newLogs.length > 100) {
        newLogs.shift()
      }
      return newLogs
    })
    
    // 滚动到底部
    setTimeout(() => {
      if (logContainerRef.current) {
        logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
      }
    }, 0)
  }, [])

  const handleEvent = useCallback((type: ScrollEventType, data: any) => {
    addLog(`📨 ${type}`, data)
  }, [addLog])

  // 定时更新状态
  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current) {
        setIsRunning(scrollRef.current.getIsRunning())
        setIsPaused(scrollRef.current.getIsPaused())
        setPosition(Math.round(scrollRef.current.getPosition()))
        setCycleCount(scrollRef.current.getCycleCount())
      }
    }, 500)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    addLog('🎉 React 测试页面加载完成')
  }, [addLog])

  const startScroll = () => {
    scrollRef.current?.start()
    addLog('▶️ 开始滚动')
  }

  const stopScroll = () => {
    scrollRef.current?.stop()
    addLog('⏹️ 停止滚动')
  }

  const pauseScroll = () => {
    scrollRef.current?.pause()
    addLog('⏸️ 暂停滚动')
  }

  const resumeScroll = () => {
    scrollRef.current?.resume()
    addLog('▶️ 恢复滚动')
  }

  const setDataCount = (count: number) => {
    setCurrentData(generateData(count))
    addLog(`📊 数据量: ${count}条`)
  }

  const updateConfig = (partial: Partial<ConfigState>) => {
    setConfig(prev => ({ ...prev, ...partial }))
  }

  const performanceConfig = {
    enabled: true,
    fps: true,
    memory: true,
    updateInterval: 1000,
    onUpdate: (metrics: any) => {
      addLog(`📈 FPS: ${metrics.fps.toFixed(1)}, 内存: ${(metrics.memory?.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`)
    }
  }

  return (
    <div className="demo-container">
      <h1>🚀 Scroll Seamless v2.0 - React 全功能测试</h1>

      <div className="main-layout">
        {/* 左侧面板 */}
        <div className="left-panel">
          {/* 状态栏 */}
          <div className="status-bar">
            <div className="status-item">
              <span className="status-label">运行:</span>
              <span className="status-value">{String(isRunning)}</span>
            </div>
            <div className="status-item">
              <span className="status-label">暂停:</span>
              <span className="status-value">{String(isPaused)}</span>
            </div>
            <div className="status-item">
              <span className="status-label">位置:</span>
              <span className="status-value">{position}</span>
            </div>
            <div className="status-item">
              <span className="status-label">循环:</span>
              <span className="status-value">{cycleCount}</span>
            </div>
          </div>

          {/* 测试区域 */}
          <div className="test-area">
            <h3>📺 滚动展示区域</h3>
            <div className="scroll-box">
              <ScrollSeamless
                ref={scrollRef}
                data={currentData}
                direction={config.direction}
                step={config.step}
                rows={config.rows}
                cols={config.cols}
                stepWait={config.stepWait}
                delay={config.delay}
                autoStart={config.autoStart}
                hoverStop={config.hoverStop}
                hoverDelay={config.hoverDelay}
                leaveDelay={config.leaveDelay}
                wheelEnable={config.wheelEnable}
                wheelSensitivity={config.wheelSensitivity}
                wheelStep={config.wheelStep}
                fadeEdge={config.fadeEdge}
                virtualScroll={config.virtualScroll}
                bufferSize={config.bufferSize}
                renderItem={config.customContent ? renderCustomItem : undefined}
                keepRafOnPause={config.keepRafOnPause}
                enableDomEvents={config.enableDomEvents}
                eventThrottle={config.eventThrottle}
                minPoolSize={config.minPoolSize}
                maxPoolSize={config.maxPoolSize}
                warmupPool={config.warmupPool}
                minCountToScroll={config.minCountToScroll}
                performance={config.performance ? performanceConfig : undefined}
                onEvent={handleEvent}
              />
            </div>
          </div>

          {/* 控制面板 */}
          <div className="control-panel">
            <h3>🎮 控制面板</h3>
            
            {/* 方向选择 */}
            <div className="control-group">
              <label>🧭 滚动方向</label>
              <select 
                value={config.direction}
                onChange={(e) => updateConfig({ direction: e.target.value as any })}
              >
                <option value="left">⬅️ 向左滚动</option>
                <option value="right">➡️ 向右滚动</option>
                <option value="up">⬆️ 向上滚动</option>
                <option value="down">⬇️ 向下滚动</option>
              </select>
            </div>

            {/* 速度控制 */}
            <div className="control-group">
              <label>⚡ 滚动速度</label>
              <div className="slider-container">
                <input 
                  type="range" 
                  min="0.1" 
                  max="5" 
                  step="0.1"
                  value={config.step}
                  onChange={(e) => updateConfig({ step: parseFloat(e.target.value) })}
                />
                <span className="slider-value">{config.step.toFixed(1)}</span>
              </div>
            </div>

            {/* 播放控制 */}
            <div className="control-group">
              <label>▶️ 播放控制</label>
              <div className="button-group">
                <button className="success" onClick={startScroll}>▶️ 开始</button>
                <button className="danger" onClick={stopScroll}>⏹️ 停止</button>
                <button className="warning" onClick={pauseScroll}>⏸️ 暂停</button>
                <button onClick={resumeScroll}>▶️ 恢复</button>
              </div>
            </div>

            {/* 数据量 */}
            <div className="control-group">
              <label>📊 数据量</label>
              <div className="data-buttons">
                <button onClick={() => setDataCount(10)}>10条</button>
                <button onClick={() => setDataCount(50)}>50条</button>
                <button onClick={() => setDataCount(100)}>100条</button>
                <button onClick={() => setDataCount(200)}>200条</button>
              </div>
            </div>

            {/* 自定义内容 */}
            <div className="control-group custom-content-section">
              <label className="custom-content-label">
                <span>🎨 自定义内容渲染</span>
                <input 
                  type="checkbox" 
                  checked={config.customContent}
                  onChange={(e) => updateConfig({ customContent: e.target.checked })}
                />
              </label>
              <div className="custom-content-hint">
                <span>✨ 启用后显示：</span>
                <span>• 彩色渐变卡片 • Emoji图标 • 悬停动画 • 序号标签</span>
              </div>
              <div className="custom-content-tip">
                💡 提示：勾选后立即生效，再次勾选恢复默认样式
              </div>
            </div>

            {/* 多行/多列布局 */}
            <div className="control-group">
              <label>📐 多行/多列布局</label>
              <div className="slider-container">
                <span style={{ minWidth: 50, fontSize: 13 }}>行数:</span>
                <input 
                  type="number" 
                  min="1" 
                  max="10"
                  value={config.rows}
                  onChange={(e) => updateConfig({ rows: parseInt(e.target.value) || 1 })}
                  style={{ width: 80, padding: 6 }}
                />
                <span style={{ minWidth: 50, fontSize: 13, marginLeft: 12 }}>列数:</span>
                <input 
                  type="number" 
                  min="1" 
                  max="10"
                  value={config.cols}
                  onChange={(e) => updateConfig({ cols: parseInt(e.target.value) || 1 })}
                  style={{ width: 80, padding: 6 }}
                />
              </div>
            </div>

            {/* 单步停顿 */}
            <div className="control-group">
              <label>⏱️ 单步停顿 (stepWait)</label>
              <div className="slider-container">
                <input 
                  type="range" 
                  min="0" 
                  max="1000" 
                  step="50"
                  value={config.stepWait}
                  onChange={(e) => updateConfig({ stepWait: parseInt(e.target.value) })}
                />
                <span className="slider-value">{config.stepWait}ms</span>
              </div>
            </div>

            {/* 延迟启动 */}
            <div className="control-group">
              <label>⏰ 延迟启动 (delay)</label>
              <div className="slider-container">
                <input 
                  type="range" 
                  min="0" 
                  max="3000" 
                  step="100"
                  value={config.delay}
                  onChange={(e) => updateConfig({ delay: parseInt(e.target.value) })}
                />
                <span className="slider-value">{config.delay}ms</span>
              </div>
            </div>

            {/* 鼠标交互 */}
            <div className="control-group">
              <label>
                <input 
                  type="checkbox" 
                  checked={config.hoverStop}
                  onChange={(e) => updateConfig({ hoverStop: e.target.checked })}
                  style={{ marginRight: 8 }}
                />
                🖱️ 鼠标悬停暂停 (hoverStop)
              </label>
            </div>

            <div className="control-group">
              <label>🕒 悬停延迟 (hoverDelay)</label>
              <div className="slider-container">
                <input 
                  type="range" 
                  min="0" 
                  max="1000" 
                  step="50"
                  value={config.hoverDelay}
                  onChange={(e) => updateConfig({ hoverDelay: parseInt(e.target.value) })}
                />
                <span className="slider-value">{config.hoverDelay}ms</span>
              </div>
            </div>

            <div className="control-group">
              <label>🕒 离开延迟 (leaveDelay)</label>
              <div className="slider-container">
                <input 
                  type="range" 
                  min="0" 
                  max="1000" 
                  step="50"
                  value={config.leaveDelay}
                  onChange={(e) => updateConfig({ leaveDelay: parseInt(e.target.value) })}
                />
                <span className="slider-value">{config.leaveDelay}ms</span>
              </div>
            </div>

            {/* 滚轮控制 */}
            <div className="control-group">
              <label>
                <input 
                  type="checkbox" 
                  checked={config.wheelEnable}
                  onChange={(e) => updateConfig({ wheelEnable: e.target.checked })}
                  style={{ marginRight: 8 }}
                />
                🎡 滚轮控制 (wheelEnable)
              </label>
            </div>

            <div className="control-group">
              <label>📊 滚轮灵敏度 (wheelSensitivity)</label>
              <div className="slider-container">
                <input 
                  type="range" 
                  min="0.1" 
                  max="3" 
                  step="0.1"
                  value={config.wheelSensitivity}
                  onChange={(e) => updateConfig({ wheelSensitivity: parseFloat(e.target.value) })}
                />
                <span className="slider-value">{config.wheelSensitivity.toFixed(1)}</span>
              </div>
            </div>

            <div className="control-group">
              <label>📏 滚轮步进 (wheelStep)</label>
              <div className="slider-container">
                <input 
                  type="range" 
                  min="1" 
                  max="50" 
                  step="1"
                  value={config.wheelStep}
                  onChange={(e) => updateConfig({ wheelStep: parseInt(e.target.value) })}
                />
                <span className="slider-value">{config.wheelStep}px</span>
              </div>
            </div>

            {/* 渐隐边缘 */}
            <div className="control-group">
              <label>
                <input 
                  type="checkbox" 
                  checked={config.fadeEdge.enabled}
                  onChange={(e) => updateConfig({ fadeEdge: { ...config.fadeEdge, enabled: e.target.checked } })}
                  style={{ marginRight: 8 }}
                />
                🌫️ 渐隐边缘 (fadeEdge)
              </label>
            </div>

            <div className="control-group">
              <label>📏 渐隐宽度 (fadeEdge.size)</label>
              <div className="slider-container">
                <input 
                  type="range" 
                  min="10" 
                  max="200" 
                  step="10"
                  value={config.fadeEdge.size}
                  onChange={(e) => updateConfig({ fadeEdge: { ...config.fadeEdge, size: parseInt(e.target.value) } })}
                />
                <span className="slider-value">{config.fadeEdge.size}px</span>
              </div>
            </div>

            {/* 虚拟滚动 */}
            <div className="control-group">
              <label>
                <input 
                  type="checkbox" 
                  checked={config.virtualScroll}
                  onChange={(e) => updateConfig({ virtualScroll: e.target.checked })}
                  style={{ marginRight: 8 }}
                />
                ⚡ 虚拟滚动 (virtualScroll)
              </label>
            </div>

            <div className="control-group">
              <label>📦 缓冲区大小 (bufferSize)</label>
              <div className="slider-container">
                <input 
                  type="range" 
                  min="0" 
                  max="20" 
                  step="1"
                  value={config.bufferSize}
                  onChange={(e) => updateConfig({ bufferSize: parseInt(e.target.value) })}
                />
                <span className="slider-value">{config.bufferSize}</span>
              </div>
            </div>

            {/* 高级配置 */}
            <div className="control-group">
              <label 
                onClick={() => setShowAdvanced(!showAdvanced)} 
                className="advanced-toggle"
              >
                <span>🔧 高级配置</span>
                <span className={showAdvanced ? '' : 'arrow-rotated'}>▼</span>
              </label>
              {showAdvanced && (
                <div className="advanced-panel">
                  {/* 动画控制 */}
                  <div className="advanced-section">
                    <label>🎬 动画控制</label>
                    <div>
                      <label>
                        <input 
                          type="checkbox" 
                          checked={config.autoStart}
                          onChange={(e) => updateConfig({ autoStart: e.target.checked })}
                          style={{ marginRight: 8 }}
                        />
                        自动启动 (autoStart)
                      </label>
                      <label>
                        <input 
                          type="checkbox" 
                          checked={config.keepRafOnPause}
                          onChange={(e) => updateConfig({ keepRafOnPause: e.target.checked })}
                          style={{ marginRight: 8 }}
                        />
                        保持RAF (keepRafOnPause)
                      </label>
                    </div>
                  </div>

                  {/* 事件配置 */}
                  <div className="advanced-section">
                    <label>📨 事件配置</label>
                    <div>
                      <label>
                        <input 
                          type="checkbox" 
                          checked={config.enableDomEvents}
                          onChange={(e) => updateConfig({ enableDomEvents: e.target.checked })}
                          style={{ marginRight: 8 }}
                        />
                        DOM事件 (enableDomEvents)
                      </label>
                      <div>
                        <label>事件节流 (eventThrottle):</label>
                        <div className="slider-container">
                          <input 
                            type="range" 
                            min="0" 
                            max="500" 
                            step="10"
                            value={config.eventThrottle}
                            onChange={(e) => updateConfig({ eventThrottle: parseInt(e.target.value) })}
                          />
                          <span className="slider-value">{config.eventThrottle}ms</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 对象池配置 */}
                  <div className="advanced-section">
                    <label>🗄️ 对象池配置</label>
                    <div>
                      <div>
                        <label>最小池大小 (minPoolSize):</label>
                        <input 
                          type="number" 
                          min="0" 
                          max="50"
                          value={config.minPoolSize}
                          onChange={(e) => updateConfig({ minPoolSize: parseInt(e.target.value) || 0 })}
                          style={{ width: 80, marginLeft: 8 }}
                        />
                      </div>
                      <div>
                        <label>最大池大小 (maxPoolSize):</label>
                        <input 
                          type="number" 
                          min="10" 
                          max="200"
                          value={config.maxPoolSize}
                          onChange={(e) => updateConfig({ maxPoolSize: parseInt(e.target.value) || 100 })}
                          style={{ width: 80, marginLeft: 8 }}
                        />
                      </div>
                      <label>
                        <input 
                          type="checkbox" 
                          checked={config.warmupPool}
                          onChange={(e) => updateConfig({ warmupPool: e.target.checked })}
                          style={{ marginRight: 8 }}
                        />
                        预热池 (warmupPool)
                      </label>
                    </div>
                  </div>

                  {/* 最小滚动数量 */}
                  <div className="advanced-section">
                    <label>📊 最小滚动数量</label>
                    <div>
                      <input 
                        type="number" 
                        min="1" 
                        max="10"
                        value={config.minCountToScroll}
                        onChange={(e) => updateConfig({ minCountToScroll: parseInt(e.target.value) || 2 })}
                        style={{ width: 80 }}
                      />
                      <span style={{ fontSize: 12, color: '#999', marginLeft: 8 }}>(minCountToScroll)</span>
                    </div>
                  </div>

                  {/* 性能监控 */}
                  <div className="advanced-section">
                    <label>📈 性能监控</label>
                    <div>
                      <label>
                        <input 
                          type="checkbox" 
                          checked={config.performance}
                          onChange={(e) => updateConfig({ performance: e.target.checked })}
                          style={{ marginRight: 8 }}
                        />
                        启用性能监控 (performance.enabled)
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右侧日志面板 */}
        <div className="right-panel">
          <div className="log-panel">
            <h3>📝 运行日志</h3>
            <div className="log" ref={logContainerRef}>
              {logs.map((log, index) => (
                <div key={index}>{log}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

import { ScrollSeamless } from '../dist/core/index.esm.js';
import { createVirtualScrollPlugin } from '../dist/plugins/index.esm.js';

// 生成大量测试数据
function generateLargeData(count = 10000) {
  const data = [];
  for (let i = 0; i < count; i++) {
    data.push(`Item ${i + 1} - ${Math.random().toString(36).substr(2, 9)}`);
  }
  return data;
}

// 创建虚拟滚动插件
const virtualScrollPlugin = createVirtualScrollPlugin({
  enabled: true,
  itemWidth: 200,  // 每个 item 宽度
  itemHeight: 40,  // 每个 item 高度
  bufferSize: 10,  // 缓冲区大小
  onRender: (startIndex, endIndex, visibleCount) => {
    console.log(`渲染范围: ${startIndex} - ${endIndex}, 可见数量: ${visibleCount}`);
  }
});

// 创建容器
const container = document.createElement('div');
container.style.cssText = `
  width: 800px;
  height: 200px;
  border: 1px solid #ccc;
  margin: 20px;
  overflow: hidden;
  position: relative;
`;

// 创建内容区域
const content1 = document.createElement('div');
content1.className = 'ss-content';
content1.style.cssText = `
  position: absolute;
  top: 0;
  left: 0;
  display: inline-block;
  white-space: nowrap;
`;

const content2 = document.createElement('div');
content2.className = 'ss-content';
content2.style.cssText = `
  position: absolute;
  top: 0;
  left: 0;
  display: inline-block;
  white-space: nowrap;
`;

container.appendChild(content1);
container.appendChild(content2);
document.body.appendChild(container);

// 生成大数据
const largeData = generateLargeData(10000);

// 创建滚动实例
const scrollInstance = new ScrollSeamless(container, {
  data: largeData,
  direction: 'horizontal',
  step: 1,
  hoverStop: true,
  wheelEnable: true,
  plugins: [virtualScrollPlugin],
  onEvent: (event, data) => {
    if (event === 'virtual-scroll-update') {
      console.log('虚拟滚动性能指标:', data);
    }
  }
});

// 添加控制按钮
const controls = document.createElement('div');
controls.style.cssText = `
  margin: 20px;
  padding: 10px;
  border: 1px solid #ddd;
  background: #f9f9f9;
`;

const startBtn = document.createElement('button');
startBtn.textContent = '开始滚动';
startBtn.onclick = () => scrollInstance.start();

const stopBtn = document.createElement('button');
stopBtn.textContent = '停止滚动';
stopBtn.onclick = () => scrollInstance.stop();

const metricsBtn = document.createElement('button');
metricsBtn.textContent = '查看性能指标';
metricsBtn.onclick = () => {
  const metrics = virtualScrollPlugin.getMetrics();
  console.log('当前性能指标:', metrics);
  alert(`总数据: ${metrics.totalItems}\n渲染数量: ${metrics.renderedItems}\n可见数量: ${metrics.visibleItems}`);
};

controls.appendChild(startBtn);
controls.appendChild(stopBtn);
controls.appendChild(metricsBtn);
document.body.appendChild(controls);

// 性能对比说明
const info = document.createElement('div');
info.innerHTML = `
  <h3>虚拟滚动性能优化</h3>
  <p>数据总量: ${largeData.length} 条</p>
  <p>传统渲染: 需要渲染 ${largeData.length * 2} 个 DOM 节点</p>
  <p>虚拟滚动: 只渲染可视区域 + 缓冲区的节点</p>
  <p>性能提升: 显著减少内存占用和渲染时间</p>
`;
info.style.cssText = `
  margin: 20px;
  padding: 15px;
  border: 1px solid #4CAF50;
  background: #E8F5E8;
  border-radius: 4px;
`;
document.body.appendChild(info);

console.log('虚拟滚动示例已加载，数据总量:', largeData.length); 
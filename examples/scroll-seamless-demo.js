// 示例：如何在浏览器中使用 SeamlessScroll
// 假设已通过 <script> 标签引入打包后的 JS 文件
// 或通过 npm 安装并打包到 dist/seamless-scroll.js

// HTML:
// <div id="scroll-container" style="width: 400px; height: 40px; border: 1px solid #ccc;"></div>

// JS:
document.addEventListener('DOMContentLoaded', function () {
  const container = document.getElementById('scroll-container');
  const scroll = new window.SeamlessScroll(container, {
    data: ['无缝', '滚动', '示例', 'Seamless', 'Scroll', 'Demo'],
    direction: 'horizontal',
    step: 1,
    stepWait: 10,
    minCountToScroll: 2,
    hoverStop: true,
    wheelEnable: true,
  });

  // 动态更新数据
  setTimeout(() => {
    scroll.updateData(['新数据1', '新数据2', '新数据3']);
  }, 5000);

  // 停止滚动
  // scroll.stop();

  // 销毁实例
  // scroll.destroy();
}); 
import React, { useRef, useState } from 'react';
import SeamlessScroll from '../src/react/SeamlessScroll';

export default function SeamlessScrollDemo() {
  const [items, setItems] = useState(['无缝', '滚动', '示例', 'Seamless', 'Scroll', 'Demo']);
  const scrollRef = useRef();

  const updateData = () => {
    setItems(['新数据1', '新数据2', '新数据3']);
    // 也可以通过 scrollRef.current?.updateData([...]) 强制更新
  };

  return (
    <div>
      <div style={{ width: 400, height: 40, border: '1px solid #ccc' }}>
        <SeamlessScroll
          ref={scrollRef}
          data={items}
          direction="horizontal"
          step={1}
          stepWait={10}
          minCountToScroll={2}
          hoverStop={true}
          wheelEnable={true}
        >
          {items.map(item => (
            <span key={item} style={{ margin: '0 8px' }}>{item}</span>
          ))}
        </SeamlessScroll>
      </div>
      <button onClick={updateData}>更新数据</button>
    </div>
  );
} 
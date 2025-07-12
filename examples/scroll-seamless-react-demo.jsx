import React, { useRef } from 'react';
import { ScrollSeamless } from '../dist/react/index.esm.js';

const ReactDemo = () => {
  const scrollRef = useRef(null);
  const data = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'];

  const handleStart = () => {
    scrollRef.current?.start();
  };

  const handleStop = () => {
    scrollRef.current?.stop();
  };

  return (
    <div style={{ width: '300px', height: '50px', border: '1px solid #ccc' }}>
      <ScrollSeamless
        ref={scrollRef}
        data={data}
        direction="horizontal"
        step={1}
        hoverStop={true}
        wheelEnable={true}
      >
        {/* 函数式 children - 渲染单个项目 */}
        {(item, index) => (
          <div key={index} style={{ 
            padding: '10px', 
            margin: '0 5px', 
            backgroundColor: '#f0f0f0',
            borderRadius: '4px',
            display: 'inline-block'
          }}>
            {item}
          </div>
        )}
      </ScrollSeamless>
      
      <div style={{ marginTop: '10px' }}>
        <button onClick={handleStart}>开始</button>
        <button onClick={handleStop}>停止</button>
      </div>
    </div>
  );
};

export default ReactDemo; 
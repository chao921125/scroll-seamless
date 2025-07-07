import React, { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import SeamlessScroll from '../src/react/SeamlessScroll';

describe('SeamlessScroll (React)', () => {
  it('可以正常渲染', () => {
    render(
      <SeamlessScroll data={['A', 'B', 'C']} direction="horizontal" />
    );
    const itemsA = screen.getAllByText('A');
    expect(itemsA.length).toBeGreaterThanOrEqual(1);
  });

  it('支持数据更新', () => {
    const { rerender } = render(
      <SeamlessScroll data={['A', 'B', 'C']} direction="horizontal" />
    );
    rerender(<SeamlessScroll data={['X', 'Y']} direction="horizontal" />);
    const itemsX = screen.getAllByText('X');
    expect(itemsX.length).toBeGreaterThanOrEqual(1);
  });

  it('ref 支持方法调用', () => {
    const ref = createRef();
    render(
      <SeamlessScroll ref={ref} data={['A', 'B', 'C']} direction="horizontal" />
    );
    expect(typeof ref.current?.start).toBe('function');
    expect(typeof ref.current?.stop).toBe('function');
    expect(typeof ref.current?.updateData).toBe('function');
  });
}); 
import React, { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { ScrollSeamless } from '../src/react';

describe('ScrollSeamless (React)', () => {
  it('可以正常渲染', () => {
    render(
      <ScrollSeamless data={['A', 'B', 'C']} direction="horizontal">
        {(item, index) => <span key={index}>{item}</span>}
      </ScrollSeamless>
    );
    const itemsA = screen.getAllByText('A');
    expect(itemsA.length).toBeGreaterThanOrEqual(1);
  });

  it('支持数据更新', () => {
    const { rerender } = render(
      <ScrollSeamless data={['A', 'B', 'C']} direction="horizontal">
        {(item, index) => <span key={index}>{item}</span>}
      </ScrollSeamless>
    );
    rerender(
      <ScrollSeamless data={['X', 'Y']} direction="horizontal">
        {(item, index) => <span key={index}>{item}</span>}
      </ScrollSeamless>
    );
    const itemsX = screen.getAllByText('X');
    expect(itemsX.length).toBeGreaterThanOrEqual(1);
  });

  it('ref 支持方法调用', () => {
    const ref = createRef();
    render(
      <ScrollSeamless ref={ref} data={['A', 'B', 'C']} direction="horizontal">
        {(item, index) => <span key={index}>{item}</span>}
      </ScrollSeamless>
    );
    expect(typeof ref.current?.start).toBe('function');
    expect(typeof ref.current?.stop).toBe('function');
    expect(typeof ref.current?.updateData).toBe('function');
  });
}); 
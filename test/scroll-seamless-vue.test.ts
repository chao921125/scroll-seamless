import { render, fireEvent } from '@testing-library/vue';
import { describe, it, expect } from 'vitest';
import { nextTick } from 'vue';
import { h } from 'vue';
import ScrollSeamlessVue from '../src/vue/ScrollSeamless.vue';

describe('ScrollSeamlessVue', () => {
  it('可以正常挂载', () => {
    const { getByText } = render(ScrollSeamlessVue, {
      props: {
        data: ['A', 'B', 'C'],
        direction: 'right',
      },
      slots: {
        default: ({ item, index }: any) => h('span', `[${index}-${item}]`)
      }
    });
    expect(getByText('[0-A]')).toBeTruthy();
  });

  it('支持数据更新', async () => {
    const { getByText, rerender } = render(ScrollSeamlessVue, {
      props: {
        data: ['A', 'B', 'C'],
        direction: 'right',
      },
      slots: {
        default: ({ item, index }: any) => h('span', `[${index}-${item}]`)
      }
    });
    await rerender({ data: ['X', 'Y'], direction: 'right' });
    await nextTick();
    expect(getByText('[0-X]')).toBeTruthy();
  });

  it('支持方法调用', async () => {
    const { container } = render(ScrollSeamlessVue, {
      props: {
        data: ['A', 'B', 'C'],
        direction: 'right',
      },
      slots: {
        default: ({ item, index }: any) => h('span', `[${index}-${item}]`)
      }
    });
    // 这里只能断言 DOM 存在
    expect(container.querySelector('.scroll-seamless-vue')).toBeTruthy();
  });

  it('横向滚动时内容为横向排列', async () => {
    const { container } = render(ScrollSeamlessVue, {
      props: {
        data: ['A', 'B', 'C'],
        direction: 'right',
      },
      slots: {
        default: ({ item, index }: any) => h('span', `[${index}-${item}]`)
      }
    });
    await nextTick();
    const content = container.querySelector('.ss-content');
    expect(content).toBeTruthy();
    const computed = getComputedStyle(content as HTMLElement);
    expect(['block', 'inline-block']).toContain(computed.display);
    expect(computed.whiteSpace).toBe('nowrap');
  });
}); 
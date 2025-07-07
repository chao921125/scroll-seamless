import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import { h, nextTick } from 'vue';
import ScrollSeamlessVue from '../src/vue/ScrollSeamless.vue';

describe('ScrollSeamlessVue', () => {
  it('可以正常挂载', () => {
    const wrapper = mount(ScrollSeamlessVue, {
      props: {
        data: ['A', 'B', 'C'],
        direction: 'horizontal',
      },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('支持数据更新', async () => {
    const wrapper = mount(ScrollSeamlessVue, {
      props: {
        data: ['A', 'B', 'C'],
        direction: 'horizontal',
      },
    });
    await wrapper.setProps({ data: ['X', 'Y'] });
    await nextTick();
    expect((wrapper.props() as any).data).toEqual(['X', 'Y']);
  });

  it('支持方法调用', async () => {
    const wrapper = mount(ScrollSeamlessVue, {
      props: {
        data: ['A', 'B', 'C'],
        direction: 'horizontal',
      },
    });
    const vm = wrapper.vm as any;
    expect(typeof vm.start).toBe('function');
    expect(typeof vm.stop).toBe('function');
    expect(typeof vm.updateData).toBe('function');
  });

  it('横向滚动时内容为横向排列', async () => {
    const wrapper = mount(ScrollSeamlessVue, {
      props: {
        data: ['A', 'B', 'C'],
        direction: 'horizontal',
      },
      slots: {
        default: () => [h('span', 'A'), h('span', 'B'), h('span', 'C')]
      }
    });
    await nextTick();
    const content = wrapper.find('.ss-content');
    expect(content.exists()).toBe(true);
    const computed = getComputedStyle(content.element as HTMLElement);
    expect(['block', 'inline-block']).toContain(computed.display);
    expect(computed.whiteSpace).toBe('nowrap');
  });
}); 
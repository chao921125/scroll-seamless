import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import SeamlessScrollVue from '../src/vue/SeamlessScroll.vue';
import { nextTick } from 'vue';

describe('SeamlessScrollVue', () => {
  it('可以正常挂载', () => {
    const wrapper = mount(SeamlessScrollVue, {
      props: {
        data: ['A', 'B', 'C'],
        direction: 'horizontal',
      },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('支持数据更新', async () => {
    const wrapper = mount(SeamlessScrollVue, {
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
    const wrapper = mount(SeamlessScrollVue, {
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
}); 
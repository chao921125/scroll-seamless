import { ScrollSeamlessPlugin, ScrollSeamlessController } from '../../types';

/**
 * 插件管理器类
 * 负责管理和协调插件的生命周期
 */
export class PluginManager {
  private plugins: Map<string, ScrollSeamlessPlugin> = new Map();
  private controller: ScrollSeamlessController;

  constructor(controller: ScrollSeamlessController) {
    this.controller = controller;
  }

  /**
   * 注册插件
   * @param plugin 插件实例
   */
  register(plugin: ScrollSeamlessPlugin): void {
    if (this.plugins.has(plugin.id)) {
      console.warn(`Plugin with id "${plugin.id}" is already registered. Skipping.`);
      return;
    }

    try {
      // 应用插件
      plugin.apply(this.controller);
      // 存储插件引用
      this.plugins.set(plugin.id, plugin);
    } catch (error) {
      console.error(`Failed to register plugin "${plugin.id}":`, error);
    }
  }

  /**
   * 注销插件
   * @param pluginId 插件ID
   */
  unregister(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      console.warn(`Plugin with id "${pluginId}" is not registered. Skipping.`);
      return;
    }

    try {
      // 调用插件的销毁方法（如果有）
      if (plugin.destroy) {
        plugin.destroy();
      }
      // 移除插件引用
      this.plugins.delete(pluginId);
    } catch (error) {
      console.error(`Failed to unregister plugin "${pluginId}":`, error);
    }
  }

  /**
   * 获取插件实例
   * @param pluginId 插件ID
   * @returns 插件实例或null
   */
  getPlugin(pluginId: string): ScrollSeamlessPlugin | null {
    return this.plugins.get(pluginId) || null;
  }

  /**
   * 获取所有已注册的插件
   * @returns 插件列表
   */
  getPlugins(): ScrollSeamlessPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * 销毁所有插件
   */
  destroyAll(): void {
    for (const [id, plugin] of this.plugins.entries()) {
      try {
        if (plugin.destroy) {
          plugin.destroy();
        }
      } catch (error) {
        console.error(`Failed to destroy plugin "${id}":`, error);
      }
    }
    this.plugins.clear();
  }
}
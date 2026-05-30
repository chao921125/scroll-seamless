/**
 * PluginManager - 插件管理器
 * 
 * 职责：
 * - 管理插件的生命周期
 * - 超时控制
 * - 错误处理
 */

import type { ScrollPlugin } from '../../types';
import { ErrorHandler } from './ErrorHandler';

export class PluginManager {
  private plugins: ScrollPlugin[] = [];
  private timeout: number;
  private strictMode: boolean;

  constructor(options: {
    timeout?: number;
    strictMode?: boolean;
  } = {}) {
    this.timeout = options.timeout ?? 5000;
    this.strictMode = options.strictMode ?? false;
  }

  /**
   * 应用插件
   */
  async applyPlugins(plugins: ScrollPlugin[], engine: any): Promise<void> {
    for (const plugin of plugins) {
      await this.applySinglePlugin(plugin, engine);
    }
  }

  /**
   * 应用单个插件
   */
  private async applySinglePlugin(plugin: ScrollPlugin, engine: any): Promise<void> {
    const pluginName = plugin.name || 'Unknown';
    
    try {
      // 超时控制
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Plugin ${pluginName} apply timeout`));
        }, this.timeout);
      });

      // 执行插件apply
      const applyPromise = Promise.resolve(plugin.apply(engine));

      await Promise.race([applyPromise, timeoutPromise]);

      // 存储插件实例
      this.plugins.push(plugin);

      ErrorHandler.logInfo(`Plugin ${pluginName} applied successfully`, 'PluginManager');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (this.strictMode) {
        throw new Error(`[PluginManager] Plugin ${pluginName} failed: ${errorMessage}`);
      } else {
        ErrorHandler.logWarning(`Plugin ${pluginName} failed: ${errorMessage}`, 'PluginManager');
      }
    }
  }

  /**
   * 销毁所有插件
   */
  destroy(): void {
    for (const plugin of this.plugins) {
      if (plugin.destroy) {
        try {
          plugin.destroy();
        } catch (error) {
          ErrorHandler.logError(error as Error, `PluginManager.destroy.${plugin.name}`);
        }
      }
    }
    this.plugins = [];
  }

  /**
   * 获取插件列表
   */
  getPlugins(): ReadonlyArray<ScrollPlugin> {
    return this.plugins;
  }
}

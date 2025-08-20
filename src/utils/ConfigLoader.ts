import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * 通用配置加载器
 * 提供安全的配置文件加载功能，支持多种配置类型
 */
export class ConfigLoader {
  private static instance: ConfigLoader;
  private cache: Map<string, any> = new Map();
  private readonly configPath: string;

  private constructor() {
    // 配置文件路径，默认为项目根目录下的json文件夹
    this.configPath = join(process.cwd(), 'json');
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): ConfigLoader {
    if (!ConfigLoader.instance) {
      ConfigLoader.instance = new ConfigLoader();
    }
    return ConfigLoader.instance;
  }

  /**
   * 安全加载配置文件
   * @param configName 配置文件名称（不含扩展名）
   * @param useCache 是否使用缓存，默认true
   * @returns 配置对象
   */
  public loadConfig<T = any>(configName: string, useCache: boolean = true): T {
    // 检查缓存
    if (useCache && this.cache.has(configName)) {
      return this.cache.get(configName) as T;
    }

    const configFile = join(this.configPath, `${configName}.json`);
    
    // 验证文件存在性和安全性
    if (!this.validateConfigFile(configFile)) {
      throw new Error(`Configuration file not found or invalid: ${configName}`);
    }

    try {
      const configData = readFileSync(configFile, 'utf-8');
      const parsedConfig = JSON.parse(configData);
      
      // 验证配置结构
      this.validateConfigStructure(configName, parsedConfig);
      
      // 缓存配置
      if (useCache) {
        this.cache.set(configName, parsedConfig);
      }
      
      return parsedConfig as T;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to load configuration ${configName}: ${errorMessage}`);
    }
  }

  /**
   * 加载物品配置
   */
  public loadItems(): ItemConfig[] {
    return this.loadConfig<ItemConfig[]>('items');
  }

  /**
   * 加载容器配置
   */
  public loadContainers(): Record<string, ContainerConfig> {
    return this.loadConfig<Record<string, ContainerConfig>>('containers');
  }

  /**
   * 加载布局配置
   */
  public loadLayouts(): Record<string, LayoutConfig> {
    return this.loadConfig<Record<string, LayoutConfig>>('layouts');
  }

  /**
   * 加载完整游戏配置
   */
  public loadGameConfig(): GameConfig {
    return {
      items: this.loadItems(),
      containers: this.loadContainers(),
      layouts: this.loadLayouts()
    };
  }

  /**
   * 清除缓存
   */
  public clearCache(configName?: string): void {
    if (configName) {
      this.cache.delete(configName);
    } else {
      this.cache.clear();
    }
  }

  /**
   * 重新加载配置（清除缓存后重新加载）
   */
  public reloadConfig<T = any>(configName: string): T {
    this.clearCache(configName);
    return this.loadConfig<T>(configName);
  }

  /**
   * 验证配置文件
   */
  private validateConfigFile(filePath: string): boolean {
    // 检查文件是否存在
    if (!existsSync(filePath)) {
      return false;
    }

    // 防止路径遍历攻击
    const normalizedPath = join(this.configPath, '');
    if (!filePath.startsWith(normalizedPath)) {
      throw new Error('Invalid configuration file path');
    }

    // 检查文件扩展名
    if (!filePath.endsWith('.json')) {
      throw new Error('Configuration file must be JSON format');
    }

    return true;
  }

  /**
   * 验证配置结构
   */
  private validateConfigStructure(configName: string, config: any): void {
    if (!config) {
      throw new Error(`Empty configuration: ${configName}`);
    }

    // 根据配置类型进行特定验证
    switch (configName) {
      case 'items':
        this.validateItemsConfig(config);
        break;
      case 'containers':
        this.validateContainersConfig(config);
        break;
      case 'layouts':
        this.validateLayoutsConfig(config);
        break;
    }
  }

  /**
   * 验证物品配置结构
   */
  private validateItemsConfig(config: any[]): void {
    if (!Array.isArray(config)) {
      throw new Error('Items configuration must be an array');
    }

    config.forEach((item, index) => {
      if (!item.id || !item.name || !item.quality || !item.size) {
        throw new Error(`Invalid item configuration at index ${index}: missing required fields`);
      }
    });
  }

  /**
   * 验证容器配置结构
   */
  private validateContainersConfig(config: Record<string, any>): void {
    if (typeof config !== 'object' || Array.isArray(config)) {
      throw new Error('Containers configuration must be an object');
    }

    Object.entries(config).forEach(([key, container]) => {
      if (!container.rarity || !container.layoutIds || !Array.isArray(container.layoutIds)) {
        throw new Error(`Invalid container configuration for ${key}: missing required fields`);
      }
    });
  }

  /**
   * 验证布局配置结构
   */
  private validateLayoutsConfig(config: Record<string, any>): void {
    if (typeof config !== 'object' || Array.isArray(config)) {
      throw new Error('Layouts configuration must be an object');
    }

    Object.entries(config).forEach(([key, layout]) => {
      if (!layout.name || !layout.positions || !Array.isArray(layout.positions)) {
        throw new Error(`Invalid layout configuration for ${key}: missing required fields`);
      }
    });
  }
}

// 类型定义
export interface ItemConfig {
  id: string;
  name: string;
  description?: string;
  quality: 'white' | 'green' | 'blue' | 'purple' | 'gold' | 'red';
  size: string;
  icon: string;
  weight: number;
  type?: string;
}

export interface ContainerConfig {
  cost: number;
  rarity: string;
  layoutIds: string[];
  color: string;
  description?: string;
}

export interface LayoutPosition {
  x: number;
  y: number;
  size: string;
  isSlot: boolean;
  slotId: string;
  weight?: number;
}

export interface LayoutConfig {
  name: string;
  description: string;
  width?: number;
  height?: number;
  positions: LayoutPosition[];
}

export interface GameConfig {
  items: ItemConfig[];
  containers: Record<string, ContainerConfig>;
  layouts: Record<string, LayoutConfig>;
}

// 导出单例实例
export const configLoader = ConfigLoader.getInstance();

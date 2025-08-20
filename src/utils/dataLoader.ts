import { GameConfig, Item } from '../types';

/**
 * 从公共目录加载游戏配置数据 (移除布局系统)
 */
export async function loadGameConfig(): Promise<GameConfig> {
  try {
    // 并行加载配置文件
    const [itemsResponse, containersResponse] = await Promise.all([
      fetch('/json/items.json'),
      fetch('/json/containers.json')
    ]);

    if (!itemsResponse.ok || !containersResponse.ok) {
      throw new Error('Failed to load one or more configuration files');
    }

    const [items, containers] = await Promise.all([
      itemsResponse.json(),
      containersResponse.json()
    ]);

    // 将items从对象转换为数组格式
    const itemsArray = Object.entries(items).map(([key, value]) => ({
      id: key,
      ...(value as any)
    }));

    return {
      items: itemsArray,
      containers
    };
  } catch (error) {
    console.error('Failed to load game config:', error);
    throw error;
  }
}

/**
 * 根据ID列表获取物品
 */
export function getItemsByIds(itemIds: string[], allItems: Item[]): Item[] {
  return itemIds.map(id => {
    const item = allItems.find(item => item.id === id);
    if (!item) {
      console.warn(`Item with ID ${id} not found`);
      return null;
    }
    return item;
  }).filter((item): item is Item => item !== null);
}

import { GameConfig, Item, Layout } from '../types';

/**
 * 从公共目录加载游戏配置数据 (使用模块化配置)
 */
export async function loadGameConfig(): Promise<GameConfig> {
  try {
    // 并行加载所有配置文件
    const [itemsResponse, containersResponse, layoutsResponse] = await Promise.all([
      fetch('/json/items.json'),
      fetch('/json/containers.json'),
      fetch('/json/layouts.json')
    ]);

    if (!itemsResponse.ok || !containersResponse.ok || !layoutsResponse.ok) {
      throw new Error('Failed to load one or more configuration files');
    }

    const [items, containers, layouts] = await Promise.all([
      itemsResponse.json(),
      containersResponse.json(),
      layoutsResponse.json()
    ]);

    // 将items从对象转换为数组格式
    const itemsArray = Object.entries(items).map(([key, value]) => ({
      id: key,
      ...(value as any)
    }));

    return {
      items: itemsArray,
      containers,
      layouts
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

/**
 * 根据ID列表获取布局
 */
export function getLayoutsByIds(layoutIds: string[], layoutRecord: Record<string, Layout>): Layout[] {
  return layoutIds.map(id => {
    const layout = layoutRecord[id];
    if (!layout) {
      console.warn(`Layout with ID ${id} not found`);
      return null;
    }
    return layout;
  }).filter((layout): layout is Layout => layout !== null);
}

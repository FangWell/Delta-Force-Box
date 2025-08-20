import { Item, Layout, AssignedItem } from '../types';

// 品质持续时间配置
export const QUALITY_DURATIONS: Record<number, number> = {
  1: 1000, // 白色
  2: 1000, // 绿色
  3: 1000, // 蓝色
  4: 1500, // 紫色
  5: 2000, // 金色
  6: 4000  // 红色
};

// 品质颜色配置
export const QUALITY_COLORS: Record<number, string> = {
  1: '#9E9E9E', // 白色
  2: '#4CAF50', // 绿色
  3: '#2196F3', // 蓝色
  4: '#9C27B0', // 紫色
  5: '#FF9800', // 金色
  6: '#F44336'  // 红色
};

// 网格配置
export const GRID_CONFIG = {
  CELL_SIZE: 80,
  GAP: 5,
  GRID_SIZE: 4,
  PADDING: 10  // 网格容器的padding
};

/**
 * 解析尺寸字符串为数字数组
 * @param sizeStr 尺寸字符串，如 "2x3"
 * @returns [width, height]
 */
export function parseSize(sizeStr: string): [number, number] {
  const [width, height] = sizeStr.split('x').map(Number);
  return [width, height];
}

/**
 * 加权随机选择
 * @param options 选项数组，每个选项必须有weight属性
 * @returns 选中的选项
 */
export function weightedRandomSelect<T extends { weight: number }>(options: T[]): T {
  const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);
  let rand = Math.random() * totalWeight;
  
  for (const opt of options) {
    rand -= opt.weight;
    if (rand <= 0) return opt;
  }
  
  return options[options.length - 1];
}

/**
 * 根据权重随机选择布局
 * @param layouts 布局数组
 * @returns 选中的布局
 */
export function selectLayout(layouts: Layout[]): Layout {
  // 如果只有一个布局，直接返回
  if (layouts.length === 1) {
    return layouts[0];
  }
  
  // 检查是否所有布局都有权重字段
  const hasWeights = layouts.every(layout => typeof layout.weight === 'number');
  
  if (hasWeights) {
    // 使用权重随机选择
    return weightedRandomSelect(layouts);
  } else {
    // 回退到等概率随机选择
    const randomIndex = Math.floor(Math.random() * layouts.length);
    return layouts[randomIndex];
  }
}

/**
 * 根据尺寸和权重随机选择物品
 * @param items 所有物品数据
 * @param targetSize 目标尺寸，如 "2x1"
 * @param itemPool 可选的物品池ID列表，用于限制选择范围
 * @returns 选中的物品
 */
export function selectItemBySize(items: Item[], targetSize: string, itemPool?: string[]): Item | null {
  let availableItems = items;
  
  // 如果指定了物品池，则只从物品池中选择
  if (itemPool && itemPool.length > 0) {
    availableItems = items.filter(item => itemPool.includes(item.id));
  }
  
  // 找到符合尺寸的所有物品
  const suitableItems = availableItems.filter(item => item.size === targetSize);
  
  if (suitableItems.length === 0) {
    console.warn(`没有找到尺寸为 ${targetSize} 的物品${itemPool ? '（在指定物品池中）' : ''}`);
    return null;
  }
  
  // 根据权重随机选择
  return weightedRandomSelect(suitableItems);
}

/**
 * 根据布局位置生成分配的物品（新版占位格系统）
 * @param layout 选中的布局
 * @param items 所有物品数据
 * @param itemPool 可选的物品池ID列表，用于限制选择范围
 * @returns 已分配的物品数组
 */
export function generateAssignedItems(layout: Layout, items: Item[], itemPool?: string[]): AssignedItem[] {
  const assignedItems: AssignedItem[] = [];
  
  for (const position of layout.positions) {
    if (position.isSlot && position.size) {
      // 占位格系统：根据尺寸和物品池随机选择物品
      const selectedItem = selectItemBySize(items, position.size, itemPool);
      
      if (selectedItem) {
        const [width, height] = parseSize(selectedItem.size);
        assignedItems.push({
          item: selectedItem,
          pos: [position.x, position.y],
          size: [width, height]
        });
      }
    } else if (position.itemId) {
      // 传统系统：使用固定物品ID
      const item = items.find(item => item.id === position.itemId);
      
      if (item) {
        const [width, height] = parseSize(item.size);
        assignedItems.push({
          item: item,
          pos: [position.x, position.y],
          size: [width, height]
        });
      } else {
        console.warn(`未找到物品ID: ${position.itemId}`);
      }
    }
  }
  
  return assignedItems;
}

/**
 * 计算物品在网格中的像素位置和大小
 * @param gridPos 网格位置 [x, y]
 * @param gridSize 网格大小 [width, height]
 * @returns 位置和大小信息
 */
export function calculateItemPosition(gridPos: [number, number], gridSize: [number, number]): {
  left: number;
  top: number;
  width: number;
  height: number;
} {
  const [x, y] = gridPos;
  const [width, height] = gridSize;
  const { CELL_SIZE, GAP, PADDING } = GRID_CONFIG;
  
  return {
    left: x * (CELL_SIZE + GAP) + PADDING,
    top: y * (CELL_SIZE + GAP) + PADDING,
    width: width * CELL_SIZE + (width - 1) * GAP,
    height: height * CELL_SIZE + (height - 1) * GAP
  };
}

/**
 * 延迟函数
 * @param ms 毫秒数
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

import { Item, AssignedItem, Container } from '../types';

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

// 响应式网格配置 - 根据屏幕宽度动态调整
export function getResponsiveGridConfig() {
  const screenWidth = window.innerWidth;
  const gridSize = 4;
  
  // 更准确地计算各种边距和空间占用，并增加视觉缓冲
  function calculateAvailableSpace() {
    // App层级的padding (App.module.scss)
    let appPadding = 20; // 默认
    if (screenWidth <= 360) appPadding = 10;  // 增加最小边距
    else if (screenWidth <= 480) appPadding = 12; // 增加边距
    else if (screenWidth <= 768) appPadding = 15;
    else if (screenWidth <= 1024) appPadding = 18;
    
    // Container层级的padding (ContainerOpening.module.scss)
    let containerPadding = 20; // 默认
    if (screenWidth <= 360) containerPadding = 10;  // 增加最小边距
    else if (screenWidth <= 480) containerPadding = 12; // 增加边距
    else if (screenWidth <= 768) containerPadding = 15;
    else if (screenWidth <= 1024) containerPadding = 18;
    
    // GridContainer的padding (ContainerOpening.module.scss中的gridContainer)
    let gridContainerPadding = 15; // 默认
    if (screenWidth <= 360) gridContainerPadding = 8;  // 增加最小边距
    else if (screenWidth <= 480) gridContainerPadding = 10; // 增加边距
    else if (screenWidth <= 768) gridContainerPadding = 12;
    else if (screenWidth <= 1024) gridContainerPadding = 14;
    
    // 预留空间：滚动条、边框、阴影等 + 额外的视觉缓冲
    let reservedSpace = 40; // 增加基础预留空间
    if (screenWidth <= 360) reservedSpace = 50;  // 小屏幕需要更多缓冲
    else if (screenWidth <= 480) reservedSpace = 45;
    
    // 计算实际可用宽度
    const totalHorizontalSpace = (appPadding * 2) + (containerPadding * 2) + (gridContainerPadding * 2) + reservedSpace;
    const availableWidth = screenWidth - totalHorizontalSpace;
    
    return {
      availableWidth: Math.max(availableWidth, 160), // 降低最小宽度但保证质量
      gridContainerPadding
    };
  }
  
  // 计算网格配置
  function calculateGridConfig() {
    const { availableWidth } = calculateAvailableSpace();
    
    // 根据屏幕尺寸确定gap大小，在小屏幕上减少gap以节省空间
    let gap = 4;
    if (screenWidth <= 360) gap = 1;     // 极小屏幕最小gap
    else if (screenWidth <= 480) gap = 2; // 小屏幕减小gap
    else if (screenWidth <= 768) gap = 3;
    
    // Grid组件内部的padding，在小屏幕上适当减少
    let gridPadding = 8;
    if (screenWidth <= 360) gridPadding = 3;  // 极小屏幕最小padding
    else if (screenWidth <= 480) gridPadding = 4; // 小屏幕减小padding
    else if (screenWidth <= 768) gridPadding = 6;
    
    // 计算单元格可用宽度
    const totalGapWidth = (gridSize - 1) * gap;
    const totalGridPadding = gridPadding * 2;
    const availableCellSpace = availableWidth - totalGapWidth - totalGridPadding;
    
    // 计算单元格大小（向下取整确保不会超出）
    const cellSize = Math.floor(availableCellSpace / gridSize);
    
    // 确保最小尺寸
    let minCellSize = 30;
    if (screenWidth >= 768) minCellSize = 50;
    else if (screenWidth >= 480) minCellSize = 40;
    
    return {
      CELL_SIZE: Math.max(cellSize, minCellSize),
      GAP: gap,
      GRID_SIZE: gridSize,
      PADDING: gridPadding
    };
  }
  
  // 桌面端使用固定配置（除非空间不够）
  if (screenWidth >= 1024) {
    const config = calculateGridConfig();
    const totalWidth = config.GRID_SIZE * config.CELL_SIZE + 
                      (config.GRID_SIZE - 1) * config.GAP + 
                      config.PADDING * 2;
    
    // 如果默认配置放得下，使用默认配置
    if (totalWidth <= calculateAvailableSpace().availableWidth) {
      return GRID_CONFIG;
    }
    // 否则使用计算的配置
    return config;
  }
  
  // 其他尺寸都使用计算的配置
  return calculateGridConfig();
}

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
 * 网格占用检测器
 */
class GridOccupancy {
  private grid: boolean[][];
  private width: number;
  private height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.grid = Array(height).fill(null).map(() => Array(width).fill(false));
  }

  /**
   * 检查指定位置和尺寸是否可以放置物品
   */
  canPlace(x: number, y: number, itemWidth: number, itemHeight: number): boolean {
    // 检查边界
    if (x + itemWidth > this.width || y + itemHeight > this.height) {
      return false;
    }

    // 检查是否被占用
    for (let row = y; row < y + itemHeight; row++) {
      for (let col = x; col < x + itemWidth; col++) {
        if (this.grid[row][col]) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * 占用指定位置
   */
  occupy(x: number, y: number, itemWidth: number, itemHeight: number): void {
    for (let row = y; row < y + itemHeight; row++) {
      for (let col = x; col < x + itemWidth; col++) {
        this.grid[row][col] = true;
      }
    }
  }

  /**
   * 寻找下一个可放置的位置（从左到右，从上到下）
   */
  findNextAvailablePosition(itemWidth: number, itemHeight: number): [number, number] | null {
    for (let y = 0; y <= this.height - itemHeight; y++) {
      for (let x = 0; x <= this.width - itemWidth; x++) {
        if (this.canPlace(x, y, itemWidth, itemHeight)) {
          return [x, y];
        }
      }
    }
    return null;
  }

  /**
   * 获取网格状态用于调试
   */
  getGrid(): boolean[][] {
    return this.grid.map(row => [...row]);
  }
}

/**
 * 从容器的道具池中根据权重随机选择道具
 * @param items 所有道具数据
 * @param itemPool 容器的道具池ID列表
 * @returns 随机选择的道具，如果没有找到则返回null
 */
export function selectRandomItem(items: Item[], itemPool: string[]): Item | null {
  // 从道具池中筛选出有效的道具
  const availableItems = items.filter(item => itemPool.includes(item.id));
  
  if (availableItems.length === 0) {
    console.warn('道具池中没有可用的道具');
    return null;
  }

  // 根据权重随机选择
  return weightedRandomSelect(availableItems);
}

/**
 * 随机生成道具数量
 * @param minItems 最小数量
 * @param maxItems 最大数量
 * @returns 随机的道具数量
 */
export function randomItemCount(minItems: number, maxItems: number): number {
  return Math.floor(Math.random() * (maxItems - minItems + 1)) + minItems;
}

/**
 * 动态生成容器内容 - 核心算法
 * @param container 容器配置
 * @param items 所有道具数据
 * @returns 已分配的道具数组
 */
export function generateContainerItems(container: Container, items: Item[]): AssignedItem[] {
  const assignedItems: AssignedItem[] = [];
  
  // 1. 随机确定道具数量
  const targetItemCount = randomItemCount(container.minItems, container.maxItems);
  
  // 2. 创建网格占用检测器
  const gridOccupancy = new GridOccupancy(container.width, container.height);
  
  // 3. 逐个生成和放置道具
  for (let i = 0; i < targetItemCount; i++) {
    // 3.1 从道具池中随机选择道具
    const selectedItem = selectRandomItem(items, container.itemPool);
    
    if (!selectedItem) {
      console.warn(`第${i + 1}个道具选择失败，跳过`);
      continue;
    }

    // 3.2 解析道具尺寸
    const [itemWidth, itemHeight] = parseSize(selectedItem.size);

    // 3.3 寻找可放置的位置
    const position = gridOccupancy.findNextAvailablePosition(itemWidth, itemHeight);
    
    if (position === null) {
      console.log(`道具 "${selectedItem.name}" (${selectedItem.size}) 无法放置，容器空间不足。已放置 ${assignedItems.length} 个道具。`);
      break; // 容器放不下了，忽略剩余道具
    }

    const [x, y] = position;

    // 3.4 占用网格位置
    gridOccupancy.occupy(x, y, itemWidth, itemHeight);

    // 3.5 添加到结果数组
    assignedItems.push({
      item: selectedItem,
      pos: [x, y],
      size: [itemWidth, itemHeight]
    });

    console.log(`放置道具: "${selectedItem.name}" (${selectedItem.size}) 位置: [${x}, ${y}]`);
  }

  // 调试信息：显示最终的网格布局
  if (process.env.NODE_ENV === 'development') {
    console.log('最终网格布局:');
    const finalGrid = gridOccupancy.getGrid();
    finalGrid.forEach((row, y) => {
      console.log(`第${y}行: ${row.map(cell => cell ? '■' : '□').join('')}`);
    });
  }

  return assignedItems;
}

/**
 * 计算物品在网格中的位置和尺寸
 * @param gridPos 网格位置 [x, y]
 * @param gridSize 网格尺寸 [width, height]
 * @returns 位置和尺寸信息
 */
export function calculateItemPosition(gridPos: [number, number], gridSize: [number, number]): {
  left: number;
  top: number;
  width: number;
  height: number;
} {
  const [x, y] = gridPos;
  const [width, height] = gridSize;
  const gridConfig = getResponsiveGridConfig();
  const { CELL_SIZE, GAP, PADDING } = gridConfig;
  
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
// 物品品质类型
export type QualityType = 1 | 2 | 3 | 4 | 5 | 6;

// 物品种类类型
export type CategoryType = 1 | 2 | 3 | 4 | 5 | 6 | 7;

// 物品种类名称映射
export const CATEGORY_NAMES: Record<CategoryType, string> = {
  1: '工艺藏品',
  2: '工具材料', 
  3: '电子物品',
  4: '家居物品',
  5: '能源燃料',
  6: '医疗道具',
  7: '资料情报'
};

// 物品接口
export interface Item {
  id: string;
  name: string;
  desc: string;
  quality: QualityType;
  category: CategoryType;  // 新增：物品种类
  size: string; // 格式: "1x1", "2x2"等
  icon: string;
  weight: number;
}

// 布局位置 - 支持占位格
export interface LayoutPosition {
  x: number;
  y: number;
  itemId?: string;  // 传统物品ID（可选）
  isSlot?: boolean; // 是否为占位格
  size?: string;    // 占位格尺寸（如果是占位格）
  slotId?: string;  // 占位格ID
}

// 布局模板
export interface Layout {
  name: string;
  description: string;
  positions: LayoutPosition[];
  weight: number;  // 新增：模板权重，用于随机选择
}

// 容器配置
export interface Container {
  id: string;
  name: string;
  cost: number;
  rarity: string;
  layoutIds: string[];
  itemPool?: string[];  // 新增：可能出现的物品ID列表
  color: string;
  description?: string;
  width?: number;
  height?: number;
}

// 完整配置接口
export interface GameConfig {
  items: Item[];
  layouts: Record<string, Layout>;
  containers: Record<string, Container>;
}

// 已分配的物品信息
export interface AssignedItem {
  item: Item;
  pos: [number, number];
  size: [number, number];
}

// 品质持续时间映射
export interface QualityDurations {
  [key: string]: number;
}

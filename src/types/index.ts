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

// 容器配置 - 重构为基于规则的动态生成
export interface Container {
  id: string;
  name: string;
  cost: number;
  rarity: string;
  width: number;        // 容器宽度（必需）
  height: number;       // 容器高度（必需）
  minItems: number;     // 最小道具数量
  maxItems: number;     // 最大道具数量
  itemPool: string[];   // 道具池ID列表（必需）
  color: string;
  description?: string;
}

// 完整配置接口 - 移除布局系统
export interface GameConfig {
  items: Item[];
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

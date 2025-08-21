import { Statistics, StatisticsEvent, Item } from '../types';

// 存储键名
const STORAGE_KEY = 'delta-force-statistics';

// 默认统计数据
const DEFAULT_STATISTICS: Statistics = {
  containersOpened: {},
  itemsObtained: {},
  totalContainers: 0,
  totalItems: 0,
  firstOpenTime: 0,
  lastOpenTime: 0
};

/**
 * 从localStorage加载统计数据
 */
export function loadStatistics(): Statistics {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { ...DEFAULT_STATISTICS };
    }
    
    const parsed = JSON.parse(stored);
    
    // 确保所有必需字段都存在
    return {
      containersOpened: parsed.containersOpened || {},
      itemsObtained: parsed.itemsObtained || {},
      totalContainers: parsed.totalContainers || 0,
      totalItems: parsed.totalItems || 0,
      firstOpenTime: parsed.firstOpenTime || 0,
      lastOpenTime: parsed.lastOpenTime || 0
    };
  } catch (error) {
    console.error('Failed to load statistics:', error);
    return { ...DEFAULT_STATISTICS };
  }
}

/**
 * 保存统计数据到localStorage
 */
export function saveStatistics(statistics: Statistics): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(statistics));
  } catch (error) {
    console.error('Failed to save statistics:', error);
  }
}

/**
 * 记录开箱事件
 */
export function recordOpeningEvent(event: StatisticsEvent): Statistics {
  const current = loadStatistics();
  const now = event.timestamp;
  
  // 更新容器开启次数
  current.containersOpened[event.containerName] = 
    (current.containersOpened[event.containerName] || 0) + 1;
  
  // 更新物品获得次数
  event.items.forEach(item => {
    current.itemsObtained[item.id] = 
      (current.itemsObtained[item.id] || 0) + 1;
  });
  
  // 更新总计数据
  current.totalContainers += 1;
  current.totalItems += event.items.length;
  
  // 更新时间记录
  if (current.firstOpenTime === 0) {
    current.firstOpenTime = now;
  }
  current.lastOpenTime = now;
  
  // 保存到localStorage
  saveStatistics(current);
  
  return current;
}

/**
 * 清除所有统计数据
 */
export function clearStatistics(): Statistics {
  const fresh = { ...DEFAULT_STATISTICS };
  saveStatistics(fresh);
  return fresh;
}

/**
 * 获取物品统计信息（按品质从高到低排序，同品质按获得次数排序）
 */
export function getItemStatistics(statistics: Statistics, items: Item[]): Array<{
  item: Item;
  count: number;
  percentage: number;
}> {
  const itemsMap = new Map(items.map(item => [item.id, item]));
  
  return Object.entries(statistics.itemsObtained)
    .map(([itemId, count]) => {
      const item = itemsMap.get(itemId);
      return item ? {
        item,
        count,
        percentage: statistics.totalItems > 0 ? (count / statistics.totalItems) * 100 : 0
      } : null;
    })
    .filter((entry): entry is { item: Item; count: number; percentage: number } => entry !== null)
    .sort((a, b) => {
      // 首先按品质从高到低排序（6->1）
      if (a.item.quality !== b.item.quality) {
        return b.item.quality - a.item.quality;
      }
      // 同品质按获得次数从多到少排序
      return b.count - a.count;
    });
}

/**
 * 获取容器统计信息（按开启次数排序）
 */
export function getContainerStatistics(
  statistics: Statistics, 
  containers: Record<string, any>
): Array<{
  containerId: string;
  containerName: string;
  count: number;
  percentage: number;
}> {
  return Object.entries(statistics.containersOpened)
    .map(([containerId, count]) => ({
      containerId,
      containerName: containers[containerId]?.name || containerId,
      count,
      percentage: statistics.totalContainers > 0 ? (count / statistics.totalContainers) * 100 : 0
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * 格式化时间为可读字符串
 */
export function formatTime(timestamp: number): string {
  if (timestamp === 0) return '无记录';
  
  const date = new Date(timestamp);
  const now = new Date();
  
  // 如果是今天
  if (date.toDateString() === now.toDateString()) {
    return `今天 ${date.toLocaleTimeString('zh-CN', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`;
  }
  
  // 如果是昨天
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `昨天 ${date.toLocaleTimeString('zh-CN', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`;
  }
  
  // 其他日期
  return date.toLocaleDateString('zh-CN') + ' ' + 
         date.toLocaleTimeString('zh-CN', { 
           hour12: false, 
           hour: '2-digit', 
           minute: '2-digit' 
         });
}

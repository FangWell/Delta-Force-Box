# 持久化统计功能测试指南

## 功能概述
已成功添加持久化统计功能，包括：

1. **统计数据记录**
   - 开启容器数量统计
   - 每个物品获得次数统计
   - 开启时间记录
   - 数据保存在浏览器 localStorage 中

2. **统计显示界面**
   - 点击右上角"📊 统计"按钮打开统计面板
   - 总览统计信息
   - 容器开启记录
   - 物品获得记录（按获得次数排序）

3. **数据管理**
   - 数据持久化保存在浏览器缓存中
   - 可以主动清除所有统计数据
   - 支持数据导出和分析

## 测试步骤

### 1. 基本功能测试
1. 访问 http://localhost:5173/
2. 点击"开启容器"按钮几次
3. 点击右上角"📊 统计"按钮查看统计数据
4. 验证数据是否正确记录

### 2. 持久化测试
1. 开启几个容器后记住统计数据
2. 刷新页面
3. 再次查看统计数据，验证数据是否保持

### 3. 清除功能测试
1. 在统计面板中点击"清除统计数据"
2. 确认清除操作
3. 验证所有统计数据被清空

### 4. 多容器测试
1. 切换不同的容器类型
2. 开启不同的容器
3. 查看统计中的容器开启记录是否正确

## 新增文件说明

- `src/utils/statistics.ts` - 统计数据管理工具
- `src/components/Statistics/StatisticsPanel.tsx` - 统计显示组件
- `src/components/Statistics/StatisticsPanel.module.scss` - 统计面板样式
- `src/components/Statistics/index.ts` - 导出文件

## 数据结构

统计数据保存在 localStorage 中，键名为 `delta-force-statistics`，包含：
```typescript
{
  containersOpened: Record<string, number>; // 各容器开启次数
  itemsObtained: Record<string, number>;    // 各物品获得次数
  totalContainers: number;                  // 总开启容器数
  totalItems: number;                       // 总获得物品数
  firstOpenTime: number;                    // 首次开启时间
  lastOpenTime: number;                     // 最后开启时间
}
```

## 注意事项

1. 数据保存在浏览器 localStorage 中，清除浏览器数据会丢失统计信息
2. 统计面板在小屏幕设备上会自动适配
3. 物品统计按获得次数排序，容器统计也按开启次数排序
4. 时间显示会自动格式化（今天、昨天、具体日期）

## 功能完成 ✅

- [x] 持久化统计数据保存
- [x] 开启容器数量统计
- [x] 物品获得次数统计
- [x] 统计数据显示界面
- [x] 主动清除功能
- [x] 响应式设计
- [x] 数据格式化显示

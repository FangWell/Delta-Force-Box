# 类型感知的Excel配置格式说明

## 问题解决

✅ **已修复**: `containerData.layoutIds.forEach is not a function` 错误
- 原因: Excel转换时缺少类型信息，数组字段被转换为字符串
- 解决: 实现类型感知的转换器，支持完整的4行格式

## 新的Excel格式规范

### 标准4行格式（推荐）
```excel
第1行: 字段名    | id | name | layoutIds | itemPool |
第2行: 数据类型  | string | string | array | array |
第3行: 中文注释  | 容器ID | 容器名称 | 布局ID列表 | 物品池 |
第4行: 数据开始  | 1 | 基础战利品箱 | slot_1 | 1,3,8,11 |
```

### 支持的数据类型

| 类型 | 说明 | Excel示例 | JSON结果 |
|-----|------|-----------|-----------|
| `string` | 字符串 | `"hello"` | `"hello"` |
| `number` | 数字 | `123` | `123` |
| `boolean` | 布尔值 | `true`, `1`, `yes` | `true` |
| `array` | 数组 | `a,b,c` 或 `["a","b","c"]` | `["a","b","c"]` |
| `json` | JSON对象 | `{"x":1,"y":2}` | `{"x":1,"y":2}` |

### 兼容的格式

#### 格式A: 简单格式
```excel
第1行: id | name | layoutIds |
第2行: 1 | 基础战利品箱 | slot_1 |
```
⚠️  **注意**: 数组字段会被当作字符串处理

#### 格式B: 传统格式  
```excel
第1行: id | name | layoutIds |
第2行: 容器ID | 容器名称 | 布局ID列表 |
第3行: 1 | 基础战利品箱 | slot_1 |
```
⚠️  **注意**: 数组字段会被当作字符串处理

## 数组字段处理规则

### 输入格式
- **逗号分隔**: `slot_1,slot_2,slot_3` → `["slot_1","slot_2","slot_3"]`
- **JSON格式**: `["slot_1","slot_2"]` → `["slot_1","slot_2"]`
- **单个值**: `slot_1` → `["slot_1"]`

### 关键数组字段
- `layoutIds`: 布局ID列表，**必须为数组**（修复forEach错误）
- `itemPool`: 物品池，**必须为数组**
- `items`: 物品列表，**必须为数组**
- `positions`: 位置坐标，**必须为数组**

## 使用示例

### 1. 创建包含类型的Excel文件
```bash
# 从JSON生成标准4行格式Excel
./config-converter.sh j2e --containers
```

### 2. 转换Excel到JSON（自动类型转换）
```bash
# 智能识别类型并转换
./config-converter.sh e2j --containers
```

### 3. 验证转换结果
```bash
# 检查layoutIds是否为数组
node -e "const c=require('./json/containers.json'); console.log(Array.isArray(Object.values(c)[0].layoutIds))"
```

## 容错机制

转换器提供三层容错保障：

1. **智能转换器v2** (优先)
   - 支持类型转换
   - 处理4行格式
   - 自动识别数组字段

2. **智能转换器v1** (备用)
   - 支持字段映射
   - 处理2-3行格式
   - 基础类型转换

3. **传统转换器** (兜底)
   - 硬编码映射
   - 固定格式处理
   - 基础功能

## 升级指南

### 从传统格式升级到类型感知格式

1. **备份现有数据**
   ```bash
   ./config-converter.sh e2j --backup
   ```

2. **重新生成Excel文件**
   ```bash
   ./config-converter.sh j2e
   ```

3. **验证新格式**
   ```bash
   ./config-converter.sh --status
   ```

4. **测试转换**
   ```bash
   ./config-converter.sh e2j --containers
   ```

### 检查是否需要升级

运行以下命令检查当前Excel格式：
```bash
node -e "
const XLSX = require('xlsx');
const wb = XLSX.readFile('excel/containers.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws, {header: 1});
console.log('当前格式:', data.length >= 4 ? '4行格式(最新)' : '传统格式');
console.log('第2行内容:', data[1]);
"
```

---

*更新时间: 2025年8月19日*
*版本: v2.1 - 类型感知版本*

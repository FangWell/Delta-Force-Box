# 配置转换工具使用指南

## 概述

`config-converter.sh` 是一个功能强大的通用配置转换工具，支持 JSON 和 Excel 格式之间的双向转换。

## 功能特性

- ✅ **双向转换**: JSON ↔ Excel
- ✅ **智能表头识别**: 自动识别第一行键值，支持中英文字段名
- ✅ **自动注释检测**: 智能识别并跳过注释行
- ✅ **动态字段映射**: 多语言字段名自动映射
- ✅ **智能范围选择**: 支持单独转换特定配置类型
- ✅ **自动备份**: 防止数据丢失
- ✅ **依赖检查**: 自动验证环境和文件
- ✅ **API集成**: 实时从API获取最新数据
- ✅ **中文评论行**: Excel文件包含详细的中文说明
- ✅ **容错处理**: 多层转换器保证成功率
- ✅ **保留未知字段**: 自动保留Excel中的自定义字段
- ✅ **彩色输出**: 友好的用户界面

## 基本用法

### 1. 查看帮助信息
```bash
./config-converter.sh --help
./config-converter.sh -h
```

### 2. 检查系统状态
```bash
./config-converter.sh --status
./config-converter.sh -s
```

### 3. JSON 转 Excel

#### 转换所有配置
```bash
./config-converter.sh j2e
./config-converter.sh json-to-excel
```

#### 转换特定配置
```bash
# 转换物品配置
./config-converter.sh j2e --items
./config-converter.sh j2e -i

# 转换容器配置
./config-converter.sh j2e --containers
./config-converter.sh j2e -c

# 转换布局配置
./config-converter.sh j2e --layouts
./config-converter.sh j2e -l
```

### 4. Excel 转 JSON

#### 转换所有配置
```bash
./config-converter.sh e2j
./config-converter.sh excel-to-json
```

#### 转换特定配置
```bash
# 转换物品配置
./config-converter.sh e2j --items
./config-converter.sh e2j -i

# 转换容器配置
./config-converter.sh e2j --containers
./config-converter.sh e2j -c

# 转换布局配置
./config-converter.sh e2j --layouts
./config-converter.sh e2j -l
```

### 5. 带备份的转换

在任何转换操作前自动备份原文件：

```bash
# Excel转JSON时备份
./config-converter.sh e2j --items --backup
./config-converter.sh e2j -i -b

# JSON转Excel时备份
./config-converter.sh j2e --containers --backup
./config-converter.sh j2e -c -b
```

## 实际使用场景

### 场景 1: 从游戏服务器同步最新配置到Excel
```bash
# 1. 检查API服务器状态
./config-converter.sh --status

# 2. 备份现有Excel文件并转换
./config-converter.sh j2e --backup
```

### 场景 2: 在Excel中编辑后更新JSON配置
```bash
# 1. 备份现有JSON配置
./config-converter.sh e2j --backup

# 2. 只转换修改的部分
./config-converter.sh e2j --items
```

### 场景 3: 处理不同格式的Excel文件
```bash
# 智能转换器会自动识别：
# - 中文或英文字段名
# - 是否存在注释行
# - 自定义字段名

./config-converter.sh e2j --items
```

### 场景 4: 验证配置文件完整性
```bash
# 检查所有文件状态
./config-converter.sh --status
```

### 场景 5: 使用自定义Excel模板
```bash
# 创建包含自定义字段的Excel文件
# 智能转换器会：
# 1. 保留所有自定义字段
# 2. 映射已知字段名
# 3. 自动处理数据类型转换

./config-converter.sh e2j --containers
```

## Excel文件格式说明

转换器支持多种Excel文件格式：

### 标准格式（带注释行）
- **第1行**: 列标题（中文或英文字段名）
- **第2行**: 中文说明注释行（可选）
- **第3行起**: 实际数据

### 简化格式（无注释行）  
- **第1行**: 列标题（中文或英文字段名）
- **第2行起**: 实际数据

### 智能字段识别

转换器支持以下字段名的自动识别：

| 标准字段 | 支持的字段名 |
|---------|-------------|
| id | id, ID, Id, 编号, 标识 |
| name | name, Name, NAME, 名称, 标题, title, Title |
| desc | desc, description, Description, DESC, 描述, 说明 |
| quality | quality, Quality, rarity, Rarity, 品质, 稀有度, 等级 |
| category | category, Category, type, Type, 类别, 类型, 分类 |
| size | size, Size, SIZE, 尺寸, 大小, 格子 |
| icon | icon, Icon, image, Image, 图标, 图片 |
| weight | weight, Weight, probability, 权重, 概率 |

### 示例

#### 标准格式（中文字段+注释）
```
| 编号 | 名称 | 描述 | 品质 | 类别 |
| 物品ID | 物品名称 | 物品描述 | 稀有度等级 | 物品类别 |
| 1 | AK-47 | 突击步枪 | 3 | 1 |
```

#### 英文格式（无注释）
```
| ID | Name | Description | Rarity | Type |
| weapon_ak47 | AK-47 | Assault Rifle | rare | weapon |
```

#### 混合格式
```
| id | 名称 | Description | 品质 | category |
| weapon_001 | 手枪 | Basic Pistol | 2 | weapon |
```

## 故障排除

### 1. API服务器未启动
```bash
# 错误: API服务器未运行 (http://localhost:3001)
# 解决: 启动API服务器
./start-mac.sh
```

### 2. 工具文件缺失
```bash
# 错误: 工具文件不存在
# 解决: 检查tools目录完整性
ls -la tools/
```

### 3. 权限问题
```bash
# 确保脚本有执行权限
chmod +x config-converter.sh
```

### 4. Node.js依赖问题
```bash
# 安装缺失的依赖
npm install xlsx
```

## 备份管理

### 自动备份位置
- 备份目录: `backups/YYYYMMDD_HHMMSS/`
- 备份内容: 所有JSON配置文件
- 备份时机: 使用 `--backup` 参数时

### 手动清理旧备份
```bash
# 清理30天前的备份
find backups/ -name "20*" -mtime +30 -exec rm -rf {} \;
```

## 高级功能

### 1. 批量转换脚本
创建批处理脚本自动化日常转换任务：

```bash
#!/bin/bash
# 每日同步脚本
./config-converter.sh j2e --backup
echo "配置同步完成: $(date)"
```

### 2. 与CI/CD集成
在自动化流程中使用状态检查：

```bash
# 在部署前验证配置
if ./config-converter.sh --status > /dev/null 2>&1; then
    echo "配置验证通过"
else
    echo "配置验证失败，终止部署"
    exit 1
fi
```

## 开发者信息

- **版本**: v2.0
- **依赖**: Node.js, XLSX库, 运行中的API服务器
- **支持的配置**: items, containers, layouts
- **输出格式**: Excel 2007+ (.xlsx)

## 更新日志

### v2.0 (当前版本)
- ✅ 完整的双向转换支持
- ✅ 智能范围选择
- ✅ 自动备份功能
- ✅ API实时数据获取
- ✅ 中文评论行支持
- ✅ 彩色命令行界面

### v1.x (历史版本)
- 基础的单向转换功能
- 独立的转换脚本

---

*最后更新: 2025年8月19日*

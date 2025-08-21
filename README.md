# 三角洲行动 - 容器开启模拟器

一个基于 React + TypeScript + Vite 开发的游戏容器开启模拟器，完美重现了HTML原型的所有功能。

## ✅ 最新更新 (2025-08-20)

### 容器编辑器功能完善
- **✅ 保存功能修复**: 修复容器编辑器保存不生效问题，支持完整数据持久化
- **✅ 物品池显示优化**: 改进物品池管理界面，显示物品尺寸和中文品质
- **✅ 品质系统完善**: 支持6个品质等级，新增红色"神话"品质
- **✅ 界面体验提升**: 优化物品显示布局，增强可读性

### 品质系统升级
- **品质1**: 普通（灰色）
- **品质2**: 优秀（绿色）  
- **品质3**: 稀有（蓝色）
- **品质4**: 史诗（紫色）
- **品质5**: 传说（橙色）
- **品质6**: 神话（红色）🆕

### 物品池管理改进
- ✅ 显示物品占用格子数（如1x1, 2x2, 1x3等）
- ✅ 中文品质名称显示
- ✅ 优化的视觉标记系统（颜色区分尺寸、品质、分类）
- ✅ 物品描述信息显示

## ✅ 历史更新 (2025-08-19)

### 项目结构优化完成
- **工具链优化**: 清理冗余转换器，保留核心工具（智能转换器v2 + API生成器）
- **类型感知转换**: 支持4行Excel格式（表头+类型+注释+数据），解决layoutIds数组转换问题
- **统一响应格式**: 所有API端点使用 `{success: true, data: {...}}` 格式
- **配置管理升级**: Excel↔JSON双向转换，支持智能字段映射和类型转换
- **项目结构清理**: 移除26个冗余文件，优化开发体验

### 技术突破
- ✅ 修复 "containerData.layoutIds.forEach is not a function" TypeError
- ✅ 实现4行Excel格式的智能解析（表头+类型+注释+数据）
- ✅ 类型感知转换系统，支持array/string/number/json/boolean类型
- ✅ 工具链简化：从3个转换器优化为2个专用工具
- ✅ 配置兜底系统，确保转换可靠性

## 🎯 功能特性

### 核心功能
- **4x4 网格系统**: 固定16单元格，支持多种尺寸物品（1x1, 2x2, 1x3, 2x3等）
- **随机布局系统**: 预定义多种布局模板，每次开启随机选择
- **加权随机物品**: 基于物品权重的智能分配算法  
- **品质系统**: 6个品质等级（白/绿/蓝/紫/金/红），不同颜色和揭示时间
- **开箱动画**: 黑色占位 → 转圈等待 → 逐个揭示物品
- **多容器类型**: 支持标准/高级/精英/传奇补给箱

### 🔧 配置管理系统（全新升级）
- **智能Excel转换器**: 支持4行Excel格式（表头+类型+注释+数据）
- **类型感知转换**: 自动识别和转换array/string/number/json类型
- **双向数据流**: Excel→JSON 和 JSON→Excel 无缝转换
- **智能字段映射**: 自动识别中英文字段名（如name/名称/标题）
- **兜底转换系统**: 多级转换器确保数据完整性
- **配置验证**: 检查配置完整性和引用关系

### 🔐 工具链架构（简化优化）
- **smart-excel-converter-v2.cjs**: 智能Excel转JSON，支持类型转换
- **generate-excel-from-api.cjs**: API数据生成Excel，支持4行格式输出
- **config-converter.sh**: 统一配置转换脚本，支持增量和完整转换

### 动画系统
- **品质等待时间**: 白1s、绿1.5s、蓝2s、紫2.5s、金3s、红4s
- **逐个揭示**: 按位置排序（从上到下，从左到右）
- **跳过动画**: 支持一键加速开启
- **平滑过渡**: CSS动画和React状态管理

### 技术实现
- **React 18**: 使用Hooks（useState, useEffect, useCallback）
- **TypeScript**: 完整类型定义，类型安全
- **SCSS Modules**: 模块化样式，避免冲突
- **配置驱动**: JSON配置文件，易于扩展
- **响应式设计**: 适配不同屏幕尺寸

## 🚀 快速部署

### ⚡ 一键部署（推荐）
```bash
# 交互式部署脚本，支持多种平台
./deploy.sh
```

### 📦 各平台部署

#### GitHub Pages（免费静态托管）
```bash
# 自动部署到GitHub Pages
./deploy-github.sh

# 或使用自定义域名
./deploy-github.sh your-domain.com
```

#### Vercel/Netlify（免费全栈）
```bash
# Vercel部署
npm run deploy:vercel

# Netlify部署（拖拽dist文件夹到netlify.com）
npm run build
```

#### VPS/云服务器（完整功能）
```bash
# 一键服务器部署
./deploy-server.sh <git-repo-url>

# 支持Ubuntu 20.04+，自动安装所有依赖
```

#### Docker容器（推荐生产环境）
```bash
# 构建并启动容器
docker-compose up -d

# 访问地址
# 前端: http://localhost
# API: http://localhost:3001
```

### 🌐 部署对比

| 平台 | 成本 | 功能完整度 | 配置难度 | 适用场景 |
|------|------|-----------|----------|----------|
| **GitHub Pages** | 免费 | 70% | ⭐ | 项目展示 |
| **Vercel/Netlify** | 免费 | 85% | ⭐⭐ | 个人项目 |
| **VPS服务器** | $5-20/月 | 100% | ⭐⭐⭐ | 商业应用 |
| **Docker容器** | $10-50/月 | 100% | ⭐⭐⭐⭐ | 企业级 |

详细部署指南：📚 [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)

## 🚀 快速开始

## ⚡ 手动启动（开发者模式）

### 安装依赖
```bash
# 安装主项目依赖
npm install

# 安装API服务器依赖
cd server && npm install
```

### 启动服务

#### 方式一：使用开发脚本
```bash
# 启动开发服务器（前端）
npm run dev

# 启动API服务器（新终端）
cd server && node api.js
```

#### 方式二：后台启动
```bash
# 后台启动API服务器
cd server && nohup node api.js > ../logs/api.log 2>&1 &

# 后台启动前端服务器
nohup npm run dev > logs/frontend.log 2>&1 &
```

### 构建与部署
```bash
# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 🚀 一键启动（推荐）

### Mac / Linux 用户

#### 完整自动启动（推荐新手）
```bash
# 自动检测环境、安装依赖、启动服务
./start-mac.sh
```

#### 快速启动（环境已配置）
```bash  
# 快速启动所有服务
./quick-start.sh
```

#### 停止所有服务
```bash
./stop-mac.sh
```

### Windows 用户

#### 完整自动启动
```cmd
# 自动检测环境、安装依赖、启动服务
start-windows.bat
```

#### 快速启动
```cmd
quick-start-windows.bat
```

#### 停止所有服务
```cmd
stop-windows.bat
```

## 📋 启动脚本功能

### 🔧 自动环境检测
- ✅ Node.js 检测与自动安装
- ✅ 项目依赖自动安装
- ✅ 端口冲突自动处理
- ✅ 配置文件自动创建
- ✅ 服务健康状态检查

### 🎯 服务管理
- **API服务器**: http://localhost:3001 - 配置管理API
- **前端服务器**: http://localhost:5173 - Vite开发服务器
- **布局编辑器**: http://localhost:5173/layout-editor.html - 可视化编辑器

## ⚡ 手动启动（开发者模式）

### 开发环境
```bash
# 安装依赖
npm install

# 创建XLSX配置模板
npm run xlsx:create

# 启动开发服务器
npm run dev
```

### 配置管理
```bash
# 🚀 一键配置转换（推荐）
./config-converter.sh excel-to-json        # Excel转JSON
./config-converter.sh json-to-excel        # JSON转Excel

# 🎯 增量转换（单个文件）
./config-converter.sh e2j --containers     # 转换容器配置
./config-converter.sh j2e --items          # 生成物品Excel

# 🔧 高级功能
./config-converter.sh --template           # 创建Excel模板
./config-converter.sh --validate           # 验证配置完整性
./config-converter.sh --backup             # 备份配置文件
```

## 📁 项目结构

```
## 📁 项目结构（最新优化）

```
Delta-Force/
├── src/                          # React源码
│   ├── components/               # React组件
│   │   ├── ContainerOpening/    # 容器开启组件
│   │   ├── Grid/                # 网格组件  
│   │   ├── Item/                # 物品组件
│   │   └── ...                  # 其他组件
│   ├── utils/                   # 工具函数
│   │   ├── dataLoader.ts        # 数据加载器
│   │   └── gameLogic.ts         # 游戏逻辑
│   ├── types/                   # TypeScript类型定义
│   └── App.tsx                  # 主应用组件
├── server/                      # API服务器
│   ├── api.js                   # 模块化API服务器
│   └── package.json             # API依赖配置
├── tools/ (优化后)              # 🚀 配置工具（精简版）
│   ├── smart-excel-converter-v2.cjs  # 智能Excel转JSON转换器
│   └── generate-excel-from-api.cjs   # API生成Excel文件
├── json/                        # JSON配置文件
│   ├── items.json              # 物品配置
│   ├── containers.json         # 容器配置
│   └── layouts.json            # 布局配置
├── excel/                       # Excel配置文件
│   ├── items.xlsx              # 物品配置(Excel格式)
│   ├── containers.xlsx         # 容器配置(Excel格式)
│   └── layouts.xlsx            # 布局配置(Excel格式)
├── public/
│   ├── data.json               # 合并后的游戏数据
│   ├── layout-editor.html      # 可视化布局编辑器
│   └── assets/                 # 游戏资源
├── logs/                        # 服务器日志
├── backups/                     # 配置备份
├── config-converter.sh          # 🆕 统一配置转换脚本
├── start-mac.sh                 # Mac快速启动脚本
├── stop-mac.sh                  # Mac停止服务脚本
├── start-windows.bat            # Windows启动脚本  
├── stop-windows.bat             # Windows停止脚本
└── package.json
```

## ⚙️ 配置管理（全新升级）

### 🚀 智能配置转换系统
基于最新的智能转换器，支持类型感知和4行Excel格式：

```bash
# 🔄 Excel转JSON（智能转换）
./config-converter.sh excel-to-json           # 转换所有配置
./config-converter.sh e2j --containers        # 只转换容器配置
./config-converter.sh e2j --items            # 只转换物品配置
./config-converter.sh e2j --layouts          # 只转换布局配置

# 📤 JSON转Excel（从API生成）
./config-converter.sh json-to-excel          # 生成所有Excel文件
./config-converter.sh j2e --containers       # 只生成容器Excel

# 📋 创建模板文件
./config-converter.sh --template             # 从API创建Excel模板
```

### 📊 Excel格式支持（4行格式）
智能转换器支持多种Excel格式，推荐使用4行格式：

```excel
行1: id        | name      | layoutIds    | quality
行2: string    | string    | array       | number  
行3: 容器ID     | 容器名称   | 布局ID列表   | 品质等级
行4: container1| 标准补给箱 | [1,2,3]     | 2
```

**支持的类型**：
- `string`: 字符串类型
- `number`: 数字类型  
- `array`: 数组类型（逗号分隔或JSON格式）
- `json`: JSON对象
- `boolean`: 布尔值

### 🎯 智能字段映射
转换器自动识别中英文字段名：

| 标准字段 | 支持的字段名 |
|---------|-------------|
| `id` | id, ID, Id, 编号, 标识 |
| `name` | name, Name, 名称, 标题, title |
| `desc` | desc, description, 描述, 说明 |
| `quality` | quality, rarity, 品质, 稀有度 |
| `layoutIds` | layoutIds, layout_ids, layouts, 布局列表 |

### 配置文件结构
```
excel/                  # Excel配置源文件
├── items.xlsx         # 物品配置
├── containers.xlsx    # 容器配置
└── layouts.xlsx       # 布局配置

json/                  # 转换后的JSON文件
├── items.json         # 物品配置
├── containers.json    # 容器配置
└── layouts.json       # 布局配置

public/data.json       # 合并后的游戏数据
```

## ⚙️ 配置说明（原内容）

### 物品配置
```json
{
  "id": "001",
  "name": "手枪", 
  "desc": "基础武器",
  "quality": "白",
  "size": "1x1",
  "icon": "/assets/pistol.png",
  "weight": 10
}
```

### 布局模板
```json
{
  "id": "T1",
  "prob": 0.5,
  "slots": [
    {"size": "1x1", "pos": [0,0]},
    {"size": "2x2", "pos": [1,0]}
  ]
}
```

### 容器配置
```json
{
  "标准补给箱": {
    "name": "标准补给箱",
    "itemPool": ["001", "002", "003"],
    "layoutTemplates": ["T1", "T2"]
  }
}
```

## 🎮 使用说明

1. **选择容器类型**: 从下拉菜单选择不同的补给箱
2. **开启容器**: 点击"开启容器"按钮
3. **观看动画**: 物品按品质逐个揭示
4. **跳过动画**: 开启过程中可点击"跳过动画"
5. **查看记录**: 右下角显示获得的物品列表

## 🧪 测试功能

点击"运行测试"按钮，在浏览器控制台查看10次开启的统计结果：

```javascript
console.log('=== 开启模拟测试 ===');
// 统计各品质物品的出现频率
// 验证随机分布的合理性
```

## 🔐 权限管理系统

### 环境配置

#### 开发环境（默认）
```bash
# 所有功能启用
./start-mac.sh  # 或 start-windows.bat
```

**可用功能**：
- ✅ 容器名称编辑
- ✅ 布局编辑器
- ✅ 配置管理面板
- ✅ 批量导入导出
- ✅ 配置验证和重置

#### 生产环境
```bash
# 编辑功能禁用
export NODE_ENV=production  # Mac/Linux
set NODE_ENV=production     # Windows
./start-mac.sh
```

**功能限制**：
- ❌ 容器编辑 - 保护内容稳定性
- ❌ 布局编辑 - 防止意外修改
- ❌ 配置管理 - 确保配置安全
- ✅ 游戏功能 - 正常运行

### 配置管理面板

在布局编辑器中点击 **"⚙️ 配置管理"** 按钮：

- **📊 配置统计**: 查看容器、布局、物品数据分布
- **🔍 配置验证**: 检查配置完整性和引用关系
- **📤 导出配置**: 生成JSON配置文件
- **📥 导入配置**: 批量更新配置数据
- **🗑️ 重置配置**: 危险操作，需确认

### API权限控制

所有编辑API都有严格权限验证：

```bash
# 检查当前权限
curl http://localhost:3001/api/system/info

# 开发环境响应
{
  "environment": "development",
  "permissions": {
    "EDIT_CONTAINERS": true,
    "EDIT_LAYOUTS": true,
    "CONFIG_MANAGEMENT": true
  }
}

# 生产环境响应
{
  "environment": "production", 
  "permissions": {
    "EDIT_CONTAINERS": false,
    "EDIT_LAYOUTS": false,
    "CONFIG_MANAGEMENT": false
  }
}
```

详细权限配置请参考：[ENVIRONMENT-CONFIG.md](./ENVIRONMENT-CONFIG.md)

## 🔮 扩展计划

### 已完成 ✅
- [x] **智能配置转换**: Excel↔JSON双向转换，支持类型感知
- [x] **工具链优化**: 清理冗余文件，精简到2个核心工具
- [x] **TypeError修复**: 解决layoutIds数组转换问题
- [x] **4行Excel格式**: 支持表头+类型+注释+数据的完整格式

### 计划中 📋
- [ ] **PWA 功能**: 离线访问和本地安装
- [ ] **音效系统**: 开箱音效和品质音效
- [ ] **历史记录**: 开启历史和统计数据
- [ ] **分享功能**: 分享开箱结果到社交媒体
- [ ] **配置热更新**: 无需重启的配置实时更新
- [ ] **多语言支持**: 国际化配置管理

## 🛠️ 工具链优化

### 核心工具（精简版）

经过优化，tools目录现在只包含2个核心工具，职责明确：

| 工具名称 | 功能 | 特性 |
|---------|------|------|
| **smart-excel-converter-v2.cjs** | Excel → JSON | • 支持4行Excel格式<br>• 智能类型转换<br>• 修复layoutIds数组问题<br>• 向下兼容3行格式 |
| **generate-excel-from-api.cjs** | JSON → Excel | • 从API生成Excel文件<br>• 支持4行格式输出<br>• 包含类型信息行 |

### 🎯 解决的关键问题

**TypeError修复**：
```javascript
// 问题：layoutIds被转换为字符串
containerData.layoutIds.forEach is not a function

// 解决：类型感知转换
{
  "layoutIds": ["layout_1", "layout_2"]  // ✅ 正确的数组格式
}
```

**4行Excel格式支持**：
```excel
行1: id        | name        | layoutIds     | quality
行2: string    | string      | array        | number  
行3: 容器ID     | 容器名称     | 布局ID列表    | 品质等级
行4: container1| 标准补给箱   | [1,2,3]      | 2
```

### 兼容性保证
- ✅ 自动检测Excel格式（3行或4行）
- ✅ 向下兼容传统格式
- ✅ 智能字段映射（中英文字段名）
- ✅ 多级转换兜底系统

## 🛠️ 开发说明

### 关键算法

1. **加权随机选择**:
```typescript
function weightedRandomSelect<T extends { weight: number }>(options: T[]): T {
  const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);
  let rand = Math.random() * totalWeight;
  for (const opt of options) {
    rand -= opt.weight;
    if (rand <= 0) return opt;
  }
  return options[options.length - 1];
}
```

2. **位置计算**:
```typescript
function calculateItemPosition(gridPos: [number, number], size: [number, number]) {
  const [x, y] = gridPos;
  const [width, height] = size;
  return {
    left: x * (CELL_SIZE + GAP),
    top: y * (CELL_SIZE + GAP), 
    width: width * CELL_SIZE + (width - 1) * GAP,
    height: height * CELL_SIZE + (height - 1) * GAP
  };
}
```

### 性能优化

- 使用 `useCallback` 避免不必要的重渲染
- SCSS Modules 避免样式冲突
- 异步动画不阻塞UI
- TypeScript 编译时类型检查

## 📄 许可证

MIT License

---

**三角洲行动容器开启模拟器** - 完美还原HTML原型，提供专业的React开发体验！

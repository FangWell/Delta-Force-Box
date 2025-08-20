# 配置管理和权限系统使用示例 📋

## 🚀 快速上手

### 1. 启动系统
```bash
# Mac/Linux
./start-mac.sh

# Windows
start-windows.bat
```

### 2. 访问编辑器
打开浏览器访问：`http://localhost:5173/layout-editor.html`

### 3. 查看权限状态
页面标题会显示当前环境：
- 🟡 **开发环境** - 所有功能可用
- 🔴 **生产环境** - 编辑功能禁用

## 📝 配置管理操作

### 查看配置统计
1. 点击页面右上角的 **"⚙️ 配置管理"** 按钮
2. 在配置管理面板中查看：
   - 容器数量和稀有度分布
   - 布局数量和尺寸分布  
   - 物品数量和类型分布
3. 点击 **"🔄 刷新统计"** 更新数据

### 验证配置完整性
1. 在配置管理面板中点击 **"✅ 验证配置"**
2. 系统会检查：
   - 容器引用的布局是否存在
   - 容器引用的物品是否存在
   - 是否有未使用的布局
   - 配置数据的完整性
3. 查看验证结果和建议

### 导出配置
1. 点击 **"📤 导出配置"**
2. 系统会生成包含所有配置的JSON文件
3. 文件名格式：`delta-force-config-YYYY-MM-DD.json`

### 导入配置
1. 点击 **"📥 导入配置"**
2. 选择之前导出的JSON配置文件
3. 系统会显示导入预览并要求确认
4. 确认后会自动备份当前配置并导入新配置

## 🎯 编辑功能使用

### 编辑容器名称
1. 在容器列表中找到要编辑的容器
2. 点击容器名称（开发环境下会变成可编辑状态）
3. 输入新名称并确认
4. 系统会自动保存到API服务器

### 编辑布局名称
1. 选择要编辑的布局
2. 点击布局名称进行编辑
3. 输入新名称并确认
4. 系统会更新布局数据

### 保存布局修改
1. 在网格编辑器中拖拽物品调整布局
2. 点击 **"保存模板"** 按钮
3. 系统会将当前布局保存到API服务器

## 🔐 权限系统示例

### 开发环境 vs 生产环境

#### 开发环境操作
```bash
# 检查权限
curl http://localhost:3001/api/system/info
# 返回：所有权限为 true

# 编辑容器（成功）
curl -X PUT http://localhost:3001/api/containers/测试容器 \
  -H "Content-Type: application/json" \
  -d '{"rarity":"史诗"}'

# 获取配置统计（成功）
curl http://localhost:3001/api/config/stats
```

#### 生产环境操作
```bash
# 切换到生产环境
export NODE_ENV=production
./stop-mac.sh && ./start-mac.sh

# 检查权限
curl http://localhost:3001/api/system/info
# 返回：所有权限为 false

# 尝试编辑容器（失败）
curl -X PUT http://localhost:3001/api/containers/测试容器 \
  -H "Content-Type: application/json" \
  -d '{"rarity":"史诗"}'
# 返回：{"error":"权限不足","message":"当前环境 (production) 禁用了此功能"}
```

## 🛠️ API接口使用

### 获取系统信息
```bash
curl http://localhost:3001/api/system/info
```

### 获取配置统计（仅开发环境）
```bash
curl http://localhost:3001/api/config/stats
```

### 验证配置（仅开发环境）
```bash
curl http://localhost:3001/api/config/validate
```

### 批量更新物品（仅开发环境）
```bash
curl -X PUT http://localhost:3001/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "items": {
      "item001": {
        "name": "新物品",
        "rarity": "史诗",
        "size": "2x2",
        "weight": 15
      }
    }
  }'
```

### 重置配置（仅开发环境）
```bash
curl -X POST http://localhost:3001/api/config/reset \
  -H "Content-Type: application/json" \
  -d '{"section": "items"}'
```

## 🎨 界面操作指南

### 配置管理面板功能

#### 📊 配置统计区域
- 显示实时配置数据统计
- 按稀有度、类型、尺寸分类统计
- 点击刷新按钮更新数据

#### 🔍 配置验证区域
- 一键检查配置完整性
- 显示错误和警告信息
- 提供修复建议

#### 🗂️ 批量管理区域
- 导出当前完整配置
- 导入外部配置文件
- 支持配置文件预览

#### ⚠️ 危险操作区域
- 配置重置功能
- 需要用户确认
- 自动创建备份

### 权限控制提示

当在生产环境下尝试编辑操作时：
- 按钮会显示为禁用状态（灰色）
- 鼠标悬停显示权限说明
- 点击时弹出权限不足提示

## 🔧 故障排除

### 问题：配置管理按钮不显示
**原因**：可能在生产环境或API服务器未连接
**解决**：
1. 检查环境：`curl http://localhost:3001/api/system/info`
2. 确认API服务器运行：`ps aux | grep "node.*api.js"`
3. 切换到开发环境：`unset NODE_ENV`

### 问题：编辑功能被禁用
**原因**：当前在生产环境
**解决**：
```bash
# 切换到开发环境
unset NODE_ENV  # Mac/Linux
set NODE_ENV=   # Windows

# 重启服务
./stop-mac.sh && ./start-mac.sh
```

### 问题：配置验证失败
**原因**：配置数据不一致
**解决**：
1. 查看验证详情了解具体问题
2. 使用编辑器修复引用错误
3. 删除未使用的布局
4. 重新验证配置

这套系统提供了完整的配置管理和权限控制功能，确保了开发的灵活性和生产的安全性！

# Vercel部署访问指南

## 🚀 Vercel部署后的访问地址

### 主要访问地址
部署完成后，Vercel会自动生成一个访问地址，格式通常为：

```
https://your-project-name-username.vercel.app
```

具体地址会在部署完成后显示在终端中。

### 📱 可访问的页面

1. **主应用（容器开启模拟器）**：
   ```
   https://your-project-name-username.vercel.app
   ```
   - 这是主要的游戏界面
   - 可以选择容器类型并进行开箱模拟

2. **容器编辑器**：
   ```
   https://your-project-name-username.vercel.app/layout-editor.html
   ```
   - 可视化容器编辑器
   - ⚠️ 注意：在静态部署中，编辑功能受限

3. **配置文件**：
   ```
   https://your-project-name-username.vercel.app/json/containers.json
   https://your-project-name-username.vercel.app/json/items.json
   https://your-project-name-username.vercel.app/json/layouts.json
   ```
   - 直接访问JSON配置文件

4. **Excel配置文件**：
   ```
   https://your-project-name-username.vercel.app/excel/containers.xlsx
   https://your-project-name-username.vercel.app/excel/items.xlsx
   https://your-project-name-username.vercel.app/excel/layouts.xlsx
   ```
   - 可下载Excel配置文件

## 🎯 推荐访问流程

1. **首先访问主应用**：体验开箱功能
2. **然后访问编辑器**：查看和了解配置系统
3. **下载配置文件**：如需要自定义配置

## ⚠️ 静态部署限制

在Vercel静态部署中，以下功能受限：
- ❌ 容器编辑器的保存功能（无API服务器）
- ❌ 实时配置更新
- ✅ 容器开启模拟（完全功能）
- ✅ 界面展示和交互
- ✅ 配置文件下载

## 🔧 完整功能部署

如需完整功能（包括编辑器保存），请考虑：
1. **Railway**: 支持全栈部署
2. **Render**: 免费tier支持Node.js
3. **VPS服务器**: 完整控制权

## 📱 移动设备访问

所有地址都支持移动设备访问，响应式设计确保在手机和平板上正常显示。

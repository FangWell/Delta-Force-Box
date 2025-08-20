# 🎮 Delta Force Box Simulator

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/FangWell/Delta-Force-Box/blob/main/LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6.svg?logo=typescript)](https://www.typescriptlang.org/)

一个高度还原的三角洲行动开箱模拟器，提供真实的开箱体验和完整的物品管理系统。

## ✨ 功能特性

### 🎁 核心游戏体验
- **开箱动画系统** - 流畅的转圈和揭示动画
- **品质等级** - 6个品质等级，不同转圈时长
- **容器系统** - 多种稀有度的补给箱
- **物品网格** - 智能排列不同尺寸的物品

### 🔧 管理系统
- **布局权重系统** - 智能加权随机布局选择
- **可视化编辑器** - 直观的布局编辑界面
- **Excel/JSON配置** - 灵活的数据管理
- **API服务器** - 实时配置更新

### 🎨 技术亮点
- **响应式设计** - 支持桌面和移动设备
- **模块化架构** - 清晰的代码组织
- **类型安全** - 完整的TypeScript支持
- **热重载** - 开发体验优化

## 🚀 快速开始

### 环境要求
- Node.js 16.0.0+
- npm 或 yarn

### 一键启动
```bash
# 克隆项目
git clone https://github.com/FangWell/Delta-Force-Box.git
cd Delta-Force-Box

# 安装依赖并启动
./quick-start.sh    # Mac/Linux
# 或
quick-start-windows.bat    # Windows
```

### 手动安装
```bash
# 安装前端依赖
npm install

# 安装服务器依赖
cd server && npm install && cd ..

# 启动开发服务器
npm run dev

# 启动API服务器（新终端）
npm run server
```

## 📁 项目结构

```
├── src/                    # 前端源码
│   ├── components/         # React组件
│   │   ├── ContainerOpening/   # 开箱组件
│   │   ├── Grid/              # 网格系统
│   │   ├── Item/              # 物品组件
│   │   └── ...
│   ├── utils/             # 工具函数
│   └── types/             # TypeScript类型
├── server/                # API服务器
├── json/                  # JSON配置文件
├── excel/                 # Excel配置文件
├── public/                # 静态资源
│   ├── layout-editor.html      # 布局编辑器
│   └── test-*.html             # 测试页面
└── tools/                 # 开发工具
```

## 🎮 使用指南

### 基础使用
1. 访问主页面：`http://localhost:5173`
2. 选择容器类型
3. 点击开启按钮体验开箱

### 布局编辑
1. 访问编辑器：`http://localhost:5173/layout-editor.html`
2. 选择容器和布局
3. 拖拽占位格创建布局
4. 设置权重和保存

### 权重系统
- **权重配置** - 在布局编辑器中点击权重值编辑
- **测试工具** - `/test-layout-weights.html` 验证权重分布
- **完整验证** - `/test-weight-verification.html` 系统测试

## 📊 数据配置

### 物品系统
- **375种物品** - 涵盖7个类别
- **6个品质等级** - 白色到红色品质
- **权重系统** - 控制物品出现概率

### 容器配置
- **多种容器** - 不同稀有度和尺寸
- **布局池** - 每个容器对应多个布局
- **物品池** - 可限制容器内物品范围

### 布局系统
- **16个预设布局** - 不同复杂度和尺寸
- **权重控制** - 智能随机选择
- **占位格系统** - 灵活的物品放置

## 🛠️ 开发工具

### 配置管理
```bash
# Excel转JSON
node tools/smart-excel-converter-v2.cjs

# 配置同步
./config-converter.sh
```

### 测试验证
- `/test-layout-weights.html` - 权重分布测试
- `/test-weight-verification.html` - 功能验证
- `/layout-editor.html` - 可视化编辑

### API接口
- `GET /api/config` - 获取完整配置
- `PUT /api/layouts/:id` - 更新布局
- `POST /api/layouts` - 创建布局

## 📚 文档

- [布局权重系统指南](./LAYOUT-WEIGHT-GUIDE.md)
- [配置转换指南](./CONFIG-CONVERTER-GUIDE.md)
- [启动指南](./STARTUP-GUIDE.md)
- [使用示例](./USAGE-EXAMPLES.md)

## 🤝 贡献

欢迎提交Issue和Pull Request！

### 开发流程
1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- React团队提供优秀的前端框架
- TypeScript团队提供类型安全支持
- 所有贡献者的辛勤工作

---

**🎯 项目目标**：打造最真实的三角洲行动开箱体验，提供完整的物品管理和配置系统。

**🔗 在线演示**：[GitHub Pages](https://fangwell.github.io/Delta-Force-Box/)

**📧 联系方式**：通过GitHub Issues联系项目维护者

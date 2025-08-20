# Delta Force 容器模拟器 - 启动指南 🚀

## 快速启动

### Mac / Linux 用户

#### 方式一：完整自动化启动（推荐新手）
```bash
# 自动检测并修复所有问题，一键启动
./start-mac.sh
```

#### 方式二：快速启动（适合已配置环境）
```bash
# 假设环境已就绪，快速启动服务
./quick-start.sh
```

#### 停止所有服务
```bash
./stop-mac.sh
```

### Windows 用户

#### 完整自动化启动
```cmd
start-windows.bat
```

#### 停止所有服务
```cmd
stop-windows.bat
```

## 功能特性 ⭐

### 🔧 自动环境检测与修复
- ✅ **Node.js 检测与安装**: 自动检测 Node.js，未安装时提供自动安装选项
- ✅ **依赖自动安装**: 检测并安装项目依赖包
- ✅ **端口冲突处理**: 自动释放被占用的端口（3001, 5173）
- ✅ **目录结构创建**: 自动创建必要的目录和配置文件
- ✅ **服务健康检查**: 验证服务是否正常启动

### 🎯 服务管理
- **API服务器**: `http://localhost:3001` - 配置文件管理API
- **前端服务器**: `http://localhost:5173` - Vite开发服务器  
- **布局编辑器**: `http://localhost:5173/layout-editor.html` - 可视化编辑器

### 📝 日志管理
- **API日志**: `logs/api.log`
- **前端日志**: `logs/frontend.log`
- **进程PID**: `logs/*.pid`

## 故障排除 🛠️

### 常见问题

#### 1. Node.js 未安装
**Mac解决方案**:
```bash
# 使用Homebrew安装
brew install node

# 或下载官方安装包
# https://nodejs.org
```

**Windows解决方案**:
- 启动脚本会自动下载并安装 Node.js LTS 版本
- 或手动访问 https://nodejs.org 下载安装

#### 2. 端口被占用
**Mac/Linux**:
```bash
# 查看占用3001端口的进程
lsof -i :3001

# 强制停止
lsof -ti:3001 | xargs kill -9
```

**Windows**:
```cmd
# 查看占用端口的进程
netstat -aon | findstr :3001

# 强制停止进程（替换PID）
taskkill /f /pid [PID]
```

#### 3. 权限问题（Mac/Linux）
```bash
# 添加执行权限
chmod +x start-mac.sh stop-mac.sh quick-start.sh
```

#### 4. 依赖安装失败
```bash
# 清理node_modules并重新安装
rm -rf node_modules server/node_modules
npm cache clean --force
npm install
cd server && npm install
```

### 手动启动服务

如果自动脚本出现问题，可以手动启动：

```bash
# 1. 启动API服务器
cd server
node api.js &

# 2. 启动前端服务器  
cd ..
npm run dev &
```

## 开发工作流 💻

### 日常开发
1. 运行 `./quick-start.sh` 快速启动
2. 打开 http://localhost:5173/layout-editor.html
3. 进行容器和布局编辑
4. 使用 `./stop-mac.sh` 停止服务

### 配置管理
- **直接编辑**: 在布局编辑器中修改，自动保存到 `public/data.json`
- **API管理**: 通过 API 端点管理配置
- **备份恢复**: 使用编辑器的备份功能

### 项目结构
```
Delta-Force/
├── start-mac.sh          # Mac启动脚本
├── start-windows.bat     # Windows启动脚本  
├── stop-mac.sh          # Mac停止脚本
├── stop-windows.bat     # Windows停止脚本
├── quick-start.sh       # 快速启动脚本
├── server/              # API服务器
│   ├── api.js          # Express服务器
│   ├── package.json    # 服务器依赖
│   └── node_modules/   # 服务器依赖包
├── public/             # 静态资源
│   ├── data.json       # 游戏配置文件
│   └── layout-editor.html # 布局编辑器
├── logs/               # 日志文件
├── backups/           # 配置备份
└── src/               # 游戏源码
```

## 高级功能 🎛️

### 环境变量配置
```bash
# API服务器端口（默认3001）
export API_PORT=3001

# 前端服务器端口（默认5173）  
export FRONTEND_PORT=5173

# 数据文件路径
export DATA_FILE=./public/data.json
```

### 生产部署
```bash
# 构建生产版本
npm run build

# 使用PM2管理服务
npm install -g pm2
pm2 start server/api.js --name "delta-api"
```

## 支持与反馈 💬

如果遇到问题：
1. 查看日志文件：`logs/api.log` 和 `logs/frontend.log`
2. 检查端口占用情况
3. 确认 Node.js 版本 >= 16.0.0
4. 尝试重新安装依赖

---

**享受 Delta Force 容器模拟器的开发体验！** 🎮

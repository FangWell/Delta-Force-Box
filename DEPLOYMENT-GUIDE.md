# 三角洲行动容器模拟器 - 部署指南

## 📋 部署选项

### 🎯 方案1: 静态网站部署 (推荐新手)
适合：GitHub Pages、Netlify、Vercel、Cloudflare Pages
- ✅ 免费托管
- ✅ CDN加速
- ✅ 自动HTTPS
- ❌ 无服务器功能（只能部署前端）

### 🎯 方案2: 全栈部署 (推荐完整功能)
适合：VPS、云服务器、Railway、Render
- ✅ 完整功能（前端+API）
- ✅ 数据持久化
- ✅ 容器编辑功能
- 💰 可能需要付费

### 🎯 方案3: 容器化部署 (推荐DevOps)
适合：Docker、Kubernetes、云容器服务
- ✅ 环境一致性
- ✅ 易于扩展
- ✅ 便于维护
- 🔧 需要Docker知识

---

## 🚀 方案1: 静态网站部署

### 准备工作
```bash
# 1. 构建生产版本
npm run build

# 2. 构建产物在 dist/ 目录
```

### GitHub Pages 部署

1. **创建部署脚本**：
```bash
./deploy-github.sh
```

2. **配置GitHub Actions**：
- 自动构建和部署
- 支持自定义域名

### Netlify 部署

1. **拖拽部署**：
   - 将 `dist/` 文件夹拖到 Netlify 网站
   - 获得免费域名

2. **Git部署**：
   - 连接GitHub仓库
   - 自动构建部署

### Vercel 部署

1. **命令行部署**：
```bash
npm i -g vercel
vercel --prod
```

2. **Git部署**：
   - 导入GitHub仓库
   - 自动检测Vite项目

---

## 🚀 方案2: 全栈部署

### VPS/云服务器部署

1. **服务器要求**：
   - Ubuntu 20.04+
   - Node.js 18+
   - Nginx
   - PM2

2. **一键部署脚本**：
```bash
./deploy-server.sh
```

### Railway 部署

1. **创建配置文件**：
   - `railway.json`
   - `Procfile`

2. **环境变量设置**：
   - NODE_ENV=production
   - PORT=3000

### Render 部署

1. **配置文件**：
   - `render.yaml`
   - 构建和启动命令

---

## 🚀 方案3: Docker 容器部署

### 本地Docker部署
```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d
```

### 云容器部署
- Docker Hub推送
- 阿里云容器服务
- AWS ECS
- Google Cloud Run

---

## 📊 部署对比

| 方案 | 成本 | 功能完整度 | 维护难度 | 适用场景 |
|------|------|-----------|----------|----------|
| 静态部署 | 免费 | 70% | 简单 | 展示项目 |
| 全栈部署 | $5-20/月 | 100% | 中等 | 完整应用 |
| 容器部署 | $10-50/月 | 100% | 复杂 | 企业级 |

---

## 🔧 配置文件说明

### 环境变量
```env
NODE_ENV=production
PORT=3000
API_URL=https://your-domain.com
```

### Nginx配置
- 静态文件服务
- API代理
- GZIP压缩
- 缓存策略

### PM2配置
- 进程管理
- 日志管理
- 自动重启
- 负载均衡

---

## 🛡️ 安全配置

### 生产环境安全
- 禁用编辑功能
- API访问限制
- HTTPS强制
- 请求频率限制

### 数据备份
- 定时备份配置文件
- 数据库快照
- 版本控制

---

## 📱 域名配置

### 自定义域名
- DNS设置
- SSL证书
- 子域名配置

### CDN加速
- 静态资源CDN
- 全球加速
- 缓存优化

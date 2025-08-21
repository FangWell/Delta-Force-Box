# 多阶段构建 - 前端
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# 复制前端依赖文件
COPY package*.json ./
RUN npm ci --only=production

# 复制前端源码
COPY src ./src
COPY public ./public
COPY json ./json
COPY excel ./excel
COPY index.html ./
COPY vite.config.ts ./
COPY tsconfig*.json ./

# 构建前端
RUN npm run build

# 多阶段构建 - 后端
FROM node:18-alpine AS backend-builder

WORKDIR /app/server

# 复制后端依赖文件
COPY server/package*.json ./
RUN npm ci --only=production

# 生产环境镜像
FROM nginx:alpine

# 安装Node.js（用于运行API服务器）
RUN apk add --no-cache nodejs npm

# 创建应用目录
WORKDIR /app

# 复制前端构建产物到Nginx
COPY --from=frontend-builder /app/dist /usr/share/nginx/html
COPY --from=frontend-builder /app/public/layout-editor.html /usr/share/nginx/html/
COPY --from=frontend-builder /app/json /usr/share/nginx/html/json
COPY --from=frontend-builder /app/excel /usr/share/nginx/html/excel

# 复制后端文件
COPY --from=backend-builder /app/server ./server
COPY server/api.js ./server/

# 复制Nginx配置
COPY docker/nginx.conf /etc/nginx/nginx.conf

# 复制启动脚本
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

# 创建日志目录
RUN mkdir -p /app/logs

# 暴露端口
EXPOSE 80 3001

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3001

# 启动命令
CMD ["/start.sh"]

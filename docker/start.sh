#!/bin/sh
# Docker容器启动脚本

set -e

echo "🚀 启动三角洲行动容器模拟器..."

# 启动API服务器（后台运行）
echo "📡 启动API服务器..."
cd /app/server
nohup node api.js > /app/logs/api.log 2>&1 &

# 等待API服务器启动
sleep 3

# 检查API服务器状态
if ! curl -f http://localhost:3001/api/system/info > /dev/null 2>&1; then
    echo "❌ API服务器启动失败"
    exit 1
fi

echo "✅ API服务器已启动"

# 启动Nginx
echo "🌐 启动Nginx..."
nginx -g 'daemon off;'

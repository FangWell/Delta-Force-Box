#!/bin/bash
# 快速启动脚本 - 适用于环境已配置的情况

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

echo "🚀 快速启动 Delta Force 容器模拟器..."

# 停止现有服务
pkill -f "node.*api.js" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
sleep 2

# 创建日志目录
mkdir -p logs

# 启动API服务器
echo "启动API服务器..."
cd server
nohup node api.js > ../logs/api.log 2>&1 &
echo $! > ../logs/api.pid
cd ..

# 启动前端服务器
echo "启动前端服务器..."
nohup npm run dev > logs/frontend.log 2>&1 &
echo $! > logs/frontend.pid

# 等待服务启动
sleep 3

echo "✅ 服务启动完成！"
echo "🌐 前端地址: http://localhost:5173"
echo "🔧 API地址: http://localhost:3001"
echo "📝 布局编辑器: http://localhost:5173/layout-editor.html"
echo ""
echo "📋 使用 './stop-mac.sh' 停止所有服务"

# 可选：打开浏览器
if command -v open >/dev/null 2>&1; then
    read -p "是否打开浏览器？(y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open http://localhost:5173/layout-editor.html
    fi
fi

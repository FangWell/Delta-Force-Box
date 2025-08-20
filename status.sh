#!/bin/bash

# Delta Force 项目状态检查脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

clear
echo -e "${CYAN}📊 Delta Force 容器模拟器 - 项目状态${NC}"
echo -e "${CYAN}============================================${NC}"
echo ""

# 检查Node.js环境
echo -e "${BLUE}🔧 环境检查${NC}"
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js: 未安装${NC}"
fi

if command -v npm >/dev/null 2>&1; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm: $NPM_VERSION${NC}"
else
    echo -e "${RED}❌ npm: 未安装${NC}"
fi

# 检查依赖安装状态
echo ""
echo -e "${BLUE}📦 依赖状态${NC}"
if [ -d "$PROJECT_ROOT/node_modules" ]; then
    MAIN_DEPS=$(ls "$PROJECT_ROOT/node_modules" | wc -l)
    echo -e "${GREEN}✅ 主项目依赖: $MAIN_DEPS 个包${NC}"
else
    echo -e "${RED}❌ 主项目依赖: 未安装${NC}"
fi

if [ -d "$PROJECT_ROOT/server/node_modules" ]; then
    SERVER_DEPS=$(ls "$PROJECT_ROOT/server/node_modules" | wc -l)
    echo -e "${GREEN}✅ 服务器依赖: $SERVER_DEPS 个包${NC}"
else
    echo -e "${RED}❌ 服务器依赖: 未安装${NC}"
fi

# 检查配置文件
echo ""
echo -e "${BLUE}📝 配置文件${NC}"
if [ -f "$PROJECT_ROOT/public/data.json" ]; then
    CONFIG_SIZE=$(du -h "$PROJECT_ROOT/public/data.json" | cut -f1)
    echo -e "${GREEN}✅ 游戏配置: $CONFIG_SIZE${NC}"
else
    echo -e "${RED}❌ 游戏配置: 不存在${NC}"
fi

if [ -f "$PROJECT_ROOT/package.json" ]; then
    echo -e "${GREEN}✅ 项目配置: 存在${NC}"
else
    echo -e "${RED}❌ 项目配置: 不存在${NC}"
fi

if [ -f "$PROJECT_ROOT/server/package.json" ]; then
    echo -e "${GREEN}✅ 服务器配置: 存在${NC}"
else
    echo -e "${RED}❌ 服务器配置: 不存在${NC}"
fi

# 检查端口占用
echo ""
echo -e "${BLUE}🌐 端口状态${NC}"
if lsof -i :3001 >/dev/null 2>&1; then
    API_PID=$(lsof -ti:3001)
    echo -e "${YELLOW}⚠️  端口 3001: 被占用 (PID: $API_PID)${NC}"
else
    echo -e "${GREEN}✅ 端口 3001: 可用${NC}"
fi

if lsof -i :5173 >/dev/null 2>&1; then
    FRONTEND_PID=$(lsof -ti:5173)
    echo -e "${YELLOW}⚠️  端口 5173: 被占用 (PID: $FRONTEND_PID)${NC}"
else
    echo -e "${GREEN}✅ 端口 5173: 可用${NC}"
fi

# 检查服务状态
echo ""
echo -e "${BLUE}🚀 服务状态${NC}"
if curl -s http://localhost:3001/api/config >/dev/null 2>&1; then
    echo -e "${GREEN}✅ API服务器: 运行中${NC}"
    echo -e "   ${CYAN}地址: http://localhost:3001${NC}"
else
    echo -e "${RED}❌ API服务器: 未运行${NC}"
fi

if curl -s http://localhost:5173 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ 前端服务器: 运行中${NC}"
    echo -e "   ${CYAN}地址: http://localhost:5173${NC}"
else
    echo -e "${RED}❌ 前端服务器: 未运行${NC}"
fi

# 检查日志文件
echo ""
echo -e "${BLUE}📋 日志文件${NC}"
if [ -f "$PROJECT_ROOT/logs/api.log" ]; then
    API_LOG_SIZE=$(du -h "$PROJECT_ROOT/logs/api.log" | cut -f1)
    echo -e "${GREEN}✅ API日志: $API_LOG_SIZE${NC}"
else
    echo -e "${YELLOW}⚠️  API日志: 不存在${NC}"
fi

if [ -f "$PROJECT_ROOT/logs/frontend.log" ]; then
    FRONTEND_LOG_SIZE=$(du -h "$PROJECT_ROOT/logs/frontend.log" | cut -f1)
    echo -e "${GREEN}✅ 前端日志: $FRONTEND_LOG_SIZE${NC}"
else
    echo -e "${YELLOW}⚠️  前端日志: 不存在${NC}"
fi

# 显示目录信息
echo ""
echo -e "${BLUE}📁 目录结构${NC}"
echo -e "${CYAN}项目根目录: $PROJECT_ROOT${NC}"
for dir in "server" "public" "src" "logs" "backups"; do
    if [ -d "$PROJECT_ROOT/$dir" ]; then
        FILE_COUNT=$(find "$PROJECT_ROOT/$dir" -type f | wc -l)
        echo -e "${GREEN}✅ $dir/: $FILE_COUNT 个文件${NC}"
    else
        echo -e "${YELLOW}⚠️  $dir/: 不存在${NC}"
    fi
done

# 显示启动脚本状态
echo ""
echo -e "${BLUE}🎬 启动脚本${NC}"
scripts=("start-mac.sh" "stop-mac.sh" "quick-start.sh")
for script in "${scripts[@]}"; do
    if [ -f "$PROJECT_ROOT/$script" ]; then
        if [ -x "$PROJECT_ROOT/$script" ]; then
            echo -e "${GREEN}✅ $script: 可执行${NC}"
        else
            echo -e "${YELLOW}⚠️  $script: 存在但不可执行${NC}"
        fi
    else
        echo -e "${RED}❌ $script: 不存在${NC}"
    fi
done

# 推荐操作
echo ""
echo -e "${PURPLE}============================================${NC}"
echo -e "${PURPLE}💡 推荐操作${NC}"
echo -e "${PURPLE}============================================${NC}"

# 根据状态给出建议
if ! command -v node >/dev/null 2>&1; then
    echo -e "${YELLOW}1. 安装 Node.js: ./start-mac.sh 或访问 nodejs.org${NC}"
elif [ ! -d "$PROJECT_ROOT/node_modules" ] || [ ! -d "$PROJECT_ROOT/server/node_modules" ]; then
    echo -e "${YELLOW}1. 安装依赖: ./start-mac.sh${NC}"
elif ! curl -s http://localhost:3001/api/config >/dev/null 2>&1 || ! curl -s http://localhost:5173 >/dev/null 2>&1; then
    echo -e "${YELLOW}1. 启动服务: ./quick-start.sh${NC}"
else
    echo -e "${GREEN}✅ 系统运行正常！${NC}"
    echo -e "${CYAN}🌐 访问: http://localhost:5173/layout-editor.html${NC}"
fi

echo -e "${CYAN}2. 查看详细启动指南: cat STARTUP-GUIDE.md${NC}"
echo -e "${CYAN}3. 停止所有服务: ./stop-mac.sh${NC}"
echo ""

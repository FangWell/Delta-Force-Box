#!/bin/bash

# Delta Force 容器模拟器 - Mac 停止脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}🛑 Delta Force 容器模拟器停止脚本${NC}"
echo ""

# 函数：打印状态
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 停止API服务器
stop_api_server() {
    print_status "停止 API 服务器..."
    
    if [ -f "$PROJECT_ROOT/logs/api.pid" ]; then
        API_PID=$(cat "$PROJECT_ROOT/logs/api.pid")
        if kill -0 "$API_PID" 2>/dev/null; then
            kill "$API_PID"
            print_success "API 服务器已停止 (PID: $API_PID)"
        else
            print_warning "API 服务器进程不存在"
        fi
        rm -f "$PROJECT_ROOT/logs/api.pid"
    else
        print_warning "未找到 API 服务器 PID 文件"
    fi
    
    # 强制停止占用3001端口的进程
    if lsof -i :3001 >/dev/null 2>&1; then
        print_status "强制停止占用端口3001的进程..."
        lsof -ti:3001 | xargs kill -9 2>/dev/null || true
        print_success "端口3001已释放"
    fi
}

# 停止前端服务器
stop_frontend_server() {
    print_status "停止前端服务器..."
    
    if [ -f "$PROJECT_ROOT/logs/frontend.pid" ]; then
        FRONTEND_PID=$(cat "$PROJECT_ROOT/logs/frontend.pid")
        if kill -0 "$FRONTEND_PID" 2>/dev/null; then
            kill "$FRONTEND_PID"
            print_success "前端服务器已停止 (PID: $FRONTEND_PID)"
        else
            print_warning "前端服务器进程不存在"
        fi
        rm -f "$PROJECT_ROOT/logs/frontend.pid"
    else
        print_warning "未找到前端服务器 PID 文件"
    fi
    
    # 强制停止占用5173端口的进程
    if lsof -i :5173 >/dev/null 2>&1; then
        print_status "强制停止占用端口5173的进程..."
        lsof -ti:5173 | xargs kill -9 2>/dev/null || true
        print_success "端口5173已释放"
    fi
}

# 停止所有相关进程
stop_all_processes() {
    print_status "停止所有相关进程..."
    
    # 停止所有node进程（包含api.js和vite）
    pkill -f "node.*api.js" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    pkill -f "npm run dev" 2>/dev/null || true
    
    print_success "所有相关进程已停止"
}

# 清理日志文件（可选）
cleanup_logs() {
    read -p "是否清理日志文件? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if [ -d "$PROJECT_ROOT/logs" ]; then
            rm -f "$PROJECT_ROOT/logs/"*.log
            rm -f "$PROJECT_ROOT/logs/"*.pid
            print_success "日志文件已清理"
        fi
    fi
}

# 显示状态
show_final_status() {
    echo ""
    echo -e "${GREEN}================================${NC}"
    echo -e "${GREEN}✅ 所有服务已停止${NC}"
    echo -e "${GREEN}================================${NC}"
    echo ""
    
    # 验证端口是否已释放
    if ! lsof -i :3001 >/dev/null 2>&1 && ! lsof -i :5173 >/dev/null 2>&1; then
        print_success "所有端口已释放"
    else
        print_warning "某些端口可能仍被占用，请手动检查"
    fi
}

# 主函数
main() {
    stop_api_server
    stop_frontend_server
    stop_all_processes
    cleanup_logs
    show_final_status
    
    print_success "停止脚本执行完成！"
}

# 错误处理
trap 'print_error "脚本执行被中断"; exit 1' INT TERM

# 执行主函数
main "$@"

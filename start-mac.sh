#!/bin/bash

# Delta Force 容器模拟器 - Mac 启动脚本
# 自动检测和修复启动问题

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
SERVER_DIR="$PROJECT_ROOT/server"
PUBLIC_DIR="$PROJECT_ROOT/public"

echo -e "${CYAN}🚀 Delta Force 容器模拟器启动脚本${NC}"
echo -e "${CYAN}项目路径: $PROJECT_ROOT${NC}"
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

# 检查命令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 检查端口是否被占用
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# 安装 Node.js
install_nodejs() {
    print_status "检测到 Node.js 未安装，开始安装..."
    
    if command_exists brew; then
        print_status "使用 Homebrew 安装 Node.js..."
        brew install node
    else
        print_warning "未检测到 Homebrew，将安装 Homebrew 后再安装 Node.js"
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        brew install node
    fi
    
    if command_exists node; then
        print_success "Node.js 安装成功！版本: $(node --version)"
    else
        print_error "Node.js 安装失败，请手动安装"
        exit 1
    fi
}

# 检查 Node.js
check_nodejs() {
    print_status "检查 Node.js 环境..."
    
    if ! command_exists node; then
        print_warning "未检测到 Node.js"
        read -p "是否自动安装 Node.js? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            install_nodejs
        else
            print_error "Node.js 是必需的，请手动安装后重试"
            exit 1
        fi
    else
        NODE_VERSION=$(node --version)
        print_success "Node.js 已安装，版本: $NODE_VERSION"
    fi
    
    if ! command_exists npm; then
        print_error "npm 未安装，请重新安装 Node.js"
        exit 1
    else
        NPM_VERSION=$(npm --version)
        print_success "npm 已安装，版本: $NPM_VERSION"
    fi
}

# 安装项目依赖
install_dependencies() {
    print_status "检查项目依赖..."
    
    # 检查主项目依赖
    if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
        print_warning "主项目依赖未安装"
        cd "$PROJECT_ROOT"
        print_status "安装主项目依赖..."
        npm install
        print_success "主项目依赖安装完成"
    else
        print_success "主项目依赖已安装"
    fi
    
    # 检查服务器依赖
    if [ ! -d "$SERVER_DIR/node_modules" ]; then
        print_warning "API服务器依赖未安装"
        cd "$SERVER_DIR"
        print_status "安装服务器依赖..."
        npm install
        print_success "服务器依赖安装完成"
    else
        print_success "服务器依赖已安装"
    fi
}

# 创建必要目录
create_directories() {
    print_status "检查目录结构..."
    
    if [ ! -d "$PROJECT_ROOT/backups" ]; then
        mkdir -p "$PROJECT_ROOT/backups"
        print_success "创建备份目录"
    fi
    
    if [ ! -d "$PROJECT_ROOT/public" ]; then
        mkdir -p "$PROJECT_ROOT/public"
        print_success "创建公共资源目录"
    fi
}

# 检查配置文件
check_config_files() {
    print_status "检查配置文件..."
    
    if [ ! -f "$PUBLIC_DIR/data.json" ]; then
        print_warning "未找到 data.json 配置文件"
        print_status "创建默认配置文件..."
        cat > "$PUBLIC_DIR/data.json" << 'EOF'
{
  "items": [],
  "containers": {
    "基础战利品箱": {
      "cost": 100,
      "rarity": "常见",
      "layoutIds": ["default_layout"],
      "color": "#4CAF50"
    }
  },
  "layouts": {
    "default_layout": {
      "name": "默认布局",
      "description": "系统默认布局",
      "positions": []
    }
  }
}
EOF
        print_success "默认配置文件创建完成"
    else
        print_success "配置文件已存在"
    fi
}

# 停止已运行的服务
stop_existing_services() {
    print_status "检查并停止已运行的服务..."
    
    # 停止可能占用3001端口的进程
    if port_in_use 3001; then
        print_warning "端口3001被占用，尝试停止相关进程..."
        lsof -ti:3001 | xargs kill -9 2>/dev/null || true
        sleep 2
        if port_in_use 3001; then
            print_error "无法释放端口3001，请手动处理"
            exit 1
        else
            print_success "端口3001已释放"
        fi
    fi
    
    # 停止可能占用5173端口的进程
    if port_in_use 5173; then
        print_warning "端口5173被占用，尝试停止相关进程..."
        lsof -ti:5173 | xargs kill -9 2>/dev/null || true
        sleep 2
        if port_in_use 5173; then
            print_error "无法释放端口5173，请手动处理"
            exit 1
        else
            print_success "端口5173已释放"
        fi
    fi
}

# 启动 API 服务器
start_api_server() {
    print_status "启动 API 服务器..."
    
    cd "$SERVER_DIR"
    if [ ! -f "api.js" ]; then
        print_error "API服务器文件不存在: $SERVER_DIR/api.js"
        exit 1
    fi
    
    # 后台启动 API 服务器
    nohup node api.js > ../logs/api.log 2>&1 &
    API_PID=$!
    echo $API_PID > ../logs/api.pid
    
    # 等待服务器启动
    sleep 3
    
    # 检查服务器是否启动成功
    if curl -s http://localhost:3001/api/config >/dev/null 2>&1; then
        print_success "API 服务器启动成功 (PID: $API_PID)"
        print_success "API 地址: http://localhost:3001"
    else
        print_error "API 服务器启动失败，请检查日志: logs/api.log"
        exit 1
    fi
}

# 启动前端服务器
start_frontend_server() {
    print_status "启动前端开发服务器..."
    
    cd "$PROJECT_ROOT"
    
    # 创建日志目录
    mkdir -p logs
    
    # 后台启动前端服务器
    nohup npm run dev > logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > logs/frontend.pid
    
    # 等待服务器启动
    sleep 5
    
    # 检查服务器是否启动成功
    if curl -s http://localhost:5173 >/dev/null 2>&1; then
        print_success "前端服务器启动成功 (PID: $FRONTEND_PID)"
        print_success "前端地址: http://localhost:5173"
        print_success "布局编辑器: http://localhost:5173/layout-editor.html"
    else
        print_error "前端服务器启动失败，请检查日志: logs/frontend.log"
        exit 1
    fi
}

# 显示服务状态
show_status() {
    echo ""
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}🎯 服务启动完成!${NC}"
    echo -e "${PURPLE}================================${NC}"
    echo -e "${GREEN}✅ API服务器: http://localhost:3001${NC}"
    echo -e "${GREEN}✅ 前端服务器: http://localhost:5173${NC}"
    echo -e "${GREEN}✅ 布局编辑器: http://localhost:5173/layout-editor.html${NC}"
    echo ""
    echo -e "${YELLOW}📝 日志文件:${NC}"
    echo -e "   API: logs/api.log"
    echo -e "   前端: logs/frontend.log"
    echo ""
    echo -e "${YELLOW}🛑 停止服务:${NC}"
    echo -e "   运行: ./stop-mac.sh"
    echo -e "   或手动: kill \$(cat logs/api.pid) \$(cat logs/frontend.pid)"
    echo ""
}

# 打开浏览器
open_browser() {
    read -p "是否打开浏览器? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "打开浏览器..."
        open http://localhost:5173/layout-editor.html
    fi
}

# 主函数
main() {
    # 创建日志目录
    mkdir -p "$PROJECT_ROOT/logs"
    
    # 检查环境
    check_nodejs
    
    # 安装依赖
    install_dependencies
    
    # 创建目录
    create_directories
    
    # 检查配置
    check_config_files
    
    # 停止已有服务
    stop_existing_services
    
    # 启动服务
    start_api_server
    start_frontend_server
    
    # 显示状态
    show_status
    
    # 询问是否打开浏览器
    open_browser
    
    print_success "启动脚本执行完成！"
}

# 错误处理
trap 'print_error "脚本执行被中断"; exit 1' INT TERM

# 执行主函数
main "$@"

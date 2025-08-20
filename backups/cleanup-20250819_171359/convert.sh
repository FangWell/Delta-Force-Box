#!/bin/bash

# Excel配置转换脚本 - Mac/Linux版本

# 颜色定义
RED='\033[0;31m'
GREEN        "containers"|"c")
            print_message $YELLOW "🗂️ 转换容器配置..."
            node tools/excel-converter.cjs --containers
            ;;
        "layouts"|"l")
            print_message $YELLOW "📐 转换布局配置..."
            node tools/excel-converter.cjs --layouts0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# 打印标题
print_title() {
    echo ""
    print_message $BLUE "================================"
    print_message $BLUE " Delta Force 配置转换工具"
    print_message $BLUE "================================"
    echo ""
}

# 检查Node.js环境
check_node() {
    if ! command -v node &> /dev/null; then
        print_message $RED "❌ Node.js 未安装，请先安装 Node.js"
        exit 1
    fi
    
    print_message $GREEN "✅ Node.js 环境检查通过"
}

# 安装依赖
install_dependencies() {
    print_message $YELLOW "📦 检查依赖包..."
    
    cd "$(dirname "$0")/.."
    
    # 检查xlsx包是否安装
    if [ ! -d "node_modules/xlsx" ]; then
        print_message $YELLOW "📦 安装xlsx依赖包..."
        npm install xlsx
    fi
    
    print_message $GREEN "✅ 依赖包检查完成"
}

# 创建Excel模板
create_templates() {
    print_message $YELLOW "📝 创建Excel模板文件..."
    node tools/excel-converter.cjs --template
}

# 转换所有配置
convert_all() {
    print_message $YELLOW "🔄 转换所有配置文件..."
    node tools/excel-converter.cjs
}

# 转换指定配置
convert_specific() {
    case $1 in
        "items"|"i")
            print_message $YELLOW "📦 转换物品配置..."
            node tools/excel-converter.cjs --items
            ;;
        "containers"|"c")
            print_message $YELLOW "📦 转换容器配置..."
            node tools/excel-converter.cjs --containers
            ;;
        "layouts"|"l")
            print_message $YELLOW "📦 转换布局配置..."
            node tools/excel-converter.cjs --layouts
            ;;
        *)
            print_message $RED "❌ 未知的配置类型: $1"
            show_usage
            exit 1
            ;;
    esac
}

# 显示使用帮助
show_usage() {
    print_title
    echo "用法:"
    echo "  $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help          显示此帮助信息"
    echo "  -t, --template      创建Excel模板文件"
    echo "  -a, --all           转换所有配置文件（默认）"
    echo "  -i, --items         仅转换物品配置"
    echo "  -c, --containers    仅转换容器配置"
    echo "  -l, --layouts       仅转换布局配置"
    echo ""
    echo "示例:"
    echo "  $0                  # 转换所有配置"
    echo "  $0 -t               # 创建模板"
    echo "  $0 -i               # 仅转换物品"
    echo ""
}

# 主函数
main() {
    case $1 in
        -h|--help)
            show_usage
            ;;
        -t|--template)
            print_title
            check_node
            install_dependencies
            create_templates
            ;;
        -a|--all|"")
            print_title
            check_node
            install_dependencies
            convert_all
            ;;
        -i|--items)
            print_title
            check_node
            install_dependencies
            convert_specific "items"
            ;;
        -c|--containers)
            print_title
            check_node
            install_dependencies
            convert_specific "containers"
            ;;
        -l|--layouts)
            print_title
            check_node
            install_dependencies
            convert_specific "layouts"
            ;;
        *)
            print_message $RED "❌ 未知选项: $1"
            show_usage
            exit 1
            ;;
    esac
    
    print_message $GREEN "✅ 操作完成！"
}

# 运行主函数
main "$@"

#!/bin/bash

# Excel生成脚本 - 从API配置生成Excel文档

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

print_message $BLUE "🔄 三角洲行动配置Excel生成工具"
print_message $BLUE "=================================="

# 检查API服务器
print_message $YELLOW "🔍 检查API服务器状态..."
if curl -s "http://localhost:3001/api/config" > /dev/null; then
    print_message $GREEN "✅ API服务器运行正常"
else
    print_message $RED "❌ API服务器未运行，请先启动API服务器"
    exit 1
fi

# 检查node_modules
if [ ! -d "node_modules" ]; then
    print_message $YELLOW "📦 安装依赖包..."
    npm install
fi

# 根据参数选择操作
case "${1:-all}" in
    "items"|"i")
        print_message $YELLOW "📦 生成物品配置表..."
        node tools/generate-excel-from-api.cjs --items
        ;;
    "containers"|"c")
        print_message $YELLOW "🗂️ 生成容器配置表..."
        node tools/generate-excel-from-api.cjs --containers
        ;;
    "layouts"|"l")
        print_message $YELLOW "📐 生成布局配置表..."
        node tools/generate-excel-from-api.cjs --layouts
        ;;
    "all"|*)
        print_message $YELLOW "📊 生成所有配置文档..."
        node tools/generate-excel-from-api.cjs
        ;;
esac

print_message $GREEN "🎉 Excel文档生成完成！"
print_message $BLUE "📂 文件位置: $(pwd)/excel/"

# 显示生成的文件
print_message $YELLOW "📋 生成的文件:"
for file in excel/*.xlsx; do
    if [ -f "$file" ]; then
        size=$(ls -lh "$file" | awk '{print $5}')
        print_message $GREEN "  ✅ $(basename "$file") (${size})"
    fi
done

print_message $BLUE ""
print_message $BLUE "💡 使用说明:"
print_message $BLUE "  ./generate-excel.sh           - 生成所有文档"
print_message $BLUE "  ./generate-excel.sh items     - 仅生成物品表"  
print_message $BLUE "  ./generate-excel.sh containers - 仅生成容器表"
print_message $BLUE "  ./generate-excel.sh layouts   - 仅生成布局表"

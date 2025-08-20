#!/bin/bash

# 三角洲行动配置转换工具 - 通用版本
# 支持 JSON ↔ Excel 双向转换

set -e  # 遇到错误时退出

# 脚本配置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
API_URL="http://localhost:3001"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 输出函数
info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }
step() { echo -e "${PURPLE}🔄 $1${NC}"; }

# 显示使用帮助
show_help() {
    cat << EOF
三角洲行动配置转换工具 v2.0

用法:
    $0 [选项]

选项:
    json-to-excel, j2e     将JSON配置转换为Excel格式
    excel-to-json, e2j     将Excel文件转换为JSON格式
    
    --items, -i            只处理物品配置
    --containers, -c       只处理容器配置
    --layouts, -l          只处理布局配置
    
    --template, -t         创建Excel模板文件
    --validate, -v         验证配置数据完整性
    --backup, -b           备份现有配置文件
    
    --help, -h             显示此帮助信息
    --version              显示版本信息

示例:
    $0 json-to-excel           # 完整的JSON转Excel
    $0 excel-to-json           # 完整的Excel转JSON
    $0 j2e --items             # 只转换物品配置
    $0 e2j --containers        # 只转换容器配置
    $0 --template              # 创建模板文件
    $0 --validate              # 验证数据完整性

文件结构:
    json/                      # JSON配置文件目录
    ├── items.json            # 物品配置
    ├── containers.json       # 容器配置
    └── layouts.json          # 布局配置
    
    excel/                     # Excel文件目录
    ├── items.xlsx            # 物品配置表
    ├── containers.xlsx       # 容器配置表
    └── layouts.xlsx          # 布局配置表

注意事项:
    • JSON转Excel需要API服务器运行在 $API_URL
    • Excel文件第2行为注释行，请勿修改前两行
    • 转换前会自动创建备份
    • 支持增量更新和完整转换
EOF
}

# 检查依赖
check_dependencies() {
    step "检查依赖环境..."
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        error "Node.js 未安装"
        exit 1
    fi
    
    # 检查必要的工具文件
    local tools=("generate-excel-from-api.cjs" "smart-excel-converter-v2.cjs")
    for tool in "${tools[@]}"; do
        if [ ! -f "$PROJECT_ROOT/tools/$tool" ]; then
            error "工具文件不存在: $tool"
            exit 1
        fi
    done
    
    # 创建必要的目录
    mkdir -p "$PROJECT_ROOT/json" "$PROJECT_ROOT/excel" "$PROJECT_ROOT/backups"
    
    success "依赖检查完成"
}

# 检查API服务器状态
check_api_server() {
    if curl -s "$API_URL/api/config" > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# 备份配置文件
backup_configs() {
    if [ "$1" = "true" ]; then
        step "备份配置文件..."
        local backup_dir="$PROJECT_ROOT/backups/$(date +%Y%m%d_%H%M%S)"
        mkdir -p "$backup_dir"
        
        [ -f "$PROJECT_ROOT/json/items.json" ] && cp "$PROJECT_ROOT/json/items.json" "$backup_dir/"
        [ -f "$PROJECT_ROOT/json/containers.json" ] && cp "$PROJECT_ROOT/json/containers.json" "$backup_dir/"
        [ -f "$PROJECT_ROOT/json/layouts.json" ] && cp "$PROJECT_ROOT/json/layouts.json" "$backup_dir/"
        
        success "配置已备份到: $backup_dir"
    fi
}

# JSON转Excel
json_to_excel() {
    local scope="$1"
    
    step "执行JSON转Excel转换..."
    
    if ! check_api_server; then
        error "API服务器未运行 ($API_URL)"
        warning "请先启动API服务器: ./start-mac.sh"
        exit 1
    fi
    
    cd "$PROJECT_ROOT"
    
    case "$scope" in
        "items"|"i")
            info "转换物品配置..."
            if node tools/generate-excel-from-api.cjs --items; then
                success "物品配置转换完成"
            else
                warning "单独转换失败，执行完整转换..."
                if node tools/generate-excel-from-api.cjs; then
                    success "物品配置转换完成（作为完整转换的一部分）"
                else
                    error "物品配置转换失败"
                    exit 1
                fi
            fi
            ;;
        "containers"|"c")
            info "转换容器配置..."
            if node tools/generate-excel-from-api.cjs --containers; then
                success "容器配置转换完成"
            else
                warning "单独转换失败，执行完整转换..."
                if node tools/generate-excel-from-api.cjs; then
                    success "容器配置转换完成（作为完整转换的一部分）"
                else
                    error "容器配置转换失败"
                    exit 1
                fi
            fi
            ;;
        "layouts"|"l")
            info "转换布局配置..."
            if node tools/generate-excel-from-api.cjs --layouts; then
                success "布局配置转换完成"
            else
                warning "单独转换失败，执行完整转换..."
                if node tools/generate-excel-from-api.cjs; then
                    success "布局配置转换完成（作为完整转换的一部分）"
                else
                    error "布局配置转换失败"
                    exit 1
                fi
            fi
            ;;
        *)
            info "转换所有配置..."
            if node tools/generate-excel-from-api.cjs; then
                success "所有配置转换完成"
            else
                error "配置转换失败"
                exit 1
            fi
            ;;
    esac
}

# Excel转JSON
excel_to_json() {
    local scope="$1"
    
    step "执行Excel转JSON转换..."
    
    cd "$PROJECT_ROOT"
    
    case "$scope" in
        "items"|"i")
            info "转换物品配置..."
            if node tools/smart-excel-converter-v2.cjs --items; then
                success "物品配置转换完成"
            else
                warning "智能转换失败..."
                error "物品配置转换失败"
                exit 1
            fi
            ;;
        "containers"|"c")
            info "转换容器配置..."
            if node tools/smart-excel-converter-v2.cjs --containers; then
                success "容器配置转换完成"
            else
                warning "智能转换失败..."
                error "容器配置转换失败"
                exit 1
            fi
            ;;
        "layouts"|"l")
            info "转换布局配置..."
            if node tools/smart-excel-converter-v2.cjs --layouts; then
                success "布局配置转换完成"
            else
                warning "智能转换失败..."
                error "布局配置转换失败"
                exit 1
            fi
            ;;
        *)
            info "转换所有配置..."
            if node tools/smart-excel-converter-v2.cjs; then
                success "所有配置转换完成"
            else
                warning "智能转换失败..."
                error "配置转换失败"
                exit 1
            fi
            ;;
    esac
}

# 创建模板
create_templates() {
    step "创建Excel模板文件..."
    
    cd "$PROJECT_ROOT"
    
    # 使用generate-excel-from-api生成模板
    if check_api_server && node tools/generate-excel-from-api.cjs; then
        success "模板文件创建完成"
        info "模板文件位置:"
        info "  - excel/items.xlsx (物品模板)"
        info "  - excel/containers.xlsx (容器模板)"  
        info "  - excel/layouts.xlsx (布局模板)"
    else
        warning "无法从API创建模板（API服务器未运行）"
        info "请先启动API服务器: ./start-mac.sh"
        exit 1
    fi
}

# 验证配置完整性
validate_configs() {
    step "验证配置数据完整性..."
    
    local errors=0
    
    # 检查JSON文件存在性
    local json_files=("items.json" "containers.json" "layouts.json")
    for file in "${json_files[@]}"; do
        if [ ! -f "$PROJECT_ROOT/json/$file" ]; then
            error "JSON文件不存在: json/$file"
            ((errors++))
        fi
    done
    
    # 检查Excel文件存在性
    local excel_files=("items.xlsx" "containers.xlsx" "layouts.xlsx")
    for file in "${excel_files[@]}"; do
        if [ ! -f "$PROJECT_ROOT/excel/$file" ]; then
            warning "Excel文件不存在: excel/$file"
        fi
    done
    
    # 验证API数据一致性
    if check_api_server; then
        info "验证API数据一致性..."
        
        # 获取API数据统计
        local api_stats
        api_stats=$(curl -s "$API_URL/api/config/stats" 2>/dev/null || echo '{}')
        
        if [ "$api_stats" != '{}' ]; then
            success "API数据验证通过"
        else
            warning "API数据验证失败"
        fi
    else
        warning "API服务器未运行，跳过API数据验证"
    fi
    
    if [ $errors -eq 0 ]; then
        success "配置验证完成，未发现错误"
    else
        error "发现 $errors 个错误"
        exit 1
    fi
}

# 显示状态信息
show_status() {
    step "配置状态概览..."
    
    # 文件统计
    info "文件状态:"
    local json_count=0
    local excel_count=0
    
    for file in items.json containers.json layouts.json; do
        if [ -f "$PROJECT_ROOT/json/$file" ]; then
            ((json_count++))
            echo "  ✅ json/$file"
        else
            echo "  ❌ json/$file"
        fi
    done
    
    for file in items.xlsx containers.xlsx layouts.xlsx; do
        if [ -f "$PROJECT_ROOT/excel/$file" ]; then
            ((excel_count++))
            echo "  ✅ excel/$file"
        else
            echo "  ❌ excel/$file"
        fi
    done
    
    info "统计: JSON文件 $json_count/3, Excel文件 $excel_count/3"
    
    # API服务器状态
    if check_api_server; then
        success "API服务器运行正常 ($API_URL)"
    else
        warning "API服务器未运行 ($API_URL)"
    fi
    
    # 最近备份
    local latest_backup
    latest_backup=$(find "$PROJECT_ROOT/backups" -maxdepth 1 -type d -name "*" | sort | tail -1)
    if [ -n "$latest_backup" ] && [ "$latest_backup" != "$PROJECT_ROOT/backups" ]; then
        info "最近备份: $(basename "$latest_backup")"
    else
        warning "暂无备份"
    fi
}

# 主函数
main() {
    echo -e "${CYAN}🎯 三角洲行动配置转换工具 v2.0${NC}"
    echo ""
    
    # 检查参数
    if [ $# -eq 0 ]; then
        show_help
        exit 0
    fi
    
    # 解析参数
    local action=""
    local scope=""
    local backup="false"
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            json-to-excel|j2e)
                action="j2e"
                shift
                ;;
            excel-to-json|e2j)
                action="e2j"
                shift
                ;;
            --items|-i)
                scope="items"
                shift
                ;;
            --containers|-c)
                scope="containers"
                shift
                ;;
            --layouts|-l)
                scope="layouts"
                shift
                ;;
            --template|-t)
                action="template"
                shift
                ;;
            --validate|-v)
                action="validate"
                shift
                ;;
            --backup|-b)
                backup="true"
                shift
                ;;
            --status|-s)
                action="status"
                shift
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            --version)
                echo "配置转换工具 v2.0"
                exit 0
                ;;
            *)
                error "未知参数: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # 检查依赖
    check_dependencies
    
    # 执行操作
    case "$action" in
        "j2e")
            backup_configs "$backup"
            json_to_excel "$scope"
            ;;
        "e2j")
            backup_configs "$backup"
            excel_to_json "$scope"
            ;;
        "template")
            create_templates
            ;;
        "validate")
            validate_configs
            ;;
        "status")
            show_status
            ;;
        *)
            error "请指定操作: json-to-excel 或 excel-to-json"
            show_help
            exit 1
            ;;
    esac
    
    echo ""
    success "操作完成！"
}

# 执行主函数
main "$@"

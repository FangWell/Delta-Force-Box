#!/bin/bash

# 清理过时文件脚本
# 清理已被新功能替代的旧文件和重复文件

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }

echo "🧹 开始清理过时文件..."

# 创建备份目录
BACKUP_DIR="backups/cleanup-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# 1. 清理过时的转换工具
info "清理过时的转换工具..."

# 过时的工具文件（已被 smart-excel-converter-v2.cjs 替代）
OBSOLETE_TOOLS=(
    "tools/convert.bat"
    "tools/convert.sh" 
    "tools/excel-converter.js"
    "tools/excel-converter.ts"
    "tools/generate-excel-from-api.js"
    "tools/smart-excel-converter.cjs"  # 被 v2 版本替代
)

for file in "${OBSOLETE_TOOLS[@]}"; do
    if [ -f "$file" ]; then
        mv "$file" "$BACKUP_DIR/"
        success "已备份并删除: $file"
    fi
done

# 2. 清理过时的独立脚本
info "清理过时的独立脚本..."

OBSOLETE_SCRIPTS=(
    "generate-excel.sh"           # 被 config-converter.sh 替代
    "sync-config.sh"              # 被 config-converter.sh 替代  
    "verify-config-sync.sh"       # 功能已集成
    "test-excel-converter.sh"     # 临时测试脚本
    "test-layout-editor.sh"       # 临时测试脚本
)

for script in "${OBSOLETE_SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        mv "$script" "$BACKUP_DIR/"
        success "已备份并删除: $script"
    fi
done

# 3. 清理过时的测试文件
info "清理过时的测试文件..."

OBSOLETE_TESTS=(
    "test-container-structure.sh"
    "test-numeric-container-ids.sh" 
    "test-editor-item-pool-selection.html"
    "test-item-categories.html"
    "test-item-pool-selection.html"
    "public/test-container-fix.html"  # 临时验证文件
)

for test in "${OBSOLETE_TESTS[@]}"; do
    if [ -f "$test" ]; then
        mv "$test" "$BACKUP_DIR/"
        success "已备份并删除: $test"
    fi
done

# 4. 整合过时的报告文件
info "整合过时的报告文件..."

OBSOLETE_REPORTS=(
    "CODE-CLEANUP-REPORT.md"
    "CONFIG-STRUCTURE-FIX-REPORT.md" 
    "DATA-JSON-REMOVAL-REPORT.md"
    "EXCEL-COMMENT-ENHANCEMENT-REPORT.md"
    "EXCEL-CONVERTER-UPDATE-REPORT.md"
    "EXCEL-GENERATION-REPORT.md"
    "ITEM-CATEGORY-SYSTEM-REPORT.md"
    "ITEM-POOL-SELECTION-FIX-REPORT.md"
    "LAYOUT-EDITOR-FIX-REPORT.md"
)

# 将这些报告移到备份目录
for report in "${OBSOLETE_REPORTS[@]}"; do
    if [ -f "$report" ]; then
        mv "$report" "$BACKUP_DIR/"
        success "已备份并移除: $report"
    fi
done

# 5. 清理旧的备份目录（保留最近的3个）
info "清理旧的备份目录..."
cd backups/
if ls obsolete-reports-* 1> /dev/null 2>&1; then
    # 保留最新的3个备份，删除其他的
    ls -t | grep "obsolete-reports-" | tail -n +4 | xargs -r rm -rf
    success "已清理旧的备份目录"
fi
cd ..

# 6. 清理构建缓存
info "清理构建缓存..."
if [ -d ".vite" ]; then
    rm -rf .vite
    success "已清理 Vite 缓存"
fi

if [ -d "dist" ]; then
    rm -rf dist
    success "已清理构建输出目录"
fi

# 7. 创建清理报告
info "生成清理报告..."

cat > "CLEANUP-REPORT-$(date +%Y%m%d).md" << EOF
# 文件清理报告

## 清理时间
$(date '+%Y年%m月%d日 %H:%M:%S')

## 清理内容

### 1. 过时的转换工具 ✅
- \`tools/convert.bat\` - 旧的批处理转换脚本
- \`tools/convert.sh\` - 旧的Shell转换脚本  
- \`tools/excel-converter.js\` - 旧的JavaScript版本
- \`tools/excel-converter.ts\` - TypeScript版本（未使用）
- \`tools/generate-excel-from-api.js\` - 旧的JavaScript版本
- \`tools/smart-excel-converter.cjs\` - 被v2版本替代

**替代方案**: 现在统一使用 \`smart-excel-converter-v2.cjs\` 和通用脚本 \`config-converter.sh\`

### 2. 过时的独立脚本 ✅
- \`generate-excel.sh\` - 独立Excel生成脚本
- \`sync-config.sh\` - 配置同步脚本
- \`verify-config-sync.sh\` - 同步验证脚本
- \`test-excel-converter.sh\` - 临时测试脚本
- \`test-layout-editor.sh\` - 临时测试脚本

**替代方案**: 功能已集成到 \`config-converter.sh\` 通用脚本中

### 3. 过时的测试文件 ✅  
- \`test-container-structure.sh\` - 容器结构测试
- \`test-numeric-container-ids.sh\` - 数字ID测试
- \`test-editor-item-pool-selection.html\` - 编辑器测试
- \`test-item-categories.html\` - 物品类别测试
- \`test-item-pool-selection.html\` - 物品池测试
- \`public/test-container-fix.html\` - 容器修复验证

**说明**: 这些临时测试文件已完成其验证目的

### 4. 过时的报告文件 ✅
- 9个独立的功能开发报告文件
- 功能已稳定，报告内容已过时

**替代方案**: 保留核心文档
- \`SMART-CONVERTER-REPORT.md\` - 智能转换器总报告
- \`TYPE-AWARE-FORMAT-GUIDE.md\` - 类型感知格式指南
- \`CONFIG-CONVERTER-GUIDE.md\` - 配置转换使用指南

### 5. 构建缓存清理 ✅
- \`.vite/\` - Vite构建缓存
- \`dist/\` - 构建输出目录

## 备份位置
所有删除的文件已备份到: \`$BACKUP_DIR/\`

## 当前活跃文件

### 核心转换工具
- \`tools/smart-excel-converter-v2.cjs\` - 主要的智能转换器（支持类型转换）
- \`tools/excel-converter.cjs\` - 传统转换器（备用）
- \`tools/generate-excel-from-api.cjs\` - Excel生成器（从API）

### 通用脚本
- \`config-converter.sh\` - 统一的配置转换脚本

### 核心文档
- \`README.md\` - 项目主文档
- \`STARTUP-GUIDE.md\` - 启动指南
- \`USAGE-EXAMPLES.md\` - 使用示例
- \`CONFIG-CONVERTER-GUIDE.md\` - 转换器使用指南
- \`TYPE-AWARE-FORMAT-GUIDE.md\` - 类型感知格式说明
- \`SMART-CONVERTER-REPORT.md\` - 智能转换器开发报告

## 清理效果

✅ **简化了项目结构** - 移除了重复和过时的文件
✅ **统一了工具链** - 集中使用智能转换器v2和通用脚本  
✅ **减少了维护负担** - 清理了临时测试和过时报告
✅ **保留了核心功能** - 所有重要功能都已保留并优化

---
*清理完成时间: $(date '+%Y年%m月%d日 %H:%M:%S')*
EOF

success "清理报告已生成: CLEANUP-REPORT-$(date +%Y%m%d).md"

# 8. 显示清理总结
echo
info "📊 清理总结:"
echo "  🗑️  已清理文件数量: $(find "$BACKUP_DIR" -type f | wc -l)"
echo "  📦 备份位置: $BACKUP_DIR"
echo "  📋 清理报告: CLEANUP-REPORT-$(date +%Y%m%d).md"
echo

success "🎉 文件清理完成！项目结构已优化。"

# 显示当前核心文件
info "🎯 当前核心文件结构:"
echo "
转换工具:
  ├── tools/smart-excel-converter-v2.cjs  (主要转换器)
  ├── tools/excel-converter.cjs          (备用转换器)  
  └── tools/generate-excel-from-api.cjs   (Excel生成器)

通用脚本:
  └── config-converter.sh                (统一转换脚本)

核心文档:
  ├── README.md                          (项目主文档)
  ├── CONFIG-CONVERTER-GUIDE.md          (使用指南)
  ├── TYPE-AWARE-FORMAT-GUIDE.md         (格式说明)
  └── SMART-CONVERTER-REPORT.md          (开发报告)
"

echo "✨ 项目现在更加简洁和高效！"

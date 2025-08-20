#!/bin/bash

# 清理过时文件脚本
echo "开始清理过时的文件..."

# 保留的重要文件
KEEP_FILES=(
    "README.md"
    "STARTUP-GUIDE.md" 
    "USAGE-EXAMPLES.md"
)

# 移除过时的报告文件
OBSOLETE_REPORTS=(
    "API-REFACTOR-COMPLETE.md"
    "DRAG-DROP-FINAL-FIX.md" 
    "DRAG-DROP-TIMING-FIX.md"
    "DROP-EVENT-DOUBLE-GUARD-FIX.md"
    "ENVIRONMENT-CONFIG.md"
    "FEATURE-COMPLETE-REPORT.md"
    "LAYOUT-EDITOR-BUGFIX-REPORT.md"
    "LAYOUT-EDITOR-COMPLETE-FIX.md"
    "MODULAR-CONFIG-COMPLETE.md"
    "SLOT-FIX-REPORT-V2.md"
    "api-refactor-report.md"
    "cleanup-report.md"
    "client-adaptation-report.md"
    "container-id-numeric-update-report.md"
    "container-structure-update-report.md"
    "quality-system-update-report.md"
)

# 创建备份目录
mkdir -p backups/obsolete-reports-$(date +%Y%m%d)
BACKUP_DIR="backups/obsolete-reports-$(date +%Y%m%d)"

echo "备份过时文件到 $BACKUP_DIR..."

# 移动过时文件到备份目录
for file in "${OBSOLETE_REPORTS[@]}"; do
    if [ -f "$file" ]; then
        echo "备份: $file"
        mv "$file" "$BACKUP_DIR/"
    fi
done

# 清理过时的日志文件（如果存在）
if [ -f "api.log" ]; then
    echo "备份并清理: api.log"
    mv "api.log" "$BACKUP_DIR/"
fi

echo "文件清理完成！备份位置: $BACKUP_DIR"
echo "保留的重要文件:"
for file in "${KEEP_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    fi
done

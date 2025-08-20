#!/bin/bash

echo "🧪 测试Excel转JSON转换器的新功能..."

cd "$(dirname "$0")"

# 检查API是否运行
if ! curl -s http://localhost:3001/api/items >/dev/null 2>&1; then
    echo "⚠️  API服务器未运行，请先启动API服务器"
    exit 1
else
    echo "✅ API服务器已运行"
fi

echo "📊 从API生成Excel文件..."
node tools/generate-excel-from-api.cjs

echo "📋 检查生成的Excel文件..."
if [ -f "excel/items.xlsx" ]; then
    echo "✅ 物品Excel文件已生成"
else
    echo "❌ 物品Excel文件生成失败"
    exit 1
fi

if [ -f "excel/containers.xlsx" ]; then
    echo "✅ 容器Excel文件已生成"
else
    echo "❌ 容器Excel文件生成失败"
    exit 1
fi

# 备份原始json文件
echo "💾 备份原始JSON文件..."
cp json/items.json json/items.json.backup
cp json/containers.json json/containers.json.backup

echo "🔄 使用Excel文件重新生成JSON..."
node tools/excel-converter.cjs

echo "📋 比较转换结果..."
if diff -q json/items.json.backup json/items.json >/dev/null; then
    echo "✅ 物品配置转换结果一致"
else
    echo "⚠️  物品配置转换结果有差异，检查category字段支持"
    echo "备份文件sample："
    head -10 json/items.json.backup
    echo "转换结果sample："
    head -10 json/items.json
fi

if diff -q json/containers.json.backup json/containers.json >/dev/null; then
    echo "✅ 容器配置转换结果一致"  
else
    echo "⚠️  容器配置转换结果有差异，检查itemPool字段支持"
    echo "备份文件sample："
    head -15 json/containers.json.backup
    echo "转换结果sample："
    head -15 json/containers.json
fi

# 恢复原始文件
echo "🔄 恢复原始配置文件..."
mv json/items.json.backup json/items.json
mv json/containers.json.backup json/containers.json

echo "🎉 Excel转换器测试完成！"

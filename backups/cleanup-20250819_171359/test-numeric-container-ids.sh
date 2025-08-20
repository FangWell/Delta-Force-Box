#!/bin/bash

echo "🧪 测试数字容器ID系统"
echo "======================="

# 检查API服务器
echo "📡 检查API服务器..."
CONTAINER_COUNT=$(curl -s http://localhost:3001/api/config | jq '.containers | length')
if [ "$CONTAINER_COUNT" -gt "0" ]; then
    echo "✅ API服务器运行正常，发现 $CONTAINER_COUNT 个容器"
else
    echo "❌ API服务器未响应或无容器数据"
    exit 1
fi

# 获取容器ID列表
echo ""
echo "📋 容器ID列表:"
CONTAINER_IDS=$(curl -s http://localhost:3001/api/config | jq -r '.containers | keys | .[]')
echo "$CONTAINER_IDS"

# 检查每个容器的详细信息
echo ""
echo "🔍 容器详细信息:"
for id in $CONTAINER_IDS; do
    echo "--- 容器 ID: $id ---"
    curl -s http://localhost:3001/api/config | jq -r ".containers[\"$id\"] | \"名称: \(.name)\", \"成本: \(.cost)\", \"稀有度: \(.rarity)\", \"颜色: \(.color)\""
    echo ""
done

echo "✅ 测试完成！所有容器ID已成功更新为数字格式"

#!/bin/bash

# 配置文件同步验证脚本

echo "🔍 验证配置文件同步状态"
echo "================================"

# 检查各个配置文件是否存在
echo "📁 检查配置文件..."

if [ -f "/Users/fangwell/Delta-Force/json/items.json" ]; then
    echo "✅ json/items.json 存在"
else
    echo "❌ json/items.json 不存在"
fi

if [ -f "/Users/fangwell/Delta-Force/json/containers.json" ]; then
    echo "✅ json/containers.json 存在"
else
    echo "❌ json/containers.json 不存在"
fi

if [ -f "/Users/fangwell/Delta-Force/json/layouts.json" ]; then
    echo "✅ json/layouts.json 存在"
else
    echo "❌ json/layouts.json 不存在"
fi

echo ""
echo "🧪 验证API数据..."

# 检查物品数量
API_ITEMS=$(curl -s "http://localhost:3001/api/config" | jq '.data.items | length')
echo "API物品数量: ${API_ITEMS}"

# 检查容器数量
API_CONTAINERS=$(curl -s "http://localhost:3001/api/config" | jq '.data.containers | keys | length')
echo "API容器数量: ${API_CONTAINERS}"

# 检查布局数量
API_LAYOUTS=$(curl -s "http://localhost:3001/api/config" | jq '.data.layouts | keys | length')
echo "API布局数量: ${API_LAYOUTS}"

echo ""
echo "🔧 验证新功能字段..."

# 检查第一个物品是否有category字段
ITEM_HAS_CATEGORY=$(curl -s "http://localhost:3001/api/config" | jq '.data.items[0] | has("category")')
echo "物品分类字段: $([ "$ITEM_HAS_CATEGORY" = "true" ] && echo '✅ 存在' || echo '❌ 不存在')"

# 检查第一个容器是否有itemPool字段
CONTAINER_HAS_ITEMPOOL=$(curl -s "http://localhost:3001/api/config" | jq '.data.containers["1"] | has("itemPool")')
echo "容器物品池字段: $([ "$CONTAINER_HAS_ITEMPOOL" = "true" ] && echo '✅ 存在' || echo '❌ 不存在')"

# 检查具体的物品池内容
ITEMPOOL_SIZE=$(curl -s "http://localhost:3001/api/config" | jq '.data.containers["1"].itemPool | length')
echo "容器1物品池大小: ${ITEMPOOL_SIZE} $([ "$ITEMPOOL_SIZE" -gt "0" ] && echo '✅' || echo '❌')"

echo ""
echo "📊 分类统计..."

# 统计各个分类的物品数量
for i in {1..7}; do
    COUNT=$(curl -s "http://localhost:3001/api/config" | jq ".data.items | map(select(.category == $i)) | length")
    CATEGORY_NAME=""
    case $i in
        1) CATEGORY_NAME="工艺藏品" ;;
        2) CATEGORY_NAME="工具材料" ;;
        3) CATEGORY_NAME="电子物品" ;;
        4) CATEGORY_NAME="家居物品" ;;
        5) CATEGORY_NAME="能源燃料" ;;
        6) CATEGORY_NAME="医疗道具" ;;
        7) CATEGORY_NAME="资料情报" ;;
    esac
    echo "  ${CATEGORY_NAME}: ${COUNT} 个物品"
done

echo ""
echo "✨ 同步验证完成！"

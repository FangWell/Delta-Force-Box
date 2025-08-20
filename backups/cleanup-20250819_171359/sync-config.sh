#!/bin/bash

# 配置文件同步脚本
# 将分离的JSON文件合并为统一的data.json作为后备

echo "🔄 同步配置文件..."
echo "从分离配置 → 统一配置"

# 检查分离配置文件是否存在
if [ ! -f "/Users/fangwell/Delta-Force/json/items.json" ] || [ ! -f "/Users/fangwell/Delta-Force/json/containers.json" ] || [ ! -f "/Users/fangwell/Delta-Force/json/layouts.json" ]; then
    echo "❌ 分离配置文件不完整"
    exit 1
fi

# 创建合并的配置文件
echo "📦 合并配置文件..."

cat << 'EOF' > /Users/fangwell/Delta-Force/public/data.json
{
  "items": [],
  "containers": {},
  "layouts": {}
}
EOF

# 使用jq合并配置
ITEMS=$(cat /Users/fangwell/Delta-Force/json/items.json)
CONTAINERS=$(cat /Users/fangwell/Delta-Force/json/containers.json)
LAYOUTS=$(cat /Users/fangwell/Delta-Force/json/layouts.json)

# 创建完整的配置文件
jq -n \
  --argjson items "$ITEMS" \
  --argjson containers "$CONTAINERS" \
  --argjson layouts "$LAYOUTS" \
  '{items: $items, containers: $containers, layouts: $layouts}' \
  > /Users/fangwell/Delta-Force/public/data.json

echo "✅ 配置同步完成"

# 验证结果
ITEM_COUNT=$(jq '.items | length' /Users/fangwell/Delta-Force/public/data.json)
CONTAINER_COUNT=$(jq '.containers | keys | length' /Users/fangwell/Delta-Force/public/data.json)
LAYOUT_COUNT=$(jq '.layouts | keys | length' /Users/fangwell/Delta-Force/public/data.json)

echo "📊 同步结果:"
echo "  物品: ${ITEM_COUNT}"
echo "  容器: ${CONTAINER_COUNT}" 
echo "  布局: ${LAYOUT_COUNT}"

# 验证关键字段
HAS_CATEGORY=$(jq '.items[0] | has("category")' /Users/fangwell/Delta-Force/public/data.json)
HAS_ITEMPOOL=$(jq '.containers["1"] | has("itemPool")' /Users/fangwell/Delta-Force/public/data.json)

echo "🔍 新功能字段:"
echo "  物品分类: $([ "$HAS_CATEGORY" = "true" ] && echo '✅' || echo '❌')"
echo "  物品池: $([ "$HAS_ITEMPOOL" = "true" ] && echo '✅' || echo '❌')"

echo "🎉 同步完成！"

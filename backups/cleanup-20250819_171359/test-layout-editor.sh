#!/bin/bash

echo "🧪 测试布局编辑器修复..."

cd "$(dirname "$0")"

# 检查API服务器
if ! curl -s http://localhost:3001/api/config >/dev/null 2>&1; then
    echo "❌ API服务器未运行"
    exit 1
fi

echo "✅ API服务器运行正常"

# 检查配置数据
echo "📋 验证配置数据..."

# 检查布局数据
LAYOUTS=$(curl -s "http://localhost:3001/api/config" | jq -r '.data.layouts | keys | length')
echo "布局数量: $LAYOUTS"

# 检查容器数据
CONTAINERS=$(curl -s "http://localhost:3001/api/config" | jq -r '.data.containers | keys | length')
echo "容器数量: $CONTAINERS"

# 验证容器布局引用
echo "🔗 验证容器布局引用..."
curl -s "http://localhost:3001/api/config" | jq -r '.data.containers | to_entries | .[] | "容器 " + .key + ": " + (.value.layoutIds | join(","))'

# 验证布局是否存在
echo "🎯 验证引用的布局是否存在..."
curl -s "http://localhost:3001/api/config" | jq -r '
.data as $data |
$data.containers | to_entries | .[] |
.value.layoutIds[] as $layoutId |
if $data.layouts[$layoutId] then
    "✅ 布局 " + $layoutId + " 存在"
else
    "❌ 布局 " + $layoutId + " 不存在"
end
'

# 测试前端访问
echo "🌐 测试前端页面..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/layout-editor.html)
if [ "$RESPONSE" = "200" ]; then
    echo "✅ 布局编辑器页面可访问"
else
    echo "❌ 布局编辑器页面访问失败 (HTTP $RESPONSE)"
fi

echo "🎉 测试完成！"

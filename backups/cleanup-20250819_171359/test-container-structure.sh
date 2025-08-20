#!/bin/bash

# 容器结构更新验证脚本

echo "🔍 验证容器结构更新..."

# 测试API服务器配置
echo "📡 测试API服务器配置..."
RESPONSE=$(curl -s http://localhost:3001/api/config)

if [ $? -eq 0 ]; then
    echo "✅ API服务器连接正常"
    
    # 检查容器数量
    CONTAINER_COUNT=$(echo $RESPONSE | jq '.containers | length')
    echo "📊 容器总数: ${CONTAINER_COUNT} 个"
    
    # 检查容器结构
    echo ""
    echo "🏷️  容器结构验证："
    
    for i in 1 2 3 4 5 6; do
        CONTAINER_ID="container_00${i}"
        
        # 检查ID字段
        ID=$(echo $RESPONSE | jq -r ".containers.${CONTAINER_ID}.id")
        NAME=$(echo $RESPONSE | jq -r ".containers.${CONTAINER_ID}.name")
        
        if [ "$ID" != "null" ] && [ "$NAME" != "null" ]; then
            echo "   ✅ ${CONTAINER_ID}: ID=${ID}, Name=${NAME}"
        else
            echo "   ❌ ${CONTAINER_ID}: 结构不完整"
        fi
    done
    
    # 检查必需字段
    echo ""
    echo "📋 字段完整性检查："
    
    REQUIRED_FIELDS=("id" "name" "cost" "rarity" "layoutIds" "color" "description")
    
    for field in "${REQUIRED_FIELDS[@]}"; do
        FIELD_COUNT=$(echo $RESPONSE | jq ".containers | to_entries | map(select(.value.${field} != null)) | length")
        if [ "$FIELD_COUNT" -eq "$CONTAINER_COUNT" ]; then
            echo "   ✅ ${field}: 所有容器都包含此字段"
        else
            echo "   ⚠️  ${field}: ${FIELD_COUNT}/${CONTAINER_COUNT} 个容器包含此字段"
        fi
    done
    
else
    echo "❌ API服务器连接失败，请确保服务器在运行"
fi

# 验证配置文件结构
echo ""
echo "📁 验证配置文件结构..."

if [ -f "json/containers.json" ]; then
    echo "✅ containers.json 存在"
    
    # 检查JSON格式
    if jq empty json/containers.json 2>/dev/null; then
        echo "✅ JSON格式正确"
        
        # 检查结构
        HAS_ID=$(jq 'to_entries | all(.value | has("id"))' json/containers.json)
        HAS_NAME=$(jq 'to_entries | all(.value | has("name"))' json/containers.json)
        
        if [ "$HAS_ID" == "true" ]; then
            echo "✅ 所有容器都有ID字段"
        else
            echo "❌ 部分容器缺少ID字段"
        fi
        
        if [ "$HAS_NAME" == "true" ]; then
            echo "✅ 所有容器都有name字段"
        else
            echo "❌ 部分容器缺少name字段"
        fi
        
    else
        echo "❌ JSON格式错误"
    fi
else
    echo "❌ containers.json 不存在"
fi

if [ -f "public/data.json" ]; then
    echo "✅ data.json 存在"
    
    # 检查容器部分
    HAS_CONTAINERS=$(jq 'has("containers")' public/data.json)
    if [ "$HAS_CONTAINERS" == "true" ]; then
        FALLBACK_CONTAINER_COUNT=$(jq '.containers | length' public/data.json)
        echo "✅ 包含容器配置，共 ${FALLBACK_CONTAINER_COUNT} 个"
        
        # 检查结构
        HAS_ID=$(jq '.containers | to_entries | all(.value | has("id"))' public/data.json)
        HAS_NAME=$(jq '.containers | to_entries | all(.value | has("name"))' public/data.json)
        
        if [ "$HAS_ID" == "true" ]; then
            echo "✅ Fallback配置：所有容器都有ID字段"
        else
            echo "⚠️  Fallback配置：部分容器缺少ID字段"
        fi
        
        if [ "$HAS_NAME" == "true" ]; then
            echo "✅ Fallback配置：所有容器都有name字段"
        else
            echo "⚠️  Fallback配置：部分容器缺少name字段"
        fi
    else
        echo "❌ 不包含容器配置"
    fi
else
    echo "❌ data.json 不存在"
fi

# 验证Excel转换器
echo ""
echo "🔧 验证Excel转换器..."
if [ -f "tools/excel-converter.cjs" ]; then
    echo "✅ Excel转换器存在"
    if grep -q '"Name"' tools/excel-converter.cjs; then
        echo "✅ 转换器已更新为包含Name字段"
    else
        echo "⚠️  转换器可能未更新"
    fi
else
    echo "❌ Excel转换器不存在"
fi

echo ""
echo "🎯 容器结构更新验证完成！"
echo "   前端应用: http://localhost:5173"
echo "   API服务器: http://localhost:3001"
echo "   布局编辑器: http://localhost:5173/layout-editor.html"

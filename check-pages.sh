#!/bin/bash
# GitHub Pages 状态检查脚本

REPO="FangWell/Delta-Force-Box"
PAGES_URL="https://fangwell.github.io/Delta-Force-Box"

echo "🔍 检查 GitHub Pages 部署状态..."
echo "================================="

# 检查gh-pages分支
echo "📦 检查分支状态..."
if git ls-remote --heads origin gh-pages >/dev/null 2>&1; then
    echo "✅ gh-pages 分支存在"
else
    echo "❌ gh-pages 分支不存在，重新部署..."
    ./deploy-github-simple.sh
    exit 1
fi

# 检查网站状态
echo ""
echo "🌐 检查网站可访问性..."
if curl -s -o /dev/null -w "%{http_code}" "$PAGES_URL" | grep -q "200"; then
    echo "✅ 网站已可访问: $PAGES_URL"
else
    echo "⏳ 网站还在部署中..."
    echo "💡 可能的原因："
    echo "   1. GitHub Pages 还在生效中（通常需要2-10分钟）"
    echo "   2. 需要在仓库设置中启用 Pages"
    echo "   3. 分支配置不正确"
fi

echo ""
echo "📋 手动检查步骤："
echo "1. 访问: https://github.com/$REPO/settings/pages"
echo "2. 确认 Source 设置为: Deploy from a branch"
echo "3. 确认 Branch 设置为: gh-pages / (root)"
echo "4. 点击 Save 按钮"
echo ""
echo "🎯 预期访问地址："
echo "   主应用: $PAGES_URL/"
echo "   编辑器: $PAGES_URL/layout-editor.html"
echo ""

# 等待并重试检查
read -p "是否等待并重新检查？(y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "⏳ 等待 30 秒后重新检查..."
    sleep 30
    
    if curl -s -o /dev/null -w "%{http_code}" "$PAGES_URL" | grep -q "200"; then
        echo "🎉 网站现已可访问！"
        echo "🌐 访问地址: $PAGES_URL"
    else
        echo "⚠️  网站仍未就绪，请稍后再试"
        echo "💡 建议检查 GitHub 仓库的 Pages 设置"
    fi
fi

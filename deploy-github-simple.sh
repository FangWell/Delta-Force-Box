#!/bin/bash
# GitHub Pages 简化部署脚本

set -e

echo "🚀 GitHub Pages 部署脚本"
echo "========================"

# 检查是否是Git仓库
if [ ! -d ".git" ]; then
    echo "❌ 错误：这不是一个Git仓库"
    exit 1
fi

# 获取仓库信息
REPO_URL=$(git config --get remote.origin.url)
if [[ $REPO_URL == git@github.com:* ]]; then
    REPO_PATH=$(echo $REPO_URL | sed 's/git@github.com://' | sed 's/.git$//')
else
    REPO_PATH=$(echo $REPO_URL | sed 's/https:\/\/github.com\///' | sed 's/.git$//')
fi

echo "📦 仓库: $REPO_PATH"

# 检查GitHub CLI是否安装
if ! command -v gh &> /dev/null; then
    echo "⚠️  GitHub CLI未安装，将使用Git方式部署"
    USE_GIT=true
else
    echo "✅ 使用GitHub CLI部署"
    USE_GIT=false
fi

# 构建项目
echo "🏗️  构建项目..."
npm run build

# 复制必要文件到dist目录
echo "📋 复制必要文件..."
cp public/layout-editor.html dist/
cp -r json dist/
cp -r excel dist/

# 创建.nojekyll文件
touch dist/.nojekyll

# 创建CNAME文件（如果提供自定义域名）
if [ ! -z "$1" ]; then
    echo "$1" > dist/CNAME
    echo "🌐 设置自定义域名: $1"
fi

# 进入dist目录
cd dist

if [ "$USE_GIT" = true ]; then
    # 使用Git部署
    echo "📤 使用Git推送到gh-pages分支..."
    
    git init
    git add -A
    git commit -m "Deploy to GitHub Pages - $(date)"
    
    # 尝试推送
    if git push -f "https://github.com/$REPO_PATH.git" main:gh-pages; then
        echo "✅ 部署成功！"
    else
        echo "❌ 推送失败，可能需要身份验证"
        echo "请手动执行以下命令："
        echo "cd dist"
        echo "git push -f https://github.com/$REPO_PATH.git main:gh-pages"
        cd ..
        exit 1
    fi
else
    # 使用GitHub CLI部署
    echo "📤 使用GitHub CLI部署..."
    
    git init
    git add -A
    git commit -m "Deploy to GitHub Pages - $(date)"
    
    if gh repo set-default $REPO_PATH 2>/dev/null; then
        git push -f "https://github.com/$REPO_PATH.git" main:gh-pages
        echo "✅ 部署成功！"
    else
        echo "❌ GitHub CLI认证失败，回退到Git方式"
        git push -f "https://github.com/$REPO_PATH.git" main:gh-pages
    fi
fi

cd ..

# 提供访问地址
echo ""
echo "🎉 部署完成！"
echo "========================"
echo "🌐 GitHub Pages地址:"
echo "   https://${REPO_PATH/\//.github.io/}"
echo ""
echo "📝 注意事项："
echo "   - GitHub Pages可能需要几分钟时间生效"
echo "   - 首次部署需要在GitHub仓库设置中启用Pages"
echo "   - 访问 https://github.com/$REPO_PATH/settings/pages"
echo ""

# 清理
rm -rf dist/.git

echo "✨ 访问您的网站："
echo "   主应用: https://${REPO_PATH/\//.github.io/}"
echo "   编辑器: https://${REPO_PATH/\//.github.io/}/layout-editor.html"

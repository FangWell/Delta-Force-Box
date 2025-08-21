#!/bin/bash
# GitHub Pages 部署脚本

set -e

echo "🚀 开始构建 GitHub Pages 部署..."

# 检查是否是Git仓库
if [ ! -d ".git" ]; then
    echo "❌ 错误：这不是一个Git仓库"
    exit 1
fi

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  警告：有未提交的更改，建议先提交"
    read -p "是否继续？(y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 构建项目
echo "📦 构建生产版本..."
npm run build

# 进入构建目录
cd dist

# 复制必要文件
cp ../public/layout-editor.html ./
cp -r ../json ./
cp -r ../excel ./

# 创建 .nojekyll 文件（GitHub Pages需要）
touch .nojekyll

# 创建 CNAME 文件（如果有自定义域名）
if [ ! -z "$1" ]; then
    echo "$1" > CNAME
    echo "🌐 设置自定义域名: $1"
fi

# 初始化Git仓库
git init
git add -A
git commit -m "Deploy to GitHub Pages - $(date)"

# 获取仓库信息
REPO_URL=$(git config --get remote.origin.url)
if [[ $REPO_URL == git@github.com:* ]]; then
    # SSH格式
    REPO_PATH=$(echo $REPO_URL | sed 's/git@github.com://' | sed 's/.git$//')
else
    # HTTPS格式
    REPO_PATH=$(echo $REPO_URL | sed 's/https:\/\/github.com\///' | sed 's/.git$//')
fi

echo "📤 推送到GitHub Pages分支..."
echo "仓库: $REPO_PATH"

# 推送到gh-pages分支
git push -f https://github.com/$REPO_PATH.git main:gh-pages

cd ..

echo "✅ 部署完成！"
echo "🌐 访问地址: https://${REPO_PATH/\//-}.github.io"

# 清理临时文件
rm -rf dist/.git

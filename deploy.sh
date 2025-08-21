#!/bin/bash
# 一键部署脚本

echo "🚀 三角洲行动容器模拟器 - 一键部署"
echo "================================="

# 显示部署选项
echo "请选择部署方式："
echo "1. GitHub Pages (免费静态托管)"
echo "2. Vercel (免费全栈托管)"
echo "3. VPS/云服务器 (完整功能)"
echo "4. Docker容器 (本地/云)"
echo "5. 生成部署包 (手动部署)"

read -p "请输入选择 (1-5): " choice

case $choice in
    1)
        echo "📦 准备GitHub Pages部署..."
        if [ -z "$(git remote get-url origin 2>/dev/null)" ]; then
            echo "❌ 错误：请先设置Git远程仓库"
            echo "运行: git remote add origin <your-repo-url>"
            exit 1
        fi
        
        read -p "自定义域名 (可选，直接回车跳过): " domain
        ./deploy-github.sh $domain
        ;;
        
    2)
        echo "📦 准备Vercel部署..."
        if ! command -v vercel &> /dev/null; then
            echo "📦 安装Vercel CLI..."
            npm install -g vercel
        fi
        
        echo "🚀 开始部署到Vercel..."
        vercel --prod
        ;;
        
    3)
        echo "📦 准备VPS部署..."
        read -p "服务器IP地址: " server_ip
        read -p "SSH用户名 (默认root): " ssh_user
        ssh_user=${ssh_user:-root}
        
        read -p "Git仓库地址: " git_repo
        
        echo "🚀 开始部署到服务器..."
        scp deploy-server.sh $ssh_user@$server_ip:/tmp/
        ssh $ssh_user@$server_ip "chmod +x /tmp/deploy-server.sh && /tmp/deploy-server.sh $git_repo"
        ;;
        
    4)
        echo "📦 准备Docker部署..."
        if ! command -v docker &> /dev/null; then
            echo "❌ 错误：请先安装Docker"
            echo "访问: https://docker.com/get-started"
            exit 1
        fi
        
        echo "🏗️  构建Docker镜像..."
        docker build -t delta-force-simulator .
        
        echo "🚀 启动容器..."
        docker-compose up -d
        
        echo "✅ 部署完成！"
        echo "🌐 访问地址: http://localhost"
        echo "📱 API地址: http://localhost:3001"
        ;;
        
    5)
        echo "📦 生成部署包..."
        
        # 构建项目
        npm run build
        
        # 创建部署包
        deploy_dir="delta-force-deploy-$(date +%Y%m%d_%H%M%S)"
        mkdir -p $deploy_dir
        
        # 复制文件
        cp -r dist/* $deploy_dir/
        cp public/layout-editor.html $deploy_dir/
        cp -r json $deploy_dir/
        cp -r excel $deploy_dir/
        cp -r server $deploy_dir/
        cp docker/nginx.conf $deploy_dir/
        
        # 创建部署说明
        cat > $deploy_dir/DEPLOY.md << 'EOF'
# 部署说明

## 静态网站部署
将整个文件夹内容上传到您的网站根目录

## 完整功能部署
1. 上传所有文件到服务器
2. 在server目录运行: npm install && node api.js
3. 配置Web服务器代理API请求

## Nginx配置示例
```nginx
location /api/ {
    proxy_pass http://localhost:3001;
}
```
EOF
        
        # 打包
        tar -czf $deploy_dir.tar.gz $deploy_dir
        rm -rf $deploy_dir
        
        echo "✅ 部署包已生成: $deploy_dir.tar.gz"
        echo "📄 包含部署说明文件"
        ;;
        
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac

echo ""
echo "🎉 部署完成！"
echo "📚 详细文档: ./DEPLOYMENT-GUIDE.md"

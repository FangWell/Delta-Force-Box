#!/bin/bash
# VPS/云服务器部署脚本

set -e

# 配置变量
APP_NAME="delta-force-simulator"
APP_DIR="/var/www/$APP_NAME"
NGINX_SITE="/etc/nginx/sites-available/$APP_NAME"
API_PORT=3001
WEB_PORT=80

echo "🚀 三角洲行动容器模拟器 - 服务器部署脚本"
echo "================================="

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then
    echo "❌ 请以root用户运行此脚本"
    exit 1
fi

# 更新系统
echo "📦 更新系统包..."
apt update && apt upgrade -y

# 安装Node.js
echo "📦 安装Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

# 安装其他依赖
echo "📦 安装系统依赖..."
apt install -y nginx pm2 git curl unzip

# 创建应用用户
if ! id "$APP_NAME" &>/dev/null; then
    useradd -m -s /bin/bash $APP_NAME
    echo "👤 创建应用用户: $APP_NAME"
fi

# 创建应用目录
mkdir -p $APP_DIR
cd $APP_DIR

# 如果是Git仓库，拉取代码
if [ -n "$1" ]; then
    echo "📥 克隆代码仓库..."
    git clone $1 .
else
    echo "⚠️  请将项目文件上传到 $APP_DIR"
    echo "或者使用: ./deploy-server.sh <git-repo-url>"
    exit 1
fi

# 安装依赖
echo "📦 安装项目依赖..."
npm install

# 安装API服务器依赖
cd server && npm install && cd ..

# 构建前端
echo "🏗️  构建前端..."
npm run build

# 设置文件权限
chown -R $APP_NAME:$APP_NAME $APP_DIR
chmod -R 755 $APP_DIR

# 配置PM2
echo "⚙️  配置PM2..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$APP_NAME-api',
    script: './server/api.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: $API_PORT
    },
    log_file: './logs/api.log',
    error_file: './logs/api-error.log',
    out_file: './logs/api-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm Z'
  }]
}
EOF

# 启动API服务
echo "🚀 启动API服务..."
su - $APP_NAME -c "cd $APP_DIR && pm2 start ecosystem.config.js"
su - $APP_NAME -c "pm2 save"
su - $APP_NAME -c "pm2 startup"

# 配置Nginx
echo "🌐 配置Nginx..."
cat > $NGINX_SITE << EOF
server {
    listen 80;
    server_name _;
    
    root $APP_DIR/dist;
    index index.html;
    
    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # 静态资源
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API代理
    location /api/ {
        proxy_pass http://localhost:$API_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # JSON文件
    location /json/ {
        alias $APP_DIR/json/;
        add_header Content-Type application/json;
    }
    
    # Excel文件
    location /excel/ {
        alias $APP_DIR/excel/;
    }
    
    # 布局编辑器
    location /layout-editor.html {
        alias $APP_DIR/public/layout-editor.html;
    }
    
    # 单页应用支持
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF

# 启用站点
ln -sf $NGINX_SITE /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 测试Nginx配置
nginx -t

# 重启Nginx
systemctl restart nginx
systemctl enable nginx

# 设置防火墙
echo "🔥 配置防火墙..."
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable

# 创建SSL证书脚本
cat > /usr/local/bin/setup-ssl.sh << 'EOF'
#!/bin/bash
# SSL证书设置脚本（需要域名）

if [ -z "$1" ]; then
    echo "使用方法: setup-ssl.sh <domain>"
    exit 1
fi

DOMAIN=$1

# 安装Certbot
apt install -y certbot python3-certbot-nginx

# 获取SSL证书
certbot --nginx -d $DOMAIN

# 设置自动更新
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -

echo "✅ SSL证书已设置，站点已启用HTTPS"
EOF

chmod +x /usr/local/bin/setup-ssl.sh

echo ""
echo "✅ 部署完成！"
echo "================================="
echo "🌐 网站地址: http://$(hostname -I | awk '{print $1}')"
echo "📱 API地址: http://$(hostname -I | awk '{print $1}'):$API_PORT"
echo "📝 布局编辑器: http://$(hostname -I | awk '{print $1}')/layout-editor.html"
echo ""
echo "🔧 管理命令："
echo "  - 查看API状态: pm2 status"
echo "  - 查看API日志: pm2 logs $APP_NAME-api"
echo "  - 重启API: pm2 restart $APP_NAME-api"
echo "  - 查看Nginx状态: systemctl status nginx"
echo ""
echo "🔒 SSL设置（需要域名）："
echo "  ./setup-ssl.sh your-domain.com"
echo ""
echo "📚 详细文档: https://github.com/你的用户名/Delta-Force/blob/main/DEPLOYMENT-GUIDE.md"

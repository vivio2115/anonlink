#!/bin/bash

set -e

echo "🚀 Anonlink Self-Hosted Deployment Script"
echo "========================================="

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "📁 Creating data directories..."
mkdir -p data
mkdir -p uploads
chmod 755 data uploads

if [ ! -f .env ]; then
    echo "🔑 Creating .env configuration file..."
    cp .env.example .env
    
    JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)
    sed -i "s/your-super-secret-jwt-key-change-this-to-something-random/$JWT_SECRET/g" .env
    
    echo "✅ Configuration created! Edit .env file to customize settings."
else
    echo "ℹ️  Configuration file .env already exists."
fi


echo ""
echo "🌐 What domain or IP will you use to access Anonlink?"
echo "   Examples: mydomain.com, 192.168.1.100, localhost"
read -p "Enter domain/IP [localhost]: " DOMAIN
DOMAIN=${DOMAIN:-localhost}

read -p "Enter port [8080]: " PORT
PORT=${PORT:-8080}

sed -i "s/DOMAIN=localhost:8080/DOMAIN=$DOMAIN:$PORT/g" .env
sed -i "s/PORT=8080/PORT=$PORT/g" .env

echo ""
echo "🔒 Do you want to set up SSL with Nginx reverse proxy?"
echo "   This will serve your site on port 80/443 with HTTPS"
read -p "Setup SSL? (y/N): " SETUP_SSL

if [[ $SETUP_SSL =~ ^[Yy]$ ]]; then
    echo "📋 SSL setup instructions:"
    echo "1. Place your SSL certificate as: ssl/cert.pem"
    echo "2. Place your SSL private key as: ssl/key.pem"
    echo "3. Run: docker-compose --profile with-nginx up -d"
    echo ""
    echo "For Let's Encrypt certificates, you can use certbot."
    mkdir -p ssl
    cat > nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream anonlink {
        server anonlink:8080;
    }

    server {
        listen 80;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl;
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_private_key /etc/nginx/ssl/key.pem;

        client_max_body_size 50M;

        location / {
            proxy_pass http://anonlink;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOF
    
    COMPOSE_PROFILE="--profile with-nginx"
else
    COMPOSE_PROFILE=""
fi


echo ""
echo "🏗️  Building and starting Anonlink..."
docker-compose build
docker-compose $COMPOSE_PROFILE up -d

echo ""
echo "✅ Anonlink is now running!"
echo ""
echo "📋 Access Information:"
if [[ $SETUP_SSL =~ ^[Yy]$ ]]; then
    echo "   🌐 Web Interface: https://$DOMAIN"
    echo "   🔒 SSL: Enabled (make sure to add your certificates)"
else
    echo "   🌐 Web Interface: http://$DOMAIN:$PORT"
fi
echo "   📊 API Base URL: http://$DOMAIN:$PORT/api/v1"
echo ""
echo "🔧 Management Commands:"
echo "   📋 View logs:     docker-compose logs -f"
echo "   🛑 Stop service:  docker-compose down"
echo "   🔄 Restart:       docker-compose restart"
echo "   📦 Update:        git pull && docker-compose build && docker-compose up -d"
echo ""
echo "📁 Data Location: ./data/"
echo "📂 Uploads: ./uploads/"
echo ""
echo "⚠️  Important: Keep your .env file secure and backup your data directory!"
echo ""
echo "🎉 Happy file sharing!"

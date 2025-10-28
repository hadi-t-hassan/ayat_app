#!/bin/bash

# Ayat Events Management - Production Deployment Script
# For VPS deployment with Nginx, uWSGI, and SSL

set -e

# Configuration
PROJECT_DIR="/home/ayat_app"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/quran-event-orchestrator"
FRONTEND_BUILD_DIR="$PROJECT_DIR/frontend"
DOMAIN="ayat.pingtech.dev"
EMAIL="your-email@example.com"  # Change this to your email for SSL

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Ayat Events Management - Production Deployment${NC}"
echo -e "${BLUE}📁 Project Directory: $PROJECT_DIR${NC}"
echo -e "${BLUE}🌐 Domain: $DOMAIN${NC}"

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo -e "${RED}❌ Please don't run this script as root. Use a regular user with sudo privileges.${NC}"
    exit 1
fi

# Update system packages
echo -e "${YELLOW}📦 Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

# Install essential packages
echo -e "${YELLOW}📦 Installing essential packages...${NC}"
sudo apt install -y \
    nginx \
    mysql-server \
    python3 \
    python3-pip \
    python3-venv \
    python3-dev \
    libmysqlclient-dev \
    pkg-config \
    git \
    curl \
    wget \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release

# Install Node.js 18.x
echo -e "${YELLOW}📦 Installing Node.js 18.x...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install uWSGI
echo -e "${YELLOW}📦 Installing uWSGI...${NC}"
sudo pip3 install uwsgi

# Configure MySQL
echo -e "${YELLOW}🗄️ Configuring MySQL...${NC}"
sudo mysql_secure_installation

# Create MySQL database and user
echo -e "${YELLOW}🗄️ Creating MySQL database and user...${NC}"
sudo mysql -e "CREATE DATABASE IF NOT EXISTS ayat_events CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'ayat_user'@'localhost' IDENTIFIED BY 'your_secure_password';"
sudo mysql -e "GRANT ALL PRIVILEGES ON ayat_events.* TO 'ayat_user'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

# Create project directory
echo -e "${YELLOW}📁 Creating project directory...${NC}"
sudo mkdir -p $PROJECT_DIR
sudo chown $USER:$USER $PROJECT_DIR

# Clone or update repository
if [ -d "$PROJECT_DIR/.git" ]; then
    echo -e "${YELLOW}🔄 Updating existing repository...${NC}"
    cd $PROJECT_DIR
    git stash || true
    git pull origin main
else
    echo -e "${YELLOW}📥 Cloning repository...${NC}"
    git clone https://github.com/your-username/ayat-management.git $PROJECT_DIR
    cd $PROJECT_DIR
fi

# Backend Setup
echo -e "${YELLOW}🐍 Setting up Django backend...${NC}"
cd $BACKEND_DIR

# Create virtual environment
if [ ! -d "$PROJECT_DIR/venv" ]; then
    echo -e "${YELLOW}📦 Creating Python virtual environment...${NC}"
    python3 -m venv $PROJECT_DIR/venv
fi

# Activate virtual environment and install dependencies
echo -e "${YELLOW}📦 Installing Python dependencies...${NC}"
source $PROJECT_DIR/venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Create production .env file
echo -e "${YELLOW}⚙️ Creating production environment file...${NC}"
cp env_production.txt .env
echo -e "${YELLOW}⚠️  Please edit $BACKEND_DIR/.env with your production settings!${NC}"

# Run Django migrations
echo -e "${YELLOW}🗄️ Running Django migrations...${NC}"
python manage.py migrate --settings=quran_events_backend.settings_production

# Create superuser
echo -e "${YELLOW}👤 Creating superuser...${NC}"
python manage.py shell --settings=quran_events_backend.settings_production << EOF
from accounts.models import User
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin123')
    print('Superuser created: admin/admin123')
else:
    print('Superuser already exists')
EOF

# Collect static files
echo -e "${YELLOW}📁 Collecting static files...${NC}"
python manage.py collectstatic --noinput --settings=quran_events_backend.settings_production

# Frontend Setup
echo -e "${YELLOW}⚛️ Setting up React frontend...${NC}"
cd $FRONTEND_DIR

# Install Node.js dependencies
echo -e "${YELLOW}📦 Installing Node.js dependencies...${NC}"
npm install

# Create production .env file
echo -e "${YELLOW}⚙️ Creating frontend environment file...${NC}"
cat > .env << EOF
VITE_API_BASE_URL=https://$DOMAIN/api
VITE_API_TIMEOUT=10000
VITE_APP_NAME=Ayat Events Management
VITE_APP_VERSION=1.0.0
VITE_DEV_MODE=false
VITE_DEBUG_MODE=false
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG_TOOLS=false
VITE_ENABLE_PWA=true
VITE_DEFAULT_LANGUAGE=en
VITE_SUPPORTED_LANGUAGES=en,ar
VITE_DEFAULT_THEME=light
VITE_ENABLE_DARK_MODE=true
VITE_MAX_FILE_SIZE=10485760
VITE_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf
VITE_DEFAULT_PAGE_SIZE=20
VITE_MAX_PAGE_SIZE=100
EOF

# Build React application
echo -e "${YELLOW}🔨 Building React application...${NC}"
npm run build

# Create frontend directory for Nginx
echo -e "${YELLOW}📁 Creating frontend directory...${NC}"
mkdir -p $FRONTEND_BUILD_DIR
cp -r $FRONTEND_DIR/dist/* $FRONTEND_BUILD_DIR/

# Create necessary directories
echo -e "${YELLOW}📁 Creating necessary directories...${NC}"
sudo mkdir -p /var/log/uwsgi
sudo mkdir -p /var/log/ayat_app
sudo chown -R $USER:$USER /var/log/uwsgi
sudo chown -R $USER:$USER /var/log/ayat_app

# Configure uWSGI
echo -e "${YELLOW}⚙️ Configuring uWSGI...${NC}"
sudo cp $BACKEND_DIR/uwsgi.ini /etc/uwsgi/apps-available/ayat_app.ini
sudo ln -sf /etc/uwsgi/apps-available/ayat_app.ini /etc/uwsgi/apps-enabled/

# Configure systemd service
echo -e "${YELLOW}⚙️ Configuring systemd service...${NC}"
sudo cp $PROJECT_DIR/ayat-app.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable ayat-app

# Configure Nginx
echo -e "${YELLOW}🌐 Configuring Nginx...${NC}"
sudo cp $PROJECT_DIR/nginx_ayat.conf /etc/nginx/sites-available/$DOMAIN
sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Install Certbot for SSL
echo -e "${YELLOW}🔒 Installing Certbot for SSL...${NC}"
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
echo -e "${YELLOW}🔒 Obtaining SSL certificate...${NC}"
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive

# Set proper permissions
echo -e "${YELLOW}🔐 Setting permissions...${NC}"
sudo chown -R www-data:www-data $PROJECT_DIR
sudo chmod -R 755 $PROJECT_DIR
sudo chmod +x $BACKEND_DIR/uwsgi.ini

# Start services
echo -e "${YELLOW}🔄 Starting services...${NC}"
sudo systemctl start ayat-app
sudo systemctl restart nginx

# Enable services to start on boot
sudo systemctl enable ayat-app
sudo systemctl enable nginx

# Check service status
echo -e "${YELLOW}📊 Checking service status...${NC}"
sudo systemctl status ayat-app --no-pager
sudo systemctl status nginx --no-pager

# Setup log rotation
echo -e "${YELLOW}📝 Setting up log rotation...${NC}"
sudo tee /etc/logrotate.d/ayat_app > /dev/null << EOF
/var/log/ayat_app/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload ayat-app
    endscript
}

/var/log/uwsgi/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload ayat-app
    endscript
}
EOF

# Setup firewall
echo -e "${YELLOW}🔥 Configuring firewall...${NC}"
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Setup automatic SSL renewal
echo -e "${YELLOW}🔄 Setting up automatic SSL renewal...${NC}"
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Final status check
echo -e "${YELLOW}📊 Final status check...${NC}"
echo -e "${BLUE}Backend Status:${NC}"
sudo systemctl is-active ayat-app
echo -e "${BLUE}Nginx Status:${NC}"
sudo systemctl is-active nginx
echo -e "${BLUE}MySQL Status:${NC}"
sudo systemctl is-active mysql

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Your application is now available at: https://$DOMAIN${NC}"
echo -e "${YELLOW}📝 Next steps:${NC}"
echo -e "${YELLOW}   1. Edit $BACKEND_DIR/.env with your production settings${NC}"
echo -e "${YELLOW}   2. Change the default admin password${NC}"
echo -e "${YELLOW}   3. Configure your MySQL password${NC}"
echo -e "${YELLOW}   4. Test the application functionality${NC}"
echo -e "${GREEN}🎉 Ayat Events Management is ready for production!${NC}"

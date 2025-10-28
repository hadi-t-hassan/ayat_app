#!/bin/bash

# Ayat Events Management - Quick Update Script
# This script pulls latest changes, rebuilds frontend, and restarts services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Ayat Events Management - Quick Update${NC}"

# Configuration
PROJECT_DIR="/home/ayat_app"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/quran-event-orchestrator"
FRONTEND_BUILD_DIR="$PROJECT_DIR/frontend"

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Running as root. Make sure you have the correct permissions.${NC}"
fi

# Step 1: Pull latest changes from GitHub
echo -e "${YELLOW}📥 Pulling latest changes from GitHub...${NC}"
cd $PROJECT_DIR
git pull origin main

# Step 2: Update backend dependencies (if needed)
echo -e "${YELLOW}🐍 Updating backend dependencies...${NC}"
cd $BACKEND_DIR
source ../venv/bin/activate
pip install -r requirements.txt

# Step 3: Run Django migrations (if needed)
echo -e "${YELLOW}🗄️ Running Django migrations...${NC}"
python manage.py migrate --settings=quran_events_backend.settings_production

# Step 4: Collect static files
echo -e "${YELLOW}📁 Collecting static files...${NC}"
python manage.py collectstatic --noinput --settings=quran_events_backend.settings_production

# Step 5: Update frontend dependencies
echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
cd $FRONTEND_DIR
npm install

# Step 6: Build frontend
echo -e "${YELLOW}🔨 Building frontend...${NC}"
npm run build

# Step 7: Copy frontend build to nginx directory
echo -e "${YELLOW}📁 Copying frontend build...${NC}"
mkdir -p $FRONTEND_BUILD_DIR
cp -r dist/* $FRONTEND_BUILD_DIR/

# Step 8: Set proper permissions
echo -e "${YELLOW}🔐 Setting permissions...${NC}"
chown -R www-data:www-data $PROJECT_DIR
chmod -R 755 $PROJECT_DIR

# Step 9: Restart services
echo -e "${YELLOW}🔄 Restarting services...${NC}"

# Restart uWSGI
echo -e "${BLUE}  - Restarting uWSGI...${NC}"
systemctl restart ayat-app

# Restart Nginx
echo -e "${BLUE}  - Restarting Nginx...${NC}"
systemctl restart nginx

# Step 10: Check service status
echo -e "${YELLOW}📊 Checking service status...${NC}"
echo -e "${BLUE}Backend Status:${NC}"
systemctl is-active ayat-app
echo -e "${BLUE}Nginx Status:${NC}"
systemctl is-active nginx

# Step 11: Test the application
echo -e "${YELLOW}🧪 Testing application...${NC}"
if curl -s -o /dev/null -w "%{http_code}" https://ayat.pingtech.dev/ | grep -q "200"; then
    echo -e "${GREEN}✅ Application is responding correctly!${NC}"
else
    echo -e "${RED}❌ Application might have issues. Check logs:${NC}"
    echo -e "${YELLOW}  - uWSGI logs: journalctl -u ayat-app -f${NC}"
    echo -e "${YELLOW}  - Nginx logs: tail -f /var/log/nginx/error.log${NC}"
fi

echo -e "${GREEN}🎉 Update completed successfully!${NC}"
echo -e "${GREEN}🌐 Your application is available at: https://ayat.pingtech.dev${NC}"

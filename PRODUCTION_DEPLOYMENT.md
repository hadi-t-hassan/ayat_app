# Production Deployment Guide

Complete guide for deploying Ayat Events Management to your VPS with Nginx, uWSGI, and SSL.

## 🚀 Quick Start

### 1. Prepare Your VPS

Connect to your VPS and run:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Git (if not already installed)
sudo apt install -y git

# Clone your repository
git clone https://github.com/your-username/ayat-management.git /home/ayat_app
cd /home/ayat_app

# Make deployment script executable
chmod +x deploy_production.sh

# Run the deployment script
./deploy_production.sh
```

### 2. Configure Environment Variables

After deployment, edit the production environment file:

```bash
nano /home/ayat_app/backend/.env
```

Update these critical settings:
- `SECRET_KEY` - Generate a new secret key
- `DATABASE_PASSWORD` - Your MySQL password
- `EMAIL_HOST_USER` - Your email for notifications
- `EMAIL_HOST_PASSWORD` - Your email app password

### 3. Restart Services

```bash
sudo systemctl restart ayat-app
sudo systemctl restart nginx
```

## 📋 Manual Setup Steps

If you prefer manual setup, follow these steps:

### Step 1: Install Dependencies

```bash
# System packages
sudo apt install -y nginx mysql-server python3 python3-pip python3-venv python3-dev libmysqlclient-dev pkg-config git curl wget

# Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# uWSGI
sudo pip3 install uwsgi
```

### Step 2: Configure MySQL

```bash
# Secure MySQL installation
sudo mysql_secure_installation

# Create database and user
sudo mysql -e "CREATE DATABASE ayat_events CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER 'ayat_user'@'localhost' IDENTIFIED BY 'your_secure_password';"
sudo mysql -e "GRANT ALL PRIVILEGES ON ayat_events.* TO 'ayat_user'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"
```

### Step 3: Setup Project

```bash
# Create project directory
sudo mkdir -p /home/ayat_app
sudo chown $USER:$USER /home/ayat_app

# Clone repository
git clone https://github.com/your-username/ayat-management.git /home/ayat_app
cd /home/ayat_app

# Setup backend
cd backend
python3 -m venv ../venv
source ../venv/bin/activate
pip install -r requirements.txt

# Create production .env
cp env_production.txt .env
# Edit .env with your settings

# Run migrations
python manage.py migrate --settings=quran_events_backend.settings_production

# Create superuser
python manage.py createsuperuser --settings=quran_events_backend.settings_production

# Collect static files
python manage.py collectstatic --noinput --settings=quran_events_backend.settings_production
```

### Step 4: Setup Frontend

```bash
cd ../quran-event-orchestrator

# Install dependencies
npm install

# Create production .env
cat > .env << EOF
VITE_API_BASE_URL=https://ayat.pingtech.dev/api
VITE_APP_NAME=Ayat Events Management
VITE_DEV_MODE=false
VITE_DEBUG_MODE=false
EOF

# Build application
npm run build

# Copy to nginx directory
mkdir -p ../frontend
cp -r dist/* ../frontend/
```

### Step 5: Configure uWSGI

```bash
# Copy uWSGI configuration
sudo cp backend/uwsgi.ini /etc/uwsgi/apps-available/ayat_app.ini
sudo ln -sf /etc/uwsgi/apps-available/ayat_app.ini /etc/uwsgi/apps-enabled/

# Create log directories
sudo mkdir -p /var/log/uwsgi /var/log/ayat_app
sudo chown -R $USER:$USER /var/log/uwsgi /var/log/ayat_app
```

### Step 6: Configure Systemd Service

```bash
# Copy service file
sudo cp ayat-app.service /etc/systemd/system/

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable ayat-app
sudo systemctl start ayat-app
```

### Step 7: Configure Nginx

```bash
# Copy Nginx configuration
sudo cp nginx_ayat.conf /etc/nginx/sites-available/ayat.pingtech.dev
sudo ln -sf /etc/nginx/sites-available/ayat.pingtech.dev /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Start Nginx
sudo systemctl restart nginx
```

### Step 8: Setup SSL Certificate

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d ayat.pingtech.dev -d www.ayat.pingtech.dev

# Test automatic renewal
sudo certbot renew --dry-run
```

## 🔧 Configuration Files

### Backend Environment (.env)
```env
SECRET_KEY=your-production-secret-key
DEBUG=False
ALLOWED_HOSTS=ayat.pingtech.dev,www.ayat.pingtech.dev
DATABASE_ENGINE=django.db.backends.mysql
DATABASE_NAME=ayat_events
DATABASE_USER=ayat_user
DATABASE_PASSWORD=your_secure_password
DATABASE_HOST=localhost
DATABASE_PORT=3306
CORS_ALLOWED_ORIGINS=https://ayat.pingtech.dev,https://www.ayat.pingtech.dev
```

### Frontend Environment (.env)
```env
VITE_API_BASE_URL=https://ayat.pingtech.dev/api
VITE_APP_NAME=Ayat Events Management
VITE_DEV_MODE=false
VITE_DEBUG_MODE=false
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PWA=true
```

## 🛠️ Service Management

### Check Service Status
```bash
sudo systemctl status ayat-app
sudo systemctl status nginx
sudo systemctl status mysql
```

### Restart Services
```bash
sudo systemctl restart ayat-app
sudo systemctl restart nginx
```

### View Logs
```bash
# Application logs
sudo journalctl -u ayat-app -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# uWSGI logs
sudo tail -f /var/log/uwsgi/ayat_app.log
```

## 🔒 Security Checklist

- [ ] Changed default admin password
- [ ] Updated SECRET_KEY in .env
- [ ] Set strong MySQL password
- [ ] Configured firewall (ports 22, 80, 443)
- [ ] SSL certificate installed and working
- [ ] Regular security updates enabled
- [ ] Log rotation configured
- [ ] Backup strategy in place

## 📊 Monitoring

### Health Check
```bash
# Check if application is responding
curl -I https://ayat.pingtech.dev/health/

# Check API endpoint
curl -I https://ayat.pingtech.dev/api/
```

### Performance Monitoring
```bash
# Check system resources
htop
df -h
free -h

# Check service status
sudo systemctl status ayat-app nginx mysql
```

## 🔄 Updates and Maintenance

### Update Application
```bash
cd /home/ayat_app
git pull origin main

# Backend updates
cd backend
source ../venv/bin/activate
pip install -r requirements.txt
python manage.py migrate --settings=quran_events_backend.settings_production
python manage.py collectstatic --noinput --settings=quran_events_backend.settings_production

# Frontend updates
cd ../quran-event-orchestrator
npm install
npm run build
cp -r dist/* ../frontend/

# Restart services
sudo systemctl restart ayat-app
```

### Backup Database
```bash
mysqldump -u ayat_user -p ayat_events > backup_$(date +%Y%m%d_%H%M%S).sql
```

## 🆘 Troubleshooting

### Common Issues

1. **502 Bad Gateway**
   - Check uWSGI service: `sudo systemctl status ayat-app`
   - Check socket permissions: `ls -la /home/ayat_app/backend/ayat_app.sock`

2. **Static files not loading**
   - Check static files: `ls -la /home/ayat_app/backend/staticfiles/`
   - Run collectstatic: `python manage.py collectstatic --noinput`

3. **Database connection error**
   - Check MySQL service: `sudo systemctl status mysql`
   - Verify database credentials in .env

4. **SSL certificate issues**
   - Check certificate: `sudo certbot certificates`
   - Renew certificate: `sudo certbot renew`

### Log Locations
- Application logs: `/var/log/ayat_app/`
- uWSGI logs: `/var/log/uwsgi/`
- Nginx logs: `/var/log/nginx/`
- System logs: `sudo journalctl -u ayat-app`

## 📞 Support

If you encounter issues:
1. Check the logs first
2. Verify all services are running
3. Check configuration files
4. Ensure all dependencies are installed
5. Verify database connectivity

Your Ayat Events Management system should now be running securely on https://ayat.pingtech.dev! 🎉

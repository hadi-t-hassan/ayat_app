# Environment Setup Guide

This guide explains how to set up environment variables for both local development and production deployment.

## Backend Environment Setup

### 0. MySQL Database Setup

Before setting up the environment, ensure MySQL is installed and running:

#### Install MySQL:
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server

# macOS (with Homebrew)
brew install mysql
brew services start mysql

# Windows
# Download and install from https://dev.mysql.com/downloads/mysql/
```

#### Create Database:
```sql
-- Connect to MySQL as root
mysql -u root -p

-- Create database
CREATE DATABASE ayat_events CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (optional, for better security)
CREATE USER 'ayat_user'@'localhost' IDENTIFIED BY 'Ayat@pass_mysql_123';
GRANT ALL PRIVILEGES ON ayat_events.* TO 'ayat_user'@'localhost';
FLUSH PRIVILEGES;
```

### 1. Create Backend .env File

Copy the template file and create your local environment file:

```bash
cd backend
cp env_template.txt .env
```

### 2. Configure Backend .env

Edit `backend/.env` with your local development settings:

```env
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0

# Database Configuration (MySQL)
DATABASE_ENGINE=django.db.backends.mysql
DATABASE_NAME=ayat_events
DATABASE_USER=root
DATABASE_PASSWORD=your_mysql_password
DATABASE_HOST=localhost
DATABASE_PORT=3306

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173,http://localhost:8080,http://127.0.0.1:8080

# JWT Settings
JWT_ACCESS_TOKEN_LIFETIME_DAYS=1
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7

# Static and Media Files
STATIC_URL=/static/
STATIC_ROOT=staticfiles
MEDIA_URL=/media/
MEDIA_ROOT=media
```

### 3. Production Backend .env

For production, create `backend/.env` on your server with production values:

```env
# Django Settings
SECRET_KEY=your-production-secret-key
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database Configuration (MySQL for production)
DATABASE_ENGINE=django.db.backends.mysql
DATABASE_NAME=ayat_events
DATABASE_USER=your_db_user
DATABASE_PASSWORD=your_db_password
DATABASE_HOST=localhost
DATABASE_PORT=3306

# CORS Settings
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# JWT Settings
JWT_ACCESS_TOKEN_LIFETIME_DAYS=1
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7

# Static and Media Files
STATIC_URL=/static/
STATIC_ROOT=/path/to/staticfiles
MEDIA_URL=/media/
MEDIA_ROOT=/path/to/media
```

## Frontend Environment Setup

### 1. Create Frontend .env File

Copy the template file and create your local environment file:

```bash
cd quran-event-orchestrator
cp env_template.txt .env
```

### 2. Configure Frontend .env

Edit `quran-event-orchestrator/.env` with your local development settings:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api
VITE_API_TIMEOUT=10000

# Application Settings
VITE_APP_NAME=Ayat Events Management
VITE_APP_VERSION=1.0.0
VITE_DEV_MODE=true
VITE_DEBUG_MODE=true

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG_TOOLS=true
VITE_ENABLE_PWA=false

# Localization
VITE_DEFAULT_LANGUAGE=en
VITE_SUPPORTED_LANGUAGES=en,ar

# Theme Settings
VITE_DEFAULT_THEME=light
VITE_ENABLE_DARK_MODE=true
```

### 3. Production Frontend .env

For production, create `quran-event-orchestrator/.env` on your server with production values:

```env
# API Configuration
VITE_API_BASE_URL=https://yourdomain.com/api
VITE_API_TIMEOUT=10000

# Application Settings
VITE_APP_NAME=Ayat Events Management
VITE_APP_VERSION=1.0.0
VITE_DEV_MODE=false
VITE_DEBUG_MODE=false

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG_TOOLS=false
VITE_ENABLE_PWA=true

# Localization
VITE_DEFAULT_LANGUAGE=en
VITE_SUPPORTED_LANGUAGES=en,ar

# Theme Settings
VITE_DEFAULT_THEME=light
VITE_ENABLE_DARK_MODE=true
```

## Git Configuration

Both `.env` files are automatically ignored by Git (added to `.gitignore`), so they won't be committed to the repository. This ensures:

- ✅ Local development settings stay local
- ✅ Production settings stay on the server
- ✅ No sensitive information in version control
- ✅ Easy deployment without configuration conflicts

## Environment Variables Reference

### Backend Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `SECRET_KEY` | Django secret key | Required | `django-insecure-...` |
| `DEBUG` | Debug mode | `True` | `True/False` |
| `ALLOWED_HOSTS` | Allowed hosts | `localhost,127.0.0.1` | `yourdomain.com` |
| `DATABASE_ENGINE` | Database engine | `django.db.backends.mysql` | `django.db.backends.mysql` |
| `DATABASE_NAME` | Database name | `ayat_events` | `ayat_events` |
| `CORS_ALLOWED_ORIGINS` | CORS origins | `localhost:3000,localhost:8080` | `https://yourdomain.com` |

### Frontend Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `VITE_API_BASE_URL` | API base URL | `http://localhost:8000/api` | `https://yourdomain.com/api` |
| `VITE_API_TIMEOUT` | API timeout | `10000` | `15000` |
| `VITE_APP_NAME` | App name | `Ayat Events Management` | `Your App Name` |
| `VITE_DEV_MODE` | Development mode | `true` | `false` |
| `VITE_DEBUG_MODE` | Debug mode | `true` | `false` |

## Deployment Workflow

1. **Local Development**: Use local `.env` files with development settings
2. **Push to Git**: Only code changes are pushed (`.env` files are ignored)
3. **Server Deployment**: Create production `.env` files on the server
4. **Pull from Git**: Code is pulled, but `.env` files remain server-specific

This setup ensures clean separation between development and production environments while maintaining security and ease of deployment.

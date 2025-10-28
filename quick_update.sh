#!/bin/bash

# Quick Update Script - Minimal version
# Just pulls, builds, and restarts

set -e

echo "🚀 Quick Update Starting..."

# Pull changes
cd /home/ayat_app
git pull origin main

# Build frontend
cd quran-event-orchestrator
npm install
npm run build
cp -r dist/* ../frontend/

# Restart services
systemctl restart ayat-app
systemctl restart nginx

echo "✅ Quick Update Complete!"
echo "🌐 https://ayat.pingtech.dev"

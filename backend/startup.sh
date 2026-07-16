#!/bin/bash
# Azure App Service startup script untuk GeoKost FastAPI

echo "[GeoKost] Starting FastAPI backend on Azure..."

# Install dependencies jika belum
pip install -r requirements.txt

# Jalankan server dengan gunicorn + uvicorn worker
# Azure App Service inject PORT melalui env var WEBSITES_PORT (default 8000)
gunicorn app.main:app \
  --workers 2 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --timeout 120 \
  --access-logfile '-' \
  --error-logfile '-'

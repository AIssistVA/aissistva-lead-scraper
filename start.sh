#!/bin/bash

echo "🚀 Starting B2B Lead Scraper..."

# Check if Redis is running
if ! redis-cli ping > /dev/null 2>&1; then
    echo "⚠️  Redis is not running. Starting Redis..."
    redis-server --daemonize yes
    sleep 2
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p exports logs

# Initialize database
echo "🗄️  Initializing database..."
python -c "
from app import app, db
with app.app_context():
    db.create_all()
    print('Database initialized successfully')
"

# Start Celery worker in background
echo "🔄 Starting Celery worker..."
celery -A app.celery worker --loglevel=info --detach

# Start the application
echo "🌐 Starting web application..."
echo "Access the application at: http://localhost:5000"
echo "Press Ctrl+C to stop"

python run.py
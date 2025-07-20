FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    unzip \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Chrome
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p exports logs

# Set environment variables
ENV FLASK_APP=app.py
ENV FLASK_ENV=production
ENV PYTHONPATH=/app

# Expose port
EXPOSE 5000

# Create startup script
RUN echo '#!/bin/bash\n\
echo "🚀 Starting B2B Lead Scraper..."\n\
\n\
# Wait for Redis\n\
echo "⏳ Waiting for Redis..."\n\
while ! redis-cli -h redis ping > /dev/null 2>&1; do\n\
    sleep 1\n\
done\n\
echo "✅ Redis is ready"\n\
\n\
# Initialize database\n\
echo "🗄️ Initializing database..."\n\
python -c "\n\
from app import app, db\n\
with app.app_context():\n\
    db.create_all()\n\
    print(\"Database initialized successfully\")\n\
"\n\
\n\
# Start Celery worker in background\n\
echo "🔄 Starting Celery worker..."\n\
celery -A app.celery worker --loglevel=info --detach\n\
\n\
# Start the application\n\
echo "🌐 Starting web application..."\n\
echo "Access the application at: http://localhost:5000"\n\
\n\
python run.py\n\
' > /app/start.sh && chmod +x /app/start.sh

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/ || exit 1

# Run the application
CMD ["/app/start.sh"]
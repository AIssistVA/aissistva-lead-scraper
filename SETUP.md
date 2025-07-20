# Quick Setup Guide - B2B Lead Scraper

## 🚀 Quick Start (Docker)

The fastest way to get started:

```bash
# Clone the repository
git clone <repository-url>
cd b2b-lead-scraper

# Start with Docker Compose
docker-compose up -d

# Access the application
open http://localhost:5000
```

## 🛠️ Manual Setup

### Prerequisites
- Python 3.8+
- Redis server
- Chrome/Chromium browser

### Step-by-Step Installation

1. **Install Redis**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install redis-server
   
   # macOS
   brew install redis
   
   # Start Redis
   redis-server
   ```

2. **Setup Python Environment**
   ```bash
   # Create virtual environment
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   ```

3. **Configure Environment**
   ```bash
   # Copy example environment file
   cp .env.example .env
   
   # Edit .env with your settings
   nano .env
   ```

4. **Initialize Database**
   ```bash
   # Create database tables
   python -c "
   from app import app, db
   with app.app_context():
       db.create_all()
       print('Database initialized')
   "
   ```

5. **Start Services**
   ```bash
   # Start Celery worker (in new terminal)
   celery -A app.celery worker --loglevel=info
   
   # Start application (in another terminal)
   python run.py
   ```

6. **Access Application**
   - Open http://localhost:5000
   - Navigate to "Scrape" to start lead generation
   - View results in "Leads" section

## 🧪 Test Your Setup

Run the test script to verify everything is working:

```bash
python test_setup.py
```

## 📊 Using the Application

### 1. Dashboard
- View total leads and statistics
- See recent high-priority leads
- Quick access to all features

### 2. Start Scraping
- Select target industries (manufacturing, construction, etc.)
- Choose Kansas City metro locations
- Configure employee and revenue ranges
- Click "Start Scraping"

### 3. Manage Leads
- Filter by industry, location, priority
- Sort by various criteria
- Export to CSV for CRM integration
- View detailed lead information

### 4. Analytics
- Industry distribution charts
- Location analysis
- Priority score breakdown
- Lead quality metrics

## 🎯 Target Criteria

The system is configured to find:
- **Companies**: 10-50 employees
- **Revenue**: $500K-$2M annually
- **Location**: Kansas City metro area
- **Industries**: Manufacturing, construction, professional services, etc.
- **Technology**: Low automation, manual processes

## 🔧 Configuration

### Environment Variables (.env)
```env
# Flask
SECRET_KEY=your-secret-key
DEBUG=True

# Database
DATABASE_URL=sqlite:///leads.db

# Celery
CELERY_BROKER_URL=redis://localhost:6379/0

# Scraping
SCRAPING_DELAY=2
MAX_LEADS_PER_SOURCE=20
```

### Customizing Targets
Edit `config.py` to modify:
- Target industries and locations
- Search queries
- Lead scoring weights
- Pain point indicators

## 📈 Lead Scoring

Leads are scored 0-100 based on:
- **Employee Count (15%)**: 10-50 employees optimal
- **Automation Level (25%)**: Lower automation = higher score
- **Pain Points (30%)**: Manual processes, hiring needs
- **Industry (10%)**: Manufacturing, logistics prioritized
- **Location (10%)**: Kansas City metro focus
- **Contact Info (10%)**: Completeness of data

## 🚨 Important Notes

### Legal Compliance
- Respect website terms of service
- Implement rate limiting
- Follow robots.txt guidelines
- Use data responsibly

### Performance
- Default 2-second delay between requests
- Configurable via SCRAPING_DELAY
- Monitor Redis memory usage
- Regular database maintenance

## 🔧 Troubleshooting

### Common Issues

1. **Redis Connection Failed**
   ```bash
   # Start Redis
   redis-server
   
   # Test connection
   redis-cli ping
   ```

2. **Chrome Driver Issues**
   ```bash
   # Install Chrome/Chromium
   sudo apt-get install chromium-browser
   ```

3. **Database Errors**
   ```bash
   # Reset database
   rm leads.db
   python -c "from app import app, db; app.app_context().push(); db.create_all()"
   ```

4. **Import Errors**
   ```bash
   # Reinstall dependencies
   pip install -r requirements.txt
   ```

### Getting Help

1. Run the test script: `python test_setup.py`
2. Check logs in the `logs/` directory
3. Verify Redis is running: `redis-cli ping`
4. Check database: `sqlite3 leads.db .tables`

## 📞 Support

- Check the troubleshooting section
- Review configuration options
- Run the test script for diagnostics
- Check application logs for errors

---

**Ready to find your next B2B leads! 🎯**
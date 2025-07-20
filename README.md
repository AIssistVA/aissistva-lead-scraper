# B2B Lead Scraper - Kansas City Metro

A comprehensive web-based B2B lead generation tool specifically designed to target small-medium businesses in the Kansas City metro area. This tool automates the process of finding, qualifying, and scoring leads based on automation potential and business characteristics.

## 🎯 Target Criteria

### Company Profile
- **Size**: 10-50 employees
- **Revenue**: $500K-$2M annually
- **Technology**: Minimal automation, likely using manual processes

### Target Industries
- Manufacturing, Woodworking, Metal Fabrication, Furniture
- Construction, Logistics, Distribution
- Professional Services, Healthcare, Dental, Law, Accounting
- Real Estate, Retail, Restaurants, Auto Repair
- Landscaping, Cleaning Services, Consulting Firms

### Geographic Focus
Kansas City metro area including:
- Kansas City MO/KS
- Overland Park, Olathe, Independence
- Lee's Summit, Shawnee, Blue Springs
- Lenexa, Leawood

## 🚀 Features

### Core Functionality
- **Multi-Source Scraping**: Google Maps, Yelp, LinkedIn, Yellow Pages, Chamber of Commerce
- **Intelligent Lead Scoring**: Priority scoring based on automation potential and business characteristics
- **Pain Point Detection**: Identifies companies with manual processes and efficiency needs
- **Contact Enrichment**: Finds decision maker emails and contact information
- **Duplicate Removal**: Eliminates duplicate leads across sources
- **Email Validation**: Verifies email addresses for deliverability

### Web Interface
- **Modern Dashboard**: Real-time statistics and lead overview
- **Scraping Configuration**: Customizable industry and location targeting
- **Lead Management**: Filter, sort, and export leads
- **Analytics**: Charts and insights on lead quality and distribution
- **Export Options**: CSV export for CRM integration

### Automation Features
- **Background Processing**: Celery-based job queue for non-blocking scraping
- **Scheduled Scraping**: Daily automated lead discovery
- **Lead Scoring**: Automatic prioritization based on multiple factors
- **Data Enrichment**: Revenue estimates and company research

## 📋 Data Points Extracted

For each lead, the system captures:
- Company name and website
- Primary contact (Owner/CEO/Operations Manager)
- Email address and phone number
- Employee count and industry classification
- Location (city, state)
- LinkedIn company page
- Pain point indicators
- Automation level assessment
- Priority score (1-100)

## 🛠️ Installation

### Prerequisites
- Python 3.8+
- Redis server
- Chrome/Chromium browser (for Selenium)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd b2b-lead-scraper
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Initialize database**
   ```bash
   flask db init
   flask db migrate
   flask db upgrade
   ```

6. **Start Redis server**
   ```bash
   redis-server
   ```

7. **Start Celery worker**
   ```bash
   celery -A app.celery worker --loglevel=info
   ```

8. **Run the application**
   ```bash
   python app.py
   ```

The application will be available at `http://localhost:5000`

## 🔧 Configuration

### Environment Variables
Create a `.env` file with the following variables:

```env
# Flask Configuration
SECRET_KEY=your-secret-key-here
DEBUG=True

# Database
DATABASE_URL=sqlite:///leads.db

# Celery
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# Scraping Settings
SCRAPING_DELAY=2
MAX_LEADS_PER_SOURCE=20
REQUEST_TIMEOUT=10

# Email Validation
EMAIL_VALIDATION_ENABLED=True

# Export Directory
EXPORT_DIR=exports
```

### Customizing Target Criteria
Edit `config.py` to modify:
- Target industries and locations
- Employee and revenue ranges
- Search queries
- Lead scoring weights
- Pain point indicators

## 📊 Usage Guide

### Starting a Scrape Job

1. **Navigate to Scrape Page**: Click "Scrape" in the navigation
2. **Select Industries**: Choose target industries (all selected by default)
3. **Select Locations**: Choose target locations in Kansas City metro
4. **Configure Options**: Set employee range, revenue range, and data sources
5. **Start Scraping**: Click "Start Scraping" to begin the process

### Managing Leads

1. **View All Leads**: Navigate to "Leads" page
2. **Filter Results**: Use filters for industry, location, priority, automation level
3. **Sort Leads**: Sort by priority score, company name, date added, etc.
4. **Export Data**: Download CSV for CRM integration
5. **View Details**: Click the eye icon for detailed lead information

### Analytics Dashboard

1. **Overview Statistics**: View total leads, high priority count, active jobs
2. **Industry Distribution**: See breakdown by industry
3. **Location Analysis**: Geographic distribution of leads
4. **Quality Metrics**: Priority score and automation level breakdown
5. **Lead Quality**: High, medium, and low quality lead counts

## 🎯 Lead Scoring Algorithm

The system uses a weighted scoring algorithm (0-100) based on:

- **Employee Count (15%)**: Optimal range 10-50 employees
- **Automation Level (25%)**: Lower automation = higher score
- **Pain Points (30%)**: Manual processes, hiring, efficiency needs
- **Industry (10%)**: Manufacturing, logistics, construction prioritized
- **Location (10%)**: Kansas City metro focus
- **Contact Info (10%)**: Completeness of contact data

### Priority Levels
- **High (80-100)**: Ready for immediate outreach
- **Medium (60-79)**: Requires additional research
- **Low (0-59)**: May not be suitable targets

## 🔍 Pain Point Detection

The system identifies companies likely to need automation solutions by detecting:

### High-Value Indicators
- "Manual processes"
- "Spreadsheet tracking"
- "Paper-based systems"
- "Overwhelmed with paperwork"

### Medium-Value Indicators
- "Looking for efficiency"
- "Growing team"
- "Hiring" (operations/admin roles)
- "Need better organization"

### Low-Value Indicators
- "Traditional"
- "Family-owned"
- "Established"

## 📈 Export Formats

### CSV Export
Standard CSV format with columns:
- Company_Name
- Contact_Name
- Email
- Phone
- Website
- Employees
- Industry
- Location
- Pain_Point_Indicators
- Automation_Level
- Priority_Score

### CRM Integration
- Compatible with Salesforce, HubSpot, and other CRM systems
- Automatic lead scoring and qualification
- Contact enrichment for better outreach

## 🚨 Important Notes

### Legal Compliance
- Respect robots.txt files
- Implement rate limiting
- Follow website terms of service
- Consider using official APIs where available

### Rate Limiting
- Default 2-second delay between requests
- Configurable via SCRAPING_DELAY environment variable
- Respects website rate limits

### Data Quality
- Email validation for deliverability
- Duplicate removal across sources
- Contact enrichment for decision makers
- Automated lead scoring

## 🔧 Troubleshooting

### Common Issues

1. **Chrome Driver Issues**
   ```bash
   # Install Chrome/Chromium
   sudo apt-get install chromium-browser  # Ubuntu/Debian
   brew install chromium  # macOS
   ```

2. **Redis Connection**
   ```bash
   # Start Redis server
   redis-server
   # Check if running
   redis-cli ping
   ```

3. **Database Issues**
   ```bash
   # Reset database
   rm leads.db
   flask db upgrade
   ```

4. **Permission Issues**
   ```bash
   # Create exports directory
   mkdir -p exports
   chmod 755 exports
   ```

### Performance Optimization

1. **Increase Concurrency**
   ```bash
   celery -A app.celery worker --loglevel=info --concurrency=4
   ```

2. **Database Optimization**
   - Use PostgreSQL for production
   - Add database indexes
   - Regular database maintenance

3. **Memory Management**
   - Monitor Redis memory usage
   - Clear old job results
   - Optimize scraping batch sizes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This tool is for educational and legitimate business purposes only. Users are responsible for:
- Complying with website terms of service
- Respecting rate limits and robots.txt
- Following applicable data protection laws
- Using scraped data responsibly and ethically

## 📞 Support

For questions or support:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the configuration options

---

**Built with ❤️ for the Kansas City business community**
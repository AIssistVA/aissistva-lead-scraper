# AIssistVA Lead Generation System

An AI-powered lead generation and qualification system designed specifically for AI automation services. This enterprise-level application combines web scraping, AI analysis, and intelligent lead management to help businesses find and qualify high-potential prospects.

## 🚀 Features

### Core Functionality
- **Web Scraping Engine**: Automated extraction from Google Business, Yelp, and Yellow Pages
- **AI Lead Qualification**: GPT-4 powered analysis and scoring (1-10 scale)
- **Contact Discovery**: Email and phone number extraction with verification
- **Technology Stack Detection**: WordPress, Shopify, and custom platform identification
- **Pain Point Analysis**: AI-driven identification of automation opportunities
- **Growth Signal Detection**: Hiring, expansion, and business growth indicators

### Dashboard & Analytics
- **Real-time Metrics**: Live scraping progress and lead statistics
- **Visual Analytics**: Interactive charts and performance dashboards
- **Lead Scoring System**: Color-coded priority system with AI insights
- **Filterable Database**: Advanced search and filtering capabilities
- **Bulk Operations**: Mass lead management and status updates

### Compliance & Ethics
- **Rate Limiting**: Respectful scraping with configurable delays
- **Robots.txt Compliance**: Automatic adherence to website policies
- **GDPR Compliance**: Data retention controls and opt-out mechanisms
- **Ethical Practices**: Transparent data collection and usage policies

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** with TypeScript
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **React Query** for state management
- **Framer Motion** for animations

### Backend
- **Node.js** with Express
- **SQLite** database for data storage
- **Puppeteer** for web scraping
- **OpenAI API** for AI analysis
- **JWT** for authentication

### Key Libraries
- **Cheerio** for HTML parsing
- **Axios** for HTTP requests
- **Winston** for logging
- **CSV Writer** for data export

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key
- Modern web browser

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd aissistva-lead-gen
```

### 2. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 3. Environment Setup
```bash
# Copy environment file
cp .env.example .env

# Edit .env file with your configuration
nano .env
```

**Required Environment Variables:**
```env
OPENAI_API_KEY=your-openai-api-key-here
JWT_SECRET=your-super-secret-jwt-key-here
```

### 4. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 5. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Default login: `admin` / `password`

## 📊 Usage Guide

### Starting a Scraping Job

1. **Navigate to Scraping Tab**
   - Click "Scraping" in the sidebar
   - Configure location and industry
   - Select data sources (Google, Yelp, Yellow Pages)

2. **Configure Parameters**
   - Set maximum results (10-100)
   - Choose target industries
   - Configure rate limiting

3. **Start Scraping**
   - Click "Start Scraping"
   - Monitor real-time progress
   - View AI qualification results

### Lead Management

1. **View Leads**
   - Navigate to "Leads" tab
   - Use filters to find specific prospects
   - Sort by score, industry, or location

2. **Lead Actions**
   - View detailed lead information
   - Generate personalized outreach content
   - Update lead status and notes

3. **Bulk Operations**
   - Select multiple leads
   - Update status in bulk
   - Export selected leads to CSV

### Analytics & Reporting

1. **Dashboard Overview**
   - View key performance metrics
   - Monitor lead generation trends
   - Track conversion rates

2. **Advanced Analytics**
   - Industry performance analysis
   - Geographic distribution charts
   - Lead score distribution

3. **Export Reports**
   - Generate CSV exports
   - Custom date ranges
   - Filtered data exports

## 🎯 Target Criteria for AIssistVA

The system is optimized for businesses with:
- **Size**: 10-50 employees
- **Revenue**: $500K-$2M annual
- **Industries**: Professional services, healthcare, real estate, marketing agencies
- **Location**: Kansas City metro area (expandable)
- **Growth Signals**: Hiring, expansion, new services
- **Automation Opportunities**: Manual processes, outdated systems

## 🔧 Configuration

### Scraping Settings
```javascript
// backend/src/services/scrapingService.js
const scrapingConfig = {
  rateLimitDelay: 2000, // 2 seconds between requests
  maxConcurrent: 3,     // Maximum concurrent scrapes
  userAgent: 'Mozilla/5.0...', // Custom user agent
  timeout: 10000        // Request timeout
}
```

### AI Qualification
```javascript
// backend/src/services/aiService.js
const aiConfig = {
  model: 'gpt-4',
  temperature: 0.3,
  maxTokens: 1000,
  scoringCriteria: [
    'revenue_indicators',
    'employee_count',
    'manual_processes',
    'growth_signals'
  ]
}
```

## 📁 Project Structure

```
aissistva-lead-gen/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main dashboard
├── components/            # React components
│   ├── AnalyticsCharts.tsx
│   ├── DashboardMetrics.tsx
│   ├── Header.tsx
│   ├── LeadsTable.tsx
│   ├── ScrapingPanel.tsx
│   └── Sidebar.tsx
├── backend/              # Node.js backend
│   ├── src/
│   │   ├── database/     # Database initialization
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   └── utils/        # Utilities
│   └── package.json
├── data/                 # SQLite database
├── logs/                 # Application logs
├── exports/              # CSV exports
└── package.json
```

## 🔒 Security & Compliance

### Data Protection
- All data encrypted at rest
- Secure API endpoints with rate limiting
- JWT-based authentication
- Input validation and sanitization

### Ethical Scraping
- Respects robots.txt files
- Configurable rate limiting
- User-agent identification
- Opt-out mechanisms for businesses

### GDPR Compliance
- Data retention policies
- Right to be forgotten
- Transparent data usage
- Consent management

## 🚀 Deployment

### Production Setup
1. Set `NODE_ENV=production`
2. Configure production database
3. Set up SSL certificates
4. Configure reverse proxy (nginx)
5. Set up monitoring and logging

### Docker Deployment
```bash
# Build and run with Docker
docker-compose up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact: support@aissistva.com
- Documentation: [docs.aissistva.com](https://docs.aissistva.com)

## 🔮 Roadmap

### Phase 2 Features
- LinkedIn Sales Navigator integration
- Email automation and sequencing
- CRM integrations (Salesforce, HubSpot)
- Advanced contact discovery
- Predictive lead scoring

### Phase 3 Features
- Machine learning model training
- Advanced analytics and insights
- Multi-language support
- Mobile application
- API marketplace

---

**Built with ❤️ for AIssistVA**